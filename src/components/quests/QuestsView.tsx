import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quest, QuestType } from '../../types';
import { Clock, Play, MapPin, Zap, Check, ListChecks, Sparkles } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

const TYPE_LABEL: Record<string, string> = {
  scavenger: 'Scavenger hunt',
  trivia: 'Trivia',
  photo: 'Photo hunt',
  route: 'Trail',
  daily: 'Daily quest',
};

export const QuestsView: React.FC = () => {
  const { quests, completedQuestIds, venues, setActivePlayingQuest } = useApp();

  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');
  const [typeFilter, setTypeFilter] = useState<'All' | QuestType>('All');

  const dailyQuest = quests.find((q) => q.isDaily);

  const displayedQuests = quests.filter((q) => {
    const isDone = completedQuestIds.includes(q.id);
    if (activeTab === 'completed' && !isDone) return false;
    if (activeTab === 'available' && isDone) return false;
    if (typeFilter !== 'All' && q.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-ink font-display flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-vermilion" />
          Quests
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Missions at museums and culture spots. Finish one to earn points you can spend on rewards.
        </p>
      </div>

      {/* Daily quest highlight */}
      {dailyQuest && (
        <div className="ticket rounded-3xl border-2 border-gold overflow-visible relative shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#8A6A10] bg-gold-soft px-2.5 py-0.5 rounded-full">
                <Zap className="w-3 h-3 fill-gold text-gold" /> Daily Quest
              </span>
              <span className="text-[10px] text-muted font-mono">Resets tomorrow</span>
            </div>

            <h3 className="text-base font-bold text-ink font-display mt-2">{dailyQuest.title}</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">{dailyQuest.description}</p>
          </div>

          <div className="ticket-perf" />

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gold font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> +{dailyQuest.pointsReward} pts
              </span>
              <span className="text-muted">•</span>
              <span className="text-muted text-[11px]">~{dailyQuest.estimatedMinutes} min</span>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                sound.playCoin();
                setActivePlayingQuest(dailyQuest);
              }}
              className={`px-4 py-2 rounded-full font-bold text-xs transition active:scale-95 ${
                completedQuestIds.includes(dailyQuest.id)
                  ? 'bg-teal-soft text-teal'
                  : 'bg-vermilion text-white shadow-[0_3px_0_rgba(0,0,0,0.12)]'
              }`}
            >
              {completedQuestIds.includes(dailyQuest.id) ? 'Done ✓' : 'Start'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs: Available / Completed */}
      <div className="flex rounded-full bg-card p-1 border border-line">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('available');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
            activeTab === 'available' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          Open ({quests.length - completedQuestIds.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('completed');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
            activeTab === 'completed' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          Completed ({completedQuestIds.length})
        </button>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['All', 'scavenger', 'trivia', 'photo', 'route'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              triggerHaptic('light');
              setTypeFilter(type);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition border ${
              typeFilter === type
                ? 'bg-vermilion-soft text-vermilion border-vermilion'
                : 'bg-card text-muted border-line hover:border-muted'
            }`}
          >
            {type === 'All' ? 'All types' : TYPE_LABEL[type]}
          </button>
        ))}
      </div>

      {/* Quest tickets */}
      <div className="space-y-3">
        {displayedQuests.length > 0 ? (
          displayedQuests.map((quest) => {
            const venue = venues.find((v) => v.id === quest.venueId);
            const isCompleted = completedQuestIds.includes(quest.id);

            return (
              <div key={quest.id} className={`ticket rounded-3xl border border-line shadow-sm ${isCompleted ? 'opacity-80' : ''}`}>
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold mb-1">
                        <span className="font-bold px-2 py-0.5 rounded-full bg-vermilion-soft text-vermilion uppercase tracking-wider">
                          {TYPE_LABEL[quest.type] || quest.type}
                        </span>
                        <span className="text-muted">{quest.difficulty}</span>
                        <span className="text-muted flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {quest.estimatedMinutes}m
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-ink font-display">{quest.title}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                        <MapPin className="w-3 h-3 text-vermilion shrink-0" />
                        <span className="truncate">{venue?.name}</span>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </span>
                    ) : (
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-vermilion font-mono">+{quest.pointsReward} pts</div>
                        <div className="text-[10px] text-muted font-mono">+{quest.xpReward} XP</div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted leading-relaxed">{quest.description}</p>

                  {quest.expiresIn && (
                    <div className="text-[10px] text-vermilion font-mono font-bold">⏳ Ends: {quest.expiresIn}</div>
                  )}
                </div>

                <div className="ticket-perf" />

                <div className="p-4 flex items-center justify-between">
                  <span className="text-[11px] text-muted font-mono">
                    {quest.steps.length} {quest.steps.length === 1 ? 'step' : 'steps'}
                  </span>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      sound.playCoin();
                      setActivePlayingQuest(quest);
                    }}
                    className={`px-4 py-2 rounded-full font-bold text-xs transition active:scale-95 flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-teal-soft text-teal'
                        : 'bg-vermilion text-white shadow-[0_3px_0_rgba(0,0,0,0.12)]'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Done</span>
                    ) : (
                      <span className="flex items-center gap-1"><Play className="w-3 h-3 fill-current" /> Start</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-muted text-xs">
            {activeTab === 'available'
              ? 'All quests complete! Check the map for more venues.'
              : 'No completed quests yet. Start one from the Quests tab or the map.'}
          </div>
        )}
      </div>

    </div>
  );
};
