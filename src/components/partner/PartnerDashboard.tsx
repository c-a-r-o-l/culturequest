import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Coffee,
  QrCode,
  Plus,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  Printer,
  TrendingUp,
  Scroll,
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
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('user');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1C3A27] border border-[#B89758] text-xs font-display font-bold text-[#E2CA8E] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Cartography</span>
        </button>

        <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#6B1D23] text-[#FAF8F5] border border-[#B89758]">
          CANTABRIGIA B2B CONSOLE
        </span>
      </div>

      {/* Role Toggle: Museum vs Local Business */}
      <div className="flex rounded-2xl bg-[#1C3A27] p-1 border border-[#B89758]/60">
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('museum');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition ${
            partnerMode === 'museum' ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]' : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#B89758]" />
          <span>Museum Archive</span>
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('business');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition ${
            partnerMode === 'business' ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]' : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 text-[#B89758]" />
          <span>Merchant Guild</span>
        </button>
      </div>

      {/* ================= MUSEUM VIEW ================= */}
      {partnerMode === 'museum' && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-display font-bold text-[#D1C7B7] uppercase tracking-widest block mb-1">
              Select Collegiate Archive Authority:
            </label>
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#1C3A27] border border-[#B89758] text-xs font-display font-bold text-[#FAF8F5] focus:outline-none"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 border-b border-[#B89758]/30 pb-2 text-xs font-display font-bold">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-1 uppercase tracking-wider ${activeTab === 'analytics' ? 'text-[#E2CA8E] border-b-2 border-[#B89758]' : 'text-[#879B8E]'}`}
            >
              Scholar Traffic
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`pb-1 uppercase tracking-wider ${activeTab === 'quests' ? 'text-[#E2CA8E] border-b-2 border-[#B89758]' : 'text-[#879B8E]'}`}
            >
              Create Treatise
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`pb-1 uppercase tracking-wider ${activeTab === 'qr' ? 'text-[#E2CA8E] border-b-2 border-[#B89758]' : 'text-[#879B8E]'}`}
            >
              Placard Seal
            </button>
          </div>

          {activeTab === 'analytics' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl parchment-card border border-[#B89758]/60">
                  <div className="text-2xl font-bold font-mono text-[#1C3A27]">{selectedVenue.weeklyVisitors}</div>
                  <div className="text-[9px] text-[#544431] font-display font-bold uppercase">Matriculations this week</div>
                  <div className="text-[10px] text-[#1C3A27] font-body mt-1 flex items-center gap-1 font-bold">
                    <TrendingUp className="w-3 h-3 text-[#1C3A27]" /> +34% research footfall
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl parchment-card border border-[#B89758]/60">
                  <div className="text-2xl font-bold font-mono text-[#6B1D23]">76%</div>
                  <div className="text-[9px] text-[#544431] font-display font-bold uppercase">Aged 16-24 Cohort</div>
                  <div className="text-[10px] text-[#544431] font-body italic mt-1">High student interest</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-[#1C3A27] border border-[#B89758] space-y-2">
                <h4 className="text-xs font-bold text-[#E2CA8E] font-display flex items-center gap-1.5 uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4 text-[#B89758]" /> Peak Archival Check-In Hours
                </h4>
                <div className="space-y-1 text-xs text-[#D1C7B7] font-body">
                  <div className="flex justify-between">
                    <span>11:00 - 13:00 (Scholarly Midday Stroll)</span>
                    <span className="font-mono text-[#E2CA8E] font-bold">38% of visits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>14:30 - 16:30 (Afternoon Library Walk)</span>
                    <span className="font-mono text-[#E2CA8E] font-bold">45% of visits</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <form onSubmit={handleCreateQuest} className="space-y-3 p-4 rounded-3xl parchment-card border-2 border-[#B89758]">
              <h3 className="text-sm font-bold text-[#1C3A27] font-display flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#6B1D23]" /> Author New Archival Treatise
              </h3>

              {questSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758] text-xs font-display font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Treatise published to the Cantabrigia cartography!
                </div>
              )}

              <div>
                <label className="text-[9px] font-display font-bold text-[#544431] uppercase">Treatise Title</label>
                <input
                  type="text"
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  placeholder="e.g. Mystery of Isaac Newton's Prism"
                  required
                  className="w-full mt-1 p-2 rounded-xl bg-[#F5EFE2] border border-[#B89758] text-xs text-[#1C3A27] font-body"
                />
              </div>

              <div>
                <label className="text-[9px] font-display font-bold text-[#544431] uppercase">Inquiry Clue</label>
                <textarea
                  value={questQuestion}
                  onChange={(e) => setQuestQuestion(e.target.value)}
                  placeholder="Examine the optical refraction angle in the main cabinet."
                  className="w-full mt-1 p-2 rounded-xl bg-[#F5EFE2] border border-[#B89758] text-xs text-[#1C3A27] font-body h-16"
                />
              </div>

              <div>
                <label className="text-[9px] font-display font-bold text-[#544431] uppercase">Correct Deduction</label>
                <input
                  type="text"
                  value={questCorrectOption}
                  onChange={(e) => setQuestCorrectOption(e.target.value)}
                  placeholder="Chromatic Dispersion Theory"
                  className="w-full mt-1 p-2 rounded-xl bg-[#F5EFE2] border border-[#B89758] text-xs text-[#1C3A27] font-body"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider"
              >
                Inscribe Treatise (+150 pts reward)
              </button>
            </form>
          )}

          {activeTab === 'qr' && (
            <div className="p-4 rounded-3xl parchment-card border-2 border-[#B89758] text-center space-y-3">
              <h3 className="text-sm font-bold text-[#1C3A27] font-display">Authentication Placard Seal</h3>
              <p className="text-xs text-[#544431] font-body italic">
                Display this physical seal at the reception desk for visiting scholars to scan.
              </p>

              <div className="p-4 bg-white rounded-2xl inline-block shadow border-2 border-[#B89758]">
                <div className="w-36 h-36 bg-[#121A15] rounded-xl flex flex-col items-center justify-center p-2 text-[#FAF8F5] text-center font-mono">
                  <div className="text-[9px] text-[#B89758] font-bold mb-1 font-display">CANTABRIGIA</div>
                  <div className="text-xs font-bold tracking-widest">{selectedVenue.qrSecret}</div>
                  <div className="text-[8px] text-[#A6BAAE] mt-2 font-display">SEAL OF PRESENCE</div>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-[#6B1D23]">
                Token Code: {selectedVenue.qrSecret}
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-[#1C3A27] border border-[#B89758] text-xs font-display font-bold text-[#E2CA8E] hover:text-white flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Placard Parchment</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= LOCAL BUSINESS VIEW ================= */}
      {partnerMode === 'business' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#1C3A27] border border-[#B89758] space-y-1">
            <h3 className="text-sm font-bold text-[#E2CA8E] font-display">Cambridge Merchant Fellowship</h3>
            <p className="text-xs text-[#D1C7B7] font-body italic">
              42 scholars redeemed perks at partner cafes & bookshops this month, generating £380 in footfall spend.
            </p>
          </div>

          <form onSubmit={handleCreateReward} className="p-4 rounded-3xl parchment-card border-2 border-[#B89758] space-y-3">
            <h3 className="text-sm font-bold text-[#1C3A27] font-display flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#6B1D23]" /> Inscribe Merchant Offer
            </h3>

            {rewardSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758] text-xs font-display font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Perk added to the scholar fellowship catalog!
              </div>
            )}

            <div>
              <label className="text-[9px] font-display font-bold text-[#544431] uppercase">Offer Title</label>
              <input
                type="text"
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                placeholder="e.g. Complimentary filter coffee with cake slice"
                required
                className="w-full mt-1 p-2 rounded-xl bg-[#F5EFE2] border border-[#B89758] text-xs text-[#1C3A27] font-body"
              />
            </div>

            <div>
              <label className="text-[9px] font-display font-bold text-[#544431] uppercase">Points Cost</label>
              <input
                type="number"
                value={rewardCost}
                onChange={(e) => setRewardCost(Number(e.target.value))}
                min={50}
                max={500}
                className="w-full mt-1 p-2 rounded-xl bg-[#F5EFE2] border border-[#B89758] text-xs text-[#1C3A27] font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase tracking-wider"
            >
              Affix Fellowship Seal
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
