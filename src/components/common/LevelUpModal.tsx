import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-gold-soft border-4 border-gold flex items-center justify-center mb-3 animate-float">
          <Award className="w-10 h-10 text-gold" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">Level up</span>

        <h2 className="text-3xl font-black text-ink font-display mt-1">
          Level {oldLevel} <span className="text-muted">→</span> {newLevel}
        </h2>
        <p className="text-xs font-bold text-vermilion mt-0.5">New title: {newTitle}</p>

        <div className="my-4 p-3.5 rounded-2xl bg-wall border border-line text-xs text-ink text-left w-full">
          <div>• +50 points added to your balance</div>
          <div>• More quests and sets to discover</div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-vermilion text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 transition"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
