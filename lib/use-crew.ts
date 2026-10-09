import { useEffect, useState } from "react";
import { REFRESH_EVENT } from "./astronaut";

export type Member = { id: string; code: string };
export type CrewData = { enabled: boolean; items: Member[] };

const OFFLINE: CrewData = { enabled: false, items: [] };

// Components that mount together share one request instead of each fetching the wall.
let inflight: Promise<CrewData> | null = null;

function fetchCrew(): Promise<CrewData> {
  if (!inflight) {
    inflight = fetch("/api/astronauts", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<CrewData>) : OFFLINE))
      .catch(() => OFFLINE)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// The wall's astronauts, or null until the first response. Reloads when something fires REFRESH_EVENT
// (a visitor sent a drawing, or the owner wiped the wall).
export function useCrew(): CrewData | null {
  const [data, setData] = useState<CrewData | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetchCrew().then((d) => {
        if (alive) setData(d);
      });
    };
    load();
    window.addEventListener(REFRESH_EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(REFRESH_EVENT, load);
    };
  }, []);

  return data;
}
