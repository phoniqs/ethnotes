import { Layers } from 'lucide-react';
import FlagStripe from '@/components/FlagStripe';
import { resolveFlag } from '@/lib/flags';
import { extractOriginFromAbc } from '@/lib/abc';
import { parseAbcMetadata } from '@/lib/abc';
import type { Tune } from '@/types';

interface TuneCardProps {
  tune: Tune;
  versionCount: number;
  onOpen: () => void;
}

function extractFirstTwoBars(abc: string): string {
  const lines = abc.split('\n');
  const bodyParts: string[] = [];
  let inBody = false;
  let barCount = 0;

  for (const line of lines) {
    if (line.startsWith('%')) continue;
    const m = line.match(/^\s*([A-Za-z]):\s*(.*)$/);
    if (m && m[1].toUpperCase() === 'K') {
      inBody = true;
      continue;
    }
    if (m && !inBody) continue;
    if (!inBody) continue;

    const bars = line.split('|');
    for (const bar of bars) {
      if (bar.trim() === '') continue;
      bodyParts.push(bar.trim());
      barCount++;
      if (barCount >= 2) break;
    }
    if (barCount >= 2) break;
  }

  return bodyParts.join('|').replace(/\s+/g, ' ').trim();
}

export default function TuneCard({ tune, versionCount, onOpen }: TuneCardProps) {
  const origin = extractOriginFromAbc(tune.abc);
  const flag = resolveFlag(origin, tune.group, tune.region);
  const hasFlag = flag.type !== 'none';
  const type = parseAbcMetadata(tune.abc).type ?? tune.type;
  const previewAbc = extractFirstTwoBars(tune.abc);

  return (
    <button
      onClick={onOpen}
      className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-wood-200 bg-parchment-50 text-left shadow-sheet transition duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-wood-700 dark:bg-wood-900"
    >
      {hasFlag && (
        <div className="absolute inset-0 opacity-[0.13] transition-opacity duration-200 group-hover:opacity-[0.08] dark:opacity-[0.10] dark:group-hover:opacity-[0.06]">
          <FlagStripe origin={origin} region={tune.region} group={tune.group} className="h-full w-full rounded-none" />
        </div>
      )}
      <div className="relative flex flex-col p-2.5">
        <div className="mb-1 flex items-start justify-between gap-1.5">
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-tight text-wood-800 group-hover:text-amber-800 dark:text-parchment-100 dark:group-hover:text-amber-300">
            {tune.title}
          </h3>
          {versionCount > 1 ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100/90 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              <Layers className="h-2.5 w-2.5" />
              {versionCount}
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-amber-100/90 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              {type}
            </span>
          )}
        </div>
        {previewAbc && (
          <p className="mt-1 truncate font-mono text-[11px] leading-snug text-wood-500 dark:text-parchment-200/60">
            {previewAbc}
          </p>
        )}
      </div>
    </button>
  );
}
