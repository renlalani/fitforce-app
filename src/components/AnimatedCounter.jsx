import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value, decimals = 0, suffix = "", duration = 800, style }) {
  const safeValue = +value || 0;
  const [display, setDisplay] = useState(safeValue);
  const prevValue = useRef(safeValue);

  useEffect(() => {
    const from = prevValue.current;
    prevValue.current = safeValue;
    if (from === safeValue) return;

    const steps = Math.min(60, Math.max(20, Math.floor(duration / 16)));
    const increment = (safeValue - from) / steps;
    let current = from;
    let frame;

    const animate = () => {
      current += increment;
      if ((increment >= 0 && current >= safeValue) || (increment < 0 && current <= safeValue)) {
        setDisplay(safeValue);
      } else {
        setDisplay(current);
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [safeValue, duration]);

  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {display.toFixed(decimals)}{suffix}
    </span>
  );
}
