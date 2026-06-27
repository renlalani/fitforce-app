import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  profile: {
    name: "Athlete",
    level: "Beginner",
    goal: "Muscle Gain",
    weight: "75",
    height: "175",
    age: "25",
    gender: "Male",
  },
  xp: 1240,
  streak: 7,
  bodyStats: [
    { date: "Apr 1", weight: 76 },
    { date: "Apr 5", weight: 75.5 },
    { date: "Apr 8", weight: 75.2 },
    { date: "Apr 10", weight: 75 },
    { date: "Apr 12", weight: 74.8 },
  ],
  measurements: {
    chest: "100",
    waist: "82",
    hips: "95",
    bicep: "35",
    thigh: "55",
  },
  prs: [
    { lift: "Bench Press", weight: 80 },
    { lift: "Squat", weight: 100 },
    { lift: "Deadlift", weight: 120 },
    { lift: "OHP", weight: 55 },
  ],
};

export const useUserStore = create(
  persist(
    (set) => ({
      ...initialState,

      setProfile: (field, value) =>
        set((state) => ({
          profile: { ...state.profile, [field]: value },
        })),

      setXp: (updater) =>
        set((state) => ({
          xp: typeof updater === "function" ? updater(state.xp) : updater,
        })),

      addXp: (amount) =>
        set((state) => ({ xp: state.xp + amount })),

      setBodyStats: (updater) =>
        set((state) => ({
          bodyStats:
            typeof updater === "function" ? updater(state.bodyStats) : updater,
        })),

      addBodyStat: (entry) =>
        set((state) => ({
          bodyStats: [...state.bodyStats, entry],
        })),

      setMeasurements: (updater) =>
        set((state) => ({
          measurements:
            typeof updater === "function" ? updater(state.measurements) : updater,
        })),

      setPrs: (updater) =>
        set((state) => ({
          prs: typeof updater === "function" ? updater(state.prs) : updater,
        })),

      updatePrWeight: (index, weight) =>
        set((state) => ({
          prs: state.prs.map((pr, i) =>
            i === index ? { ...pr, weight: +weight } : pr
          ),
        })),

      addPr: (lift) =>
        set((state) => ({
          prs: [...state.prs, { lift, weight: 60 }],
        })),
    }),
    {
      name: "fitforce-user",
      onRehydrateStorage: () => (state) => {
        if (!state || !state.profile) return;
        state.profile = {
          name: state.profile.name || "Athlete",
          level: state.profile.level || "Beginner",
          goal: state.profile.goal || "Muscle Gain",
          weight: state.profile.weight || "75",
          height: state.profile.height || "175",
          age: state.profile.age || "25",
          gender: state.profile.gender || "Male",
        };
        state.xp = Math.max(0, +state.xp || 0);
      },
    }
  )
);
