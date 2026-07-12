import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { MoveHorizontal, Calendar, TrendingDown } from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import useScrollLock from "../hooks/useScrollLock";

function daysBetween(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.abs(Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

function weightDiff(w1, w2) {
  const diff = (w2 || 0) - (w1 || 0);
  return diff === 0 ? "0 kg" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`;
}

export default function BeforeAfterSlider({ before, after, onClose }) {
  useScrollLock(true);
  const containerRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMove = useCallback((clientX) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseMove = useCallback(
    (e) => handleMove(e.clientX),
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e) => handleMove(e.touches[0].clientX),
    [handleMove]
  );

  const days = daysBetween(before.date, after.date);
  const diff = weightDiff(before.weight, after.weight);
  const isProgress = after.weight != null && before.weight != null && after.weight < before.weight;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "var(--overlay)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, overflowY: "auto",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          background: "var(--bg-card)",
          border: `1px solid var(--border2)`,
          borderRadius: radius.xl,
          width: "100%",
          maxWidth: 520,
          boxShadow: shadow.modal,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid var(--border)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MoveHorizontal size={16} color={"var(--accent)"} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              Before vs After
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "var(--bg-card2)", border: "none",
              borderRadius: radius.full, width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)", fontSize: 16,
            }}
          >
            ✕
          </motion.button>
        </div>

        {/* Comparison slider */}
        <div style={{ padding: "16px 20px" }}>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
            style={{
              position: "relative", width: "100%",
              height: 280, borderRadius: radius.md,
              overflow: "hidden", cursor: "ew-resize",
              userSelect: "none", WebkitUserSelect: "none",
              background: "var(--bg-card2)",
            }}
          >
            {/* After image (full width) */}
            <img
              src={after.dataUrl}
              alt="After"
              draggable={false}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
              }}
            />

            {/* Before image (clipped) */}
            <div style={{
              position: "absolute", inset: 0,
              width: `${sliderPos}%`,
              overflow: "hidden",
            }}>
              <img
                src={before.dataUrl}
                alt="Before"
                draggable={false}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Labels */}
            <div style={{
              position: "absolute", top: 10, left: 10,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              padding: "3px 10px", borderRadius: radius.full,
              fontSize: 10, fontWeight: 600, color: "#fff",
              pointerEvents: "none",
            }}>
              Before
            </div>
            <div style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              padding: "3px 10px", borderRadius: radius.full,
              fontSize: 10, fontWeight: 600, color: "#fff",
              pointerEvents: "none",
            }}>
              After
            </div>

            {/* Slider handle */}
            <div style={{
              position: "absolute", top: 0, bottom: 0,
              left: `${sliderPos}%`, width: 3,
              background: "#fff",
              boxShadow: "0 0 8px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              transform: "translateX(-50%)",
              zIndex: 2,
            }} />
            <div style={{
              position: "absolute", top: "50%",
              left: `${sliderPos}%`,
              width: 36, height: 36,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
            }}>
              <MoveHorizontal size={16} color={"var(--accent)"} />
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
            marginTop: 14,
          }}>
            <div style={{
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, padding: "10px", textAlign: "center",
            }}>
              <Calendar size={14} color={"var(--accent)"} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                {days}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Days apart</div>
            </div>
            <div style={{
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, padding: "10px", textAlign: "center",
            }}>
              <TrendingDown size={14} color={isProgress ? "var(--green)" : "var(--orange)"} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: isProgress ? "var(--green)" : "var(--orange)" }}>
                {diff}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Weight change</div>
            </div>
            <div style={{
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, padding: "10px", textAlign: "center",
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                background: "var(--green)", margin: "0 auto 4px",
                opacity: isProgress ? 1 : 0.3,
              }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>
                {before.weight ? `${before.weight}→${after.weight}` : "—"}
              </div>
              <div style={{ fontSize: 9, color: "var(--text-muted)" }}>Weight (kg)</div>
            </div>
          </div>

          {/* Date comparison */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 10, fontSize: 10, color: "var(--text-muted)",
          }}>
            <span>{before.date}</span>
            <span>{after.date}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
