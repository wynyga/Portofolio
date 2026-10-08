"use client";

import { useEffect, useRef } from "react";

// Decorative hero art: a cratered moon, a floating astronaut and a small ringed planet.
// Pure inline SVG so it ships no extra requests and picks up the theme through CSS.
// With a mouse, the layers shift at different depths as the cursor moves, and clicking the astronaut spins it.
export default function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduce) return;

    let raf = 0;
    let nx = 0;
    let ny = 0;
    function apply() {
      raf = 0;
      el!.style.setProperty("--px", nx.toFixed(3));
      el!.style.setProperty("--py", ny.toFixed(3));
    }
    function onMove(e: PointerEvent) {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(apply);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  function tumble(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    svg.classList.remove("tumble");
    void svg.getBoundingClientRect(); // restart the animation if clicked again mid-spin
    svg.classList.add("tumble");
  }

  return (
    <div className="hero-scene" ref={ref} aria-hidden="true">
      <svg className="orbit-ring" viewBox="0 0 400 400" fill="none">
        <ellipse cx="200" cy="200" rx="186" ry="186" stroke="currentColor" strokeWidth="1" strokeDasharray="2 7" />
        <g className="orbit-sat">
          <circle cx="386" cy="200" r="4.5" fill="currentColor" />
        </g>
      </svg>

      <svg className="moon" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="moon-body" cx="34%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#fbf8ee" />
            <stop offset="45%" stopColor="#d3d0c6" />
            <stop offset="100%" stopColor="#6c6a78" />
          </radialGradient>
          <radialGradient id="moon-shade" cx="30%" cy="28%" r="95%">
            <stop offset="55%" stopColor="#05060f" stopOpacity="0" />
            <stop offset="100%" stopColor="#05060f" stopOpacity="0.55" />
          </radialGradient>
          <radialGradient id="crater" cx="62%" cy="66%" r="70%">
            <stop offset="0%" stopColor="#8d8a93" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a9a6ac" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="url(#moon-body)" />
        <g fill="url(#crater)" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2">
          <circle cx="66" cy="62" r="19" />
          <circle cx="132" cy="84" r="25" />
          <circle cx="92" cy="138" r="16" />
          <circle cx="146" cy="142" r="11" />
          <circle cx="48" cy="112" r="8" />
          <circle cx="116" cy="40" r="7" />
          <circle cx="160" cy="52" r="5" />
        </g>
        {/* terminator shadow to give the sphere depth */}
        <circle cx="100" cy="100" r="96" fill="url(#moon-shade)" />
      </svg>

      <svg className="planet" viewBox="0 0 120 80">
        <defs>
          <linearGradient id="planet-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffb86b" />
            <stop offset="100%" stopColor="#b5476b" />
          </linearGradient>
        </defs>
        <g transform="rotate(-18 60 40)" fill="none" stroke="#ffd9a8" strokeWidth="2.5">
          <path d="M4 40 A56 11 0 0 1 116 40" strokeOpacity="0.5" />
          <circle cx="60" cy="40" r="22" fill="url(#planet-body)" stroke="none" />
          <path d="M40 34c14 5 27 5 40 0M39 46c14 5 28 5 42 0" stroke="#fff" strokeOpacity="0.22" strokeLinecap="round" />
          <path d="M4 40 A56 11 0 0 0 116 40" strokeOpacity="0.9" />
        </g>
      </svg>

      <svg className="astronaut" viewBox="0 0 220 280" onClick={tumble} onAnimationEnd={(e) => e.animationName.endsWith("tumble") && e.currentTarget.classList.remove("tumble")}>
        <defs>
          <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4d63c9" />
            <stop offset="55%" stopColor="#1b2358" />
            <stop offset="100%" stopColor="#0c1030" />
          </linearGradient>
        </defs>
        <g className="astro-spin">
        {/* life-support pack */}
        <rect x="58" y="84" width="104" height="98" rx="24" fill="#aab3d4" />
        {/* legs + boots */}
        <path d="M94 176 L84 228" stroke="#e8ebf7" strokeWidth="30" strokeLinecap="round" />
        <path d="M128 176 L144 222" stroke="#e8ebf7" strokeWidth="30" strokeLinecap="round" />
        <rect x="66" y="226" width="38" height="24" rx="10" fill="#6c7599" transform="rotate(8 85 238)" />
        <rect x="128" y="218" width="38" height="24" rx="10" fill="#6c7599" transform="rotate(-18 147 230)" />
        {/* torso */}
        <rect x="68" y="88" width="84" height="100" rx="30" fill="#f4f6fc" />
        <rect x="88" y="120" width="44" height="30" rx="8" fill="#dfe4f4" />
        <circle cx="99" cy="131" r="4" fill="#ff6b6b" />
        <circle cx="111" cy="131" r="4" fill="#ffd166" />
        <circle cx="123" cy="131" r="4" fill="#58d6a4" />
        <rect x="95" y="141" width="30" height="4" rx="2" fill="#aab3d4" />
        {/* waving arm */}
        <g className="wave-arm">
          <path d="M76 108 L48 96 L40 66" stroke="#f4f6fc" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="39" cy="58" r="14" fill="#c9d0ea" />
          <rect x="52" y="98" width="16" height="10" rx="2" fill="#ef4f5f" transform="rotate(24 60 103)" />
        </g>
        {/* resting arm */}
        <path d="M144 108 L170 132 L160 160" stroke="#f4f6fc" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="159" cy="166" r="14" fill="#c9d0ea" />
        {/* helmet */}
        <circle cx="110" cy="64" r="50" fill="#f4f6fc" />
        <rect x="76" y="96" width="68" height="14" rx="7" fill="#c9d0ea" />
        <ellipse cx="112" cy="64" rx="37" ry="31" fill="url(#visor)" />
        <path d="M86 52 C92 42 104 38 116 40" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="134" cy="76" r="3" fill="#fff" fillOpacity="0.35" />
        </g>
      </svg>

      <span className="spark s1" />
      <span className="spark s2" />
      <span className="spark s3" />
    </div>
  );
}
