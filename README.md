# Architecture & Interior Design Studio Portfolio

A single-page eco28 architecture and interior design portfolio built with React, TypeScript and Vite. Runtime sections live in `src/components/sections`; cinematic chapters live in `src/components/home`. Optimized client images have one canonical location in `public/media`, with unique original masters retained separately.

## Run

Requires Node.js 22.12+ (validated with Node 24.13.0).

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

Development: `http://127.0.0.1:5173`. Production preview: `http://127.0.0.1:4173`.

## Pages and content

The eco28 experience is a single continuous page at `/`, with anchor navigation:

- `/#housing`: scroll-pinned procedural courtyard-house study with reversible orbit, roof lift and interior reveal. It is labelled conceptual geometry, not a client project. Small screens use an unpinned sequence; reduced motion or unavailable WebGL shows an SVG fallback.
- `/#work`: all 43 client photographs, category filters and a keyboard-accessible lightbox.
- `/#studio` and `/#expertise`: studio introduction and the two confirmed disciplines.
- `/#contact`: validated inquiry preview until a real destination is configured.
- The scroll-scrubbed video hero, interiors, materials, physical-model photographs and editorial chapters remain part of the same page. The original photographic hero is retained as the film-loading/decoding failure fallback. Legacy `/work`, `/studio` and `/contact` paths load the single-page experience for compatibility.

Edit studio identity and approved editorial copy in `src/content/site.ts`; opening chapter labels/bookmarks are in `src/content/hero.ts`. Photo metadata comes from `docs/ASSET_MANIFEST.json` through `src/content/media.ts`. Photos are not assigned to projects. Detail pages, team biographies, locations, awards and unconfirmed services are intentionally deferred.

## Inquiry delivery

`site.inquiry.email` enables preparing a draft in the visitor’s email app. This does not claim that a message has been sent. Alternatively, set `site.inquiry.endpoint` to an approved same-origin/HTTPS POST endpoint. The endpoint takes JSON `{name,email,discipline,message,consent:true}` and must return a successful HTTP status with JSON `{ "received": true }` only after genuinely accepting the inquiry. Other responses, network errors and a 15-second timeout display a delivery error.

The frontend contains no receiver, service credentials or server. Implement server-side validation, spam protection, rate limiting and delivery; approve privacy wording before enabling submission. Never put provider API keys in client code. With both values empty, the form makes no request and stores nothing beyond the current page’s memory.

## Assets and delivery

Optimized photographs and the supplied hero film are served from `public/media`. Original JPEGs and the motion-reference MP4 stay outside the deployment output. Responsive 480px and 768px WebP copies retain the source ratio and are never upscaled. Hero/facade and lightbox use full supplied WebP resolution. Space Grotesk, Instrument Serif Italic and Manrope are bundled locally through Fontsource; see `TYPOGRAPHY_SYSTEM.md`.

Deploy the contents of `dist/` to a static host with SPA fallback for `/work`, `/studio` and `/contact`. `vercel.json` and `public/_redirects` provide common host configurations; no hosting account is connected or deployment performed. The reference video is never used as website footage. `noindex,nofollow` and a disallow-all `robots.txt` remain until branding, publication permission and launch content are approved; update both at launch. Verify host-specific rewrites and response headers before launch.

## Whole-page cinematic experience

The film leads into oversized scroll-linked typography, architectural linework and layered photographic reveals throughout the page. `CinematicHeading` and `DepthPhoto` are reusable components with separate animation ownership: GSAP controls word/mask/image scroll transforms; Motion controls pointer perspective and supporting-copy entrances. The housing model stages a facade approach, lifted roof and overhead interior view, while three physical-model photos receive selective WebGL perspective. The full seven-photo model gallery and all 43 client images remain accessible. Portfolio category controls stay visible while exploring the collection; the contact chapter and oversized eco28 footer finish the same visual language.

`scripts/cinematic-smoke.js` is a Playwright CLI function covering cold section links, reversed word/model animation, lazy model downloads, all filter counts, keyboard navigation, mobile layouts, context loss and reduced motion. `scripts/browser-smoke.js` covers the supplied film and compatibility routes. Run each with an open CLI browser session and the production preview on port 4173, for example `npx --yes --package @playwright/cli playwright-cli -s=qa run-code --filename=scripts/cinematic-smoke.js`. Safari/iPhone hardware checks remain separate from the available Windows WebKit engine testing.

## Animation and verification

GSAP owns scrubbed pins, Motion owns separate editorial/navigation/gallery nodes, and Lenis optionally smooths desktop scroll. Lazy Three.js/R3F/Drei render the housing study and the preserved model-photo planes. Both canvases render on demand; DPR is capped at 1.5 for housing and 1.4 for photographs. Their shared WebGL bundle is fetched only near an eligible model chapter. Mobile uses native scrolling, while reduced motion removes pins and WebGL. See the animation specification for responsive budgets and fallbacks.

See `ANIMATION_SPEC.md`, `ASSET_USAGE.md`, `TYPOGRAPHY_SYSTEM.md` and `CLIENT_ACTION_REQUIRED.md`. Local screenshots and browser evidence are in `output/playwright/` (ignored by Git). The original project brief and implementation blueprint remain in `docs/`; this README describes the current single-page structure.

## Homepage film

The “Space. Light. / A way of living.” finale now uses a shared 3D editorial choreography: perspective typography, a forward-swinging photo board, two separated backing planes, drawing-line reveals and fine-pointer tilt. It remains inside the hero's single pin. The extended 7.2/5.1-viewport scroll budget preserves the film's opening timing, then gives the photo sequence room to unfold and settle. The supplied photograph and all text remain normal accessible DOM; the effect adds no WebGL download to the opening. Small screens use lighter angles, and reduced motion shows a static composition. Validate the sequence with `scripts/vision-depth-smoke.js` through Playwright CLI.

`public/media/video/hero_exterior_to_interior_scrub.mp4` is the supplied 8-second, 1280×720, 24fps H.264 film, preserved unchanged with its existing all-intra frames and front-loaded MP4 index. The 768×432 mobile encode retains all-intra seeking, and the first-frame WebP poster loads immediately. This film is distinct from the older reference screen recordings.

GSAP drives a single normalized scroll playhead and the HTML typography/panel timeline. `src/hooks/useVideoScrub.ts` maps it to paused `currentTime`, quantizes to source frames and coalesces seeks until the decoder is ready. It never calls `play()` or enables autoplay. Lenis uses the existing shared GSAP ticker and ScrollTrigger notifications; touch uses native document scroll. Reduced motion, Save-Data and very short screens show the poster and editorial content without fetching the film or adding a hero pin. Loading and failed-media states keep content accessible.

Run the production preview, then the repository smoke test with Playwright CLI:

```sh
npx --yes --package @playwright/cli playwright-cli -s=studio open http://127.0.0.1:4173/
npx --yes --package @playwright/cli playwright-cli -s=studio run-code --filename=scripts/browser-smoke.js
```

Chrome and WebKit are the available local test targets. WebKit coverage does not substitute for actual Safari/iPhone hardware validation. The deployment host must preserve `video/mp4` and HTTP byte-range responses for scrubbing; the local production preview returns `206 Partial Content` for range requests.
