import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, X, SlidersHorizontal, ChevronDown, Clock, Dumbbell, Star, ArrowUpDown } from "lucide-react";
import { radius, shadow, transition, muscleColor } from "../styles/designSystem";
import { getEnrichedExercises, MUSCLES, EQUIPMENT_OPTIONS, TYPE_OPTIONS } from "../data/fitness";
import { useUiStore } from "../stores/uiStore";
import { useWorkoutStore } from "../stores/workoutStore";
import ExerciseImage from "./ExerciseImage";
import { Tag, Badge } from "./ui/Tag";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

function highlightText(text, query) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: "rgba(59,130,246,0.18)", color: "var(--accent)", borderRadius: 2, padding: "0 2px" }}>{part}</mark>
      : part
  );
}

function getExerciseCount(log) {
  const counts = {};
  log.forEach(e => { counts[e.name] = (counts[e.name] || 0) + 1; });
  return counts;
}

function getLastUsedDate(log) {
  const dates = {};
  log.forEach(e => {
    const existing = dates[e.name];
    if (!existing || new Date(e.date) > new Date(existing)) {
      dates[e.name] = e.date;
    }
  });
  return dates;
}

function PillFilter({ options, value, onChange, color }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {options.map(o => {
        const active = value === o;
        return (
          <motion.button
            key={o}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(o)}
            style={{
              padding: "5px 12px",
              borderRadius: radius.full,
              border: `1px solid ${active ? (color || "var(--accent)") : "var(--border2)"}`,
              background: active ? `${color || "var(--accent)"}18` : "transparent",
              color: active ? (color || "var(--accent)") : "var(--text-muted)",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: active ? 500 : 400,
              transition: transition.fast,
              whiteSpace: "nowrap",
            }}
          >
            {o}
          </motion.button>
        );
      })}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "name", label: "A-Z", icon: ArrowUpDown },
  { value: "recent", label: "Recently Used", icon: Clock },
  { value: "popular", label: "Most Performed", icon: Star },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function ExerciseSearch({ onSelect }) {
  const exercises = useMemo(() => getEnrichedExercises(), []);

  const searchQuery = useUiStore(s => s.searchQuery);
  const setSearchQuery = useUiStore(s => s.setSearchQuery);
  const filterMuscle = useUiStore(s => s.filterMuscle);
  const setFilterMuscle = useUiStore(s => s.setFilterMuscle);
  const filterLevel = useUiStore(s => s.filterLevel);
  const setFilterLevel = useUiStore(s => s.setFilterLevel);
  const filterEquipment = useUiStore(s => s.filterEquipment);
  const setFilterEquipment = useUiStore(s => s.setFilterEquipment);
  const filterType = useUiStore(s => s.filterType);
  const setFilterType = useUiStore(s => s.setFilterType);
  const sortBy = useUiStore(s => s.sortBy);
  const setSortBy = useUiStore(s => s.setSortBy);
  const favorites = useUiStore(s => s.favorites);
  const toggleFavorite = useUiStore(s => s.toggleFavorite);

  const workoutLog = useWorkoutStore(s => s.workoutLog);
  const exerciseCounts = useMemo(() => getExerciseCount(workoutLog), [workoutLog]);
  const lastUsedDate = useMemo(() => getLastUsedDate(workoutLog), [workoutLog]);

  const [showFilters, setShowFilters] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filtered = useMemo(() => {
    let result = exercises;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.muscle.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      );
    }
    if (filterMuscle !== "All") result = result.filter(e => e.muscle === filterMuscle);
    if (filterLevel !== "All") result = result.filter(e => e.level === filterLevel);
    if (filterEquipment !== "All") {
      result = result.filter(e => e.equipment.toLowerCase().includes(filterEquipment.toLowerCase()));
    }
    if (filterType !== "All") result = result.filter(e => e.type === filterType);
    if (favoritesOnly) result = result.filter(e => favorites.includes(e.id));

    result.sort((a, b) => {
      if (sortBy === "recent") {
        const da = lastUsedDate[a.name] || "";
        const db = lastUsedDate[b.name] || "";
        if (da && db) return new Date(db) - new Date(da);
        if (da) return -1;
        if (db) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "popular") {
        return (exerciseCounts[b.name] || 0) - (exerciseCounts[a.name] || 0);
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [exercises, searchQuery, filterMuscle, filterLevel, filterEquipment, filterType, sortBy, favoritesOnly, favorites, exerciseCounts, lastUsedDate]);

  const clearAll = useCallback(() => {
    setSearchQuery("");
    setFilterMuscle("All");
    setFilterLevel("All");
    setFilterEquipment("All");
    setFilterType("All");
    setSortBy("name");
    setFavoritesOnly(false);
  }, [setSearchQuery, setFilterMuscle, setFilterLevel, setFilterEquipment, setFilterType, setSortBy]);

  const hasActiveFilters = filterMuscle !== "All" || filterLevel !== "All" || filterEquipment !== "All" || filterType !== "All" || searchQuery || favoritesOnly;
  const activeCount = [filterMuscle !== "All", filterLevel !== "All", filterEquipment !== "All", filterType !== "All", favoritesOnly].filter(Boolean).length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Search Bar */}
      <motion.div variants={itemVariants} style={{ position: "relative", marginBottom: 12 }}>
        <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 36px 12px 40px",
            background: "var(--bg-card2)",
            border: `1px solid var(--border2)`,
            borderRadius: radius.xl,
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 450,
            outline: "none",
            boxSizing: "border-box",
            transition: transition.normal,
          }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e => e.target.style.borderColor = "var(--border2)"}
        />
        {searchQuery && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSearchQuery("")}
            style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              background: "var(--bg-card3)", border: "none", borderRadius: "50%",
              width: 22, height: 22, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "var(--text-muted)",
            }}
          >
            <X size={12} />
          </motion.button>
        )}
      </motion.div>

      {/* Filter Toggle Row */}
      <motion.div variants={itemVariants} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(p => !p)}
          style={{
            padding: "6px 14px",
            borderRadius: radius.full,
            border: `1px solid ${showFilters ? "var(--accent)" : "var(--border2)"}`,
            background: showFilters ? "rgba(59,130,246,0.082)" : "transparent",
            color: showFilters ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer", fontSize: 11, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 5,
            transition: transition.fast,
          }}
        >
          <SlidersHorizontal size={12} />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </motion.button>

        {/* Sorting */}
        <div style={{ display: "flex", gap: 3, marginLeft: "auto" }}>
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const active = sortBy === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSortBy(opt.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: radius.full,
                  border: `1px solid ${active ? "var(--accent)" : "var(--border2)"}`,
                  background: active ? "rgba(59,130,246,0.082)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer", fontSize: 10, fontWeight: active ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 3,
                  transition: transition.fast,
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={11} />
                {opt.label}
              </motion.button>
            );
          })}
        </div>

        {/* Favorites filter */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setFavoritesOnly(p => !p)}
          style={{
            padding: "6px 10px",
            borderRadius: radius.full,
            border: `1px solid ${favoritesOnly ? "var(--red)" : "var(--border2)"}`,
            background: favoritesOnly ? "rgba(239,68,68,0.082)" : "transparent",
            color: favoritesOnly ? "var(--red)" : "var(--text-muted)",
            cursor: "pointer", fontSize: 10, fontWeight: favoritesOnly ? 600 : 400,
            display: "flex", alignItems: "center", gap: 3,
            transition: transition.fast,
          }}
        >
          <Heart size={11} fill={favoritesOnly ? "var(--red)" : "none"} />
          Fav
        </motion.button>

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.92 }}
            onClick={clearAll}
            style={{
              padding: "6px 10px",
              borderRadius: radius.full,
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer", fontSize: 10,
              display: "flex", alignItems: "center", gap: 3,
            }}
          >
            <X size={11} /> Clear
          </motion.button>
        )}
      </motion.div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <motion.div variants={itemVariants} style={{
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, padding: "14px", marginBottom: 12,
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Muscle Group</div>
                <PillFilter options={MUSCLES} value={filterMuscle} onChange={setFilterMuscle} color={muscleColor[filterMuscle]} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Difficulty</div>
                <PillFilter options={LEVELS} value={filterLevel} onChange={setFilterLevel} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Equipment</div>
                <PillFilter options={EQUIPMENT_OPTIONS} value={filterEquipment} onChange={setFilterEquipment} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Type</div>
                <PillFilter options={TYPE_OPTIONS} value={filterType} onChange={setFilterType} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result count */}
      <motion.div variants={itemVariants} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
        {filtered.length} {filtered.length === 1 ? "exercise" : "exercises"}
        {favoritesOnly && " (favorites)"}
      </motion.div>

      {/* Exercise Grid */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
        {filtered.map(ex => {
          const isFav = favorites.includes(ex.id);
          return (
            <motion.div
              key={ex.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, boxShadow: "var(--shadow-hover)", borderColor: "rgba(37,99,235,0.18)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect?.(ex)}
              transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border2)",
                borderRadius: "var(--radius-card)",
                padding: "20px",
                boxShadow: "var(--shadow-card)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <ExerciseImage exercise={ex} width="100%" height={90} style={{ marginBottom: 12, borderRadius: radius.sm }} />
              
              {/* Favorite heart */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={e => { e.stopPropagation(); toggleFavorite(ex.id); }}
                style={{
                  position: "absolute", top: 28, right: 28,
                  background: "var(--bg-card)",
                  border: "none",
                  borderRadius: "50%",
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: shadow.floating,
                  color: isFav ? "var(--red)" : "var(--text-dim)",
                }}
              >
                <Heart size={13} fill={isFav ? "var(--red)" : "none"} />
              </motion.button>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                  {searchQuery ? highlightText(ex.name, searchQuery) : ex.name}
                </h3>
                <Badge label={ex.level} color={ex.level === "Beginner" ? "var(--green)" : ex.level === "Intermediate" ? "var(--yellow)" : "var(--accent)"} />
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                <Tag label={ex.muscle} color={muscleColor[ex.muscle] || "var(--accent)"} />
                <Tag label={`${ex.sets}×${ex.reps}`} color={"var(--blue)"} />
                {ex.type && <Tag label={ex.type} color={"var(--purple)"} />}
              </div>

              {/* Description */}
              <p style={{
                color: "var(--text-muted)", fontSize: 11, margin: 0,
                lineHeight: 1.5, display: "-webkit-box",
                WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {ex.desc}
              </p>

              {/* Usage stats */}
              {(exerciseCounts[ex.name] || lastUsedDate[ex.name]) && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 10, color: "var(--text-muted)" }}>
                  {exerciseCounts[ex.name] && <span>{exerciseCounts[ex.name]}× performed</span>}
                  {lastUsedDate[ex.name] && <span>Last: {lastUsedDate[ex.name]}</span>}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center", padding: "48px 20px",
            color: "var(--text-muted)",
          }}
        >
          <Search size={32} color="var(--text-dim)" style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>No exercises found</div>
          <div style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
            Try adjusting your search or filters
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {["Chest", "Back", "Legs", "Beginner"].map(suggestion => (
              <motion.button
                key={suggestion}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSearchQuery(""); setFilterMuscle(suggestion === "Beginner" ? "All" : suggestion); setFilterLevel(suggestion === "Beginner" ? "Beginner" : "All"); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: radius.full,
                  border: `1px solid var(--border2)`,
                  background: "var(--bg-card2)",
                  color: "var(--text-muted)",
                  cursor: "pointer", fontSize: 11,
                }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
