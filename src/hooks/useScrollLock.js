import { useEffect, useRef } from "react";

let lockCount = 0;
let originalStyles = null;

function lockBody() {
  if (lockCount === 0) {
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    originalStyles = {
      overflowX: body.style.overflowX,
      overflowY: body.style.overflowY,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
      scrollY,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.width = "100%";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

function unlockBody() {
  lockCount--;
  if (lockCount <= 0) {
    lockCount = 0;
    if (originalStyles) {
      const body = document.body;
      const { scrollY, ...styles } = originalStyles;

      body.style.overflowX = styles.overflowX;
      body.style.overflowY = styles.overflowY;
      body.style.position = styles.position;
      body.style.top = styles.top;
      body.style.left = styles.left;
      body.style.width = styles.width;
      body.style.paddingRight = styles.paddingRight;

      window.scrollTo(0, scrollY);
      originalStyles = null;
    }
  }
}

export default function useScrollLock(locked) {
  const prevLocked = useRef(locked);

  useEffect(() => {
    if (locked && !prevLocked.current) {
      lockBody();
    } else if (!locked && prevLocked.current) {
      unlockBody();
    }
    prevLocked.current = locked;
  }, [locked]);

  useEffect(() => {
    return () => {
      if (prevLocked.current) {
        unlockBody();
      }
    };
  }, []);
}
