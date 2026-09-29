import React, { useState } from 'react';
import { Quest } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Camera,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Scroll,
  Feather,
  Compass,
} from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

interface QuestPlayModalProps {
  quest: Quest;
  onClose: () => void;
}

export const QuestPlayModal: React.FC<QuestPlayModalProps> = ({ quest, onClose }) => {
  const { venues, completeQuest } = useApp();
  const venue = venues.find((v) => v.id === quest.venueId);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [photoState, setPhotoState] = useState<'idle' | 'taking' | 'verified'>('idle');

  const currentStep = quest.steps[currentStepIndex];
  const progressPercent = Math.round(((currentStepIndex + (hasAnswered || photoState === 'verified' ? 1 : 0)) / quest.steps.length) * 100);

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const correct = idx === currentStep.correctOptionIndex;
    setIsCorrect(correct);

    if (correct) {
      sound.playCoin();
      triggerHaptic('success');
    } else {
      triggerHaptic('medium');
    }
  };

  const handleTakePhoto = () => {
    triggerHaptic('medium');
    setPhotoState('taking');

    setTimeout(() => {
      sound.playCoin();
      triggerHaptic('success');
      setPhotoState('verified');
    }, 1400);
  };

  const handleNextStep = () => {
    triggerHaptic('light');

    if (currentStepIndex < quest.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      setPhotoState('idle');
    } else {
      completeQuest(quest.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] bg-[#121A15] border-2 border-[#B89758] rounded-none sm:rounded-3xl flex flex-col overflow-hidden text-[#FAF8F5] shadow-2xl">
        {/* Top Header */}
        <div className="p-3.5 bg-[#1C3A27] border-b border-[#B89758]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#122419] border border-[#B89758] text-[#E2CA8E] flex items-center justify-center font-bold text-xs font-display">
              CH
            </span>
            <div>
              <h3 className="text-xs font-bold text-[#FAF8F5] font-display truncate max-w-[210px]">{quest.title}</h3>
              <p className="text-[10px] text-[#A6BAAE] font-body italic">{venue?.name}</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-[#122419] border border-[#B89758]/60 text-[#D1C7B7] flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Ribbon */}
        <div className="w-full bg-[#0F1B13] h-1.5 border-b border-[#B89758]/30">
          <div
            className="bg-gradient-to-r from-[#B89758] via-[#E2CA8E] to-[#6B1D23] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-[#A6BAAE] font-mono">
            <span>Section {currentStepIndex + 1} of {quest.steps.length}</span>
            <span className="text-[#E2CA8E] uppercase tracking-wider text-[10px] font-display font-bold">
              {currentStep.type} Treatise
            </span>
          </div>

          {/* Parchment Manuscript Query Card */}
          <div className="parchment-card p-4 rounded-2xl border border-[#B89758] space-y-2">
            <div className="text-[10px] font-mono text-[#6B1D23] font-bold uppercase tracking-widest">
              MS. INQUIRY CODE 0{currentStepIndex + 1}
            </div>
            <h2 className="text-base font-bold text-[#1C3A27] font-display leading-snug">{currentStep.title}</h2>
            <p className="text-xs text-[#304135] font-body leading-relaxed">{currentStep.description}</p>
          </div>

          {/* TRIVIA COMPONENT */}
          {currentStep.type === 'trivia' && currentStep.options && (
            <div className="space-y-2.5 pt-1">
              {currentStep.options.map((option, idx) => {
                let btnStyle = 'bg-[#1C3A27] border-[#B89758]/40 text-[#FAF8F5] hover:border-[#B89758]';

                if (hasAnswered) {
                  if (idx === currentStep.correctOptionIndex) {
                    btnStyle = 'bg-[#1C3A27] border-2 border-[#B89758] text-[#E2CA8E] font-bold shadow-[0_0_12px_rgba(184,151,88,0.4)]';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-[#6B1D23] border-[#B89758] text-[#FAF8F5]';
                  } else {
                    btnStyle = 'bg-[#122419] border-[#1C3A27] text-[#879B8E] opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs font-body transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {hasAnswered && idx === currentStep.correctOptionIndex && (
                      <CheckCircle2 className="w-4 h-4 text-[#E2CA8E] shrink-0" />
                    )}
                    {hasAnswered && idx === selectedOption && idx !== currentStep.correctOptionIndex && (
                      <AlertCircle className="w-4 h-4 text-[#FAF8F5] shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Scholar Annotation Note */}
              {hasAnswered && currentStep.explanation && (
                <div className="p-3.5 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-xs text-[#D1C7B7] font-body leading-relaxed mt-3">
                  <div className="flex items-center gap-1.5 font-bold font-display text-[#E2CA8E] mb-1">
                    <Feather className="w-3.5 h-3.5 text-[#B89758]" /> Scholar's Annotation:
                  </div>
                  {currentStep.explanation}
                </div>
              )}
            </div>
          )}

          {/* CLUE / SCAVENGER HUNT */}
          {(currentStep.type === 'clue' || currentStep.type === 'location') && (
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#1C3A27] border border-[#B89758] space-y-2">
                <div className="flex items-center gap-2 text-[#E2CA8E] text-xs font-bold font-display">
                  <Compass className="w-4 h-4 text-[#B89758]" />
                  <span>Targeted Exhibition Relic</span>
                </div>
                <div className="text-sm font-bold text-[#FAF8F5] font-display">{currentStep.targetObject || 'Gallery Relic'}</div>
                <p className="text-xs text-[#D1C7B7] font-body">
                  Traverse the gallery chamber to locate this piece. Examine the plaque label closely!
                </p>
              </div>

              {/* Clue Hint Button */}
              {currentStep.clueHint && (
                <div>
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs text-[#E2CA8E] hover:underline flex items-center gap-1.5 font-display"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-[#B89758]" /> Consult Marginalia Hint
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#1C3A27] border border-[#B89758]/50 text-xs text-[#D1C7B7] font-body">
                      💡 <strong>Marginalia Note:</strong> {currentStep.clueHint}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  sound.playCoin();
                  triggerHaptic('success');
                  setHasAnswered(true);
                }}
                disabled={hasAnswered}
                className="w-full py-3.5 rounded-2xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider"
              >
                {hasAnswered ? 'Relic Verified in Archive ✓' : 'I Have Examined This Relic'}
              </button>
            </div>
          )}

          {/* PHOTO CHALLENGE */}
          {currentStep.type === 'photo' && (
            <div className="space-y-3 pt-1">
              <div className="relative h-44 w-full rounded-2xl bg-[#0B120E] border border-[#B89758]/60 overflow-hidden flex flex-col items-center justify-center text-center p-4">
                {photoState === 'idle' && (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 text-[#E2CA8E] mx-auto" />
                    <p className="text-xs text-[#D1C7B7] font-body max-w-xs">{currentStep.photoPrompt}</p>
                  </div>
                )}

                {photoState === 'taking' && (
                  <div className="space-y-2 text-center">
                    <div className="w-8 h-8 border-2 border-[#B89758] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-[#E2CA8E] font-display">Analyzing visual geometry...</p>
                  </div>
                )}

                {photoState === 'verified' && (
                  <div className="space-y-2 text-center text-[#E2CA8E]">
                    <CheckCircle2 className="w-9 h-9 mx-auto" />
                    <p className="text-xs font-bold font-display text-[#FAF8F5]">Visual Match Inscribed in Vault!</p>
                  </div>
                )}
              </div>

              {photoState !== 'verified' ? (
                <button
                  onClick={handleTakePhoto}
                  disabled={photoState === 'taking'}
                  className="w-full py-3.5 rounded-2xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-[#E2CA8E]" />
                  <span>Capture Archival Scan</span>
                </button>
              ) : (
                <div className="p-3 bg-[#1C3A27] border border-[#B89758] rounded-xl text-xs text-[#E2CA8E] text-center font-display font-bold">
                  Visual proof accepted by Curator Council!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Continue Action */}
        <div className="p-4 bg-[#1C3A27] border-t border-[#B89758]/50">
          <button
            onClick={handleNextStep}
            disabled={!hasAnswered && photoState !== 'verified'}
            className="w-full py-3.5 rounded-2xl btn-wax-seal border border-[#B89758] disabled:opacity-40 text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>{currentStepIndex < quest.steps.length - 1 ? 'Next Treatise Step' : 'Seal Inquiries & Claim Relic'}</span>
            <ArrowRight className="w-4 h-4 text-[#E2CA8E]" />
          </button>
        </div>
      </div>
    </div>
  );
};
