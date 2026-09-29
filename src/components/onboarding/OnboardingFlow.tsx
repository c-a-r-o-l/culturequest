import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExplorerClass } from '../../types';
import { Sparkles, MapPin, Award, Coffee, Compass, Check, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { sound, fireConfetti, triggerHaptic } from '../../utils/audioAndFx';

const EXPLORER_CLASSES: { id: ExplorerClass; title: string; desc: string; icon: string; perk: string }[] = [
  {
    id: 'Curator',
    title: 'Curator',
    desc: 'Passionate connoisseur of fine arts, paintings & antiquities.',
    icon: '🏛️',
    perk: '+15% bonus XP in art galleries',
  },
  {
    id: 'Historian',
    title: 'Historian',
    desc: 'Uncovering the lore, manuscripts and social heritage of the city.',
    icon: '📜',
    perk: '+15% bonus XP on ancient relics',
  },
  {
    id: 'Wanderer',
    title: 'Wanderer',
    desc: 'Spontaneous city explorer soaking up botany, architecture & vibe.',
    icon: '🧭',
    perk: '20% larger radar check-in range',
  },
  {
    id: 'Detective',
    title: 'Detective',
    desc: 'Sharp-eyed riddle solver who cracks every scavenger clue.',
    icon: '🔍',
    perk: 'Free hints on complex puzzles',
  },
];

const INTEREST_OPTIONS = [
  { id: 'Art', label: 'Fine Art & Galleries', icon: '🎨' },
  { id: 'History', label: 'Ancient History', icon: '🏺' },
  { id: 'Science', label: 'Science & Astronomy', icon: '🔬' },
  { id: 'Architecture', label: 'Gothic Architecture', icon: '🏰' },
  { id: 'Books', label: 'Rare Books & Libraries', icon: '📚' },
  { id: 'Botany', label: 'Botany & Nature', icon: '🌿' },
  { id: 'Local heritage', label: 'Folk Heritage & Lore', icon: '🍺' },
];

const CAROUSEL_SLIDES = [
  {
    title: 'Explore Cambridge like an Open-World Game',
    subtitle: 'Wander past historic colleges, hidden chapels, and world-class museums with your personal radar.',
    icon: Compass,
    accent: 'from-indigo-500 to-sky-400',
    stat: '8 Venues in Cambridge Pilot',
  },
  {
    title: 'Conquer Quests & Collect Artefacts',
    subtitle: 'Crack scavenger clues, answer exhibit trivia, and build your digital card album with rare holographic drops.',
    icon: Sparkles,
    accent: 'from-amber-400 to-rose-500',
    stat: '25+ Collectible Cards & Badges',
  },
  {
    title: 'Redeem for Real Coffee & Indie Books',
    subtitle: 'Turn your steps into free flat whites at The Copper Kettle, Chelsea buns at Fitzbillies, and book discounts.',
    icon: Coffee,
    accent: 'from-emerald-400 to-teal-500',
    stat: '6 Local Partner Perks',
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

  const AVATAR_OPTIONS = ['🧭', '🦁', '🦉', '🦕', '🦊', '🎨', '🔭', '👑', '⚡'];

  const handleInterestToggle = (interest: string) => {
    triggerHaptic('light');
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFinalSubmit = () => {
    completeOnboarding({
      name: name.trim() || 'Explorer',
      explorerClass: selectedClass,
      interests: selectedInterests,
      avatar: selectedAvatar,
    });
    if (onFinish) onFinish();
  };

  // 1. Splash Screen
  if (step === 'splash') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col items-center justify-between p-6 text-center select-none overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="pt-12 flex flex-col items-center">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 uppercase tracking-widest">
            Cambridge Pilot
          </span>
        </div>

        {/* Central Logo & Badge */}
        <div className="flex flex-col items-center my-auto relative">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-amber-500 p-1 shadow-[0_0_50px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Compass className="w-14 h-14 text-amber-400 stroke-[2] animate-pulse" />
              </div>
            </div>
            {/* Spinning decorative orbit */}
            <div className="absolute -inset-3 border-2 border-dashed border-amber-400/40 rounded-full animate-spin [animation-duration:20s]" />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white font-['Outfit']">
            Culture<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">Quest</span>
          </h1>
          <p className="text-lg font-medium text-amber-300/90 mt-2">
            Turn culture into a quest.
          </p>
          <p className="text-xs text-slate-400 max-w-xs mt-3 leading-relaxed">
            The location-based RPG for discovering museums, cracking historical enigmas, and winning local perks.
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
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-black text-base shadow-[0_6px_0_#9a3412] active:translate-y-1 active:shadow-[0_2px_0_#9a3412] transition-all flex items-center justify-center gap-2"
          >
            <span>Begin Your Quest</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
          <p className="text-[11px] text-slate-500 mt-3">Free for explorers • B2B2C cultural ecosystem</p>
        </div>
      </div>
    );
  }

  // 2. Carousel Slides
  if (step === 'carousel') {
    const cur = CAROUSEL_SLIDES[carouselIndex];
    const SlideIcon = cur.icon;

    return (
      <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col justify-between p-6">
        {/* Top skip */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-1.5">
            {CAROUSEL_SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === carouselIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setStep('auth')}
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            Skip
          </button>
        </div>

        {/* Carousel Content */}
        <div className="my-auto flex flex-col items-center text-center px-2">
          <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xl mb-6 relative">
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${cur.accent} opacity-20 blur-md`} />
            <SlideIcon className="w-12 h-12 text-amber-400" />
          </div>

          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700 mb-3">
            {cur.stat}
          </span>
          <h2 className="text-2xl font-black text-white leading-tight font-['Outfit']">{cur.title}</h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-sm">{cur.subtitle}</p>
        </div>

        {/* Next / Continue Controls */}
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-base shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-[0_1px_0_#b45309] transition flex items-center justify-center gap-2"
          >
            <span>{carouselIndex < CAROUSEL_SLIDES.length - 1 ? 'Next' : 'Get Started'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Auth Options
  if (step === 'auth') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col justify-between p-6">
        <div className="pt-6">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 1 of 4</span>
          <h2 className="text-2xl font-black text-white mt-1 font-['Outfit']">Join CultureQuest</h2>
          <p className="text-xs text-slate-400 mt-1">Save your badges, level up, and redeem points.</p>
        </div>

        <div className="space-y-3 max-w-sm w-full mx-auto my-auto">
          {/* Continue as Guest - instant access */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setStep('interests');
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-[0_4px_0_#3730a3] active:translate-y-1 active:shadow-[0_1px_0_#3730a3] transition flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>Continue as Guest (Instant Play)</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[11px] font-semibold">or sync with</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setStep('interests');
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-3 transition"
          >
            <span className="text-base">🇬</span>
            <span>Sign in with Google</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setStep('interests');
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-3 transition"
          >
            <span className="text-base"></span>
            <span>Sign in with Apple</span>
          </button>
        </div>

        <div className="pb-4 text-center">
          <p className="text-[11px] text-slate-500">By continuing, you agree to fair-play rules & non-commercial pilot terms.</p>
        </div>
      </div>
    );
  }

  // 4. Interests Picker
  if (step === 'interests') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col justify-between p-6 overflow-y-auto">
        <div className="pt-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 2 of 4</span>
          <h2 className="text-2xl font-black text-white mt-1 font-['Outfit']">What excites you?</h2>
          <p className="text-xs text-slate-400 mt-1">Select your interests to personalize recommended quests and cultural trails.</p>
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
                    ? 'bg-indigo-950/80 border-amber-400/80 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 disabled:opacity-50 text-slate-950 font-black text-base shadow-[0_5px_0_#b45309] active:translate-y-1 transition flex items-center justify-center gap-2"
          >
            <span>Continue ({selectedInterests.length} selected)</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 5. Permissions (Location & Camera)
  if (step === 'permissions') {
    return (
      <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col justify-between p-6">
        <div className="pt-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 3 of 4</span>
          <h2 className="text-2xl font-black text-white mt-1 font-['Outfit']">Explorer Permissions</h2>
          <p className="text-xs text-slate-400 mt-1">CultureQuest is a location-based game. Here is why we need device access:</p>
        </div>

        <div className="my-auto space-y-4 max-w-sm mx-auto w-full">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Geolocation Radar</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Detects when you are within 75m of a museum to unlock check-in stamps and rare card drops. We never sell your location.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Camera for QR & Photo Quests</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Scan rotating physical QR codes inside galleries and complete visual scavenger photo challenges.
              </p>
            </div>
          </div>
        </div>

        <div className="pb-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              // Request browser location prompt
              if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(() => {}, () => {});
              }
              setStep('class');
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-base shadow-[0_5px_0_#b45309] active:translate-y-1 transition flex items-center justify-center gap-2"
          >
            <span>Enable & Continue</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 6. Avatar & Class Selection
  return (
    <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col justify-between p-6 overflow-y-auto">
      <div className="pt-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 4 of 4</span>
        <h2 className="text-2xl font-black text-white mt-1 font-['Outfit']">Choose Explorer Identity</h2>
        <p className="text-xs text-slate-400 mt-1">Pick your avatar & class. Gives you unique flair in Cambridge!</p>
      </div>

      <div className="my-auto py-4 space-y-4 max-w-sm mx-auto w-full">
        {/* Name input */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Explorer Tag</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your adventurer name"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Avatar emoji picker */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Avatar Emblem</label>
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
                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Class Selection */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Explorer Class</label>
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
                      ? 'bg-indigo-950 border-amber-400 shadow-md text-white'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xl mb-1">{cls.icon}</div>
                  <div className="text-xs font-bold">{cls.title}</div>
                  <div className="text-[10px] text-amber-300 font-semibold mt-1">{cls.perk}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pb-4">
        <button
          onClick={handleFinalSubmit}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-black text-base shadow-[0_6px_0_#9a3412] active:translate-y-1 transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>Enter Cambridge Quest World</span>
        </button>
      </div>
    </div>
  );
};
