import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { List } from "react-window";
import { BODY_GROUPS, MUSCLES_BY_GROUP, EQUIPMENT_OPTIONS, getFilteredExercises } from "../data/exerciseDatabase.js";
import useStore from "../store/useStore.js";
import Icon from "./Icon.jsx";

const ALL = "Todos";
const CHIPS = [ALL, ...BODY_GROUPS];

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState("");
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);
  return debounced;
}

export default function ExercisePicker({ onPick, compact = false }) {
  const queryState = useState("");
  const [query, setQuery] = queryState;
  const debouncedQuery = useDebounce(query, 300);
  const [group, setGroup] = useState(ALL);
  const [muscle, setMuscle] = useState(ALL);
  const [equipment, setEquipment] = useState(ALL);
  const listRef = useRef(null);

  const recentExercises = useStore((state) => state.recentExercises);
  const favoriteExercises = useStore((state) => state.favoriteExercises);
  const trackExercisePick = useStore((state) => state.trackExercisePick);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const getCatalog = useStore((state) => state.getCatalog);

  const results = useMemo(
    () => getFilteredExercises({ query: debouncedQuery, group, muscle, equipment }),
    [debouncedQuery, group, muscle, equipment]
  );

  const displayed = compact ? results.slice(0, 50) : results;

  const muscles = group === ALL ? Object.values(MUSCLES_BY_GROUP).flat() : MUSCLES_BY_GROUP[group] || [];

  const recentItems = useMemo(
    () => (debouncedQuery || group !== ALL || muscle !== ALL || equipment !== ALL ? [] : recentExercises.map((name) => getCatalog().find((e) => e.name === name)).filter(Boolean)),
    [recentExercises, debouncedQuery, group, muscle, equipment, getCatalog]
  );

  const handlePick = useCallback((exercise) => {
    trackExercisePick(exercise.name);
    onPick(exercise);
  }, [trackExercisePick, onPick]);

  const Row = useCallback(({ index, style }) => {
    const ex = displayed[index];
    if (!ex) return null;
    const isFav = favoriteExercises.includes(ex.name);
    return (
      <div style={style}>
        <button className="exercise-row" onClick={() => handlePick(ex)}>
          <div className="exercise-row-info">
            <b>{ex.name}</b>
            <small>{ex.group} · {ex.muscle} · {ex.equipment}</small>
          </div>
          <button
            className="fav-btn"
            onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.name); }}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Icon name="Star" size={14} fill={isFav ? "var(--yellow)" : "none"} color={isFav ? "var(--yellow)" : "var(--muted)"} />
          </button>
        </button>
      </div>
    );
  }, [displayed, favoriteExercises, handlePick, toggleFavorite]);

  return (
    <div className="picker">
      <div className="picker-search">
        <Icon name="Search" size={16} className="search-icon" />
        <input
          placeholder="Buscar en +1000 ejercicios"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises"
        />
      </div>

      <div className="chips-row" role="tablist" aria-label="Body group filter">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            role="tab"
            aria-selected={group === chip}
            className={`chip ${group === chip ? "chip-active" : ""}`}
            onClick={() => { setGroup(chip); setMuscle(ALL); }}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={muscle} onChange={(e) => setMuscle(e.target.value)} aria-label="Filter by muscle">
          <option value={ALL}>Músculo</option>
          {muscles.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={equipment} onChange={(e) => setEquipment(e.target.value)} aria-label="Filter by equipment">
          <option value={ALL}>Equipo</option>
          {EQUIPMENT_OPTIONS.map((eq) => <option key={eq}>{eq}</option>)}
        </select>
      </div>

      {recentItems.length > 0 && (
        <div className="recent-section">
          <small className="section-label">Recientes</small>
          <div className="recent-list">
            {recentItems.map((ex) => (
              <button key={ex.id} className="exercise-row compact" onClick={() => handlePick(ex)}>
                <b>{ex.name}</b>
                <small>{ex.group}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="exercise-results-virtual">
        {displayed.length === 0 ? (
          <div className="notice" style={{ marginTop: 8 }}>
            <p>No se encontraron ejercicios con esos filtros.</p>
          </div>
        ) : (
          <List
            ref={listRef}
            height={Math.min(displayed.length * 52, 400)}
            itemCount={displayed.length}
            itemSize={52}
            width="100%"
            overscanCount={5}
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
}
