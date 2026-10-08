"use client";

import { useEffect, useRef, useState } from "react";

// One stop per page section, in page order. "top" is the <main id="top"> wrapper.
const STOPS = [
  { id: "top", label: "Launch" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "background", label: "Background" },
  { id: "contact", label: "Contact" },
];

// A mission-style scroll indicator: a small lander descends a rail on the right edge as you read
// down the page, firing its engine while you scroll, and touches down at the footer.
export default function DescentRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<number[]>(() => STOPS.map((_, i) => i / (STOPS.length - 1)));
  const [active, setActive] = useState(0);
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let tops: number[] = [];
    let raf = 0;
    let thrustTimer = 0;

    function measure() {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      tops = STOPS.map(({ id }) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
      setPositions(tops.map((t) => Math.min(1, Math.max(0, t / max))));
      update();
    }

    function update() {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = window.scrollY;
      const p = Math.min(1, Math.max(0, y / max));
      rail!.style.setProperty("--p", String(p));

      const probe = y + window.innerHeight * 0.4;
      let idx = 0;
      tops.forEach((t, i) => {
        if (probe >= t) idx = i;
      });
      setActive(idx);
      setLanded(p > 0.985);
    }

    function onScroll() {
      rail!.dataset.thrust = "on";
      window.clearTimeout(thrustTimer);
      thrustTimer = window.setTimeout(() => {
        rail!.dataset.thrust = "off";
      }, 180);
      if (!raf) raf = requestAnimationFrame(update);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    // Fonts and images shift section positions after first paint, so re-measure when the page height changes.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(thrustTimer);
    };
  }, []);

  // Drag the lander (or press anywhere on the track) to scrub through the page.
  // `grab` keeps the lander under the cursor at the spot where it was picked up.
  const grab = useRef<number | null>(null);

  function scrubTo(clientY: number) {
    const rail = railRef.current;
    if (!rail || grab.current === null) return;
    const rect = rail.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientY - grab.current - rect.top) / rect.height));
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: p * max, behavior: "instant" });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 || (e.target as Element).closest("a")) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const p = Number(e.currentTarget.style.getPropertyValue("--p")) || 0;
    const onLander = (e.target as Element).closest(".lander") !== null;
    // Grabbing the lander keeps the offset; pressing on bare track makes it jump to the cursor.
    grab.current = onLander ? e.clientY - (rect.top + p * rect.height) : 0;
    e.currentTarget.dataset.dragging = "true";
    scrubTo(e.clientY);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    scrubTo(e.clientY);
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    grab.current = null;
    delete e.currentTarget.dataset.dragging;
  }

  return (
    <nav className="descent" aria-label="Page sections" data-landed={landed}>
      <div
        className="descent-rail"
        ref={railRef}
        data-thrust="off"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="descent-track" aria-hidden="true" />
        {STOPS.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="descent-stop"
            data-active={i === active}
            data-passed={i < active}
            style={{ top: `${positions[i] * 100}%` }}
          >
            <span className="descent-label mono">{s.label}</span>
            <span className="descent-dot" aria-hidden="true" />
            <span className="sr-only">{i === active ? " (current section)" : ""}</span>
          </a>
        ))}
        <svg className="lander" viewBox="0 0 28 40" aria-hidden="true">
          <g className="lander-flame">
            <path d="M10 27 Q14 40 18 27 Z" fill="#ffb454" />
            <path d="M12 27 Q14 35 16 27 Z" fill="#fff4d0" />
          </g>
          <path d="M8 24 L3 33 M20 24 L25 33" stroke="#c9d0ea" strokeWidth="2" strokeLinecap="round" />
          <path d="M1.5 33.5h4M22.5 33.5h4" stroke="#c9d0ea" strokeWidth="2" strokeLinecap="round" />
          <rect x="7" y="13" width="14" height="13" rx="3" fill="#aab3d4" />
          <path d="M6 14 Q14 -2 22 14 Z" fill="#f4f6fc" />
          <circle cx="14" cy="14" r="3.2" fill="#1b2358" />
          <circle cx="13" cy="13" r="1" fill="#fff" fillOpacity="0.7" />
        </svg>
        <span className="descent-status mono" aria-hidden="true">
          {landed ? "Touchdown" : ""}
        </span>
      </div>
    </nav>
  );
}
