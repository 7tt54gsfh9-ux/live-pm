import { useMemo, useState } from 'react';
import { AddUnitModal } from './components/AddUnitModal';
import { LogPmModal } from './components/LogPmModal';
import { EditLocationModal } from './components/EditLocationModal';
import { SetupScreen } from './components/SetupScreen';
import { UnitCard } from './components/UnitCard';
import { clearStoredConfig, resolveConfig } from './lib/firebase';
import { formatHeaderDate } from './lib/dates';
import { useUnits } from './hooks/useUnits';
import { SEED_UNITS } from './data/seedUnits';
import type { FirebaseWebConfig, StatusFilter, Unit } from './types';

const FILTERS: { id: StatusFilter; label: string; countKey: 'total' | 'overdue' | 'dueSoon' | 'onTrack' }[] = [
  { id: 'overdue', label: 'Overdue', countKey: 'overdue' },
  { id: 'dueSoon', label: 'Due soon', countKey: 'dueSoon' },
  { id: 'onTrack', label: 'On track', countKey: 'onTrack' },
  { id: 'all', label: 'All', countKey: 'total' },
];

export default function App() {
  const [config, setConfig] = useState<FirebaseWebConfig | null>(() => resolveConfig());
  const [addOpen, setAddOpen] = useState(false);
  const [logUnit, setLogUnit] = useState<Unit | null>(null);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const {
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
    updateLocation,
    removeUnit,
    loadStarterFleet,
    seeding,
    isEmpty,
  } = useUnits(config);

  const headerDate = useMemo(() => formatHeaderDate(), []);

  if (!config) {
    return <SetupScreen onConfigured={setConfig} />;
  }

  return (
    <div className="min-h-dvh bg-forest-950 text-white pb-8">
      <header className="sticky top-0 z-40 border-b border-forest-800/80 bg-forest-950/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400/90 font-semibold">Shared fleet</p>
              <h1 className="text-2xl font-bold tracking-tight">Live PM</h1>
              <p className="text-forest-400 text-sm">{headerDate}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums leading-none">{counts.total}</p>
              <p className="text-xs text-forest-400">units</p>
              <p className="mt-1 text-sm">
                <span className="text-red-400 font-semibold tabular-nums">{counts.overdue}</span>
                <span className="text-forest-400"> overdue</span>
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${
                connected ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              {connected ? 'Live sync' : 'Connecting…'}
            </span>
            <button
              type="button"
              className="text-forest-500 hover:text-forest-300 underline-offset-2 hover:underline ml-auto"
              onClick={() => {
                if (confirm('Clear Firebase config on this device and reopen Setup?')) {
                  clearStoredConfig();
                  setConfig(null);
                }
              }}
            >
              Setup
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-300 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="mt-3 relative">
            <input
              type="search"
              placeholder="Search unit, location, engine"
              aria-label="Search units"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-forest-900 border border-forest-700 px-3 py-2.5 text-sm placeholder:text-forest-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              const n = counts[f.countKey];
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium border transition ${
                    active
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-forest-900 border-forest-700 text-forest-200 hover:border-forest-500'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 tabular-nums ${active ? 'text-emerald-100' : 'text-forest-400'}`}>{n}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Add unit"
            onClick={() => setAddOpen(true)}
            className="mt-3 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-base font-bold shadow-lg shadow-emerald-900/30"
          >
            + Add unit
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 space-y-3">
        {isEmpty && (
          <div className="rounded-2xl border border-dashed border-forest-600 bg-forest-900/40 p-6 text-center space-y-3">
            <p className="text-forest-200 font-medium">Fleet is empty</p>
            <p className="text-sm text-forest-400">
              Load the starter fleet ({SEED_UNITS.length} units from the previous Live PM snapshot), or add units manually.
            </p>
            <button
              type="button"
              disabled={seeding}
              onClick={() => void loadStarterFleet()}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {seeding ? 'Loading…' : 'Load starter fleet'}
            </button>
          </div>
        )}

        {filtered.map((u) => (
          <UnitCard
            key={u.id}
            unit={u}
            onLogPm={(unit) => setLogUnit(unit)}
            onEditLocation={(unit) => setEditUnit(unit)}
            onReset={(unit) => {
              if (confirm(`Reset PM clock for ${unit.unitNumber} from today?`)) void resetPm(unit);
            }}
            onRemove={(unit) => void removeUnit(unit.id)}
          />
        ))}

        {!isEmpty && filtered.length === 0 && (
          <p className="text-center text-forest-400 py-10 text-sm">No units match this search / filter.</p>
        )}
      </main>

      <AddUnitModal open={addOpen} onClose={() => setAddOpen(false)} onSave={addUnit} />
      <LogPmModal
        open={logUnit !== null}
        unit={logUnit}
        onClose={() => setLogUnit(null)}
        onConfirm={async (unit, lastPm) => {
          await logPm(unit, lastPm);
        }}
      />
      <EditLocationModal
        open={editUnit !== null}
        unit={editUnit}
        onClose={() => setEditUnit(null)}
        onSave={async (unit, location) => {
          await updateLocation(unit, location);
        }}
      />
    </div>
  );
}
