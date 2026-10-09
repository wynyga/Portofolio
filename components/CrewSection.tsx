"use client";

import { useState } from "react";
import { REFRESH_EVENT } from "@/lib/astronaut";
import { useCrew } from "@/lib/use-crew";
import CrewEditor from "./CrewEditor";

// The "Crew" section: opens the astronaut editor. The astronauts themselves jog on the moon in the footer
// (see MoonCrew.tsx), and a newly sent one shows up there straight away.
export default function CrewSection() {
  const [open, setOpen] = useState(false);
  const enabled = useCrew()?.enabled ?? false;

  return (
    <div className="crew">
      <p className="contact-lede">Leave your own astronaut behind.</p>
      <p className="note">
        Draw a tiny astronaut. It becomes the one jogging on the moon at the bottom of this page
        {enabled ? ", and if you send it to the moon it joins the crew there for everyone to see. You can pick any of them up." : "."}
      </p>
      <div className="hero-actions">
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          Draw your astronaut
        </button>
      </div>

      <CrewEditor
        open={open}
        onClose={() => setOpen(false)}
        wallEnabled={enabled}
        onSent={() => window.dispatchEvent(new Event(REFRESH_EVENT))}
      />
    </div>
  );
}
