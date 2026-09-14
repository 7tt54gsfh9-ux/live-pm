import { daysRemaining, formatShortDate, unitStatus } from '../lib/dates';
import type { Unit } from '../types';

interface Props {
  unit: Unit;
  onLogPm: (unit: Unit) => void;
  onEditLocation: (unit: Unit) => void;
  onReset: (unit: Unit) => void;
  onRemove: (unit: Unit) => void;
}

export function UnitCard({ unit, onLogPm, onEditLocation, onReset, onRemove }: Props) {
  const days = daysRemaining(unit.nextPm);
  const status = unitStatus(unit.nextPm);
  const overdue = status === 'overdue';

  const badge =
    status === 'overdue'
      ? { label: 'Overdue', className: 'bg-red-500/20 text-red-300 border-red-500/40' }
      : status === 'dueSoon'
        ? { label: 'Due soon', className: 'bg-amber-500/20 text-amber-200 border-amber-500/40' }
        : { label: 'On track', className: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' };

  const daysLabel = overdue
    ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
    : `${days} day${days === 1 ? '' : 's'} left`;

  const elapsed = 60 - days;
  const pct = Math.max(0, Math.min(100, (elapsed / 60) * 100));

  return (
    <article className="rounded-2xl bg-forest-900/90 border border-forest-700/80 p-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-white">{unit.unitNumber}</h2>
          <button
            type="button"
            onClick={() => onEditLocation(unit)}
            className="mt-0.5 block text-left text-forest-200 text-sm truncate max-w-full hover:text-emerald-300 underline-offset-2 hover:underline"
            title="Edit location"
          >
            {unit.location || 'No location — tap to set'}
          </button>
          <p className="text-forest-400 text-xs mt-0.5">{unit.engineModel}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p
            className={`text-3xl font-bold tabular-nums ${
              overdue ? 'text-red-400' : status === 'dueSoon' ? 'text-amber-300' : 'text-emerald-300'
            }`}
          >
            {overdue ? `-${Math.abs(days)}` : days}
          </p>
          <p className="text-xs text-forest-400 mt-0.5">{daysLabel}</p>
        </div>
        <div className="text-right text-xs text-forest-300 space-y-1">
          <p>
            <span className="text-forest-500">Last PM </span>
            {formatShortDate(unit.lastPm)}
          </p>
          <p>
            <span className="text-forest-500">Next PM </span>
            {formatShortDate(unit.nextPm)}
          </p>
        </div>
      </div>

      <div
        className="mt-3 h-1.5 rounded-full bg-forest-800 overflow-hidden"
        role="progressbar"
        aria-label="Days through 60-day interval"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${
            overdue ? 'bg-red-500' : status === 'dueSoon' ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${overdue ? 100 : pct}%` }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onLogPm(unit)}
          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 py-2.5 text-sm font-semibold"
        >
          Log PM
        </button>
        <button
          type="button"
          onClick={() => onEditLocation(unit)}
          className="rounded-xl bg-forest-700 hover:bg-forest-600 px-3 py-2.5 text-sm font-medium text-forest-100"
          title="Edit location"
        >
          Move
        </button>
        <button
          type="button"
          onClick={() => onReset(unit)}
          className="rounded-xl bg-forest-700 hover:bg-forest-600 px-3 py-2.5 text-sm font-medium text-forest-100"
          title="Reset 60-day clock from today"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Remove unit ${unit.unitNumber}?`)) onRemove(unit);
          }}
          className="rounded-xl bg-forest-800 hover:bg-red-900/60 px-3 py-2.5 text-sm text-forest-300 hover:text-red-200"
          title="Remove unit"
        >
          ✕
        </button>
      </div>
    </article>
  );
}
