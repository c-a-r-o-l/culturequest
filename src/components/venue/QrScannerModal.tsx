import React, { useState } from 'react';
import { Venue } from '../../types';
import { X, QrCode, Camera, ShieldCheck, Zap } from 'lucide-react';
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
      setErrorMsg(`That code doesn't match. Demo code: ${venue.qrSecret}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 animate-rise">
      <div className="w-full max-w-sm rounded-3xl bg-card border border-line p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-teal" />
            <h3 className="text-sm font-black text-ink font-display">Scan venue QR</h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-wall border border-line text-muted flex items-center justify-center hover:text-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="my-4 relative h-52 w-full rounded-2xl bg-wall border border-line flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-teal to-transparent animate-[bounce_2s_infinite]" />

          <div className="w-36 h-36 border-2 border-teal/80 rounded-2xl relative flex items-center justify-center p-3 text-center">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-teal -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-teal translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-teal -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-teal translate-x-1 translate-y-1" />

            <div className="space-y-1 pointer-events-none">
              <Camera className="w-8 h-8 text-teal mx-auto animate-pulse" />
              <div className="text-[10px] font-bold text-muted">Point at the venue's QR poster</div>
            </div>
          </div>

          <div className="absolute bottom-2 text-[10px] font-mono text-muted flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-teal" />
            <span>Codes rotate daily</span>
          </div>
        </div>

        {/* Demo scan */}
        <button
          onClick={handleSimulateScan}
          className="w-full py-3 px-4 rounded-xl bg-teal text-white font-bold text-xs shadow flex items-center justify-center gap-2 mb-3 active:translate-y-0.5 transition"
        >
          <Zap className="w-4 h-4 fill-gold text-gold" />
          <span>Simulate scan (demo)</span>
        </button>

        {/* Manual entry */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <div className="text-[9px] font-bold uppercase tracking-widest text-muted">Or type the code</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => {
                setManualCode(e.target.value);
                setErrorMsg('');
              }}
              placeholder={venue.qrSecret}
              className="flex-1 px-3 py-2 rounded-xl bg-wall border border-line text-xs font-mono font-bold text-ink uppercase focus:outline-none focus:border-teal"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-vermilion text-white font-bold text-xs rounded-xl shadow-sm active:translate-y-0.5"
            >
              Check in
            </button>
          </div>
          {errorMsg && <p className="text-[10px] text-vermilion font-bold">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};
