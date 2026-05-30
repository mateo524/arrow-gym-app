import { useMemo } from "react";

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getWeekKey(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function getConsecutiveDays(workouts) {
  if (!workouts || workouts.length === 0) return 0;
  const dates = [...new Set(workouts.map((w) => w.date))].sort().reverse();
  let streak = 1;
  const today = new Date().toISOString().slice(0, 10);
  if (dates[0] !== today && dates[0] !== yesterday()) return 0;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + "T12:00:00");
    const curr = new Date(dates[i] + "T12:00:00");
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

export function getLastWeekWorkouts(workouts) {
  const now = new Date();
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekKey = getWeekKey(lastWeekStart.toISOString().slice(0, 10));
  return workouts.filter((w) => getWeekKey(w.date) === lastWeekKey);
}

export function useStreak(workouts) {
  return useMemo(() => getConsecutiveDays(workouts), [workouts]);
}
