# Chirag Aggarwal — Inside the systems

A personal, monochrome journey through Chirag’s motivation and work. The opening introduces him by name; a native-scroll sequence unfolds a product into experience, logic, and delivery, then brings it back together. Two featured projects, a quieter EZ-Allocate case study, professional experience, a large award-photo slideshow, contact links, and the original résumé complete the story.

## Run locally

Requires Node.js 20 or later. No package installation or production dependencies.

```sh
npm run dev
```

Open http://127.0.0.1:4173. The command builds the site and serves it locally. After source edits, run `npm run build` in another terminal and refresh the browser. `PORT=5000 npm run dev` selects another port.

```sh
npm run build
npm test
```

`dist/` is the deployable static output. No deployment or push has been performed. A future host should serve directory `index.html` files and use `404.html` for missing routes. Canonical URLs and the sitemap use https://chiragaggarwal.cloud.

## Edit

- `src/pages.mjs`: copy, shared navigation/footer, and page composition.
- `src/journey.mjs`: personal opening, three-part narrative, and layered product illustration.
- `src/scenes.mjs`: accessible project SVG illustrations and delivery-stage explanations.
- `src/experience.css`: cinematic homepage compositions and responsive narrative layouts.
- `src/styles.css`: responsive design, typography, print styles, and motion preferences.
- `src/client.js`: pointer/keyboard controls, scene timers, slideshow, and motion state.
- `src/match-demo.js` and `src/matching.js`: passenger placement, drag/keyboard handling, and the illustrative geometric ranking.
- `src/sketch-audio.js`: temporarily disabled sketchbook audio, retained for later use.
- `assets/`: résumé, favicon, and compressed versions of the supplied photos.

All meaningful text and navigation are rendered into HTML. JavaScript progressively enhances the scenes. Native scrolling remains intact. Continuous loops pause offscreen, in hidden tabs, and when motion is disabled. System reduced-motion preferences take precedence over the saved motion setting. Keyboard focus pauses automatic stage changes while visitors inspect controls. The personal narrative uses native scrolling and optional chapter buttons. Paused motion, reduced motion, short screens, and no-JavaScript mode expose the whole narrative as ordinary readable content.

## Content sources and open details

- `chirag_resume.pdf` supplied by the user: professional roles, skills, project contributions, and reported metrics. The original file is served without modifications.
- User brief: project dates, domain, award/team context, and creative direction.
- The supplied EZ-Allocate write-up: team project architecture, allocation constraints, and asynchronous exports. The public repository README was also checked.
- Supplied award photos: displayed only in the homepage slideshow. Original attachments are unchanged; web copies are JPEGs.
- User clarification: LetzGo and Popin use the résumé as their source of truth; EZ-Allocate is not a featured visual project.
- User’s personal motivation: admiration for engineers and a wish to make something with real-world impact that people actually use. This now anchors the opening and About section.

The résumé does not give names or distance thresholds for the four LetzGo tiers. The route scene explicitly identifies itself as conceptual and avoids inventing them. Reported load-test results are qualified rather than presented as universal production guarantees. Popin events are clearly illustrative. EZ-Allocate individual feature ownership is unconfirmed and is described as team work. Confirmed personal contributions can be added later.

The site preserves Vercel Web Analytics and has no remote font requests, live map API or runtime JavaScript dependencies. A compact, locally hosted Caveat font supplies handwritten annotations; its SIL Open Font License is included in `assets/Caveat-OFL.txt`. Contact uses email and verified résumé social links.

## Verification

`npm test` checks generated-page structure, every local link and anchor, résumé serving, real 404s, and preview-server path validation. Browser QA covers desktop/mobile layout and interactive behavior; see `VERIFICATION.md` for the completed checks and limits.

## Try the sketchbook interactions

On the homepage or LetzGo case study, drag the numbered passenger pins to see the pickup ranking change. `+ Passenger` lets mouse/touch visitors place a pickup on the map; keyboard activation adds a focused pin. Arrow keys move a pin, Shift makes larger steps, Delete removes it, and Escape cancels a drag or placement. Up to five passengers can be placed; Reset restores the original three. All passengers share destination B.

The ranking is an educational distance-to-route sketch, not LetzGo’s production matching algorithm. It projects pickups onto sampled segments of the drawn route and sorts by shortest straight-line distance, with passenger ID breaking ties. It does not calculate road-network detours, direction, or travel time.

Sketchbook audio is temporarily disabled. Its source and commented integration points are retained for later.

`node scripts/playground-check.mjs` uses the same optional Playwright/Chrome environment variables as the main browser check. It covers mouse and touch dragging, placement, keyboard movement/removal, reset, limits, cancellation, and confirms the site does not create an audio context.

## Private notes

The contact form sends messages to the portfolio email through FormSubmit, with its default spam protection. The first submission triggers a confirmation email; open its activation link before relying on the form. Visitor name and reply email are optional. Successful submissions return to `/thank-you/`. The existing email link remains available.

## Portfolio field guide

The sitewide guide sends questions to `/api/chat`. Vercel needs `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN` (read-only), `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN`. The function uses Gemma 4 to stream answers from the `field-guide-v2` namespace. The original JSON endpoint continues to read the `letzgo` namespace.

Keep the case studies and the résumé text in the Git-ignored `rag/sources/` directory. Generate the Upstash request body with `node rag/chunk.mjs rag/sources/popin.md popin`. Use `letzgo`, `popin`, or `resume` to select the document and upload its generated chunks to `/upsert-data/field-guide-v2`. After verifying a replacement, remove leftover IDs for that document beyond its new chunk count. The résumé text starts at its Summary section so contact details stay out of retrieval.

Refresh the public portfolio text with `npm run build && python3 rag/site-text.py > rag/sources/site.md`. Generate its chunks with `node rag/chunk.mjs rag/sources/site.md site` and upload them to the same preview namespace. The extractor reads the homepage and the project stories. The résumé comes from its separately extracted PDF text.
