// The moonwalk at /moon: the landmarks placed on the lunar plain and the shape of the ground.
// Pure data and math (no React, no three.js) so the scene, the HUD and the text fallback share one source.
import { education, organization, profile, projects, work } from "@/lib/content";

export type LandmarkKind = "lander" | "antenna" | "habitat" | "base" | "garage" | "flag";

export type Landmark = {
  id: string;
  kind: LandmarkKind;
  /** Short name shown above the landmark and in the map list. */
  name: string;
  title: string;
  period: string;
  role?: string;
  lines: string[];
  stack: string[];
  links: { label: string; href: string; external?: boolean }[];
  /** Position on the plain (x, z). */
  x: number;
  z: number;
  /** Radius of the flattened pad the landmark stands on. */
  pad: number;
};

const [aneka, bumi, uniq] = work;

export const LANDMARKS: Landmark[] = [
  {
    id: "origin",
    kind: "lander",
    name: "Landing site",
    title: education.school,
    period: education.period,
    role: `${education.degree} · ${education.note}`,
    lines: [`${organization.role}, ${organization.org} (${organization.period}).`, organization.note],
    stack: ["Informatics Engineering", "Robotics"],
    links: [{ label: "Background", href: "/#background" }],
    x: -7,
    z: 4,
    pad: 6,
  },
  {
    id: "uniq",
    kind: "antenna",
    name: "Relay antenna",
    title: uniq.company,
    period: uniq.period,
    role: uniq.role,
    lines: uniq.cases.map((c) => `${c.title}: ${c.summary}`),
    stack: [...new Set(uniq.cases.flatMap((c) => c.stack))],
    links: [{ label: "Work experience", href: "/#work" }],
    x: 16,
    z: -12,
    pad: 6,
  },
  {
    id: "bumi",
    kind: "habitat",
    name: "Habitat module",
    title: bumi.company,
    period: bumi.period,
    role: bumi.role,
    lines: bumi.cases.map((c) => `${c.title}: ${c.summary}`),
    stack: [...new Set(bumi.cases.flatMap((c) => c.stack))],
    links: [
      { label: "Work experience", href: "/#work" },
      ...bumi.cases.filter((c) => c.demoUrl).map((c) => ({ label: "SIMPRO demo", href: c.demoUrl!, external: true })),
    ],
    x: -20,
    z: -24,
    pad: 7,
  },
  {
    id: "aneka",
    kind: "base",
    name: "Main base",
    title: aneka.company,
    period: aneka.period,
    role: aneka.role,
    lines: aneka.cases.map((c) => `${c.title}: ${c.summary}`),
    stack: [...new Set(aneka.cases.flatMap((c) => c.stack))].slice(0, 10),
    links: [{ label: "Work experience", href: "/#work" }],
    x: 6,
    z: -44,
    pad: 11,
  },
  {
    id: "projects",
    kind: "garage",
    name: "Rover garage",
    title: "Side projects",
    period: "Built in my own time",
    lines: projects.map((p) => `${p.name}: ${p.summary.split(". ")[0]}.`),
    stack: [...new Set(projects.flatMap((p) => p.stack))].slice(0, 10),
    links: projects.map((p) => ({ label: p.name, href: p.demoUrl ?? p.href, external: true })),
    x: 32,
    z: -32,
    pad: 7,
  },
  {
    id: "contact",
    kind: "flag",
    name: "Flag & beacon",
    title: profile.name,
    period: "Open to new roles",
    role: `${profile.role} · ${profile.location}`,
    lines: [profile.headline, "Send a signal and I will get back to you."],
    stack: [],
    links: [
      { label: "Email", href: `mailto:${profile.email}` },
      { label: "GitHub", href: profile.github, external: true },
      { label: "LinkedIn", href: profile.linkedin, external: true },
    ],
    x: -26,
    z: -52,
    pad: 5,
  },
];

/** Solid circles (relative to the landmark) the astronaut cannot walk into. */
export const SOLIDS: Record<LandmarkKind, { x: number; z: number; r: number }[]> = {
  lander: [{ x: 0, z: 0, r: 2.6 }],
  antenna: [{ x: 0, z: 0, r: 1.4 }],
  habitat: [{ x: 0, z: 0, r: 3.3 }],
  base: [
    { x: 0, z: 0, r: 5.4 },
    { x: -7.5, z: 1.5, r: 3 },
    { x: 7.5, z: 1.5, r: 3 },
  ],
  garage: [
    { x: 0, z: -1.5, r: 3.4 },
    { x: 1.5, z: 3.6, r: 1.5 },
  ],
  flag: [{ x: 0, z: 0, r: 0.7 }],
};

/** Distance from a landmark's centre to the far edge of its solid parts. */
export function reachOf(l: Landmark): number {
  return Math.max(...SOLIDS[l.kind].map((s) => Math.hypot(s.x, s.z) + s.r));
}

/** A point just outside a landmark, on the side facing `from`, for the autopilot to walk to. */
export function approachPoint(l: Landmark, from: { x: number; z: number }) {
  const r = reachOf(l) + 1.6;
  const dx = from.x - l.x;
  const dz = from.z - l.z;
  const d = Math.hypot(dx, dz) || 1;
  return { x: l.x + (dx / d) * r, z: l.z + (dz / d) * r };
}

// ---------------------------------------------------------------- world constants

export const WORLD = {
  /** Side of the square terrain mesh. */
  size: 300,
  segments: 220,
  /** The astronaut cannot walk further than this from the centre. */
  bound: 95,
  spawn: { x: 0, z: 14 },
  /** Distance at which a landmark's card appears. */
  interactRange: 7.5,
  /** Lunar gravity tuned for feel (units/s²); real ratio to Earth is about 1/6. */
  gravity: 4.2,
  jumpSpeed: 5.6,
  walkSpeed: 4.2,
  runSpeed: 7.5,
};

// ---------------------------------------------------------------- terrain

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, z: number): number {
  let sum = 0;
  let amp = 1;
  let freq = 0.018;
  for (let i = 0; i < 4; i++) {
    sum += (valueNoise(x * freq, z * freq) - 0.5) * amp;
    amp *= 0.45;
    freq *= 2.2;
  }
  return sum * 5;
}

type Crater = { x: number; z: number; r: number; depth: number };

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Craters are scattered deterministically, keeping clear of the spawn point and every landmark's pad.
export const CRATERS: Crater[] = (() => {
  const rnd = seeded(7);
  const out: Crater[] = [];
  let tries = 0;
  while (out.length < 46 && tries < 2000) {
    tries++;
    const r = rnd() < 0.15 ? 9 + rnd() * 9 : 2 + rnd() * 5;
    const x = (rnd() - 0.5) * WORLD.size * 0.9;
    const z = (rnd() - 0.5) * WORLD.size * 0.9;
    const clear = (px: number, pz: number, pad: number) => Math.hypot(x - px, z - pz) > r * 1.4 + pad;
    if (!clear(WORLD.spawn.x, WORLD.spawn.z, 4)) continue;
    if (!LANDMARKS.every((l) => clear(l.x, l.z, l.pad + 3))) continue;
    out.push({ x, z, r, depth: r * (0.16 + rnd() * 0.08) });
  }
  return out;
})();

function rawHeight(x: number, z: number): number {
  let h = fbm(x, z);
  for (const c of CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z) / c.r;
    if (d > 2) continue;
    if (d < 1) h += c.depth * (d * d - 1); // the bowl
    const rim = (d - 1) / 0.28;
    h += c.depth * 0.45 * Math.exp(-rim * rim); // the raised rim
  }
  return h;
}

const PAD_LEVEL = LANDMARKS.map((l) => rawHeight(l.x, l.z));

function smoothstep(a: number, b: number, t: number): number {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

/** Ground height at (x, z); flat on each landmark's pad and blended back into the terrain around it. */
export function heightAt(x: number, z: number): number {
  let h = rawHeight(x, z);
  for (let i = 0; i < LANDMARKS.length; i++) {
    const l = LANDMARKS[i];
    const d = Math.hypot(x - l.x, z - l.z);
    const w = 1 - smoothstep(l.pad, l.pad + 6, d);
    if (w > 0) h += (PAD_LEVEL[i] - h) * w;
  }
  return h;
}

export function nearestLandmark(x: number, z: number): { landmark: Landmark; distance: number } {
  let best = LANDMARKS[0];
  let bestD = Infinity;
  for (const l of LANDMARKS) {
    const d = Math.hypot(x - l.x, z - l.z);
    if (d < bestD) {
      best = l;
      bestD = d;
    }
  }
  return { landmark: best, distance: bestD };
}
