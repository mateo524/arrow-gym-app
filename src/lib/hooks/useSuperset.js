import { useState, useMemo, useCallback } from "react";

function getInsertionOrder(set) {
  const ts = set.id?.split("-")[1];
  return ts ? Number(ts) : 0;
}

function groupSetsByExercise(sets) {
  const map = new Map();
  (sets || []).forEach((set) => {
    const key = set.exercise;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(set);
  });
  return Array.from(map.entries()).map(([exercise, exerciseSets]) => ({ exercise, sets: exerciseSets }));
}

function mergeSupersetBlocks(groups, supersetGroups) {
  if (!supersetGroups.length) return groups;
  const used = new Set();
  const blocks = [];
  const groupMap = new Map(groups.map((g) => [g.exercise, g]));
  supersetGroups.forEach((sg) => {
    const members = sg.filter((name) => groupMap.has(name));
    if (members.length < 2) {
      members.forEach((m) => { if (!used.has(m)) { used.add(m); blocks.push(groupMap.get(m)); } });
      return;
    }
    const merged = members.flatMap((name) => {
      used.add(name);
      return (groupMap.get(name)?.sets || []).map((s) => ({ ...s, _supersetExercise: name }));
    });
    merged.sort((a, b) => getInsertionOrder(a) - getInsertionOrder(b));
    blocks.push({ exercise: members.join(" + "), sets: merged, supersetMembers: members, isSuperset: true });
  });
  groups.forEach((g) => { if (!used.has(g.exercise)) blocks.push(g); });
  return blocks;
}

export function useSuperset(activeSets) {
  const [supersetGroups, setSupersetGroups] = useState([]);
  const [linkTarget, setLinkTarget] = useState(null);

  const groupedExercises = useMemo(() => {
    const groups = groupSetsByExercise(activeSets || []);
    return mergeSupersetBlocks(groups, supersetGroups);
  }, [activeSets, supersetGroups]);

  const startLink = useCallback((exercise) => {
    if (linkTarget === exercise) { setLinkTarget(null); return; }
    if (!linkTarget) { setLinkTarget(exercise); return; }
    if (linkTarget === exercise) { setLinkTarget(null); return; }
    const exists = supersetGroups.find((sg) => sg.includes(linkTarget) && sg.includes(exercise));
    if (exists) { setLinkTarget(null); return; }
    setSupersetGroups((prev) => {
      const merged = [...prev];
      const idxA = merged.findIndex((sg) => sg.includes(linkTarget));
      const idxB = merged.findIndex((sg) => sg.includes(exercise));
      if (idxA >= 0 && idxB >= 0) {
        const combined = [...merged[idxA], ...merged[idxB]];
        merged.splice(Math.max(idxA, idxB), 1);
        merged.splice(Math.min(idxA, idxB), 1, combined);
      } else if (idxA >= 0) {
        merged[idxA] = [...merged[idxA], exercise];
      } else if (idxB >= 0) {
        merged[idxB] = [...merged[idxB], linkTarget];
      } else {
        merged.push([linkTarget, exercise]);
      }
      return merged;
    });
    setLinkTarget(null);
  }, [linkTarget, supersetGroups]);

  const unlinkAll = useCallback((exercise) => {
    setSupersetGroups((prev) => prev.filter((sg) => !sg.includes(exercise)));
  }, []);

  const isInSuperset = useCallback((exercise) => {
    return supersetGroups.some((sg) => sg.includes(exercise));
  }, [supersetGroups]);

  const getNextExerciseForSuperset = useCallback((members) => {
    if (!members || members.length === 0) return null;
    const counts = members.map((name) => ({
      name,
      count: (activeSets || []).filter((s) => s.exercise === name).length,
    }));
    counts.sort((a, b) => a.count - b.count);
    return counts[0].name;
  }, [activeSets]);

  return {
    groupedExercises,
    supersetGroups,
    linkTarget,
    setLinkTarget,
    startLink,
    unlinkAll,
    isInSuperset,
    getNextExerciseForSuperset,
  };
}
