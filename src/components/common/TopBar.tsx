import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Coins } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const TopBar: React.FC<{ onOpenLevelDetails?: () => void }> = ({ onOpenLevelDetails }) => {
  const { user } = useApp();
  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-line px-3.5 py-2 pt-safe flex items-center justify-between">
      {/* Left: profile & level */}
      <button
        onClick={onOpenLevelDetails}
        className="flex items-center gap-2.5 hover:opacity-90 active:scale-[0.98] transition text-left"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gold-soft border-2 border-gold flex items-center justify-center text-xl">
            {user.avatar}
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-vermilion text-white text-[10px] font-black rounded-full border-2 border-card font-mono leading-none">
            {user.level}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold text-ink font-display tracking-wide max-w-[110px] truncate">
            {user.name}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-20 h-1.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-muted font-semibold">
              {user.xp}/{user.xpToNextLevel} XP
            </span>
          </div>
        </div>
      </button>

      {/* Right: install, streak, points */}
      <div className="flex items-center gap-2">
        <PWAInstallButton compact />

        <div
          title={`${user.streak} day streak`}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-vermilion-soft text-vermilion"
        >
          <Flame className="w-3.5 h-3.5 fill-vermilion" />
          <span className="text-xs font-bold font-mono">{user.streak}d</span>
        </div>

        <div
          title="Points — redeem for rewards"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-soft border border-gold/60 text-ink"
        >
          <Coins className="w-3.5 h-3.5 text-gold fill-gold/20" />
          <span className="text-xs font-bold tracking-tight font-mono">{user.points}</span>
        </div>
      </div>
    </header>
  );
};
