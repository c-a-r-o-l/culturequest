import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Coins, BookOpen, Feather } from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export const TopBar: React.FC<{ onOpenLevelDetails?: () => void }> = ({ onOpenLevelDetails }) => {
  const { user } = useApp();
  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));

  return (
    <header className="sticky top-0 z-40 bg-[#1C3A27] border-b border-[#B89758]/50 px-3.5 py-2.5 pt-safe flex items-center justify-between shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      {/* Left: Scholar Profile & Level Seal */}
      <button
        onClick={onOpenLevelDetails}
        className="flex items-center gap-2.5 hover:opacity-95 active:scale-98 transition text-left"
      >
        <div className="relative">
          {/* Wax seal avatar ring */}
          <div className="w-10 h-10 rounded-2xl bg-[#122419] border-2 border-[#B89758] flex items-center justify-center text-xl shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            {user.avatar}
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#6B1D23] text-[#FAF8F5] text-[10px] font-black rounded-full shadow border border-[#B89758] font-mono">
            V{user.level}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#FAF8F5] font-display tracking-wide max-w-[110px] truncate">
              {user.name}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#122419] text-[#B89758] font-semibold border border-[#B89758]/40 tracking-wider font-display">
              {user.title}
            </span>
          </div>

          {/* Archival XP Progress Bar */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-20 h-1.5 bg-[#0F1B13] rounded-full overflow-hidden border border-[#B89758]/30">
              <div
                className="h-full bg-gradient-to-r from-[#B89758] to-[#E2CA8E] rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[#D1C7B7] font-semibold">
              {user.xp}/{user.xpToNextLevel} XP
            </span>
          </div>
        </div>
      </button>

      {/* Right: Points, Streak Flame, Install */}
      <div className="flex items-center gap-2">
        <PWAInstallButton compact />

        {/* Oxblood Wax Seal Streak */}
        <div
          title={`${user.streak} day discovery streak!`}
          className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#6B1D23] border border-[#B89758]/60 text-[#FAF8F5] shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
        >
          <Flame className="w-3.5 h-3.5 fill-[#E2CA8E] text-[#B89758]" />
          <span className="text-xs font-black text-[#FAF8F5] font-mono">{user.streak}d</span>
        </div>

        {/* Scholarly Honorarium / Points Pill */}
        <div
          title="Cantabrigia Honorarium Points"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#122419] border border-[#B89758] text-[#B89758] shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
        >
          <Feather className="w-3.5 h-3.5 text-[#B89758]" />
          <span className="text-xs font-black tracking-tight font-mono text-[#FAF8F5]">{user.points}</span>
        </div>
      </div>
    </header>
  );
};
