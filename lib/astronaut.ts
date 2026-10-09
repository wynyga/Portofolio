// Shared by the editor, the wall, the footer runner and the API.
// An astronaut is a 16x16 pixel drawing stored as 256 hex characters, one palette index per cell,
// row by row. Index 0 is transparent.

export const SIZE = 16;
export const CELLS = SIZE * SIZE;

export const PALETTE = [
  "transparent",
  "#f4f6fc", // 1 suit white
  "#c9d0ea", // 2 light grey
  "#1b2358", // 3 visor navy
  "#ef4f5f", // 4 red
  "#ff9f43", // 5 orange
  "#ffd166", // 6 yellow
  "#58d6a4", // 7 green
  "#7cc4ff", // 8 cyan
  "#3b6fe0", // 9 blue
  "#b693ff", // a violet
  "#ff7eb6", // b pink
  "#8a5a44", // c brown
  "#f1c9a5", // d skin
  "#6c7599", // e steel
  "#05060f", // f black
] as const;

// A starter astronaut, so visitors edit something instead of facing a blank grid.
export const STARTER = [
  "0000000000000000",
  "0000011111100000",
  "0000111111110000",
  "0000133333310000",
  "0000133833310000",
  "0000133333310000",
  "0000111111110000",
  "0000022222200000",
  "0011111111111100",
  "0011114671111100",
  "0011111111111100",
  "0022111111112200",
  "0000eeeeeeee0000",
  "0000111001110000",
  "0000111001110000",
  "000eeee00eeee000",
].join("");

export const BLANK = "0".repeat(CELLS);

const FORMAT = /^[0-9a-f]{256}$/;

export function filledCount(code: string): number {
  let n = 0;
  for (const ch of code) if (ch !== "0") n++;
  return n;
}

// Rejects anything that is not a well-formed drawing, and drawings that are nearly empty or a solid block.
export function isValidCode(code: unknown): code is string {
  if (typeof code !== "string" || !FORMAT.test(code)) return false;
  const filled = filledCount(code);
  return filled >= 24 && filled <= 230;
}

export const STORAGE_KEY = "crew:mine";
export const CHANGE_EVENT = "crew:change";
export const REFRESH_EVENT = "crew:refresh"; // fire to make the wall reload (after a send or a wipe)

export function loadMine(): string | null {
  try {
    const code = localStorage.getItem(STORAGE_KEY);
    return isValidCode(code) ? code : null;
  } catch {
    return null;
  }
}

export function saveMine(code: string | null) {
  try {
    if (code) localStorage.setItem(STORAGE_KEY, code);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage can be blocked; the change still applies for this visit through the event below
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: code }));
}
