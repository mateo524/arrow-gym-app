export const createSettingsSlice = (set, get) => ({
  currentPage: "home",
  selectedWorkoutId: null,
  coachBadge: false,
  amoled: false,
  soundEnabled: true,
  userGoal: "mantenimiento",
  fontScale: 1,
  autoDarkMode: false,
  voiceCoach: false,
  reminderEnabled: false,
  reminderTime: "18:00",
  weekSummaryDismissed: null,
  healthFitToken: null,
  hasSeenOnboarding: false,
  lastUserId: null,
  lastSeenVersion: null,
  activityLevel: "moderado",
  exerciseRestTimes: {},
  weeklyGoal: 4,

  setPage: (page) => {
    const state = get();
    if (page === "coach") {
      set({ currentPage: page, coachBadge: false });
    } else {
      const hasReports = (state.coachReports?.length || 0) > 0;
      set({ currentPage: page, coachBadge: hasReports });
    }
  },

  openWorkout: (id) => set({ selectedWorkoutId: id, currentPage: "workoutDetail" }),
  clearCoachBadge: () => set({ coachBadge: false }),
  toggleAmoled: () => set((s) => ({ amoled: !s.amoled })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleVoiceCoach: () => set((s) => ({ voiceCoach: !s.voiceCoach })),
  setUserGoal: (goal) => set({ userGoal: goal }),
  setActivityLevel: (level) => set({ activityLevel: level }),
  setWeeklyGoal: (n) => set({ weeklyGoal: Math.max(1, Math.min(7, Number(n))) }),
  markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
  markVersionSeen: (v) => set({ lastSeenVersion: v }),
  setLastUserId: (userId) => set({ lastUserId: userId }),
  setFontScale: (scale) => set({ fontScale: scale }),
  setAutoDarkMode: (val) => set({ autoDarkMode: val }),
  setExerciseRestTime: (exercise, seconds) => set((s) => ({
    exerciseRestTimes: { ...(s.exerciseRestTimes || {}), [exercise]: seconds },
  })),

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
    workoutDraft: null,
    recentExercises: [],
    mealLog: [],
    savedMealCombos: [],
    activePlanAdjustment: null,
    hasSeenOnboarding: false,
    activeChallenges: [],
    competitionDate: null,
    competitionName: "",
  }),
});
