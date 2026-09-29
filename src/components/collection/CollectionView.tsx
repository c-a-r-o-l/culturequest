import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CollectibleCard, CardRarity } from '../../types';
import { Sparkles, Layers, Lock, RotateCw, Share2, Award, CheckCircle2, X } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

export const CollectionView: React.FC = () => {
  const { collectibles, collectedCardIds, venues, activeInspectCard, setActiveInspectCard } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'sets' | 'stamps'>('cards');
  const [selectedRarity, setSelectedRarity] = useState<'All' | CardRarity>('All');
  const [isFlipped, setIsFlipped] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Group into Sets
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

  const handleShareStory = () => {
    triggerHaptic('light');
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  const getRarityBadgeStyle = (rarity: CardRarity) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border-amber-300';
      case 'Epic':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold border-purple-400';
      case 'Rare':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold border-cyan-400';
      case 'Common':
        return 'bg-slate-700 text-slate-200 font-semibold border-slate-600';
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>Artefact Album</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Your digital Cambridge cultural collection.</p>
        </div>

        <div className="px-3 py-1.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-right">
          <div className="text-xs font-black text-amber-400">
            {collectedCount}/{collectibles.length}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Collected</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('cards');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeSubTab === 'cards' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Artefact Cards
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('sets');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeSubTab === 'sets' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sets & Collections
        </button>
      </div>

      {/* Rarity filter pills */}
      {activeSubTab === 'cards' && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Legendary', 'Epic', 'Rare', 'Common'] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                triggerHaptic('light');
                setSelectedRarity(r);
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition ${
                selectedRarity === r
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* CARDS GRID */}
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
                    ? 'bg-gradient-to-b from-slate-900 to-indigo-950/60 border-indigo-500/40 hover:border-amber-400 shadow-md active:scale-98'
                    : 'bg-slate-950/90 border-slate-800/80 opacity-60 cursor-default'
                }`}
              >
                {/* Rarity Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(
                      card.rarity
                    )}`}
                  >
                    {card.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    #{card.collectorNumber}/{card.totalInSet}
                  </span>
                </div>

                {/* Card Artwork / Silhouette */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-800/90 border border-slate-700/50 mb-2">
                  {isUnlocked ? (
                    <>
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      {card.rarity === 'Legendary' && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-rose-500/20 pointer-events-none" />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900 text-slate-500">
                      <Lock className="w-6 h-6 mb-1 text-slate-600" />
                      <span className="text-[9px] font-bold text-slate-400">Locked Artefact</span>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div>
                  <h4 className="text-xs font-black text-white truncate">
                    {isUnlocked ? card.name : 'Hidden Relic'}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {isUnlocked ? venue?.name : `Visit ${venue?.name} to unlock`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* SETS VIEW */}
      {activeSubTab === 'sets' && (
        <div className="space-y-3">
          {Object.entries(setsMap).map(([setId, setObj]) => {
            const unlockedInSet = setObj.cards.filter((c) => collectedCardIds.includes(c.id)).length;
            const isComplete = unlockedInSet === setObj.cards.length;

            return (
              <div key={setId} className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">{setObj.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Set completion unlocks: +250 XP bonus & exclusive avatar title
                    </p>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                      isComplete
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-amber-300'
                    }`}
                  >
                    {unlockedInSet}/{setObj.cards.length}
                  </span>
                </div>

                {/* Mini cards preview row */}
                <div className="grid grid-cols-4 gap-2">
                  {setObj.cards.map((c) => {
                    const isUnlocked = collectedCardIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`aspect-square rounded-xl overflow-hidden border ${
                          isUnlocked ? 'border-amber-400' : 'border-slate-800 opacity-40 bg-slate-950'
                        }`}
                      >
                        {isUnlocked ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
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

      {/* 3D FLIP CARD INSPECT MODAL */}
      {activeInspectCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Close button */}
            <div className="w-full flex justify-end mb-2">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setActiveInspectCard(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => {
                triggerHaptic('light');
                sound.playCardDrop();
                setIsFlipped(!isFlipped);
              }}
              className="w-full aspect-[3/4.2] perspective-1000 cursor-pointer"
            >
              <div
                className={`relative w-full h-full rounded-3xl transition-transform duration-700 transform-style-3d shadow-[0_10px_35px_rgba(0,0,0,0.8)] ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE */}
                <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-2 border-amber-400/80 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${getRarityBadgeStyle(activeInspectCard.rarity)}`}>
                      {activeInspectCard.rarity}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {activeInspectCard.originDate}
                    </span>
                  </div>

                  <div className="my-auto rounded-2xl overflow-hidden aspect-[4/3] border border-amber-400/40 shadow-inner">
                    <img src={activeInspectCard.image} alt={activeInspectCard.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white font-['Outfit']">{activeInspectCard.name}</h3>
                    <p className="text-xs text-amber-300/90 font-medium mt-0.5">{activeInspectCard.setName}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Card #{activeInspectCard.collectorNumber} of {activeInspectCard.totalInSet}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Tap to flip
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-indigo-400/80 p-5 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                      Museum Lore & Facts
                    </span>
                    <h3 className="text-base font-black text-white mt-1">{activeInspectCard.name}</h3>
                    <div className="mt-4 p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-indigo-100 leading-relaxed">
                      💡 "{activeInspectCard.funFact}"
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <div className="text-[11px] text-slate-300">
                      <strong>Affiliation:</strong> {venues.find((v) => v.id === activeInspectCard.venueId)?.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong>Era:</strong> {activeInspectCard.originDate}
                    </div>
                    <div className="text-right text-[10px] text-amber-400 font-semibold flex items-center justify-end gap-1">
                      <RotateCw className="w-3 h-3" /> Tap to flip back
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share to social button */}
            <div className="w-full mt-4 flex gap-2">
              <button
                onClick={handleShareStory}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{shareSuccess ? 'Story Card Copied!' : 'Share to Instagram / TikTok'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
