import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Lightbulb, Shield, RefreshCw, Activity, Dumbbell, Heart, Footprints, Flame, Zap, Clock, Star, AlignJustify } from "lucide-react";
import { radius, shadow, muscleColor } from "../styles/designSystem";
import ExerciseImage from "./ExerciseImage";
import Card from "./ui/Card";
import { Tag, Badge } from "./ui/Tag";
import { EXERCISES } from "../data/fitness";
import { EXERCISE_DETAILS, EQUIPMENT_ICONS, getSimilarExercises } from "../data/exerciseDetails";

const sectionVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" } }),
};

const listItemVariant = {
  hidden: { opacity: 0, x: -8 },
  visible: i => ({ opacity: 1, x: 0, transition: { delay: 0.2 + i * 0.03, duration: 0.25, ease: "easeOut" } }),
};

const MUSCLE_EMOJI = {
  Chest: <Activity size={14} />, Back: <Activity size={14} />, Legs: <Footprints size={14} />, Glutes: <Activity size={14} />,
  Shoulders: <Dumbbell size={14} />, Arms: <Dumbbell size={14} />, Core: <Activity size={14} />, Cardio: <Heart size={14} />,
};

export default function ExerciseDetailModal({ exercise, open, onClose, onSelectExercise }) {
  if (!exercise) return null;
  const details = EXERCISE_DETAILS[exercise.id];
  const similar = getSimilarExercises(exercise, EXERCISES);

  const infoRows = [
    { label: "Equipment", value: details?.equipment || "Varies", icon: EQUIPMENT_ICONS[details?.equipment] || <Dumbbell size={16} /> },
    { label: "Primary Muscle", value: exercise.muscle, icon: MUSCLE_EMOJI[exercise.muscle] || <Dumbbell size={16} /> },
    { label: "Secondary Muscles", value: details?.secondaryMuscles?.join(", ") || "—", icon: <Activity size={16} /> },
    { label: "Difficulty", value: exercise.level, icon: exercise.level === "Beginner" ? <Zap size={16} /> : exercise.level === "Intermediate" ? <Zap size={16} /> : <Flame size={16} /> },
    { label: "Sets × Reps", value: `${exercise.sets} × ${exercise.reps}`, icon: <AlignJustify size={16} /> },
    { label: "Rest", value: `${exercise.rest}s`, icon: <Clock size={16} /> },
    { label: "Calories", value: `~${exercise.cal} cal`, icon: <Flame size={16} /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0,
            background: "var(--overlay)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 12, overflowY: "auto",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 30 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              background: "var(--bg-card)",
              border: `1px solid var(--border2)`,
              borderRadius: radius.xl,
              width: "100%",
              maxWidth: 560,
              boxShadow: shadow.modal,
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <div style={{ position: "relative", borderRadius: `${radius.xl}px ${radius.xl}px 0 0`, overflow: "hidden" }}>
              <ExerciseImage exercise={exercise} width="100%" height={200} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 50%)",
                pointerEvents: "none",
              }} />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  position: "absolute", top: 12, right: 12,
                  background: "rgba(0,0,0,0.5)", border: "none",
                  borderRadius: radius.full, width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#fff", zIndex: 2,
                  backdropFilter: "blur(8px)",
                }}
              >
                <X size={18} />
              </motion.button>
              <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 2 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.02em" }}>
                  {exercise.name}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge label={exercise.level} color={exercise.level === "Beginner" ? "var(--green)" : exercise.level === "Intermediate" ? "var(--yellow)" : "var(--accent)"} />
                  <Tag label={exercise.muscle} color={muscleColor[exercise.muscle] || "var(--accent)"} />
                </div>
              </div>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.7, margin: "16px 0 18px" }}>
                {exercise.desc}
              </p>

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 8, marginBottom: 20,
              }}>
                {infoRows.map((row, i) => (
                  <motion.div
                    key={row.label}
                    custom={i}
                    variants={sectionVariant}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -2 }}
                    style={{
                      background: `linear-gradient(135deg, rgba(59,130,246,0.031), var(--bg-card2))`,
                      borderRadius: radius.md,
                      padding: "12px 8px",
                      border: `1px solid var(--border)`,
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{
                      width: 28, height: 28,
                      background: `rgba(59,130,246,0.071)`,
                      borderRadius: radius.sm,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 6px",
                    }}>
                      {row.icon}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 1 }}>{row.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text)", fontWeight: 600, lineHeight: 1.3 }}>{row.value}</div>
                  </motion.div>
                ))}
              </div>

              {details?.instructions && (
                <motion.div custom={1} variants={sectionVariant} initial="hidden" animate="visible" style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: `rgba(59,130,246,0.125)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle2 size={14} color={"var(--blue)"} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Step-by-Step Instructions</div>
                  </div>
                  <div style={{ paddingLeft: 0 }}>
                    {details.instructions.map((step, i) => (
                      <motion.div
                        key={i} custom={i} variants={listItemVariant}
                        initial="hidden" animate="visible"
                        style={{
                          display: "flex", gap: 10, padding: "7px 0",
                          borderBottom: i < details.instructions.length - 1 ? `1px solid var(--border)` : "none",
                          fontSize: 12.5, color: "var(--text)", lineHeight: 1.6,
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: radius.full,
                          background: `rgba(59,130,246,0.094)`, color: "var(--blue)",
                          fontSize: 10, fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, marginTop: 1,
                        }}>
                          {i + 1}
                        </div>
                        <span>{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {details?.commonMistakes && (
                  <motion.div custom={2} variants={sectionVariant} initial="hidden" animate="visible">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: `rgba(239,68,68,0.125)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AlertTriangle size={14} color={"var(--red)"} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Common Mistakes</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {details.commonMistakes.map((m, i) => (
                        <motion.div
                          key={i} custom={i} variants={listItemVariant}
                          initial="hidden" animate="visible"
                          style={{
                            display: "flex", gap: 6, alignItems: "flex-start",
                            fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: "var(--red)", flexShrink: 0, fontSize: 10 }}><X size={16} /></span>
                          <span>{m}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {details?.proTips && (
                  <motion.div custom={3} variants={sectionVariant} initial="hidden" animate="visible">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: `rgba(245,158,11,0.125)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Lightbulb size={14} color={"var(--yellow)"} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Pro Tips</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {details.proTips.map((tip, i) => (
                        <motion.div
                          key={i} custom={i} variants={listItemVariant}
                          initial="hidden" animate="visible"
                          style={{
                            display: "flex", gap: 6, alignItems: "flex-start",
                            fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: "var(--yellow)", flexShrink: 0, fontSize: 10 }}><Star size={12} /></span>
                          <span>{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {details?.safety && (
                <motion.div custom={4} variants={sectionVariant} initial="hidden" animate="visible" style={{ marginBottom: 20 }}>
                  <div style={{
                    background: `rgba(239,68,68,0.031)`,
                    border: `1px solid rgba(239,68,68,0.125)`,
                    borderRadius: radius.md,
                    padding: "12px 14px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <Shield size={16} color={"var(--red)"} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--red)", marginBottom: 3 }}>Safety Warning</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{details.safety}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {similar.length > 0 && (
                <motion.div custom={5} variants={sectionVariant} initial="hidden" animate="visible">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: radius.sm, background: `rgba(16,185,129,0.125)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <RefreshCw size={14} color={"var(--green)"} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Similar Exercises</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {similar.map((ex, i) => (
                      <motion.div
                        key={ex.id} custom={i} variants={listItemVariant}
                        initial="hidden" animate="visible"
                        onClick={() => { onClose(); onSelectExercise?.(ex); }}
                        style={{
                          background: `linear-gradient(135deg, rgba(16,185,129,0.024), var(--bg-card2))`,
                          border: `1px solid var(--border)`,
                          borderRadius: radius.md,
                          padding: "12px 14px",
                          cursor: "pointer",
                        }}
                        whileHover={{ y: -3, borderColor: `${muscleColor[ex.muscle] || "var(--accent)"}40`, boxShadow: shadow.elevated }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{ex.name}</div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <Tag label={ex.muscle} color={muscleColor[ex.muscle] || "var(--accent)"} />
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{ex.sets} × {ex.reps}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                style={{
                  width: "100%", marginTop: 18,
                  padding: "12px", borderRadius: radius.md,
                  background: "var(--bg-card2)", border: `1px solid var(--border)`,
                  color: "var(--text-muted)", fontSize: 13, fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


