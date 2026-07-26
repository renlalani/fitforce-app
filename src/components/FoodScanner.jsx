import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Construction } from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import Button from "./ui/Button";
import { createPortal } from "react-dom";
import useScrollLock from "../hooks/useScrollLock";

export default function FoodScanner({ open, onClose }) {
  useScrollLock(open);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0,
            background: "var(--overlay)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10000, padding: 12, overflowY: "auto",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 30 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              background: "var(--bg-card)",
              border: `1px solid var(--border2)`,
              borderRadius: radius.xl,
              width: "100%",
              maxWidth: 420,
              boxShadow: shadow.modal,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              padding: "32px 28px",
              textAlign: "center",
            }}>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  position: "absolute", top: 14, right: 14,
                  background: "var(--bg-card2)", border: "none",
                  borderRadius: radius.full, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-muted)",
                }}
              >
                <X size={16} />
              </motion.button>

              <div style={{
                width: 88, height: 88, borderRadius: radius.full,
                background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,51,234,0.06))",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "8px auto 20px",
                position: "relative",
              }}>
                <Brain size={40} color="var(--accent)" />
                <div style={{
                  position: "absolute", bottom: 4, right: 2,
                  width: 28, height: 28, borderRadius: radius.full,
                  background: "var(--bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Construction size={16} color="var(--orange)" />
                </div>
              </div>

              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
                AI Food Scanner
              </div>
              <div style={{
                display: "inline-block",
                fontSize: 11, fontWeight: 600,
                color: "var(--accent)",
                background: "rgba(59,130,246,0.08)",
                padding: "3px 12px",
                borderRadius: radius.full,
                marginBottom: 16,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}>
                Under Maintenance
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
                We're building a smarter AI Food Scanner to deliver more accurate nutrition analysis.
              </div>

              <div style={{
                background: "rgba(59,130,246,0.03)",
                border: "1px solid rgba(59,130,246,0.08)",
                borderRadius: radius.lg,
                padding: "14px 18px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: radius.md,
                  background: "rgba(245,158,11,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Construction size={18} color="var(--orange)" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
                    Stay tuned!
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    This feature will be available in a future update.
                  </div>
                </div>
              </div>

              <Button onClick={onClose} style={{ width: "100%" }}>
                Back
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}


