import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple, Flame, Droplets, Plus, X, ChevronDown, Zap,
  Activity, Utensils, Heart, Brain, Sparkles, Salad,
  Timer, TrendingUp, Award, CheckCircle, Target,
  Sunrise, Sun, Moon, Cookie, Dumbbell, Leaf,
  AlertTriangle, Check,
} from "lucide-react";
import {  radius, shadow, transition } from "../styles/designSystem";
import Card from "./ui/Card";
import Button from "./ui/Button";
import ProgressRing from "./ProgressRing";
import AnimatedCounter from "./AnimatedCounter";
import WaterTracker from "./WaterTracker";
import EmptyState from "./ui/EmptyState";
import { FOOD_DB } from "../data/fitness";
import { useNutritionStore } from "../stores/nutritionStore";
import { useUserStore } from "../stores/userStore";

const MEAL_TIMES = ["Breakfast", "Lunch", "Post-Workout", "Dinner", "Snack"];
const MEAL_ICONS = { Breakfast: Sunrise, Lunch: Sun, "Post-Workout": Zap, Dinner: Moon, Snack: Cookie };
const MEAL_COLORS = () => ({ Breakfast: "var(--yellow)", Lunch: "var(--blue)", "Post-Workout": "var(--purple)", Dinner: "var(--orange)", Snack: "var(--teal)" });

const containerVariants = { animate: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { initial: { y: 12 }, animate: { y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } } };
const ringVariants = { initial: { scale: 0.8 }, animate: { scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } } };

const CAL_GOAL_DEFAULTS = { "Fat Loss": 2000, "Muscle Gain": 2800 };
const MEAL_EMOJI_MAP = Object.fromEntries(FOOD_DB.map(f => [f.name, f.emoji]));

function getFoodEmoji(name) {
  return MEAL_EMOJI_MAP[name] || <Utensils size={14} />;
}

function formatCal(v) {
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return Math.round(v).toString();
}

function MacroRing({ value, goal, label, color, icon: Icon, size = 88 }) {
  const safeGoal = goal > 0 ? goal : 1;
  const pct = Math.min(100, Math.max(0, (value / safeGoal) * 100));
  return (
    <motion.div variants={ringVariants} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <ProgressRing value={value} max={goal} size={size} strokeWidth={7} color={color} icon={Icon}
        label="" sub="" gradient={`url(#${label.toLowerCase()}Grad)`} />
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{label}</div>
      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
        <AnimatedCounter value={Math.round(value)} /> / {Math.round(goal)}
      </div>
    </motion.div>
  );
}

function FoodCard({ meal, onDelete, index }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = useCallback(() => {
    setDeleting(true);
    setTimeout(() => onDelete(meal), 200);
  }, [meal, onDelete]);

  const calPct = Math.min(100, ((+meal.cal || 0) / 500) * 100);
  const proteinPct = Math.min(100, ((+meal.protein || 0) / 30) * 100);
  const carbsPct = Math.min(100, ((+meal.carbs || 0) / 50) * 100);
  const fatPct = Math.min(100, ((+meal.fat || 0) / 20) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12, height: 0 }}
      animate={{ opacity: deleting ? 0 : 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: 12, height: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px",
        background: "var(--bg-card2)",
        borderRadius: radius.md,
        border: `1px solid var(--border)`,
        marginBottom: 6,
        transition: "opacity 0.2s",
        opacity: deleting ? 0 : 1,
      }}>
        <div style={{
          width: 34, height: 34, flexShrink: 0,
          background: `var(--bg-card3)`,
          borderRadius: radius.sm,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {getFoodEmoji(meal.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {meal.name}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
            {[
              ["Cal", meal.cal.accent, "kcal"],
              ["Prot", meal.protein.blue, "g"],
              ["Carbs", meal.carbs.yellow, "g"],
              ["Fat", meal.fat.green, "g"],
            ].map(([l, v, c, u]) => (
              <span key={l + u} style={{ fontSize: 10, color: c, fontWeight: 500 }}>
                {Math.round(v || 0)}{u}
              </span>
            ))}
          </div>
          {/* Macro ratio mini bar */}
          <div style={{ display: "flex", gap: 2, marginTop: 4, height: 3 }}>
            <div style={{ flex: calPct, background: "var(--accent)", borderRadius: "2px 0 0 2px", opacity: 0.5 }} />
            <div style={{ flex: proteinPct, background: "var(--blue)", opacity: 0.5 }} />
            <div style={{ flex: carbsPct, background: "var(--yellow)", opacity: 0.5 }} />
            <div style={{ flex: fatPct, background: "var(--green)", borderRadius: "0 2px 2px 0", opacity: 0.5 }} />
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.15, color: "var(--red)" }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          style={{
            background: "transparent", border: "none",
            color: "var(--text-dim)", cursor: "pointer", padding: 4, display: "flex", flexShrink: 0,
          }}
          aria-label="Delete food"
        >
          <X size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function MealSection({ time, items, secCal, secProt, secCarbs, secFat, totalCal, onOpenModal, onDeleteMeal }) {
  const [expanded, setExpanded] = useState(true);
  const isEmpty = items.length === 0;
  const color = MEAL_COLORS()[time] || "var(--accent)";
  const pct = totalCal > 0 ? Math.round((secCal / totalCal) * 100) : 0;
  const MealIcon = MEAL_ICONS[time];

  return (
    <motion.div variants={itemVariants} style={{ marginBottom: 10 }}>
      <div style={{
        background: "var(--bg-card)",
        border: `1px solid var(--border)`,
        borderRadius: radius.lg,
        overflow: "hidden",
        borderLeft: `3px solid ${color}`,
      }}>
        <motion.div
          onClick={() => setExpanded(p => !p)}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20, display: "inline-flex", alignItems: "center" }}>{MealIcon ? <MealIcon size={20} /> : null}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                {time}
                {!isEmpty && (
                  <span style={{
                    fontSize: 10, fontWeight: 500, color: "var(--text-muted)",
                    background: "var(--bg-card3)", padding: "1px 7px", borderRadius: radius.full,
                  }}>
                    {items.length}
                  </span>
                )}
              </div>
              {!isEmpty && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                  {Math.round(secCal)} kcal · P{Math.round(secProt)}g C{Math.round(secCarbs)}g F{Math.round(secFat)}g
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isEmpty && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {pct}%
              </div>
            )}
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} color={"var(--text-muted)"} />
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "0 16px 12px", borderTop: `1px solid var(--border)` }}>
                {isEmpty ? (
                  <EmptyState
                    title={`No ${time} yet`}
                    description="Tap to add a meal"
                    compact
                    action={
                      <Button size="sm" variant="accent" onClick={(e) => { e.stopPropagation(); onOpenModal(); }}>
                        <Plus size={12} /> Add to {time}
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <div style={{ paddingTop: 10 }}>
                      <AnimatePresence mode="popLayout">
                        {items.map((meal, mi) => (
                          <FoodCard key={`meal-${meal.uid}`} meal={meal} index={mi} onDelete={onDeleteMeal} />
                        ))}
                      </AnimatePresence>
                    </div>
                    <motion.button
                      whileHover={{ borderColor: "rgba(59,130,246,0.188)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
                      style={{
                        width: "100%", padding: "7px",
                        background: "transparent",
                        border: `1px dashed var(--border2)`,
                        color: "var(--text-muted)", borderRadius: radius.md,
                        cursor: "pointer", fontSize: 11, marginTop: 4,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                      }}
                      aria-label={`Add more to ${time}`}
                    >
                      <Plus size={12} /> Add more
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function generateInsights(totalCal, totalProt, totalCarbs, totalFat, totalFiber, totalSugar, water, meals, calGoal, protGoal) {
  const tips = [];
  if (totalProt < protGoal * 0.7) tips.push({ icon: <Flame size={14} />, text: `Protein is low. Need ${Math.round(protGoal - totalProt)}g more.`, color: "var(--red)", priority: 1 });
  else if (totalProt >= protGoal) tips.push({ icon: <Dumbbell size={14} />, text: "Protein goal achieved! Great work.", color: "var(--green)", priority: 1 });
  if (totalFiber < 25) tips.push({ icon: <Leaf size={14} />, text: `Fiber is low (${Math.round(totalFiber)}g). Aim for 25-30g daily.`, color: "var(--yellow)", priority: 2 });
  if (totalSugar > 50) tips.push({ icon: <AlertTriangle size={14} />, text: `Sugar is high (${Math.round(totalSugar)}g). Try to stay under 50g.`, color: "var(--orange)", priority: 2 });
  if (water < 5) tips.push({ icon: <Droplets size={14} />, text: `Hydration needs work. ${Math.round((8 - water) * 250)}ml remaining.`, color: "var(--blue)", priority: 3 });
  else if (water >= 8) tips.push({ icon: <Droplets size={14} />, text: "Excellent hydration! Keep it up.", color: "var(--teal)", priority: 3 });
  if (meals.length < 3) tips.push({ icon: "⏰", text: "Only 2 meals logged. Try to eat 3-4 balanced meals.", color: "var(--purple)", priority: 4 });
  else if (meals.length >= 4) tips.push({ icon: <Target size={14} />, text: "Great meal frequency! Consistent eating pattern.", color: "var(--green)", priority: 4 });
  if (totalCal < calGoal * 0.8) tips.push({ icon: <Flame size={14} />, text: `Calories are low. ${Math.round(calGoal - totalCal)} kcal remaining.`, color: "var(--orange)", priority: 4 });
  else if (totalCal > calGoal * 1.1) tips.push({ icon: <Zap size={14} />, text: `Calories exceeded by ${Math.round(totalCal - calGoal)} kcal today.`, color: "var(--red)", priority: 4 });
  return tips.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export default function MealHub({ calGoal, protGoal, onOpenModal }) {
  const meals = useNutritionStore(s => s.meals);
  const water = useNutritionStore(s => s.water);
  const setWater = useNutritionStore(s => s.setWater);
  const supplements = useNutritionStore(s => s.supplements);
  const setSupplements = useNutritionStore(s => s.setSupplements);
  const nutritionStreak = useNutritionStore(s => s.nutritionStreak);
  const totalDaysLogged = useNutritionStore(s => s.totalDaysLogged);
  const xp = useUserStore(s => s.xp);

  const safeMeals = meals || [];
  const safeCalGoal = calGoal > 0 ? calGoal : 2400;
  const safeProtGoal = protGoal > 0 ? protGoal : 100;

  const totalCal = Math.round(safeMeals.reduce((s, m) => s + (+m.cal || 0), 0));
  const totalProt = Math.round(safeMeals.reduce((s, m) => s + (+m.protein || 0), 0));
  const totalCarbs = Math.round(safeMeals.reduce((s, m) => s + (+m.carbs || 0), 0));
  const totalFat = Math.round(safeMeals.reduce((s, m) => s + (+m.fat || 0), 0));
  const totalFiber = Math.round(safeMeals.reduce((s, m) => s + (+m.fiber || 0), 0));
  const totalSugar = Math.round(safeMeals.reduce((s, m) => s + (+m.sugar || 0), 0));

  const [selectedTab, setSelectedTab] = useState(() => localStorage.getItem("fitforce_nutrition_tab") || "dashboard");
  useEffect(() => { localStorage.setItem("fitforce_nutrition_tab", selectedTab); }, [selectedTab]);

  const remainingCal = Math.max(0, safeCalGoal - totalCal);
  const waterGoal = 8;
  const protGoalActual = safeProtGoal;
  const fiberGoal = 25;
  const sugarLimit = 50;

  const mealsByTime = useMemo(() => MEAL_TIMES.map(mt => ({
    time: mt,
    items: safeMeals.filter(m => m.mealTime === mt),
    totalCal: safeMeals.filter(m => m.mealTime === mt).reduce((s, m) => s + (+m.cal || 0), 0),
    totalProt: safeMeals.filter(m => m.mealTime === mt).reduce((s, m) => s + (+m.protein || 0), 0),
    totalCarbs: safeMeals.filter(m => m.mealTime === mt).reduce((s, m) => s + (+m.carbs || 0), 0),
    totalFat: safeMeals.filter(m => m.mealTime === mt).reduce((s, m) => s + (+m.fat || 0), 0),
  })), [safeMeals]);

  const insights = useMemo(() => generateInsights(totalCal, totalProt, totalCarbs, totalFat, totalFiber, totalSugar, water, safeMeals, safeCalGoal, safeProtGoal), [totalCal, totalProt, totalCarbs, totalFat, totalFiber, totalSugar, water, safeMeals, safeCalGoal, safeProtGoal]);

  const level = Math.floor(xp / 500) + 1;

  const handleDeleteMeal = useCallback((meal) => {
    useNutritionStore.getState().deleteMeal(meal);
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "meals", label: "Meals", icon: Utensils },
    { id: "insights", label: "Insights", icon: Brain },
  ];

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate">
      {/* Tab navigation */}
      <motion.div variants={itemVariants} style={{
        display: "flex", gap: 0, marginBottom: 16,
        borderBottom: `1px solid var(--border)`,
        background: "var(--bg-card)",
        borderRadius: `${radius.lg}px ${radius.lg}px 0 0`,
        padding: "0 4px",
        position: "sticky", top: 130, zIndex: 10,
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = selectedTab === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedTab(id)}
              style={{
                flex: 1, background: "transparent", border: "none",
                padding: "12px 8px", cursor: "pointer",
                color: active ? "var(--text)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400, fontSize: 12,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                position: "relative", transition: "color 0.2s",
                WebkitTapHighlightColor: "transparent",
              }}
              aria-label={label}
              aria-selected={active}
              role="tab"
            >
              <Icon size={14} /> {label}
              {active && (
                <motion.div layoutId="nutrition-tab" transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{ position: "absolute", bottom: 0, left: 8, right: 8, height: 2, background: "var(--accent)", borderRadius: 1, boxShadow: `0 0 6px rgba(59,130,246,0.376)` }} />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {selectedTab === "dashboard" && (
        <motion.div key="dashboard">
          {/* Premium Hero */}
          <motion.div variants={itemVariants}>
            <Card variant="glass" style={{ padding: "20px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, rgba(59,130,246,0.031), transparent 70%)` }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
                      Daily Nutrition
                    </div>
                    <h2 style={{ color: "var(--text)", fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                      {formatCal(totalCal)} / {formatCal(safeCalGoal)} kcal
                    </h2>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      style={{ width: 40, height: 40, background: `rgba(59,130,246,0.082)`, borderRadius: radius.md, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(59,130,246,0.125)` }}>
                       <Apple size={20} color={"var(--accent)"} />
                    </motion.div>
                    {nutritionStreak > 0 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: `rgba(249,115,22,0.071)`, padding: "6px 10px", borderRadius: radius.full, border: `1px solid rgba(249,115,22,0.145)` }}>
                        <Award size={13} color={"var(--orange)"} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--orange)" }}>{nutritionStreak}</span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Remaining bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Remaining</span>
                    <span style={{ color: remainingCal > 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                      {remainingCal > 0 ? `${formatCal(remainingCal)} kcal` : "Over goal!"}
                    </span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: radius.full, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalCal / safeCalGoal) * 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                      style={{ height: "100%", background: `linear-gradient(90deg, ${totalCal > safeCalGoal ? "var(--accent)" : "var(--accent)"}, ${totalCal > safeCalGoal ? "var(--accent-light)" : "var(--accent-light)"})`, borderRadius: radius.full, boxShadow: `0 0 8px ${totalCal > safeCalGoal ? "var(--accent)" : "var(--accent)"}40` }} />
                  </div>
                </div>

                {/* Macro rings row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  <MacroRing value={totalCal} goal={safeCalGoal} label="Cal" color={"var(--accent)"} icon={Flame} size={72} />
                  <MacroRing value={totalProt} goal={protGoalActual} label="Protein" color={"var(--blue)"} icon={Zap} size={72} />
                  <MacroRing value={totalCarbs} goal={300} label="Carbs" color={"var(--yellow)"} icon={Activity} size={72} />
                  <MacroRing value={totalFat} goal={80} label="Fat" color={"var(--green)"} icon={Apple} size={72} />
                  <MacroRing value={totalFiber} goal={fiberGoal} label="Fiber" color={"var(--teal)"} icon={Heart} size={72} />
                </div>

                {/* Mini macro bars */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 10 }}>
                  {[
                    { label: "Fiber", value: totalFiber, goal: fiberGoal, color: "var(--teal)" },
                    { label: "Sugar", value: totalSugar, goal: sugarLimit, color: totalSugar > sugarLimit ? "var(--red)" : "var(--orange)" },
                    { label: "Water", value: water, goal: waterGoal, color: "var(--blue)" },
                  ].map(({ label, value, goal, color }) => {
                    const pct = Math.min(100, (value / Math.max(1, goal)) * 100);
                    return (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color }}><AnimatedCounter value={Math.round(value)} /></div>
                        <div style={{ height: 3, background: "var(--border)", borderRadius: radius.full, margin: "2px 4px", overflow: "hidden" }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                            style={{ height: "100%", background: color, borderRadius: radius.full }} />
                        </div>
                        <div style={{ fontSize: 8, color: "var(--text-dim)" }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats Row */}
          <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Foods", value: meals.length, color: "var(--accent)" },
              { label: "Protein", value: `${Math.round(totalProt)}g`, color: "var(--blue)" },
              { label: "Fiber", value: `${Math.round(totalFiber)}g`, color: "var(--teal)" },
              { label: "Streak", value: `${nutritionStreak}d`, color: "var(--orange)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--bg-card2)", borderRadius: radius.md, padding: "10px", textAlign: "center", border: `1px solid var(--border)` }}>
                <div style={{ fontSize: 15, fontWeight: 600, color }}>{value}</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 1 }}>{label}</div>
              </div>
            ))}
          </motion.div>

          {/* Water Tracker */}
          <motion.div variants={itemVariants}>
            <WaterTracker water={water} setWater={setWater} />
          </motion.div>
        </motion.div>
      )}

      {selectedTab === "meals" && (
        <motion.div key="meals">
          {/* Quick add row */}
          <motion.div variants={itemVariants} style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
            {FOOD_DB.filter(f => f.healthyScore >= 8).slice(0, 8).map((qm, i) => (
              <motion.button
                key={`${qm.name}-${qm.cal}-${i}`}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.03, borderColor: "rgba(16,185,129,0.251)" }} whileTap={{ scale: 0.96 }}
                onClick={() => onOpenModal(qm)}
                style={{
                  flexShrink: 0, background: "var(--bg-card2)",
                  border: `1px solid var(--border)`, borderRadius: radius.md,
                  padding: "8px 10px", cursor: "pointer", textAlign: "left", minWidth: 120,
                  transition: transition.fast,
                }}
                aria-label={`Quick add ${qm.name}`}
              >
                <div style={{ fontSize: 18, marginBottom: 2 }}>{qm.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap" }}>{qm.name.split("(")[0].trim()}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", gap: 4 }}>
                    <span style={{ color: "var(--accent)" }}>{qm.cal}</span>
                  <span style={{ color: "var(--blue)" }}>{qm.protein}g</span>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Meal Timeline */}
          {mealsByTime.map((section) => (
            <MealSection
              key={section.time}
              {...section}
              totalCal={totalCal}
              onOpenModal={onOpenModal}
              onDeleteMeal={handleDeleteMeal}
            />
          ))}

          {/* Add Meal FAB */}
          <motion.div variants={itemVariants}>
            <Button style={{ width: "100%", marginTop: 4 }} onClick={onOpenModal}>
              <Plus size={16} /> Add Meal
            </Button>
          </motion.div>
        </motion.div>
      )}

      {selectedTab === "insights" && (
        <motion.div key="insights">
          {/* Streak Badge */}
          <motion.div variants={itemVariants}>
            <Card variant="glass" style={{ marginBottom: 14, textAlign: "center", padding: "20px" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                <Award size={40} color={"var(--orange)"} style={{ margin: "0 auto 8px" }} />
              </motion.div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--orange)" }}>{nutritionStreak} Day Streak</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                {totalDaysLogged} total days logged · Level {level}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
                {Array.from({ length: Math.min(7, nutritionStreak) }).map((_, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05, type: "spring" }}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: `linear-gradient(135deg, var(--orange), var(--yellow))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 12, fontWeight: 700,
                      boxShadow: shadow.glow("var(--orange)"),
                    }}>
                    <Check size={12} />
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Daily Insights */}
          <motion.div variants={itemVariants}>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Brain size={16} color={"var(--purple)"} />
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: 0 }}>Today's Insights</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {insights.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)", fontSize: 12 }}>
                    No insights yet. Start logging your meals!
                  </div>
                ) : (
                  insights.map((tip, i) => (
                    <motion.div key={tip.text} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: `${tip.color}06`, borderRadius: radius.md, border: `1px solid ${tip.color}12` }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{tip.icon}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{tip.text}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Macro Breakdown */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <Target size={15} color={"var(--accent)"} /> Macro Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Calories", value: totalCal, goal: safeCalGoal, color: "var(--accent)" },
                  { label: "Protein", value: totalProt, goal: protGoalActual, color: "var(--blue)" },
                  { label: "Carbs", value: totalCarbs, goal: 300, color: "var(--yellow)" },
                  { label: "Fat", value: totalFat, goal: 80, color: "var(--green)" },
                  { label: "Fiber", value: totalFiber, goal: fiberGoal, color: "var(--teal)" },
                  { label: "Sugar", value: totalSugar, goal: sugarLimit, color: "var(--orange)" },
                ].map(({ label, value, goal, color }) => {
                  const pct = Math.min(100, (value / Math.max(1, goal)) * 100);
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span style={{ color, fontWeight: 500 }}>
                          <AnimatedCounter value={Math.round(value)} /> / {goal}
                        </span>
                      </div>
                      <div style={{ height: 4, background: "var(--border)", borderRadius: radius.full, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                          style={{ height: "100%", background: `linear-gradient(90deg, ${color}, ${color}dd)`, borderRadius: radius.full }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* SVG Gradients */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={"var(--accent)"} /><stop offset="100%" stopColor={"var(--accent-light)"} />
          </linearGradient>
          <linearGradient id="proteinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={"var(--blue)"} /><stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="carbsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={"var(--yellow)"} /><stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="fatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={"var(--green)"} /><stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="fiberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={"var(--teal)"} /><stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}


