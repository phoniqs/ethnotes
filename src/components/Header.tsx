import { BarChart3, LogOut, Moon, Music, Plus, Sun, Upload, Users } from 'lucide-react';

interface HeaderProps {
  dark: boolean;
  onToggleDark: () => void;
  onNewTune: () => void;
  onBulkImport: () => void;
  onCommunity: () => void;
  onStats: () => void;
  onHome: () => void;
  onSignOut: () => void;
  showActions: boolean;
}

export default function Header({ dark, onToggleDark, onNewTune, onBulkImport, onCommunity, onStats, onHome, onSignOut, showActions }: HeaderProps) {
  return <header className="sticky top-0 z-30 border-b border-wood-200/80 bg-parchment-100/85 backdrop-blur-md dark:border-wood-800 dark:bg-wood-950/85"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
    <button onClick={onHome} className="group flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-700 text-parchment-50 shadow-sm transition group-hover:bg-amber-800"><Music className="h-5 w-5" /></span><span className="flex flex-col leading-none"><span className="font-display text-xl font-semibold text-wood-800 dark:text-parchment-100">Ethnotes</span><span className="text-[11px] font-medium uppercase tracking-widest text-amber-700 dark:text-amber-400">Traditional music notebook</span></span></button>
    <div className="flex items-center gap-1.5"><button onClick={onToggleDark} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className="flex h-9 w-9 items-center justify-center rounded-lg text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800">{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>{showActions && <><button onClick={onStats} aria-label="Statistics" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800 sm:px-3"><BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Stats</span></button><button onClick={onCommunity} aria-label="Tunes around me" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800 sm:px-3"><Users className="h-4 w-4" /><span className="hidden sm:inline">Around me</span></button><button onClick={onBulkImport} aria-label="Bulk import tunes" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800 sm:px-3"><Upload className="h-4 w-4" /><span className="hidden sm:inline">Bulk import</span></button><button onClick={onNewTune} className="inline-flex items-center gap-2 rounded-lg bg-amber-700 px-3.5 py-2 text-sm font-semibold text-parchment-50 shadow-sm transition hover:bg-amber-800"><Plus className="h-4 w-4" /><span className="hidden sm:inline">New tune</span></button><button onClick={onSignOut} aria-label="Sign out" className="flex h-9 w-9 items-center justify-center rounded-lg text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800"><LogOut className="h-4 w-4" /></button></>}</div>
  </div></header>;
}
