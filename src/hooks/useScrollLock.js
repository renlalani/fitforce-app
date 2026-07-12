import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";

export default function useScrollLock(locked) {
  useEffect(() => {
    if (locked) {
      if (lockCount === 0) {
        originalOverflow = document.body.style.overflow || "";
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      }
      lockCount++;
    }

    return () => {
      if (locked) {
        lockCount--;
        if (lockCount <= 0) {
          document.body.style.overflow = originalOverflow;
          document.body.style.paddingRight = "";
          lockCount = 0;
        }
      }
    };
  }, [locked]);
}
