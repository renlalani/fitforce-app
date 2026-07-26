import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Calendar, TrendingUp, Dumbbell,
  Brain, Award, Target, Zap, Activity,
  Clock, Flame, Droplets, Salad, Weight,
  ChevronRight, Heart,
} from "lucide-react";
import { radius, shadow, muscleColor } from "../styles/designSystem";
import ProgressBar from "./ui/ProgressBar";
import Card from "./ui/Card";
import TrendChart from "./charts/TrendChart";
import BarChart from "./charts/BarChart";
import PieChart from "./charts/PieChart";
import {
  getPeriodRange, filterSessions, getWorkoutFrequency,
  getAggregatedMetrics, getVolumeTrend, getCaloriesTrend,
  getDurationTrend, getWeightTrend, getMuscleDistribution,
  getMostPerformedExercise, getMostTrainedMuscle,
  calculateLongestStreak, getConsistencyScore, getGoalCompletion,
  getAverageDuration, getAverageCaloriesBurned, getWeeklyComparison,
} from "../utils/analytics";
import ProgressPhotos from "./ProgressPhotos";

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

const PERIODS = [
  { id: "daily", label: "Day", icon: Zap },
  { id: "weekly", label: "Week", icon: Calendar },
  { id: "monthly", label: "Month", icon: BarChart3 },
  { id: "yearly", label: "Year", icon: TrendingUp },
];

const muscleColors = Object.values(muscleColor);

export default function AnalyticsDashboard({
  workoutSessions, workoutLog, meals, water, bodyStats,
  totalCal, totalProt, calGoal, protGoal, xp, streak, level, profile,
}) {
  const [period, setPeriod] = useState("weekly");

  const metrics = useMemo(() => getAggregatedMetrics(workoutSessions, period), [workoutSessions, period]);
  const frequency = useMemo(() => getWorkoutFrequency(workoutSessions, period), [workoutSessions, period]);
  const volumeTrend = useMemo(() => getVolumeTrend(workoutSessions, period), [workoutSessions, period]);
  const calTrend = useMemo(() => getCaloriesTrend(workoutSessions, period), [workoutSessions, period]);
  const durTrend = useMemo(() => getDurationTrend(workoutSessions, period), [workoutSessions, period]);
  const weightTrend = useMemo(() => getWeightTrend(bodyStats), [bodyStats]);
  const muscleDist = useMemo(() => getMuscleDistribution(workoutLog), [workoutLog]);
  const mostExercise = useMemo(() => getMostPerformedExercise(workoutLog), [workoutLog]);
  const mostMuscle = useMemo(() => getMostTrainedMuscle(workoutLog), [workoutLog]);
  const longestStreak = useMemo(() => calculateLongestStreak(workoutSessions), [workoutSessions]);
  const consistency = useMemo(() => getConsistencyScore(workoutSessions, streak), [workoutSessions, streak]);
  const goals = useMemo(() => getGoalCompletion(workoutSessions, meals, water, calGoal, protGoal, 8), [workoutSessions, meals, water, calGoal, protGoal]);
  const avgDuration = useMemo(() => getAverageDuration(workoutSessions, period), [workoutSessions, period]);
  const avgCalBurned = useMemo(() => getAverageCaloriesBurned(workoutSessions, period), [workoutSessions, period]);
  const weekComp = useMemo(() => getWeeklyComparison(workoutSessions), [workoutSessions]);

  const hasData = workoutSessions.length > 0 || workoutLog.length > 0;

  const insightCards = [
    {
      label: "Workouts", value: metrics.count,
      sub: period === "daily" ? "today" : `this ${period}`,
      icon: Dumbbell, color: "var(--accent)",
    },
    {
      label: "Total Volume", value: `${(metrics.totalVolume / 1000).toFixed(1)}k`,
      sub: "kg lifted", icon: TrendingUp, color: "var(--purple)",
    },
    {
      label: "Total Duration", value: `${metrics.totalDuration}`,
      sub: "minutes", icon: Clock, color: "var(--blue)",
    },
    {
      label: "Calories Burned", value: metrics.totalCalBurned,
      sub: `kcal`, icon: Flame, color: "var(--orange)",
    },
    {
      label: "Avg Duration", value: avgDuration ? `${avgDuration}m` : "—",
      sub: "per session", icon: Clock, color: "var(--cyan)",
    },
    {
      label: "Avg Cal Burned", value: avgCalBurned,
      sub: "per session", icon: Zap, color: "var(--yellow)",
    },
  ];

  const todayCards = [
    {
      label: "Water", value: `${water}/8`, pct: goals.waterPct,
      icon: Droplets, color: "var(--blue)",
    },
    {
      label: "Protein", value: `${totalProt}g`, pct: goals.protPct,
      icon: Salad, color: "var(--green)",
    },
    {
      label: "Calories", value: `${totalCal}`, pct: goals.calPct,
      icon: Zap, color: goals.calPct > 100 ? "var(--orange)" : "var(--accent)",
    },
  ];

  const gradeColor = consistency.totalScore >= 80 ? "var(--green)" : consistency.totalScore >= 65 ? "var(--blue)" : consistency.totalScore >= 50 ? "var(--yellow)" : "var(--red)";

  return (
    <motion.div variants={itemVariants} initial="initial" animate="animate">
      {/* Header */}
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
          Analytics
        </h3>
      </div>

      {!hasData ? (
        <Card variant="glass" style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>No workout data yet</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>
            Complete your first workout to see insights here.
          </div>
        </Card>
      ) : (
        <>
          {/* Time Period Selector */}
          <div style={{
            display: "flex", gap: 4,
            background: "var(--bg-card2)", borderRadius: radius.md,
            padding: 3, marginBottom: 16,
            border: `1px solid var(--border)`,
          }}>
            {PERIODS.map(({ id, label, icon: Icon }) => {
              const active = period === id;
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPeriod(id)}
                  style={{
                    flex: 1, padding: "9px 8px", borderRadius: radius.sm,
                    border: "none", cursor: "pointer", fontSize: 11,
                    background: active ? "var(--bg-card)" : "transparent",
                    color: active ? "var(--text)" : "var(--text-muted)",
                    fontWeight: active ? 600 : 400,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    boxShadow: active ? shadow.card : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <Icon size={13} />
                  {label}
                </motion.button>
              );
            })}
          </div>

          {/* Today's Goals Snapshot */}
          <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
            <Card variant="glass" glowColor="var(--accent)" style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Target size={14} color={"var(--accent)"} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Today's Goals</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                  {goals.workoutsDone && (
                    <div style={{
                      fontSize: 9, fontWeight: 600, color: "var(--green)",
                      background: "rgba(16,185,129,0.1)", padding: "2px 8px",
                      borderRadius: radius.full,
                    }}>Workout Done</div>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {todayCards.map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ textAlign: "center" }}
                  >
                    <div style={{
                      width: 28, height: 28,
                      background: `${c.color}12`, borderRadius: radius.sm,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 6px",
                    }}>
                      <c.icon size={13} color={c.color} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c.color, lineHeight: 1.2 }}>
                      {c.value}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>{c.label}</div>
                    <ProgressBar value={c.pct} max={100} color={c.color} height={3} animated delay={0.2 + i * 0.1} sx={{ marginTop: 6 }} />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Metric Insight Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {insightCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 + i * 0.025 }}
                whileHover={{ y: -3 }}
                style={{
                  background: "var(--bg-card2)", border: `1px solid var(--border)`,
                  borderRadius: radius.md, padding: "10px 6px", textAlign: "center",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -10, right: -10,
                  width: 44, height: 44,
                  background: `radial-gradient(circle, ${card.color}10, transparent 70%)`,
                  borderRadius: "50%", pointerEvents: "none",
                }} />
                <div style={{
                  width: 24, height: 24,
                  background: `${card.color}10`, borderRadius: radius.sm,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 4px",
                }}>
                  <card.icon size={12} color={card.color} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: card.color, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, fontWeight: 450 }}>
                  {card.sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Consistency Score */}
          <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
            <Card variant="glass" glowColor={gradeColor} style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Heart size={14} color={gradeColor} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Consistency Score</span>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: radius.sm,
                  background: `${gradeColor}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: gradeColor }}>{consistency.totalScore}</span>
                </div>
              </div>
              <ProgressBar value={consistency.totalScore} max={100} gradient="linear-gradient(90deg, var(--red), var(--yellow), var(--green))" height={6} animated sx={{ marginBottom: 10 }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: 10, color: "var(--text-muted)", textAlign: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 12 }}>{streak}</div>
                  <div>Current Streak</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 12 }}>{longestStreak}</div>
                  <div>Longest Streak</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 12 }}>{consistency.weeklyAvg.toFixed(1)}</div>
                  <div>Avg/Week</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Weekly Comparison */}
          {period === "weekly" && weekComp.thisCount > 0 && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Card variant="glass" glowColor="var(--purple)" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <TrendingUp size={14} color={"var(--purple)"} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>vs Last Week</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  <div style={{ textAlign: "center", background: "var(--bg-card3)", borderRadius: radius.sm, padding: "10px" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Workouts</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: weekComp.countChange >= 0 ? "var(--green)" : "var(--red)" }}>
                      {weekComp.countChange > 0 ? "+" : ""}{weekComp.countChange}%
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{weekComp.lastCount} → {weekComp.thisCount}</div>
                  </div>
                  <div style={{ textAlign: "center", background: "var(--bg-card3)", borderRadius: radius.sm, padding: "10px" }}>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Volume</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: weekComp.volChange >= 0 ? "var(--green)" : "var(--red)" }}>
                      {weekComp.volChange > 0 ? "+" : ""}{weekComp.volChange}%
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{(weekComp.lastVol / 1000).toFixed(1)}k → {(weekComp.thisVol / 1000).toFixed(1)}k</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Workout Frequency Chart */}
          {frequency.some(d => d.value > 0) && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Card variant="glass" glowColor="var(--accent)" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Dumbbell size={14} color={"var(--accent)"} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Workout Frequency</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-card2)", padding: "3px 8px", borderRadius: radius.full }}>
                    {metrics.count} sessions
                  </div>
                </div>
                <BarChart
                  data={frequency}
                  color="var(--accent)"
                  height={120}
                  xKey="date"
                  yKey="value"
                  barSize={16}
                  unit=""
                />
              </Card>
            </motion.div>
          )}

          {/* Volume Trend Chart */}
          {volumeTrend.some(d => d.value > 0) && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Card variant="glass" glowColor="var(--purple)" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TrendingUp size={14} color={"var(--purple)"} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Volume Trend</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-card2)", padding: "3px 8px", borderRadius: radius.full }}>
                    {(metrics.totalVolume / 1000).toFixed(1)}k kg
                  </div>
                </div>
                <TrendChart
                  data={volumeTrend}
                  color="var(--purple)"
                  height={130}
                  unit=" kg"
                  yLabel="Volume"
                />
              </Card>
            </motion.div>
          )}

          {/* Calories Burned Chart */}
          {calTrend.some(d => d.value > 0) && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Card variant="glass" glowColor="var(--orange)" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Flame size={14} color={"var(--orange)"} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Calories Burned</span>
                </div>
                <TrendChart
                  data={calTrend}
                  color="var(--orange)"
                  height={110}
                  unit=" kcal"
                />
              </Card>
            </motion.div>
          )}

          {/* Duration Trend */}
          {durTrend.some(d => d.value > 0) && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Card variant="glass" glowColor="var(--blue)" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Clock size={14} color={"var(--blue)"} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Duration Trend</span>
                </div>
                <TrendChart
                  data={durTrend}
                  color="var(--blue)"
                  height={110}
                  unit=" min"
                />
              </Card>
            </motion.div>
          )}

          {/* Body Weight Chart */}
          {weightTrend.length >= 2 && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Card variant="glass" glowColor="var(--green)" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Weight size={14} color={"var(--green)"} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Body Weight</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-card2)", padding: "3px 8px", borderRadius: radius.full }}>
                    {weightTrend[weightTrend.length - 1].value} kg
                  </div>
                </div>
                <TrendChart
                  data={weightTrend}
                  color="var(--green)"
                  height={130}
                  unit=" kg"
                  yLabel="Weight"
                />
              </Card>
            </motion.div>
          )}

          {/* Muscle Distribution */}
          {muscleDist.length > 0 && (
            <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
              <Card variant="glass" glowColor="var(--accent)" style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Activity size={14} color={"var(--accent)"} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Muscle Distribution</span>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    {muscleDist.slice(0, 5).map((m, i) => (
                      <div key={m.name} style={{ marginBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                          <span style={{ color: "var(--text)", fontWeight: 500 }}>{m.name}</span>
                          <span style={{ color: "var(--text-muted)" }}>{m.pct}%</span>
                        </div>
                        <ProgressBar value={m.pct} max={100} color={muscleColors[i % muscleColors.length]} height={4} animated delay={i * 0.08} />
                      </div>
                    ))}
                  </div>
                  <div style={{ width: 100, flexShrink: 0 }}>
                    <PieChart
                      data={muscleDist.slice(0, 6)}
                      height={100}
                      innerRadius={25}
                      outerRadius={45}
                      colors={muscleColors}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Most Performed / Most Trained */}
          <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
            <Card variant="glass" glowColor="var(--accent)" style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Award size={14} color={"var(--accent)"} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Top Stats</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                <div style={{ background: "var(--bg-card3)", borderRadius: radius.sm, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Most Performed</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                    {mostExercise ? mostExercise[0] : "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                    {mostExercise ? `${mostExercise[1]} times` : ""}
                  </div>
                </div>
                <div style={{ background: "var(--bg-card3)", borderRadius: radius.sm, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>Most Trained</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--purple)" }}>
                    {mostMuscle ? mostMuscle.name : "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                    {mostMuscle ? `${mostMuscle.pct}% of volume` : ""}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* AI Summary */}
          <motion.div variants={itemVariants}>
            <Card variant="glass" glowColor="var(--purple)" style={{ padding: "16px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32,
                  background: "rgba(139,92,246,0.1)", borderRadius: radius.sm,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Brain size={16} color={"var(--purple)"} />
                </div>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                    AI Summary
                  </h3>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                    {period.charAt(0).toUpperCase() + period.slice(1)} overview
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7 }}>
                {metrics.count === 0
                  ? `No workouts logged ${period === "daily" ? "today" : `this ${period}`}. Start with 2-3 sessions per week for consistent progress.`
                  : metrics.count < (period === "daily" ? 1 : period === "weekly" ? 3 : period === "monthly" ? 8 : 48)
                    ? `You completed ${metrics.count} workout${metrics.count > 1 ? "s" : ""} ${period === "daily" ? "today" : `this ${period}`}. Try to increase frequency for better results.`
                    : `Excellent consistency! ${metrics.count} workout${metrics.count > 1 ? "s" : ""} ${period === "daily" ? "today" : `this ${period}`}. Keep up the great work!`
                }
                {consistency.totalScore >= 70 && ` Your consistency score of ${consistency.totalScore}/100 is outstanding.`}
                {consistency.totalScore < 50 && consistency.totalScore > 0 && ` Your consistency score is ${consistency.totalScore}/100. Try working out more regularly.`}
              </div>
            </Card>
          </motion.div>

          {/* Progress Photos */}
          <motion.div variants={itemVariants} style={{ marginTop: 16 }}>
            <Card style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: radius.sm, background: `rgba(168,85,247,0.125)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BarChart3 size={13} color={"var(--purple)"} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Progress Photos</span>
              </div>
              <ProgressPhotos streak={streak} level={level} bodyStats={bodyStats} />
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
