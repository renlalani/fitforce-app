import { motion } from "framer-motion";
import { forwardRef, useCallback, useRef, useState } from "react";
import { theme, radius, transition } from "../../styles/designSystem";

const Button = forwardRef(({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  onClick,
  rippleColor,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState([]);
  const idRef = useRef(0);

  const variants = {
    primary: {
      background: theme.red,
      color: "#fff",
      border: "none",
      hoverBg: theme.redDark,
      activeBg: "#b01818",
      glow: theme.red,
    },
    secondary: {
      background: "transparent",
      color: theme.text,
      border: `1px solid ${theme.border2}`,
      hoverBg: theme.bgCard2,
      activeBg: theme.bgCard3,
      glow: "transparent",
    },
    ghost: {
      background: "transparent",
      color: theme.textMuted,
      border: "none",
      hoverBg: theme.bgCard2,
      activeBg: theme.bgCard3,
      glow: "transparent",
    },
    accent: {
      background: theme.bgCard2,
      color: theme.text,
      border: `1px solid ${theme.border2}`,
      hoverBg: theme.bgCard3,
      activeBg: theme.bgCard4,
      glow: "transparent",
    },
  };

  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "10px 18px", fontSize: 13 },
    lg: { padding: "12px 24px", fontSize: 14 },
  };
  const s = sizes[size] || sizes.md;
  const rc = rippleColor || (variant === "primary" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)");

  const handleClick = useCallback((e) => {
    if (disabled || loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++idRef.current;
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
    onClick?.(e);
  }, [disabled, loading, onClick]);

  return (
    <motion.button
      ref={ref}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontWeight: 500,
        borderRadius: radius.md,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        outline: "none",
        position: "relative",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
        transition: transition.fast,
        ...s,
        ...v,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            width: 14,
            height: 14,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            display: "inline-block",
          }}
        />
      )}
      {children}
      {ripples.map(r => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.35, x: r.x, y: r.y }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "absolute", left: 0, top: 0,
            width: 20, height: 20,
            borderRadius: "50%",
            background: rc,
            pointerEvents: "none",
            willChange: "transform, opacity",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </motion.button>
  );
});

Button.displayName = "Button";
export default Button;
