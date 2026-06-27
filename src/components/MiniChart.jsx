import { motion } from "framer-motion";
import { theme, radius } from "../styles/designSystem";

export default function MiniChart({ data, color, label }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => +(d.value || d.weight || 0));
  const min = Math.min(...vals),
    max = Math.max(...vals),
    range = max - min || 1;
  const W = 280,
    H = 70,
    pad = 10;
  const pts = vals
    .map(
      (v, i) =>
        `${pad + (i * (W - pad * 2)) / (vals.length - 1)},${H - pad - ((v - min) / range) * (H - pad * 2)}`
    )
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: 12 }}
    >
      {label && (
        <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>{label}</div>
      )}
      <div
        style={{
          background: theme.bgCard2,
          borderRadius: radius.md,
          padding: "8px",
          overflow: "hidden",
        }}
      >
        <motion.svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", height: H }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {vals.map((v, i) => (
            <motion.circle
              key={i}
              cx={pad + (i * (W - pad * 2)) / (vals.length - 1)}
              cy={H - pad - ((v - min) / range) * (H - pad * 2)}
              r="3"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
          ))}
          <text x={pad} y={H} fill={theme.textMuted} fontSize="8">
            {data[0]?.date || ""}
          </text>
          <text x={W - pad} y={H} fill={theme.textMuted} fontSize="8" textAnchor="end">
            {data[data.length - 1]?.date || ""}
          </text>
          <text
            x={W - pad}
            y={Math.max(8, H - pad - ((vals[vals.length - 1] - min) / range) * (H - pad * 2) - 4)}
            fill={color}
            fontSize="9"
            textAnchor="end"
            fontWeight={600}
          >
            {vals[vals.length - 1]}
          </text>
        </motion.svg>
      </div>
    </motion.div>
  );
}
