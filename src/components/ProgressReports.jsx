import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText, Calendar, TrendingUp, Dumbbell, Apple,
  Brain, ChevronRight, Download, BarChart3
} from "lucide-react";
import {  radius } from "../styles/designSystem";
import Button from "./ui/Button";
import Card from "./ui/Card";
import MiniChart from "./MiniChart";
import { exportAsPDF, exportAsJSON, exportWorkoutCSV, exportNutritionCSV } from "../utils/exportData";

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

  const reportCards = [
    {
      label: `${report.period} Score`,
      value: `${report.grade} (${report.score}%)`,
      icon: Brain,
      color: report.score >= 80 ? "var(--green)" : report.score >= 65 ? "var(--blue)" : report.score >= 50 ? "var(--yellow)" : "var(--red)",
    },
    {
      label: "Workouts",
      value: `${report.sessions} / ${report.sessionsGoal}`,
      icon: Dumbbell,
      color: report.sessions >= report.sessionsGoal ? "var(--green)" : report.sessions >= report.sessionsGoal / 2 ? "var(--yellow)" : "var(--red)",
    },
    {
      label: "Total Volume",
      value: `${(report.volume / 1000).toFixed(1)}k kg`,
      icon: TrendingUp,
      color: "var(--purple)",
    },
    {
      label: "Avg Calories",
      value: `${report.avgCal} / ${report.calGoal}`,
      icon: Apple,
      color: Math.abs(report.avgCal - report.calGoal) < 300 ? "var(--green)" : "var(--orange)",
    },
    {
      label: "Avg Protein",
      value: `${report.avgProt} / ${report.protGoal}g`,
      icon: Apple,
      color: report.avgProt >= report.protGoal * 0.8 ? "var(--green)" : "var(--blue)",
    },
    {
      label: "Weight Change",
      value: report.weightChange ? `${report.weightChange > 0 ? "+" : ""}${report.weightChange} kg` : "—",
      icon: TrendingUp,
      color: report.weightChange === null ? "var(--text-muted)" : "var(--orange)",
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: radius.md,
          background: `rgba(59,130,246,0.094)`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <FileText size={14} color={"var(--blue)"} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Progress Reports</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { id: "weekly", label: "Weekly", icon: Calendar },
          { id: "monthly", label: "Monthly", icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setReportType(id)}
            style={{
              flex: 1, padding: "8px 12px",
              borderRadius: radius.md,
              border: `1px solid ${reportType === id ? "var(--blue)" : "var(--border2)"}`,
              background: reportType === id ? `rgba(59,130,246,0.071)` : "transparent",
              color: reportType === id ? "var(--blue)" : "var(--text-muted)",
              cursor: "pointer", fontSize: 12, fontWeight: reportType === id ? 500 : 400,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Icon size={14} />
            {label}
          </motion.button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8, marginBottom: 14 }}>
        {reportCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            style={{
              background: "var(--bg-card2)",
              border: `1px solid var(--border)`,
              borderRadius: radius.md,
              padding: "10px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: card.color }}>{card.value}</div>
          </motion.div>
        ))}
      </div>

      {weeklyVolumeData.some(d => d.value > 0) && (
        <div style={{ marginBottom: 14 }}>
          <Card>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 10px" }}>Weekly Volume</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {weeklyVolumeData.map((d, i) => {
                const max = Math.max(...weeklyVolumeData.map(x => x.value), 1);
                const h = (d.value / max) * 100;
                return (
                  <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(h, 4)}%` }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      style={{
                        width: "100%", background: "var(--accent)",
                        borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
                        opacity: 0.7 + (h / 100) * 0.3,
                        minHeight: 4,
                      }}
                    />
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{d.day}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <Card>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 8px" }}>AI Summary</h3>
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

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Button variant="secondary"
          onClick={() => {
            const rows = reportCards.map(c => `${c.label}: ${c.value}`);
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
      </div>
    </div>
  );
}


