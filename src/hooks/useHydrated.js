import { useState, useEffect } from "react";
import { useNutritionStore } from "../stores/nutritionStore";
import { useUserStore } from "../stores/userStore";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUiStore } from "../stores/uiStore";
import { useSettingsStore } from "../stores/settingsStore";

const stores = [useNutritionStore, useUserStore, useWorkoutStore, useUiStore, useSettingsStore];

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => stores.every(s => s.persist?.hasHydrated?.()));

  useEffect(() => {
    if (hydrated) return;
    const unsubs = stores.map(store =>
      store.persist?.onFinishHydration?.(() => {
        if (stores.every(s => s.persist?.hasHydrated?.())) {
          setHydrated(true);
        }
      })
    );
    return () => unsubs.forEach(u => u?.());
  }, [hydrated]);

  return hydrated;
}
