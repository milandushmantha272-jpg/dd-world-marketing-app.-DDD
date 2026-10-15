import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Readonly<Props>;

  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DD WORLD App uncaught runtime error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                DD WORLD System Auto-Recovery
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                පද්ධතිය යථා තත්ත්වයට පත් කිරීම
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                App එක ආරම්භ වීමේදී හෝ තිරය පූරණය වීමේදී යම් බාධාවක් ඇති විය. කරුණාකර පහත Button එක මඟින් App එක Re-load කරන්න.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left font-mono text-[11px] text-rose-400 break-words max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>App එක නැවත පූරණය කරන්න (Re-load App)</span>
              </button>

              <button
                onClick={this.handleResetAndReload}
                className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cache / Session Reset කර Reload කරන්න</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}
