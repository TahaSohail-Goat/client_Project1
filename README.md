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
- `/#work`: all 43 client photographs in a Motion-powered spatial gallery with eight animated arrangements, category filters and a keyboard-accessible lightbox. Drag/swipe, horizontal wheel, keyboard arrows and the on-screen controls navigate photographs. Phones have a compact layout selector; reduced motion uses the ordinary photo grid.
- `/#studio` and `/#expertise`: studio introduction and the two confirmed disciplines.
- `/#contact`: validated inquiry preview until a real destination is configured.
- The scroll-scrubbed hero now uses independent licensed footage, with the client photographs beginning in the next editorial/portfolio chapters. Its own first-frame poster handles media failure and reduced motion. Legacy `/work`, `/studio` and `/contact` paths load the single-page experience for compatibility.

Edit studio identity and approved editorial copy in `src/content/site.ts`; hero film settings are in `src/content/videoHero.ts`. Photo metadata comes from `docs/ASSET_MANIFEST.json` through `src/content/media.ts`. No stock hero footage enters the client portfolio or changes its category counts.

## Inquiry delivery

`site.inquiry.email` enables preparing a draft in the visitor’s email app. This does not claim that a message has been sent. Alternatively, set `site.inquiry.endpoint` to an approved same-origin/HTTPS POST endpoint. The endpoint takes JSON `{name,email,discipline,message,consent:true}` and must return a successful HTTP status with JSON `{ "received": true }` only after genuinely accepting the inquiry. Other responses, network errors and a 15-second timeout display a delivery error.

The frontend contains no receiver, service credentials or server. Implement server-side validation, spam protection, rate limiting and delivery; approve privacy wording before enabling submission. Never put provider API keys in client code. With both values empty, the form makes no request and stores nothing beyond the current page’s memory.

## Assets and delivery

Optimized client photographs and the independent hero edit are served from `public/media`. Original JPEGs, retired hero media and reference recordings remain outside deployment output. Responsive client WebP copies retain source ratios and are never upscaled. Space Grotesk, Instrument Serif Italic and Manrope are bundled locally through Fontsource; see `TYPOGRAPHY_SYSTEM.md`.

Deploy the contents of `dist/` to a static host with SPA fallback for `/work`, `/studio` and `/contact`. `vercel.json` and `public/_redirects` provide common host configurations; no hosting account is connected or deployment performed. The reference video is never used as website footage. `noindex,nofollow` and a disallow-all `robots.txt` remain until branding, publication permission and launch content are approved; update both at launch. Verify host-specific rewrites and response headers before launch.

## Whole-page cinematic experience

The film leads into oversized scroll-linked typography, architectural linework and layered photographic reveals throughout the page. `CinematicHeading` and `DepthPhoto` are reusable components with separate animation ownership: GSAP controls word/mask/image scroll transforms; Motion controls pointer perspective and supporting-copy entrances. The housing model stages a facade approach, lifted roof and overhead interior view, while three physical-model photos receive selective WebGL perspective. The full seven-photo model gallery and all 43 client images remain accessible. Portfolio category controls stay visible while exploring the collection; the contact chapter and oversized eco28 footer finish the same visual language.

`scripts/cinematic-smoke.js` is a Playwright CLI function covering cold section links, reversed word/model animation, lazy model downloads, all filter counts, keyboard navigation, mobile layouts, context loss and reduced motion. `scripts/browser-smoke.js` covers the licensed film and compatibility routes. Run each with an open CLI browser session and the production preview on port 4173, for example `npx --yes --package @playwright/cli playwright-cli -s=qa run-code --filename=scripts/cinematic-smoke.js`. Safari/iPhone hardware checks remain separate from the available Windows WebKit engine testing.

## Animation and verification

GSAP owns scrubbed pins, Motion owns separate editorial/navigation/gallery nodes, and Lenis optionally smooths desktop scroll. Lazy Three.js/R3F/Drei render the housing study and the preserved model-photo planes. Both canvases render on demand; DPR is capped at 1.5 for housing and 1.4 for photographs. Their shared WebGL bundle is fetched only near an eligible model chapter. Mobile uses native scrolling, while reduced motion removes pins and WebGL. See the animation specification for responsive budgets and fallbacks.

See `ANIMATION_SPEC.md`, `ASSET_USAGE.md`, `TYPOGRAPHY_SYSTEM.md` and `CLIENT_ACTION_REQUIRED.md`. Local screenshots and browser evidence are in `output/playwright/` (ignored by Git). The original project brief and implementation blueprint remain in `docs/`; this README describes the current single-page structure.

## Homepage film

The opening is a 29.17-second exterior-to-interior film edited from three related 4K Pexels clips by Rene Strgar. It begins on a glazed stone terrace, moves to the dining/living interior and finishes with a closer living-room view. Two dissolves join the source footage; it is an edited film rather than a single uninterrupted camera flight. No AI generation or paid credits were used. See `docs/HERO_MEDIA_SOURCES.md` for sources, rights and rebuilding.

`public/media/hero-film/` contains a 1920x1080 desktop film (20,802,082 bytes), 960x540 mobile film (7,904,981 bytes), and first-frame poster. Both films are silent H.264 at 24fps, with front-loaded MP4 indexes and keyframes every 6/4 frames respectively. The previous client-based hero is preserved in `references/retired_hero/` and excluded from production. Client photographs remain in the 43-image portfolio.

GSAP pins `.hero-sequence` for 9.6 desktop / 6.8 mobile viewports. Its first 82% scrubs the independent film; the final 18% reveals the separate ivory editorial chapter with client imagery. `.video-hero` contains only the licensed film, its poster and selectable typography. `useVideoScrub` coalesces paused frame-accurate seeks and never calls `play()`. Lenis shares the GSAP ticker on desktop; touch uses native document scrolling. Reduced motion, Save-Data, short screens and failed video loading retain the independent poster, navigation and next editorial chapter.

Run the production preview, then the repository smoke test with Playwright CLI:

```sh
npx --yes --package @playwright/cli playwright-cli -s=studio open http://127.0.0.1:4173/
npx --yes --package @playwright/cli playwright-cli -s=studio run-code --filename=scripts/browser-smoke.js
```

Chrome and WebKit are the available local test targets. WebKit coverage does not substitute for actual Safari/iPhone hardware validation. The deployment host must preserve `video/mp4` and HTTP byte-range responses for scrubbing; the local production preview returns `206 Partial Content` for range requests.
