import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Venue } from '../../types';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Compass,
  QrCode,
  Share2,
  Bookmark,
  CheckCircle2,
  Play,
  Lock,
  Scroll,
  BookOpen,
  Feather,
} from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';
import { QrScannerModal } from './QrScannerModal';

interface VenueDetailModalProps {
  venue: Venue;
  onClose: () => void;
  onOpenQuest: (questId: string) => void;
  onInspectCard: (cardId: string) => void;
}

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
    getDistanceToVenueMeters,
    checkInVenue,
    teleportToVenue,
  } = useApp();

  const [showQrModal, setShowQrModal] = useState(false);
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
    const shareText = `Examine ${venue.name} in Chronicles of Cantabrigia!`;
    if (navigator.share) {
      navigator.share({ title: venue.name, text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${venue.name} - ${window.location.href}`);
      alert('Archival link copied to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-[#121A15] border-2 border-[#B89758] rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Archival Call Number Banner */}
        <div className="bg-[#1C3A27] px-4 py-2 border-b border-[#B89758]/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#E2CA8E] font-bold">
            <Scroll className="w-3.5 h-3.5 text-[#B89758]" />
            <span>ARCHIVE CALL NO. CTB-{venue.id.substring(6).toUpperCase()}</span>
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

        {/* Hero Image & Archival Frame */}
        <div className="relative h-52 w-full shrink-0">
          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121A15] via-[#121A15]/40 to-transparent" />

          {/* Save to Vault Bookmark */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setSaved(!saved);
            }}
            className={`absolute top-3 left-3 w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-md shadow transition ${
              saved
                ? 'bg-[#B89758] text-[#121A15] border-[#E2CA8E]'
                : 'bg-[#1C3A27]/80 text-[#FAF8F5] border-[#B89758]/60'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-[#121A15]' : ''}`} />
          </button>

          {/* Badges in Hero */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded bg-[#1C3A27] text-[#E2CA8E] text-[10px] font-bold border border-[#B89758] font-display uppercase tracking-wider">
                {venue.type}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#122419] text-[#FAF8F5] text-[10px] font-bold border border-[#B89758]/60 font-body">
                {venue.isFree ? 'Free Admission' : venue.entryFee}
              </span>
            </div>

            {isVisited && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1C3A27] text-[#E2CA8E] text-[10px] font-bold border border-[#B89758] font-display">
                <CheckCircle2 className="w-3 h-3 text-[#B89758]" /> Verified Presence
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl font-bold text-[#FAF8F5] font-display leading-tight">{venue.name}</h2>
            <p className="text-xs text-[#D1C7B7] font-body mt-1 leading-relaxed italic">{venue.shortDesc}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#879B8E] font-body">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#B89758]" />
                <span>{venue.hours}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#B89758]" />
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center gap-1 text-[#E2CA8E]">
                <Users className="w-3.5 h-3.5" />
                <span>{venue.weeklyVisitors} scholars matriculated this week</span>
              </div>
            </div>
          </div>

          {/* Proximity / Radar Status Card */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              isWithinRadius
                ? 'bg-[#1C3A27]/90 border-[#B89758] text-[#E2CA8E]'
                : 'bg-[#142018] border-[#B89758]/30 text-[#D1C7B7]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  isWithinRadius
                    ? 'bg-[#6B1D23] border-[#B89758] text-[#FAF8F5]'
                    : 'bg-[#122419] border-[#B89758]/40 text-[#B89758]'
                }`}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-display text-[#FAF8F5]">
                  {isWithinRadius ? 'You are within the Archival Perimeter!' : `${distance}m away (${walkMinutes}m walk)`}
                </div>
                <div className="text-[10px] text-[#A6BAAE] font-body">
                  {isWithinRadius ? 'Geofence confirmed. Ready to record stamp.' : `Must be within ${venue.radiusMeters}m to seal check-in.`}
                </div>
              </div>
            </div>

            {!isWithinRadius && (
              <button
                onClick={() => teleportToVenue(venue.id)}
                className="px-2.5 py-1 rounded-xl bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] text-[10px] font-bold font-display hover:bg-[#234731] active:scale-95 transition"
              >
                Simulate Presence
              </button>
            )}
          </div>

          {/* Quests / Inquiries Available */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#E2CA8E] font-display uppercase tracking-widest flex items-center gap-1.5">
                <Feather className="w-3.5 h-3.5 text-[#B89758]" /> Archival Inquiries ({venueQuests.length})
              </h3>
            </div>

            {venueQuests.length > 0 ? (
              <div className="space-y-2">
                {venueQuests.map((quest) => (
                  <button
                    key={quest.id}
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenQuest(quest.id);
                    }}
                    className="w-full p-3 rounded-2xl parchment-card border border-[#B89758]/50 hover:border-[#B89758] text-left flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#1C3A27] text-[#E2CA8E] font-display uppercase">
                          {quest.type}
                        </span>
                        <span className="text-[10px] text-[#544431] font-mono font-bold">{quest.difficulty}</span>
                        <span className="text-[10px] text-[#544431]">• {quest.estimatedMinutes}m</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1C3A27] font-display mt-1">
                        {quest.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#6B1D23] font-mono">+{quest.pointsReward} pts</span>
                        <div className="text-[9px] text-[#544431] font-mono">+{quest.xpReward} XP</div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-[#6B1D23] text-[#FAF8F5] flex items-center justify-center font-bold border border-[#B89758]">
                        <Play className="w-3.5 h-3.5 fill-[#FAF8F5]" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl parchment-card text-center text-xs text-[#544431]">
                No pending inquiries at this archive today.
              </div>
            )}
          </div>

          {/* Collectible Cards available here */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#E2CA8E] font-display uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#B89758]" /> Vault Manuscripts ({venueCards.length})
              </h3>
              <span className="text-[10px] font-mono text-[#A6BAAE]">
                {venueCards.filter((c) => collectedCardIds.includes(c.id)).length}/{venueCards.length} Illuminated
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
                      isCollected
                        ? 'parchment-card border-[#B89758]'
                        : 'bg-[#142018] border-[#1C3A27] opacity-60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1C3A27] shrink-0 relative border border-[#B89758]/50">
                      {isCollected ? (
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#879B8E]">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-bold font-mono text-[#6B1D23] uppercase">
                        {card.rarity}
                      </div>
                      <div className={`text-[11px] font-bold truncate ${isCollected ? 'text-[#1C3A27] font-display' : 'text-[#879B8E]'}`}>
                        {isCollected ? card.name : 'Unknown Folio'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Ribbon */}
        <div className="p-3 bg-[#1C3A27] border-t border-[#B89758]/50 flex items-center gap-2">
          {/* Scanner Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowQrModal(true);
            }}
            title="Scan entrance seal"
            className="w-12 h-12 rounded-2xl bg-[#122419] border border-[#B89758] text-[#E2CA8E] flex items-center justify-center shadow active:scale-95 transition"
          >
            <QrCode className="w-5 h-5" />
          </button>

          {/* Primary Wax Seal Check-in Button */}
          <button
            onClick={handleGpsCheckin}
            disabled={!isWithinRadius}
            className={`flex-1 py-3 px-4 rounded-2xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              isWithinRadius
                ? 'btn-wax-seal text-[#FAF8F5] border border-[#B89758]'
                : 'bg-[#122419] text-[#879B8E] border border-[#1C3A27] cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#E2CA8E]" />
            <span>{isVisited ? 'Record Visit Stamp (+50 pts)' : 'Matriculate Stamp (+100 pts Bonus!)'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Share this archive"
            className="w-12 h-12 rounded-2xl bg-[#122419] border border-[#B89758]/60 text-[#D1C7B7] flex items-center justify-center shadow active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
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
