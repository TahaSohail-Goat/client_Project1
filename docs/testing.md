# Testing

## Build checks

```sh
npm ci
npm run check
```

`check` runs ESLint, then TypeScript and the Vite production build. Preview the resulting `dist/` before browser testing:

```sh
npm run preview
```

The expected preview origin is `http://127.0.0.1:4173`. Most browser checks intentionally target that origin. If Windows is short of memory, close other browser sessions and set `NODE_OPTIONS=--max-old-space-size=1024 --max-semi-space-size=16` for the build process.

## Browser checks

The scripts in `tests/browser/` are async Playwright CLI functions, run from the repository root. The CLI and axe-core are local development dependencies; no machine-specific npm-cache paths are required.

```sh
npm run browser -- -s=qa open http://127.0.0.1:4173/
npm run browser -- -s=qa run-code --filename=tests/browser/residence-smoke.js
npm run browser -- -s=qa run-code --filename=tests/browser/cinematic-smoke.js
npm run browser -- -s=qa close
```

Use one browser session at a time for graphics-heavy checks. Ensure the selected browser is installed; the CLI supports Chrome, Firefox, and WebKit. Screenshots and downloads are written to ignored `output/playwright/`.

| Area | Scripts in `tests/browser/` |
| --- | --- |
| Hero and whole-page motion | `residence-smoke.js`, `cinematic-smoke.js` |
| Section controls and graphics recovery | `scene-controls-smoke.js`, `exterior-ready-smoke.js`, `fallback-smoke.js` |
| Portfolio and photo dialog | `spatial-gallery-smoke.js`, `gallery-controls-smoke.js`, `gallery-position-smoke.js`, `photo-collection-smoke.js` |
| Navigation, routes, and content links | `navigation-smoke.js`, `routing-edge-smoke.js`, `site-links-smoke.js` |
| Responsive, accessibility, and touch | `responsive-smoke.js`, `accessibility-smoke.js`, `touch-gallery-smoke.js` |
| Contact and footer | `contact-footer-smoke.js`, `contact-footer-motion-smoke.js` |
| Approach and consultation | `approach-smoke.js`, `consultation-smoke.js` |
| WebKit core compatibility | `browser-compat-smoke.js` |

`accessibility-smoke.js` loads axe-core from `node_modules/axe-core/axe.min.js` and fails on reported WCAG A/AA violations. Review incomplete/manual checks separately. For another browser, open a fresh session with `--browser=firefox` or `--browser=webkit` and run the relevant scripts.

## Optional delivery endpoint

`inquiry-delivery-smoke.js` requires a separate temporary Vite server on port 5188, compiled with `VITE_INQUIRY_ENDPOINT=/__qa/inquiry`. In PowerShell:

```powershell
$env:VITE_INQUIRY_ENDPOINT = '/__qa/inquiry'
npm run dev -- --port 5188 --strictPort
```

Run this script in a separate terminal/browser session:

```sh
npm run browser -- -s=delivery open http://127.0.0.1:5188/
npm run browser -- -s=delivery run-code --filename=tests/browser/inquiry-delivery-smoke.js
npm run browser -- -s=delivery close
```

All submissions are intercepted by the browser script. It covers confirmed receipt, missing confirmation, invalid JSON, HTTP failures, duplicate submissions, timeout, and input preservation. Stop the temporary server and remove its environment setting afterward.

See [the QA report](qa-report.md) for the previously completed 21-suite review, browser coverage, and physical-device/delivery limitations. Re-run checks appropriate to the change; an old report alone does not verify a new build.
