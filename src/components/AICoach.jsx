import { useState, useEffect, useRef, useCallback, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Sparkles, Calendar, BarChart3, AlertCircle,
  Zap, Copy, Check, RefreshCw, Square, ThumbsUp, ThumbsDown,
  ChevronDown, MessageSquare, Brain, StopCircle
} from "lucide-react";
import { radius, shadow } from "../styles/designSystem";
import MarkdownRenderer from "./MarkdownRenderer";
import { useIsMobile } from "../hooks/useMediaQuery";
import useAIStream from "../hooks/useAIStream";
import { useAICoachStore } from "../stores/aiCoachStore";

const SUGGESTIONS = [
  { icon: DumbbellIcon, title: "Create a workout plan", desc: "Personalized for your level and goals" },
  { icon: AppleIcon, title: "Analyze my diet", desc: "Get feedback on today's nutrition" },
  { icon: CalculatorIcon, title: "Calculate calories", desc: "Find your perfect daily intake" },
  { icon: TargetIcon, title: "Build muscle plan", desc: "Science-based muscle building" },
  { icon: FlameIcon, title: "Lose fat", desc: "Sustainable fat loss strategy" },
  { icon: PillIcon, title: "Supplements guide", desc: "Evidence-based recommendations" },
];

const FOLLOW_UPS = {
  workout: ["How many days should I train?", "What exercises should I avoid?", "How do I warm up properly?"],
  nutrition: ["What should I eat before a workout?", "How much water should I drink?", "What are the best protein sources?"],
  diet: ["How do I track calories?", "What's a good macro split?", "Should I take supplements?"],
  recovery: ["How much sleep do I need?", "What are the best recovery methods?", "How do I prevent injuries?"],
  muscle: ["How fast can I build muscle?", "What's progressive overload?", "Should I train to failure?"],
  default: ["Tell me more about that", "How do I get started?", "What's the next step?"],
};

function getFollowUps(text) {
  const t = text.toLowerCase();
  if (t.includes("workout") || t.includes("exercise") || t.includes("train") || t.includes("gym")) return FOLLOW_UPS.workout;
  if (t.includes("eat") || t.includes("food") || t.includes("meal") || t.includes("nutrition") || t.includes("diet") || t.includes("calorie")) return FOLLOW_UPS.nutrition;
  if (t.includes("protein") || t.includes("carbs") || t.includes("fat") || t.includes("macro")) return FOLLOW_UPS.diet;
  if (t.includes("recover") || t.includes("rest") || t.includes("sleep") || t.includes("injury") || t.includes("pain")) return FOLLOW_UPS.recovery;
  if (t.includes("muscle") || t.includes("gain") || t.includes("strength") || t.includes("size")) return FOLLOW_UPS.muscle;
  return FOLLOW_UPS.default;
}

function DumbbellIcon(props) { return (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={"var(--accent)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6.5 6.5 17.5 17.5M6.5 17.5 17.5 6.5M3 8l2-2M3 16l2 2M19 8l2-2M19 16l2 2M8 3l2 2M8 21l2-2M14 3l2 2M14 21l2-2"/>
  </svg>
); }
function AppleIcon(props) { return (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={"var(--green)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 3-1-1.56-2.78-3-5-3a4.91 4.91 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
  </svg>
); }
function CalculatorIcon(props) { return (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={"var(--blue)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="8" y1="10" y2="10"/><line x1="12" x2="12" y1="10" y2="10"/><line x1="16" x2="16" y1="10" y2="10"/><line x1="8" x2="8" y1="14" y2="14"/><line x1="12" x2="12" y1="14" y2="14"/><line x1="16" x2="16" y1="14" y2="14"/><line x1="8" x2="8" y1="18" y2="18"/><line x1="12" x2="12" y1="18" y2="18"/>
  </svg>
); }
function TargetIcon(props) { return (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={"var(--purple)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
); }
function FlameIcon(props) { return (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={"var(--orange)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
); }
function PillIcon(props) { return (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={"var(--teal)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>
  </svg>
); }

export default function AICoach({ profile, totalCal, totalProt, water, level, xp, latestWeight }) {
  const isMobile = useIsMobile();
  const msgs = useAICoachStore(s => s.msgs);
  const setMsgs = useAICoachStore(s => s.setMsgs);
  const rateLimited = useAICoachStore(s => s.rateLimited);
  const setRateLimited = useAICoachStore(s => s.setRateLimited);
  const focusInput = useAICoachStore(s => s.focusInput);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState(null);
  const [mode, setMode] = useState("chat");
  const [weekPlan, setWeekPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [likedMsgs, setLikedMsgs] = useState({});
  const [showStopBtn, setShowStopBtn] = useState(false);
  const [emptyResponse, setEmptyResponse] = useState(false);
  const ai = useAIStream();

  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const inputId = useId();
  const lastInputRef = useRef("");
  const streamingMsgIdRef = useRef(null);

  useEffect(() => {
    streamingMsgIdRef.current = streamingMsgId;
  }, [streamingMsgId]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (focusInput > 0) {
      inputRef.current?.focus();
    }
  }, [focusInput]);

  useEffect(() => {
    return () => ai.cancel();
  }, []);

  const checkAtBottom = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;
    const threshold = 80;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setShowScrollBtn(!isAtBottomRef.current);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      isAtBottomRef.current = true;
      setShowScrollBtn(false);
    }
  }, []);

  const autoScroll = useCallback(() => {
    if (isAtBottomRef.current && chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  const systemPrompt = useMemo(() => `You are FitForce AI Coach, an expert personal trainer and nutritionist. 
User: ${profile.name}, Level: ${profile.level}, Goal: ${profile.goal}, Weight: ${latestWeight}kg, Height: ${profile.height}cm, Age: ${profile.age}, Gender: ${profile.gender}.
Today: ${totalCal} kcal eaten, ${totalProt}g protein, ${water} glasses water. Fitness Level ${level} (${xp} XP).
You can: create personalized workout plans, analyze nutrition, recommend exercises, give recovery advice, suggest meals, provide motivation, offer injury-safe modifications, and track progress.
Be concise, energetic, and expert. Use markdown for formatting. Max 150 words per response.`, [profile, totalCal, totalProt, water, level, xp, latestWeight]);

  const stopGenerating = useCallback(() => {
    const currentId = streamingMsgIdRef.current;
    ai.cancel();
    setShowStopBtn(false);
    setStreaming(false);
    setLoading(false);
    setStreamingMsgId(null);
    setMsgs(prev => prev.filter(m => m.id !== currentId || m.text));
  }, [ai, setMsgs]);

  const callAIStream = useCallback(async (messages, sys, maxTok, onChunk) => {
    ai.cancel();
    try {
      const text = await ai.stream({
        messages,
        system: sys || systemPrompt,
        maxTokens: maxTok || 2048,
        onChunk,
      });
      setRateLimited(null);
      if (text === null) return null;
      if (!text || !text.trim()) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AICoach] callAIStream: AI returned empty text, treating as error");
        }
        setEmptyResponse(true);
        throw new Error("EMPTY_RESPONSE");
      }
      return text;
    } catch (e) {
      if (e.code === "LOCKED") throw e;
      if (e.isRateLimited || e.rateLimited) {
        setRateLimited(e.resetsAt || new Date(Date.now() + 3600000));
        throw new Error("RATE_LIMITED");
      }
      throw e;
    }
  }, [systemPrompt, ai]);

  const sendingRef = useRef(false);

  const send = useCallback(async (customInput) => {
    if (sendingRef.current) return;
    const msg = (customInput || input).trim();
    if (!msg || loading) return;

    sendingRef.current = true;
    setEmptyResponse(false);
    lastInputRef.current = msg;
    setInput("");
    const userMsg = { role: "user", text: msg, id: Date.now().toString() };
    const aiMsg = { role: "ai", text: "", id: (Date.now() + 1).toString(), streaming: true };
    setMsgs(prev => [...prev, userMsg, aiMsg]);
    setStreamingMsgId(aiMsg.id);
    setLoading(true);
    setStreaming(true);
    setShowStopBtn(true);

    const history = msgs
      .filter(m => m.id !== "welcome")
      .map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

    let accumulated = "";
    try {
      const result = await callAIStream(
        [
          ...history,
          { role: "user", content: msg },
        ],
        null,
        2048,
        (chunk) => {
          accumulated = chunk;
          setMsgs(prev => prev.map(m =>
            m.id === aiMsg.id ? { ...m, text: chunk } : m
          ));
          autoScroll();
        }
      );

      if (result === null) return;

      if (!accumulated) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AICoach] Safety net: accumulated empty despite callAIStream succeeding");
        }
        setMsgs(prev => prev.filter(m => m.id !== aiMsg.id));
        setInput(lastInputRef.current);
        setEmptyResponse(true);
      } else {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id ? { ...m, text: accumulated, streaming: false } : m
        ));
      }
    } catch (e) {
      if (e.code === "LOCKED") return;
      if (e.message === "RATE_LIMITED") {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id
            ? { ...m, text: "The AI is temporarily busy. Please wait a few seconds and try again.", streaming: false, error: true }
            : m
        ));
      } else if (e.message === "EMPTY_RESPONSE") {
        setMsgs(prev => prev.filter(m => m.id !== aiMsg.id));
        setInput(lastInputRef.current);
      } else if (e.name !== "AbortError") {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id
            ? { ...m, text: accumulated || `**Error:** ${e.message || "Connection failed. Try again."}`, streaming: false, error: true }
            : m
        ));
      }
    } finally {
      sendingRef.current = false;
      setLoading(false);
      setStreaming(false);
      setStreamingMsgId(null);
      setShowStopBtn(false);
    }
  }, [input, loading, msgs, callAIStream, autoScroll]);

  const retryLast = useCallback(() => {
    if (lastInputRef.current) {
      setEmptyResponse(false);
      send(lastInputRef.current);
    }
  }, [send]);

  const regenerate = useCallback(async (msgIndex) => {
    const targetMsg = msgs[msgIndex];
    if (!targetMsg || targetMsg.role !== "ai") return;

    const userMsg = msgs[msgIndex - 1];
    if (!userMsg || userMsg.role !== "user") return;

    const aiMsg = { role: "ai", text: "", id: (Date.now() + 1).toString(), streaming: true };
    setMsgs(prev => [...prev.slice(0, msgIndex), aiMsg]);
    setStreamingMsgId(aiMsg.id);
    setLoading(true);
    setStreaming(true);
    setShowStopBtn(true);

    const history = msgs
      .slice(0, msgIndex - 1)
      .filter(m => m.id !== "welcome")
      .map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

    try {
      let accumulated = "";
      const result = await callAIStream(
        [...history, { role: "user", content: userMsg.text }],
        null,
        2048,
        (chunk) => {
          accumulated = chunk;
          setMsgs(prev => prev.map(m =>
            m.id === aiMsg.id ? { ...m, text: chunk } : m
          ));
          autoScroll();
        }
      );
      if (result === null) return;
      if (!accumulated) {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id
            ? { ...m, text: "We couldn't generate a response right now. Please try again in a few seconds.", streaming: false, error: true }
            : m
        ));
      } else {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id ? { ...m, text: accumulated, streaming: false } : m
        ));
      }
    } catch (e) {
      if (e.code === "LOCKED") return;
      if (e.message === "RATE_LIMITED" || e.message === "EMPTY_RESPONSE") {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id
            ? { ...m, text: "The AI is temporarily busy. Please wait a few seconds and try again.", streaming: false, error: true }
            : m
        ));
      } else if (e.name !== "AbortError") {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id
            ? { ...m, text: `**Error:** ${e.message || "Connection failed. Try again."}`, streaming: false, error: true }
            : m
        ));
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      setStreamingMsgId(null);
      setShowStopBtn(false);
    }
  }, [msgs, callAIStream, autoScroll]);

  const generateWeekPlan = async () => {
    setPlanLoading(true);
    setWeekPlan(null);
    try {
      const sys = "You are a professional fitness coach. Respond ONLY with valid JSON, no markdown, no backticks, no extra text.";
      const prompt = `Create a 7-day workout plan for: Level=${profile.level}, Goal=${profile.goal}. Return JSON exactly: {"days":[{"day":"Mon","focus":"Push","exercises":["Bench Press 3x10","OHP 3x10"],"duration":"60 min","note":"tip here"},...],"tips":"summary here"}`;

      let raw = "";
      const result = await callAIStream(
        [{ role: "user", content: prompt }],
        sys,
        1200,
        (chunk) => { raw = chunk; }
      );
      if (result === null) return;

      const clean = raw.replace(/```json|```/g, "").trim();
      setWeekPlan(JSON.parse(clean));
    } catch (e) {
      if (e.code === "LOCKED") return;
      if (e.message === "RATE_LIMITED") {
        setWeekPlan({ error: "The AI is temporarily busy. Please wait a few seconds and try again." });
      } else {
        setWeekPlan({ error: "Could not generate plan. Try again." });
      }
    } finally {
      setPlanLoading(false);
    }
  };

  const analyzeDay = async () => {
    setAnalyzing(true);
    const calGoal = profile.goal === "Fat Loss" ? 2000 : 2800;
    const protGoal = latestWeight ? Math.round(latestWeight * 2) : 150;
    const prompt = `Analyze today for ${profile.name}: ate ${totalCal} kcal (goal ${calGoal}), ${totalProt}g protein (goal ${protGoal}g), ${water}/8 glasses water. Give 3 specific actionable recommendations. Be direct, max 100 words.`;

    const aiMsg = { role: "ai", text: "", id: (Date.now() + 1).toString(), streaming: true };
    setMsgs(prev => [...prev, aiMsg]);
    setStreamingMsgId(aiMsg.id);
    setLoading(true);
    setStreaming(true);
    setShowStopBtn(true);

    try {
      let accumulated = "";
      const result = await callAIStream(
        [{ role: "user", content: prompt }],
        null,
        1024,
        (chunk) => {
          accumulated = chunk;
          setMsgs(prev => prev.map(m =>
            m.id === aiMsg.id ? { ...m, text: "**Daily Analysis:**\n\n" + chunk } : m
          ));
          autoScroll();
        }
      );
      if (result === null) return;
      if (!accumulated) {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id
            ? { ...m, text: "We couldn't generate a response right now. Please try again in a few seconds.", streaming: false, error: true }
            : m
        ));
      } else {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id ? { ...m, streaming: false } : m
        ));
      }
      setMode("chat");
    } catch (e) {
      if (e.code === "LOCKED") return;
      if (e.message === "RATE_LIMITED" || e.message === "EMPTY_RESPONSE") {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id
            ? { ...m, text: "The AI is temporarily busy. Please wait a few seconds and try again.", streaming: false, error: true }
            : m
        ));
      } else if (e.name !== "AbortError") {
        setMsgs(prev => prev.map(m =>
          m.id === aiMsg.id ? { ...m, text: "Analysis failed. Try again.", streaming: false, error: true } : m
        ));
      }
    } finally {
      setAnalyzing(false);
      setLoading(false);
      setStreaming(false);
      setStreamingMsgId(null);
      setShowStopBtn(false);
    }
  };

  const copyRef = useRef(null);
  const copyMsg = useCallback((text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    if (copyRef.current) clearTimeout(copyRef.current);
    copyRef.current = setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const dayColors = {   Mon: "var(--accent)", Tue: "var(--blue)", Wed: "var(--green)", Thu: "var(--yellow)", Fri: "var(--purple)", Sat: "var(--orange)", Sun: "var(--teal)" };

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    if (e.key === "Escape" && streaming) {
      stopGenerating();
    }
  }, [send, streaming, stopGenerating]);

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === "Escape" && streaming) {
        stopGenerating();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [streaming, stopGenerating]);

  return (
    <div style={{
      flex: 1,
      display: "flex", flexDirection: "column",
      minHeight: 0,
      maxWidth: isMobile ? "100%" : "100%",
      margin: 0,
    }}>
      {/* Content Area - flexes to fill remaining space */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <AnimatePresence mode="wait">
          {mode === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: "absolute", inset: 0,
                overflowY: "auto",
              }}
            >
              <div>
                <AnimatePresence>
                  {rateLimited && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        background: `rgba(245,158,11,0.063)`,
                        border: `1px solid rgba(245,158,11,0.145)`,
                        borderRadius: radius.lg,
                        padding: "14px 18px",
                        marginBottom: 14,
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <AlertCircle size={18} color={"var(--yellow)"} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#B45309", marginBottom: 4 }}>
                          AI Coach is temporarily unavailable
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                          The free API limit has been reached. It resets at{" "}
                          <span style={{ color: "#B45309" }}>
                            {rateLimited.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span> ({rateLimited.toLocaleDateString([], { month: "short", day: "numeric" })}).
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                          While you wait — browse the Exercise Library, log your meals, or update your Progress.
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {emptyResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        background: `rgba(239,68,68,0.063)`,
                        border: `1px solid rgba(239,68,68,0.145)`,
                        borderRadius: radius.lg,
                        padding: "14px 18px",
                        marginBottom: 14,
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <AlertCircle size={18} color={"var(--red)"} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--red)", marginBottom: 4 }}>
                          Couldn't generate a response
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                          We couldn't generate a response right now. Please try again in a few seconds.
                        </div>
                        <button
                          onClick={retryLast}
                          style={{
                            marginTop: 10,
                            padding: "6px 14px",
                            borderRadius: radius.sm,
                            border: "none",
                            background: "var(--accent)",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Retry
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div style={{
                display: "flex", gap: 6, marginBottom: isMobile ? 8 : 14,
                background: "var(--bg-card2)", borderRadius: radius.lg,
                padding: 4, border: `1px solid var(--border)`,
              }}>
                {[
                  { id: "chat", label: "Chat", icon: MessageSquare },
                  { id: "plan", label: "Week Plan", icon: Calendar },
                  { id: "analyze", label: analyzing ? "Analyzing..." : "Analyze Day", icon: BarChart3 },
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (id === "analyze") { if (!analyzing) analyzeDay(); }
                      else setMode(id);
                      if (streaming) stopGenerating();
                    }}
                    style={{
                      flex: 1,
                      padding: isMobile ? "8px 10px" : "10px 14px",
                      borderRadius: radius.md,
                      border: "none",
                      background: mode === id ? "var(--bg-card)" : "transparent",
                      color: mode === id ? "var(--accent)" : "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: mode === id ? 600 : 400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      boxShadow: mode === id ? shadow.floating : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Icon size={isMobile ? 12 : 14} />
                    {isMobile && id === "analyze" ? "Analyze" : label}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateWeekPlan}
                disabled={planLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "var(--accent-gradient)",
                  color: "#fff",
                  border: "none",
                  borderRadius: radius.lg,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: planLoading ? "not-allowed" : "pointer",
                  opacity: planLoading ? 0.6 : 1,
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {planLoading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block" }}
                    />
                    Generating your plan...
                  </>
                ) : (
                  <><Sparkles size={16} /> Generate My Week Plan</>
                )}
              </motion.button>

              {weekPlan?.error && (
                <div style={{
                  background: `rgba(239,68,68,0.063)`,
                  border: `1px solid rgba(239,68,68,0.145)`,
                  borderRadius: radius.md,
                  padding: "12px 16px",
                  color: "var(--red)",
                  fontSize: 13,
                  marginBottom: 12,
                }}>
                  {weekPlan.error}
                </div>
              )}

              {weekPlan?.days && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {weekPlan.days.map((d, i) => {
                    const dayColor = dayColors[d.day] || "var(--accent)";
                    return (
                    <motion.div
                      key={d.day}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        background: `linear-gradient(135deg, ${dayColor}04, var(--bg-card2))`,
                        border: `1px solid ${dayColor}15`,
                        borderRadius: radius.md,
                        padding: "14px",
                        marginBottom: 8,
                        borderLeft: `3px solid ${dayColor}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, color: dayColor, fontSize: 13 }}>{d.day}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.focus}{d.duration ? ` · ${d.duration}` : ""}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                        {(d.exercises || []).map((ex, j) => (
                          <span key={`${d.day}-${ex}-${j}`} style={{
                            fontSize: 11, padding: "3px 10px",
                            background: `${dayColor}08`,
                            borderRadius: radius.full,
                            color: "var(--text-muted)",
                            border: `1px solid ${dayColor}12`,
                          }}>
                            {ex}
                          </span>
                        ))}
                      </div>
                      {d.note && (
                        <div style={{
                          fontSize: 11, color: "var(--text-muted)", marginTop: 6,
                          padding: "6px 10px", background: `${dayColor}04`,
                          borderRadius: radius.sm, lineHeight: 1.5, fontStyle: "italic",
                        }}>
                          {d.note}
                        </div>
                      )}
                    </motion.div>
                    );
                  })}
                  {weekPlan.tips && (
                    <div style={{
                      fontSize: 12, color: "var(--text-muted)",
                      background: "var(--bg-card2)", padding: "14px",
                      borderRadius: radius.md, lineHeight: 1.6,
                      border: `1px solid var(--border)`,
                      marginTop: 8,
                    }}>
                      {weekPlan.tips}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {mode === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Messages */}
              <div
                ref={chatRef}
                onScroll={checkAtBottom}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  minHeight: 0,
                  padding: isMobile ? "8px 16px" : "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <AnimatePresence>
                    {rateLimited && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          background: `rgba(245,158,11,0.063)`,
                          border: `1px solid rgba(245,158,11,0.145)`,
                          borderRadius: radius.lg,
                          padding: "14px 18px",
                          marginBottom: 14,
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <AlertCircle size={18} color={"var(--yellow)"} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#B45309", marginBottom: 4 }}>
                            AI Coach is temporarily unavailable
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                            The free API limit has been reached. It resets at{" "}
                            <span style={{ color: "#B45309" }}>
                              {rateLimited.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span> ({rateLimited.toLocaleDateString([], { month: "short", day: "numeric" })}).
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                            While you wait — browse the Exercise Library, log your meals, or update your Progress.
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {emptyResponse && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          background: `rgba(239,68,68,0.063)`,
                          border: `1px solid rgba(239,68,68,0.145)`,
                          borderRadius: radius.lg,
                          padding: "14px 18px",
                          marginBottom: 14,
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <AlertCircle size={18} color={"var(--red)"} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--red)", marginBottom: 4 }}>
                            Couldn't generate a response
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                            We couldn't generate a response right now. Please try again in a few seconds.
                          </div>
                          <button
                            onClick={retryLast}
                            style={{
                              marginTop: 10,
                              padding: "6px 14px",
                              borderRadius: radius.sm,
                              border: "none",
                              background: "var(--accent)",
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Retry
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div style={{
                  display: "flex", gap: 6, marginBottom: 0,
                  background: "var(--bg-card2)", borderRadius: radius.lg,
                  padding: 4, border: `1px solid var(--border)`,
                }}>
                  {[
                    { id: "chat", label: "Chat", icon: MessageSquare },
                    { id: "plan", label: "Week Plan", icon: Calendar },
                    { id: "analyze", label: analyzing ? "Analyzing..." : "Analyze Day", icon: BarChart3 },
                  ].map(({ id, label, icon: Icon }) => (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (id === "analyze") { if (!analyzing) analyzeDay(); }
                        else setMode(id);
                        if (streaming) stopGenerating();
                      }}
                      style={{
                        flex: 1,
                        padding: isMobile ? "8px 10px" : "10px 14px",
                        borderRadius: radius.md,
                        border: "none",
                        background: mode === id ? "var(--bg-card)" : "transparent",
                        color: mode === id ? "var(--accent)" : "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: isMobile ? 10 : 12,
                        fontWeight: mode === id ? 600 : 400,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        boxShadow: mode === id ? shadow.floating : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Icon size={isMobile ? 12 : 14} />
                      {isMobile && id === "analyze" ? "Analyze" : label}
                    </motion.button>
                  ))}
                </div>
                {msgs.map((m, i) => {
                  const isStreaming = m.id === streamingMsgId && streaming;
                  const isError = m.error;
                  const isWelcome = m.id === "welcome";

                  return (
                    <motion.div
                      key={m.id || i}
                      initial={isWelcome ? {} : { opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{
                        display: "flex",
                        justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      {m.role === "ai" && !isWelcome && (
                        <div style={{ width: 26, height: 26, background: `rgba(59,130,246,0.082)`, borderRadius: radius.sm, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 6 }}>
                          <Bot size={13} color={"var(--accent)"} />
                        </div>
                      )}
                      <div
                        style={{
                          maxWidth: isMobile ? "85%" : "80%",
                          boxSizing: "border-box",
                          padding: m.role === "user" ? (isMobile ? "8px 14px" : "10px 16px") : (isMobile ? "10px 14px" : "12px 16px"),
                          borderRadius: m.role === "user"
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          background: m.role === "user"
                              ? "var(--accent-gradient)"
                              : isError
                                ? `rgba(239,68,68,0.063)`
                                : `linear-gradient(135deg, rgba(59,130,246,0.024), var(--bg-card2))`,
                          border: m.role === "user"
                            ? "none"
                            : isError
                              ? `1px solid rgba(239,68,68,0.145)`
                              : `1px solid var(--border)`,
                          borderLeft: m.role === "user" || isError ? undefined : `3px solid var(--accent)`,
                          fontSize: 13,
                          lineHeight: 1.65,
                          color: m.role === "user" ? "#fff" : "var(--text)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          boxShadow: m.role === "user"
                            ? `0 2px 8px rgba(59,130,246,0.145)`
                            : "none",
                          position: "relative",
                        }}
                      >
                        {m.role === "user" ? (
                          m.text
                        ) : isStreaming ? (
                          <>
                            {m.text ? (
                              <>
                                <MarkdownRenderer content={m.text} />
                                <motion.span
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ repeat: Infinity, duration: 0.8 }}
                                  style={{ display: "inline-block", width: 6, height: 14, background: "var(--accent)", marginLeft: 2, borderRadius: 1 }}
                                />
                              </>
                            ) : (
                              <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
                                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: 6, height: 6, background: "var(--text-muted)", borderRadius: "50%", display: "inline-block" }} />
                                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} style={{ width: 6, height: 6, background: "var(--text-muted)", borderRadius: "50%", display: "inline-block" }} />
                                <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} style={{ width: 6, height: 6, background: "var(--text-muted)", borderRadius: "50%", display: "inline-block" }} />
                              </div>
                            )}
                          </>
                        ) : isWelcome ? (
                          m.text
                        ) : (
                          <MarkdownRenderer content={m.text} />
                        )}

                        {/* Message Actions */}
                        {m.role === "ai" && !isWelcome && !isStreaming && (
                          <div style={{ display: "flex", gap: 4, marginTop: 10, justifyContent: "flex-end", opacity: isMobile ? 1 : 0.3 }}
                            onMouseEnter={e => { if (!isMobile) e.currentTarget.style.opacity = 1; }}
                            onMouseLeave={e => { if (!isMobile) e.currentTarget.style.opacity = 0.3; }}
                          >
                            <motion.button
                              whileHover={{ scale: 1.1, opacity: 1 }}
                              onClick={() => copyMsg(m.text, m.id)}
                              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 3, display: "flex" }}
                              title="Copy"
                              aria-label="Copy message"
                            >
                              {copiedId === m.id ? <Check size={13} color={"var(--green)"} /> : <Copy size={13} />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, opacity: 1 }}
                              onClick={() => regenerate(i)}
                              style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 3, display: "flex" }}
                              title="Regenerate"
                              aria-label="Regenerate response"
                            >
                              <RefreshCw size={13} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, opacity: 1 }}
                              onClick={() => setLikedMsgs(p => ({ ...p, [m.id]: p[m.id] === "up" ? null : "up" }))}
                              style={{ background: "transparent", border: "none", color: likedMsgs[m.id] === "up" ? "var(--blue)" : "var(--text-muted)", cursor: "pointer", padding: 3, display: "flex" }}
                              title="Like"
                              aria-label="Like response"
                            >
                              <ThumbsUp size={13} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, opacity: 1 }}
                              onClick={() => setLikedMsgs(p => ({ ...p, [m.id]: p[m.id] === "down" ? null : "down" }))}
                              style={{ background: "transparent", border: "none", color: likedMsgs[m.id] === "down" ? "var(--red)" : "var(--text-muted)", cursor: "pointer", padding: 3, display: "flex" }}
                              title="Dislike"
                              aria-label="Dislike response"
                            >
                              <ThumbsDown size={13} />
                            </motion.button>
                          </div>
                        )}

                        {/* Follow-up suggestions */}
                        {m.role === "ai" && !isWelcome && !isStreaming && !isError && m.text && (
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                            {getFollowUps(m.text).slice(0, 3).map((q, qi) => (
                              <motion.button
                                key={qi}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: qi * 0.05 }}
                                whileHover={{ scale: 1.03, borderColor: "rgba(59,130,246,0.251)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => send(q)}
                                style={{
                                  padding: "4px 10px", borderRadius: radius.full,
                                  background: `rgba(59,130,246,0.031)`,
                                  border: `1px solid var(--border2)`,
                                  color: "var(--text-muted)", cursor: "pointer",
                                  fontSize: 10.5, whiteSpace: "nowrap",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {q}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                      {m.role === "user" && (
                        <div style={{ width: 26, height: 26, background: "var(--bg-card3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 6 }}>
                          <User size={13} color={"var(--text-muted)"} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Stop Button */}
                {showStopBtn && streaming && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={stopGenerating}
                      style={{
                        padding: "8px 18px",
                        background: "var(--bg-card3)",
                        border: `1px solid var(--border2)`,
                        borderRadius: radius.full,
                        color: "var(--text)",
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Square size={13} color={"var(--red)"} fill={"var(--red)"} />
                      Stop generating
                    </motion.button>
                  </motion.div>
                )}

                {/* Jump to Bottom */}
                <AnimatePresence>
                  {showScrollBtn && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={scrollToBottom}
                      style={{
                        position: "sticky",
                        bottom: 8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "8px 16px",
                        background: "var(--bg-card3)",
                        border: `1px solid var(--border2)`,
                        borderRadius: radius.full,
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: shadow.elevated,
                        zIndex: 10,
                        margin: "0 auto",
                      }}
                    >
                      <ChevronDown size={14} />
                      Jump to latest
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Action Chips */}
              <div style={{
                flexShrink: 0,
                padding: isMobile ? "0 16px 8px" : "0 20px 12px",
                display: "block",
              }}>
                <div style={{
                  display: "flex", gap: 6,
                  overflowX: "auto", scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                }}>
                  {SUGGESTIONS.map((s) => (
                    <motion.button
                      key={s.title}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => send(s.title)}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "6px 10px", borderRadius: radius.full,
                        background: "var(--bg-card2)",
                        border: `1px solid var(--border2)`,
                        color: "var(--text-muted)",
                        cursor: "pointer", fontSize: 11,
                        whiteSpace: "nowrap", flexShrink: 0,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <s.icon />
                      {s.title}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div style={{
                flexShrink: 0,
                padding: isMobile ? "8px 16px" : "16px 20px",
                borderTop: `1px solid var(--border)`,
                background: "var(--bg)",
              }}>
                <div style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                  background: "var(--bg-card2)",
                  border: `1px solid var(--border2)`,
                  borderRadius: radius.lg,
                  padding: "4px 4px 4px 14px",
                }}>
                  <label htmlFor={inputId} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Ask your AI coach</label>
                  <textarea
                    id={inputId}
                    name="aiCoachInput"
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isMobile ? "Message..." : "Ask your AI coach..."}
                    rows={1}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      color: "var(--text)",
                      fontSize: 13,
                      outline: "none",
                      resize: "none",
                      padding: "8px 0",
                      lineHeight: 1.5,
                      maxHeight: 120,
                      fontFamily: "inherit",
                    }}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                  />
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {showStopBtn ? (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={stopGenerating}
                        style={{
                          width: 36,
                          height: 36,
                          background: `rgba(239,68,68,0.082)`,
                          color: "var(--red)",
                          border: "none",
                          borderRadius: radius.md,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Stop"
                      >
                        <StopCircle size={16} />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => send()}
                        disabled={!input.trim() || loading}
                        style={{
                          width: 36,
                          height: 36,
                          background: input.trim() && !loading
                            ? "var(--accent-gradient)"
                            : "var(--bg-card3)",
                          color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
                          border: "none",
                          borderRadius: radius.md,
                          cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: input.trim() && !loading ? 1 : 0.5,
                        }}
                      >
                        <Send size={15} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}