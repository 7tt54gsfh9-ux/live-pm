import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEED_UNITS } from '../data/seedUnits';
import {
  deleteUnit,
  resolveConfig,
  seedAllUnits,
  subscribeUnits,
  upsertUnit,
} from '../lib/firebase';
import { nextPmFromLast, todayISO, unitStatus, daysRemaining } from '../lib/dates';
import type { FirebaseWebConfig, StatusFilter, Unit } from '../types';

function sortUnits(list: Unit[]): Unit[] {
  return [...list].sort((a, b) => daysRemaining(a.nextPm) - daysRemaining(b.nextPm));
}

export function useUnits(config: FirebaseWebConfig | null) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!config) {
      setUnits([]);
      setConnected(false);
      return;
    }
    setError(null);
    const unsub = subscribeUnits(
      config,
      (list) => {
        setUnits(sortUnits(list));
        setConnected(true);
        setError(null);
      },
      (err) => {
        setConnected(false);
        setError(err.message || 'Firebase connection failed');
      },
    );
    return () => unsub();
  }, [config]);

  const counts = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    let onTrack = 0;
    for (const u of units) {
      const s = unitStatus(u.nextPm);
      if (s === 'overdue') overdue++;
      else if (s === 'dueSoon') dueSoon++;
      else onTrack++;
    }
    return { total: units.length, overdue, dueSoon, onTrack };
  }, [units]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((u) => {
      const status = unitStatus(u.nextPm);
      if (filter === 'overdue' && status !== 'overdue') return false;
      if (filter === 'dueSoon' && status !== 'dueSoon') return false;
      if (filter === 'onTrack' && status !== 'onTrack') return false;
      if (!q) return true;
      return (
        u.unitNumber.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.engineModel.toLowerCase().includes(q)
      );
    });
  }, [units, search, filter]);

  const optimisticReplace = useCallback((next: Unit) => {
    setUnits((prev) => sortUnits([...prev.filter((u) => u.id !== next.id), next]));
  }, []);

  const optimisticRemove = useCallback((id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const addUnit = useCallback(
    async (input: { unitNumber: string; engineModel: string; location: string; lastPm: string }) => {
      if (!config) throw new Error('No Firebase config');
      const id = input.unitNumber.trim();
      const unit: Unit = {
        id,
        unitNumber: input.unitNumber.trim(),
        engineModel: input.engineModel.trim(),
        location: input.location.trim(),
        lastPm: input.lastPm,
        nextPm: nextPmFromLast(input.lastPm),
      };
      optimisticReplace(unit);
      await upsertUnit(config, unit);
    },
    [config, optimisticReplace],
  );

  const logPm = useCallback(
    async (unit: Unit, lastPm = todayISO()) => {
      if (!config) throw new Error('No Firebase config');
      const next: Unit = { ...unit, lastPm, nextPm: nextPmFromLast(lastPm) };
      optimisticReplace(next);
      await upsertUnit(config, next);
    },
    [config, optimisticReplace],
  );

  const resetPm = useCallback(
    async (unit: Unit) => {
      // Reset 60-day clock from today
      return logPm(unit, todayISO());
    },
    [logPm],
  );

  const removeUnit = useCallback(
    async (id: string) => {
      if (!config) throw new Error('No Firebase config');
      optimisticRemove(id);
      await deleteUnit(config, id);
    },
    [config, optimisticRemove],
  );

  const loadStarterFleet = useCallback(async () => {
    if (!config) throw new Error('No Firebase config');
    setSeeding(true);
    try {
      await seedAllUnits(config, SEED_UNITS);
      setUnits(sortUnits(SEED_UNITS));
    } finally {
      setSeeding(false);
    }
  }, [config]);

  return {
    units,
    filtered,
    counts,
    connected,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    addUnit,
    logPm,
    resetPm,
    removeUnit,
    loadStarterFleet,
    seeding,
    isEmpty: connected && units.length === 0,
  };
}

export { resolveConfig };
