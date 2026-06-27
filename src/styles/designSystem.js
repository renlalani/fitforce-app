export const theme = {
  bg: "#0a0a0b",
  bgCard: "#141416",
  bgCard2: "#1a1a1e",
  bgCard3: "#222226",
  bgCard4: "#2a2a30",
  red: "#ff3b3b",
  redDark: "#cc2020",
  redLight: "#ff6b6b",
  text: "#fafafa",
  textMuted: "#a1a1aa",
  textDim: "#52525b",
  border: "#2a2a30",
  border2: "#333338",
  border3: "#3a3a42",
  green: "#22c55e",
  greenDark: "#16a34a",
  yellow: "#f59e0b",
  blue: "#3b82f6",
  blueDark: "#2563eb",
  purple: "#a855f7",
  orange: "#f97316",
  teal: "#14b8a6",
  pink: "#ec4899",
  glass: "rgba(255,255,255,0.03)",
  glassBorder: "rgba(255,255,255,0.06)",
  glassHover: "rgba(255,255,255,0.06)",
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const shadow = {
  card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
  elevated: "0 4px 6px rgba(0,0,0,0.3), 0 10px 15px rgba(0,0,0,0.2)",
  modal: "0 25px 50px rgba(0,0,0,0.5)",
  glow: (c) => `0 0 20px ${c}20, 0 0 40px ${c}10`,
};

export const font = {
  family: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
};

export const transition = {
  fast: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  spring: { type: "spring", stiffness: 400, damping: 25 },
  springLight: { type: "spring", stiffness: 300, damping: 20 },
};

export const muscleColor = {
  Chest: theme.red,
  Back: theme.blue,
  Legs: theme.green,
  Glutes: theme.red,
  Shoulders: theme.yellow,
  Arms: theme.purple,
  Core: theme.orange,
  Cardio: theme.teal,
};

export const cardStyle = {
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  borderRadius: radius.lg,
  padding: "20px",
  boxShadow: shadow.card,
  transition: transition.normal,
};

export const glassCard = {
  background: `linear-gradient(135deg, ${theme.glass}, transparent)`,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${theme.glassBorder}`,
  borderRadius: radius.lg,
  padding: "20px",
  boxShadow: shadow.card,
  transition: transition.normal,
};
