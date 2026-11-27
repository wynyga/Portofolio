"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LANDMARKS, approachPoint, type Landmark } from "@/lib/moonwalk";
import { createInput } from "./input";

// The 3D scene (three.js) is loaded only on this page and only in the browser.
const MoonScene = dynamic(() => import("./MoonScene"), {
  ssr: false,
  loading: () => <p className="mw-loading mono">Descending to the surface…</p>,
});

type Mode = "checking" | "scene" | "fallback";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const BY_ID = new Map(LANDMARKS.map((l) => [l.id, l]));

export default function Moonwalk() {
  const [mode, setMode] = useState<Mode>("checking");
  const [reduced, setReduced] = useState(false);
  const [near, setNear] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [touch, setTouch] = useState(false);
  const [running, setRunning] = useState(false);
  const input = useRef(createInput()).current;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(motion);
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    setMode(hasWebGL() && !motion ? "scene" : "fallback");
  }, []);

  const onNear = useCallback(
    (id: string | null) => {
      setNear(id);
      if (id && input.openOnArrive === id) {
        input.openOnArrive = null;
        input.target = null;
        setOpen(id);
      } else if (!id) {
        setOpen(null); // walked away: put the card away
      }
    },
    [input],
  );

  const goTo = useCallback(
    (l: Landmark) => {
      if (near === l.id) {
        setOpen(l.id);
        return;
      }
      input.target = approachPoint(l, input.player);
      input.openOnArrive = l.id;
      setMapOpen(false);
    },
    [input, near],
  );

  // keyboard: movement keys go to the shared input; E opens, Esc closes
  useEffect(() => {
    if (mode !== "scene") return;
    const typing = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
    };
    const down = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Space") {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "BUTTON" || t.tagName === "A")) return; // let Space press the focused control
        e.preventDefault();
        if (!e.repeat) input.jump = true;
        return;
      }
      if (e.code === "KeyE") {
        if (open) setOpen(null);
        else if (near) setOpen(near);
        return;
      }
      if (e.code === "Escape") {
        setOpen(null);
        setMapOpen(false);
        return;
      }
      if (e.code === "KeyM") {
        setMapOpen((v) => !v);
        return;
      }
      if (e.code.startsWith("Arrow")) e.preventDefault();
      input.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => input.keys.delete(e.code);
    const clear = () => input.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [mode, input, near, open]);

  if (mode === "checking") return <p className="mw-loading mono">Checking the landing gear…</p>;

  if (mode === "fallback") {
    return (
      <div className="mw-fallback wrap">
        <p className="mono eyebrow">Moonwalk</p>
        <h1>My career, as a walk across the moon</h1>
        <p className="mw-fallback-note">
          {reduced
            ? "Your device asks for reduced motion, so here is the walk as a list."
            : "This browser cannot show the 3D moon (WebGL is off), so here is the walk as a list."}
        </p>
        <div className="mw-fallback-actions">
          <Link className="btn" href="/">
            ← Back to the site
          </Link>
          {reduced && hasWebGL() && (
            <button type="button" className="btn btn-primary" onClick={() => setMode("scene")}>
              Show the 3D moon anyway
            </button>
          )}
        </div>
        <ol className="mw-fallback-list">
          {LANDMARKS.map((l) => (
            <li key={l.id}>
              <LandmarkCard landmark={l} />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const card = open ? BY_ID.get(open) : undefined;
  const nearby = near ? BY_ID.get(near) : undefined;

  return (
    <div className="mw-root">
      <MoonScene input={input} near={near} onNear={onNear} onSelect={goTo} />

      <div className="mw-top">
        <Link className="mw-chip" href="/">
          ← Back to site
        </Link>
        <button type="button" className="mw-chip" aria-expanded={mapOpen} onClick={() => setMapOpen((v) => !v)}>
          Map
        </button>
      </div>

      {mapOpen && (
        <nav className="mw-map" aria-label="Landmarks">
          <p className="mono mw-kicker">Walk to</p>
          <ol>
            {LANDMARKS.map((l, i) => (
              <li key={l.id}>
                <button type="button" onClick={() => goTo(l)}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <b>{l.name}</b>
                    <small>{l.title}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {card ? (
        <div className="mw-card-wrap">
          <LandmarkCard landmark={card} onClose={() => setOpen(null)} />
        </div>
      ) : (
        nearby && (
          <button type="button" className="mw-prompt" onClick={() => setOpen(nearby.id)}>
            <span className="mono">{touch ? "Tap" : "Press E"}</span> {nearby.name}: {nearby.title}
          </button>
        )
      )}

      {touch ? (
        <TouchControls
          input={input}
          running={running}
          onRun={() => {
            input.run = !input.run;
            setRunning(input.run);
          }}
        />
      ) : (
        <p className="mw-help mono">
          WASD / arrows walk · Shift run · Space jump · E open · M map · drag to look · scroll to zoom · click to walk
        </p>
      )}
    </div>
  );
}

function LandmarkCard({ landmark: l, onClose }: { landmark: Landmark; onClose?: () => void }) {
  return (
    <article className="mw-card" aria-label={`${l.name}: ${l.title}`}>
      <header>
        <p className="mono mw-kicker">
          {l.name} · {l.period}
        </p>
        {onClose && (
          <button type="button" className="mw-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        )}
      </header>
      <h2>{l.title}</h2>
      {l.role && <p className="mw-role">{l.role}</p>}
      <ul>
        {l.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {l.stack.length > 0 && (
        <p className="mw-stack">
          {l.stack.map((s) => (
            <span key={s} className="mono">
              {s}
            </span>
          ))}
        </p>
      )}
      <p className="mw-links">
        {l.links.map((link) =>
          link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label} ↗
            </a>
          ) : (
            <Link key={link.href} href={link.href}>
              {link.label} →
            </Link>
          ),
        )}
      </p>
    </article>
  );
}

function TouchControls({
  input,
  running,
  onRun,
}: {
  input: ReturnType<typeof createInput>;
  running: boolean;
  onRun: () => void;
}) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);

  function update(e: React.PointerEvent) {
    const el = base.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const max = r.width / 2;
    let dx = e.clientX - (r.left + max);
    let dy = e.clientY - (r.top + max);
    const d = Math.hypot(dx, dy);
    if (d > max) {
      dx = (dx / d) * max;
      dy = (dy / d) * max;
    }
    setKnob({ x: dx, y: dy });
    input.joy.x = dx / max;
    input.joy.y = dy / max;
  }

  function release() {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    input.joy.x = 0;
    input.joy.y = 0;
  }

  return (
    <>
      <div
        ref={base}
        className="mw-joy"
        onPointerDown={(e) => {
          active.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => active.current === e.pointerId && update(e)}
        onPointerUp={release}
        onPointerCancel={release}
        aria-hidden="true"
      >
        <span style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <div className="mw-buttons">
        <button type="button" className={running ? "on" : ""} onClick={onRun}>
          Run
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            input.jump = true;
          }}
        >
          Jump
        </button>
      </div>
    </>
  );
}
