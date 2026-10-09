import { createHash, timingSafeEqual } from "node:crypto";
import { allow, clearAll, listAll, peek, remove, storageEnabled } from "@/lib/crew-store";
import { clientId } from "@/lib/request";

export const dynamic = "force-dynamic";

const digest = (s: string) => createHash("sha256").update(s).digest();

// Owner-only moderation. Requests send the owner's PIN in an `x-admin-key` header.
// The PIN is compared here on the server only and is never sent to the browser. It defaults to the value
// below; set the ADMIN_KEY environment variable to use a different one without touching the code.
const DEFAULT_PIN = "5798";

const MAX_FAILURES = 6; // wrong guesses allowed per IP...
const LOCKOUT_SEC = 900; // ...every 15 minutes

async function authorize(request: Request): Promise<Response | null> {
  if (!storageEnabled) return Response.json({ error: "Storage is not configured." }, { status: 503 });
  const expected = process.env.ADMIN_KEY || DEFAULT_PIN;

  // Only wrong guesses count. Once an IP is locked out, even the right PIN is refused until it expires.
  const who = `adminfail:${clientId(request)}`;
  if ((await peek(who)) >= MAX_FAILURES) {
    return Response.json({ error: "Too many wrong attempts. Try again in a few minutes." }, { status: 429 });
  }

  const given = request.headers.get("x-admin-key") ?? "";
  if (!timingSafeEqual(digest(given), digest(expected))) {
    await allow(who, MAX_FAILURES, LOCKOUT_SEC);
    return Response.json({ error: "Wrong PIN." }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;
  return Response.json({ items: await listAll() });
}

export async function POST(request: Request) {
  const denied = await authorize(request);
  if (denied) return denied;

  let body: { id?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { id, action } = body;

  if (action === "wipe") {
    await clearAll();
    return Response.json({ ok: true });
  }
  if (action === "delete") {
    if (typeof id !== "string" || !/^[0-9a-f]{12}$/.test(id)) return Response.json({ error: "Invalid id." }, { status: 400 });
    await remove(id);
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Unknown action." }, { status: 400 });
}
