import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuestType } from '../../types';
import { Clock, Play, MapPin, Check, ListChecks, Bookmark, Sparkles } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

const TYPE_LABEL: Record<string, string> = {
  scavenger: 'Scavenger hunt',
  trivia: 'Trivia',
  photo: 'Photo hunt',
  route: 'Trail',
};

export const QuestsView: React.FC = () => {
  const {
    quests,
    completedQuestIds,
    bookmarkedQuestIds,
    toggleBookmarkQuest,
    venues,
    setActivePlayingQuest,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bookmarked' | 'completed'>('bookmarked');
  const [typeFilter, setTypeFilter] = useState<'All' | QuestType>('All');

  const displayedQuests = quests.filter((q) => {
    const isDone = completedQuestIds.includes(q.id);
    const isBookmarked = bookmarkedQuestIds.includes(q.id);
    if (activeTab === 'bookmarked' && !isBookmarked) return false;
    if (activeTab === 'completed' && !isDone) return false;
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
          Save missions to try them, or look back at the ones you've finished.
        </p>
      </div>

      {/* Tabs: Bookmarked / Completed */}
      <div className="flex rounded-full bg-card p-1 border border-line">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('bookmarked');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
            activeTab === 'bookmarked' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          Bookmarked ({bookmarkedQuestIds.length})
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
            const isBookmarked = bookmarkedQuestIds.includes(quest.id);

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

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCompleted ? (
                        <span className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      ) : (
                        <div className="text-right">
                          <div className="text-sm font-bold text-vermilion font-mono">+{quest.pointsReward} pts</div>
                          <div className="text-[10px] text-muted font-mono">+{quest.xpReward} XP</div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          triggerHaptic('light');
                          toggleBookmarkQuest(quest.id);
                        }}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark quest'}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition active:scale-90 ${
                          isBookmarked
                            ? 'bg-gold-soft border-gold text-[#8A6A10]'
                            : 'bg-wall border-line text-muted hover:text-ink'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-gold text-gold' : ''}`} />
                      </button>
                    </div>
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
          <div className="py-12 px-6 text-center">
            <Sparkles className="w-6 h-6 text-muted mx-auto mb-2" />
            <p className="text-xs text-muted leading-relaxed">
              {activeTab === 'bookmarked'
                ? 'Nothing bookmarked yet. Open a venue on the map and tap the bookmark on a quest to save it here.'
                : 'Nothing completed yet. Start a quest from a venue or the featured challenge on Home.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
