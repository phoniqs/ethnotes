import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, GraduationCap, Library, Mic } from 'lucide-react';
import { EXTERNAL_SITES } from '@/lib/externalSites';

interface ResourcesProps { onBack: () => void; }

const EAR_TOOLS = EXTERNAL_SITES.filter((s) => s.kind === 'shazam');
const SCORE_SITES = EXTERNAL_SITES.filter((s) => s.kind === 'reference');

function LinkChip({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-lg border border-wood-200 bg-parchment-50 px-3.5 py-2 text-sm font-medium text-wood-700 transition hover:border-amber-400 hover:bg-amber-50 dark:border-wood-700 dark:bg-wood-900 dark:text-parchment-100 dark:hover:border-amber-500 dark:hover:bg-amber-900/20"
    >
      {name}
      <ExternalLink className="h-3.5 w-3.5 text-wood-400 transition group-hover:text-amber-600 dark:text-parchment-200/50 dark:group-hover:text-amber-300" />
    </a>
  );
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-5 dark:border-wood-700 dark:bg-wood-900">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

export default function Resources({ onBack }: ResourcesProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-wood-600 hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800">
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </button>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-semibold text-wood-800 dark:text-parchment-100">Ressources</h1>
        <p className="mt-2 text-wood-500 dark:text-parchment-200/70">Tools and references for finding and learning new tunes. Everything opens in a new tab.</p>
      </div>

      <div className="space-y-4">
        <Card icon={<Mic className="h-3.5 w-3.5 text-amber-600" />} title="Identify a tune by ear">
          <div className="flex flex-wrap gap-2">
            {EAR_TOOLS.map((tool) => (
              <LinkChip key={tool.id} name={tool.name} url={tool.url} />
            ))}
          </div>
          <p className="mt-3 text-xs text-wood-400 dark:text-parchment-200/50">
            Play the tune near your device's microphone. Tunepal and FolkFriend know Irish and Scottish music, BalfolkFriend knows balfolk, SwedishFolkFriend knows Swedish and Nordic tunes, and Tradify covers any repertoire, including Quebecois.
          </p>
        </Card>

        <Card icon={<GraduationCap className="h-3.5 w-3.5 text-amber-600" />} title="Learn ABC notation">
          <div className="flex flex-wrap gap-2">
            <LinkChip
              name="ABC Standard v2.1"
              url="https://abcnotation.com/wiki/abc:standard:v2.1"
            />
          </div>
          <p className="mt-3 text-xs text-wood-400 dark:text-parchment-200/50">
            ABC notation is the simple text format your tunes are stored in — letters for notes, letters like T:, K: and R: for the title, key and dance type. This guide explains every part of it.
          </p>
        </Card>

        <Card icon={<Library className="h-3.5 w-3.5 text-amber-600" />} title="Find scores online">
          <div className="flex flex-wrap gap-2">
            {SCORE_SITES.map((site) => (
              <LinkChip key={site.id} name={site.name} url={site.url.replace('{{title}}', '')} />
            ))}
          </div>
          <p className="mt-3 text-xs text-wood-400 dark:text-parchment-200/50">
            The Session for Irish and Scottish trad, Baloche for balfolk and Breton music, FolkWiki for Swedish and Nordic tunes. From any tune's page you can also jump straight to a title search on the matching site.
          </p>
        </Card>
      </div>
    </div>
  );
}
