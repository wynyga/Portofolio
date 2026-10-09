"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CHANGE_EVENT, loadMine } from "@/lib/astronaut";
import { useCrew } from "@/lib/use-crew";
import PixelSprite from "./PixelSprite";

type Mode = "run" | "held" | "fall";
type Walker = { id: string; code: string | null; mine: boolean };
type Body = {
  x: number;
  y: number;
  dir: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  rot: number;
  grabX: number;
  grabY: number;
  speed: number;
  mode: Mode;
  talk: number;
};
type Node = { wrap: HTMLElement; sprite: HTMLElement; bubble: HTMLElement };

const W = 48; // sprite width in px
const GRAVITY = 650; // lunar-ish: floaty, but still lands
const CEILING = 72; // px from the top of the viewport, clear of the sticky header
const MINE = "mine";
const LINES = ["Hey!", "Put me down!", "Houston?!", "Whoaaa", "Wkwkwk", "I was jogging!"];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// A stable 0-8 from the id, so each walker hops out of step with the others.
const hop = (id: string) => [...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 9;

function shuffled<T>(items: T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Everyone jogging on the footer moon: the visitor's own astronaut plus a random handful from the wall.
// Each one jogs back and forth by itself; press and hold to pick one up (it dangles and kicks), drag it
// around and let go to toss it. It falls back in low gravity and carries on jogging where it lands.
// One animation loop drives them all.
export default function MoonCrew() {
  const data = useCrew();
  const [mine, setMine] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, Node>());
  const bodies = useRef(new Map<string, Body>());

  useEffect(() => {
    setMine(loadMine());
    const onChange = (e: Event) => setMine((e as CustomEvent<string | null>).detail ?? null);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  // A fresh random selection whenever the wall reloads; fewer on narrow screens.
  const picked = useMemo(() => {
    if (!data) return [];
    const cap = window.innerWidth < 640 ? 5 : 12;
    return shuffled(data.items).slice(0, cap);
  }, [data]);

  const walkers: Walker[] = [
    ...picked.filter((m) => m.code !== mine).map((m) => ({ id: m.id, code: m.code, mine: false })),
    { id: MINE, code: mine, mine: true }, // last, so it is drawn on top
  ];

  // Forget the physics of walkers that left the wall (a wipe, or a new random pick). Keeping the rest means
  // a re-render never makes anyone jump back to a new spot.
  const ids = walkers.map((w) => w.id).join(",");
  useEffect(() => {
    const live = new Set(ids.split(","));
    for (const id of bodies.current.keys()) if (!live.has(id)) bodies.current.delete(id);
  }, [ids]);

  function bodyFor(id: string): Body {
    let b = bodies.current.get(id);
    if (!b) {
      const sceneW = sceneRef.current?.clientWidth ?? 800;
      b = {
        x: Math.random() * Math.max(0, sceneW - W),
        y: 0,
        dir: Math.random() < 0.5 ? -1 : 1,
        vx: 0,
        vy: 0,
        tx: 0,
        ty: 0,
        rot: 0,
        grabX: 0,
        grabY: 0,
        speed: id === MINE ? 70 : 40 + Math.random() * 45,
        mode: "run",
        talk: 0,
      };
      bodies.current.set(id, b);
    }
    return b;
  }

  function say(id: string, text: string | null, ms = 0) {
    const node = nodes.current.get(id);
    const b = bodies.current.get(id);
    if (!node || !b) return;
    window.clearTimeout(b.talk);
    node.bubble.textContent = text ?? "";
    node.bubble.dataset.show = text ? "true" : "false";
    if (text && ms) b.talk = window.setTimeout(() => say(id, null), ms);
  }

  function setMode(id: string, mode: Mode) {
    const b = bodyFor(id);
    b.mode = mode;
    const node = nodes.current.get(id);
    if (node) node.wrap.dataset.mode = mode;
  }

  // Highest a walker can go: just under the sticky header (relative to its resting position, so negative).
  function ceilingY(node: Node) {
    return CEILING - sceneRef.current!.getBoundingClientRect().top - node.wrap.offsetTop;
  }

  // One loop for everyone, running only while the footer is on screen.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sceneW = scene.clientWidth;
    let raf = 0;
    let last = 0;

    const ro = new ResizeObserver(() => {
      sceneW = scene.clientWidth;
    });
    ro.observe(scene);

    function step(id: string, node: Node, st: Body, dt: number) {
      const maxX = Math.max(0, sceneW - W);

      if (st.mode === "run") {
        if (!reduce) {
          st.x += st.dir * st.speed * dt;
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
        st.ty = clamp(st.ty, ceilingY(node), 0); // keeps it inside the window if the page is scrolled while held
        // Ease toward the cursor so it lags and swings like something dangling from a hand.
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
        const ceiling = ceilingY(node);
        if (st.y < ceiling) {
          st.y = ceiling;
          st.vy = Math.abs(st.vy) * 0.3; // soft bump off the top of the window
        }
        if (st.y >= 0) {
          st.y = 0;
          if (st.vy > 140) {
            st.vy = -st.vy * 0.35; // small bounce
          } else {
            st.vy = 0;
            if (Math.abs(st.vx) > 25) st.dir = st.vx > 0 ? 1 : -1;
            setMode(id, "run");
          }
        }
      }

      node.wrap.style.transform = `translateX(${st.x}px)`;
      node.sprite.style.transform = `translateY(${st.y}px) rotate(${st.rot}deg) scaleX(${st.dir})`;
      node.wrap.style.setProperty("--y", st.y.toFixed(1));
      node.wrap.style.setProperty("--lift", clamp(-st.y / 160, 0, 0.65).toFixed(2));
    }

    function frame(t: number) {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      for (const [id, node] of nodes.current) step(id, node, bodyFor(id), dt);
      raf = requestAnimationFrame(frame);
    }

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scenePoint(e: React.PointerEvent) {
    const rect = sceneRef.current!.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top, w: rect.width };
  }

  function onPointerDown(id: string, e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const node = nodes.current.get(id);
    if (!node) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const st = bodyFor(id);
    const { px, py } = scenePoint(e);
    st.grabX = px - st.x;
    st.grabY = py - (node.wrap.offsetTop + st.y);
    st.tx = st.x;
    st.ty = st.y - 14; // lifted off the ground by the scruff
    st.vx = 0;
    st.vy = 0;
    setMode(id, "held");
    say(id, LINES[Math.floor(Math.random() * LINES.length)]);
  }

  function onPointerMove(id: string, e: React.PointerEvent<HTMLDivElement>) {
    const st = bodies.current.get(id);
    const node = nodes.current.get(id);
    if (!st || !node || st.mode !== "held") return;
    const { px, py, w } = scenePoint(e);
    st.tx = clamp(px - st.grabX, 0, Math.max(0, w - W));
    st.ty = clamp(py - st.grabY - node.wrap.offsetTop - 14, ceilingY(node), 0);
  }

  function release(id: string) {
    const st = bodies.current.get(id);
    if (!st || st.mode !== "held") return;
    st.vx = clamp(st.vx, -800, 800);
    st.vy = clamp(st.vy, -800, 300);
    setMode(id, "fall");
    say(id, null);
  }

  return (
    <div className="crowd" ref={sceneRef}>
      {walkers.map((w) => (
        <div
          key={w.id}
          className="runner"
          data-mode="run"
          aria-hidden="true"
          style={{ ["--hop-delay" as string]: `${-(hop(w.id) / 10)}s` }}
          ref={(el) => {
            if (el) {
              nodes.current.set(w.id, {
                wrap: el,
                sprite: el.querySelector(".runner-sprite") as HTMLElement,
                bubble: el.querySelector(".runner-bubble") as HTMLElement,
              });
            } else {
              nodes.current.delete(w.id);
            }
          }}
        >
          <span className="runner-shadow" />
          <span className="runner-bubble" data-show="false" />
          <div
            className="runner-sprite"
            onPointerDown={(e) => onPointerDown(w.id, e)}
            onPointerMove={(e) => onPointerMove(w.id, e)}
            onPointerUp={() => release(w.id)}
            onPointerCancel={() => release(w.id)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse" && bodies.current.get(w.id)?.mode === "run") say(w.id, "Pick me up!");
            }}
            onPointerLeave={() => {
              if (bodies.current.get(w.id)?.mode === "run") say(w.id, null);
            }}
          >
            {w.code ? (
              <PixelSprite code={w.code} size={48} className="runner-pixel" />
            ) : (
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
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
