import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PartnerReward, RedeemedVoucher } from '../../types';
import {
  Gift,
  Coins,
  Coffee,
  BookOpen,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Flame,
} from 'lucide-react';
import { triggerHaptic, sound, fireConfetti } from '../../utils/audioAndFx';

export const RewardsView: React.FC = () => {
  const {
    user,
    rewards,
    redeemReward,
    redeemedVouchers,
    markVoucherUsed,
    activeVoucherModal,
    setActiveVoucherModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'vouchers'>('catalog');
  const [showWaysToEarn, setShowWaysToEarn] = useState(false);
  const [selectedReward, setSelectedReward] = useState<PartnerReward | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Live countdown timer for active modal voucher
  const [timeLeftSecs, setTimeLeftSecs] = useState<number>(600);

  useEffect(() => {
    if (!activeVoucherModal) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((activeVoucherModal.expiresAt - Date.now()) / 1000));
      setTimeLeftSecs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVoucherModal]);

  const handleStartRedeem = (reward: PartnerReward) => {
    triggerHaptic('light');
    if (user.points < reward.pointsCost) {
      setErrorMessage(`You need ${reward.pointsCost - user.points} more points! Visit more museums or complete quests.`);
      setTimeout(() => setErrorMessage(''), 3500);
      return;
    }
    setSelectedReward(reward);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;
    const result = redeemReward(selectedReward.id);
    setSelectedReward(null);
    if (!result.success) {
      alert(result.message);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Points Summary Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-indigo-950 to-slate-900 border border-amber-400/40 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Available Points Balance
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <Coins className="w-7 h-7 text-amber-400 fill-amber-400" />
            <span className="text-3xl font-black text-amber-300 font-['Outfit']">{user.points}</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Estimated £{(user.points * 0.04).toFixed(2)} in local Cambridge rewards
          </span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setShowWaysToEarn(true);
          }}
          className="px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-amber-400 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Ways to Earn</span>
        </button>
      </div>

      {/* Error alert toast */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('catalog');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'catalog' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Partner Perks ({rewards.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('vouchers');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'vouchers' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          My Vouchers ({redeemedVouchers.length})
        </button>
      </div>

      {/* REWARD OFFERS GRID */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          {rewards.map((reward) => {
            const canAfford = user.points >= reward.pointsCost;

            return (
              <div
                key={reward.id}
                className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <img src={reward.image} alt={reward.businessName} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                        {reward.businessType}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-rose-400" /> {reward.distanceMeters}m
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white mt-1">{reward.title}</h3>
                    <p className="text-[11px] font-bold text-amber-400">{reward.businessName}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{reward.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black text-amber-300">{reward.pointsCost} Points</span>
                  </div>

                  <button
                    onClick={() => handleStartRedeem(reward)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition shadow flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 active:translate-y-0.5'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <span>{canAfford ? 'Redeem Perk' : 'Need More Points'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MY VOUCHERS LIST */}
      {activeTab === 'vouchers' && (
        <div className="space-y-3">
          {redeemedVouchers.length > 0 ? (
            redeemedVouchers.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveVoucherModal(v);
                }}
                className={`p-4 rounded-3xl border text-left cursor-pointer transition ${
                  v.status === 'active'
                    ? 'bg-indigo-950/70 border-amber-400/80 shadow-md hover:border-amber-300'
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-amber-400">{v.code}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {v.status.toUpperCase()}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white mt-1.5">{v.reward.title}</h4>
                <p className="text-xs text-slate-400">{v.reward.businessName}</p>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tap to open live barcode & staff verification</span>
                  <QrCode className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              No redeemed vouchers yet. Earn points by visiting Cambridge venues!
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION SHEET */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-amber-400/70 p-5 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
              <Gift className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white font-['Outfit']">Redeem this Perk?</h3>
              <p className="text-xs text-slate-300 mt-1">{selectedReward.title}</p>
              <p className="text-[11px] text-amber-400 font-bold mt-0.5">{selectedReward.businessName}</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
              <div>• Cost: <strong>{selectedReward.pointsCost} Points</strong></div>
              <div>• Balance after: <strong>{user.points - selectedReward.pointsCost} Points</strong></div>
              <div>• Note: Once redeemed, you will get a 10-minute live QR code to show at the counter.</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 py-3 rounded-xl bg-slate-900 text-slate-300 font-bold text-xs hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow"
              >
                Confirm & Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC 10-MINUTE VOUCHER MODAL */}
      {activeVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-amber-400 p-6 shadow-2xl text-center relative overflow-hidden">
            {/* Close */}
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveVoucherModal(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              {activeVoucherModal.status === 'used' ? 'Voucher Redeemed' : 'Live Partner Voucher'}
            </span>

            <h3 className="text-lg font-black text-white mt-2 font-['Outfit']">{activeVoucherModal.reward.title}</h3>
            <p className="text-xs text-amber-400 font-bold">{activeVoucherModal.reward.businessName}</p>

            {/* Countdown Clock */}
            {activeVoucherModal.status === 'active' && (
              <div className="my-3 py-2 px-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400 animate-spin [animation-duration:10s]" />
                <span className="text-sm font-mono font-black text-rose-300">
                  {formatCountdown(timeLeftSecs)} remaining
                </span>
              </div>
            )}

            {/* Big QR Code Graphic */}
            <div className="my-3 p-4 bg-white rounded-3xl inline-block shadow-xl">
              {/* SVG QR Code Simulation */}
              <div className="w-44 h-44 bg-slate-950 rounded-2xl p-2 flex flex-col items-center justify-between">
                <div className="w-full flex justify-between">
                  <div className="w-12 h-12 border-4 border-amber-400 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-amber-400 rounded-sm" />
                  </div>
                  <div className="w-12 h-12 border-4 border-amber-400 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-amber-400 rounded-sm" />
                  </div>
                </div>

                <div className="text-white font-mono font-black text-xs tracking-wider">
                  {activeVoucherModal.code}
                </div>

                <div className="w-full flex justify-between">
                  <div className="w-12 h-12 border-4 border-amber-400 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-amber-400 rounded-sm" />
                  </div>
                  <div className="w-10 h-10 bg-amber-400/30 rounded-lg flex items-center justify-center text-[10px] font-bold text-amber-300">
                    CQ
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs font-mono font-black text-amber-300 tracking-widest text-lg">
              {activeVoucherModal.code}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Show this screen to barista or bookseller to scan.</p>

            {/* Merchant validation trigger */}
            {activeVoucherModal.status === 'active' ? (
              <button
                onClick={() => {
                  triggerHaptic('success');
                  sound.playCoin();
                  markVoucherUsed(activeVoucherModal.id);
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Partner Redemption (Mark Used)</span>
              </button>
            ) : (
              <div className="mt-4 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500 font-bold">
                ✓ Voucher has been redeemed
              </div>
            )}
          </div>
        </div>
      )}

      {/* WAYS TO EARN SHEET */}
      {showWaysToEarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Ways to Earn Points
              </h3>
              <button
                onClick={() => setShowWaysToEarn(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>📍 Check in at any museum</span>
                <strong className="text-amber-400">+50 Points</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>⭐ First visit to a new venue (2x)</span>
                <strong className="text-amber-400">+100 Points</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>🧩 Complete a trivia or scavenger hunt</span>
                <strong className="text-amber-400">+140 - 250 Points</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>🔥 Maintain a 7-day streak</span>
                <strong className="text-amber-400">+150 Bonus Points</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span>🚶 3 venues in 7 days (Route trail)</span>
                <strong className="text-amber-400">+450 Points</strong>
              </div>
            </div>

            <button
              onClick={() => setShowWaysToEarn(false)}
              className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow hover:bg-amber-300"
            >
              Let's Quest!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
