import { create } from "zustand";

const welcomeMsg = {
  role: "ai",
  text: "Hey! I'm your AI coach — no login needed on any device. Ask me about workouts, nutrition, form, recovery, or supplements!",
  id: "welcome",
};

export const useAICoachStore = create((set) => ({
  msgs: [welcomeMsg],
  rateLimited: null,
  focusInput: 0,

  setMsgs: (msgsOrFn) =>
    set((state) => ({
      msgs:
        typeof msgsOrFn === "function" ? msgsOrFn(state.msgs) : msgsOrFn,
    })),

  addMsg: (msg) =>
    set((state) => ({
      msgs: [...state.msgs, msg],
    })),

  updateLastMsg: (updates) =>
    set((state) => {
      const msgs = [...state.msgs];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...updates };
      }
      return { msgs };
    }),

  setRateLimited: (rateLimited) => set({ rateLimited }),

  requestFocusInput: () =>
    set((state) => ({ focusInput: state.focusInput + 1 })),

  reset: () =>
    set({
      msgs: [welcomeMsg],
      rateLimited: null,
    }),
}));