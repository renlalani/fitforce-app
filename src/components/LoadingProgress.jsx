import { useState, useEffect, useRef } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./ui/Button";

const STAGES = [
  { max: 15, label: "Preparing request..." },
  { max: 35, label: "Analyzing your fitness profile..." },
  { max: 60, label: "Understanding your goals..." },
  { max: 75, label: "Generating your personalized plan..." },
  { max: 90, label: "Optimizing recommendations..." },
  { max: 99, label: "Finalizing your results..." },
];

const TIPS = [
  { emoji: "\u{1F4AA}", text: "Progressive overload builds strength faster." },
  { emoji: "\u{1F957}", text: "Protein supports muscle recovery." },
  { emoji: "\u{1F4A7}", text: "Stay hydrated during workouts." },
  { emoji: "\u{1F634}", text: "Sleep is essential for muscle growth." },
  { emoji: "\u{1F6B6}", text: "Daily walking improves overall health." },
  { emoji: "\u{1F34E}", text: "Whole foods are better than processed foods." },
];

export default function LoadingProgress({ loading, error, onRetry, children }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [tipIndex, setTipIndex] = useState(0);
  const progressRef = useRef(0);
  const prevLoadingRef = useRef(loading);

  const stage = STAGES.find(s => progress <= s.max) || STAGES[STAGES.length - 1];

  useEffect(() => {
    if (loading) {
      progressRef.current = 0;
      setProgress(0);
      setPhase("loading");
    }
  }, [loading]);

  useEffect(() => {
    if (prevLoadingRef.current && !loading && !error && phase === "loading") {
      setPhase("completing");
    }
    prevLoadingRef.current = loading;
  });

  useEffect(() => {
    if (error && !loading) {
      setPhase("idle");
    }
  }, [error, loading]);

  useEffect(() => {
    if (phase !== "loading") return;
    const id = setInterval(() => {
      const current = progressRef.current;
      if (current >= 99) return;
      let inc;
      if (current < 15) inc = Math.random() * 0.8 + 0.2;
      else if (current < 35) inc = Math.random() * 0.6 + 0.2;
      else if (current < 60) inc = Math.random() * 0.5 + 0.15;
      else if (current < 75) inc = Math.random() * 0.4 + 0.1;
      else if (current < 90) inc = Math.random() * 0.3 + 0.08;
      else inc = Math.random() * 0.15 + 0.02;
      const next = Math.min(99, current + inc);
      progressRef.current = next;
      setProgress(next);
    }, 200);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "completing") return;
    let animId;
    const animate = () => {
      const current = progressRef.current;
      if (current >= 100) {
        setPhase("done");
        return;
      }
      const step = Math.max(2, (100 - current) / 4);
      progressRef.current = Math.min(100, current + step);
      setProgress(progressRef.current);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [phase]);

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  if (phase === "done") return children;

  if (error) {
    return (
      <div className="loading-error">
        <div className="loading-error-inner">
          <div className="loading-error-icon"><AlertCircle size={22} /></div>
          <div className="loading-error-title">Something went wrong</div>
          <div className="loading-error-text">{error}</div>
          <Button onClick={onRetry}><RefreshCw size={14} /> Retry</Button>
        </div>
      </div>
    );
  }

  if (phase === "loading" || phase === "completing") {
    return (
      <div className="loading-progress">
        <div className="loading-progress-bar-wrapper">
          <div className="loading-progress-bar">
            <div className="loading-progress-fill" style={{ width: `${Math.round(progress)}%` }}>
              <div className="loading-progress-shimmer" />
            </div>
            <div className="loading-progress-label">{Math.round(progress)}%</div>
          </div>
        </div>

        <div className="loading-progress-stage">{stage.label}</div>

        <div className="loading-progress-dots">
          {STAGES.map((s, i) => (
            <div
              key={i}
              className={`loading-progress-dot ${progress >= s.max || (i === STAGES.length - 1 && progress >= 90) ? "filled" : ""}`}
            />
          ))}
        </div>

        <div className="loading-progress-tip" key={tipIndex}>
          <span>{TIPS[tipIndex].emoji}</span>
          <span>{TIPS[tipIndex].text}</span>
        </div>
      </div>
    );
  }

  return children;
}