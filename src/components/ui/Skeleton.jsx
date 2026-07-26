import { motion } from "framer-motion";
import { radius } from "../../styles/designSystem";

export function Skeleton({ width = "100%", height = 16, variant = "text", style, count }) {
  const variants = {
    text: { height: 14, borderRadius: radius.md },
    card: { height: 120, borderRadius: radius.xl },
    circle: { width: 40, height: 40, borderRadius: "50%" },
    bar: { height: 6, borderRadius: radius.full },
    rect: { height, borderRadius: radius.lg },
    avatar: { width: 40, height: 40, borderRadius: "50%" },
    chip: { width: 60, height: 28, borderRadius: radius.full },
  };
  const v = variants[variant] || variants.text;

  const el = (
    <motion.div
      animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: `linear-gradient(90deg, var(--bg-card2) 0%, var(--bg-card3) 40%, var(--bg-card) 50%, var(--bg-card3) 60%, var(--bg-card2) 100%)`,
        backgroundSize: "200% 100%",
        width: v.width || width,
        height: v.height,
        borderRadius: v.borderRadius,
        ...style,
      }}
    />
  );

  if (count && count > 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{el}</div>
        ))}
      </div>
    );
  }

  return el;
}
