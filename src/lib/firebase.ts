import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  remove,
  type Database,
} from 'firebase/database';
import { BAKED_FIREBASE_CONFIG, isConfigComplete } from '../firebaseConfig';
import type { FirebaseWebConfig, Unit } from '../types';

const LS_KEY = 'livePm.firebaseConfig';

export function loadStoredConfig(): FirebaseWebConfig | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FirebaseWebConfig;
    return isConfigComplete(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveStoredConfig(cfg: FirebaseWebConfig): void {
  localStorage.setItem(LS_KEY, JSON.stringify(cfg));
}

export function clearStoredConfig(): void {
  localStorage.removeItem(LS_KEY);
}

export function resolveConfig(): FirebaseWebConfig | null {
  const stored = loadStoredConfig();
  if (stored) return stored;
  if (isConfigComplete(BAKED_FIREBASE_CONFIG)) return BAKED_FIREBASE_CONFIG;
  return null;
}

let app: FirebaseApp | null = null;
let db: Database | null = null;
let activeConfigKey = '';

function configKey(cfg: FirebaseWebConfig): string {
  return `${cfg.projectId}|${cfg.databaseURL}|${cfg.appId}`;
}

export function getFirebase(cfg: FirebaseWebConfig): { app: FirebaseApp; db: Database } {
  const key = configKey(cfg);
  if (app && db && activeConfigKey === key) return { app, db };

  // Re-init if config changed (rare; Setup screen)
  if (getApps().length === 0) {
    app = initializeApp(cfg);
  } else if (activeConfigKey !== key) {
    // Firebase JS does not easily support re-init; use a named app
    app = initializeApp(cfg, `livepm-${Date.now()}`);
  } else {
    app = getApps()[0]!;
  }
  db = getDatabase(app);
  activeConfigKey = key;
  return { app, db };
}

export function unitsRef(database: Database) {
  return ref(database, 'livePm/units');
}

export function unitRef(database: Database, id: string) {
  return ref(database, `livePm/units/${id}`);
}

export function subscribeUnits(
  cfg: FirebaseWebConfig,
  onData: (units: Unit[]) => void,
  onError: (err: Error) => void,
): () => void {
  const { db: database } = getFirebase(cfg);
  const r = unitsRef(database);
  return onValue(
    r,
    (snap) => {
      const val = snap.val() as Record<string, Unit> | null;
      if (!val) {
        onData([]);
        return;
      }
      const list = Object.values(val).filter(Boolean) as Unit[];
      onData(list);
    },
    (err) => onError(err),
  );
}

export async function upsertUnit(cfg: FirebaseWebConfig, unit: Unit): Promise<void> {
  const { db: database } = getFirebase(cfg);
  await set(unitRef(database, unit.id), unit);
}

export async function patchUnit(
  cfg: FirebaseWebConfig,
  id: string,
  patch: Partial<Unit>,
): Promise<void> {
  const { db: database } = getFirebase(cfg);
  await update(unitRef(database, id), patch);
}

export async function deleteUnit(cfg: FirebaseWebConfig, id: string): Promise<void> {
  const { db: database } = getFirebase(cfg);
  await remove(unitRef(database, id));
}

export async function seedAllUnits(cfg: FirebaseWebConfig, units: Unit[]): Promise<void> {
  const { db: database } = getFirebase(cfg);
  const payload: Record<string, Unit> = {};
  for (const u of units) payload[u.id] = u;
  await set(unitsRef(database), payload);
}
