import { motion, AnimatePresence } from "framer-motion";
import {  radius, shadow } from "../../styles/designSystem";

export default function Modal({ open, onClose, children, maxWidth = 460 }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
            overflowY: "auto",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              background: "var(--bg-card)",
              border: `1px solid var(--border2)`,
              borderRadius: radius.xl,
              padding: "24px",
              width: "100%",
              maxWidth,
              boxShadow: shadow.modal,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


