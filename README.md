# Live PM

Static mirror of **Live PM** — a shared-fleet countdown tracker for compressor unit preventive maintenance.

Original host: `https://sail-reef-beacon-topaz.grok.me/`

## What it is

A Vite / TanStack Start SPA that lists fleet compressor units with:

- Unit number, engine model, location
- Last PM / next PM dates and day countdown
- Filters (all / overdue / due soon / etc.) and search
- UI to add units, log PM, or reset the 60-day clock

## Standalone / offline status

This GitHub Pages build is a **static snapshot**:

| Works offline | Needs original grok.me host |
|---|---|
| Browse the unit list (SSR-embedded snapshot) | Live refetch every few seconds |
| Search / filter / sort in the UI | Add unit / Log PM / Reset / Remove (server functions) |
| Basic PWA shell (manifest + icon) | Grok App Builder extensions |

Mutations and live sync call TanStack `/_serverFn/*` on the original host. Those APIs are not available on GitHub Pages (and are not CORS-open to `github.io`), so write actions will fail here. For full live behavior, use the original URL.

## GitHub Pages

Published at: **https://7tt54gsfh9-ux.github.io/live-pm/**

## Local preview

Serve the repo root (or `gh-pages` contents) under the `/live-pm/` base path, e.g.:

```bash
npx --yes serve -p 4173 .
# then open http://localhost:4173/live-pm/
```

Or with Python from parent:

```bash
cd /workspace && python3 -m http.server 4173
# open http://localhost:4173/live-pm/
```

## Mirror notes

- Asset paths rewritten for base `/live-pm/`
- Router `basepath` set to `/live-pm`
- `grok.com/.../extensions.js` removed
- Client refetch disabled so the embedded unit snapshot stays visible without the API
- Do not commit GitHub tokens

## License / provenance

Unofficial static mirror for archival / demo. Data and branding originate from the Grok-hosted app.
