import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Lightbulb, Shield, RefreshCw } from "lucide-react";
import { theme, radius, shadow, transition, muscleColor } from "../styles/designSystem";
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
  Chest: "🏋️", Back: "🔙", Legs: "🦵", Glutes: "🍑",
  Shoulders: "💪", Arms: "💪", Core: "🔥", Cardio: "🏃",
};

export default function ExerciseDetailModal({ exercise, open, onClose, onSelectExercise }) {
  if (!exercise) return null;
  const details = EXERCISE_DETAILS[exercise.id];
  const similar = getSimilarExercises(exercise, EXERCISES);

  const infoRows = [
    { label: "Equipment", value: details?.equipment || "Varies", icon: EQUIPMENT_ICONS[details?.equipment] || "🏋️" },
    { label: "Primary Muscle", value: exercise.muscle, icon: MUSCLE_EMOJI[exercise.muscle] || "💪" },
    { label: "Secondary Muscles", value: details?.secondaryMuscles?.join(", ") || "—", icon: "🔗" },
    { label: "Difficulty", value: exercise.level, icon: exercise.level === "Beginner" ? "🌱" : exercise.level === "Intermediate" ? "⚡" : "🔥" },
    { label: "Sets × Reps", value: `${exercise.sets} × ${exercise.reps}`, icon: "📋" },
    { label: "Rest", value: `${exercise.rest}s`, icon: "⏱️" },
    { label: "Calories", value: `~${exercise.cal} cal`, icon: "🔥" },
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
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
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
              background: theme.bgCard,
              border: `1px solid ${theme.border2}`,
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
                  <Badge label={exercise.level} color={exercise.level === "Beginner" ? theme.green : exercise.level === "Intermediate" ? theme.yellow : theme.red} />
                  <Tag label={exercise.muscle} color={muscleColor[exercise.muscle] || theme.red} />
                </div>
              </div>
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              <p style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.7, margin: "16px 0 18px" }}>
                {exercise.desc}
              </p>

              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 8, marginBottom: 20,
              }}>
                {infoRows.map((row, i) => (
                  <motion.div
                    key={row.label}
                    custom={i}
                    variants={sectionVariant}
                    initial="hidden"
                    animate="visible"
                    style={{
                      background: theme.bgCard2,
                      borderRadius: radius.md,
                      padding: "10px 10px",
                      border: `1px solid ${theme.border}`,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{row.icon}</div>
                    <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 1 }}>{row.label}</div>
                    <div style={{ fontSize: 11, color: theme.text, fontWeight: 500, lineHeight: 1.3 }}>{row.value}</div>
                  </motion.div>
                ))}
              </div>

              {details?.instructions && (
                <motion.div custom={1} variants={sectionVariant} initial="hidden" animate="visible" style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: `${theme.blue}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle2 size={14} color={theme.blue} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Step-by-Step Instructions</div>
                  </div>
                  <div style={{ paddingLeft: 0 }}>
                    {details.instructions.map((step, i) => (
                      <motion.div
                        key={i} custom={i} variants={listItemVariant}
                        initial="hidden" animate="visible"
                        style={{
                          display: "flex", gap: 10, padding: "7px 0",
                          borderBottom: i < details.instructions.length - 1 ? `1px solid ${theme.border}` : "none",
                          fontSize: 12.5, color: theme.text, lineHeight: 1.6,
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: radius.full,
                          background: `${theme.blue}18`, color: theme.blue,
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
                      <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: `${theme.red}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AlertTriangle size={14} color={theme.red} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Common Mistakes</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {details.commonMistakes.map((m, i) => (
                        <motion.div
                          key={i} custom={i} variants={listItemVariant}
                          initial="hidden" animate="visible"
                          style={{
                            display: "flex", gap: 6, alignItems: "flex-start",
                            fontSize: 11.5, color: theme.textMuted, lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: theme.red, flexShrink: 0, fontSize: 10 }}>✕</span>
                          <span>{m}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {details?.proTips && (
                  <motion.div custom={3} variants={sectionVariant} initial="hidden" animate="visible">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: `${theme.yellow}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Lightbulb size={14} color={theme.yellow} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Pro Tips</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {details.proTips.map((tip, i) => (
                        <motion.div
                          key={i} custom={i} variants={listItemVariant}
                          initial="hidden" animate="visible"
                          style={{
                            display: "flex", gap: 6, alignItems: "flex-start",
                            fontSize: 11.5, color: theme.textMuted, lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: theme.yellow, flexShrink: 0, fontSize: 10 }}>✦</span>
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
                    background: `${theme.red}08`,
                    border: `1px solid ${theme.red}20`,
                    borderRadius: radius.md,
                    padding: "12px 14px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <Shield size={16} color={theme.red} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: theme.red, marginBottom: 3 }}>Safety Warning</div>
                      <div style={{ fontSize: 11.5, color: theme.textMuted, lineHeight: 1.6 }}>{details.safety}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {similar.length > 0 && (
                <motion.div custom={5} variants={sectionVariant} initial="hidden" animate="visible">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: radius.sm, background: `${theme.green}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <RefreshCw size={14} color={theme.green} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Similar Exercises</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {similar.map((ex, i) => (
                      <motion.div
                        key={ex.id} custom={i} variants={listItemVariant}
                        initial="hidden" animate="visible"
                        onClick={() => { onClose(); onSelectExercise?.(ex); }}
                        style={{
                          background: theme.bgCard2,
                          border: `1px solid ${theme.border}`,
                          borderRadius: radius.md,
                          padding: "10px 12px",
                          cursor: "pointer",
                        }}
                        whileHover={{ y: -2, borderColor: `${muscleColor[ex.muscle] || theme.red}40` }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, marginBottom: 3 }}>{ex.name}</div>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <Tag label={ex.muscle} color={muscleColor[ex.muscle] || theme.red} />
                          <span style={{ fontSize: 10, color: theme.textMuted }}>{ex.sets}×{ex.reps}</span>
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
                  background: theme.bgCard2, border: `1px solid ${theme.border}`,
                  color: theme.textMuted, fontSize: 13, fontWeight: 500,
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
