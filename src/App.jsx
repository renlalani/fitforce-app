
import { useWorkoutStore } from "./stores/workoutStore";
import { useUserStore } from "./stores/userStore";
import { useNutritionStore } from "./stores/nutritionStore";
import { useUiStore } from "./stores/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Dumbbell, Apple, Activity, User,
  Flame, Search, Plus, X,
  Ruler, Heart, Brain,
  TrendingUp
} from "lucide-react";
import { theme, radius, shadow, transition, muscleColor, cardStyle } from "./styles/designSystem";
import { EXERCISES, MUSCLES } from "./data/fitness";
import ExerciseImage from "./components/ExerciseImage";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import { Tag, Badge } from "./components/ui/Tag";
import Modal from "./components/ui/Modal";
import MiniChart from "./components/MiniChart";
import WorkoutModal from "./components/WorkoutModal";
import WorkoutHub from "./components/WorkoutHub";
import MealHub from "./components/MealHub";
import FoodPickerModal from "./components/FoodPickerModal";
import Toast from "./components/Toast";
import AICoach from "./components/AICoach";
import Dashboard from "./components/Dashboard";
import useAddFood from "./hooks/useAddFood";
import { useHydrated } from "./hooks/useHydrated";
import { Skeleton } from "./components/ui/Skeleton";
import { useState, useCallback } from "react";

function AppSkeleton() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 20 }}>
      <Skeleton variant="card" count={1} style={{ height: 140, marginBottom: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" style={{ height: 80 }} />)}
      </div>
      <Skeleton variant="card" count={3} style={{ marginBottom: 10 }} />
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "exercises", label: "Exercises", icon: Search },
  { id: "nutrition", label: "Nutrition", icon: Apple },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "tools", label: "Body Tools", icon: Ruler },
  { id: "ai", label: "AI Coach", icon: Brain },
  { id: "profile", label: "Profile", icon: User },
];

export default function FitForce() {
  const hydrated = useHydrated();

  const workoutLog = useWorkoutStore(s => s.workoutLog);
  const activeWorkout = useWorkoutStore(s => s.activeWorkout);
  const setActiveWorkout = useWorkoutStore(s => s.setActiveWorkout);
  const newLogRow = useWorkoutStore(s => s.newLogRow);
  const setNewLogRow = useWorkoutStore(s => s.setNewLogRow);
  const addLogEntry = useWorkoutStore(s => s.addLogEntry);
  const xp = useUserStore(s => s.xp);
  const prs = useUserStore(s => s.prs);
  const addXp = useUserStore(s => s.addXp);
  const updatePrWeight = useUserStore(s => s.updatePrWeight);
  const addPr = useUserStore(s => s.addPr);

  const meals = useNutritionStore(s => s.meals);
  const water = useNutritionStore(s => s.water);

  const tab = useUiStore(s => s.tab);
  const setTab = useUiStore(s => s.setTab);
  const filterMuscle = useUiStore(s => s.filterMuscle);
  const setFilterMuscle = useUiStore(s => s.setFilterMuscle);
  const filterLevel = useUiStore(s => s.filterLevel);
  const setFilterLevel = useUiStore(s => s.setFilterLevel);
  const showMealModal = useUiStore(s => s.showMealModal);
  const setShowMealModal = useUiStore(s => s.setShowMealModal);
  const showExDetail = useUiStore(s => s.showExDetail);
  const setShowExDetail = useUiStore(s => s.setShowExDetail);
  const newBodyStat = useUiStore(s => s.newBodyStat);
  const setNewBodyStat = useUiStore(s => s.setNewBodyStat);
  const orm1W = useUiStore(s => s.orm1W);
  const setOrm1W = useUiStore(s => s.setOrm1W);
  const orm1R = useUiStore(s => s.orm1R);
  const setOrm1R = useUiStore(s => s.setOrm1R);
  const bfNeck = useUiStore(s => s.bfNeck);
  const setBfNeck = useUiStore(s => s.setBfNeck);
  const bfWaist = useUiStore(s => s.bfWaist);
  const setBfWaist = useUiStore(s => s.setBfWaist);

  const profile = useUserStore(s => s.profile);
  const setProfile = useUserStore(s => s.setProfile);
  const bodyStats = useUserStore(s => s.bodyStats);
  const addBodyStat = useUserStore(s => s.addBodyStat);
  const streak = useUserStore(s => s.streak);
  const measurements = useUserStore(s => s.measurements);
  const setMeasurements = useUserStore(s => s.setMeasurements);

  const totalCal = Math.round((meals || []).reduce((s, m) => s + (+m.cal || 0), 0));
  const totalProt = Math.round((meals || []).reduce((s, m) => s + (+m.protein || 0), 0));
  const totalCarbs = Math.round((meals || []).reduce((s, m) => s + (+m.carbs || 0), 0));
  const totalFat = Math.round((meals || []).reduce((s, m) => s + (+m.fat || 0), 0));
  const weightNum = +profile.weight || 0;
  const heightNum = +profile.height || 175;
  const bmi = heightNum > 0 ? +((weightNum) / ((heightNum / 100) ** 2)).toFixed(1) : 0;
  const bmiColor = bmi < 18.5 ? theme.blue : bmi < 25 ? theme.green : bmi < 30 ? theme.yellow : theme.red;
  const calGoal = profile.goal === "Fat Loss" ? 2000 : profile.goal === "Muscle Gain" ? 2800 : 2400;
  const protGoal = Math.round((+profile.weight || 0) * 2);
  const level = Math.floor(xp / 500) + 1;
  const xpToNext = 500 - (xp % 500);
  const { addFoodToMeal, undoAddFood, toast, clearToast } = useAddFood();
  const [preselectedFood, setPreselectedFood] = useState(null);
  const handleOpenModal = useCallback((food) => {
    setPreselectedFood(food || null);
    setShowMealModal(true);
  }, []);

  const filteredEx = EXERCISES.filter(e => (filterMuscle === "All" || e.muscle === filterMuscle) && (filterLevel === "All" || e.level === filterLevel));

  const h2s = { color: theme.text, fontSize: 20, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" };
  const h3s = { color: theme.text, fontSize: 15, fontWeight: 500, margin: "0 0 10px" };
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14, marginBottom: 14 };

  if (!hydrated) return <AppSkeleton />;

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: theme.family, WebkitFontSmoothing: "antialiased", position: "relative" }}>
      <div style={{
        position: "fixed", top: "-20%", right: "-10%",
        width: "60vmax", height: "60vmax",
        background: `radial-gradient(circle, ${theme.red}06, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
        animation: "float 12s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", left: "-10%",
        width: "50vmax", height: "50vmax",
        background: `radial-gradient(circle, ${theme.blue}04, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
        animation: "float 15s ease-in-out infinite reverse",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
      {activeWorkout && <WorkoutModal plan={activeWorkout} onClose={() => setActiveWorkout(null)} />}

      <AnimatePresence>
        {showMealModal && (
          <FoodPickerModal
            key={preselectedFood?.name || "new"}
            initialFood={preselectedFood}
            onAdd={addFoodToMeal}
            onClose={() => { setShowMealModal(false); setPreselectedFood(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExDetail && (
          <Modal open={showExDetail} onClose={() => setShowExDetail(null)} maxWidth={420}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ color: theme.text, margin: 0, fontSize: 17, fontWeight: 600 }}>{showExDetail.name}</h3>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setShowExDetail(null)}
                style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", padding: 4 }}>
                <X size={20} />
              </motion.button>
            </div>
            <ExerciseImage
              exercise={showExDetail}
              width="100%"
              height={150}
              style={{ marginBottom: 14, border: `1px solid ${theme.border}` }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <Badge label={showExDetail.level} color={showExDetail.level === "Beginner" ? theme.green : showExDetail.level === "Intermediate" ? theme.yellow : theme.red} />
              <Tag label={showExDetail.muscle} color={muscleColor[showExDetail.muscle] || theme.red} />
              <Tag label={`${showExDetail.sets}×${showExDetail.reps}`} color={theme.blue} />
              <Tag label={`${showExDetail.rest}s rest`} color={theme.yellow} />
              <Tag label={`~${showExDetail.cal} cal`} color={theme.orange} />
            </div>
            <p style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{showExDetail.desc}</p>
            <Button style={{ width: "100%" }} onClick={() => setShowExDetail(null)}>Got it</Button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: `linear-gradient(180deg, ${theme.bgCard} 0%, ${theme.bg} 100%)`,
          borderBottom: `1px solid ${theme.border}`,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            width: 38, height: 38,
            background: `linear-gradient(135deg, ${theme.red}, ${theme.redDark})`,
            borderRadius: radius.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 18,
            color: "#fff",
            boxShadow: shadow.glow(theme.red),
          }}
        >
          F
        </motion.div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>FitForce</div>
          <div style={{ fontSize: 10, color: theme.textMuted }}>AI Gym Companion</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: theme.yellow, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <Zap size={12} /> Lv.{level} · {xp} XP
            </div>
            <div style={{ width: 90, height: 3, background: theme.border, borderRadius: radius.full, overflow: "hidden", marginTop: 3 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((xp % 500) / 500) * 100}%` }}
                transition={{ duration: 0.6 }}
                style={{ height: "100%", background: theme.yellow, borderRadius: radius.full, boxShadow: `0 0 6px ${theme.yellow}40` }}
              />
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: `${theme.red}15`,
              color: theme.red,
              border: `1px solid ${theme.red}25`,
              borderRadius: radius.md,
              padding: "5px 10px",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Flame size={14} /> {streak}
          </motion.div>
        </div>
      </motion.div>

      {/* Floating Glass Nav */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: `linear-gradient(180deg, ${theme.bgCard}ee, ${theme.bgCard}dd)`,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${theme.border}`,
          padding: "0 8px",
          display: "flex",
          gap: 0,
          overflowX: "auto",
          scrollbarWidth: "none",
          position: "sticky",
          top: 66,
          zIndex: 99,
        }}
      >
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              whileHover={{ color: theme.text }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "transparent",
                color: active ? theme.text : theme.textMuted,
                border: "none",
                padding: "12px 10px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
                position: "relative",
                transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <t.icon size={13} />
              {t.label}
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 8,
                    right: 8,
                    height: 2,
                    background: theme.red,
                    borderRadius: 1,
                    boxShadow: `0 0 8px ${theme.red}60`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <div style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {tab === "dashboard" && (
              <Dashboard
                profile={profile}
                totalCal={totalCal}
                totalProt={totalProt}
                totalCarbs={totalCarbs}
                totalFat={totalFat}
                calGoal={calGoal}
                protGoal={protGoal}
                setActiveWorkout={setActiveWorkout}
                setShowMealModal={setShowMealModal}
                onNavigate={setTab}
                level={level}
                streak={streak}
              />
            )}

            {tab === "workouts" && (
              <WorkoutHub
                level={level}
                streak={streak}
                setActiveWorkout={setActiveWorkout}
                onNavigate={setTab}
                profile={profile}
                onShowDetail={setShowExDetail}
              />
            )}

            {tab === "exercises" && (
              <motion.div variants={containerVariants} initial="initial" animate="animate">
                <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ ...h2s, margin: 0 }}>Exercise Library</h2>
                  <span style={{ fontSize: 13, color: theme.textMuted }}>{filteredEx.length} exercises</span>
                </motion.div>

                <motion.div variants={itemVariants} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {MUSCLES.map(m => (
                    <motion.button
                      key={m}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterMuscle(m)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: radius.full,
                        border: `1px solid ${filterMuscle === m ? (muscleColor[m] || theme.red) : theme.border2}`,
                        background: filterMuscle === m ? `${muscleColor[m] || theme.red}18` : "transparent",
                        color: filterMuscle === m ? (muscleColor[m] || theme.red) : theme.textMuted,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: filterMuscle === m ? 500 : 400,
                        transition: transition.fast,
                      }}
                    >
                      {m}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {["All", "Beginner", "Intermediate", "Advanced"].map(l => (
                    <motion.button
                      key={l}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterLevel(l)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: radius.sm,
                        border: `1px solid ${filterLevel === l ? theme.red : theme.border2}`,
                        background: filterLevel === l ? `${theme.red}15` : "transparent",
                        color: filterLevel === l ? theme.red : theme.textMuted,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: filterLevel === l ? 500 : 400,
                        transition: transition.fast,
                      }}
                    >
                      {l}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
                  {filteredEx.map(ex => (
                    <motion.div
                      key={ex.id}
                      whileHover={{ y: -3, boxShadow: shadow.elevated }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowExDetail(ex)}
                      style={{
                        ...cardStyle,
                        marginBottom: 0,
                        cursor: "pointer",
                        padding: "18px",
                      }}
                    >
                      <ExerciseImage
                        exercise={ex}
                        width="100%"
                        height={90}
                        style={{ marginBottom: 12 }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h3 style={{ ...h3s, margin: 0, fontSize: 14 }}>{ex.name}</h3>
                        <Badge label={ex.level} color={ex.level === "Beginner" ? theme.green : ex.level === "Intermediate" ? theme.yellow : theme.red} />
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                        <Tag label={ex.muscle} color={muscleColor[ex.muscle] || theme.red} />
                        <Tag label={`${ex.sets}×${ex.reps}`} color={theme.blue} />
                      </div>
                      <p style={{
                        color: theme.textMuted, fontSize: 11, margin: 0,
                        lineHeight: 1.5, display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {ex.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {tab === "nutrition" && (
              <MealHub
                calGoal={calGoal}
                protGoal={protGoal}
                onOpenModal={handleOpenModal}
              />
            )}

            {tab === "progress" && (
              <motion.div variants={containerVariants} initial="initial" animate="animate">
                <motion.h2 variants={itemVariants} style={h2s}>Progress</motion.h2>

                <motion.div variants={itemVariants} style={grid2}>
                  <Card>
                    <h3 style={h3s}>Body Weight</h3>
                    <MiniChart data={bodyStats.map(b => ({ ...b, value: b.weight }))} color={theme.red} label="Weight trend (kg)" />
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <input
                          id="body-weight" name="bodyWeight" type="number" step="0.1" placeholder="Weight (kg)"
                          value={newBodyStat}
                          onChange={e => setNewBodyStat(e.target.value)}
                          style={{
                            background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                            borderRadius: radius.md, padding: "8px 12px",
                            color: theme.text, fontSize: 13, outline: "none",
                            width: "100%", boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <Button onClick={() => {
                        if (!newBodyStat) return;
                        const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        addBodyStat({ date: today, weight: +newBodyStat });
                        setNewBodyStat("");
                      }}>
                        Log
                      </Button>
                    </div>
                  </Card>

                  <Card>
                    <h3 style={h3s}>Strength PRs</h3>
                    {prs.map((p, i) => (
                      <div key={p.lift} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13 }}>{p.lift}</span>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              id={`pr-weight-${i}`} name={`prWeight_${i}`} type="number" value={p.weight}
                              onChange={e => updatePrWeight(i, e.target.value)}
                              style={{
                                background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                                borderRadius: radius.sm, width: 60, padding: "4px 8px",
                                color: theme.text, fontSize: 12, textAlign: "center",
                                outline: "none",
                              }}
                            />
                            <span style={{ fontSize: 11, color: theme.textMuted }}>kg</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: theme.border, borderRadius: radius.full, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (p.weight / 160) * 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            style={{ height: "100%", background: theme.red, borderRadius: radius.full }}
                          />
                        </div>
                      </div>
                    ))}
                    <motion.button whileHover={{ borderColor: theme.red + "40" }} whileTap={{ scale: 0.98 }}
                      onClick={() => { const n = prompt("Lift name:"); if (n) addPr(n); }}
                      style={{
                        background: theme.bgCard2, border: `1px solid ${theme.border}`,
                        color: theme.textMuted, borderRadius: radius.md, padding: "7px",
                        cursor: "pointer", fontSize: 12, width: "100%", marginTop: 4,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}>
                      <Plus size={14} /> Add Lift
                    </motion.button>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <h3 style={h3s}>Body Measurements (cm)</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
                      {Object.entries(measurements).map(([k, v]) => (
                        <div key={k}>
                          <label style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 4, textTransform: "capitalize" }}>
                            {k}
                          </label>
                          <input
                            type="number" value={v}
                            onChange={e => setMeasurements(p => ({ ...p, [k]: e.target.value }))}
                            style={{
                              background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                              borderRadius: radius.md, padding: "8px 12px",
                              color: theme.text, fontSize: 13, outline: "none",
                              width: "100%", boxSizing: "border-box",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <h3 style={h3s}>Workout Log</h3>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${theme.border2}` }}>
                            {["Date", "Exercise", "Sets", "Reps", "Weight", "Volume"].map(h => (
                              <th key={h} style={{ padding: "8px 8px", textAlign: "left", color: theme.textMuted, fontWeight: 400, fontSize: 11 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {workoutLog.map((w, i) => (
                            <tr key={w.uid || `${w.date}-${w.name}-${i}`} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: "8px", color: theme.textMuted }}>{w.date}</td>
                              <td style={{ padding: "8px", fontWeight: 500 }}>{w.name}</td>
                              <td style={{ padding: "8px", color: theme.red }}>{w.sets}</td>
                              <td style={{ padding: "8px", color: theme.blue }}>{w.reps}</td>
                              <td style={{ padding: "8px", color: theme.yellow }}>{w.weight ? `${w.weight}kg` : "BW"}</td>
                              <td style={{ padding: "8px", color: theme.textMuted }}>{w.vol || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                      {[["Exercise", "name", "text"], ["Sets", "sets", "number"], ["Reps", "reps", "number"], ["Weight", "weight", "number"]].map(([ph, k, t]) => (
                        <input key={k} id={`log-${k}`} name={`log${k.charAt(0).toUpperCase() + k.slice(1)}`} type={t} placeholder={ph}
                          value={newLogRow[k]}
                          onChange={e => setNewLogRow(p => ({ ...p, [k]: e.target.value }))}
                          style={{
                            background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                            borderRadius: radius.md, padding: "8px 12px",
                            color: theme.text, fontSize: 12, outline: "none",
                            width: "100%", boxSizing: "border-box",
                          }} />
                      ))}
                    </div>
                    <Button style={{ width: "100%", marginTop: 10 }} onClick={() => {
                      if (!newLogRow.name) return;
                      addLogEntry();
                      addXp(15);
                    }}>
                      <Plus size={14} /> Log Exercise
                    </Button>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <h3 style={h3s}>Achievements & XP</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: theme.yellow }}>Level {level}</div>
                        <div style={{ fontSize: 12, color: theme.textMuted }}>{xp} XP total</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: theme.text, marginBottom: 6 }}>{xpToNext} XP to Level {level + 1}</div>
                        <div style={{ width: 140, height: 6, background: theme.border, borderRadius: radius.full, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((xp % 500) / 500) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            style={{ height: "100%", background: theme.yellow, borderRadius: radius.full, boxShadow: `0 0 8px ${theme.yellow}40` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 10 }}>
                      {[
                        ["🔥", "7-Day Streak", theme.red, true],
                        ["💪", "First Workout", theme.blue, true],
                        ["🥗", "Nutrition Pro", theme.green, true],
                        ["⚡", "PR Broken", theme.yellow, true],
                        ["🏃", "Cardio King", theme.purple, false],
                        ["🎯", "Level 5", theme.orange, false],
                      ].map(([icon, name, c, unlocked]) => (
                        <motion.div key={name} whileHover={unlocked ? { scale: 1.05 } : {}}
                          style={{
                            background: unlocked ? `${c}12` : theme.bgCard2,
                            border: `1px solid ${unlocked ? `${c}30` : theme.border}`,
                            borderRadius: radius.md,
                            padding: "12px 8px",
                            textAlign: "center",
                            opacity: unlocked ? 1 : 0.35,
                          }}>
                          <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                          <div style={{ fontSize: 10, color: unlocked ? c : theme.textMuted, lineHeight: 1.3, fontWeight: 500 }}>{name}</div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {tab === "tools" && (
              <motion.div variants={containerVariants} initial="initial" animate="animate">
                <motion.h2 variants={itemVariants} style={h2s}>Body Tools</motion.h2>

                <motion.div variants={itemVariants} style={grid2}>
                  <Card>
                    <h3 style={h3s}>BMI & Metabolism</h3>
                    {(() => {
                      const h = (+profile.height || 175) / 100, w = +profile.weight || 75, age = +profile.age || 25;
                      const bmi2 = h > 0 ? +(w / (h * h)).toFixed(1) : 0;
                      const bmr = profile.gender === "Female" ? (10 * w) + (6.25 * (+profile.height)) - (5 * age) - 161 : (10 * w) + (6.25 * (+profile.height)) - (5 * age) + 5;
                      const tdee = Math.round(bmr * 1.55);
                      const bmiC = bmi2 < 18.5 ? theme.blue : bmi2 < 25 ? theme.green : bmi2 < 30 ? theme.yellow : theme.red;
                      const bmiL = bmi2 < 18.5 ? "Underweight" : bmi2 < 25 ? "Normal" : bmi2 < 30 ? "Overweight" : "Obese";
                      return (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                            {[
                              ["BMI", bmi2, bmiC, bmiL],
                              ["BMR", Math.round(bmr), theme.blue, "kcal/day"],
                              ["TDEE", tdee, theme.red, "kcal/day"],
                            ].map(([l, v, c, sub]) => (
                              <div key={l} style={{
                                textAlign: "center", background: theme.bgCard2,
                                borderRadius: radius.md, padding: "12px 4px",
                                border: `1px solid ${theme.border}`,
                              }}>
                                <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                                <div style={{ fontSize: 10, color: theme.textMuted }}>{l}</div>
                                <div style={{ fontSize: 10, color: c, fontWeight: 500 }}>{sub}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ background: theme.bgCard2, borderRadius: radius.md, padding: "12px", fontSize: 12, border: `1px solid ${theme.border}` }}>
                            <div style={{ color: theme.textMuted, marginBottom: 6 }}>
                              Calorie goal: <span style={{ color: theme.red, fontWeight: 500 }}>{calGoal} kcal</span>
                            </div>
                            <div style={{ color: theme.textMuted, marginBottom: 6 }}>
                              Protein target: <span style={{ color: theme.blue, fontWeight: 500 }}>{protGoal}g/day</span>
                            </div>
                            <div style={{ color: theme.textMuted }}>
                              Today's balance:{" "}
                              <span style={{ color: totalCal > calGoal ? theme.orange : theme.green, fontWeight: 500 }}>
                                {totalCal - calGoal > 0 ? "+" : ""}{totalCal - calGoal} kcal
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </Card>

                  <Card>
                    <h3 style={h3s}>1 Rep Max Calculator</h3>
                    {(() => {
                      const oneRM = Math.round(+orm1W * (1 + 0.0333 * +orm1R));
                      return (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                            <div>
                              <label style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 4 }}>Weight (kg)</label>
                              <input id="orm-weight" name="ormWeight" type="number" value={orm1W} onChange={e => setOrm1W(e.target.value)}
                                style={{
                                  background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                                  borderRadius: radius.md, padding: "8px 12px", color: theme.text,
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 4 }}>Reps</label>
                              <input id="orm-reps" name="ormReps" type="number" value={orm1R} onChange={e => setOrm1R(e.target.value)}
                                style={{
                                  background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                                  borderRadius: radius.md, padding: "8px 12px", color: theme.text,
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                          </div>
                          <div style={{
                            textAlign: "center",
                            background: `linear-gradient(135deg, ${theme.bgCard2}, ${theme.bgCard3})`,
                            borderRadius: radius.md, padding: "16px", marginBottom: 12,
                            border: `1px solid ${theme.border}`,
                          }}>
                            <motion.div
                              key={oneRM}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              style={{ fontSize: 32, fontWeight: 700, color: theme.red }}
                            >
                              {oneRM} kg
                            </motion.div>
                            <div style={{ fontSize: 12, color: theme.textMuted }}>Estimated 1RM</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                            {[
                              ["95%", Math.round(oneRM * 0.95), "Strength"],
                              ["85%", Math.round(oneRM * 0.85), "Power"],
                              ["75%", Math.round(oneRM * 0.75), "Hypertrophy"],
                              ["65%", Math.round(oneRM * 0.65), "Endurance"],
                            ].map(([p, v, l]) => (
                              <div key={p} style={{
                                background: theme.bgCard3, borderRadius: radius.md,
                                padding: "10px 4px", textAlign: "center",
                                border: `1px solid ${theme.border}`,
                              }}>
                                <div style={{ fontSize: 15, color: theme.red, fontWeight: 600 }}>{v}kg</div>
                                <div style={{ fontSize: 10, color: theme.textMuted }}>{p}</div>
                                <div style={{ fontSize: 9, color: theme.textDim }}>{l}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} style={grid2}>
                  <Card>
                    <h3 style={h3s}>Body Fat Estimator (Navy)</h3>
                    {(() => {
                      const bf = +(495 / (1.0324 - 0.19077 * Math.log10(Math.max(1, +bfWaist - +bfNeck)) + 0.15456 * Math.log10(+profile.height)) - 450).toFixed(1);
                      const bfLabel = bf < 8 ? "Essential" : bf < 14 ? "Athletic" : bf < 18 ? "Fitness" : bf < 24 ? "Average" : "High";
                      const bfColor = bf < 14 ? theme.blue : bf < 18 ? theme.green : bf < 24 ? theme.yellow : theme.red;
                      return (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                            <div>
                              <label style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 4 }}>Neck (cm)</label>
                              <input id="bf-neck" name="bfNeck" type="number" value={bfNeck} onChange={e => setBfNeck(e.target.value)}
                                style={{
                                  background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                                  borderRadius: radius.md, padding: "8px 12px", color: theme.text,
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 4 }}>Waist (cm)</label>
                              <input id="bf-waist" name="bfWaist" type="number" value={bfWaist} onChange={e => setBfWaist(e.target.value)}
                                style={{
                                  background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                                  borderRadius: radius.md, padding: "8px 12px", color: theme.text,
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                          </div>
                          <div style={{
                            textAlign: "center",
                            background: `linear-gradient(135deg, ${theme.bgCard2}, ${theme.bgCard3})`,
                            borderRadius: radius.md, padding: "16px",
                            border: `1px solid ${theme.border}`,
                          }}>
                            <motion.div
                              key={bf}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              style={{ fontSize: 32, fontWeight: 700, color: bfColor }}
                            >
                              {isNaN(bf) || bf < 0 ? "—" : bf}%
                            </motion.div>
                            <div style={{ fontSize: 14, color: bfColor, fontWeight: 500 }}>{bfLabel}</div>
                          </div>
                        </>
                      );
                    })()}
                  </Card>

                  <Card>
                    <h3 style={h3s}>Recovery Guide</h3>
                    <div>
                      {[
                        ["Chest/Triceps", "48-72h", theme.red],
                        ["Back/Biceps", "48-72h", theme.blue],
                        ["Legs", "72-96h", theme.green],
                        ["Shoulders", "48-72h", theme.yellow],
                        ["Core", "24-48h", theme.orange],
                        ["Cardio", "24h", theme.teal],
                      ].map(([m, t, c]) => (
                        <div key={m} style={{
                          display: "flex", justifyContent: "space-between",
                          padding: "9px 0", borderBottom: `1px solid ${theme.border}`,
                          fontSize: 13,
                        }}>
                          <span>{m}</span>
                          <span style={{ color: c, fontSize: 12, fontWeight: 500 }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {tab === "ai" && (
              <motion.div variants={containerVariants} initial="initial" animate="animate">
                <motion.h2 variants={itemVariants} style={h2s}>AI Coach</motion.h2>
                <motion.div variants={itemVariants}>
                  <AICoach profile={profile} totalCal={totalCal} totalProt={totalProt} water={water} level={level} xp={xp} />
                </motion.div>
              </motion.div>
            )}

            {tab === "profile" && (
              <motion.div variants={containerVariants} initial="initial" animate="animate">
                <motion.h2 variants={itemVariants} style={h2s}>Profile</motion.h2>

                <motion.div variants={itemVariants}>
                  <Card>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 18,
                      marginBottom: 20, paddingBottom: 18,
                      borderBottom: `1px solid ${theme.border}`,
                    }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                          width: 68, height: 68,
                          background: `linear-gradient(135deg, ${theme.red}, ${theme.redDark})`,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                          fontWeight: 700,
                          color: "#fff",
                          boxShadow: shadow.glow(theme.red),
                        }}>
                        {profile.name.charAt(0).toUpperCase()}
                      </motion.div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 20 }}>{profile.name}</div>
                        <div style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                          {profile.level} · {profile.goal}
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                          <span style={{ fontSize: 12, color: theme.yellow, display: "flex", alignItems: "center", gap: 3 }}>
                            <Zap size={12} /> Lv.{level}
                          </span>
                          <span style={{ fontSize: 12, color: bmiColor, display: "flex", alignItems: "center", gap: 3 }}>
                            <Heart size={12} /> BMI: {bmi}
                          </span>
                          <span style={{ fontSize: 12, color: theme.red, display: "flex", alignItems: "center", gap: 3 }}>
                            <Flame size={12} /> {streak}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      {[["Name", "name", "text"], ["Age", "age", "number"], ["Weight (kg)", "weight", "number"], ["Height (cm)", "height", "number"]].map(([l, k, t]) => (
                        <div key={k}>
                          <label style={{ fontSize: 12, color: theme.textMuted, display: "block", marginBottom: 4 }}>{l}</label>
                          <input id={`profile-${k}`} name={`profile${k.charAt(0).toUpperCase() + k.slice(1)}`} type={t} value={profile[k]}
                            onChange={e => setProfile(k, e.target.value)}
                            style={{
                              background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                              borderRadius: radius.md, padding: "10px 14px", color: theme.text,
                              fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                            }} />
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, color: theme.textMuted, display: "block", marginBottom: 6 }}>Gender</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["Male", "Female", "Other"].map(g => (
                          <motion.button key={g} whileTap={{ scale: 0.97 }}
                            onClick={() => setProfile("gender", g)}
                            style={{
                              flex: 1, padding: "10px", borderRadius: radius.md,
                              border: `1px solid ${profile.gender === g ? theme.red : theme.border2}`,
                              background: profile.gender === g ? `${theme.red}15` : "transparent",
                              color: profile.gender === g ? theme.red : theme.textMuted,
                              cursor: "pointer", fontSize: 13,
                              fontWeight: profile.gender === g ? 500 : 400,
                            }}>
                            {g}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, color: theme.textMuted, display: "block", marginBottom: 6 }}>Fitness Level</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["Beginner", "Intermediate", "Advanced"].map(l => (
                          <motion.button key={l} whileTap={{ scale: 0.97 }}
                            onClick={() => setProfile("level", l)}
                            style={{
                              flex: 1, padding: "10px", borderRadius: radius.md,
                              border: `1px solid ${profile.level === l ? theme.red : theme.border2}`,
                              background: profile.level === l ? `${theme.red}15` : "transparent",
                              color: profile.level === l ? theme.red : theme.textMuted,
                              cursor: "pointer", fontSize: 13,
                              fontWeight: profile.level === l ? 500 : 400,
                            }}>
                            {l}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontSize: 12, color: theme.textMuted, display: "block", marginBottom: 6 }}>Goal</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["Muscle Gain", "Fat Loss", "Endurance", "Strength", "General Fitness"].map(g => (
                          <motion.button key={g} whileTap={{ scale: 0.95 }}
                            onClick={() => setProfile("goal", g)}
                            style={{
                              padding: "8px 16px", borderRadius: radius.full,
                              border: `1px solid ${profile.goal === g ? theme.red : theme.border2}`,
                              background: profile.goal === g ? `${theme.red}15` : "transparent",
                              color: profile.goal === g ? theme.red : theme.textMuted,
                              cursor: "pointer", fontSize: 12,
                              fontWeight: profile.goal === g ? 500 : 400,
                            }}>
                            {g}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      background: theme.bgCard2, borderRadius: radius.md,
                      padding: "14px", marginBottom: 16,
                      border: `1px solid ${theme.border}`,
                    }}>
                      <div style={{ color: theme.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>
                        Auto-calculated targets
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                        <div style={{ color: theme.textMuted }}>
                          Calories: <span style={{ color: theme.red, fontWeight: 500 }}>{calGoal} kcal</span>
                        </div>
                        <div style={{ color: theme.textMuted }}>
                          Protein: <span style={{ color: theme.blue, fontWeight: 500 }}>{protGoal}g</span>
                        </div>
                        <div style={{ color: theme.textMuted }}>
                          BMI: <span style={{ color: bmiColor, fontWeight: 500 }}>{bmi}</span>
                        </div>
                        <div style={{ color: theme.textMuted }}>
                          Goal: <span style={{ color: theme.yellow, fontWeight: 500 }}>{profile.goal}</span>
                        </div>
                      </div>
                    </div>

                    <Button style={{ width: "100%" }}>Save Profile</Button>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Toast
        message={toast.message}
        sub={toast.sub}
        visible={toast.visible}
        onClose={clearToast}
        onUndo={undoAddFood}
        duration={4000}
      />
      </div>
    </div>
  );
}
