"use client";

import { useRef, useState } from "react";
import { REFRESH_EVENT } from "@/lib/astronaut";
import ResetLimit from "./ResetLimit";

// The little Earth in the footer sky. It looks decorative, but clicking it asks for the owner's PIN and
// then wipes every astronaut from the wall. The PIN is checked by the server (see
// app/api/admin/astronauts/route.ts), never in this file, so reading the page source does not reveal it.
export default function EarthButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [limited, setLimited] = useState(false);

  function show() {
    setPin("");
    setMessage("");
    setLimited(false);
    dialogRef.current?.showModal();
  }

  function hide() {
    setPin("");
    dialogRef.current?.close();
  }

  async function wipe(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/astronauts", {
        method: "POST",
        headers: { "x-admin-key": pin, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "wipe" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMessage(data.error ?? `Request failed (${res.status})`);
        setLimited(res.status === 429);
        setPin("");
        return;
      }
      window.dispatchEvent(new Event(REFRESH_EVENT));
      hide();
    } catch {
      setMessage("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="earth" onClick={show} aria-label="Earth" tabIndex={-1} />
      <dialog ref={dialogRef} className="editor wipe" onClick={(e) => e.target === e.currentTarget && hide()} aria-labelledby="wipe-title">
        <form className="editor-body" onSubmit={wipe}>
          <h3 id="wipe-title" className="wipe-title">
            Wipe the wall?
          </h3>
          <p className="note">This removes every astronaut on the wall for everyone. Enter the PIN to continue.</p>
          <input
            className="wipe-key"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            placeholder="PIN"
            aria-label="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <div className="editor-actions">
            <button type="submit" className="btn btn-primary" disabled={busy || pin === ""}>
              {busy ? "Wiping…" : "Wipe everything"}
            </button>
            <button type="button" className="btn" onClick={hide}>
              Cancel
            </button>
          </div>
          <p className="editor-note muted" role="alert">
            {message}
          </p>
        </form>
        {limited && (
          <div className="editor-body">
            <ResetLimit
              onDone={(m) => {
                setLimited(false);
                setMessage(m);
              }}
            />
          </div>
        )}
      </dialog>
    </>
  );
}
