import { useState, useEffect, useCallback, useRef } from "react";
import { useWorkoutStore } from "../stores/workoutStore";
import { useNutritionStore } from "../stores/nutritionStore";
import { useUserStore } from "../stores/userStore";

const STORAGE_KEY = "fitforce-notifications";

function loadDismissed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveDismissed(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function useNotifications() {
  const [notification, setNotification] = useState(null);
  const dismissedRef = useRef(loadDismissed());

  const workoutSessions = useWorkoutStore(s => s.workoutSessions);
  const meals = useNutritionStore(s => s.meals);
  const water = useNutritionStore(s => s.water);
  const streak = useUserStore(s => s.streak);

  const dismiss = useCallback((id) => {
    setNotification(null);
    dismissedRef.current = [...dismissedRef.current, id];
    saveDismissed(dismissedRef.current);
  }, []);

  const check = useCallback(() => {
    const today = new Date().toDateString();
    const now = new Date();
    const hour = now.getHours();

    if (dismissedRef.current.includes("workout-reminder")) return;

    const workedOutToday = workoutSessions.some(ws =>
      new Date(ws.completedAt).toDateString() === today
    );

    if (!workedOutToday && hour >= 16 && hour < 20) {
      setNotification({
        id: "workout-reminder",
        title: "Time for a workout!",
        desc: "You haven't logged a workout today. Even 20 minutes counts!",
        icon: "💪",
        color: "#ff4757",
        action: { label: "Let's go!", tab: "workouts" },
      });
      return;
    }

    if (dismissedRef.current.includes("water-reminder")) return;
    if (water < 4 && hour >= 12 && hour < 18) {
      setNotification({
        id: "water-reminder",
        title: "Hydrate!",
        desc: `You've only had ${water}/8 glasses today. Drink up!`,
        icon: "💧",
        color: "#2ed573",
        action: { label: "Log water", tab: "nutrition" },
      });
      return;
    }

    if (dismissedRef.current.includes("protein-reminder")) return;
    const totalProt = meals.reduce((s, m) => s + (+m.protein || 0), 0);
    let protGoal = 150;
    try {
      const stored = JSON.parse(localStorage.getItem("fitforce-user") || "null");
      if (stored?.state?.bodyStats?.length > 0) {
        const entries = stored.state.bodyStats;
        protGoal = Math.round(+entries[entries.length - 1].weight * 2);
      } else if (stored?.state?.profile?.weight) {
        protGoal = Math.round(+stored.state.profile.weight * 2);
      }
    } catch {}
    if (totalProt < protGoal * 0.5 && hour >= 18) {
      setNotification({
        id: "protein-reminder",
        title: "Protein target behind",
        desc: `You've had ${totalProt}g of ${protGoal}g protein. Try a protein-rich snack!`,
        icon: "🥩",
        color: "#3742fa",
        action: { label: "Log meal", tab: "nutrition" },
      });
      return;
    }

    if (dismissedRef.current.includes("streak-reminder")) return;
    if (streak > 0 && streak % 3 === 0 && hour < 12) {
      setNotification({
        id: "streak-reminder",
        title: `${streak}-day streak!`,
        desc: "You're building a powerful habit. Keep it going today!",
        icon: "🔥",
        color: "#ffa502",
        action: null,
      });
      return;
    }
  }, [workoutSessions, meals, water, streak]);

  useEffect(() => {
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [check]);

  const checkNow = useCallback(() => {
    setNotification(null);
    check();
  }, [check]);

  return { notification, dismiss, checkNow };
}
