import type { Tune, TuneDraft } from '@/types';
import { SEED_TUNES } from '@/lib/seed';

const STORAGE_KEY = 'ethnotes.tunes.v1';
const SEED_FLAG = 'ethnotes.seeded.v1';

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function read(): Tune[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Tune[]) : [];
  } catch {
    return [];
  }
}

function write(tunes: Tune[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tunes));
}

export function loadTunes(): Tune[] {
  const alreadySeeded = localStorage.getItem(SEED_FLAG);
  const existing = read();

  if (!alreadySeeded && existing.length === 0) {
    const now = Date.now();
    const seeded: Tune[] = SEED_TUNES.map((t, i) => ({
      ...t,
      tags: [],
      group: null,
      id: makeId(),
      createdAt: now - i * 1000,
      updatedAt: now - i * 1000,
    }));
    write(seeded);
    localStorage.setItem(SEED_FLAG, '1');
    return sortTunes(seeded);
  }

  return sortTunes(existing);
}

export function createTune(draft: TuneDraft): Tune {
  const now = Date.now();
  const tune: Tune = { ...draft, id: makeId(), createdAt: now, updatedAt: now };
  write([tune, ...read()]);
  return tune;
}

export function updateTune(id: string, draft: TuneDraft): Tune | null {
  const tunes = read();
  const idx = tunes.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const updated: Tune = { ...tunes[idx], ...draft, updatedAt: Date.now() };
  tunes[idx] = updated;
  write(tunes);
  return updated;
}

export function deleteTune(id: string): void {
  write(read().filter((t) => t.id !== id));
}

function sortTunes(tunes: Tune[]): Tune[] {
  return [...tunes].sort((a, b) => b.updatedAt - a.updatedAt);
}
