import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, TrendingUp, Target, Dumbbell, Apple, Droplets,
  Zap, ChevronDown, ChevronUp
} from "lucide-react";
import {  radius } from "../styles/designSystem";

export default function AIInsights({
  profile, workoutSessions = [], meals = [], water,
  xp, streak, totalCal, totalProt,
  calGoal, protGoal, level, bodyStats = [], prs = [],
}) {
  const [expanded, setExpanded] = useState(null);

  const insights = useMemo(() => {
    const items = [];

    const weekSessions = workoutSessions.filter(ws => {
      const d = new Date(ws.completedAt);
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }).length;

    const lastWeekSessions = workoutSessions.filter(ws => {
      const d = new Date(ws.completedAt);
      const now = new Date();
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(now.getDate() - 14);
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= twoWeeksAgo && d < weekAgo;
    }).length;

    const protPct = protGoal > 0 ? Math.round((totalProt / protGoal) * 100) : 0;
    const calPct = calGoal > 0 ? Math.round((totalCal / calGoal) * 100) : 0;
    const hasWorkouts = workoutSessions.length > 0;
    const hasMeals = meals.length > 0;

    items.push({
      id: "workout",
      icon: Dumbbell,
      color: "var(--accent)",
      title: weekSessions >= 3 ? "Great consistency!" : weekSessions > 0 ? "Getting there" : "Start working out",
      detail: weekSessions >= 3
        ? `You completed ${weekSessions} workouts this week. Your consistency is improving!`
        : weekSessions > 0
          ? `You completed ${weekSessions} workout${weekSessions > 1 ? "s" : ""} this week. Aim for 3-4 sessions.`
          : "No workouts logged this week. Start with 2-3 sessions per week.",
      action: "View Workouts",
      priority: weekSessions === 0 ? "high" : weekSessions < 3 ? "medium" : "low",
    });

    if (weekSessions > 0 && lastWeekSessions > 0) {
      const diff = weekSessions - lastWeekSessions;
      items.push({
        id: "trend",
        icon: TrendingUp,
        color: diff >= 0 ? "var(--green)" : "var(--red)",
        title: diff >= 0 ? "Workout frequency improving" : "Workout frequency dropping",
        detail: diff >= 0
          ? `You did ${weekSessions} workouts this week vs ${lastWeekSessions} last week (+${diff}). Keep it up!`
          : `You did ${weekSessions} workouts this week vs ${lastWeekSessions} last week (${diff}). Try to stay consistent.`,
        action: null,
        priority: diff < 0 ? "medium" : "low",
      });
    }

    if (protPct < 70) {
      items.push({
        id: "protein",
        icon: Apple,
        color: "var(--blue)",
        title: "Protein target missed",
        detail: `You got ${totalProt}g protein today (${protPct}% of ${protGoal}g goal). Try adding a protein source to your next meal.`,
        action: "View Nutrition",
        priority: "high",
      });
    } else if (protPct >= 100) {
      items.push({
        id: "protein_done",
        icon: Apple,
        color: "var(--green)",
        title: "Protein goal achieved!",
        detail: `You hit ${totalProt}g protein today — ${protPct}% of your goal. Great nutrition!`,
        action: null,
        priority: "low",
      });
    }

    if (water < 6) {
      items.push({
        id: "water",
        icon: Droplets,
        color: "var(--teal)",
        title: "Hydration reminder",
        detail: `You've had ${water}/8 glasses of water today. Aim for 8 glasses for optimal performance.`,
        action: "Drink water",
        priority: "high",
      });
    }

    if (calPct > 0) {
      const calDiff = totalCal - calGoal;
      items.push({
        id: "calories",
        icon: Zap,
        color: Math.abs(calDiff) < 200 ? "var(--green)" : calDiff > 0 ? "var(--orange)" : "var(--blue)",
        title: Math.abs(calDiff) < 200 ? "Calories on track" : calDiff > 0 ? "Over calories today" : "Under calories today",
        detail: `You've consumed ${totalCal} kcal (${calPct}% of ${calGoal} kcal goal). ${calDiff > 0 ? `You're ${calDiff} kcal over.` : calDiff < 0 ? `You have ${Math.abs(calDiff)} kcal remaining.` : "Right on target!"}`,
        action: null,
        priority: Math.abs(calDiff) > 300 ? "medium" : "low",
      });
    }

    if (streak > 0) {
      items.push({
        id: "streak",
        icon: Zap,
        color: "var(--yellow)",
        title: `${streak}-day streak!`,
        detail: streak >= 7
          ? `Amazing ${streak}-day streak! You're building a powerful habit.`
          : `You're on a ${streak}-day streak. Keep it going to build momentum!`,
        action: null,
        priority: "low",
      });
    }

    if (prs.length > 0) {
      const recentPr = prs.filter(p => p.weight > 60);
      if (recentPr.length > 0) {
        items.push({
          id: "pr",
          icon: Target,
          color: "var(--purple)",
          title: "Ready to push harder",
          detail: `You have ${recentPr.length} lift${recentPr.length > 1 ? "s" : ""} tracked. Try increasing weight by 2.5-5kg next session for progressive overload.`,
          action: "View PRs",
          priority: "medium",
        });
      }
    }

    if (bodyStats?.length >= 2) {
      const first = bodyStats[0]?.weight;
      const last = bodyStats[bodyStats.length - 1]?.weight;
      if (first != null && last != null && first !== last) {
        const diff = last - first;
        items.push({
          id: "weight",
          icon: TrendingUp,
          color: diff < 0 ? "var(--green)" : diff > 0 ? "var(--orange)" : "var(--text-muted)",
          title: diff < 0 ? "Weight trending down" : diff > 0 ? "Weight trending up" : "Weight stable",
          detail: `From ${first}kg to ${last}kg (${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg) over ${bodyStats.length} log${bodyStats.length > 1 ? "s" : ""}.`,
          action: null,
          priority: "low",
        });
      }
    }

    return items.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    });
  }, [workoutSessions, meals, water, totalCal, totalProt, calGoal, protGoal, streak, prs, bodyStats]);

  if (insights.length === 0) return null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: radius.md,
          background: `rgba(139,92,246,0.094)`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Brain size={14} color={"var(--purple)"} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>AI Insights</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>
          {insights.filter(i => i.priority === "high").length > 0 ? `${insights.filter(i => i.priority === "high").length} action items` : "All clear"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            style={{
              background: "var(--bg-card2)",
              border: `1px solid var(--border)`,
              borderRadius: radius.md,
              padding: "12px 14px",
              borderLeft: `3px solid ${insight.color}`,
              cursor: "pointer",
            }}
            onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: radius.sm,
                background: `${insight.color}15`, display: "flex",
                alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <insight.icon size={13} color={insight.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{insight.title}</div>
                  {insight.priority === "high" && (
                    <span style={{
                      fontSize: 9, padding: "1px 6px", borderRadius: radius.full,
                      background: `rgba(59,130,246,0.082)`, color: "var(--accent)",
                      fontWeight: 500, whiteSpace: "nowrap",
                    }}>Action needed</span>
                  )}
                </div>
                <AnimatePresence>
                  {expanded === insight.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 8 }}>
                        {insight.detail}
                      </div>
                      {insight.action && (
                        <div style={{
                          fontSize: 11, color: insight.color, fontWeight: 500, marginTop: 6,
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          {insight.action} →
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 2 }}>
                {expanded === insight.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


