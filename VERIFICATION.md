# Verification — 30 October 2026

## Build and structural checks

`npm test` passed all seven tests:

- Matching tests cover shortest segment projection, rank changes when a pickup moves, input immutability, endpoint clamping, repeated route points, and stable ties.
- Every generated page has one main heading, one main landmark, unique IDs, and valid local links/anchors.
- All five content routes and the original résumé PDF serve successfully; unknown routes return an actual 404.
- Malformed paths, traversal attempts, and unsupported write methods are rejected by the local preview server.
- LetzGo precedes Popin, there are exactly two featured projects, and missing factual details remain qualified.

`npm run build` generates six HTML pages (including the 404), static assets, robots.txt, and the domain-specific sitemap. The browser uses local ES modules without runtime JavaScript packages. The font is self-hosted with its license.

## Browser verification

Executed `scripts/browser-check.mjs` using the installed Playwright runtime and temporary headless Chrome contexts. Screenshots and machine-readable reports are in the ignored `test-results/` folder.

- Desktop: 1440 × 1000. All pages visually inspected; no horizontal overflow.
- Mobile emulation: 390 × 844 with touch enabled, plus 320 × 760. All routes checked for overflow. Also checked 844 × 390 landscape, where the personal narrative becomes a regular document rather than a pinned scene.
- Personal journey: all three scroll chapters, backward chapter navigation, accessible inactive-state handling, and the layered product illustration checked. Screenshots of the desktop and phone journey were visually inspected; mobile line breaks and scene/control spacing were corrected.
- Reduced-motion and paused modes expose all narrative chapters in ordinary document flow. A no-JavaScript visit also retains the entire personal story.
- Navigation: project links, back links, section anchors, and résumé routes.
- Keyboard: skip link, focused controls, Enter activation, and automatic sequence pausing during focus.
- Pointer: the opening thread responds to the pointer and exposes the person → idea → product story; equivalent buttons support keyboard and touch.
- Touch: viewport selection, slideshow previous/next/pause, project navigation, and routing-detail disclosure.
- Photo visibility: exactly one image displayed; both supplied images decode successfully. A CSS hidden-state conflict was fixed before the final pass.
- Motion: pipeline auto-advances, stops offscreen, and pauses during focused inspection. Global pause persists between pages. System reduced motion disables continuous animations and automatic advancement while preserving manual controls.
- Progressive enhancement: with JavaScript disabled, project text and all delivery-stage explanations remain available; inactive motion controls are hidden.
- Résumé: PDF response and actual download verified, including the expected filename.
- Browser diagnostics: no console errors or uncaught exceptions.
- Animation sample: 90 frame intervals on the opening scene, median and 95th percentile both approximately 16.7 ms, zero observed long tasks. This is a local headless-Chrome smoke check, not a cross-device benchmark.
- Network: no third-party asset requests from the page.

## Limits

- No physical phone, Safari, Firefox, or screen-reader session was available for this pass.
- The supplied public LetzGo and Popin destinations were opened; the EZ-Allocate repository README was retrieved through GitHub. Social links match the résumé, but the web fetch service could not independently retrieve the GitHub and LinkedIn profile pages. Third-party availability remains outside the portfolio’s control.
- Maps and route diagrams are illustrative, not live integrations or executable versions of the production algorithms.
- The résumé does not specify the four LetzGo tier criteria or distance thresholds. The EZ-Allocate write-up does not establish individual feature ownership. Both limits are documented on the relevant case-study pages.
- No deployment, remote push, analytics integration, or external account mutation was performed.

## Reproduce browser checks

Start `npm run dev`, then use an available Playwright installation:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs \
CHROME_PATH='/absolute/path/to/chrome' \
node scripts/browser-check.mjs
```

If Playwright is already resolvable and Chrome is installed, `node scripts/browser-check.mjs` is sufficient. Playwright is only needed for this optional browser check, not to build or serve the portfolio.

## Passenger playground and audio pass

- Verified mouse dragging, immediate ranking changes, keyboard movement/removal/addition, pointer placement, a five-passenger limit, reset, and Escape cancellation.
- Verified Chrome touch events for dragging and tap placement. Fixed a native-pan conflict on SVG pins by preventing the default touch action only when a touch begins on a passenger.
- Checked 320, 390, 768, and 1024px widths for horizontal overflow. Manual matching remains functional with reduced motion.
- Instrumented real Web Audio contexts in Chrome: none created before opt-in; enabling starts the context and synthesized sources; muting suspends it and further interactions create no sounds; new pages remain muted.
- No browser console errors in the playground checks. Reports and screenshots are in `test-results/playground-report.json` and `test-results/matching-*.png`.
- Audio loudness and timbre have not been evaluated on physical speakers/headphones; Safari and physical-device verification remain outstanding.

## Audio audibility correction

The original Popin enable sound measured approximately -53 dBFS RMS in a Chrome analyser: the context was running, but the combination of low gain, filtering, and a fast decay made it difficult to hear. Raised the texture/master levels and added a brief held envelope. The corrected confirmation measured approximately -27 dBFS RMS and -18 dBFS peak. The browser regression now asserts output above -38 dBFS RMS with at least 6 dB peak headroom, rather than only checking that audio sources started. Popin map/stage button activation also produces feedback without requiring pointer movement. Physical speaker/headphone playback remains unverified.
