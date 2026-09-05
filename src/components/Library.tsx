import { useMemo, useState } from 'react';
import { AlertTriangle, Hash, Music4, Plus, RefreshCw, Search, Trash2, UserPlus } from 'lucide-react';
import TuneCard from '@/components/TuneCard';
import type { Tune, TuneType } from '@/types';

interface LibraryProps {
  tunes: Tune[];
  onOpen: (tune: Tune) => void;
  onCreate: () => void;
  onDeleteAll: () => void;
  onBackfillGroups: () => void;
  onBackfillXFields: () => void;
  onBackfillComposers: () => void;
  backfilling: boolean;
  backfillMessage: string;
}

const ALL = 'All';

export default function Library({ tunes, onOpen, onCreate, onDeleteAll, onBackfillGroups, onBackfillXFields, onBackfillComposers, backfilling, backfillMessage }: LibraryProps) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TuneType | typeof ALL>(ALL);
  const [regionFilter, setRegionFilter] = useState<string>(ALL);
  const [tagFilter, setTagFilter] = useState<string>(ALL);
  const [groupFilter, setGroupFilter] = useState<string>(ALL);

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

  const regions = useMemo(() => {
    const set = new Set<string>();
    tunes.forEach((t) => t.region && set.add(t.region));
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
    for (const [titleKey, group] of grouped) {
      const matchesFilters = group.some((t) => {
        if (typeFilter !== ALL && t.type !== typeFilter) return false;
        if (regionFilter !== ALL && t.region !== regionFilter) return false;
        if (tagFilter !== ALL && !(t.tags ?? []).includes(tagFilter)) return false;
        if (groupFilter !== ALL && t.group !== groupFilter) return false;
        return true;
      });
      if (!matchesFilters) continue;
      if (!q) {
        result.push({ representative: group[0], all: group });
        continue;
      }
      const matchesQuery = group.some((t) =>
        t.title.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q)) ||
        (t.group ?? '').toLowerCase().includes(q)
      );
      if (matchesQuery) result.push({ representative: group[0], all: group });
      void titleKey;
    }
    return result;
  }, [grouped, query, typeFilter, regionFilter, tagFilter, groupFilter]);

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
            placeholder="Search by title, region, key, notes or tags…"
            className="w-full rounded-lg border border-wood-200 bg-parchment-50 py-2.5 pl-10 pr-3 text-sm text-wood-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 placeholder:text-wood-400 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100 dark:placeholder:text-parchment-200/40"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TuneType | typeof ALL)} className={selectClass}>
            {types.map((t) => (
              <option key={t} value={t}>
                {t === ALL ? 'All types' : t}
              </option>
            ))}
          </select>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className={selectClass}>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === ALL ? 'All regions' : r}
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
                  {g === ALL ? 'All groups' : g}
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
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <RefreshCw className={`h-5 w-5 ${backfilling ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-amber-800 dark:text-amber-200">Update G: fields</h3>
                <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/70">Add a G: header into the ABC notation of every tune that has a group but is missing it. Tunes that already have a G: field are left untouched.</p>
                <button
                  onClick={onBackfillGroups}
                  disabled={backfilling}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
                >
                  <RefreshCw className={`h-4 w-4 ${backfilling ? 'animate-spin' : ''}`} />
                  {backfilling ? 'Updating…' : 'Update all G: fields'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <UserPlus className={`h-5 w-5 ${backfilling ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-amber-800 dark:text-amber-200">Update C: fields from The Session</h3>
                <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/70">For every tune that has a link to The Session (thesession.org) in its S: field but is missing a C: field, look up the composer on The Session and add their name to the C: field. Tunes that already have a C: field are left untouched.</p>
                <button
                  onClick={onBackfillComposers}
                  disabled={backfilling}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
                >
                  <UserPlus className={`h-4 w-4 ${backfilling ? 'animate-spin' : ''}`} />
                  {backfilling ? 'Updating…' : 'Update all C: fields'}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <Hash className={`h-5 w-5 ${backfilling ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-amber-800 dark:text-amber-200">Update X: fields</h3>
                <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/70">Renumber the X: header of every tune so that tunes sharing the same title get sequential X: values (X:1, X:2, X:3…). Tunes that already have the correct X: number are left untouched.</p>
                <button
                  onClick={onBackfillXFields}
                  disabled={backfilling}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
                >
                  <Hash className={`h-4 w-4 ${backfilling ? 'animate-spin' : ''}`} />
                  {backfilling ? 'Updating…' : 'Update all X: fields'}
                </button>
                {backfillMessage && (
                  <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-200">{backfillMessage}</p>
                )}
              </div>
            </div>
          </div>

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
