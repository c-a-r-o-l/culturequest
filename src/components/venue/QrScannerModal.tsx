import React, { useState } from 'react';
import { Venue } from '../../types';
import { X, QrCode, Camera, ShieldCheck, Zap, Scroll, BookOpen } from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

interface QrScannerModalProps {
  venue: Venue;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  venue,
  onClose,
  onScanSuccess,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulateScan = () => {
    triggerHaptic('success');
    sound.playSonar();
    onScanSuccess(venue.qrSecret);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim().toUpperCase() === venue.qrSecret.toUpperCase()) {
      triggerHaptic('success');
      sound.playSonar();
      onScanSuccess(venue.qrSecret);
    } else {
      triggerHaptic('medium');
      setErrorMsg(`Invalid authentication token. Example: ${venue.qrSecret}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#121A15] border-2 border-[#B89758] p-5 shadow-2xl flex flex-col text-[#FAF8F5]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#B89758]/40">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#E2CA8E]" />
            <h3 className="text-sm font-bold font-display text-[#FAF8F5]">Archival Token Authentication</h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-[#1C3A27] border border-[#B89758]/60 text-[#D1C7B7] flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Target */}
        <div className="my-4 relative h-60 w-full rounded-2xl bg-[#0B120E] border border-[#B89758]/60 flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Gold Laser Line */}
          <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#E2CA8E] to-transparent shadow-[0_0_12px_#B89758] animate-[bounce_2s_infinite]" />

          {/* Brass Target Corners */}
          <div className="w-40 h-40 border-2 border-[#B89758]/80 rounded-2xl relative flex items-center justify-center p-3 text-center">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#B89758] -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#B89758] translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#B89758] -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#B89758] translate-x-1 translate-y-1" />

            <div className="space-y-1 pointer-events-none">
              <Camera className="w-8 h-8 text-[#E2CA8E] mx-auto animate-pulse" />
              <div className="text-[10px] font-bold font-display text-[#D1C7B7]">Align with Reception Seal Placard</div>
            </div>
          </div>

          <div className="absolute bottom-2 text-[10px] font-mono text-[#879B8E] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#B89758]" />
            <span>Rotates daily to prevent screenshot forgery</span>
          </div>
        </div>

        {/* Instant Verification Button */}
        <button
          onClick={handleSimulateScan}
          className="w-full py-3 px-4 rounded-xl bg-[#1C3A27] hover:bg-[#234731] border border-[#B89758] text-[#E2CA8E] font-display font-bold text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 mb-3 active:scale-98 transition"
        >
          <Zap className="w-4 h-4 text-[#B89758]" />
          <span>Simulate Scanning Venue Token</span>
        </button>

        {/* Manual Code Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <div className="text-[9px] font-bold font-display uppercase tracking-widest text-[#B89758]">
            Or Inscribe Archival Code
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value);
                setErrorMsg('');
              }}
              placeholder={`e.g. ${venue.qrSecret}`}
              className="flex-1 px-3 py-2 rounded-xl bg-[#1C3A27] border border-[#B89758]/60 text-xs font-mono font-bold text-[#FAF8F5] uppercase focus:outline-none focus:border-[#E2CA8E]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#6B1D23] border border-[#B89758] text-[#FAF8F5] font-display font-bold text-xs rounded-xl shadow hover:opacity-90"
            >
              Verify
            </button>
          </div>
          {errorMsg && <p className="text-[10px] text-[#FF8A8A] font-bold font-body">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};
