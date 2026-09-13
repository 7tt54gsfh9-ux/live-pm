# Firebase setup for Live PM (free Spark plan)

Live PM syncs the shared fleet through **Firebase Realtime Database**. Do this once; then paste the web config into the app’s Setup screen (or into `src/firebaseConfig.ts` and rebuild).

## 1. Create a project

1. Open [Firebase Console](https://console.firebase.google.com/).
2. **Add project** → name it e.g. `live-pm` → continue.
3. Disable Google Analytics if you don’t need it → **Create project**.

## 2. Enable Realtime Database

1. Left menu → **Build** → **Realtime Database**.
2. **Create Database**.
3. Pick a region close to your crew (e.g. `us-central1`).
4. Start in **locked mode** → Enable.

You’ll get a URL like `https://YOUR_PROJECT-default-rtdb.firebaseio.com`.

## 3. Paste security rules

1. Open the **Rules** tab.
2. Replace everything with:

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

3. Click **Publish**.

These rules allow anyone with the app to read/write **only** under `/livePm` (units live at `/livePm/units/{id}`). The rest of the database stays locked. This matches a small trusted crew on a free app; tighten later with Auth if needed.

## 4. Register a web app & copy config

1. Gear icon → **Project settings**.
2. Under **Your apps** → **Add app** → **Web** (`</>`).
3. Nickname e.g. `Live PM` → Register (Hosting optional — skip; we use GitHub Pages).
4. Copy the `firebaseConfig` object. It looks like:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "....firebaseapp.com",
  databaseURL: "https://....firebaseio.com",
  projectId: "...",
  storageBucket: "....appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

## 5. Connect Live PM

**Option A — Setup screen (fastest)**  
Open https://7tt54gsfh9-ux.github.io/live-pm/ → paste the JSON → **Save & connect**. Config is stored in that browser’s `localStorage`.

**Option B — Bake into the build**  
Edit `src/firebaseConfig.ts`, replace the `YOUR_*` placeholders, commit, rebuild, and redeploy Pages. Then every phone works without Setup.

## 6. Load the fleet

When the database is empty, tap **Load starter fleet** (~41 units from the previous Live PM snapshot). After that, add / log / reset / remove on any phone — others update live via `onValue`.

## Data shape

```
/livePm/units/{id}
  id, unitNumber, engineModel, location, lastPm, nextPm
```

`nextPm` = `lastPm` + 60 days. Countdown is computed on the client.

## Cost

Spark (free) Realtime Database is enough for a small fleet and light sync. No credit card required for Spark.
