import { useMemo } from "react";
import { motion } from "framer-motion";
import { theme, radius } from "../styles/designSystem";

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function StreakCalendar({ workoutDates = [], nutritionDates = [], streak = 0 }) {
  const days = useMemo(() => getLastNDays(91), []);
  const weeks = useMemo(() => {
    const grouped = {};
    days.forEach(d => {
      const week = getWeekNumber(d);
      if (!grouped[week]) grouped[week] = [];
      grouped[week].push(d);
    });
    return Object.values(grouped);
  }, [days]);

  const dateToKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const workoutSet = useMemo(() => new Set(workoutDates.map(dateToKey)), [workoutDates]);
  const nutritionSet = useMemo(() => new Set(nutritionDates.map(dateToKey)), [nutritionDates]);

  const getIntensity = (d) => {
    const k = dateToKey(d);
    const w = workoutSet.has(k);
    const n = nutritionSet.has(k);
    if (w && n) return 3;
    if (w) return 2;
    if (n) return 1;
    return 0;
  };

  const INTENSITY_COLORS = [
    theme.bgCard2,
    `${theme.green}25`,
    `${theme.red}30`,
    `${theme.yellow}35`,
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 2 }}>
        <div style={{
          display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 2,
          marginRight: 4, fontSize: 9, color: theme.textMuted,
        }}>
          {DAY_LABELS.map((l, i) => (
            <div key={i} style={{ height: 12, display: "flex", alignItems: "center", justifyContent: "center", width: 24 }}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 4 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 2 }}>
              {week.map((d, di) => {
                const intensity = getIntensity(d);
                const today = new Date();
                const isToday = dateToKey(d) === dateToKey(today);
                return (
                  <motion.div
                    key={di}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: wi * 0.005 + di * 0.01, duration: 0.2 }}
                    style={{
                      width: 12, height: 12,
                      borderRadius: 3,
                      background: INTENSITY_COLORS[intensity],
                      border: isToday ? `1px solid ${theme.red}` : `1px solid transparent`,
                      cursor: "pointer",
                    }}
                    title={`${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, fontSize: 10, color: theme.textMuted }}>
        <span>Less</span>
        {INTENSITY_COLORS.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span>More</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: theme.yellow, fontWeight: 600 }}>🔥 {streak}</span>
          <span>day streak</span>
        </div>
      </div>
    </div>
  );
}
