import React from 'react';
import { Compass, Sparkles, Layers, Gift, User, ShieldCheck } from 'lucide-react';
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
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'quests', label: 'Quests', icon: Sparkles, badge: activeQuestsCount },
    { id: 'collection', label: 'Collection', icon: Layers },
    { id: 'rewards', label: 'Rewards', icon: Gift, badge: availableRewardsCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 pb-safe pt-2">
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
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Active Glow Pill */}
              {isActive && (
                <div className="absolute inset-0 bg-indigo-500/15 border border-indigo-400/25 rounded-2xl -z-10 shadow-sm" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5px] scale-110 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[16px] text-center text-[9px] font-black bg-rose-500 text-white rounded-full border border-slate-950 shadow">
                    {tab.badge}
                  </span>
                ) : null}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-amber-300 font-extrabold' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
