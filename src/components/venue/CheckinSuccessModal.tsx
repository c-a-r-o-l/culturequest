import React from 'react';
import { Venue, CollectibleCard } from '../../types';
import { Sparkles, Trophy, ArrowRight, X, Scroll, Award, BookOpen } from 'lucide-react';
import { triggerHaptic } from '../../utils/audioAndFx';

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
      <div className="w-full max-w-sm rounded-3xl parchment-card border-2 border-[#B89758] p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758] flex items-center justify-center hover:opacity-80"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Heraldic Wax Seal Stamp */}
        <div className="relative mb-3 mt-1">
          <div className="w-20 h-20 rounded-full bg-[#6B1D23] border-4 border-[#B89758] flex items-center justify-center shadow-[0_4px_14px_rgba(107,29,35,0.5)]">
            <Award className="w-10 h-10 text-[#E2CA8E]" />
          </div>
          <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded bg-[#1C3A27] text-[#FAF8F5] text-[9px] font-mono border border-[#B89758]">
            SEALED
          </div>
        </div>

        <span className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-[#6B1D23]">
          Decretum Matriculationis
        </span>

        <h2 className="text-xl font-bold text-[#1C3A27] font-display mt-1">{venue.name}</h2>
        <p className="text-xs font-body italic text-[#4A5D50] mt-0.5">
          Archival presence officially inscribed in the Cambridge ledger.
        </p>

        {/* Honorarium Reward Pill */}
        <div className="my-4 px-5 py-2.5 rounded-2xl bg-[#1C3A27] border border-[#B89758] flex items-center gap-2 shadow">
          <Sparkles className="w-4 h-4 text-[#E2CA8E]" />
          <span className="text-sm font-display font-bold text-[#E2CA8E]">+{pointsEarned} Honorarium Points Awarded</span>
        </div>

        {/* Dropped Manuscript Card if any */}
        {newCard && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onInspectCard(newCard);
            }}
            className="w-full p-3 rounded-2xl bg-[#122419] border border-[#B89758] text-left flex items-center gap-3 transition mb-4 group hover:border-[#E2CA8E]"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#1C3A27] shrink-0 border border-[#B89758]/60">
              <img src={newCard.image} alt={newCard.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[#6B1D23] text-[#FAF8F5]">
                  {newCard.rarity} Folio
                </span>
                <span className="text-[10px] text-[#A6BAAE] font-body">{newCard.setName}</span>
              </div>
              <div className="text-xs font-bold text-[#FAF8F5] font-display truncate mt-0.5 group-hover:text-[#E2CA8E] transition">
                {newCard.name}
              </div>
            </div>
            <span className="text-[11px] font-display font-bold text-[#E2CA8E]">Inspect ➜</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              onStartQuest();
            }}
            className="w-full py-3.5 rounded-2xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Decipher Archival Inquiries</span>
            <ArrowRight className="w-4 h-4 text-[#E2CA8E]" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-full py-2 rounded-xl text-xs font-display font-bold text-[#1C3A27] hover:text-[#6B1D23]"
          >
            Return to Cartography
          </button>
        </div>
      </div>
    </div>
  );
};
