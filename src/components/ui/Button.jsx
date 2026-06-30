import { motion } from "framer-motion";
import { forwardRef, useCallback, useRef, useState } from "react";
import {  radius, shadow, transition } from "../../styles/designSystem";

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
  const [focused, setFocused] = useState(false);
  const idRef = useRef(0);

  const variants = {
    primary: {
      background: "var(--accent-gradient)",
      color: "#fff",
      border: "none",
      glow: "var(--accent)",
    },
    secondary: {
      background: `linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card2) 100%)`,
      color: "var(--text)",
      border: `1px solid var(--border2)`,
      glow: "var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "none",
      glow: "transparent",
    },
    accent: {
      background: `linear-gradient(135deg, rgba(59,130,246,0.082), rgba(139,92,246,0.031))`,
      color: "var(--accent)",
      border: `1px solid rgba(59,130,246,0.125)`,
      glow: "var(--accent)",
    },
    danger: {
      background: `linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%)`,
      color: "#fff",
      border: "none",
      glow: "var(--red)",
    },
  };

  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 11, borderRadius: radius.lg },
    md: { padding: "10px 20px", fontSize: 12, borderRadius: radius.lg },
    lg: { padding: "12px 28px", fontSize: 13, borderRadius: radius.xl },
  };
  const s = sizes[size] || sizes.md;
  const rc = rippleColor || "rgba(255,255,255,0.2)";

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
      whileHover={disabled || loading ? {} : { scale: 1.03, boxShadow: shadow.softGlow(v.glow) }}
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={handleClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontWeight: 600,
        letterSpacing: "0.01em",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        outline: "none",
        position: "relative",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: focused ? `0 0 0 2px rgba(59,130,246,0.251)` : (disabled || loading ? "none" : undefined),
        ...s,
        ...v,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          style={{
            width: 14,
            height: 14,
            border: "2px solid rgba(255,255,255,0.25)",
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
          initial={{ scale: 0, opacity: 0.4, x: r.x, y: r.y }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "absolute", left: 0, top: 0,
            width: 24, height: 24,
            borderRadius: "50%",
            background: rc,
            pointerEvents: "none",
            willChange: "transform, opacity",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Subtle shine on primary */}
      {variant === "primary" && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
          pointerEvents: "none",
          borderRadius: "inherit",
        }} />
      )}
    </motion.button>
  );
});

Button.displayName = "Button";
export default Button;


