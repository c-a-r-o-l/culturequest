import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_LEADERBOARD, INITIAL_ACTIVITY_FEED } from '../../data/mockData';
import {
  Settings,
  Flame,
  Footprints,
  PoundSterling,
  Sparkles,
  Users,
  Compass,
  Volume2,
  VolumeX,
  Building2,
  Coffee,
  Shield,
  BookOpen,
  Scroll,
  Award,
  Feather,
  X,
} from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

export const ProfileView: React.FC<{ onOpenOnboarding: () => void }> = ({ onOpenOnboarding }) => {
  const {
    user,
    visitedVenueIds,
    completedQuestIds,
    collectedCardIds,
    resetAllProgress,
    setPartnerMode,
  } = useApp();

  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'weekly' | 'alltime' | 'friends'>('weekly');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState(false);

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    triggerHaptic('light');
  };

  const handleResetData = () => {
    if (confirm('Reset your scholar dossier, visited archives and folios back to initial state?')) {
      resetAllProgress();
      setShowSettings(false);
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Scholar's Dossier Card */}
      <div className="p-5 rounded-3xl bg-[#1C3A27] border-2 border-[#B89758] shadow-xl relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowSettings(true);
            }}
            className="w-8 h-8 rounded-xl bg-[#122419] border border-[#B89758]/60 text-[#D1C7B7] flex items-center justify-center hover:text-white"
          >
            <Settings className="w-4 h-4 text-[#B89758]" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#122419] border-2 border-[#B89758] p-1 shadow-lg flex items-center justify-center">
              <span className="text-3xl">{user.avatar}</span>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-[#6B1D23] text-[#FAF8F5] font-mono font-bold text-[9px] rounded-full border border-[#B89758]">
              V{user.level}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#FAF8F5] font-display">{user.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-display font-bold text-[#E2CA8E]">{user.title}</span>
              <span className="text-[#879B8E]">•</span>
              <span className="text-xs font-body italic text-[#C0CEC5]">{user.explorerClass}</span>
            </div>
            <div className="text-[10px] font-mono text-[#A6BAAE] mt-1">Cantabrigia Scholar ID #4892</div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-4 pt-3 border-t border-[#B89758]/30">
          <div className="flex items-center justify-between text-[10px] text-[#D1C7B7] font-display mb-1">
            <span>Promotion to Scholar Rank {user.level + 1}</span>
            <span className="text-[#E2CA8E] font-mono">
              {user.xp} / {user.xpToNextLevel} XP
            </span>
          </div>
          <div className="h-2 w-full bg-[#0F1B13] rounded-full overflow-hidden border border-[#B89758]/30">
            <div
              className="h-full bg-gradient-to-r from-[#B89758] to-[#E2CA8E] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Explorer Stats Grid (Parchment Texture Cards) */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl parchment-card border border-[#B89758]/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1C3A27] text-[#E2CA8E] flex items-center justify-center shrink-0 border border-[#B89758]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#1C3A27] font-mono">{visitedVenueIds.length}</div>
            <div className="text-[9px] text-[#544431] uppercase font-display font-bold">Archives Visited</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl parchment-card border border-[#B89758]/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6B1D23] text-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#B89758]">
            <Scroll className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#1C3A27] font-mono">{completedQuestIds.length}</div>
            <div className="text-[9px] text-[#544431] uppercase font-display font-bold">Treatises Solved</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl parchment-card border border-[#B89758]/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1C3A27] text-[#E2CA8E] flex items-center justify-center shrink-0 border border-[#B89758]">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#1C3A27] font-mono">{user.stepsWalked.toLocaleString()}</div>
            <div className="text-[9px] text-[#544431] uppercase font-display font-bold">Scholar Steps</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl parchment-card border border-[#B89758]/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6B1D23] text-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#B89758]">
            <PoundSterling className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#1C3A27] font-mono">£{user.localSavingsGbp.toFixed(2)}</div>
            <div className="text-[9px] text-[#544431] uppercase font-display font-bold">Saved Locally</div>
          </div>
        </div>
      </div>

      {/* Streak Chronicle & Freeze Token */}
      <div className="p-4 rounded-3xl bg-[#1C3A27] border border-[#B89758]/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-[#E2CA8E] text-[#B89758]" />
            <h3 className="text-xs font-bold text-[#FAF8F5] font-display">Academic Streak Chronicle</h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#E2CA8E]">{user.streak} Days Strong</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-display">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const isFilled = i < user.streak;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                    isFilled
                      ? 'bg-[#6B1D23] border border-[#B89758] text-[#FAF8F5]'
                      : 'bg-[#122419] border border-[#1C3A27] text-[#879B8E]'
                  }`}
                >
                  {isFilled ? '🔥' : '•'}
                </div>
                <span className="text-[9px] font-bold text-[#A6BAAE]">{day}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#B89758]/30 text-xs text-[#D1C7B7] font-body">
          <span>Streak Freeze Seals Available:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#122419] text-[#E2CA8E] font-bold border border-[#B89758]/60 font-mono">
            {user.streakFreezeTokens} Token 🛡️
          </span>
        </div>
      </div>

      {/* Collegiate Leaderboards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#FAF8F5] flex items-center gap-1.5 font-display uppercase tracking-widest">
            <Award className="w-4 h-4 text-[#B89758]" /> Collegiate Fellowships
          </h3>
          <span className="text-[10px] text-[#A6BAAE] font-mono">Resets in 3 days</span>
        </div>

        <div className="flex rounded-2xl bg-[#1C3A27] p-1 border border-[#B89758]/60">
          {(['weekly', 'alltime', 'friends'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                triggerHaptic('light');
                setActiveLeaderboardTab(tab);
              }}
              className={`flex-1 py-1.5 text-[11px] font-display font-bold uppercase tracking-wider rounded-xl transition ${
                activeLeaderboardTab === tab
                  ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]'
                  : 'text-[#879B8E] hover:text-[#FAF8F5]'
              }`}
            >
              {tab === 'weekly' ? 'Weekly League' : tab}
            </button>
          ))}
        </div>

        <div className="rounded-3xl parchment-card border border-[#B89758] divide-y divide-[#B89758]/30 overflow-hidden">
          {INITIAL_LEADERBOARD.map((item) => (
            <div
              key={item.rank}
              className={`p-3 flex items-center justify-between ${
                item.isUser ? 'bg-[#1C3A27] text-[#FAF8F5]' : 'text-[#1C3A27]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 text-center text-xs font-mono font-bold ${item.rank <= 3 ? 'text-[#B89758]' : 'text-[#879B8E]'}`}>
                  {item.rank <= 3 ? `🥇🥈🥉`[item.rank - 1] : `#${item.rank}`}
                </span>
                <span className="text-lg">{item.avatar}</span>
                <div>
                  <div className={`text-xs font-bold font-display flex items-center gap-1 ${item.isUser ? 'text-[#FAF8F5]' : 'text-[#1C3A27]'}`}>
                    <span>{item.name}</span>
                    {item.isUser && (
                      <span className="text-[8px] px-1.5 rounded bg-[#6B1D23] text-[#FAF8F5] font-mono">YOU</span>
                    )}
                  </div>
                  <div className={`text-[10px] font-body italic ${item.isUser ? 'text-[#D1C7B7]' : 'text-[#544431]'}`}>{item.title}</div>
                </div>
              </div>

              <div className={`text-xs font-mono font-bold ${item.isUser ? 'text-[#E2CA8E]' : 'text-[#6B1D23]'}`}>
                {item.points.toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friends Live Activity Feed */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-[#A6BAAE] uppercase tracking-widest font-display">
          Cantabrigia Chronicle Feed
        </h3>
        <div className="space-y-2">
          {INITIAL_ACTIVITY_FEED.map((act) => (
            <div key={act.id} className="p-3 rounded-2xl parchment-card border border-[#B89758]/40 flex items-center justify-between text-xs font-body">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{act.userAvatar}</span>
                <div>
                  <div className="text-[#1C3A27]">
                    <strong className="font-display">{act.userName}</strong> {act.action}{' '}
                    <strong className="text-[#6B1D23] font-display">{act.targetName}</strong>
                  </div>
                  <div className="text-[10px] text-[#544431] font-mono">{act.timeAgo}</div>
                </div>
              </div>
              {act.badge && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758]">
                  {act.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl parchment-card border-2 border-[#B89758] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#B89758]/40">
              <h3 className="text-base font-bold text-[#1C3A27] font-display">Scholar Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-7 h-7 rounded-full bg-[#1C3A27] text-[#E2CA8E] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Sound Toggle */}
              <div className="p-3 rounded-2xl bg-[#F5EFE2] border border-[#B89758]/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-display font-bold text-[#1C3A27]">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#B89758]" /> : <VolumeX className="w-4 h-4 text-[#879B8E]" />}
                  <span>Archival Sound Chimes</span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-[#1C3A27]' : 'bg-[#D1C7B7]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#FAF8F5] absolute top-1 transition-transform ${soundEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Quiet Hours */}
              <div className="p-3 rounded-2xl bg-[#F5EFE2] border border-[#B89758]/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-display font-bold text-[#1C3A27]">Quiet Hours (22:00 - 08:00)</div>
                  <div className="text-[10px] text-[#544431] font-body">Mutes proximity nudges at night</div>
                </div>
                <button
                  onClick={() => setQuietHours(!quietHours)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${quietHours ? 'bg-[#1C3A27]' : 'bg-[#D1C7B7]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#FAF8F5] absolute top-1 transition-transform ${quietHours ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Partner Consoles */}
              <div className="p-3 rounded-2xl bg-[#1C3A27] border border-[#B89758] space-y-2 text-[#FAF8F5]">
                <div className="text-xs font-display font-bold text-[#E2CA8E]">B2B Archival Portals:</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPartnerMode('museum');
                      setShowSettings(false);
                    }}
                    className="flex-1 py-2 px-2 rounded-xl bg-[#122419] border border-[#B89758] text-[#E2CA8E] font-display font-bold text-[10px] flex items-center justify-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" /> Museum Portal
                  </button>
                  <button
                    onClick={() => {
                      setPartnerMode('business');
                      setShowSettings(false);
                    }}
                    className="flex-1 py-2 px-2 rounded-xl bg-[#6B1D23] border border-[#B89758] text-[#FAF8F5] font-display font-bold text-[10px] flex items-center justify-center gap-1"
                  >
                    <Coffee className="w-3.5 h-3.5" /> Partner Portal
                  </button>
                </div>
              </div>

              {/* Replay Onboarding */}
              <button
                onClick={() => {
                  setShowSettings(false);
                  onOpenOnboarding();
                }}
                className="w-full py-2.5 rounded-xl bg-[#1C3A27] text-[#E2CA8E] font-display font-bold text-xs border border-[#B89758]/50"
              >
                Replay Matriculation Welcome
              </button>

              {/* Reset Data */}
              <button
                onClick={handleResetData}
                className="w-full py-2.5 rounded-xl bg-[#6B1D23]/20 border border-[#6B1D23] text-[#6B1D23] font-display font-bold text-xs"
              >
                Reset Scholar Progress Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
