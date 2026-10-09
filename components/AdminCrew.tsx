"use client";

import { useState } from "react";
import PixelSprite from "./PixelSprite";

type Item = { id: string; code: string; at: number };

// Owner-only moderation view. The key is the ADMIN_KEY environment variable; it is kept in memory only.
export default function AdminCrew() {
  const [key, setKey] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");

  async function call(init?: RequestInit) {
    const res = await fetch("/api/admin/astronauts", { ...init, headers: { "x-admin-key": key, "Content-Type": "application/json" } });
    const data = (await res.json().catch(() => ({}))) as { error?: string; items?: Item[] };
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data;
  }

  async function load() {
    setError("");
    try {
      setItems((await call()).items ?? []);
    } catch (e) {
      setItems(null);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function act(body: { action: "delete"; id: string } | { action: "wipe" }) {
    setError("");
    try {
      await call({ method: "POST", body: JSON.stringify(body) });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="wrap admin">
      <h1 className="contact-lede">Crew moderation</h1>
      <form
        className="admin-key"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <label className="sr-only" htmlFor="admin-key">
          Admin key
        </label>
        <input id="admin-key" type="password" autoComplete="off" placeholder="Admin key" value={key} onChange={(e) => setKey(e.target.value)} />
        <button type="submit" className="btn btn-primary btn-sm">
          Load
        </button>
      </form>
      {error && <p className="note" role="alert">{error}</p>}

      {items && (
        <>
          <h2 className="mono admin-h">On the wall ({items.length})</h2>
          <ul className="admin-list">
            {items.map((i) => (
              <li key={i.id}>
                <PixelSprite code={i.code} size={96} />
                <div className="admin-actions">
                  <button type="button" className="btn btn-sm" onClick={() => act({ action: "delete", id: i.id })}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {items.length === 0 && <p className="note">The wall is empty.</p>}
          {items.length > 0 && (
            <div className="hero-actions">
              <button type="button" className="btn btn-sm" onClick={() => act({ action: "wipe" })}>
                Wipe everything
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
