import { useCallback, useEffect, useState } from 'react';
import {
  getNotifySupport,
  maybeNotifyOverdue,
  requestNotifyPermission,
  type NotifySupport,
} from '../lib/notifications';
import type { Unit } from '../types';

/**
 * Requests permission on user tap; checks overdue after sync + on visibility/focus.
 * Overdue only — not due-soon. Dedupes once per calendar day unless count rises.
 */
export function useOverdueNotifications(units: Unit[], connected: boolean) {
  const [support, setSupport] = useState<NotifySupport>(() => getNotifySupport());
  const [busy, setBusy] = useState(false);

  const refreshSupport = useCallback(() => {
    setSupport(getNotifySupport());
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const next = await requestNotifyPermission();
      setSupport(next);
      if (next === 'granted' && connected) {
        await maybeNotifyOverdue(units);
      }
    } finally {
      setBusy(false);
    }
  }, [connected, units]);

  // After Firebase sync (connected + units change), and when tab becomes visible/focused
  useEffect(() => {
    if (!connected || support !== 'granted') return;

    const run = () => {
      void maybeNotifyOverdue(units);
    };

    run();

    const onVis = () => {
      if (document.visibilityState === 'visible') run();
    };
    const onFocus = () => run();

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [units, connected, support]);

  // Keep support label in sync if user changes OS permission while app is open
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refreshSupport();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refreshSupport]);

  return { support, busy, enable, refreshSupport };
}
