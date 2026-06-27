import { useState, useCallback, useRef } from "react";
import { useNutritionStore } from "../stores/nutritionStore";
import { useUserStore } from "../stores/userStore";

export default function useAddFood() {
  const [toast, setToast] = useState({ visible: false, message: "", sub: "" });
  const lastAddedRef = useRef(null);

  const addFoodToMeal = useCallback((meal) => {
    useNutritionStore.getState().addMeal(meal);
    useUserStore.getState().addXp(5);
    lastAddedRef.current = meal;
    setToast({
      visible: true,
      message: "✓ Successfully Added",
      sub: `${meal.name} added to ${meal.mealTime}`,
    });
  }, []);

  const undoAddFood = useCallback(() => {
    const meal = lastAddedRef.current;
    if (meal) {
      useNutritionStore.getState().deleteMeal(meal);
      lastAddedRef.current = null;
    }
    setToast({ visible: false, message: "", sub: "" });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ visible: false, message: "", sub: "" });
  }, []);

  return { addFoodToMeal, undoAddFood, toast, clearToast };
}
