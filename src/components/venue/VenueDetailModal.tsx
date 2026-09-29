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
  Navigation2,
  Play,
  Flame,
  Lock,
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
  const [copiedShare, setCopiedShare] = useState(false);

  const isVisited = visitedVenueIds.includes(venue.id);
  const distance = getDistanceToVenueMeters(venue);
  const isWithinRadius = distance <= venue.radiusMeters;
  const walkMinutes = Math.max(1, Math.round(distance / 80));

  // Quests at this venue
  const venueQuests = quests.filter((q) => q.venueId === venue.id);

  // Collectibles at this venue
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
    const shareText = `Check out ${venue.name} on CultureQuest Cambridge! Collect rare artefacts & earn coffee perks.`;
    if (navigator.share) {
      navigator.share({ title: venue.name, text: shareText, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${venue.name} - ${window.location.href}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Hero Image & Header */}
        <div className="relative h-56 w-full shrink-0">
          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close & Action Buttons */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/70 border border-slate-700/80 text-white flex items-center justify-center backdrop-blur-md shadow hover:bg-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setSaved(!saved);
            }}
            className={`absolute top-4 left-4 w-9 h-9 rounded-full border flex items-center justify-center backdrop-blur-md shadow transition ${
              saved
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-slate-950/70 text-white border-slate-700/80'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-slate-950' : ''}`} />
          </button>

          {/* Badges in Hero */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-indigo-600/90 text-white text-[11px] font-bold border border-indigo-400/40 backdrop-blur-md shadow">
                {venue.type}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow ${
                  venue.isFree
                    ? 'bg-emerald-600/90 text-emerald-100 border border-emerald-400/40'
                    : 'bg-amber-600/90 text-amber-100 border border-amber-400/40'
                }`}
              >
                {venue.isFree ? 'Free Admission' : venue.entryFee}
              </span>
            </div>

            {isVisited && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black shadow">
                <CheckCircle2 className="w-3.5 h-3.5" /> Visited
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl font-black text-white font-['Outfit']">{venue.name}</h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{venue.shortDesc}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{venue.hours}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center gap-1 text-indigo-300">
                <Users className="w-3.5 h-3.5" />
                <span>{venue.weeklyVisitors} explorers visited this week</span>
              </div>
            </div>
          </div>

          {/* Distance & Geofence Status Box */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              isWithinRadius
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isWithinRadius ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-amber-400'
                }`}
              >
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {isWithinRadius ? 'You are within range!' : `${distance}m away (${walkMinutes} min walk)`}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isWithinRadius
                    ? 'GPS confirmed. Ready to check in!'
                    : `Must be within ${venue.radiusMeters}m to check in with GPS`}
                </div>
              </div>
            </div>

            {/* Teleport simulation shortcut */}
            {!isWithinRadius && (
              <button
                onClick={() => {
                  teleportToVenue(venue.id);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-bold hover:bg-amber-400/25 active:scale-95 transition"
              >
                Simulate "I'm here"
              </button>
            )}
          </div>

          {/* Quests Available Here */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quests & Challenges ({venueQuests.length})
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
                    className="w-full p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 hover:border-amber-400/60 transition text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 capitalize">
                          {quest.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{quest.difficulty}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">• {quest.estimatedMinutes}m</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1 group-hover:text-amber-300 transition">
                        {quest.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-400">+{quest.pointsReward} pts</span>
                        <div className="text-[9px] text-slate-400">+{quest.xpReward} XP</div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                No active quests right now. Check back tomorrow!
              </div>
            )}
          </div>

          {/* Collectible Cards available at this venue */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Artefacts & Cards ({venueCards.length})
              </h3>
              <span className="text-[10px] text-slate-400">
                {venueCards.filter((c) => collectedCardIds.includes(c.id)).length}/{venueCards.length} Discovered
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
                        ? 'bg-slate-900 border-amber-400/50 hover:border-amber-400'
                        : 'bg-slate-950 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                      {isCollected ? (
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-bold text-amber-400 uppercase tracking-tight">
                        {card.rarity}
                      </div>
                      <div className="text-[11px] font-bold text-white truncate">
                        {isCollected ? card.name : 'Unknown Artefact'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
          {/* QR Code Scanner Fallback */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowQrModal(true);
            }}
            title="Scan venue QR code"
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center shadow active:scale-95 transition"
          >
            <QrCode className="w-5 h-5" />
          </button>

          {/* Primary Check In Button */}
          <button
            onClick={handleGpsCheckin}
            disabled={!isWithinRadius}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-lg ${
              isWithinRadius
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 shadow-[0_4px_0_#9a3412] active:translate-y-0.5'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{isVisited ? 'Re-Check In (+50 pts)' : 'Check In (+100 pts Bonus!)'}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            title="Share this venue"
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center shadow active:scale-95 transition"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* QR Scanner Modal Fallback */}
      {showQrModal && (
        <QrScannerModal
          venue={venue}
          onClose={() => setShowQrModal(false)}
          onScanSuccess={(code) => {
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
