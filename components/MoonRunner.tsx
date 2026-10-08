"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "run" | "held" | "fall";

const W = 48; // sprite width in px
const SPEED = 70; // jogging speed, px/s
const GRAVITY = 650; // lunar-ish: floaty, but still lands
const LINES = ["Hey!", "Put me down!", "Houston?!", "Whoaaa", "Wkwkwk", "I was jogging!"];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// The tiny astronaut on the footer moon. He jogs back and forth by himself; press and hold to pick him
// up (he dangles and kicks), drag him around the footer and let go to toss him. He falls back down in
// low gravity and carries on jogging from wherever he lands.
export default function MoonRunner() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("run");
  const [line, setLine] = useState<string | null>(null);
  const lineTimer = useRef(0);
  const s = useRef({ x: 0, y: 0, dir: 1, vx: 0, vy: 0, tx: 0, ty: 0, rot: 0, grabX: 0, grabY: 0, mode: "run" as Mode });

  function say(text: string | null, ms = 0) {
    window.clearTimeout(lineTimer.current);
    setLine(text);
    if (text && ms) lineTimer.current = window.setTimeout(() => setLine(null), ms);
  }

  useEffect(() => {
    const wrap = wrapRef.current;
    const sprite = spriteRef.current;
    const scene = wrap?.parentElement;
    if (!wrap || !sprite || !scene) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = s.current;
    let sceneW = scene.clientWidth;
    let raf = 0;
    let last = 0;

    const ro = new ResizeObserver(() => {
      sceneW = scene.clientWidth;
    });
    ro.observe(scene);

    function render() {
      wrap!.style.transform = `translateX(${st.x}px)`;
      sprite!.style.transform = `translateY(${st.y}px) rotate(${st.rot}deg) scaleX(${st.dir})`;
      wrap!.style.setProperty("--y", st.y.toFixed(1));
      wrap!.style.setProperty("--lift", clamp(-st.y / 160, 0, 0.65).toFixed(2));
    }

    function frame(t: number) {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      const maxX = Math.max(0, sceneW - W);

      if (st.mode === "run") {
        if (!reduce) {
          st.x += st.dir * SPEED * dt;
          if (st.x >= maxX) {
            st.x = maxX;
            st.dir = -1;
          } else if (st.x <= 0) {
            st.x = 0;
            st.dir = 1;
          }
        }
        st.rot += (0 - st.rot) * Math.min(1, dt * 10);
      } else if (st.mode === "held") {
        // Ease toward the cursor so he lags and swings like something dangling from a hand.
        const k = Math.min(1, dt * 16);
        const nx = st.x + (st.tx - st.x) * k;
        const ny = st.y + (st.ty - st.y) * k;
        st.vx += ((nx - st.x) / dt - st.vx) * 0.3;
        st.vy += ((ny - st.y) / dt - st.vy) * 0.3;
        st.x = nx;
        st.y = ny;
        st.rot += (clamp(st.vx * 0.035, -35, 35) - st.rot) * Math.min(1, dt * 10);
      } else {
        st.vy += GRAVITY * dt;
        st.x += st.vx * dt;
        st.y += st.vy * dt;
        st.vx *= 1 - 0.6 * dt;
        if (st.x < 0) {
          st.x = 0;
          st.vx = Math.abs(st.vx) * 0.5;
        } else if (st.x > maxX) {
          st.x = maxX;
          st.vx = -Math.abs(st.vx) * 0.5;
        }
        st.rot += (0 - st.rot) * Math.min(1, dt * 6);
        if (st.y >= 0) {
          st.y = 0;
          if (st.vy > 140) {
            st.vy = -st.vy * 0.35; // small bounce
          } else {
            st.vy = 0;
            if (Math.abs(st.vx) > 25) st.dir = st.vx > 0 ? 1 : -1;
            st.mode = "run";
            setMode("run");
          }
        }
      }
      render();
      raf = requestAnimationFrame(frame);
    }

    // Only animate while the footer is on screen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (entry.isIntersecting) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(scene);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(lineTimer.current);
    };
  }, []);

  function scenePoint(e: React.PointerEvent) {
    const rect = wrapRef.current!.parentElement!.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top, w: rect.width };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const st = s.current;
    const { px, py } = scenePoint(e);
    st.grabX = px - st.x;
    st.grabY = py - (wrapRef.current!.offsetTop + st.y);
    st.tx = st.x;
    st.ty = st.y - 14; // lifted off the ground by the scruff
    st.vx = 0;
    st.vy = 0;
    st.mode = "held";
    setMode("held");
    say(LINES[Math.floor(Math.random() * LINES.length)]);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const st = s.current;
    if (st.mode !== "held") return;
    const { px, py, w } = scenePoint(e);
    st.tx = clamp(px - st.grabX, 0, Math.max(0, w - W));
    st.ty = clamp(py - st.grabY - wrapRef.current!.offsetTop - 14, -wrapRef.current!.offsetTop, 0);
  }

  function release() {
    const st = s.current;
    if (st.mode !== "held") return;
    st.vx = clamp(st.vx, -600, 600);
    st.vy = clamp(st.vy, -450, 300);
    st.mode = "fall";
    setMode("fall");
    say(null);
  }

  return (
    <div className="runner" ref={wrapRef} data-mode={mode} aria-hidden="true">
      <span className="runner-shadow" />
      <span className="runner-bubble" data-show={line !== null}>
        {line}
      </span>
      <div
        className="runner-sprite"
        ref={spriteRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse" && s.current.mode === "run") say("Pick me up!");
        }}
        onPointerLeave={() => {
          if (s.current.mode === "run") say(null);
        }}
      >
        <svg viewBox="0 0 48 52" width="48" height="52">
          <g className="runner-body">
            {/* life-support pack on the back */}
            <rect x="9" y="19" width="10" height="15" rx="4" fill="#aab3d4" />
            <g className="leg leg-back">
              <rect x="20" y="32" width="7" height="12" rx="3.5" fill="#cfd5ec" />
              <rect x="19" y="42" width="10" height="5" rx="2.5" fill="#6c7599" />
            </g>
            <rect x="16" y="18" width="17" height="18" rx="6" fill="#f4f6fc" />
            <rect x="22" y="24" width="8" height="5" rx="1.5" fill="#dfe4f4" />
            <circle cx="24.5" cy="26.5" r="1" fill="#ff6b6b" />
            <circle cx="27.5" cy="26.5" r="1" fill="#58d6a4" />
            <g className="leg leg-front">
              <rect x="24" y="32" width="7" height="12" rx="3.5" fill="#f4f6fc" />
              <rect x="23" y="42" width="10" height="5" rx="2.5" fill="#6c7599" />
            </g>
            <g className="arm">
              <rect x="22" y="20" width="6" height="12" rx="3" fill="#f4f6fc" />
              <circle cx="25" cy="32" r="3.2" fill="#c9d0ea" />
            </g>
            <circle cx="26" cy="11" r="9" fill="#f4f6fc" />
            <ellipse cx="29.5" cy="11" rx="5.6" ry="4.8" fill="#1b2358" />
            <path d="M26.5 8.8 C28 7.6 30 7.4 31.4 8" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </g>
        </svg>
      </div>
    </div>
  );
}
