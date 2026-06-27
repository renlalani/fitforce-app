import { create } from "zustand";
import { persist } from "zustand/middleware";

const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

let _mealUid = 3;
function nextMealUid() { return (++_mealUid).toString(36); }

const initialState = {
  meals: [
    { uid: "0", name: "Oats (100g)", mealTime: "Breakfast", qty: 1, cal: 389, protein: 17, carbs: 66, fat: 7, fiber: 10, sugar: 1 },
    { uid: "1", name: "Chicken Breast (100g)", mealTime: "Lunch", qty: 2, cal: 330, protein: 62, carbs: 0, fat: 7.2, fiber: 0, sugar: 0 },
    { uid: "2", name: "Whey Protein (1 scoop)", mealTime: "Post-Workout", qty: 1, cal: 120, protein: 25, carbs: 3, fat: 2, fiber: 0, sugar: 1 },
  ],
  water: 3,
  supplements: [
    { name: "Creatine", dose: "5g", time: "Post-Workout", done: false },
    { name: "Whey Protein", dose: "1 scoop", time: "Post-Workout", done: true },
    { name: "Vitamin D", dose: "2000 IU", time: "Morning", done: false },
  ],
  lastLogDate: today,
  nutritionStreak: 1,
  totalDaysLogged: 1,
};

export const useNutritionStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setMeals: (updater) =>
        set((state) => ({
          meals: typeof updater === "function" ? updater(state.meals) : updater,
        })),

      addMeal: (food) =>
        set((state) => {
          const today2 = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
          let streak = state.nutritionStreak;
          let totalDays = state.totalDaysLogged;
          if (state.lastLogDate !== today2) {
            const prev = new Date(state.lastLogDate);
            const curr = new Date(today2);
            const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              streak = state.nutritionStreak + 1;
            } else if (diff > 1) {
              streak = 1;
            }
            totalDays = state.totalDaysLogged + 1;
          }
          return {
            meals: [...state.meals, { ...food, uid: nextMealUid(), fiber: food.fiber || 0, sugar: food.sugar || 0 }],
            lastLogDate: today2,
            nutritionStreak: streak,
            totalDaysLogged: totalDays,
          };
        }),

      deleteMeal: (meal) =>
        set((state) => ({
          meals: state.meals.filter((m) => m.uid !== meal.uid),
        })),

      setWater: (updater) =>
        set((state) => ({
          water: typeof updater === "function" ? updater(state.water) : updater,
        })),

      setSupplements: (updater) =>
        set((state) => ({
          supplements:
            typeof updater === "function" ? updater(state.supplements) : updater,
        })),

      toggleSupplement: (index) =>
        set((state) => ({
          supplements: state.supplements.map((s, i) =>
            i === index ? { ...s, done: !s.done } : s
          ),
        })),
    }),
    {
      name: "fitforce-nutrition",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.meals = (state.meals || []).map((m, i) => ({
          ...m,
          cal: +m.cal || 0,
          protein: +m.protein || 0,
          carbs: +m.carbs || 0,
          fat: +m.fat || 0,
          fiber: +m.fiber || 0,
          sugar: +m.sugar || 0,
          uid: m.uid || i.toString(36),
        }));
      },
    }
  )
);
