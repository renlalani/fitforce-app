import { useEffect, useRef } from "react";
import { useReminderStore } from "../stores/reminderStore";

const LABELS = {
  workout: { title: "Workout Time", body: "Time to crush your workout! Let's get those gains. 💪" },
  water: { title: "Hydration Reminder", body: "Don't forget to drink water. Stay hydrated! 💧" },
  meal: { title: "Meal Time", body: "Time to fuel your body with a nutritious meal. 🥗" },
  sleep: { title: "Sleep Reminder", body: "Rest is essential for recovery. Time to wind down. 🌙" },
  weight: { title: "Weight Check", body: "Time to log your weight and track your progress. ⚖️" },
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

function fireNotification(key) {
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

export function useReminderEngine() {
  const intervalRef = useRef(null);

  useEffect(() => {
    const store = useReminderStore;
    requestPermission(store);

    intervalRef.current = setInterval(() => {
      const { reminders } = store.getState();
      Object.entries(reminders).forEach(([key, reminder]) => {
        if (!reminder.enabled) return;
        if (!todayMatches(reminder)) return;
        if (!timeMatches(reminder)) return;
        if (alreadyNotifiedToday(reminder)) return;
        fireNotification(key);
        store.getState().logNotification(key);
      });
    }, 30_000);

    return () => clearInterval(intervalRef.current);
  }, []);
}
