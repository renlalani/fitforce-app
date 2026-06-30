import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import {  radius } from "../styles/designSystem";

export default function OfflineDetector() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const go = () => setOffline(true);
    const gi = () => setOffline(false);
    window.addEventListener("offline", go);
    window.addEventListener("online", gi);
    return () => {
      window.removeEventListener("offline", go);
      window.removeEventListener("online", gi);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 10001,
            background: "var(--red)", color: "#fff", textAlign: "center",
            padding: "8px 16px", fontSize: 12, fontWeight: 500,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
          role="alert"
        >
          <WifiOff size={13} />
          You're offline. Changes will sync when you reconnect.
        </motion.div>
      )}
    </AnimatePresence>
  );
}


