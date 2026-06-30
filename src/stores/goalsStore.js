import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  goals: [
    { id: "1", title: "Build Muscle", target: "Gain 3kg lean mass", progress: 40, createdAt: new Date().toISOString(), category: "body", active: true },
    { id: "2", title: "Improve Consistency", target: "4 workouts per week", progress: 60, createdAt: new Date().toISOString(), category: "consistency", active: true },
    { id: "3", title: "Strength Gains", target: "Increase bench by 15kg", progress: 25, createdAt: new Date().toISOString(), category: "strength", active: true },
  ],
};

export const useGoalsStore = create(
  persist(
    (set) => ({
      ...initialState,

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              id: Date.now().toString(36),
              createdAt: new Date().toISOString(),
              progress: 0,
              active: true,
              ...goal,
            },
          ],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      toggleGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, active: !g.active } : g
          ),
        })),
    }),
    { name: "fitforce-goals", migrate: (persisted) => persisted }
  )
);
