import { updateTuneTags } from '@/lib/cloud';
import type { Tune } from '@/types';

export interface AlamodeTuneEntry {
  title: string;
  tags?: string[];
}

export interface AlamodePayload {
  tunes?: AlamodeTuneEntry[];
  [key: string]: unknown;
}

export interface TagImportResult {
  matched: number;
  unmatched: number;
  updated: number;
  errors: string[];
  unmatchedTitles: string[];
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function extractSyncId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/(\d+)(?:\/)?(?:\?|$)/);
  if (match) return match[1];
  if (/^\d+$/.test(trimmed)) return trimmed;
  return trimmed;
}

function buildSyncUrl(input: string): string {
  const id = extractSyncId(input);
  return `https://alamode.suchideas.com/api/sync/${id}`;
}

export async function fetchAlamodeTags(syncInput: string): Promise<AlamodeTuneEntry[]> {
  const url = buildSyncUrl(syncInput);
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`A La Mode returned status ${response.status}`);
  }
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid response from A La Mode');
  }
  const tunes = (payload as AlamodePayload).tunes;
  if (!Array.isArray(tunes)) {
    throw new Error('No tunes found in A La Mode response');
  }
  return tunes.filter((entry) => entry && typeof entry.title === 'string');
}

export async function importAlamodeTags(
  syncInput: string,
  localTunes: Tune[],
): Promise<TagImportResult> {
  const entries = await fetchAlamodeTags(syncInput);
  const errors: string[] = [];
  const unmatchedTitles: string[] = [];
  let matched = 0;
  let updated = 0;

  const localMap = new Map<string, Tune>();
  for (const tune of localTunes) {
    localMap.set(normalizeTitle(tune.title), tune);
  }

  for (const entry of entries) {
    const normalized = normalizeTitle(entry.title);
    const localTune = localMap.get(normalized);
    if (!localTune) {
      unmatchedTitles.push(entry.title);
      continue;
    }

    matched++;
    const newTags = (entry.tags ?? []).filter((tag) => typeof tag === 'string' && tag.trim().length > 0).map((tag) => tag.trim());
    if (newTags.length === 0) continue;

    const existingTags = localTune.tags ?? [];
    const merged = Array.from(new Set([...existingTags, ...newTags]));
    if (merged.length === existingTags.length) continue;

    try {
      await updateTuneTags(localTune.id, merged);
      updated++;
    } catch {
      errors.push(`"${entry.title}": could not update tags`);
    }
  }

  return {
    matched,
    unmatched: entries.length - matched,
    updated,
    errors,
    unmatchedTitles,
  };
}
