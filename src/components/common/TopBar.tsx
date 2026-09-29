import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Coins, Sparkles, Compass } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const TopBar: React.FC<{ onOpenLevelDetails?: () => void }> = ({ onOpenLevelDetails }) => {
  const { user } = useApp();
  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3.5 py-2.5 pt-safe flex items-center justify-between shadow-lg">
      {/* Left: Avatar, Level & XP */}
      <button
        onClick={onOpenLevelDetails}
        className="flex items-center gap-2.5 hover:opacity-90 active:scale-95 transition text-left"
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 border-2 border-indigo-400/50 flex items-center justify-center text-xl shadow-md">
            {user.avatar}
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full shadow border border-slate-950">
            L{user.level}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-100 max-w-[100px] truncate">{user.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800/50">
              {user.title}
            </span>
          </div>
          {/* XP Progress Bar */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-slate-400 font-semibold">
              {user.xp}/{user.xpToNextLevel} XP
            </span>
          </div>
        </div>
      </button>

      {/* Right: Points, Streak Flame, Install */}
      <div className="flex items-center gap-2">
        <PWAInstallButton compact />

        {/* Streak Flame */}
        <div
          title={`${user.streak} day discovery streak!`}
          className="flex items-center gap-1 px-2 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-rose-500/30 text-rose-400 shadow-sm"
        >
          <Flame className="w-4 h-4 fill-amber-400 text-rose-500 animate-pulse" />
          <span className="text-xs font-black text-amber-300">{user.streak}</span>
        </div>

        {/* Points Balance Pill */}
        <div
          title="Culture Points - redeemable for coffee & books"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/40 text-amber-300 shadow-sm"
        >
          <Coins className="w-4 h-4 text-amber-400 fill-amber-400/40" />
          <span className="text-xs font-black tracking-tight">{user.points}</span>
        </div>
      </div>
    </header>
  );
};
