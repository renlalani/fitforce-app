import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#ff3b3b", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#f97316", "#14b8a6", "#ec4899"];
const SHAPES = ["circle", "square", "triangle"];

function particle(cfg) {
  return {
    x: Math.random() * 400 - 200,
    y: Math.random() * -600 - 100,
    r: Math.random() * 6 + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    rot: Math.random() * 360,
    dur: Math.random() * 1 + 1,
    delay: Math.random() * 0.5,
  };
}

export default function ConfettiEffect({ active }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!active) { setItems([]); return; }
    setItems(Array.from({ length: 60 }, (_, i) => particle(i)));
    const t = setTimeout(() => setItems([]), 3000);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      <AnimatePresence>
        {items.map((p, i) => (
          <motion.div
            key={i}
            initial={{ x: "50vw", y: "50vh", opacity: 1, rotate: 0, scale: 0 }}
            animate={{
              x: `calc(50vw + ${p.x}px)`,
              y: `calc(50vh + ${p.y}px)`,
              opacity: [1, 1, 0],
              rotate: p.rot,
              scale: [0, 1, 0.5],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: p.r * 2,
              height: p.shape === "circle" ? p.r * 2 : p.r * 2,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? 3 : 0,
              background: p.color,
              clipPath: p.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
              boxShadow: `0 0 6px ${p.color}60`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
