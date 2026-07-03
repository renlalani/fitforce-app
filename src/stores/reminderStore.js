import { create } from "zustand";
import { persist } from "zustand/middleware";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultReminder = {
  enabled: false,
  time: "08:00",
  repeat: "daily",
  repeatDays: [1, 2, 3, 4, 5, 6],
  lastNotified: null,
  history: [],
};

const initialState = {
  reminders: {
    workout: { ...defaultReminder, time: "08:00", repeatDays: [1, 2, 3, 4, 5, 6] },
    water: { ...defaultReminder, time: "10:00", repeatDays: [0, 1, 2, 3, 4, 5, 6] },
    meal: { ...defaultReminder, time: "12:00", repeatDays: [0, 1, 2, 3, 4, 5, 6] },
    sleep: { ...defaultReminder, time: "22:00", repeatDays: [0, 1, 2, 3, 4, 5, 6] },
    weight: { ...defaultReminder, time: "09:00", repeatDays: [1] },
  },
  permissionRequested: false,
};

export const useReminderStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setReminder: (key, updates) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [key]: { ...state.reminders[key], ...updates },
          },
        })),

      toggleReminder: (key) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [key]: { ...state.reminders[key], enabled: !state.reminders[key].enabled },
          },
        })),

      setReminderTime: (key, time) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [key]: { ...state.reminders[key], time },
          },
        })),

      setReminderRepeat: (key, repeat) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [key]: { ...state.reminders[key], repeat },
          },
        })),

      setReminderDays: (key, repeatDays) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [key]: { ...state.reminders[key], repeatDays },
          },
        })),

      toggleReminderDay: (key, day) =>
        set((state) => {
          const current = state.reminders[key].repeatDays;
          const next = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day].sort();
          return {
            reminders: {
              ...state.reminders,
              [key]: { ...state.reminders[key], repeatDays: next },
            },
          };
        }),

      logNotification: (key) => {
        const now = new Date();
        const entry = {
          time: now.toISOString(),
          label: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: now.toLocaleDateString(),
        };
        set((state) => {
          const reminder = state.reminders[key];
          const history = [entry, ...reminder.history].slice(0, 50);
          return {
            reminders: {
              ...state.reminders,
              [key]: {
                ...reminder,
                lastNotified: now.toISOString(),
                history,
              },
            },
          };
        });
      },

      clearHistory: (key) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [key]: { ...state.reminders[key], history: [] },
          },
        })),

      setPermissionRequested: () => set({ permissionRequested: true }),

      resetReminders: () => set({ ...initialState }),
    }),
    { name: "fitforce-reminders" }
  )
);

export { DAYS };
