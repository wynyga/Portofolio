"use client";

import { useState } from "react";

// Shown after a "too many requests" response. Entering the owner's reset PIN clears the limits for this
// visitor only. The PIN is checked on the server (app/api/astronauts/reset/route.ts), not here.
export default function ResetLimit({ onDone }: { onDone: (message: string) => void }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/astronauts/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        setPin("");
        return;
      }
      setPin("");
      onDone("Your limit is reset. You can try again.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="reset-row" onSubmit={submit}>
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Reset PIN"
        aria-label="Reset PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />
      <button type="submit" className="btn btn-sm" disabled={busy || pin === ""}>
        {busy ? "Checking…" : "Reset my limit"}
      </button>
      {error && (
        <span className="muted" role="alert">
          {error}
        </span>
      )}
    </form>
  );
}
