import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {  radius, shadow } from "../styles/designSystem";

export default function NotificationToast({ notification, onDismiss, onNavigate }) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            position: "fixed", top: 80, right: 16, zIndex: 9999,
            maxWidth: 360, width: "100%",
            background: "var(--bg-card)",
            border: `1px solid var(--border2)`,
            borderRadius: radius.xl,
            padding: "14px 16px",
            boxShadow: shadow.modal,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{notification.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "var(--text)",
                marginBottom: 2,
              }}>
                {notification.title}
              </div>
              <div style={{
                fontSize: 11, color: "var(--text-muted)",
                lineHeight: 1.5, marginBottom: notification.action ? 8 : 0,
              }}>
                {notification.desc}
              </div>
              {notification.action && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onNavigate?.(notification.action.tab);
                    onDismiss?.(notification.id);
                  }}
                  style={{
                    padding: "6px 14px", borderRadius: radius.md,
                    background: notification.color || "var(--accent)",
                    color: "#fff", border: "none", cursor: "pointer",
                    fontSize: 11, fontWeight: 600,
                  }}
                >
                  {notification.action.label}
                </motion.button>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onDismiss?.(notification.id)}
              style={{
                background: "var(--bg-card2)", border: "none",
                borderRadius: radius.full, width: 24, height: 24,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-muted)", flexShrink: 0,
              }}
            >
              <X size={12} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


