import { motion } from "framer-motion";
import {  radius, shadow } from "../../styles/designSystem";

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

export function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
            border: `1px solid var(--border)`,
            borderRadius: radius.xl,
            padding: 20,
            marginBottom: 12,
            boxShadow: shadow.floating,
          }}
        >
          <Skeleton width="60%" height={18} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={12} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={40} variant="rect" />
        </div>
      ))}
    </>
  );
}

export function StatsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          background: `linear-gradient(180deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
          borderRadius: radius.xl,
          padding: "14px",
          border: `1px solid var(--border)`,
          textAlign: "center",
          boxShadow: shadow.floating,
        }}>
          <Skeleton variant="avatar" width={16} height={16} style={{ margin: "0 auto 8px" }} />
          <Skeleton width="60%" height={16} style={{ margin: "0 auto 4px" }} />
          <Skeleton width="40%" height={10} style={{ margin: "0 auto" }} />
        </div>
      ))}
    </div>
  );
}

