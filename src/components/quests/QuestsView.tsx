import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quest, QuestType } from '../../types';
import { Clock, Play, MapPin, Zap, Scroll, BookOpen, Feather } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';
import { QuestPlayModal } from './QuestPlayModal';

export const QuestsView: React.FC = () => {
  const { quests, completedQuestIds, venues, activePlayingQuest, setActivePlayingQuest } = useApp();

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
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#FAF8F5] font-display flex items-center gap-2">
          <Scroll className="w-6 h-6 text-[#B89758]" />
          <span>Chronicles & Treatises</span>
        </h1>
        <p className="text-xs text-[#D1C7B7] font-body italic mt-0.5">
          Archival scavenger hunts, mathematical enigmas, and exhibition trails.
        </p>
      </div>

      {/* Daily Quest Highlight Banner */}
      {dailyQuest && (
        <div className="p-4 rounded-3xl bg-[#1C3A27] border-2 border-[#B89758] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[9px] font-display font-bold uppercase tracking-widest text-[#E2CA8E] bg-[#122419] px-2.5 py-0.5 rounded-full border border-[#B89758]/50">
              <Zap className="w-3 h-3 text-[#E2CA8E] fill-[#E2CA8E]" /> Daily Scholar Treat
            </span>
            <span className="text-[10px] text-[#A6BAAE] font-mono">Cycle resets in 14h</span>
          </div>

          <h3 className="text-base font-bold text-[#FAF8F5] font-display mt-2">{dailyQuest.title}</h3>
          <p className="text-xs text-[#D1C7B7] font-body mt-1 line-clamp-2 leading-relaxed">{dailyQuest.description}</p>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#B89758]/30">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#E2CA8E] font-mono font-bold">+{dailyQuest.pointsReward} pts</span>
              <span className="text-[#879B8E]">•</span>
              <span className="text-[#D1C7B7] text-[11px] font-body">{dailyQuest.estimatedMinutes}m reading</span>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                sound.playCoin();
                setActivePlayingQuest(dailyQuest);
              }}
              className="px-4 py-2 rounded-xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5 text-[#E2CA8E]" />
              <span>{completedQuestIds.includes(dailyQuest.id) ? 'Review' : 'Decipher'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tabs: Available / Completed */}
      <div className="flex rounded-2xl bg-[#1C3A27] p-1 border border-[#B89758]/60">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('available');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition ${
            activeTab === 'available'
              ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]'
              : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          Open Inquiries ({quests.length - completedQuestIds.length})
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('completed');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition ${
            activeTab === 'completed'
              ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]'
              : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          Deciphered ({completedQuestIds.length})
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
            className={`px-3 py-1 rounded-xl text-[10px] font-display font-bold uppercase tracking-wider whitespace-nowrap transition ${
              typeFilter === type
                ? 'bg-[#6B1D23] text-[#FAF8F5] border border-[#B89758]'
                : 'bg-[#1C3A27] text-[#879B8E] border border-[#B89758]/40 hover:text-[#FAF8F5]'
            }`}
          >
            {type === 'All' ? 'All Treatises' : type}
          </button>
        ))}
      </div>

      {/* Quests List (Parchment Manuscript Cards) */}
      <div className="space-y-3">
        {displayedQuests.length > 0 ? (
          displayedQuests.map((quest) => {
            const venue = venues.find((v) => v.id === quest.venueId);
            const isCompleted = completedQuestIds.includes(quest.id);

            return (
              <div
                key={quest.id}
                className="p-4 rounded-3xl parchment-card border border-[#B89758]/60 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#544431] font-mono mb-1">
                      <span className="font-bold px-2 py-0.2 rounded bg-[#1C3A27] text-[#E2CA8E] uppercase tracking-wider font-display">
                        {quest.type}
                      </span>
                      <span className="font-semibold text-[#6B1D23]">{quest.difficulty}</span>
                      <span>• {quest.estimatedMinutes} mins</span>
                    </div>

                    <h3 className="text-sm font-bold text-[#1C3A27] font-display">{quest.title}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-[#544431] font-body italic mt-0.5">
                      <MapPin className="w-3 h-3 text-[#6B1D23]" />
                      <span>{venue?.name}</span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <span className="w-8 h-8 rounded-full bg-[#1C3A27] text-[#E2CA8E] flex items-center justify-center font-bold text-xs shrink-0 border border-[#B89758]">
                      ✓
                    </span>
                  ) : (
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#6B1D23] font-mono">+{quest.pointsReward} pts</div>
                      <div className="text-[10px] text-[#544431] font-mono">+{quest.xpReward} XP</div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#304135] font-body leading-relaxed">{quest.description}</p>

                {quest.expiresIn && (
                  <div className="text-[10px] text-[#6B1D23] font-mono font-bold">⏳ Term ends: {quest.expiresIn}</div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-[#B89758]/30">
                  <span className="text-[11px] text-[#544431] font-mono">{quest.steps.length} marginalia steps</span>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      sound.playCoin();
                      setActivePlayingQuest(quest);
                    }}
                    className="px-4 py-2 rounded-xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-[#FAF8F5]" />
                    <span>{isCompleted ? 'Review' : 'Begin'}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-[#879B8E] text-xs font-display">
            No manuscripts found in this archive index.
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
