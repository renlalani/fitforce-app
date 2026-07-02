import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb, Dumbbell, Apple, Moon, Droplets, Timer
} from "lucide-react";
import {  radius } from "../styles/designSystem";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function SmartRecommendations({
  workoutSessions, water, totalProt,
  protGoal, streak,
}) {
  const today = DAYS[new Date().getDay()];
  const weekSessions = workoutSessions.filter(ws => {
    const d = new Date(ws.completedAt);
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }).length;

  const recommendations = useMemo(() => {
    const items = [];

    if (weekSessions === 0) {
      items.push({
        id: "start_workout",
        icon: Dumbbell,
        color: "var(--accent)",
        title: "Start your week strong",
        desc: "No workouts yet this week. Try a 20-minute session today.",
        tip: "Even short workouts build momentum.",
      });
    } else if (weekSessions < 3) {
      items.push({
        id: "more_workouts",
        icon: Dumbbell,
        color: "var(--accent)",
        title: "Add another session",
        desc: `You've done ${weekSessions} workout${weekSessions > 1 ? "s" : ""} this week. Aim for 3-4.`,
        tip: "Rest days are important too!",
      });
    }

    const protPct = protGoal > 0 ? Math.round((totalProt / protGoal) * 100) : 0;
    if (protPct < 60) {
      items.push({
        id: "protein",
        icon: Apple,
        color: "var(--blue)",
        title: "Boost your protein",
        desc: `You're at ${protPct}% of your protein goal. Try adding eggs, whey, or chicken.`,
        tip: "Spread protein across all meals for better absorption.",
      });
    }

    if (water < 5) {
      items.push({
        id: "water",
        icon: Droplets,
        color: "var(--teal)",
        title: "Hydrate more",
        desc: `Only ${water}/8 glasses today. Set a timer to drink every hour.`,
        tip: "Start your day with a glass of water.",
      });
    }

    const hasWorkoutToday = workoutSessions.some(ws => {
      const d = new Date(ws.completedAt);
      return d.toDateString() === new Date().toDateString();
    });

    if (hasWorkoutToday) {
      items.push({
        id: "recovery",
        icon: Moon,
        color: "var(--purple)",
        title: "Recovery mode",
        desc: "Great workout today! Focus on stretching, hydration, and sleep.",
        tip: "7-9 hours of sleep optimizes muscle recovery.",
      });
    }

    if (streak > 0 && streak % 7 === 0) {
      items.push({
        id: "streak_milestone",
        icon: Timer,
        color: "var(--yellow)",
        title: `${streak}-day streak!`,
        desc: `You've been consistent for ${streak} days. Take a moment to celebrate!`,
        tip: "Consistency beats intensity every time.",
      });
    }

    items.push({
      id: "sleep",
      icon: Moon,
      color: "var(--indigo)" || "var(--purple)",
      title: "Sleep for gains",
      desc: "Quality sleep is when your body repairs and builds muscle.",
      tip: "Try 7-9 hours. Avoid screens 30 min before bed.",
    });

    return items.slice(0, 5);
  }, [workoutSessions, water, totalProt, protGoal, streak]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: radius.md,
          background: `rgba(16,185,129,0.094)`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Lightbulb size={14} color={"var(--green)"} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Smart Recommendations</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Based on your activity</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {recommendations.map((rec, idx) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              background: "var(--bg-card2)",
              border: `1px solid var(--border)`,
              borderRadius: radius.md,
              padding: "11px 13px",
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: radius.sm,
              background: `${rec.color}12`, display: "flex",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <rec.icon size={14} color={rec.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{rec.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{rec.desc}</div>
              <div style={{
                fontSize: 10, color: rec.color, marginTop: 4,
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Lightbulb size={10} /> {rec.tip}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


