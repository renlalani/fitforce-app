import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Dumbbell, Flame, Trophy, Clock, Search, X,
  Play, ChevronRight, Sparkles, Star, Crown, Activity, RotateCcw,
  Calendar, Brain, Apple, Droplets, Heart, Footprints, Target,
  ChevronDown, BarChart3, Timer, Grip, CheckCircle2,
} from "lucide-react";
import { radius, shadow, muscleColor, cardStyle } from "../styles/designSystem";
import { EXERCISES, WORKOUT_PLANS, MUSCLES } from "../data/fitness";
import ExerciseImage from "./ExerciseImage";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { Tag, Badge } from "./ui/Tag";
import ProgressRing from "./ProgressRing";
import { useWorkoutStore, selectWeeklyWorkouts, selectWeeklyVolume, selectWeeklyMinutes, selectWeeklyCalories, selectWeeklyXP } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";
import { useIsMobile } from "../hooks/useMediaQuery";

const containerVariants = { animate: { transition: { staggerChildren: 0.05 } } };
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

const MUSCLE_EMOJI = {
  Chest: <Activity size={12} />, Back: <Activity size={12} />, Legs: <Footprints size={12} />, Glutes: <Activity size={12} />,
  Shoulders: <Dumbbell size={12} />, Arms: <Dumbbell size={12} />, Core: <Activity size={12} />, Cardio: <Heart size={12} />,
};

const LEVEL_COLOR = () => ({ Beginner: "var(--green)", Intermediate: "var(--yellow)", Advanced: "var(--accent)" });
const LEVEL_BG = () => ({ Beginner: `rgba(16,185,129,0.082)`, Intermediate: `rgba(245,158,11,0.082)`, Advanced: `rgba(59,130,246,0.082)` });

const DIFFICULTY_STARS = { Beginner: 1, Intermediate: 2, Advanced: 3 };

const QUICK_ACTIONS = () => [
  { id: "start", label: "Start Workout", icon: Play, color: "var(--accent)", gradient: `linear-gradient(135deg, var(--accent), var(--accent-dark))` },
  { id: "ai", label: "AI Workout", icon: Brain, color: "var(--purple)", gradient: `linear-gradient(135deg, var(--purple), var(--indigo))` },
  { id: "repeat", label: "Repeat Last", icon: RotateCcw, color: "var(--blue)", gradient: `linear-gradient(135deg, var(--blue), var(--blue-dark))` },
  { id: "favorite", label: "Favorites", icon: Star, color: "var(--yellow)", gradient: `linear-gradient(135deg, var(--yellow), var(--orange))` },
];

const TIPS = [
  { icon: Zap, text: "Warm up 5-10 min before each workout", color: "var(--orange)" },
  { icon: Droplets, text: "Stay hydrated throughout your workout", color: "var(--accent)" },
  { icon: Heart, text: "Focus on form over weight", color: "var(--green)" },
  { icon: Clock, text: "Rest 48-72h between same muscle groups", color: "var(--purple)" },
];

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function WorkoutHub({
  level, streak, setActiveWorkout, onNavigate,
  profile, onShowDetail,
}) {
  const workoutLog = useWorkoutStore(s => s.workoutLog);
  const prs = useUserStore(s => s.prs);
  const xp = useUserStore(s => s.xp);
  const weeklyWorkouts = useWorkoutStore(selectWeeklyWorkouts);
  const weeklyVolume = useWorkoutStore(selectWeeklyVolume);
  const weeklyMinutes = useWorkoutStore(selectWeeklyMinutes);
  const weeklyCalories = useWorkoutStore(selectWeeklyCalories);
  const weeklyXp = useWorkoutStore(selectWeeklyXP);
  const isMobile = useIsMobile();
  const [filterMuscle, setFilterMuscle] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState(
    () => localStorage.getItem("fitforce_workout_tab") || "plans"
  );

  useEffect(() => {
    localStorage.setItem("fitforce_workout_tab", selectedTab);
  }, [selectedTab]);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayPlan = useMemo(() => {
    const dayIdx = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(today);
    return WORKOUT_PLANS[dayIdx % WORKOUT_PLANS.length];
  }, [today]);

  const suggestedPlan = useMemo(() => {
    if (!profile?.level) return todayPlan;
    const levelMatch = WORKOUT_PLANS.filter(p => p.level === profile.level);
    return levelMatch.length > 0 ? levelMatch[0] : todayPlan;
  }, [profile, todayPlan]);

  const filteredEx = useMemo(() => {
    return EXERCISES.filter(e => {
      if (filterMuscle !== "All" && e.muscle !== filterMuscle) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filterMuscle, searchQuery]);

  const bestPRs = useMemo(() => {
    const grouped = {};
    workoutLog.forEach(w => {
      if (!grouped[w.name] || w.weight > grouped[w.name].weight) {
        grouped[w.name] = w;
      }
    });
    return Object.values(grouped).sort((a, b) => b.weight - a.weight).slice(0, 5);
  }, [workoutLog]);

  const recentWorkouts = useMemo(() => {
    const grouped = {};
    workoutLog.forEach(w => {
      if (!grouped[w.date]) grouped[w.date] = [];
      grouped[w.date].push(w);
    });
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 10);
  }, [workoutLog]);

  const getMusclesForPlan = useCallback((plan) => {
    const muscles = new Set();
    plan.exercises.forEach(eid => {
      const ex = EXERCISES.find(e => e.id === eid);
      if (ex) muscles.add(ex.muscle);
    });
    return [...muscles];
  }, []);

  const searchInputRef = useCallback(node => {
    if (node && showSearch) setTimeout(() => node.focus(), 100);
  }, [showSearch]);

  const tabs = [
    { id: "plans", label: "Plans", icon: Dumbbell },
    { id: "exercises", label: "Exercises", icon: Search },
    { id: "history", label: "History", icon: Clock },
    { id: "prs", label: "PRs", icon: Trophy },
  ];

  const workoutXp = weeklyXp || 0;
  const nextLevelXp = level * 500;
  const xpProgress = Math.min(100, (workoutXp / nextLevelXp) * 100);

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate"
      style={isMobile ? {
        display: "flex", flexDirection: "column",
        maxHeight: "calc(100vh - 154px)",
        overflow: "hidden",
      } : {}}>

      {/* Scrollable content area */}
      <div style={isMobile ? { flex: 1, overflowY: "auto", minHeight: 0, WebkitOverflowScrolling: "touch" } : {}}>

        {/* Hero - Today's Workout */}
        <div style={{ marginBottom: 16 }}>
          <motion.div variants={itemVariants}>
            <Card variant="glass" glowColor={suggestedPlan.color} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{
                padding: isMobile ? "20px" : "24px",
                background: `linear-gradient(135deg, ${suggestedPlan.color}12, transparent 60%)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>
                      <Clock size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
                      {today}'s Workout
                    </div>
                    <h2 style={{ color: "var(--text)", fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                      {suggestedPlan.name}
                    </h2>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    style={{
                      width: 50, height: 50,
                      background: `${suggestedPlan.color}18`,
                      borderRadius: radius.xl,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1px solid ${suggestedPlan.color}25`,
                      boxShadow: shadow.softGlow(suggestedPlan.color),
                    }}
                  >
                    <Dumbbell size={24} color={suggestedPlan.color} />
                  </motion.div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  <Badge label={suggestedPlan.level} color={LEVEL_COLOR()[suggestedPlan.level]} />
                  <Badge label={suggestedPlan.duration} color={"var(--text-muted)"} />
                  <Badge label={suggestedPlan.goal} color={suggestedPlan.color} />
                </div>

                <div style={{ display: "flex", gap: isMobile ? 12 : 20, flexWrap: "wrap", marginBottom: 18 }}>
                  {[
                    { icon: Flame, label: `${suggestedPlan.exercises.reduce((s, eid) => { const ex = EXERCISES.find(e => e.id === eid); return s + (ex?.cal || 0); }, 0)} cal`, color: "var(--accent)" },
                    { icon: Grip, label: `${suggestedPlan.exercises.length} exercises`, color: "var(--blue)" },
                    { icon: Activity, label: getMusclesForPlan(suggestedPlan).join(", "), color: "var(--purple)" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 24, height: 24,
                        background: `${color}12`,
                        borderRadius: radius.sm,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={12} color={color} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: shadow.glow(suggestedPlan.color) }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setActiveWorkout(suggestedPlan)}
                    style={{
                      padding: isMobile ? "12px 20px" : "14px 28px",
                      background: `linear-gradient(135deg, ${suggestedPlan.color}, ${suggestedPlan.color}dd)`,
                      color: "#fff",
                      border: "none",
                      borderRadius: radius.lg,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: shadow.softGlow(suggestedPlan.color),
                      flex: isMobile ? 1 : "none",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={15} fill="#fff" /> Start Workout
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, borderColor: "var(--text-muted)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onNavigate("ai")}
                    style={{
                      padding: isMobile ? "12px 16px" : "12px 20px",
                      background: "transparent",
                      border: `1px solid var(--border2)`,
                      color: "var(--text-muted)",
                      borderRadius: radius.lg,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <Brain size={15} color={"var(--purple)"} /> AI Plan
                  </motion.button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Stats Row */}
        <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? 8 : 10 }}>
            {[
              { label: "This Week", value: weeklyWorkouts || 0, suffix: " workouts", icon: Calendar, color: "var(--blue)" },
              { label: "Volume", value: weeklyVolume || 0, suffix: " kg", icon: Dumbbell, color: "var(--accent)" },
              { label: "Time", value: fmtDuration(weeklyMinutes * 60 || 0), icon: Timer, color: "var(--yellow)" },
              { label: "XP Earned", value: weeklyXp || 0, suffix: " XP", icon: Zap, color: "var(--purple)" },
            ].map(({ label, value, suffix, icon: Icon, color }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -3 }}
                style={{
                  background: "var(--bg-card2)",
                  borderRadius: radius.md,
                  padding: isMobile ? "12px 8px" : "16px",
                  border: `1px solid var(--border)`,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -8, right: -8,
                  width: 40, height: 40,
                  background: `radial-gradient(circle, ${color}10, transparent 70%)`,
                  borderRadius: "50%",
                }} />
                <div style={{
                  width: 32, height: 32,
                  background: `${color}10`,
                  borderRadius: radius.sm,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 8px",
                }}>
                  <Icon size={isMobile ? 14 : 16} color={color} />
                </div>
                <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
                  {typeof value === "number" ? value.toLocaleString() : value}{suffix || ""}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, fontWeight: 450 }}>{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {QUICK_ACTIONS().map(({ id, label, icon: Icon, color }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  if (id === "start") setActiveWorkout(suggestedPlan);
                  else if (id === "ai") onNavigate("ai");
                  else if (id === "repeat" && recentWorkouts.length > 0) {
                    const last = recentWorkouts[0][1][0];
                    const plan = WORKOUT_PLANS.find(p =>
                      p.exercises.some(eid => EXERCISES.find(e => e.id === eid)?.name === last.name)
                    );
                    if (plan) setActiveWorkout(plan);
                  }
                }}
                style={{
                  background: `${color}10`,
                  border: `1px solid ${color}25`,
                  borderRadius: radius.md,
                  padding: isMobile ? "12px 6px" : "16px 8px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: 80, height: 80,
                  background: `radial-gradient(circle, ${color}08, transparent 70%)`,
                  borderRadius: "50%",
                  transform: "translate(-50%, -50%)",
                }} />
                <div style={{
                  width: 36, height: 36,
                  background: `${color}15`,
                  borderRadius: radius.sm,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 6px",
                  position: "relative",
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div style={{ fontSize: 10, color: "var(--text)", fontWeight: 500, position: "relative" }}>{label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Sub-tabs: Plans | Exercises | History | PRs */}
        <motion.div variants={itemVariants} style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "var(--bg-card)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          marginLeft: -16, marginRight: -16,
          paddingLeft: 16, paddingRight: 16,
          borderRadius: `${radius.lg}px ${radius.lg}px 0 0`,
          ...(isMobile ? {} : { position: "sticky", top: 130 }),
        }}>
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid var(--border)` }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = selectedTab === id;
              return (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setSelectedTab(id); if (id === "exercises") setShowSearch(true); }}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    padding: "14px 6px",
                    cursor: "pointer",
                    color: active ? "var(--text)" : "var(--text-muted)",
                    fontWeight: active ? 600 : 400,
                    fontSize: 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    position: "relative",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  aria-label={label}
                  aria-selected={active}
                  role="tab"
                >
                  <Icon size={13} />
                  <span>{label}</span>
                  {active && (
                    <motion.div
                      layoutId="workout-tab-indicator"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{
                        position: "absolute", bottom: 0,
                        left: 8, right: 8,
                        height: 2.5,
                        background: "var(--accent)",
                        borderRadius: 1.5,
                        boxShadow: `0 0 8px rgba(59,130,246,0.376)`,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Plans Tab */}
          {selectedTab === "plans" && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ paddingTop: 14 }}>
                {WORKOUT_PLANS.map((p, idx) => {
                  const muscles = getMusclesForPlan(p);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Card
                        glowColor={p.color}
                        style={{
                          marginBottom: 12, padding: 0, overflow: "hidden",
                          borderLeft: `3px solid ${p.color}`,
                        }}
                      >
                        <div style={{
                          position: "absolute", top: 0, right: 0,
                          width: 140, height: 140,
                          background: `radial-gradient(circle, ${p.color}08, transparent 70%)`,
                          borderRadius: "50%",
                          transform: "translate(40px, -40px)",
                          pointerEvents: "none",
                        }} />
                        <div style={{ padding: "18px", position: "relative" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <h3 style={{ color: "var(--text)", fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>{p.name}</h3>
                                <Badge label={p.level} color={LEVEL_COLOR()[p.level]} />
                              </div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                                <Tag label={`${p.days} days/wk`} color={p.color} />
                                <Tag label={p.duration} color={"var(--text-muted)"} />
                                <Tag label={p.goal} color={p.color} />
                              </div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                                {muscles.map(m => (
                                  <span key={m} style={{
                                    fontSize: 10, padding: "3px 10px",
                                    background: `${muscleColor[m] || "var(--accent)"}12`,
                                    borderRadius: radius.full,
                                    color: muscleColor[m] || "var(--accent)",
                                    border: `1px solid ${muscleColor[m] || "var(--accent)"}25`,
                                    fontWeight: 500,
                                  }}>
                                    {MUSCLE_EMOJI[m] || ""} {m}
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {p.exercises.slice(0, 4).map(eid => {
                                  const ex = EXERCISES.find(e => e.id === eid);
                                  return ex ? (
                                    <span key={eid} style={{
                                      fontSize: 10, padding: "3px 8px",
                                      background: "var(--bg-card3)",
                                      borderRadius: radius.sm,
                                      color: "var(--text-muted)",
                                      border: `1px solid var(--border)`,
                                      fontWeight: 450,
                                    }}>
                                      {ex.name} {ex.sets}×{ex.reps}
                                    </span>
                                  ) : null;
                                })}
                                {p.exercises.length > 4 && (
                                  <span style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", fontWeight: 450 }}>
                                    +{p.exercises.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05, boxShadow: shadow.softGlow(p.color) }}
                              whileTap={{ scale: 0.93 }}
                              onClick={() => setActiveWorkout(p)}
                              style={{
                                padding: "10px 14px",
                                background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
                                color: "#fff",
                                border: "none",
                                borderRadius: radius.md,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexShrink: 0,
                                boxShadow: shadow.softGlow(p.color),
                              }}
                            >
                              <Play size={12} fill="#fff" /> Start
                            </motion.button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tip of the day */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: `linear-gradient(135deg, var(--accent)08, var(--purple)08)`,
                  border: `1px solid var(--border2)`,
                  borderRadius: radius.md,
                  padding: isMobile ? "14px" : "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginTop: 4,
                }}
              >
                <div style={{
                  width: 32, height: 32,
                  background: "rgba(59,130,246,0.1)",
                  borderRadius: radius.sm,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Sparkles size={15} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>Tip of the day</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {TIPS[Math.floor(Math.random() * TIPS.length)].text}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Exercises Tab with Search & Filter */}
          {selectedTab === "exercises" && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ paddingTop: 14 }}>
                {/* Search Bar */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  style={{ marginBottom: 12 }}
                >
                  <div style={{
                    display: "flex", alignItems: "center",
                    background: "var(--bg-card2)",
                    border: `1px solid var(--border2)`,
                    borderRadius: radius.md,
                    padding: "0 14px",
                    transition: "border-color 0.2s",
                  }}>
                    <Search size={15} color={"var(--text-muted)"} />
                    <label htmlFor="exercise-search" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Search exercises</label>
                    <input
                      id="exercise-search"
                      name="exerciseSearch"
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search exercises or muscle groups..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        padding: "14px 10px",
                        color: "var(--text)",
                        fontSize: 13,
                        outline: "none",
                        fontWeight: 450,
                      }}
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery("")}
                        style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
                      >
                        <X size={14} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Muscle Filter Chips */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                  {MUSCLES.map(m => {
                    const active = filterMuscle === m;
                    const mc = muscleColor[m] || "var(--accent)";
                    return (
                      <motion.button
                        key={m}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setFilterMuscle(m)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: radius.full,
                          border: `1px solid ${active ? mc : "var(--border2)"}`,
                          background: active ? `${mc}18` : "transparent",
                          color: active ? mc : "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: active ? 600 : 450,
                          transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        {m !== "All" && (MUSCLE_EMOJI[m] || "")} {m}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Exercise Cards */}
                {filteredEx.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      textAlign: "center", padding: "48px 20px",
                      background: "var(--bg-card2)", borderRadius: radius.lg,
                      border: `1px solid var(--border)`,
                    }}
                  >
                    <div style={{
                      width: 48, height: 48,
                      background: "var(--bg-card3)", borderRadius: radius.full,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px",
                    }}>
                      <Search size={22} color={"var(--text-dim)"} />
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>No exercises found</div>
                    <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>Try a different muscle group or search term</div>
                    <Button onClick={() => { setFilterMuscle("All"); setSearchQuery(""); }}>Clear Filters</Button>
                  </motion.div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
                    {filteredEx.map((ex, i) => (
                      <motion.div
                        key={ex.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }}
                        whileHover={{ y: -4, boxShadow: shadow.elevated }}
                        style={cardStyle()}
                        onClick={() => onShowDetail?.(ex)}
                      >
                        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                          <ExerciseImage
                            exercise={ex}
                            width={56}
                            height={56}
                            style={{ flexShrink: 0, border: `1px solid var(--border)`, borderRadius: radius.sm }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {ex.name}
                              </h3>
                              <Badge label={ex.level} color={LEVEL_COLOR()[ex.level]} />
                            </div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              <Tag label={ex.muscle} color={muscleColor[ex.muscle] || "var(--accent)"} />
                              <Tag label={`${ex.sets}×${ex.reps}`} color={"var(--blue)"} />
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "var(--text-muted)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{
                              width: 18, height: 18,
                              background: "rgba(239,68,68,0.08)",
                              borderRadius: 4,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Flame size={10} color="var(--red)" />
                            </div>
                            ~{ex.cal} cal
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{
                              width: 18, height: 18,
                              background: "rgba(245,158,11,0.08)",
                              borderRadius: 4,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Clock size={10} color="var(--yellow)" />
                            </div>
                            {ex.rest}s rest
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
                            {Array.from({ length: DIFFICULTY_STARS[ex.level] || 1 }).map((_, si) => (
                              <Star key={si} size={9} color={LEVEL_COLOR()[ex.level]} fill={LEVEL_COLOR()[ex.level]} />
                            ))}
                          </span>
                        </div>
                        <p style={{
                          color: "var(--text-muted)", fontSize: 11, margin: "10px 0 0",
                          lineHeight: 1.5, display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {ex.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {selectedTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ paddingTop: 14 }}>
                {recentWorkouts.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "48px 20px",
                    background: "var(--bg-card2)", borderRadius: radius.lg,
                    border: `1px solid var(--border)`,
                  }}>
                    <div style={{
                      width: 48, height: 48,
                      background: "var(--bg-card3)", borderRadius: radius.full,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 12px",
                    }}>
                      <Dumbbell size={22} color={"var(--text-dim)"} />
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>No workout history yet</div>
                    <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 20, lineHeight: 1.5 }}>Complete your first workout to see it here</div>
                    <Button onClick={() => setActiveWorkout(suggestedPlan)}><Play size={14} /> Start Workout</Button>
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: 17, top: 8, bottom: 8,
                      width: 2, background: `linear-gradient(180deg, var(--accent)20, var(--purple)10)`,
                      borderRadius: radius.full,
                    }} />
                    {recentWorkouts.map(([date, exercises], idx) => {
                      const totalVol = exercises.reduce((s, w) => s + (w.vol || 0), 0);
                      const totalSets = exercises.reduce((s, w) => s + (w.sets || 0), 0);
                      const isExpanded = expandedHistory === date;
                      return (
                        <motion.div
                          key={date}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          style={{ marginBottom: 12, position: "relative", paddingLeft: 40 }}
                        >
                          <div style={{
                            position: "absolute", left: 9, top: 18,
                            width: 18, height: 18,
                            background: `linear-gradient(135deg, var(--accent), var(--purple))`,
                            borderRadius: "50%",
                            border: `3px solid var(--bg)`,
                            boxShadow: `0 0 0 2px rgba(59,130,246,0.2)`,
                          }} />
                          <motion.div
                            whileHover={{ y: -2 }}
                            onClick={() => setExpandedHistory(isExpanded ? null : date)}
                            style={{
                              background: "var(--bg-card2)",
                              borderRadius: radius.md,
                              border: `1px solid var(--border)`,
                              padding: isExpanded ? "14px" : "14px",
                              cursor: "pointer",
                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{date}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
                                  {exercises.length} exercises · {totalSets} sets · {totalVol.toLocaleString()} kg
                                </div>
                              </div>
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  width: 28, height: 28,
                                  background: "var(--bg-card3)",
                                  borderRadius: radius.sm,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                              >
                                <ChevronRight size={14} color={"var(--text-muted)"} />
                              </motion.div>
                            </div>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <div style={{ borderTop: `1px solid var(--border)`, paddingTop: 12, marginTop: 12 }}>
                                    {exercises.map((w, wi) => (
                                      <div key={`wh-${w.uid || `${w.date}-${w.name}-${wi}`}`} style={{
                                        display: "flex", justifyContent: "space-between",
                                        padding: "8px 0",
                                        borderBottom: wi < exercises.length - 1 ? `1px solid var(--border)` : "none",
                                        fontSize: 12,
                                      }}>
                                        <span style={{ color: "var(--text)", fontWeight: 450 }}>{w.name}</span>
                                        <span style={{ color: "var(--text-muted)" }}>
                                          {w.sets}×{w.reps} @ {w.weight}kg · <span style={{ color: "var(--accent)", fontWeight: 500 }}>{w.vol} kg</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PRs Tab */}
          {selectedTab === "prs" && (
            <motion.div
              key="prs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ paddingTop: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 14, marginBottom: 14 }}>
                  {/* Personal Records */}
                  <Card gradient={`linear-gradient(135deg, var(--yellow), var(--orange))`} style={{ padding: "18px" }}>
                    <h3 style={{
                      color: "var(--text)", fontSize: 14, fontWeight: 600, margin: "0 0 14px",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <Crown size={16} color={"var(--yellow)"} /> Personal Records
                    </h3>
                    {bestPRs.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5 }}>
                        <Star size={20} color={"var(--text-dim)"} style={{ margin: "0 auto 8px" }} />
                        No PRs yet. Start lifting!
                      </div>
                    ) : (
                      bestPRs.map((pr, i) => (
                        <motion.div
                          key={`pr-${pr.name}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 0",
                            borderBottom: i < bestPRs.length - 1 ? `1px solid var(--border)` : "none",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 30, height: 30,
                              background: `rgba(245,158,11,0.1)`,
                              borderRadius: radius.sm,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <Crown size={13} color={"var(--yellow)"} fill={"var(--yellow)"} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{pr.name}</div>
                              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{pr.date}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--yellow)", letterSpacing: "-0.01em" }}>{pr.weight} kg</div>
                            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{pr.reps} reps · {pr.sets} sets</div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </Card>

                  {/* Achievements */}
                  <Card gradient={`linear-gradient(135deg, var(--purple), var(--indigo))`} style={{ padding: "18px" }}>
                    <h3 style={{
                      color: "var(--text)", fontSize: 14, fontWeight: 600, margin: "0 0 14px",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <Sparkles size={16} color={"var(--purple)"} /> Achievements
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                      {[
                        { icon: <Flame size={15} />, name: "7-Day Streak", desc: "7 consecutive days", unlocked: streak >= 7, color: "var(--accent)" },
                        { icon: <Dumbbell size={15} />, name: "First Workout", desc: "Complete 1 workout", unlocked: true, color: "var(--blue)" },
                        { icon: <Target size={15} />, name: "Volume 10k", desc: "10k kg total volume", unlocked: weeklyVolume >= 10000, color: "var(--green)" },
                        { icon: <Zap size={15} />, name: "PR Setter", desc: "Set a personal record", unlocked: bestPRs.length > 0, color: "var(--yellow)" },
                        { icon: <Trophy size={15} />, name: "Level 5", desc: "Reach level 5", unlocked: level >= 5, color: "var(--purple)" },
                        { icon: <Calendar size={15} />, name: "Consistent", desc: "5 workouts this week", unlocked: weeklyWorkouts >= 5, color: "var(--orange)" },
                      ].map((a, i) => (
                        <motion.div
                          key={a.name}
                          whileHover={a.unlocked ? { scale: 1.04, y: -2 } : {}}
                          style={{
                            background: a.unlocked ? `${a.color}10` : "var(--bg-card3)",
                            border: `1px solid ${a.unlocked ? `${a.color}25` : "var(--border)"}`,
                            borderRadius: radius.md,
                            padding: "10px 8px",
                            textAlign: "center",
                            opacity: a.unlocked ? 1 : 0.45,
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <motion.div
                            animate={a.unlocked ? { scale: [1, 1.12, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: i * 1.5 }}
                            style={{
                              width: 32, height: 32,
                              background: `${a.color}12`,
                              borderRadius: radius.sm,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              margin: "0 auto 6px",
                            }}
                          >
                            {a.icon}
                          </motion.div>
                          <div style={{ fontSize: 10, color: a.unlocked ? a.color : "var(--text-muted)", fontWeight: 600, lineHeight: 1.3 }}>
                            {a.name}
                          </div>
                          <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{a.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* AI Coach Suggestions */}
                <Card variant="glass" style={{ padding: "18px" }}>
                  <h3 style={{
                    color: "var(--text)", fontSize: 14, fontWeight: 600, margin: "0 0 14px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <Brain size={16} color={"var(--purple)"} /> AI Coach Suggestions
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 10 }}>
                    {[
                      { icon: Zap, label: "Recommended Warmup", desc: "5 min dynamic stretching before lifting", color: "var(--orange)" },
                      { icon: Timer, label: "Rest Optimization", desc: "60-90s for hypertrophy, 3min for strength", color: "var(--blue)" },
                      { icon: Heart, label: "Recovery Tip", desc: "Sleep 7-9h for optimal muscle recovery", color: "var(--accent)" },
                      { icon: Apple, label: "Post-Workout Fuel", desc: "20-40g protein within 2 hours", color: "var(--green)" },
                      { icon: Droplets, label: "Hydration", desc: "Drink 500ml during your workout", color: "var(--teal)" },
                      { icon: Dumbbell, label: "Progressive Overload", desc: "Add 2.5kg or 1 rep each session", color: "var(--purple)" },
                    ].map(({ icon: Icon, label, desc, color }) => (
                      <motion.div
                        key={label}
                        whileHover={{ y: -3, borderColor: color + "40", boxShadow: shadow.softGlow(color) }}
                        style={{
                          background: "var(--bg-card2)",
                          borderRadius: radius.md,
                          padding: "12px",
                          border: `1px solid var(--border)`,
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        <div style={{
                          width: 28, height: 28,
                          background: `${color}12`,
                          borderRadius: radius.sm,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          marginBottom: 8,
                        }}>
                          <Icon size={14} color={color} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{label}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5 }}>{desc}</div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
