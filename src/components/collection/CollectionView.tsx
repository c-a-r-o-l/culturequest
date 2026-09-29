import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CollectibleCard, CardRarity } from '../../types';
import { Sparkles, BookOpen, Lock, RotateCw, Share2, Scroll, Feather, X } from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

export const CollectionView: React.FC = () => {
  const { collectibles, collectedCardIds, venues, activeInspectCard, setActiveInspectCard } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'sets'>('cards');
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
        return 'bg-[#6B1D23] text-[#E2CA8E] border-[#B89758] font-bold shadow-[0_0_10px_rgba(184,151,88,0.4)]';
      case 'Epic':
        return 'bg-[#1C3A27] text-[#FAF8F5] border-[#B89758] font-bold';
      case 'Rare':
        return 'bg-[#1F4E5B] text-[#FAF8F5] border-[#B89758]/60 font-bold';
      case 'Common':
        return 'bg-[#2D2A26] text-[#D1C7B7] border-[#8C6E30]';
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F5] font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#B89758]" />
            <span>The Vault</span>
          </h1>
          <p className="text-xs text-[#D1C7B7] font-body italic mt-0.5">
            Archival repository of rare folios, illuminated plates, and historic relics.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-right">
          <div className="text-xs font-mono font-bold text-[#E2CA8E]">
            {collectedCount}/{collectibles.length}
          </div>
          <div className="text-[8px] text-[#A6BAAE] uppercase tracking-widest font-display">Inscribed</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex rounded-2xl bg-[#1C3A27] p-1 border border-[#B89758]/60">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('cards');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition ${
            activeSubTab === 'cards'
              ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]'
              : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          Special Folios
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('sets');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition ${
            activeSubTab === 'sets'
              ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]'
              : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          Cantabrigia Collections
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
              className={`px-3 py-1 rounded-xl text-[10px] font-display font-bold uppercase tracking-wider whitespace-nowrap transition ${
                selectedRarity === r
                  ? 'bg-[#6B1D23] text-[#FAF8F5] border border-[#B89758]'
                  : 'bg-[#1C3A27] text-[#879B8E] border border-[#B89758]/40 hover:text-[#FAF8F5]'
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
                    ? 'parchment-card border-[#B89758] hover:border-[#E2CA8E] active:scale-98 shadow-md'
                    : 'bg-[#142018] border-[#1C3A27] opacity-60 cursor-default'
                }`}
              >
                {/* Rarity Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[8px] uppercase tracking-wider px-2 py-0.2 rounded-md border font-display ${getRarityBadgeStyle(
                      card.rarity
                    )}`}
                  >
                    {card.rarity}
                  </span>
                  <span className="text-[10px] font-mono text-[#544431] font-bold">
                    #{card.collectorNumber}/{card.totalInSet}
                  </span>
                </div>

                {/* Card Artwork / Silhouette */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#1C3A27] border border-[#B89758]/50 mb-2">
                  {isUnlocked ? (
                    <>
                      <img src={card.image} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      {card.rarity === 'Legendary' && (
                        <div className="absolute inset-0 border-2 border-[#B89758] pointer-events-none" />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#121A15] text-[#879B8E]">
                      <Lock className="w-6 h-6 mb-1 text-[#546B5A]" />
                      <span className="text-[9px] font-display font-bold text-[#879B8E]">Archived Relic</span>
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div>
                  <h4 className={`text-xs font-bold truncate ${isUnlocked ? 'text-[#1C3A27] font-display' : 'text-[#879B8E]'}`}>
                    {isUnlocked ? card.name : 'Unknown Folio'}
                  </h4>
                  <p className="text-[10px] text-[#544431] font-body italic truncate mt-0.5">
                    {isUnlocked ? venue?.name : `Matriculate at ${venue?.name}`}
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
              <div key={setId} className="p-4 rounded-3xl parchment-card border border-[#B89758] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#1C3A27] font-display">{setObj.name}</h3>
                    <p className="text-[11px] text-[#4A5D50] font-body italic mt-0.5">
                      Set completion unlocks: +250 XP & Fellowship Title
                    </p>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isComplete
                        ? 'bg-[#1C3A27] border-[#B89758] text-[#E2CA8E]'
                        : 'bg-[#6B1D23] border-[#B89758] text-[#FAF8F5]'
                    }`}
                  >
                    {unlockedInSet}/{setObj.cards.length}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {setObj.cards.map((c) => {
                    const isUnlocked = collectedCardIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`aspect-square rounded-xl overflow-hidden border ${
                          isUnlocked ? 'border-2 border-[#B89758]' : 'border border-[#B89758]/30 opacity-40 bg-[#121A15]'
                        }`}
                      >
                        {isUnlocked ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#546B5A]">
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

      {/* 3D PARCHMENT FLIP CARD INSPECT MODAL */}
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
                className="w-8 h-8 rounded-full bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] flex items-center justify-center hover:text-white"
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
                className={`relative w-full h-full rounded-3xl transition-transform duration-700 transform-style-3d shadow-[0_12px_40px_rgba(0,0,0,0.85)] ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE (Illuminated Manuscript) */}
                <div className="absolute inset-0 backface-hidden rounded-3xl parchment-card border-2 border-[#B89758] p-4 flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] uppercase font-display font-bold px-2 py-0.5 rounded border ${getRarityBadgeStyle(activeInspectCard.rarity)}`}>
                      {activeInspectCard.rarity}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#6B1D23]">
                      {activeInspectCard.originDate}
                    </span>
                  </div>

                  <div className="my-auto rounded-2xl overflow-hidden aspect-[4/3] border-2 border-[#B89758] shadow-inner">
                    <img src={activeInspectCard.image} alt={activeInspectCard.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1C3A27] font-display">{activeInspectCard.name}</h3>
                    <p className="text-xs font-body italic text-[#4A5D50]">{activeInspectCard.setName}</p>
                    <div className="mt-2 pt-2 border-t border-[#B89758]/30 flex items-center justify-between text-[11px] text-[#544431]">
                      <span className="font-mono">Folio #{activeInspectCard.collectorNumber} of {activeInspectCard.totalInSet}</span>
                      <span className="text-[#6B1D23] font-bold font-display flex items-center gap-1">
                        <RotateCw className="w-3 h-3" /> Turn page
                      </span>
                    </div>
                  </div>
                </div>

                {/* BACK FACE (Archival Lore & Notes) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl bg-[#1C3A27] border-2 border-[#B89758] p-5 flex flex-col justify-between text-left text-[#FAF8F5]">
                  <div>
                    <span className="text-[10px] font-bold font-display uppercase tracking-widest text-[#E2CA8E]">
                      Archival Transcript & Lore
                    </span>
                    <h3 className="text-base font-bold text-[#FAF8F5] font-display mt-1">{activeInspectCard.name}</h3>
                    <div className="mt-4 p-3.5 rounded-2xl parchment-card border border-[#B89758] text-xs font-body leading-relaxed text-[#1C3A27]">
                      📜 "{activeInspectCard.funFact}"
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-[#B89758]/40 pt-3 text-xs font-body">
                    <div>
                      <strong className="text-[#E2CA8E] font-display">Archival Repository:</strong>{' '}
                      {venues.find((v) => v.id === activeInspectCard.venueId)?.name}
                    </div>
                    <div>
                      <strong className="text-[#E2CA8E] font-display">Era:</strong> {activeInspectCard.originDate}
                    </div>
                    <div className="text-right text-[10px] text-[#E2CA8E] font-display flex items-center justify-end gap-1 pt-1">
                      <RotateCw className="w-3 h-3" /> Turn back to front
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Share to social button */}
            <div className="w-full mt-4 flex gap-2">
              <button
                onClick={handleShareStory}
                className="flex-1 py-3 rounded-2xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <Share2 className="w-4 h-4 text-[#E2CA8E]" />
                <span>{shareSuccess ? 'Scholarly Folio Copied!' : 'Share Folio Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
