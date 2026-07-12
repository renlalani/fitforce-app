import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  isAuthenticated: false,
  isGuest: false,
  user: null,
  authMethod: null,
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,

      login: (userData, method) =>
        set({
          isAuthenticated: true,
          isGuest: method === "guest",
          user: userData,
          authMethod: method,
        }),

      logout: () => set({ ...initialState }),

      upgradeGuest: (userData, method) =>
        set({
          isAuthenticated: true,
          isGuest: false,
          user: userData,
          authMethod: method,
        }),
    }),
    {
      name: "fitforce-auth",
      version: 2,
      migrate: (persisted, version) => {
        if (version === 0 || version === 1) {
          return {
            ...initialState,
            ...(typeof persisted === "object" && persisted !== null ? persisted : {}),
            isGuest: persisted?.authMethod === "guest" || false,
          };
        }
        return persisted;
      },
    }
  )
);
