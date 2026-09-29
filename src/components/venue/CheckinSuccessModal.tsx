import React from 'react';
import { Venue, CollectibleCard } from '../../types';
import { Sparkles, Trophy, ArrowRight, X, CheckCircle2, Bookmark } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

interface CheckinSuccessModalProps {
  venue: Venue;
  pointsEarned: number;
  newCard?: CollectibleCard;
  onClose: () => void;
  onStartQuest: () => void;
  onInspectCard: (card: CollectibleCard) => void;
}

export const CheckinSuccessModal: React.FC<CheckinSuccessModalProps> = ({
  venue,
  pointsEarned,
  newCard,
  onClose,
  onStartQuest,
  onInspectCard,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-400/60 p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Trophy / Stamp Graphic */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-500 to-rose-500 p-1 shadow-lg mb-4 mt-2 animate-bounce [animation-iteration-count:1]">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          Check-in Verified!
        </span>

        <h2 className="text-2xl font-black text-white mt-2 font-['Outfit']">{venue.name}</h2>
        <p className="text-xs text-slate-400 mt-1">Official passport stamp added to your collection.</p>

        {/* Points Reward Pill */}
        <div className="my-4 px-5 py-2.5 rounded-2xl bg-amber-400/15 border border-amber-400/50 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-lg font-black text-amber-300">+{pointsEarned} Points Earned!</span>
        </div>

        {/* Card Drop if unlocked */}
        {newCard && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onInspectCard(newCard);
            }}
            className="w-full p-3 rounded-2xl bg-indigo-950/80 border border-indigo-400/40 hover:border-amber-400 text-left flex items-center gap-3 transition mb-4 group"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-amber-400/50">
              <img src={newCard.image} alt={newCard.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  {newCard.rarity} Drop
                </span>
                <span className="text-[10px] text-slate-400">{newCard.setName}</span>
              </div>
              <div className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-amber-300 transition">
                {newCard.name}
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-400">View ➜</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              onStartQuest();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-black text-sm shadow-[0_4px_0_#9a3412] active:translate-y-0.5 transition flex items-center justify-center gap-2"
          >
            <span>Start a Quest Here</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
};
