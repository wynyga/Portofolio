import type { Metadata } from "next";
import Moonwalk from "@/components/moon/Moonwalk";
import { LANDMARKS } from "@/lib/moonwalk";
import { profile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Moonwalk",
  description: `Walk across the moon to explore the career of ${profile.name}: each landmark on the lunar plain is a milestone.`,
};

export default function MoonPage() {
  return (
    <main className="mw-page">
      {/* The same journey as plain text, for search engines and screen readers. */}
      <section className="sr-only">
        <h1>Moonwalk: the career of {profile.name}</h1>
        <ol>
          {LANDMARKS.map((l) => (
            <li key={l.id}>
              <h2>
                {l.title} ({l.period})
              </h2>
              {l.role && <p>{l.role}</p>}
              <ul>
                {l.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
      <Moonwalk />
    </main>
  );
}
