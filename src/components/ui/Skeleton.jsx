import { motion } from "framer-motion";
import { theme, radius } from "../../styles/designSystem";

export function Skeleton({ width = "100%", height = 16, variant = "text", style }) {
  const variants = {
    text: { height: 14, borderRadius: radius.sm },
    card: { height: 120, borderRadius: radius.lg },
    circle: { width: 40, height: 40, borderRadius: "50%" },
    bar: { height: 6, borderRadius: radius.full },
    rect: { height, borderRadius: radius.md },
    avatar: { width: 40, height: 40, borderRadius: "50%" },
    chip: { width: 60, height: 28, borderRadius: radius.full },
  };
  const v = variants[variant] || variants.text;

  return (
    <motion.div
      animate={{
        opacity: [0.25, 0.55, 0.25],
        backgroundPosition: ["200% 0", "-200% 0"],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        background: `linear-gradient(90deg, ${theme.bgCard2} 0%, ${theme.bgCard3} 40%, ${theme.bgCard4} 50%, ${theme.bgCard3} 60%, ${theme.bgCard2} 100%)`,
        backgroundSize: "200% 100%",
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
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.lg,
            padding: 20,
            marginBottom: 12,
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
          background: theme.bgCard2,
          borderRadius: radius.md,
          padding: "14px",
          border: `1px solid ${theme.border}`,
          textAlign: "center",
        }}>
          <Skeleton variant="circle" width={16} height={16} style={{ margin: "0 auto 8px" }} />
          <Skeleton variant="text" width="60%" height={16} style={{ margin: "0 auto 4px" }} />
          <Skeleton variant="text" width="40%" height={10} style={{ margin: "0 auto" }} />
        </div>
      ))}
    </div>
  );
}
