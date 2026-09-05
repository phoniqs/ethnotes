export type FlagType =
  | 'tricolor-vertical'
  | 'tricolor-horizontal'
  | 'nordic-cross'
  | 'saltire'
  | 'split-vertical'
  | 'solid'
  | 'bicolor-horizontal'
  | 'none';

export interface FlagDef {
  type: FlagType;
  colors: string[];
  label: string;
}

const FLAGS: Record<string, FlagDef> = {
  belgium: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },
  belgian: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },
  belgique: { type: 'tricolor-vertical', colors: ['#000000', '#fdda24', '#ef3340'], label: 'Belgium' },

  breton: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Breton' },
  bretagne: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Breton' },
  brittany: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Breton' },
  bretton: { type: 'bicolor-horizontal', colors: ['#000000', '#ffffff'], label: 'Breton' },

  estonia: { type: 'bicolor-horizontal', colors: ['#0072ce', '#000000', '#ffffff'], label: 'Estonia' },
  estonian: { type: 'bicolor-horizontal', colors: ['#0072ce', '#000000', '#ffffff'], label: 'Estonia' },
  eesti: { type: 'bicolor-horizontal', colors: ['#0072ce', '#000000', '#ffffff'], label: 'Estonia' },

  ireland: { type: 'tricolor-vertical', colors: ['#169b62', '#ffffff', '#ff883a'], label: 'Ireland' },
  irish: { type: 'tricolor-vertical', colors: ['#169b62', '#ffffff', '#ff883a'], label: 'Ireland' },
  eire: { type: 'tricolor-vertical', colors: ['#169b62', '#ffffff', '#ff883a'], label: 'Ireland' },

  scotland: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  scottish: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },
  ecosse: { type: 'saltire', colors: ['#0072c6', '#ffffff'], label: 'Scotland' },

  scandinavia: { type: 'nordic-cross', colors: ['#d62828', '#ffffff', '#0033a0', '#fcd116', '#009246', '#012169', '#003897', '#005293'], label: 'Scandinavia' },
  scandinave: { type: 'nordic-cross', colors: ['#d62828', '#ffffff', '#0033a0', '#fcd116', '#009246', '#012169', '#003897', '#005293'], label: 'Scandinavia' },
  nordic: { type: 'nordic-cross', colors: ['#d62828', '#ffffff', '#0033a0', '#fcd116', '#009246', '#012169', '#003897', '#005293'], label: 'Scandinavia' },

  sweden: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  swedish: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },
  suede: { type: 'nordic-cross', colors: ['#005293', '#fecc00'], label: 'Sweden' },

  norway: { type: 'nordic-cross', colors: ['#ed2939', '#ffffff', '#002664'], label: 'Norway' },
  norwegian: { type: 'nordic-cross', colors: ['#ed2939', '#ffffff', '#002664'], label: 'Norway' },
  norvege: { type: 'nordic-cross', colors: ['#ed2939', '#ffffff', '#002664'], label: 'Norway' },

  denmark: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },
  danish: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },
  danemark: { type: 'nordic-cross', colors: ['#c8102e', '#ffffff'], label: 'Denmark' },

  finland: { type: 'nordic-cross', colors: ['#ffffff', '#003580'], label: 'Finland' },
  finnish: { type: 'nordic-cross', colors: ['#ffffff', '#003580'], label: 'Finland' },
  finlande: { type: 'nordic-cross', colors: ['#ffffff', '#003580'], label: 'Finland' },

  iceland: { type: 'nordic-cross', colors: ['#003897', '#ffffff', '#d72828'], label: 'Iceland' },
  icelandic: { type: 'nordic-cross', colors: ['#003897', '#ffffff', '#d72828'], label: 'Iceland' },
  islande: { type: 'nordic-cross', colors: ['#003897', '#ffffff', '#d72828'], label: 'Iceland' },

  france: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },
  french: { type: 'tricolor-vertical', colors: ['#0055a4', '#ffffff', '#ef4135'], label: 'France' },

  'self-penned': { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  selfpenned: { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  'self penned': { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  original: { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },
  composition: { type: 'split-vertical', colors: ['#0055a4', '#ffffff', '#ef4135', '#000000', '#fdda24', '#ef3340'], label: 'Self-penned' },

  auvergne: { type: 'bicolor-horizontal', colors: ['#ffd700', '#d40000'], label: 'Auvergne' },
  italy: { type: 'tricolor-vertical', colors: ['#009246', '#ffffff', '#ce2b37'], label: 'Italy' },
  italian: { type: 'tricolor-vertical', colors: ['#009246', '#ffffff', '#ce2b37'], label: 'Italy' },
  spain: { type: 'bicolor-horizontal', colors: ['#aa151b', '#f1bf00'], label: 'Spain' },
  spanish: { type: 'bicolor-horizontal', colors: ['#aa151b', '#f1bf00'], label: 'Spain' },
  portugal: { type: 'tricolor-vertical', colors: ['#006600', '#ff0000', '#006600'], label: 'Portugal' },
  galicia: { type: 'bicolor-horizontal', colors: ['#ffffff', '#0099cc'], label: 'Galicia' },
  asturias: { type: 'bicolor-horizontal', colors: ['#0066cc', '#ffcc00'], label: 'Asturias' },
  cornwall: { type: 'bicolor-horizontal', colors: ['#ffffff', '#000000'], label: 'Cornwall' },
  wales: { type: 'bicolor-horizontal', colors: ['#00722c', '#ffffff', '#d30731'], label: 'Wales' },
  welsh: { type: 'bicolor-horizontal', colors: ['#00722c', '#ffffff', '#d30731'], label: 'Wales' },
  england: { type: 'solid', colors: ['#cf142b', '#ffffff'], label: 'England' },
  netherlands: { type: 'tricolor-horizontal', colors: ['#ae1c28', '#ffffff', '#21468b'], label: 'Netherlands' },
  dutch: { type: 'tricolor-horizontal', colors: ['#ae1c28', '#ffffff', '#21468b'], label: 'Netherlands' },
  germany: { type: 'tricolor-horizontal', colors: ['#000000', '#dd0000', '#ffce00'], label: 'Germany' },
  german: { type: 'tricolor-horizontal', colors: ['#000000', '#dd0000', '#ffce00'], label: 'Germany' },
  poland: { type: 'bicolor-horizontal', colors: ['#ffffff', '#dc143c'], label: 'Poland' },
  greece: { type: 'bicolor-horizontal', colors: ['#0d5eaf', '#ffffff'], label: 'Greece' },
  turkey: { type: 'solid', colors: ['#e30a17', '#ffffff'], label: 'Turkey' },
  bulgaria: { type: 'tricolor-horizontal', colors: ['#ffffff', '#00966e', '#d62612'], label: 'Bulgaria' },
  romania: { type: 'tricolor-vertical', colors: ['#002b7f', '#fcd116', '#ce1126'], label: 'Romania' },
  serbia: { type: 'tricolor-horizontal', colors: ['#c6363c', '#0c4da2', '#ffffff'], label: 'Serbia' },
  croatia: { type: 'tricolor-horizontal', colors: ['#ff0000', '#ffffff', '#171796'], label: 'Croatia' },
  slovenia: { type: 'tricolor-horizontal', colors: ['#ffffff', '#0000ff', '#ff0000'], label: 'Slovenia' },
  hungary: { type: 'tricolor-horizontal', colors: ['#cd2a3e', '#ffffff', '#436f4d'], label: 'Hungary' },
  ukraine: { type: 'bicolor-horizontal', colors: ['#0057b7', '#ffd700'], label: 'Ukraine' },
  basque: { type: 'solid', colors: ['#ffffff', '#009b3a', '#d40000'], label: 'Basque' },
  catalonia: { type: 'bicolor-horizontal', colors: ['#fcdd09', '#da121a'], label: 'Catalonia' },
  occitan: { type: 'bicolor-horizontal', colors: ['#fcdd09', '#d40000'], label: 'Occitan' },
  quebec: { type: 'solid', colors: ['#003399', '#ffffff'], label: 'Quebec' },
  canada: { type: 'tricolor-vertical', colors: ['#ff0000', '#ffffff', '#ff0000'], label: 'Canada' },
  usa: { type: 'tricolor-horizontal', colors: ['#b22234', '#ffffff', '#3c3b6e'], label: 'USA' },
  japan: { type: 'solid', colors: ['#ffffff', '#bc002d'], label: 'Japan' },
  brazil: { type: 'solid', colors: ['#009c3b', '#ffdf00', '#002776'], label: 'Brazil' },
  argentina: { type: 'tricolor-horizontal', colors: ['#74acdf', '#ffffff', '#74acdf'], label: 'Argentina' },
  mexico: { type: 'tricolor-vertical', colors: ['#006847', '#ffffff', '#ce1126'], label: 'Mexico' },
  balkan: { type: 'tricolor-horizontal', colors: ['#c6363c', '#0c4da2', '#ffffff'], label: 'Balkan' },
  balfolk: { type: 'bicolor-horizontal', colors: ['#8b4513', '#daa520'], label: 'Balfolk' },
};

const DEFAULT_FLAG: FlagDef = { type: 'none', colors: ['#b45309', '#d4a05a'], label: '' };

const NORDIC_COUNTRIES = ['sweden', 'norway', 'denmark', 'finland', 'iceland'];

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
      if (NORDIC_COUNTRIES.includes(key)) return flag;
      return flag;
    }
  }

  return DEFAULT_FLAG;
}

export function getFlagColors(region: string | null | undefined): { name: string; colors: string[] } {
  const flag = getFlag(region);
  return { name: flag.label, colors: flag.colors };
}
