import { useSyncExternalStore, useCallback } from "react";
import { useNutritionStore } from "../stores/nutritionStore";
import { useUserStore } from "../stores/userStore";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUiStore } from "../stores/uiStore";

function subscribeToHydration(store, cb) {
  const unsub = store.persist.onFinishHydration(() => cb());
  return () => { unsub?.(); };
}

function checkHydrated(store) {
  return store.persist?.hasHydrated?.() ?? true;
}

export function useHydrated() {
  const nut = useSyncExternalStore(
    useCallback((cb) => subscribeToHydration(useNutritionStore, cb), []),
    useCallback(() => checkHydrated(useNutritionStore), [])
  );
  const user = useSyncExternalStore(
    useCallback((cb) => subscribeToHydration(useUserStore, cb), []),
    useCallback(() => checkHydrated(useUserStore), [])
  );
  const workout = useSyncExternalStore(
    useCallback((cb) => subscribeToHydration(useWorkoutStore, cb), []),
    useCallback(() => checkHydrated(useWorkoutStore), [])
  );
  const ui = useSyncExternalStore(
    useCallback((cb) => subscribeToHydration(useUiStore, cb), []),
    useCallback(() => checkHydrated(useUiStore), [])
  );
  return nut && user && workout && ui;
}
