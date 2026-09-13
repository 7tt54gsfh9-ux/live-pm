import { useEffect, useState, type FormEvent } from 'react';
import { addDays, formatShortDate, todayISO } from '../lib/dates';
import { PM_INTERVAL_DAYS, type Unit } from '../types';

interface Props {
  unit: Unit | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (unit: Unit, lastPm: string) => Promise<void>;
}

export function LogPmModal({ unit, open, onClose, onConfirm }: Props) {
  const [date, setDate] = useState(todayISO());
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(todayISO());
      setConfirming(false);
      setBusy(false);
      setError(null);
    }
  }, [open, unit?.id]);

  if (!open || !unit) return null;

  const nextPm = addDays(date, PM_INTERVAL_DAYS);

  function goNext(e: FormEvent) {
    e.preventDefault();
    if (!date) {
      setError('Pick a date');
      return;
    }
    setError(null);
    setConfirming(true);
  }

  async function submitConfirmed() {
    if (!unit) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm(unit, date);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log PM');
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-forest-900 border border-forest-600 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{confirming ? 'Confirm Log PM' : 'Log PM'}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-forest-400 hover:text-white text-xl px-2"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-forest-300">
          Unit <span className="font-semibold text-white">{unit.unitNumber}</span>
          {unit.location ? (
            <>
              {' '}
              · <span className="text-forest-200">{unit.location}</span>
            </>
          ) : null}
        </p>

        {!confirming ? (
          <form onSubmit={goNext} className="space-y-4">
            <label className="block text-sm">
              <span className="text-forest-300">PM completed on</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-3 text-base"
              />
            </label>
            <p className="text-xs text-forest-400">
              Next PM will be set to <span className="text-forest-200">{formatShortDate(nextPm)}</span> (
              {PM_INTERVAL_DAYS} days later).
            </p>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-forest-800 py-3 text-sm font-medium text-forest-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Are you sure you want to log PM for unit{' '}
              <span className="font-semibold">{unit.unitNumber}</span> on{' '}
              <span className="font-semibold">{formatShortDate(date)}</span>?
              <p className="mt-2 text-amber-100/80">
                Last PM → {formatShortDate(date)}. Next PM → {formatShortDate(nextPm)}. This updates for everyone.
              </p>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl bg-forest-800 py-3 text-sm font-medium text-forest-200 disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submitConfirmed()}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {busy ? 'Saving…' : "Yes, I'm sure"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
