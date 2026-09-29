import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quest, QuestType } from '../../types';
import { Sparkles, Clock, Play, CheckCircle2, Flame, MapPin, Zap } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';
import { QuestPlayModal } from './QuestPlayModal';

export const QuestsView: React.FC = () => {
  const { quests, completedQuestIds, venues, activePlayingQuest, setActivePlayingQuest } = useApp();

  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [typeFilter, setTypeFilter] = useState<'All' | QuestType>('All');

  // Daily quest
  const dailyQuest = quests.find((q) => q.isDaily);

  const displayedQuests = quests.filter((q) => {
    const isDone = completedQuestIds.includes(q.id);
    if (activeTab === 'completed' && !isDone) return false;
    if (activeTab === 'available' && isDone) return false;

    if (typeFilter !== 'All' && q.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <span>Cultural Quests</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Solve exhibition mysteries, conquer museum trails, and earn rare card drops.
        </p>
      </div>

      {/* Daily Quest Highlight Banner */}
      {dailyQuest && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-rose-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              <Flame className="w-3 h-3 fill-rose-400" /> Daily Quick Dose
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Resets in 14h</span>
          </div>

          <h3 className="text-base font-black text-white mt-2">{dailyQuest.title}</h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">{dailyQuest.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-amber-400 font-black">+{dailyQuest.pointsReward} pts</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 text-[11px]">{dailyQuest.estimatedMinutes}m quick test</span>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                sound.playCoin();
                setActivePlayingQuest(dailyQuest);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-[0_2px_0_#b45309] active:translate-y-0.5 transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{completedQuestIds.includes(dailyQuest.id) ? 'Play Again' : 'Start Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs: Available / Completed */}
      <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('available');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'available'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Available Quests ({quests.length - completedQuestIds.length})
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('completed');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'completed'
              ? 'bg-amber-400 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Completed ({completedQuestIds.length})
        </button>
      </div>

      {/* Filter by quest type */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['All', 'scavenger', 'trivia', 'photo', 'route'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              triggerHaptic('light');
              setTypeFilter(type);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
              typeFilter === type
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {type === 'All' ? 'All Types' : type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {displayedQuests.length > 0 ? (
          displayedQuests.map((quest) => {
            const venue = venues.find((v) => v.id === quest.venueId);
            const isCompleted = completedQuestIds.includes(quest.id);

            return (
              <div
                key={quest.id}
                className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                      <span className="font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 uppercase tracking-tight">
                        {quest.type}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold">
                        {quest.difficulty}
                      </span>
                      <span>• {quest.estimatedMinutes} mins</span>
                    </div>

                    <h3 className="text-sm font-black text-white">{quest.title}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{venue?.name}</span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                  ) : (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-amber-400">+{quest.pointsReward} pts</div>
                      <div className="text-[10px] text-slate-400">+{quest.xpReward} XP</div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{quest.description}</p>

                {quest.expiresIn && (
                  <div className="text-[10px] text-rose-400 font-semibold">⏳ {quest.expiresIn}</div>
                )}

                <div className="pt-1 flex items-center justify-between border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">{quest.steps.length} interactive steps</span>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      sound.playCoin();
                      setActivePlayingQuest(quest);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow active:translate-y-0.5 transition flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>{isCompleted ? 'Replay Quest' : 'Start Quest'}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No quests match this filter. Try selecting "All Types"!
          </div>
        )}
      </div>

      {/* Quest Player Modal */}
      {activePlayingQuest && (
        <QuestPlayModal quest={activePlayingQuest} onClose={() => setActivePlayingQuest(null)} />
      )}
    </div>
  );
};
