import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X, ZoomIn, ZoomOut, Trash2, Share2, RefreshCw,
  Calendar, Target, Zap, Scale,
} from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import useScrollLock from "../hooks/useScrollLock";

export default function PhotoViewer({ photo, onClose, onDelete, onReplace }) {
  useScrollLock(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const fileRef = useRef(null);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [photo.id]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setScale((s) => Math.max(1, Math.min(5, s - e.deltaY * 0.002)));
  }, []);

  useEffect(() => {
    const el = document.getElementById("photo-viewer-container");
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = useCallback((e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { ...position };
  }, [scale, position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition({ x: posStart.current.x + dx, y: posStart.current.y + dy });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share && photo.dataUrl) {
      try {
        const blob = await (await fetch(photo.dataUrl)).blob();
        const file = new File([blob], "progress-photo.jpg", { type: "image/jpeg" });
        await navigator.share({ files: [file], title: "FitForce Progress" });
      } catch {}
    }
  }, [photo]);

  const handleReplace = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1200;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w *= ratio; h *= ratio;
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        onReplace(photo.id, canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [photo.id, onReplace]);

  return createPortal(
    <motion.div
      id="photo-viewer-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.92)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", zIndex: 2,
      }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "rgba(255,255,255,0.1)", border: "none",
            borderRadius: radius.full, width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff",
            backdropFilter: "blur(8px)",
          }}
        >
          <X size={18} />
        </motion.button>

        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setScale((s) => Math.max(1, s - 0.5))}
            aria-label="Zoom out"
            style={{
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: radius.full, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <ZoomOut size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setScale((s) => Math.min(5, s + 0.5))}
            aria-label="Zoom in"
            style={{
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: radius.full, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <ZoomIn size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleReplace}
            aria-label="Replace photo"
            style={{
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: radius.full, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <RefreshCw size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            aria-label="Share"
            style={{
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: radius.full, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <Share2 size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(photo.id)}
            aria-label="Delete photo"
            style={{
              background: "rgba(239,68,68,0.3)", border: "none",
              borderRadius: radius.full, width: 34, height: 34,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Image area */}
      <div
        style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", cursor: scale > 1 ? "grab" : "default",
          position: "relative",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <motion.img
          src={photo.dataUrl}
          alt={photo.category || "Progress"}
          draggable={false}
          animate={{
            scale,
            x: position.x,
            y: position.y,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            maxWidth: "100%", maxHeight: "100%",
            objectFit: "contain",
            borderRadius: radius.sm,
          }}
        />
      </div>

      {/* Info bar */}
      <div style={{
        padding: "14px 20px",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: `${photo.color || "var(--accent)"}20`,
            borderRadius: radius.sm, padding: "4px 10px",
            fontSize: 10, fontWeight: 600, color: photo.color || "var(--accent)",
          }}>
            {photo.category || "Front"}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} /> {photo.date}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
          {photo.weight != null && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Scale size={10} /> {photo.weight} kg
            </span>
          )}
          {photo.level != null && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Target size={10} /> Lv.{photo.level}
            </span>
          )}
          {photo.streak != null && (
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Zap size={10} /> {photo.streak} streak
            </span>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </motion.div>,
    document.body
  );
}
