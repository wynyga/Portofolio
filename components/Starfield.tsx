"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; layer: number; phase: number; speed: number; color: string };
type Shot = { x: number; y: number; vx: number; vy: number; life: number };

// Parallax strength per depth layer: far stars barely move, near ones drift faster as you scroll.
const LAYER_PARALLAX = [0.03, 0.07, 0.14];
const COLORS = ["255,255,255", "255,255,255", "255,255,255", "190,210,255", "255,226,170", "214,190,255"];

// Fixed full-screen canvas with three parallax layers of twinkling stars and the odd shooting star.
// Star positions are stored as 0..1 fractions so resizing never reshuffles the sky.
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let shot: Shot | null = null;
    let nextShot = 4000 + Math.random() * 6000;
    let raf = 0;

    function build() {
      const count = Math.min(420, Math.round((window.innerWidth * window.innerHeight) / 3800));
      stars = Array.from({ length: count }, () => {
        const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 1 : 2;
        return {
          x: Math.random(),
          y: Math.random(),
          r: 0.35 + layer * 0.4 + Math.random() * 0.5,
          layer,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0006 + Math.random() * 0.0016,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
      });
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stars.length === 0) build();
      draw(performance.now());
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      if (root.dataset.theme === "light") return;

      const scroll = window.scrollY;
      for (const s of stars) {
        const y = (((s.y * h - scroll * LAYER_PARALLAX[s.layer]) % h) + h) % h;
        const twinkle = reduceMotion ? 1 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        ctx!.globalAlpha = (0.35 + s.layer * 0.22) * twinkle;
        ctx!.fillStyle = `rgb(${s.color})`;
        ctx!.beginPath();
        ctx!.arc(s.x * w, y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      if (shot) {
        const tail = 90;
        const speed = Math.hypot(shot.vx, shot.vy);
        const tx = shot.x - (shot.vx / speed) * tail;
        const ty = shot.y - (shot.vy / speed) * tail;
        const g = ctx!.createLinearGradient(shot.x, shot.y, tx, ty);
        g.addColorStop(0, `rgba(255,255,255,${shot.life})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(shot.x, shot.y);
        ctx!.lineTo(tx, ty);
        ctx!.stroke();
      }
    }

    let last = performance.now();
    function frame(t: number) {
      const dt = t - last;
      last = t;

      nextShot -= dt;
      if (!shot && nextShot <= 0) {
        shot = {
          x: Math.random() * w * 0.8,
          y: Math.random() * h * 0.45,
          vx: 7 + Math.random() * 4,
          vy: 3 + Math.random() * 2.5,
          life: 1,
        };
        nextShot = 7000 + Math.random() * 9000;
      }
      if (shot) {
        shot.x += shot.vx * (dt / 16);
        shot.y += shot.vy * (dt / 16);
        shot.life -= dt / 900;
        if (shot.life <= 0 || shot.x > w + 100 || shot.y > h + 100) shot = null;
      }

      draw(t);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (reduceMotion || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }
    // With reduced motion there is no loop, so repaint on the events that change the picture.
    function repaint() {
      if (reduceMotion) draw(0);
    }

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", repaint, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    const themeObserver = new MutationObserver(repaint);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", repaint);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
