import { motion } from "framer-motion";
import {  radius } from "../../styles/designSystem";

export default function ProgressBar({ value, max, color: colorProp, height = 4, label }) {
  const color = colorProp ?? "var(--accent)";
  const safeMax = max > 0 ? max : 1;
  const p = Math.min(100, Math.round((value / safeMax) * 100));
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>{label}</span>
          <span style={{ color }}>
            {value}
            <span style={{ color: "var(--text-dim)" }}>/{max}</span>
          </span>
        </div>
      )}
      <div
        style={{
          height,
          background: "var(--border)",
          borderRadius: radius.full,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${p}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            borderRadius: radius.full,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}


