import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  tab: "dashboard",
  filterMuscle: "All",
  filterLevel: "All",
  showMealModal: false,
  showExDetail: null,
  newBodyStat: "",
  orm1W: "100",
  orm1R: "5",
  bfNeck: "37",
  bfWaist: "82",
};

export const useUiStore = create(
  persist(
    (set) => ({
      ...initialState,

      setTab: (tab) => set({ tab }),

      setFilterMuscle: (muscle) => set({ filterMuscle: muscle }),

      setFilterLevel: (level) => set({ filterLevel: level }),

      setShowMealModal: (show) => set({ showMealModal: show }),

      setShowExDetail: (ex) => set({ showExDetail: ex }),

      setNewBodyStat: (value) => set({ newBodyStat: value }),

      setOrm1W: (value) => set({ orm1W: value }),

      setOrm1R: (value) => set({ orm1R: value }),

      setBfNeck: (value) => set({ bfNeck: value }),

      setBfWaist: (value) => set({ bfWaist: value }),
    }),
    { name: "fitforce-ui" }
  )
);
