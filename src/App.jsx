
import { useWorkoutStore } from "./stores/workoutStore";
import { useUserStore } from "./stores/userStore";
import { useNutritionStore } from "./stores/nutritionStore";
import { useUiStore } from "./stores/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Dumbbell, Apple, Activity, User,
  Flame, Search, Plus, Bell, ChevronDown,
  Ruler, Brain, TrendingUp, Settings,
  Salad, Target, Trophy, CheckCircle,
} from "lucide-react";
import { radius, shadow, transition, muscleColor, cardStyle } from "./styles/designSystem";
import { EXERCISES, MUSCLES } from "./data/fitness";
import ExerciseImage from "./components/ExerciseImage";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import { Tag, Badge } from "./components/ui/Tag";
import MiniChart from "./components/MiniChart";
import ExerciseDetailModal from "./components/ExerciseDetailModal";
import WorkoutGenerator from "./components/WorkoutGenerator";
import MealPlanner from "./components/MealPlanner";
import FoodScanner from "./components/FoodScanner";
import AIInsights from "./components/AIInsights";
import SmartRecommendations from "./components/SmartRecommendations";
import ProgressReports from "./components/ProgressReports";
import AIGoals from "./components/AIGoals";
import NotificationToast from "./components/NotificationToast";
import Profile from "./components/Profile";
import InstallPrompt from "./components/InstallPrompt";
import OfflineDetector from "./components/OfflineDetector";
import WorkoutModal from "./components/WorkoutModal";
import FoodPickerModal from "./components/FoodPickerModal";
import Toast from "./components/Toast";

const Dashboard = lazy(() => import("./components/Dashboard"));
const WorkoutHub = lazy(() => import("./components/WorkoutHub"));
const MealHub = lazy(() => import("./components/MealHub"));
const AICoach = lazy(() => import("./components/AICoach"));
const SettingsPage = lazy(() => import("./components/Settings"));
import useAddFood from "./hooks/useAddFood";
import useNotifications from "./hooks/useNotifications";
import { useHydrated } from "./hooks/useHydrated";
import { useState, useCallback, lazy, Suspense } from "react";
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
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
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
  { id: "settings", label: "Settings", icon: Settings },
];

export default function FitForce() {
  const hydrated = useHydrated();
  const workoutLog = useWorkoutStore(s => s.workoutLog);
  const workoutSessions = useWorkoutStore(s => s.workoutSessions);
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
  const showWorkoutGenerator = useUiStore(s => s.showWorkoutGenerator);
  const setShowWorkoutGenerator = useUiStore(s => s.setShowWorkoutGenerator);
  const showMealPlanner = useUiStore(s => s.showMealPlanner);
  const setShowMealPlanner = useUiStore(s => s.setShowMealPlanner);
  const showFoodScanner = useUiStore(s => s.showFoodScanner);
  const setShowFoodScanner = useUiStore(s => s.setShowFoodScanner);
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
  const latestWeight = bodyStats.length > 0 ? bodyStats[bodyStats.length - 1].weight : (+profile.weight || 0);
  const weightNum = latestWeight;
  const heightNum = +profile.height || 175;
  const bmi = heightNum > 0 ? +((weightNum) / ((heightNum / 100) ** 2)).toFixed(1) : 0;
  const bmiColor = bmi < 18.5 ? "var(--blue)" : bmi < 25 ? "var(--green)" : bmi < 30 ? "var(--yellow)" : "var(--red)";
  const calGoal = profile.goal === "Fat Loss" ? 2000 : profile.goal === "Muscle Gain" ? 2800 : 2400;
  const protGoal = Math.round(latestWeight * 2);
  const level = Math.floor(xp / 500) + 1;
  const xpToNext = 500 - (xp % 500);
  const { addFoodToMeal, undoAddFood, toast, clearToast } = useAddFood();
  const { notification: smartNotification, dismiss: dismissNotification, checkNow } = useNotifications();
  const [preselectedFood, setPreselectedFood] = useState(null);
  const handleOpenModal = useCallback((food) => {
    setPreselectedFood(food || null);
    setShowMealModal(true);
  }, []);

  const filteredEx = EXERCISES.filter(e => (filterMuscle === "All" || e.muscle === filterMuscle) && (filterLevel === "All" || e.level === filterLevel));

  const h2s = { color: "var(--text)", fontSize: 20, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" };
  const h3s = { color: "var(--text)", fontSize: 15, fontWeight: 500, margin: "0 0 10px" };
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14, marginBottom: 14 };

  if (!hydrated) return <AppSkeleton />;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "var(--family)", WebkitFontSmoothing: "antialiased", position: "relative" }}>
      <div style={{
        position: "fixed", top: "-30%", right: "-15%",
        width: "80vmax", height: "80vmax",
        background: `radial-gradient(circle at 50% 50%, var(--mesh1) 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
        animation: "meshShift 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", bottom: "-30%", left: "-15%",
        width: "70vmax", height: "70vmax",
        background: `radial-gradient(circle at 50% 50%, var(--mesh2) 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
        animation: "meshShift 25s ease-in-out infinite reverse",
      }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        width: "60vmax", height: "60vmax",
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0,
        animation: "ambientPulse 8s ease-in-out infinite",
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

      <ExerciseDetailModal exercise={showExDetail} open={!!showExDetail} onClose={() => setShowExDetail(null)} onSelectExercise={setShowExDetail} />
      <WorkoutGenerator open={showWorkoutGenerator} onClose={() => setShowWorkoutGenerator(false)} />
      <MealPlanner open={showMealPlanner} onClose={() => setShowMealPlanner(false)} />
      <FoodScanner open={showFoodScanner} onClose={() => setShowFoodScanner(false)} />

      {/* Premium Floating Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: `linear-gradient(180deg, var(--bg)dd, var(--bg-card3)aa)`,
          borderBottom: `1px solid var(--border)`,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05, rotate: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          style={{
            width: 34, height: 34,
            background: "var(--accent-gradient)",
            borderRadius: radius.lg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 15,
            color: "#fff",
            boxShadow: shadow.glow("var(--accent)"),
            flexShrink: 0,
          }}
        >
          F
        </motion.div>
        <div style={{ marginRight: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em" }}>FitForce</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>AI Gym Companion</div>
        </div>

        {/* Search Bar */}
        <div style={{
          flex: 1, maxWidth: 360, position: "relative", marginLeft: 12,
        }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            placeholder="Search exercises, workouts..."
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              background: "var(--bg-card3)", border: `1px solid var(--border)`,
              borderRadius: radius.lg, color: "var(--text)", fontSize: 12,
              outline: "none", transition: transition.normal,
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,0.251)"; e.target.style.boxShadow = `0 0 0 3px rgba(59,130,246,0.071)`; }}
            onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {/* XP */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--accent-light)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <Zap size={11} /> Lv.{level}
            </div>
            <div style={{ width: 70, height: 3, background: "var(--bg-card3)", borderRadius: radius.full, overflow: "hidden", marginTop: 3 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((xp % 500) / 500) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ height: "100%", background: "var(--accent-gradient)", borderRadius: radius.full, boxShadow: `0 0 8px rgba(59,130,246,0.251)` }}
              />
            </div>
          </div>

          {/* Streak */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            style={{
              background: `linear-gradient(135deg, rgba(59,130,246,0.125), rgba(96,165,250,0.031))`,
              color: "var(--accent-light)",
              border: `1px solid rgba(59,130,246,0.082)`,
              borderRadius: radius.lg,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Flame size={13} /> {streak}
          </motion.div>

          {/* Notification */}
          <motion.button
            whileHover={{ scale: 1.08, background: "var(--bg-card3)" }}
            onClick={checkNow}
            style={{
              width: 34, height: 34,
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.lg, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", position: "relative",
            }}
          >
            <Bell size={15} />
            <div style={{
              position: "absolute", top: 6, right: 6,
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)", boxShadow: `0 0 6px rgba(59,130,246,0.376)`,
            }} />
          </motion.button>

          {/* Avatar */}
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: shadow.softGlow("var(--accent)") }}
            onClick={() => setTab("profile")}
            style={{
              width: 34, height: 34,
              background: "var(--accent-gradient)",
              borderRadius: radius.full,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 13, color: "#fff",
              cursor: "pointer",
              border: `2px solid rgba(59,130,246,0.188)`,
              padding: 0,
            }}
          >
            {profile.name?.charAt(0) || "F"}
          </motion.button>
        </div>
      </motion.div>

      {/* Premium Pill-Style Nav */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "sticky",
          top: 60,
          zIndex: 99,
          display: "flex",
          justifyContent: "center",
          margin: "0 24px",
        }}
      >
        <motion.div
          style={{
            background: `linear-gradient(180deg, var(--bg)ee, var(--bg)cc)`,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid var(--border)`,
            borderRadius: radius.full,
            padding: "4px",
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollbarWidth: "none",
            boxShadow: shadow.floating,
          }}
        >
          {tabs.map(t => {
            const active = tab === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setTab(t.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: active ? `linear-gradient(135deg, rgba(59,130,246,0.125), rgba(96,165,250,0.063))` : "transparent",
                  color: active ? "var(--accent-light)" : "var(--text-muted)",
                  border: active ? `1px solid rgba(59,130,246,0.082)` : "none",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: radius.full,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  WebkitTapHighlightColor: "transparent",
                  letterSpacing: active ? "0.01em" : "0",
                }}
              >
                <t.icon size={12} />
                {t.label}
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div style={{ padding: "32px 24px 40px", maxWidth: 1400, margin: "0 auto", width: "92vw" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Suspense fallback={<div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>}>
            {tab === "dashboard" && (
              <>
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
                setShowWorkoutGenerator={setShowWorkoutGenerator}
                setShowMealPlanner={setShowMealPlanner}
                setShowFoodScanner={setShowFoodScanner}
                onNavigate={setTab}
                level={level}
                streak={streak}
              />
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                <AIInsights
                  profile={profile}
                  workoutSessions={workoutSessions}
                  meals={meals}
                  water={water}
                  xp={xp}
                  streak={streak}
                  totalCal={totalCal}
                  totalProt={totalProt}
                  totalCarbs={totalCarbs}
                  totalFat={totalFat}
                  calGoal={calGoal}
                  protGoal={protGoal}
                  level={level}
                  bodyStats={bodyStats}
                  prs={prs}
                />
                <SmartRecommendations
                  workoutSessions={workoutSessions}
                  meals={meals}
                  water={water}
                  totalCal={totalCal}
                  totalProt={totalProt}
                  calGoal={calGoal}
                  protGoal={protGoal}
                  streak={streak}
                  level={level}
                  xp={xp}
                  profile={profile}
                />
              </div>
              </>
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
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{filteredEx.length} exercises</span>
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
                        border: `1px solid ${filterMuscle === m ? (muscleColor[m] || "var(--accent)") : "var(--border2)"}`,
                        background: filterMuscle === m ? `${muscleColor[m] || "var(--accent)"}18` : "transparent",
                        color: filterMuscle === m ? (muscleColor[m] || "var(--accent)") : "var(--text-muted)",
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
                        border: `1px solid ${filterLevel === l ? "var(--accent)" : "var(--border2)"}`,
                        background: filterLevel === l ? `rgba(59,130,246,0.082)` : "transparent",
                        color: filterLevel === l ? "var(--accent)" : "var(--text-muted)",
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
                      whileHover={{
                        y: -5,
                        boxShadow: "var(--shadow-hover)",
                        borderColor: "rgba(37,99,235,0.18)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowExDetail(ex)}
                      transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border2)",
                        borderRadius: "var(--radius-card)",
                        padding: "20px",
                        boxShadow: "var(--shadow-card)",
                        marginBottom: 0,
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
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
                        <Badge label={ex.level} color={ex.level === "Beginner" ? "var(--green)" : ex.level === "Intermediate" ? "var(--yellow)" : "var(--accent)"} />
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                        <Tag label={ex.muscle} color={muscleColor[ex.muscle] || "var(--accent)"} />
                        <Tag label={`${ex.sets}×${ex.reps}`} color={"var(--blue)"} />
                      </div>
                      <p style={{
                        color: "var(--text-muted)", fontSize: 11, margin: 0,
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
                    <MiniChart data={bodyStats.map(b => ({ ...b, value: b.weight }))} color={"var(--accent)"} label="Weight trend (kg)" />
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <label htmlFor="body-weight" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Weight (kg)</label>
                        <input
                          id="body-weight" name="bodyWeight" type="number" step="0.1"
                          value={newBodyStat}
                          onChange={e => setNewBodyStat(e.target.value)}
                          style={{
                            background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                            borderRadius: radius.md, padding: "8px 12px",
                            color: "var(--text)", fontSize: 13, outline: "none",
                            width: "100%", boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <Button onClick={() => {
                        if (!newBodyStat) return;
                        const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        addBodyStat({ date: today, weight: +newBodyStat });
                        setNewBodyStat("");
                      }}>
                        Log
                      </Button>
                    </div>
                  </Card>

                  <Card>
                    <h3 style={h3s}>Strength PRs</h3>
                    {prs.filter(p => p.lift).map((p, i) => (
                      <div key={`pr-${p.lift}-${i}`} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <label htmlFor={`pr-weight-${i}`} style={{ fontSize: 13 }}>{p.lift}</label>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <input
                              id={`pr-weight-${i}`} name={`prWeight_${i}`} type="number" value={p.weight}
                              onChange={e => updatePrWeight(i, e.target.value)}
                              style={{
                                background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                                borderRadius: radius.sm, width: 60, padding: "4px 8px",
                                color: "var(--text)", fontSize: 12, textAlign: "center",
                                outline: "none",
                              }}
                            />
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>kg</span>
                          </div>
                        </div>
                        <div style={{ height: 4, background: "var(--border)", borderRadius: radius.full, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (p.weight / 160) * 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            style={{ height: "100%", background: "var(--accent)", borderRadius: radius.full }}
                          />
                        </div>
                      </div>
                    ))}
                    <motion.button whileHover={{ borderColor: "rgba(59,130,246,0.251)" }} whileTap={{ scale: 0.98 }}
                      onClick={() => { const n = prompt("Lift name:"); if (n) addPr(n); }}
                      style={{
                        background: "var(--bg-card2)", border: `1px solid var(--border)`,
                        color: "var(--text-muted)", borderRadius: radius.md, padding: "7px",
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
                      {Object.entries(measurements).map(([k, v]) => {
                        const id = `measurement-${k}`;
                        return (
                        <div key={k}>
                          <label htmlFor={id} style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4, textTransform: "capitalize" }}>
                            {k}
                          </label>
                          <input id={id} name={k}
                            type="number" value={v}
                            onChange={e => setMeasurements(p => ({ ...p, [k]: e.target.value }))}
                            style={{
                              background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                              borderRadius: radius.md, padding: "8px 12px",
                              color: "var(--text)", fontSize: 13, outline: "none",
                              width: "100%", boxSizing: "border-box",
                            }}
                          />
                        </div>
                      );
                      })}
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card>
                    <h3 style={h3s}>Workout Log</h3>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid var(--border2)` }}>
                            {["Date", "Exercise", "Sets", "Reps", "Weight", "Volume"].map(h => (
                              <th key={h} style={{ padding: "8px 8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 400, fontSize: 11 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {workoutLog.map((w, i) => (
                            <tr key={w.uid ? `wl-${w.uid}` : `wl-${i}-${w.date}-${w.name}`} style={{ borderBottom: `1px solid var(--border)` }}>
                              <td style={{ padding: "8px", color: "var(--text-muted)" }}>{w.date}</td>
                              <td style={{ padding: "8px", fontWeight: 500 }}>{w.name}</td>
                              <td style={{ padding: "8px", color: "var(--accent)" }}>{w.sets}</td>
                              <td style={{ padding: "8px", color: "var(--blue)" }}>{w.reps}</td>
                              <td style={{ padding: "8px", color: "var(--yellow)" }}>{w.weight ? `${w.weight}kg` : "BW"}</td>
                              <td style={{ padding: "8px", color: "var(--text-muted)" }}>{w.vol || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                      {[["Exercise", "name", "text"], ["Sets", "sets", "number"], ["Reps", "reps", "number"], ["Weight", "weight", "number"]].map(([ph, k, t]) => (
                        <div key={k}>
                          <label htmlFor={`log-${k}`} style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                            {ph}
                          </label>
                          <input id={`log-${k}`} name={`log${k.charAt(0).toUpperCase() + k.slice(1)}`} type={t}
                            value={newLogRow[k]}
                            onChange={e => setNewLogRow(p => ({ ...p, [k]: e.target.value }))}
                            style={{
                              background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                              borderRadius: radius.md, padding: "8px 12px",
                              color: "var(--text)", fontSize: 12, outline: "none",
                              width: "100%", boxSizing: "border-box",
                            }} />
                        </div>
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
                        <div style={{ fontSize: 24, fontWeight: 700, color: "var(--yellow)" }}>Level {level}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{xp} XP total</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 6 }}>{xpToNext} XP to Level {level + 1}</div>
                        <div style={{ width: 140, height: 6, background: "var(--border)", borderRadius: radius.full, overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((xp % 500) / 500) * 100}%` }}
                            transition={{ duration: 0.6 }}
                            style={{ height: "100%", background: "var(--yellow)", borderRadius: radius.full, boxShadow: `0 0 8px rgba(245,158,11,0.251)` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 10 }}>
                      {[
                        { icon: Flame, name: "7-Day Streak", c: "var(--accent)", unlocked: true },
                        { icon: Dumbbell, name: "First Workout", c: "var(--blue)", unlocked: true },
                        { icon: Salad, name: "Nutrition Pro", c: "var(--green)", unlocked: true },
                        { icon: Zap, name: "PR Broken", c: "var(--yellow)", unlocked: true },
                        { icon: Activity, name: "Cardio King", c: "var(--purple)", unlocked: false },
                        { icon: Target, name: "Level 5", c: "var(--orange)", unlocked: false },
                      ].map(({ icon: Icon, name, c, unlocked }) => (
                        <motion.div key={name} whileHover={unlocked ? { y: -4, boxShadow: "var(--shadow-hover)", borderColor: `${c}40` } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
                          style={{
                            background: unlocked ? `linear-gradient(135deg, var(--bg-card) 0%, ${c}06 100%)` : "var(--bg-card2)",
                            border: `1px solid ${unlocked ? `${c}25` : "var(--border)"}`,
                            borderRadius: "var(--radius-card)",
                            padding: "16px 10px",
                            textAlign: "center",
                            opacity: unlocked ? 1 : 0.35,
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: unlocked ? "var(--shadow-card)" : "none",
                          }}>
                          {unlocked && <div style={{
                            position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
                            background: `linear-gradient(90deg, transparent, ${c}25, transparent)`,
                          }} />}
                          <motion.div
                            initial={unlocked ? { scale: 0, rotate: -20 } : {}}
                            animate={unlocked ? { scale: 1, rotate: 0 } : {}}
                            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                            style={{
                              width: 32, height: 32,
                              background: `${c}12`,
                              borderRadius: radius.lg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              margin: "0 auto 6px",
                            }}
                          >
                            <Icon size={15} color={c} />
                          </motion.div>
                          <div style={{ fontSize: 10, color: unlocked ? c : "var(--text-muted)", lineHeight: 1.3, fontWeight: 600 }}>{name}</div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} style={{ marginTop: 16, marginBottom: 16 }}>
                  <ProgressReports
                    workoutSessions={workoutSessions}
                    meals={meals}
                    water={water}
                    bodyStats={bodyStats}
                    prs={prs}
                    totalCal={totalCal}
                    totalProt={totalProt}
                    totalCarbs={totalCarbs}
                    totalFat={totalFat}
                    calGoal={calGoal}
                    protGoal={protGoal}
                    xp={xp}
                    streak={streak}
                    level={level}
                    profile={profile}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <AIGoals />
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
                      const h = (+profile.height || 175) / 100, w = latestWeight || 75, age = +profile.age || 25;
                      const bmi2 = h > 0 ? +(w / (h * h)).toFixed(1) : 0;
                      const bmr = profile.gender === "Female" ? (10 * w) + (6.25 * (+profile.height)) - (5 * age) - 161 : (10 * w) + (6.25 * (+profile.height)) - (5 * age) + 5;
                      const tdee = Math.round(bmr * 1.55);
                      const bmiC = bmi2 < 18.5 ? "var(--blue)" : bmi2 < 25 ? "var(--green)" : bmi2 < 30 ? "var(--yellow)" : "var(--red)";
                      const bmiL = bmi2 < 18.5 ? "Underweight" : bmi2 < 25 ? "Normal" : bmi2 < 30 ? "Overweight" : "Obese";
                      return (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                            {[
                              ["BMI", bmi2, bmiC, bmiL],
                              ["BMR", Math.round(bmr).blue, "kcal/day"],
                              ["TDEE", tdee.accent, "kcal/day"],
                            ].map(([l, v, c, sub]) => (
                              <div key={l} style={{
                                textAlign: "center", background: "var(--bg-card2)",
                                borderRadius: radius.md, padding: "12px 4px",
                                border: `1px solid var(--border)`,
                              }}>
                                <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{l}</div>
                                <div style={{ fontSize: 10, color: c, fontWeight: 500 }}>{sub}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ background: "var(--bg-card2)", borderRadius: radius.md, padding: "12px", fontSize: 12, border: `1px solid var(--border)` }}>
                            <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>
                              Calorie goal: <span style={{ color: "var(--accent)", fontWeight: 500 }}>{calGoal} kcal</span>
                            </div>
                            <div style={{ color: "var(--text-muted)", marginBottom: 6 }}>
                              Protein target: <span style={{ color: "var(--blue)", fontWeight: 500 }}>{protGoal}g/day</span>
                            </div>
                            <div style={{ color: "var(--text-muted)" }}>
                              Today's balance:{" "}
                              <span style={{ color: totalCal > calGoal ? "var(--orange)" : "var(--green)", fontWeight: 500 }}>
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
                              <label htmlFor="orm-weight" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Weight (kg)</label>
                              <input id="orm-weight" name="ormWeight" type="number" value={orm1W} onChange={e => setOrm1W(e.target.value)}
                                style={{
                                  background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                                  borderRadius: radius.md, padding: "8px 12px", color: "var(--text)",
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                            <div>
                              <label htmlFor="orm-reps" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Reps</label>
                              <input id="orm-reps" name="ormReps" type="number" value={orm1R} onChange={e => setOrm1R(e.target.value)}
                                style={{
                                  background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                                  borderRadius: radius.md, padding: "8px 12px", color: "var(--text)",
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                          </div>
                          <div style={{
                            textAlign: "center",
                            background: `linear-gradient(135deg, var(--bg-card2), var(--bg-card3))`,
                            borderRadius: radius.md, padding: "16px", marginBottom: 12,
                            border: `1px solid var(--border)`,
                          }}>
                            <motion.div
                              key={oneRM}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              style={{ fontSize: 32, fontWeight: 700, color: "var(--accent)" }}
                            >
                              {oneRM} kg
                            </motion.div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Estimated 1RM</div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                            {[
                              ["95%", Math.round(oneRM * 0.95), "Strength"],
                              ["85%", Math.round(oneRM * 0.85), "Power"],
                              ["75%", Math.round(oneRM * 0.75), "Hypertrophy"],
                              ["65%", Math.round(oneRM * 0.65), "Endurance"],
                            ].map(([p, v, l]) => (
                              <div key={p} style={{
                                background: "var(--bg-card3)", borderRadius: radius.md,
                                padding: "10px 4px", textAlign: "center",
                                border: `1px solid var(--border)`,
                              }}>
                                <div style={{ fontSize: 15, color: "var(--accent)", fontWeight: 600 }}>{v}kg</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{p}</div>
                                <div style={{ fontSize: 9, color: "var(--text-dim)" }}>{l}</div>
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
                      const bfColor = bf < 14 ? "var(--blue)" : bf < 18 ? "var(--green)" : bf < 24 ? "var(--yellow)" : "var(--red)";
                      return (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                            <div>
                              <label htmlFor="bf-neck" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Neck (cm)</label>
                              <input id="bf-neck" name="bfNeck" type="number" value={bfNeck} onChange={e => setBfNeck(e.target.value)}
                                style={{
                                  background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                                  borderRadius: radius.md, padding: "8px 12px", color: "var(--text)",
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                            <div>
                              <label htmlFor="bf-waist" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Waist (cm)</label>
                              <input id="bf-waist" name="bfWaist" type="number" value={bfWaist} onChange={e => setBfWaist(e.target.value)}
                                style={{
                                  background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                                  borderRadius: radius.md, padding: "8px 12px", color: "var(--text)",
                                  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
                                }} />
                            </div>
                          </div>
                          <div style={{
                            textAlign: "center",
                            background: `linear-gradient(135deg, var(--bg-card2), var(--bg-card3))`,
                            borderRadius: radius.md, padding: "16px",
                            border: `1px solid var(--border)`,
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
                    <div style={{ display: "grid", gap: 8 }}>
                      {[
                        ["Chest/Triceps", "48-72h", "var(--accent)"],
                        ["Back/Biceps", "48-72h", "var(--blue)"],
                        ["Legs", "72-96h", "var(--green)"],
                        ["Shoulders", "48-72h", "var(--yellow)"],
                        ["Core", "24-48h", "var(--orange)"],
                        ["Cardio", "24h", "var(--teal)"],
                      ].map(([m, t, c]) => (
                        <motion.div key={m} whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "10px 12px",
                          background: "var(--bg-card2)",
                          borderRadius: "var(--radius-sm)",
                          border: `1px solid var(--border2)`,
                          fontSize: 13,
                        }}>
                          <span style={{ color: "var(--text)", fontWeight: 500 }}>{m}</span>
                          <span style={{ color: c, fontSize: 12, fontWeight: 600 }}>{t}</span>
                        </motion.div>
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
                  <AICoach profile={profile} totalCal={totalCal} totalProt={totalProt} water={water} level={level} xp={xp} latestWeight={latestWeight} />
                </motion.div>
              </motion.div>
            )}

            {tab === "profile" && (
              <Profile
                profile={profile}
                setProfile={setProfile}
                streak={streak}
                bodyStats={bodyStats}
                addBodyStat={addBodyStat}
                measurements={measurements}
                setMeasurements={setMeasurements}
                calGoal={calGoal}
                protGoal={protGoal}
                bmi={bmi}
                bmiColor={bmiColor}
              />
            )}

            {tab === "settings" && <SettingsPage />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      <NotificationToast
        notification={smartNotification}
        onDismiss={dismissNotification}
        onNavigate={setTab}
      />
      <OfflineDetector />
      <InstallPrompt />
      <Toast
        message={toast.message}
        sub={toast.sub}
        visible={toast.visible}
        onClose={clearToast}
        onUndo={undoAddFood}
        duration={4000}
      />

      {/* AI Chat Orb */}
      <motion.button
        onClick={() => setTab("ai")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1, boxShadow: `0 0 40px rgba(59,130,246,0.314), 0 0 80px rgba(59,130,246,0.125)` }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 999,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `linear-gradient(135deg, var(--accent), var(--highlight))`,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 20px rgba(59,130,246,0.251), 0 0 0 1px rgba(59,130,246,0.125)`,
          outline: "none",
        }}
        aria-label="Open AI Coach"
      >
        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.2,
            pointerEvents: "none",
          }}
        />
        {/* Gentle float */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "flex", position: "relative", zIndex: 1 }}
        >
          <Brain size={24} color="#fff" />
        </motion.div>
        {/* Label tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            right: 64,
            background: "var(--bg-card)",
            border: `1px solid var(--border)`,
            borderRadius: radius.md,
            padding: "4px 10px",
            fontSize: 11,
            color: "var(--text)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: shadow.floating,
          }}
        >
          AI Coach
        </motion.div>
      </motion.button>
      </div>
    </div>
  );
}


