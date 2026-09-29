import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExplorerClass } from '../../types';
import { MapPin, Ticket, Gift, Check, ArrowRight, Ticket as TicketIcon } from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

const EXPLORER_CLASSES: { id: ExplorerClass; title: string; desc: string; icon: string }[] = [
  { id: 'Curator', title: 'Curator', desc: 'Arts & antiquities', icon: '🏛️' },
  { id: 'Historian', title: 'Historian', desc: 'History & heritage', icon: '📜' },
  { id: 'Wanderer', title: 'Wanderer', desc: 'A bit of everything', icon: '🧭' },
  { id: 'Detective', title: 'Detective', desc: 'Puzzles & clues', icon: '🔍' },
];

const AVATAR_OPTIONS = ['🧭', '📜', '🦁', '🦉', '🎨', '🔬', '🏛️', '👑', '⚡'];

export const OnboardingFlow: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<'welcome' | 'profile'>('welcome');

  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ExplorerClass>('Wanderer');
  const [selectedAvatar, setSelectedAvatar] = useState('🧭');

  const handleFinish = () => {
    completeOnboarding({
      name: name.trim() || 'Explorer',
      explorerClass: selectedClass,
      interests: ['Art', 'History', 'Science'],
      avatar: selectedAvatar,
    });
    if (onFinish) onFinish();
  };

  // 1. Welcome
  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 bg-wall flex flex-col items-center justify-between p-6 text-center overflow-hidden">
        <div className="absolute top-[-120px] right-[-120px] w-80 h-80 bg-gold-soft rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-100px] w-72 h-72 bg-teal-soft rounded-full blur-[60px] pointer-events-none" />

        <div className="pt-14 flex flex-col items-center relative">
          <div className="w-20 h-20 rounded-3xl bg-vermilion border-2 border-ink shadow-[6px_6px_0_#1D1C16] flex items-center justify-center mb-6 rotate-[-4deg]">
            <TicketIcon className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-black text-ink font-display tracking-tight">
            Culture<span className="text-vermilion">Quest</span>
          </h1>
          <p className="text-sm text-muted mt-3 max-w-xs">
            Explore Cambridge museums, complete quests, and turn points into real rewards at local shops.
          </p>
        </div>

        {/* How it works */}
        <div className="w-full max-w-xs space-y-2.5 my-auto">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-line text-left">
            <div className="w-9 h-9 rounded-xl bg-vermilion-soft text-vermilion flex items-center justify-center shrink-0">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-ink">1 · Check in at a venue</div>
              <div className="text-[11px] text-muted">Earn points at museums & culture spots</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-line text-left">
            <div className="w-9 h-9 rounded-xl bg-teal-soft text-teal flex items-center justify-center shrink-0">
              <Ticket className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-ink">2 · Complete quests</div>
              <div className="text-[11px] text-muted">Find artefacts, answer trivia, take photos</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-line text-left">
            <div className="w-9 h-9 rounded-xl bg-gold-soft text-[#8A6A10] flex items-center justify-center shrink-0">
              <Gift className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-ink">3 · Redeem vouchers</div>
              <div className="text-[11px] text-muted">Coffee, Chelsea buns, book discounts & more</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs pb-8">
          <button
            onClick={() => {
              triggerHaptic('medium');
              sound.playCoin();
              setStep('profile');
            }}
            className="w-full py-4 rounded-2xl bg-vermilion text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_5px_0_#1D1C16] active:translate-y-1 active:shadow-[0_2px_0_#1D1C16] transition"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
          <p className="text-[10px] text-muted mt-3 font-mono">CultureQuest · pilot in Cambridge</p>
        </div>
      </div>
    );
  }

  // 2. Profile
  return (
    <div className="fixed inset-0 z-50 bg-wall flex flex-col justify-between p-6 overflow-y-auto">
      <div className="pt-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Set up your profile</span>
        <h2 className="text-2xl font-black text-ink mt-1 font-display">Who's exploring?</h2>
      </div>

      <div className="my-auto py-6 space-y-5 max-w-sm mx-auto w-full">
        {/* Name */}
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full px-4 py-3 rounded-xl bg-card border border-line text-sm font-bold text-ink focus:outline-none focus:border-teal"
          />
        </div>

        {/* Avatar */}
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Pick an avatar</label>
          <div className="flex gap-2 justify-between flex-wrap">
            {AVATAR_OPTIONS.map((em) => (
              <button
                key={em}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedAvatar(em);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${
                  selectedAvatar === em
                    ? 'bg-gold-soft border-2 border-gold scale-110'
                    : 'bg-card border border-line hover:border-muted'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Explorer class */}
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1.5">Explorer style</label>
          <div className="grid grid-cols-2 gap-2">
            {EXPLORER_CLASSES.map((cls) => {
              const isSelected = selectedClass === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedClass(cls.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected ? 'bg-card border-2 border-teal shadow-sm' : 'bg-card border-line hover:border-muted'
                  }`}
                >
                  <div className="text-xl mb-1">{cls.icon}</div>
                  <div className="text-xs font-bold text-ink font-display">{cls.title}</div>
                  <div className="text-[10px] text-muted mt-0.5 leading-snug">{cls.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={handleFinish}
          className="w-full py-4 rounded-2xl bg-vermilion text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_5px_0_#1D1C16] active:translate-y-1 active:shadow-[0_2px_0_#1D1C16] transition"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Start exploring</span>
        </button>
      </div>
    </div>
  );
};
