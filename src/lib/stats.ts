import type { Tune } from '@/types';

export interface GroupDatum {
  group: string;
  count: number;
}

export interface KeyDatum {
  key: string;
  count: number;
}

export interface RhythmDatum {
  rhythm: string;
  count: number;
}

export interface Stats {
  totalTunes: number;
  totalGroups: number;
  totalKeys: number;
  topRhythm: string | null;
  topKey: string | null;
  groups: GroupDatum[];
  keys: KeyDatum[];
  rhythms: RhythmDatum[];
}

export function computeStats(tunes: Tune[]): Stats {
  const groupMap = new Map<string, number>();
  const keyMap = new Map<string, number>();
  const rhythmMap = new Map<string, number>();

  for (const tune of tunes) {
    const group = (tune.group ?? '').trim() || 'Ungrouped';
    groupMap.set(group, (groupMap.get(group) ?? 0) + 1);

    const key = (tune.key ?? '').trim() || 'Unknown';
    keyMap.set(key, (keyMap.get(key) ?? 0) + 1);

    const rhythm = (tune.type ?? '').trim() || 'Other';
    rhythmMap.set(rhythm, (rhythmMap.get(rhythm) ?? 0) + 1);
  }

  const groups = Array.from(groupMap.entries())
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => b.count - a.count);

  const keys = Array.from(keyMap.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const rhythms = Array.from(rhythmMap.entries())
    .map(([rhythm, count]) => ({ rhythm, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalTunes: tunes.length,
    totalGroups: groupMap.size,
    totalKeys: keyMap.size,
    topRhythm: rhythms.length > 0 ? rhythms[0].rhythm : null,
    topKey: keys.length > 0 ? keys[0].key : null,
    groups,
    keys,
    rhythms,
  };
}
