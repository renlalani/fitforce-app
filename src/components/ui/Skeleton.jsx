import { motion } from "framer-motion";
import { radius } from "../../styles/designSystem";

export function Skeleton({ width = "100%", height = 16, variant = "text", style }) {
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

  return (
    <motion.div
      animate={{
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        background: `linear-gradient(90deg, var(--bg-card2) 0%, var(--bg-card3) 40%, var(--bg-card) 50%, var(--bg-card3) 60%, var(--bg-card2) 100%)`,
        backgroundSize: "200% 100%",
        backgroundPosition: "200% 0",
        width,
        height: v.height,
        borderRadius: v.borderRadius,
        ...v,
        ...style,
      }}
    />
  );
}

