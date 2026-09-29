import React from 'react';
import { Venue, CollectibleCard } from '../../types';
import { Sparkles, ArrowRight, X, Ticket } from 'lucide-react';
import { triggerHaptic } from '../../utils/audioAndFx';

interface CheckinSuccessModalProps {
  venue: Venue;
  pointsEarned: number;
  newCard?: CollectibleCard;
  source: 'checkin' | 'quest' | 'booking';
  onClose: () => void;
  onStartQuest: () => void;
  onInspectCard: (card: CollectibleCard) => void;
}

export const CheckinSuccessModal: React.FC<CheckinSuccessModalProps> = ({
  venue,
  pointsEarned,
  newCard,
  source,
  onClose,
  onStartQuest,
  onInspectCard,
}) => {
  const isQuest = source === 'quest';
  const isBooking = source === 'booking';

  const stampText = isQuest ? 'QUEST COMPLETE' : isBooking ? 'BOOKED' : 'CHECKED IN';
  const stampColors = isQuest
    ? 'border-teal text-teal'
    : isBooking
    ? 'border-gold text-[#8A6A10]'
    : 'border-vermilion text-vermilion';
  const iconColors = isQuest ? 'bg-teal-soft text-teal' : isBooking ? 'bg-gold-soft text-gold' : 'bg-gold-soft text-gold';
  const eyebrow = isQuest ? 'Mission accomplished' : isBooking ? "You're booked" : "You're here";
  const description = isQuest
    ? 'Quest completed. Points added to your balance.'
    : isBooking
    ? 'Visit booked — show your ticket at the desk. Points added.'
    : 'Check-in confirmed. Welcome to CultureQuest!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <button
          onClick={() => {
            triggerHaptic('light');
            onClose();
          }}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-wall border border-line text-muted flex items-center justify-center hover:text-ink"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Stamp */}
        <div className="relative mt-2 mb-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${iconColors}`}>
            <Ticket className={`w-11 h-11 ${isQuest ? 'text-teal' : isBooking ? 'text-gold' : 'text-gold'}`} />
          </div>
          <span
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-md border-[3px] font-black text-sm font-display tracking-[0.15em] bg-white/90 animate-stamp ${stampColors}`}
          >
            {stampText}
          </span>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted">{eyebrow}</span>

        <h2 className="text-xl font-black text-ink font-display mt-1">{venue.name}</h2>
        <p className="text-xs text-muted mt-0.5">{description}</p>

        {/* Points pill */}
        <div className="my-4 px-5 py-2.5 rounded-full bg-gold-soft border border-gold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm font-black text-ink font-mono">+{pointsEarned} points</span>
        </div>

        {/* Dropped card */}
        {newCard && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onInspectCard(newCard);
            }}
            className="w-full p-3 rounded-2xl bg-wall border border-line text-left flex items-center gap-3 transition mb-4 hover:border-gold"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-line shrink-0 border border-line">
              <img src={newCard.image} alt={newCard.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-full bg-gold-soft text-[#8A6A10]">
                  {newCard.rarity}
                </span>
                <span className="text-[10px] text-muted">{newCard.setName}</span>
              </div>
              <div className="text-xs font-bold text-ink truncate mt-0.5">{newCard.name}</div>
            </div>
            <span className="text-[11px] font-bold text-vermilion">View →</span>
          </button>
        )}

        {/* Actions */}
        <div className="w-full space-y-2">
          {isQuest || isBooking ? (
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-vermilion text-white font-bold text-sm transition active:translate-y-0.5 shadow-[0_4px_0_rgba(0,0,0,0.12)]"
            >
              Keep exploring
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('light');
                onStartQuest();
              }}
              className="w-full py-3 rounded-2xl bg-vermilion text-white font-bold text-sm flex items-center justify-center gap-2 transition active:translate-y-0.5 shadow-[0_4px_0_rgba(0,0,0,0.12)]"
            >
              Start a quest here
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {!isQuest && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="w-full py-2 rounded-xl text-xs font-bold text-muted hover:text-ink"
            >
              Back to the map
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
