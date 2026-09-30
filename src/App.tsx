import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { HomeView } from './components/home/HomeView';
import { PitchShell } from './components/common/PitchShell';
import { ExploreMap } from './components/explore/ExploreMap';
import { QuestsView } from './components/quests/QuestsView';
import { RewardsView } from './components/rewards/RewardsView';
import { ProfileView } from './components/profile/ProfileView';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { VenueDetailModal } from './components/venue/VenueDetailModal';
import { CheckinSuccessModal } from './components/venue/CheckinSuccessModal';
import { LevelUpModal } from './components/common/LevelUpModal';
import { QuestPlayModal } from './components/quests/QuestPlayModal';
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
    activePlayingQuest,
    setActivePlayingQuest,
    setActiveInspectCard,
    partnerMode,
    collectibles,
    quests,
    bookmarkedQuestIds,
    completedQuestIds,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // If the user has not onboarded yet, show onboarding
  if (!user.onboarded || showOnboardingModal) {
    return <OnboardingFlow onFinish={() => setShowOnboardingModal(false)} />;
  }

  // Badge: bookmarked quests still to complete
  const bookmarkedQuestsCount = quests.filter(
    (q) => bookmarkedQuestIds.includes(q.id) && !completedQuestIds.includes(q.id)
  ).length;

  return (
    <div className="h-full overflow-y-auto bg-wall text-ink flex flex-col font-sans">
      {/* Offline Mode Toast */}
      <OfflineIndicator />

      {/* Top Bar (profile, level, XP, points, streak) */}
      {partnerMode === 'user' && (
        <TopBar onOpenLevelDetails={() => setActiveTab('profile')} />
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full relative">
        {partnerMode !== 'user' ? (
          <PartnerDashboard />
        ) : (
          <>
            {activeTab === 'home' && <HomeView onNavigate={setActiveTab} />}
            <div className={activeTab === 'explore' ? 'absolute inset-0' : ''}>
              {activeTab === 'explore' && <ExploreMap />}
            </div>
            {activeTab === 'quests' && <QuestsView />}
            {activeTab === 'rewards' && <RewardsView />}
            {activeTab === 'profile' && (
              <ProfileView onOpenOnboarding={() => setShowOnboardingModal(true)} />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      {partnerMode === 'user' && (
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          bookmarkedQuestsCount={bookmarkedQuestsCount}
        />
      )}

      {/* Venue Detail */}
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

      {/* Quest player — rendered globally so quests open from the map,
          venue details, and the check-in success screen. */}
      {activePlayingQuest && (
        <QuestPlayModal
          quest={activePlayingQuest}
          onClose={() => setActivePlayingQuest(null)}
        />
      )}

      {/* Check-in / Quest success celebration */}
      {activeCheckinSuccess && (
        <CheckinSuccessModal
          venue={activeCheckinSuccess.venue}
          pointsEarned={activeCheckinSuccess.pointsEarned}
          newCard={activeCheckinSuccess.newCard}
          source={activeCheckinSuccess.source}
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

      {/* Level-Up — waits until the success modal closes so celebrations never stack */}
      {activeLevelUpModal && !activeCheckinSuccess && (
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
      <PitchShell>
        <MainApp />
      </PitchShell>
    </AppProvider>
  );
}
