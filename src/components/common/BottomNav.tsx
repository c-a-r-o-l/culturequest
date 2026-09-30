import React from 'react';
import { Map, ListChecks, User, House } from 'lucide-react';
import { triggerHaptic } from '../../utils/audioAndFx';

export type NavTab = 'home' | 'explore' | 'quests' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  bookmarkedQuestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  bookmarkedQuestsCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'explore', label: 'Explore', icon: Map },
    { id: 'quests', label: 'Quests', icon: ListChecks, badge: bookmarkedQuestsCount },
    { id: 'profile', label: 'You', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-line px-2 pb-safe pt-1.5">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.id);
              }}
              className="relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 active:scale-95"
            >
              <div
                className={`relative w-9 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-vermilion-soft' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'text-vermilion stroke-[2.4px]' : 'text-muted stroke-[1.8px]'
                  }`}
                />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 px-1 min-w-[16px] h-4 text-center text-[9px] font-bold bg-vermilion text-white rounded-full border border-card font-mono leading-4">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[10px] mt-0.5 font-semibold ${
                  isActive ? 'text-ink font-bold' : 'text-muted'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
