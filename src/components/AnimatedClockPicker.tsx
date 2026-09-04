import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check, X, RotateCcw, Sparkles } from 'lucide-react';

interface AnimatedClockPickerProps {
  value: string;
  onChange: (timeString: string) => void;
  isSlotUnavailable?: boolean;
  bookedTimes?: string[];
}

export const AnimatedClockPicker: React.FC<AnimatedClockPickerProps> = ({
  value,
  onChange,
  isSlotUnavailable = false,
  bookedTimes = [],
}) => {
  // Parse existing string (e.g. "10:30 WIB" or "14:15")
  const parseInitialTime = () => {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      if (h < 0 || h > 23) h = 10;
      if (m < 0 || m > 59) m = 0;
      return { hour: h, minute: m };
    }
    return { hour: 10, minute: 0 };
  };

  const initial = parseInitialTime();
  const [hour, setHour] = useState<number>(initial.hour);
  const [minute, setMinute] = useState<number>(initial.minute);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const clockRef = useRef<HTMLDivElement>(null);

  // Sync internal state when parent value changes externally
  useEffect(() => {
    const parsed = parseInitialTime();
    setHour(parsed.hour);
    setMinute(parsed.minute);
  }, [value]);

  const formatTimeString = (h: number, m: number) => {
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm} WIB`;
  };

  const updateAngleFromEvent = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate angle in degrees from 12 o'clock (top) clockwise
    let theta = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (theta < 0) theta += 360;

    if (mode === 'hour') {
      // 12 sectors of 30 degrees each
      let selectedHour12 = Math.round(theta / 30) % 12;
      if (selectedHour12 === 0) selectedHour12 = 12;

      // Outer ring vs Inner ring detection (distance from center)
      // Radius of circle is ~110px. If distance < 75px, it's inner ring (13-00/24h)
      const isInner = distance < 75;

      let finalHour = selectedHour12;
      if (isInner) {
        // Inner ring represents 13 to 24 (or 00)
        finalHour = selectedHour12 === 12 ? 0 : selectedHour12 + 12;
      } else {
        // Outer ring represents 1 to 12
        finalHour = selectedHour12;
      }

      setHour(finalHour);
      onChange(formatTimeString(finalHour, minute));
    } else {
      // Minute mode: 60 sectors of 6 degrees each, snap to 1 or 5
      let selectedMin = Math.round(theta / 6) % 60;
      setMinute(selectedMin);
      onChange(formatTimeString(hour, selectedMin));
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    updateAngleFromEvent(e);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      updateAngleFromEvent(e);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      // Auto transition from hour to minute
      if (mode === 'hour') {
        setTimeout(() => setMode('minute'), 250);
      }
    }
  };

  // Clock Hand Calculation
  const hourHandAngle = ((hour % 12) + minute / 60) * 30;
  const minuteHandAngle = minute * 6;
  const isInnerHour = hour === 0 || hour > 12;
  const activeHandLength = mode === 'hour' ? (isInnerHour ? 48 : 72) : 74;
  const activeHandAngle = mode === 'hour' ? (hour % 12) * 30 : minute * 6;

  // Outer hours (1 to 12)
  const outerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Inner hours (00, 13 to 23)
  const innerHours = ['00', 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  // Minutes
  const minuteMarks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="space-y-2">
      {/* Trigger & Quick Display */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex-1 flex items-center justify-between px-3.5 py-2.5 bg-[#0A0A0A] border text-xs transition-all cursor-pointer ${
            isSlotUnavailable
              ? 'border-red-500/80 bg-red-950/20 ring-1 ring-red-500/50'
              : isOpen
              ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg'
              : 'border-white/15 hover:border-white/30'
          }`}
          id="btn-clock-picker-trigger"
        >
          <div className="flex items-center gap-2.5 text-white font-mono">
            <Clock className={`w-4 h-4 shrink-0 ${isSlotUnavailable ? 'text-red-400' : 'text-[#D4AF37]'}`} />
            <span className={`text-sm font-bold tracking-wider ${isSlotUnavailable ? 'text-red-400' : 'text-[#D4AF37]'}`}>
              {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} WIB
            </span>
          </div>
          {isSlotUnavailable ? (
            <span className="text-[10px] font-mono text-red-300 bg-red-900/60 px-2 py-0.5 border border-red-500/40 uppercase font-semibold">
              ⛔ Kuota Penuh
            </span>
          ) : (
            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 border border-white/10 uppercase">
              {isOpen ? 'Tutup Jam' : 'Putar Jarum Jam'}
            </span>
          )}
        </button>
      </div>

      {/* Interactive Animated Dial Card */}
      {isOpen && (
        <div className={`p-4 bg-[#121212] border shadow-2xl rounded-none space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
          isSlotUnavailable ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-[#D4AF37]/50'
        }`}>
          
          {/* Quota Full Alert inside picker */}
          {isSlotUnavailable && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono flex items-start gap-2">
              <span className="text-base">⛔</span>
              <div>
                <strong className="text-white block font-sans">Kuota Jam Ini Sudah Penuh!</strong>
                <span>Pukul {formatTimeString(hour, minute)} sudah terisi oleh pesanan lain di sistem. Silakan geser jarum jam ke waktu yang berbeda.</span>
              </div>
            </div>
          )}

          {/* List of booked times on that day */}
          {bookedTimes.length > 0 && (
            <div className="px-3 py-2 bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 space-y-1">
              <span className="text-gray-300 block uppercase font-semibold">Jam yang sudah terisi di tanggal ini:</span>
              <div className="flex flex-wrap gap-1">
                {bookedTimes.map((bt, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-red-900/30 border border-red-500/30 text-red-300">
                    {bt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Header & Digital Display Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block">
                Atur Jam Acara
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => setMode('hour')}
                  className={`px-3 py-1 text-base font-mono font-bold transition-all cursor-pointer ${
                    mode === 'hour'
                      ? isSlotUnavailable ? 'bg-red-500 text-white shadow-md' : 'bg-[#D4AF37] text-black shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {String(hour).padStart(2, '0')}
                </button>
                <span className={`${isSlotUnavailable ? 'text-red-400' : 'text-[#D4AF37]'} font-bold text-lg font-mono animate-pulse`}>:</span>
                <button
                  type="button"
                  onClick={() => setMode('minute')}
                  className={`px-3 py-1 text-base font-mono font-bold transition-all cursor-pointer ${
                    mode === 'minute'
                      ? isSlotUnavailable ? 'bg-red-500 text-white shadow-md' : 'bg-[#D4AF37] text-black shadow-md'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {String(minute).padStart(2, '0')}
                </button>
                <span className={`text-xs font-mono ml-1 font-semibold ${isSlotUnavailable ? 'text-red-400' : 'text-[#D4AF37]'}`}>WIB</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <span className="text-[10px] font-mono text-gray-400">
                Mode: <strong className={isSlotUnavailable ? 'text-red-400' : 'text-[#D4AF37]'}>{mode === 'hour' ? 'Atur Jam (00-23)' : 'Atur Menit (00-59)'}</strong>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'hour' ? 'minute' : 'hour')}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-gray-300 cursor-pointer"
                >
                  {mode === 'hour' ? 'Ubah Menit →' : '← Ubah Jam'}
                </button>
              </div>
            </div>
          </div>

          {/* Analog Clock Face with Animated Hands */}
          <div className="relative flex items-center justify-center py-2 select-none">
            <div
              ref={clockRef}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="relative w-64 h-64 rounded-full bg-[#0A0A0A] border-2 border-[#D4AF37]/40 shadow-inner flex items-center justify-center cursor-pointer overflow-hidden touch-none"
              style={{
                backgroundImage: 'radial-gradient(circle at center, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.95) 70%)',
              }}
            >
              {/* Center Pin */}
              <div className="absolute w-3.5 h-3.5 bg-[#D4AF37] rounded-full z-20 shadow-md ring-2 ring-black" />

              {/* Dynamic Animated Hand Pointer */}
              <div
                className="absolute z-10 transition-transform duration-100 ease-out origin-bottom pointer-events-none"
                style={{
                  height: `${activeHandLength}px`,
                  bottom: '50%',
                  transform: `rotate(${activeHandAngle}deg)`,
                  width: '2px',
                  backgroundColor: '#D4AF37',
                }}
              >
                {/* Hand End Circle Knob */}
                <div className="absolute -top-3 -left-3.5 w-7 h-7 rounded-full bg-[#D4AF37] shadow-lg flex items-center justify-center opacity-90 ring-2 ring-black">
                  <div className="w-2 h-2 rounded-full bg-black" />
                </div>
              </div>

              {/* Ghost Hour/Minute Hand for context */}
              {mode === 'minute' && (
                <div
                  className="absolute z-5 origin-bottom pointer-events-none opacity-30"
                  style={{
                    height: '50px',
                    bottom: '50%',
                    transform: `rotate(${hourHandAngle}deg)`,
                    width: '3px',
                    backgroundColor: '#ffffff',
                  }}
                />
              )}

              {mode === 'hour' && (
                <div
                  className="absolute z-5 origin-bottom pointer-events-none opacity-20"
                  style={{
                    height: '75px',
                    bottom: '50%',
                    transform: `rotate(${minuteHandAngle}deg)`,
                    width: '1.5px',
                    backgroundColor: '#ffffff',
                  }}
                />
              )}

              {/* Numbers on Dial: Mode Hour (Outer 1-12, Inner 13-00) */}
              {mode === 'hour' && (
                <>
                  {/* Outer Ring 1 - 12 */}
                  {outerHours.map((h, i) => {
                    const angle = (i * 30 - 60) * (Math.PI / 180);
                    const radius = 95; // px from center
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const isSelected = hour === (h === 12 ? 12 : h);

                    return (
                      <div
                        key={`outer-${h}`}
                        className={`absolute w-7 h-7 flex items-center justify-center text-xs font-mono font-bold rounded-full pointer-events-none transition-all ${
                          isSelected
                            ? 'text-black z-30 scale-110 font-extrabold'
                            : 'text-gray-200 hover:text-white'
                        }`}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      >
                        {h}
                      </div>
                    );
                  })}

                  {/* Inner Ring 13 - 00 (24 Hour format) */}
                  {innerHours.map((h, i) => {
                    const angle = (i * 30 - 60) * (Math.PI / 180);
                    const radius = 62; // px from center
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const val = h === '00' ? 0 : Number(h);
                    const isSelected = hour === val;

                    return (
                      <div
                        key={`inner-${h}`}
                        className={`absolute w-6 h-6 flex items-center justify-center text-[10px] font-mono rounded-full pointer-events-none transition-all ${
                          isSelected
                            ? 'text-black z-30 scale-110 font-bold'
                            : 'text-gray-500 font-medium'
                        }`}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      >
                        {h}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Numbers on Dial: Mode Minute (00, 05, 10 ... 55) */}
              {mode === 'minute' && (
                <>
                  {minuteMarks.map((m, i) => {
                    const angle = (i * 30 - 60) * (Math.PI / 180);
                    const radius = 95; // px from center
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const isSelected = Math.round(minute / 5) * 5 === m;

                    return (
                      <div
                        key={`min-${m}`}
                        className={`absolute w-7 h-7 flex items-center justify-center text-xs font-mono font-bold rounded-full pointer-events-none transition-all ${
                          isSelected
                            ? 'text-black z-30 scale-110 font-extrabold'
                            : 'text-gray-300'
                        }`}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      >
                        {String(m).padStart(2, '0')}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Quick Stepper & Presets */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const newHour = (hour - 1 + 24) % 24;
                  setHour(newHour);
                  onChange(formatTimeString(newHour, minute));
                }}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 cursor-pointer"
                title="Kurangi 1 Jam"
              >
                -1 Jam
              </button>
              <button
                type="button"
                onClick={() => {
                  const newHour = (hour + 1) % 24;
                  setHour(newHour);
                  onChange(formatTimeString(newHour, minute));
                }}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 cursor-pointer"
                title="Tambah 1 Jam"
              >
                +1 Jam
              </button>
              <button
                type="button"
                onClick={() => {
                  const newMin = (minute + 15) % 60;
                  setMinute(newMin);
                  onChange(formatTimeString(hour, newMin));
                }}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 cursor-pointer"
                title="Tambah 15 Menit"
              >
                +15 Mnt
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Selesai</span>
            </button>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-gray-500 font-mono text-center">
            💡 Putar jarum jam pada lingkaran dial atau klik angka jam & menit secara bebas.
          </p>

        </div>
      )}
    </div>
  );
};
