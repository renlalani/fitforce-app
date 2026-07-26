import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Apple, Brain, ChevronRight } from "lucide-react";
import { useSettingsStore } from "../stores/settingsStore";
import { useUiStore } from "../stores/uiStore";
import { shadow } from "../styles/designSystem";
import logo from "../../images/logo.png";

const screens = [
  {
    id: "workouts",
    title: "Personalized AI Workouts",
    description:
      "Get workout plans tailored to your goals, level and equipment.",
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, #2563EB, #38BDF8)",
    glow: "rgba(37,99,235,0.12)",
  },
  {
    id: "nutrition",
    title: "Smart Nutrition Tracking",
    description:
      "Track calories, protein, water and meals with AI assistance.",
    icon: Apple,
    gradient: "linear-gradient(135deg, #10B981, #34D399)",
    glow: "rgba(16,185,129,0.12)",
  },
  {
    id: "coach",
    title: "Your AI Fitness Coach",
    description:
      "Get instant fitness guidance, motivation and personalized recommendations.",
    icon: Brain,
    gradient: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    glow: "rgba(99,102,241,0.12)",
  },
];

const decorativePositions = [
  [
    { top: "10%", right: "15%", size: 16, delay: 0 },
    { bottom: "20%", left: "10%", size: 10, delay: 0.3 },
    { top: "40%", left: "8%", size: 6, delay: 0.6 },
  ],
  [
    { top: "15%", right: "10%", size: 12, delay: 0 },
    { bottom: "25%", left: "12%", size: 14, delay: 0.4 },
    { top: "35%", right: "20%", size: 8, delay: 0.7 },
  ],
  [
    { top: "12%", right: "18%", size: 14, delay: 0 },
    { bottom: "18%", left: "8%", size: 10, delay: 0.5 },
    { top: "45%", left: "15%", size: 8, delay: 0.8 },
  ],
];

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 360 : -360,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -360 : 360,
    opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const setTab = useUiStore((s) => s.setTab);
  const screen = screens[current];
  const Icon = screen.icon;
  const isLast = current === screens.length - 1;
  const dots = decorativePositions[current];

  const goNext = useCallback(() => {
    if (isLast) {
      completeOnboarding();
      setTab("dashboard");
      return;
    }
    setDirection(1);
    setCurrent((c) => c + 1);
  }, [isLast, completeOnboarding, setTab]);

  const goSkip = useCallback(() => {
    completeOnboarding();
    setTab("dashboard");
  }, [completeOnboarding, setTab]);

  const handleDragEnd = useCallback(
    (_, info) => {
      const threshold = 50;
      if (info.offset.x < -threshold && !isLast) {
        setDirection(1);
        setCurrent((c) => c + 1);
      } else if (info.offset.x > threshold && current > 0) {
        setDirection(-1);
        setCurrent((c) => c - 1);
      }
    },
    [current, isLast],
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #F6F9FC 40%, #F0F5FF 100%)",
        display: "flex",
        flexDirection: "column",
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

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: "max(16px, env(safe-area-inset-top, 16px))",
          left: 24,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <img
          src={logo}
          alt="FitForce"
          style={{ width: 28, height: 28, display: "block" }}
        />
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#111827",
          }}
        >
          FitForce
        </span>
      </div>

      {/* Skip button */}
      {!isLast && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          onClick={goSkip}
          style={{
            position: "absolute",
            top: "max(16px, env(safe-area-inset-top, 16px))",
            right: 20,
            zIndex: 10,
            background: "transparent",
            border: "none",
            color: "#6B7280",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 8,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Skip
        </motion.button>
      )}

      {/* Screen content */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {/* Top illustration area */}
            <div
              style={{
                flex: "1 1 0%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                padding: "80px 32px 0",
              }}
            >
              {/* Icon circle */}
              <div style={{ position: "relative" }}>
                {/* Glow blur behind icon */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "clamp(180px, 45vw, 260px)",
                    height: "clamp(180px, 45vw, 260px)",
                    borderRadius: "50%",
                    background: screen.glow,
                    filter: "blur(40px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Gradient circle */}
                <div
                  style={{
                    width: "clamp(130px, 32vw, 190px)",
                    height: "clamp(130px, 32vw, 190px)",
                    background: screen.gradient,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: shadow.dropdown,
                    position: "relative",
                  }}
                >
                  <Icon
                    size={60}
                    color="#fff"
                    strokeWidth={1.5}
                    style={{ display: "block" }}
                  />
                </div>

                {/* Decorative dots */}
                {dots.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.4 + d.delay,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      top: d.top,
                      right: d.right,
                      bottom: d.bottom,
                      left: d.left,
                      width: d.size,
                      height: d.size,
                      borderRadius: "50%",
                      background: screen.gradient,
                      opacity: 0.25,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Text area */}
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "0 32px 120px",
                width: "100%",
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              <motion.h1
                custom={0}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                style={{
                  fontSize: "clamp(22px, 5.5vw, 30px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#111827",
                  lineHeight: 1.25,
                  margin: "0 0 12px",
                }}
              >
                {screen.title}
              </motion.h1>
              <motion.p
                custom={1}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                style={{
                  fontSize: "clamp(14px, 3.5vw, 16px)",
                  color: "#6B7280",
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: 320,
                }}
              >
                {screen.description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          flexShrink: 0,
          padding:
            "16px 24px max(24px, env(safe-area-inset-bottom, 24px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          background:
            "linear-gradient(0deg, rgba(255,255,255,0.95) 60%, transparent)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {screens.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === current ? 28 : 8,
                background:
                  i === current
                    ? "var(--accent, #2563EB)"
                    : "rgba(0,0,0,0.08)",
              }}
              transition={{
                duration: 0.35,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                height: 8,
                borderRadius: 4,
              }}
            />
          ))}
        </div>

        {/* Button */}
        <motion.button
          key={isLast ? "start" : "next"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          whileHover={{
            scale: 1.02,
            boxShadow: shadow.elevated,
          }}
          whileTap={{ scale: 0.97 }}
          onClick={isLast ? goNext : goNext}
          style={{
            width: "100%",
            maxWidth: 340,
            padding: "15px 24px",
            background: "linear-gradient(135deg, #2563EB, #38BDF8)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: "clamp(15px, 3.5vw, 17px)",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "-0.01em",
            boxShadow: shadow.elevated,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {isLast ? "Get Started" : "Continue"}
          {!isLast && <ChevronRight size={18} strokeWidth={2.5} />}
        </motion.button>
      </div>
    </div>
  );
}
