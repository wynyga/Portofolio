"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { PALETTE, STARTER, loadMine } from "@/lib/astronaut";

// A low-poly astronaut built from primitive shapes (nothing to download), in the same style as the landmarks.
// Its accent colour comes from the visitor's own drawing in the Crew section, so their astronaut still walks here.

const SUIT = "#eef1f8";
const SUIT_SHADE = "#c9d0ea";
const STEEL = "#6c7599";
const VISOR = "#1b2358";

/** Palette indices that count as "a colour" rather than suit white, grey, visor navy, steel or black. */
const COLOURFUL = new Set([4, 5, 6, 7, 8, 9, 10, 11]);

function accentFrom(code: string): string {
  const counts = new Map<number, number>();
  for (const ch of code) {
    const i = parseInt(ch, 16);
    if (COLOURFUL.has(i)) counts.set(i, (counts.get(i) ?? 0) + 1);
  }
  let best = 8; // cyan when the drawing has no colour at all
  let n = 0;
  for (const [i, c] of counts) {
    if (c > n) {
      best = i;
      n = c;
    }
  }
  return PALETTE[best];
}

export type AstronautPose = {
  /** Where to stand (feet). */
  x: number;
  y: number;
  z: number;
  /** Heading in radians (0 = facing +z). */
  heading: number;
  /** Walk cycle phase in radians. */
  phase: number;
  /** 0 = standing, 1 = full stride. */
  stride: number;
  /** 0 on the ground, 1 mid-air. */
  air: number;
};

export type AstronautHandle = { pose: (p: AstronautPose) => void };

function Part({
  color,
  metal = 0.05,
  rough = 0.75,
  emissive,
}: {
  color: string;
  metal?: number;
  rough?: number;
  emissive?: string;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metal}
      roughness={rough}
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissive ? 0.6 : 0}
      flatShading
    />
  );
}

const AstronautModel = forwardRef<AstronautHandle>(function AstronautModel(_, ref) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Group>(null);
  const legR = useRef<THREE.Group>(null);
  const accent = useMemo(() => accentFrom(loadMine() ?? STARTER), []);

  useImperativeHandle(ref, () => ({
    pose({ x, y, z, heading, phase, stride, air }) {
      if (!root.current) return;
      root.current.position.set(x, y, z);
      root.current.rotation.y = heading;
      const swing = Math.sin(phase) * 0.65 * stride;
      // legs swing opposite to each other; mid-air they tuck forward a little
      if (legL.current) legL.current.rotation.x = swing * (1 - air) - 0.35 * air;
      if (legR.current) legR.current.rotation.x = -swing * (1 - air) + 0.15 * air;
      // arms swing against the legs; mid-air they lift out for balance
      if (armL.current) {
        armL.current.rotation.x = -swing * 0.8 * (1 - air);
        armL.current.rotation.z = 0.12 + 0.55 * air;
      }
      if (armR.current) {
        armR.current.rotation.x = swing * 0.8 * (1 - air);
        armR.current.rotation.z = -0.12 - 0.55 * air;
      }
      // a slight lean into the walk and a soft bounce on each step
      if (body.current) {
        body.current.rotation.x = 0.08 * stride * (1 - air);
        body.current.position.y = Math.abs(Math.cos(phase)) * 0.04 * stride * (1 - air);
      }
    },
  }));

  return (
    <group ref={root}>
      <group ref={body}>
        {/* legs, pivoting at the hips */}
        {(
          [
            [legL, -0.17],
            [legR, 0.17],
          ] as const
        ).map(([r, x]) => (
          <group key={x} ref={r} position={[x, 0.78, 0]}>
            <mesh position={[0, -0.36, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.48, 4, 8]} />
              <Part color={SUIT} />
            </mesh>
            <mesh position={[0, -0.72, 0.05]} castShadow>
              <boxGeometry args={[0.26, 0.16, 0.38]} />
              <Part color={STEEL} />
            </mesh>
          </group>
        ))}

        {/* torso */}
        <mesh position={[0, 1.13, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.38, 4, 10]} />
          <Part color={SUIT} />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.29, 0.27, 0.12, 10]} />
          <Part color={SUIT_SHADE} />
        </mesh>
        {/* chest control panel in the visitor's colour */}
        <mesh position={[0, 1.13, 0.29]}>
          <boxGeometry args={[0.3, 0.18, 0.06]} />
          <Part color={accent} emissive={accent} />
        </mesh>
        {/* life-support backpack */}
        <mesh position={[0, 1.18, -0.33]} castShadow>
          <boxGeometry args={[0.5, 0.62, 0.24]} />
          <Part color={SUIT_SHADE} />
        </mesh>
        <mesh position={[0, 1.42, -0.46]}>
          <boxGeometry args={[0.36, 0.06, 0.03]} />
          <Part color={accent} emissive={accent} />
        </mesh>

        {/* arms, pivoting at the shoulders */}
        {(
          [
            [armL, -0.4],
            [armR, 0.4],
          ] as const
        ).map(([r, x]) => (
          <group key={x} ref={r} position={[x, 1.4, 0]}>
            <mesh position={[0, -0.3, 0]} castShadow>
              <capsuleGeometry args={[0.1, 0.42, 4, 8]} />
              <Part color={SUIT} />
            </mesh>
            <mesh position={[0, -0.6, 0]} castShadow>
              <sphereGeometry args={[0.11, 8, 6]} />
              <Part color={STEEL} />
            </mesh>
          </group>
        ))}

        {/* helmet with a gold-tinted reflective visor */}
        <mesh position={[0, 1.78, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 12]} />
          <Part color={SUIT} />
        </mesh>
        {/* a slice of a slightly larger sphere, centred on +z (phi = π/2 faces forward in three.js) */}
        <mesh position={[0, 1.78, 0]}>
          <sphereGeometry args={[0.335, 16, 12, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.3, Math.PI * 0.36]} />
          <meshStandardMaterial color={VISOR} metalness={0.9} roughness={0.15} emissive="#3b2a08" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <torusGeometry args={[0.24, 0.05, 6, 16]} />
          <Part color={SUIT_SHADE} />
        </mesh>
        {/* a small antenna with an accent tip */}
        <mesh position={[0.2, 2.1, -0.12]}>
          <cylinderGeometry args={[0.012, 0.012, 0.26, 4]} />
          <Part color={STEEL} />
        </mesh>
        <mesh position={[0.2, 2.24, -0.12]}>
          <sphereGeometry args={[0.035, 6, 5]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
});

export default AstronautModel;
