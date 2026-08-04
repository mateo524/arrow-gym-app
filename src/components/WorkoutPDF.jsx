import ExerciseIllustration from './ExerciseIllustration';

export default function WorkoutPDF({ workout, onClose }) {
  // Build unique exercise list preserving order, gathering meta from first set
  const exercises = [];
  const seen = new Set();
  for (const s of (workout?.sets || [])) {
    if (!seen.has(s.exercise)) {
      seen.add(s.exercise);
      exercises.push({
        name: s.exercise,
        group: s.group || '',
        muscle: s.muscle || '',
        equipment: s.equipment || '',
        pattern: s.pattern || '',
      });
    }
  }

  function handlePrint() {
    window.print();
  }

  const today = workout.finishedAt ? new Date(workout.finishedAt).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR');

  return (
    <div>
      {/* Toolbar — hidden on print */}
      <div className="no-print" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', background: 'var(--surface, var(--panel))',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}>
        <button
          className="ghost"
          onClick={onClose}
          style={{ fontSize: 14, padding: '6px 12px', borderRadius: 10, cursor: 'pointer', background: 'var(--panel2)', border: 'none', color: 'var(--text)' }}>
          ✕ Cerrar
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{workout?.name || workout?.type || 'Rutina'}</span>
        <button
          onClick={handlePrint}
          style={{ fontSize: 13, padding: '7px 16px', borderRadius: 10, cursor: 'pointer', background: 'rgba(168,85,247,.15)', border: '1px solid rgba(168,85,247,.4)', color: 'var(--green, #a855f7)', fontWeight: 700 }}>
          Descargar PDF
        </button>
      </div>

      {/* Printable content */}
      <div id="workout-pdf-content" style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>
            {workout?.name || workout?.type || 'Rutina'}
          </h1>
          <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
            {today} &nbsp;·&nbsp; {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}>
          {exercises.map((ex, i) => {
            const exerciseSets = (workout?.sets || []).filter(s => s.exercise === ex.name);
            return (
              <div key={i} style={{
                border: '1px solid #ddd',
                borderRadius: 12,
                padding: 14,
                breakInside: 'avoid',
                pageBreakInside: 'avoid',
                background: '#fff',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Illustration */}
                  <div style={{ flexShrink: 0 }}>
                    <ExerciseIllustration
                      name={ex.name}
                      pattern={ex.pattern}
                      muscle={ex.group}
                      equipment={ex.equipment}
                      size={72}
                      animated={false}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: '#111', marginBottom: 2 }}>
                      {ex.name}
                    </div>
                    {ex.group && (
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                        {ex.group}{ex.muscle ? ` · ${ex.muscle}` : ''}
                      </div>
                    )}
                    {/* Series */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {exerciseSets.map((s, j) => (
                        <span key={j} style={{
                          fontSize: 11,
                          background: '#f3f0ff',
                          color: '#6d28d9',
                          borderRadius: 5,
                          padding: '2px 7px',
                          fontWeight: 600,
                        }}>
                          S{j + 1}: {s.reps || '?'} × {s.weight ? `${s.weight}kg` : '?'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 28, fontSize: 11, color: '#aaa', textAlign: 'center' }}>
          Loop
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; margin: 0; }
          #workout-pdf-content { padding: 16px !important; max-width: 100% !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
}
