import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from '../../hooks/usePWAInstall';
import { Download, Sparkles, X, Share } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    if (compact) {
      return (
        <button
          onClick={install}
          title="Install app to your home screen"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      );
    }

    return (
      <div className="mx-4 my-2 p-3 bg-gradient-to-r from-indigo-950/80 to-slate-900/90 border border-amber-500/30 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Install CultureQuest</div>
            <div className="text-[11px] text-slate-400">Add to home screen for full GPS radar</div>
          </div>
        </div>
        <button
          onClick={install}
          className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-[0_2px_0_#b45309] active:translate-y-0.5 transition"
        >
          Get App
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        {compact ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="mx-4 my-2 p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl flex items-center justify-between text-left text-xs font-medium text-slate-200"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <span>Tap here to install CultureQuest on iPhone</span>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">1</div>
                  <p>
                    Tap the <strong className="text-white inline-flex items-center gap-1 mx-1"><Share className="w-3.5 h-3.5" /> Share</strong> icon in your Safari bottom bar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">2</div>
                  <p>Scroll down the menu list and tap <strong className="text-white">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">3</div>
                  <p>Launch from your home screen for full-screen map, tactile vibrations, and offline access!</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-400 font-bold text-slate-950 text-xs shadow hover:bg-amber-300"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-slate-950 shadow-xl border border-amber-300/40 animate-pulse">
      <span className="h-2 w-2 rounded-full bg-slate-950" />
      <span>Offline Mode — Cambridge cache ready</span>
    </div>
  );
};
