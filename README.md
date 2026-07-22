# White Bloom Media

Angular landing page for White Bloom Media, an event content creation studio focused on vertical video, horizontal recaps and visual content for venues, event companies, wineries, bands and private celebrations.

## Development

```bash
npm install
npm start
```

## Production build

```bash
npm ci
npm run build
```

Build output:

```text
dist/white-bloom-media/browser
```

## Vercel settings

This project includes `vercel.json`.

- Framework Preset: `Other`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist/white-bloom-media/browser`
- Root Directory: project root

## Meta Pixel and Conversions API

The browser Pixel is installed with pixel ID `1030487979387925`. Server-side
events are sent through `/api/meta-capi`.

Required Vercel environment variable:

```text
META_CAPI_ACCESS_TOKEN=Meta Conversions API access token
```

Optional Vercel environment variables:

```text
META_PIXEL_ID=1030487979387925
META_TEST_EVENT_CODE=Meta test events code
```

Tracked events:

- `PageView` on page load, browser and server, with event ID deduplication.
- `ViewContent` on page load, browser and server, with event ID deduplication.
- `Lead` after the Web3Forms inquiry succeeds, browser and server, with event ID deduplication.

## Notes before production

- Replace `public/assets/white-bloom/hero-concept.png` with real event content when available.
- Confirm domain, email, phone or WhatsApp, service area, package structure and form delivery.
- Replace coming-soon vertical video slots with real event videos and poster frames.
- Keep unconfirmed names, venues, client details and claims off the live site until approved.
