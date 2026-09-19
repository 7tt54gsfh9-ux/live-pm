import type { NotifySupport } from '../lib/notifications';

interface Props {
  support: NotifySupport;
  busy: boolean;
  onEnable: () => void;
}

export function NotifyControl({ support, busy, onEnable }: Props) {
  if (support === 'unsupported') {
    return (
      <p className="text-[11px] text-zinc-500 leading-snug max-w-[11rem] text-right">
        Notifications not supported in this browser.
      </p>
    );
  }

  if (support === 'needs-install') {
    return (
      <p className="text-[11px] text-zinc-500 leading-snug max-w-[12rem] text-right">
        Add to Home Screen (Share → Add) to enable overdue alerts on iPhone.
      </p>
    );
  }

  if (support === 'denied') {
    return (
      <p className="text-[11px] text-zinc-500 leading-snug max-w-[11rem] text-right">
        Notifications blocked — enable in system Settings for this site.
      </p>
    );
  }

  if (support === 'granted') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
        Alerts on
      </span>
    );
  }

  // default — permission not yet asked
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onEnable}
      className="rounded-full border border-zinc-600 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 px-2.5 py-1 text-xs font-medium disabled:opacity-60"
    >
      {busy ? '…' : 'Enable notifications'}
    </button>
  );
}
