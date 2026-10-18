# eco28

Architecture and interior design portfolio with a scroll-controlled 3D residence, an editorial photo collection, and a project inquiry flow.

Built with React, TypeScript, Vite, Three.js / React Three Fiber, GSAP, and Motion. Native scrolling, responsive images, lazy-loaded 3D scenes and lossless model compression keep the experience responsive.

## Getting started

Use Node.js 22.13+ (22.x) or 24+ and npm. Node 24 is specified in `.nvmrc`.

```sh
npm ci
npm run dev
```

The development server runs at `http://127.0.0.1:5173`. Copy `.env.example` to `.env.local` only if configuring direct inquiry delivery.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run check` | Run ESLint, TypeScript checks, and the production build |
| `npm run typecheck` | Check TypeScript separately |
| `npm run build` | Generate the static site in `dist/` |
| `npm run preview` | Serve the production build on port 4173 |
| `npm run browser -- --help` | Open the Playwright CLI used by the browser checks |

See [testing](docs/testing.md) for browser commands and [the QA report](docs/qa-report.md) for recorded coverage and limitations.

## Repository layout

```text
src/
  components/       Page sections, navigation, gallery, and 3D renderers
  content/          Studio copy, photo metadata, navigation, and camera configuration
  hooks/            Shared React hooks
  styles/           Design tokens and component styles
public/             Published photographs, brand assets, models, and textures
scripts/assets/     Optional asset preparation tools
tests/browser/      Playwright CLI interaction and regression checks
docs/               Architecture, asset credits, testing, and launch notes
```

Generated output, browser evidence, and local source archives are excluded from Git. Original client files and retired implementations are preserved in `.local/` on this workstation; the archive is not required to run or build the site.

## Content and configuration

- **Studio copy and contact details:** `src/content/site.ts`
- **Section navigation:** `src/content/navigation.ts`
- **Photo collection:** `src/content/media.ts` and `src/content/photo-manifest.json`
- **Hero camera and labels:** `src/content/heroWalkthrough.ts`
- **Colors and typography:** `src/styles/tokens.css`

All 43 client photographs remain available, grouped as Architecture (11), Interiors (25), and Model Studies (7). The hero is an original concept residence. Photo titles describe images without inventing project identities.

The default inquiry flow reviews a brief and opens an email draft addressed to `tahasohail85@gmail.com`, with copy and download alternatives. Direct delivery is optional; its configuration and response contract are documented in [the launch checklist](docs/launch-checklist.md).

## Documentation

- [Hero architecture and rendering](docs/hero.md)
- [Motion and accessibility behavior](docs/motion.md)
- [Assets, licenses, and preparation](docs/assets.md)
- [Typography](docs/typography.md)
- [Testing](docs/testing.md)
- [Launch checklist and inquiry configuration](docs/launch-checklist.md)

## Deployment

Build with `npm run build` and publish `dist/` to a static host with SPA fallback. Vercel and Netlify routing configuration is included. `/work`, `/studio`, and `/contact` retain compatibility with the single-page experience.

Search indexing is enabled. Vercel and Netlify cache configuration is included. Follow the [launch checklist](docs/launch-checklist.md) for hosting and inquiry configuration.
