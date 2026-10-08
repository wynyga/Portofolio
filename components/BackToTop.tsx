"use client";

import { useEffect, useRef, useState } from "react";

// Rocket button: appears once you scroll past the hero, and launches you back to the top.
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [launching, setLaunching] = useState(false);
  const launchingRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.7);
      if (launchingRef.current && window.scrollY < 40) {
        launchingRef.current = false;
        setLaunching(false);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function launch() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      window.scrollTo({ top: 0 });
      return;
    }
    launchingRef.current = true;
    setLaunching(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Safety net in case the smooth scroll is interrupted before reaching the top.
    window.setTimeout(() => {
      launchingRef.current = false;
      setLaunching(false);
    }, 3500);
  }

  return (
    <button
      type="button"
      className="to-top"
      data-visible={visible}
      data-launching={launching}
      onClick={launch}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 24 40" width="22" height="36" aria-hidden="true">
        <g className="rocket-flame">
          <path d="M8 28 Q12 44 16 28 Z" fill="#ffb454" />
          <path d="M10 28 Q12 38 14 28 Z" fill="#fff4d0" />
        </g>
        <path d="M5 22 L0 32 L7 29 Z M19 22 L24 32 L17 29 Z" fill="#ef4f5f" />
        <path d="M12 0 C18 6 19 17 17 29 H7 C5 17 6 6 12 0 Z" fill="#f4f6fc" />
        <circle cx="12" cy="14" r="3.4" fill="#1b2358" />
        <circle cx="11" cy="13" r="1" fill="#fff" fillOpacity="0.7" />
      </svg>
    </button>
  );
}
