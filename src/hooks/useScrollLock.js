import { useEffect, useRef } from "react";

export default function useScrollLock(locked) {
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!locked) {
      if (lockedRef.current) {
        document.body.style.overflow = lockedRef.current === true ? "" : lockedRef.current;
        document.body.style.paddingRight = "";
        lockedRef.current = false;
      }
      return;
    }

    const prev = document.body.style.overflow || "";
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    lockedRef.current = prev;

    return () => {
      document.body.style.overflow = prev;
      document.body.style.paddingRight = "";
      lockedRef.current = false;
    };
  }, [locked]);
}
