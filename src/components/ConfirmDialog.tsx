import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-wood-950/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-fade-in rounded-2xl border border-wood-200 bg-parchment-50 p-6 shadow-xl dark:border-wood-700 dark:bg-wood-900">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mb-1 font-display text-lg font-semibold text-wood-800 dark:text-parchment-100">{title}</h2>
        <p className="mb-5 text-sm leading-relaxed text-wood-500 dark:text-parchment-200/70">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-wood-600 transition hover:bg-wood-100 dark:text-parchment-200 dark:hover:bg-wood-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
