import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame, Dumbbell, Apple, Droplets, Brain, Target, TrendingUp,
  Sparkles, Activity, Trophy, Heart, Clock, Zap, CheckCircle,
  ArrowRight, Coffee,
} from "lucide-react";
import { radius, shadow, muscleColor as mc } from "../styles/designSystem";
import { EXERCISES } from "../data/fitness";
import AnimatedCounter from "../components/AnimatedCounter";
import { useWorkoutStore, selectWeeklyWorkouts, selectWeeklyVolume, selectWeeklyMinutes, selectWeeklyCalories, selectCurrentStreak } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";
import { useNutritionStore } from "../stores/nutritionStore";
import { useGoalsStore } from "../stores/goalsStore";
import { useIsMobile } from "../hooks/useMediaQuery";

function MiniRing({ value, max, color, size = 34, strokeWidth: sw }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  const stroke = sw ?? (size <= 28 ? 3 : 4);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0, display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border2)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size <= 28 ? 8 : 11} fontWeight={700}
        fontFamily="'Inter', system-ui, sans-serif">
        {pct}%
      </text>
    </svg>
  );
}

const MAX_SCORE = 100;

function Gauge({ score, size = 100, stroke = 8, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / MAX_SCORE, 1);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill="var(--text)" fontSize={size * 0.28} fontWeight={800}
        fontFamily="'Inter', system-ui, sans-serif">
        {score}
      </text>
    </svg>
  );
}

function ScoreGaugeWidget({ score, label, sub, color, icon: Icon }) {
  const isMobile = useIsMobile();
  const size = isMobile ? 72 : 88;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
      <Gauge score={score} size={size} stroke={isMobile ? 6 : 7} color={color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          {Icon && <Icon size={12} color={color} />}
          <span style={{ fontSize: isMobile ? 11 : 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>
  );
}

export default function SmartWidgets({ onNavigate }) {
  const isMobile = useIsMobile();

  const workoutSessions = useWorkoutStore(s => s.workoutSessions);
  const workoutLog = useWorkoutStore(s => s.workoutLog);
  const xp = useUserStore(s => s.xp);
  const profile = useUserStore(s => s.profile);
  const streak = useUserStore(s => s.streak);
  const bodyStats = useUserStore(s => s.bodyStats);
  const meals = useNutritionStore(s => s.meals);
  const water = useNutritionStore(s => s.water);
  const setWater = useNutritionStore(s => s.setWater);
  const goals = useGoalsStore(s => s.goals);

  const latestWeight = bodyStats.length > 0
    ? parseFloat(bodyStats[bodyStats.length - 1].weight)
    : parseFloat(profile.weight) || 75;
  const weight = latestWeight || 75;
  const height = parseFloat(profile.height) || 175;
  const age = parseInt(profile.age) || 25;
  const gender = profile.gender || "Male";

  const totalCal = meals.reduce((s, m) => s + m.cal, 0);
  const totalProt = meals.reduce((s, m) => s + m.protein, 0);
  const calGoal = profile.goal === "Fat Loss" ? 2000 : profile.goal === "Muscle Gain" ? 2800 : 2400;
  const protGoal = Math.round(weight * 2);
  const pctCal = Math.min(100, (totalCal / Math.max(1, calGoal)) * 100);
  const pctProt = Math.min(100, (totalProt / Math.max(1, protGoal)) * 100);
  const pctWater = Math.min(100, (water / 8) * 100);

  const now = new Date();
  const todayStr = now.toDateString();

  const sessionsThisWeek = selectWeeklyWorkouts(useWorkoutStore.getState());

  const sortedSessions = useMemo(() =>
    [...workoutSessions].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
    [workoutSessions]
  );

  const lastSession = sortedSessions.length > 0 ? sortedSessions[0] : null;
  const lastSessionDate = lastSession ? new Date(lastSession.completedAt) : null;
  const daysSinceLastWorkout = lastSessionDate
    ? Math.floor((now - lastSessionDate) / 86400000)
    : 14;

  const todayCalBurned = workoutSessions
    .filter(s => new Date(s.completedAt).toDateString() === todayStr)
    .reduce((s, ws) => s + (ws.caloriesBurned || 0), 0);

  const past7Days = new Date(now);
  past7Days.setDate(past7Days.getDate() - 7);
  const recentLog = workoutLog.filter(e => e.date && new Date(e.date) >= past7Days);

  /* ─── WIDGET DATA ─── */

  const readiness = useMemo(() => {
    const recovery = Math.min(daysSinceLastWorkout / 2, 1);
    const nutrition = Math.min(totalProt / Math.max(1, protGoal), 1);
    const hydration = Math.min(water / 8, 1);
    const consistency = Math.min(sessionsThisWeek / 4, 1);
    return Math.round(recovery * 30 + nutrition * 25 + hydration * 20 + consistency * 25);
  }, [daysSinceLastWorkout, totalProt, protGoal, water, sessionsThisWeek]);

  const readinessColor = readiness >= 80 ? "var(--green)" : readiness >= 50 ? "var(--yellow)" : "var(--red)";
  const readinessLabel = readiness >= 80 ? "Ready to train"
    : readiness >= 50 ? "Moderate readiness"
    : "Needs recovery";

  const recoveryScore = useMemo(() => {
    const rest = Math.min(daysSinceLastWorkout / 2, 1) * 35;
    const lastVol = lastSession?.totalVolume || 0;
    const avgVol = sortedSessions.length > 0
      ? sortedSessions.reduce((s, ws) => s + (ws.totalVolume || 0), 0) / sortedSessions.length
      : 0;
    const volFactor = avgVol > 0 ? Math.min(lastVol / avgVol, 2) : 1;
    const load = volFactor > 1.3 ? 15 : volFactor > 0.7 ? 30 : 20;
    const consistency = Math.min(sessionsThisWeek / 5, 1) * 35;
    return Math.min(100, Math.round(rest + load + consistency));
  }, [daysSinceLastWorkout, lastSession, sortedSessions, sessionsThisWeek]);

  const recoveryColor = recoveryScore >= 70 ? "var(--teal)" : recoveryScore >= 40 ? "var(--yellow)" : "var(--red)";

  const bmr = gender === "Female"
    ? Math.round(10 * weight + 6.25 * height - 5 * age - 161)
    : Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  const activityFactor = 1.2 + Math.min(sessionsThisWeek, 7) * 0.1;
  const tdee = Math.round(bmr * activityFactor);
  const totalDailyBurn = tdee + todayCalBurned;

  const weeklyVol = selectWeeklyVolume(useWorkoutStore.getState());
  const weeklyMin = selectWeeklyMinutes(useWorkoutStore.getState());
  const weeklyCal = selectWeeklyCalories(useWorkoutStore.getState());

  const muscleFocus = useMemo(() => {
    const counts = {};
    (recentLog.length > 0 ? recentLog : workoutLog).forEach(entry => {
      const ex = EXERCISES.find(e => e.name === entry.name);
      if (ex && ex.muscle) {
        counts[ex.muscle] = (counts[ex.muscle] || 0) + (entry.sets || 1);
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle, sets]) => ({ muscle, sets }));
  }, [workoutLog, recentLog]);

  const maxFocusSets = muscleFocus.length > 0 ? Math.max(...muscleFocus.map(m => m.sets)) : 1;

  const currentStreak = selectCurrentStreak(useWorkoutStore.getState());

  const nextWorkoutInfo = useMemo(() => {
    if (lastSession) {
      const nextDate = new Date(lastSessionDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const isToday = nextDate.toDateString() === todayStr;
      const isPast = nextDate < now;
      if (isToday || isPast) {
        return { text: "Ready for today!", urgent: true };
      }
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return { text: `Next: ${dayNames[nextDate.getDay()]}, ${nextDate.toLocaleDateString()}`, urgent: false };
    }
    return { text: "Start your first workout!", urgent: false };
  }, [lastSession, lastSessionDate, todayStr, now]);

  const targetGoal = useMemo(() => {
    const active = goals.filter(g => g.active);
    if (active.length === 0) return null;
    return active.reduce((best, g) => best.progress > g.progress ? best : g);
  }, [goals]);

  const tips = useMemo(() => {
    const t = [];
    if (water < 4) t.push({ icon: Droplets, text: "Drink more water to stay hydrated for your workout.", color: "var(--teal)" });
    if (totalProt < protGoal * 0.3) t.push({ icon: Apple, text: "Protein is low — add a high-protein meal.", color: "var(--accent)" });
    if (daysSinceLastWorkout > 3 && daysSinceLastWorkout <= 7) t.push({ icon: Dumbbell, text: "Rest is good, but don't break your streak! Time to train.", color: "var(--orange)" });
    if (daysSinceLastWorkout > 7) t.push({ icon: Activity, text: "It's been over a week since your last workout — start fresh today!", color: "var(--accent)" });
    if (sessionsThisWeek === 0) t.push({ icon: Dumbbell, text: "No workouts yet this week. Let's get moving!", color: "var(--accent)" });
    if (totalCal < calGoal * 0.3) t.push({ icon: Apple, text: "You're under-eating today. Fuel your body!", color: "var(--yellow)" });
    if (currentStreak >= 5 && currentStreak < 14) t.push({ icon: Trophy, text: `${currentStreak}-day streak! You're building momentum.`, color: "var(--orange)" });
    if (currentStreak >= 14) t.push({ icon: Trophy, text: `Incredible ${currentStreak}-day streak! You're unstoppable!`, color: "var(--green)" });
    if (readiness >= 80 && sessionsThisWeek >= 3) t.push({ icon: Zap, text: "You're in peak condition — push harder today!", color: "var(--highlight)" });
    if (recoveryScore < 40 && daysSinceLastWorkout <= 1) t.push({ icon: Heart, text: "Consider a rest day or light active recovery.", color: "var(--purple)" });
    if (t.length === 0) t.push({ icon: Sparkles, text: "Everything looks good! Keep up the great work.", color: "var(--green)" });
    return t[0];
  }, [water, totalProt, protGoal, daysSinceLastWorkout, sessionsThisWeek, totalCal, calGoal, currentStreak, readiness, recoveryScore]);

  /* ─── STYLES ─── */

  const cardBase = {
    background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
    border: `1px solid var(--border)`,
    borderRadius: radius.xl,
    padding: isMobile ? "14px" : "18px",
    position: "relative",
    overflow: "hidden",
    boxShadow: shadow.floating,
  };

  const edgeGlow = (color) => ({
    position: "absolute", top: 0, left: 0, right: 0, height: 1,
    background: `linear-gradient(90deg, transparent, ${color || "var(--ambient)"}, transparent)`,
  });

  const sectionTitle = (icon, label) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: isMobile ? 10 : 14 }}>
      <div style={{
        width: 24, height: 24, borderRadius: radius.md,
        background: "var(--ambient)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <span style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "var(--text)" }}>{label}</span>
    </div>
  );

  const hoverAnim = { y: -3, boxShadow: "var(--shadow-hover)", transition: { type: "spring", stiffness: 400, damping: 25 } };

  return (
    <div>
      <h2 style={{
        fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "var(--text)",
        margin: "0 0 16px", letterSpacing: "-0.02em",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Sparkles size={isMobile ? 16 : 18} color={"var(--highlight)"} />
        Smart Dashboard
      </h2>

      {/* ── Row 1: Score Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
        gap: isMobile ? 10 : 14,
        marginBottom: isMobile ? 10 : 14,
      }}>
        {/* Training Readiness */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow(readinessColor)} />
          {sectionTitle(<Zap size={13} color={readinessColor} />, "Training Readiness")}
          <ScoreGaugeWidget score={readiness} label={readinessLabel}
            sub={`${sessionsThisWeek} workouts this week · ${Math.round(pctProt)}% protein`}
            color={readinessColor} icon={Activity}
          />
          <div style={{ display: "flex", gap: 6, marginTop: isMobile ? 8 : 10 }}>
            {[
              { label: "Recovery", pct: Math.min(daysSinceLastWorkout / 2, 1), c: "var(--green)" },
              { label: "Nutrition", pct: Math.min(totalProt / Math.max(1, protGoal), 1), c: "var(--accent)" },
              { label: "Hydration", pct: Math.min(water / 8, 1), c: "var(--teal)" },
            ].map(bar => (
              <div key={bar.label} style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 3 }}>{bar.label}</div>
                <div style={{ height: 4, background: "var(--track)", borderRadius: radius.full, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    style={{ height: "100%", background: `linear-gradient(90deg, ${bar.c}, ${bar.c}dd)`, borderRadius: radius.full }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recovery Score */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow(recoveryColor)} />
          {sectionTitle(<Heart size={13} color={recoveryColor} />, "Recovery Score")}
          <ScoreGaugeWidget score={recoveryScore}
            label={recoveryScore >= 70 ? "Well recovered" : recoveryScore >= 40 ? "Moderate recovery" : "Needs rest"}
            sub={`${daysSinceLastWorkout}d since last workout · ${sessionsThisWeek} sessions`}
            color={recoveryColor} icon={Heart}
          />
          <div style={{ display: "flex", gap: 6, marginTop: isMobile ? 8 : 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Rest</div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "var(--text)" }}>{daysSinceLastWorkout}d</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Volume</div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "var(--text)" }}>
                {weeklyVol > 1000 ? `${(weeklyVol / 1000).toFixed(1)}k` : weeklyVol} kg
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Consistency</div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "var(--text)" }}>{currentStreak}d</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Daily Calories + Weekly Summary + Muscle Focus ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: isMobile ? 10 : 14,
        marginBottom: isMobile ? 10 : 14,
      }}>
        {/* Daily Calories Burned */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow("var(--orange)")} />
          {sectionTitle(<Flame size={13} color={"var(--orange)"} />, "Daily Calories Burned")}
          <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
            <AnimatedCounter value={totalDailyBurn} />
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}> kcal</span>
          </div>
          <div style={{ display: "flex", gap: isMobile ? 6 : 10, marginTop: isMobile ? 8 : 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 60 }}>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>BMR</div>
              <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "var(--text)" }}>{bmr}</div>
            </div>
            <div style={{ flex: 1, minWidth: 60 }}>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Activity</div>
              <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "var(--text)" }}>{tdee - bmr}</div>
            </div>
            <div style={{ flex: 1, minWidth: 60 }}>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Workout</div>
              <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "var(--orange)" }}>+{todayCalBurned}</div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Workout Summary */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow("var(--accent)")} />
          {sectionTitle(<Activity size={13} color={"var(--accent)"} />, "Weekly Workout Summary")}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: isMobile ? 6 : 10,
          }}>
            {[
              { label: "Workouts", value: sessionsThisWeek, unit: "", color: "var(--accent)" },
              { label: "Volume", value: weeklyVol > 1000 ? `${(weeklyVol / 1000).toFixed(1)}k` : weeklyVol, unit: "kg", color: "var(--green)" },
              { label: "Minutes", value: weeklyMin, unit: "min", color: "var(--teal)" },
              { label: "Cal Burned", value: weeklyCal, unit: "kcal", color: "var(--orange)" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "var(--bg-card3)", borderRadius: radius.md,
                padding: isMobile ? "8px" : "10px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: stat.color }}>
                  {typeof stat.value === "string" ? stat.value : <AnimatedCounter value={stat.value} />}
                  {stat.unit && <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}> {stat.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Muscle Group Focus */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow("var(--highlight)")} />
          {sectionTitle(<Target size={13} color={"var(--highlight)"} />, "Muscle Group Focus")}
          {muscleFocus.length === 0 ? (
            <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "10px 0" }}>
              Log workouts to see muscle focus
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
              {muscleFocus.map((m, i) => {
                const color = mc[m.muscle] || "var(--accent)";
                const pct = (m.sets / maxFocusSets) * 100;
                return (
                  <div key={m.muscle}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                        <span style={{ color }}>●</span> {m.muscle}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>{m.sets} sets</span>
                    </div>
                    <div style={{ height: 5, background: "var(--track)", borderRadius: radius.full, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        style={{
                          height: "100%",
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                          borderRadius: radius.full,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 3: Goal Progress + Water/Protein + Next Workout + Weekly Streak ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
        gap: isMobile ? 10 : 14,
        marginBottom: isMobile ? 10 : 14,
      }}>
        {/* Today's Goal Progress */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow("var(--accent)")} />
          {sectionTitle(<Target size={13} color={"var(--accent)"} />, "Today's Goal Progress")}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>Calories</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{Math.round(totalCal)}/{calGoal}</span>
            </div>
            <div style={{ height: 4, background: "var(--track)", borderRadius: radius.full, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pctCal}%` }}
                transition={{ duration: 0.6 }}
                style={{ height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent)dd)", borderRadius: radius.full }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>Protein</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{Math.round(totalProt)}/{protGoal}g</span>
            </div>
            <div style={{ height: 4, background: "var(--track)", borderRadius: radius.full, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pctProt}%` }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ height: "100%", background: `linear-gradient(90deg, var(--accent), var(--highlight))`, borderRadius: radius.full }}
              />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>Water</span>
              <span style={{ color: "var(--teal)", fontWeight: 600 }}>{water}/8</span>
            </div>
            <div style={{ height: 4, background: "var(--track)", borderRadius: radius.full, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pctWater}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ height: "100%", background: "linear-gradient(90deg, var(--teal), var(--blue))", borderRadius: radius.full }}
              />
            </div>
          </div>
        </motion.div>

        {/* Water & Protein Summary */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow("var(--teal)")} />
          {sectionTitle(<Droplets size={13} color={"var(--teal)"} />, "Water & Protein")}
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 10 }}>
            <div style={{
              background: "var(--bg-card3)", borderRadius: radius.md, padding: isMobile ? "10px" : "10px 12px",
              display: "flex", alignItems: "center", gap: isMobile ? 8 : 10, overflow: "hidden",
            }}>
              <div style={{
                width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, borderRadius: radius.lg,
                background: "rgba(20,184,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Droplets size={isMobile ? 11 : 15} color={"var(--teal)"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", marginBottom: 2 }}>Water intake</div>
                <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {water} <span style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", fontWeight: 500 }}>/ 8 glasses</span>
                </div>
                {water < 8 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setWater(w => Math.min(8, w + 1))}
                    style={{
                      marginTop: 4, fontSize: isMobile ? 9 : 10, padding: isMobile ? "3px 8px" : "4px 10px",
                      background: "var(--teal)", color: "#fff", border: "none",
                      borderRadius: radius.full, cursor: "pointer", fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    +1 Glass
                  </motion.button>
                )}
              </div>
              <MiniRing value={water} max={8} color={"var(--teal)"} size={isMobile ? 28 : 44} />
            </div>
            <div style={{
              background: "var(--bg-card3)", borderRadius: radius.md, padding: isMobile ? "10px" : "10px 12px",
              display: "flex", alignItems: "center", gap: isMobile ? 8 : 10, overflow: "hidden",
            }}>
              <div style={{
                width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, borderRadius: radius.lg,
                background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Coffee size={isMobile ? 11 : 15} color={"var(--accent)"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", marginBottom: 2 }}>Protein goal</div>
                <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {Math.round(totalProt)} <span style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", fontWeight: 500 }}>/ {protGoal}g</span>
                </div>
              </div>
              <MiniRing value={Math.round(totalProt)} max={protGoal} color={"var(--accent)"} size={isMobile ? 28 : 44} />
            </div>
          </div>
        </motion.div>

        {/* Next Scheduled Workout */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow("var(--orange)")} />
          {sectionTitle(<Clock size={13} color={"var(--orange)"} />, "Next Workout")}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "6px 0" }}>
            <div style={{
              width: 44, height: 44, borderRadius: radius.full,
              background: nextWorkoutInfo.urgent
                ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))"
                : "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 8,
              border: `1px solid ${nextWorkoutInfo.urgent ? "rgba(249,115,22,0.2)" : "rgba(59,130,246,0.12)"}`,
            }}>
              <Dumbbell size={18} color={nextWorkoutInfo.urgent ? "var(--orange)" : "var(--accent)"} />
            </div>
            <div style={{ fontSize: isMobile ? 12 : 13, color: "var(--text)", fontWeight: 600, lineHeight: 1.4 }}>
              {nextWorkoutInfo.text}
            </div>
            {nextWorkoutInfo.urgent && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate?.("workout")}
                style={{
                  marginTop: 8, fontSize: 10, padding: "5px 14px",
                  background: "linear-gradient(135deg, var(--accent-gradient))",
                  color: "#fff", border: "none", borderRadius: radius.full,
                  cursor: "pointer", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                Start Now <ArrowRight size={10} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Weekly Streak */}
        <motion.div whileHover={hoverAnim} style={cardBase}>
          <div style={edgeGlow("var(--orange)")} />
          {sectionTitle(<Flame size={13} color={"var(--orange)"} />, "Weekly Streak")}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 52, height: 52, borderRadius: radius.full,
                background: currentStreak > 0
                  ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.08))"
                  : "var(--bg-card3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 6,
                border: `1px solid ${currentStreak > 0 ? "rgba(249,115,22,0.2)" : "var(--border)"}`,
              }}
            >
              <Flame size={20} color={currentStreak > 0 ? "var(--orange)" : "var(--text-muted)"} />
            </motion.div>
            <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: currentStreak > 0 ? "var(--orange)" : "var(--text-muted)", letterSpacing: "-0.03em" }}>
              {currentStreak}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>day streak</div>
            {currentStreak > 0 && (
              <div style={{ marginTop: 6, fontSize: 9, color: "var(--text-muted)", textAlign: "center" }}>
                {currentStreak >= 14 ? "On fire! 🔥" : currentStreak >= 7 ? "Great momentum!" : "Keep going!"}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Row 4: AI Recommendation ── */}
      <motion.div whileHover={hoverAnim} style={{
        ...cardBase,
        background: `linear-gradient(135deg, var(--bg-card) 0%, ${tips.color}06, var(--bg-card2) 100%)`,
      }}>
        <div style={edgeGlow(tips.color)} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? 10 : 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: radius.lg,
            background: `${tips.color}12`, display: "flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0, border: `1px solid ${tips.color}15`,
          }}>
            <tips.icon size={17} color={tips.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              <Sparkles size={12} color={"var(--highlight)"} style={{ marginRight: 4 }} />
              AI Recommendation
            </div>
            <div style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {tips.text}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}