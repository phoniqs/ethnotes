import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Ethnotes render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-6 py-16 text-center dark:border-amber-900/40 dark:bg-amber-950/30">
            <AlertTriangle className="mb-3 h-8 w-8 text-amber-600" />
            <p className="font-display text-lg font-semibold text-wood-800 dark:text-parchment-100">
              This tune could not be displayed
            </p>
            <p className="mt-1 max-w-sm text-sm text-wood-500 dark:text-parchment-200/70">
              The ABC notation may be malformed. Try editing the tune to fix the notation.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
