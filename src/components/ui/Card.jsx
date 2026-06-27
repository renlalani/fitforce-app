import { motion } from "framer-motion";
import { theme, radius, shadow } from "../../styles/designSystem";

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
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.lg,
    padding: "20px",
  };

  const glassStyle = {
    background: `linear-gradient(135deg, rgba(255,255,255,0.03), transparent)`,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid rgba(255,255,255,0.06)`,
    borderRadius: radius.lg,
    padding: "20px",
  };

  const gradientStyle = gradient ? {
    border: "none",
    position: "relative",
    background: theme.bgCard,
    borderRadius: radius.lg,
    padding: "20px",
  } : {};

  const cardVariant = variant === "glass" ? glassStyle : variant === "gradient" ? gradientStyle : baseStyle;

  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: shadow.elevated } : {}}
      onClick={onClick}
      style={{ ...cardVariant, cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden", ...style }}
      transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.6 }}
      {...props}
    >
      {variant === "gradient" && (
        <div style={{
          position: "absolute", inset: 0,
          padding: 1,
          borderRadius: radius.lg,
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
          opacity: 0.03,
          borderRadius: radius.lg,
          pointerEvents: "none",
        }} />
      )}
      {glowColor && (
        <div style={{
          position: "absolute", top: "-50%", right: "-50%",
          width: "100%", height: "100%",
          background: `radial-gradient(circle, ${glowColor}10, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
}
