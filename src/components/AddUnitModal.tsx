import { useState, type FormEvent } from 'react';
import { todayISO } from '../lib/dates';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    unitNumber: string;
    engineModel: string;
    location: string;
    lastPm: string;
  }) => Promise<void>;
}

export function AddUnitModal({ open, onClose, onSave }: Props) {
  const [unitNumber, setUnitNumber] = useState('');
  const [engineModel, setEngineModel] = useState('');
  const [location, setLocation] = useState('');
  const [lastPm, setLastPm] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!unitNumber.trim()) {
      setError('Unit # is required');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({ unitNumber, engineModel, location, lastPm });
      setUnitNumber('');
      setEngineModel('');
      setLocation('');
      setLastPm(todayISO());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-forest-900 border border-forest-600 p-5 shadow-2xl space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Add unit</h2>
          <button type="button" onClick={onClose} className="text-forest-400 hover:text-white text-xl px-2">
            ×
          </button>
        </div>
        <label className="block text-sm">
          <span className="text-forest-300">Unit #</span>
          <input
            required
            className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="e.g. 8450"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-300">Engine model</span>
          <input
            className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={engineModel}
            onChange={(e) => setEngineModel(e.target.value)}
            placeholder="e.g. CAT 3306 NAC"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-300">Location</span>
          <input
            className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Pad / well name"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-300">Last PM</span>
          <input
            type="date"
            className="mt-1 w-full rounded-lg bg-forest-950 border border-forest-600 px-3 py-2"
            value={lastPm}
            onChange={(e) => setLastPm(e.target.value)}
          />
        </label>
        <p className="text-xs text-forest-400">Next PM is set to Last PM + 60 days.</p>
        {error && <p className="text-red-300 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 font-semibold disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Add unit'}
        </button>
      </form>
    </div>
  );
}
