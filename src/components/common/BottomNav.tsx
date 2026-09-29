import React from 'react';
import { Compass, BookOpen, Scroll, Award, UserCheck, Shield } from 'lucide-react';
import { triggerHaptic } from '../../utils/audioAndFx';

export type NavTab = 'explore' | 'quests' | 'collection' | 'rewards' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeQuestsCount?: number;
  availableRewardsCount?: number;
  unseenCardsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  activeQuestsCount = 0,
  availableRewardsCount = 0,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'explore', label: 'Cartography', icon: Compass },
    { id: 'quests', label: 'Chronicles', icon: Scroll, badge: activeQuestsCount },
    { id: 'collection', label: 'Vault', icon: BookOpen },
    { id: 'rewards', label: 'Fellowship', icon: Award, badge: availableRewardsCount },
    { id: 'profile', label: 'Scholar', icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1C3A27] border-t border-[#B89758]/60 px-2 pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
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
              className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#E2CA8E] font-bold'
                  : 'text-[#9BAEA2] hover:text-[#FAF8F5] active:scale-95'
              }`}
            >
              {/* Active Bookmark Ribbon Marker */}
              {isActive && (
                <div className="absolute inset-0 bg-[#122419] border border-[#B89758] rounded-xl -z-10 shadow-[inset_0_0_8px_rgba(184,151,88,0.25)]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5px] scale-110 text-[#B89758]' : ''
                  }`}
                />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[14px] text-center text-[8px] font-black bg-[#6B1D23] text-[#FAF8F5] rounded-full border border-[#B89758] shadow font-mono">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[9px] mt-1 tracking-wider uppercase font-display ${
                  isActive ? 'text-[#E2CA8E] font-black' : 'text-[#879B8E]'
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
