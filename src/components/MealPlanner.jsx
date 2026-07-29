import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Save, Check, ChefHat, ShoppingCart, Apple, Flame, DollarSign,
  Utensils, Target, Dumbbell, Hash, Circle, Lightbulb, Star,
  RotateCcw, Printer, RefreshCw, ChevronDown, ChevronUp, Trash2,
  Edit3, Copy, FileText, AlertCircle, Sparkles, ClipboardList,
  Layers, ListChecks, Heart, Plus
} from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import Button from "./ui/Button";
import useAIStream from "../hooks/useAIStream";
import useLoadingProgress from "../hooks/useLoadingProgress";
import LoadingOverlay from "./LoadingOverlay";
import { useNutritionStore } from "../stores/nutritionStore";
import { createPortal } from "react-dom";
import useScrollLock from "../hooks/useScrollLock";

const CATEGORY_KEYWORDS = {
  Protein: ["chicken","beef","pork","fish","salmon","tuna","shrimp","egg","tofu","tempeh","seitan","whey","protein","meat","turkey","lamb","sausage","bacon","steak","ground"],
  Vegetables: ["broccoli","spinach","kale","lettuce","tomato","cucumber","carrot","onion","garlic","pepper","celery","cabbage","cauliflower","zucchini","asparagus","bean","pea","corn","mushroom","avocado","sweet potato","potato","salad","greens"],
  Fruits: ["apple","banana","orange","berry","berries","grape","watermelon","mango","pineapple","kiwi","lemon","lime","peach","pear","plum","cherry","coconut","dates","fruit"],
  Carbohydrates: ["rice","pasta","bread","oat","quinoa","cereal","noodle","wrap","tortilla","bagel","cracker","popcorn","barley","couscous","millet","flour","potato","sweet potato"],
  Dairy: ["milk","cheese","yogurt","cream","butter","cottage cheese","sour cream"],
  "Healthy Fats": ["olive oil","avocado oil","coconut oil","nut","almond","walnut","cashew","peanut","seed","chia","flax","oil","avocado"],
};
const CAT_KEYS = Object.keys(CATEGORY_KEYWORDS);

function categorizeItem(item) {
  const lower = item.toLowerCase();
  for (const cat of CAT_KEYS) {
    if (CATEGORY_KEYWORDS[cat].some(k => lower.includes(k))) return cat;
  }
  return "Miscellaneous";
}

function categorizeGroceryList(items) {
  if (!items?.length) return {};
  const map = {};
  for (const item of items) {
    const cat = categorizeItem(item);
    (map[cat] || (map[cat] = [])).push(item);
  }
  return map;
}

const CAT_ICONS = { Protein: Dumbbell, Vegetables: ClipboardList, Fruits: Apple, Carbohydrates: Hash, Dairy: Circle, "Healthy Fats": Star, Miscellaneous: Lightbulb };
const CAT_COLORS = { Protein: "var(--red)", Vegetables: "var(--green)", Fruits: "var(--yellow)", Carbohydrates: "var(--orange)", Dairy: "var(--blue)", "Healthy Fats": "var(--purple)", Miscellaneous: "var(--text-muted)" };
const CAT_BG = { Protein: `rgba(239,68,68,0.063)`, Vegetables: `rgba(16,185,129,0.063)`, Fruits: `rgba(245,158,11,0.063)`, Carbohydrates: `rgba(249,115,22,0.063)`, Dairy: `rgba(59,130,246,0.063)`, "Healthy Fats": `rgba(147,51,234,0.063)`, Miscellaneous: `rgba(100,116,139,0.063)` };

const stepVariant = { enter: { opacity: 0, x: 40 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };

function StatCard({ icon: Icon, label, value, unit, color }) {
  return (
    <motion.div whileHover={{ y: -2, scale: 1.02 }} style={{ background: "var(--bg-card2)", borderRadius: radius.md, border: `1px solid var(--border)`, padding: "12px 14px", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
        {value ?? "—"} <span style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>{unit}</span>
      </div>
    </motion.div>
  );
}

function MealCard({ meal, idx, checked, onToggle, open, onToggleOpen }) {
  const mealId = `meal-${idx}`;
  return (
    <motion.div layout style={{ background: "var(--bg-card2)", borderRadius: radius.md, border: `1px solid var(--border)`, overflow: "hidden" }}>
      <motion.button
        whileTap={{ scale: 0.99 }}
        onClick={() => onToggleOpen(idx)}
        aria-expanded={open}
        aria-controls={mealId}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600, textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} color="var(--text-muted)" />
          </motion.div>
          <span style={{ color: "var(--accent)" }}>{meal.title || "Meal"}</span>
        </div>
        <span style={{ fontSize: 12, color: "var(--orange)", fontWeight: 500 }}>≈{meal.calories || "—"} kcal</span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={mealId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              {meal.foods?.map((food, fi) => {
                const cid = `${idx}-${fi}`;
                const isChecked = checked[cid];
                return (
                  <motion.button
                    key={fi}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onToggle(idx, fi)}
                    aria-checked={isChecked}
                    role="checkbox"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: radius.sm, background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", opacity: isChecked ? 0.55 : 1, transition: "opacity 0.2s" }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isChecked ? "var(--accent)" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", background: isChecked ? "var(--accent)" : "transparent", flexShrink: 0 }}>
                      {isChecked && <Check size={12} color="#fff" />}
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text)", textDecoration: isChecked ? "line-through" : "none", transition: "text-decoration 0.2s" }}>{food}</span>
                  </motion.button>
                );
              })}
              {(meal.protein || meal.carbs || meal.fat) && (
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  {meal.protein != null && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: radius.full, background: `rgba(59,130,246,0.063)`, color: "var(--blue)", fontWeight: 500 }}>P: {meal.protein}g</span>}
                  {meal.carbs != null && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: radius.full, background: `rgba(245,158,11,0.063)`, color: "var(--yellow)", fontWeight: 500 }}>C: {meal.carbs}g</span>}
                  {meal.fat != null && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: radius.full, background: `rgba(16,185,129,0.063)`, color: "var(--green)", fontWeight: 500 }}>F: {meal.fat}g</span>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompletionBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div style={{ background: "var(--bg-card2)", borderRadius: radius.md, border: `1px solid var(--border)`, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Meals Completed</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{done} / {total}</span>
      </div>
      <div style={{ height: 8, background: "var(--border2)", borderRadius: 4, overflow: "hidden", marginBottom: done === total && total > 0 ? 10 : 0 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: "easeOut" }} style={{ height: "100%", background: pct === 100 ? "var(--green)" : "var(--accent)", borderRadius: 4 }} />
      </div>
      {done === total && total > 0 && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 13, fontWeight: 600, color: "var(--green)", display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={16} /> Great job! You completed today's meal plan.
        </motion.div>
      )}
    </div>
  );
}

function GroceryListView({ items }) {
  const categorized = useMemo(() => categorizeGroceryList(items), [items]);
  const [openCat, setOpenCat] = useState(null);
  const catEntries = useMemo(() => Object.entries(categorized).filter(([, v]) => v.length > 0), [categorized]);
  if (!catEntries.length) return null;
  return (
    <div style={{ background: `rgba(16,185,129,0.031)`, border: `1px solid rgba(16,185,129,0.125)`, borderRadius: radius.md, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <ShoppingCart size={16} color="var(--green)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>Shopping List</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {catEntries.map(([cat, catItems]) => {
          const Icon = CAT_ICONS[cat] || Lightbulb;
          const color = CAT_COLORS[cat] || "var(--text-muted)";
          const bg = CAT_BG[cat] || `rgba(100,116,139,0.063)`;
          const isOpen = openCat === cat;
          return (
            <div key={cat} style={{ background: bg, borderRadius: radius.sm, overflow: "hidden" }}>
              <button onClick={() => setOpenCat(isOpen ? null : cat)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "transparent", border: "none", cursor: "pointer", color: "var(--text)", fontSize: 12, fontWeight: 600, textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon size={12} color={color} />
                  <span style={{ color }}>{cat}</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{catItems.length} items</span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 10px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                  {catItems.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", padding: "2px 0" }}>
                      <span style={{ color }}>•</span> {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PillGroup({ options, value, onChange, label, icon }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => (
          <motion.button key={opt} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => onChange(opt)}
            style={{
              padding: "8px 16px", borderRadius: radius.full,
              border: `1px solid ${value === opt ? "var(--accent)" : "var(--border2)"}`,
              background: value === opt ? `rgba(59,130,246,0.094)` : "var(--bg-card2)",
              color: value === opt ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer", fontSize: 12, fontWeight: value === opt ? 600 : 400,
              transition: "all 0.2s ease",
            }}
          >{opt}</motion.button>
        ))}
      </div>
    </div>
  );
}

function SavedPlansModal({ open, onClose, onSelect }) {
  const [plans, setPlans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(() => {
    try { setPlans(JSON.parse(localStorage.getItem("fitforce-saved-meals") || "[]")); } catch { setPlans([]); }
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  const del = useCallback((id) => {
    const next = plans.filter(p => p.id !== id);
    setPlans(next);
    localStorage.setItem("fitforce-saved-meals", JSON.stringify(next));
  }, [plans]);

  const rename = useCallback((id) => {
    const next = plans.map(p => p.id === id ? { ...p, name: editName } : p);
    setPlans(next);
    localStorage.setItem("fitforce-saved-meals", JSON.stringify(next));
    setEditingId(null);
  }, [plans, editName]);

  const dup = useCallback((plan) => {
    const copy = { ...plan, id: Date.now(), name: plan.name + " (Copy)", createdAt: new Date().toLocaleDateString() };
    const next = [...plans, copy];
    setPlans(next);
    localStorage.setItem("fitforce-saved-meals", JSON.stringify(next));
  }, [plans]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, background: "var(--overlay)", backdropFilter: "blur(24px)", zIndex: 20000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
            style={{ background: "var(--bg-card)", border: `1px solid var(--border2)`, borderRadius: radius.xl, width: "100%", maxWidth: 480, boxShadow: shadow.modal, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}
          >
            <div style={{ padding: "16px 20px", borderBottom: `1px solid var(--border)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={16} color="var(--accent)" />
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Saved Meal Plans</span>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                style={{ background: "var(--bg-card2)", border: "none", borderRadius: radius.full, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
              ><X size={16} /></motion.button>
            </div>
            <div style={{ padding: "12px 20px", overflowY: "auto", flex: 1 }}>
              {plans.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)", fontSize: 13 }}>No saved meal plans yet.</div>
              ) : plans.slice().reverse().map(p => (
                <motion.div key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ background: "var(--bg-card2)", borderRadius: radius.md, border: `1px solid var(--border)`, padding: "12px 14px", marginBottom: 8 }}>
                  {editingId === p.id ? (
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                        onKeyDown={e => { if (e.key === "Enter") rename(p.id); if (e.key === "Escape") setEditingId(null); }}
                        style={{ flex: 1, padding: "6px 10px", borderRadius: radius.sm, background: "var(--bg-card3)", border: `1px solid var(--accent)`, color: "var(--text)", fontSize: 12, outline: "none" }}
                      />
                      <Button onClick={() => rename(p.id)} style={{ padding: "6px 12px", fontSize: 11 }}>Save</Button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</span>
                      <div style={{ display: "flex", gap: 2 }}>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditingId(p.id); setEditName(p.name); }}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }} title="Rename"><Edit3 size={13} /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => dup(p)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }} title="Duplicate"><Copy size={13} /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => del(p.id)}
                          style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--red)", padding: 4 }} title="Delete"><Trash2 size={13} /></motion.button>
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
                    <span><Flame size={12} /> {p.totalCalories || "—"} kcal</span>
                    <span><Dumbbell size={12} /> {p.totalProtein || "—"}g protein</span>
                    <span>{p.createdAt}</span>
                  </div>
                  <Button onClick={() => { onSelect(p); onClose(); }} style={{ marginTop: 8, padding: "6px 14px", fontSize: 11 }}>
                    <ChefHat size={12} /> Open
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}



export default function MealPlanner({ open, onClose }) {
  useScrollLock(open);
  const [calories, setCalories] = useState("2200");
  const [protein, setProtein] = useState("140");
  const [diet, setDiet] = useState("Non-Vegetarian");
  const [budget, setBudget] = useState("Moderate");
  const [mealCount, setMealCount] = useState("3 meals + snack");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState({});
  const [openMeals, setOpenMeals] = useState({});
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [tip, setTip] = useState("");
  const tipRef = useRef(null);
  const generatingRef = useRef(false);
  const addMeal = useNutritionStore(s => s.addMeal);
  const ai = useAIStream();
  const loading = useLoadingProgress();

  const completedCount = useMemo(() => {
    if (!result?.meals) return 0;
    let count = 0;
    result.meals.forEach((meal, mi) => {
      if (meal.foods?.every((_, fi) => checked[`${mi}-${fi}`])) count++;
    });
    return count;
  }, [result, checked]);

  const handleGenerate = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setGenerating(true);
    setError("");
    setResult(null);
    setChecked({});
    setOpenMeals({});
    setSaved(false);
    setTip("");
    loading.start();
    tipRef.current = setInterval(() => {
      setTip(p => {
        const tips = ["Eating protein with every meal helps preserve muscle during fat loss.","Drink 2-3L of water daily for optimal metabolism.","Include fiber-rich veggies to stay full longer.","Healthy fats support hormone function and vitamin absorption.","Spread protein evenly across meals for better utilization.","Complex carbs provide steady energy throughout the day."];
        const idx = tips.indexOf(p);
        return tips[(idx + 1) % tips.length];
      });
    }, 4000);

    const systemPrompt = `Output ONLY valid JSON: {"name":"...","meals":[{"title":"...","foods":["..."],"calories":N,"protein":N,"carbs":N,"fat":N}],"totalCalories":N,"totalProtein":N,"totalCarbs":N,"totalFat":N,"shoppingList":["..."],"tips":["..."]}`;

    const userPrompt = `Create a ${mealCount} ${diet} meal plan, ~${calories} kcal, ${protein}g protein. Budget: ${budget}. Title: "${calories} kcal ${diet} Meal Plan".`;

    try {
      const fullResponse = await ai.stream({
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        maxTokens: 4096,
        onChunk: (chunk) => {
          try {
            const start = chunk.indexOf("{");
            const end = chunk.lastIndexOf("}");
            if (start !== -1 && end !== -1 && end > start) {
              JSON.parse(chunk.slice(start, end + 1));
              return false;
            }
          } catch {}
        },
      });

      clearInterval(tipRef.current);

      if (!fullResponse || (typeof fullResponse === "string" && !fullResponse.trim())) {
        loading.fail();
        setError("The AI returned an empty response. Please try again.");
        setGenerating(false);
        return;
      }

      let parsed;
      if (typeof fullResponse === "object" && fullResponse !== null) {
        parsed = fullResponse;
      } else if (typeof fullResponse === "string") {
        const cleaned = fullResponse.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          try { parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)); } catch {}
        }
      }

      if (!parsed || typeof parsed !== "object" || !parsed.meals || !Array.isArray(parsed.meals) || parsed.meals.length === 0) {
        loading.fail();
        setError("The AI didn't return a valid meal plan format. Please try again.");
        setGenerating(false);
        return;
      }

      if (!parsed.name || parsed.name === "Meal Plan Name") {
        parsed.name = `${calories} kcal ${diet} Meal Plan`;
      }

      await loading.complete();
      setResult(parsed);
    } catch (err) {
      clearInterval(tipRef.current);
      if (err.code === "LOCKED") return;
      loading.fail();
      if (err.isRateLimited || err?.rateLimited) {
        loading.boost(95);
        setError("The AI is temporarily busy. Please wait a few seconds and try again.");
      } else if (err?.name !== "AbortError") {
        setError(err?.message?.includes("unavailable") ? "We're having trouble generating your plan. Please try again." : "Failed to generate meal plan. Please check your connection and try again.");
      }
    } finally {
      generatingRef.current = false;
      setGenerating(false);
    }
  }, [calories, protein, diet, budget, mealCount, ai.stream, loading]);

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
    } catch {}
  }, [result, diet]);

  const handleAddToToday = useCallback(() => {
    if (!result) return;
    result.meals?.forEach(meal => {
      meal.foods?.forEach(food => {
        const cals = meal.foods.length > 0 ? Math.round(meal.calories / meal.foods.length) : 0;
        const prots = meal.foods.length > 0 ? Math.round(meal.protein / meal.foods.length) : 0;
        addMeal({
          name: food,
          cal: cals,
          protein: prots,
          carbs: meal.foods.length > 0 ? Math.round((meal.carbs || 0) / meal.foods.length) : 0,
          fat: meal.foods.length > 0 ? Math.round((meal.fat || 0) / meal.foods.length) : 0,
          mealTime: meal.title?.toLowerCase().includes("breakfast") ? "Breakfast" :
                     meal.title?.toLowerCase().includes("lunch") ? "Lunch" :
                     meal.title?.toLowerCase().includes("dinner") ? "Dinner" : "Snack",
        });
      });
    });
    onClose();
  }, [result, addMeal, onClose]);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  const onToggleCheck = useCallback((mi, fi) => {
    setChecked(p => ({ ...p, [`${mi}-${fi}`]: !p[`${mi}-${fi}`] }));
  }, []);

  const onToggleMeal = useCallback((mi) => {
    setOpenMeals(p => ({ ...p, [mi]: !p[mi] }));
  }, []);

  const loadSaved = useCallback((plan) => {
    setResult(plan);
    setChecked({});
    setOpenMeals({});
    setSaved(false);
  }, []);

  const handleRegenerate = useCallback(() => {
    setShowConfirm(false);
    handleGenerate();
  }, [handleGenerate]);

  const title = result?.name || (result ? `${calories} kcal ${diet} Meal Plan` : "");

  const di = [["Non-Vegetarian", "Vegetarian", "Vegan", "Pescatarian"], ["Low Budget", "Moderate", "Premium"], ["2 meals", "3 meals", "3 meals + snack", "4 meals", "5 meals"]];
  const diLabels = ["Diet", "Budget", "Meals per day"];
  const diIcons = [<Flame size={16} />, <DollarSign size={16} />, <Utensils size={16} />];
  const diValues = [[diet, setDiet], [budget, setBudget], [mealCount, setMealCount]];

  return createPortal(
    <>
      <SavedPlansModal open={showSaved} onClose={() => setShowSaved(false)} onSelect={loadSaved} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, background: "var(--overlay)", backdropFilter: "blur(24px) saturate(1.4)", WebkitBackdropFilter: "blur(24px) saturate(1.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 12, overflowY: "auto" }}
            onClick={(e) => { if (e.target === e.currentTarget) { onClose(); setResult(null); setError(""); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 30 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ background: "var(--bg-card)", border: `1px solid var(--border2)`, borderRadius: radius.xl, width: "100%", maxWidth: 560, boxShadow: shadow.modal, maxHeight: "92vh", overflowY: "auto", position: "relative" }}
            >
              <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-card)", borderBottom: `1px solid var(--border)`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: `${radius.xl}px ${radius.xl}px 0 0` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: radius.md, background: `rgba(16,185,129,0.094)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChefHat size={16} color="var(--green)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>AI Meal Planner</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Generate a personalized meal plan</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowSaved(true)}
                    style={{ background: "var(--bg-card2)", border: "none", borderRadius: radius.full, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
                    aria-label="Saved plans"
                  ><Layers size={16} /></motion.button>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => { onClose(); setResult(null); setError(""); }}
                    style={{ background: "var(--bg-card2)", border: "none", borderRadius: radius.full, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
                    aria-label="Close"
                  ><X size={16} /></motion.button>
                </div>
              </div>

              <div style={{ padding: "20px" }}>
                <AnimatePresence mode="wait">
                  {error && !generating && !result ? (
                    <motion.div key="error" variants={stepVariant} initial="enter" animate="center" exit="exit" style={{ textAlign: "center", padding: "30px 0" }}>
                      <AlertCircle size={40} color="var(--red)" style={{ marginBottom: 12 }} />
                      <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 8 }}>{error}</div>
                      <Button onClick={handleGenerate}><RefreshCw size={14} /> Try Again</Button>
                    </motion.div>
                  ) : generating ? (
                    <motion.div key="loading" variants={stepVariant} initial="enter" animate="center" exit="exit">
                      <LoadingOverlay progress={loading.progress} stageText={loading.stageText} tip={tip} />
                    </motion.div>
                  ) : result ? (
                    <motion.div key="result" variants={stepVariant} initial="enter" animate="center" exit="exit">
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <StatCard icon={Flame} label="Calories" value={result.totalCalories} unit="kcal" color="var(--orange)" />
                          <StatCard icon={Dumbbell} label="Protein" value={result.totalProtein} unit="g" color="var(--blue)" />
                          <StatCard icon={Hash} label="Carbs" value={result.totalCarbs} unit="g" color="var(--yellow)" />
                          <StatCard icon={Circle} label="Fat" value={result.totalFat} unit="g" color="var(--green)" />
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <CompletionBar done={completedCount} total={result.meals?.length || 0} />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                        {result.meals?.map((meal, i) => (
                          <MealCard key={i} meal={meal} idx={i} checked={checked} onToggle={onToggleCheck} open={openMeals[i]} onToggleOpen={onToggleMeal} />
                        ))}
                      </div>

                      {result.shoppingList?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <GroceryListView items={result.shoppingList} />
                        </div>
                      )}

                      {result.tips?.length > 0 && (
                        <div style={{ marginBottom: 16, background: "var(--bg-card2)", borderRadius: radius.md, border: `1px solid var(--border)`, padding: "14px 16px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            <Lightbulb size={14} color="var(--yellow)" /> Tips
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {result.tips.map((tip, i) => (
                              <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                                <Star size={12} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button onClick={handleSave} disabled={saved} style={{ flex: 1, background: saved ? `rgba(16,185,129,0.125)` : undefined, color: saved ? "var(--green)" : undefined }}>
                            {saved ? <><Check size={14} /> Saved!</> : <><Heart size={14} /> Save Meal Plan</>}
                          </Button>
                          <Button variant="secondary" onClick={() => setShowConfirm(true)} style={{ flex: 1 }}>
                            <RefreshCw size={14} /> Generate Again
                          </Button>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button variant="secondary" onClick={handleExportPDF} style={{ flex: 1 }}>
                            <Printer size={14} /> Export PDF
                          </Button>
                          <Button variant="secondary" onClick={handleAddToToday} style={{ flex: 1 }}>
                            <Apple size={14} /> Add to Today
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
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
                              style={{ width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box", background: "var(--bg-card2)", border: `1px solid var(--border2)`, color: "var(--text)", fontSize: 13, outline: "none" }}
                            />
                          </div>
                          <div>
                            <label htmlFor="mp-protein" style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Protein (g)</label>
                            <input id="mp-protein" name="mpProtein" type="number" value={protein} onChange={e => setProtein(e.target.value)}
                              style={{ width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box", background: "var(--bg-card2)", border: `1px solid var(--border2)`, color: "var(--text)", fontSize: 13, outline: "none" }}
                            />
                          </div>
                        </div>
                      </div>

                      {diLabels.map((label, i) => (
                        <PillGroup key={i} icon={diIcons[i]} label={label} options={di[i]} value={diValues[i][0]} onChange={diValues[i][1]} />
                      ))}

                      <Button onClick={handleGenerate} disabled={generating} style={{ width: "100%" }}>
                        <Sparkles size={16} /> Generate Meal Plan
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm regenerate */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "var(--overlay)", backdropFilter: "blur(12px)", zIndex: 30000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: "var(--bg-card)", border: `1px solid var(--border2)`, borderRadius: radius.xl, padding: "24px", maxWidth: 360, width: "100%", boxShadow: shadow.modal, textAlign: "center" }}
            >
              <RefreshCw size={32} color="var(--accent)" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Generate New Plan?</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
                This will replace your current meal plan and reset all progress.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" onClick={() => setShowConfirm(false)} style={{ flex: 1 }}>Cancel</Button>
                <Button onClick={handleRegenerate} style={{ flex: 1 }}>Generate</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
