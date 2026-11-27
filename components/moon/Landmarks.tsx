"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { LANDMARKS, heightAt, type Landmark, type LandmarkKind } from "@/lib/moonwalk";

// Every landmark is built from primitive shapes: no model files to download, and the style stays simple.

const WHITE = "#e8ebf5";
const STEEL = "#6c7599";
const DARK = "#2a2f4a";
const GOLD = "#d4a72c";
const GLASS = "#7cc4ff";
const RED = "#ef4f5f";

/** How high above the ground the name label floats. */
const LABEL_HEIGHT: Record<LandmarkKind, number> = {
  lander: 6,
  antenna: 8.5,
  habitat: 6.8,
  base: 8.5,
  garage: 6,
  flag: 5.5,
};

function Mat({ color, metal = 0.1, rough = 0.8, emissive }: { color: string; metal?: number; rough?: number; emissive?: string }) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metal}
      roughness={rough}
      emissive={emissive ?? "#000000"}
      emissiveIntensity={emissive ? 1.4 : 0}
      flatShading
    />
  );
}

function Lander() {
  const legs = [0, 1, 2, 3].map((i) => (i * Math.PI) / 2 + Math.PI / 4);
  return (
    <group>
      {/* descent stage wrapped in gold foil */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[1.7, 1.7, 1.3, 8]} />
        <Mat color={GOLD} metal={0.7} rough={0.35} />
      </mesh>
      {/* ascent stage */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[2.2, 1.4, 2]} />
        <Mat color={WHITE} />
      </mesh>
      <mesh position={[0, 3.2, 1.01]}>
        <boxGeometry args={[0.7, 0.5, 0.05]} />
        <Mat color={DARK} emissive={GLASS} />
      </mesh>
      {legs.map((a) => (
        <group key={a} rotation={[0, a, 0]}>
          <mesh position={[0, 1.05, 2.05]} rotation={[0.5, 0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2.4, 6]} />
            <Mat color={STEEL} metal={0.6} />
          </mesh>
          <mesh position={[0, 0.06, 2.6]}>
            <cylinderGeometry args={[0.35, 0.4, 0.1, 10]} />
            <Mat color={STEEL} metal={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Blink({ position, color = RED, speed = 2.2 }: { position: [number, number, number]; color?: string; speed?: number }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.25 + 0.75 * Math.max(0, Math.sin(clock.elapsedTime * speed));
  });
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.18, 10, 8]} />
      <meshBasicMaterial ref={mat} color={color} transparent toneMapped={false} />
    </mesh>
  );
}

function Antenna() {
  const dish = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (dish.current) dish.current.rotation.y += dt * 0.25;
  });
  return (
    <group>
      <mesh position={[0, 2.6, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 5.2, 8]} />
        <Mat color={STEEL} metal={0.6} />
      </mesh>
      <group ref={dish} position={[0, 5.2, 0]}>
        <mesh rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry args={[1.8, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2.8]} />
          <meshStandardMaterial color={WHITE} side={THREE.DoubleSide} roughness={0.6} flatShading />
        </mesh>
        <mesh position={[0, 0.55, 0.5]} rotation={[-0.9, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 5]} />
          <Mat color={STEEL} />
        </mesh>
      </group>
      <Blink position={[0, 6.6, 0]} />
    </group>
  );
}

function Windows({ radius, y }: { radius: number; y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.14, 6, 40]} />
      <Mat color={DARK} emissive={GLASS} />
    </mesh>
  );
}

function Habitat() {
  return (
    <group>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.8, 2.9, 2.6, 16]} />
        <Mat color={WHITE} />
      </mesh>
      <mesh position={[0, 2.6, 0]} castShadow>
        <sphereGeometry args={[2.8, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={WHITE} />
      </mesh>
      <Windows radius={2.86} y={1.7} />
      {/* airlock facing the landing site */}
      <mesh position={[0, 1, 2.9]} castShadow>
        <boxGeometry args={[1.3, 2, 1]} />
        <Mat color={STEEL} />
      </mesh>
      <mesh position={[0, 1, 3.42]}>
        <boxGeometry args={[0.8, 1.5, 0.05]} />
        <Mat color={DARK} emissive="#ffd166" />
      </mesh>
      <Blink position={[0, 5.55, 0]} color={GLASS} speed={1.4} />
    </group>
  );
}

function Dome({ r, position }: { r: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[r, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <Mat color={WHITE} />
      </mesh>
      <Windows radius={r * 0.93} y={r * 0.36} />
    </group>
  );
}

function SolarPanel({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.8, 5]} />
        <Mat color={STEEL} />
      </mesh>
      <mesh position={[0, 1.85, 0]} rotation={[-0.6, 0, 0]} castShadow>
        <boxGeometry args={[3, 0.08, 1.6]} />
        <Mat color="#2f4fb8" metal={0.5} rough={0.3} />
      </mesh>
    </group>
  );
}

function Base() {
  return (
    <group>
      <Dome r={5} position={[0, 0, 0]} />
      <Dome r={2.7} position={[-7.5, 0, 1.5]} />
      <Dome r={2.7} position={[7.5, 0, 1.5]} />
      {/* tunnels between the domes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 4.9, 0.9, 0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 3.4, 10]} />
          <Mat color={STEEL} />
        </mesh>
      ))}
      <SolarPanel position={[-4, 0, -7]} />
      <SolarPanel position={[0, 0, -8]} />
      <SolarPanel position={[4, 0, -7]} />
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 2.4, 5]} />
        <Mat color={STEEL} />
      </mesh>
      <Blink position={[0, 7.25, 0]} color={GLASS} speed={1.2} />
    </group>
  );
}

function Rover() {
  const wheels: [number, number][] = [
    [-0.85, -0.75],
    [0.85, -0.75],
    [-0.85, 0.75],
    [0.85, 0.75],
  ];
  return (
    <group>
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[1.5, 0.35, 2.1]} />
        <Mat color={WHITE} />
      </mesh>
      <mesh position={[0, 1.05, -0.4]} castShadow>
        <boxGeometry args={[1.1, 0.3, 0.7]} />
        <Mat color={STEEL} />
      </mesh>
      {wheels.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.42, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 12]} />
          <Mat color={DARK} />
        </mesh>
      ))}
      <mesh position={[0.5, 1.6, 0.6]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 4]} />
        <Mat color={STEEL} />
      </mesh>
      <mesh position={[0.5, 2.3, 0.6]} rotation={[-0.4, 0, 0]}>
        <coneGeometry args={[0.35, 0.18, 12, 1, true]} />
        <meshStandardMaterial color={WHITE} side={THREE.DoubleSide} flatShading />
      </mesh>
    </group>
  );
}

function Garage() {
  return (
    <group>
      <mesh position={[0, 1.6, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[5.2, 3.2, 4.4]} />
        <Mat color={WHITE} />
      </mesh>
      <mesh position={[0, 3.3, -1.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[2.2, 2.2, 5.2, 12, 1, false, 0, Math.PI]} />
        <Mat color={WHITE} />
      </mesh>
      <mesh position={[0, 1.3, 0.72]}>
        <boxGeometry args={[3.6, 2.5, 0.06]} />
        <Mat color={DARK} emissive="#3b6fe0" />
      </mesh>
      <group position={[1.5, 0, 3.6]} rotation={[0, -0.5, 0]}>
        <Rover />
      </group>
    </group>
  );
}

function Flag() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 2;
    const g = c.getContext("2d")!;
    g.fillStyle = RED;
    g.fillRect(0, 0, 4, 1);
    g.fillStyle = "#f4f6fc";
    g.fillRect(0, 1, 4, 1);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group>
      <mesh position={[0, 2.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 4.6, 6]} />
        <Mat color={WHITE} metal={0.5} />
      </mesh>
      {/* held out by a horizontal rod: there is no wind on the moon */}
      <mesh position={[1.1, 4.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 2.2, 5]} />
        <Mat color={WHITE} metal={0.5} />
      </mesh>
      <mesh position={[1.1, 4, 0]} castShadow>
        <planeGeometry args={[2.1, 1]} />
        <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* signal beacon on a tripod */}
      <group position={[-1.6, 0, 0.8]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.sin((i * 2 * Math.PI) / 3) * 0.35, 0.6, Math.cos((i * 2 * Math.PI) / 3) * 0.35]} rotation={[Math.cos((i * 2 * Math.PI) / 3) * 0.3, 0, -Math.sin((i * 2 * Math.PI) / 3) * 0.3]}>
            <cylinderGeometry args={[0.03, 0.03, 1.3, 4]} />
            <Mat color={STEEL} />
          </mesh>
        ))}
        <Blink position={[0, 1.35, 0]} color={GLASS} speed={3} />
      </group>
    </group>
  );
}

const MODELS: Record<LandmarkKind, () => React.JSX.Element> = {
  lander: Lander,
  antenna: Antenna,
  habitat: Habitat,
  base: Base,
  garage: Garage,
  flag: Flag,
};

function labelTexture(text: string): { texture: THREE.CanvasTexture; aspect: number } {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif";
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const font = `600 52px ${family}`;
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 64;
  c.width = w;
  c.height = 88;
  g.font = font;
  g.fillStyle = "rgba(8, 11, 30, 0.72)";
  g.beginPath();
  g.roundRect(0, 0, w, 88, 44);
  g.fill();
  g.strokeStyle = "rgba(124, 196, 255, 0.55)";
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = "#e9ecff";
  g.textBaseline = "middle";
  g.textAlign = "center";
  g.fillText(text, w / 2, 46);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: w / 88 };
}

function Label({ text, y }: { text: string; y: number }) {
  const { texture, aspect } = useMemo(() => labelTexture(text), [text]);
  const h = 0.9;
  return (
    <sprite position={[0, y, 0]} scale={[h * aspect, h, 1]} renderOrder={10}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function Ring({ landmark, active }: { landmark: Landmark; active: boolean }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    const base = active ? 0.75 : 0.28;
    mat.current.opacity = base + Math.sin(clock.elapsedTime * 2.4) * 0.12;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[landmark.pad - 0.7, landmark.pad - 0.35, 72]} />
      <meshBasicMaterial ref={mat} color={active ? "#b693ff" : "#7cc4ff"} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export default function Landmarks({
  near,
  onSelect,
}: {
  near: string | null;
  onSelect: (landmark: Landmark) => void;
}) {
  return (
    <>
      {LANDMARKS.map((l) => {
        const Model = MODELS[l.kind];
        return (
          <group
            key={l.id}
            position={[l.x, heightAt(l.x, l.z), l.z]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (e.delta > 8) return; // that was a drag to orbit, not a click
              e.stopPropagation();
              onSelect(l);
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "")}
          >
            <Model />
            <Ring landmark={l} active={near === l.id} />
            <Label text={l.name} y={LABEL_HEIGHT[l.kind]} />
          </group>
        );
      })}
    </>
  );
}
