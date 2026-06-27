import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProgressRing({ value, max, size = 100, strokeWidth = 8, color, label, sub, icon: Icon, gradient }) {
  const [animatedVal, setAnimatedVal] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));
  const offset = circumference - (animatedVal / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedVal(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={gradient || color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={false}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          {Icon && <Icon size={18} color={color} />}
          <span style={{ fontSize: size > 80 ? 16 : 13, fontWeight: 700, color, lineHeight: 1.2 }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{sub || `${Math.round(value)}/${max}`}</div>
    </div>
  );
}
