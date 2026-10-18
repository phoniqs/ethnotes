import { useMemo, useState } from 'react';
import { AlertTriangle, Music4, Plus, Search, Trash2 } from 'lucide-react';
import TuneCard from '@/components/TuneCard';
import type { Tune, TuneType } from '@/types';

interface LibraryProps {
  tunes: Tune[];
  onOpen: (tune: Tune) => void;
  onCreate: () => void;
  onDeleteAll: () => void;
}

const ALL = 'All';
const UNKNOWN = 'Unknown';

const KEY_OPTIONS: string[] = (() => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const out: string[] = [];
  for (const l of letters) {
    out.push(l);
    out.push(`${l}#`);
    out.push(`${l}b`);
  }
  return out;
})();

const MODE_OPTIONS = [
  'Major', 'Minor', 'Dorian', 'Mixolydian', 'Lydian', 'Phrygian', 'Aeolian', 'Ionian',
] as const;

type ModeOption = (typeof MODE_OPTIONS)[number];

interface ParsedKey {
  letter: string | null;
  accidental: string;
  mode: ModeOption | null;
}

function parseKey(raw: string | null | undefined): ParsedKey {
  const empty: ParsedKey = { letter: null, accidental: '', mode: null };
  if (!raw) return empty;
  const trimmed = raw.trim();
  if (!trimmed) return empty;

  const match = trimmed.match(/^([A-G])(#|b)?(.*)$/i);
  if (!match) return empty;

  const letter = match[1].toUpperCase();
  const accidental = match[2] ?? '';
  const rest = (match[3] ?? '').trim().toLowerCase();

  let mode: ModeOption | null = null;
  if (!rest) {
    mode = 'Major';
  } else if (rest === 'maj' || rest === 'major') {
    mode = 'Major';
  } else if (rest === 'm' || rest === 'min' || rest === 'minor') {
    mode = 'Minor';
  } else if (rest === 'dor' || rest === 'dorian') {
    mode = 'Dorian';
  } else if (rest === 'mix' || rest === 'mixolydian') {
    mode = 'Mixolydian';
  } else if (rest === 'lyd' || rest === 'lydian') {
    mode = 'Lydian';
  } else if (rest === 'phr' || rest === 'phrygian') {
    mode = 'Phrygian';
  } else if (rest === 'aeol' || rest === 'aeolian') {
    mode = 'Aeolian';
  } else if (rest === 'ion' || rest === 'ionian') {
    mode = 'Ionian';
  }

  return { letter, accidental, mode };
}

function keyLabel(parsed: ParsedKey): string {
  if (!parsed.letter) return UNKNOWN;
  return `${parsed.letter}${parsed.accidental}`;
}

export default function Library({ tunes, onOpen, onCreate, onDeleteAll }: LibraryProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TuneType | typeof ALL>(ALL);
  const [tagFilter, setTagFilter] = useState<string>(ALL);
  const [groupFilter, setGroupFilter] = useState<string>(ALL);
  const [keyFilter, setKeyFilter] = useState<string>(ALL);
  const [modeFilter, setModeFilter] = useState<string>(ALL);

  const grouped = useMemo(() => {
    const map = new Map<string, Tune[]>();
    for (const t of tunes) {
      const key = t.title.trim().toLowerCase();
      const arr = map.get(key);
      if (arr) arr.push(t);
      else map.set(key, [t]);
    }
    return map;
  }, [tunes]);

  const types = useMemo(() => {
    const set = new Set<string>();
    tunes.forEach((t) => set.add(t.type));
    return [ALL, ...Array.from(set).sort()];
  }, [tunes]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    tunes.forEach((t) => (t.tags ?? []).forEach((tag) => set.add(tag)));
    return [ALL, ...Array.from(set).sort()];
  }, [tunes]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    tunes.forEach((t) => t.group && set.add(t.group));
    return [ALL, ...Array.from(set).sort()];
  }, [tunes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: { representative: Tune; all: Tune[] }[] = [];
    for (const [, group] of grouped) {
      const matchesFilters = group.some((t) => {
        if (typeFilter !== ALL && t.type !== typeFilter) return false;
        if (tagFilter !== ALL && !(t.tags ?? []).includes(tagFilter)) return false;
        if (groupFilter !== ALL && t.group !== groupFilter) return false;
        if (keyFilter !== ALL) {
          const parsed = parseKey(t.key);
          if (keyLabel(parsed) !== keyFilter) return false;
        }
        if (modeFilter !== ALL) {
          const parsed = parseKey(t.key);
          const modeName = parsed.mode ?? UNKNOWN;
          if (modeName !== modeFilter) return false;
        }
        return true;
      });
      if (!matchesFilters) continue;
      if (!q) {
        result.push({ representative: group[0], all: group });
        continue;
      }
      const matchesQuery = group.some((t) =>
        t.title.toLowerCase().includes(q),
      );
      if (matchesQuery) result.push({ representative: group[0], all: group });
    }
    return result;
  }, [grouped, query, typeFilter, tagFilter, groupFilter, keyFilter, modeFilter]);

  const selectClass =
    'rounded-lg border border-wood-200 bg-parchment-50 px-3 py-2 text-sm text-wood-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold text-wood-800 dark:text-parchment-100 sm:text-4xl">
          Your tune collection
        </h1>
        <p className="text-wood-500 dark:text-parchment-200/70">
          {grouped.size} {grouped.size === 1 ? 'tune' : 'tunes'} in your repertoire. Write, hear and keep the melodies you love.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title…"
            className="w-full rounded-lg border border-wood-200 bg-parchment-50 py-2.5 pl-10 pr-3 text-sm text-wood-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 placeholder:text-wood-400 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100 dark:placeholder:text-parchment-200/40"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TuneType | typeof ALL)} className={selectClass}>
            {types.map((t) => (
              <option key={t} value={t}>
                {t === ALL ? 'Dances' : t}
              </option>
            ))}
          </select>
          <select value={keyFilter} onChange={(e) => setKeyFilter(e.target.value)} className={selectClass}>
            <option value={ALL}>Keys</option>
            <option value={UNKNOWN}>{UNKNOWN}</option>
            {KEY_OPTIONS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className={selectClass}>
            <option value={ALL}>Modes</option>
            <option value={UNKNOWN}>{UNKNOWN}</option>
            {MODE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {tags.length > 1 && (
            <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className={selectClass}>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t === ALL ? 'All tags' : t}
                </option>
              ))}
            </select>
          )}
          {groups.length > 1 && (
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className={selectClass}>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g === ALL ? 'Countries' : g}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wood-300 bg-parchment-50/60 px-6 py-20 text-center dark:border-wood-700 dark:bg-wood-900/40">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Music4 className="h-7 w-7" />
          </div>
          <h3 className="mb-1 font-display text-xl font-semibold text-wood-800 dark:text-parchment-100">
            {tunes.length === 0 ? 'No tunes yet' : 'No tunes match your search'}
          </h3>
          <p className="mb-5 max-w-sm text-sm text-wood-500 dark:text-parchment-200/70">
            {tunes.length === 0
              ? 'Add your first traditional tune in ABC notation and hear it come to life.'
              : 'Try a different search term or clear your filters.'}
          </p>
          {tunes.length === 0 && (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-parchment-50 shadow-sm transition hover:bg-amber-800"
            >
              <Plus className="h-4 w-4" />
              Add a tune
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map(({ representative, all }) => (
            <div key={representative.id} className="animate-fade-in">
              <TuneCard tune={representative} versionCount={all.length} onOpen={() => onOpen(representative)} />
            </div>
          ))}
        </div>
      )}

      {tunes.length > 0 && (
        <div className="mt-12 space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-red-800 dark:text-red-200">Danger zone</h3>
                <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/70">Permanently delete all tunes and their settings from your repertoire. This cannot be undone.</p>
                <button
                  onClick={onDeleteAll}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete all tunes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
