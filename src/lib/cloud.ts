import { supabase } from '@/lib/supabase';
import { injectGroupHeader, parseTuneBlock } from '@/lib/abc';
import type { Profile, Tune, TuneDraft, TuneSetting } from '@/types';

function fromRow(row: Record<string, unknown>): Tune {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    title: String(row.title ?? ''),
    type: row.type as Tune['type'],
    key: String(row.key ?? ''),
    region: String(row.region ?? ''),
    notes: String(row.notes ?? ''),
    abc: String(row.abc ?? ''),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    group: row.tune_group ? String(row.tune_group) : null,
    createdAt: new Date(String(row.created_at)).getTime(),
    updatedAt: new Date(String(row.updated_at)).getTime(),
  };
}

function settingFromRow(row: Record<string, unknown>): TuneSetting {
  return {
    id: String(row.id),
    tune_id: String(row.tune_id),
    setting_number: Number(row.setting_number),
    author: row.author ? String(row.author) : null,
    key: String(row.key ?? ''),
    abc: String(row.abc ?? ''),
  };
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function loadCloudTunes(): Promise<Tune[]> {
  const { data, error } = await supabase.from('tunes').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function loadCloudSettings(tuneIds: string[]): Promise<TuneSetting[]> {
  if (tuneIds.length === 0) return [];
  const { data, error } = await supabase.from('tune_settings').select('*').in('tune_id', tuneIds);
  if (error) throw error;
  return (data ?? []).map(settingFromRow);
}

export interface ImportResult {
  tune: Tune;
  settings: TuneSetting[];
}

export async function insertTuneWithSettings(
  title: string, type: string, key: string, region: string, notes: string,
  settings: { author: string | null; key: string; abc: string }[],
  tags: string[] = [],
  group: string | null = null,
): Promise<ImportResult> {
  if (settings.length === 0) {
    const { data, error } = await supabase.from('tunes').insert({
      title, type, key, region, notes, abc: '', tags, tune_group: group,
    }).select('*').maybeSingle();
    if (error || !data) throw error ?? new Error('Tune could not be saved');
    return { tune: fromRow(data), settings: [] };
  }

  const primary = settings[0];
  const primaryAbc = group ? injectGroupHeader(primary.abc, group) : primary.abc;
  const { data: tuneData, error: tuneError } = await supabase.from('tunes').insert({
    title, type, key, region, notes, abc: primaryAbc, tags, tune_group: group,
  }).select('*').maybeSingle();
  if (tuneError || !tuneData) throw tuneError ?? new Error('Tune could not be saved');
  const tune = fromRow(tuneData);

  const extraSettings = settings.slice(1);
  let insertedSettings: TuneSetting[] = [];
  if (extraSettings.length > 0) {
    const rows = extraSettings.map((s, i) => ({
      tune_id: tune.id,
      setting_number: i + 2,
      author: s.author,
      key: s.key,
      abc: group ? injectGroupHeader(s.abc, group) : s.abc,
    }));
    const { data: settingData, error: settingError } = await supabase.from('tune_settings').insert(rows).select('*');
    if (settingError) throw settingError;
    insertedSettings = (settingData ?? []).map(settingFromRow);
  }

  return { tune, settings: insertedSettings };
}

export async function insertTunes(drafts: TuneDraft[]): Promise<Tune[]> {
  const { data, error } = await supabase.from('tunes').insert(drafts.map((draft) => ({
    title: draft.title, type: draft.type, key: draft.key, region: draft.region, notes: draft.notes, abc: draft.group ? injectGroupHeader(draft.abc, draft.group) : draft.abc, tags: draft.tags ?? [], tune_group: draft.group ?? null,
  }))).select('*');
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function insertTune(draft: TuneDraft): Promise<Tune> {
  const [tune] = await insertTunes([draft]);
  return tune;
}

export async function updateCloudTune(id: string, draft: TuneDraft): Promise<Tune> {
  const { data, error } = await supabase.from('tunes').update({
    title: draft.title, type: draft.type, key: draft.key, region: draft.region, notes: draft.notes, abc: draft.group ? injectGroupHeader(draft.abc, draft.group) : draft.abc, tags: draft.tags ?? [], tune_group: draft.group ?? null,
  }).eq('id', id).select('*').maybeSingle();
  if (error || !data) throw error ?? new Error('Tune not found');
  return fromRow(data);
}

export async function updateTuneGroup(id: string, group: string | null): Promise<Tune> {
  const { data, error } = await supabase.from('tunes').update({ tune_group: group }).eq('id', id).select('*').maybeSingle();
  if (error || !data) throw error ?? new Error('Tune not found');
  return fromRow(data);
}

export async function findExistingTune(title: string, key: string): Promise<Tune | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in');
  const { data, error } = await supabase.from('tunes').select('*').eq('user_id', user.id).ilike('title', title).ilike('key', key).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function findTunesByTitle(title: string): Promise<Tune[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in');
  const { data, error } = await supabase.from('tunes').select('*').eq('user_id', user.id).ilike('title', title);
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function addSettingToTune(
  tuneId: string,
  setting: { author: string | null; key: string; abc: string },
  group: string | null = null,
): Promise<TuneSetting> {
  const { data: existing, error: loadError } = await supabase
    .from('tune_settings')
    .select('setting_number')
    .eq('tune_id', tuneId)
    .order('setting_number', { ascending: false })
    .limit(1);
  if (loadError) throw loadError;
  const nextNumber = (existing?.[0]?.setting_number ?? 1) + 1;
  const abcWithGroup = group ? injectGroupHeader(setting.abc, group) : setting.abc;
  const { data, error } = await supabase.from('tune_settings').insert({
    tune_id: tuneId,
    setting_number: nextNumber,
    author: setting.author,
    key: setting.key,
    abc: abcWithGroup,
  }).select('*').single();
  if (error || !data) throw error ?? new Error('Setting could not be added');
  return settingFromRow(data);
}

export async function deleteAllTunes(): Promise<void> {
  const { error } = await supabase.from('tunes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

export async function deleteCloudTune(id: string): Promise<void> {
  const { error } = await supabase.from('tunes').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteCloudSettings(tuneId: string): Promise<void> {
  const { error } = await supabase.from('tune_settings').delete().eq('tune_id', tuneId);
  if (error) throw error;
}

export async function reparseTune(tune: Tune): Promise<{ tune: Tune; settings: TuneSetting[] }> {
  const parsed = parseTuneBlock(tune.abc);
  if (!parsed || parsed.settings.length === 0) {
    return { tune, settings: [] };
  }

  const primary = parsed.settings[0];
  const primaryAbc = parsed.group ? injectGroupHeader(primary.abc, parsed.group) : primary.abc;
  const { data: tuneData, error: tuneError } = await supabase.from('tunes').update({
    title: parsed.title,
    type: parsed.type,
    key: parsed.key,
    region: parsed.region,
    abc: primaryAbc,
    tune_group: parsed.group,
  }).eq('id', tune.id).select('*').maybeSingle();
  if (tuneError || !tuneData) throw tuneError ?? new Error('Tune could not be updated');
  const updatedTune = fromRow(tuneData);

  await deleteCloudSettings(tune.id);

  const extraSettings = parsed.settings.slice(1);
  let insertedSettings: TuneSetting[] = [];
  if (extraSettings.length > 0) {
    const rows = extraSettings.map((s, i) => ({
      tune_id: tune.id,
      setting_number: i + 2,
      author: s.author,
      key: s.key,
      abc: parsed.group ? injectGroupHeader(s.abc, parsed.group) : s.abc,
    }));
    const { data: settingData, error: settingError } = await supabase.from('tune_settings').insert(rows).select('*');
    if (settingError) throw settingError;
    insertedSettings = (settingData ?? []).map(settingFromRow);
  }

  return { tune: updatedTune, settings: insertedSettings };
}

export async function loadOwnProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function saveProfile(profile: Pick<Profile, 'display_name' | 'sharing_enabled' | 'location_label' | 'latitude' | 'longitude'>): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in');
  const { data, error } = await supabase.from('profiles').upsert({ id: user.id, ...profile }).select('*').maybeSingle();
  if (error || !data) throw error ?? new Error('Profile could not be saved');
  return data as Profile;
}

export async function loadSharedRepertoire(): Promise<{ profiles: Profile[]; tunes: Tune[] }> {
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*').eq('sharing_enabled', true);
  if (profileError) throw profileError;
  const { data: tunes, error: tuneError } = await supabase.from('tunes').select('*');
  if (tuneError) throw tuneError;
  return { profiles: (profiles ?? []) as Profile[], tunes: (tunes ?? []).map(fromRow) };
}
