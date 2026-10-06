export type FlagType =
  | 'tricolor-vertical'
  | 'tricolor-horizontal'
  | 'nordic-cross'
  | 'saltire'
  | 'split-vertical'
  | 'solid'
  | 'bicolor-horizontal'
  | 'union-jack'
  | 'eu'
  | 'none';

export interface FlagDef {
  type: FlagType;
  colors: string[];
  label: string;
}

const FLAGS: Record<string, FlagDef> = {
  // ─── Group-level (G:) flags ───
  ireland: { type: 'tricolor-vertical', colors: ['#169b62', '#ffffff', '#ff883a'], label: 'Ireland' },
  irish: { type: 'tricolor-vertical', colors: ['#169b62', '#ffffff', '#ff883a'], label: 'Ireland' },
  eire: { type: 'tricolor-vertical', colors: ['#169b62', '#ffffff', '#ff883a'], label: 'Ireland' },

  scotland: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  scottish: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  ecosse: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },

  scandinavia: { type: 'nordic-cross', colors: ['#d62828', '#ffffff', '#0033a0', '#fcd116', '#009246', '#012169', '#003897', '#005293'], label: 'Scandinavia' },
  scandinave: { type: 'nordic-cross', colors: ['#d62828', '#ffffff', '#0033a0', '#fcd116', '#009246', '#012169', '#003897', '#005293'], label: 'Scandinavia' },
  nordic: { type: 'nordic-cross', colors: ['#d62828', '#ffffff', '#0033a0', '#fcd116', '#009246', '#012169', '#003897', '#005293'], label: 'Scandinavia' },

  brittany: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Brittany' },
  bretagne: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Brittany' },
  breton: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Brittany' },
  bretton: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Brittany' },

  // Britannia → Union Jack (NOT Brittany!)
  britannia: { type: 'union-jack', colors: ['#012169', '#ffffff', '#c8102e'], label: 'Britannia' },
  brittania: { type: 'union-jack', colors: ['#012169', '#ffffff', '#c8102e'], label: 'Britannia' },

  // Balfolk → French flag
  balfolk: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'Balfolk' },

  // North America → mix of USA + Canada, use USA flag as representative
  'north america': { type: 'tricolor-horizontal', colors: ['#b22234', '#ffffff', '#3c3b6e'], label: 'North America' },

  belgium: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },
  belgian: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },
  belgique: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },

  // Southern Europe → EU flag
  'southern europe': { type: 'eu', colors: ['#003399', '#ffcc00'], label: 'Southern Europe' },

  'self-penned': { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  selfpenned: { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  'self penned': { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  original: { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  composition: { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },

  estonia: { type: 'bicolor-horizontal', colors: ['#0072ce', '#000000', '#ffffff'], label: 'Estonia' },
  estonian: { type: 'bicolor-horizontal', colors: ['#0072ce', '#000000', '#ffffff'], label: 'Estonia' },
  eesti: { type: 'bicolor-horizontal', colors: ['#0072ce', '#000000', '#ffffff'], label: 'Estonia' },

  // Klezmer → no specific country, use EU flag as neutral
  klezmer: { type: 'eu', colors: ['#003399', '#ffcc00'], label: 'Klezmer' },

  // Balkan → EU flag (as requested)
  balkan: { type: 'eu', colors: ['#003399', '#ffcc00'], label: 'Balkan' },

  others: { type: 'none', colors: ['#b45309', '#d4a05a'], label: '' },

  // Latin America → no single flag, use a warm neutral
  'latin america': { type: 'solid', colors: ['#e30a17', '#ffcc00'], label: 'Latin America' },

  // ─── Origin-level (O:) flags — countries ───
  france: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  french: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  suede: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  sweden: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  swedish: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  norway: { type: 'nordic-cross', colors: ['#ed2939', '#ffffff', '#002664'], label: 'Norway' },
  norwegian: { type: 'nordic-cross', colors: ['#ed2939', '#ffffff', '#002664'], label: 'Norway' },
  norge: { type: 'nordic-cross', colors: ['#ed2939', '#ffffff', '#002664'], label: 'Norway' },
  denmark: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },
  danish: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },
  danemark: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },
  finland: { type: 'nordic-cross', colors: ['#ffffff', '#003580'], label: 'Finland' },
  finnish: { type: 'nordic-cross', colors: ['#ffffff', '#003580'], label: 'Finland' },
  finlande: { type: 'nordic-cross', colors: ['#ffffff', '#003580'], label: 'Finland' },
  iceland: { type: 'nordic-cross', colors: ['#003897', '#ffffff', '#d72828'], label: 'Iceland' },
  icelandic: { type: 'nordic-cross', colors: ['#003897', '#ffffff', '#d72828'], label: 'Iceland' },
  islande: { type: 'nordic-cross', colors: ['#003897', '#ffffff', '#d72828'], label: 'Iceland' },
  germany: { type: 'tricolor-horizontal', colors: ['#000000', '#dd0000', '#ffce00'], label: 'Germany' },
  german: { type: 'tricolor-horizontal', colors: ['#000000', '#dd0000', '#ffce00'], label: 'Germany' },
  england: { type: 'solid', colors: ['#cf142b', '#ffffff'], label: 'England' },
  wales: { type: 'bicolor-horizontal', colors: ['#00722c', '#ffffff', '#d30731'], label: 'Wales' },
  welsh: { type: 'bicolor-horizontal', colors: ['#00722c', '#ffffff', '#d30731'], label: 'Wales' },
  usa: { type: 'tricolor-horizontal', colors: ['#b22234', '#ffffff', '#3c3b6e'], label: 'USA' },
  canada: { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },
  'new zealand': { type: 'solid', colors: ['#012169', '#ffffff', '#c8102e'], label: 'New Zealand' },
  bulgaria: { type: 'tricolor-horizontal', colors: ['#ffffff', '#00966e', '#d62612'], label: 'Bulgaria' },
  macedonia: { type: 'solid', colors: ['#d82126', '#f9d616'], label: 'Macedonia' },
  tunisia: { type: 'solid', colors: ['#e70013', '#ffffff'], label: 'Tunisia' },
  spain: { type: 'bicolor-horizontal', colors: ['#aa151b', '#f1bf00'], label: 'Spain' },
  spanish: { type: 'bicolor-horizontal', colors: ['#aa151b', '#f1bf00'], label: 'Spain' },
  italy: { type: 'tricolor-vertical', colors: ['#009246', '#ffffff', '#ce2b37'], label: 'Italy' },
  italian: { type: 'tricolor-vertical', colors: ['#009246', '#ffffff', '#ce2b37'], label: 'Italy' },

  // ─── Origin-level (O:) flags — regions/states ───
  // Swedish regions → Sweden flag (as instructed: don't try region-specific)
  dalarna: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  uppland: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  värmland: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  västmanland: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  medelpad: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  härjedalen: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  småland: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  jämtland: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  hälsingland: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  skåne: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  stockholm: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  gätrikland: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  älvdalen: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  leksand: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  gnarp: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  barsebäck: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  evertsberg: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  djursdala: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  torsåker: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  austmarka: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  hässlunda: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  are: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  kårt: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  ville: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  ojanen: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },

  // Canadian regions → Canada flag
  'cape breton': { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },
  'newfoundland': { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },
  'terre-neuve': { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },
  'nova scotia': { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },
  québec: { type: 'solid', colors: ['#003399', '#ffffff'], label: 'Quebec' },
  quebec: { type: 'solid', colors: ['#003399', '#ffffff'], label: 'Quebec' },
  toronto: { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },

  // US regions → USA flag
  'new england': { type: 'tricolor-horizontal', colors: ['#b22234', '#ffffff', '#3c3b6e'], label: 'USA' },
  alberta: { type: 'tricolor-horizontal', colors: ['#b22234', '#ffffff', '#3c3b6e'], label: 'USA' },
  calgary: { type: 'tricolor-horizontal', colors: ['#b22234', '#ffffff', '#3c3b6e'], label: 'USA' },

  // French regions → France flag
  auvergne: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  occitanie: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  vivarais: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  vendée: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  grenoble: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  'île-de-france': { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  'haute-bretagne': { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Brittany' },
  'le mans': { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  enghien: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  sallertaine: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },

  // UK regions → specific
  northumbria: { type: 'solid', colors: ['#cf142b', '#ffffff'], label: 'England' },
  oxfordshire: { type: 'solid', colors: ['#cf142b', '#ffffff'], label: 'England' },
  london: { type: 'solid', colors: ['#cf142b', '#ffffff'], label: 'England' },
  glasgow: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  orkney: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  skye: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  shetland: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  hebrides: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },

  // Danish regions → Denmark flag
  fanø: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },
  esbjerg: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },
  ærø: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },

  // Belgian regions → Belgium flag
  furnes: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },
  wallonia: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },
  liège: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },
  bruxelles: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },

  // Spanish regions → Spain flag
  cantabria: { type: 'bicolor-horizontal', colors: ['#aa151b', '#f1bf00'], label: 'Spain' },
  'pays basque': { type: 'solid', colors: ['#ffffff', '#009b3a', '#d40000'], label: 'Basque' },
  basque: { type: 'solid', colors: ['#ffffff', '#009b3a', '#d40000'], label: 'Basque' },

  // Other regions
  'cape breton island': { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },

  // Generic / misc
  'new england, usa': { type: 'tricolor-horizontal', colors: ['#b22234', '#ffffff', '#3c3b6e'], label: 'USA' },
  'trad france': { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  'trad arrangé': { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  'la machine': { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
};

const DEFAULT_FLAG: FlagDef = { type: 'none', colors: ['#b45309', '#d4a05a'], label: '' };

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function getFlag(region: string | null | undefined): FlagDef {
  if (!region || !region.trim()) {
    return DEFAULT_FLAG;
  }

  const normalized = normalize(region);

  if (FLAGS[normalized]) {
    return FLAGS[normalized];
  }

  for (const [key, flag] of Object.entries(FLAGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return flag;
    }
  }

  return DEFAULT_FLAG;
}

/**
 * Resolve the best flag for a tune.
 * Priority: O: (origin) > G: (group) > S: (region) field.
 * Each parameter is the raw value from the corresponding ABC header.
 */
export function resolveFlag(origin: string | null | undefined, group: string | null | undefined, region: string | null | undefined): FlagDef {
  if (origin && origin.trim()) {
    const flag = getFlag(origin);
    if (flag.type !== 'none') return flag;
  }
  if (group && group.trim()) {
    const flag = getFlag(group);
    if (flag.type !== 'none') return flag;
  }
  if (region && region.trim()) {
    const flag = getFlag(region);
    if (flag.type !== 'none') return flag;
  }
  return DEFAULT_FLAG;
}

export function getFlagColors(region: string | null | undefined): { name: string; colors: string[] } {
  const flag = getFlag(region);
  return { name: flag.label, colors: flag.colors };
}
