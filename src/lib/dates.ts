import { DUE_SOON_DAYS, PM_INTERVAL_DAYS, type UnitStatus } from '../types';

/** Parse YYYY-MM-DD as local calendar date (noon avoids DST edge issues). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** Whole days from today to nextPm (negative = overdue). */
export function daysRemaining(nextPm: string, today = new Date()): number {
  const a = parseISODate(toISODate(today));
  const b = parseISODate(nextPm);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

export function unitStatus(nextPm: string, today = new Date()): UnitStatus {
  const days = daysRemaining(nextPm, today);
  if (days < 0) return 'overdue';
  if (days <= DUE_SOON_DAYS) return 'dueSoon';
  return 'onTrack';
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatHeaderDate(d = new Date()): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function nextPmFromLast(lastPm: string): string {
  return addDays(lastPm, PM_INTERVAL_DAYS);
}
