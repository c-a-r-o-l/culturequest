import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PartnerReward, RedeemedVoucher } from '../../types';
import {
  Coins,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Award,
  Feather,
  BookOpen,
} from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

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
      setErrorMessage(`You require ${reward.pointsCost - user.points} more honorarium points. Matriculate at Cambridge archives to earn.`);
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
      {/* Top Honorarium Balance Banner */}
      <div className="p-4 rounded-3xl bg-[#1C3A27] border-2 border-[#B89758] shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold font-display uppercase tracking-widest text-[#B89758] block">
            Fellowship Honorarium Balance
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <Feather className="w-6 h-6 text-[#E2CA8E]" />
            <span className="text-3xl font-black text-[#FAF8F5] font-mono">{user.points}</span>
            <span className="text-xs font-display text-[#B89758]">pts</span>
          </div>
          <span className="text-[11px] text-[#A6BAAE] font-body italic mt-1 block">
            Yields approximately £{(user.points * 0.04).toFixed(2)} in local Cambridge bookshop & cafe perks
          </span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setShowWaysToEarn(true);
          }}
          className="px-3 py-2 rounded-xl bg-[#122419] border border-[#B89758] text-xs font-display font-bold text-[#E2CA8E] flex items-center gap-1.5 shadow"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#B89758]" />
          <span>Charter</span>
        </button>
      </div>

      {/* Error alert toast */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-[#6B1D23] border border-[#B89758] text-[#FAF8F5] text-xs font-body font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E2CA8E]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#1C3A27] p-1 border border-[#B89758]/60">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('catalog');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition ${
            activeTab === 'catalog'
              ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]'
              : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          Merchant Guilds ({rewards.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('vouchers');
          }}
          className={`flex-1 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-xl transition ${
            activeTab === 'vouchers'
              ? 'bg-[#122419] text-[#E2CA8E] border border-[#B89758]'
              : 'text-[#879B8E] hover:text-[#FAF8F5]'
          }`}
        >
          Sealed Vouchers ({redeemedVouchers.length})
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
                className="p-4 rounded-3xl parchment-card border border-[#B89758]/70 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#1C3A27] shrink-0 border border-[#B89758]/60">
                    <img src={reward.image} alt={reward.businessName} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-[#1C3A27] text-[#E2CA8E] font-display uppercase tracking-wider">
                        {reward.businessType}
                      </span>
                      <span className="text-[10px] text-[#544431] font-mono flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#6B1D23]" /> {reward.distanceMeters}m
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#1C3A27] font-display mt-1">{reward.title}</h3>
                    <p className="text-[11px] font-display font-bold text-[#6B1D23]">{reward.businessName}</p>
                  </div>
                </div>

                <p className="text-xs text-[#304135] font-body leading-relaxed italic">{reward.description}</p>

                <div className="pt-2 border-t border-[#B89758]/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Feather className="w-4 h-4 text-[#B89758]" />
                    <span className="text-sm font-bold text-[#1C3A27]">{reward.pointsCost} Points</span>
                  </div>

                  <button
                    onClick={() => handleStartRedeem(reward)}
                    className={`px-4 py-2 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition ${
                      canAfford
                        ? 'btn-wax-seal border border-[#B89758] text-[#FAF8F5]'
                        : 'bg-[#1C3A27] text-[#879B8E] border border-[#B89758]/40'
                    }`}
                  >
                    <span>{canAfford ? 'Redeem Fellowship' : 'Insufficient Points'}</span>
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
                    ? 'parchment-card border-2 border-[#6B1D23] shadow-md hover:border-[#B89758]'
                    : 'bg-[#142018] border-[#1C3A27] opacity-60 text-[#879B8E]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-[#6B1D23]">{v.code}</span>
                  <span
                    className={`text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      v.status === 'active'
                        ? 'bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758]'
                        : 'bg-[#122419] text-[#879B8E]'
                    }`}
                  >
                    {v.status.toUpperCase()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#1C3A27] font-display mt-1.5">{v.reward.title}</h4>
                <p className="text-xs text-[#544431] font-body italic">{v.reward.businessName}</p>

                <div className="mt-3 pt-2 border-t border-[#B89758]/30 flex items-center justify-between text-[11px] text-[#544431] font-mono">
                  <span>Display to partner barista / bookseller</span>
                  <QrCode className="w-4 h-4 text-[#B89758]" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#879B8E] text-xs font-display">
              No redeemed vouchers yet. Matriculate at Cambridge archives to earn honorarium!
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION SHEET */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl parchment-card border-2 border-[#B89758] p-5 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6B1D23] border border-[#B89758] text-[#E2CA8E] flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1C3A27] font-display">Claim Fellowship Perk?</h3>
              <p className="text-xs text-[#304135] font-body mt-1">{selectedReward.title}</p>
              <p className="text-[11px] text-[#6B1D23] font-display font-bold mt-0.5">{selectedReward.businessName}</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#1C3A27] border border-[#B89758]/50 text-xs text-[#D1C7B7] text-left space-y-1 font-body">
              <div>• Cost: <strong className="text-[#E2CA8E] font-mono">{selectedReward.pointsCost} Points</strong></div>
              <div>• Balance after: <strong className="text-[#E2CA8E] font-mono">{user.points - selectedReward.pointsCost} Points</strong></div>
              <div>• Issue: 10-minute dynamic authentication token for counter staff.</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 py-3 rounded-xl bg-[#1C3A27] text-[#D1C7B7] font-display font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 py-3 rounded-xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase"
              >
                Affix Seal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC 10-MINUTE VOUCHER MODAL */}
      {activeVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm rounded-3xl parchment-card border-2 border-[#B89758] p-6 shadow-2xl text-center relative overflow-hidden">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveVoucherModal(null);
              }}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#1C3A27] text-[#E2CA8E] border border-[#B89758] flex items-center justify-center hover:opacity-80"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[9px] font-display font-bold uppercase tracking-widest text-[#6B1D23] bg-[#6B1D23]/10 px-3 py-1 rounded-full border border-[#6B1D23]/30">
              {activeVoucherModal.status === 'used' ? 'Voucher Inscribed (Used)' : 'Live Fellow Voucher'}
            </span>

            <h3 className="text-base font-bold text-[#1C3A27] font-display mt-2">{activeVoucherModal.reward.title}</h3>
            <p className="text-xs text-[#6B1D23] font-display font-bold">{activeVoucherModal.reward.businessName}</p>

            {/* Countdown Clock */}
            {activeVoucherModal.status === 'active' && (
              <div className="my-3 py-1.5 px-4 rounded-xl bg-[#1C3A27] border border-[#B89758] inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E2CA8E] animate-spin [animation-duration:12s]" />
                <span className="text-xs font-mono font-bold text-[#FAF8F5]">
                  {formatCountdown(timeLeftSecs)} expiration window
                </span>
              </div>
            )}

            {/* Big Ink Stamp QR Code */}
            <div className="my-3 p-4 bg-white rounded-3xl inline-block shadow-lg border border-[#B89758]">
              <div className="w-44 h-44 bg-[#121A15] rounded-2xl p-2 flex flex-col items-center justify-between border border-[#B89758]/50">
                <div className="w-full flex justify-between">
                  <div className="w-12 h-12 border-4 border-[#B89758] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#B89758] rounded-sm" />
                  </div>
                  <div className="w-12 h-12 border-4 border-[#B89758] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#B89758] rounded-sm" />
                  </div>
                </div>

                <div className="text-[#FAF8F5] font-mono font-bold text-xs tracking-widest">
                  {activeVoucherModal.code}
                </div>

                <div className="w-full flex justify-between">
                  <div className="w-12 h-12 border-4 border-[#B89758] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#B89758] rounded-sm" />
                  </div>
                  <div className="w-10 h-10 bg-[#6B1D23] border border-[#B89758] rounded-lg flex items-center justify-center text-[10px] font-bold text-[#E2CA8E] font-display">
                    CTB
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm font-mono font-black text-[#6B1D23] tracking-widest">
              {activeVoucherModal.code}
            </div>
            <p className="text-[11px] text-[#544431] font-body mt-1">Present to merchant staff for inspection.</p>

            {/* Merchant redemption button */}
            {activeVoucherModal.status === 'active' ? (
              <button
                onClick={() => {
                  triggerHaptic('success');
                  sound.playCoin();
                  markVoucherUsed(activeVoucherModal.id);
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#1C3A27] border border-[#B89758] text-[#E2CA8E] font-display font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#B89758]" />
                <span>Simulate Partner Seal (Mark Redeemed)</span>
              </button>
            ) : (
              <div className="mt-4 p-2 bg-[#1C3A27] border border-[#B89758] rounded-xl text-xs text-[#E2CA8E] font-display font-bold">
                ✓ Voucher has been redeemed
              </div>
            )}
          </div>
        </div>
      )}

      {/* WAYS TO EARN CHARTER */}
      {showWaysToEarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl parchment-card border-2 border-[#B89758] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#B89758]/40">
              <h3 className="text-base font-bold text-[#1C3A27] font-display flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B89758]" /> Honorarium Charter
              </h3>
              <button
                onClick={() => setShowWaysToEarn(false)}
                className="w-7 h-7 rounded-full bg-[#1C3A27] text-[#E2CA8E] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-body text-[#1C3A27]">
              <div className="p-2.5 rounded-xl bg-[#F5EFE2] border border-[#B89758]/50 flex items-center justify-between">
                <span>📍 Record presence at any Cambridge archive</span>
                <strong className="font-mono text-[#6B1D23]">+50 pts</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5EFE2] border border-[#B89758]/50 flex items-center justify-between">
                <span>⭐ First matriculation at new archive (2x)</span>
                <strong className="font-mono text-[#6B1D23]">+100 pts</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5EFE2] border border-[#B89758]/50 flex items-center justify-between">
                <span>📜 Decipher an inquiry treatise</span>
                <strong className="font-mono text-[#6B1D23]">+140 - 250 pts</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F5EFE2] border border-[#B89758]/50 flex items-center justify-between">
                <span>🔥 7-day academic streak maintained</span>
                <strong className="font-mono text-[#6B1D23]">+150 pts</strong>
              </div>
            </div>

            <button
              onClick={() => setShowWaysToEarn(false)}
              className="w-full py-3 rounded-xl btn-wax-seal border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs uppercase"
            >
              Affirm Charter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
