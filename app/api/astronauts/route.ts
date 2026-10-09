import { createHash } from "node:crypto";
import { isValidCode } from "@/lib/astronaut";
import { addItem, allow, listAll, storageEnabled } from "@/lib/crew-store";
import { clientId, sameOrigin } from "@/lib/request";

export const dynamic = "force-dynamic";

const WALL_SIZE = 80;
const SUBMISSIONS_PER_HOUR = 3;

// The newest astronauts for the public wall. `enabled: false` tells the page to hide the "send" option.
export async function GET() {
  if (!storageEnabled) return Response.json({ enabled: false, items: [] });
  try {
    const items = (await listAll()).slice(0, WALL_SIZE).map(({ id, code }) => ({ id, code }));
    // Not cached, so a new astronaut shows up for everyone straight away.
    return Response.json({ enabled: true, items }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ enabled: false, items: [] });
  }
}

// A visitor submits a drawing. It goes straight onto the wall; the owner can remove it afterwards.
export async function POST(request: Request) {
  if (!storageEnabled) return Response.json({ error: "The wall is offline right now." }, { status: 503 });

  // Only accept submissions made from this site's own pages.
  if (!sameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const text = await request.text();
  if (text.length > 600) return Response.json({ error: "Too large." }, { status: 413 });

  let code: unknown;
  try {
    code = (JSON.parse(text) as { code?: unknown }).code;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isValidCode(code)) return Response.json({ error: "That drawing is not valid." }, { status: 400 });

  try {
    // Visitors are limited by a hash of their IP, so the address itself is never stored.
    if (!(await allow(`submit:${clientId(request)}`, SUBMISSIONS_PER_HOUR, 3600))) {
      return Response.json({ error: "You have sent a few already. Try again in an hour." }, { status: 429 });
    }

    const id = createHash("sha256").update(code).digest("hex").slice(0, 12);
    const result = await addItem({ id, code, at: Date.now() });
    if (result === "full") return Response.json({ error: "The crew is full for now. Please try again later." }, { status: 503 });
    return Response.json({ ok: true }, { status: 202 });
  } catch {
    return Response.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}
