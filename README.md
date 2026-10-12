# Chirag Aggarwal — Portfolio

Live website: https://chiragaggarwal.cloud

Plain HTML, CSS, and JavaScript; no framework, dependency installation, or build step.

## Pages

- `index.html`: homepage, experience, recognition, and contact details.
- `letzgo.html`: LetzGo (2025).
- `popin.html`: Popin (July 2025–February 2026).
- `ez-allocate.html`: EZ-Allocate (2023).

## Local preview

Run `python3 -m http.server 8000` from this directory and open http://localhost:8000.

## Assets pending approval

This source upload excludes `resume.pdf`, `assets/hackathon-award.png`, and `assets/hackathon-group.png` pending explicit approval to publish them in this public repository. The HTML references are retained, but those downloads/images will be unavailable in a checkout until the assets are added. The existing live Vercel deployment includes them and is unchanged.

## Vercel

`vercel.json` configures this as a static site. The existing project is `chirag-portfolio`. GitHub auto-deployment has not been connected. Add the pending assets before deploying this checkout or connecting it to production.

## Analytics

Every HTML page includes Vercel Web Analytics. The `/_vercel/insights/script.js` endpoint is provided by Vercel; it will not exist on the basic local server.
