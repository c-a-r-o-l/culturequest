import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_LEADERBOARD, INITIAL_ACTIVITY_FEED } from '../../data/mockData';
import {
  User,
  Settings,
  Trophy,
  Flame,
  Footprints,
  PoundSterling,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Volume2,
  VolumeX,
  RotateCcw,
  Building2,
  Coffee,
  Shield,
  X,
} from 'lucide-react';
import { sound, triggerHaptic, fireConfetti } from '../../utils/audioAndFx';

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
    if (confirm('Reset your profile, visited venues and collected artefacts back to initial state?')) {
      resetAllProgress();
      setShowSettings(false);
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Profile Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowSettings(true);
            }}
            className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-700/80 text-slate-300 flex items-center justify-center hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 p-1 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
                {user.avatar}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[11px] rounded-full shadow border border-slate-950">
              L{user.level}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white font-['Outfit']">{user.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-amber-300">{user.title}</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-indigo-300">{user.explorerClass} Class</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Cambridge Explorer #4892</div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold mb-1">
            <span>Progress to Level {user.level + 1}</span>
            <span className="text-amber-400 font-mono">
              {user.xp} / {user.xpToNextLevel} XP
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-amber-300 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Explorer Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{visitedVenueIds.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Venues Visited</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{completedQuestIds.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Quests Solved</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{user.stepsWalked.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Culture Steps</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <PoundSterling className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-white">£{user.localSavingsGbp.toFixed(2)}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saved Locally</div>
          </div>
        </div>
      </div>

      {/* Streak Calendar & Freeze Token */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-amber-400 text-rose-500" />
            <h3 className="text-sm font-black text-white">Daily Discovery Streak</h3>
          </div>
          <span className="text-xs font-black text-amber-400">{user.streak} Days Strong</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const isFilled = i < user.streak;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition ${
                    isFilled
                      ? 'bg-gradient-to-tr from-amber-400 to-rose-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isFilled ? '🔥' : '•'}
                </div>
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Streak Freeze Tokens Available:</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
            {user.streakFreezeTokens} Token 🛡️
          </span>
        </div>
      </div>

      {/* Team Quests Banner */}
      <div className="p-4 rounded-3xl bg-indigo-950/60 border border-indigo-500/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Team Quest (Co-op)
          </span>
          <span className="text-[10px] text-amber-400 font-bold">+500 pts shared prize</span>
        </div>
        <h4 className="text-sm font-black text-white">The Cambridge Polymath Trail</h4>
        <p className="text-xs text-slate-300">
          You and 2 friends need to visit 3 museums before Sunday. Progress: <strong>2/3 Venues</strong>.
        </p>
      </div>

      {/* Cambridge Leaderboards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-['Outfit']">
            <Trophy className="w-4 h-4 text-amber-400" /> Cambridge Leaderboard
          </h3>
          <span className="text-[10px] text-slate-400">Resets in 3 days</span>
        </div>

        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
          {(['weekly', 'alltime', 'friends'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                triggerHaptic('light');
                setActiveLeaderboardTab(tab);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl capitalize transition ${
                activeLeaderboardTab === tab ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'weekly' ? 'Weekly League' : tab}
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
          {INITIAL_LEADERBOARD.map((item) => (
            <div
              key={item.rank}
              className={`p-3 flex items-center justify-between ${
                item.isUser ? 'bg-indigo-950/80 border-l-4 border-amber-400 font-bold' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 text-center text-xs font-black ${item.rank <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {item.rank <= 3 ? `🥇🥈🥉`[item.rank - 1] : `#${item.rank}`}
                </span>
                <span className="text-lg">{item.avatar}</span>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{item.name}</span>
                    {item.isUser && (
                      <span className="text-[9px] px-1.5 rounded bg-amber-400 text-slate-950 font-black">YOU</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{item.title}</div>
                </div>
              </div>

              <div className="text-xs font-mono font-black text-amber-300">
                {item.points.toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friends Live Activity Feed */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cambridge Friends Feed</h3>
        <div className="space-y-2">
          {INITIAL_ACTIVITY_FEED.map((act) => (
            <div key={act.id} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{act.userAvatar}</span>
                <div>
                  <div className="text-slate-200">
                    <strong className="text-white">{act.userName}</strong> {act.action}{' '}
                    <strong className="text-amber-300">{act.targetName}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">{act.timeAgo}</div>
                </div>
              </div>
              {act.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
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
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white font-['Outfit']">Settings & Modes</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Sound Toggle */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span>Arcade Audio Effects</span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-amber-400' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${soundEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Quiet Hours */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Quiet Hours (22:00 - 08:00)</div>
                  <div className="text-[10px] text-slate-400">Mutes proximity nudges at night</div>
                </div>
                <button
                  onClick={() => setQuietHours(!quietHours)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${quietHours ? 'bg-amber-400' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 absolute top-1 transition-transform ${quietHours ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Partner Dashboards Switch */}
              <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-2">
                <div className="text-xs font-bold text-white">Switch to B2B Partner Portal:</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPartnerMode('museum');
                      setShowSettings(false);
                    }}
                    className="flex-1 py-2 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" /> Museum Portal
                  </button>
                  <button
                    onClick={() => {
                      setPartnerMode('business');
                      setShowSettings(false);
                    }}
                    className="flex-1 py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <Coffee className="w-3.5 h-3.5" /> Cafe/Shop Portal
                  </button>
                </div>
              </div>

              {/* Replay Onboarding */}
              <button
                onClick={() => {
                  setShowSettings(false);
                  onOpenOnboarding();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs hover:text-white"
              >
                Replay Welcome Onboarding
              </button>

              {/* Reset Data */}
              <button
                onClick={handleResetData}
                className="w-full py-2.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 font-bold text-xs hover:bg-rose-950"
              >
                Reset Demo Progress Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
