import "server-only";

// Storage for visitor-drawn astronauts ("the crew"). Talks to an Upstash Redis database over its REST API
// with plain fetch, so there is no SDK to install. Create one from the Vercel dashboard
// (Storage / Marketplace -> Upstash Redis) and it injects the variables read below.
//
// Without those variables:
//  - in development an in-memory store is used so the feature can be tried locally (it resets on restart);
//  - in production the wall is switched off and the API reports it, because memory on a serverless
//    function would silently lose every submission.

export type CrewItem = { id: string; code: string; at: number };

const URL_ = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const ITEMS = "crew:items";
export const MAX_ITEMS = 300;

const useRedis = Boolean(URL_ && TOKEN);
export const storageEnabled = useRedis || process.env.NODE_ENV !== "production";

async function redis(...args: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (!res.ok || json.error) throw new Error(json.error ?? `Redis request failed (${res.status})`);
  return json.result;
}

// ---- in-memory fallback (development only) ----
const mem = (globalThis as unknown as { __crew?: { items: Map<string, string>; hits: Map<string, { n: number; until: number }> } });
mem.__crew ??= { items: new Map(), hits: new Map() };
const memory = mem.__crew;

export async function listAll(): Promise<CrewItem[]> {
  if (!storageEnabled) return [];
  let raw: string[];
  if (useRedis) {
    const flat = ((await redis("HGETALL", ITEMS)) as string[]) ?? [];
    raw = flat.filter((_, i) => i % 2 === 1);
  } else {
    raw = [...memory.items.values()];
  }
  return raw
    .map((r) => {
      try {
        return JSON.parse(r) as CrewItem;
      } catch {
        return null;
      }
    })
    .filter((x): x is CrewItem => x !== null)
    .sort((a, b) => b.at - a.at);
}

/** Adds a drawing to the wall. Returns "exists" for a duplicate and "full" when the cap is reached. */
export async function addItem(item: CrewItem): Promise<"ok" | "exists" | "full"> {
  const value = JSON.stringify(item);
  if (useRedis) {
    const count = Number(await redis("HLEN", ITEMS));
    if (count >= MAX_ITEMS) return "full";
    const set = Number(await redis("HSETNX", ITEMS, item.id, value));
    return set === 1 ? "ok" : "exists";
  }
  if (memory.items.size >= MAX_ITEMS) return "full";
  if (memory.items.has(item.id)) return "exists";
  memory.items.set(item.id, value);
  return "ok";
}

export async function remove(id: string): Promise<void> {
  if (useRedis) await redis("HDEL", ITEMS, id);
  else memory.items.delete(id);
}

/** Removes every drawing from the wall. */
export async function clearAll(): Promise<void> {
  if (useRedis) await redis("DEL", ITEMS);
  else memory.items.clear();
}

/** Fixed-window rate limit. Returns true while `key` is under `limit` hits per `windowSec`. */
export async function allow(key: string, limit: number, windowSec: number): Promise<boolean> {
  if (useRedis) {
    const k = `crew:rl:${key}`;
    const n = Number(await redis("INCR", k));
    if (n === 1) await redis("EXPIRE", k, windowSec);
    return n <= limit;
  }
  const now = Date.now();
  const entry = memory.hits.get(key);
  if (!entry || entry.until < now) {
    memory.hits.set(key, { n: 1, until: now + windowSec * 1000 });
    return true;
  }
  entry.n += 1;
  return entry.n <= limit;
}

/** Current hit count for `key` without counting a new hit. */
export async function peek(key: string): Promise<number> {
  if (useRedis) return Number((await redis("GET", `crew:rl:${key}`)) ?? 0);
  const entry = memory.hits.get(key);
  return entry && entry.until >= Date.now() ? entry.n : 0;
}

/** Clears the hit counter for `key` (see allow). */
export async function reset(key: string): Promise<void> {
  if (useRedis) await redis("DEL", `crew:rl:${key}`);
  else memory.hits.delete(key);
}
