# Typography system

The website uses one locked three-family system:

- **Space Grotesk 600–700** (`--display`) for structural headings and wordmarks.
- **Instrument Serif Italic 400** (`--serif`) for expressive italic phrases.
- **Manrope 400–600** (`--sans`) for body copy, labels, navigation and controls.

The Fontsource packages are bundled locally through `src/main.tsx`; the site does
not depend on a runtime Google Fonts request. Shared color and type scales live in
`src/styles/tokens.css`. `EditorialHeading` provides the reusable sans-plus-serif
headline lockup, while GSAP controls its staggered hero reveals and Motion handles
section entrances and microinteractions.

The palette is charcoal `#171C1A`, ivory `#F2EDE5`, bronze `#B99670`, sage
`#84917A` and muted clay `#B66F56`. Hero chapters switch their accent through a
single CSS variable so the scroll-linked color change remains restrained.
