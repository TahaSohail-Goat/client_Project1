# Typography system

The website uses one locked three-family system:

- **Space Grotesk 600–700** (`--display`) for structural headings and wordmarks.
- **Instrument Serif Italic 400** (`--serif`) for expressive italic phrases.
- **Manrope 400–600** (`--sans`) for body copy, labels, navigation and controls.

The Fontsource packages are bundled locally through `src/main.tsx`; the site does
not depend on a runtime Google Fonts request. Shared color and type scales live in
`src/styles/tokens.css`. `EditorialHeading` provides the hero lockup.
`CinematicHeading` provides the later sections' reusable Space Grotesk 700 / Instrument Serif 400
lockup, with selectable word spans and explicit visual word spacing. GSAP scrubs
staggered vertical word reveals, adding small diagonal/perspective movement to italics.
Motion handles separate supporting-copy entrances, navigation and microinteractions.
Reduced-motion preferences revert transforms and keep all text readable. The single page
uses the opening hero as its H1 and later chapters as H2 headings.

The palette is charcoal `#171C1A`, ivory `#F2EDE5`, bronze `#B99670`, sage
`#84917A` and muted clay `#B66F56`. Hero chapters switch their accent through a
single CSS variable so the scroll-linked color change remains restrained.
