// Mutable input shared by the HUD (keyboard, touch buttons, map) and the scene's frame loop.
// It lives in a ref, not in React state, so holding a key never re-renders anything.
export type MoonInput = {
  /** KeyboardEvent.code values currently held down. */
  keys: Set<string>;
  /** On-screen joystick, each axis -1..1 (y down = backwards). */
  joy: { x: number; y: number };
  /** Set by a key or button press; the frame loop consumes it. */
  jump: boolean;
  /** Sprint toggle from the touch button (Shift works on keyboards). */
  run: boolean;
  /** Autopilot destination on the plain, cleared on arrival or as soon as the player steers. */
  target: { x: number; z: number } | null;
  /** Landmark whose card should open when the autopilot arrives. */
  openOnArrive: string | null;
  /** Where the astronaut stands, written by the frame loop (read by the HUD for the autopilot). */
  player: { x: number; z: number };
  /** Camera orbit around the astronaut. */
  yaw: number;
  distance: number;
};

export function createInput(): MoonInput {
  return {
    keys: new Set(),
    joy: { x: 0, y: 0 },
    jump: false,
    run: false,
    target: null,
    openOnArrive: null,
    player: { x: 0, z: 0 },
    yaw: 0,
    distance: 10,
  };
}

export const MIN_DISTANCE = 5;
export const MAX_DISTANCE = 18;
