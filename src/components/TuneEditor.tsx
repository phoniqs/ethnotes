import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, FolderTree, Save, Sparkles, Tag, Trash2, X } from 'lucide-react';
import AbcSheet from '@/components/AbcSheet';
import ErrorBoundary from '@/components/ErrorBoundary';
import FlagStripe from '@/components/FlagStripe';
import { getFlag } from '@/lib/flags';
import { parseAbcMetadata } from '@/lib/abc';
import { TUNE_TYPES, type Tune, type TuneDraft, type TuneType } from '@/types';

interface TuneEditorProps {
  tune: Tune | null;
  onSave: (draft: TuneDraft) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const BLANK_ABC = `X:1
T:New Tune
R:reel
M:4/4
L:1/8
K:Dmaj
|: A2 FA dAFA | `;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function TuneEditor({ tune, onSave, onCancel, onDelete }: TuneEditorProps) {
  const [title, setTitle] = useState(tune?.title ?? '');
  const [type, setType] = useState<TuneType>(tune?.type ?? 'Reel');
  const [key, setKey] = useState(tune?.key ?? '');
  const [region, setRegion] = useState(tune?.region ?? '');
  const [group, setGroup] = useState(tune?.group ?? '');
  const [notes, setNotes] = useState(tune?.notes ?? '');
  const [tags, setTags] = useState<string[]>(tune?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [abc, setAbc] = useState(tune?.abc ?? BLANK_ABC);

  const debouncedAbc = useDebounced(abc, 450);
  const canSave = title.trim().length > 0 && abc.trim().length > 0;

  const parsed = useMemo(() => parseAbcMetadata(abc), [abc]);
  const hasSuggestions =
    (!!parsed.title && parsed.title !== title) ||
    (!!parsed.key && parsed.key !== key) ||
    (!!parsed.type && parsed.type !== type);

  function autoFill() {
    if (parsed.title) setTitle(parsed.title);
    if (parsed.key) setKey(parsed.key);
    if (parsed.type) setType(parsed.type);
  }

  function addTag() {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setTags((current) => [...current, value]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((t) => t !== tag));
  }

  function submit() {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      type,
      key: key.trim(),
      region: region.trim(),
      notes: notes.trim(),
      abc: abc.trim(),
      tags,
      group: group.trim() || null,
    });
  }

  const fieldClass =
    'w-full rounded-lg border border-wood-200 bg-parchment-50 px-3 py-2 text-sm text-wood-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 placeholder:text-wood-400 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100 dark:placeholder:text-parchment-200/40';
  const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </button>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
          <button
            onClick={submit}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-parchment-50 shadow-sm transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {tune ? 'Save changes' : 'Save tune'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Kesh Jig" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Type of tune</label>
              <select value={type} onChange={(e) => setType(e.target.value as TuneType)} className={fieldClass}>
                {TUNE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Key</label>
              <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. Gmaj, Edor" className={fieldClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Origin / Region</label>
              <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Brittany, Ireland, Auvergne" className={fieldClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Group (G:)</label>
              <div className="relative">
                <FolderTree className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-400" />
                <input value={group} onChange={(e) => setGroup(e.target.value)} placeholder="e.g. Scandinave, Balfolk, Irlandais" className={`${fieldClass} pl-10`} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Personal notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Fingerings, ornaments, where you learned it…" className={`${fieldClass} resize-y`} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-0.5 text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag (e.g. Scandinave, Balfolk)…"
                  className={`${fieldClass} flex-1`}
                />
                <button onClick={addTag} disabled={!tagInput.trim()} className="inline-flex items-center gap-1 rounded-lg bg-wood-200 px-3 py-2 text-sm font-medium text-wood-700 transition hover:bg-wood-300 disabled:opacity-50 dark:bg-wood-700 dark:text-parchment-100 dark:hover:bg-wood-600">
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className={labelClass + ' mb-0'}>ABC notation</label>
              {hasSuggestions && (
                <button
                  onClick={autoFill}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-wood-800"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Fill fields from notation
                </button>
              )}
            </div>
            <textarea
              value={abc}
              onChange={(e) => setAbc(e.target.value)}
              spellCheck={false}
              rows={16}
              className="w-full rounded-xl border border-wood-200 bg-wood-900 p-4 font-mono text-sm leading-relaxed text-parchment-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 dark:border-wood-700"
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-wood-200 bg-parchment-50 p-5 shadow-sheet dark:border-wood-700 dark:bg-wood-900" style={(getFlag(group) ?? getFlag(region)).type !== 'none' ? { borderLeftWidth: '4px', borderLeftColor: (getFlag(group) ?? getFlag(region)).colors[0] } : undefined}>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">
              <Check className="h-3.5 w-3.5 text-amber-600" />
              Live preview
            </div>
            {(getFlag(group) ?? getFlag(region)).type !== 'none' && <FlagStripe region={region} group={group} className="mb-3 h-4" />}
            <ErrorBoundary>
              <AbcSheet abc={debouncedAbc} showAudio />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
