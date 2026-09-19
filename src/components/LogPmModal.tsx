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
      <div className="w-full max-w-md rounded-2xl bg-white border border-[#E4E4E7] p-5 shadow-2xl space-y-4 text-[#121212]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#121212]">{confirming ? 'Confirm Log PM' : 'Log PM'}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-[#71717A] hover:text-[#121212] text-xl px-2"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-[#71717A]">
          Unit <span className="font-semibold text-[#121212]">{unit.unitNumber}</span>
          {unit.location ? (
            <>
              {' '}
              · <span className="text-[#3F3F46]">{unit.location}</span>
            </>
          ) : null}
        </p>

        {!confirming ? (
          <form onSubmit={goNext} className="space-y-4">
            <label className="block text-sm">
              <span className="text-[#71717A]">PM completed on</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg bg-white border border-[#E4E4E7] px-3 py-3 text-base text-[#121212]"
              />
            </label>
            <p className="text-xs text-[#71717A]">
              Next PM will be set to <span className="text-[#3F3F46]">{formatShortDate(nextPm)}</span> (
              {PM_INTERVAL_DAYS} days later).
            </p>
            {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-medium text-[#3F3F46]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-black hover:bg-[#1a1a1a] text-white py-3 text-sm font-semibold"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Are you sure you want to log PM for unit{' '}
              <span className="font-semibold">{unit.unitNumber}</span> on{' '}
              <span className="font-semibold">{formatShortDate(date)}</span>?
              <p className="mt-2 text-amber-800/80">
                Last PM → {formatShortDate(date)}. Next PM → {formatShortDate(nextPm)}. This updates for everyone.
              </p>
            </div>
            {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-medium text-[#3F3F46] disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submitConfirmed()}
                className="flex-1 rounded-xl bg-black hover:bg-[#1a1a1a] text-white py-3 text-sm font-semibold disabled:opacity-60"
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
