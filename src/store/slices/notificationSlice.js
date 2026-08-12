function uid() {
  return `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const createNotificationSlice = (set, get) => ({
  notifications: [],

  addNotification: (notif) => {
    const n = { id: uid(), createdAt: new Date().toISOString(), read: false, ...notif };
    set(s => ({ notifications: [n, ...(s.notifications || [])].slice(0, 50) }));
  },

  markNotificationRead: (id) => {
    set(s => ({ notifications: (s.notifications || []).map(n => n.id === id ? { ...n, read: true } : n) }));
  },

  markAllRead: () => {
    set(s => ({ notifications: (s.notifications || []).map(n => ({ ...n, read: true })) }));
  },

  dismissNotification: (id) => {
    set(s => ({ notifications: (s.notifications || []).filter(n => n.id !== id) }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
});
