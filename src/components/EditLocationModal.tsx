import { useEffect, useState, type FormEvent } from 'react';
import type { Unit } from '../types';

interface Props {
  unit: Unit | null;
  open: boolean;
  onClose: () => void;
  onSave: (unit: Unit, location: string) => Promise<void>;
}

export function EditLocationModal({ unit, open, onClose, onSave }: Props) {
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && unit) {
      setLocation(unit.location);
      setBusy(false);
      setError(null);
    }
  }, [open, unit]);

  if (!open || !unit) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!unit) return;
    const next = location.trim();
    if (!next) {
      setError('Location is required');
      return;
    }
    if (next === unit.location.trim()) {
      onClose();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave(unit, next);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white border border-[#E4E4E7] p-5 shadow-2xl space-y-4 text-[#121212]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#121212]">Edit location</h2>
          <button type="button" onClick={onClose} disabled={busy} className="text-[#71717A] hover:text-[#121212] text-xl px-2">
            ×
          </button>
        </div>
        <p className="text-sm text-[#71717A]">
          Unit <span className="font-semibold text-[#121212]">{unit.unitNumber}</span>
          {unit.engineModel ? (
            <>
              {' '}
              · <span className="text-[#71717A]">{unit.engineModel}</span>
            </>
          ) : null}
        </p>
        <label className="block text-sm">
          <span className="text-[#71717A]">New location</span>
          <input
            required
            autoFocus
            className="mt-1 w-full rounded-lg bg-white border border-[#E4E4E7] px-3 py-3 text-base text-[#121212]"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Pad / site name"
          />
        </label>
        {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-medium text-[#3F3F46] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 rounded-xl bg-black hover:bg-[#1a1a1a] text-white py-3 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save location'}
          </button>
        </div>
      </form>
    </div>
  );
}
