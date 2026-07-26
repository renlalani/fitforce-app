import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Camera, Image, X } from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import { useUserStore } from "../stores/userStore";
import { compressImage } from "../utils/imageUtils";
import Button from "./ui/Button";

function BottomSheet({ show, onClose, onSelectGallery, onSelectCamera, hasPhoto, onRemove }) {
  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 10000,
            }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              background: "var(--bg-card)",
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              zIndex: 10001,
              padding: "20px 20px 28px",
              boxShadow: shadow.dropdown,
            }}
          >
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: "var(--border2)",
              margin: "0 auto 16px",
            }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", textAlign: "center", marginBottom: 16 }}>
              Profile Photo
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <motion.button
                whileHover={{ background: "var(--bg-card2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onClose(); setTimeout(onSelectGallery, 200); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: radius.md,
                  border: "none", background: "transparent",
                  cursor: "pointer", color: "var(--text)", fontSize: 14,
                  width: "100%", textAlign: "left",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: radius.md,
                  background: "rgba(59,130,246,0.094)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Image size={16} color={"var(--accent)"} />
                </div>
                <span>Select from Gallery</span>
              </motion.button>

              <motion.button
                whileHover={{ background: "var(--bg-card2)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onClose(); setTimeout(onSelectCamera, 200); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: radius.md,
                  border: "none", background: "transparent",
                  cursor: "pointer", color: "var(--text)", fontSize: 14,
                  width: "100%", textAlign: "left",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: radius.md,
                  background: "rgba(59,130,246,0.094)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Camera size={16} color={"var(--accent)"} />
                </div>
                <span>Take Photo</span>
              </motion.button>

              {hasPhoto && (
                <motion.button
                  whileHover={{ background: "rgba(239,68,68,0.06)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onClose(); setTimeout(onRemove, 200); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: radius.md,
                    border: "none", background: "transparent",
                    cursor: "pointer", color: "var(--red)", fontSize: 14,
                    width: "100%", textAlign: "left",
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: radius.md,
                    background: "rgba(239,68,68,0.094)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <X size={16} color={"var(--red)"} />
                  </div>
                  <span>Remove Photo</span>
                </motion.button>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={onClose}
              style={{ width: "100%", marginTop: 12 }}
            >
              Cancel
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function CropPreviewModal({ file, onConfirm, onCancel }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleConfirm = async () => {
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      onConfirm(dataUrl);
    } catch {
      onCancel();
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 20000,
          display: "flex", flexDirection: "column",
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px",
        }}>
          <button
            onClick={onCancel}
            style={{
              background: "none", border: "none", color: "#fff",
              fontSize: 14, cursor: "pointer", padding: "8px 4px",
            }}
          >
            Cancel
          </button>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Profile Photo</div>
          <button
            onClick={handleConfirm}
            style={{
              background: "none", border: "none", color: "var(--accent)",
              fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 4px",
            }}
          >
            Use Photo
          </button>
        </div>

        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", position: "relative",
        }}>
          <div
            style={{
              width: 280, height: 280, borderRadius: "50%",
              overflow: "hidden", position: "relative",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: "0 0 0 4px rgba(255,255,255,0.15)",
            }}
            onMouseDown={handleMouseDown}
          >
            {previewUrl && (
              <img
                ref={imageRef}
                src={previewUrl}
                alt="Preview"
                draggable={false}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
            )}
          </div>
        </div>

        <div style={{
          padding: "16px 24px 32px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Zoom</span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--accent)" }}
          />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", minWidth: 30, textAlign: "right" }}>
            {Math.round(scale * 100)}%
          </span>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default function UserAvatar({ profile, size = 56, editable = false, onClick }) {
  const profilePhoto = useUserStore(s => s.profilePhoto);
  const setProfilePhoto = useUserStore(s => s.setProfilePhoto);
  const removeProfilePhoto = useUserStore(s => s.removeProfilePhoto);
  const [showSheet, setShowSheet] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const initial = profile?.name?.charAt(0)?.toUpperCase() || "F";
  const fontSize = Math.max(10, size * 0.42);

  const handleGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    e.target.value = "";
  };

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    e.target.value = "";
  };

  const handleCropConfirm = async (dataUrl) => {
    setProfilePhoto(dataUrl);
    setCropFile(null);
  };

  const handleCropCancel = () => {
    setCropFile(null);
  };

  const handleRemove = () => {
    removeProfilePhoto();
  };

  const handleAvatarClick = () => {
    if (editable) {
      setShowSheet(true);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: editable ? 1.05 : 1.08 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleAvatarClick}
        style={{
          width: size, height: size,
          borderRadius: radius.full,
          overflow: "hidden",
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: editable ? "pointer" : "pointer",
          border: `2px solid ${profilePhoto ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.188)"}`,
          padding: 0,
          flexShrink: 0,
          background: profilePhoto ? "transparent" : "var(--accent-gradient)",
          boxShadow: profilePhoto ? "none" : shadow.glow("var(--accent)"),
        }}
        aria-label={editable ? "Change profile photo" : "Profile"}
      >
        {profilePhoto ? (
          <motion.img
            src={profilePhoto}
            alt="Profile"
            onLoad={() => setPhotoLoaded(true)}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: photoLoaded ? 1 : 0, scale: photoLoaded ? 1 : 1.05 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <span style={{
            fontWeight: 700, fontSize, color: "#fff",
            lineHeight: 1,
          }}>
            {initial}
          </span>
        )}

        {editable && (
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: size * 0.34, height: size * 0.34,
            borderRadius: "50%",
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid var(--bg-card)`,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}>
            <Camera size={size * 0.16} color="#fff" />
          </div>
        )}
      </motion.button>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleGalleryChange}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        style={{ display: "none" }}
        onChange={handleCameraChange}
      />

      <BottomSheet
        show={showSheet}
        onClose={() => setShowSheet(false)}
        onSelectGallery={handleGallery}
        onSelectCamera={handleCamera}
        hasPhoto={!!profilePhoto}
        onRemove={handleRemove}
      />

      {cropFile && (
        <CropPreviewModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
