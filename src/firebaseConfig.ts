import type { FirebaseWebConfig } from './types';

/**
 * Firebase web config for project live-pm.
 * Client values are public-by-design; Realtime Database rules gate /livePm.
 */
export const BAKED_FIREBASE_CONFIG: FirebaseWebConfig = {
  apiKey: 'AIzaSyAdCWdCTXCrYdowrY-h93pifFUgoazjq84',
  authDomain: 'live-pm.firebaseapp.com',
  databaseURL: 'https://live-pm-default-rtdb.firebaseio.com',
  projectId: 'live-pm',
  storageBucket: 'live-pm.firebasestorage.app',
  messagingSenderId: '924457889076',
  appId: '1:924457889076:web:dd8be56c18c8a8b7224961',
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
