import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Coffee,
  Plus,
  BarChart3,
  CheckCircle2,
  ArrowLeft,
  Printer,
  TrendingUp,
} from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

export const PartnerDashboard: React.FC = () => {
  const { partnerMode, setPartnerMode, venues, addNewCustomQuest, addNewCustomReward } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'quests' | 'qr'>('analytics');
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0].id);

  // New quest form
  const [questTitle, setQuestTitle] = useState('');
  const [questType, setQuestType] = useState<'trivia' | 'scavenger'>('trivia');
  const [questPoints, setQuestPoints] = useState(150);
  const [questQuestion, setQuestQuestion] = useState('');
  const [questCorrectOption, setQuestCorrectOption] = useState('');
  const [questSuccessMsg, setQuestSuccessMsg] = useState(false);

  // New reward form
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
      steps: [
        {
          id: 's-' + Date.now(),
          title: questTitle,
          description: questQuestion || 'Find the featured object and answer this.',
          type: 'trivia',
          options: [
            questCorrectOption || 'Correct Answer',
            'Alternative B',
            'Alternative C',
            'Alternative D',
          ],
          correctOptionIndex: 0,
          explanation: 'Curator-verified exhibit fact.',
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
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Top header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('user');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-line text-xs font-bold text-ink hover:text-vermilion"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit portal</span>
        </button>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-vermilion-soft text-vermilion">
          PARTNER DEMO
        </span>
      </div>

      {/* Role toggle */}
      <div className="flex rounded-full bg-card p-1 border border-line">
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('museum');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition ${
            partnerMode === 'museum' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-teal" />
          <span>Museum portal</span>
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setPartnerMode('business');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full flex items-center justify-center gap-1.5 transition ${
            partnerMode === 'business' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 text-vermilion" />
          <span>Shop portal</span>
        </button>
      </div>

      {/* ============ MUSEUM VIEW ============ */}
      {partnerMode === 'museum' && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-1">
              Your venue:
            </label>
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-card border border-line text-xs font-bold text-ink focus:outline-none focus:border-teal"
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 border-b border-line pb-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-1 ${activeTab === 'analytics' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}
            >
              Traffic
            </button>
            <button
              onClick={() => setActiveTab('quests')}
              className={`pb-1 ${activeTab === 'quests' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}
            >
              New quest
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`pb-1 ${activeTab === 'qr' ? 'text-teal border-b-2 border-teal' : 'text-muted'}`}
            >
              QR code
            </button>
          </div>

          {activeTab === 'analytics' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-card border border-line">
                  <div className="text-2xl font-bold font-mono text-ink">{selectedVenue.weeklyVisitors}</div>
                  <div className="text-[9px] text-muted font-bold uppercase">Visits this week</div>
                  <div className="text-[10px] text-teal mt-1 flex items-center gap-1 font-bold">
                    <TrendingUp className="w-3 h-3" /> +34% footfall
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-line">
                  <div className="text-2xl font-bold font-mono text-vermilion">76%</div>
                  <div className="text-[9px] text-muted font-bold uppercase">Aged 16–24</div>
                  <div className="text-[10px] text-muted italic mt-1">High student interest</div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-card border border-line space-y-2">
                <h4 className="text-xs font-bold text-ink font-display flex items-center gap-1.5 uppercase tracking-wider">
                  <BarChart3 className="w-4 h-4 text-teal" /> Peak check-in hours
                </h4>
                <div className="space-y-1 text-xs text-muted">
                  <div className="flex justify-between">
                    <span>11:00 – 13:00</span>
                    <span className="font-mono text-teal font-bold">38% of visits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>14:30 – 16:30</span>
                    <span className="font-mono text-teal font-bold">45% of visits</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <form onSubmit={handleCreateQuest} className="space-y-3 p-4 rounded-3xl bg-card border border-line">
              <h3 className="text-sm font-black text-ink font-display flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-vermilion" /> Create a quest
              </h3>

              {questSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-teal-soft text-teal border border-teal text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Quest published to the app!
                </div>
              )}

              <div>
                <label className="text-[9px] font-bold text-muted uppercase">Quest title</label>
                <input
                  type="text"
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  placeholder="e.g. Mystery of Newton's Prism"
                  required
                  className="w-full mt-1 p-2 rounded-xl bg-wall border border-line text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-muted uppercase">Clue / question</label>
                <textarea
                  value={questQuestion}
                  onChange={(e) => setQuestQuestion(e.target.value)}
                  placeholder="Find the prism cabinet and answer…"
                  className="w-full mt-1 p-2 rounded-xl bg-wall border border-line text-xs text-ink h-16"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-muted uppercase">Correct answer</label>
                <input
                  type="text"
                  value={questCorrectOption}
                  onChange={(e) => setQuestCorrectOption(e.target.value)}
                  placeholder="Light splits into colours"
                  className="w-full mt-1 p-2 rounded-xl bg-wall border border-line text-xs text-ink"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-vermilion text-white font-bold text-xs shadow-[0_3px_0_rgba(0,0,0,0.12)] active:translate-y-0.5"
              >
                Publish quest (+{questPoints} pts reward)
              </button>
            </form>
          )}

          {activeTab === 'qr' && (
            <div className="p-4 rounded-3xl bg-card border border-line text-center space-y-3">
              <h3 className="text-sm font-black text-ink font-display">Check-in QR code</h3>
              <p className="text-xs text-muted">
                Print this and place it at reception — visitors scan it to check in.
              </p>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-sm border border-line">
                <div className="w-36 h-36 rounded-xl flex flex-col items-center justify-center p-2 text-center font-mono bg-wall/70 border border-line">
                  <div className="text-[9px] text-teal font-bold mb-1">CULTUREQUEST</div>
                  <div className="text-xs font-bold tracking-widest text-ink">{selectedVenue.qrSecret}</div>
                  <div className="text-[8px] text-muted mt-2">SCAN TO CHECK IN</div>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-ink">Code: {selectedVenue.qrSecret}</div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-card border border-line text-xs font-bold text-ink hover:text-teal flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print QR poster</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============ BUSINESS VIEW ============ */}
      {partnerMode === 'business' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-card border border-line space-y-1">
            <h3 className="text-sm font-black text-ink font-display">Your shop on CultureQuest</h3>
            <p className="text-xs text-muted">
              42 vouchers redeemed at partner shops this month, driving £380 in footfall spend.
            </p>
          </div>

          <form onSubmit={handleCreateReward} className="p-4 rounded-3xl bg-card border border-line space-y-3">
            <h3 className="text-sm font-black text-ink font-display flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-vermilion" /> Create an offer
            </h3>

            {rewardSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-teal-soft text-teal border border-teal text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Offer added to the rewards catalog!
              </div>
            )}

            <div>
              <label className="text-[9px] font-bold text-muted uppercase">Offer title</label>
              <input
                type="text"
                value={rewardTitle}
                onChange={(e) => setRewardTitle(e.target.value)}
                placeholder="e.g. Free coffee with any cake"
                required
                className="w-full mt-1 p-2 rounded-xl bg-wall border border-line text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-muted uppercase">Points cost</label>
              <input
                type="number"
                value={rewardCost}
                onChange={(e) => setRewardCost(Number(e.target.value))}
                min={50}
                max={500}
                className="w-full mt-1 p-2 rounded-xl bg-wall border border-line text-xs text-ink font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-vermilion text-white font-bold text-xs shadow-[0_3px_0_rgba(0,0,0,0.12)] active:translate-y-0.5"
            >
              Publish offer
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
