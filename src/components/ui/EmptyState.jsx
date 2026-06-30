import { motion } from "framer-motion";
import {  radius } from "../../styles/designSystem";

export default function EmptyState({ icon: Icon, title, description, action, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        textAlign: "center",
        padding: compact ? "24px 16px" : "48px 24px",
        background: "var(--bg-card2)",
        borderRadius: radius.lg,
        border: `1px solid var(--border)`,
      }}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          style={{
            width: 48, height: 48,
            background: `rgba(148,163,184,0.082)`,
            borderRadius: radius.md,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <Icon size={20} color={"var(--text-dim)"} />
        </motion.div>
      )}
      <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
        {title}
      </div>
      {description && (
        <div style={{ color: "var(--text-dim)", fontSize: 12, marginBottom: action ? 16 : 0, lineHeight: 1.5 }}>
          {description}
        </div>
      )}
      {action}
    </motion.div>
  );
}


