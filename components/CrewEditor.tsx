"use client";

import { useEffect, useRef, useState } from "react";
import { BLANK, PALETTE, SIZE, STARTER, isValidCode, loadMine, saveMine } from "@/lib/astronaut";
import PixelSprite from "./PixelSprite";
import ResetLimit from "./ResetLimit";

type Tool = "pencil" | "eraser" | "fill";

const CELL = 20; // canvas pixels per cell (the canvas scales down with CSS on narrow screens)
const toGrid = (code: string) => Array.from(code, (c) => parseInt(c, 16));
const toCode = (grid: number[]) => grid.map((n) => n.toString(16)).join("");

// A modal pixel editor. "Use as my astronaut" stores the drawing in this browser (it becomes the footer
// runner); "Send to the moon" puts it on the public wall straight away.
export default function CrewEditor({ open, onClose, wallEnabled, onSent }: { open: boolean; onClose: () => void; wallEnabled: boolean; onSent: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[]>(() => toGrid(STARTER));
  const gridRef = useRef(grid);
  const history = useRef<number[][]>([]);
  const painting = useRef(false);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState(4);
  const [mirror, setMirror] = useState(true);
  const [hasMine, setHasMine] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [limited, setLimited] = useState(false);

  const code = toCode(grid);
  const valid = isValidCode(code);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Open / close the native <dialog> (it handles focus trapping and Esc for us).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const mine = loadMine();
      setGrid(toGrid(mine ?? STARTER));
      setHasMine(mine !== null);
      history.current = [];
      setMessage("");
      setLimited(false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Repaint the canvas whenever the drawing changes.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#141a3a" : "#1a2147";
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        const idx = grid[y * SIZE + x];
        if (idx) {
          ctx.fillStyle = PALETTE[idx];
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
    }
    ctx.strokeStyle = "rgba(140,160,255,0.12)";
    ctx.lineWidth = 1;
    for (let i = 1; i < SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL + 0.5, 0);
      ctx.lineTo(i * CELL + 0.5, SIZE * CELL);
      ctx.moveTo(0, i * CELL + 0.5);
      ctx.lineTo(SIZE * CELL, i * CELL + 0.5);
      ctx.stroke();
    }
  }, [grid]);

  function cellAt(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(SIZE - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * SIZE)));
    const y = Math.min(SIZE - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * SIZE)));
    return { x, y };
  }

  function paint(x: number, y: number) {
    const next = gridRef.current.slice();
    if (tool === "fill") {
      const target = next[y * SIZE + x];
      if (target === color) return;
      const stack = [[x, y]];
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        if (cx < 0 || cy < 0 || cx >= SIZE || cy >= SIZE || next[cy * SIZE + cx] !== target) continue;
        next[cy * SIZE + cx] = color;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
    } else {
      const value = tool === "eraser" ? 0 : color;
      next[y * SIZE + x] = value;
      if (mirror) next[y * SIZE + (SIZE - 1 - x)] = value;
    }
    gridRef.current = next;
    setGrid(next);
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    history.current.push(gridRef.current);
    if (history.current.length > 50) history.current.shift();
    painting.current = tool !== "fill";
    const { x, y } = cellAt(e);
    paint(x, y);
    setMessage("");
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!painting.current) return;
    const { x, y } = cellAt(e);
    paint(x, y);
  }

  function replace(next: number[]) {
    history.current.push(gridRef.current);
    gridRef.current = next;
    setGrid(next);
    setMessage("");
  }

  function undo() {
    const prev = history.current.pop();
    if (!prev) return;
    gridRef.current = prev;
    setGrid(prev);
  }

  function useMine() {
    saveMine(code);
    setHasMine(true);
    setMessage("Saved. Your astronaut is now jogging in the footer.");
  }

  function removeMine() {
    saveMine(null);
    setHasMine(false);
    setMessage("Back to the default astronaut.");
  }

  async function send() {
    setSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/astronauts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setMessage("Sent! Your astronaut is jogging on the moon for everyone now.");
        onSent();
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(data.error ?? "Could not send it. Please try again later.");
        setLimited(res.status === 429);
      }
    } catch {
      setMessage("Could not reach the server. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <dialog ref={dialogRef} className="editor" onClose={onClose} onClick={(e) => e.target === e.currentTarget && onClose()} aria-labelledby="editor-title">
      <div className="editor-body">
        <div className="editor-head">
          <h3 id="editor-title">Draw your astronaut</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        <div className="editor-grid">
          <canvas
            ref={canvasRef}
            width={SIZE * CELL}
            height={SIZE * CELL}
            className="editor-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (painting.current = false)}
            onPointerCancel={() => (painting.current = false)}
            role="img"
            aria-label="16 by 16 drawing area. Use a mouse or touch to draw."
          />

          <div className="editor-side">
            <div className="tool-row" role="group" aria-label="Tools">
              {(["pencil", "eraser", "fill"] as Tool[]).map((t) => (
                <button key={t} type="button" className="btn btn-sm" aria-pressed={tool === t} onClick={() => setTool(t)}>
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="swatches" role="group" aria-label="Colours">
              {PALETTE.slice(1).map((c, i) => (
                <button
                  key={c}
                  type="button"
                  className="swatch"
                  style={{ background: c }}
                  aria-label={`Colour ${i + 1}`}
                  aria-pressed={color === i + 1 && tool !== "eraser"}
                  onClick={() => {
                    setColor(i + 1);
                    if (tool === "eraser") setTool("pencil");
                  }}
                />
              ))}
            </div>

            <label className="mirror">
              <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Mirror left and right
            </label>

            <div className="tool-row">
              <button type="button" className="btn btn-sm" onClick={undo}>
                Undo
              </button>
              <button type="button" className="btn btn-sm" onClick={() => replace(toGrid(STARTER))}>
                Start over
              </button>
              <button type="button" className="btn btn-sm" onClick={() => replace(toGrid(BLANK))}>
                Clear
              </button>
            </div>

            <div className="editor-preview">
              <PixelSprite code={valid ? code : STARTER} size={48} />
              <span className="muted">How it looks in the footer</span>
            </div>
          </div>
        </div>

        <div className="editor-actions">
          <button type="button" className="btn btn-primary" onClick={useMine} disabled={!valid}>
            Use as my astronaut
          </button>
          {wallEnabled && (
            <button type="button" className="btn" onClick={send} disabled={!valid || sending}>
              {sending ? "Sending…" : "Send to the moon"}
            </button>
          )}
          {hasMine && (
            <button type="button" className="btn" onClick={removeMine}>
              Remove mine
            </button>
          )}
        </div>
        <p className="editor-note muted" role="status" aria-live="polite">
          {message || (valid ? (wallEnabled ? "Sending puts it on the moon for everyone to see." : "It is saved in your browser only.") : "Add a little more (or a little less) to your drawing.")}
        </p>
        {limited && (
          <ResetLimit
            onDone={(m) => {
              setLimited(false);
              setMessage(m);
            }}
          />
        )}
      </div>
    </dialog>
  );
}
