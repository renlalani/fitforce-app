import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, RotateCcw } from "lucide-react";
import { theme, radius, shadow } from "../styles/designSystem";

export default function Toast({ message, sub, visible, onClose, onUndo, duration = 3000 }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [visible, onClose, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 30, x: "-50%", scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            zIndex: 9999,
            background: theme.bgCard,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${theme.border2}`,
            borderRadius: radius.lg,
            padding: "14px 18px",
            boxShadow: shadow.modal,
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 300,
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
            style={{
              width: 28, height: 28,
              background: `${theme.green}15`,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle size={16} color={theme.green} />
          </motion.div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{message}</div>
            {sub && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 1 }}>{sub}</div>}
          </div>

          {onUndo && (
            <motion.button
              whileHover={{ scale: 1.05, borderColor: theme.red + "40" }}
              whileTap={{ scale: 0.95 }}
              onClick={onUndo}
              style={{
                background: `${theme.red}10`,
                border: `1px solid ${theme.red}25`,
                borderRadius: radius.sm,
                color: theme.red,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <RotateCcw size={11} /> Undo
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: theme.textDim,
              cursor: "pointer",
              padding: 4,
              display: "flex",
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
