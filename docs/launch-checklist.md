# Launch checklist

The local site is ready for review. Deployment and public launch require the following content and operational decisions.

- [ ] Approve studio copy in `src/content/site.ts`, including the introduction, services, and process language.
- [ ] Confirm permission to publish all 43 photographs and supply photographer credits.
- [ ] Provide verified project associations before replacing descriptive image titles with case studies.
- [ ] Approve the concept residence, editorial animation, and mobile/reduced-motion presentations.
- [x] Apply the confirmed inquiry address `tahasohail85@gmail.com`. Optional phone, WhatsApp, and location details can be added when supplied.
- [ ] Choose email-draft inquiry handling or configure an approved delivery endpoint as described below.
- [ ] Confirm hosting, domain, final metadata, and any analytics or CMS requirement.
- [ ] Review on physical Safari/iOS and a midrange Android device, including graphics performance and the email-app handoff.
- [ ] After publication approval, update both `index.html` robots metadata and `public/robots.txt` to allow indexing.
- [ ] Build and deploy `dist/`, then verify SPA rewrites, media responses, contact behavior, and response headers on the chosen host.

The supplied eco28 logo is already applied. Current photographs are organized by discipline, without invented commission names or built-status claims. The residence and courtyard study remain labelled concepts.

## Inquiry configuration

Without `VITE_INQUIRY_ENDPOINT`, the form validates the brief, presents a review, and prepares an email draft. Visitors send it from their email application. Copy and text-download alternatives are available.

For direct website delivery, copy `.env.example` to `.env.local` and set an approved same-origin or HTTPS endpoint:

```dotenv
VITE_INQUIRY_ENDPOINT=/api/inquiry
```

The form sends JSON with `name`, `email`, `discipline`, `location`, `message`, and `consent: true`. Only an HTTP success response with the following JSON confirms receipt:

```json
{ "received": true }
```

The frontend does not supply this server. The endpoint must validate input, implement spam controls, and deliver/store the inquiry. Keep provider credentials on the server; Vite environment values are public client configuration. The form aborts after 15 seconds, prevents duplicate pending submissions, and preserves input on failure. It clears stale success/review state after edits.

Endpoint browser checks intercept requests locally and send no real inquiries. Actual mailbox delivery still requires a separate launch check.
