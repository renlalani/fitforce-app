import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { radius } from "../styles/designSystem";
import { getExerciseImage } from "../data/exerciseImages";

const ASPECT_RATIO = "56.25%";

const shimmerStyle = () => ({
  background: `linear-gradient(90deg, var(--bg-card2) 25%, var(--bg-card3) 50%, var(--bg-card2) 75%)`,
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
});

export default function ExerciseImage({
  exercise,
  width = "100%",
  height,
  style,
  className,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const src = getExerciseImage(exercise);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);

  return (
    <div
      style={{
        position: "relative",
        width,
        paddingBottom: height ? undefined : ASPECT_RATIO,
        height: height || undefined,
        borderRadius: radius.md,
        overflow: "hidden",
        background: "var(--bg-card2)",
        ...style,
      }}
    >
      {/* Skeleton shimmer */}
      {!loaded && !error && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          style={{
            position: "absolute",
            inset: 0,
            ...shimmerStyle(),
          }}
        />
      )}

      {/* Actual image */}
      {!error && (
        <motion.img
          src={src}
          alt={exercise?.name || "Exercise"}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: loaded ? 1 : 0,
            scale: loaded ? 1 : 1.05,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          whileHover={{ scale: 1.07 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: radius.md,
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      )}

      {/* Fallback on error */}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, var(--bg-card2), var(--bg-card3))`,
            borderRadius: radius.md,
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{
            width: 36, height: 36,
            borderRadius: "50%",
            background: `rgba(239,68,68,0.082)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}>
            <Dumbbell size={32} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {exercise?.name || "Exercise"}
          </div>
        </div>
      )}

      {/* Hover overlay gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)`,
          borderRadius: radius.md,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function ExerciseImageSkeleton({ width = "100%", height, style }) {
  return (
    <div
      style={{
        position: "relative",
        width,
        paddingBottom: height ? undefined : ASPECT_RATIO,
        height: height || undefined,
        borderRadius: radius.md,
        overflow: "hidden",
        ...shimmerStyle(),
        ...style,
      }}
    />
  );
}


