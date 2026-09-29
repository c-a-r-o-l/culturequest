import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_LEADERBOARD, INITIAL_ACTIVITY_FEED } from '../../data/mockData';
import {
  Settings,
  Flame,
  Footprints,
  PoundSterling,
  Compass,
  Volume2,
  VolumeX,
  Building2,
  Coffee,
  Award,
  ListChecks,
  X,
} from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

export const ProfileView: React.FC<{ onOpenOnboarding: () => void }> = ({ onOpenOnboarding }) => {
  const {
    user,
    visitedVenueIds,
    completedQuestIds,
    resetAllProgress,
    setPartnerMode,
  } = useApp();

  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'weekly' | 'alltime' | 'friends'>('weekly');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    triggerHaptic('light');
  };

  const handleResetData = () => {
    if (confirm('Reset your profile, visits and quests back to the demo state?')) {
      resetAllProgress();
      setShowSettings(false);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Profile card */}
      <div className="p-5 rounded-3xl bg-card border border-line shadow-sm relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowSettings(true);
            }}
            className="w-8 h-8 rounded-full bg-wall border border-line text-muted flex items-center justify-center hover:text-ink"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gold-soft border-2 border-gold p-1 shadow-sm flex items-center justify-center">
              <span className="text-3xl">{user.avatar}</span>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-vermilion text-white font-mono font-bold text-[9px] rounded-full border-2 border-card">
              Lv {user.level}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-black text-ink font-display">{user.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-vermilion">{user.title}</span>
              <span className="text-muted">•</span>
              <span className="text-xs text-muted">{user.explorerClass}</span>
            </div>
            <div className="text-[10px] font-mono text-muted mt-1">Member #4892 · Cambridge</div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4 pt-3 border-t border-line">
          <div className="flex items-center justify-between text-[10px] text-muted mb-1">
            <span>Next level: {user.level + 1}</span>
            <span className="font-mono text-ink">{user.xp} / {user.xpToNextLevel} XP</span>
          </div>
          <div className="h-2 w-full bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-card border border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-vermilion-soft text-vermilion flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-ink font-mono">{visitedVenueIds.length}</div>
            <div className="text-[9px] text-muted uppercase font-bold">Venues visited</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center shrink-0">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-ink font-mono">{completedQuestIds.length}</div>
            <div className="text-[9px] text-muted uppercase font-bold">Quests done</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-soft text-gold flex items-center justify-center shrink-0">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-ink font-mono">{user.stepsWalked.toLocaleString()}</div>
            <div className="text-[9px] text-muted uppercase font-bold">Steps walked</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-soft text-teal flex items-center justify-center shrink-0">
            <PoundSterling className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-ink font-mono">£{user.localSavingsGbp.toFixed(2)}</div>
            <div className="text-[9px] text-muted uppercase font-bold">Saved locally</div>
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="p-4 rounded-3xl bg-card border border-line space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 fill-vermilion text-vermilion" />
            <h3 className="text-xs font-bold text-ink font-display">Daily streak</h3>
          </div>
          <span className="text-xs font-mono font-bold text-vermilion">{user.streak} days</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const isFilled = i < user.streak;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                    isFilled ? 'bg-vermilion text-white' : 'bg-wall border border-line text-muted'
                  }`}
                >
                  {isFilled ? '🔥' : '•'}
                </div>
                <span className="text-[9px] font-bold text-muted">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-ink flex items-center gap-1.5 font-display uppercase tracking-widest">
            <Award className="w-4 h-4 text-gold" /> Leaderboard
          </h3>
          <span className="text-[10px] text-muted font-mono">Resets in 3 days</span>
        </div>

        <div className="flex rounded-full bg-card p-1 border border-line">
          {(['weekly', 'alltime', 'friends'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                triggerHaptic('light');
                setActiveLeaderboardTab(tab);
              }}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-full transition ${
                activeLeaderboardTab === tab ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
              }`}
            >
              {tab === 'weekly' ? 'This week' : tab === 'alltime' ? 'All time' : 'Friends'}
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-card border border-line divide-y divide-line overflow-hidden">
          {INITIAL_LEADERBOARD.map((item) => (
            <div
              key={item.rank}
              className={`p-3 flex items-center justify-between ${item.isUser ? 'bg-gold-soft' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 text-center text-xs font-mono font-bold ${item.rank <= 3 ? 'text-gold' : 'text-muted'}`}>
                  {item.rank <= 3 ? `🥇🥈🥉`[item.rank - 1] : `#${item.rank}`}
                </span>
                <span className="text-lg">{item.avatar}</span>
                <div>
                  <div className="text-xs font-bold text-ink font-display flex items-center gap-1">
                    <span>{item.name}</span>
                    {item.isUser && (
                      <span className="text-[8px] px-1.5 rounded bg-vermilion text-white font-mono">YOU</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted">{item.title}</div>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-ink">{item.points.toLocaleString()} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-muted uppercase tracking-widest font-display">
          Recent activity
        </h3>
        <div className="space-y-2">
          {INITIAL_ACTIVITY_FEED.map((act) => (
            <div key={act.id} className="p-3 rounded-2xl bg-card border border-line flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{act.userAvatar}</span>
                <div>
                  <div className="text-ink">
                    <strong className="font-display">{act.userName}</strong> {act.action}{' '}
                    <strong className="text-vermilion font-display">{act.targetName}</strong>
                  </div>
                  <div className="text-[10px] text-muted font-mono">{act.timeAgo}</div>
                </div>
              </div>
              {act.badge && (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-teal-soft text-teal">
                  {act.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="text-base font-black text-ink font-display">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="w-7 h-7 rounded-full bg-wall text-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Sound toggle */}
              <div className="p-3 rounded-2xl bg-wall border border-line flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-teal" /> : <VolumeX className="w-4 h-4 text-muted" />}
                  <span>Sound effects</span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`w-11 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-teal' : 'bg-line'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${soundEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Partner portals */}
              <div className="p-3 rounded-2xl bg-wall border border-line space-y-2 text-ink">
                <div className="text-xs font-bold">Partner portals (demo):</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPartnerMode('museum');
                      setShowSettings(false);
                    }}
                    className="flex-1 py-2 px-2 rounded-xl bg-card border border-line text-teal font-bold text-[10px] flex items-center justify-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" /> Museum portal
                  </button>
                  <button
                    onClick={() => {
                      setPartnerMode('business');
                      setShowSettings(false);
                    }}
                    className="flex-1 py-2 px-2 rounded-xl bg-card border border-line text-vermilion font-bold text-[10px] flex items-center justify-center gap-1"
                  >
                    <Coffee className="w-3.5 h-3.5" /> Shop portal
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSettings(false);
                  onOpenOnboarding();
                }}
                className="w-full py-2.5 rounded-xl bg-card border border-line text-ink font-bold text-xs"
              >
                Replay welcome
              </button>

              <button
                onClick={handleResetData}
                className="w-full py-2.5 rounded-xl bg-vermilion-soft border border-vermilion/40 text-vermilion font-bold text-xs"
              >
                Reset demo progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
