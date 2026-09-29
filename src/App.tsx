import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { ExploreMap } from './components/explore/ExploreMap';
import { QuestsView } from './components/quests/QuestsView';
import { CollectionView } from './components/collection/CollectionView';
import { RewardsView } from './components/rewards/RewardsView';
import { ProfileView } from './components/profile/ProfileView';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { VenueDetailModal } from './components/venue/VenueDetailModal';
import { CheckinSuccessModal } from './components/venue/CheckinSuccessModal';
import { LevelUpModal } from './components/common/LevelUpModal';
import { PartnerDashboard } from './components/partner/PartnerDashboard';
import { OfflineIndicator } from './components/pwa/PWAInstallButton';

function MainApp() {
  const {
    user,
    selectedVenue,
    setSelectedVenue,
    activeCheckinSuccess,
    setActiveCheckinSuccess,
    activeLevelUpModal,
    setActiveLevelUpModal,
    setActivePlayingQuest,
    setActiveInspectCard,
    partnerMode,
    collectibles,
    quests,
    completedQuestIds,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // If user has not onboarded yet, show onboarding
  if (!user.onboarded || showOnboardingModal) {
    return <OnboardingFlow onFinish={() => setShowOnboardingModal(false)} />;
  }

  // Active quests count for badge
  const uncompletedQuestsCount = quests.filter((q) => !completedQuestIds.includes(q.id)).length;

  return (
    <div className="min-h-screen bg-[#121A15] text-[#FAF8F5] flex flex-col font-['EB_Garamond',Georgia,serif] selection:bg-[#B89758] selection:text-[#121A15]">
      {/* Offline Mode Toast */}
      <OfflineIndicator />

      {/* Top Bar (Level, XP, Points, Streak, Install Button) */}
      {partnerMode === 'user' && (
        <TopBar onOpenLevelDetails={() => setActiveTab('profile')} />
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full relative">
        {partnerMode !== 'user' ? (
          <PartnerDashboard />
        ) : (
          <>
            {activeTab === 'explore' && <ExploreMap />}
            {activeTab === 'quests' && <QuestsView />}
            {activeTab === 'collection' && <CollectionView />}
            {activeTab === 'rewards' && <RewardsView />}
            {activeTab === 'profile' && (
              <ProfileView onOpenOnboarding={() => setShowOnboardingModal(true)} />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation (5 tabs) */}
      {partnerMode === 'user' && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
          }}
          activeQuestsCount={uncompletedQuestsCount}
        />
      )}

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <VenueDetailModal
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onOpenQuest={(questId) => {
            const q = quests.find((item) => item.id === questId);
            if (q) {
              setSelectedVenue(null);
              setActivePlayingQuest(q);
            }
          }}
          onInspectCard={(cardId) => {
            const c = collectibles.find((item) => item.id === cardId);
            if (c) {
              setActiveInspectCard(c);
            }
          }}
        />
      )}

      {/* Check-in / Quest Success Celebration Modal */}
      {activeCheckinSuccess && (
        <CheckinSuccessModal
          venue={activeCheckinSuccess.venue}
          pointsEarned={activeCheckinSuccess.pointsEarned}
          newCard={activeCheckinSuccess.newCard}
          onClose={() => setActiveCheckinSuccess(null)}
          onStartQuest={() => {
            const venue = activeCheckinSuccess.venue;
            const venueQuests = quests.filter((q) => q.venueId === venue.id);
            setActiveCheckinSuccess(null);
            if (venueQuests.length > 0) {
              setActivePlayingQuest(venueQuests[0]);
            }
          }}
          onInspectCard={(card) => {
            setActiveCheckinSuccess(null);
            setActiveInspectCard(card);
          }}
        />
      )}

      {/* Level-Up Fanfare Modal */}
      {activeLevelUpModal && (
        <LevelUpModal
          oldLevel={activeLevelUpModal.oldLevel}
          newLevel={activeLevelUpModal.newLevel}
          newTitle={activeLevelUpModal.newTitle}
          onClose={() => setActiveLevelUpModal(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
