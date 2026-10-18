import { useMemo } from 'react';
import { BookOpen, ExternalLink, Mic } from 'lucide-react';
import { EXTERNAL_SITES, siteSearchUrl } from '@/lib/externalSites';
import { resolveFlag } from '@/lib/flags';
import { extractOriginFromAbc } from '@/lib/abc';
import type { SiteCategory } from '@/lib/externalSites';
import type { Tune } from '@/types';

interface ExternalLinksProps {
  tune: Tune;
  currentAbc: string;
}

const BALFOLK_PATTERN = /balfolk|breton|brittany|france|french|auvergne|bourrée|bouree|mazurka|gavotte|an dro|hanter dro|plinn|ridée|maraîchine|valse/i;
const NORDIC_PATTERN = /polska|slängpolska|schottis|sweden|swedish|nordic|finland|finnish|norway|norwegian|denmark|danish|iceland|hambo|gånglåt|brudmarsch|gammal/i;
const IRISH_PATTERN = /ireland|irish|scotland|scottish|reel|jig|hornpipe|slip jig|strathspey|barndance|slide|three-two/i;

export function categoryForTune(tune: Tune, abc: string): SiteCategory {
  const origin = extractOriginFromAbc(abc) ?? '';
  const haystack = [origin, tune.group ?? '', tune.region ?? '', tune.type].join(' ');
  const flag = resolveFlag(origin, tune.group, tune.region);
  const full = haystack + ' ' + flag.label;

  if (NORDIC_PATTERN.test(full)) return 'nordic';
  if (BALFOLK_PATTERN.test(full)) return 'balfolk';
  if (IRISH_PATTERN.test(full)) return 'irish';
  return 'any';
}

export default function ExternalLinks({ tune, currentAbc }: ExternalLinksProps) {
  const category = useMemo(() => categoryForTune(tune, currentAbc), [tune, currentAbc]);

  const referenceSites = useMemo(() => {
    const matching = EXTERNAL_SITES.filter((s) => s.kind === 'reference' && s.categories.includes(category));
    return matching.length > 0 ? matching : EXTERNAL_SITES.filter((s) => s.kind === 'reference');
  }, [category]);

  const shazamSites = useMemo(() => {
    const matching = EXTERNAL_SITES.filter((s) => s.kind === 'shazam' && (s.categories.includes(category) || s.categories.includes('any')));
    return matching.length > 0 ? matching : EXTERNAL_SITES.filter((s) => s.kind === 'shazam');
  }, [category]);

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-5 dark:border-wood-700 dark:bg-wood-900">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">
          <BookOpen className="h-3.5 w-3.5 text-amber-600" />
          Find this tune elsewhere
        </div>
        <div className="flex flex-wrap gap-2">
          {referenceSites.map((site) => {
            const href = siteSearchUrl(site, tune.title);
            if (!href) return null;
            return (
              <a
                key={site.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg border border-wood-200 bg-parchment-50 px-3.5 py-2 text-sm font-medium text-wood-700 transition hover:border-amber-400 hover:bg-amber-50 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100 dark:hover:border-amber-500 dark:hover:bg-amber-900/20"
              >
                {site.name}
                <ExternalLink className="h-3.5 w-3.5 text-wood-400 transition group-hover:text-amber-600 dark:text-parchment-200/50 dark:group-hover:text-amber-300" />
              </a>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-wood-400 dark:text-parchment-200/50">Searches the tune's title on each site. Opens in a new tab.</p>
      </div>

      {shazamSites.length > 0 && (
        <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-5 dark:border-wood-700 dark:bg-wood-900">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">
            <Mic className="h-3.5 w-3.5 text-amber-600" />
            Identify by ear
          </div>
          <div className="flex flex-wrap gap-2">
            {shazamSites.map((site) => (
              <a
                key={site.id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-lg border border-wood-200 bg-parchment-50 px-3.5 py-2 text-sm font-medium text-wood-700 transition hover:border-amber-400 hover:bg-amber-50 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100 dark:hover:border-amber-500 dark:hover:bg-amber-900/20"
              >
                {site.name}
                <ExternalLink className="h-3.5 w-3.5 text-wood-400 transition group-hover:text-amber-600 dark:text-parchment-200/50 dark:group-hover:text-amber-300" />
              </a>
            ))}
          </div>
          <p className="mt-3 text-xs text-wood-400 dark:text-parchment-200/50">Play the tune near your device's microphone on these sites.</p>
        </div>
      )}
    </div>
  );
}
