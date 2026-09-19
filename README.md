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
- Mobile-first cream / black / red / green palette
- **Overdue notifications** (Web Notification API + PWA service worker; check-on-open)

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


## Overdue notifications

When any units are **overdue**, Live PM can alert you on this device (not due-soon).

1. Tap **Enable notifications** in the header (must be a user tap — browsers block silent permission prompts).
2. After Firebase sync (and when you reopen / focus the app), if ≥1 unit is overdue you get a notification such as `3 units overdue` (or a couple of unit numbers when few).
3. At most **once per calendar day per device**, unless the overdue count goes up (then it notifies again).
4. Clicking the notification focuses / opens the app at `/live-pm/`.

**iPhone:** Notifications only work after **Add to Home Screen** (Safari → Share → Add to Home Screen), then open the home-screen icon and tap Enable notifications. Plain Safari tabs cannot show web notifications.

**Limits (this version):** Alerts run when the app is open, focused, or freshly opened — they use the existing PWA service worker locally. **True push while the app is fully closed** needs Firebase Cloud Messaging (FCM) + a backend later; that is not required for this first version and stays on the free Spark stack without Cloud Functions.

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
