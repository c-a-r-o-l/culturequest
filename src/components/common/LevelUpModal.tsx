import React from 'react';
import { Sparkles, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../../utils/audioAndFx';

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  newTitle: string;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  oldLevel,
  newLevel,
  newTitle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-2 border-amber-400 p-6 shadow-[0_0_50px_rgba(245,158,11,0.4)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-amber-400/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-indigo-500/30 rounded-full blur-2xl" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-rose-500 p-1 shadow-2xl mb-4 animate-bounce [animation-iteration-count:2]">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40">
          Level Up!
        </span>

        <h2 className="text-3xl font-black text-white mt-2 font-['Outfit']">Level {newLevel} Reached!</h2>
        <p className="text-sm font-bold text-amber-400 mt-1">Title: {newTitle}</p>

        <div className="my-4 p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-slate-300 text-left space-y-1.5 w-full">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Rewards Unlocked:
          </div>
          <div>• +50 Bonus Culture Points credited</div>
          <div>• 1x Streak Freeze Token awarded</div>
          <div>• Exclusive Cambridge Leaderboard Badge</div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-black text-sm shadow-[0_4px_0_#9a3412] active:translate-y-0.5 transition flex items-center justify-center gap-2"
        >
          <span>Claim & Continue Quest</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
