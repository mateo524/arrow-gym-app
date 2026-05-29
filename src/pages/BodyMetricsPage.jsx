import { useState } from "react";
import useStore from "../store/useStore.js";
import { getBodyMetricTrendData } from "../lib/analytics.js";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const FIELDS = [
  { key: "bodyWeight", label: "Peso corporal (kg)", placeholder: "78.4" },
  { key: "waist", label: "Cintura (cm)", placeholder: "84" },
  { key: "chest", label: "Pecho (cm)", placeholder: "100" },
  { key: "rightArm", label: "Brazo derecho (cm)", placeholder: "35" },
  { key: "leftArm", label: "Brazo izquierdo (cm)", placeholder: "34.5" },
  { key: "rightLeg", label: "Pierna derecha (cm)", placeholder: "55" },
  { key: "leftLeg", label: "Pierna izquierda (cm)", placeholder: "54.5" },
  { key: "hips", label: "Cadera (cm)", placeholder: "96" },
  { key: "shoulders", label: "Hombros (cm)", placeholder: "112" },
  { key: "neck", label: "Cuello (cm) opcional", placeholder: "38", optional: true },
];

function TrendChart({ data, label, color }) {
  if (!data || data.length < 2) return null;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 280;
  const h = 80;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.value - min) / range) * (h - 12) - 6;
    return `${x},${y}`;
  });
  return (
    <div className="trend-chart">
      <small>{label}: {min.toFixed(1)} → {max.toFixed(1)}</small>
      <svg viewBox={`0 0 ${w} ${h}`} className="trend-svg">
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - ((d.value - min) / range) * (h - 12) - 6;
          return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
        })}
      </svg>
    </div>
  );
}

export default function BodyMetricsPage() {
  const bodyMetrics = useStore((state) => state.bodyMetrics);
  const addBodyMetric = useStore((state) => state.addBodyMetric);
  const updateBodyMetric = useStore((state) => state.updateBodyMetric);
  const deleteBodyMetric = useStore((state) => state.deleteBodyMetric);
  const setPage = useStore((state) => state.setPage);

  const [form, setForm] = useState({ date: today() });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const latest = [...bodyMetrics].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0];

  const weightData = getBodyMetricTrendData(bodyMetrics, "bodyWeight");
  const waistData = getBodyMetricTrendData(bodyMetrics, "waist");

  function handleSave() {
    const hasValue = FIELDS.some((f) => form[f.key] != null && form[f.key] !== "");
    if (!hasValue) return;
    const hasInvalid = FIELDS.some((f) => {
      if (form[f.key] == null || form[f.key] === "") return false;
      return isNaN(Number(String(form[f.key]).replace(",", ".")));
    });
    if (hasInvalid) {
      alert("Revisá los valores numéricos. Alguno no es un número válido.");
      return;
    }
    if (editingId) {
      updateBodyMetric(editingId, form);
      setEditingId(null);
    } else {
      addBodyMetric(form);
    }
    setForm({ date: today() });
    setShowForm(false);
  }

  function handleEdit(metric) {
    const f = { date: metric.date };
    FIELDS.forEach((field) => {
      if (metric[field.key] != null) f[field.key] = metric[field.key];
    });
    setForm(f);
    setEditingId(metric.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (window.confirm("¿Borrar esta medición?")) {
      deleteBodyMetric(id);
    }
  }

  return (
    <section className="page">
      <p className="eyebrow">Mediciones corporales</p>
      <h1>Mediciones</h1>

      {latest && (
        <div className="metric-summary">
          <p>
            <b>Última medición:</b>{" "}
            {[latest.bodyWeight ? `${latest.bodyWeight}kg` : "", latest.waist ? `cintura ${latest.waist}cm` : "", latest.date]
              .filter(Boolean).join(" · ")}
          </p>
        </div>
      )}

      {!showForm && (
        <button className="primary big" onClick={() => { setForm({ date: today() }); setEditingId(null); setShowForm(true); }}>
          {latest ? "+ Nueva medición" : "Cargar medición"}
        </button>
      )}

      {showForm && (
        <div className="card metric-form">
          <h2>{editingId ? "Editar medición" : "Cargar medición"}</h2>
          <label className="metric-date-label">
            Fecha
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="metric-date" />
          </label>
          <div className="metric-grid">
            {FIELDS.map((field) => (
              <label key={field.key} className="metric-field">
                <span>{field.label}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  value={form[field.key] ?? ""}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <label className="metric-field full">
            <span>Notas (opcional)</span>
            <textarea
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ej: mañana en ayunas, después de cardio..."
              rows={2}
            />
          </label>
          <div className="metric-actions">
            <button className="primary" onClick={handleSave}>{editingId ? "Actualizar" : "Guardar medición"}</button>
            <button className="ghost" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancelar</button>
          </div>
        </div>
      )}

      {weightData.length >= 2 && <TrendChart data={weightData} label="Evolución peso corporal" color="#6df2a4" />}
      {waistData.length >= 2 && <TrendChart data={waistData} label="Evolución cintura" color="#75d9ff" />}
      {getBodyMetricTrendData(bodyMetrics, "chest").length >= 2 && <TrendChart data={getBodyMetricTrendData(bodyMetrics, "chest")} label="Evolución pecho" color="#f59e0b" />}
      {getBodyMetricTrendData(bodyMetrics, "rightArm").length >= 2 && <TrendChart data={getBodyMetricTrendData(bodyMetrics, "rightArm")} label="Evolución brazo derecho" color="#a855f7" />}
      {getBodyMetricTrendData(bodyMetrics, "leftArm").length >= 2 && <TrendChart data={getBodyMetricTrendData(bodyMetrics, "leftArm")} label="Evolución brazo izquierdo" color="#ec4899" />}

      <h2 style={{ marginTop: 20 }}>Historial de mediciones</h2>
      <div className="metric-history">
        {bodyMetrics.length === 0 && <p className="muted">No hay mediciones cargadas.</p>}
        {bodyMetrics.map((metric) => {
          const parts = [
            metric.bodyWeight ? `${metric.bodyWeight}kg` : "",
            metric.waist ? `cintura ${metric.waist}cm` : "",
            metric.chest ? `pecho ${metric.chest}cm` : "",
            metric.rightArm && metric.leftArm ? `brazos ${metric.rightArm}/${metric.leftArm}cm` : "",
          ].filter(Boolean).join(" · ");
          return (
            <div className="metric-card" key={metric.id}>
              <div className="metric-card-head">
                <b>{metric.date}</b>
                <div className="metric-card-actions">
                  <button className="secondary small" onClick={() => handleEdit(metric)}>Editar</button>
                  <button className="danger small" onClick={() => handleDelete(metric.id)}>Borrar</button>
                </div>
              </div>
              <p>{parts || "Sin datos numéricos"}</p>
              {metric.notes && <small className="metric-notes">{metric.notes}</small>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
