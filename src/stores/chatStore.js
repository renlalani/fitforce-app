import { create } from "zustand";

const initialState = {
  msgs: [
    {
      role: "ai",
      text: "Hey! I'm your AI coach — no login needed on any device. Ask me about workouts, nutrition, form, recovery, or supplements! 💪",
      id: "welcome",
    },
  ],
  input: "",
  loading: false,
  streaming: false,
  streamingMsgId: null,
  mode: "chat",
  weekPlan: null,
  planLoading: false,
  analyzing: false,
  rateLimited: null,
  showScrollBtn: false,
  copiedId: null,
  likedMsgs: {},
  showStopBtn: false,
};

export const useChatStore = create((set) => ({
  ...initialState,

  setMsgs: (updater) =>
    set((state) => ({
      msgs: typeof updater === "function" ? updater(state.msgs) : updater,
    })),

  setInput: (input) => set({ input }),

  setLoading: (loading) => set({ loading }),

  setStreaming: (streaming) => set({ streaming }),

  setStreamingMsgId: (id) => set({ streamingMsgId: id }),

  setMode: (mode) => set({ mode }),

  setWeekPlan: (plan) => set({ weekPlan: plan }),

  setPlanLoading: (loading) => set({ planLoading: loading }),

  setAnalyzing: (analyzing) => set({ analyzing }),

  setRateLimited: (date) => set({ rateLimited: date }),

  setShowScrollBtn: (show) => set({ showScrollBtn: show }),

  setCopiedId: (id) => set({ copiedId: id }),

  setLikedMsgs: (updater) =>
    set((state) => ({
      likedMsgs:
        typeof updater === "function" ? updater(state.likedMsgs) : updater,
    })),

  setShowStopBtn: (show) => set({ showStopBtn: show }),

  resetChat: () =>
    set({
      msgs: [initialState.msgs[0]],
      input: "",
      loading: false,
      streaming: false,
      streamingMsgId: null,
      mode: "chat",
      weekPlan: null,
      planLoading: false,
      analyzing: false,
      rateLimited: null,
      showScrollBtn: false,
      copiedId: null,
      likedMsgs: {},
      showStopBtn: false,
    }),
}));
