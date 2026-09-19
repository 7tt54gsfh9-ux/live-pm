import { unitStatus } from './dates';
import type { Unit } from '../types';

const STORAGE_KEY = 'livePm.overdueNotify';
const APP_PATH = '/live-pm/';
const ICON_PATH = '/live-pm/icons/icon-192-v3.png';

export type NotifySupport =
  | 'unsupported'
  | 'needs-install' // iOS Safari without A2HS — Notification missing
  | 'default'
  | 'granted'
  | 'denied';

interface StoredNotify {
  date: string; // YYYY-MM-DD local
  count: number;
}

function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function readStored(): StoredNotify | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredNotify;
    if (typeof parsed?.date !== 'string' || typeof parsed?.count !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(date: string, count: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, count }));
  } catch {
    /* quota / private mode */
  }
}

/** Whether we should fire a notification for this overdue count today. */
export function shouldNotifyOverdue(count: number): boolean {
  if (count < 1) return false;
  const today = localDateKey();
  const prev = readStored();
  if (!prev || prev.date !== today) return true;
  // Same day: only notify again if overdue count increased
  return count > prev.count;
}

export function markNotified(count: number): void {
  writeStored(localDateKey(), count);
}

export function getOverdueUnits(units: Unit[]): Unit[] {
  return units.filter((u) => unitStatus(u.nextPm) === 'overdue');
}

export function buildOverdueBody(overdue: Unit[]): string {
  const n = overdue.length;
  if (n === 0) return '';
  if (n <= 3) {
    const nums = overdue.map((u) => u.unitNumber).join(', ');
    return n === 1 ? `Unit ${nums} overdue` : `Units ${nums} overdue`;
  }
  return `${n} units overdue`;
}

export function getNotifySupport(): NotifySupport {
  if (typeof window === 'undefined') return 'unsupported';
  // iOS Safari (not installed PWA): Notification is undefined
  if (!('Notification' in window)) {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) return 'needs-install';
    return 'unsupported';
  }
  const perm = Notification.permission;
  if (perm === 'granted') return 'granted';
  if (perm === 'denied') return 'denied';
  return 'default';
}

/** Must be called from a user gesture. */
export async function requestNotifyPermission(): Promise<NotifySupport> {
  if (!('Notification' in window)) return getNotifySupport();
  try {
    await Notification.requestPermission();
  } catch {
    /* ignore */
  }
  return getNotifySupport();
}

async function showViaServiceWorker(title: string, body: string): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg?.showNotification) return false;
    await reg.showNotification(title, {
      body,
      icon: ICON_PATH,
      badge: ICON_PATH,
      tag: 'live-pm-overdue',
      renotify: true,
      data: { url: APP_PATH },
    } as NotificationOptions);
    return true;
  } catch {
    return false;
  }
}

function showViaNotificationCtor(title: string, body: string): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    const n = new Notification(title, {
      body,
      icon: ICON_PATH,
      tag: 'live-pm-overdue',
      data: { url: APP_PATH },
    });
    n.onclick = () => {
      try {
        window.focus();
      } catch {
        /* ignore */
      }
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

/**
 * Show overdue notification if permission granted and dedupe allows.
 * Returns true if a notification was shown.
 */
export async function maybeNotifyOverdue(units: Unit[]): Promise<boolean> {
  if (getNotifySupport() !== 'granted') return false;
  const overdue = getOverdueUnits(units);
  const count = overdue.length;
  if (!shouldNotifyOverdue(count)) return false;

  const body = buildOverdueBody(overdue);
  const viaSw = await showViaServiceWorker('Live PM', body);
  const shown = viaSw || showViaNotificationCtor('Live PM', body);
  if (shown) markNotified(count);
  return shown;
}
