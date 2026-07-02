import { useState, useRef, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Check, Edit3, AlertCircle, Loader, Apple, Flame, Dumbbell, Hash, Circle } from "lucide-react";
import {  radius, shadow } from "../styles/designSystem";
import Button from "./ui/Button";
import { callAI } from "../utils/api";
import { useNutritionStore } from "../stores/nutritionStore";

const VISION_MODEL = "qwen/qwen2.5-vl-72b-instruct:free";

export default function FoodScanner({ open, onClose }) {
  const [step, setStep] = useState("upload");
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const fileRef = useRef(null);
  const uid = useId();
  const addMeal = useNutritionStore(s => s.addMeal);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      setStep("preview");
      setError("");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    setAnalyzing(true);
    setError("");
    try {
      const system = `You are a professional nutritionist analyzing food from an image. Respond with ONLY valid JSON, no markdown:
{
  "name": "Food name with portion",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "servingSize": "e.g., 100g, 1 cup, 1 plate",
  "confidence": "high/medium/low",
  "description": "Brief description"
}`;
      const raw = await callAI({
        messages: [
          { role: "user", content: [
            { type: "text", text: "Analyze this food image and estimate its nutritional content." },
            { type: "image_url", image_url: { url: image } },
          ]},
        ],
        system,
        maxTokens: 1024,
        temperature: 0.3,
        model: VISION_MODEL,
      });
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed.name || !parsed.calories) throw new Error("Could not identify food");
      setResult(parsed);
      setEditValues({ name: parsed.name, cal: parsed.calories, protein: parsed.protein, carbs: parsed.carbs, fat: parsed.fat, serving: parsed.servingSize });
      setStep("result");
    } catch (err) {
      if (err?.rateLimited) {
        setError("Rate limited. Please wait before scanning again.");
      } else {
        setError(err?.message || "Analysis failed. Try describing the food manually.");
        setStep("manual");
      }
    }
    setAnalyzing(false);
  }, [image]);

  const handleManualSubmit = useCallback(() => {
    if (!editValues.name || !editValues.cal) return;
    const meal = {
      name: editValues.name,
      cal: +editValues.cal || 0,
      protein: +editValues.protein || 0,
      carbs: +editValues.carbs || 0,
      fat: +editValues.fat || 0,
      qty: 1,
      mealTime: "Snack",
    };
    addMeal(meal);
    onClose();
    setStep("upload");
    setImage(null);
    setResult(null);
  }, [editValues, addMeal, onClose]);

  const handleAddToMeals = useCallback(() => {
    if (editing && !editValues.name) return;
    if (!editing && !result) return;
    const vals = editing ? editValues : { name: result.name, cal: result.calories, protein: result.protein, carbs: result.carbs, fat: result.fat, serving: result.servingSize };
    if (!vals.name || !vals.cal) return;
    const meal = {
      name: vals.name,
      cal: +vals.cal || 0,
      protein: +vals.protein || 0,
      carbs: +vals.carbs || 0,
      fat: +vals.fat || 0,
      qty: 1,
      mealTime: "Snack",
    };
    addMeal(meal);
    onClose();
    setStep("upload");
    setImage(null);
    setResult(null);
  }, [result, editValues, editing, addMeal, onClose]);

  const resetAll = useCallback(() => {
    setStep("upload");
    setImage(null);
    setResult(null);
    setError("");
    setEditing(false);
    setEditValues({});
    setAnalyzing(false);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed", inset: 0,
            background: "var(--overlay)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 12, overflowY: "auto",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { onClose(); resetAll(); } }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 30 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              background: "var(--bg-card)",
              border: `1px solid var(--border2)`,
              borderRadius: radius.xl,
              width: "100%",
              maxWidth: 440,
              boxShadow: shadow.modal,
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <div style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "var(--bg-card)",
              borderBottom: `1px solid var(--border)`,
              padding: "16px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: radius.md,
                  background: `rgba(249,115,22,0.094)`, display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Camera size={16} color={"var(--orange)"} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>AI Food Scanner</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Snap & analyze any meal</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { onClose(); resetAll(); }}
                style={{
                  background: "var(--bg-card2)", border: "none",
                  borderRadius: radius.full, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-muted)",
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            <div style={{ padding: "20px" }}>
              {step === "upload" && (
                <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: radius.full,
                    background: `rgba(249,115,22,0.071)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "20px auto 16px",
                  }}>
                    <Camera size={36} color={"var(--orange)"} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                    Scan your food
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
                    Take a photo of your meal and AI will estimate its nutritional content
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} id={`${uid}-file`} name="food-image" aria-label="Upload food photo" />
                  <div style={{ display: "flex", gap: 8, maxWidth: 300, margin: "0 auto" }}>
                    <Button onClick={() => fileRef.current?.click()} style={{ flex: 1 }}>
                      <Camera size={14} /> Take Photo
                    </Button>
                    <Button variant="secondary" onClick={() => { setStep("manual"); setEditing(true); setEditValues({ name: "", cal: "", protein: "", carbs: "", fat: "", serving: "" }); }} style={{ flex: 1 }}>
                      <Edit3 size={14} /> Manual
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "manual" && (
                <motion.div key="manual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {error && (
                    <div style={{
                      background: `rgba(239,68,68,0.063)`, border: `1px solid rgba(239,68,68,0.145)`,
                      borderRadius: radius.md, padding: "10px 14px", marginBottom: 16,
                      fontSize: 12, color: "var(--red)",
                    }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>{error}</div>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Enter food details manually</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input id={`${uid}-manual-name`} name="food-name" aria-label="Food name" value={editValues.name || ""} onChange={e => setEditValues(p => ({ ...p, name: e.target.value }))} placeholder="Food name (e.g., Grilled Chicken Salad)"
                      style={{
                        width: "100%", padding: "10px 12px", borderRadius: radius.md, boxSizing: "border-box",
                        background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                        color: "var(--text)", fontSize: 13, outline: "none",
                      }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["cal", "Calories", "number"],
                        ["protein", "Protein (g)", "number"],
                        ["carbs", "Carbs (g)", "number"],
                        ["fat", "Fat (g)", "number"],
                      ].map(([k, label, type]) => (
                        <input key={k} id={`${uid}-manual-${k}`} name={`food-${k}`} aria-label={label} type={type} value={editValues[k] || ""} onChange={e => setEditValues(p => ({ ...p, [k]: e.target.value }))} placeholder={label}
                          style={{
                            width: "100%", padding: "10px 12px", borderRadius: radius.md, boxSizing: "border-box",
                            background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                            color: "var(--text)", fontSize: 13, outline: "none",
                          }} />
                      ))}
                    </div>
                    <Button onClick={handleManualSubmit} disabled={!editValues.name || !editValues.cal}>
                      <Apple size={14} /> Add to Meals
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "preview" && (
                <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{
                    borderRadius: radius.lg, overflow: "hidden", marginBottom: 16,
                    border: `1px solid var(--border2)`,
                  }}>
                    <img src={image} alt="Food" style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} />
                  </div>
                  <Button onClick={handleAnalyze} disabled={analyzing} style={{ width: "100%", marginBottom: 8 }}>
                    {analyzing ? (
                      <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
                    ) : (
                      <><Camera size={14} /> Analyze Food</>
                    )}
                  </Button>
                  <Button variant="ghost" onClick={() => { setStep("upload"); setImage(null); }} style={{ width: "100%" }}>
                    Retake photo
                  </Button>
                </motion.div>
              )}

              {analyzing && step !== "preview" && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: `3px solid var(--border)`,
                      borderTopColor: "var(--orange)",
                      margin: "0 auto 16px",
                    }}
                  />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                    Analyzing your food...
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    AI is identifying the meal and estimating nutrition
                  </div>
                </div>
              )}

              {step === "result" && result && !analyzing && (
                <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {image && (
                    <div style={{
                      borderRadius: radius.lg, overflow: "hidden", marginBottom: 14,
                      border: `1px solid var(--border2)`,
                    }}>
                      <img src={image} alt="Scanned food" style={{ width: "100%", maxHeight: 180, objectFit: "cover", display: "block" }} />
                    </div>
                  )}

                  {!editing ? (
                    <div style={{
                      background: `rgba(16,185,129,0.031)`, border: `1px solid rgba(16,185,129,0.125)`,
                      borderRadius: radius.lg, padding: "16px", marginBottom: 16,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{result.name}</div>
                        {result.confidence && (
                          <div style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: radius.full,
                            background: result.confidence === "high" ? `rgba(16,185,129,0.082)` : result.confidence === "medium" ? `rgba(245,158,11,0.082)` : `rgba(249,115,22,0.082)`,
                            color: result.confidence === "high" ? "var(--green)" : result.confidence === "medium" ? "var(--yellow)" : "var(--orange)",
                            fontWeight: 500,
                          }}>
                            {result.confidence}
                          </div>
                        )}
                      </div>
                      {result.description && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>{result.description}</div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          ["Calories", result.calories, <Flame size={16} />, "var(--orange)"],
                          ["Protein", `${result.protein}g`, <Dumbbell size={16} />, "var(--blue)"],
                          ["Carbs", `${result.carbs}g`, <Hash size={16} />, "var(--yellow)"],
                          ["Fat", `${result.fat}g`, <Circle size={16} />, "var(--purple)"],
                        ].map(([l, v, emoji, c]) => (
                          <div key={l} style={{
                            background: "var(--bg-card2)", borderRadius: radius.sm,
                            padding: "8px", textAlign: "center",
                            border: `1px solid var(--border)`,
                          }}>
                            <div style={{ fontSize: 16, marginBottom: 2 }}>{emoji}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{l}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {result.servingSize && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
                          Serving: {result.servingSize}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>Edit values</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <input id={`${uid}-edit-name`} name="food-name" aria-label="Food name" value={editValues.name || ""} onChange={e => setEditValues(p => ({ ...p, name: e.target.value }))} placeholder="Food name"
                          style={{
                            width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box",
                            background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                            color: "var(--text)", fontSize: 13, outline: "none",
                          }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {[
                            ["cal", "Calories", "number"],
                            ["protein", "Protein (g)", "number"],
                            ["carbs", "Carbs (g)", "number"],
                            ["fat", "Fat (g)", "number"],
                          ].map(([k, label, type]) => (
                            <input key={k} id={`${uid}-edit-${k}`} name={`food-${k}`} aria-label={label} type={type} value={editValues[k] || ""} onChange={e => setEditValues(p => ({ ...p, [k]: e.target.value }))} placeholder={label}
                              style={{
                                width: "100%", padding: "9px 12px", borderRadius: radius.md, boxSizing: "border-box",
                                background: "var(--bg-card2)", border: `1px solid var(--border2)`,
                                color: "var(--text)", fontSize: 13, outline: "none",
                              }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 8 }}>
                    <Button onClick={() => setEditing(!editing)} variant="secondary" style={{ flex: 1 }}>
                      <Edit3 size={14} /> {editing ? "Done Editing" : "Edit"}
                    </Button>
                    <Button onClick={handleAddToMeals} style={{ flex: 1 }}>
                      <Check size={14} /> Add to Meals
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


