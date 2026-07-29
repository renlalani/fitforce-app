import { useState, useRef, useCallback, useEffect } from "react";

const STAGES = [
  { range: [0, 15], text: "Preparing request..." },
  { range: [15, 35], text: "Analyzing your profile..." },
  { range: [35, 55], text: "Building your personalized plan..." },
  { range: [55, 75], text: "Optimizing recommendations..." },
  { range: [75, 90], text: "Formatting the results..." },
  { range: [90, 98], text: "Final checks..." },
  { range: [98, 100], text: "Almost ready..." },
];

const TAU = 18000;

function calcProgress(elapsed, boosted) {
  const timeBased = 99.5 * (1 - Math.exp(-elapsed / TAU));
  return Math.min(99.5, Math.max(timeBased, boosted || 0));
}

function getStageText(pct) {
  for (const s of STAGES) {
    if (pct >= s.range[0] && pct < s.range[1]) return s.text;
  }
  return STAGES[STAGES.length - 1].text;
}

export default function useLoadingProgress() {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState(STAGES[0].text);
  const ref = useRef(null);
  const startTimeRef = useRef(null);
  const boostedRef = useRef(0);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const pct = calcProgress(elapsed, boostedRef.current);
    setProgress(pct);
    setStageText(getStageText(pct));
  }, []);

  const start = useCallback(() => {
    setProgress(0);
    setStageText(STAGES[0].text);
    boostedRef.current = 0;
    startTimeRef.current = Date.now();
    if (ref.current) clearInterval(ref.current);
    ref.current = setInterval(tick, 50);
  }, [tick]);

  const boost = useCallback((level) => {
    boostedRef.current = Math.max(boostedRef.current, level);
  }, []);

  const complete = useCallback(() => {
    return new Promise(resolve => {
      if (ref.current) clearInterval(ref.current);
      setProgress(100);
      setStageText("Done!");
      setTimeout(resolve, 400);
    });
  }, []);

  const fail = useCallback(() => {
    if (ref.current) clearInterval(ref.current);
  }, []);

  useEffect(() => {
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);

  return { progress, stageText, start, complete, fail, boost };
}
