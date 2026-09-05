export const TUNE_TYPES = [
  'Jig', 'Reel', 'Slip Jig', 'Hornpipe', 'Polka', 'Slide', 'Waltz', 'Mazurka',
  'March', 'Air', 'Bourrée', 'Other',
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
