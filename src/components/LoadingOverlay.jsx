import { motion } from "framer-motion";
import { radius } from "../styles/designSystem";

export default function LoadingOverlay({ progress, stageText, tip }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
    >
      <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
          <span>{stageText}</span>
          <span style={{ fontWeight: 600, color: "var(--accent)" }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, background: "var(--border2)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", background: "linear-gradient(90deg, var(--accent), var(--blue))", borderRadius: 3 }}
          />
        </div>
      </div>
      {tip && (
        <motion.div
          key={tip}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5, fontStyle: "italic" }}
        >
          {tip}
        </motion.div>
      )}
    </motion.div>
  );
}
