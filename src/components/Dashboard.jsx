import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap, Flame, Dumbbell, Apple, Droplets, Brain, Target, TrendingUp,
  Sparkles, Sun, Moon, ChevronRight, Activity, Trophy, Wand2, ChefHat, Camera,
  Calendar, Heart, Salad
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { radius, shadow } from "../styles/designSystem";
import { WORKOUT_PLANS } from "../data/fitness";
import AnimatedCounter from "./AnimatedCounter";
import ProgressRing from "./ProgressRing";
import StreakCalendar from "./StreakCalendar";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";
import { useNutritionStore } from "../stores/nutritionStore";
import { useIsMobile } from "../hooks/useMediaQuery";

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
      background: "var(--bg-card)", border: `1px solid var(--border2)`,
      borderRadius: radius.md, padding: "8px 12px", fontSize: 12,
      boxShadow: shadow.elevated,
    }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={p.dataKey || i} style={{ color: p.color || "var(--text)", fontWeight: 500 }}>
          {p.value} {p.name}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({
  profile, totalCal, totalProt, totalCarbs, totalFat,
  calGoal, protGoal,
  setActiveWorkout, setShowMealModal, setShowWorkoutGenerator, setShowMealPlanner, setShowFoodScanner, onNavigate,
  level, streak,
}) {
  const workoutSessions = useWorkoutStore(s => s.workoutSessions);
  const xp = useUserStore(s => s.xp);
  const meals = useNutritionStore(s => s.meals);
  const water = useNutritionStore(s => s.water);
  const setWater = useNutritionStore(s => s.setWater);
  const bodyStats = useUserStore(s => s.bodyStats);
  const isMobile = useIsMobile();

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
    { icon: Dumbbell, label: "Start Workout", color: "var(--accent)", desc: "Begin a session", action: () => setActiveWorkout(WORKOUT_PLANS[0]) },
    { icon: Apple, label: "Log Meal", color: "var(--teal)", desc: "Track nutrition", action: () => setShowMealModal(true) },
    { icon: Brain, label: "AI Coach", color: "var(--highlight)", desc: "Ask anything", action: () => onNavigate?.("ai") },
    { icon: Wand2, label: "AI Workout Plan", color: "var(--accent-light)", desc: "Generate a plan", action: () => setShowWorkoutGenerator?.(true) },
    { icon: ChefHat, label: "AI Meal Plan", color: "var(--teal)", desc: "Plan your meals", action: () => setShowMealPlanner?.(true) },
    { icon: TrendingUp, label: "Progress", color: "var(--blue)", desc: "View stats", action: () => onNavigate?.("progress") },
    { icon: Droplets, label: "Add Water", color: "var(--teal)", desc: "Stay hydrated", action: () => setWater(w => Math.min(8, w + 1)) },
    { icon: Camera, label: "Scan Food", color: "var(--cyan)", desc: "AI food scanner", action: () => setShowFoodScanner?.(true) },
    { icon: Zap, label: `Level ${level+1}`, color: "var(--highlight)", desc: `${500 - (xp % 500)} XP to go`, action: () => {} },
  ];

  const recent = useMemo(() => {
    const items = [];
    workoutSessions.forEach(ws => items.push({ uid: `workout-${ws.id}`, type: "workout", text: `${ws.workoutName} · ${ws.totalVolume.toLocaleString()}kg volume`, time: ws.date, icon: Dumbbell, color: "var(--accent)" }));
    items.push({ uid: "xp", type: "xp", text: "+15 XP logged", time: "Today", icon: Zap, color: "var(--yellow)" });
    items.push({ uid: "meal", type: "meal", text: `${Math.round(totalCal)} kcal eaten`, time: "Today", icon: Apple, color: "var(--green)" });
    items.push({ uid: "water", type: "water", text: `${water}/8 glasses`, time: "Today", icon: Droplets, color: "var(--teal)" });
    return items.slice(-5).reverse();
  }, [workoutSessions, totalCal, water]);

  const achievements = [
    { icon: <Flame size={16} />, label: `${streak}-Day Streak`, color: "var(--accent)", unlocked: true },
    { icon: <Dumbbell size={16} />, label: "First Workout", color: "var(--blue)", unlocked: true },
    { icon: <Salad size={16} />, label: "Nutrition Pro", color: "var(--green)", unlocked: true },
    { icon: <Zap size={16} />, label: "PR Broken", color: "var(--yellow)", unlocked: true },
    { icon: <Heart size={16} />, label: "Cardio King", color: "var(--purple)", unlocked: false },
    { icon: <Target size={16} />, label: "Level 5", color: "var(--orange)", unlocked: level >= 5 },
  ];

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate">
      {/* Premium Hero Section */}
      <motion.div variants={itemVariants} style={{
        background: `linear-gradient(135deg, var(--gradient-card1) 0%, var(--bg-card) 50%, var(--bg-card2) 100%)`,
        border: `1px solid var(--border)`,
        borderRadius: radius["2xl"],
        padding: isMobile ? "20px 18px" : "36px 32px",
        marginBottom: isMobile ? 20 : 32,
        position: "relative",
        overflow: "hidden",
        boxShadow: shadow.floating,
      }}>
        <div style={{
          position: "absolute", top: -100, right: -60, width: 300, height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--ambient) 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "pulseGlow 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -40, width: 200, height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, var(--ambient) 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "pulseGlow 8s ease-in-out infinite reverse",
        }} />
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
          background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.12), transparent)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: "20%", right: "20%", height: 1,
          background: `linear-gradient(90deg, transparent, rgba(34,211,238,0.06), transparent)`,
          pointerEvents: "none",
        }} />

        {/* Two-Column Layout */}
        <div style={{ display: "flex", gap: isMobile ? 16 : 40, alignItems: "stretch", position: "relative", zIndex: 1, flexDirection: isMobile ? "column" : "row" }}>
          {/* Left Column — Content */}
          <div style={{ flex: 1.4, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: radius.full,
                background: `linear-gradient(135deg, rgba(96,165,250,0.125), rgba(59,130,246,0.063))`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <GreetingIcon size={15} color={"var(--accent-light)"} />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{greeting}</span>
            </div>
            <h1 style={{
              fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "var(--text)", margin: "0 0 4px",
              letterSpacing: "-0.03em", lineHeight: 1.15,
            }}>
              {profile.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{
                fontSize: 11, color: "var(--accent-light)", display: "flex", alignItems: "center", gap: 4,
                background: `rgba(59,130,246,0.063)`, padding: "3px 10px", borderRadius: radius.full,
                border: `1px solid rgba(59,130,246,0.082)`,
              }}>
                <Zap size={12} /> Level {level}
              </div>
              <span style={{
                fontSize: 11, color: "var(--text-secondary)", fontWeight: 500,
                background: `rgba(226,232,240,0.376)`, padding: "3px 10px", borderRadius: radius.full,
                border: `1px solid var(--border)`,
              }}>{profile.goal}</span>
              <div style={{
                fontSize: 11, color: "var(--orange)", display: "flex", alignItems: "center", gap: 4,
                background: `rgba(249,115,22,0.031)`, padding: "3px 10px", borderRadius: radius.full,
                border: `1px solid rgba(249,115,22,0.082)`,
              }}>
                <Flame size={12} /> {streak} day streak
              </div>
            </div>

            {/* Quote */}
            <div style={{
              padding: isMobile ? "10px 14px" : "12px 16px",
              background: `linear-gradient(135deg, var(--ambient) 0%, rgba(255,255,255,0.02) 100%)`,
              borderRadius: radius.lg,
              fontSize: isMobile ? 11 : 12,
              color: "var(--text-secondary)",
              fontStyle: "italic",
              borderLeft: `3px solid rgba(59,130,246,0.314)`,
              lineHeight: 1.6,
              marginBottom: 0,
            }}>
              "{quote}"
            </div>
          </div>

          {/* Right Column — Premium AI Visualization */}
          {!isMobile && (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", minHeight: 180,
          }}>
            {/* Animated AI Orb */}
            <motion.div
              animate={{
                scale: [1, 1.04, 1],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 160, height: 160, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, var(--accent-light) 0%, var(--accent) 40%, var(--highlight) 70%, transparent 100%)`,
                boxShadow: `0 0 60px rgba(59,130,246,0.188), 0 0 120px rgba(59,130,246,0.082), 0 0 200px rgba(34,211,238,0.031)`,
                position: "relative", flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", inset: -20, borderRadius: "50%",
                  background: `radial-gradient(circle at 65% 35%, rgba(59,130,246,0.08) 0%, transparent 70%)`,
                }}
              />
              <div style={{
                position: "absolute", inset: "25%",
                borderRadius: "50%",
                background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4) 0%, transparent 70%)`,
              }} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: -8, borderRadius: "50%",
                  border: `1px solid rgba(59,130,246,0.12)`,
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute", inset: -16, borderRadius: "50%",
                  border: `1px solid rgba(34,211,238,0.08)`,
                }}
              />
              <div style={{
                position: "absolute", bottom: "12%", left: "15%",
                width: 4, height: 4, borderRadius: "50%",
                background: "var(--highlight)", boxShadow: `0 0 8px var(--highlight)`,
              }} />
              <div style={{
                position: "absolute", top: "20%", right: "18%",
                width: 3, height: 3, borderRadius: "50%",
                background: "var(--accent-light)", boxShadow: `0 0 6px var(--accent-light)`,
              }} />
            </motion.div>
          </div>
          )}
        </div>

        {/* Bottom glow bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.063), transparent)`,
          pointerEvents: "none",
        }} />
      </motion.div>

      {/* Premium Progress Rings */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(140px, 1fr))",
        gap: isMobile ? 10 : 14,
        marginBottom: isMobile ? 20 : 28,
      }}>
        {[
          { value: totalCal, max: calGoal, label: "Calories", color: "var(--accent)", icon: Flame },
          { value: totalProt, max: protGoal, label: "Protein", color: "var(--accent)", icon: TrendingUp },
          { value: water, max: 8, label: "Water", color: "var(--teal)", icon: Droplets },
          { value: xp % 500, max: 500, label: "XP", color: "var(--highlight)", icon: Zap },
        ].map((ring) => (
          <motion.div key={ring.label} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
            background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
            border: `1px solid var(--border)`,
            borderRadius: radius.xl,
            padding: isMobile ? "12px 8px" : "16px 12px",
            display: "flex",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, ${ring.color}20, transparent)`,
            }} />
            <ProgressRing
              value={ring.value}
              max={ring.max}
              size={isMobile ? 80 : 110}
              strokeWidth={isMobile ? 6 : 8}
              color={ring.color}
              label={ring.label}
              sub={ring.value === ring.max ? "Goal met!" : `${Math.round(ring.value)}/${ring.max}`}
              icon={ring.icon}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Premium Macro Cards */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(160px, 1fr))",
        gap: isMobile ? 10 : 12,
        marginBottom: isMobile ? 20 : 28,
      }}>
        {[
          { label: "Calories", value: totalCal, max: calGoal, color: "var(--accent)", gradient: "var(--accent-gradient)" },
          { label: "Protein", value: totalProt, max: protGoal, color: "var(--accent)", gradient: "var(--accent-gradient)" },
          { label: "Carbs", value: totalCarbs, max: 300, color: "var(--yellow)", gradient: "var(--yellow-gradient)" },
          { label: "Fat", value: totalFat, max: 80, color: "var(--green)", gradient: "var(--green-gradient)" },
        ].map((m) => {
          const pct = Math.min(100, (m.value / Math.max(1, m.max)) * 100) || 0;
          return (
            <motion.div key={m.label} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
              background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
              border: `1px solid var(--border)`,
              borderRadius: radius.xl,
              padding: isMobile ? "12px 14px" : "14px 16px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Top edge glow */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${m.color}30, transparent)`,
                pointerEvents: "none",
              }} />
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.03em", fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
                <AnimatedCounter value={m.value} /> <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500 }}>/ {m.max}</span>
              </div>
              <div style={{ height: 5, background: "var(--track)", borderRadius: radius.full, marginTop: 10, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${m.color}, ${m.color}dd)`,
                    borderRadius: radius.full,
                    boxShadow: `0 0 6px ${m.color}30`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Premium Charts Section */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
        gap: isMobile ? 10 : 14,
        marginBottom: isMobile ? 20 : 28,
      }}>
        {/* Calories by Meal Area Chart */}
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
          background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
          border: `1px solid var(--border)`,
          borderRadius: radius.xl,
          padding: isMobile ? "16px" : "24px",
          boxShadow: shadow.floating,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, var(--ambient), transparent)`,
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "var(--text)" }}>Calories by Meal</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>per meal time</div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: radius.lg,
                background: "var(--ambient)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Flame size={14} color={"var(--accent)"} />
              </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 120 : 150}>
            <AreaChart data={mealCalories.length > 0 ? mealCalories : [{ day: "No data", value: 0 }]}>
              <defs>
                <linearGradient id="calGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={"var(--accent)"} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={"var(--accent)"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-dim)", fontSize: isMobile ? 9 : 10 }} />
              <YAxis hide />
              <Tooltip content={<TooltipContent />} />
              <Area type="monotone" dataKey="value" stroke={"var(--accent)"} strokeWidth={2} fill="url(#calGrad2)" dot={false} activeDot={{ r: 4, stroke: "var(--accent)", strokeWidth: 2, fill: "#fff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Protein by Meal Bar Chart */}
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
          background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
          border: `1px solid var(--border)`,
          borderRadius: radius.xl,
          padding: isMobile ? "16px" : "24px",
          boxShadow: shadow.floating,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.125), transparent)`,
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "var(--text)" }}>Protein by Meal</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>grams per meal</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: radius.lg,
              background: `rgba(59,130,246,0.071)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <TrendingUp size={14} color={"var(--accent)"} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 120 : 150}>
            <BarChart data={mealProtein.length > 0 ? mealProtein : [{ day: "No data", value: 0 }]}>
              <defs>
                <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={"var(--accent)"} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={"var(--highlight)"} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-dim)", fontSize: isMobile ? 9 : 10 }} />
              <YAxis hide />
              <Tooltip content={<TooltipContent />} />
              <Bar dataKey="value" fill="url(#proteinGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Workout Volume Bar Chart */}
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
          background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
          border: `1px solid var(--border)`,
          borderRadius: radius.xl,
          padding: isMobile ? "16px" : "24px",
          boxShadow: shadow.floating,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, rgba(16,185,129,0.125), transparent)`,
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "var(--text)" }}>Workout Volume</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>total kg per day</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: radius.lg,
              background: `rgba(16,185,129,0.071)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Dumbbell size={14} color={"var(--green)"} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 120 : 150}>
            <BarChart data={weeklyVolume}>
              <defs>
                <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={"var(--green)"} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={"var(--teal)"} stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-dim)", fontSize: isMobile ? 9 : 10 }} />
              <YAxis hide />
              <Tooltip content={<TooltipContent />} />
              <Bar dataKey="value" fill="url(#volumeGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </motion.div>

      {/* Quick Actions + Today Overview */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 14,
        marginBottom: 28,
      }}>
        {/* Premium Quick Actions */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 12px", letterSpacing: "-0.01em" }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {actionCards.map((a) => (
              <motion.div
                key={a.label}
                whileHover={{
                  y: -5,
                  boxShadow: `0 4px 12px ${a.color}15, 0 8px 24px ${a.color}08, 0 0 0 1px ${a.color}20`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={a.action}
                style={{
                  background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
                  border: `1px solid var(--border2)`,
                  borderRadius: "var(--radius-card)",
                  padding: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at 0% 0%, ${a.color}06, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, transparent, ${a.color}20, transparent)`,
                }} />
                <div style={{
                  width: 36, height: 36,
                  background: `linear-gradient(135deg, ${a.color}15, ${a.color}05)`,
                  borderRadius: radius.lg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${a.color}12`,
                }}>
                  <a.icon size={17} color={a.color} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>{a.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Today Overview */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>Today's Overview</h3>
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
            background: "var(--bg-card)",
            border: `1px solid var(--border2)`,
            borderRadius: "var(--radius-card)",
            padding: isMobile ? "16px" : "24px",
            boxShadow: "var(--shadow-card)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, var(--ambient), transparent)`,
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: radius.lg,
                  background: "var(--ambient)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Target size={14} color={"var(--accent)"} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Daily Goal</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--ambient)", padding: "2px 10px", borderRadius: radius.full }}>{profile.goal}</span>
            </div>
            {[
              { label: "Calories", value: totalCal, max: calGoal, color: "var(--accent)" },
              { label: "Protein", value: totalProt, max: protGoal, color: "var(--accent)" },
              { label: "Water", value: water, max: 8, color: "var(--teal)" },
            ].map((item, i) => {
              const pct = Math.min(100, (item.value / Math.max(1, item.max)) * 100) || 0;
              const rem = Math.max(0, item.max - item.value);
              return (
                <div key={item.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 600 }}>
                      <AnimatedCounter value={Math.round(item.value)} /> / {item.max}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--track)", borderRadius: radius.full, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                        borderRadius: radius.full,
                        boxShadow: `0 0 8px ${item.color}40`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>
                    {rem > 0 ? `${rem} remaining` : "Goal met!"}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* Achievements + Recent Activity */}
      <motion.div variants={itemVariants} style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
        gap: isMobile ? 10 : 14,
        marginBottom: 28,
      }}>
        {/* Achievements */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6, letterSpacing: "-0.01em" }}>
            <Trophy size={14} color={"var(--yellow)"} /> Achievements
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {achievements.map((a) => (
              <motion.div
                key={a.label}
                whileHover={a.unlocked ? { y: -3, borderColor: `${a.color}40` } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  background: a.unlocked ? `linear-gradient(180deg, ${a.color}08, transparent)` : "var(--bg-card2)",
                  border: `1px solid ${a.unlocked ? `${a.color}25` : "var(--border)"}`,
                  borderRadius: radius.xl,
                  padding: "12px",
                  textAlign: "center",
                  opacity: a.unlocked ? 1 : 0.3,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {a.unlocked && <div style={{
                  position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
                  background: `linear-gradient(90deg, transparent, ${a.color}25, transparent)`,
                }} />}
                <motion.div
                  initial={a.unlocked ? { scale: 0, rotate: -20 } : {}}
                  animate={a.unlocked ? { scale: 1, rotate: 0 } : {}}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                  style={{ fontSize: 24, marginBottom: 4 }}
                >
                  {a.icon}
                </motion.div>
                <div style={{ fontSize: 10, color: a.unlocked ? a.color : "var(--text-muted)", fontWeight: 500, lineHeight: 1.3 }}>
                  {a.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6, letterSpacing: "-0.01em" }}>
            <Activity size={14} color={"var(--accent)"} /> Recent Activity
          </h3>
          <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
            background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
            border: `1px solid var(--border)`,
            borderRadius: radius.xl,
            padding: "16px",
            boxShadow: shadow.floating,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.082), transparent)`,
            }} />
            {recent.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)", fontSize: 12 }}>
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
                    borderBottom: i < recent.length - 1 ? `1px solid var(--border)` : "none",
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    background: `${item.color}12`,
                    borderRadius: radius.lg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <item.icon size={13} color={item.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--text)" }}>{item.text}</div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{item.time}</div>
                  </div>
                  <ChevronRight size={12} color={"var(--text-dim)"} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Streak Calendar */}
      <motion.div variants={itemVariants} style={{ marginBottom: 28 }}>
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
          background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
          border: `1px solid var(--border)`,
          borderRadius: radius.xl,
          boxShadow: shadow.floating,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.082), transparent)`,
          }} />
          <div style={{ padding: isMobile ? "16px" : "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: radius.md,
                background: `rgba(249,115,22,0.082)`, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <Calendar size={14} />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>Activity Calendar</h3>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              <span style={{ color: "var(--green)", fontWeight: 600 }}>{weeklySessions}</span> workouts this week
            </div>
          </div>
          <StreakCalendar
            workoutDates={workoutDates}
            nutritionDates={nutritionDates}
            streak={streak}
          />
        </div>
      </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ marginBottom: 28 }}>
        <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{
          background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
          border: `1px solid var(--border)`,
          borderRadius: radius.xl,
          padding: isMobile ? "16px" : "24px",
          boxShadow: shadow.floating,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, rgba(59,130,246,0.125), transparent)`,
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: radius.lg,
                background: `rgba(59,130,246,0.071)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Brain size={14} color={"var(--accent)"} />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>AI Insights</h3>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: radius.lg,
              background: `rgba(34,211,238,0.063)`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles size={14} color={"var(--highlight)"} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: isMobile ? 8 : 10 }}>
            {[
              { icon: TrendingUp, text: `You need ${Math.max(0, protGoal - totalProt)}g more protein today.`, color: "var(--accent)" },
              { icon: Droplets, text: `Drink ${Math.max(0, 8 - water)} more glasses of water.`, color: "var(--teal)" },
              { icon: Dumbbell, text: totalCal < calGoal ? `You have ${calGoal - totalCal} kcal remaining.` : "You've hit your calorie goal!", color: "var(--orange)" },
              { icon: Zap, text: `${500 - (xp % 500)} XP until Level ${level + 1}. Keep going!`, color: "var(--yellow)" },
            ].map((insight, i) => {
              const Icon = insight.icon;
              return (
                <div key={insight.text} style={{
                  background: `linear-gradient(135deg, ${insight.color}06, transparent)`,
                  border: `1px solid ${insight.color}12`,
                  borderRadius: radius.lg,
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 1,
                    background: `linear-gradient(90deg, transparent, ${insight.color}20, transparent)`,
                  }} />
                  <div style={{
                    width: 28, height: 28,
                    background: `${insight.color}12`,
                    borderRadius: radius.lg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={14} color={insight.color} />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{insight.text}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="calGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={"var(--accent)"} />
            <stop offset="100%" stopColor={"var(--orange)"} />
          </linearGradient>
          <linearGradient id="protGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={"var(--accent)"} />
            <stop offset="100%" stopColor={"var(--accent-light)"} />
          </linearGradient>
          <linearGradient id="waterGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={"var(--teal)"} />
            <stop offset="100%" stopColor={"var(--blue)"} />
          </linearGradient>
          <linearGradient id="xpGradR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={"var(--accent)"} />
            <stop offset="100%" stopColor={"var(--highlight)"} />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}




