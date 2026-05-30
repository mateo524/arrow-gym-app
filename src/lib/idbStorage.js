import { get, set, del } from "idb-keyval";

export function createIdbStorage(migrateFromLocalStorage = true) {
  return {
    getItem: async (name) => {
      const val = await get(name);
      if (val !== undefined) return val;
      if (migrateFromLocalStorage) {
        const ls = localStorage.getItem(name);
        if (ls) {
          try {
            await set(name, ls);
          } catch (e) {
            console.warn("Arrow Gym: IDB migrate from localStorage failed", e);
          }
          return ls;
        }
      }
      return null;
    },
    setItem: async (name, value) => {
      await set(name, value);
    },
    removeItem: async (name) => {
      await del(name);
    },
  };
}
