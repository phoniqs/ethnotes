import { ChangeEvent, useState } from 'react';
import { ArrowLeft, CheckCircle2, CloudDownload, FileUp, FolderOpen, FolderTree, Tag, UploadCloud, XCircle } from 'lucide-react';
import { parseTuneBlock, splitAbcFile } from '@/lib/abc';
import type { TagImportResult } from '@/lib/alamodeSync';

interface ImportedTune {
  title: string;
  type: string;
  key: string;
  region: string;
  notes: string;
  group: string | null;
  settings: { author: string | null; key: string; abc: string }[];
}

interface BulkImportProps {
  onBack: () => void;
  onImport: (tunes: ImportedTune[], overwrite: boolean, onProgress: (value: number, label: string) => void) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  onImportTags: (syncInput: string) => Promise<TagImportResult>;
}

export default function BulkImport({ onBack, onImport, onImportTags }: BulkImportProps) {
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [overwrite, setOverwrite] = useState(false);
  const [groupInput, setGroupInput] = useState('');
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const [syncInput, setSyncInput] = useState('');
  const [tagImporting, setTagImporting] = useState(false);
  const [tagResult, setTagResult] = useState<TagImportResult | null>(null);
  const [tagError, setTagError] = useState('');

  function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ''));
    reader.readAsText(file);
  }

  async function readFolder(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const abcFiles = Array.from(files).filter((f) => /\.abc$/i.test(f.name) || f.type === 'text/plain' || f.type === '');
    if (abcFiles.length === 0) return;
    const contents = await Promise.all(
      abcFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ''));
            reader.onerror = () => resolve('');
            reader.readAsText(file);
          })
      )
    );
    setText(contents.filter((c) => c.trim()).join('\n\n'));
  }

  async function process() {
    const blocks = splitAbcFile(text);
    const tunes: ImportedTune[] = [];
    const errors: string[] = [];
    blocks.forEach((block, index) => {
      const parsed = parseTuneBlock(block);
      if (!parsed || !parsed.title) {
        errors.push(`Tune ${index + 1}: missing T: title`);
        return;
      }
      if (parsed.settings.length === 0 || !parsed.settings[0].key) {
        errors.push(`Tune ${index + 1}: missing K: key`);
        return;
      }
      tunes.push({
        title: parsed.title,
        type: parsed.type,
        key: parsed.key,
        region: parsed.region,
        notes: parsed.notes,
        group: groupInput.trim() || parsed.group || null,
        settings: parsed.settings,
      });
    });

    if (!tunes.length) {
      setResult({ imported: 0, skipped: 0, errors: errors.length ? errors : ['No X: tune headers were found.'] });
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressLabel(`Importing tune 1 of ${tunes.length}…`);
    const importResult = await onImport(tunes, overwrite, (value, label) => {
      setProgress(value);
      setProgressLabel(label);
    });
    setProgress(100);
    setProgressLabel('');
    setResult({ imported: importResult.imported, skipped: importResult.skipped, errors: [...errors, ...importResult.errors] });
    setProcessing(false);
  }

  async function importTags() {
    if (!syncInput.trim()) return;
    setTagImporting(true);
    setTagError('');
    setTagResult(null);
    try {
      const result = await onImportTags(syncInput.trim());
      setTagResult(result);
    } catch {
      setTagError('Could not fetch tags from A La Mode. Check your Sync ID and try again.');
    } finally {
      setTagImporting(false);
    }
  }

  const blockCount = splitAbcFile(text).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-wood-600 hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800"><ArrowLeft className="h-4 w-4" />Back to library</button>
      <div className="mb-6"><h1 className="font-display text-3xl font-semibold text-wood-800 dark:text-parchment-100">Bulk import tunes</h1><p className="mt-2 text-wood-500 dark:text-parchment-200/70">Upload or paste an ABC tunebook. Standard ABC tunebooks, The Session multi-setting exports, and single tunes are all supported.</p></div>
      <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-5 shadow-sheet dark:border-wood-700 dark:bg-wood-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-wood-300 bg-white px-4 py-6 text-sm font-medium text-wood-600 transition hover:border-amber-500 hover:bg-amber-50 dark:border-wood-700 dark:bg-wood-950/40 dark:text-parchment-100 dark:hover:bg-wood-800"><UploadCloud className="h-5 w-5 text-amber-600" />Choose a .abc file<input type="file" accept=".abc,text/plain" onChange={readFile} className="hidden" /></label>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-wood-300 bg-white px-4 py-6 text-sm font-medium text-wood-600 transition hover:border-amber-500 hover:bg-amber-50 dark:border-wood-700 dark:bg-wood-950/40 dark:text-parchment-100 dark:hover:bg-wood-800"><FolderOpen className="h-5 w-5 text-amber-600" />Choose a folder<input type="file" onChange={readFolder} className="hidden" ref={(el) => { if (el) el.setAttribute('webkitdirectory', ''); }} /></label>
        </div>
        <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70"><span>ABC content</span>{text && <span>{blockCount} tune {blockCount === 1 ? 'block' : 'blocks'} found</span>}</div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} spellCheck={false} placeholder={'X:1\nT:My tune\nR:jig\nM:6/8\nK:G\n|: ...\n% Frulator\nK:G\n|: ...'} className="w-full rounded-xl border border-wood-200 bg-wood-900 p-4 font-mono text-sm leading-relaxed text-parchment-100 outline-none focus:border-amber-500 dark:border-wood-700" />
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">Set Group (G:) for imported tunes</label>
          <div className="relative">
            <FolderTree className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-400" />
            <input
              value={groupInput}
              onChange={(e) => setGroupInput(e.target.value)}
              placeholder="e.g. Scandinave, Balfolk, Irlandais (optional)"
              className="w-full rounded-lg border border-wood-200 bg-parchment-50 py-2.5 pl-10 pr-3 text-sm text-wood-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 placeholder:text-wood-400 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100 dark:placeholder:text-parchment-200/40"
            />
          </div>
          <p className="mt-1.5 text-xs text-wood-400 dark:text-parchment-200/50">If provided, a G: header will be injected into each imported tune. Tunes that already have a G: header will use their existing group unless you override it here.</p>
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-wood-600 dark:text-parchment-200">
          <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className="h-4 w-4 rounded border-wood-300 text-amber-700 focus:ring-amber-500 dark:border-wood-600" />
          Overwrite existing repertoire (replace tunes with the same title and key)
        </label>
        {processing && <div className="mt-4"><div className="mb-2 flex justify-between text-sm text-wood-600 dark:text-parchment-200"><span>{progressLabel || 'Importing…'}</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-wood-200 dark:bg-wood-700"><div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${progress}%` }} /></div></div>}
        <button disabled={!text.trim() || processing} onClick={process} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"><FileUp className="h-4 w-4" />{processing ? 'Importing…' : 'Import tunes'}</button>
      </div>

      <div className="mt-6 rounded-2xl border border-wood-200 bg-parchment-50 p-5 shadow-sheet dark:border-wood-700 dark:bg-wood-900">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">
          <Tag className="h-3.5 w-3.5 text-amber-600" />
          Import tags from A La Mode Cloud
        </div>
        <p className="mb-4 text-sm text-wood-500 dark:text-parchment-200/70">Enter your A La Mode Sync ID or cloud URL (from <span className="font-medium">alamode.suchideas.com</span>). Tags from your A La Mode collection will be matched to local tunes by title and attached as custom tags.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={syncInput}
            onChange={(e) => setSyncInput(e.target.value)}
            placeholder="e.g. 12345 or https://alamode.suchideas.com/12345"
            className="flex-1 rounded-lg border border-wood-200 bg-white px-3 py-2 text-sm text-wood-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 placeholder:text-wood-400 dark:border-wood-700 dark:bg-wood-950/40 dark:text-parchment-100 dark:placeholder:text-parchment-200/40"
          />
          <button
            disabled={!syncInput.trim() || tagImporting}
            onClick={importTags}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-wood-700 px-4 py-2 text-sm font-semibold text-parchment-50 transition hover:bg-wood-800 disabled:opacity-50 dark:bg-wood-600 dark:hover:bg-wood-500"
          >
            <CloudDownload className="h-4 w-4" />
            {tagImporting ? 'Fetching tags…' : 'Import tags'}
          </button>
        </div>
        {tagError && <p className="mt-3 text-sm text-red-700 dark:text-red-300">{tagError}</p>}
        {tagResult && (
          <div className="mt-4 space-y-2 rounded-xl border border-wood-200 bg-white p-4 dark:border-wood-700 dark:bg-wood-950/40">
            <p className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              {tagResult.updated} {tagResult.updated === 1 ? 'tune' : 'tunes'} updated with new tags
            </p>
            <p className="text-sm text-wood-500 dark:text-parchment-200/70">
              {tagResult.matched} matched, {tagResult.unmatched} unmatched
            </p>
            {tagResult.unmatchedTitles.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-wood-400">Unmatched tunes</p>
                <ul className="mt-1 max-h-32 overflow-auto text-sm text-wood-500 dark:text-parchment-200/60">
                  {tagResult.unmatchedTitles.map((title) => (
                    <li key={title} className="py-0.5">{title}</li>
                  ))}
                </ul>
              </div>
            )}
            {tagResult.errors.length > 0 && (
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300"><XCircle className="h-4 w-4" />{tagResult.errors.length} errors</p>
                <ul className="mt-1 max-h-32 overflow-auto text-sm text-wood-500 dark:text-parchment-200/60">
                  {tagResult.errors.map((error) => (
                    <li key={error} className="py-0.5">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {result && <div className="mt-6 rounded-2xl border border-wood-200 bg-parchment-50 p-5 dark:border-wood-700 dark:bg-wood-900"><h2 className="font-display text-xl font-semibold text-wood-800 dark:text-parchment-100">Import complete</h2><p className="mt-2 flex items-center gap-2 text-sm text-green-700 dark:text-green-300"><CheckCircle2 className="h-4 w-4" />{result.imported} tunes imported successfully</p>{result.skipped > 0 && <p className="mt-1 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">{result.skipped} duplicate {result.skipped === 1 ? 'tune' : 'tunes'} skipped</p>}{result.errors.length > 0 && <div className="mt-3"><p className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300"><XCircle className="h-4 w-4" />{result.errors.length} errors</p><ul className="mt-2 max-h-40 overflow-auto text-sm text-wood-600 dark:text-parchment-200/70">{result.errors.map((error) => <li key={error} className="py-0.5">{error}</li>)}</ul></div>}</div>}
    </div>
  );
}
