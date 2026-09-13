import type { FirebaseWebConfig } from './types';

/**
 * Paste your Firebase web app config here once you create a project
 * (see FIREBASE_SETUP.md). Until then, placeholders keep the Setup screen visible.
 *
 * Values are public-by-design for client apps; Realtime Database rules
 * restrict access to /livePm only.
 */
export const BAKED_FIREBASE_CONFIG: FirebaseWebConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

export function isConfigComplete(cfg: Partial<FirebaseWebConfig> | null | undefined): boolean {
  if (!cfg) return false;
  const required: (keyof FirebaseWebConfig)[] = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'appId',
  ];
  return required.every((k) => {
    const v = cfg[k];
    return typeof v === 'string' && v.trim().length > 0 && !v.startsWith('YOUR_');
  });
}
