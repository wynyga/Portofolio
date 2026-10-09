import { createHash, timingSafeEqual } from "node:crypto";
import { allow, peek, reset, storageEnabled } from "@/lib/crew-store";
import { clientId, sameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";

// Lets one visitor clear their own "too many requests" limits by entering the owner's reset PIN.
// It only ever touches the caller's own counters (keyed by a hash of their IP), never anyone else's.
// The PIN is compared here on the server only. It defaults to the value below; set RESET_PIN to use a
// different one without editing code (do that if this repository is public).
const DEFAULT_RESET_PIN = "060012";

const MAX_FAILURES = 6; // wrong guesses allowed per IP...
const LOCKOUT_SEC = 900; // ...every 15 minutes

const digest = (s: string) => createHash("sha256").update(s).digest();

export async function POST(request: Request) {
  if (!storageEnabled) return Response.json({ error: "Nothing to reset right now." }, { status: 503 });
  if (!sameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });

  let pin: unknown;
  try {
    pin = ((await request.json()) as { pin?: unknown }).pin;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof pin !== "string" || pin.length > 64) return Response.json({ error: "Invalid request." }, { status: 400 });

  try {
    const who = clientId(request);
    const failKey = `resetfail:${who}`;
    // Only wrong guesses count. Once locked out, even the right PIN is refused until it expires.
    if ((await peek(failKey)) >= MAX_FAILURES) {
      return Response.json({ error: "Too many wrong attempts. Try again in a few minutes." }, { status: 429 });
    }

    const expected = process.env.RESET_PIN || DEFAULT_RESET_PIN;
    if (!timingSafeEqual(digest(pin), digest(expected))) {
      await allow(failKey, MAX_FAILURES, LOCKOUT_SEC);
      return Response.json({ error: "Wrong PIN." }, { status: 401 });
    }

    // Clears this visitor's send limit and their lockout from wrong owner-PIN attempts.
    await reset(`submit:${who}`);
    await reset(`adminfail:${who}`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
