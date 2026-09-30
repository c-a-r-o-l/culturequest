import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PartnerReward } from '../../types';
import {
  Coins,
  MapPin,
  Clock,
  QrCode,
  CheckCircle2,
  HelpCircle,
  X,
  Ticket,
  Gift,
} from 'lucide-react';
import { triggerHaptic, sound } from '../../utils/audioAndFx';

/**
 * RewardsSection: offers catalog + vouchers, embedded on the Home screen.
 * All redemption flows (confirm sheet, voucher modal, how-to-earn) live here.
 */
export const RewardsSection: React.FC = () => {
  const {
    user,
    rewards,
    redeemReward,
    redeemedVouchers,
    markVoucherUsed,
    expireVoucher,
    activeVoucherModal,
    setActiveVoucherModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'vouchers'>('catalog');
  const [showWaysToEarn, setShowWaysToEarn] = useState(false);
  const [selectedReward, setSelectedReward] = useState<PartnerReward | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeftSecs, setTimeLeftSecs] = useState<number>(600);

  // Live countdown for the open voucher; expires it at zero.
  useEffect(() => {
    if (!activeVoucherModal || activeVoucherModal.status !== 'active') return;

    const tick = () => {
      const remaining = Math.max(0, Math.round((activeVoucherModal.expiresAt - Date.now()) / 1000));
      setTimeLeftSecs(remaining);
      if (remaining <= 0) {
        expireVoucher(activeVoucherModal.id);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeVoucherModal, expireVoucher]);

  const handleStartRedeem = (reward: PartnerReward) => {
    triggerHaptic('light');
    if (user.points < reward.pointsCost) {
      setErrorMessage(`You need ${reward.pointsCost - user.points} more points. Check in at venues or complete quests to earn them.`);
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
      setErrorMessage(result.message);
      setTimeout(() => setErrorMessage(''), 3500);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-ink uppercase tracking-widest font-display flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-gold" /> Rewards
        </h2>
        <button
          onClick={() => {
            triggerHaptic('light');
            setShowWaysToEarn(true);
          }}
          className="text-[11px] font-bold text-teal flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" /> How to earn
        </button>
      </div>

      {/* Error toast */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-vermilion-soft border border-vermilion text-vermilion text-xs font-bold flex items-center gap-2 animate-rise">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-full bg-card p-1 border border-line">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('catalog');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
            activeTab === 'catalog' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          Offers ({rewards.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('vouchers');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
            activeTab === 'vouchers' ? 'bg-ink text-wall' : 'text-muted hover:text-ink'
          }`}
        >
          My vouchers ({redeemedVouchers.length})
        </button>
      </div>

      {/* Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-3">
          {rewards.map((reward) => {
            const canAfford = user.points >= reward.pointsCost;

            return (
              <div key={reward.id} className="ticket rounded-3xl border border-line shadow-sm">
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-wall shrink-0 border border-line">
                      <img src={reward.image} alt={reward.businessName} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-teal-soft text-teal uppercase tracking-wider">
                          {reward.businessType}
                        </span>
                        <span className="text-[10px] text-muted font-mono flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" /> {reward.distanceMeters}m
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-ink font-display mt-1 leading-snug">{reward.title}</h3>
                      <p className="text-[11px] font-bold text-vermilion">{reward.businessName}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted leading-relaxed">{reward.description}</p>

                  {reward.isSponsored && (
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-gold-soft text-[#8A6A10]">
                      {reward.sponsorBadge}
                    </span>
                  )}
                </div>

                <div className="ticket-perf" />

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Coins className="w-4 h-4 text-gold" />
                    <span className="text-sm font-bold text-ink">{reward.pointsCost} pts</span>
                  </div>

                  <button
                    onClick={() => handleStartRedeem(reward)}
                    className={`px-4 py-2 rounded-full font-bold text-xs transition active:scale-95 ${
                      canAfford
                        ? 'bg-vermilion text-white shadow-[0_3px_0_rgba(0,0,0,0.12)]'
                        : 'bg-line text-muted'
                    }`}
                  >
                    {canAfford ? 'Get voucher' : `Need ${reward.pointsCost - user.points} more`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My vouchers */}
      {activeTab === 'vouchers' && (
        <div className="space-y-3">
          {redeemedVouchers.length > 0 ? (
            redeemedVouchers.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveVoucherModal(v);
                }}
                className={`w-full p-4 rounded-3xl border text-left transition ${
                  v.status === 'active'
                    ? 'bg-card border-2 border-gold shadow-sm hover:border-vermilion'
                    : 'bg-wall border-line opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-ink">{v.code}</span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      v.status === 'active'
                        ? 'bg-teal-soft text-teal'
                        : v.status === 'used'
                        ? 'bg-wall text-muted'
                        : 'bg-vermilion-soft text-vermilion'
                    }`}
                  >
                    {v.status === 'active' ? 'Ready to use' : v.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-ink font-display mt-1.5">{v.reward.title}</h4>
                <p className="text-xs text-muted">{v.reward.businessName}</p>

                <div className="mt-3 pt-2 border-t border-line flex items-center justify-between text-[11px] text-muted font-mono">
                  <span>{v.status === 'active' ? 'Show this to staff to redeem' : 'Voucher finished'}</span>
                  <QrCode className="w-4 h-4 text-teal" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-muted text-xs">
              No vouchers yet. Earn points at venues and quests, then grab an offer above.
            </div>
          )}
        </div>
      )}

      {/* Confirm redeem */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-5 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-soft text-gold flex items-center justify-center mx-auto">
              <Ticket className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-ink font-display">Get this voucher?</h3>
              <p className="text-xs text-muted mt-1">{selectedReward.title}</p>
              <p className="text-[11px] text-vermilion font-bold mt-0.5">{selectedReward.businessName}</p>
            </div>

            <div className="p-3 rounded-2xl bg-wall border border-line text-xs text-muted text-left space-y-1">
              <div>• Cost: <strong className="text-ink font-mono">{selectedReward.pointsCost} points</strong></div>
              <div>• Balance after: <strong className="text-ink font-mono">{user.points - selectedReward.pointsCost} points</strong></div>
              <div>• Valid for 10 minutes once issued — show the code to staff.</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 py-3 rounded-xl bg-wall border border-line text-muted font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 py-3 rounded-xl bg-vermilion text-white font-bold text-sm shadow-[0_3px_0_rgba(0,0,0,0.12)] active:translate-y-0.5"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher modal */}
      {activeVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-6 shadow-2xl text-center relative overflow-hidden">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveVoucherModal(null);
              }}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-wall border border-line text-muted flex items-center justify-center hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>

            {activeVoucherModal.status !== 'active' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <span
                  className={`px-5 py-2 rounded-lg border-4 font-black text-2xl font-display tracking-[0.2em] bg-white/85 rotate-[-8deg] ${
                    activeVoucherModal.status === 'used' ? 'border-teal text-teal' : 'border-muted text-muted'
                  }`}
                >
                  {activeVoucherModal.status === 'used' ? 'USED' : 'EXPIRED'}
                </span>
              </div>
            )}

            <span className="text-[9px] font-bold uppercase tracking-widest text-teal bg-teal-soft px-3 py-1 rounded-full border border-teal/30">
              {activeVoucherModal.status === 'active' ? 'Voucher — show to staff' : `Voucher ${activeVoucherModal.status}`}
            </span>

            <h3 className="text-base font-black text-ink font-display mt-2">{activeVoucherModal.reward.title}</h3>
            <p className="text-xs text-vermilion font-bold">{activeVoucherModal.reward.businessName}</p>

            {/* Countdown */}
            {activeVoucherModal.status === 'active' && (
              <div className="my-3 py-1.5 px-4 rounded-full bg-wall border border-line inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-vermilion" />
                <span className="text-xs font-mono font-bold text-ink">{formatCountdown(timeLeftSecs)} left</span>
              </div>
            )}

            {/* Code card */}
            <div className="my-3 p-4 bg-white rounded-3xl inline-block shadow-sm border border-line">
              <div className="w-44 rounded-2xl p-3 flex flex-col items-center gap-2 border border-line bg-wall/60">
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 rounded-lg border-2 border-ink flex items-center justify-center">
                    <div className="w-5 h-5 bg-ink rounded-sm" />
                  </div>
                  <div className="w-10 h-10 rounded-lg border-2 border-ink flex items-center justify-center">
                    <div className="w-5 h-5 bg-ink rounded-sm" />
                  </div>
                </div>
                <div className="text-ink font-mono font-bold text-xs tracking-widest">{activeVoucherModal.code}</div>
                <div className="w-full flex justify-between">
                  <div className="w-10 h-10 rounded-lg border-2 border-ink flex items-center justify-center">
                    <div className="w-5 h-5 bg-ink rounded-sm" />
                  </div>
                  <div className="w-10 h-10 bg-vermilion rounded-lg flex items-center justify-center text-[9px] font-bold text-white font-display">
                    CQ
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm font-mono font-black text-ink tracking-widest">{activeVoucherModal.code}</div>
            <p className="text-[11px] text-muted mt-1">Hand your phone to staff — they'll verify the code.</p>

            {/* Demo: mark used */}
            {activeVoucherModal.status === 'active' ? (
              <button
                onClick={() => {
                  triggerHaptic('success');
                  sound.playCoin();
                  markVoucherUsed(activeVoucherModal.id);
                }}
                className="mt-4 w-full py-2.5 rounded-xl bg-teal text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 active:translate-y-0.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as used (demo)</span>
              </button>
            ) : (
              <div className="mt-4 p-2 bg-wall border border-line rounded-xl text-xs text-muted font-bold">
                {activeVoucherModal.status === 'used' ? '✓ Redeemed at the shop' : 'This voucher has expired'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ways to earn */}
      {showWaysToEarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="text-base font-black text-ink font-display flex items-center gap-2">
                <Gift className="w-4 h-4 text-gold" /> How to earn points
              </h3>
              <button
                onClick={() => setShowWaysToEarn(false)}
                className="w-7 h-7 rounded-full bg-wall text-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-ink">
              <div className="p-2.5 rounded-xl bg-wall border border-line flex items-center justify-between">
                <span>📍 Check in at any venue</span>
                <strong className="font-mono text-vermilion">+50 pts</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-wall border border-line flex items-center justify-between">
                <span>⭐ First visit to a new venue (2x)</span>
                <strong className="font-mono text-vermilion">+100 pts</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-wall border border-line flex items-center justify-between">
                <span>🎟️ Complete a quest</span>
                <strong className="font-mono text-vermilion">+120–450 pts</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-wall border border-line flex items-center justify-between">
                <span>🎟️ Book a visit</span>
                <strong className="font-mono text-vermilion">+60 pts</strong>
              </div>
            </div>

            <button
              onClick={() => setShowWaysToEarn(false)}
              className="w-full py-3 rounded-xl bg-ink text-wall font-bold text-xs active:translate-y-0.5 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
