import { useState } from 'react';
import { BAKED_FIREBASE_CONFIG, isConfigComplete } from '../firebaseConfig';
import { saveStoredConfig } from '../lib/firebase';
import type { FirebaseWebConfig } from '../types';

const EMPTY: FirebaseWebConfig = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

interface Props {
  onConfigured: (cfg: FirebaseWebConfig) => void;
}

export function SetupScreen({ onConfigured }: Props) {
  const [fields, setFields] = useState<FirebaseWebConfig>({ ...EMPTY });
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'json' | 'fields'>('json');

  function applyConfig(cfg: FirebaseWebConfig) {
    if (!isConfigComplete(cfg)) {
      setError('Config looks incomplete — check apiKey, databaseURL, projectId, appId.');
      return;
    }
    saveStoredConfig(cfg);
    onConfigured(cfg);
  }

  function handlePasteJson() {
    try {
      let raw = jsonText.trim();
      // Allow pasting the firebaseConfig snippet with const firebaseConfig = {...}
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON object found');
      raw = match[0];
      // Strip trailing commas that JS allows but JSON does not
      raw = raw.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(raw) as FirebaseWebConfig;
      applyConfig(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  function handleFields() {
    applyConfig(fields);
  }

  const bakedReady = isConfigComplete(BAKED_FIREBASE_CONFIG);

  return (
    <div className="min-h-dvh bg-[#F7F5F0] text-[#121212] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" className="h-14 w-14 rounded-2xl shadow-lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#121212]">Live PM Setup</h1>
            <p className="text-[#71717A] text-sm">Connect free Firebase Realtime Database for shared sync</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E4E4E7] p-5 space-y-4 shadow-xl shadow-black/5">
          <p className="text-sm text-[#3F3F46] leading-relaxed">
            Live PM stores the fleet in Firebase so every phone sees the same units.
            Create a free Spark project, enable Realtime Database, paste the rules from{' '}
            <code className="text-[#121212] font-semibold">FIREBASE_SETUP.md</code>, then paste your web config below.
          </p>

          {bakedReady && (
            <button
              type="button"
              className="w-full rounded-xl bg-black hover:bg-[#1a1a1a] text-white py-3 font-semibold"
              onClick={() => applyConfig(BAKED_FIREBASE_CONFIG)}
            >
              Use baked-in config
            </button>
          )}

          <div className="flex gap-2 text-sm">
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 border ${
                mode === 'json'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-[#3F3F46] border-[#E4E4E7]'
              }`}
              onClick={() => setMode('json')}
            >
              Paste JSON
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg py-2 border ${
                mode === 'fields'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-[#3F3F46] border-[#E4E4E7]'
              }`}
              onClick={() => setMode('fields')}
            >
              Fill fields
            </button>
          </div>

          {mode === 'json' ? (
            <>
              <textarea
                className="w-full h-48 rounded-xl bg-white border border-[#E4E4E7] p-3 text-sm font-mono text-[#121212] placeholder:text-[#A1A1AA]"
                placeholder={`{\n  "apiKey": "...",\n  "authDomain": "...",\n  "databaseURL": "...",\n  "projectId": "...",\n  "appId": "..."\n}`}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
              <button
                type="button"
                className="w-full rounded-xl bg-black hover:bg-[#1a1a1a] text-white py-3 font-semibold"
                onClick={handlePasteJson}
              >
                Save &amp; connect
              </button>
            </>
          ) : (
            <>
              {(
                [
                  ['apiKey', 'API Key'],
                  ['authDomain', 'Auth Domain'],
                  ['databaseURL', 'Database URL'],
                  ['projectId', 'Project ID'],
                  ['appId', 'App ID'],
                  ['storageBucket', 'Storage Bucket (optional)'],
                  ['messagingSenderId', 'Messaging Sender ID (optional)'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-sm">
                  <span className="text-[#3F3F46]">{label}</span>
                  <input
                    className="mt-1 w-full rounded-lg bg-white border border-[#E4E4E7] px-3 py-2 text-sm text-[#121212]"
                    value={fields[key] ?? ''}
                    onChange={(e) => setFields((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </label>
              ))}
              <button
                type="button"
                className="w-full rounded-xl bg-black hover:bg-[#1a1a1a] text-white py-3 font-semibold"
                onClick={handleFields}
              >
                Save &amp; connect
              </button>
            </>
          )}

          {error && <p className="text-[#B91C1C] text-sm">{error}</p>}
        </div>

        <ol className="mt-6 text-sm text-[#71717A] space-y-2 list-decimal list-inside">
          <li>Open console.firebase.google.com → Create project (Spark / free)</li>
          <li>Build → Realtime Database → Create database (start in locked mode)</li>
          <li>Rules tab → paste rules from FIREBASE_SETUP.md → Publish</li>
          <li>Project settings → Your apps → Web → copy firebaseConfig</li>
          <li>Paste here (saved in this browser’s localStorage)</li>
        </ol>
      </div>
    </div>
  );
}
