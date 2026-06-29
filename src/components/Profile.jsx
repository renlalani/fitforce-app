import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Apple, Flame, Zap, Trophy, TrendingUp, Ruler, Camera } from "lucide-react";
import { theme, radius, shadow, transition, muscleColor } from "../styles/designSystem";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Badge } from "./ui/Tag";
import AnimatedCounter from "./AnimatedCounter";
import ProgressRing from "./ProgressRing";
import StreakCalendar from "./StreakCalendar";
import { useWorkoutStore } from "../stores/workoutStore";
import { useNutritionStore } from "../stores/nutritionStore";
import { useUserStore } from "../stores/userStore";
import { ALL_ACHIEVEMENTS } from "../data/achievements";

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Profile({ profile, setProfile, streak, bodyStats, addBodyStat, measurements, setMeasurements, calGoal, protGoal, bmi, bmiColor }) {
  const xp = useUserStore(s => s.xp);
  const prs = useUserStore(s => s.prs);
  const addPr = useUserStore(s => s.addPr);
  const updatePrWeight = useUserStore(s => s.updatePrWeight);
  const workoutSessions = useWorkoutStore(s => s.workoutSessions);
  const workoutLog = useWorkoutStore(s => s.workoutLog);
  const meals = useNutritionStore(s => s.meals);
  const water = useNutritionStore(s => s.water);
  const [newBodyStat, setNewBodyStat] = useState("");

  const level = Math.floor(xp / 500) + 1;
  const xpToNext = 500 - (xp % 500);
  const weightNum = +profile.weight || 0;

  const totalVolume = useMemo(() =>
    workoutLog.reduce((s, e) => s + (+e.vol || 0), 0),
    [workoutLog]
  );

  const totalCalories = useMemo(() =>
    workoutSessions.reduce((s, ws) => s + (ws.totalCalories || 0), 0),
    [workoutSessions]
  );

  const bestPRs = useMemo(() => {
    const map = {};
    workoutLog.forEach(e => {
      if (!map[e.name] || (+e.weight || 0) > map[e.name].weight) {
        map[e.name] = { name: e.name, weight: +e.weight || 0, date: e.date, reps: e.reps, sets: e.sets };
      }
    });
    return Object.values(map).filter(p => p.weight > 0).sort((a, b) => b.weight - a.weight).slice(0, 5);
  }, [workoutLog]);

  const nutritionStreak = useNutritionStore(s => s.nutritionStreak) || 0;

  const unlockedAchievements = useMemo(() => {
    const userData = {
      workoutSessions, streak, totalVolume, bestPRs,
      nutritionStreak, waterAvg: water, level, xp, prs, totalCalories,
    };
    return ALL_ACHIEVEMENTS.filter(a => a.check(userData));
  }, [workoutSessions, streak, totalVolume, bestPRs, nutritionStreak, water, level, xp, prs, totalCalories]);

  const workoutDates = useMemo(() =>
    workoutSessions.map(ws => new Date(ws.completedAt || ws.date)),
    [workoutSessions]
  );

  const topExercises = useMemo(() => {
    const count = {};
    workoutLog.forEach(e => { count[e.name] = (count[e.name] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [workoutLog]);

  return (
    <motion.div variants={{ animate: { transition: { staggerChildren: 0.04 } } }} initial="initial" animate="animate">
      <motion.h2 variants={itemVariants} style={{ color: theme.text, fontSize: 20, fontWeight: 600, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
        Profile
      </motion.h2>

      {/* Avatar + Stats Header */}
      <motion.div variants={itemVariants} style={{
        background: `linear-gradient(135deg, ${theme.bgCard}, ${theme.bgCard2})`,
        border: `1px solid ${theme.border}`,
        borderRadius: radius.xl,
        padding: "20px",
        marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              width: 60, height: 60,
              background: `linear-gradient(135deg, ${theme.red}, ${theme.redDark})`,
              borderRadius: radius.full,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 26, color: "#fff",
              boxShadow: shadow.glow(theme.red),
              flexShrink: 0,
            }}
          >
            {profile.name?.[0]?.toUpperCase() || "F"}
          </motion.div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 2 }}>
              {profile.name || "Athlete"}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
              <Badge label={profile.level || "Beginner"} color={theme.green} />
              <Badge label={profile.goal || "General Fitness"} color={theme.blue} />
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: theme.textMuted }}>
              <span>Level {level}</span>
              <span>BMI: <span style={{ color: bmiColor, fontWeight: 500 }}>{bmi}</span></span>
              <span>🔥 {streak} day streak</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
          {[
            { icon: Dumbbell, label: "Workouts", value: workoutSessions.length, color: theme.red },
            { icon: Zap, label: "Total XP", value: xp, color: theme.yellow },
            { icon: Apple, label: "Meals", value: meals.length, color: theme.green },
            { icon: Flame, label: "Streak", value: streak, color: theme.orange },
          ].map(s => (
            <div key={s.label} style={{
              textAlign: "center", background: theme.bgCard2,
              borderRadius: radius.md, padding: "10px 6px",
              border: `1px solid ${theme.border}`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>
                <AnimatedCounter value={s.value} />
              </div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Editable Fields */}
      <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 12 }}>
            Edit Profile
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              ["Name", "name", "text"],
              ["Age", "age", "number"],
              ["Weight (kg)", "weight", "number"],
              ["Height (cm)", "height", "number"],
            ].map(([l, k, t]) => (
              <div key={k}>
                <label htmlFor={`pf-${k}`} style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 4 }}>{l}</label>
                <input id={`pf-${k}`} name={`profile${k.charAt(0).toUpperCase() + k.slice(1)}`} type={t} value={profile[k] || ""}
                  onChange={e => setProfile(k, e.target.value)}
                  style={{
                    width: "100%", padding: "8px 10px", borderRadius: radius.md,
                    background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                    color: theme.text, fontSize: 12, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 6 }}>Gender</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Male", "Female", "Other"].map(g => (
                <motion.button key={g} whileTap={{ scale: 0.97 }}
                  onClick={() => setProfile("gender", g)}
                  style={{
                    flex: 1, padding: "8px", borderRadius: radius.md,
                    border: `1px solid ${profile.gender === g ? theme.red : theme.border2}`,
                    background: profile.gender === g ? `${theme.red}15` : "transparent",
                    color: profile.gender === g ? theme.red : theme.textMuted,
                    cursor: "pointer", fontSize: 12,
                    fontWeight: profile.gender === g ? 500 : 400,
                  }}
                >{g}</motion.button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: theme.textMuted, display: "block", marginBottom: 6 }}>Goal</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Muscle Gain", "Fat Loss", "Endurance", "Strength", "General Fitness"].map(g => (
                <motion.button key={g} whileTap={{ scale: 0.95 }}
                  onClick={() => setProfile("goal", g)}
                  style={{
                    padding: "7px 14px", borderRadius: radius.full,
                    border: `1px solid ${profile.goal === g ? theme.red : theme.border2}`,
                    background: profile.goal === g ? `${theme.red}15` : "transparent",
                    color: profile.goal === g ? theme.red : theme.textMuted,
                    cursor: "pointer", fontSize: 11,
                    fontWeight: profile.goal === g ? 500 : 400,
                  }}
                >{g}</motion.button>
              ))}
            </div>
          </div>

          <div style={{
            background: theme.bgCard2, borderRadius: radius.md,
            padding: "12px", border: `1px solid ${theme.border}`,
            fontSize: 12,
          }}>
            <div style={{ color: theme.textMuted, marginBottom: 6, fontWeight: 500 }}>Auto-calculated targets</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
              <div>Calories: <span style={{ color: theme.red, fontWeight: 500 }}>{calGoal} kcal</span></div>
              <div>Protein: <span style={{ color: theme.blue, fontWeight: 500 }}>{protGoal}g</span></div>
              <div>BMI: <span style={{ color: bmiColor, fontWeight: 500 }}>{bmi}</span></div>
              <div>Goal: <span style={{ color: theme.yellow, fontWeight: 500 }}>{profile.goal}</span></div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Workout Statistics */}
      <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Dumbbell size={16} color={theme.red} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Workout Statistics</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["Total Workouts", workoutSessions.length, theme.red],
              ["Total Volume", `${totalVolume.toLocaleString()} kg`, theme.blue],
              ["Calories Burned", `${totalCalories.toLocaleString()} kcal`, theme.orange],
              ["Exercises Logged", workoutLog.length, theme.green],
            ].map(([l, v, c]) => (
              <div key={l} style={{
                background: theme.bgCard2, borderRadius: radius.sm,
                padding: "10px", border: `1px solid ${theme.border}`,
              }}>
                <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{typeof v === "number" ? <AnimatedCounter value={v} /> : v}</div>
              </div>
            ))}
          </div>
          {topExercises.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>Most Performed Exercises</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {topExercises.map(([name, count], i) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: theme.text }}>{i + 1}. {name}</span>
                    <span style={{ color: theme.textMuted }}>{count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Trophy size={16} color={theme.yellow} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>
              Achievements <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: 11 }}>({unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length})</span>
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 }}>
            {ALL_ACHIEVEMENTS.map(a => {
              const unlocked = unlockedAchievements.find(ua => ua.id === a.id);
              return (
                <motion.div
                  key={a.id}
                  whileHover={unlocked ? { scale: 1.08, y: -2 } : {}}
                  style={{
                    background: unlocked ? `${a.color}12` : theme.bgCard2,
                    border: `1px solid ${unlocked ? `${a.color}30` : theme.border}`,
                    borderRadius: radius.md,
                    padding: "10px 6px",
                    textAlign: "center",
                    opacity: unlocked ? 1 : 0.3,
                    cursor: unlocked ? "pointer" : "default",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  title={a.desc}
                >
                  {unlocked && (
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 12 }}
                      style={{
                        position: "absolute", top: -4, right: -4, fontSize: 10,
                      }}
                    >
                      ✨
                    </motion.div>
                  )}
                  <motion.div
                    animate={unlocked ? { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } } : {}}
                    style={{ fontSize: 22, marginBottom: 3 }}
                  >
                    {a.icon}
                  </motion.div>
                  <div style={{ fontSize: 8, color: unlocked ? a.color : theme.textMuted, fontWeight: 500, lineHeight: 1.2 }}>
                    {a.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Body Measurements & Weight */}
      <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Ruler size={16} color={theme.blue} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Body Measurements</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginBottom: 14 }}>
            {Object.entries(measurements).map(([k, v]) => {
              const mid = `pm-${k}`;
              return (
              <div key={k}>
                <label htmlFor={mid} style={{ fontSize: 10, color: theme.textMuted, display: "block", marginBottom: 3, textTransform: "capitalize" }}>{k}</label>
                <input id={mid} name={k} type="number" value={v}
                  onChange={e => setMeasurements(p => ({ ...p, [k]: e.target.value }))}
                  style={{
                    width: "100%", padding: "7px 10px", borderRadius: radius.md, boxSizing: "border-box",
                    background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                    color: theme.text, fontSize: 12, outline: "none",
                  }}
                />
              </div>
              );
            })}
          </div>

          {/* Log Weight */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="log-body-weight" style={{ fontSize: 10, color: theme.textMuted, display: "block", marginBottom: 3 }}>Log Body Weight (kg)</label>
              <input id="log-body-weight" name="logBodyWeight" type="number" step="0.1" value={newBodyStat}
                onChange={e => setNewBodyStat(e.target.value)}
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: radius.md, boxSizing: "border-box",
                  background: theme.bgCard2, border: `1px solid ${theme.border2}`,
                  color: theme.text, fontSize: 12, outline: "none",
                }}
              />
            </div>
            <Button size="sm" onClick={() => {
              if (!newBodyStat) return;
              const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
              addBodyStat({ date: today, weight: +newBodyStat });
              setNewBodyStat("");
            }}>Log</Button>
          </div>
        </Card>
      </motion.div>

      {/* Progress Photos Placeholder */}
      <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Camera size={16} color={theme.purple} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Progress Photos</span>
          </div>
          <div style={{
            background: theme.bgCard2, borderRadius: radius.md,
            border: `2px dashed ${theme.border2}`,
            padding: "24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 4 }}>Track your transformation</div>
            <div style={{ fontSize: 11, color: theme.textDim }}>Progress photos coming soon</div>
          </div>
        </Card>
      </motion.div>

      {/* Activity Calendar */}
      <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>📅</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Activity History</span>
          </div>
          <StreakCalendar workoutDates={workoutDates} nutritionDates={[]} streak={streak} />
        </Card>
      </motion.div>

      {/* Personal Records */}
      <motion.div variants={itemVariants} style={{ marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <TrendingUp size={16} color={theme.yellow} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Personal Records</span>
          </div>
          {bestPRs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bestPRs.map((pr, i) => (
                <div key={`pr-${pr.name}-${i}`} style={{
                  background: theme.bgCard2, borderRadius: radius.md,
                  padding: "10px 12px", border: `1px solid ${theme.border}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{i === 0 ? "👑 " : ""}{pr.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: theme.yellow }}>{pr.weight} kg</span>
                  </div>
                  <div style={{ fontSize: 10, color: theme.textMuted }}>{pr.date} · {pr.reps} reps · {pr.sets} sets</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: theme.textMuted, textAlign: "center", padding: "16px" }}>
              No PRs yet. Start lifting to set your first record!
            </div>
          )}
        </Card>
      </motion.div>


    </motion.div>
  );
}
