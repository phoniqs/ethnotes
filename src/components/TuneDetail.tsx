import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, FolderTree, Layers, MapPin, Music2, Pencil, RefreshCw, StickyNote, Tag, Trash2 } from 'lucide-react';
import AbcSheet from '@/components/AbcSheet';
import ErrorBoundary from '@/components/ErrorBoundary';
import FlagStripe from '@/components/FlagStripe';
import { resolveFlag } from '@/lib/flags';
import { extractOriginFromAbc } from '@/lib/abc';
import type { Tune, TuneSetting } from '@/types';

interface TuneDetailProps {
  tune: Tune;
  siblingTunes: Tune[];
  settings: TuneSetting[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReparse: () => void;
}

interface VersionTab {
  label: string;
  author: string | null;
  key: string;
  abc: string;
  tuneId: string;
  tune: Tune;
}

function extractAuthorFromAbc(abc: string): string | null {
  const match = abc.match(/^\s*Z:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractKeyFromAbc(abc: string): string {
  const match = abc.match(/^\s*K:\s*(.+)$/m);
  return match ? match[1].trim() : '';
}

export default function TuneDetail({ tune, siblingTunes, settings, onBack, onEdit, onDelete, onReparse }: TuneDetailProps) {
  const [showSheet, setShowSheet] = useState(false);
  const [activeVersion, setActiveVersion] = useState(0);
  const [reparsing, setReparsing] = useState(false);

  useEffect(() => {
    setShowSheet(false);
    setActiveVersion(0);
  }, [tune.id]);

  async function handleReparse() {
    setReparsing(true);
    try { await onReparse(); } finally { setReparsing(false); }
  }

  if (!tune || !tune.title) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="mb-4 text-wood-500 dark:text-parchment-200/70">This tune could not be found.</p>
        <button onClick={onBack} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">Back to library</button>
      </div>
    );
  }

  const tabs: VersionTab[] = [];
  const typeCounters = new Map<string, number>();

  for (const t of siblingTunes) {
    const typeKey = t.type.toLowerCase();
    const count = (typeCounters.get(typeKey) ?? 0) + 1;
    typeCounters.set(typeKey, count);

    const label = siblingTunes.filter((s) => s.type.toLowerCase() === typeKey).length > 1
      ? `${t.type} ${count}`
      : t.type;

    const firstAuthor = extractAuthorFromAbc(t.abc);
    const firstKey = extractKeyFromAbc(t.abc) || t.key;

    tabs.push({ label, author: firstAuthor, key: firstKey, abc: t.abc || '', tuneId: t.id, tune: t });

    const tuneSettings = settings
      .filter((s) => s.tune_id === t.id)
      .sort((a, b) => a.setting_number - b.setting_number);

    for (let i = 0; i < tuneSettings.length; i++) {
      const s = tuneSettings[i];
      tabs.push({
        label: `${t.type} ${count}.${i + 2}`,
        author: s.author,
        key: s.key,
        abc: s.abc,
        tuneId: t.id,
        tune: t,
      });
    }
  }

  const current = tabs[activeVersion] ?? tabs[0];
  const hasMultiple = tabs.length > 1;
  const currentOrigin = extractOriginFromAbc(current.abc);
  const flag = resolveFlag(currentOrigin, current.tune.group, current.tune.region);
  const flagColor = flag.type !== 'none' ? flag.colors[0] : '#b45309';
  const activeTune = current.tune;
  const activeOrigin = extractOriginFromAbc(current.abc);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800">
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => void handleReparse()} disabled={reparsing} className="inline-flex items-center gap-2 rounded-lg border border-wood-200 px-3 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 disabled:opacity-50 dark:border-wood-700 dark:text-parchment-200 dark:hover:bg-wood-800">
            <RefreshCw className={`h-4 w-4 ${reparsing ? 'animate-spin' : ''}`} />
            Re-parse
          </button>
          <button onClick={onDelete} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button onClick={onEdit} className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-parchment-50 shadow-sm transition hover:bg-amber-800">
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      <header className="mb-5">
        {flag.type !== 'none' && <FlagStripe origin={activeOrigin} region={activeTune.region} group={activeTune.group} className="mb-4 h-4" />}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{current.label}</span>
          <span className="inline-flex items-center gap-1 text-sm text-wood-500 dark:text-parchment-200/70"><Music2 className="h-4 w-4" />{current.key || activeTune.key}</span>
          {activeTune.region && <span className="inline-flex items-center gap-1 text-sm text-wood-500 dark:text-parchment-200/70"><MapPin className="h-4 w-4" />{activeTune.region}</span>}
          {activeTune.group && <span className="inline-flex items-center gap-1 text-sm text-wood-500 dark:text-parchment-200/70"><FolderTree className="h-4 w-4" />{activeTune.group}</span>}
          {hasMultiple && <span className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-300"><Layers className="h-4 w-4" />{tabs.length} versions</span>}
        </div>
        <h1 className="font-display text-3xl font-semibold text-wood-800 dark:text-parchment-100 sm:text-4xl">{tune.title}</h1>
        {(activeTune.tags ?? []).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(activeTune.tags ?? []).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {hasMultiple && (
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => { setActiveVersion(index); setShowSheet(false); }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${index === activeVersion ? 'bg-amber-700 text-parchment-50 shadow-sm' : 'border border-wood-200 bg-parchment-50 text-wood-600 hover:border-amber-400 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-200'}`}
            >
              {tab.label}{tab.author ? ` — ${tab.author}` : ''}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-wood-200 bg-parchment-50 shadow-sheet dark:border-wood-700 dark:bg-wood-900 sm:p-7" style={{ borderLeftWidth: '4px', borderLeftColor: flagColor, paddingLeft: '1.25rem' }}>
        <div className="p-5 sm:p-0">
        <button
          onClick={() => setShowSheet((value) => !value)}
          className="mb-4 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-parchment-50 shadow-sm transition hover:bg-amber-800"
        >
          {showSheet ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showSheet ? 'Hide sheet music' : 'Show sheet music'}
        </button>

        {showSheet ? (
          <ErrorBoundary>
            <AbcSheet abc={current.abc || ''} showAudio />
          </ErrorBoundary>
        ) : (
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">
              <Music2 className="h-3.5 w-3.5 text-amber-600" />
              ABC notation
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl border border-wood-200 bg-wood-900 p-4 font-mono text-sm leading-relaxed text-parchment-100 dark:border-wood-700">{current.abc || '(no notation)'}</pre>
          </div>
        )}
        </div>
      </div>

      {activeTune.notes && (
        <div className="mt-6 rounded-2xl border border-wood-200 bg-parchment-50 p-5 dark:border-wood-700 dark:bg-wood-900">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">
            <StickyNote className="h-3.5 w-3.5 text-amber-600" />
            Notes
          </div>
          <p className="whitespace-pre-wrap leading-relaxed text-wood-700 dark:text-parchment-100/90">{activeTune.notes}</p>
        </div>
      )}
    </div>
  );
}
