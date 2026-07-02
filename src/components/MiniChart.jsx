import { motion } from "framer-motion";
import { radius } from "../styles/designSystem";

export default function MiniChart({ data, color = "var(--accent)", label, gradientId, height = 80 }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => +(d.value || d.weight || 0));
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  const pts = vals.map((v, i) => {
    const x = i === 0 ? 0 : i === vals.length - 1 ? 100 : (i / (vals.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  const areaPts = `0,100 ${pts} 100,100`;
  const gid = gradientId || `chart-grad-${label?.replace(/\s/g, "") || "default"}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: 12 }}
    >
      {label && (
        <div style={{
          fontSize: 11, color: "var(--text-muted)", marginBottom: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{label}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color }}>{vals[vals.length - 1]}</span>
        </div>
      )}
      <div style={{
        background: "var(--bg-card2)",
        borderRadius: radius.md,
        padding: "4px 0",
        position: "relative",
      }}>
        <svg
          viewBox="0 0 100 100"
          style={{ width: "100%", height, display: "block" }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <motion.polygon
            points={areaPts}
            fill={`url(#${gid})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.polyline
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {vals.map((v, i) => {
            const cx = i === 0 ? 0 : i === vals.length - 1 ? 100 : (i / (vals.length - 1)) * 100;
            const cy = 100 - ((v - min) / range) * 80 - 10;
            const isEdge = i === 0 || i === vals.length - 1;
            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r={isEdge ? 3 : 2.5}
                fill={color}
                stroke="var(--bg-card2)"
                strokeWidth={1}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              />
            );
          })}
        </svg>
        {/* X-axis labels */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "2px 2px 0",
        }}>
          <span style={{ fontSize: 8, color: "var(--text-dim)" }}>{data[0]?.date || ""}</span>
          <span style={{ fontSize: 8, color: "var(--text-dim)" }}>{data[data.length - 1]?.date || ""}</span>
        </div>
      </div>
    </motion.div>
  );
}
