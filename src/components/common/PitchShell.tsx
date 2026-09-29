import React, { useEffect, useState } from 'react';
import { Ticket, MapPin, Sparkles, Gift } from 'lucide-react';

const FRAME_W = 390;
const FRAME_H = 844;

/**
 * PitchShell: on laptops (≥1024px) the app renders inside a scaled phone
 * frame with branding beside it — the pitch presentation view. On phones
 * and small screens children render raw, full-bleed.
 *
 * The frame's `transform: scale()` is what makes every `position: fixed`
 * element in the app (bottom nav, modals) position itself inside the frame:
 * a transform creates the containing block for fixed descendants, so no
 * app components need to change.
 */
export const PitchShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const compute = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setScale(Math.min(1, (window.innerHeight - 88) / FRAME_H));
      }
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  if (!isDesktop) {
    // Phones/small screens: raw app, full-bleed. The wrapper gives the app
    // root its h-full height.
    return <div className="h-dvh overflow-hidden">{children}</div>;
  }

  return (
    <div className="pitch-backdrop min-h-screen overflow-hidden">
      <div className="min-h-screen flex items-center justify-center gap-16 px-10 py-6">
        {/* Branding panel */}
        <aside className="w-[380px] shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-vermilion border-2 border-ink shadow-[4px_4px_0_#1D1C16] flex items-center justify-center rotate-[-4deg]">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-ink font-display tracking-tight">
              Culture<span className="text-vermilion">Quest</span>
            </h1>
          </div>

          <p className="text-sm text-muted mt-4 leading-relaxed">
            Explore museums. Complete quests. Earn points you can spend at real
            shops, cafés and gardens around your city.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-vermilion-soft text-vermilion flex items-center justify-center font-mono font-bold text-xs shrink-0">1</div>
              <div>
                <div className="text-sm font-bold text-ink font-display flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-vermilion" /> Discover
                </div>
                <p className="text-xs text-muted mt-0.5">One map for every museum, gallery and culture spot near you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-soft text-teal flex items-center justify-center font-mono font-bold text-xs shrink-0">2</div>
              <div>
                <div className="text-sm font-bold text-ink font-display flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal" /> Play
                </div>
                <p className="text-xs text-muted mt-0.5">Check in, hunt for artefacts, answer trivia, snap photos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gold-soft text-[#8A6A10] flex items-center justify-center font-mono font-bold text-xs shrink-0">3</div>
              <div>
                <div className="text-sm font-bold text-ink font-display flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-gold" /> Redeem
                </div>
                <p className="text-xs text-muted mt-0.5">Turn points into vouchers at local partner businesses.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-card border border-line text-[10px] font-bold text-ink font-mono">
              PILOT: CAMBRIDGE
            </span>
            <span className="px-2.5 py-1 rounded-full bg-card border border-line text-[10px] font-bold text-muted font-mono">
              8 venues · 8 quests · 6 partners
            </span>
          </div>
        </aside>

        {/* Phone frame — layout box matches the scaled visual size */}
        <div className="relative shrink-0" style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
          <div
            className="absolute top-0 left-0 rounded-[3rem] border-[10px] border-ink bg-wall shadow-[0_40px_90px_rgba(0,0,0,0.35)] overflow-hidden"
            style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
