import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Venue, VenueType } from '../../types';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Navigation,
  QrCode,
  Share2,
  Bookmark,
  CheckCircle2,
  Play,
  Lock,
  Check,
  Ticket,
} from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';
import { QrScannerModal } from './QrScannerModal';
import { BookingModal } from './BookingModal';

interface VenueDetailModalProps {
  venue: Venue;
  onClose: () => void;
  onOpenQuest: (questId: string) => void;
  onInspectCard: (cardId: string) => void;
}

const TYPE_STYLE: Record<VenueType, { chip: string }> = {
  Museum: { chip: 'bg-vermilion-soft text-vermilion' },
  Gallery: { chip: 'bg-teal-soft text-teal' },
  Library: { chip: 'bg-gold-soft text-[#8A6A10]' },
  Heritage: { chip: 'bg-teal-soft text-teal' },
  Garden: { chip: 'bg-gold-soft text-[#8A6A10]' },
};

export const VenueDetailModal: React.FC<VenueDetailModalProps> = ({
  venue,
  onClose,
  onOpenQuest,
  onInspectCard,
}) => {
  const {
    visitedVenueIds,
    collectibles,
    collectedCardIds,
    quests,
    completedQuestIds,
    getDistanceToVenueMeters,
    checkInVenue,
    teleportToVenue,
  } = useApp();

  const [showQrModal, setShowQrModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [saved, setSaved] = useState(false);

  const isVisited = visitedVenueIds.includes(venue.id);
  const distance = getDistanceToVenueMeters(venue);
  const isWithinRadius = distance <= venue.radiusMeters;
  const walkMinutes = Math.max(1, Math.round(distance / 80));

  const venueQuests = quests.filter((q) => q.venueId === venue.id);
  const venueCards = collectibles.filter((c) => c.venueId === venue.id);

  const handleGpsCheckin = () => {
    triggerHaptic('medium');
    const result = checkInVenue(venue.id, 'gps');
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleShare = () => {
    triggerHaptic('light');
    const shareText = `Check out ${venue.name} on CultureQuest!`;
    if (navigator.share) {
      navigator.share({ title: venue.name, text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${venue.name} - ${window.location.href}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-sm sm:p-4 animate-rise">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-wall rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Hero image */}
        <div className="relative h-44 w-full shrink-0">
          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-wall via-wall/20 to-transparent" />

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 border border-line text-ink flex items-center justify-center hover:text-vermilion"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setSaved(!saved);
            }}
            className={`absolute top-3 left-3 w-8 h-8 rounded-full border flex items-center justify-center shadow transition ${
              saved ? 'bg-gold text-white border-gold' : 'bg-card/90 text-ink border-line'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-white' : ''}`} />
          </button>

          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${TYPE_STYLE[venue.type].chip}`}>
                {venue.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-card/90 text-ink text-[10px] font-bold border border-line">
                {venue.isFree ? 'Free entry' : venue.entryFee}
              </span>
            </div>
            {isVisited && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal text-white text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" /> Visited
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Title & info */}
          <div>
            <h2 className="text-xl font-black text-ink font-display leading-tight">{venue.name}</h2>
            <p className="text-xs text-muted mt-1 leading-relaxed">{venue.shortDesc}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-muted">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal" />
                <span>{venue.hours}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-vermilion" />
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal" />
                <span>{venue.weeklyVisitors} visits this week</span>
              </div>
            </div>
          </div>

          {/* Proximity */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              isWithinRadius ? 'bg-teal-soft border-teal text-teal' : 'bg-card border-line text-ink'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isWithinRadius ? 'bg-teal text-white' : 'bg-wall border border-line text-muted'}`}>
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">
                  {isWithinRadius ? "You're in range — ready to check in!" : `${distance}m away (~${walkMinutes} min walk)`}
                </div>
                <div className="text-[10px] opacity-80">
                  {isWithinRadius ? 'Check in to earn points.' : `You need to be within ${venue.radiusMeters}m to check in.`}
                </div>
              </div>
            </div>

            {!isWithinRadius && (
              <button
                onClick={() => teleportToVenue(venue.id)}
                className="px-2.5 py-1.5 rounded-full bg-wall border border-line text-[10px] font-bold text-teal hover:border-teal active:scale-95 transition shrink-0"
              >
                Demo: teleport
              </button>
            )}
          </div>

          {/* Quests */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Ticket className="w-3.5 h-3.5 text-vermilion" /> Quests here ({venueQuests.length})
              </h3>
            </div>

            {venueQuests.length > 0 ? (
              <div className="space-y-2">
                {venueQuests.map((quest) => {
                  const isCompleted = completedQuestIds.includes(quest.id);
                  return (
                    <button
                      key={quest.id}
                      onClick={() => {
                        triggerHaptic('light');
                        onOpenQuest(quest.id);
                      }}
                      className="w-full p-3 rounded-2xl bg-card border border-line hover:border-vermilion text-left flex items-center justify-between transition group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-vermilion-soft text-vermilion uppercase">
                            {quest.type}
                          </span>
                          <span className="text-[10px] text-muted font-mono font-bold">{quest.difficulty}</span>
                          <span className="text-[10px] text-muted">• {quest.estimatedMinutes}m</span>
                        </div>
                        <h4 className="text-xs font-bold text-ink font-display mt-1 truncate">{quest.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-vermilion font-mono">+{quest.pointsReward} pts</span>
                          <div className="text-[9px] text-muted font-mono">+{quest.xpReward} XP</div>
                        </div>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${isCompleted ? 'bg-teal text-white' : 'bg-vermilion text-white'}`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-card border border-line text-center text-xs text-muted">
                No quests at this venue yet.
              </div>
            )}
          </div>

          {/* Collectible cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-widest font-display">
                Collectible cards ({venueCards.length})
              </h3>
              <span className="text-[10px] font-mono text-muted">
                {venueCards.filter((c) => collectedCardIds.includes(c.id)).length}/{venueCards.length} found
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {venueCards.map((card) => {
                const isCollected = collectedCardIds.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      triggerHaptic('light');
                      onInspectCard(card.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                      isCollected ? 'bg-card border-line hover:border-gold' : 'bg-wall border-line/60 opacity-70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-line shrink-0 relative">
                      {isCollected ? (
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-bold font-mono text-gold uppercase">{card.rarity}</div>
                      <div className={`text-[11px] font-bold truncate ${isCollected ? 'text-ink' : 'text-muted'}`}>
                        {isCollected ? card.name : 'Not found yet'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="p-3 bg-card border-t border-line flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowQrModal(true);
            }}
            title="Scan the venue's QR code"
            className="w-12 h-12 rounded-2xl bg-wall border border-line text-teal flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <QrCode className="w-5 h-5" />
          </button>

          {venue.isFree ? (
            <button
              onClick={handleGpsCheckin}
              disabled={!isWithinRadius}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition active:translate-y-0.5 ${
                isWithinRadius
                  ? 'bg-vermilion text-white shadow-[0_4px_0_rgba(0,0,0,0.12)]'
                  : 'bg-line text-muted cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isVisited ? 'Check in (+50 pts)' : 'Check in (+100 pts first visit)'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowBooking(true);
              }}
              className="flex-1 py-3 px-4 rounded-2xl bg-vermilion text-white font-bold text-sm flex items-center justify-center gap-2 transition active:translate-y-0.5 shadow-[0_4px_0_rgba(0,0,0,0.12)]"
            >
              <Ticket className="w-4 h-4" />
              <span>Book visit (+60 pts)</span>
            </button>
          )}

          <button
            onClick={handleShare}
            title="Share this venue"
            className="w-12 h-12 rounded-2xl bg-wall border border-line text-muted flex items-center justify-center shadow-sm active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Booking */}
      {showBooking && <BookingModal venue={venue} onClose={() => setShowBooking(false)} />}

      {/* QR scanner */}
      {showQrModal && (
        <QrScannerModal
          venue={venue}
          onClose={() => setShowQrModal(false)}
          onScanSuccess={() => {
            setShowQrModal(false);
            const result = checkInVenue(venue.id, 'qr');
            if (!result.success) {
              alert(result.message);
            }
          }}
        />
      )}
    </div>
  );
};
