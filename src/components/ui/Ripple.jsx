import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";

export default function Ripple({ children, color = "rgba(255,255,255,0.15)", disabled = false, style, onClick, ...props }) {
  const [ripples, setRipples] = useState([]);
  const idRef = useRef(0);

  const handleClick = useCallback((e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++idRef.current;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  }, [disabled, onClick]);

  return (
    <div
      onClick={handleClick}
      style={{ position: "relative", overflow: "hidden", ...style }}
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.span
            key={r.id}
            initial={{ scale: 0, opacity: 0.4, x: r.x, y: r.y }}
            animate={{ scale: 6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: "absolute", left: 0, top: 0,
              width: 20, height: 20,
              borderRadius: "50%",
              background: color,
              pointerEvents: "none",
              willChange: "transform, opacity",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
