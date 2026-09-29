import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CollectibleCard, CardRarity } from '../../types';
import { BookOpen, Lock, RotateCw, Share2, X } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

const RARITY_STYLE: Record<CardRarity, string> = {
  Legendary: 'bg-gold-soft text-[#8A6A10] border-gold',
  Epic: 'bg-vermilion-soft text-vermilion border-vermilion',
  Rare: 'bg-teal-soft text-teal border-teal',
  Common: 'bg-wall text-muted border-line',
};

export const CollectionView: React.FC = () => {
  const { collectibles, collectedCardIds, venues, activeInspectCard, setActiveInspectCard } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'sets'>('cards');
  const [selectedRarity, setSelectedRarity] = useState<'All' | CardRarity>('All');
  const [isFlipped, setIsFlipped] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Group into sets
  const setsMap = collectibles.reduce<{ [setId: string]: { name: string; cards: CollectibleCard[] } }>((acc, card) => {
    if (!acc[card.setId]) {
      acc[card.setId] = { name: card.setName, cards: [] };
    }
    acc[card.setId].cards.push(card);
    return acc;
  }, {});

  const filteredCards = collectibles.filter((c) => {
    if (selectedRarity !== 'All' && c.rarity !== selectedRarity) return false;
    return true;
  });

  const collectedCount = collectibles.filter((c) => collectedCardIds.includes(c.id)).length;

  const handleOpenCard = (card: CollectibleCard) => {
    triggerHaptic('light');
    sound.playCardDrop();
    setIsFlipped(false);
    setActiveInspectCard(card);
  };

  const handleShareStory = async () => {
    triggerHaptic('light');
    if (!activeInspectCard) return;
    if (navigator.share) {
      navigator
        .share({ title: activeInspectCard.name, text: activeInspectCard.funFact })
        .catch(() => {});
    } else {
      try {
        await navigator.clipboard.writeText(`${activeInspectCard.name}: ${activeInspectCard.funFact}`);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal" />
            Collection
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Cards you've found by visiting venues and finishing quests.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-2xl bg-card border border-line text-right">
          <div className="text-xs font-mono font-bold text-teal">
            {collectedCount}/{collectibles.length}
          </div>
          <div className="text-[8px] text-muted uppercase tracking-widest font-bold">Found</div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex rounded-full bg-card p-1 border border-line">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('cards');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
            activeSubTab === 'cards' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          Cards
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('sets');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
            activeSubTab === 'sets' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          Sets
        </button>
      </div>

      {/* Rarity filter */}
      {activeSubTab === 'cards' && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                triggerHaptic('light');
                setSelectedRarity(r);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition border ${
                selectedRarity === r
                  ? 'bg-ink text-wall border-ink'
                  : 'bg-card text-muted border-line hover:border-muted'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Cards grid */}
      {activeSubTab === 'cards' && (
        <div className="grid grid-cols-2 gap-3">
          {filteredCards.map((card) => {
            const isUnlocked = collectedCardIds.includes(card.id);
            const venue = venues.find((v) => v.id === card.venueId);

            return (
              <button
                key={card.id}
                onClick={() => {
                  if (isUnlocked) handleOpenCard(card);
                }}
                className={`group relative rounded-3xl p-3 border text-left flex flex-col justify-between transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-card border-line hover:border-gold active:scale-[0.98] shadow-sm'
                    : 'bg-wall border-line/70 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md border font-bold ${RARITY_STYLE[card.rarity]}`}>
                    {card.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-muted font-bold">
                    #{card.collectorNumber}/{card.totalInSet}
                  </span>
                </div>

                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-wall border border-line mb-2">
                  {isUnlocked ? (
                    <>
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      {card.rarity === 'Legendary' && <div className="absolute inset-0 border-2 border-gold pointer-events-none" />}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-muted">
                      <Lock className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[9px] font-bold">Visit to unlock</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className={`text-xs font-bold truncate ${isUnlocked ? 'text-ink font-display' : 'text-muted'}`}>
                    {isUnlocked ? card.name : 'Mystery card'}
                  </h4>
                  <p className="text-[10px] text-muted truncate mt-0.5">
                    {isUnlocked ? venue?.name : `Found at ${venue?.name}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Sets view */}
      {activeSubTab === 'sets' && (
        <div className="space-y-3">
          {Object.entries(setsMap).map(([setId, setObj]) => {
            const unlockedInSet = setObj.cards.filter((c) => collectedCardIds.includes(c.id)).length;
            const isComplete = unlockedInSet === setObj.cards.length;

            return (
              <div key={setId} className="p-4 rounded-3xl bg-card border border-line space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink font-display">{setObj.name}</h3>
                    <p className="text-[11px] text-muted mt-0.5">Complete the set for +250 XP</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${isComplete ? 'bg-teal-soft border-teal text-teal' : 'bg-gold-soft border-gold text-[#8A6A10]'}`}>
                    {unlockedInSet}/{setObj.cards.length}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {setObj.cards.map((c) => {
                    const isUnlocked = collectedCardIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`aspect-square rounded-xl overflow-hidden border ${isUnlocked ? 'border-2 border-gold' : 'border-line opacity-50 bg-wall'}`}
                      >
                        {isUnlocked ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3D flip inspect */}
      {activeInspectCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-full flex justify-end mb-2">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setActiveInspectCard(null);
                }}
                className="w-8 h-8 rounded-full bg-card border border-line text-muted flex items-center justify-center hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => {
                triggerHaptic('light');
                sound.playCardDrop();
                setIsFlipped(!isFlipped);
              }}
              className="w-full aspect-[3/4.2] perspective-1000 cursor-pointer"
            >
              <div
                className={`relative w-full h-full rounded-3xl transition-transform duration-700 transform-style-3d shadow-[0_16px_50px_rgba(0,0,0,0.3)] ${isFlipped ? 'rotate-y-180' : ''}`}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-3xl bg-card border-2 border-line p-4 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${RARITY_STYLE[activeInspectCard.rarity]}`}>
                      {activeInspectCard.rarity}
                    </span>
                    <span className="text-xs font-mono font-bold text-muted">{activeInspectCard.originDate}</span>
                  </div>

                  <div className="my-auto rounded-2xl overflow-hidden aspect-[4/3] border-2 border-line">
                    <img src={activeInspectCard.image} alt={activeInspectCard.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-ink font-display">{activeInspectCard.name}</h3>
                    <p className="text-xs text-muted">{activeInspectCard.setName}</p>
                    <div className="mt-2 pt-2 border-t border-line flex items-center justify-between text-[11px] text-muted">
                      <span className="font-mono">Card {activeInspectCard.collectorNumber} of {activeInspectCard.totalInSet}</span>
                      <span className="text-teal font-bold flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Tap to flip
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-teal border-2 border-teal p-5 flex flex-col justify-between text-left text-white">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-soft">
                      Did you know?
                    </span>
                    <h3 className="text-base font-black mt-1 font-display">{activeInspectCard.name}</h3>
                    <div className="mt-4 p-3.5 rounded-2xl bg-white/95 text-xs leading-relaxed text-ink">
                      {activeInspectCard.funFact}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-white/30 pt-3 text-xs">
                    <div>
                      <strong className="text-teal-soft">Found at:</strong>{' '}
                      {venues.find((v) => v.id === activeInspectCard.venueId)?.name}
                    </div>
                    <div>
                      <strong className="text-teal-soft">Date:</strong> {activeInspectCard.originDate}
                    </div>
                    <div className="text-right text-[10px] text-white/80 flex items-center justify-end gap-1 pt-1">
                      <RotateCw className="w-3 h-3" /> Tap to flip back
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="w-full mt-4">
              <button
                onClick={handleShareStory}
                className="w-full py-3 rounded-2xl bg-vermilion text-white font-bold text-sm shadow-[0_4px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{shareSuccess ? 'Copied to clipboard!' : 'Share this card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
