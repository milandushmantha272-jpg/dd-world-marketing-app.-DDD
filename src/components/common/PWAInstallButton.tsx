import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'outline' | 'pill';
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'pill',
  label = 'Install App',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running as an installed standalone PWA, do not show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 4000);
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-in fade-in">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>App Installed!</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          title="Install DD World App for instant offline access"
          className={`flex items-center justify-center p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white shadow transition-all active:scale-95 ${className}`}
        >
          <Download className="w-4 h-4" />
        </button>
      );
    }

    if (variant === 'outline') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold transition shadow-sm active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>{label}</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className={`group flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 hover:shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer border border-emerald-400/30 ${className}`}
      >
        <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        <span>{label}</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition active:scale-95 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Install on iPhone / iPad</h3>
                    <p className="text-[11px] text-slate-400">DD WORLD Enterprise Mobile Portal</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Step 1</p>
                    <p className="text-slate-400 text-[11px]">
                      Tap the <strong className="text-white">Share</strong> button at the bottom of Safari.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Step 2</p>
                    <p className="text-slate-400 text-[11px]">
                      Scroll down and tap <strong className="text-white">&quot;Add to Home Screen&quot;</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow transition active:scale-95"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
