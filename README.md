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
