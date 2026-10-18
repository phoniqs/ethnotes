export interface ExternalSite {
  id: string;
  name: string;
  description: string;
  url: string;
  categories: SiteCategory[];
  kind: 'reference' | 'shazam';
}

export type SiteCategory = 'irish' | 'balfolk' | 'nordic' | 'any';

export const EXTERNAL_SITES: ExternalSite[] = [
  {
    id: 'thesession',
    name: 'The Session',
    description: 'Irish & Scottish trad',
    url: 'https://thesession.org/tunes/search?q={{title}}',
    categories: ['irish'],
    kind: 'reference',
  },
  {
    id: 'baloche',
    name: 'Baloche',
    description: 'Balfolk & Breton scores',
    url: 'https://baloche.onth.org/baloche-search/?q={{title}}',
    categories: ['balfolk'],
    kind: 'reference',
  },
  {
    id: 'folkwiki',
    name: 'FolkWiki',
    description: 'Swedish & Nordic tunes',
    url: 'http://www.folkwiki.se/?action=search&q={{title}}',
    categories: ['nordic'],
    kind: 'reference',
  },
  {
    id: 'tunepal',
    name: 'Tunepal',
    description: 'Identify by ear — Irish/Scottish',
    url: 'https://tunepal.org/#!/record',
    categories: ['irish'],
    kind: 'shazam',
  },
  {
    id: 'folkfriend',
    name: 'FolkFriend',
    description: 'Identify by ear — Irish/Scottish',
    url: 'https://folkfriend.app',
    categories: ['irish'],
    kind: 'shazam',
  },
  {
    id: 'balfolkfriend',
    name: 'BalfolkFriend',
    description: 'Identify by ear — balfolk',
    url: 'https://balfolkfriend.netlify.app',
    categories: ['balfolk'],
    kind: 'shazam',
  },
  {
    id: 'swedishfolkfriend',
    name: 'SwedishFolkFriend',
    description: 'Identify by ear — Swedish/Nordic',
    url: 'https://swedishfolkfriend.netlify.app',
    categories: ['nordic'],
    kind: 'shazam',
  },
];

export function externalSearchUrl(site: ExternalSite, title: string): string {
  const cleaned = title
    .replace(/\s*[([].*[)\]]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return site.url.replace('{{title}}', encodeURIComponent(cleaned || title.trim()));
}

export function siteSearchUrl(site: ExternalSite, title: string): string | null {
  if (site.kind !== 'reference') return null;
  return externalSearchUrl(site, title);
}
