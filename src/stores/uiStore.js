import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  tab: "dashboard",
  filterMuscle: "All",
  filterLevel: "All",
  showMealModal: false,
  showExDetail: null,
  showWorkoutGenerator: false,
  showMealPlanner: false,
  showFoodScanner: false,
  newBodyStat: "",
  orm1W: "100",
  orm1R: "5",
  bfNeck: "37",
  bfWaist: "82",
  searchQuery: "",
  filterEquipment: "All",
  filterType: "All",
  sortBy: "name",
  favorites: [],
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

      setShowWorkoutGenerator: (show) => set({ showWorkoutGenerator: show }),
      setShowMealPlanner: (show) => set({ showMealPlanner: show }),
      setShowFoodScanner: (show) => set({ showFoodScanner: show }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilterEquipment: (v) => set({ filterEquipment: v }),
      setFilterType: (v) => set({ filterType: v }),
      setSortBy: (v) => set({ sortBy: v }),
      toggleFavorite: (id) => set((state) => {
        const has = state.favorites.includes(id);
        return { favorites: has ? state.favorites.filter(f => f !== id) : [...state.favorites, id] };
      }),
      clearFavorites: () => set({ favorites: [] }),
    }),
    { name: "fitforce-ui", migrate: (persisted) => persisted }
  )
);
