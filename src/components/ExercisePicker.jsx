import { useMemo, useState } from "react";
import { BODY_GROUPS, MUSCLES_BY_GROUP, EQUIPMENT_OPTIONS, getFilteredExercises } from "../data/exerciseDatabase.js";

export default function ExercisePicker({ onPick, compact = false }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Todos");
  const [muscle, setMuscle] = useState("Todos");
  const [equipment, setEquipment] = useState("Todos");
  const results = useMemo(() => getFilteredExercises({ query, group, muscle, equipment }).slice(0, compact ? 30 : 80), [query, group, muscle, equipment, compact]);
  const muscles = group === "Todos" ? Object.values(MUSCLES_BY_GROUP).flat() : MUSCLES_BY_GROUP[group] || [];
  return (
    <div className="picker">
      <div className="filters"><input autoFocus placeholder="Buscar en +1000 ejercicios" value={query} onChange={(e)=>setQuery(e.target.value)}/><select value={group} onChange={(e)=>{setGroup(e.target.value);setMuscle("Todos");}}><option>Todos</option>{BODY_GROUPS.map((g)=><option key={g}>{g}</option>)}</select><select value={muscle} onChange={(e)=>setMuscle(e.target.value)}><option>Todos</option>{muscles.map((m)=><option key={m}>{m}</option>)}</select><select value={equipment} onChange={(e)=>setEquipment(e.target.value)}><option>Todos</option>{EQUIPMENT_OPTIONS.map((eq)=><option key={eq}>{eq}</option>)}</select></div>
      <div className="exercise-results">{results.length === 0 ? <p className="muted" style={{ padding: 12, textAlign: "center" }}>Sin resultados. Probá con otro término.</p> : results.map((exercise)=><button key={exercise.id} onClick={()=>onPick(exercise)}><b>{exercise.name}</b><small>{exercise.group} · {exercise.muscle} · {exercise.equipment}</small></button>)}</div>
    </div>
  );
}
