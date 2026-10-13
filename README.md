# Architecture & Interior Design Studio Portfolio

A local React/TypeScript implementation of the supplied studio handoff. This folder initially contained the handoff only, with no application or Git history. After the user authorized building here, the original package was committed on `main`; application work is on `feat/architecture-studio-cinematic`.

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

- `/`: nine chapters, including the reversible exterior hero, facade-to-ivory transition and four-scene interior gallery.
- `/work`: all 18 photos, true category filters, full-frame native dialog lightbox, keyboard controls.
- `/studio`: editable introduction and the two confirmed disciplines.
- `/contact`: validated inquiry preview until a real destination is configured.

Edit studio identity and approved editorial copy in `src/content/site.ts`. Photo metadata comes from `docs/ASSET_MANIFEST.json` through `src/content/media.ts`. Photos are not assigned to projects. Detail pages, team biographies, locations, awards and unconfirmed services are intentionally deferred.

## Inquiry delivery

`site.inquiry.email` enables preparing a draft in the visitor’s email app. This does not claim that a message has been sent. Alternatively, set `site.inquiry.endpoint` to an approved same-origin/HTTPS POST endpoint. The endpoint takes JSON `{name,email,discipline,message,consent:true}` and must return a successful HTTP status with JSON `{ "received": true }` only after genuinely accepting the inquiry. Other responses, network errors and a 15-second timeout display a delivery error.

The frontend contains no receiver, service credentials or server. Implement server-side validation, spam protection, rate limiting and delivery; approve privacy wording before enabling submission. Never put provider API keys in client code. With both values empty, the form makes no request and stores nothing beyond the current page’s memory.

## Assets and delivery

Only `public/media/*.webp` is published. Original JPEGs and the motion-reference MP4 stay outside the deployment output. Responsive 480px and 768px WebP copies retain the source ratio and are never upscaled. Hero/facade and lightbox use full supplied WebP resolution. System Arial/Helvetica and Georgia require no external font downloads.

Deploy the contents of `dist/` to a static host with SPA fallback for `/work`, `/studio` and `/contact`. `vercel.json` and `public/_redirects` provide common host configurations; no hosting account is connected or deployment performed. The reference video is never used as website footage. `noindex,nofollow` and a disallow-all `robots.txt` remain until branding, publication permission and launch content are approved; update both at launch. Verify host-specific rewrites and response headers before launch.

## Animation and verification

GSAP owns scrubbed pins, Motion owns separate editorial/navigation/gallery nodes, Lenis optionally smooths desktop scroll, and lazy Three/R3F/Drei own only model-photo planes. Mobile uses native scroll; reduced motion bypasses pins and canvas. WebGL renders on demand with DPR capped at 1.4. Its separate large bundle is fetched only near the model chapter on eligible devices.

See `ANIMATION_SPEC.md`, `ASSET_USAGE.md`, `IMPLEMENTATION_PROGRESS.md` and `CLIENT_ACTION_REQUIRED.md`. Local screenshots and browser evidence are in `output/playwright/` (ignored by Git). The original handoff instructions remain untouched in `docs/`.
