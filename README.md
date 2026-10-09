# Portfolio

Personal portfolio for Wayan Candra Yoga Kamandanu. Next.js (App Router) + TypeScript, plain CSS, fully static.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Edit the content

All copy (profile, case studies, experience, projects, skills) lives in [`lib/content.ts`](lib/content.ts).
Components only render it, so you rarely need to touch anything else.

- **CV button:** put the PDF in `public/` and set `cvUrl` in `lib/content.ts`. It is empty by default because the CV contains a phone number.
- **Colours / fonts:** design tokens are at the top of [`app/globals.css`](app/globals.css); fonts are set in [`app/layout.tsx`](app/layout.tsx).

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project**, import the repo. The Next.js preset needs no settings.
3. After the first deploy, add an environment variable `NEXT_PUBLIC_SITE_URL` set to your final URL (for example `https://your-name.vercel.app` or your custom domain) and redeploy. It is used for social-share metadata, `robots.txt` and `sitemap.xml`.

## Crew wall (visitor-drawn astronauts)

Visitors can draw a 16x16 pixel astronaut in the **Crew** section.

- **Without a database:** the drawing is saved in the visitor's own browser and replaces the jogging astronaut in the footer. Nothing is sent anywhere.
- **With a database:** a "Send to the moon" button appears. Sent astronauts join the crew jogging on the footer moon straight away for everyone (a random handful at a time, and every one can be picked up and tossed). There is no approval step.

### Turn on the wall

1. In Vercel: **Storage / Marketplace → Upstash Redis → create a database** and connect it to this project. Vercel adds `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or the older `KV_REST_API_*` names) for you.
2. Redeploy.

### Clean up the crew

- **Wipe everything (the whole crew):** click the little **Earth** in the footer, enter the PIN, confirm.
- **Remove single drawings:** open `/admin/crew` and enter the same PIN.

The PIN is checked on the server only (`app/api/admin/astronauts/route.ts`), so it never appears in the browser bundle. It defaults to the value in that file; to change it without editing code, set an `ADMIN_KEY` environment variable in Vercel. If this repository is public, set `ADMIN_KEY`, because the default is visible in the source.

Wrong PINs lock an IP out for 15 minutes after 6 attempts.

### Reset someone's "too many requests"

Sending is limited to 3 drawings per hour per visitor. A visitor who hits the limit (or is locked out by wrong owner PINs) sees a small **Reset PIN** field; entering `060012` clears the limits for that visitor only, never for anyone else. Like the other PIN it is checked on the server (`app/api/astronauts/reset/route.ts`), defaults to that value, and can be changed with a `RESET_PIN` environment variable (do that if this repository is public). Wrong reset PINs are locked out after 6 attempts per 15 minutes.

### Safeguards

Because astronauts go live immediately, anything drawn can be seen by every visitor. Safeguards: drawings are validated (16x16, fixed palette, not empty or a solid block), limited to 3 per hour per visitor (a hash of the IP is used, never the address itself), only accepted from this site's own origin, and the wall stores at most 300 drawings (wipe it to make room).

### Try it locally

`npm run dev` uses an in-memory store when no database is configured, so the whole flow works locally (it resets when the server restarts); the default PIN works too. To test against a real Redis, put the two `UPSTASH_REDIS_REST_*` values in `.env.local`.
