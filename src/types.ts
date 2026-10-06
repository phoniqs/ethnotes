export const TUNE_TYPES = [
  // Irish / Anglo-Saxon
  'Reel', 'Jig', 'Polka', 'Slip Jig', 'Waltz', 'Hornpipe', 'Slide',
  'March', 'Strathspey', 'Three-two', 'Barndance', 'Air',
  // Scandinavian
  'Polska', 'Slängpolska', 'Schottis', 'Sønderhoning', 'Reinlendar',
  'Labajalg', 'Skänklåt', 'Finnskogpols', 'Halling', 'Menuett',
  // Balfolk / French & Regional
  'Mazurka', 'Bourrée 3 temps', 'Bourrée 2 temps', 'Bourrée',
  'Gavotte', 'An Dro', 'Rond d\'Argenton', 'Mazurka-valse',
  'Pilé menu', 'Kan ha diskan', 'Hanter dro', 'Kas a-barh',
  'Maraîchine', 'Plinn', 'Ridée',
  // Balkans / Orient / Klezmer
  'Aksak', 'Freilach', 'Kopanitsa',
  // Compound meters
  '7/8', '5/4',
  // Catch-all
  'Other',
] as const;

export type TuneType = (typeof TUNE_TYPES)[number];

export interface TuneSetting {
  id: string;
  tune_id: string;
  setting_number: number;
  author: string | null;
  key: string;
  abc: string;
}

export interface Tune {
  id: string;
  user_id?: string;
  title: string;
  type: TuneType;
  key: string;
  region: string;
  notes: string;
  abc: string;
  tags: string[];
  group: string | null;
  settings?: TuneSetting[];
  createdAt: number;
  updatedAt: number;
}

export type TuneDraft = Omit<Tune, 'id' | 'user_id' | 'settings' | 'createdAt' | 'updatedAt'>;

export interface Profile {
  id: string;
  display_name: string;
  sharing_enabled: boolean;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
}
