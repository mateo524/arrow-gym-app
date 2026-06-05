import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BAR_WEIGHTS = [
  { label: "Barra olímpica 20kg", value: 20 },
  { label: "Barra mujer 15kg", value: 15 },
  { label: "Barra EZ 10kg", value: 10 },
];

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

function calcPlates(target, barWeight) {
  const perSide = (target - barWeight) / 2;
  if (perSide <= 0) return [];
  let remaining = perSide;
  const result = [];
  for (const plate of PLATES) {
    while (remaining >= plate - 0.01) {
      result.push(plate);
      remaining -= plate;
    }
  }
  return result;
}

export default function PlateCalculator({ target, onSelect, onClose }) {
  const [bar, setBar] = useState(20);
  const [customWeight, setCustomWeight] = useState(target || "");

  const weight = Number(customWeight) || target || 0;
  const plates = useMemo(() => calcPlates(weight, bar), [weight, bar]);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="plate-calc"
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="plate-calc-head">
          <b>Calculadora de discos</b>
          <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="plate-calc-body">
          <div className="plate-bar-select">
            {BAR_WEIGHTS.map((bw) => (
              <button
                key={bw.value}
                className={`chip ${bar === bw.value ? "chip-active" : ""}`}
                onClick={() => setBar(bw.value)}
              >
                {bw.label}
              </button>
            ))}
          </div>

          <label className="plate-weight-input">
            Peso total
            <input
              inputMode="decimal"
              value={customWeight}
              placeholder="ej: 60"
              onChange={(e) => setCustomWeight(e.target.value)}
            />
          </label>

          {weight > bar && (
            <div className="plate-result">
              <div className="plate-summary">
                Barra: {bar}kg + <b>{((weight - bar) / 2).toFixed(1)}kg</b> por lado
              </div>
              <div className="plate-list">
                {plates.map((p, i) => (
                  <span key={i} className="plate-chip">{p}kg</span>
                ))}
              </div>
              <div className="plate-total">Total: {plates.reduce((a, b) => a + b, 0) * 2 + bar}kg</div>
            </div>
          )}

          {weight <= bar && weight > 0 && (
            <div className="notice" style={{ marginTop: 10 }}>
              <p>El peso debe ser mayor que la barra ({bar}kg).</p>
            </div>
          )}

          {target && (
            <button className="primary" style={{ marginTop: 12 }} onClick={() => { onSelect(weight); onClose(); }}>
              Usar {weight}kg
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
