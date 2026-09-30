export type ExplorerClass = 'Curator' | 'Historian' | 'Wanderer' | 'Detective';

export type VenueType = 'Museum' | 'Gallery' | 'Library' | 'Heritage' | 'Garden';

export type QuestType = 'scavenger' | 'trivia' | 'photo' | 'route' | 'daily';

export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  explorerClass: ExplorerClass;
  level: number;
  xp: number;
  xpToNextLevel: number;
  points: number;
  lastCheckinDate?: string;
  interests: string[];
  title: string;
  stepsWalked: number;
  localSavingsGbp: number;
  onboarded: boolean;
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  shortDesc: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  hours: string;
  isOpen: boolean;
  isFree: boolean;
  entryFee?: string;
  image: string;
  qrSecret: string;
  weeklyVisitors: number;
  featuredEvent?: {
    title: string;
    badge: string;
    endsIn: string;
  };
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  type: 'trivia' | 'clue' | 'photo' | 'location';
  // Trivia
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  // Clue / Scavenger
  clueHint?: string;
  targetObject?: string;
  qrCodeExpected?: string;
  // Photo
  photoPrompt?: string;
}

export interface Quest {
  id: string;
  venueId: string;
  title: string;
  type: QuestType;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
  pointsReward: number;
  xpReward: number;
  estimatedMinutes: number;
  steps: QuestStep[];
  guaranteedCardId?: string;
  isDaily?: boolean;
  isLimitedTime?: boolean;
  expiresIn?: string;
}

export interface CollectibleCard {
  id: string;
  venueId: string;
  name: string;
  category: string;
  rarity: CardRarity;
  image: string;
  funFact: string;
  originDate: string;
  setId: string;
  setName: string;
  collectorNumber: number;
  totalInSet: number;
}

export interface PartnerReward {
  id: string;
  businessName: string;
  businessType: 'Cafe' | 'Bookshop' | 'Bakery' | 'Culture Shop';
  title: string;
  description: string;
  pointsCost: number;
  distanceMeters: number;
  address: string;
  image: string;
  terms: string;
  stockRemaining: number;
  isSponsored?: boolean;
  sponsorBadge?: string;
}

export interface Booking {
  id: string;
  venueId: string;
  date: string;
  time: string;
  tickets: number;
  createdAt: number;
}

export interface RedeemedVoucher {
  id: string;
  rewardId: string;
  reward: PartnerReward;
  code: string;
  expiresAt: number; // timestamp
  redeemedAt: number;
  status: 'active' | 'used' | 'expired';
}

export interface ActivityFeedItem {
  id: string;
  userName: string;
  userAvatar: string;
  action: string;
  targetName: string;
  timeAgo: string;
  badge?: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  title: string;
  points: number;
  isUser?: boolean;
}
