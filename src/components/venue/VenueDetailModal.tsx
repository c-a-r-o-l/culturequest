import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Venue, VenueType } from '../../types';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Users,
  QrCode,
  Share2,
  Bookmark,
  CheckCircle2,
  Play,
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
    quests,
    completedQuestIds,
    bookmarkedQuestIds,
    toggleBookmarkQuest,
    getDistanceToVenueMeters,
    checkInVenue,
    teleportToVenue,
  } = useApp();

  const [showQrModal, setShowQrModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [saved, setSaved] = useState(false);

  const isVisited = visitedVenueIds.includes(venue.id);
  const isWithinRadius = getDistanceToVenueMeters(venue) <= venue.radiusMeters;

  const venueQuests = quests.filter((q) => q.venueId === venue.id);

  const handleGpsCheckin = () => {
    triggerHaptic('medium');
    if (!isWithinRadius) {
      // Demo: out of range — teleport there, then check in
      teleportToVenue(venue.id);
      setTimeout(() => checkInVenue(venue.id, 'gps'), 300);
      return;
    }
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
                  const isBookmarked = bookmarkedQuestIds.includes(quest.id);
                  return (
                    <div
                      key={quest.id}
                      className="p-3 rounded-2xl bg-card border border-line hover:border-vermilion flex items-center justify-between transition"
                    >
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          onOpenQuest(quest.id);
                        }}
                        className="flex-1 min-w-0 text-left flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-vermilion-soft text-vermilion uppercase">
                              {quest.type}
                            </span>
                            <span className="text-[10px] text-muted">• {quest.estimatedMinutes}m</span>
                          </div>
                          <h4 className="text-xs font-bold text-ink font-display mt-1 truncate">{quest.title}</h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-vermilion font-mono">+{quest.pointsReward} pts</span>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${isCompleted ? 'bg-teal text-white' : 'bg-vermilion text-white'}`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          toggleBookmarkQuest(quest.id);
                        }}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark quest'}
                        className={`ml-2 w-8 h-8 rounded-full border flex items-center justify-center transition active:scale-90 shrink-0 ${
                          isBookmarked
                            ? 'bg-gold-soft border-gold text-[#8A6A10]'
                            : 'bg-wall border-line text-muted hover:text-ink'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-gold text-gold' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-card border border-line text-center text-xs text-muted">
                No quests at this venue yet.
              </div>
            )}
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
              className="flex-1 py-3 px-4 rounded-2xl bg-vermilion text-white font-bold text-sm flex items-center justify-center gap-2 transition active:translate-y-0.5 shadow-[0_4px_0_rgba(0,0,0,0.12)]"
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
