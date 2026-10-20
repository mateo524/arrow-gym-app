import { dropForeign } from "../../lib/offlineQueue.js";
import { getAuthUserId } from "../../lib/authBridge.js";
import { todayLocal } from "../../lib/dates.js";

// Refleja la vacación en el perfil para que el servidor no mande recordatorios (null = sin vacaciones).
function pushVacationUntil(date) {
  const userId = getAuthUserId();
  if (!userId) return;
  import("../../lib/supabase.js").then(({ supabase }) => {
    supabase.from("profiles").update({ vacation_until: date }).eq("id", userId).then(() => {}, () => {});
  });
}
// Debounce for syncing settings to Supabase via healthSlice.syncHealthToDB
let settingsSyncTimer = null;
function queueSettingsSync(get) {
  clearTimeout(settingsSyncTimer);
  settingsSyncTimer = setTimeout(() => { try { get().syncHealthToDB(); } catch {} }, 300);
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export const createSettingsSlice = (set, get) => ({
  currentPage: "home",
  selectedWorkoutId: null,
  coachBadge: false,
  soundEnabled: true,
  userGoal: "mantenimiento",
  fontScale: 1,
  autoDarkMode: false,
  reminderEnabled: false,
  reminderTime: "18:00",
  weekSummaryDismissed: null,
  healthFitToken: null,
  hasSeenOnboarding: false,
  lastUserId: null,
  lastSeenVersion: null,
  syncStatus: "idle",
  activityLevel: "moderado",
  exerciseRestTimes: {},
  exerciseOrderByRoutine: {},
  vacationPeriods: [],
  vacationWelcomeBack: null,
  weeklyGoal: 4,
  mutedHintTypes: [],
  customKcal: "",
  customFoods: [],

  setSyncStatus: (s) => set({ syncStatus: s }),

  setPage: (page) => {
    if (page === "coach") {
      set({ currentPage: page, coachBadge: false });
    } else {
      const state = get();
      set({ currentPage: page, coachBadge: (state.coachReports?.length || 0) > 0 });
    }
  },

  openWorkout: (id) => set({ selectedWorkoutId: id, currentPage: "workoutDetail" }),
  clearCoachBadge: () => set({ coachBadge: false }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setUserGoal: (goal) => { set({ userGoal: goal }); queueSettingsSync(get); },
  setCustomKcal: (val) => { set({ customKcal: val }); queueSettingsSync(get); },
  addCustomFood: (food) => set(s => ({
    customFoods: [food, ...(s.customFoods || []).filter(f => f.id !== food.id)].slice(0, 200)
  })),
  deleteCustomFood: (id) => set(s => ({
    customFoods: (s.customFoods || []).filter(f => f.id !== id)
  })),
  setActivityLevel: (level) => { set({ activityLevel: level }); queueSettingsSync(get); },
  setWeeklyGoal: (n) => { set({ weeklyGoal: Math.max(1, Math.min(7, Number(n))) }); queueSettingsSync(get); },
  toggleMutedHintType: (type) => set((s) => {
    const muted = s.mutedHintTypes || [];
    return { mutedHintTypes: muted.includes(type) ? muted.filter(t => t !== type) : [...muted, type] };
  }),
  markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
  markVersionSeen: (v) => set({ lastSeenVersion: v }),
  setLastUserId: (userId) => set({ lastUserId: userId }),
  setFontScale: (scale) => set({ fontScale: scale }),
  setAutoDarkMode: (val) => set({ autoDarkMode: val }),
  // Modo vacaciones: la racha se pausa y se silencian los avisos de "volvé a entrenar".
  // Períodos { start, end|null, until|null }; el último con end null está activo.
  startVacation: (untilDate = null) => {
    const start = todayLocal();
    set((s) => ({
      vacationPeriods: [
        ...(s.vacationPeriods || []).filter((p) => p.end),
        { start, end: null, until: untilDate || null },
      ].slice(-30),
    }));
    pushVacationUntil(untilDate || "2099-12-31");
    try { get().syncGymStateToDB(); } catch {}
  },
  endVacation: () => {
    const end = todayLocal();
    const active = (get().vacationPeriods || []).find((p) => !p.end);
    set((s) => ({
      vacationPeriods: (s.vacationPeriods || []).map((p) => (p.end ? p : { ...p, end })),
      vacationWelcomeBack: active ? { start: active.start, end } : null,
    }));
    pushVacationUntil(null);
    try { get().syncGymStateToDB(); } catch {}
  },
  setVacationUntil: (untilDate) => {
    set((s) => ({ vacationPeriods: (s.vacationPeriods || []).map((p) => (p.end ? p : { ...p, until: untilDate || null })) }));
    pushVacationUntil(untilDate || "2099-12-31");
    try { get().syncGymStateToDB(); } catch {}
  },
  dismissVacationWelcome: () => set({ vacationWelcomeBack: null }),
  // Cierra solo el período vencido (fecha de regreso pasada) sin mostrar bienvenida si ya pasó mucho
  autoEndExpiredVacation: () => {
    const t = todayLocal();
    const active = (get().vacationPeriods || []).find((p) => !p.end);
    if (active?.until && active.until < t) get().endVacation();
  },
  setExerciseRestTime: (exercise, seconds) => {
    set((s) => ({ exerciseRestTimes: { ...(s.exerciseRestTimes || {}), [exercise]: seconds } }));
    try { get().syncGymStateToDB(); } catch {}
  },

  resetUserData: (userId) => {
    // Account switch: offline-queue items owned by another user must not be uploaded under this session.
    try { dropForeign(userId); } catch {}
    set({
    lastUserId: userId,
    workouts: [],
    prs: [],
    achievements: [],
    achievementsSeen: [],
    newAchievements: [],
    activeWorkout: null,
    coachReports: [],
    cardioHistory: [],
    workoutDraft: null,
    recentExercises: [],
    mealLog: [],
    savedMealCombos: [],
    activePlanAdjustment: null,
    hasSeenOnboarding: false,
    activeChallenges: [],
    competitionDate: null,
    competitionName: "",
    savedTemplates: [],
    weeklyChallenge: null,
    weightLog: [],
    measurementsHistory: [],
    // healthSlice fields — must be cleared to prevent data leaking between users
    sleepLog: [],
    waterLog: [],
    waterGoal: 8,
    nutritionPlan: null,
    bodyMetrics: [],
    progressPhotos: [],
    restDays: [],
    pendingSyncs: [],
    syncStatus: "idle",
    customKcal: "",
    userGoal: "mantenimiento",
    customFoods: [],
    exerciseRestTimes: {},
    exerciseOrderByRoutine: {},
    vacationPeriods: [],
    vacationWelcomeBack: null,
    healthTombstones: {},
    nutritionPlanUpdatedAt: 0,
    competitionUpdatedAt: 0,
    });
  },
});
