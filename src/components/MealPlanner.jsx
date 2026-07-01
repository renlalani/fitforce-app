import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Check, ChefHat, ShoppingCart, Apple, Flame, DollarSign, Utensils, Target, Dumbbell, Hash, Circle, Lightbulb, Star } from "lucide-react";
import {  radius, shadow } from "../styles/designSystem";
import Button from "./ui/Button";
import { streamAI } from "../utils/api";
import { useNutritionStore } from "../stores/nutritionStore";

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
              transition: "all 0.2s ease",
            }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function MealCard({ title, foods, cal }) {
  return (
    <div style={{
      background: "var(--bg-card2)",
      borderRadius: radius.md,
      border: `1px solid var(--border)`,
      padding: "12px 14px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{title}</div>
        <div style={{ fontSize: 11, color: "var(--orange)", fontWeight: 500 }}>~{cal} cal</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {foods?.map((f, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--text)", padding: "3px 0",
            borderBottom: i < foods.length - 1 ? `1px solid var(--border)` : "none",
          }}>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MealPlanner({ open, onClose }) {
  const [calories, setCalories] = useState("2200");
  const [protein, setProtein] = useState("140");
  const [diet, setDiet] = useState("Non-Vegetarian");
  const [budget, setBudget] = useState("Moderate");
  const [meals, setMeals] = useState("3 meals + snack");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const abortRef = useRef(null);
  const addMeal = useNutritionStore(s => s.addMeal);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError("");
    setResult(null);
    setSaved(false);

    const controller = new AbortController();
    abortRef.current = controller;

    const systemPrompt = `You are a professional nutritionist and meal planning expert. Generate a detailed daily meal plan in JSON format only, no markdown. The response must be a valid JSON object with this structure:
{
  "name": "Meal Plan Name",
  "meals": [
    {
      "title": "Breakfast",
      "foods": ["Food item with portion"],
      "calories": 450,
      "protein": 30,
      "carbs": 45,
      "fat": 15
    }
  ],
  "totalCalories": 2200,
  "totalProtein": 140,
  "totalCarbs": 200,
  "totalFat": 65,
  "shoppingList": ["Item 1", "Item 2"],
  "tips": ["tip1", "tip2"]
}`;

    const userPrompt = `Create a ${diet} meal plan for approximately ${calories} calories and ${protein}g protein.
Budget: ${budget}
Meals: ${meals}
Include realistic food portions and a practical shopping list.`;

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
  }, [calories, protein, diet, budget, meals]);

  const handleSave = useCallback(() => {
    if (!result) return;
    try {
      const plan = {
        id: Date.now(),
        name: result.name || `${diet} Meal Plan`,
        meals: result.meals,
        totalCalories: result.totalCalories,
        totalProtein: result.totalProtein,
        totalCarbs: result.totalCarbs,
        totalFat: result.totalFat,
        shoppingList: result.shoppingList,
        createdAt: new Date().toLocaleDateString(),
      };
      const stored = JSON.parse(localStorage.getItem("fitforce-saved-meals") || "[]");
      stored.push(plan);
      localStorage.setItem("fitforce-saved-meals", JSON.stringify(stored));
      setSaved(true);
    } catch { }
  }, [result, diet]);

  const handleAddToToday = useCallback(() => {
    if (!result) return;
    result.meals?.forEach(meal => {
      meal.foods?.forEach(food => {
        const calPerItem = Math.round(meal.calories / Math.max(1, meal.foods.length));
        const protPerItem = Math.round(meal.protein / Math.max(1, meal.foods.length));
        addMeal({
          name: `${food}`,
          cal: calPerItem,
          protein: protPerItem,
          carbs: Math.round(meal.carbs / Math.max(1, meal.foods.length)),
          fat: Math.round(meal.fat / Math.max(1, meal.foods.length)),
          mealTime: meal.title.toLowerCase().includes("breakfast") ? "Breakfast" :
                     meal.title.toLowerCase().includes("lunch") ? "Lunch" :
                     meal.title.toLowerCase().includes("dinner") ? "Dinner" : "Snack",
        });
      });
    });
    onClose();
  }, [result, addMeal, onClose]);

  const di = [
    ["Non-Vegetarian", "Vegetarian", "Vegan", "Pescatarian"],
    ["Low Budget", "Moderate", "Premium"],
    ["2 meals", "3 meals", "3 meals + snack", "4 meals", "5 meals"],
  ];
  const diLabels = ["Diet", "Budget", "Meals per day"];
  const diIcons = [<Flame size={16} />, <DollarSign size={16} />, <Utensils size={16} />];
  const diValues = [[diet, setDiet], [budget, setBudget], [meals, setMeals]];

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
          onClick={(e) => { if (e.target === e.currentTarget) { onClose(); setResult(null); } }}
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
                  background: `rgba(16,185,129,0.094)`, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <ChefHat size={16} color={"var(--green)"} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>AI Meal Planner</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Generate a personalized meal plan</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { onClose(); setResult(null); }}
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
              {!result && !generating && (
                <motion.div key="form" variants={stepVariant} initial="enter" animate="center" exit="exit">
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <Target size={16} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Daily Targets</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label htmlFor="mp-calories" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Calories</label>
                        <input id="mp-calories" name="mpCalories" type="number" value={calories} onChange={e => setCalories(e.target.value)}
                          style={{
                            width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box",
                            background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                            color: "var(--text)", fontSize: 13, outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label htmlFor="mp-protein" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Protein (g)</label>
                        <input id="mp-protein" name="mpProtein" type="number" value={protein} onChange={e => setProtein(e.target.value)}
                          style={{
                            width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box",
                            background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                            color: "var(--text)", fontSize: 13, outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {diLabels.map((label, i) => (
                    <PillGroup
                      key={i}
                      icon={diIcons[i]}
                      label={label}
                      options={di[i]}
                      value={diValues[i][0]}
                      onChange={diValues[i][1]}
                    />
                  ))}

                  <Button onClick={handleGenerate} style={{ width: "100%" }}>
                    <ChefHat size={16} /> Generate Meal Plan
                  </Button>
                </motion.div>
              )}

              {generating && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: `3px solid var(--border)`,
                      borderTopColor: "var(--green)",
                      margin: "0 auto 16px",
                    }}
                  />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                    Creating your meal plan...
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Crafting delicious meals that match your macros
                  </div>
                </div>
              )}

              {result && !generating && (
                <motion.div key="result" variants={stepVariant} initial="enter" animate="center" exit="exit">
                  {error && (
                    <div style={{
                      background: `rgba(239,68,68,0.063)`, border: `1px solid rgba(239,68,68,0.145)`,
                      borderRadius: radius.md, padding: "10px 14px", marginBottom: 16,
                      fontSize: 12, color: "var(--red)",
                    }}>{error}</div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                      {result.name || "Your Meal Plan"}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: radius.full,
                        background: `rgba(59,130,246,0.082)`, color: "var(--accent)", fontWeight: 500,
                      }}><Flame size={14} /> {result.totalCalories || "—"} cal</div>
                      <div style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: radius.full,
                        background: `rgba(59,130,246,0.082)`, color: "var(--blue)", fontWeight: 500,
                      }}><Dumbbell size={14} /> {result.totalProtein || "—"}g protein</div>
                      <div style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: radius.full,
                        background: `rgba(245,158,11,0.082)`, color: "var(--yellow)", fontWeight: 500,
                      }}><Hash size={14} /> {result.totalCarbs || "—"}g carbs</div>
                      <div style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: radius.full,
                        background: `rgba(249,115,22,0.082)`, color: "var(--orange)", fontWeight: 500,
                      }}><Circle size={14} /> {result.totalFat || "—"}g fat</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {result.meals?.map((meal, i) => (
                      <MealCard key={i} title={meal.title} foods={meal.foods} cal={meal.calories} />
                    ))}
                  </div>

                  {result.shoppingList?.length > 0 && (
                    <div style={{
                      background: `rgba(16,185,129,0.031)`, border: `1px solid rgba(16,185,129,0.125)`,
                      borderRadius: radius.md, padding: "12px 14px", marginBottom: 16,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <ShoppingCart size={14} color={"var(--green)"} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>Shopping List</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {result.shoppingList.map((item, i) => (
                          <div key={i} style={{
                            display: "flex", gap: 6, alignItems: "center",
                            fontSize: 12, color: "var(--text-muted)",
                          }}>
                            <span style={{ color: "var(--green)" }}>•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.tips?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}><Lightbulb size={14} /> Tips</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {result.tips.map((tip, i) => (
                          <div key={i} style={{
                            display: "flex", gap: 6, alignItems: "flex-start",
                            fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5,
                          }}>
                            <Star size={12} color={"var(--yellow)"} />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="secondary" onClick={handleAddToToday} style={{ flex: 1 }}>
                      <Apple size={14} /> Add to Today
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


