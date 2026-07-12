import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import useScrollLock from "../hooks/useScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Grid3X3, List, Shuffle, ImageIcon,
  Zap, Target, Scale, Clock,
  Plus, Trash2, CheckCircle, X, MoveHorizontal,
  ChevronDown, MoreHorizontal, Share2, Maximize2, RefreshCw, AlertTriangle,
} from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import { useProgressPhotoStore } from "../stores/progressPhotoStore";
import Button from "./ui/Button";
import PhotoViewer from "./PhotoViewer";
import BeforeAfterSlider from "./BeforeAfterSlider";

const CATEGORIES = ["Front", "Side", "Back"];
const CATEGORY_COLORS = { Front: "var(--accent)", Side: "var(--purple)", Back: "var(--green)" };

function compressImage(file, maxW = 800, maxH = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w *= ratio; h *= ratio;
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProgressPhotos({ streak, level, bodyStats }) {
  const photos = useProgressPhotoStore((s) => s.photos);
  const addPhoto = useProgressPhotoStore((s) => s.addPhoto);
  const deletePhoto = useProgressPhotoStore((s) => s.deletePhoto);
  const replacePhoto = useProgressPhotoStore((s) => s.replacePhoto);

  const [view, setView] = useState("timeline");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [showSheet, setShowSheet] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [beforeAfter, setBeforeAfter] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPhotoId, setMenuPhotoId] = useState(null);
  const [menuRect, setMenuRect] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const anyModalOpen = !!deleteConfirm || !!showSheet || !!showCategoryPicker || !!uploading || !!uploadSuccess;
  useScrollLock(anyModalOpen);

  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const replaceFileRef = useRef(null);
  const [replacePhotoId, setReplacePhotoId] = useState(null);

  const menuPhoto = useMemo(() => {
    if (!menuPhotoId) return null;
    return photos.find((p) => p.id === menuPhotoId) || null;
  }, [menuPhotoId, photos]);

  const latestWeight = useMemo(() => {
    if (bodyStats?.length > 0) {
      return bodyStats[bodyStats.length - 1]?.weight;
    }
    return null;
  }, [bodyStats]);

  // Clear success animation after delay
  useEffect(() => {
    if (uploadSuccess) {
      const t = setTimeout(() => setUploadSuccess(false), 2500);
      return () => clearTimeout(t);
    }
  }, [uploadSuccess]);

  // Clear error after delay
  useEffect(() => {
    if (uploadError) {
      const t = setTimeout(() => setUploadError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [uploadError]);

  // Clear delete success toast
  useEffect(() => {
    if (deleteSuccess) {
      const t = setTimeout(() => setDeleteSuccess(false), 2500);
      return () => clearTimeout(t);
    }
  }, [deleteSuccess]);

  const filteredPhotos = useMemo(() => {
    let result = [...photos];
    if (filter !== "all") {
      result = result.filter((p) => p.category === filter);
    }
    result.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sort === "newest" ? db - da : da - db;
    });
    return result;
  }, [photos, filter, sort]);

  const stats = useMemo(() => {
    if (photos.length === 0) return null;
    return {
      total: photos.length,
      months: new Set(photos.map((p) => {
        const d = new Date(p.date);
        return `${d.getMonth()}-${d.getFullYear()}`;
      })).size,
      categories: CATEGORIES.map((c) => ({
        label: c,
        count: photos.filter((p) => p.category === c).length,
        color: CATEGORY_COLORS[c],
      })),
    };
  }, [photos]);

  const handleFileCapture = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    setShowCategoryPicker(true);
    setShowSheet(false);
    e.target.value = "";
  }, []);

  const handleSavePhoto = useCallback(async (category) => {
    if (!capturedBlob) return;
    setUploading(true);
    setShowCategoryPicker(false);
    try {
      const dataUrl = await compressImage(capturedBlob);
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
      });
      const weight = latestWeight != null ? Number(latestWeight) : null;
      addPhoto({
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dataUrl,
        date: dateStr,
        time: timeStr,
        timestamp: now.toISOString(),
        category,
        weight,
        level: level ?? 0,
        streak: streak ?? 0,
        color: CATEGORY_COLORS[category] || "var(--accent)",
      });
      setUploadSuccess(true);
      setCapturedBlob(null);
    } catch (err) {
      setUploadError(err?.message || "Failed to save photo. Please try again.");
    }
    setUploading(false);
  }, [capturedBlob, addPhoto, latestWeight, level, streak]);

  const handleDelete = useCallback((id) => {
    deletePhoto(id);
    setViewerPhoto(null);
  }, [deletePhoto]);

  const handleReplace = useCallback((id, dataUrl) => {
    replacePhoto(id, dataUrl);
  }, [replacePhoto]);

  const handleSelectForCompare = useCallback((id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  }, [selectedIds]);

  const handleCompare = useCallback(() => {
    if (selectedIds.length !== 2) return;
    const sorted = selectedIds
      .map((id) => photos.find((p) => p.id === id))
      .filter(Boolean)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (sorted.length === 2) {
      setBeforeAfter({ before: sorted[0], after: sorted[1] });
    }
    setSelectedIds([]);
    setSelectMode(false);
  }, [selectedIds, photos]);

  const toggleSelectMode = useCallback(() => {
    setSelectMode(!selectMode);
    setSelectedIds([]);
  }, [selectMode]);

  const closeMenu = useCallback(() => {
    setMenuPhotoId(null);
    setMenuRect(null);
  }, []);

  const handleSharePhoto = useCallback(async (photo) => {
    closeMenu();
    if (navigator.share && photo.dataUrl) {
      try {
        const blob = await (await fetch(photo.dataUrl)).blob();
        const file = new File([blob], "progress-photo.jpg", { type: "image/jpeg" });
        await navigator.share({ files: [file], title: "FitForce Progress" });
      } catch {}
    }
  }, [closeMenu]);

  const handleDeleteConfirm = useCallback((id) => {
    deletePhoto(id);
    setDeleteConfirm(null);
    setDeleteSuccess(true);
    if (viewerPhoto?.id === id) setViewerPhoto(null);
  }, [deletePhoto, viewerPhoto]);

  // Close menu on outside click
  useEffect(() => {
    if (menuPhotoId) {
      const handler = (e) => {
        if (!e.target.closest('[data-photo-menu-btn]') && !e.target.closest('[data-photo-menu]')) {
          closeMenu();
        }
      };
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [menuPhotoId, closeMenu]);

  // Close menu on scroll
  useEffect(() => {
    if (menuPhotoId) {
      const handler = () => closeMenu();
      window.addEventListener("scroll", handler, true);
      return () => window.removeEventListener("scroll", handler, true);
    }
  }, [menuPhotoId, closeMenu]);

  // ---- Bottom Sheet ----
  const BottomSheet = () => {
    useScrollLock(true);
    return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1500,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "flex-end",
      }}
      onClick={() => setShowSheet(false)}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        style={{
          background: "var(--bg-card)",
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          width: "100%", maxWidth: 500, margin: "0 auto",
          overflow: "hidden",
          boxShadow: shadow.modal,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid var(--border)`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            Add Progress Photo
          </span>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSheet(false)}
            aria-label="Close"
            style={{
              background: "var(--bg-card2)", border: "none",
              borderRadius: radius.full, width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)",
            }}
          >
            <X size={16} />
          </motion.button>
        </div>

        <div style={{ padding: "12px 20px 20px" }}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowSheet(false);
              setTimeout(() => cameraRef.current?.click(), 300);
            }}
            style={{
              width: "100%", padding: "14px",
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 8, textAlign: "left",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: radius.md,
              background: `rgba(59,130,246,0.094)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Camera size={16} color={"var(--accent)"} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                Take Photo
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                Use your camera to capture progress
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setShowSheet(false);
              setTimeout(() => fileRef.current?.click(), 300);
            }}
            style={{
              width: "100%", padding: "14px",
              background: "var(--bg-card2)", border: `1px solid var(--border)`,
              borderRadius: radius.md, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 8, textAlign: "left",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: radius.md,
              background: `rgba(139,92,246,0.094)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ImageIcon size={16} color={"var(--purple)"} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                Choose from Gallery
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                Select an existing photo
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSheet(false)}
            style={{
              width: "100%", padding: "12px",
              background: "transparent", border: `1px solid var(--border)`,
              borderRadius: radius.md, cursor: "pointer",
              fontSize: 12, fontWeight: 500, color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
  };

  // ---- Category Picker ----
  const CategoryPicker = () => {
    useScrollLock(true);
    return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1500,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "flex-end",
      }}
      onClick={() => { setShowCategoryPicker(false); setCapturedBlob(null); }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        style={{
          background: "var(--bg-card)",
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          width: "100%", maxWidth: 500, margin: "0 auto",
          overflow: "hidden", boxShadow: shadow.modal,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid var(--border)`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            Select Category
          </span>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowCategoryPicker(false); setCapturedBlob(null); }}
            aria-label="Close"
            style={{
              background: "var(--bg-card2)", border: "none",
              borderRadius: radius.full, width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)",
            }}
          >
            <X size={16} />
          </motion.button>
        </div>
        <div style={{ padding: "12px 20px 20px" }}>
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSavePhoto(cat)}
              style={{
                width: "100%", padding: "14px", marginBottom: 8,
                background: "var(--bg-card2)", border: `1px solid var(--border)`,
                borderRadius: radius.md, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                textAlign: "left",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: radius.md,
                background: `${CATEGORY_COLORS[cat]}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Camera size={16} color={CATEGORY_COLORS[cat]} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {cat}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {cat === "Front" ? "Front-facing view" : cat === "Side" ? "Side profile" : "Back view"}
                </div>
              </div>
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => { setShowCategoryPicker(false); setCapturedBlob(null); }}
            style={{
              width: "100%", padding: "12px",
              background: "transparent", border: `1px solid var(--border)`,
              borderRadius: radius.md, cursor: "pointer",
              fontSize: 12, fontWeight: 500, color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
  };

  // ---- Upload animation overlay ----
  const UploadOverlay = () => {
    useScrollLock(true);
    return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1600,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          background: "var(--bg-card)",
          borderRadius: radius.xl, padding: "32px",
          textAlign: "center", boxShadow: shadow.modal,
        }}
      >
        <motion.div
          animate={uploadSuccess ? { scale: [1, 0.8, 1.2, 1], opacity: 1 } : {}}
          style={{
            width: 56, height: 56, borderRadius: radius.full,
            background: uploadSuccess ? "rgba(16,185,129,0.1)" : `rgba(59,130,246,0.1)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}
        >
          {uploadSuccess ? (
            <CheckCircle size={28} color={"var(--green)"} />
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Camera size={24} color={"var(--accent)"} />
            </motion.div>
          )}
        </motion.div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
          {uploadSuccess ? "Photo saved!" : "Saving photo..."}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {uploadSuccess ? "Your progress is being tracked" : "Compressing and storing"}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
  };

  // ---- Photo Card ----
  const PhotoCard = ({ photo, index }) => {
    const isSelected = selectedIds.includes(photo.id);
    const isMenuOpen = menuPhotoId === photo.id;
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        layout
        style={{
          background: "var(--bg-card2)",
          borderRadius: radius.md,
          border: `1px solid var(--border)`,
          cursor: "pointer",
          position: "relative",
          ...(view === "grid" ? {} : { display: "flex", gap: 12 }),
        }}
        onClick={() => {
          if (selectMode) {
            handleSelectForCompare(photo.id);
          } else if (photos.length >= 2 && !viewerPhoto) {
            setViewerPhoto(photo);
          }
        }}
      >
        {/* Image */}
        <div style={{
          position: "relative",
          ...(view === "grid"
            ? { width: "100%", aspectRatio: "3/4" }
            : { width: 80, height: 80, flexShrink: 0 }),
        }}>
          <img
            src={photo.dataUrl}
            alt={photo.category}
            loading="lazy"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              borderRadius: view === "grid" ? 0 : `${radius.md}px 0 0 ${radius.md}px`,
            }}
          />
          {selectMode && (
            <div style={{
              position: "absolute", top: 6, right: 6,
              width: 22, height: 22, borderRadius: "50%",
              background: isSelected ? "var(--accent)" : "rgba(255,255,255,0.8)",
              border: `2px solid ${isSelected ? "var(--accent)" : "rgba(0,0,0,0.15)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isSelected && <CheckCircle size={14} color="#fff" />}
            </div>
          )}
          {/* Category badge */}
          <div style={{
            position: "absolute", bottom: 6, left: 6,
            background: `${CATEGORY_COLORS[photo.category] || "var(--accent)"}e0`,
            padding: "2px 8px", borderRadius: radius.full,
            fontSize: 9, fontWeight: 600, color: "#fff",
            backdropFilter: "blur(4px)",
          }}>
            {photo.category || "Front"}
          </div>

          {/* 3-dot menu button */}
          {!selectMode && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-photo-menu-btn
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuRect({ top: rect.top, left: rect.right - 4, width: 160 });
                setMenuPhotoId(isMenuOpen ? null : photo.id);
              }}
              aria-label="Photo options"
              style={{
                position: "absolute", top: 6, right: 6,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(8px)",
                border: "none",
                borderRadius: radius.full,
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
                zIndex: 5,
              }}
            >
              <MoreHorizontal size={14} />
            </motion.button>
          )}
        </div>

        {/* Info */}
        {view === "timeline" && (
          <div style={{ flex: 1, padding: "10px 10px 10px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>
              {photo.date}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
              <Clock size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />
              {photo.time}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {photo.weight != null && (
                <span style={{
                  fontSize: 9, padding: "1px 8px", borderRadius: radius.full,
                  background: "rgba(16,185,129,0.082)", color: "var(--green)", fontWeight: 500,
                }}>
                  <Scale size={10} style={{ verticalAlign: "middle", marginRight: 2 }} />
                  {photo.weight} kg
                </span>
              )}
              {photo.level != null && (
                <span style={{
                  fontSize: 9, padding: "1px 8px", borderRadius: radius.full,
                  background: "rgba(59,130,246,0.082)", color: "var(--accent)", fontWeight: 500,
                }}>
                  <Target size={10} style={{ verticalAlign: "middle", marginRight: 2 }} />
                  Lv.{photo.level}
                </span>
              )}
              {photo.streak != null && photo.streak > 0 && (
                <span style={{
                  fontSize: 9, padding: "1px 8px", borderRadius: radius.full,
                  background: "rgba(245,158,11,0.082)", color: "var(--yellow)", fontWeight: 500,
                }}>
                  <Zap size={10} style={{ verticalAlign: "middle", marginRight: 2 }} />
                  {photo.streak}d
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // ---- Stats bar ----
  const StatsBar = () => stats ? (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8,
      marginBottom: 12,
    }}>
      <div style={{
        background: "var(--bg-card2)", border: `1px solid var(--border)`,
        borderRadius: radius.md, padding: "10px", textAlign: "center",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{stats.total}</div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>Total photos</div>
      </div>
      <div style={{
        background: "var(--bg-card2)", border: `1px solid var(--border)`,
        borderRadius: radius.md, padding: "10px", textAlign: "center",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{stats.months}</div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>Months tracked</div>
      </div>
      <div style={{
        background: "var(--bg-card2)", border: `1px solid var(--border)`,
        borderRadius: radius.md, padding: "10px", textAlign: "center",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
          {stats.categories.filter((c) => c.count > 0).length}
        </div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>Angles</div>
      </div>
    </div>
  ) : null;

  return (
    <motion.div variants={itemVariants} initial="initial" animate="animate">
      {/* Category filters */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 12,
        overflowX: "auto", paddingBottom: 4,
        WebkitOverflowScrolling: "touch",
      }}>
        {["all", ...CATEGORIES].map((cat) => {
          const active = filter === cat;
          return (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(cat)}
              style={{
                padding: "6px 14px", borderRadius: radius.full,
                border: "none", cursor: "pointer", fontSize: 11,
                fontWeight: active ? 600 : 400,
                background: active
                  ? (CATEGORY_COLORS[cat] || "var(--accent)")
                  : "var(--bg-card2)",
                color: active ? "#fff" : "var(--text-muted)",
                border: active ? "none" : `1px solid var(--border)`,
                whiteSpace: "nowrap",
              }}
            >
              {cat === "all" ? "All" : cat}
            </motion.button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12,
      }}>
        {/* View toggle */}
        <div style={{
          display: "flex", gap: 3,
          background: "var(--bg-card2)",
          borderRadius: radius.md, padding: 2,
          border: `1px solid var(--border)`,
        }}>
          {[
            { id: "timeline", icon: List },
            { id: "grid", icon: Grid3X3 },
          ].map(({ id, icon: Icon }) => {
            const active = view === id;
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView(id)}
                aria-label={id}
                style={{
                  padding: "6px 10px", borderRadius: radius.sm,
                  border: "none", cursor: "pointer",
                  background: active ? "var(--bg-card)" : "transparent",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  boxShadow: active ? shadow.card : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon size={14} />
              </motion.button>
            );
          })}
        </div>

        {/* Sort dropdown */}
        <div style={{ position: "relative" }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            style={{
              padding: "6px 12px", borderRadius: radius.md,
              border: `1px solid var(--border)`,
              cursor: "pointer", fontSize: 11, fontWeight: 500,
              background: "var(--bg-card2)", color: "var(--text-muted)",
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            {sort === "newest" ? "Newest" : "Oldest"}
            <ChevronDown size={12} />
          </motion.button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  background: "var(--bg-card)", border: `1px solid var(--border)`,
                  borderRadius: radius.md, boxShadow: shadow.elevated,
                  zIndex: 10, minWidth: 120, overflow: "hidden",
                }}
              >
                {["newest", "oldest"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSort(s); setShowMenu(false); }}
                    style={{
                      display: "block", width: "100%", padding: "8px 14px",
                      border: "none", background: sort === s ? "var(--bg-card2)" : "transparent",
                      cursor: "pointer", fontSize: 11, fontWeight: sort === s ? 600 : 400,
                      color: "var(--text)", textAlign: "left",
                    }}
                  >
                    {s === "newest" ? "Newest" : "Oldest"}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Empty state */}
      {filteredPhotos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: "center", padding: "40px 20px",
            background: `linear-gradient(135deg, rgba(168,85,247,0.031), var(--bg-card2))`,
            borderRadius: radius.lg,
            border: `2px dashed rgba(168,85,247,0.157)`,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ marginBottom: 12 }}
          >
            <Camera size={32} color={"var(--purple)"} />
          </motion.div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            Start your transformation journey
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
            Take your first progress photo to track changes over time
          </div>
          <Button onClick={() => setShowSheet(true)} style={{ fontSize: 12 }}>
            <Camera size={14} /> Add First Photo
          </Button>
        </motion.div>
      )}

      {/* Stats */}
      {filteredPhotos.length > 0 && <StatsBar />}

      {/* Photo grid/timeline */}
      {filteredPhotos.length > 0 && (
        <>
          {selectMode && (
            <div style={{
              display: "flex", gap: 8, marginBottom: 10,
              padding: "8px 12px", background: "var(--bg-card2)",
              borderRadius: radius.md, border: `1px solid var(--border)`,
              alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {selectedIds.length}/2 selected
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSelectMode}
                  style={{
                    padding: "5px 10px", borderRadius: radius.sm,
                    border: `1px solid var(--border)`, cursor: "pointer",
                    fontSize: 10, background: "transparent", color: "var(--text-muted)",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompare}
                  disabled={selectedIds.length !== 2}
                  style={{
                    padding: "5px 10px", borderRadius: radius.sm,
                    border: "none", cursor: selectedIds.length === 2 ? "pointer" : "default",
                    fontSize: 10, fontWeight: 600,
                    background: selectedIds.length === 2 ? "var(--accent)" : "var(--bg-card3)",
                    color: selectedIds.length === 2 ? "#fff" : "var(--text-muted)",
                    opacity: selectedIds.length === 2 ? 1 : 0.5,
                  }}
                >
                  <MoveHorizontal size={12} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  Compare
                </motion.button>
              </div>
            </div>
          )}

          <div style={{
            display: "flex", gap: 8, marginBottom: 10,
          }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleSelectMode}
              style={{
                padding: "6px 14px", borderRadius: radius.md,
                border: `1px solid var(--border)`, cursor: "pointer", fontSize: 11,
                background: selectMode ? "var(--accent)" : "var(--bg-card2)",
                color: selectMode ? "#fff" : "var(--text-muted)",
                fontWeight: selectMode ? 600 : 400,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <Shuffle size={12} />
              {selectMode ? "Cancel" : "Compare"}
            </motion.button>
            <div style={{ flex: 1 }} />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSheet(true)}
              style={{
                padding: "6px 14px", borderRadius: radius.md,
                border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                background: "var(--accent)", color: "#fff",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <Plus size={12} />
              Add
            </motion.button>
          </div>

          <div style={{
            display: view === "grid"
              ? "grid"
              : "flex",
            gridTemplateColumns: view === "grid" ? "repeat(2, 1fr)" : undefined,
            flexDirection: view === "timeline" ? "column" : undefined,
            gap: 8,
          }}>
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, i) => (
                <PhotoCard key={photo.id} photo={photo} index={i} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Persistent file inputs (outside BottomSheet so refs survive sheet close) */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileCapture}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileCapture}
      />
      <input
        ref={replaceFileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file || !replacePhotoId) return;
          compressImage(file).then((dataUrl) => {
            replacePhoto(replacePhotoId, dataUrl);
            setReplacePhotoId(null);
            setUploadSuccess(true);
          }).catch((err) => {
            setUploadError(err?.message || "Failed to replace photo.");
          });
          e.target.value = "";
        }}
      />

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showSheet && <BottomSheet />}
      </AnimatePresence>

      {/* Category Picker */}
      <AnimatePresence>
        {showCategoryPicker && <CategoryPicker />}
      </AnimatePresence>

      {/* Upload animation */}
      <AnimatePresence>
        {(uploading || uploadSuccess) && <UploadOverlay />}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed", bottom: 80, left: 16, right: 16,
              maxWidth: 400, margin: "0 auto", zIndex: 3000,
              background: "var(--bg-card)", border: `1px solid rgba(239,68,68,0.3)`,
              borderRadius: radius.md, padding: "12px 16px",
              boxShadow: shadow.elevated,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: radius.full,
              background: "rgba(239,68,68,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "var(--red)", fontSize: 16 }}>!</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                Failed to save photo
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                {uploadError}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setUploadError(null)}
              style={{
                background: "transparent", border: "none",
                cursor: "pointer", color: "var(--text-muted)", padding: 4,
              }}
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteConfirm && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 10000,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 16,
            }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-card)",
                border: `1px solid var(--border2)`,
                borderRadius: radius.xl,
                padding: "24px",
                width: "100%", maxWidth: 360,
                boxShadow: shadow.modal,
                textAlign: "center",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: radius.full,
                background: "rgba(239,68,68,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
              }}>
                <AlertTriangle size={24} color={"var(--red)"} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                Delete progress photo?
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                Are you sure you want to delete this progress photo? This action cannot be undone.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: radius.md,
                    border: `1px solid var(--border)`, cursor: "pointer",
                    fontSize: 12, fontWeight: 500,
                    background: "var(--bg-card2)", color: "var(--text-muted)",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleDeleteConfirm(deleteConfirm.id)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: radius.md,
                    border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    background: "var(--red)", color: "#fff",
                  }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* Delete success toast */}
      <AnimatePresence>
        {deleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed", bottom: 80, left: 16, right: 16,
              maxWidth: 400, margin: "0 auto", zIndex: 3000,
              background: "var(--bg-card)", border: `1px solid rgba(16,185,129,0.3)`,
              borderRadius: radius.md, padding: "12px 16px",
              boxShadow: shadow.elevated,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: radius.full,
              background: "rgba(16,185,129,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <CheckCircle size={16} color={"var(--green)"} />
            </div>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
              Progress photo deleted.
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDeleteSuccess(false)}
              style={{
                background: "transparent", border: "none",
                cursor: "pointer", color: "var(--text-muted)", padding: 4,
              }}
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Viewer */}
      <AnimatePresence>
        {viewerPhoto && (
          <PhotoViewer
            photo={viewerPhoto}
            onClose={() => setViewerPhoto(null)}
            onDelete={handleDelete}
            onReplace={handleReplace}
          />
        )}
      </AnimatePresence>

      {/* Before / After */}
      <AnimatePresence>
        {beforeAfter && (
          <BeforeAfterSlider
            before={beforeAfter.before}
            after={beforeAfter.after}
            onClose={() => setBeforeAfter(null)}
          />
        )}
      </AnimatePresence>

      {/* Portal-based context menu (rendered at document body, never clipped) */}
      {menuPhotoId && menuRect && menuPhoto && createPortal(
        <AnimatePresence>
          {menuPhotoId && (
            <>
              {/* Backdrop for closing on outside click */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed", inset: 0, zIndex: 5000,
                }}
                onClick={closeMenu}
              />
              {/* Menu */}
              <motion.div
                data-photo-menu
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "fixed",
                  top: (() => {
                    const M = 12, estH = 176;
                    const anchorT = menuRect.top;
                    const below = window.innerHeight - anchorT - M;
                    const above = anchorT - M;
                    let t;
                    if (below >= estH) t = anchorT;
                    else if (above >= estH) t = anchorT - estH;
                    else t = Math.max(M, Math.floor((window.innerHeight - estH) / 2));
                    return Math.max(M, Math.min(t, window.innerHeight - estH - M));
                  })(),
                  left: (() => {
                    const M = 12, estW = 180;
                    const anchorR = menuRect.left + 4;
                    let l = anchorR - estW;
                    l = Math.max(M, Math.min(l, window.innerWidth - estW - M));
                    return l;
                  })(),
                  maxWidth: `calc(100vw - ${12 * 2}px)`,
                  maxHeight: `calc(100vh - ${12 * 2}px)`,
                  background: "var(--bg-card)",
                  border: `1px solid var(--border)`,
                  borderRadius: radius.md,
                  boxShadow: shadow.elevated,
                  zIndex: 5001,
                  minWidth: 160,
                  overflow: "auto",
                }}
              >
                {[
                  { icon: Maximize2, label: "View Full Screen", action: () => { setViewerPhoto(menuPhoto); closeMenu(); } },
                  { icon: RefreshCw, label: "Replace Photo", action: () => { setReplacePhotoId(menuPhoto.id); closeMenu(); setTimeout(() => replaceFileRef.current?.click(), 100); } },
                  { icon: Trash2, label: "Delete Photo", action: () => { setDeleteConfirm(menuPhoto); closeMenu(); }, danger: true },
                  { icon: Share2, label: "Share Photo", action: () => handleSharePhoto(menuPhoto) },
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileTap={{ scale: 0.97 }}
                    onClick={item.action}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "10px 14px",
                      border: "none", background: "transparent",
                      cursor: "pointer", fontSize: 12,
                      color: item.danger ? "var(--red)" : "var(--text)",
                      textAlign: "left",
                    }}
                  >
                    <item.icon size={14} color={item.danger ? "var(--red)" : "var(--text-muted)"} style={{ flexShrink: 0 }} />
                    {item.label}
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
