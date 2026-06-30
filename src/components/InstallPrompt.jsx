import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import {  radius } from "../styles/designSystem";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const handler = (e) => {
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const onInstalled = () => setShow(false);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const installed = window.matchMedia("(display-mode: standalone)").matches;

  if (installed || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          style={{
            position: "fixed", bottom: 80, left: 12, right: 12, zIndex: 9999,
            maxWidth: 400, margin: "0 auto",
          }}
        >
          <div style={{
            background: "var(--bg-card)", border: `1px solid var(--border2)`,
            borderRadius: radius.lg, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: radius.md,
              background: "var(--accent-gradient)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 18, color: "#fff", flexShrink: 0,
            }}>
              F
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Install FitForce</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Add to your home screen for the best experience</div>
            </div>
            <button
              onClick={handleInstall}
              style={{
                background: "var(--accent)", color: "#fff", border: "none",
                borderRadius: radius.md, padding: "8px 14px",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <Download size={13} /> Install
            </button>
            <button
              onClick={() => setShow(false)}
              style={{
                background: "transparent", border: "none",
                color: "var(--text-muted)", cursor: "pointer", padding: 4,
              }}
              aria-label="Dismiss install prompt"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


