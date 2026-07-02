import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Calendar, TrendingUp, Dumbbell,
  Brain, Download, BarChart3, Award,
  Target, Zap, Activity,
} from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import Button from "./ui/Button";
import Card from "./ui/Card";
import MiniChart from "./MiniChart";
import { exportAsJSON } from "../utils/exportData";

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function ProgressReports({
  workoutSessions, meals, water, bodyStats, prs,
  totalCal, totalProt, totalCarbs, totalFat,
  calGoal, protGoal, xp, streak, level, profile,
}) {
  const [reportType, setReportType] = useState("weekly");

  const report = useMemo(() => {
    const now = new Date();
    const isWeekly = reportType === "weekly";

    const periodStart = new Date(now);
    if (isWeekly) {
      periodStart.setDate(now.getDate() - now.getDay());
    } else {
      periodStart.setDate(now.getDate() - 30);
    }
    periodStart.setHours(0, 0, 0, 0);

    const periodSessions = workoutSessions.filter(ws => {
      const d = new Date(ws.completedAt);
      return d >= periodStart;
    });

    const periodMeals = meals.filter(m => {
      if (!m.date) return true;
      const d = new Date(m.date);
      return d >= periodStart;
    });

    const totalVolume = periodSessions.reduce((s, ws) => s + (ws.totalVolume || 0), 0);
    const sessionCount = periodSessions.length;
    const avgCal = periodMeals.length > 0
      ? Math.round(periodMeals.reduce((s, m) => s + (+m.cal || 0), 0) / (isWeekly ? 7 : 30))
      : 0;
    const avgProt = periodMeals.length > 0
      ? Math.round(periodMeals.reduce((s, m) => s + (+m.protein || 0), 0) / (isWeekly ? 7 : 30))
      : 0;

    const currentYear = new Date().getFullYear();
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date(NaN);
      if (!dateStr.includes(",")) {
        return new Date(`${dateStr}, ${currentYear}`);
      }
      return new Date(dateStr);
    };

    const recentBodyStats = bodyStats.filter(b => {
      const d = parseDate(b.date);
      return d >= periodStart;
    });

    let weightChange = null;
    if (bodyStats.length >= 2) {
      const latestWeight = bodyStats[bodyStats.length - 1].weight;
      let startWeight = null;
      for (let i = bodyStats.length - 2; i >= 0; i--) {
        if (parseDate(bodyStats[i].date) <= periodStart) {
          startWeight = bodyStats[i].weight;
          break;
        }
      }
      if (startWeight == null && recentBodyStats.length > 0) {
        startWeight = recentBodyStats[0].weight;
      }
      if (startWeight != null && latestWeight != null) {
        weightChange = (latestWeight - startWeight).toFixed(1);
      }
    }

    const score = Math.min(100, Math.round(
      (sessionCount * 5) +
      (avgProt > (protGoal * 0.8) ? 20 : avgProt > (protGoal * 0.5) ? 10 : 0) +
      (water >= 6 ? 15 : water >= 4 ? 8 : 0) +
      (streak >= 7 ? 15 : streak >= 3 ? 10 : streak > 0 ? 5 : 0) +
      (bodyStats.length >= 2 ? 5 : 0)
    ));

    const grade = score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";

    return {
      period: isWeekly ? "This Week" : "This Month",
      sessions: sessionCount,
      volume: totalVolume,
      avgCal,
      avgProt,
      weightChange,
      xp,
      streak,
      score,
      grade,
      sessionsGoal: isWeekly ? 4 : 16,
      calGoal,
      protGoal,
    };
  }, [reportType, workoutSessions, meals, water, bodyStats, prs, totalCal, totalProt, totalCarbs, totalFat, calGoal, protGoal, xp, streak, level, profile]);

  const weeklyVolumeData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
      const vol = workoutSessions
        .filter(ws => new Date(ws.completedAt).toDateString() === d.toDateString())
        .reduce((s, ws) => s + (ws.totalVolume || 0), 0);
      days.push({ day: dayStr, value: vol });
    }
    return days;
  }, [workoutSessions]);

  const gradeColor = report.score >= 80 ? "var(--green)" : report.score >= 65 ? "var(--blue)" : report.score >= 50 ? "var(--yellow)" : "var(--red)";

  const reportCards = [
    {
      label: `${report.period} Score`,
      value: `${report.grade}`,
      sub: `${report.score}%`,
      icon: Award,
      color: gradeColor,
    },
    {
      label: "Workouts",
      value: `${report.sessions}`,
      sub: `of ${report.sessionsGoal} goal`,
      icon: Dumbbell,
      color: report.sessions >= report.sessionsGoal ? "var(--green)" : report.sessions >= report.sessionsGoal / 2 ? "var(--yellow)" : "var(--red)",
    },
    {
      label: "Total Volume",
      value: `${(report.volume / 1000).toFixed(1)}k`,
      sub: "kg lifted",
      icon: TrendingUp,
      color: "var(--purple)",
    },
    {
      label: "Avg Calories",
      value: `${report.avgCal}`,
      sub: `of ${report.calGoal} goal`,
      icon: Zap,
      color: Math.abs(report.avgCal - report.calGoal) < 300 ? "var(--green)" : "var(--orange)",
    },
    {
      label: "Avg Protein",
      value: `${report.avgProt}g`,
      sub: `of ${report.protGoal}g goal`,
      icon: Target,
      color: report.avgProt >= report.protGoal * 0.8 ? "var(--green)" : "var(--blue)",
    },
    {
      label: "Weight Change",
      value: report.weightChange ? `${report.weightChange > 0 ? "+" : ""}${report.weightChange}` : "—",
      sub: report.weightChange ? "kg this period" : "No data",
      icon: Activity,
      color: report.weightChange === null ? "var(--text-muted)" : "var(--orange)",
    },
  ];

  return (
    <motion.div variants={itemVariants} initial="initial" animate="animate">
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32,
          background: `linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))`,
          borderRadius: radius.md,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BarChart3 size={16} color={"var(--accent)"} />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>
          Progress Reports
        </h3>
      </div>

      {/* Period Toggle */}
      <div style={{
        display: "flex", gap: 6,
        background: "var(--bg-card2)",
        borderRadius: radius.md,
        padding: 3,
        marginBottom: 16,
        border: `1px solid var(--border)`,
      }}>
        {[
          { id: "weekly", label: "Weekly", icon: Calendar },
          { id: "monthly", label: "Monthly", icon: FileText },
        ].map(({ id, label, icon: Icon }) => {
          const active = reportType === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setReportType(id)}
              style={{
                flex: 1, padding: "10px 12px",
                borderRadius: radius.sm,
                border: "none",
                background: active ? "var(--bg-card)" : "transparent",
                color: active ? "var(--text)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                position: "relative",
                boxShadow: active ? shadow.card : "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        {reportCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            whileHover={{ y: -3 }}
            style={{
              background: "var(--bg-card2)",
              border: `1px solid var(--border)`,
              borderRadius: radius.md,
              padding: "12px 8px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", top: -10, right: -10,
              width: 50, height: 50,
              background: `radial-gradient(circle, ${card.color}10, transparent 70%)`,
              borderRadius: "50%",
              pointerEvents: "none",
            }} />
            <div style={{
              width: 28, height: 28,
              background: `${card.color}10`,
              borderRadius: radius.sm,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 6px",
            }}>
              <card.icon size={13} color={card.color} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: card.color, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 3, fontWeight: 450 }}>{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Volume Chart */}
      {weeklyVolumeData.some(d => d.value > 0) && (
        <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
          <Card variant="glass" glowColor="var(--accent)" style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{
                fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <TrendingUp size={14} color={"var(--purple)"} /> Weekly Volume
              </h3>
              <div style={{
                fontSize: 11, color: "var(--text-muted)", background: "var(--bg-card2)",
                padding: "4px 10px", borderRadius: radius.full,
              }}>
                {report.volume > 0 ? `${(report.volume / 1000).toFixed(1)}k kg total` : "No data"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 90 }}>
              {weeklyVolumeData.map((d, i) => {
                const max = Math.max(...weeklyVolumeData.map(x => x.value), 1);
                const h = (d.value / max) * 100;
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${Math.max(h, 4)}%`, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                      style={{
                        width: "100%",
                        background: `linear-gradient(180deg, var(--accent), var(--purple)80)`,
                        borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
                        opacity: 0.5 + (h / 100) * 0.5,
                        minHeight: 4,
                        position: "relative",
                      }}
                    />
                    <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 450 }}>{d.day}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* AI Summary */}
      <motion.div variants={itemVariants}>
        <Card variant="glass" glowColor="var(--purple)" style={{ padding: "18px" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: "rgba(139,92,246,0.1)",
              borderRadius: radius.sm,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Brain size={16} color={"var(--purple)"} />
            </div>
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                AI Summary
              </h3>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                {report.period} overview
              </div>
            </div>
            <div style={{
              marginLeft: "auto",
              width: 36, height: 36,
              background: `${gradeColor}12`,
              borderRadius: radius.sm,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: gradeColor }}>{report.grade}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7 }}>
            {report.sessions === 0
              ? `No workouts logged ${reportType === "weekly" ? "this week" : "this month"}. Start with 2-3 sessions per week for consistent progress.`
              : report.sessions < report.sessionsGoal / 2
                ? `You completed ${report.sessions} workout${report.sessions > 1 ? "s" : ""} ${reportType === "weekly" ? "this week" : "this month"}. Try to increase frequency for better results.`
                : report.sessions >= report.sessionsGoal
                  ? `Excellent consistency! ${report.sessions} workout${report.sessions > 1 ? "s" : ""} ${reportType === "weekly" ? "this week" : "this month"}. Keep up the great work!`
                  : `Good progress with ${report.sessions} workout${report.sessions > 1 ? "s" : ""}. You're on the right track!`
            }
            {" "}{report.avgProt > 0 && report.avgProt >= report.protGoal * 0.8
              ? `Protein intake is solid at ${report.avgProt}g daily average.`
              : `Try to increase protein intake to ${report.protGoal}g per day for better recovery.`
            }
          </div>
        </Card>
      </motion.div>

      {/* Export Actions */}
      <motion.div variants={itemVariants} style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Button variant="secondary"
          onClick={() => {
            const rows = reportCards.map(c => `${c.label}: ${c.value} (${c.sub})`);
            const text = [`${report.period} Report`, "---", ...rows, "", "AI Summary", "---", document.querySelector('[class*="textMuted"]')?.textContent || ""].join("\n");
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `fitforce-${reportType}.txt`; a.click();
            URL.revokeObjectURL(url);
          }}
          style={{ flex: 1, fontSize: 11 }}>
          <Download size={12} /> Export Report
        </Button>
        <Button variant="secondary"
          onClick={() => {
            exportAsJSON(report, `fitforce-${reportType}-report`);
          }}
          style={{ flex: 1, fontSize: 11 }}>
          <BarChart3 size={12} /> Export JSON
        </Button>
      </motion.div>
    </motion.div>
  );
}
