export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 32,
  full: 9999,
};

export const shadow = {
  card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)",
  elevated: "0 4px 12px rgba(37,99,235,0.08), 0 8px 24px rgba(37,99,235,0.04), 0 16px 48px rgba(37,99,235,0.04)",
  modal: "0 25px 60px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.04)",
  floating: "0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)",
  glow: (c) => `0 0 20px ${c}15, 0 0 40px ${c}08, 0 0 80px ${c}04`,
  softGlow: (c) => `0 0 30px ${c}10, 0 0 60px ${c}05`,
  ambient: (c) => `0 4px 24px ${c}12, 0 0 0 1px ${c}06`,
  inner: "inset 0 1px 2px rgba(255,255,255,0.5)",
};

export const font = {
  family: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace",
  size: {
    xs: 10, sm: 11, base: 12, md: 13, lg: 14, xl: 16,
    "2xl": 20, "3xl": 24, "4xl": 30, "5xl": 38,
  },
  weight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
  leading: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
};

export const space = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  "2xl": 24, "3xl": 32, "4xl": 40, "5xl": 48, "6xl": 64,
};

export const transition = {
  fast: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  spring: { type: "spring", stiffness: 400, damping: 28 },
  springLight: { type: "spring", stiffness: 300, damping: 22 },
  springSnap: { type: "spring", stiffness: 500, damping: 30 },
  springHeavy: { type: "spring", stiffness: 200, damping: 20 },
};

export const muscleColor = {
  Chest: "#2563EB",
  Back: "#8B5CF6",
  Legs: "#10B981",
  Glutes: "#F59E0B",
  Shoulders: "#22D3EE",
  Arms: "#60A5FA",
  Core: "#14B8A6",
  Cardio: "#EC4899",
};

export function cardStyle() {
  return {
    background: "var(--bg-card)",
    border: "1px solid var(--border2)",
    borderRadius: "var(--radius-card)",
    padding: space["2xl"],
    boxShadow: "var(--shadow-card)",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  };
}

export function glassCard() {
  return {
    background: "rgba(255,255,255,0.80)",
    backdropFilter: "blur(24px) saturate(1.4)",
    WebkitBackdropFilter: "blur(24px) saturate(1.4)",
    border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: radius["2xl"],
    padding: space["2xl"],
    boxShadow: "var(--shadow-card)",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  };
}

export function cardHover() {
  return {
    y: -4,
    boxShadow: "var(--shadow-hover)",
    borderColor: "rgba(37,99,235,0.20)",
    transition: { type: "spring", stiffness: 400, damping: 25 },
  };
}
