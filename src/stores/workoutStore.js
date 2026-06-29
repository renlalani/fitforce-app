import { create } from "zustand";
import { persist } from "zustand/middleware";

let uidCounter = 0;
function nextUid() {
  return (++uidCounter).toString(36);
}

const initialState = {
  workoutLog: [
    { uid: "0", date: "Apr 9", name: "Bench Press", sets: 3, reps: 10, weight: 60, vol: 1800 },
    { uid: "1", date: "Apr 10", name: "Squat", sets: 4, reps: 8, weight: 80, vol: 2560 },
    { uid: "2", date: "Apr 11", name: "Deadlift", sets: 4, reps: 5, weight: 100, vol: 2000 },
  ],
  activeWorkout: null,
  newLogRow: { name: "", sets: "", reps: "", weight: "" },
  workoutSessions: [
    {
      id: "demo-1",
      completedAt: "2026-06-25T10:00:00.000Z",
      date: "Jun 25, 2026",
      workoutName: "Push Day",
      durationMinutes: 45,
      caloriesBurned: 320,
      xpEarned: 85,
      exerciseCount: 4,
      totalSets: 12,
      totalVolume: 4500,
    },
    {
      id: "demo-2",
      completedAt: "2026-06-23T09:30:00.000Z",
      date: "Jun 23, 2026",
      workoutName: "Pull Day",
      durationMinutes: 50,
      caloriesBurned: 380,
      xpEarned: 90,
      exerciseCount: 5,
      totalSets: 15,
      totalVolume: 5200,
    },
  ],
};

export const useWorkoutStore = create(
  persist(
    (set) => ({
      ...initialState,

      setWorkoutLog: (updater) =>
        set((state) => ({
          workoutLog:
            typeof updater === "function" ? updater(state.workoutLog) : updater,
        })),

      setActiveWorkout: (plan) => set({ activeWorkout: plan }),

      setNewLogRow: (field, value) =>
        set((state) => ({
          newLogRow: typeof field === "function"
            ? field(state.newLogRow)
            : { ...state.newLogRow, [field]: value },
        })),

      resetNewLogRow: () =>
        set({ newLogRow: { name: "", sets: "", reps: "", weight: "" } }),

      addLogEntry: () =>
        set((state) => {
          const { name, sets, reps, weight } = state.newLogRow;
          if (!name) return state;
          const s = +sets || 3;
          const r = +reps || 10;
          const w = +weight || 0;
          const today = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return {
            workoutLog: [
              ...state.workoutLog,
              {
                uid: nextUid(),
                date: today,
                name,
                sets: s,
                reps: r,
                weight: w,
                vol: s * r * w,
              },
            ],
            newLogRow: { name: "", sets: "", reps: "", weight: "" },
          };
        }),

      completeWorkout: (completedSets, xpGained, sessionMeta = {}) =>
        set((state) => {
          const completedAt = new Date().toISOString();
          const today = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          function safeReps(reps) {
            if (reps == null) return 0;
            return Number(String(reps).split("-")[0]) || 0;
          }

          const grouped = {};
          completedSets.forEach((cs) => {
            if (!grouped[cs.name]) {
              grouped[cs.name] = {
                name: cs.name,
                sets: 0,
                reps: cs.reps,
                weight: 0,
                vol: 0,
              };
            }
            const g = grouped[cs.name];
            g.sets++;
            const w = cs.weight !== "—" ? Number(cs.weight) : 0;
            if (w > g.weight) g.weight = w;
            const reps = safeReps(cs.reps);
            g.vol += w * reps;
          });

          const entries = Object.values(grouped);
          const totalSets = entries.reduce((s, e) => s + e.sets, 0);
          const totalVolume = entries.reduce((s, e) => s + e.vol, 0);
          const exerciseCount = entries.length;

          const session = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            completedAt,
            date: today,
            workoutName: sessionMeta.workoutName || "Workout",
            durationMinutes: sessionMeta.durationMinutes ?? Math.round(totalSets * 2),
            caloriesBurned: sessionMeta.caloriesBurned ?? Math.round(totalVolume / 10),
            xpEarned: xpGained,
            exerciseCount,
            totalSets,
            totalVolume,
          };

          const logEntries = entries.map((ex) => ({
            uid: nextUid(),
            date: today,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            vol: ex.vol,
          }));

          return {
            workoutSessions: [...state.workoutSessions, session],
            workoutLog: [...logEntries, ...state.workoutLog],
            activeWorkout: null,
          };
        }),
    }),
    {
      name: "fitforce-workout",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const seen = new Set();
        state.workoutLog = (state.workoutLog || []).map((e) => ({
          ...e,
          sets: +e.sets || 0,
          reps: +e.reps || 0,
          weight: +e.weight || 0,
          vol: +e.vol || 0,
        }));
        state.workoutLog.forEach((e) => {
          if (!e.uid) return;
          const n = parseInt(e.uid, 36);
          if (!isNaN(n) && n > uidCounter) uidCounter = n;
        });
        state.workoutLog = state.workoutLog.map((e) => {
          if (!e.uid || seen.has(e.uid)) {
            return { ...e, uid: nextUid() };
          }
          seen.add(e.uid);
          return e;
        });
      },
    }
  )
);

const getWeekStart = () => {
  const now = new Date();
  const ws = new Date(now);
  ws.setDate(now.getDate() - now.getDay());
  ws.setHours(0, 0, 0, 0);
  return ws;
};

const getThisWeek = (sessions) => {
  const ws = getWeekStart();
  return sessions.filter((s) => new Date(s.completedAt) >= ws);
};

export const selectWeeklyWorkouts = (s) => getThisWeek(s.workoutSessions).length;

export const selectWeeklyVolume = (s) => getThisWeek(s.workoutSessions).reduce((sum, ws) => sum + (ws.totalVolume || 0), 0);

export const selectWeeklyMinutes = (s) => getThisWeek(s.workoutSessions).reduce((sum, ws) => sum + (ws.durationMinutes || 0), 0);

export const selectWeeklyCalories = (s) => getThisWeek(s.workoutSessions).reduce((sum, ws) => sum + (ws.caloriesBurned || 0), 0);

export const selectWeeklyXP = (s) => getThisWeek(s.workoutSessions).reduce((sum, ws) => sum + (ws.xpEarned || 0), 0);

export const selectTotalVolume = (s) => s.workoutSessions.reduce((sum, ws) => sum + (ws.totalVolume || 0), 0);

export const selectTotalCalories = (s) => s.workoutSessions.reduce((sum, ws) => sum + (ws.caloriesBurned || 0), 0);

export const selectLastWorkout = (s) => {
  if (s.workoutSessions.length === 0) return null;
  return s.workoutSessions.reduce((latest, ws) =>
    new Date(ws.completedAt) > new Date(latest.completedAt) ? ws : latest
  );
};

export const selectCurrentStreak = (s) => {
  if (s.workoutSessions.length === 0) return 0;
  const sorted = [...s.workoutSessions].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].completedAt);
    const curr = new Date(sorted[i].completedAt);
    const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break;
    }
  }
  return streak;
};
