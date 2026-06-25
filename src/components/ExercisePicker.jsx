import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { BODY_GROUPS, MUSCLES_BY_GROUP, EQUIPMENT_OPTIONS, getFilteredExercises } from "../data/exerciseDatabase.js";
import useStore from "../store/useStore.js";
import Icon from "./Icon.jsx";

const ALL = "Todos";
const CHIPS = [ALL, ...BODY_GROUPS];

function ExerciseList({ items, favoriteExercises, toggleFavorite, onExerciseTap, handlePick, totalCount }) {
  if (items.length === 0) {
    return (
      <div className="notice" style={{ marginTop: 8 }}>
        <p>No se encontraron ejercicios con esos filtros.</p>
      </div>
    );
  }

  return (
    <div className="exercise-results-list">
      {items.map((ex) => {
        const isFav = favoriteExercises.includes(ex.name);
        return (
          <div key={ex.id || ex.name} className="exercise-row" style={{ display: "flex", alignItems: "center", cursor: "default" }}>
            <div
              className="exercise-row-info"
              style={{ flex: 1, cursor: "pointer", padding: "10px 0" }}
              onClick={() => onExerciseTap ? onExerciseTap(ex.name) : handlePick(ex)}
            >
              <b>{ex.name}</b>
              <small>{ex.group} · {ex.muscle} · {ex.equipment}</small>
            </div>
            {onExerciseTap && (
              <button
                onClick={() => handlePick(ex)}
                aria-label="Agregar ejercicio"
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "4px 6px", color: "var(--muted)", flexShrink: 0 }}
              >+</button>
            )}
            <button
              className="fav-btn"
              onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.name); }}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Icon name="Star" size={14} fill={isFav ? "var(--yellow)" : "none"} color={isFav ? "var(--yellow)" : "var(--muted)"} />
            </button>
          </div>
        );
      })}
      {totalCount > items.length && (
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", padding: "8px 0" }}>
          Mostrando {items.length} de {totalCount} — usá los filtros para acotar
        </p>
      )}
    </div>
  );
}

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

export default function ExercisePicker({ onPick, compact = false, query: queryProp, onQueryChange, onExerciseTap }) {
  const [queryInternal, setQueryInternal] = useState("");
  const isControlled = queryProp !== undefined;
  const query = isControlled ? queryProp : queryInternal;
  const setQuery = isControlled ? (onQueryChange || (() => {})) : setQueryInternal;
  const debouncedQuery = useDebounce(query, 300);
  const [group, setGroup] = useState(ALL);
  const [muscle, setMuscle] = useState(ALL);
  const [equipment, setEquipment] = useState(ALL);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const recentExercises = useStore((state) => state.recentExercises);
  const favoriteExercises = useStore((state) => state.favoriteExercises);
  const trackExercisePick = useStore((state) => state.trackExercisePick);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const getCatalog = useStore((state) => state.getCatalog);

  const allResults = useMemo(
    () => getFilteredExercises({ query: debouncedQuery, group, muscle, equipment }),
    [debouncedQuery, group, muscle, equipment]
  );

  const results = useMemo(
    () => showFavoritesOnly ? allResults.filter(e => favoriteExercises.includes(e.name)) : allResults,
    [allResults, showFavoritesOnly, favoriteExercises]
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

      <div style={{ display: "flex", gap: 6, paddingBottom: 6, overflowX: "auto" }}>
        <button
          onClick={() => setShowFavoritesOnly(prev => !prev)}
          style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0,
            border: showFavoritesOnly ? "2px solid #f59e0b" : "2px solid var(--line)",
            background: showFavoritesOnly ? "rgba(245,158,11,.12)" : "var(--panel2)",
            color: showFavoritesOnly ? "#f59e0b" : "var(--muted)"
          }}
        >
          ⭐ Favoritos {favoriteExercises.length > 0 && `(${favoriteExercises.length})`}
        </button>
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

      <ExerciseList
        items={displayed}
        favoriteExercises={favoriteExercises}
        toggleFavorite={toggleFavorite}
        onExerciseTap={onExerciseTap}
        handlePick={handlePick}
        totalCount={results.length}
      />
    </div>
  );
}
