import { useEffect, useRef, useState, useCallback } from "react";
import { useReminderStore } from "../stores/reminderStore";
import { useWorkoutStore } from "../stores/workoutStore";
import { useNutritionStore } from "../stores/nutritionStore";

const LABELS = {
  workout: { title: "Workout Time", body: "Time to crush your workout! Let's get those gains. 💪" },
  water: { title: "Hydration Reminder", body: "Don't forget to drink water. Stay hydrated! 💧" },
  meal: { title: "Meal Time", body: "Time to fuel your body with a nutritious meal. 🥗" },
  protein: { title: "Protein Target", body: "Remember to hit your protein goal for the day. 🥩" },
  sleep: { title: "Sleep Reminder", body: "Rest is essential for recovery. Time to wind down. 🌙" },
  weight: { title: "Weight Check", body: "Time to log your weight and track your progress. ⚖️" },
};

const ICON_MAP = {
  workout: "💪", water: "💧", meal: "🥗", protein: "🥩", sleep: "🌙", weight: "⚖️",
};

function todayMatches(reminder) {
  const today = new Date().getDay();
  if (reminder.repeat === "daily") return true;
  return reminder.repeatDays.includes(today);
}

function timeMatches(reminder) {
  const now = new Date();
  const [h, m] = reminder.time.split(":").map(Number);
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const targetMinutes = h * 60 + m;
  return Math.abs(totalMinutes - targetMinutes) <= 1;
}

function alreadyNotifiedToday(reminder) {
  if (!reminder.lastNotified) return false;
  const last = new Date(reminder.lastNotified);
  const now = new Date();
  return (
    last.getDate() === now.getDate() &&
    last.getMonth() === now.getMonth() &&
    last.getFullYear() === now.getFullYear()
  );
}

async function requestPermission(store) {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  if (store.getState().permissionRequested) return false;
  store.getState().setPermissionRequested();
  const result = await Notification.requestPermission();
  return result === "granted";
}

function fireBrowserNotification(key) {
  const info = LABELS[key];
  if (!info) return;
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(info.title, {
        body: info.body,
        icon: "/icons/icon.svg",
        badge: "/icons/icon.svg",
        tag: `fitforce-${key}`,
      });
    }
  } catch {
  }
}

function shouldAutoStop(key) {
  const today = new Date().toDateString();
  switch (key) {
    case "workout": {
      const sessions = useWorkoutStore.getState().workoutSessions;
      return sessions.some(ws => new Date(ws.completedAt).toDateString() === today);
    }
    case "water": {
      const water = useNutritionStore.getState().water;
      return water >= 8;
    }
    case "protein": {
      const meals = useNutritionStore.getState().meals;
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
      return totalProt >= protGoal;
    }
    default:
      return false;
  }
}

export function useReminderEngine() {
  const intervalRef = useRef(null);
  const [inApp, setInApp] = useState(null);

  const dismiss = useCallback(() => setInApp(null), []);

  useEffect(() => {
    const store = useReminderStore;
    let mounted = true;

    (async () => {
      const hasPermission = await requestPermission(store);
      if (!mounted) return;
      intervalRef.current = setInterval(() => {
        const { reminders } = store.getState();
        Object.entries(reminders).forEach(([key, reminder]) => {
          if (!reminder.enabled) return;
          if (!todayMatches(reminder)) return;
          if (!timeMatches(reminder)) return;
          if (alreadyNotifiedToday(reminder)) return;
          if (shouldAutoStop(key)) return;
          fireBrowserNotification(key);
          store.getState().logNotification(key);
          if (!hasPermission) {
            setInApp({
              id: key,
              key,
              title: LABELS[key]?.title || key,
              desc: LABELS[key]?.body || "",
              icon: ICON_MAP[key] || "🔔",
            });
          }
        });
      }, 30_000);
    })();

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { inApp, dismiss };
}
