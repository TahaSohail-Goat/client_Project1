# Deployment

Use Node 24, run `npm ci` and `npm run check`, then publish `dist/`.

- Vercel: framework Vite, build command `npm run build`, output `dist`. Routing and cache headers are in `vercel.json`.
- Netlify: build command `npm run build`, publish directory `dist`. Routing and cache headers ship as `_redirects` and `_headers`.
- Other static hosts: serve existing files directly and return `index.html` for application routes. Cache hashed `/assets/` files for one year; revalidate `/media/` after one day.

Indexing is enabled. Once the final domain is known, use its absolute URL for `og:image` in `index.html` and add a canonical URL. Check the live home page, `/work`, `/studio`, `/contact`, mobile navigation, photo gallery and inquiry email handoff after deployment. Hosting headers must be checked on the actual host; Vite preview does not apply them.

All 43 photographs, SVG branding and visual credits are retained. Source masters and generated QA output are ignored and are not required for deployment. Publish `dist/`, rather than the entire working folder.

## Inquiries

The default form validates and reviews a brief, then opens an email draft addressed to `Eco28development@gmail.com`. Visitors send the draft from their email app; copy and download alternatives are available. No backend is needed for this mode.

For direct website delivery, set `VITE_INQUIRY_ENDPOINT` before building, for example:

```dotenv
VITE_INQUIRY_ENDPOINT=/api/inquiry
```

The endpoint must accept JSON with `name`, `email`, `discipline`, `location`, `message` and `consent: true`, validate it, and deliver or store the message. Only an HTTP success response containing `{ "received": true }` confirms receipt. The frontend does not supply this server. Keep credentials on the server: Vite environment values are public.

The form prevents duplicate pending submissions, times out after 15 seconds and preserves input on failure. Browser delivery checks use intercepted requests and send no real inquiries.
