import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, Trash2, Check, X, TrendingUp,
  Dumbbell, Zap, Brain, BarChart3
} from "lucide-react";
import {  radius } from "../styles/designSystem";
import { useGoalsStore } from "../stores/goalsStore";
import Button from "./ui/Button";

const CATEGORIES = () => [
  { id: "body", label: "Body", icon: TrendingUp, color: "var(--accent)" },
  { id: "strength", label: "Strength", icon: Dumbbell, color: "var(--blue)" },
  { id: "consistency", label: "Consistency", icon: Zap, color: "var(--yellow)" },
  { id: "nutrition", label: "Nutrition", icon: Brain, color: "var(--green)" },
  { id: "endurance", label: "Endurance", icon: BarChart3, color: "var(--purple)" },
];

const SUGGESTED_GOALS = [
  { title: "Lose Weight", target: "Lose 5kg in 3 months", category: "body" },
  { title: "Build Muscle", target: "Gain 3kg lean mass", category: "body" },
  { title: "Improve Endurance", target: "Run 5km without stopping", category: "endurance" },
  { title: "Gain Strength", target: "Increase bench by 15kg", category: "strength" },
  { title: "Improve Consistency", target: "4 workouts per week", category: "consistency" },
  { title: "Better Nutrition", target: "Hit protein goal 6 days/week", category: "nutrition" },
];

export default function AIGoals() {
  const uid = useId();
  const goals = useGoalsStore(s => s.goals);
  const addGoal = useGoalsStore(s => s.addGoal);
  const updateGoal = useGoalsStore(s => s.updateGoal);
  const deleteGoal = useGoalsStore(s => s.deleteGoal);
  const toggleGoal = useGoalsStore(s => s.toggleGoal);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", target: "", category: "body" });

  const handleAdd = () => {
    if (!newGoal.title.trim()) return;
    addGoal({
      title: newGoal.title.trim(),
      target: newGoal.target.trim() || "Track progress",
      category: newGoal.category,
    });
    setNewGoal({ title: "", target: "", category: "body" });
    setShowForm(false);
  };

  const activeGoals = goals.filter(g => g.active);
  const completedGoals = goals.filter(g => !g.active);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: radius.md,
          background: `rgba(249,115,22,0.094)`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Target size={14} color={"var(--orange)"} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>AI Goals</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {activeGoals.length} active
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 12 }}
          >
            <div style={{
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, padding: "14px",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>New Goal</div>
              <input id={`${uid}-title`} name="goal-title" aria-label="Goal title" value={newGoal.title} onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                placeholder="Goal title (e.g., Build Muscle)"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box",
                  background: "var(--bg-card3)", border: `1px solid var(--border2)`,
                  color: "var(--text)", fontSize: 13, outline: "none", marginBottom: 8,
                }} />
              <input id={`${uid}-target`} name="goal-target" aria-label="Goal target" value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))}
                placeholder="Target (e.g., Gain 5kg lean mass)"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box",
                  background: "var(--bg-card3)", border: `1px solid var(--border2)`,
                  color: "var(--text)", fontSize: 13, outline: "none", marginBottom: 10,
                }} />
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {CATEGORIES().map(c => (
                  <motion.button key={c.id} whileTap={{ scale: 0.95 }}
                    onClick={() => setNewGoal(p => ({ ...p, category: c.id }))}
                    style={{
                      padding: "5px 12px", borderRadius: radius.full, fontSize: 11,
                      border: `1px solid ${newGoal.category === c.id ? c.color : "var(--border2)"}`,
                      background: newGoal.category === c.id ? `${c.color}15` : "transparent",
                      color: newGoal.category === c.id ? c.color : "var(--text-muted)",
                      cursor: "pointer", fontWeight: newGoal.category === c.id ? 500 : 400,
                    }}>
                    {c.label}
                  </motion.button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!newGoal.title.trim()} style={{ flex: 1 }}>
                  <Plus size={14} /> Add Goal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {activeGoals.map((goal, i) => {
          const cat = CATEGORIES().find(c => c.id === goal.category);
          const IconComp = cat?.icon;
          return (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {cat && (
                    <div style={{
                      width: 22, height: 22, borderRadius: radius.sm,
                      background: `${cat.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {IconComp && <IconComp size={11} color={cat.color} />}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{goal.title}</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{goal.target}</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => toggleGoal(goal.id)}
                  style={{
                    background: "transparent", border: "none",
                    color: "var(--green)", cursor: "pointer", padding: 3,
                  }} title="Mark complete">
                  <Check size={14} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }}
                  onClick={() => deleteGoal(goal.id)}
                  style={{
                    background: "transparent", border: "none",
                    color: "var(--red)", cursor: "pointer", padding: 3,
                  }} title="Delete">
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </div>
            <div style={{
              height: 4, background: "var(--border)", borderRadius: radius.full,
              overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                style={{
                  height: "100%",
                  background: cat?.color || "var(--accent)",
                  borderRadius: radius.full,
                }}
              />
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", marginTop: 4,
              fontSize: 10, color: "var(--text-muted)",
            }}>
              <span>{goal.progress}% complete</span>
              <span>{new Date(goal.createdAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
          );
        })}
      </div>

      {!showForm && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          style={{
            width: "100%", padding: "10px",
            background: "var(--bg-card2)", border: `1px dashed var(--border2)`,
            borderRadius: radius.md, color: "var(--text-muted)", cursor: "pointer",
            fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            marginBottom: 14,
          }}
        >
          <Plus size={14} /> Add Goal
        </motion.button>
      )}

      {activeGoals.length === 0 && !showForm && (
        <div style={{
          background: "var(--bg-card2)", border: `1px solid var(--border)`,
          borderRadius: radius.md, padding: "16px", textAlign: "center", marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
            Try an AI-suggested goal
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SUGGESTED_GOALS.slice(0, 3).map((sg, i) => (
              <motion.div key={sg.title} whileHover={{ borderColor: "rgba(59,130,246,0.251)" }} whileTap={{ scale: 0.98 }}
                onClick={() => {
                  addGoal({ title: sg.title, target: sg.target, category: sg.category });
                }}
                style={{
                  padding: "10px 12px", background: "var(--bg-card3)",
                  border: `1px solid var(--border)`, borderRadius: radius.md,
                  cursor: "pointer", textAlign: "left",
                }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{sg.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sg.target}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>
            Completed ({completedGoals.length})
          </div>
          {completedGoals.map(g => (
            <div key={g.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", opacity: 0.5,
              fontSize: 12, color: "var(--text-muted)",
            }}>
              <Check size={12} color={"var(--green)"} />
              <span style={{ textDecoration: "line-through" }}>{g.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


