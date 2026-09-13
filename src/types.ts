export interface Unit {
  id: string;
  unitNumber: string;
  engineModel: string;
  location: string;
  /** ISO date YYYY-MM-DD */
  lastPm: string;
  /** ISO date YYYY-MM-DD */
  nextPm: string;
}

export type StatusFilter = 'all' | 'overdue' | 'dueSoon' | 'onTrack';

export type UnitStatus = 'overdue' | 'dueSoon' | 'onTrack';

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export const PM_INTERVAL_DAYS = 60;
export const DUE_SOON_DAYS = 30;
