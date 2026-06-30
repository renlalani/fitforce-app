import { motion } from "framer-motion";
import { radius, shadow } from "../../styles/designSystem";

export default function Card({
  children,
  variant = "default",
  hover = true,
  glowColor,
  gradient,
  style,
  onClick,
  ...props
}) {
  const baseStyle = {
    background: "var(--bg-card)",
    border: `1px solid var(--border2)`,
    borderRadius: "var(--radius-card)",
    padding: "24px",
    boxShadow: "var(--shadow-card)",
  };

  const glassStyle = {
    background: "rgba(255,255,255,0.80)",
    backdropFilter: "blur(24px) saturate(1.4)",
    WebkitBackdropFilter: "blur(24px) saturate(1.4)",
    border: `1px solid rgba(0,0,0,0.04)`,
    borderRadius: "var(--radius-card)",
    padding: "24px",
    boxShadow: "var(--shadow-card)",
  };

  const gradientStyle = gradient ? {
    border: "none",
    position: "relative",
    background: "var(--bg-card)",
    borderRadius: "var(--radius-card)",
    padding: "24px",
    boxShadow: "var(--shadow-card)",
  } : {};

  const cardVariant = variant === "glass" ? glassStyle : variant === "gradient" ? gradientStyle : baseStyle;

  return (
    <motion.div
      whileHover={hover ? {
        y: -4,
        boxShadow: "var(--shadow-hover)",
        borderColor: "rgba(37,99,235,0.20)",
      } : {}}
      onClick={onClick}
      style={{ ...cardVariant, cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden", ...style }}
      transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
      {...props}
    >
      {variant === "gradient" && (
        <div style={{
          position: "absolute", inset: 0,
          padding: 1,
          borderRadius: "var(--radius-card)",
          background: gradient,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
        }} />
      )}
      {variant === "gradient" && (
        <div style={{
          position: "absolute", inset: 0,
          background: gradient,
          opacity: 0.04,
          borderRadius: "var(--radius-card)",
          pointerEvents: "none",
        }} />
      )}
      {glowColor && (
        <>
          <div style={{
            position: "absolute", top: "-60%", right: "-40%",
            width: "80%", height: "80%",
            background: `radial-gradient(circle, ${glowColor}10, transparent 70%)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40%", left: "-30%",
            width: "60%", height: "60%",
            background: `radial-gradient(circle, ${glowColor}06, transparent 70%)`,
            pointerEvents: "none",
          }} />
        </>
      )}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%",
        height: 1,
        background: `linear-gradient(90deg, transparent, rgba(37,99,235,0.04), transparent)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 30, height: 30,
        background: `linear-gradient(135deg, transparent 50%, ${glowColor || "var(--accent)"}04 50%)`,
        pointerEvents: "none",
        borderRadius: `0 var(--radius-card) 0 0`,
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}
