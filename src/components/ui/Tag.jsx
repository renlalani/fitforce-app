import { theme, radius } from "../../styles/designSystem";

export function Tag({ label, color }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "3px 10px",
        borderRadius: radius.sm,
        background: `${color}18`,
        color,
        border: `1px solid ${color}30`,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 450,
        letterSpacing: "0.01em",
      }}
    >
      {label}
    </span>
  );
}

export function Badge({ label, color }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: "2px 10px",
        borderRadius: radius.full,
        border: `1px solid ${color}`,
        color,
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}
