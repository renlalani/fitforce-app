import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, Plus, Minus, Utensils, Star, Clock, Salad, Zap,
  Heart, TrendingUp, Activity, Flame, Sparkles, ChevronRight,
} from "lucide-react";
import { theme, radius, shadow, transition } from "../styles/designSystem";
import { FOOD_DB } from "../data/fitness";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";

const MEAL_TIMES = ["Breakfast", "Lunch", "Post-Workout", "Dinner", "Snack"];
const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", "Post-Workout": "⚡", Dinner: "🌙", Snack: "🍿" };

const RECENT_KEY = "fitforce_recent_foods";
const FAV_KEY = "fitforce_fav_foods";

function load(key, fallback) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
}
function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch {}
}

function HealthyScore({ score, size = 20 }) {
  const color = score >= 8 ? theme.green : score >= 6 ? theme.yellow : theme.orange;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <Heart size={size - 6} color={color} fill={color} />
      <span style={{ fontSize: size - 8, fontWeight: 600, color }}>{score}/10</span>
    </div>
  );
}

function FoodDetailCard({ food, qty, onQtyChange, isFav, onToggleFav }) {
  const c = food;
  const totalCal = Math.round(c.cal * qty);
  const totalProt = Math.round(c.protein * qty);
  const totalCarbs = Math.round(c.carbs * qty);
  const totalFat = Math.round(c.fat * qty);
  const totalFiber = Math.round((c.fiber || 0) * qty);
  const totalSugar = Math.round((c.sugar || 0) * qty);

  const calPct = Math.min(100, (c.cal / 500) * 100);
  const protPct = Math.min(100, (c.protein / 30) * 100);
  const carbsPct = Math.min(100, (c.carbs / 50) * 100);
  const fatPct = Math.min(100, (c.fat / 20) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ background: theme.bgCard2, borderRadius: radius.md, padding: "14px", marginBottom: 12, border: `1px solid ${theme.border}` }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{c.emoji || "🍽️"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{c.name}</div>
            <div style={{ fontSize: 10, color: theme.textMuted }}>Per {c.serving || "serving"} · <HealthyScore score={c.healthyScore || 5} size={16} /></div>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onToggleFav(c.name); }}
          style={{ background: "transparent", border: "none", color: isFav ? theme.yellow : theme.textDim, cursor: "pointer", padding: 4 }}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={16} fill={isFav ? theme.yellow : "none"} />
        </motion.button>
      </div>

      {/* Macro ratio bar */}
      <div style={{ display: "flex", gap: 2, height: 4, marginBottom: 10, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ flex: calPct * 3, background: theme.red, opacity: 0.6 }} title="Calorie density" />
        <div style={{ flex: protPct * 3, background: theme.blue, opacity: 0.6 }} title="Protein" />
        <div style={{ flex: carbsPct, background: theme.yellow, opacity: 0.6 }} title="Carbs" />
        <div style={{ flex: fatPct * 2, background: theme.green, opacity: 0.6 }} title="Fat" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          ["Calories", totalCal, theme.red, "kcal"],
          ["Protein", totalProt, theme.blue, "g"],
          ["Carbs", totalCarbs, theme.yellow, "g"],
          ["Fat", totalFat, theme.green, "g"],
          ["Fiber", totalFiber, theme.teal, "g"],
          ["Sugar", totalSugar, theme.orange, "g"],
        ].map(([l, v, c, u]) => (
          <div key={l} style={{ background: theme.bgCard3, borderRadius: radius.sm, padding: "6px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 9, color: theme.textMuted }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Quantity selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: 11, color: theme.textMuted }}>Servings:</span>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => onQtyChange(Math.max(0.5, qty - 0.5))}
          style={{ background: theme.bgCard3, border: `1px solid ${theme.border2}`, borderRadius: radius.sm, color: theme.text, cursor: "pointer", padding: "4px 8px", display: "flex" }}
          aria-label="Decrease serving"
        >
          <Minus size={13} />
        </motion.button>
        <span style={{ fontSize: 14, fontWeight: 600, color: theme.text, minWidth: 30, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>
          {qty}
        </span>
        <motion.button whileTap={{ scale: 0.9 }}
          onClick={() => onQtyChange(qty + 0.5)}
          style={{ background: theme.bgCard3, border: `1px solid ${theme.border2}`, borderRadius: radius.sm, color: theme.text, cursor: "pointer", padding: "4px 8px", display: "flex" }}
          aria-label="Increase serving"
        >
          <Plus size={13} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function FoodPickerModal({ onAdd, onClose, initialFood }) {
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState(1);
  const [mealTime, setMealTime] = useState("Breakfast");
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("search");

  const [custom, setCustom] = useState({ name: "", cal: "", protein: "", carbs: "", fat: "" });
  const [favorites, setFavorites] = useState(() => load(FAV_KEY, []));
  const [recent, setRecent] = useState(() => load(RECENT_KEY, []));
  const searchRef = useRef(null);

  useEffect(() => { save(FAV_KEY, favorites); }, [favorites]);
  useEffect(() => { save(RECENT_KEY, recent); }, [recent]);
  useEffect(() => { if (mode === "search") searchRef.current?.focus(); }, [mode]);

  useEffect(() => {
    if (initialFood) {
      setSearch(initialFood.name);
      setSelected(initialFood);
      setMode("search");
    }
  }, [initialFood]);

  const toggleFav = useCallback((name) => {
    setFavorites(p => p.includes(name) ? p.filter(n => n !== name) : [...p, name]);
  }, []);

  const addRecent = useCallback((name) => {
    setRecent(p => {
      const filtered = p.filter(n => n !== name);
      return [name, ...filtered].slice(0, 15);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return FOOD_DB.filter(f => f.name.toLowerCase().includes(q));
  }, [search]);

  const favItems = useMemo(() => FOOD_DB.filter(f => favorites.includes(f.name)), [favorites]);
  const recentItems = useMemo(() => recent.map(n => FOOD_DB.find(f => f.name === n)).filter(Boolean), [recent]);

  const calc = useCallback((f) => selected ? Math.round(selected[f] * qty) : 0, [selected, qty]);

  const handleSelect = useCallback((food) => {
    setSelected(food);
    setSearch(food.name);
    addRecent(food.name);
  }, [addRecent]);

  const handleQuickAdd = useCallback((meal) => {
    onAdd({ ...meal, mealTime, qty: 1 });
    onClose();
  }, [mealTime, onAdd, onClose]);

  const handleAdd = useCallback(() => {
    const food = mode === "custom"
      ? { name: custom.name, mealTime, qty: 1, cal: Math.round(+custom.cal || 0), protein: Math.round(+custom.protein || 0), carbs: Math.round(+custom.carbs || 0), fat: Math.round(+custom.fat || 0), fiber: 0, sugar: 0 }
      : { name: selected.name, mealTime, qty, cal: calc("cal"), protein: calc("protein"), carbs: calc("carbs"), fat: calc("fat"), fiber: Math.round((selected.fiber || 0) * qty), sugar: Math.round((selected.sugar || 0) * qty) };
    onAdd(food);
    onClose();
  }, [mode, custom, selected, mealTime, qty, calc, onAdd, onClose]);

  const canAdd = mode === "custom" ? (custom.name && custom.cal) : selected !== null;

  const tabs = [
    { id: "search", label: "Search", icon: Search },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "custom", label: "Manual", icon: Plus },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          background: theme.bgCard, border: `1px solid ${theme.border2}`,
          borderRadius: radius.xl, padding: "24px", width: "100%", maxWidth: 520,
          boxShadow: shadow.modal, maxHeight: "90vh", overflowY: "auto",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Add food"
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, background: `${theme.red}15`, borderRadius: radius.sm, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Utensils size={16} color={theme.red} />
            </div>
            <h3 style={{ color: theme.text, margin: 0, fontSize: 16, fontWeight: 600 }}>Add Food</h3>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", padding: 4 }}
            aria-label="Close"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Search always visible */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: theme.bgCard2,
          border: `1px solid ${search ? theme.red + "40" : theme.border2}`,
          borderRadius: radius.md, padding: "0 12px", marginBottom: 12,
          transition: transition.fast,
        }}>
          <Search size={16} color={search ? theme.red : theme.textMuted} />
          <input
            id="food-search" name="foodSearch" type="text" ref={searchRef}
            placeholder="Search foods..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelected(null); }}
            style={{
              flex: 1, background: "transparent", border: "none", padding: "12px 8px",
              color: theme.text, fontSize: 13, outline: "none",
            }}
            autoFocus
            aria-label="Search foods"
          />
          {search && (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}
              onClick={() => { setSearch(""); setSelected(null); }}
              style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", padding: 4 }}
              aria-label="Clear search"
            >
              <X size={14} />
            </motion.button>
          )}
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id} whileTap={{ scale: 0.95 }}
              onClick={() => { setMode(id); setSelected(null); if (id === "search") searchRef.current?.focus(); }}
              style={{
                flex: 1, padding: "8px 4px",
                background: mode === id ? `${theme.red}15` : "transparent",
                border: `1px solid ${mode === id ? theme.red : theme.border2}`,
                borderRadius: radius.sm, color: mode === id ? theme.red : theme.textMuted,
                cursor: "pointer", fontSize: 10, fontWeight: mode === id ? 600 : 400,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                transition: transition.fast,
              }}
              aria-label={label}
              aria-selected={mode === id}
              role="tab"
            >
              <Icon size={14} /> {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "search" && (
            <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Results */}
              {search.trim() && (
                <div style={{ maxHeight: 220, overflowY: "auto", marginBottom: 12 }}>
                  {filtered.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="No foods found"
                      description="Try a different search term or add manually"
                      compact
                    />
                  ) : (
                    filtered.map((food, i) => {
                      const isFav = favorites.includes(food.name);
                      const isSelected = selected?.name === food.name;
                      return (
                        <motion.div
                          key={`food-${food.name}-${i}`}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.015 }}
                          onClick={() => handleSelect(food)}
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 12px",
                            background: isSelected ? `${theme.red}10` : "transparent",
                            borderRadius: radius.md, cursor: "pointer",
                            border: `1px solid ${isSelected ? theme.red + "30" : "transparent"}`,
                            marginBottom: 4, transition: transition.fast,
                          }}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{food.emoji || "🍽️"}</span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {food.name}
                              </div>
                              <div style={{ display: "flex", gap: 6, fontSize: 10, color: theme.textMuted, marginTop: 1 }}>
                                <span style={{ color: theme.red }}>{food.cal} kcal</span>
                                <span style={{ color: theme.blue }}>{food.protein}g P</span>
                                <span style={{ color: theme.teal }}>{food.fiber}g fiber</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <HealthyScore score={food.healthyScore || 5} size={16} />
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); toggleFav(food.name); }}
                              style={{ background: "transparent", border: "none", color: isFav ? theme.yellow : theme.textDim, cursor: "pointer", padding: 4 }}
                              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star size={14} fill={isFav ? theme.yellow : "none"} />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {!search.trim() && (
                <EmptyState icon={Search} title="Search foods" description="Type to search over 30 foods with full nutrition data" compact />
              )}
            </motion.div>
          )}

          {mode === "favorites" && (
            <motion.div key="favorites" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {favItems.length === 0 ? (
                <EmptyState icon={Star} title="No favorites yet" description="Star foods in search to add them here" compact />
              ) : (
                favItems.map((food, i) => (
                  <motion.div key={`fav-${food.name}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelect(food)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: selected?.name === food.name ? `${theme.red}10` : theme.bgCard2, borderRadius: radius.md, cursor: "pointer", marginBottom: 6, border: `1px solid ${selected?.name === food.name ? theme.red + "30" : theme.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{food.emoji || "🍽️"}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{food.name}</div>
                        <div style={{ fontSize: 10, color: theme.textMuted }}>{food.cal} kcal · {food.protein}g P · {food.fiber}g fiber</div>
                      </div>
                    </div>
                    <Star size={14} color={theme.yellow} fill={theme.yellow} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {mode === "recent" && (
            <motion.div key="recent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {recentItems.length === 0 ? (
                <EmptyState icon={Clock} title="No recent foods" description="Foods you search will appear here" compact />
              ) : (
                recentItems.map((food, i) => (
                  <motion.div key={`recent-${food.name}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelect(food)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: selected?.name === food.name ? `${theme.red}10` : theme.bgCard2, borderRadius: radius.md, cursor: "pointer", marginBottom: 6, border: `1px solid ${selected?.name === food.name ? theme.red + "30" : theme.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{food.emoji || "🍽️"}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{food.name}</div>
                        <div style={{ fontSize: 10, color: theme.textMuted }}>{food.cal} kcal · {food.protein}g P</div>
                      </div>
                    </div>
                    <Clock size={13} color={theme.textMuted} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {mode === "custom" && (
            <motion.div key="custom" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                <input id="food-custom-name" name="foodCustomName" placeholder="Food name" value={custom.name}
                  onChange={e => setCustom(p => ({ ...p, name: e.target.value }))} style={inputStyle} aria-label="Food name" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label htmlFor="food-custom-cal" style={{ fontSize: 10, color: theme.textMuted, marginBottom: 4, display: "block" }}>Calories</label>
                    <input id="food-custom-cal" name="foodCustomCal" type="number" placeholder="0" value={custom.cal}
                      onChange={e => setCustom(p => ({ ...p, cal: e.target.value }))} style={inputStyle} aria-label="Calories" />
                  </div>
                  <div>
                    <label htmlFor="food-custom-protein" style={{ fontSize: 10, color: theme.textMuted, marginBottom: 4, display: "block" }}>Protein (g)</label>
                    <input id="food-custom-protein" name="foodCustomProtein" type="number" placeholder="0" value={custom.protein}
                      onChange={e => setCustom(p => ({ ...p, protein: e.target.value }))} style={inputStyle} aria-label="Protein" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <label htmlFor="food-custom-carbs" style={{ fontSize: 10, color: theme.textMuted, marginBottom: 4, display: "block" }}>Carbs (g)</label>
                    <input id="food-custom-carbs" name="foodCustomCarbs" type="number" placeholder="0" value={custom.carbs}
                      onChange={e => setCustom(p => ({ ...p, carbs: e.target.value }))} style={inputStyle} aria-label="Carbs" />
                  </div>
                  <div>
                    <label htmlFor="food-custom-fat" style={{ fontSize: 10, color: theme.textMuted, marginBottom: 4, display: "block" }}>Fat (g)</label>
                    <input id="food-custom-fat" name="foodCustomFat" type="number" placeholder="0" value={custom.fat}
                      onChange={e => setCustom(p => ({ ...p, fat: e.target.value }))} style={inputStyle} aria-label="Fat" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Food detail preview */}
        <AnimatePresence>
          {selected && mode !== "custom" && (
            <FoodDetailCard
              food={selected}
              qty={qty}
              onQtyChange={setQty}
              isFav={favorites.includes(selected.name)}
              onToggleFav={toggleFav}
            />
          )}
        </AnimatePresence>

        {/* Meal time selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6, display: "block" }} id="meal-time-label">Add to</div>
          <div style={{ display: "flex", gap: 6 }} role="radiogroup" aria-labelledby="meal-time-label">
            {MEAL_TIMES.map(mt => (
              <motion.button key={mt} whileTap={{ scale: 0.95 }}
                onClick={() => setMealTime(mt)}
                style={{
                  flex: 1, padding: "8px 4px",
                  background: mealTime === mt ? `${theme.red}15` : "transparent",
                  border: `1px solid ${mealTime === mt ? theme.red : theme.border2}`,
                  borderRadius: radius.sm, color: mealTime === mt ? theme.red : theme.textMuted,
                  cursor: "pointer", fontSize: 11, fontWeight: mealTime === mt ? 600 : 400,
                  transition: transition.fast,
                }}
                role="radio"
                aria-checked={mealTime === mt}
              >
                {MEAL_ICONS[mt]} {mt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Add button */}
        <Button
          onClick={canAdd ? handleAdd : undefined}
          disabled={!canAdd}
          style={{ width: "100%" }}
          variant={canAdd ? "primary" : "ghost"}
        >
          <Plus size={18} />
          {mode === "custom" ? "Add Custom Food" : selected ? `Add to ${mealTime}` : "Select a food"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

const inputStyle = {
  background: theme.bgCard2,
  border: `1px solid ${theme.border2}`,
  borderRadius: radius.md,
  padding: "10px 12px",
  color: theme.text,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
