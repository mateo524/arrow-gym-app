import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase.js", () => ({ supabase: { from: vi.fn() } }));

import { mergeWorkouts } from "./workoutSync.js";

describe("mergeWorkouts", () => {
  it("devuelve vacío sin datos", () => {
    expect(mergeWorkouts([], [])).toEqual([]);
  });

  it("une local y remoto sin duplicar por id", () => {
    const r = mergeWorkouts(
      [{ id: "a", date: "2026-01-01" }],
      [{ id: "a", date: "2026-01-01" }, { id: "b", date: "2026-01-02" }]
    );
    expect(r.map((w) => w.id)).toEqual(["b", "a"]);
  });

  it("ordena por fecha descendente", () => {
    const r = mergeWorkouts(
      [{ id: "1", date: "2026-01-01" }, { id: "3", date: "2026-03-01" }],
      [{ id: "2", date: "2026-02-01" }]
    );
    expect(r.map((w) => w.id)).toEqual(["3", "2", "1"]);
  });

  it("gana el remoto si es más reciente (updated_at)", () => {
    const local = { id: "a", date: "2026-01-01", updated_at: "2026-01-01T10:00:00Z", notes: "local" };
    const remote = { id: "a", date: "2026-01-01", updated_at: "2026-01-02T10:00:00Z", notes: "remoto" };
    expect(mergeWorkouts([local], [remote])[0].notes).toBe("remoto");
  });

  it("gana el local si es más reciente o igual", () => {
    const local = { id: "a", date: "2026-01-01", updated_at: "2026-01-03T10:00:00Z", notes: "local" };
    const remote = { id: "a", date: "2026-01-01", updated_at: "2026-01-02T10:00:00Z", notes: "remoto" };
    expect(mergeWorkouts([local], [remote])[0].notes).toBe("local");
    const same = { ...remote, updated_at: local.updated_at };
    expect(mergeWorkouts([local], [same])[0].notes).toBe("local");
  });

  it("usa created_at cuando falta updated_at", () => {
    const local = { id: "a", date: "2026-01-01", created_at: "2026-01-01T00:00:00Z", notes: "l" };
    const remote = { id: "a", date: "2026-01-01", created_at: "2026-02-01T00:00:00Z", notes: "r" };
    expect(mergeWorkouts([local], [remote])[0].notes).toBe("r");
  });

  it("tolera fechas faltantes sin lanzar", () => {
    const r = mergeWorkouts([{ id: "a" }], [{ id: "b", date: "2026-01-01" }]);
    expect(r.map((w) => w.id)).toEqual(["b", "a"]);
  });

  it("no muta los arrays de entrada", () => {
    const local = [{ id: "a", date: "2026-01-01" }];
    const remote = [{ id: "b", date: "2026-02-01" }];
    mergeWorkouts(local, remote);
    expect(local).toHaveLength(1);
    expect(remote).toHaveLength(1);
  });
});
