import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Dumbbell, Flame, Trophy, Clock, Search, X,
  Play, ChevronRight, Sparkles, Star, Crown, Activity, RotateCcw,
   Calendar, Brain, Apple, Droplets, Heart, Footprints, Target,
} from "lucide-react";
import {  radius, shadow, transition, muscleColor, cardStyle } from "../styles/designSystem";
import { EXERCISES, WORKOUT_PLANS, MUSCLES } from "../data/fitness";
import ExerciseImage from "./ExerciseImage";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { Tag, Badge } from "./ui/Tag";
import ProgressRing from "./ProgressRing";
import { useWorkoutStore, selectWeeklyWorkouts, selectWeeklyVolume, selectWeeklyMinutes, selectWeeklyCalories, selectWeeklyXP } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";
import { useIsMobile } from "../hooks/useMediaQuery";

const containerVariants = { animate: { transition: { staggerChildren: 0.04 } } };
const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
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
  "Warm up for 5-10 minutes before each workout to reduce injury risk.",
  "Stay hydrated — drink water throughout your workout, not just after.",
  "Focus on form over weight. Proper technique prevents injuries.",
  "Rest 48-72 hours between training the same muscle group.",
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

  const h2s = { color: "var(--text)", fontSize: 20, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" };
  const h3s = { color: "var(--text)", fontSize: 15, fontWeight: 500, margin: "0 0 10px" };
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14, marginBottom: 14 };

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate">
      {/* Hero - Today's Workout */}
      <motion.div variants={itemVariants}>
        <Card variant="glass" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
          <div style={{
            padding: "24px",
            background: `linear-gradient(135deg, ${suggestedPlan.color}15, transparent 60%)`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                  {today}'s Workout
                </div>
                <h2 style={{ color: "var(--text)", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                  {suggestedPlan.name}
                </h2>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 48, height: 48,
                  background: `${suggestedPlan.color}20`,
                  borderRadius: radius.md,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${suggestedPlan.color}30`,
                }}
              >
                <Dumbbell size={24} color={suggestedPlan.color} />
              </motion.div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
               <Badge label={suggestedPlan.level} color={LEVEL_COLOR()[suggestedPlan.level]} />
              <Badge label={suggestedPlan.duration} color={"var(--text-muted)"} />
              <Badge label={suggestedPlan.goal} color={suggestedPlan.color} />
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Flame size={13} color={"var(--accent)"} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  ~{suggestedPlan.exercises.reduce((s, eid) => {
                    const ex = EXERCISES.find(e => e.id === eid);
                    return s + (ex?.cal || 0);
                  }, 0)} cal
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Dumbbell size={13} color={"var(--blue)"} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {suggestedPlan.exercises.length} exercises
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={13} color={"var(--purple)"} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {getMusclesForPlan(suggestedPlan).join(", ")}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveWorkout(suggestedPlan)}
                style={{
                  padding: "12px 24px",
                  background: `linear-gradient(135deg, ${suggestedPlan.color}, ${suggestedPlan.color}dd)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.md,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: shadow.glow(suggestedPlan.color),
                }}
              >
                <Play size={16} /> Start Workout
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, borderColor: "var(--text-muted)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate("ai")}
                style={{
                  padding: "12px 18px",
                  background: "transparent",
                  border: `1px solid var(--border2)`,
                  color: "var(--text-muted)",
                  borderRadius: radius.md,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Brain size={15} color={"var(--purple)"} /> AI Plan
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit,minmax(120px,1fr))", gap: isMobile ? 8 : 10, margin: isMobile ? "12px 0" : "16px 0" }}>
        {[
          { label: "This Week", value: weeklyWorkouts || 0, suffix: " workouts", icon: Calendar, color: "var(--blue)" },
          { label: "Volume", value: weeklyVolume || 0, suffix: " kg", icon: Dumbbell, color: "var(--accent)" },
          { label: "Time", value: fmtDuration(weeklyMinutes * 60 || 0), icon: Clock, color: "var(--yellow)" },
          { label: "XP Earned", value: weeklyXp || 0, suffix: " XP", icon: Zap, color: "var(--purple)" },
        ].map(({ label, value, suffix, icon: Icon, color }) => (
          <motion.div
            key={label}
            whileHover={{ y: -2 }}
            style={{
              background: "var(--bg-card2)", borderRadius: radius.md,
              padding: isMobile ? "10px" : "14px", border: `1px solid var(--border)`,
              textAlign: "center",
            }}
          >
            <Icon size={isMobile ? 14 : 16} color={color} style={{ margin: "0 auto 6px" }} />
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: "var(--text)" }}>{value}{suffix || ""}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8, marginBottom: 20 }}>
        {QUICK_ACTIONS().map(({ id, label, icon: Icon, color, gradient }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
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
              padding: "14px",
              cursor: "pointer",
              textAlign: "center",
              transition: transition.fast,
            }}
          >
            <Icon size={20} color={color} style={{ margin: "0 auto 6px" }} />
            <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{label}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* Tabs: Plans | Exercises | History */}
      <motion.div variants={itemVariants} style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: `1px solid var(--border)` }}>
        {[
          { id: "plans", label: "Plans", icon: Dumbbell },
          { id: "exercises", label: "Exercises", icon: Search },
          { id: "history", label: "History", icon: Clock },
          { id: "prs", label: "PRs", icon: Trophy },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setSelectedTab(id); if (id === "exercises") setShowSearch(true); }}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${selectedTab === id ? "var(--accent)" : "transparent"}`,
              padding: "12px 8px",
              cursor: "pointer",
              color: selectedTab === id ? "var(--text)" : "var(--text-muted)",
              fontWeight: selectedTab === id ? 600 : 400,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: transition.fast,
            }}
          >
            <Icon size={14} />
            {label}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Plans Tab */}
        {selectedTab === "plans" && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {WORKOUT_PLANS.map((p, idx) => {
              const muscles = getMusclesForPlan(p);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card style={{ marginBottom: 10, borderLeft: `3px solid ${p.color}`, position: "relative", overflow: "hidden" }}>
                    <div style={{
                      position: "absolute", top: 0, right: 0,
                      width: 120, height: 120,
                      background: `radial-gradient(circle, ${p.color}08, transparent 70%)`,
                      borderRadius: "50%",
                      transform: "translate(30px, -30px)",
                    }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, position: "relative" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <h3 style={{ ...h3s, margin: 0, fontSize: 16 }}>{p.name}</h3>
                          <Badge label={p.level} color={LEVEL_COLOR()[p.level]} />
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                          <Tag label={`${p.days} days/wk`} color={p.color} />
                          <Tag label={p.duration} color={"var(--text-muted)"} />
                          <Tag label={p.goal} color={p.color} />
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                          {muscles.map(m => (
                            <span key={m} style={{
                              fontSize: 10, padding: "2px 8px",
                              background: `${muscleColor[m] || "var(--accent)"}15`,
                              borderRadius: radius.full,
                              color: muscleColor[m] || "var(--accent)",
                              border: `1px solid ${muscleColor[m] || "var(--accent)"}30`,
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
                                fontSize: 11, padding: "3px 8px",
                                background: "var(--bg-card3)", borderRadius: radius.sm,
                                color: "var(--text-muted)", border: `1px solid var(--border)`,
                              }}>
                                {ex.name} {ex.sets}×{ex.reps}
                              </span>
                            ) : null;
                          })}
                          {p.exercises.length > 4 && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                              +{p.exercises.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveWorkout(p)}
                        style={{
                          padding: "10px 16px",
                          background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
                          color: "#fff",
                          border: "none",
                          borderRadius: radius.md,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexShrink: 0,
                          boxShadow: shadow.glow(p.color),
                        }}
                      >
                        <Play size={14} /> Start
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Exercises Tab with Search & Filter */}
        {selectedTab === "exercises" && (
          <motion.div
            key="exercises"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Search Bar */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              style={{ marginBottom: 12 }}
            >
              <div style={{
                display: "flex", alignItems: "center",
                background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                borderRadius: radius.md, padding: "0 12px",
              }}>
                <Search size={16} color={"var(--text-muted)"} />
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
                    padding: "12px 10px",
                    color: "var(--text)",
                    fontSize: 13,
                    outline: "none",
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
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
              {MUSCLES.map(m => {
                const active = filterMuscle === m;
                const mc = muscleColor[m] || "var(--accent)";
                return (
                  <motion.button
                    key={m}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setFilterMuscle(m)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: radius.full,
                      border: `1px solid ${active ? mc : "var(--border2)"}`,
                      background: active ? `${mc}18` : "transparent",
                      color: active ? mc : "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      transition: transition.fast,
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
                  textAlign: "center", padding: "40px 20px",
                  background: "var(--bg-card2)", borderRadius: radius.lg,
                  border: `1px solid var(--border)`,
                }}
              >
                <Search size={32} color={"var(--text-dim)"} style={{ margin: "0 auto 12px" }} />
                <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>No exercises found</div>
                <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 16 }}>Try a different muscle group or search term</div>
                <Button onClick={() => { setFilterMuscle("All"); setSearchQuery(""); }}>Clear Filters</Button>
              </motion.div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
                {filteredEx.map((ex, i) => (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ y: -4, boxShadow: shadow.elevated }}
                    style={{
                      ...cardStyle(),
                      cursor: "pointer",
                      padding: "16px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  onClick={() => onShowDetail?.(ex)}
                  >
                    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <ExerciseImage
                        exercise={ex}
                        width={60}
                        height={60}
                        style={{ flexShrink: 0, border: `1px solid var(--border)` }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Flame size={11} /> ~{ex.cal} cal
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={11} /> {ex.rest}s rest
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
                        {Array.from({ length: DIFFICULTY_STARS[ex.level] || 1 }).map((_, si) => (
                          <Star key={si} size={10} color={LEVEL_COLOR()[ex.level]} fill={LEVEL_COLOR()[ex.level]} />
                        ))}
                      </span>
                    </div>
                    <p style={{
                      color: "var(--text-muted)", fontSize: 11, margin: "8px 0 0",
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
          </motion.div>
        )}

        {/* History Tab */}
        {selectedTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {recentWorkouts.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                background: "var(--bg-card2)", borderRadius: radius.lg,
                border: `1px solid var(--border)`,
              }}>
                <Dumbbell size={32} color={"var(--text-dim)"} style={{ margin: "0 auto 12px" }} />
                <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 8 }}>No workout history yet</div>
                <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: 16 }}>Complete your first workout to see it here</div>
                <Button onClick={() => setActiveWorkout(suggestedPlan)}><Play size={14} /> Start Workout</Button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {/* Timeline line */}
                <div style={{
                  position: "absolute", left: 15, top: 8, bottom: 8,
                  width: 2, background: "var(--border2)", borderRadius: radius.full,
                }} />
                {recentWorkouts.map(([date, exercises], idx) => {
                  const totalVol = exercises.reduce((s, w) => s + (w.vol || 0), 0);
                  const totalSets = exercises.reduce((s, w) => s + (w.sets || 0), 0);
                  const isExpanded = expandedHistory === date;
                  return (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ marginBottom: 12, position: "relative", paddingLeft: 36 }}
                    >
                      {/* Timeline dot */}
                      <div style={{
                        position: "absolute", left: 7, top: 16,
                        width: 18, height: 18,
                        background: "var(--accent)", borderRadius: "50%",
                        border: `3px solid var(--bg)`,
                        boxShadow: `0 0 0 2px rgba(59,130,246,0.251)`,
                      }} />
                      <motion.div
                        whileHover={{ y: -1 }}
                        onClick={() => setExpandedHistory(isExpanded ? null : date)}
                        style={{
                          background: "var(--bg-card2)", borderRadius: radius.md,
                          border: `1px solid var(--border)`,
                          padding: "14px", cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isExpanded ? 10 : 0 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{date}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                              {exercises.length} exercises · {totalSets} sets · {totalVol.toLocaleString()} kg volume
                            </div>
                          </div>
                          <ChevronRight size={16} color={"var(--text-muted)"}
                            style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: transition.fast }} />
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: "hidden" }}
                            >
                              <div style={{ borderTop: `1px solid var(--border)`, paddingTop: 10, marginTop: 10 }}>
                                {exercises.map((w, wi) => (
                                  <div key={`wh-${w.uid || `${w.date}-${w.name}-${wi}`}`} style={{
                                    display: "flex", justifyContent: "space-between",
                                    padding: "6px 0", fontSize: 12,
                                    borderBottom: wi < exercises.length - 1 ? `1px solid var(--border)` : "none",
                                  }}>
                                    <span style={{ color: "var(--text)" }}>{w.name}</span>
                                    <span style={{ color: "var(--text-muted)" }}>
                                      {w.sets}×{w.reps} @ {w.weight}kg · <span style={{ color: "var(--accent)" }}>{w.vol} kg</span>
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
          </motion.div>
        )}

        {/* PRs Tab */}
        {selectedTab === "prs" && (
          <motion.div
            key="prs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div style={grid2}>
              <Card>
                <h3 style={h3s}><Trophy size={16} color={"var(--yellow)"} style={{ verticalAlign: "middle", marginRight: 6 }} />Personal Records</h3>
                {bestPRs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: 13 }}>
                    <Star size={24} color={"var(--text-dim)"} style={{ margin: "0 auto 8px" }} />
                    No PRs yet. Start lifting!
                  </div>
                ) : (
                  bestPRs.map((pr, i) => (
                    <motion.div
                      key={`pr-${pr.name}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 0", borderBottom: i < bestPRs.length - 1 ? `1px solid var(--border)` : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          style={{
                            width: 32, height: 32,
                            background: `rgba(245,158,11,0.082)`,
                            borderRadius: radius.sm,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Crown size={15} color={"var(--yellow)"} fill={"var(--yellow)"} />
                        </motion.div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{pr.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{pr.date}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--yellow)" }}>{pr.weight} kg</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{pr.reps} reps · {pr.sets} sets</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </Card>

              <Card>
                <h3 style={h3s}><Sparkles size={16} color={"var(--purple)"} style={{ verticalAlign: "middle", marginRight: 6 }} />Achievements</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                  {[
                    { icon: <Flame size={16} />, name: "7-Day Streak", desc: "7 consecutive days", unlocked: streak >= 7, color: "var(--accent)" },
                    { icon: <Dumbbell size={16} />, name: "First Workout", desc: "Complete 1 workout", unlocked: true, color: "var(--blue)" },
                    { icon: <Target size={16} />, name: "Volume 10k", desc: "10k kg total volume", unlocked: weeklyVolume >= 10000, color: "var(--green)" },
                    { icon: <Zap size={16} />, name: "PR Setter", desc: "Set a personal record", unlocked: bestPRs.length > 0, color: "var(--yellow)" },
                    { icon: <Trophy size={16} />, name: "Level 5", desc: "Reach level 5", unlocked: level >= 5, color: "var(--purple)" },
                    { icon: <Calendar size={16} />, name: "Consistent", desc: "5 workouts this week", unlocked: weeklyWorkouts >= 5, color: "var(--orange)" },
                  ].map((a, i) => (
                    <motion.div
                      key={a.name}
                      whileHover={a.unlocked ? { scale: 1.03 } : {}}
                      style={{
                        background: a.unlocked ? `${a.color}12` : "var(--bg-card3)",
                        border: `1px solid ${a.unlocked ? `${a.color}30` : "var(--border)"}`,
                        borderRadius: radius.md,
                        padding: "10px 8px",
                        textAlign: "center",
                        opacity: a.unlocked ? 1 : 0.4,
                      }}
                    >
                      <motion.div
                        animate={a.unlocked ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: i * 2 }}
                        style={{ fontSize: 22, marginBottom: 4 }}
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

            <Card>
              <h3 style={{ ...h3s, display: "flex", alignItems: "center", gap: 6 }}>
                <Brain size={16} color={"var(--purple)"} /> AI Coach Suggestions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
                {[
                  { icon: Zap, label: "Recommended Warmup", desc: "5 min dynamic stretching before lifting", color: "var(--orange)" },
                  { icon: Clock, label: "Rest Optimization", desc: "60-90s for hypertrophy, 3min for strength", color: "var(--blue)" },
                  { icon: Heart, label: "Recovery Tip", desc: "Sleep 7-9h for optimal muscle recovery", color: "var(--accent)" },
                  { icon: Apple, label: "Post-Workout Fuel", desc: "20-40g protein within 2 hours", color: "var(--green)" },
                  { icon: Droplets, label: "Hydration", desc: "Drink 500ml during your workout", color: "var(--teal)" },
                  { icon: Dumbbell, label: "Progressive Overload", desc: "Add 2.5kg or 1 rep each session", color: "var(--purple)" },
                ].map(({ icon: Icon, label, desc, color }) => (
                  <motion.div
                    key={label}
                    whileHover={{ y: -2, borderColor: color + "40" }}
                    style={{
                      background: "var(--bg-card2)", borderRadius: radius.md,
                      padding: "12px", border: `1px solid var(--border)`,
                    }}
                  >
                    <Icon size={16} color={color} style={{ marginBottom: 6 }} />
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{desc}</div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


