import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Save, ChevronLeft, ChevronRight, Check, Dumbbell, Clock, Target, AlertCircle, BarChart3, Calendar, Flame, Lightbulb, Sparkles, Star, TrendingUp } from "lucide-react";
import {  radius, shadow, transition } from "../styles/designSystem";
import Button from "./ui/Button";
import { streamAI } from "../utils/api";
import { useWorkoutStore } from "../stores/workoutStore";

const GOALS = ["Muscle Gain", "Fat Loss", "Strength", "Endurance", "General Fitness"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const EQUIPMENT = ["None (Bodyweight)", "Dumbbells Only", "Full Gym", "Home Gym", "Resistance Bands", "Kettlebells"];
const FOCUS = ["Full Body", "Upper Body", "Lower Body", "Push/Pull/Legs", "Bro Split"];
const DURATIONS = ["30 min", "45 min", "60 min", "75 min", "90 min"];
const DAYS = ["2 days", "3 days", "4 days", "5 days", "6 days"];

const stepVariant = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

function PillGroup({ options, value, onChange, label, icon }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => (
          <motion.button
            key={opt}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(opt)}
            style={{
              padding: "8px 16px",
              borderRadius: radius.full,
              border: `1px solid ${value === opt ? "var(--accent)" : "var(--border2)"}`,
              background: value === opt ? `rgba(59,130,246,0.094)` : "var(--bg-card2)",
              color: value === opt ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: value === opt ? 600 : 400,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function DayCard({ day }) {
  return (
    <div style={{
      background: "var(--bg-card2)",
      borderRadius: radius.md,
      border: `1px solid var(--border)`,
      padding: "14px",
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 8,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <Dumbbell size={13} /> {day.day}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {day.exercises?.map((ex, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "6px 8px", background: "var(--bg-card3)", borderRadius: radius.sm,
            fontSize: 12,
          }}>
            <span style={{ color: "var(--text)", fontWeight: 500 }}>{ex.name}</span>
            <div style={{ display: "flex", gap: 8, color: "var(--text-muted)", fontSize: 11 }}>
              <span style={{ color: "var(--accent)" }}>{ex.sets}×{ex.reps}</span>
              {ex.rest && <span style={{ color: "var(--yellow)" }}>{ex.rest}s</span>}
            </div>
          </div>
        ))}
      </div>
      {day.notes && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
          <Lightbulb size={14} /> {day.notes}
        </div>
      )}
    </div>
  );
}

export default function WorkoutGenerator({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("Muscle Gain");
  const [level, setLevel] = useState("Intermediate");
  const [days, setDays] = useState("3 days");
  const [equipment, setEquipment] = useState("Full Gym");
  const [duration, setDuration] = useState("45 min");
  const [focus, setFocus] = useState("Full Body");
  const [injuries, setInjuries] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const abortRef = useRef(null);
  const addWorkoutSession = useWorkoutStore(s => s.completeWorkout);
  const activeWorkout = useWorkoutStore(s => s.activeWorkout);
  const setActiveWorkout = useWorkoutStore(s => s.setActiveWorkout);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError("");
    setResult(null);
    setSaved(false);

    const controller = new AbortController();
    abortRef.current = controller;

    const systemPrompt = `You are a professional fitness trainer and workout program designer. Generate a detailed weekly workout plan in JSON format only, no markdown. The response must be a valid JSON object with this structure:
{
  "name": "Plan name",
  "weeklySchedule": [
    {
      "day": "Day 1 - Push",
      "exercises": [
        { "name": "Exercise Name", "sets": 3, "reps": "8-10", "rest": 90 }
      ],
      "notes": "Optional note"
    }
  ],
  "progressiveOverload": "Description of how to progress",
  "estimatedCalories": "calories per session",
  "totalWeeklyCalories": "total",
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const userPrompt = `Create a ${days}/week ${level} ${goal} workout plan.
Equipment: ${equipment}
Session duration: ${duration}
Body focus: ${focus}
${injuries ? `Injuries/limitations to consider: ${injuries}` : ""}

Include specific exercises with sets, reps, and rest times. Make it realistic and follow proven training principles.`;

    try {
      let fullResponse = "";
      await streamAI({
        messages: [{ role: "user", content: userPrompt }],
        system: systemPrompt,
        maxTokens: 2048,
        signal: controller.signal,
        onChunk: (text) => { fullResponse = text; },
      });

      const cleaned = fullResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setResult(parsed);
      setStep(2);
    } catch (err) {
      if (err?.rateLimited) {
        setError("Rate limited. Please wait before generating again.");
      } else if (err.name !== "AbortError") {
        setError(err?.message || "Failed to generate. Please try again.");
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [goal, level, days, equipment, duration, focus, injuries]);

  const handleSave = useCallback(() => {
    if (!result) return;
    try {
      const plan = {
        id: Date.now(),
        name: result.name || `${goal} - ${focus}`,
        level,
        days: parseInt(days),
        duration,
        goal,
        exercises: result.weeklySchedule?.flatMap(d => d.exercises?.map(e => e.name)) || [],
        weeklySchedule: result.weeklySchedule,
        createdAt: new Date().toLocaleDateString(),
      };
      const stored = JSON.parse(localStorage.getItem("fitforce-saved-plans") || "[]");
      stored.push(plan);
      localStorage.setItem("fitforce-saved-plans", JSON.stringify(stored));
      setSaved(true);
    } catch { }
  }, [result, goal, level, days, duration]);

  const handleStartWorkout = useCallback(async () => {
    if (!result) return;
    try {
      const exNames = result.weeklySchedule?.[0]?.exercises?.map(e => e.name) || [];
      const { EXERCISES } = await import("../data/fitness");
      const matched = EXERCISES.filter(e => exNames.includes(e.name));
      const plan = {
        id: Date.now(),
        name: result.name || `${goal} Workout`,
        level,
        duration,
        exercises: matched.length > 0 ? matched.map(e => e.id) : [],
        weeklySchedule: result.weeklySchedule,
      };
      setActiveWorkout(plan);
      onClose();
    } catch { }
  }, [result, goal, level, duration, setActiveWorkout, onClose]);

  const isLoading = generating;

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
          onClick={(e) => { if (e.target === e.currentTarget) { onClose(); setStep(0); setResult(null); } }}
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
              maxWidth: 520,
              boxShadow: shadow.modal,
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <div style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "var(--bg-card)",
              borderBottom: `1px solid var(--border)`,
              padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: radius.md,
                  background: `rgba(59,130,246,0.094)`, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Wand2 size={16} color={"var(--accent)"} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>AI Workout Generator</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Create a personalized workout plan</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { onClose(); setStep(0); setResult(null); }}
                style={{
                  background: "var(--bg-card2)", border: "none",
                  borderRadius: radius.full, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-muted)",
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            <div style={{ padding: "20px" }}>
              {step === 0 && (
                <motion.div key="step0" variants={stepVariant} initial="enter" animate="center" exit="exit">
                  <PillGroup icon={<Target size={16} />} label="What's your goal?" options={GOALS} value={goal} onChange={setGoal} />
                  <PillGroup icon={<BarChart3 size={16} />} label="Experience level" options={LEVELS} value={level} onChange={setLevel} />
                  <PillGroup icon={<Calendar size={16} />} label="Days per week" options={DAYS} value={days} onChange={setDays} />
                  <PillGroup icon={<Dumbbell size={16} />} label="Available equipment" options={EQUIPMENT} value={equipment} onChange={setEquipment} />
                  <PillGroup icon={<Clock size={16} />} label="Session duration" options={DURATIONS} value={duration} onChange={setDuration} />
                  <PillGroup icon={<Target size={16} />} label="Body focus" options={FOCUS} value={focus} onChange={setFocus} />

                  <div style={{ marginBottom: 18 }}>
                    <label htmlFor="wg-injuries" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <AlertCircle size={14} color={"var(--yellow)"} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Injuries / Limitations (optional)</span>
                    </label>
                    <textarea
                      id="wg-injuries"
                      name="wgInjuries"
                      value={injuries}
                      onChange={e => setInjuries(e.target.value)}
                      placeholder="E.g., lower back pain, knee issues, shoulder impingement..."
                      rows={2}
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: radius.md,
                        background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                        color: "var(--text)", fontSize: 12, outline: "none", resize: "none",
                        fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <Button onClick={() => setStep(1)} style={{ width: "100%" }}>
                    Continue <ChevronRight size={16} />
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" variants={stepVariant} initial="enter" animate="center" exit="exit">
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Review your selections</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["Goal", goal], ["Level", level], ["Days", days],
                        ["Equipment", equipment], ["Duration", duration], ["Focus", focus],
                      ].map(([l, v]) => (
                        <div key={l} style={{
                          background: "var(--bg-card2)", borderRadius: radius.sm,
                          padding: "8px 10px", border: `1px solid var(--border)`,
                        }}>
                          <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>{l}</div>
                          <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" onClick={() => setStep(0)} style={{ flex: 1 }}>
                      <ChevronLeft size={16} /> Back
                    </Button>
                    <Button onClick={handleGenerate} disabled={isLoading} style={{ flex: 1 }}>
                      {isLoading ? "Generating..." : <><Sparkles size={16} /> Generate Plan</>}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && result && (
                <motion.div key="step2" variants={stepVariant} initial="enter" animate="center" exit="exit">
                  {error && (
                    <div style={{
                      background: `rgba(239,68,68,0.063)`, border: `1px solid rgba(239,68,68,0.145)`,
                      borderRadius: radius.md, padding: "10px 14px", marginBottom: 16,
                      fontSize: 12, color: "var(--red)",
                    }}>
                      {error}
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                      {result.name || `${goal} Plan`}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: radius.full,
                        background: `rgba(16,185,129,0.082)`, color: "var(--green)", fontWeight: 500,
                      }}>{level}</div>
                      <div style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: radius.full,
                        background: `rgba(245,158,11,0.082)`, color: "var(--yellow)", fontWeight: 500,
                      }}>{goal}</div>
                      {result.estimatedCalories && (
                        <div style={{
                          fontSize: 11, padding: "3px 10px", borderRadius: radius.full,
                          background: `rgba(249,115,22,0.082)`, color: "var(--orange)", fontWeight: 500,
                        }}><Flame size={14} /> {result.estimatedCalories}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {result.weeklySchedule?.map((day, i) => (
                      <DayCard key={i} day={day} />
                    ))}
                  </div>

                  {result.progressiveOverload && (
                    <div style={{
                      background: `rgba(59,130,246,0.031)`, border: `1px solid rgba(59,130,246,0.125)`,
                      borderRadius: radius.md, padding: "12px 14px", marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 4 }}><TrendingUp size={14} /> Progressive Overload</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{result.progressiveOverload}</div>
                    </div>
                  )}

                  {result.tips?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}><Lightbulb size={14} /> Tips</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {result.tips.map((tip, i) => (
                          <div key={i} style={{
                            display: "flex", gap: 6, alignItems: "flex-start",
                            fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5,
                          }}>
                            <span style={{ color: "var(--yellow)", flexShrink: 0 }}><Star size={12} /></span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" onClick={handleStartWorkout} style={{ flex: 1 }}>
                      <Dumbbell size={14} /> Start
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saved}
                      style={{
                        flex: 1,
                        background: saved ? `rgba(16,185,129,0.125)` : undefined,
                        color: saved ? "var(--green)" : undefined,
                      }}
                    >
                      {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Plan</>}
                    </Button>
                  </div>
                </motion.div>
              )}

              {isLoading && step === 1 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: `3px solid var(--border)`,
                      borderTopColor: "var(--accent)",
                      margin: "0 auto 16px",
                    }}
                  />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                    Creating your workout plan...
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Analyzing your preferences and designing the perfect routine
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


