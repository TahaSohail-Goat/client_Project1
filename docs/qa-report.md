# eco28 website QA — 17 October 2026

Test target: the local production build at `http://127.0.0.1:4173`.
Changes remain local; no commit, push, deployment, or real inquiry was sent.

**Result:** 21 automated suites, production build, lint and the visual checks below passed after fixes. Four functional bugs and two groups of accessibility issues were corrected. No remaining functional failure was observed in the tested flows. Consolidated machine-readable results: `output/playwright/qa-results.json`.

## Issues found and fixed

1. **Gallery filters reset the page to the top.** Updating search parameters discarded `#work`. Filters, opening photographs, changing photographs and closing the dialog now preserve the current chapter and scroll position.
2. **Repeated content links could stop navigating.** A visitor could follow a link, scroll away, then reuse that same link without returning to its destination. Repeated content anchors now return to the section, including pinned chapters.
3. **Malformed URL fragments crashed the application.** An invalid percent-encoded fragment caused `decodeURIComponent` to throw. Fragment decoding now safely treats malformed fragments as unknown anchors.
4. **Low-contrast text.** Darkened the active desktop navigation and model-count text; increased the visibility of inactive interior indicators.
5. **Visible labels and accessible names differed.** Aligned photograph and material link names with visible numbering/titles, preserved text separation, and matched the gallery open button's accessible name to its visible label.
6. **The exterior photograph's optional 3D layer could fail to initialize.** Replaced observation of the animated plane with a check of stable layout bounds, and subscribed to live motion preferences. The layer now starts near the viewport and correctly disables/restores when motion or viewport eligibility changes.

## Verified behavior

| Area | Result and coverage | Evidence |
| --- | --- | --- |
| Production build and lint | Passed; TypeScript compilation is part of the production build. | `output/playwright/qa-build.log`, `qa-lint.log` |
| Desktop/mobile navigation | All 10 destinations clicked in each menu, ordered section IDs and footer directory checked, repeated pinned links, active markers, reduced-motion deep link and seven responsive widths. | `qa-navigation.log` |
| Gallery position regression | Filter retains `#work`; photo close restores its opening card's focus and scroll position. | `qa-gallery-position.log` |
| Fragment and repeated-link regression | Invalid fragment leaves the page usable; repeated work link returns to the gallery; Back/Forward restore their sections; an encoded valid section fragment resolves correctly. | `qa-routing-edge.log` |
| Main content links | All 20 distinct internal content destinations clicked, including architecture/interior filters and all seven model photo links. | `qa-site-links-firefox.log` |
| Footer | All 11 distinct section/top destinations clicked; email recipient checked. | `qa-site-links-firefox.log`, `qa-contact-footer.log` |
| Routes and recovery | `/work`, `/studio`, `/contact`, unknown category/photo values, missing-page screen and Return home. | `qa-site-links-firefox.log` |
| Document structure | No duplicate IDs, broken section targets, unnamed buttons or images missing `alt`; one H1. | `qa-site-links-firefox.log` |
| Gallery arrangements | All eight arrangements are distinct; interrupted transitions, drag, keyboard navigation, filters, full-resolution dialog and reduced-motion grid. | `qa-spatial-gallery.log` |
| Gallery controls | Previous/next, first/last boundaries, Home/End, eight layout shortcuts, three transition choices, eight mobile layout choices. | `qa-gallery-controls.log` |
| Photo dialog | Close button, Escape, backdrop close, previous/next wrapping, arrow keys, modal focus containment, 320px layout. | `qa-gallery-controls.log` |
| Entire photo collection | Every one of the 43 photo buttons opened its correct full-size image and restored focus on close. | `qa-photo-collection.log` |
| Contact validation | Empty/whitespace name, invalid email, required fields and consent; edits clear stale reviews. | `qa-contact-footer.log` |
| Contact draft actions | Review focus, mailto recipient/body, copy and text download. | `qa-contact-footer.log` |
| Optional endpoint behavior | Mocked confirmation, no premature success, duplicate protection, invalid JSON, missing confirmation, HTTP error, timeout and retained input. | `qa-inquiry-delivery.log` |
| Responsive page | 320×568, 390×844, 768×1024, 1024×768, 1280×720, 1440×900, 1920×1080, 844×390. No horizontal overflow or clipped section headings. | `qa-responsive.log` |
| Images | All 70 rendered images decoded at every responsive size. | `qa-responsive.log` |
| Menu keyboard access | Forward/reverse focus wrapping, Escape dismissal, restored toggle focus and background isolation. | `qa-responsive.log`, `qa-contact-footer.log` |
| Automated accessibility | Zero automated WCAG A/AA violations in desktop static page, photo dialog, mobile navigation and animated gallery scans after fixes. | `qa-accessibility-chromium.log` |
| Four-floor hero | Floor labels, actual interior entry, continuous camera boundaries, exact reverse, rapid scrolling, real wheel input, laptop resize, 390/320px views, editorial reveal, context loss and reduced motion. | `qa-residence.log` |
| Scene controls | Hero final CTA and credits popup; all three housing views; model keyboard focus/open; actual material canvas selection; all four interior slides forward/reverse. | `qa-scene-controls.log` |
| Native touch emulation | Vertical hero swipe advanced the camera; horizontal gallery swipe advanced the photo without scrolling the document; vertical gallery swipe scrolled the page. | `qa-touch-gallery.log` |
| Graphics/network fallbacks | Save-Data, no WebGL, and an intentionally blocked model request all showed the poster and kept the gallery usable. | `qa-fallback.log` |
| Clipboard failure | Denied clipboard permission showed recovery guidance; download still worked; Both disciplines selection preserved. | `qa-fallback.log` |
| Approach animation | Four desktop sizes, scroll reversal, pointer response, keyboard studio link, live reduced-motion changes, forced context loss, mobile and short-height fallbacks. | `qa-approach.log` |
| Consultation animation | Scroll rotation/reversal, visible float, pointer response, keyboard CTA, 1920/390/320px layouts and live reduced-motion changes. | `qa-consultation.log` |
| Contact/footer motion | Normal-motion deep link, visible heading and completed footer signature reveal. | `qa-contact-footer-motion.log` |
| Exterior 3D activation | Production build: initial deep link starts the layer; reduced motion removes it; motion restoration and tablet/desktop resizing restore the correct state. | `qa-exterior-ready.log` |
| End-to-end cinematic page | Hero renderer, exterior photo renderer, reversible heading/interior animations, housing views, model collection, portfolio filters, all 43 images, inquiry review, mobile layout and reduced-motion teardown. No JavaScript errors or failed media assets. | `qa-cinematic.log` |
| WebKit core compatibility | Mobile photo open/next/previous/close and restored focus; menu Close button; resizing while menu is open; contact navigation, review focus and correct email recipient. | `qa-browser-compat-webkit.log` |

## Browser coverage

| Engine | Coverage |
| --- | --- |
| Chrome / Chromium | Full functional, 3D/motion, responsive, accessibility, touch-emulation and failure-recovery passes. |
| Firefox | Content and footer destinations, filters linked from sections, model-photo links, route/deep-link recovery and keyboard skip navigation. |
| WebKit | Core mobile lightbox, menu, responsive menu teardown, contact navigation and inquiry review in reduced-motion mode. |

The engines were tested sequentially after simultaneous graphics-heavy browser sessions exhausted the Windows test machine's memory. The final production build and lint run both passed. An earlier automation timeout exposed the exterior 3D activation issue; its dedicated regression and the end-to-end suite both passed after the fix.

## Limits of verification

- The current contact flow creates a reviewed email draft addressed to `tahasohail85@gmail.com`. The visitor sends it in their email application. Actual mailbox delivery was not tested, and no live submission endpoint is configured. Endpoint tests used a temporary local server with intercepted requests.
- Automated accessibility checks have manual-review items, especially text over imagery. Zero automated violations is not a full accessibility certification.
- Responsive sizes and touch are browser emulation, not testing on physical phones.
- WebKit is an engine compatibility check, not validation on a physical iPhone/Safari installation. Full 3D performance on physical devices was not measured.
- The forced missing-model/WebGL tests intentionally generated graphics/loading diagnostics. Those are recorded separately from errors during normal operation; the fallback UI remained usable.
- Vite reports the existing large Three.js bundle warning. Functional checks do not establish a device-independent frame rate or production-network performance guarantee.

Screenshots and raw tool results are stored under `output/playwright/` (ignored by Git). Each smoke script under `tests/browser/` runs through Playwright CLI's `run-code --filename=...` interface.

Selected visual checks: `qa-contact-320.png`, `qa-footer-1440.png`, `qa-lightbox-chromium-320.png`, `cinematic-chromium-exterior.png`, and `navigation-1280.png`. These were visually reviewed alongside the automatic checks.

## Repository cleanup follow-up

After reorganizing the repository and removing retired hero implementations, `npm run check` passed. Four targeted Chromium suites also passed: residence, cinematic page, content/footer links, and accessibility. The accessibility check now waits for navigation transitions to settle and fails on reported violations; its four scans reported zero automated violations, with manual-review items retained.

All 43 photographs and their responsive variants remain available. The residence check covered floor elevations, reverse scrolling, resize restoration, 390px/320px layouts, context loss, and reduced motion. The cinematic check decoded all 43 photos with no runtime errors or failed media. Link checks covered 20 distinct content destinations, 11 footer destinations, compatibility routes, missing-page recovery, and keyboard skip navigation. Desktop and 320px hero captures were visually reviewed.

The source/import and media-reference audits found no unreachable source files, missing published assets, or unreferenced production media. Published media decreased from approximately 54 MiB to 24 MiB. All 18 original JPEG checksums matched their manifest records; originals, the logo PDF, and historical files remain in ignored `.local/`. The existing Three.js bundle-size advisory remains.

Follow-up evidence: `output/playwright/cleanup-*.log`, `output/playwright/repo-cleanup-results.json`, `output/repo-cleanup-audit.json`, and `output/repo-cleanup-check.log`. Browser scripts now live in `tests/browser/`; see [testing instructions](testing.md). No commit, push, deployment, or real inquiry was performed.

## Portfolio layout follow-up

Moved the Selected work heading and gallery controls into normal document flow above the clipped photo stage. The animated and reduced-motion versions share one heading. Updated spacing, responsive filters, and portrait thumbnail sizing. Bounds checks at 320, 390, 768, 1024, 1440, and 1912px found no heading overlap or horizontal overflow.

The build and lint passed. Firefox gallery, controls/lightbox, and accessibility checks passed: eight layouts, three transitions, all 43 decoded photos, filters, interrupted transitions, drag/keyboard interaction, mobile controls, reduced motion, and zero automated accessibility violations. The gallery regression now checks heading separation in every layout. Evidence is in `output/playwright/portfolio-*.log`; final captures are `portfolio-final-1440.png`, `portfolio-final-390.png`, and `portfolio-final-320.png`.
