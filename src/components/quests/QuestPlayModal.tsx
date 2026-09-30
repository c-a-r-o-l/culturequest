import React, { useState } from 'react';
import { Quest, QuestType } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  MapPin,
  Camera,
  HelpCircle,
  Footprints,
  Clock,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';
import { sound, triggerHaptic, fireConfetti } from '../../utils/audioAndFx';

interface QuestPlayModalProps {
  quest: Quest;
  onClose: () => void;
}

const TYPE_META: Record<QuestType, { label: string; icon: React.FC<{ className?: string }>; chip: string }> = {
  scavenger: { label: 'Scavenger hunt', icon: MapPin, chip: 'bg-vermilion-soft text-vermilion' },
  trivia: { label: 'Trivia', icon: HelpCircle, chip: 'bg-teal-soft text-teal' },
  photo: { label: 'Photo hunt', icon: Camera, chip: 'bg-gold-soft text-[#8A6A10]' },
  route: { label: 'Trail', icon: Footprints, chip: 'bg-vermilion-soft text-vermilion' },
  daily: { label: 'Daily quest', icon: Zap, chip: 'bg-gold-soft text-[#8A6A10]' },
};

const STEP_ICON: Record<string, React.FC<{ className?: string }>> = {
  trivia: HelpCircle,
  clue: MapPin,
  location: Footprints,
  photo: Camera,
};

export const QuestPlayModal: React.FC<QuestPlayModalProps> = ({ quest, onClose }) => {
  const { venues, completeQuest, completedQuestIds } = useApp();
  const venue = venues.find((v) => v.id === quest.venueId);

  const isCompleted = completedQuestIds.includes(quest.id);
  const [completing, setCompleting] = useState(false);

  const meta = TYPE_META[quest.type];
  const TypeIcon = meta.icon;

  // One-click completion for the pitch: stamp the ticket, celebrate, award.
  const handleComplete = () => {
    if (isCompleted || completing) return;
    setCompleting(true);
    triggerHaptic('success');
    sound.playVictory();
    fireConfetti(quest.pointsReward >= 250 ? 'legendary' : 'normal');
    setTimeout(() => {
      completeQuest(quest.id); // closes this modal, opens the reward screen
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-sm sm:p-4 animate-rise">
      <div className="w-full max-w-md max-h-[94vh] flex flex-col bg-wall rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-card border-b border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.chip}`}>
              <TypeIcon className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-ink font-display truncate">{quest.title}</h3>
              <p className="text-[11px] text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-vermilion" /> {venue?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-wall border border-line text-muted flex items-center justify-center hover:text-ink shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ticket body */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="ticket rounded-3xl border border-line overflow-visible relative">
            {/* Rubber stamp on completion */}
            {(completing || isCompleted) && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <span
                  className={`px-5 py-2 rounded-lg border-4 border-vermilion text-vermilion font-black text-2xl font-display tracking-[0.2em] bg-white/80 backdrop-blur-[2px] ${
                    completing ? 'animate-stamp' : 'rotate-[-8deg]'
                  }`}
                >
                  COMPLETED
                </span>
              </div>
            )}

            {/* Main body */}
            <div className="p-5 space-y-4">
              {/* Meta row */}
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${meta.chip}`}>
                  {meta.label}
                </span>
                <span className="text-muted flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> ~{quest.estimatedMinutes} min
                </span>
                {quest.expiresIn && (
                  <span className="text-vermilion">Ends: {quest.expiresIn}</span>
                )}
              </div>

              <div>
                <h2 className="text-lg font-black text-ink font-display leading-snug">{quest.title}</h2>
                <p className="text-xs text-muted leading-relaxed mt-1">{quest.description}</p>
              </div>

              {/* Itinerary — what you'll do at the venue */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                  Your mission at {venue?.name}
                </div>
                <div className="space-y-2">
                  {quest.steps.map((step, idx) => {
                    const StepIcon = STEP_ICON[step.type] || MapPin;
                    return (
                      <div key={step.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-card border border-line">
                        <span className="w-5 h-5 rounded-full bg-ink text-wall text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <StepIcon className="w-4 h-4 text-teal mt-1 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink">{step.title}</div>
                          <div className="text-[11px] text-muted leading-relaxed">{step.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Perforation */}
            <div className="ticket-perf" />

            {/* Stub: reward + complete */}
            <div className="p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-xl font-black font-mono text-ink">+{quest.pointsReward}</span>
                <span className="text-xs font-bold text-muted">pts</span>
              </div>

              <button
                onClick={() => {
                  if (isCompleted) {
                    triggerHaptic('light');
                    onClose();
                    return;
                  }
                  handleComplete();
                }}
                disabled={completing}
                className={`px-5 py-3 rounded-2xl font-bold text-sm transition active:translate-y-0.5 shadow-[0_4px_0_rgba(0,0,0,0.12)] disabled:opacity-60 ${
                  isCompleted ? 'bg-teal text-white shadow-none' : 'bg-vermilion text-white'
                }`}
              >
                {isCompleted ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Completed
                  </span>
                ) : completing ? (
                  'Claiming…'
                ) : (
                  'Complete Quest'
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted text-center mt-3">
            Pitch mode: completion is one tap. The live app verifies each step at the venue.
          </p>
        </div>
      </div>
    </div>
  );
};
