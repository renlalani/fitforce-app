import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "../../images/logo.png";

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 800);
    let interval;
    const holdTimer = setTimeout(() => {
      setPhase("exit");
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 1) {
            clearInterval(interval);
            return 1;
          }
          return p + 0.08;
        });
      }, 30);
    }, 800);

    const exitTimer = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearInterval(interval);
    };
  }, [onComplete]);

  const variants = {
    enter: {
      scale: 0.8,
      opacity: 0,
    },
    hold: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 200, damping: 18, duration: 0.6 },
    },
    exit: {
      scale: 1.05,
      opacity: 0,
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "linear-gradient(180deg, #FFFFFF 0%, #F6F9FC 40%, #F0F5FF 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Ambient mesh */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          right: "-15%",
          width: "90vmax",
          height: "90vmax",
          background:
            "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "meshShift 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-25%",
          left: "-15%",
          width: "80vmax",
          height: "80vmax",
          background:
            "radial-gradient(circle at 50% 50%, rgba(56,189,248,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "meshShift 25s ease-in-out infinite reverse",
        }}
      />

      {/* Center content */}
      <motion.div
        variants={variants}
        initial="enter"
        animate={phase}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Glow behind logo */}
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <img
          src={logo}
          alt="FitForce"
          style={{
            width: "clamp(100px, 25vw, 160px)",
            height: "auto",
            display: "block",
            position: "relative",
            filter: "drop-shadow(0 4px 20px rgba(37,99,235,0.08))",
          }}
        />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={
            phase === "enter"
              ? { opacity: 0, y: 10 }
              : { opacity: 1, y: 0 }
          }
          transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "clamp(28px, 6vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 50%, #38BDF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.1,
            }}
          >
            FitForce
          </div>
          <div
            style={{
              fontSize: "clamp(11px, 2.5vw, 14px)",
              color: "#6B7280",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            AI Gym Companion
          </div>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={
            phase === "hold" || phase === "exit"
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            marginTop: 32,
            width: "clamp(120px, 30vw, 180px)",
            height: 3,
            background: "rgba(0,0,0,0.06)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #2563EB, #38BDF8)",
              borderRadius: 2,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
