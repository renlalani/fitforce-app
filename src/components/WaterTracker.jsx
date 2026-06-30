import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Droplets, RotateCcw, Sparkles, Check, Trophy } from "lucide-react";
import {  radius, transition } from "../styles/designSystem";

function ConfettiParticle({ delay }) {
  const colors = ["var(--teal)", "var(--blue)", "var(--green)", "var(--yellow)", "var(--red)"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = (Math.random() - 0.5) * 200;
  const y = -(60 + Math.random() * 100);
  const size = 4 + Math.random() * 6;
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
      animate={{
        x, y, opacity: [1, 0.8, 0],
        scale: [1, 0.5, 0],
        rotate: Math.random() * 360,
      }}
      transition={{ duration: 0.8 + Math.random() * 0.6, delay, ease: "easeOut" }}
      style={{
        position: "absolute", top: "50%", left: "50%",
        width: size, height: size,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        background: color,
        pointerEvents: "none",
      }}
    />
  );
}

function CompletionCelebration() {
  const particles = Array.from({ length: 16 });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "relative", height: 0, pointerEvents: "none" }}
    >
      {particles.map((_, i) => (
        <ConfettiParticle key={i} delay={i * 0.04} />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 48, height: 48, borderRadius: "50%",
          background: `rgba(20,184,166,0.125)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Check size={24} color={"var(--teal)"} strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

function WaveSVG({ height, fill }) {
  return (
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: `${height}%`, width: "200%",
        animation: "water-wave 3s ease-in-out infinite",
        transition: "height 0.5s ease",
      }}
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`${fill}99`} />
          <stop offset="100%" stopColor={fill} />
        </linearGradient>
      </defs>
      <path
        d="M0,15 C15,5 35,20 50,10 C65,0 85,15 100,10 L100,20 L0,20 Z"
        fill="url(#waveGrad)"
        style={{ animation: "water-wave-path 3s ease-in-out infinite" }}
      />
    </svg>
  );
}

export default function WaterTracker({ water, setWater }) {
  const goal = 8;
  const pct = Math.min(100, Math.max(0, (water / goal) * 100));
  const ml = water * 250;
  const remaining = Math.max(0, goal - water);
  const [showCelebration, setShowCelebration] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const prevWater = useRef(water);

  useEffect(() => {
    if (water >= goal && prevWater.current < goal) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 2500);
      return () => clearTimeout(t);
    }
    prevWater.current = water;
  }, [water, goal]);

  const justAddedRef = useRef(null);

  const addWater = useCallback((n) => {
    setWater(p => {
      const next = Math.min(goal, p + n);
      if (next > p) {
        setJustAdded(true);
        clearTimeout(justAddedRef.current);
        justAddedRef.current = setTimeout(() => setJustAdded(false), 300);
      }
      return next;
    });
  }, [goal, setWater]);

  useEffect(() => () => clearTimeout(justAddedRef.current), []);

  const BarBottle = ({ index, filled }) => {
    const h = filled ? 55 + (index / goal) * 25 : 18;
    const waveH = filled ? 30 + (water / goal) * 20 : 0;
    return (
      <motion.div
        layout
        style={{
          flex: 1, position: "relative",
          borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
          overflow: "hidden",
          background: filled ? `linear-gradient(to top, rgba(20,184,166,0.502), transparent)` : "var(--bg-card3)",
          border: `1px solid ${filled ? "rgba(20,184,166,0.314)" : "var(--border)"}`,
        }}
        animate={{
          height: `${h}px`,
          background: filled
            ? `linear-gradient(to top, rgba(20,184,166,0.502), rgba(20,184,166,0.188))`
            : "var(--bg-card3)",
        }}
        transition={{ ...transition.spring, delay: index * 0.04 }}
      >
        <AnimatePresence>
          {filled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute", inset: 0, overflow: "hidden",
              }}
            >
              <WaveSVG height={waveH} fill={"var(--teal)"} />
              {/* Light shimmer */}
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
                style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)`,
                  pointerEvents: "none",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: `linear-gradient(135deg, rgba(20,184,166,0.031), var(--bg-card))`,
        border: `1px solid var(--border)`,
        borderRadius: radius.lg,
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", inset: 0, zIndex: 10,
              background: `rgba(20,184,166,0.063)`,
              backdropFilter: "blur(2px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: radius.lg,
            }}
          >
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                textAlign: "center", padding: 20,
              }}
            >
              <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                <CompletionCelebration />
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  style={{ fontSize: 48 }}
                >
                  <Sparkles size={48} />
                </motion.div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--teal)" }}>Goal Complete!</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Trophy size={16} /> You crushed your hydration target!</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.div
            animate={justAdded ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={{
              width: 36, height: 36,
              background: `rgba(20,184,166,0.082)`,
              borderRadius: radius.sm,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Droplets size={18} color={"var(--teal)"} />
          </motion.div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Water Intake</div>
            <motion.div
              key={ml}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ fontSize: 11, color: "var(--text-muted)" }}
            >
              {ml}ml / {goal * 250}ml
            </motion.div>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 48, height: 48,
            borderRadius: "50%",
            background: `conic-gradient(var(--teal) ${pct}%, var(--bg-card3) ${pct}%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: "50%",
            background: "var(--bg-card)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <motion.div
              animate={water >= goal ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <Droplets size={16} color={"var(--teal)"} fill={water > 0 ? "var(--teal)" : "none"} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottle visualization with wave */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 14, height: 85 }}>
        {Array.from({ length: goal }).map((_, i) => (
          <BarBottle key={i} index={i} filled={i < water} />
        ))}
      </div>

      {/* Quick buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <motion.button
          whileHover={{ scale: 1.03, borderColor: "rgba(20,184,166,0.314)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addWater(1)}
          disabled={water >= goal}
          style={{
            flex: 1, padding: "10px",
            background: `rgba(20,184,166,0.063)`,
            border: `1px solid ${water >= goal ? "var(--border)" : "rgba(20,184,166,0.188)"}`,
            color: water >= goal ? "var(--text-dim)" : "var(--teal)",
            borderRadius: radius.md,
            cursor: water >= goal ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: water >= goal ? 0.5 : 1,
            transition: transition.fast,
            position: "relative", overflow: "hidden",
          }}
        >
          <AnimatePresence>
            {justAdded && (
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -20, opacity: 0 }}
                exit={{ opacity: 0 }}
                style={{ position: "absolute", fontSize: 14, color: "var(--teal)", fontWeight: 700, pointerEvents: "none" }}
              >
                +1
              </motion.div>
            )}
          </AnimatePresence>
          <Plus size={14} /> +250ml
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, borderColor: "rgba(20,184,166,0.314)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addWater(2)}
          disabled={water >= goal}
          style={{
            flex: 1, padding: "10px",
            background: `rgba(20,184,166,0.082)`,
            border: `1px solid ${water >= goal ? "var(--border)" : "rgba(20,184,166,0.251)"}`,
            color: water >= goal ? "var(--text-dim)" : "var(--teal)",
            borderRadius: radius.md,
            cursor: water >= goal ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: water >= goal ? 0.5 : 1,
            transition: transition.fast,
          }}
        >
          <Plus size={14} /> +500ml
        </motion.button>
        {water > 0 && (
          <motion.button
            initial={{ width: 0, opacity: 0, padding: 0 }}
            animate={{ width: "auto", opacity: 1, padding: "10px 12px" }}
            exit={{ width: 0, opacity: 0, padding: 0 }}
            whileHover={{ scale: 1.03, borderColor: "rgba(148,163,184,0.314)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWater(0)}
            style={{
              background: "transparent",
              border: `1px solid var(--border)`,
              color: "var(--text-muted)",
              borderRadius: radius.md,
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: transition.fast,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            <RotateCcw size={13} />
          </motion.button>
        )}
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={water >= goal ? "done" : "remaining"}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          style={{
            textAlign: "center",
            fontSize: 11,
            color: water >= goal ? "var(--teal)" : "var(--text-muted)",
            marginTop: 8,
            fontWeight: water >= goal ? 600 : 400,
          }}
        >
          {water >= goal
            ? (
              <span>
                <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                Daily hydration goal achieved!
              </span>
            )
            : `${remaining} glass${remaining > 1 ? "es" : ""} remaining (${remaining * 250}ml)`
          }
        </motion.div>
      </AnimatePresence>

      {/* CSS keyframes injected via style tag */}
      <style>{`
        @keyframes water-wave {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-15%) translateY(-2px); }
          50% { transform: translateX(-25%) translateY(0); }
          75% { transform: translateX(-15%) translateY(2px); }
        }
        @keyframes water-wave-path {
          0%, 100% { d: path("M0,15 C15,5 35,20 50,10 C65,0 85,15 100,10 L100,20 L0,20 Z"); }
          50% { d: path("M0,12 C15,18 35,5 50,14 C65,20 85,5 100,10 L100,20 L0,20 Z"); }
        }
      `}</style>
    </motion.div>
  );
}


