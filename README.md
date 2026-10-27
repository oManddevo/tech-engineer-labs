# tech-engineer-labs — portfolio

Source for https://tech-engineer-labs.vercel.app/, rebuilt from the deployed bundle after the original source was lost.
Vite + React 18 + Tailwind CSS 3, with a three.js particle hero (@react-three/fiber + postprocessing bloom) and GSAP animations.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
```

## Editing content

With `npm run dev` running, open http://localhost:5173/edit to change the links (email, WhatsApp, LinkedIn, GitHub),
job title and specialties, hero headline and subtitle, About summary, skill cards, and the Feedback section.
Saving writes `src/data/site.json` and the site updates right away; commit and deploy that file to publish the changes.

The editor only exists in development: its page is left out of `npm run build`, and the save endpoint (`/__site`,
defined in `vite.config.js`) is part of the dev server, accepts requests from this machine only, and validates the
content with `src/data/validateSite.js` before writing.

## Where things live

| What | File |
| --- | --- |
| Editable content (links, job title, hero text, summary, skills, feedback) | `src/data/site.json` (edit at `/edit`) |
| Social link icons built from that content | `src/data/contact.js` |
| Icons available to skill cards | `src/data/skillIcons.js` |
| Project cards | `src/data/projects.js` |
| About layout, team note and stats | `src/components/About.jsx` |
| Tech stack cards | `src/components/Technology.jsx` |
| Feedback (team collaboration highlights + testimonials) | `src/components/Feedback.jsx` |
| Hero (particle name, rotating specialties, headline + buttons, side social links) | `src/components/Hero.jsx`, `src/components/ParticleText.jsx` |
| Hero overlay and desktop nav styles | `public/assets/reference-home.css` (loaded from `index.html`) |
| Content editor | `src/editor/Editor.jsx` |
| Images | `public/images/` |

## Deploy (Vercel)

Import the repository in Vercel with the default Vite settings (build `npm run build`, output `dist`).

## Notes from the restore

- Two components that existed in the old source but were never rendered (a contact form with a budget slider,
  and a floating icon button) could not be recovered: the build had already dropped their code, only their CSS remained.
- `src/components/VisitorTracker.jsx` posts to `/api/visitor`, but the live deployment has no such function (404).
- `/about` and `/portfolio` redirect inside the app only; the live site has no SPA rewrite, so opening them directly returns 404.
