import { daysRemaining, formatShortDate, unitStatus } from '../lib/dates';
import type { Unit } from '../types';

interface Props {
  unit: Unit;
  onLogPm: (unit: Unit) => void;
  onEditLocation: (unit: Unit) => void;
  onRemove: (unit: Unit) => void;
}

export function UnitCard({ unit, onLogPm, onEditLocation, onRemove }: Props) {
  const days = daysRemaining(unit.nextPm);
  const status = unitStatus(unit.nextPm);
  const overdue = status === 'overdue';

  const badge =
    status === 'overdue'
      ? { label: 'Overdue', className: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' }
      : status === 'dueSoon'
        ? { label: 'Due soon', className: 'bg-amber-50 text-amber-800 border-amber-200' }
        : { label: 'On track', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

  const daysLabel = overdue
    ? `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
    : `${days} day${days === 1 ? '' : 's'} left`;

  const elapsed = 60 - days;
  const pct = Math.max(0, Math.min(100, (elapsed / 60) * 100));

  return (
    <article className="rounded-2xl bg-white border border-[#E4E4E7] p-4 shadow-md shadow-black/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-[#121212]">{unit.unitNumber}</h2>
          <button
            type="button"
            onClick={() => onEditLocation(unit)}
            className="mt-0.5 block text-left text-[#3F3F46] text-sm truncate max-w-full hover:text-black underline-offset-2 hover:underline"
            title="Edit location"
          >
            {unit.location || 'No location — tap to set'}
          </button>
          <p className="text-[#71717A] text-xs mt-0.5">{unit.engineModel}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p
            className={`text-3xl font-bold tabular-nums ${
              overdue ? 'text-[#B91C1C]' : status === 'dueSoon' ? 'text-amber-400' : 'text-emerald-600'
            }`}
          >
            {overdue ? `-${Math.abs(days)}` : days}
          </p>
          <p className="text-xs text-[#71717A] mt-0.5">{daysLabel}</p>
        </div>
        <div className="text-right text-xs text-[#52525B] space-y-1">
          <p>
            <span className="text-[#A1A1AA]">Last PM </span>
            {formatShortDate(unit.lastPm)}
          </p>
          <p>
            <span className="text-[#A1A1AA]">Next PM </span>
            {formatShortDate(unit.nextPm)}
          </p>
        </div>
      </div>

      <div
        className="mt-3 h-1.5 rounded-full bg-zinc-100 overflow-hidden"
        role="progressbar"
        aria-label="Days through 60-day interval"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${
            overdue ? 'bg-[#B91C1C]' : status === 'dueSoon' ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
          style={{ width: `${overdue ? 100 : pct}%` }}
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onLogPm(unit)}
          className="flex-1 rounded-xl bg-black hover:bg-[#1a1a1a] active:bg-black text-white py-2.5 text-sm font-semibold"
        >
          Log PM
        </button>
        <button
          type="button"
          onClick={() => onEditLocation(unit)}
          className="rounded-xl bg-zinc-100 hover:bg-zinc-200 px-3 py-2.5 text-sm font-medium text-[#18181B]"
          title="Edit location"
        >
          Move
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Remove unit ${unit.unitNumber}?`)) onRemove(unit);
          }}
          className="rounded-xl bg-zinc-100 hover:bg-[#FEE2E2] px-3 py-2.5 text-sm text-[#71717A] hover:text-[#991B1B]"
          title="Remove unit"
        >
          ✕
        </button>
      </div>
    </article>
  );
}
