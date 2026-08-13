// Debounce for syncing settings to Supabase via healthSlice.syncHealthToDB
let settingsSyncTimer = null;
function queueSettingsSync(get) {
  clearTimeout(settingsSyncTimer);
  settingsSyncTimer = setTimeout(() => { try { get().syncHealthToDB(); } catch {} }, 300);
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
  setExerciseRestTime: (exercise, seconds) => {
    set((s) => ({ exerciseRestTimes: { ...(s.exerciseRestTimes || {}), [exercise]: seconds } }));
    try { get().syncGymStateToDB(); } catch {}
  },

  resetUserData: (userId) => set({
    lastUserId: userId,
    workouts: [],
    prs: [],
    achievements: [],
    achievementsSeen: [],
    newAchievements: [],
    activeWorkout: null,
    coachReports: [],
    cardioHistory: [],
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
  }),
});
