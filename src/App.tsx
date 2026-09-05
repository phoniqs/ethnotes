import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Library from '@/components/Library';
import TuneDetail from '@/components/TuneDetail';
import TuneEditor from '@/components/TuneEditor';
import ConfirmDialog from '@/components/ConfirmDialog';
import AuthScreen from '@/components/AuthScreen';
import BulkImport from '@/components/BulkImport';
import Community from '@/components/Community';
import Stats from '@/components/Stats';
import { supabase } from '@/lib/supabase';
import { loadTunes } from '@/lib/storage';
import { deleteAllTunes, deleteCloudTune, findTunesByTitle, addSettingToTune, insertTune, insertTuneWithSettings, insertTunes, loadCloudSettings, loadCloudTunes, reparseTune, updateCloudTune, backfillGroupHeaders, backfillXFields, backfillComposers } from '@/lib/cloud';
import { importAlamodeTags, type TagImportResult } from '@/lib/alamodeSync';
import type { Tune, TuneDraft, TuneSetting } from '@/types';

type View = { name: 'library' } | { name: 'detail'; id: string } | { name: 'editor'; id: string | null } | { name: 'import' } | { name: 'community' } | { name: 'stats' };
const THEME_KEY = 'ethnotes.theme';

interface ImportedTune {
  title: string;
  type: string;
  key: string;
  region: string;
  notes: string;
  group: string | null;
  settings: { author: string | null; key: string; abc: string }[];
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tunes, setTunes] = useState<Tune[]>([]);
  const [settings, setSettings] = useState<TuneSetting[]>([]);
  const [view, setView] = useState<View>({ name: 'library' });
  const [pendingDelete, setPendingDelete] = useState<Tune | null>(null);
  const [pendingReset, setPendingReset] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMessage, setBackfillMessage] = useState('');
  const [dark, setDark] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    setDark(stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); }, [dark]);

  useEffect(() => {
    if (!session) { setTunes([]); setSettings([]); return; }
    void refreshTunes(session.user.id);
  }, [session]);

  async function refreshTunes(userId: string) {
    try {
      let cloudTunes = await loadCloudTunes();
      if (cloudTunes.length === 0) {
        const localTunes = loadTunes();
        if (localTunes.length > 0) {
          await insertTunes(localTunes.map((tune) => ({ title: tune.title, type: tune.type, key: tune.key, region: tune.region, notes: tune.notes, abc: tune.abc, tags: tune.tags ?? [], group: tune.group ?? null })));
          cloudTunes = await loadCloudTunes();
        }
      }
      const ownTunes = cloudTunes.filter((tune) => tune.user_id === userId);
      setTunes(ownTunes);
      const tuneIds = ownTunes.map((tune) => tune.id);
      if (tuneIds.length > 0) {
        const cloudSettings = await loadCloudSettings(tuneIds);
        setSettings(cloudSettings);
      } else {
        setSettings([]);
      }
      setError('');
    } catch { setError('Your tune library could not be loaded. Please refresh and try again.'); }
  }

  async function handleSave(draft: TuneDraft) {
    try {
      if (view.name === 'editor' && view.id) {
        const updated = await updateCloudTune(view.id, draft);
        setTunes((current) => current.map((tune) => tune.id === updated.id ? updated : tune));
        setView({ name: 'detail', id: updated.id });
      } else {
        const created = await insertTune(draft);
        setTunes((current) => [created, ...current]);
        setView({ name: 'detail', id: created.id });
      }
      setError('');
    } catch { setError('That tune could not be saved. Please try again.'); }
  }

  async function handleBulkImport(importedTunes: ImportedTune[], overwrite: boolean, onProgress: (value: number, label: string) => void) {
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;
    let addedAsSetting = 0;
    for (let index = 0; index < importedTunes.length; index++) {
      const t = importedTunes[index];
      const label = `Importing tune ${index + 1} of ${importedTunes.length}…`;
      try {
        const existingTunes = await findTunesByTitle(t.title);
        const existing = existingTunes.find((e) => e.type.toLowerCase() === t.type.toLowerCase());
        if (existing) {
          const sameKey = existing.key.toLowerCase() === t.key.toLowerCase();
          if (sameKey && !overwrite) {
            skipped++;
            onProgress(Math.round(((index + 1) / importedTunes.length) * 100), label);
            continue;
          }
          if (overwrite && sameKey) {
            await deleteCloudTune(existing.id);
            await insertTuneWithSettings(t.title, t.type, t.key, t.region, t.notes, t.settings, [], t.group);
            imported++;
          } else {
            const primarySetting = t.settings[0];
            if (primarySetting) {
              await addSettingToTune(existing.id, primarySetting, t.group);
              addedAsSetting++;
            } else {
              skipped++;
            }
          }
        } else {
          await insertTuneWithSettings(t.title, t.type, t.key, t.region, t.notes, t.settings, [], t.group);
          imported++;
        }
        onProgress(Math.round(((index + 1) / importedTunes.length) * 100), label);
      } catch {
        errors.push(`"${t.title}": could not be saved`);
        onProgress(Math.round(((index + 1) / importedTunes.length) * 100), label);
      }
    }
    if (session) await refreshTunes(session.user.id);
    return { imported, skipped: skipped + addedAsSetting, errors };
  }

  async function handleReparse(tuneId: string) {
    const tune = tunes.find((t) => t.id === tuneId);
    if (!tune) return;
    try {
      const { tune: updatedTune, settings: newSettings } = await reparseTune(tune);
      setTunes((current) => current.map((t) => t.id === updatedTune.id ? updatedTune : t));
      setSettings((current) => [...current.filter((s) => s.tune_id !== tuneId), ...newSettings]);
      setError('');
    } catch { setError('Could not re-parse this tune. Please try again.'); }
  }

  async function handleImportTags(syncInput: string): Promise<TagImportResult> {
    const result = await importAlamodeTags(syncInput, tunes);
    if (session && result.updated > 0) {
      await refreshTunes(session.user.id);
    }
    return result;
  }

  async function confirmReset() {
    try {
      await deleteAllTunes();
      setTunes([]);
      setSettings([]);
      setPendingReset(false);
      setView({ name: 'library' });
      setError('');
    } catch { setError('Could not delete all tunes. Please try again.'); setPendingReset(false); }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteCloudTune(pendingDelete.id);
      setTunes((current) => current.filter((tune) => tune.id !== pendingDelete.id));
      setSettings((current) => current.filter((s) => s.tune_id !== pendingDelete.id));
      setPendingDelete(null);
      setView({ name: 'library' });
    } catch { setError('That tune could not be deleted. Please try again.'); setPendingDelete(null); }
  }

  async function handleBackfillGroups() {
    setBackfilling(true);
    try {
      const result = await backfillGroupHeaders();
      if (session) await refreshTunes(session.user.id);
      setError('');
      setBackfillMessage(`Updated ${result.updated} tune${result.updated === 1 ? '' : 's'}, skipped ${result.skipped} that already had the G: field.`);
    } catch {
      setError('Could not update tune groups. Please try again.');
    } finally {
      setBackfilling(false);
    }
  }

  async function handleBackfillXFields() {
    setBackfilling(true);
    try {
      const result = await backfillXFields();
      if (session) await refreshTunes(session.user.id);
      setError('');
      setBackfillMessage(`Updated ${result.updated} tune${result.updated === 1 ? '' : 's'}, skipped ${result.skipped} that already had the correct X: field.`);
    } catch {
      setError('Could not update X: fields. Please try again.');
    } finally {
      setBackfilling(false);
    }
  }

  async function handleBackfillComposers() {
    setBackfilling(true);
    try {
      const result = await backfillComposers();
      if (session) await refreshTunes(session.user.id);
      setError('');
      setBackfillMessage(`Updated ${result.updated} tune${result.updated === 1 ? '' : 's'}, skipped ${result.skipped} that already had a C: field or no Session URL.`);
    } catch {
      setError('Could not update composer fields. Please try again.');
    } finally {
      setBackfilling(false);
    }
  }

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-parchment-100 text-wood-500 dark:bg-wood-950 dark:text-parchment-200">Loading Ethnotes…</div>;
  if (!session) return <AuthScreen />;

  const selectedTune = view.name === 'detail' ? tunes.find((tune) => tune.id === view.id) ?? null : null;
  const siblingTunes = selectedTune
    ? tunes.filter((t) => t.title.trim().toLowerCase() === selectedTune.title.trim().toLowerCase())
    : [];
  const siblingSettings = siblingTunes.length > 0
    ? settings.filter((s) => siblingTunes.some((t) => t.id === s.tune_id))
    : [];
  const editingTune = view.name === 'editor' && view.id ? tunes.find((tune) => tune.id === view.id) ?? null : null;

  return <div className="min-h-full"><Header dark={dark} onToggleDark={() => setDark((value) => !value)} onNewTune={() => setView({ name: 'editor', id: null })} onBulkImport={() => setView({ name: 'import' })} onCommunity={() => setView({ name: 'community' })} onStats={() => setView({ name: 'stats' })} onHome={() => setView({ name: 'library' })} onSignOut={() => void supabase.auth.signOut()} showActions={view.name === 'library' || view.name === 'detail' || view.name === 'stats'} />
    {error && <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8"><div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</div></div>}
    <main>{view.name === 'library' && <Library tunes={tunes} onOpen={(tune) => setView({ name: 'detail', id: tune.id })} onCreate={() => setView({ name: 'editor', id: null })} onDeleteAll={() => setPendingReset(true)} onBackfillGroups={handleBackfillGroups} onBackfillXFields={handleBackfillXFields} onBackfillComposers={handleBackfillComposers} backfilling={backfilling} backfillMessage={backfillMessage} />}{view.name === 'detail' && (selectedTune ? <TuneDetail tune={selectedTune} siblingTunes={siblingTunes} settings={siblingSettings} onBack={() => setView({ name: 'library' })} onEdit={() => setView({ name: 'editor', id: selectedTune.id })} onDelete={() => setPendingDelete(selectedTune)} onReparse={() => handleReparse(selectedTune.id)} /> : <MissingTune onBack={() => setView({ name: 'library' })} />)}{view.name === 'editor' && <TuneEditor tune={editingTune} onSave={handleSave} onCancel={() => setView(editingTune ? { name: 'detail', id: editingTune.id } : { name: 'library' })} onDelete={editingTune ? () => setPendingDelete(editingTune) : undefined} />}{view.name === 'import' && <BulkImport onBack={() => setView({ name: 'library' })} onImport={handleBulkImport} onImportTags={handleImportTags} />}{view.name === 'community' && <Community userId={session.user.id} ownTunes={tunes} onBack={() => setView({ name: 'library' })} />}{view.name === 'stats' && <Stats tunes={tunes} onBack={() => setView({ name: 'library' })} />}</main>
    <ConfirmDialog open={!!pendingDelete} title="Delete this tune?" message={`"${pendingDelete?.title ?? ''}" will be permanently removed from your repertoire.`} onConfirm={() => void confirmDelete()} onCancel={() => setPendingDelete(null)} />
    <ConfirmDialog open={pendingReset} title="Delete all tunes?" message="Are you sure you want to permanently delete all tunes from your repertoire? This action cannot be undone." confirmLabel="Yes, delete everything" onConfirm={() => void confirmReset()} onCancel={() => setPendingReset(false)} />
  </div>;
}

function MissingTune({ onBack }: { onBack: () => void }) { return <div className="mx-auto max-w-md px-4 py-24 text-center"><p className="mb-4 text-wood-500 dark:text-parchment-200/70">This tune could not be found.</p><button onClick={onBack} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">Back to library</button></div>; }
