import React, { useState } from 'react';
import { Venue } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Minus, Plus, Ticket, Sparkles } from 'lucide-react';
import { sound, triggerHaptic } from '../../utils/audioAndFx';

interface BookingModalProps {
  venue: Venue;
  onClose: () => void;
}

const TIME_SLOTS = ['10:00', '11:30', '13:00', '14:30', '16:00'];

export const BookingModal: React.FC<BookingModalProps> = ({ venue, onClose }) => {
  const { bookVisit } = useApp();

  const [dateIdx, setDateIdx] = useState(0);
  const [time, setTime] = useState(TIME_SLOTS[1]);
  const [tickets, setTickets] = useState(2);

  const dateOptions = [0, 1, 2].map((offset) => {
    const d = new Date(Date.now() + offset * 86400000);
    return {
      offset,
      label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' }),
      full: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });

  const handleConfirm = () => {
    const date = dateOptions[dateIdx];
    triggerHaptic('success');
    sound.playCoin();
    bookVisit(venue.id, { date: date.full, time, tickets });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-sm sm:p-4 animate-rise">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-wall overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-card border-b border-line">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gold-soft text-[#8A6A10] flex items-center justify-center shrink-0">
              <Ticket className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-ink font-display truncate">Book a visit</h3>
              <p className="text-[11px] text-muted truncate">{venue.name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-wall border border-line text-muted flex items-center justify-center hover:text-ink shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Date */}
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-vermilion" /> Date
            </label>
            <div className="grid grid-cols-3 gap-2">
              {dateOptions.map((d, i) => (
                <button
                  key={d.offset}
                  onClick={() => {
                    triggerHaptic('light');
                    setDateIdx(i);
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                    dateIdx === i ? 'bg-ink text-wall border-ink' : 'bg-card border-line text-muted hover:border-muted'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block">Time</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    triggerHaptic('light');
                    setTime(slot);
                  }}
                  className={`px-3.5 py-2 rounded-full border text-xs font-bold font-mono whitespace-nowrap transition ${
                    time === slot ? 'bg-ink text-wall border-ink' : 'bg-card border-line text-muted hover:border-muted'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets */}
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5 block">Tickets</label>
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-card border border-line">
              <span className="text-xs font-bold text-ink">
                {tickets} {tickets === 1 ? 'ticket' : 'tickets'}
                {venue.entryFee && <span className="text-muted font-medium"> · {venue.entryFee} each</span>}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setTickets((t) => Math.max(1, t - 1));
                  }}
                  className="w-8 h-8 rounded-full bg-wall border border-line text-ink flex items-center justify-center active:scale-90 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setTickets((t) => Math.min(4, t + 1));
                  }}
                  className="w-8 h-8 rounded-full bg-wall border border-line text-ink flex items-center justify-center active:scale-90 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-2xl bg-vermilion text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 transition"
          >
            <Sparkles className="w-4 h-4" />
            Confirm booking · +60 pts
          </button>
        </div>
      </div>
    </div>
  );
};
