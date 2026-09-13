# Live PM

Shared-fleet **compressor PM countdown** for phones. Free on GitHub Pages; shared state via **Firebase Realtime Database**.

**Live:** https://7tt54gsfh9-ux.github.io/live-pm/

## Features

- Unit list with search + filters (Overdue / Due soon / On track / All)
- Overdue counts and 60-day PM interval countdown
- Add unit, Log PM, Reset clock, Remove
- Fields: unit #, engine model, location, last PM, next PM, days remaining
- **Realtime multi-phone sync** (Firebase `onValue`)
- PWA with **green wrench** home-screen icon (180 / 192 / 512 / maskable)
- Mobile-first green theme (`#2D6A4F`)

## How sync works

1. Each browser loads Firebase web config (baked in `src/firebaseConfig.ts` **or** pasted on the Setup screen → `localStorage`).
2. Clients subscribe to `/livePm/units` with Realtime Database listeners.
3. Mutations write the same path; other phones update live.
4. Optimistic UI keeps taps snappy while sync catches up.

Does **not** depend on grok.me.

## First-time setup (Ivan)

See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for click-by-click free Spark steps:

1. Create Firebase project  
2. Enable Realtime Database  
3. Publish rules allowing read/write only under `/livePm`  
4. Copy web config → paste in Setup (or bake into `src/firebaseConfig.ts`)  
5. Tap **Load starter fleet** once  

Until config is set, the app shows a Setup gate.

## Add to Home Screen (wrench icon)

- **iPhone:** Safari → Share → Add to Home Screen  
- **Android:** Chrome → menu → Install app / Add to Home screen  

Icons: `public/icons/icon-{180,192,512}.png` + `icon-maskable-512.png`.

## Develop

```bash
cd live-pm-app   # or this repo root after deploy
npm install
npm run dev
```

Build for Pages (`base: '/live-pm/'`):

```bash
npm run build
# output in dist/ — publish to gh-pages
```

## Seed data

`src/data/seedUnits.ts` — ~41 units parsed from the previous Live PM mirror. Used only by **Load starter fleet** when Firebase is empty.

## Security rules (paste in Firebase console)

```json
{
  "rules": {
    "livePm": {
      ".read": true,
      ".write": true
    }
  }
}
```

## License / notes

Unofficial rebuild for field use. Free hosting on GitHub Pages; free Firebase Spark for sync.
