import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap, Flame, Dumbbell, Apple, Droplets, Brain, Target, TrendingUp,
  Sparkles, Sun, Moon, ChevronRight, Activity, Trophy, Wand2, ChefHat
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import { theme, radius, shadow, transition } from "../styles/designSystem";
import { WORKOUT_PLANS } from "../data/fitness";
import AnimatedCounter from "./AnimatedCounter";
import ProgressRing from "./ProgressRing";
import StreakCalendar from "./StreakCalendar";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";
import { useNutritionStore } from "../stores/nutritionStore";

const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
const GreetingIcon = hour < 12 ? Sun : hour < 18 ? Sun : Moon;

const containerVariants = {
  animate: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you need to convince.",
  "Strength does not come from the body. It comes from the will.",
  "Don't limit your challenges. Challenge your limits.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Success starts with self-discipline.",
];

const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Post-Workout", "Snack"];

const TooltipContent = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: theme.bgCard, border: `1px solid ${theme.border2}`,
      borderRadius: radius.md, padding: "8px 12px", fontSize: 12,
      boxShadow: shadow.elevated,
    }}>
      <div style={{ color: theme.textMuted, marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={p.dataKey || i} style={{ color: p.color || theme.text, fontWeight: 500 }}>
          {p.value} {p.name}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({
  profile, totalCal, totalProt, totalCarbs, totalFat,
  calGoal, protGoal,
  setActiveWorkout, setShowMealModal, setShowWorkoutGenerator, setShowMealPlanner, onNavigate,
  level, streak,
}) {
  const workoutSessions = useWorkoutStore(s => s.workoutSessions);
  const xp = useUserStore(s => s.xp);
  const meals = useNutritionStore(s => s.meals);
  const water = useNutritionStore(s => s.water);
  const setWater = useNutritionStore(s => s.setWater);
  const bodyStats = useUserStore(s => s.bodyStats);

  const mealCalories = useMemo(() => {
    return MEAL_TIMES.map(t => ({
      day: t,
      value: meals.filter(m => m.mealTime === t).reduce((s, m) => s + m.cal, 0),
    })).filter(d => d.value > 0);
  }, [meals]);

  const mealProtein = useMemo(() => {
    return MEAL_TIMES.map(t => ({
      day: t,
      value: meals.filter(m => m.mealTime === t).reduce((s, m) => s + m.protein, 0),
    })).filter(d => d.value > 0);
  }, [meals]);

  const weeklyVolume = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => ({ day: d, value: 0 }));
    workoutSessions.forEach(ws => {
      const d = new Date(ws.completedAt);
      const idx = (d.getDay() + 6) % 7;
      if (d >= weekStart) days[idx].value += (ws.totalVolume || 0);
    });
    return days;
  }, [workoutSessions]);

  const bodyWeight = useMemo(() => {
    return (bodyStats || []).map(b => ({ day: b.date, value: b.weight }));
  }, [bodyStats]);
  const xpPct = ((xp % 500) / 500) * 100;

  const workoutDates = useMemo(() => {
    return workoutSessions.map(ws => new Date(ws.completedAt || ws.date));
  }, [workoutSessions]);

  const nutritionDates = useMemo(() => {
    const dates = meals.map(m => m.date ? new Date(m.date) : new Date());
    return [...new Set(dates.map(d => d.toDateString()))].map(d => new Date(d));
  }, [meals]);

  const weeklySessions = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return workoutSessions.filter(ws => new Date(ws.completedAt || ws.date) >= weekStart).length;
  }, [workoutSessions]);

  const actionCards = [
    { icon: Dumbbell, label: "Start Workout", color: theme.red, desc: "Begin a session", action: () => setActiveWorkout(WORKOUT_PLANS[0]) },
    { icon: Apple, label: "Log Meal", color: theme.green, desc: "Track nutrition", action: () => setShowMealModal(true) },
    { icon: Brain, label: "AI Coach", color: theme.purple, desc: "Ask anything", action: () => onNavigate?.("ai") },
    { icon: Wand2, label: "AI Workout Plan", color: theme.pink, desc: "Generate a plan", action: () => setShowWorkoutGenerator?.(true) },
    { icon: ChefHat, label: "AI Meal Plan", color: theme.teal, desc: "Plan your meals", action: () => setShowMealPlanner?.(true) },
    { icon: TrendingUp, label: "Progress", color: theme.blue, desc: "View stats", action: () => onNavigate?.("progress") },
    { icon: Droplets, label: "Add Water", color: theme.teal, desc: "Stay hydrated", action: () => setWater(w => Math.min(8, w + 1)) },
    { icon: Zap, label: `Level ${level+1}`, color: theme.yellow, desc: `${500 - (xp % 500)} XP to go`, action: () => {} },
  ];

  const recent = useMemo(() => {
    const items = [];
    workoutSessions.forEach(ws => items.push({ uid: `workout-${ws.id}`, type: "workout", text: `${ws.workoutName} · ${ws.totalVolume.toLocaleString()}kg volume`, time: ws.date, icon: Dumbbell, color: theme.red }));
    items.push({ uid: "xp", type: "xp", text: "+15 XP logged", time: "Today", icon: Zap, color: theme.yellow });
    items.push({ uid: "meal", type: "meal", text: `${Math.round(totalCal)} kcal eaten`, time: "Today", icon: Apple, color: theme.green });
    items.push({ uid: "water", type: "water", text: `${water}/8 glasses`, time: "Today", icon: Droplets, color: theme.teal });
    return items.slice(-5).reverse();
  }, [workoutSessions, totalCal, water]);

  const achievements = [
    { icon: "🔥", label: `${streak}-Day Streak`, color: theme.red, unlocked: true },
    { icon: "💪", label: "First Workout", color: theme.blue, unlocked: true },
    { icon: "🥗", label: "Nutrition Pro", color: theme.green, unlocked: true },
    { icon: "⚡", label: "PR Broken", color: theme.yellow, unlocked: true },
    { icon: "🏃", label: "Cardio King", color: theme.purple, unlocked: false },
    { icon: "🎯", label: "Level 5", color: theme.orange, unlocked: level >= 5 },
  ];

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate">
      {/* Hero Section */}
      <motion.div variants={itemVariants} style={{
        background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
        border: `1px solid ${theme.border}`,
        borderRadius: radius.xl,
        padding: "24px",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 180, height: 180,
          borderRadius: "50%", background: `${theme.red}08`, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40, width: 140, height: 140,
          borderRadius: "50%", background: `${theme.blue}06`, pointerEvents: "none",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <GreetingIcon size={18} color={theme.yellow} />
              <span style={{ color: theme.textMuted, fontSize: 13 }}>{greeting}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: theme.text, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              {profile.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: theme.yellow, display: "flex", alignItems: "center", gap: 4 }}>
                <Zap size={14} /> Level {level}
              </span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>·</span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>{profile.goal}</span>
              <span style={{ fontSize: 12, color: theme.textMuted }}>·</span>
              <span style={{ fontSize: 12, color: theme.red, display: "flex", alignItems: "center", gap: 4 }}>
                <Flame size={14} /> {streak} day streak
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>Next level</div>
            <div style={{ position: "relative", width: 120, height: 4, background: theme.border, borderRadius: radius.full, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.yellow}, ${theme.orange})`,
                  borderRadius: radius.full,
                  boxShadow: `0 0 8px ${theme.yellow}40`,
                }}
              />
            </div>
            <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>
              {500 - (xp % 500)} XP to Level {level + 1}
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 14, padding: "10px 14px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: radius.md,
          fontSize: 12,
          color: theme.textMuted,
          fontStyle: "italic",
          borderLeft: `2px solid ${theme.red}40`,
          lineHeight: 1.5,
        }}>
          "{quote}"
        </div>
      </motion.div>

      {/* Progress Rings */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginBottom: 16,
      }}>
        {[
          { value: totalCal, max: calGoal, label: "Calories", color: theme.red, gradient: `url(#calGrad)`, icon: Flame },
          { value: totalProt, max: protGoal, label: "Protein", color: theme.blue, gradient: `url(#protGrad)`, icon: TrendingUp },
          { value: water, max: 8, label: "Water", color: theme.teal, gradient: `url(#waterGrad)`, icon: Droplets },
          { value: xp % 500, max: 500, label: "XP", color: theme.yellow, gradient: `url(#xpGrad)`, icon: Zap },
        ].map((ring) => (
          <div key={ring.label} style={{
            background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.xl,
            padding: "16px 12px",
            display: "flex",
            justifyContent: "center",
          }}>
            <ProgressRing
              value={ring.value}
              max={ring.max}
              size={110}
              strokeWidth={8}
              color={ring.color}
              label={ring.label}
              sub={ring.value === ring.max ? "Goal met!" : `${Math.round(ring.value)}/${ring.max}`}
              icon={ring.icon}
            />
          </div>
        ))}
      </motion.div>

      {/* Quick Macros Row */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10,
        marginBottom: 16,
      }}>
        {[
          { label: "Calories", value: totalCal, max: calGoal, color: theme.red },
          { label: "Protein", value: totalProt, max: protGoal, color: theme.blue },
          { label: "Carbs", value: totalCarbs, max: 300, color: theme.yellow },
          { label: "Fat", value: totalFat, max: 80, color: theme.green },
        ].map((m) => {
          const pct = Math.min(100, (m.value / m.max) * 100);
          return (
            <div key={m.label} style={{
              background: theme.bgCard2,
              border: `1px solid ${theme.border}`,
              borderRadius: radius.lg,
              padding: "12px 14px",
            }}>
              <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>
                <AnimatedCounter value={m.value} /> <span style={{ fontSize: 12, color: theme.textDim }}>/ {m.max}</span>
              </div>
              <div style={{ height: 3, background: theme.border, borderRadius: radius.full, marginTop: 8, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${m.color}, ${m.color}dd)`,
                    borderRadius: radius.full,
                  }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 12,
        marginBottom: 16,
      }}>
        {/* Calories by Meal Area Chart */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.xl,
          padding: "18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Calories by Meal</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>per meal time</div>
            </div>
            <Flame size={16} color={theme.red} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={mealCalories.length > 0 ? mealCalories : [{ day: "No data", value: 0 }]}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.red} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={theme.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: theme.textDim, fontSize: 10 }} />
              <YAxis hide />
              <Tooltip content={<TooltipContent />} />
              <Area type="monotone" dataKey="value" stroke={theme.red} strokeWidth={2} fill="url(#calGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Protein by Meal Bar Chart */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.xl,
          padding: "18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Protein by Meal</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>grams per meal</div>
            </div>
            <TrendingUp size={16} color={theme.blue} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={mealProtein.length > 0 ? mealProtein : [{ day: "No data", value: 0 }]}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: theme.textDim, fontSize: 10 }} />
              <YAxis hide />
              <Tooltip content={<TooltipContent />} />
              <Bar dataKey="value" fill={theme.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Workout Volume Bar Chart */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.xl,
          padding: "18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Workout Volume</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>total kg per day</div>
            </div>
            <Dumbbell size={16} color={theme.green} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={weeklyVolume}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: theme.textDim, fontSize: 10 }} />
              <YAxis hide />
              <Tooltip content={<TooltipContent />} />
              <Bar dataKey="value" fill={theme.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Body Weight Line Chart */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.xl,
          padding: "18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Body Weight</div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>kg trend</div>
            </div>
            <TrendingUp size={16} color={theme.purple} />
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={bodyWeight}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: theme.textDim, fontSize: 10 }} />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip content={<TooltipContent />} />
              <Line type="monotone" dataKey="value" stroke={theme.purple} strokeWidth={2} dot={{ fill: theme.purple, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions + Today Overview */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12,
        marginBottom: 16,
      }}>
        {/* Quick Actions */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 10px" }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {actionCards.map((a) => (
              <motion.div
                key={a.label}
                whileHover={{ y: -3, boxShadow: shadow.elevated }}
                whileTap={{ scale: 0.96 }}
                onClick={a.action}
                style={{
                  background: theme.bgCard,
                  border: `1px solid ${theme.border}`,
                  borderRadius: radius.lg,
                  padding: "14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  transition: transition.normal,
                }}
              >
                <div style={{
                  width: 32, height: 32,
                  background: `${a.color}15`,
                  borderRadius: radius.md,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <a.icon size={16} color={a.color} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.text }}>{a.label}</div>
                <div style={{ fontSize: 10, color: theme.textMuted }}>{a.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Today Overview */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 10px" }}>Today's Overview</h3>
          <div style={{
            background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.xl,
            padding: "18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={16} color={theme.red} />
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Daily Goal</span>
              </div>
              <span style={{ fontSize: 11, color: theme.textMuted }}>{profile.goal}</span>
            </div>
            {[
              { label: "Calories", value: totalCal, max: calGoal, color: theme.red },
              { label: "Protein", value: totalProt, max: protGoal, color: theme.blue },
              { label: "Water", value: water, max: 8, color: theme.teal },
            ].map((item) => {
              const pct = Math.min(100, (item.value / item.max) * 100);
              const rem = Math.max(0, item.max - item.value);
              return (
                <div key={item.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: theme.textMuted }}>{item.label}</span>
                    <span style={{ color: item.color }}>
                      <AnimatedCounter value={Math.round(item.value)} /> / {item.max}
                    </span>
                  </div>
                  <div style={{ height: 4, background: theme.border, borderRadius: radius.full, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                        borderRadius: radius.full,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: theme.textDim, marginTop: 2 }}>
                    {rem > 0 ? `${rem} remaining` : "Goal met!"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Achievements + Recent Activity */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12,
        marginBottom: 16,
      }}>
        {/* Achievements */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <Trophy size={14} color={theme.yellow} /> Achievements
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {achievements.map((a) => (
              <motion.div
                key={a.label}
                whileHover={a.unlocked ? { y: -2 } : {}}
                style={{
                  background: a.unlocked ? `${a.color}10` : theme.bgCard2,
                  border: `1px solid ${a.unlocked ? `${a.color}25` : theme.border}`,
                  borderRadius: radius.lg,
                  padding: "12px",
                  textAlign: "center",
                  opacity: a.unlocked ? 1 : 0.35,
                }}
              >
                <motion.div
                  initial={a.unlocked ? { scale: 0, rotate: -20 } : {}}
                  animate={a.unlocked ? { scale: 1, rotate: 0 } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{ fontSize: 24, marginBottom: 4 }}
                >
                  {a.icon}
                </motion.div>
                <div style={{ fontSize: 10, color: a.unlocked ? a.color : theme.textMuted, fontWeight: 500, lineHeight: 1.3 }}>
                  {a.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={14} color={theme.blue} /> Recent Activity
          </h3>
          <div style={{
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.xl,
            padding: "16px",
          }}>
            {recent.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: theme.textDim, fontSize: 12 }}>
                No activity yet. Start your first workout!
              </div>
            ) : (
              recent.map((item, i) => (
                <motion.div
                  key={item.uid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0",
                    borderBottom: i < recent.length - 1 ? `1px solid ${theme.border}` : "none",
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    background: `${item.color}15`,
                    borderRadius: radius.md,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <item.icon size={13} color={item.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: theme.text }}>{item.text}</div>
                    <div style={{ fontSize: 10, color: theme.textDim }}>{item.time}</div>
                  </div>
                  <ChevronRight size={12} color={theme.textDim} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Streak Calendar */}
      <motion.div variants={itemVariants} style={{ marginBottom: 16 }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.xl,
          padding: "18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: radius.md,
                background: `${theme.orange}15`, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 14 }}>📅</span>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Activity Calendar</h3>
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>
              <span style={{ color: theme.green, fontWeight: 600 }}>{weeklySessions}</span> workouts this week
            </div>
          </div>
          <StreakCalendar
            workoutDates={workoutDates}
            nutritionDates={nutritionDates}
            streak={streak}
          />
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div variants={itemVariants}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.xl,
          padding: "18px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Brain size={16} color={theme.purple} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>AI Insights</h3>
            </div>
            <Sparkles size={14} color={theme.yellow} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { icon: TrendingUp, text: `You need ${Math.max(0, protGoal - totalProt)}g more protein today.`, color: theme.blue },
              { icon: Droplets, text: `Drink ${Math.max(0, 8 - water)} more glasses of water.`, color: theme.teal },
              { icon: Dumbbell, text: totalCal < calGoal ? `You have ${calGoal - totalCal} kcal remaining.` : "You've hit your calorie goal!", color: theme.orange },
              { icon: Zap, text: `${500 - (xp % 500)} XP until Level ${level + 1}. Keep going!`, color: theme.yellow },
            ].map((insight, i) => {
              const Icon = insight.icon;
              return (
                <div key={insight.text} style={{
                  background: `${insight.color}08`,
                  border: `1px solid ${insight.color}15`,
                  borderRadius: radius.md,
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <div style={{
                    width: 28, height: 28,
                    background: `${insight.color}15`,
                    borderRadius: radius.md,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={14} color={insight.color} />
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5 }}>{insight.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="calGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.red} />
            <stop offset="100%" stopColor={theme.orange} />
          </linearGradient>
          <linearGradient id="protGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.blue} />
            <stop offset="100%" stopColor={theme.purple} />
          </linearGradient>
          <linearGradient id="waterGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.teal} />
            <stop offset="100%" stopColor={theme.blue} />
          </linearGradient>
          <linearGradient id="xpGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.yellow} />
            <stop offset="100%" stopColor={theme.orange} />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}


