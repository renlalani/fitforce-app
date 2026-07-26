import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import Button from "./ui/Button";

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function AboutDialog({ onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
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
        role="dialog"
        aria-modal="true"
        aria-label="About FitForce"
      >
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.93, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border2)",
            borderRadius: radius.xl,
            width: "100%",
            maxWidth: 480,
            boxShadow: shadow.modal,
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: "absolute", top: 14, right: 14,
              background: "var(--bg-card2)", border: "none",
              borderRadius: radius.full, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)", zIndex: 1,
            }}
          >
            <X size={16} />
          </motion.button>

          <div style={{ padding: "36px 32px 28px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: radius.full,
              background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,51,234,0.06))",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <span style={{ fontSize: 28 }}>🏋️</span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              FitForce
            </h2>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Version 1.0.0</div>
            <div style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 600,
              color: "var(--accent)",
              background: "rgba(59,130,246,0.08)",
              padding: "3px 12px",
              borderRadius: radius.full,
              marginBottom: 20,
            }}>
              AI-Powered Fitness Companion
            </div>

            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
              Developed by <span style={{ fontWeight: 600, color: "var(--text)" }}>Ren Lalani</span>
            </div>

            <div style={{
              background: "var(--bg-card2)",
              borderRadius: radius.lg,
              padding: "16px 20px",
              marginBottom: 16,
              textAlign: "left",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 10, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                Tech Stack
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {["React", "Vite", "Tailwind CSS", "Framer Motion", "OpenRouter AI"].map(t => (
                  <div key={t} style={{
                    fontSize: 11, color: "var(--text-secondary)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: "var(--accent)" }}>•</span> {t}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: "var(--bg-card2)",
              borderRadius: radius.lg,
              padding: "16px 20px",
              marginBottom: 20,
              textAlign: "left",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 10, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                Key Features
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {["AI Coach", "Workout Tracker", "Nutrition Tracker", "Premium Analytics", "Smart Reminders", "Exercise Library"].map(f => (
                  <div key={f} style={{
                    fontSize: 11, color: "var(--text-secondary)",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: "var(--green)" }}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 20 }}>
              &copy; 2026 Ren Lalani. All rights reserved.
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" onClick={() => window.open("https://github.com/renlalani", "_blank", "noopener,noreferrer")} style={{ flex: 1 }} aria-label="GitHub profile">
                <GitHubIcon /> GitHub
              </Button>
              <Button variant="secondary" onClick={() => window.open("https://www.linkedin.com/in/ren-lalani-84390b419/", "_blank", "noopener,noreferrer")} style={{ flex: 1 }} aria-label="LinkedIn profile">
                <LinkedInIcon /> LinkedIn
              </Button>
              <Button onClick={onClose} style={{ flex: 1 }}>
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
