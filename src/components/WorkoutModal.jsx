import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Play, SkipForward, Trophy, Clock, Dumbbell, Zap,
  CheckCircle, Plus, Minus, Pause, ChevronRight, Target,
  Activity, Sparkles, Star, RotateCcw, ChevronDown,
} from "lucide-react";
import { theme, radius, shadow, transition, muscleColor } from "../styles/designSystem";
import { EXERCISES } from "../data/fitness";
import ExerciseImage from "./ExerciseImage";
import { Tag } from "./ui/Tag";
import ConfettiEffect from "./ConfettiEffect";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";

const LEVEL_COLOR = { Beginner: theme.green, Intermediate: theme.yellow, Advanced: theme.red };
const MUSCLE_EMOJI = {
  Chest: "🔥", Back: "🦍", Legs: "🦵", Glutes: "🍑",
  Shoulders: "💪", Arms: "💪", Core: "🔥", Cardio: "🏃",
};

const ACHIEVEMENTS_DATA = [
  { id: "complete", icon: "💪", label: "Workout Complete", unlocked: true, color: theme.red },
  { id: "streak", icon: "🔥", label: "Streak Kept", unlocked: true, color: theme.orange },
  { id: "pr", icon: "⚡", label: "New PR!", unlocked: false, color: theme.yellow },
  { id: "xp", icon: "⭐", label: "XP Boost", unlocked: true, color: theme.purple },
];

function fmt(s) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function CircularTimer({ total, remaining, phase }) {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const progress = phase === "rest" ? remaining / total : 1;
  const color = phase === "rest" ? theme.blue : theme.green;

  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      <defs>
        <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Background ring */}
      <circle cx="110" cy="110" r={r} fill="none" stroke={theme.border3} strokeWidth="8" />
      {/* Background glow */}
      <circle cx="110" cy="110" r={r + 4} fill="none" stroke={color + "08"} strokeWidth="16" />
      {/* Progress ring */}
      <motion.circle
        cx="110" cy="110" r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: circ * (1 - progress) }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        transform="rotate(-90, 110, 110)"
        style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
      />
      {/* Inner glow */}
      <circle cx="110" cy="110" r={r - 8} fill={color + "04"} />
    </svg>
  );
}

export default function WorkoutModal({ plan, onClose }) {
  const xp = useUserStore(s => s.xp);
  const exList = plan.exercises.map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("work");
  const [setNum, setSetNum] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [restCount, setRestCount] = useState(0);
  const [restPaused, setRestPaused] = useState(false);
  const [done, setDone] = useState(false);
  const [weights, setWeights] = useState({});
  const [completedSets, setCompletedSets] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [exerciseExpanded, setExerciseExpanded] = useState(false);
  const [extraRest, setExtraRest] = useState(0);
  const restRef = useRef(null);
  const restPausedRef = useRef(restPaused);

  useEffect(() => { restPausedRef.current = restPaused; }, [restPaused]);

  const cur = exList[idx];
  const nextEx = exList[idx + 1] || null;
  const totalSets = exList.reduce((s, e) => s + (e.sets || 3), 0);
  const doneSets = exList.slice(0, idx).reduce((s, e) => s + (e.sets || 3), 0) + setNum - 1;
  const setsInCurrent = completedSets.filter(cs => cs.exId === cur?.id);
  const bpm = 8 + Math.floor(elapsed / 120) * 2;
  const estCal = completedSets.length * 15 + Math.floor(elapsed / 60) * bpm;

  useEffect(() => {
    const t = setInterval(() => {
      if (!restPausedRef.current) setElapsed(p => p + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== "rest" || done) return;
    const t = setInterval(() => {
      if (restPausedRef.current) return;
      setRestCount(p => {
        if (p <= 1) { setPhase("work"); setSetNum(s => s + 1); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, done]);

  useEffect(() => {
    if (done && !showSummary) {
      const t = setTimeout(() => { setShowSummary(true); setShowCelebration(true); }, 500);
      return () => clearTimeout(t);
    }
  }, [done, showSummary]);

  const nextSet = useCallback(() => {
    const entry = { exId: cur.id, name: cur.name, set: setNum, weight: weights[`${cur.id}_${setNum}`] || "—", reps: cur.reps };
    setCompletedSets(p => [...p, entry]);
    if (setNum < (cur.sets || 3)) {
      setPhase("rest");
      setRestCount((cur.rest || 60) + extraRest);
      setExtraRest(0);
    } else {
      if (idx < exList.length - 1) {
        setIdx(p => p + 1);
        setSetNum(1);
        setPhase("work");
        setExerciseExpanded(false);
      } else {
        setDone(true);
      }
    }
  }, [cur, idx, setNum, weights, extraRest, exList.length]);

  const addRest = useCallback((sec) => {
    setExtraRest(p => p + sec);
    setRestCount(p => Math.max(1, p + sec));
  }, []);

  const toggleRestPause = useCallback(() => {
    setRestPaused(p => !p);
  }, []);

  const skipRest = useCallback(() => {
    setPhase("work");
    setSetNum(s => s + 1);
    setRestPaused(false);
  }, []);

  const setWeight = useCallback((key, val) => {
    setWeights(p => ({ ...p, [key]: val }));
  }, []);

  if (showSummary) {
    const totalVol = completedSets.reduce((s, cs) => {
      const w = cs.weight !== "—" ? Number(cs.weight) : 0;
      const r = cs.reps ? (Number(String(cs.reps).split("-")[0]) || 0) : 0;
      return s + w * r;
    }, 0);
    const totalReps = completedSets.reduce((s, cs) => {
      if (!cs.reps) return s;
      return s + (Number(String(cs.reps).split("-")[0]) || 0);
    }, 0);
    const totalSetsDone = completedSets.length;
    const xpGained = 50 + totalSetsDone * 5 + Math.floor(estCal / 10);
    const newAchievements = ACHIEVEMENTS_DATA.filter(a => a.unlocked);

    return (
      <>
        <ConfettiEffect active={showCelebration} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 16, overflowY: "auto",
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
            style={{
              background: theme.bgCard,
              border: `1px solid ${theme.border2}`,
              borderRadius: radius.xl,
              padding: "32px 28px",
              width: "100%",
              maxWidth: 420,
              boxShadow: shadow.modal,
              textAlign: "center",
            }}
          >
            {/* Celebration header */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
              style={{
                width: 72, height: 72,
                background: `linear-gradient(135deg, ${theme.yellow}, ${theme.orange})`,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: shadow.glow(theme.yellow),
              }}
            >
              <Trophy size={36} color="#fff" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ color: theme.text, margin: "0 0 4px", fontSize: 24, fontWeight: 700 }}
            >
              Workout Complete!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}
            >
              {plan.name}
              <br />
              <span style={{ color: theme.textDim, fontSize: 12 }}>
                {["Great job!", "You crushed it!", "Amazing effort!", "Keep it up!", "Outstanding!"][plan.name.length % 5]}
              </span>
            </motion.p>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}
            >
              {[
                { label: "Duration", value: fmt(elapsed), icon: Clock, color: theme.yellow },
                { label: "Sets", value: totalSetsDone, icon: Dumbbell, color: theme.blue },
                { label: "Calories", value: estCal, icon: Zap, color: theme.red },
                { label: "Reps", value: totalReps || "—", icon: Activity, color: theme.green },
                { label: "Volume", value: totalVol.toLocaleString(), icon: Target, color: theme.purple, suffix: "kg" },
                { label: "XP", value: `+${xpGained}`, icon: Sparkles, color: theme.orange },
              ].map(({ label, value, icon: Icon, color, suffix }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -1 }}
                  style={{
                    background: theme.bgCard2,
                    borderRadius: radius.md,
                    padding: "10px 4px",
                    textAlign: "center",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Icon size={14} color={color} style={{ margin: "0 auto 4px" }} />
                  <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}{suffix ? ` ${suffix}` : ""}</div>
                  <div style={{ fontSize: 9, color: theme.textMuted }}>{label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}
            >
              {newAchievements.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 + i * 0.15, type: "spring" }}
                  style={{
                    background: `${a.color}12`,
                    border: `1px solid ${a.color}30`,
                    borderRadius: radius.md,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <motion.span
                    animate={{ rotate: [0, -10, 10, -5, 0] }}
                    transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}
                    style={{ fontSize: 18 }}
                  >
                    {a.icon}
                  </motion.span>
                  <span style={{ fontSize: 11, color: a.color, fontWeight: 500 }}>{a.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* XP earned */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              style={{
                background: `linear-gradient(135deg, ${theme.yellow}15, ${theme.orange}08)`,
                border: `1px solid ${theme.yellow}30`,
                borderRadius: radius.md,
                padding: "12px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Zap size={20} color={theme.yellow} />
                <span style={{ fontSize: 18, fontWeight: 700, color: theme.yellow }}>+{xpGained} XP</span>
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
                Level up progress: {Math.min(100, ((xp + xpGained) % 500) / 5)}%
              </div>
            </motion.div>

            {/* Save button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { useWorkoutStore.getState().completeWorkout(completedSets, xpGained, { workoutName: plan.name, durationMinutes: Math.floor(elapsed / 60), caloriesBurned: estCal }); useUserStore.getState().addXp(xpGained); }}
              style={{
                width: "100%",
                padding: "14px",
                background: `linear-gradient(135deg, ${theme.red}, ${theme.redDark})`,
                color: "#fff",
                border: "none",
                borderRadius: radius.md,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: shadow.glow(theme.red),
              }}
            >
              <Zap size={18} /> Save & Collect Rewards
            </motion.button>
          </motion.div>
        </motion.div>
      </>
    );
  }

  const showNextEx = phase === "rest" && nextEx;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.90)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border2}`,
          borderRadius: radius.xl,
          padding: "24px",
          width: "100%",
          maxWidth: 500,
          boxShadow: shadow.modal,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 2, letterSpacing: 1, textTransform: "uppercase" }}>
              {plan.name}
            </div>
            <div style={{ fontSize: 13, color: theme.red, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              <Activity size={12} />
              Exercise {idx + 1}/{exList.length} · Set {setNum}/{cur?.sets || 3}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={13} color={theme.yellow} />
              <span style={{ fontSize: 18, fontWeight: 700, color: theme.yellow, fontVariantNumeric: "tabular-nums" }}>
                {fmt(elapsed)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: 5, background: theme.border, borderRadius: radius.full,
          marginBottom: 4, overflow: "hidden",
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((doneSets + 1) / Math.max(1, totalSets)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${theme.red}, ${theme.redLight}, ${theme.orange})`,
              borderRadius: radius.full,
              boxShadow: `0 0 8px ${theme.red}40`,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: theme.textDim, marginBottom: 16 }}>
          <span>{doneSets + 1}/{totalSets} sets</span>
          <span>{completedSets.length} done</span>
          <span>~{estCal} cal</span>
        </div>

        <AnimatePresence mode="wait">
          {/* === REST PHASE === */}
          {phase === "rest" ? (
            <motion.div
              key="rest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
                <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 6, letterSpacing: 3, textTransform: "uppercase" }}>
                  Rest
                </div>

                {/* Circular Timer */}
                <div style={{ position: "relative", display: "inline-block" }}>
                  <CircularTimer total={(cur?.rest || 60) + extraRest} remaining={restCount} phase={phase} />
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}>
                    <motion.div
                      key={restCount}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        fontSize: 48, fontWeight: 700,
                        color: restCount <= 10 ? theme.red : theme.blue,
                        fontVariantNumeric: "tabular-nums",
                        lineHeight: 1,
                      }}
                    >
                      {restCount}
                    </motion.div>
                    <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>seconds</div>
                  </div>
                </div>

                {/* Set info */}
                <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 10 }}>
                  Next: Set {setNum + 1} of {cur?.sets} · {cur?.name}
                </p>

                {/* Rest Controls */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addRest(-15)}
                    style={{
                      padding: "8px 14px", background: theme.bgCard3,
                      border: `1px solid ${theme.border2}`, color: restCount <= 15 ? theme.textDim : theme.text,
                      borderRadius: radius.md, cursor: restCount <= 15 ? "not-allowed" : "pointer",
                      fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                      opacity: restCount <= 15 ? 0.4 : 1,
                    }}
                    disabled={restCount <= 15}
                  >
                    <Minus size={12} /> 15s
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRestPause}
                    style={{
                      padding: "8px 18px",
                      background: restPaused ? `${theme.green}18` : theme.bgCard3,
                      border: `1px solid ${restPaused ? theme.green : theme.border2}`,
                      color: restPaused ? theme.green : theme.text,
                      borderRadius: radius.md, cursor: "pointer",
                      fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                      fontWeight: 500,
                    }}
                  >
                    {restPaused ? <Play size={12} /> : <Pause size={12} />}
                    {restPaused ? "Resume" : "Pause"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addRest(15)}
                    style={{
                      padding: "8px 14px", background: theme.bgCard3,
                      border: `1px solid ${theme.border2}`, color: theme.text,
                      borderRadius: radius.md, cursor: "pointer",
                      fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    <Plus size={12} /> 15s
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={skipRest}
                    style={{
                      padding: "8px 16px", background: theme.bgCard3,
                      border: `1px solid ${theme.border2}`, color: theme.blue,
                      borderRadius: radius.md, cursor: "pointer",
                      fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    <SkipForward size={12} /> Skip
                  </motion.button>
                </div>
              </div>

              {/* Next Exercise Preview */}
              {nextEx && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    marginTop: 16,
                    background: theme.bgCard2,
                    borderRadius: radius.md,
                    border: `1px solid ${theme.border}`,
                    padding: "12px",
                  }}
                >
                  <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>
                    <ChevronRight size={10} style={{ verticalAlign: "middle" }} /> Next Exercise
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <ExerciseImage
                      exercise={nextEx}
                      width={44}
                      height={44}
                      style={{ flexShrink: 0, border: `1px solid ${theme.border}` }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{nextEx.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <Tag label={`${nextEx.sets} sets`} color={theme.red} />
                        <Tag label={`${nextEx.reps}`} color={theme.blue} />
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: theme.textMuted, textAlign: "right" }}>
                      <div>~{nextEx.cal} cal</div>
                      <div style={{ color: muscleColor[nextEx.muscle] || theme.textMuted, fontSize: 10 }}>
                        {MUSCLE_EMOJI[nextEx.muscle] || ""} {nextEx.muscle}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* === WORK PHASE === */
            <motion.div
              key={`work-${idx}-${setNum}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Exercise Card */}
              <motion.div
                whileHover={{ y: -1 }}
                onClick={() => setExerciseExpanded(p => !p)}
                style={{
                  background: `linear-gradient(135deg, ${theme.bgCard2}, ${(muscleColor[cur?.muscle] || theme.red) + "08"})`,
                  borderRadius: radius.md,
                  border: `1px solid ${theme.border}`,
                  padding: "16px",
                  marginBottom: 12,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background muscle glow */}
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 120, height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${(muscleColor[cur?.muscle] || theme.red) + "10"}, transparent 70%)`,
                }} />

                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", position: "relative" }}>
                  <ExerciseImage
                    exercise={cur}
                    width={72}
                    height={72}
                    style={{
                      flexShrink: 0,
                      border: `2px solid ${(muscleColor[cur?.muscle] || theme.red) + "30"}`,
                      boxShadow: shadow.glow(muscleColor[cur?.muscle] || theme.red),
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ color: theme.text, margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>
                        {cur?.name}
                      </h3>
                      <Badge label={cur?.level} color={LEVEL_COLOR[cur?.level]} />
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <Tag label={cur?.muscle || "General"} color={muscleColor[cur?.muscle] || theme.red} />
                      <Tag label={`${cur?.rest}s rest`} color={theme.yellow} />
                      <Tag label={`~${cur?.cal} cal`} color={theme.orange} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      {Array.from({ length: { Beginner: 1, Intermediate: 2, Advanced: 3 }[cur?.level] || 1 }).map((_, si) => (
                        <Star key={si} size={11} color={LEVEL_COLOR[cur?.level]} fill={LEVEL_COLOR[cur?.level]} />
                      ))}
                      <span style={{ fontSize: 10, color: theme.textMuted }}>{cur?.level}</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: exerciseExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} color={theme.textMuted} />
                  </motion.div>
                </div>

                {/* Expanded description */}
                <AnimatePresence>
                  {exerciseExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: 12, paddingTop: 12 }}>
                        <p style={{ color: theme.textMuted, fontSize: 12, lineHeight: 1.7, margin: 0 }}>
                          {cur?.desc}
                        </p>
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <div style={{
                            padding: "6px 10px",
                            background: `${theme.blue}10`,
                            borderRadius: radius.sm,
                            border: `1px solid ${theme.blue}20`,
                          }}>
                            <div style={{ fontSize: 10, color: theme.textMuted }}>Sets</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: theme.blue }}>{cur?.sets}</div>
                          </div>
                          <div style={{
                            padding: "6px 10px",
                            background: `${theme.red}10`,
                            borderRadius: radius.sm,
                            border: `1px solid ${theme.red}20`,
                          }}>
                            <div style={{ fontSize: 10, color: theme.textMuted }}>Reps</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: theme.red }}>{cur?.reps}</div>
                          </div>
                          <div style={{
                            padding: "6px 10px",
                            background: `${theme.yellow}10`,
                            borderRadius: radius.sm,
                            border: `1px solid ${theme.yellow}20`,
                          }}>
                            <div style={{ fontSize: 10, color: theme.textMuted }}>Rest</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: theme.yellow }}>{cur?.rest}s</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Set Tracker */}
              <div style={{
                background: theme.bgCard2, borderRadius: radius.md,
                border: `1px solid ${theme.border}`,
                padding: "14px", marginBottom: 12,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: theme.textMuted, fontSize: 12 }}>Set {setNum} of {cur?.sets}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: cur?.sets || 3 }).map((_, si) => {
                      const setIdx = si + 1;
                      const isCurrent = setIdx === setNum;
                      const isDone = setIdx < setNum;
                      return (
                        <motion.div
                          key={si}
                          initial={isDone ? { scale: 0 } : {}}
                          animate={{
                            scale: 1,
                            background: isDone ? theme.green : isCurrent ? `${theme.red}20` : theme.bgCard3,
                            borderColor: isDone ? theme.green : isCurrent ? theme.red : theme.border,
                          }}
                          style={{
                            width: 28, height: 28,
                            borderRadius: "50%",
                            border: `2px solid`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: transition.normal,
                          }}
                        >
                          {isDone ? (
                            <CheckCircle size={14} color={theme.green} />
                          ) : (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              color: isCurrent ? theme.red : theme.textMuted,
                            }}>
                              {setIdx}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Completed sets summary */}
                {setsInCurrent.length > 0 && (
                  <div style={{ marginBottom: 10, fontSize: 11, color: theme.textMuted, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {setsInCurrent.map((s, si) => (
                      <span key={`${s.exId}-${s.set}`} style={{
                        background: `${theme.green}10`, padding: "3px 8px",
                        borderRadius: radius.sm,
                        border: `1px solid ${theme.green}20`,
                        color: theme.green,
                      }}>
                        #{s.set}: {s.weight || "BW"} kg
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <div style={{
                      position: "absolute", left: 12, top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 11, color: theme.textMuted,
                    }}>
                      kg
                    </div>
                    <input
                      id="workout-weight"
                      name="workoutWeight"
                      type="number"
                      placeholder="Weight"
                      value={weights[`${cur?.id}_${setNum}`] || ""}
                      onChange={e => setWeight(`${cur?.id}_${setNum}`, e.target.value)}
                      style={{
                        background: theme.bgCard3,
                        border: `1px solid ${theme.border2}`,
                        borderRadius: radius.md,
                        padding: "10px 14px 10px 36px",
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: 600,
                        outline: "none",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: theme.bgCard3,
                    border: `1px solid ${theme.border2}`,
                    borderRadius: radius.md,
                    padding: "10px 14px",
                  }}>
                    <span style={{ color: theme.textMuted, fontSize: 11 }}>×</span>
                    <span style={{ color: theme.text, fontSize: 14, fontWeight: 600 }}>{cur?.reps}</span>
                    <span style={{ color: theme.textMuted, fontSize: 11 }}>reps</span>
                  </div>
                </div>
              </div>

              {/* Complete Set Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={nextSet}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: `linear-gradient(135deg, ${theme.red}, ${theme.redDark})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.md,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: shadow.glow(theme.red),
                }}
              >
                <motion.div
                  animate={setNum < (cur?.sets || 3) ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <CheckCircle size={18} fill="#fff" />
                </motion.div>
                {setNum < (cur?.sets || 3) ? `Complete Set ${setNum}` : idx < exList.length - 1 ? "Next Exercise" : "Finish Workout"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quit / Bottom actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              background: "transparent",
              border: `1px solid ${theme.border}`,
              color: theme.textMuted,
              borderRadius: radius.md,
              cursor: "pointer",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <X size={14} /> Quit
          </motion.button>
          {phase === "work" && (
            <motion.button
              whileHover={{ scale: 1.01, borderColor: theme.blue + "40" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPhase("rest")}
              style={{
                flex: 1,
                padding: "10px",
                background: `${theme.blue}08`,
                border: `1px solid ${theme.border}`,
                color: theme.blue,
                borderRadius: radius.md,
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <RotateCcw size={14} /> Rest Early
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px",
      background: `${color}18`,
      borderRadius: radius.full,
      color,
      fontWeight: 500,
      border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  );
}
