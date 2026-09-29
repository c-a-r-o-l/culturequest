import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Coffee,
  QrCode,
  Plus,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

export const PartnerDashboard: React.FC = () => {
  const { partnerMode, setPartnerMode, venues, addNewCustomQuest, addNewCustomReward } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'quests' | 'qr'>('analytics');
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0].id);

  // New Quest Form
  const [questTitle, setQuestTitle] = useState('');
  const [questType, setQuestType] = useState<'trivia' | 'scavenger'>('trivia');
  const [questPoints, setQuestPoints] = useState(150);
  const [questQuestion, setQuestQuestion] = useState('');
  const [questCorrectOption, setQuestCorrectOption] = useState('');
  const [questSuccessMsg, setQuestSuccessMsg] = useState(false);

  // New Reward Form
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardCost, setRewardCost] = useState(150);
  const [rewardBusiness, setRewardBusiness] = useState('Cambridge Independent Bookshop');
  const [rewardSuccessMsg, setRewardSuccessMsg] = useState(false);

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questTitle.trim()) return;

    addNewCustomQuest({
      venueId: selectedVenueId,
      title: questTitle,
      type: questType,
      pointsReward: questPoints,
      xpReward: Math.round(questPoints * 0.75),
      steps: [
        {
          id: 's-' + Date.now(),
          title: questTitle,
          description: questQuestion || 'Inspect the featured gallery artifact to solve this.',
          type: 'trivia',
          options: [
            questCorrectOption || 'Correct Answer',
            'Alternative Theory B',
            'Misconception C',
            'Ancient Myth D',
          ],
          correctOptionIndex: 0,
          explanation: 'Curator verified exhibit fact.',
        },
      ],
    });

    triggerHaptic('success');
    sound.playCoin();
    setQuestSuccessMsg(true);
    setQuestTitle('');
    setQuestQuestion('');
    setQuestCorrectOption('');
    setTimeout(() => setQuestSuccessMsg(false), 3000);
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;

    addNewCustomReward({
      businessName: rewardBusiness,
      title: rewardTitle,
      pointsCost: rewardCost,
    });

    triggerHaptic('success');
    sound.playCoin();
    setRewardSuccessMsg(true);
    setRewardTitle('');
    setTimeout(() => setRewardSuccessMsg(false), 3000);
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Header with Return Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('user');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Explorer Game</span>
        </button>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
          B2B PARTNER CONSOLE
        </span>
      </div>

      {/* Role Toggle: Museum vs Local Business */}
      <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('museum');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
            partnerMode === 'museum' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Museum Console</span>
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('business');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
            partnerMode === 'business' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Local Partner Console</span>
        </button>
      </div>

      {/* ================= MUSEUM VIEW ================= */}
      {partnerMode === 'museum' && (
        <div className="space-y-4">
          {/* Venue Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Select Venue Admin Account:
            </label>
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Navigation */}
          <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-1 ${activeTab === 'analytics' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
            >
              Visitor Footfall
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`pb-1 ${activeTab === 'quests' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
            >
              Create Quest
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`pb-1 ${activeTab === 'qr' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
            >
              Print Venue QR
            </button>
          </div>

          {/* 1. Footfall Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-2xl font-black text-amber-400">{selectedVenue.weeklyVisitors}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Visits this week</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +34% vs last week
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="text-2xl font-black text-indigo-400">76%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Aged 16-24 cohort</div>
                  <div className="text-[10px] text-slate-400 mt-1">High Gen-Z engagement</div>
                </div>
              </div>

              {/* Peak Times */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" /> Peak Explorer Check-In Hours
                </h4>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>11:00 - 13:00 (Lunch Quest Dose)</span>
                    <span className="font-bold text-amber-300">38% of visits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>14:30 - 16:30 (Afternoon Strolls)</span>
                    <span className="font-bold text-amber-300">45% of visits</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Quest Form Builder */}
          {activeTab === 'quests' && (
            <form onSubmit={handleCreateQuest} className="space-y-3 p-4 rounded-3xl bg-slate-900 border border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-400" /> Add Exhibit Challenge
              </h3>

              {questSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Quest published live to the explorer map!
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Quest Title</label>
                <input
                  type="text"
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  placeholder="e.g. Mystery of the Egyptian Sarcophagus"
                  required
                  className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Trivia Question or Clue</label>
                <textarea
                  value={questQuestion}
                  onChange={(e) => setQuestQuestion(e.target.value)}
                  placeholder="What pigment did ancient artisans use to paint the golden border?"
                  className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white h-16"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Correct Answer</label>
                <input
                  type="text"
                  value={questCorrectOption}
                  onChange={(e) => setQuestCorrectOption(e.target.value)}
                  placeholder="Orpiment (arsenic trisulfide)"
                  className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow"
              >
                Publish Quest (+150 pts reward)
              </button>
            </form>
          )}

          {/* 3. QR Code Generator */}
          {activeTab === 'qr' && (
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <h3 className="text-sm font-black text-white">Rotating Venue Check-in QR</h3>
              <p className="text-xs text-slate-400">
                Display this printed placard at your museum reception desk or ticket counter.
              </p>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
                <div className="w-36 h-36 bg-slate-950 rounded-xl flex flex-col items-center justify-center p-2 text-white text-center font-mono">
                  <div className="text-[10px] text-amber-400 font-bold mb-1">CULTUREQUEST</div>
                  <div className="text-xs font-black tracking-widest">{selectedVenue.qrSecret}</div>
                  <div className="text-[9px] text-slate-400 mt-2">SCAN TO CHECK IN</div>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-amber-300">
                Token: {selectedVenue.qrSecret}
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Placard PDF</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= LOCAL BUSINESS VIEW ================= */}
      {partnerMode === 'business' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <h3 className="text-sm font-black text-amber-300">Cambridge Merchant Footfall</h3>
            <p className="text-xs text-slate-300">
              42 explorers redeemed perks at partner cafes & bookshops this month, generating £380 in footfall spend!
            </p>
          </div>

          <form onSubmit={handleCreateReward} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" /> Create Business Perk
            </h3>

            {rewardSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Perk added to explorer catalog!
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Offer Title</label>
              <input
                type="text"
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                placeholder="e.g. Free filter coffee with cake slice"
                required
                className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Points Cost to Explorer</label>
              <input
                type="number"
                value={rewardCost}
                onChange={(e) => setRewardCost(Number(e.target.value))}
                min={50}
                max={500}
                className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow"
            >
              Add Partner Perk
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
