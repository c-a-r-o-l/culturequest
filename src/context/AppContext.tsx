import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Venue,
  Quest,
  CollectibleCard,
  PartnerReward,
  RedeemedVoucher,
  ExplorerClass,
  Booking,
} from '../types';
import {
  CAMBRIDGE_CENTER,
  INITIAL_VENUES,
  INITIAL_QUESTS,
  INITIAL_COLLECTIBLES,
  INITIAL_REWARDS,
} from '../data/mockData';
import { sound, fireConfetti, triggerHaptic } from '../utils/audioAndFx';

interface AppContextType {
  user: UserProfile;
  venues: Venue[];
  quests: Quest[];
  collectibles: CollectibleCard[];
  rewards: PartnerReward[];
  visitedVenueIds: string[];
  discoveredVenueIds: string[];
  completedQuestIds: string[];
  collectedCardIds: string[];
  redeemedVouchers: RedeemedVoucher[];
  startedQuestIds: string[];
  bookings: Booking[];
  userLocation: { lat: number; lng: number };
  isSimulatingLocation: boolean;
  selectedVenue: Venue | null;
  activePlayingQuest: Quest | null;
  activeInspectCard: CollectibleCard | null;
  activeVoucherModal: RedeemedVoucher | null;
  activeCheckinSuccess: { venue: Venue; pointsEarned: number; newCard?: CollectibleCard; source: 'checkin' | 'quest' | 'booking' } | null;
  activeLevelUpModal: { oldLevel: number; newLevel: number; newTitle: string } | null;
  partnerMode: 'user' | 'museum' | 'business';
  
  // Actions
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  setSelectedVenue: (venue: Venue | null) => void;
  setActivePlayingQuest: (quest: Quest | null) => void;
  setActiveInspectCard: (card: CollectibleCard | null) => void;
  setActiveVoucherModal: (voucher: RedeemedVoucher | null) => void;
  setActiveCheckinSuccess: (data: { venue: Venue; pointsEarned: number; newCard?: CollectibleCard; source: 'checkin' | 'quest' | 'booking' } | null) => void;
  setActiveLevelUpModal: (data: { oldLevel: number; newLevel: number; newTitle: string } | null) => void;
  setPartnerMode: (mode: 'user' | 'museum' | 'business') => void;
  
  // Gameplay Actions
  checkInVenue: (venueId: string, method: 'gps' | 'qr') => { success: boolean; message: string; points?: number };
  bookVisit: (venueId: string, details: { date: string; time: string; tickets: number }) => void;
  markQuestStarted: (questId: string) => void;
  completeQuest: (questId: string) => void;
  redeemReward: (rewardId: string) => { success: boolean; message: string; voucher?: RedeemedVoucher };
  markVoucherUsed: (voucherId: string) => void;
  expireVoucher: (voucherId: string) => void;
  teleportToVenue: (venueId: string) => void;
  resetUserLocation: () => void;
  setUserGpsLocation: (coords: { lat: number; lng: number }) => void;
  getDistanceToVenueMeters: (venue: Venue) => number;
  completeOnboarding: (data: { name: string; explorerClass: ExplorerClass; interests: string[]; avatar: string }) => void;
  resetAllProgress: () => void;
  addNewCustomQuest: (quest: Partial<Quest>) => void;
  addNewCustomReward: (reward: Partial<PartnerReward>) => void;
}

const STORAGE_KEY = 'culturequest_v1_state';

const LEVEL_TITLES: { [level: number]: string } = {
  1: 'Newcomer',
  2: 'Curiosity Seeker',
  3: 'Gallery Wanderer',
  4: 'Heritage Scout',
  5: 'Archive Detective',
  6: 'Museum Master',
  7: 'Grand Curator',
  8: 'Cultural Luminary',
  9: 'City Antiquarian',
  10: 'Master of Arts',
};

const DEFAULT_USER: UserProfile = {
  id: 'user-default-1',
  name: 'Alex Rivera',
  avatar: '🧭',
  explorerClass: 'Wanderer',
  level: 2,
  xp: 140,
  xpToNextLevel: 250,
  points: 340, // Enough for an instant voucher demo after one quest
  streak: 4,
  streakFreezeTokens: 1,
  interests: ['Art', 'History', 'Science'],
  title: 'Gallery Wanderer',
  stepsWalked: 4820,
  localSavingsGbp: 8.50,
  onboarded: false,
};

// Calculate geodesic distance in meters (Haversine)
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or defaults
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_USER;
  });

  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [collectibles, setCollectibles] = useState<CollectibleCard[]>(INITIAL_COLLECTIBLES);
  const [rewards, setRewards] = useState<PartnerReward[]>(INITIAL_REWARDS);

  const [visitedVenueIds, setVisitedVenueIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_visited`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['venue-whipple']; // Seed 1 visited so collection has an unlocked card on fresh load
  });

  const [discoveredVenueIds, setDiscoveredVenueIds] = useState<string[]>(() => {
    return INITIAL_VENUES.map(v => v.id);
  });

  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_completed_quests`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [collectedCardIds, setCollectedCardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_collected_cards`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['card-whipple-astrolabe']; // Seed 1 card unlocked
  });

  const [redeemedVouchers, setRedeemedVouchers] = useState<RedeemedVoucher[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_vouchers`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [startedQuestIds, setStartedQuestIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_started_quests`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_bookings`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // User location: defaults to Cambridge market square near Fitzwilliam & King's
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 52.2036,
    lng: 0.1188,
  });
  const [isSimulatingLocation, setIsSimulatingLocation] = useState(false);

  // Active Modals & Flows
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [activePlayingQuest, setActivePlayingQuest] = useState<Quest | null>(null);
  const [activeInspectCard, setActiveInspectCard] = useState<CollectibleCard | null>(null);
  const [activeVoucherModal, setActiveVoucherModal] = useState<RedeemedVoucher | null>(null);
  const [activeCheckinSuccess, setActiveCheckinSuccess] = useState<{
    venue: Venue;
    pointsEarned: number;
    newCard?: CollectibleCard;
    source: 'checkin' | 'quest' | 'booking';
  } | null>(null);
  const [activeLevelUpModal, setActiveLevelUpModal] = useState<{
    oldLevel: number;
    newLevel: number;
    newTitle: string;
  } | null>(null);

  const [partnerMode, setPartnerMode] = useState<'user' | 'museum' | 'business'>('user');

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_visited`, JSON.stringify(visitedVenueIds));
      localStorage.setItem(`${STORAGE_KEY}_completed_quests`, JSON.stringify(completedQuestIds));
      localStorage.setItem(`${STORAGE_KEY}_collected_cards`, JSON.stringify(collectedCardIds));
      localStorage.setItem(`${STORAGE_KEY}_vouchers`, JSON.stringify(redeemedVouchers));
      localStorage.setItem(`${STORAGE_KEY}_started_quests`, JSON.stringify(startedQuestIds));
      localStorage.setItem(`${STORAGE_KEY}_bookings`, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [visitedVenueIds, completedQuestIds, collectedCardIds, redeemedVouchers, startedQuestIds, bookings]);

  // Request browser geolocation once if not in simulation mode
  useEffect(() => {
    if ('geolocation' in navigator && !isSimulatingLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Check if user is anywhere near Cambridge (lat ~ 52, lng ~ 0). If not in Cambridge, keep default Cambridge coordinates so map loads pilot city correctly!
          const distanceToCambridge = calculateDistanceMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            CAMBRIDGE_CENTER.lat,
            CAMBRIDGE_CENTER.lng
          );
          if (distanceToCambridge < 15000) {
            // within 15km of Cambridge, use real GPS
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {
          // Permission denied or error, stay in Cambridge center
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [isSimulatingLocation]);

  // Helper to calculate distance from current userLocation to any venue
  const getDistanceToVenueMeters = (venue: Venue): number => {
    return calculateDistanceMeters(userLocation.lat, userLocation.lng, venue.lat, venue.lng);
  };

  // Teleport simulator for testing geofences
  const teleportToVenue = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
      setIsSimulatingLocation(true);
      // Put user 15m from venue entrance
      setUserLocation({
        lat: venue.lat + 0.0001,
        lng: venue.lng + 0.0001,
      });
      triggerHaptic('light');
    }
  };

  const resetUserLocation = () => {
    setIsSimulatingLocation(false);
    setUserLocation({
      lat: 52.2036,
      lng: 0.1188,
    });
  };

  const setUserGpsLocation = (coords: { lat: number; lng: number }) => {
    setUserLocation(coords);
  };

  // XP & Level calculations
  const addXpAndPoints = (xpAmount: number, pointsAmount: number) => {
    setUser(prev => {
      let newXp = prev.xp + xpAmount;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let leveledUp = false;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.round(newXpToNext * 1.4);
        leveledUp = true;
      }

      const newTitle = LEVEL_TITLES[newLevel] || LEVEL_TITLES[10] || 'Grand Master';

      if (leveledUp) {
        sound.playVictory();
        fireConfetti('levelup');
        setActiveLevelUpModal({
          oldLevel: prev.level,
          newLevel,
          newTitle,
        });
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        // +50 point level-up bonus, granted for real so the modal isn't lying
        points: prev.points + pointsAmount + (leveledUp ? 50 : 0),
        title: newTitle,
        stepsWalked: prev.stepsWalked + Math.floor(Math.random() * 180) + 120,
      };
    });
  };

  // Check in at a venue
  const checkInVenue = (venueId: string, method: 'gps' | 'qr'): { success: boolean; message: string; points?: number } => {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return { success: false, message: 'Venue not found' };

    const distance = getDistanceToVenueMeters(venue);
    // In GPS mode, must be within radius (default 75m or venue.radiusMeters)
    if (method === 'gps' && distance > venue.radiusMeters + 15) {
      return {
        success: false,
        message: `Too far! You are ${distance}m away (must be within ${venue.radiusMeters}m). Move closer or scan the venue QR code.`,
      };
    }

    const isFirstTime = !visitedVenueIds.includes(venueId);
    const pointsEarned = isFirstTime ? 100 : 50; // 2x bonus for first visit!
    const xpEarned = isFirstTime ? 80 : 40;

    // Check if there is an uncollected card for this venue to drop
    const venueCards = collectibles.filter(c => c.venueId === venueId);
    const uncollectedCards = venueCards.filter(c => !collectedCardIds.includes(c.id));
    const droppedCard = uncollectedCards.length > 0 ? uncollectedCards[0] : undefined;

    // Update state
    if (isFirstTime) {
      setVisitedVenueIds(prev => [...prev, venueId]);
    }
    if (droppedCard) {
      setCollectedCardIds(prev => [...prev, droppedCard.id]);
    }

    addXpAndPoints(xpEarned, pointsEarned);

    sound.playCoin();
    fireConfetti(droppedCard && (droppedCard.rarity === 'Legendary' || droppedCard.rarity === 'Epic') ? 'legendary' : 'normal');
    triggerHaptic('success');

    setActiveCheckinSuccess({
      venue,
      pointsEarned,
      newCard: droppedCard,
      source: 'checkin',
    });

    return {
      success: true,
      message: `Checked in successfully! +${pointsEarned} points`,
      points: pointsEarned,
    };
  };

  // Book a visit at a paid venue — earns points instantly (pitch mode).
  const bookVisit = (venueId: string, details: { date: string; time: string; tickets: number }) => {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;

    const booking: Booking = {
      id: 'bk-' + Date.now(),
      venueId,
      date: details.date,
      time: details.time,
      tickets: details.tickets,
      createdAt: Date.now(),
    };
    setBookings(prev => [booking, ...prev]);

    addXpAndPoints(40, 60);

    sound.playCoin();
    fireConfetti('normal');
    triggerHaptic('success');

    setActiveCheckinSuccess({
      venue,
      pointsEarned: 60,
      source: 'booking',
    });
  };

  // Remember that a quest was opened, so Home can say "Continue your hunt"
  const markQuestStarted = (questId: string) => {
    setStartedQuestIds(prev => (prev.includes(questId) ? prev : [...prev, questId]));
  };

  // Complete a quest — rewards are one-time only; replays just close.
  const completeQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    if (completedQuestIds.includes(questId)) {
      setActivePlayingQuest(null);
      return;
    }
    setCompletedQuestIds(prev => [...prev, questId]);

    // Drop card if guaranteed or random from venue
    let droppedCard: CollectibleCard | undefined;
    if (quest.guaranteedCardId && !collectedCardIds.includes(quest.guaranteedCardId)) {
      droppedCard = collectibles.find(c => c.id === quest.guaranteedCardId);
      if (droppedCard) {
        setCollectedCardIds(prev => [...prev, droppedCard!.id]);
      }
    } else {
      const available = collectibles.filter(c => c.venueId === quest.venueId && !collectedCardIds.includes(c.id));
      if (available.length > 0) {
        droppedCard = available[0];
        setCollectedCardIds(prev => [...prev, droppedCard!.id]);
      }
    }

    addXpAndPoints(quest.xpReward, quest.pointsReward);

    sound.playVictory();
    fireConfetti(droppedCard?.rarity === 'Legendary' ? 'legendary' : 'normal');
    triggerHaptic('success');

    const venue = venues.find(v => v.id === quest.venueId);
    if (venue) {
      setActiveCheckinSuccess({
        venue,
        pointsEarned: quest.pointsReward,
        newCard: droppedCard,
        source: 'quest',
      });
    }

    setActivePlayingQuest(null);
  };

  // Redeem a reward
  const redeemReward = (rewardId: string): { success: boolean; message: string; voucher?: RedeemedVoucher } => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, message: 'Reward not found' };

    if (user.points < reward.pointsCost) {
      return {
        success: false,
        message: `Need ${reward.pointsCost - user.points} more points! Visit venues or complete quests.`,
      };
    }

    // Deduct points
    setUser(prev => ({
      ...prev,
      points: prev.points - reward.pointsCost,
      localSavingsGbp: prev.localSavingsGbp + 4.5,
    }));

    // Generate random 6-character voucher code e.g. CQ-7F2A
    const code = 'CQ-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newVoucher: RedeemedVoucher = {
      id: 'vch-' + Date.now(),
      rewardId,
      reward,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes live countdown
      redeemedAt: Date.now(),
      status: 'active',
    };

    setRedeemedVouchers(prev => [newVoucher, ...prev]);
    setActiveVoucherModal(newVoucher);

    sound.playCoin();
    fireConfetti('normal');
    triggerHaptic('success');

    return {
      success: true,
      message: 'Reward redeemed! Show your 10-min countdown code to staff.',
      voucher: newVoucher,
    };
  };

  const markVoucherUsed = (voucherId: string) => {
    setRedeemedVouchers(prev =>
      prev.map(v => (v.id === voucherId ? { ...v, status: 'used' } : v))
    );
    if (activeVoucherModal && activeVoucherModal.id === voucherId) {
      setActiveVoucherModal(prev => (prev ? { ...prev, status: 'used' } : null));
    }
  };

  const expireVoucher = (voucherId: string) => {
    setRedeemedVouchers(prev =>
      prev.map(v => (v.id === voucherId && v.status === 'active' ? { ...v, status: 'expired' } : v))
    );
    if (activeVoucherModal && activeVoucherModal.id === voucherId) {
      setActiveVoucherModal(prev => (prev ? { ...prev, status: 'expired' } : null));
    }
  };

  const completeOnboarding = (data: {
    name: string;
    explorerClass: ExplorerClass;
    interests: string[];
    avatar: string;
  }) => {
    setUser(prev => ({
      ...prev,
      name: data.name,
      explorerClass: data.explorerClass,
      interests: data.interests,
      avatar: data.avatar,
      onboarded: true,
      title: `${data.explorerClass} Explorer`,
    }));
    sound.playVictory();
    fireConfetti('normal');
  };

  const resetAllProgress = () => {
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    localStorage.removeItem(`${STORAGE_KEY}_visited`);
    localStorage.removeItem(`${STORAGE_KEY}_completed_quests`);
    localStorage.removeItem(`${STORAGE_KEY}_collected_cards`);
    localStorage.removeItem(`${STORAGE_KEY}_vouchers`);
    localStorage.removeItem(`${STORAGE_KEY}_started_quests`);
    localStorage.removeItem(`${STORAGE_KEY}_bookings`);

    setUser({
      ...DEFAULT_USER,
      onboarded: true,
    });
    setVisitedVenueIds(['venue-whipple']);
    setCompletedQuestIds([]);
    setCollectedCardIds(['card-whipple-astrolabe']);
    setRedeemedVouchers([]);
    setStartedQuestIds([]);
    setBookings([]);
    resetUserLocation();
  };

  const addNewCustomQuest = (questData: Partial<Quest>) => {
    const newQ: Quest = {
      id: 'quest-custom-' + Date.now(),
      venueId: questData.venueId || venues[0].id,
      title: questData.title || 'Curator Challenge',
      type: questData.type || 'trivia',
      description: questData.description || 'Custom museum quest created by partner.',
      difficulty: questData.difficulty || 'Medium',
      pointsReward: questData.pointsReward || 150,
      xpReward: questData.xpReward || 100,
      estimatedMinutes: questData.estimatedMinutes || 15,
      steps: questData.steps || [
        {
          id: 'step-1',
          title: 'Exhibition Clue',
          description: 'Search for the special marker in the main gallery.',
          type: 'trivia',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOptionIndex: 0,
          explanation: 'Verified exhibition artifact.',
        },
      ],
    };
    setQuests(prev => [newQ, ...prev]);
  };

  const addNewCustomReward = (rewardData: Partial<PartnerReward>) => {
    const newR: PartnerReward = {
      id: 'rew-custom-' + Date.now(),
      businessName: rewardData.businessName || 'Local Cambridge Partner',
      businessType: rewardData.businessType || 'Cafe',
      title: rewardData.title || '15% Off Your Order',
      description: rewardData.description || 'Support Cambridge local traders.',
      pointsCost: rewardData.pointsCost || 120,
      distanceMeters: rewardData.distanceMeters || 200,
      address: rewardData.address || 'Cambridge City Centre',
      image: rewardData.image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      terms: rewardData.terms || 'Valid on presentation of app code.',
      stockRemaining: 50,
    };
    setRewards(prev => [newR, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        venues,
        quests,
        collectibles,
        rewards,
        visitedVenueIds,
        discoveredVenueIds,
        completedQuestIds,
        collectedCardIds,
        redeemedVouchers,
        startedQuestIds,
        bookings,
        userLocation,
        isSimulatingLocation,
        selectedVenue,
        activePlayingQuest,
        activeInspectCard,
        activeVoucherModal,
        activeCheckinSuccess,
        activeLevelUpModal,
        partnerMode,
        setUser,
        setSelectedVenue,
        setActivePlayingQuest,
        setActiveInspectCard,
        setActiveVoucherModal,
        setActiveCheckinSuccess,
        setActiveLevelUpModal,
        setPartnerMode,
        checkInVenue,
        bookVisit,
        markQuestStarted,
        completeQuest,
        redeemReward,
        markVoucherUsed,
        expireVoucher,
        teleportToVenue,
        resetUserLocation,
        setUserGpsLocation,
        getDistanceToVenueMeters,
        completeOnboarding,
        resetAllProgress,
        addNewCustomQuest,
        addNewCustomReward,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
