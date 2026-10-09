import EarthButton from "./EarthButton";
import MoonRocket from "./MoonRocket";
import MoonCrew from "./MoonCrew";

// Footer scenery: a cratered lunar plain with a planted flag, Earth in the sky, a little rocket you can
// launch and the crew of tiny astronauts you can pick up. The scenery is decorative; the toys are
// interactive client components, with their motion styles in globals.css.
export default function MoonSurface() {
  return (
    <div className="moon-scene">
      <EarthButton />

      <div className="moon-ground" aria-hidden="true">
        <span className="crater c1" />
        <span className="crater c2" />
        <span className="crater c3" />
        <span className="crater c4" />
        <span className="crater c5" />
        <span className="rock r1" />
        <span className="rock r2" />
        <span className="rock r3" />
      </div>

      {/* Flags on the moon are held out by a horizontal rod, since there is no wind to wave them. */}
      <svg className="moon-flag" viewBox="0 0 40 56" aria-hidden="true">
        <path d="M6 54V4" stroke="#d8dcee" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 5h30" stroke="#d8dcee" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="7" y="6.5" width="28" height="9" fill="#e11d2e" />
        <rect x="7" y="15.5" width="28" height="9" fill="#f4f6fc" />
        <ellipse cx="6" cy="54.5" rx="6" ry="1.6" fill="#000" fillOpacity="0.35" />
      </svg>

      <MoonRocket />
      <MoonCrew />
    </div>
  );
}
