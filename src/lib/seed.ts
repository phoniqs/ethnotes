import type { Tune } from '@/types';

interface SeedTune {
  title: string;
  type: Tune['type'];
  key: string;
  region: string;
  notes: string;
  abc: string;
}

export const SEED_TUNES: SeedTune[] = [
  {
    title: 'The Kesh Jig',
    type: 'Jig',
    key: 'Gmaj',
    region: 'Ireland',
    notes: 'A session staple, also known as "The Kincora Jig". Great first jig to learn — rolling and open.',
    abc: `X:1
T:The Kesh Jig
R:jig
M:6/8
L:1/8
K:Gmaj
|:G3 GAB|AGA BAB|GBd gdB|ABA AGE|
G3 GAB|AGA BAB|GBd gdB|AGF G3:|
|:B2B dgd|edB dBA|B2B dBd|edB AGE|
GBd gdB|ABd edB|GBd gdB|AGF G3:|`,
  },
  {
    title: 'Drowsy Maggie',
    type: 'Reel',
    key: 'Edor',
    region: 'Ireland',
    notes: 'One of the most recognisable Irish reels. Builds beautifully with speed and drive.',
    abc: `X:1
T:Drowsy Maggie
R:reel
M:4/4
L:1/8
K:Edor
|:E2BE dEBE|E2BE AFDF|E2BE dEBE|BABc dAFD:|
|:E2eB e2eB|E2eB gfed|B2dB AdBA|dAFD E2FD:|`,
  },
  {
    title: 'Tri Martolod',
    type: 'March',
    key: 'Am',
    region: 'Brittany',
    notes: 'A beloved Breton song ("Three Sailors"), popularised by Alan Stivell. Lovely for an an-dro dance set.',
    abc: `X:1
T:Tri Martolod
R:march
M:4/4
L:1/8
K:Am
|:A2 AB c2 BA|B2 GB E4|A2 AB c2 dc|B2 GB A4:|
|:e2 ef g2 fe|d2 Bd e4|e2 ef g2 ag|e2 dB A4:|`,
  },
];
