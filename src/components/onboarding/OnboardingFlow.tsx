import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExplorerClass } from '../../types';
import { Sparkles, MapPin, Coffee, Compass, Check, ArrowRight, ShieldCheck, ChevronRight, BookOpen, Feather, Scroll } from 'lucide-react';
import { sound, fireConfetti, triggerHaptic } from '../../utils/audioAndFx';

const EXPLORER_CLASSES: { id: ExplorerClass; title: string; desc: string; icon: string; perk: string }[] = [
  {
    id: 'Curator',
    title: 'Curator',
    desc: 'Connoisseur of fine arts, illuminated codices & antiquities.',
    icon: '🏛️',
    perk: '+15% bonus XP in fine art galleries',
  },
  {
    id: 'Historian',
    title: 'Historian',
    desc: 'Uncovering the lore, manuscripts and collegiate lore of 800 years.',
    icon: '📜',
    perk: '+15% bonus XP on ancient relics',
  },
  {
    id: 'Wanderer',
    title: 'Natural Philosopher',
    desc: 'Spontaneous scholar soaking up botany, architecture & the River Cam.',
    icon: '🧭',
    perk: '20% larger cartographic check-in radar',
  },
  {
    id: 'Detective',
    title: 'Archive Detective',
    desc: 'Sharp-eyed riddle solver who decodes every marginalia clue.',
    icon: '🔍',
    perk: 'Free hints on complex manuscript puzzles',
  },
];

const INTEREST_OPTIONS = [
  { id: 'Art', label: 'Fine Art & Classical Antiquities', icon: '🎨' },
  { id: 'History', label: 'Medieval & Ancient History', icon: '🏺' },
  { id: 'Science', label: 'Natural Philosophy & Astronomy', icon: '🔬' },
  { id: 'Architecture', label: 'Gothic Chapels & College Courts', icon: '🏰' },
  { id: 'Books', label: 'Rare Manuscripts & Libraries', icon: '📚' },
  { id: 'Botany', label: 'Botany & Herbarium Curiosities', icon: '🌿' },
  { id: 'Local heritage', label: 'Fenland Folklore & City Lore', icon: '🍺' },
];

const CAROUSEL_SLIDES = [
  {
    title: 'Explore 800 Years of Cambridge Heritage',
    subtitle: 'Wander past historic colleges, hidden chapels, and world-class archives with your antiquarian map.',
    icon: Compass,
    accent: 'from-[#1C3A27] to-[#122419]',
    stat: '8 Collegiate Venues in Cambridge',
  },
  {
    title: 'Decipher Manuscripts & Collect Relics',
    subtitle: 'Crack archival clues, answer exhibit trivia, and illuminate your digital folio with rare holographic folios.',
    icon: Scroll,
    accent: 'from-[#6B1D23] to-[#421013]',
    stat: '25+ Archival Artefacts & Seals',
  },
  {
    title: 'Earn Fellowship Perks at Local Bookshops',
    subtitle: 'Turn your scholarly discoveries into artisan flat whites at The Copper Kettle and Chelsea buns at Fitzbillies.',
    icon: Coffee,
    accent: 'from-[#B89758] to-[#8C6E30]',
    stat: '6 Independent Cambridge Partners',
  },
];

export const OnboardingFlow: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<'splash' | 'carousel' | 'auth' | 'interests' | 'permissions' | 'class'>('splash');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Form State
  const [name, setName] = useState('Alex Rivera');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Art', 'History', 'Science']);
  const [selectedClass, setSelectedClass] = useState<ExplorerClass>('Wanderer');
  const [selectedAvatar, setSelectedAvatar] = useState('🧭');

  const AVATAR_OPTIONS = ['🧭', '📜', '🦁', '🦉', '🎨', '🔬', '🏛️', '👑', '⚡'];

  const handleInterestToggle = (interest: string) => {
    triggerHaptic('light');
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFinalSubmit = () => {
    completeOnboarding({
      name: name.trim() || 'Scholar',
      explorerClass: selectedClass,
      interests: selectedInterests,
      avatar: selectedAvatar,
    });
    if (onFinish) onFinish();
  };

  // 1. Splash Screen
  if (step === 'splash') {
    return (
      <div className="fixed inset-0 z-50 bg-[#121A15] flex flex-col items-center justify-between p-6 text-center select-none overflow-hidden">
        {/* Subtle dark academia ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1C3A27]/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#B89758]/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="pt-10 flex flex-col items-center">
          <span className="px-3.5 py-1 rounded-full bg-[#1C3A27] text-[#E2CA8E] text-[10px] font-bold border border-[#B89758]/60 uppercase tracking-[0.25em] font-display">
            Cambridge Scholarly System
          </span>
        </div>

        {/* Central Logo & Emblem */}
        <div className="flex flex-col items-center my-auto relative">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-3xl bg-[#1C3A27] border-2 border-[#B89758] p-1 shadow-[0_0_40px_rgba(184,151,88,0.25)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0F1B13] rounded-[22px] flex items-center justify-center">
                <BookOpen className="w-14 h-14 text-[#E2CA8E] stroke-[1.8] animate-pulse" />
              </div>
            </div>
            {/* Spinning decorative astrolabe border */}
            <div className="absolute -inset-3 border border-dashed border-[#B89758]/50 rounded-full animate-spin [animation-duration:35s]" />
          </div>

          <h1 className="text-3xl font-bold tracking-wider text-[#FAF8F5] font-display">
            CHRONICLES OF <span className="text-[#E2CA8E]">CANTABRIGIA</span>
          </h1>
          <p className="text-sm font-body italic text-[#D1C7B7] mt-2 max-w-xs">
            "A Dark Academia cultural discovery quest bridging 800 years of Cambridge heritage."
          </p>
        </div>

        {/* Start Button */}
        <div className="w-full max-w-xs pb-6">
          <button
            onClick={() => {
              triggerHaptic('medium');
              sound.playCoin();
              setStep('carousel');
            }}
            className="w-full py-4 px-6 rounded-2xl btn-wax-seal text-[#FAF8F5] font-display font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 border border-[#B89758]"
          >
            <span>Matriculate / Begin</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#E2CA8E]" />
          </button>
          <p className="text-[10px] text-[#879B8E] mt-3 font-mono">Designed for scholars & explorers • Cantabrigia v1.0</p>
        </div>
      </div>
    );
  }

  // 2. Carousel Slides
  if (step === 'carousel') {
    const cur = CAROUSEL_SLIDES[carouselIndex];
    const SlideIcon = cur.icon;

    return (
      <div className="fixed inset-0 z-50 bg-[#121A15] flex flex-col justify-between p-6">
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-1.5">
            {CAROUSEL_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === carouselIndex ? 'w-8 bg-[#B89758]' : 'w-2 bg-[#1C3A27]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setStep('auth')}
            className="text-xs font-display tracking-widest uppercase text-[#B89758] hover:text-[#FAF8F5]"
          >
            Skip
          </button>
        </div>

        <div className="my-auto flex flex-col items-center text-center px-2">
          <div className="w-24 h-24 rounded-3xl bg-[#1C3A27] border-2 border-[#B89758] flex items-center justify-center shadow-xl mb-6 relative">
            <SlideIcon className="w-12 h-12 text-[#E2CA8E]" />
          </div>

          <span className="text-[10px] font-bold font-mono px-3 py-1 rounded-full bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758]/50 mb-3 tracking-wider">
            {cur.stat}
          </span>
          <h2 className="text-2xl font-bold text-[#FAF8F5] leading-snug font-display">{cur.title}</h2>
          <p className="text-sm font-body text-[#D1C7B7] mt-3 leading-relaxed max-w-sm">{cur.subtitle}</p>
        </div>

        <div className="pb-6">
          <button
            onClick={() => {
              triggerHaptic('light');
              sound.playCoin();
              if (carouselIndex < CAROUSEL_SLIDES.length - 1) {
                setCarouselIndex(carouselIndex + 1);
              } else {
                setStep('auth');
              }
            }}
            className="w-full py-4 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] font-display font-bold text-xs uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:translate-y-1 transition flex items-center justify-center gap-2"
          >
            <span>{carouselIndex < CAROUSEL_SLIDES.length - 1 ? 'Continue Reading' : 'Enroll as Scholar'}</span>
            <ChevronRight className="w-4 h-4 text-[#B89758]" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Auth Options
  if (step === 'auth') {
    return (
      <div className="fixed inset-0 z-50 bg-[#121A15] flex flex-col justify-between p-6">
        <div className="pt-6">
          <span className="text-[10px] font-bold font-display uppercase tracking-widest text-[#B89758]">Step 1 of 4</span>
          <h2 className="text-2xl font-bold text-[#FAF8F5] mt-1 font-display">Archival Matriculation</h2>
          <p className="text-xs font-body text-[#D1C7B7] mt-1">Preserve your scholarly discoveries and academic honors across Cambridge.</p>
        </div>

        <div className="space-y-3 max-w-sm w-full mx-auto my-auto">
          {/* Guest matriculation */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setStep('interests');
            }}
            className="w-full py-3.5 px-4 rounded-2xl btn-wax-seal text-[#FAF8F5] font-display font-bold text-xs tracking-wider uppercase border border-[#B89758] flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#E2CA8E]" />
            <span>Enter as Guest Scholar (Instant Access)</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#1C3A27]"></div>
            <span className="flex-shrink mx-4 text-[#879B8E] text-[10px] font-display tracking-widest uppercase">Collegiate Single Sign-On</span>
            <div className="flex-grow border-t border-[#1C3A27]"></div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setStep('interests');
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#1C3A27] border border-[#B89758]/50 text-[#FAF8F5] font-display text-xs flex items-center justify-center gap-3 transition"
          >
            <span>🇬</span>
            <span>Authenticate with Google</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setStep('interests');
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#1C3A27] border border-[#B89758]/50 text-[#FAF8F5] font-display text-xs flex items-center justify-center gap-3 transition"
          >
            <span></span>
            <span>Authenticate with Apple</span>
          </button>
        </div>

        <div className="pb-4 text-center">
          <p className="text-[10px] font-mono text-[#879B8E]">Adherence to academic honor codes & archival privacy standards.</p>
        </div>
      </div>
    );
  }

  // 4. Interests Picker
  if (step === 'interests') {
    return (
      <div className="fixed inset-0 z-50 bg-[#121A15] flex flex-col justify-between p-6 overflow-y-auto">
        <div className="pt-4">
          <span className="text-[10px] font-bold font-display uppercase tracking-widest text-[#B89758]">Step 2 of 4</span>
          <h2 className="text-2xl font-bold text-[#FAF8F5] mt-1 font-display">Academic Faculties</h2>
          <p className="text-xs font-body text-[#D1C7B7] mt-1">Select your fields of intellectual curiosity to customize recommendations.</p>
        </div>

        <div className="my-auto py-6 grid grid-cols-1 gap-2.5 max-w-sm mx-auto w-full">
          {INTEREST_OPTIONS.map((item) => {
            const isSelected = selectedInterests.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleInterestToggle(item.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'bg-[#1C3A27] border-[#B89758] text-[#FAF8F5] shadow-[0_2px_12px_rgba(184,151,88,0.2)]'
                    : 'bg-[#142018] border-[#1C3A27] text-[#D1C7B7] hover:border-[#B89758]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-bold font-display">{item.label}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-[#6B1D23] border-[#B89758] text-[#FAF8F5]' : 'border-[#879B8E]/50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-[#E2CA8E]" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pb-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              setStep('permissions');
            }}
            disabled={selectedInterests.length === 0}
            className="w-full py-4 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] font-display font-bold text-xs uppercase tracking-widest shadow flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>Proceed ({selectedInterests.length} selected)</span>
            <ChevronRight className="w-4 h-4 text-[#B89758]" />
          </button>
        </div>
      </div>
    );
  }

  // 5. Permissions (Location & Camera)
  if (step === 'permissions') {
    return (
      <div className="fixed inset-0 z-50 bg-[#121A15] flex flex-col justify-between p-6">
        <div className="pt-4">
          <span className="text-[10px] font-bold font-display uppercase tracking-widest text-[#B89758]">Step 3 of 4</span>
          <h2 className="text-2xl font-bold text-[#FAF8F5] mt-1 font-display">Archival Affordances</h2>
          <p className="text-xs font-body text-[#D1C7B7] mt-1">To prove presence at real Cambridge archives, we request device access:</p>
        </div>

        <div className="my-auto space-y-4 max-w-sm mx-auto w-full">
          <div className="p-4 rounded-2xl parchment-card border border-[#B89758] flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C3A27] text-[#E2CA8E] flex items-center justify-center shrink-0 border border-[#B89758]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1C3A27] font-display">Geodesic Radar</h3>
              <p className="text-[11px] text-[#3B4E41] font-body mt-0.5 leading-relaxed">
                Verifies when your scholar reaches the 75-metre perimeter of a library or museum to unlock stamp seals and folio cards.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl parchment-card border border-[#B89758] flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1D23] text-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#B89758]">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1C3A27] font-display">Optical Archival Scanner</h3>
              <p className="text-[11px] text-[#3B4E41] font-body mt-0.5 leading-relaxed">
                Scans daily rotating authentication codes at museum desks and validates visual photo challenges.
              </p>
            </div>
          </div>
        </div>

        <div className="pb-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(() => {}, () => {});
              }
              setStep('class');
            }}
            className="w-full py-4 rounded-2xl bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] font-display font-bold text-xs uppercase tracking-widest shadow flex items-center justify-center gap-2"
          >
            <span>Grant Affordance & Proceed</span>
            <ChevronRight className="w-4 h-4 text-[#B89758]" />
          </button>
        </div>
      </div>
    );
  }

  // 6. Avatar & Explorer Class
  return (
    <div className="fixed inset-0 z-50 bg-[#121A15] flex flex-col justify-between p-6 overflow-y-auto">
      <div className="pt-2">
        <span className="text-[10px] font-bold font-display uppercase tracking-widest text-[#B89758]">Step 4 of 4</span>
        <h2 className="text-2xl font-bold text-[#FAF8F5] mt-1 font-display">Scholar Identity</h2>
        <p className="text-xs font-body text-[#D1C7B7] mt-1">Select your collegiate rank & heraldic crest.</p>
      </div>

      <div className="my-auto py-4 space-y-4 max-w-sm mx-auto w-full">
        {/* Name input */}
        <div>
          <label className="text-[10px] font-bold text-[#D1C7B7] uppercase tracking-widest font-display block mb-1">Scholar Title & Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera, Scholar"
            className="w-full px-4 py-2.5 rounded-xl bg-[#1C3A27] border border-[#B89758] text-xs font-display font-bold text-[#FAF8F5] focus:outline-none"
          />
        </div>

        {/* Heraldic Emblem Picker */}
        <div>
          <label className="text-[10px] font-bold text-[#D1C7B7] uppercase tracking-widest font-display block mb-1">Heraldic Seal</label>
          <div className="flex gap-2 justify-between">
            {AVATAR_OPTIONS.map((em) => (
              <button
                key={em}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedAvatar(em);
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                  selectedAvatar === em
                    ? 'bg-[#6B1D23] border-2 border-[#E2CA8E] scale-110 shadow-[0_0_10px_rgba(184,151,88,0.5)]'
                    : 'bg-[#1C3A27] border border-[#B89758]/40 hover:border-[#B89758]'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Class Selection */}
        <div>
          <label className="text-[10px] font-bold text-[#D1C7B7] uppercase tracking-widest font-display block mb-1.5">Archival Discipline</label>
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
                    isSelected
                      ? 'bg-[#1C3A27] border-2 border-[#B89758] text-[#FAF8F5] shadow-md'
                      : 'bg-[#142018] border-[#1C3A27] text-[#D1C7B7] hover:border-[#B89758]/50'
                  }`}
                >
                  <div className="text-xl mb-1">{cls.icon}</div>
                  <div className="text-xs font-bold font-display text-[#E2CA8E]">{cls.title}</div>
                  <div className="text-[10px] text-[#A6BAAE] font-body mt-0.5 leading-snug">{cls.perk}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={handleFinalSubmit}
          className="w-full py-4 rounded-2xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
        >
          <Feather className="w-4 h-4 text-[#E2CA8E]" />
          <span>Enter Cantabrigia Archives</span>
        </button>
      </div>
    </div>
  );
};
