import React from 'react';
import { Sparkles, Award, ArrowRight } from 'lucide-react';
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
      <div className="w-full max-w-sm rounded-3xl parchment-card border-2 border-[#B89758] p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Wax seal emblem */}
        <div className="w-20 h-20 rounded-full bg-[#6B1D23] border-4 border-[#B89758] flex items-center justify-center shadow-[0_4px_14px_rgba(107,29,35,0.5)] mb-3">
          <Award className="w-10 h-10 text-[#E2CA8E]" />
        </div>

        <span className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-[#6B1D23]">
          Promotio Academica
        </span>

        <h2 className="text-2xl font-bold text-[#1C3A27] font-display mt-1">Scholar Rank {newLevel}</h2>
        <p className="text-xs font-display font-bold text-[#6B1D23] mt-0.5">Fellowship Title: {newTitle}</p>

        <div className="my-4 p-3.5 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-xs text-[#FAF8F5] text-left space-y-1.5 w-full font-body">
          <div className="flex items-center gap-1.5 text-[#E2CA8E] font-display font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B89758]" /> Privileges Inscribed:
          </div>
          <div>• +50 Honorarium Points added to your ledger</div>
          <div>• 1x Academic Streak Freeze Token awarded</div>
          <div>• Cantabrigia Fellow Council Accreditation</div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
        >
          <span>Claim Honors & Continue</span>
          <ArrowRight className="w-4 h-4 text-[#E2CA8E]" />
        </button>
      </div>
    </div>
  );
};
