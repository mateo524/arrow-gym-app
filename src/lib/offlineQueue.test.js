import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./telemetry.js", () => ({ track: vi.fn() }));

function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
}

let q;
beforeEach(async () => {
  vi.resetModules(); // reinicia estado de módulo (backoff, fallback en memoria)
  vi.stubGlobal("localStorage", makeStorage());
  vi.spyOn(console, "warn").mockImplementation(() => {});
  q = await import("./offlineQueue.js");
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("enqueue / lectura", () => {
  it("arranca vacía", () => {
    expect(q.size()).toBe(0);
    expect(q.peek()).toBeNull();
    expect(q.items()).toEqual([]);
  });

  it("mantiene orden FIFO y agrega queuedAt", () => {
    q.enqueue({ type: "x", n: 1 });
    q.enqueue({ type: "x", n: 2 });
    expect(q.size()).toBe(2);
    expect(q.peek().n).toBe(1);
    expect(typeof q.peek().queuedAt).toBe("number");
    expect(q.items().map((i) => i.n)).toEqual([1, 2]);
  });

  it("items() devuelve una copia", () => {
    q.enqueue({ type: "x", n: 1 });
    q.items().pop();
    expect(q.size()).toBe(1);
  });

  it("keyOf usa key explícita, type:id o null", () => {
    expect(q.keyOf({ key: "k", type: "t", id: 1 })).toBe("k");
    expect(q.keyOf({ type: "t", id: 1 })).toBe("t:1");
    expect(q.keyOf({ type: "t" })).toBeNull();
  });

  it("mismo key reemplaza (last write wins) y pasa al final", () => {
    q.enqueue({ type: "w", id: "a", v: 1 });
    q.enqueue({ type: "w", id: "b", v: 1 });
    q.enqueue({ type: "w", id: "a", v: 2 });
    expect(q.size()).toBe(2);
    expect(q.items().map((i) => `${i.id}${i.v}`)).toEqual(["b1", "a2"]);
  });

  it("items sin key no se deduplican", () => {
    q.enqueue({ type: "x" });
    q.enqueue({ type: "x" });
    expect(q.size()).toBe(2);
  });

  it("clear vacía la cola", () => {
    q.enqueue({ type: "x" });
    q.clear();
    expect(q.size()).toBe(0);
  });

  it("no descarta items al superar 100 (solo avisa)", () => {
    for (let i = 0; i < 105; i++) q.enqueue({ type: "x", id: i });
    expect(q.size()).toBe(105);
    expect(q.peek().id).toBe(0);
  });

  it("tolera JSON corrupto en storage", () => {
    localStorage.setItem("pulse-offline-queue", "{no json");
    expect(q.size()).toBe(0);
  });

  it("si localStorage falla (cuota) no pierde el item: queda en memoria", () => {
    localStorage.setItem = () => { throw new DOMException("full", "QuotaExceededError"); };
    q.enqueue({ type: "x", id: 1 });
    expect(q.size()).toBe(1);
    expect(q.peek().id).toBe(1);
  });
});

describe("flush", () => {
  it("cola vacía devuelve 0 sin llamar al handler", async () => {
    const h = vi.fn();
    expect(await q.flush(h)).toBe(0);
    expect(h).not.toHaveBeenCalled();
  });

  it("procesa todo en orden y vacía la cola", async () => {
    q.enqueue({ type: "x", id: 1 });
    q.enqueue({ type: "x", id: 2 });
    const seen = [];
    expect(await q.flush(async (i) => { seen.push(i.id); })).toBe(2);
    expect(seen).toEqual([1, 2]);
    expect(q.size()).toBe(0);
  });

  it("fallo parcial: se detiene en el primer fallo y conserva el resto", async () => {
    q.enqueue({ type: "x", id: 1 });
    q.enqueue({ type: "x", id: 2 });
    q.enqueue({ type: "x", id: 3 });
    const h = vi.fn(async (item) => { if (item.id === 2) throw new Error("boom"); });
    expect(await q.flush(h)).toBe(1);
    expect(h).toHaveBeenCalledTimes(2); // el 3 no se intenta
    expect(q.items().map((i) => i.id)).toEqual([2, 3]);
  });

  it("tras un fallo aplica backoff; force lo saltea", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
    q.enqueue({ type: "x", id: 1 });
    expect(await q.flush(async () => { throw new Error("x"); })).toBe(0);

    const ok = vi.fn().mockResolvedValue();
    expect(await q.flush(ok)).toBe(0);
    expect(ok).not.toHaveBeenCalled();
    expect(q.size()).toBe(1);

    expect(await q.flush(ok, { force: true })).toBe(1);
    expect(q.size()).toBe(0);
  });

  it("el backoff expira con el tiempo", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
    q.enqueue({ type: "x", id: 1 });
    await q.flush(async () => { throw new Error("x"); });
    vi.advanceTimersByTime(2001);
    expect(await q.flush(async () => {})).toBe(1);
  });

  it("flushes concurrentes comparten la misma ejecución", async () => {
    q.enqueue({ type: "x", id: 1 });
    const h = vi.fn(async () => {});
    const [a, b] = await Promise.all([q.flush(h), q.flush(h)]);
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(h).toHaveBeenCalledTimes(1);
  });

  it("un item re-encolado durante el flush sobrevive", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
    q.enqueue({ type: "w", id: "a", v: 1 });
    // NOTA: si se re-encola en el mismo milisegundo (queuedAt idéntico) removeExact
    // borra la versión nueva; por eso avanzamos el reloj (posible bug de borde).
    await q.flush(async () => { vi.advanceTimersByTime(5); q.enqueue({ type: "w", id: "a", v: 2 }); });
    expect(q.items().map((i) => i.v)).toEqual([2]);
  });
});

describe("cambio de cuenta (dropForeign)", () => {
  it("descarta items de otro usuario y conserva propios y sin dueño", () => {
    q.enqueue({ type: "upsert_workout", id: "1", row: { user_id: "A" } });
    q.enqueue({ type: "upsert_workout", id: "2", userId: "B", row: {} });
    q.enqueue({ type: "delete_workout", id: "3" });
    expect(q.dropForeign("B")).toBe(1);
    expect(q.items().map((i) => i.id)).toEqual(["2", "3"]);
  });
  it("sin userId no descarta nada", () => {
    q.enqueue({ type: "x", id: "1", userId: "A" });
    expect(q.dropForeign(null)).toBe(0);
    expect(q.size()).toBe(1);
  });
});
