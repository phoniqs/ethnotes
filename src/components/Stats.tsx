import { useMemo } from 'react';
import { Bar, BarChart, Cell, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, FolderTree, KeyRound, ListMusic, Music2, TrendingUp } from 'lucide-react';
import { computeStats } from '@/lib/stats';
import type { Tune } from '@/types';

interface StatsProps {
  tunes: Tune[];
  onBack: () => void;
}

const CHART_COLORS = ['#b45309', '#059669', '#0284c7', '#dc2626', '#7c3aed', '#ea580c', '#0891b2', '#ca8a04'];

export default function Stats({ tunes, onBack }: StatsProps) {
  const stats = useMemo(() => computeStats(tunes), [tunes]);

  const radarData = stats.groups.map((g) => ({ group: g.group, count: g.count }));
  const rhythmData = stats.rhythms.slice(0, 8).map((r) => ({ rhythm: r.rhythm, count: r.count }));
  const keyData = stats.keys.map((k) => ({ key: k.key, count: k.count }));

  const labelClass = 'mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800">
        <ArrowLeft className="h-4 w-4" />
        Back to library
      </button>

      <h1 className="mb-2 font-display text-3xl font-semibold text-wood-800 dark:text-parchment-100 sm:text-4xl">Repertoire statistics</h1>
      <p className="mb-8 text-wood-500 dark:text-parchment-200/70">A visual overview of your tune collection by group, key, and rhythm.</p>

      {stats.totalTunes === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wood-300 bg-parchment-50/60 px-6 py-20 text-center dark:border-wood-700 dark:bg-wood-900/40">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <ListMusic className="h-7 w-7" />
          </div>
          <h3 className="mb-1 font-display text-xl font-semibold text-wood-800 dark:text-parchment-100">No tunes to analyze yet</h3>
          <p className="max-w-sm text-sm text-wood-500 dark:text-parchment-200/70">Add some tunes to your repertoire and come back to see your statistics.</p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard icon={<ListMusic className="h-5 w-5" />} label="Total tunes" value={String(stats.totalTunes)} />
            <KpiCard icon={<FolderTree className="h-5 w-5" />} label="Unique groups" value={String(stats.totalGroups)} />
            <KpiCard icon={<KeyRound className="h-5 w-5" />} label="Top key" value={stats.topKey ?? '—'} />
            <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Top rhythm" value={stats.topRhythm ?? '—'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-5 shadow-sheet dark:border-wood-700 dark:bg-wood-900">
              <div className={labelClass}>
                <FolderTree className="h-3.5 w-3.5 text-amber-600" />
                Group distribution (Kiviat)
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="currentColor" className="text-wood-300 dark:text-wood-600" />
                    <PolarAngleAxis dataKey="group" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-wood-600 dark:text-parchment-200/70" />
                    <Radar name="Tunes" dataKey="count" stroke="#b45309" fill="#b45309" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid', fontSize: '0.875rem' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-5 shadow-sheet dark:border-wood-700 dark:bg-wood-900">
              <div className={labelClass}>
                <Music2 className="h-3.5 w-3.5 text-amber-600" />
                Rhythm breakdown
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rhythmData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                    <XAxis dataKey="rhythm" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-wood-600 dark:text-parchment-200/70" interval={0} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: 'currentColor' }} className="text-wood-600 dark:text-parchment-200/70" allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid', fontSize: '0.875rem' }} cursor={{ fillOpacity: 0.1 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {rhythmData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-5 shadow-sheet dark:border-wood-700 dark:bg-wood-900 lg:col-span-2">
              <div className={labelClass}>
                <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                Top 5 keys / modes
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keyData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-wood-600 dark:text-parchment-200/70" allowDecimals={false} />
                    <YAxis type="category" dataKey="key" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-wood-600 dark:text-parchment-200/70" width={70} />
                    <Tooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid', fontSize: '0.875rem' }} cursor={{ fillOpacity: 0.1 }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {keyData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-wood-200 bg-parchment-50 p-4 shadow-sheet dark:border-wood-700 dark:bg-wood-900">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-semibold text-wood-800 dark:text-parchment-100">{value}</p>
    </div>
  );
}
