import { EXERCISES } from "../data/fitness";

const msInDay = 86400000;

export function parseDate(dateStr) {
  if (!dateStr) return new Date(NaN);
  const year = new Date().getFullYear();
  if (!dateStr.includes(",")) return new Date(`${dateStr}, ${year}`);
  return new Date(dateStr);
}

export function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export function getPeriodRange(type) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  if (type === "daily") {
    start.setHours(0, 0, 0, 0);
  } else if (type === "weekly") {
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
  } else if (type === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (type === "yearly") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
}

export function filterSessions(sessions, type) {
  const { start } = getPeriodRange(type);
  return sessions.filter(s => new Date(s.completedAt) >= start);
}

export function getWorkoutFrequency(sessions, type) {
  const { start, end } = getPeriodRange(type);
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dayStr = cursor.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const count = sessions.filter(s => {
      const d = new Date(s.completedAt);
      return d.toDateString() === cursor.toDateString();
    }).length;
    days.push({ date: dayStr, value: count, fullDate: toISODate(cursor) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getAggregatedMetrics(sessions, type) {
  const filtered = filterSessions(sessions, type);
  const count = filtered.length;
  const totalVolume = filtered.reduce((s, ws) => s + (ws.totalVolume || 0), 0);
  const totalDuration = filtered.reduce((s, ws) => s + (ws.durationMinutes || 0), 0);
  const totalCalBurned = filtered.reduce((s, ws) => s + (ws.caloriesBurned || 0), 0);
  const totalSets = filtered.reduce((s, ws) => s + (ws.totalSets || 0), 0);
  const totalXp = filtered.reduce((s, ws) => s + (ws.xpEarned || 0), 0);
  return { count, totalVolume, totalDuration, totalCalBurned, totalSets, totalXp };
}

export function getVolumeTrend(sessions, type) {
  const { start, end } = getPeriodRange(type);
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dayStr = cursor.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const vol = sessions
      .filter(s => new Date(s.completedAt).toDateString() === cursor.toDateString())
      .reduce((sum, s) => sum + (s.totalVolume || 0), 0);
    days.push({ date: dayStr, value: vol });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getCaloriesTrend(sessions, type) {
  const { start, end } = getPeriodRange(type);
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dayStr = cursor.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const cal = sessions
      .filter(s => new Date(s.completedAt).toDateString() === cursor.toDateString())
      .reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);
    days.push({ date: dayStr, value: cal });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getDurationTrend(sessions, type) {
  const { start, end } = getPeriodRange(type);
  const days = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const dayStr = cursor.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const dur = sessions
      .filter(s => new Date(s.completedAt).toDateString() === cursor.toDateString())
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    days.push({ date: dayStr, value: dur });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getWeightTrend(bodyStats) {
  if (!Array.isArray(bodyStats)) return [];

  const seen = new Map();

  bodyStats.forEach(b => {
    if (!b || b.weight === undefined || b.weight === null) return;

    const parsed = parseDate(b.date);
    if (isNaN(parsed.getTime())) return;

    const weight = Number(b.weight);
    if (isNaN(weight) || weight <= 0) return;

    const isoKey = toISODate(parsed);
    if (!seen.has(isoKey) || parsed.getTime() >= seen.get(isoKey)._sortKey) {
      seen.set(isoKey, { date: b.date, value: weight, _sortKey: parsed.getTime() });
    }
  });

  return [...seen.values()]
    .sort((a, b) => a._sortKey - b._sortKey)
    .map(({ date, value }) => ({ date, value }));
}

export function getMuscleDistribution(workoutLog) {
  const muscleMap = {};
  workoutLog.forEach(entry => {
    const ex = EXERCISES.find(e => e.name.toLowerCase() === entry.name.toLowerCase());
    const muscle = ex ? ex.muscle : "Other";
    if (!muscleMap[muscle]) muscleMap[muscle] = 0;
    muscleMap[muscle] += entry.vol || entry.sets * entry.reps * (entry.weight || 1);
  });
  const total = Object.values(muscleMap).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(muscleMap)
    .map(([name, value]) => ({ name, value, pct: Math.round((value / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

export function getMostPerformedExercise(workoutLog) {
  const countMap = {};
  workoutLog.forEach(e => {
    if (!countMap[e.name]) countMap[e.name] = 0;
    countMap[e.name]++;
  });
  const entries = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
  return entries.length > 0 ? entries[0] : null;
}

export function getMostTrainedMuscle(workoutLog) {
  const dist = getMuscleDistribution(workoutLog);
  return dist.length > 0 ? dist[0] : null;
}

export function calculateLongestStreak(sessions) {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions]
    .map(s => new Date(s.completedAt))
    .sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round((sorted[i] - sorted[i - 1]) / msInDay);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export function getGoalCompletion(sessions, meals, water, calGoal, protGoal, waterGoal) {
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => new Date(s.completedAt).toDateString() === today);
  const todayCal = meals.reduce((s, m) => s + (+m.cal || 0), 0);
  const todayProt = meals.reduce((s, m) => s + (+m.protein || 0), 0);
  const workoutsDone = todaySessions.length > 0;
  const calPct = Math.min(100, Math.round((todayCal / (calGoal || 2000)) * 100));
  const protPct = Math.min(100, Math.round((todayProt / (protGoal || 100)) * 100));
  const waterPct = Math.min(100, Math.round((water / (waterGoal || 8)) * 100));
  return { workoutsDone, calPct, protPct, waterPct };
}

export function getConsistencyScore(sessions, streak) {
  const totalSessions = sessions.length;
  const weeklyGoal = 4;
  const weeksOfData = Math.max(1, Math.ceil(sessions.length / weeklyGoal));
  const weeklyAvg = totalSessions / weeksOfData;
  const freqScore = Math.min(40, Math.round((weeklyAvg / weeklyGoal) * 40));
  const streakScore = Math.min(30, Math.round((streak / 30) * 30));
  const totalScore = Math.min(100, freqScore + streakScore + 10);
  return { totalScore, freqScore, streakScore, weeklyAvg };
}

export function getAverageDuration(sessions, type) {
  const filtered = filterSessions(sessions, type);
  if (filtered.length === 0) return 0;
  const total = filtered.reduce((s, ws) => s + (ws.durationMinutes || 0), 0);
  return Math.round(total / filtered.length);
}

export function getAverageCaloriesBurned(sessions, type) {
  const filtered = filterSessions(sessions, type);
  if (filtered.length === 0) return 0;
  const total = filtered.reduce((s, ws) => s + (ws.caloriesBurned || 0), 0);
  return Math.round(total / filtered.length);
}

export function getWeeklyComparison(sessions) {
  const { start: thisWeekStart } = getPeriodRange("weekly");
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  const thisWeek = sessions.filter(s => new Date(s.completedAt) >= thisWeekStart);
  const lastWeek = sessions.filter(s => {
    const d = new Date(s.completedAt);
    return d >= lastWeekStart && d <= lastWeekEnd;
  });

  const thisVol = thisWeek.reduce((s, ws) => s + (ws.totalVolume || 0), 0);
  const lastVol = lastWeek.reduce((s, ws) => s + (ws.totalVolume || 0), 0);
  const thisCount = thisWeek.length;
  const lastCount = lastWeek.length;

  const volChange = lastVol > 0 ? Math.round(((thisVol - lastVol) / lastVol) * 100) : 0;
  const countChange = lastCount > 0 ? Math.round(((thisCount - lastCount) / lastCount) * 100) : 0;

  return { thisVol, lastVol, volChange, thisCount, lastCount, countChange };
}
