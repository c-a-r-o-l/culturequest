import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../common/BottomNav';
import { INITIAL_ACTIVITY_FEED } from '../../data/mockData';
import {
  Coins,
  Flame,
  MapPin,
  Clock,
  Zap,
  Sparkles,
  Play,
  ArrowRight,
  Ticket,
} from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

// Count-up animation for the points balance
function useAnimatedNumber(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const {
    user,
    quests,
    completedQuestIds,
    startedQuestIds,
    venues,
    bookings,
    setSelectedVenue,
    setActivePlayingQuest,
    getDistanceToVenueMeters,
  } = useApp();

  const displayPoints = useAnimatedNumber(user.points);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Continue hunt: an in-progress quest first, else the daily quest, else the next open quest
  const continueQuest =
    quests.find((q) => startedQuestIds.includes(q.id) && !completedQuestIds.includes(q.id)) ||
    quests.find((q) => q.isDaily && !completedQuestIds.includes(q.id)) ||
    quests.find((q) => !completedQuestIds.includes(q.id));
  const continueVenue = continueQuest ? venues.find((v) => v.id === continueQuest.venueId) : undefined;
  const isStarted = continueQuest ? startedQuestIds.includes(continueQuest.id) : false;

  // Nearby venues by distance
  const nearby = [...venues].sort((a, b) => getDistanceToVenueMeters(a) - getDistanceToVenueMeters(b)).slice(0, 4);

  // Featured challenge: venue with an event + its open quest
  const featuredVenue = venues.find((v) => v.featuredEvent);
  const featuredQuest = featuredVenue
    ? quests.find((q) => q.venueId === featuredVenue.id && !completedQuestIds.includes(q.id))
    : undefined;

  const latestBooking = bookings[0];
  const bookingVenue = latestBooking ? venues.find((v) => v.id === latestBooking.venueId) : undefined;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{greeting}</p>
          <h1 className="text-2xl font-black text-ink font-display">{user.name}</h1>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-teal-soft text-teal text-[10px] font-bold">
          Lv {user.level} · {user.title}
        </span>
      </div>

      {/* Points hero */}
      <div className="ticket rounded-3xl border border-gold/60 overflow-visible relative">
        <div className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6A10] block">Your points</span>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-7 h-7 text-gold fill-gold/20" />
              <span className="text-4xl font-black text-ink font-mono tabular-nums">{displayPoints}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Flame className="w-3.5 h-3.5 fill-vermilion text-vermilion" />
              <span className="text-[11px] font-bold text-ink">{user.streak}-day streak</span>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('rewards');
            }}
            className="px-4 py-2.5 rounded-full bg-gold text-ink text-xs font-bold flex items-center gap-1.5 shadow-[0_3px_0_rgba(0,0,0,0.15)] active:translate-y-0.5 transition"
          >
            Redeem
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Latest booking chip */}
        {bookingVenue && latestBooking && (
          <div className="ticket-perf" />
        )}
        {bookingVenue && latestBooking && (
          <div className="px-4 py-2.5 flex items-center gap-2 text-[11px] font-bold text-teal">
            <Ticket className="w-3.5 h-3.5" />
            {bookingVenue.name} · {latestBooking.date} · {latestBooking.time}
            {latestBooking.tickets > 1 && ` · ${latestBooking.tickets} tickets`}
          </div>
        )}
      </div>

      {/* Continue your hunt */}
      {continueQuest && (
        <div className="ticket rounded-3xl border border-vermilion/40 bg-card relative overflow-visible">
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-vermilion bg-vermilion-soft px-2.5 py-0.5 rounded-full">
                {isStarted ? 'Continue your hunt' : 'Your next hunt'}
              </span>
              <span className="text-[10px] font-mono text-muted">
                {continueQuest.steps.length} steps · +{continueQuest.pointsReward} pts
              </span>
            </div>

            <h3 className="text-base font-black text-ink font-display leading-snug">{continueQuest.title}</h3>
            <p className="text-[11px] text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3 text-vermilion" /> {continueVenue?.name}
            </p>

            {/* Progress bar (decorative for the one-click demo) */}
            <div className="h-1.5 bg-line rounded-full overflow-hidden">
              <div
                className={`h-full bg-vermilion transition-all duration-500 ${isStarted ? 'w-1/3' : 'w-0'}`}
              />
            </div>
          </div>

          <div className="ticket-perf" />

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> ~{continueQuest.estimatedMinutes} min
            </span>
            <button
              onClick={() => {
                triggerHaptic('light');
                sound.playCoin();
                setActivePlayingQuest(continueQuest);
              }}
              className="px-4 py-2 rounded-full bg-vermilion text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_3px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 transition"
            >
              <Play className="w-3 h-3 fill-current" />
              {isStarted ? 'Continue' : 'Start'}
            </button>
          </div>
        </div>
      )}

      {/* Nearby venues */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest font-display">Nearby venues</h2>
          <button
            onClick={() => {
              triggerHaptic('light');
              onNavigate('explore');
            }}
            className="text-[11px] font-bold text-teal"
          >
            See map →
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {nearby.map((venue) => {
            const distance = getDistanceToVenueMeters(venue);
            return (
              <button
                key={venue.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedVenue(venue);
                }}
                className="flex-shrink-0 w-56 p-2.5 rounded-2xl bg-card border border-line text-left shadow-sm hover:border-muted transition"
              >
                <div className="relative w-full h-20 rounded-xl overflow-hidden mb-2">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-white/95 text-[9px] font-bold font-mono text-ink">
                    {distance}m
                  </span>
                </div>
                <h3 className="text-xs font-bold text-ink font-display truncate">{venue.name}</h3>
                <p className="text-[10px] text-muted flex items-center justify-between mt-0.5">
                  <span>{venue.isFree ? 'Free entry' : venue.entryFee}</span>
                  <span className="text-gold font-bold flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> +{venue.isFree ? 50 : 60} pts
                  </span>
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured challenge */}
      {featuredVenue && featuredQuest && (
        <div className="rounded-3xl bg-gold-soft border-2 border-gold p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#8A6A10]">
              <Zap className="w-3 h-3 fill-gold text-gold" /> Featured challenge
            </span>
            <span className="text-[10px] font-mono text-[#8A6A10] font-bold">
              {featuredVenue.featuredEvent?.endsIn}
            </span>
          </div>
          <h3 className="text-sm font-black text-ink font-display mt-1.5 leading-snug">{featuredQuest.title}</h3>
          <p className="text-[11px] text-muted mt-0.5">{featuredVenue.name}</p>
          <button
            onClick={() => {
              triggerHaptic('light');
              sound.playCoin();
              setActivePlayingQuest(featuredQuest);
            }}
            className="mt-3 px-4 py-2 rounded-full bg-ink text-wall text-xs font-bold flex items-center gap-1.5 active:translate-y-0.5 transition"
          >
            <Play className="w-3 h-3 fill-current" /> Start challenge · +{featuredQuest.pointsReward} pts
          </button>
        </div>
      )}

      {/* Friend activity */}
      <div>
        <h2 className="text-xs font-bold text-ink uppercase tracking-widest font-display mb-2 px-1">
          Friend activity
        </h2>
        <div className="space-y-2">
          {INITIAL_ACTIVITY_FEED.slice(0, 3).map((act) => (
            <div key={act.id} className="p-2.5 rounded-2xl bg-card border border-line flex items-center gap-2.5 text-xs">
              <span className="text-base">{act.userAvatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-ink truncate">
                  <strong className="font-display">{act.userName}</strong> {act.action}{' '}
                  <strong className="text-vermilion font-display">{act.targetName}</strong>
                </p>
                <p className="text-[10px] text-muted font-mono">{act.timeAgo}</p>
              </div>
              {act.badge && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-soft text-teal shrink-0">
                  {act.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
