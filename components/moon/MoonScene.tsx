"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { LANDMARKS, SOLIDS, WORLD, heightAt, reachOf, type Landmark } from "@/lib/moonwalk";
import Landmarks from "./Landmarks";
import AstronautModel, { type AstronautHandle } from "./AstronautModel";
import { MAX_DISTANCE, MIN_DISTANCE, type MoonInput } from "./input";

const PITCH = 0.42; // camera elevation angle
/** Radians of orbit per pixel dragged. Kept low to avoid motion sickness. */
const DRAG_SENSITIVITY = 0.0025;
/** How quickly the orbit and zoom catch up with the input (per second); lower is calmer. */
const CAMERA_EASE = 3.5;
const SUN = new THREE.Vector3(-0.55, 0.42, 0.35).normalize();

// ---------------------------------------------------------------- ground

function Terrain({ onWalkTo }: { onWalkTo: (x: number, z: number) => void }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(WORLD.size, WORLD.size, WORLD.segments, WORLD.segments);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      // regolith: grey with a faint blue cast, darker in hollows, speckled
      const speck = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
      const s = 0.46 + Math.max(-0.12, Math.min(0.1, h * 0.03)) + ((speck - Math.floor(speck)) - 0.5) * 0.05;
      colors[i * 3] = s * 0.96;
      colors[i * 3 + 1] = s * 0.95;
      colors[i * 3 + 2] = s * 1.04;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh
      geometry={geometry}
      receiveShadow
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 8) return;
        onWalkTo(e.point.x, e.point.z);
      }}
    >
      <meshStandardMaterial vertexColors roughness={1} metalness={0} flatShading />
    </mesh>
  );
}

// ---------------------------------------------------------------- sky

/** Stars and Earth ride along with the camera, so they stay at "infinity" however far you walk. */
function Sky() {
  const group = useRef<THREE.Group>(null);
  const stars = useMemo(() => {
    const n = 2600;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      p[i * 3] = r * Math.cos(t) * 500;
      p[i * 3 + 1] = Math.abs(u) * 500 - 40; // mostly above the horizon
      p[i * 3 + 2] = r * Math.sin(t) * 500;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);

  const earth = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#1e5fd6";
    g.fillRect(0, 0, 256, 128);
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.fillStyle = "#3fae6a";
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      g.ellipse(rnd() * 256, 20 + rnd() * 88, 8 + rnd() * 26, 5 + rnd() * 14, rnd() * 3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 30; i++) {
      g.beginPath();
      g.ellipse(rnd() * 256, rnd() * 128, 6 + rnd() * 22, 2 + rnd() * 5, 0, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame(({ camera }) => {
    group.current?.position.copy(camera.position);
  });

  return (
    <group ref={group}>
      <points geometry={stars}>
        <pointsMaterial color="#dfe6ff" size={1.6} sizeAttenuation={false} fog={false} depthWrite={false} />
      </points>
      <group position={[-160, 120, -330]}>
        <mesh rotation={[0.3, 2.2, 0.2]}>
          <sphereGeometry args={[26, 40, 24]} />
          <meshStandardMaterial map={earth} roughness={0.8} fog={false} emissive="#0b1d4a" emissiveIntensity={0.4} />
        </mesh>
        <mesh>
          <sphereGeometry args={[28, 40, 24]} />
          <meshBasicMaterial color="#7cc4ff" transparent opacity={0.13} fog={false} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------- astronaut

const SOLID_CIRCLES = LANDMARKS.flatMap((l) => SOLIDS[l.kind].map((s) => ({ x: l.x + s.x, z: l.z + s.z, r: s.r + 0.45 })));

/** How close the astronaut must stand to a landmark (from its centre) for its card to be offered. */
function rangeOf(l: Landmark): number {
  return reachOf(l) + WORLD.interactRange - 3;
}

const PRINTS = 180;

function Astronaut({ input, onNear }: { input: MoonInput; onNear: (id: string | null) => void }) {
  const model = useRef<AstronautHandle>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const prints = useRef<THREE.InstancedMesh>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const { camera, scene } = useThree();

  const s = useRef({
    pos: new THREE.Vector3(WORLD.spawn.x, heightAt(WORLD.spawn.x, WORLD.spawn.z), WORLD.spawn.z),
    vel: new THREE.Vector3(),
    vy: 0,
    grounded: true,
    heading: Math.PI, // facing away from the camera, toward the landmarks
    phase: 0,
    strideAmount: 0,
    airAmount: 0,
    stride: 0,
    printIndex: 0,
    printSide: 1,
    near: null as string | null,
    camPos: new THREE.Vector3(WORLD.spawn.x, 8, WORLD.spawn.z + 12),
    // smoothed copies of the orbit and look-at point, so the view eases instead of snapping
    yaw: 0,
    distance: 10,
    look: new THREE.Vector3(WORLD.spawn.x, heightAt(WORLD.spawn.x, WORLD.spawn.z) + 1.3, WORLD.spawn.z),
  });

  useEffect(() => {
    const light = sun.current;
    if (!light) return;
    scene.add(light.target);
    return () => {
      scene.remove(light.target);
    };
  }, [scene]);

  useEffect(() => {
    // park every footprint out of sight until it is stamped
    const m = prints.current;
    if (!m) return;
    const hidden = new THREE.Matrix4().makeTranslation(0, -999, 0);
    for (let i = 0; i < PRINTS; i++) m.setMatrixAt(i, hidden);
    m.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const st = s.current;
    const k = input.keys;

    // --- steering, relative to where the camera looks
    const ix = (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) - (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0) + input.joy.x;
    const iz = (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0) - (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) + input.joy.y;
    // ease the orbit toward where the player dragged it (gentle on the stomach)
    st.yaw += (input.yaw - st.yaw) * (1 - Math.exp(-CAMERA_EASE * dt));
    const fx = -Math.sin(st.yaw);
    const fz = -Math.cos(st.yaw);
    const rx = Math.cos(st.yaw);
    const rz = -Math.sin(st.yaw);
    let wx = rx * ix + fx * -iz;
    let wz = rz * ix + fz * -iz;

    if (Math.hypot(ix, iz) > 0.1) {
      input.target = null;
      input.openOnArrive = null;
    } else if (input.target) {
      const dx = input.target.x - st.pos.x;
      const dz = input.target.z - st.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.5) input.target = null;
      else {
        wx = dx / d;
        wz = dz / d;
      }
    }
    const len = Math.hypot(wx, wz);
    if (len > 1) {
      wx /= len;
      wz /= len;
    }

    const running = k.has("ShiftLeft") || k.has("ShiftRight") || input.run;
    const speed = running ? WORLD.runSpeed : WORLD.walkSpeed;
    const control = st.grounded ? 10 : 2.2; // you cannot steer much mid-hop
    const blend = 1 - Math.exp(-control * dt);
    st.vel.x += (wx * speed - st.vel.x) * blend;
    st.vel.z += (wz * speed - st.vel.z) * blend;

    let nx = st.pos.x + st.vel.x * dt;
    let nz = st.pos.z + st.vel.z * dt;

    // keep out of buildings
    for (const c of SOLID_CIRCLES) {
      const dx = nx - c.x;
      const dz = nz - c.z;
      const d = Math.hypot(dx, dz);
      if (d < c.r && d > 0.0001) {
        nx = c.x + (dx / d) * c.r;
        nz = c.z + (dz / d) * c.r;
      }
    }
    // and inside the explorable plain
    const fromCentre = Math.hypot(nx, nz);
    if (fromCentre > WORLD.bound) {
      nx *= WORLD.bound / fromCentre;
      nz *= WORLD.bound / fromCentre;
    }
    const moved = Math.hypot(nx - st.pos.x, nz - st.pos.z);
    st.pos.x = nx;
    st.pos.z = nz;
    input.player.x = nx;
    input.player.z = nz;

    // --- low-gravity vertical motion
    const ground = heightAt(st.pos.x, st.pos.z);
    if (input.jump) {
      input.jump = false;
      if (st.grounded) {
        st.vy = WORLD.jumpSpeed;
        st.grounded = false;
      }
    }
    if (st.grounded && st.pos.y - ground < 0.35) {
      st.pos.y = ground; // stick to the ground walking downhill
      st.vy = 0;
    } else {
      st.vy -= WORLD.gravity * dt;
      st.pos.y += st.vy * dt;
      if (st.pos.y <= ground) {
        st.pos.y = ground;
        st.vy = 0;
        st.grounded = true;
      } else {
        st.grounded = false;
      }
    }

    // --- turn toward the walking direction and animate the stride
    const horizontal = Math.hypot(st.vel.x, st.vel.z);
    if (horizontal > 0.3) {
      const want = Math.atan2(st.vel.x, st.vel.z);
      let diff = want - st.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest way round
      st.heading += diff * (1 - Math.exp(-10 * dt));
    }
    st.phase += horizontal * dt * (running ? 2.1 : 2.6);
    st.strideAmount += (Math.min(horizontal / WORLD.walkSpeed, 1) - st.strideAmount) * (1 - Math.exp(-8 * dt));
    const airTarget = st.grounded ? 0 : Math.min(1, (st.pos.y - ground) / 0.8);
    st.airAmount += (airTarget - st.airAmount) * (1 - Math.exp(-10 * dt));
    model.current?.pose({
      x: st.pos.x,
      y: st.pos.y,
      z: st.pos.z,
      heading: st.heading,
      phase: st.phase,
      stride: st.strideAmount,
      air: st.airAmount,
    });
    if (shadow.current) {
      const air = st.pos.y - ground;
      const sc = Math.max(0.35, 1 - air * 0.12);
      shadow.current.position.set(st.pos.x, ground + 0.04, st.pos.z);
      shadow.current.scale.set(sc, sc, sc);
      (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * sc;
    }

    // --- footprints in the regolith
    if (st.grounded && moved > 0) {
      st.stride += moved;
      if (st.stride > 0.85 && prints.current) {
        st.stride = 0;
        const heading = Math.atan2(st.vel.x, st.vel.z);
        st.printSide *= -1;
        const ox = Math.cos(heading) * 0.22 * st.printSide;
        const oz = -Math.sin(heading) * 0.22 * st.printSide;
        const px = st.pos.x + ox;
        const pz = st.pos.z + oz;
        const m = new THREE.Matrix4().compose(
          new THREE.Vector3(px, heightAt(px, pz) + 0.03, pz),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, heading, "YXZ")),
          new THREE.Vector3(1, 1, 1),
        );
        prints.current.setMatrixAt(st.printIndex, m);
        prints.current.instanceMatrix.needsUpdate = true;
        st.printIndex = (st.printIndex + 1) % PRINTS;
      }
    }

    // --- which landmark is close enough to talk to
    let near: string | null = null;
    let best = Infinity;
    for (const l of LANDMARKS) {
      const d = Math.hypot(st.pos.x - l.x, st.pos.z - l.z);
      if (d < rangeOf(l) && d < best) {
        best = d;
        near = l.id;
      }
    }
    if (near !== st.near) {
      st.near = near;
      onNear(near);
    }

    // --- third-person camera on an orbit around the astronaut
    st.distance += (THREE.MathUtils.clamp(input.distance, MIN_DISTANCE, MAX_DISTANCE) - st.distance) * (1 - Math.exp(-CAMERA_EASE * dt));
    const dist = st.distance;
    const want = new THREE.Vector3(
      st.pos.x + Math.sin(st.yaw) * Math.cos(PITCH) * dist,
      st.pos.y + 1.2 + Math.sin(PITCH) * dist,
      st.pos.z + Math.cos(st.yaw) * Math.cos(PITCH) * dist,
    );
    const floor = heightAt(want.x, want.z) + 1.2;
    if (want.y < floor) want.y = floor;
    st.camPos.lerp(want, 1 - Math.exp(-4 * dt));
    camera.position.copy(st.camPos);
    // the look-at point trails the astronaut, and only half follows a jump, so hops do not jerk the view
    const lookY = ground + 1.3 + (st.pos.y - ground) * 0.5;
    st.look.lerp(new THREE.Vector3(st.pos.x, lookY, st.pos.z), 1 - Math.exp(-5 * dt));
    camera.lookAt(st.look);

    // the sun's shadow box follows the astronaut so nearby buildings always cast shadows
    if (sun.current) {
      sun.current.position.set(st.pos.x + SUN.x * 90, st.pos.y + SUN.y * 90, st.pos.z + SUN.z * 90);
      sun.current.target.position.set(st.pos.x, st.pos.y, st.pos.z);
    }
  });

  return (
    <>
      <directionalLight
        ref={sun}
        intensity={2.8}
        color="#fff6ea"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-near={1}
        shadow-camera-far={220}
        shadow-bias={-0.0006}
      />
      <AstronautModel ref={model} />
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <instancedMesh ref={prints} args={[undefined, undefined, PRINTS]} frustumCulled={false}>
        <planeGeometry args={[0.2, 0.34]} />
        <meshBasicMaterial
          color="#3a3a4c"
          transparent
          opacity={0.55}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </instancedMesh>
    </>
  );
}

// ---------------------------------------------------------------- orbit / zoom by pointer

function OrbitControls({ input }: { input: MoonInput }) {
  const { gl } = useThree();
  useEffect(() => {
    const el = gl.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;

    const down = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const cur = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, cur);
      if (pointers.size === 1) {
        input.yaw -= (cur.x - prev.x) * DRAG_SENSITIVITY;
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) input.distance = THREE.MathUtils.clamp(input.distance * (pinch / d), MIN_DISTANCE, MAX_DISTANCE);
        pinch = d;
      }
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinch = 0;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      input.distance = THREE.MathUtils.clamp(input.distance * (1 + Math.sign(e.deltaY) * 0.06), MIN_DISTANCE, MAX_DISTANCE);
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl, input]);
  return null;
}

// ---------------------------------------------------------------- scene

export default function MoonScene({
  input,
  near,
  onNear,
  onSelect,
}: {
  input: MoonInput;
  near: string | null;
  onNear: (id: string | null) => void;
  onSelect: (landmark: Landmark) => void;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 55, near: 0.1, far: 1500, position: [0, 8, 26] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="mw-canvas"
    >
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#05060f", 70, 190]} />
      <ambientLight intensity={0.35} color="#8f9cff" />
      <hemisphereLight args={["#b9c6ff", "#1a1a26", 0.35]} />
      <Sky />
      <Terrain
        onWalkTo={(x, z) => {
          input.target = { x, z };
          input.openOnArrive = null;
        }}
      />
      <Landmarks near={near} onSelect={onSelect} />
      <Astronaut input={input} onNear={onNear} />
      <OrbitControls input={input} />
    </Canvas>
  );
}
