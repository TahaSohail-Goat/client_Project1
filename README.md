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
- The photographic hero, interiors, materials, physical-model photographs and editorial chapters remain part of the same page. Legacy `/work`, `/studio` and `/contact` paths load the single-page experience for compatibility.

Edit studio identity and approved editorial copy in `src/content/site.ts`; opening chapter labels/bookmarks are in `src/content/hero.ts`. Photo metadata comes from `docs/ASSET_MANIFEST.json` through `src/content/media.ts`. Photos are not assigned to projects. Detail pages, team biographies, locations, awards and unconfirmed services are intentionally deferred.

## Inquiry delivery

`site.inquiry.email` enables preparing a draft in the visitor’s email app. This does not claim that a message has been sent. Alternatively, set `site.inquiry.endpoint` to an approved same-origin/HTTPS POST endpoint. The endpoint takes JSON `{name,email,discipline,message,consent:true}` and must return a successful HTTP status with JSON `{ "received": true }` only after genuinely accepting the inquiry. Other responses, network errors and a 15-second timeout display a delivery error.

The frontend contains no receiver, service credentials or server. Implement server-side validation, spam protection, rate limiting and delivery; approve privacy wording before enabling submission. Never put provider API keys in client code. With both values empty, the form makes no request and stores nothing beyond the current page’s memory.

## Assets and delivery

Only `public/media/*.webp` is published. Original JPEGs and the motion-reference MP4 stay outside the deployment output. Responsive 480px and 768px WebP copies retain the source ratio and are never upscaled. Hero/facade and lightbox use full supplied WebP resolution. Space Grotesk, Instrument Serif Italic and Manrope are bundled locally through Fontsource; see `TYPOGRAPHY_SYSTEM.md`.

Deploy the contents of `dist/` to a static host with SPA fallback for `/work`, `/studio` and `/contact`. `vercel.json` and `public/_redirects` provide common host configurations; no hosting account is connected or deployment performed. The reference video is never used as website footage. `noindex,nofollow` and a disallow-all `robots.txt` remain until branding, publication permission and launch content are approved; update both at launch. Verify host-specific rewrites and response headers before launch.

## Animation and verification

GSAP owns scrubbed pins, Motion owns separate editorial/navigation/gallery nodes, and Lenis optionally smooths desktop scroll. Lazy Three.js/R3F/Drei render the housing study and the preserved model-photo planes. Both canvases render on demand; DPR is capped at 1.5 for housing and 1.4 for photographs. Their shared WebGL bundle is fetched only near an eligible model chapter. Mobile uses native scrolling, while reduced motion removes pins and WebGL. See the animation specification for responsive budgets and fallbacks.

See `ANIMATION_SPEC.md`, `ASSET_USAGE.md`, `TYPOGRAPHY_SYSTEM.md` and `CLIENT_ACTION_REQUIRED.md`. Local screenshots and browser evidence are in `output/playwright/` (ignored by Git). The original project brief and implementation blueprint remain in `docs/`; this README describes the current single-page structure.
