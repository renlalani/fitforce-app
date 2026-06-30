import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_VERSION = 1;

const initialState = {
  theme: "dark",
  units: "kg",
  notifications: {
    workout: true,
    meal: true,
    water: true,
    protein: true,
    rest: true,
    streak: true,
  },
  ai: {
    autoSuggest: true,
    detailedResponses: true,
  },
  privacy: {
    analytics: false,
    anonymousData: false,
  },
};

export const useSettingsStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => set({ theme }),
      setUnits: (units) => set({ units }),
      setNotification: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
      setAi: (key, value) =>
        set((state) => ({
          ai: { ...state.ai, [key]: value },
        })),
      setPrivacy: (key, value) =>
        set((state) => ({
          privacy: { ...state.privacy, [key]: value },
        })),

      resetAll: () => {
        if (typeof localStorage !== "undefined") {
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith("fitforce-")) localStorage.removeItem(k);
          });
        }
        set({ ...initialState });
      },
    }),
    {
      name: "fitforce-settings",
      version: STORAGE_VERSION,
      migrate: (persisted, version) => {
        if (version < STORAGE_VERSION) {
          return { ...initialState, ...persisted };
        }
        return persisted;
      },
    }
  )
);
