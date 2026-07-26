import { motion } from "framer-motion";
import { radius } from "../../styles/designSystem";

export default function ProgressBar({ value, max = 100, color = "var(--accent)", height = 6, animated = true, delay = 0, gradient, boxShadow, sx }) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100) || 0;
  const fillStyle = {
    width: `${pct}%`,
    height: "100%",
    background: gradient || color,
    borderRadius: radius.full,
    ...(boxShadow ? { boxShadow } : {}),
  };

  return (
    <div style={{
      height,
      background: "var(--track)",
      borderRadius: radius.full,
      overflow: "hidden",
      ...sx,
    }}>
      {animated ? (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
          style={fillStyle}
        />
      ) : (
        <div style={fillStyle} />
      )}
    </div>
  );
}
