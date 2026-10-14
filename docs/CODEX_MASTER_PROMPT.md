# CODEX MASTER BRIEF (V2) — CINEMATIC ARCHITECTURE & INTERIOR DESIGN STUDIO

> Current user-approved revision: the homepage now uses the supplied `hero_exterior_to_interior_scrub.mp4` as a paused, scroll-scrubbed film. The historical photographic hero instructions below apply to the preserved media-failure fallback. See `README.md` and `ANIMATION_SPEC.md` for the current implementation.

## Your role, definitive scope and instructions

You are Codex operating in the **current existing website repository**. The Fiverr client has now confirmed the business category: **ARCHITECTURE AND INTERIOR DESIGN STUDIO SHOWCASING ITS WORK**. Build a premium, technically rigorous, cinematic **studio portfolio website** — NOT a real-estate broker, property-sales portal, agent directory, single-house listing or development-sales website. The brand name, exact project grouping and contact details remain unconfirmed; work honestly with configurable text/labels.

You have the folder `architecture_codex_handoff/` in the repository. It includes **18 original client photos**, 18 web-ready WebP copies, a reference image montage, `ASSET_MANIFEST.json`, and a **3.9-second client-provided reference website screen recording** at `references/client_scroll_reference.mp4`. Use the client's images as the only photographic site content. **Do not use the recording as website footage**: it depicts a different property/site and is only a demonstration of desired scrolling motion. A supplementary inspiration website is `https://realestate.webdemos.app/`; study its high-end editorial layout if possible, but do not copy names, photos, text, listing sections, property data, or code.

The most important experience is a **visually spectacular, smooth, reversible, scroll-driven architectural hero and editorial transition**, which you MUST finish and test before broadening the site. Client wants a highly animated premium experience, not a stack of basic `whileInView` fade-ins. Use Motion, GSAP ScrollTrigger, Lenis and, *where clearly useful*, Three.js/R3F/Drei. Avoid installing libraries just for checkboxes; each owns a specific concern (see below).

## Required first pass — assess, safeguard and plan

1. Audit the existing repo first: git status/branch, app framework, React and package versions, layout and routes, CSS system, components, media, existing features, build/test/lint commands, SEO, dependencies, and deployment configuration. Do not assume a fresh Next.js project. Summarize what exists and what can be reused. Run a baseline build if feasible, document preexisting issues.
2. Protect work: do **not** `git reset --hard`, force-pull, delete/reinitialize project, clobber uncommitted changes, modify secrets, or break existing flows. Create branch `feat/architecture-studio-cinematic` if git status/branch safety allows. If uncommitted changes block a clean branch, report and use safe non-destructive steps.
3. Read completely: `architecture_codex_handoff/README.md`, `docs/IMPLEMENTATION_BLUEPRINT.md`, `docs/ASSET_MANIFEST.json`, `CLIENT_ACTION_REQUIRED.md`. Inspect the original photos/contact sheets and actual reference MP4 frames before choosing crops.
4. Produce a short audit + implementation checklist and list the precise animation responsibility per component. Continue automatically through safe non-destructive implementation; only request user approval for important unresolved scope/content, destructive actions, paid services, or deployments.
5. Prefer the existing stack and styling. Use TypeScript if the repo supports it. Keep good semantic HTML, reliable routing and mobile responsiveness. Do not introduce services, external assets, or unauthorized brand claims by assumption.

## What to BUILD — portfolio content architecture

### Sitemap and conversion strategy

Navigation: **Work / Approach / Studio / Expertise / Contact**, or studio-confirmed equivalents. The site must invite visitors to **Explore the Work** and **Discuss a Project**. At the start, use a brand configuration value like `STUDIO NAME` conspicuously marked for final replacement, not a fake established studio identity.

Implement in this order:

- `/` — Signature cinematic homepage: 9 narrative chapters (detailed below). HIGH PRIORITY.
- `/work` — Visually excellent, lightweight, accessible portfolio grid of the supplied photos with *true* categories: Architecture (4), Interiors (11), Model Studies (3). Make category tabs/filters work, add a keyboard-friendly lightbox and direct anchors. Do not invent individual projects.
- `/studio` — Credible studio-introduction layout with editorial design and editable placeholder text. No fake founding date, staff photos, fabricated biography, certifications, testimonials, awards or client metrics.
- `/contact` — Inquiry page with clear, functional destination only once configured. Until then, present a safe honest placeholder/test workflow: no false 'submitted' success, fake company email or nonfunctional CTA. A simple contact anchor can still work in demo mode; document how to connect a real endpoint.
- `/services` (optional if client confirms detailed offerings) — 'Architecture' and 'Interior Design' are the two known umbrella disciplines. Avoid unverified assertions about turnkey construction, planning permissions, project management, renovations or geographic footprint.
- **DEFER** `/work/[slug]` completed-project case studies until the client maps images to real projects, supplies factual names, dates, descriptions and associated permissions. If implementing a reusable detail-page template early, make it generic and preview-only, without fabricated metadata.

### Homepage sequences — detailed acceptance behavior

**01 — Exterior HERO / 'Design, Made Tangible' (creative placeholder only)**

- Primary asset `public/media/exterior-driveway-golden-hour.webp`; optional responsive alternate `exterior-front-twilight.webp`. Do NOT blur or needlessly upsize the original 1080px exteriors.
- Full-screen architecture facade, elegant editorial typography, small brand/chapter label, readable project/studio CTA links. Visually composed first viewport; do not wait for the user to scroll to see studio purpose.
- 170–200vh *approximate* scroll budget, with pinned visual occupying viewport. Scrub progress drives slight scale (say 1.00→1.08), camera-like pan, headline translation/opacity and transition cue. **Scrolling upward must reverse every element.** No stuttering, abrupt cut, giant empty spacer or broken sticky behavior.
- Keep architecture geometry unchanged; subtle gradient only for text legibility; responsive `object-position` to avoid clipping roof/window massing.

**02 — Signature FACADE-TO-IVORY REVEAL / core video inspiration**

- Use `exterior-rear-facade.webp` and `exterior-side-landscape.webp`. Create pinned exterior hero with a progressive cropped/zoomed architecture image; then a clean warm-ivory editorial panel rises/reveals itself, with large typographic statement appearing, then an asymmetric image-and-copy composition forms.
- Build a **single GSAP ScrollTrigger scrubbed timeline** with explicit key beats: establish scene → camera push-in → panel wipe/mask → editorial line reveal → settle. Use carefully staged opacity/clip-path/transform; visually emulate screenshot sequence, not property content.
- Reverse direction must restore the original image seamlessly. Resize while within pinned section must not create jumps or overlap. Film-like but always scroll-controllable; do not use an MP4 or force idle video playback.

**03 — SELECTED ARCHITECTURE / facade studies**

- Present the other exterior shots with a responsive asymmetric image layout, subtle parallax in a few cards, informative generic labels 'Exterior Study', 'Materiality', 'Architectural Perspective' (editable, not real project names).
- 'View All Work' must navigate to `/work` and category filters must work. Elegant hover on cards; no exact property addresses or prices.

**04 — INTERIOR EXPERIENCES / flagship studio work**

- Use `interior-dining-living.webp` or `interior-lounge-bar.webp` as a hero for a scroll-controlled stack; follow with bedrooms/wardrobes/detail shots.
- On desktop, use one continuous pinned 3–5-scene scrubbed gallery, synchronizing imagery, headings and small scene indicators. Smooth masks/image cropping/cross-dissolves; avoid 11 individually pinned screens and avoid unreadable text during transitions.
- All **11** interiors must have a real accessible viewing path via this story and `/work` grid/lightbox. Each portrait image retains sensible portrait display/crop; no distortions. Do not falsely imply all rooms are in the exterior house or one commission.

**05 — MATERIALITY / thoughtful details**

- Editorial content from `interior-display-wall.webp`, `interior-study-shelf.webp`, `interior-bathroom-warmstone.webp`, `interior-reading-nook.webp` (others may be reused). Reveal stone, warm lighting, wood, spatial proportions with clip-path/opacity/line choreography.
- CSS/Motion preferred over WebGL. Use real source photography rather than generated architectural distortions. Keep titles editorial but not specific unverifiable material or certification claims.

**06 — CONCEPT TO FORM / physical model photography**

- The files `model-front-facade.webp`, `model-top-perspective.webp`, `model-open-cross-section.webp` show a **physical scale model**, not a 3D asset.
- Build a **bounded, optional WebGL scene** using Three.js + React Three Fiber + Drei: three client image textures mapped to photo planes that translate slightly in Z, tilt under small scroll-linked camera changes, and transition into an editorial photo grid. Preserve their photograph identity. Avoid claiming a true 360° model, architectural walk-through, generated geometry, real floor explorer or physically faithful reconstruction.
- Dynamic import/lazy load; provide non-WebGL and reduced-motion CSS/DOM fallback with identical photographs and meaningful text. If the R3F effect is visually weaker, less performant or brittle, keep CSS implementation and document why; actual quality is higher priority than library count.

**07 — APPROACH / design philosophy and process**

- A short editorial statement, clean section dividers and gentle progressive line/text reveals. Detailed project workflow steps only after studio approves actual process. Avoid invented guarantees, client types or work scope.

**08 — STUDIO / EXPERTISE**

- Express architecture + interior design with two restrained layouts and text editable from `content/site.ts` (or equivalent). Use approved client branding when available; until then visible content is clearly designated as placeholder in source and client-action notes.

**09 — CONTACT / an invitation to collaborate**

- Low-key strong finish: 'Let's shape your next space' (placeholder), links to Contact and Work, coherent footer, plain accessible inputs if form route used. Working action only when a real destination is configured, or honest demo disabled state that never claims submission succeeded.

## Animation system — strict ownership contract

- **GSAP (`gsap`) + ScrollTrigger**: primary pinned hero, facade reveal, interior scrubbed gallery. Hook with `@gsap/react` / `gsap.context` and cleanup. Pin or sticky per section, never conflicting double-pin. Keep all animations normalized to measured scroll progress, no unnecessary wheel hijacking.
- **Motion for React (`motion`, `motion/react`)**: navigation/header microinteractions, accessible menu state, text in sections not managed by GSAP, gallery hover/selection, dialog/lightbox, route view transitions if appropriate. Never animate the same DOM node's transform/opacity/clip path with both GSAP and Motion simultaneously.
- **Lenis (`lenis`, not old `@studio-freight/lenis`)**: optional desktop smoothing only. Sync scroll notifications with ScrollTrigger update and shared ticker correctly, without double-RAF; native scrolling fallback on touch/mobile/reduced-motion. If smooth scrolling causes sticky issues, prefer native scroll and correct interaction over forced Lenis.
- **Three.js + `@react-three/fiber` + `@react-three/drei`**: one intentionally limited photo-plane scene for architectural model photos. Match React/R3F versions and verified dependency support; avoid global WebGL overlays. Use lazy loading + CSS fallback; no constant React state updates on each frame. Clamp DPR and pause when not visible.
- Simple effects go in CSS. Optional postprocessing only if visually justified and performance tested.
- Do not use full-page R3F `ScrollControls` on top of Lenis/ScrollTrigger; only one document scroll source of truth. `prefers-reduced-motion` should bypass pins, aggressive zooms and WebGL, while preserving content, nav and inquiry.
- Ensure SSR/client boundary is correct for Next.js, no window/document access during server render, layout cleanup on route navigation.

## Component / content organization — adapt to framework, don't overwrite conventions

```
src/
  app/                    # Next App Router if already used
    page.tsx              # / cinematic home
    work/page.tsx         # /work: photo categories + accessible lightbox
    studio/page.tsx       # /studio
    contact/page.tsx      # /contact
  components/
    layout/Header.tsx Footer.tsx
    scroll/ScrollEngine.tsx ChapterProgress.tsx
    home/HeroScene.tsx FacadePanelReveal.tsx ExteriorWorks.tsx
    home/InteriorSequence.tsx MaterialsScene.tsx ScaleModelScene.tsx
    home/ApproachEditorial.tsx StudioExpertise.tsx ConsultationCTA.tsx
    portfolio/WorkGrid.tsx WorkFilter.tsx AccessibleLightbox.tsx
    three/PhotoPlanes.tsx PhotoPlanesFallback.tsx
  content/media.ts content/site.ts content/groupings.ts
  styles/tokens.css
```

Build component boundaries so photo and copy content can change from a small data file. DO NOT hardcode several copies of filenames throughout the code. Use metadata from `ASSET_MANIFEST.json`, copy optimized WebP to app public media directory and preserve original sources in the handoff only. Use `next/image` / responsive picture strategy where supported, reserve dimensions and hero priority. Do not unnecessarily bundle all original JPEGs into deploy/public assets.

## Explicit truthfulness and asset boundaries

- The 4 exteriors may belong together, but **nothing validates that the 11 interiors or 3 model studies are parts of the same villa**. Present category-based gallery until confirmed. Never group them into a single case study without approval.
- Original exterior files ~1080 pixels wide. Do NOT invent detailed fake 4K pixels, oversized camera push-ins, or replace the client's homes with AI-generated substitutes. Ask for higher-res masters for launch quality.
- Brand name, copyright/photographer credits, genuine projects/locations, testimonials, achievements, team bios, studio history, form receiver/WhatsApp are not provided. Use easy-to-edit placeholders and an explicit `CLIENT_ACTION_REQUIRED.md`, with no fictional claims.
- Reference video depicts other architecture/branding and is **not** a client-provided property walkthrough. Treat only as movement inspiration.
- Honor license terms of any open-source animation inspiration and avoid verbatim copying of reference site's composition/content.

## Phased execution and test gates

**Phase 1 — Repo audit and static site skeleton (P0)**
- Audit repository and dependencies; baseline build/checks; git branch and worktree safeguards. Organize asset metadata and source files; establish tokens and typography; implement mobile-friendly static homepage and anchor navigation. Document assumptions. Then proceed.

**Phase 2 — Signature motion FIRST (P0, most important)**
- Implement and tune HeroScene and FacadePanelReveal. Confirm reversible GSAP scrub, good scroll spacing, readable copy, screen size changes, high contrast, no horizontal overflow, no major layout shifts. Capture screenshots/frame sequence if browser tooling permits. This phase must reach polished quality before WebGL.

**Phase 3 — Portfolio & interiors (P1)**
- Working `/work` category filters/lightbox, all 18 photos discoverable and alt-described, InteriorSequence and detail editorial scenes, mobile adjustments, architecture Selected Work. Do not wait for real project metadata to make category-based portfolio work.

**Phase 4 — Studio identity and conversion (P1)**
- `/studio`, `/contact`, expertise and optional confirmed services, honest placeholders, link all CTAs, implement actual inquiry delivery only after destination is provided. Mobile menu, metadata, socials only when verified.

**Phase 5 — Optional Three.js model-scene enhancement (P2)**
- Introduce bounded lazy R3F photo-plane perspective. Profile and test on midrange devices. Keep DOM/CSS fallback and remove WebGL if it hurts loading, scrolling or accessibility.

**Phase 6 — QA & handoff (P0 to deliver)**
- Build/typecheck/lint/tests; test 360, 390, 428, 768, 1024, 1440 and 1920 desktop; mousewheel/touch/keyboard, scroll forward/back, resize while pinned, Safari Firefox Chromium if possible; reduced-motion, WebGL disabled, image load failure; test `/work` filter and keyboard lightbox; ensure no fake contact submission; check mobile performance and sticky behavior. Identify if testing browser automation is unavailable rather than fabricate proof.

### Mandatory documentation outputs in repo

1. `ANIMATION_SPEC.md`: each scene's ref, scroll range, GSAP timeline stages, transform bounds, responsive fallback and library ownership.
2. `ASSET_USAGE.md`: all 18 photo filenames, where they appear, category and image-association warnings; list image export choices.
3. `README.md`: current structure, run/build commands, verification workflow and remaining launch requirements. Local browser evidence lives in ignored `output/playwright/`.
4. `CLIENT_ACTION_REQUIRED.md`: studio name/logo, photo-to-project mapping, approval, contact/form destination, services, copy and high-res sources.
5. Project README instructions to run/build and package/bundling notes, no leaked secrets.

### Acceptance criteria

- Visitors immediately understand this is an **architecture + interiors studio portfolio** — not a brokerage or listing marketplace.
- Hero behaves as a photographic camera-like push-in under user scroll; facade transitions into large ivory editorial panel with elegant typography; both scrub **both directions** without jumps.
- At least four intentional, visibly different motion treatments: pinned zoom, editorial panel wipe, split/parallax imagery, pinned interior stage; model-photo scene adds subtle depth with graceful fallback.
- All **18 originals** have an accessible visual representation in a real route/chapter, and photo provenance is not misrepresented.
- Work gallery and navigation are usable. Contact CTA has an honest destination or an explicit unconfigured state, no false success.
- Responsive, visually cohesive, reduced-motion accessible, keyboard accessible, performant. Build works; document any external constraints. Don't claim measured 60 fps without measuring.
- No false case studies, awards, office locations, real-estate prices, property floor data, staff identities, or client claims.

## Useful resources (research only — check licensing and current versions)

- Primary motion inspiration: `architecture_codex_handoff/references/client_scroll_reference.mp4`
- Secondary layout inspiration: https://realestate.webdemos.app/
- Motion: https://motion.dev/docs/react-scroll-animations
- GSAP: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Lenis: https://github.com/darkroomengineering/lenis
- React Three Fiber: https://r3f.docs.pmnd.rs/
- Drei: https://drei.docs.pmnd.rs/
- Sample R3F architecture: https://github.com/pmndrs/examples
- Other image effect example: https://github.com/J0SUKE/gsap-threejs-codrops

**Begin by auditing repo / confirming branch safety, then build the static skeleton and the excellent first two signature animations, and continue phase by phase. Do not turn the studio site into a property marketplace or invent its portfolio projects.**
