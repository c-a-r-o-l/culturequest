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
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink text-wall text-xs font-bold shadow-sm hover:brightness-125 active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      );
    }

    return (
      <div className="mx-4 my-2 p-3 bg-card border border-line rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gold-soft flex items-center justify-center text-gold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink">Install CultureQuest</div>
            <div className="text-[11px] text-muted">Add to home screen for the full map experience</div>
          </div>
        </div>
        <button
          onClick={install}
          className="px-3 py-1.5 bg-vermilion text-white font-bold text-xs rounded-xl shadow-[0_2px_0_rgba(0,0,0,0.15)] active:translate-y-0.5 transition"
        >
          Get app
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
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-line text-[11px] font-semibold text-ink"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="mx-4 my-2 p-2.5 bg-card border border-line rounded-2xl flex items-center justify-between text-left text-xs font-medium text-ink"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-vermilion" />
              <span>Tap here to install CultureQuest on iPhone</span>
            </div>
            <span className="text-[10px] text-teal bg-teal-soft px-2 py-0.5 rounded-full font-bold">iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-6 shadow-2xl text-ink">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <h3 className="text-base font-black text-ink font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" /> Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full hover:bg-wall text-muted hover:text-ink"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-muted leading-relaxed">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-soft text-[#8A6A10] flex items-center justify-center font-bold shrink-0">1</div>
                  <p>
                    Tap the <strong className="text-ink inline-flex items-center gap-1 mx-1"><Share className="w-3.5 h-3.5" /> Share</strong> icon in your Safari bottom bar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-soft text-[#8A6A10] flex items-center justify-center font-bold shrink-0">2</div>
                  <p>Scroll down the menu list and tap <strong className="text-ink">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-soft text-[#8A6A10] flex items-center justify-center font-bold shrink-0">3</div>
                  <p>Launch from your home screen for a full-screen map, vibrations, and offline access!</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-vermilion text-white font-bold text-xs shadow active:translate-y-0.5"
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
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-gold text-ink px-3 py-1 text-[11px] font-bold shadow-xl border border-gold/40 animate-pulse">
      <span className="h-2 w-2 rounded-full bg-ink" />
      <span>Offline mode — Cambridge map cached</span>
    </div>
  );
};
