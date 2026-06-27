import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function AnimatedCounter({ value, decimals = 0, suffix = "", duration = 800, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const safeValue = +value || 0;
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    const steps = Math.min(60, Math.max(20, Math.floor(duration / 16)));
    const increment = safeValue / steps;
    let current = 0;
    let frame;

    const animate = () => {
      current += increment;
      if (current >= safeValue) {
        setDisplay(safeValue);
        cancelAnimationFrame(frame);
      } else {
        setDisplay(current);
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, safeValue, duration]);

  useEffect(() => {
    if (!isInView) started.current = false;
  }, [isInView]);

  return (
    <span ref={ref} style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {display.toFixed(decimals)}{suffix}
    </span>
  );
}
