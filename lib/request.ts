import { createHash } from "node:crypto";

// A short hash of the caller's IP, used as the key for per-visitor rate limits. The address itself is never stored.
export function clientId(request: Request): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

// True when the request comes from this site's own pages (or has no Origin header, e.g. curl).
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
