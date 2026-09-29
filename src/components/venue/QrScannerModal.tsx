import React, { useState, useEffect } from 'react';
import { Venue } from '../../types';
import { X, QrCode, Camera, ShieldCheck, Zap, Sparkles } from 'lucide-react';
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
  const [isScanning, setIsScanning] = useState(true);
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
      setErrorMsg(`Invalid code. Expected code like ${venue.qrSecret}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white">Proof of Presence Scan</h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Target */}
        <div className="my-4 relative h-60 w-full rounded-2xl bg-slate-900 border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Laser Line */}
          <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#f59e0b] animate-[bounce_2s_infinite]" />

          {/* Target Corners */}
          <div className="w-40 h-40 border-2 border-amber-400/80 rounded-2xl relative flex items-center justify-center p-3 text-center">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -translate-x-1 -translate-y-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 translate-x-1 translate-y-1" />

            <div className="space-y-1 pointer-events-none">
              <Camera className="w-8 h-8 text-amber-400/80 mx-auto animate-pulse" />
              <div className="text-[11px] font-bold text-slate-300">Point at {venue.name} Entrance QR</div>
            </div>
          </div>

          <div className="absolute bottom-2 text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Rotates daily to prevent screenshot fraud</span>
          </div>
        </div>

        {/* Instant Test Button (for preview/desktop) */}
        <button
          onClick={handleSimulateScan}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 mb-3 active:scale-98 transition"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Simulate Scanning Venue QR Code</span>
        </button>

        {/* Manual Code Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Or Enter Venue Code
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
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white uppercase focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-amber-300"
            >
              Verify
            </button>
          </div>
          {errorMsg && <p className="text-[10px] text-rose-400 font-bold">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};
