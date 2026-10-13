# Studio Portfolio — Cinematic Motion & Information Architecture Blueprint (v2)

**Confirmed client business:** Architecture / interior design studio showcasing its work. This supersedes any earlier assumptions about real estate brokerage, property listings, property sales, or a single-house marketing site.

## Reference interpretation

- `references/client_scroll_reference.mp4` is a **3.9 s, 640 × 368, 30 fps** recording of a separate website. Visually it shows a facade hero, progressively tighter camera-like zoom/crop, an ivory/white editorial block overtaking the picture, split architecture/text content, and minimalist headings and CTA. Replicate the *interaction language*, not the footage, building, identity, or wording.
- https://realestate.webdemos.app/ is a supporting **layout / editorial / image treatment** reference. It is a property demo, not the client's business. Do **not** borrow listing systems, property prices, brokerage identity or unlicensed media. Live easing curves / frame-perfect effects are unverified.
- **All 18 photos** were supplied by the client: **4 exteriors**, **11 interiors**, **3 photographs of physical architectural models**. Photo groups are *not verified as belonging to the same commission*. The architectural model photos do **not** constitute a 3D model/GLB. Do not imply an accurate building walkthrough, reconstruction, or floor-by-floor navigation.

## Site goal and conversions

Create a cinematic studio portfolio that communicates visual taste, capability and design sensibility, then leads visitors to **discuss a project / request a consultation**. Success = persuasive work showcase, meaningful and usable Work gallery, functional studio navigation and a reliable inquiry route. Do not introduce buying/selling properties, listings, agents, valuations, area maps or floor selectors.

### Recommended navigation and route scope

Primary nav: **Work**, **Approach**, **Studio**, **Expertise**, **Contact** (rename per approved client brand). Sticky header may invert contrast appropriately.

- `/` — **signature cinematic home** with the 9 scenes below. Must be excellent before extra routes.
- `/work` — portfolio grid; filtering by verified **image category** (Architecture, Interiors, Models/Concepts) is fine. Do **not** invent projects, dates, locations, built status, awards, clients or square footage. A photo can open an accessible lightbox.
- `/studio` — modest overview with editable copy, only if the client's actual bio/credentials are available. Until then, tasteful clearly editable neutral copy.
- `/contact` — functional contact destination if the studio supplies a recipient/service; otherwise avoid fake submissions, use a clearly marked configurable destination and keep navigation working.
- `/services` (optional) — only after client confirms offerings; 'Architecture' and 'Interior Design' are confirmed general domains but turnkey, landscape, construction supervision etc. are unconfirmed.
- `/work/[project]` — **deferred until project mapping**. Never pretend groups of unrelated photos describe one client property.

### Design system

- Original luxury editorial direction, not a clone of the references.
- Suggested tokens (temporary, overridden by brand kit): warm ivory `#EEEAE2`, charcoal `#171916`, stone `#B7A58D`, deep olive `#343B32`, white `#FFFFFF`.
- Hero: full-bleed architecture, left/bottom-aligned readable typography, gradient only as needed for text contrast, carefully chosen `object-position`.
- Typography: elegant sans-serif or editorial pairing with excellent hierarchy, no expensive externally hosted fonts without checking permissions/performance. Respect existing fonts where appropriate.
- Motion tone: **precise, architectural, cinematic**, not chaotic. Strong transitions in 2–3 signature places, restrained detail elsewhere. Avoid gratuitous particles, perpetual spinning, large blurs, scroll locks, abrupt camera cuts.
- Initial copy examples are **editable creative placeholders**, not approved branding: 'Design, made tangible', 'Spaces shaped by intention', 'Thoughtful places for living', 'Explore selected work', 'Discuss a project'. Never invent studio years, credentials, awards, client testimonials, addresses, completed commissions or measurable results.

## Precise homepage storyboards

The scroll lengths below are desktop *starting hypotheses* only. Calibrate after observing real wheel and touch scrolling. The primary hero and reveal should have **scrubbed reversible behavior**; not merely one-off fade-ins.

| Order | Section / visual purpose | Source assets | Scroll behavior / treatment | Owner | Starting scroll budget |
|---|---|---|---|---|---|
| 01 | **Immersive Hero / The First Impression** | `exterior-driveway-golden-hour.webp`; alternate `exterior-front-twilight.webp` | Full-height facade. Intro copy readable above fold. 1.00→1.07ish smooth image push-in, subtle 0–30px drift, text gently yields; clean transition into next chapter. A meaningful Work CTA and Contact CTA. | GSAP + ScrollTrigger for pinned sequence; Motion for separate nav/CTA hover | 170–200vh |
| 02 | **Architectural Vision / The Facade Reveal** | `exterior-rear-facade.webp`, `exterior-side-landscape.webp` | Second wide facade occupies viewport; scroll-controlled 1.02→1.10 crop; an ivory pane smoothly rises/masks over photo as large editorial headline and supporting copy appear, image resolves into side-by-side layout. Backscroll perfectly reverses. | GSAP ScrollTrigger | 190–230vh |
| 03 | **Selected Work / Architectural Perspective** | All four exterior images, reused tastefully | Distinct scroll-responsive image cards with parallax and asymmetric grid. Category label 'Architecture' only. Image click opens work/gallery, not a fabricated listing. | Motion, limited GSAP | 110–160vh |
| 04 | **Interior Experiences / Spaces Within** | 11 interior images, flagship `interior-dining-living.webp`, `interior-bedroom-classic.webp`, `interior-bedroom-minimal.webp` | Main pinned 3–5 key scene swaps with crossfade, clip/mask or scale transforms and synchronized title descriptions. Other interiors accessible via a real grid/lightbox or secondary scroll editorial pairs (no invisible assets). Avoid 11 consecutive 200vh pins. | GSAP for scrubbed stage, Motion for accessible gallery interactions | 240–340vh main gallery |
| 05 | **Materials & Details / Craft** | `interior-display-wall.webp`, `interior-study-shelf.webp`, `interior-bathroom-warmstone.webp`, `interior-reading-nook.webp` | Finely cropped details, line clipping/text entrances, staggered 2-column compositions, subtle parallax. Preserve original frame view in gallery. | Motion, optionally clip-path GSAP | 100–140vh |
| 06 | **From Concept to Form / Scale Models** | `model-front-facade.webp`, `model-top-perspective.webp`, `model-open-cross-section.webp` | Isolated 2.5D perspective / image-plane composition: camera shifts and photo panels translate/tilt on a scroll-linked timeline (±2–4°). Real photos remain visibly photographs; label 'Physical model studies' or 'Concept studies' pending confirmation. CSS non-WebGL fallback. | R3F + Three + Drei with GSAP progress bridge | 150–210vh |
| 07 | **Approach / Process** | Optional reuse interior/exterior crops | A short editorial process statement and a *configurable* sequence of steps, only if studio confirms its workflow. Use subtle line progression and staggered reveals rather than forced scroll pinning. | Motion | normal content height |
| 08 | **Studio & Expertise** | Reuse curated exteriors/interiors | Studio intro and the two known disciplines: Architecture and Interior Design. No fabricated people, certificates, project counts, services. Light editorial microinteraction. | Motion | normal content height |
| 09 | **Invitation / Start a Project** | `exterior-front-twilight.webp` or minimal dark background | Strong but quiet call to discuss a project, with functioning contact route / verified email or inbox integration. Dim architectural image or elegant plain background; accessible links and responsive footer. | Motion | 90–110vh |

### All-image coverage check

- Architecture: `exterior-front-twilight`, `exterior-rear-facade`, `exterior-side-landscape`, `exterior-driveway-golden-hour` (4).
- Interiors: `interior-bedroom-classic`, `interior-bedroom-marble`, `interior-lounge-bar`, `interior-display-wall`, `interior-bedroom-minimal`, `interior-bathroom-warmstone`, `interior-walkin-closet`, `interior-reading-nook`, `interior-study-shelf`, `interior-compact-bedroom`, `interior-dining-living` (11).
- Scale-model studies: `model-front-facade`, `model-top-perspective`, `model-open-cross-section` (3).
- Ensure all 18 have a visible access path: primary scenes or `/work` gallery. Do not force every image into a pinned homepage sequence. Provide meaningful alt descriptions, never fabricated project identifiers.

## Motion stack and responsibility rules

1. Preserve existing framework (React/Next/Vite) and its routing, styles and functionality. Prefer TS and accessible semantic sections.
2. **GSAP/ScrollTrigger** owns pinned timelines, scrubbed hero, facade zoom and image/panel transitions. Use scoping (`gsap.context` or `useGSAP`) and clean-up for React and route changes.
3. **Motion for React** (`motion/react`) owns isolated typography reveals, hovering, navigation, modals/lightbox, page transitions and non-GSAP layouts. Never animate the same property on the same node with Motion and GSAP simultaneously.
4. **Lenis** (current package `lenis`), optional for desktop smoothing; make ScrollTrigger sync with Lenis. If hooking GSAP ticker, run exactly one RAF loop; do not enable autoRaf and tick another RAF simultaneously. Respect reduced motion, keyboard and mobile native scrolling.
5. **Three.js + @react-three/fiber + @react-three/drei** only for **model photo planes** / perspective gallery with a real visual payoff. No faked architectural geometry or invented downloadable GLB. Lazy-load the canvas, cap DPR, manage resources/context-loss, and show a good CSS-photo fallback.
6. Source of truth for scroll = native/document scroll (optionally smoothed by Lenis); GSAP owns major chapter progress. Avoid wrapping the whole app with R3F ScrollControls or manually hijacking wheel events.
7. Motion preference: when `prefers-reduced-motion: reduce`, no mandatory pins, zooms or WebGL; use straightforward static layouts with same content and functional links.

### Suggested file structure (adapt to existing repo)

```
src/
  app/ (or existing router)
    page.tsx, work/page.tsx, studio/page.tsx, contact/page.tsx
  components/
    chrome/Header.tsx, Footer.tsx
    motion/ScrollSystem.tsx, RevealText.tsx, ScrubbedImage.tsx
    home/HeroScene.tsx, FacadeReveal.tsx, ArchitectureGallery.tsx
    home/InteriorsSequence.tsx, MaterialsEditorial.tsx, ModelPhotoScene.tsx
    home/Approach.tsx, StudioIntro.tsx, InquiryCTA.tsx
    portfolio/WorkGrid.tsx, PortfolioLightbox.tsx
    three/ModelPhotoPlanes.tsx, CanvasFallback.tsx
  content/site.ts, content/media.ts, content/projectGrouping.ts
  styles/tokens.css
```

## Build order and gates

**Gate A: Baseline** — audit repo, git status, baseline test/build, media manifest and legal/publication approval flag, static responsive skeleton and route/navigation contracts.

**Gate B: Signature motion** — deliver pixel-considered hero and ivory architectural reveal from reference (Section 01 & 02) with scrub/reverse responsive QA. Do *not* work on WebGL first.

**Gate C: Portfolio story** — architecture gallery, all 11 interiors discoverable, materials editorial, lightbox and simple Work route; mobile layouts usable.

**Gate D: 3D-like model story** — add one lazy-loaded R3F composition only after Gates A–C pass. Demonstrate actual improvement; otherwise keep pure CSS plane transforms.

**Gate E: Trust & conversions** — studio/expertise, approved process and copy, inquiry form destination or clearly labeled non-submitting fallback; SEO/meta, reduced motion, browser QA, lighthouse context, contact data check.

## Mobile and performance constraints

- Wide exteriors ~1080px: zoom only ~1.05–1.12, avoid clipping roofs; request high-res master images before final acceptance. Portrait interior shots use appropriate `object-fit`, no forced landscape distortions.
- At 360/390/428px and tablets, avoid full-viewport text clip, oversized glass effects or touch hijacking; use alternative crops and shorten/non-pin sequences.
- Reserve image dimensions; hero eager/high priority, lower imagery lazy, responsive `sizes`; do not eagerly download all 18 full res at home load.
- Use CSS fallback when WebGL unsupported, reduced-motion or disabled. Accessibility: skip to content, keyboard lightbox, focus rings, semantic titles, contrast, tab-order, Escape close.
- Targets, not guarantees: LCP ~2.5s, CLS <=0.1, INP ~200ms with test device/network disclosed. Test reverse scroll and resize mid-pin; refresh ScrollTrigger on true layout changes.

## Client decisions outstanding

- Actual studio name, logo, tagline, brand fonts/colors, contact details.
- Which photos belong to which real project(s); whether model studies correspond to a built project. Permissions and credit requirements.
- Approved services, scope of expertise, real process stages, team bio, authentic awards/testimonials if any.
- Exact site deliverables (home + Work + Studio + Contact?), copy approvals, CMS or no CMS, inquiry receiver/integration.
- 2K–4K originals for exterior images; domain/deployment destination.

Until decisions arrive, ship a beautiful demonstrable front end with **obviously editable placeholder content** and no deceptive representations.
