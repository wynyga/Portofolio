"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "launch" | "away" | "land";

// A small rocket parked on the footer moon. Click it to blast off; it flies out the top of the footer,
// then comes back down on its engine and settles on the pad again.
export default function MoonRocket() {
  const [state, setState] = useState<State>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach((id) => window.clearTimeout(id));
  }, []);

  function launch() {
    if (state !== "idle") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setState("launch");
    timers.current = [
      window.setTimeout(() => setState("away"), 1800),
      window.setTimeout(() => setState("land"), 3600),
      window.setTimeout(() => setState("idle"), 5800),
    ];
  }

  return (
    <>
      <span className="pad-dust" data-state={state} aria-hidden="true" />
      <button type="button" className="moon-rocket" data-state={state} onClick={launch} aria-label="Launch the little rocket">
        <svg viewBox="0 0 26 66" width="26" height="66" aria-hidden="true">
          <g className="moon-flame">
            <path d="M8.5 52 Q13 78 17.5 52 Z" fill="#ffb454" />
            <path d="M10.5 52 Q13 68 15.5 52 Z" fill="#fff4d0" />
          </g>
          <path d="M7 48 L3 62 M19 48 L23 62" stroke="#aab3d4" strokeWidth="2" strokeLinecap="round" />
          <path d="M6.5 38 L0 55 L6.5 50 Z M19.5 38 L26 55 L19.5 50 Z" fill="#ef4f5f" />
          <rect x="9" y="47" width="8" height="5" rx="1.5" fill="#6c7599" />
          <path d="M13 0 C20 10 22 26 20 48 H6 C4 26 6 10 13 0 Z" fill="#f4f6fc" />
          <path d="M13 0 C16 4 18 8 19 13 H7 C8 8 10 4 13 0 Z" fill="#ef4f5f" />
          <circle cx="13" cy="25" r="4.2" fill="#1b2358" />
          <circle cx="11.8" cy="23.8" r="1.2" fill="#fff" fillOpacity="0.7" />
          <rect x="6.6" y="37" width="12.8" height="3" fill="#dfe4f4" />
        </svg>
      </button>
    </>
  );
}
