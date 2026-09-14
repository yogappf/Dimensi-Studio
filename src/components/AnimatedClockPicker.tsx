import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check, Sun, Sunset, Moon, Sunrise, ChevronLeft, ChevronRight, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface AnimatedClockPickerProps {
  value: string;
  onChange: (timeString: string) => void;
  isSlotUnavailable?: boolean;
  conflictReason?: string;
  bookedTimes?: string[];
}

export const AnimatedClockPicker: React.FC<AnimatedClockPickerProps> = ({
  value,
  onChange,
  isSlotUnavailable = false,
  conflictReason,
  bookedTimes = [],
}) => {
  // Parse existing string (e.g. "10:30 WIB" or "14:15" or "10:00")
  const parseInitialTime = () => {
    const match = value ? value.match(/(\d{1,2}):(\d{2})/) : null;
    if (match) {
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      if (isNaN(h) || h < 0 || h > 23) h = 10;
      if (isNaN(m) || m < 0 || m > 59) m = 0;
      return { hour: h, minute: m };
    }
    return { hour: 10, minute: 0 };
  };

  const initial = parseInitialTime();
  const [hour, setHour] = useState<number>(initial.hour);
  const [minute, setMinute] = useState<number>(initial.minute);
  const [activeView, setActiveView] = useState<'analog' | 'presets' | 'stepper'>('analog');
  const [dialMode, setDialMode] = useState<'hour' | 'minute'>('hour');
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

  const setTime = (newH: number, newM: number) => {
    const safeH = Math.max(0, Math.min(23, newH));
    const safeM = Math.max(0, Math.min(59, newM));
    setHour(safeH);
    setMinute(safeM);
    onChange(formatTimeString(safeH, safeM));
  };

  const handleHourSelect = (selectedHour: number) => {
    setTime(selectedHour, minute);
    // Smoothly auto switch to minute selection after short delay
    setTimeout(() => {
      setDialMode('minute');
    }, 280);
  };

  const handleMinuteSelect = (selectedMinute: number) => {
    setTime(hour, selectedMinute);
  };

  // Helper for time period descriptor
  const getTimePeriod = (h: number) => {
    if (h >= 5 && h < 11) return { label: 'Pagi', icon: Sunrise, color: 'text-amber-300' };
    if (h >= 11 && h < 15) return { label: 'Siang', icon: Sun, color: 'text-yellow-400' };
    if (h >= 15 && h < 18) return { label: 'Sore (Golden Hour)', icon: Sunset, color: 'text-orange-400' };
    return { label: 'Malam', icon: Moon, color: 'text-blue-300' };
  };

  const period = getTimePeriod(hour);
  const PeriodIcon = period.icon;

  // Angle math for Analog Dial
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

    if (dialMode === 'hour') {
      let selectedHour12 = Math.round(theta / 30) % 12;
      if (selectedHour12 === 0) selectedHour12 = 12;

      // Inner ring vs Outer ring detection: radius is ~120px, threshold ~75px
      const isInner = distance < 78;
      let finalHour = selectedHour12;
      if (isInner) {
        finalHour = selectedHour12 === 12 ? 0 : selectedHour12 + 12;
      } else {
        finalHour = selectedHour12 === 12 ? 12 : selectedHour12;
      }
      setTime(finalHour, minute);
    } else {
      // Minute mode
      let selectedMin = Math.round(theta / 6) % 60;
      setTime(hour, selectedMin);
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
      if (dialMode === 'hour') {
        setTimeout(() => setDialMode('minute'), 250);
      }
    }
  };

  // Clock Hand Angles
  const isInnerHour = hour === 0 || hour > 12;
  const activeHandLength = dialMode === 'hour' ? (isInnerHour ? 54 : 82) : 84;
  const activeHandAngle = dialMode === 'hour' ? (hour % 12) * 30 : minute * 6;
  const hourGhostAngle = ((hour % 12) + minute / 60) * 30;
  const minuteGhostAngle = minute * 6;

  // Preset time slots grouped by time of day
  const presetGroups = [
    {
      category: '🌅 Pagi Hari',
      slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'],
    },
    {
      category: '☀️ Siang Hari',
      slots: ['11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00'],
    },
    {
      category: '🌇 Sore (Golden Hour)',
      slots: ['15:30', '16:00', '16:30', '17:00', '17:30'],
    },
    {
      category: '🌙 Malam (Studio Lighting)',
      slots: ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
    },
  ];

  // Outer hours (1 to 12)
  const outerHours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Inner hours (00, 13 to 23)
  const innerHours = ['00', 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  // Standard minute marks
  const minuteMarks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="space-y-2 select-none" id="animated-clock-picker-container">
      {/* Trigger & Quick Display */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex-1 flex items-center justify-between px-3.5 py-2.5 bg-[#0A0A0A] border text-xs transition-all cursor-pointer ${
            isSlotUnavailable
              ? 'border-rose-500/80 bg-rose-950/20 ring-1 ring-rose-500/50'
              : isOpen
              ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
              : 'border-white/15 hover:border-white/30'
          }`}
          id="btn-clock-picker-trigger"
        >
          <div className="flex items-center gap-3 font-mono">
            <div className={`p-1.5 rounded-sm ${
              isSlotUnavailable
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-gold-metallic text-black font-bold shadow-sm'
            }`}>
              <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-bold tracking-wider ${isSlotUnavailable ? 'text-rose-400' : 'text-gold-metallic'}`}>
                {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold text-gray-400">WIB</span>
              <span className="text-[10px] text-gray-400 font-sans hidden sm:inline ml-1">
                ({period.label})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSlotUnavailable ? (
              <span className="text-[10px] font-mono text-rose-300 bg-rose-900/60 px-2 py-0.5 border border-rose-500/40 uppercase font-semibold">
                ⛔ Kuota Penuh
              </span>
            ) : (
              <span className="text-[10px] font-mono text-gray-300 bg-white/5 hover:bg-white/10 px-2.5 py-1 border border-white/10 uppercase transition-colors">
                {isOpen ? 'Tutup Jam ▲' : 'Atur Jam ▼'}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Main Clock Picker Popover / Dropdown */}
      {isOpen && (
        <div className={`p-4 bg-[#121212] border shadow-2xl rounded-none space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
          isSlotUnavailable ? 'border-rose-500/80 ring-1 ring-rose-500/30' : 'border-[#D4AF37]/60 shadow-[0_0_25px_rgba(212,175,55,0.15)]'
        }`}>
          
          {/* Conflict Alert Banner inside picker */}
          {isSlotUnavailable && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-mono space-y-1">
              <div className="flex items-start gap-2">
                <span className="text-base">⛔</span>
                <div>
                  <strong className="text-white block font-sans">Jadwal Jam Ini Tidak Tersedia!</strong>
                  <span className="text-rose-200 text-[11px] leading-relaxed block mt-0.5">
                    {conflictReason || `Pukul ${formatTimeString(hour, minute)} bertabrakan dengan jadwal pesanan lain dalam rentang buffer 7 jam.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Booked Times List for Context */}
          {bookedTimes.length > 0 && (
            <div className="px-3 py-2 bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 space-y-1">
              <span className="text-gray-300 block uppercase font-semibold">
                Rentang Jadwal Terblokir Pada Hari Ini (Buffer 3 Jam Sebelum & 4 Jam Setelah):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {bookedTimes.map((bt, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-rose-950/60 border border-rose-500/40 text-rose-200 font-semibold">
                    {bt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Header Controls: Mode Selector & View Tabs */}
          <div className="space-y-3 pb-3 border-b border-white/10">
            {/* View Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-black/60 border border-white/10 text-[11px] font-mono uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveView('analog')}
                className={`py-1.5 px-2 text-center font-bold transition-all cursor-pointer ${
                  activeView === 'analog'
                    ? 'bg-gold-metallic text-black shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🕒 Jam Analog
              </button>
              <button
                type="button"
                onClick={() => setActiveView('presets')}
                className={`py-1.5 px-2 text-center font-bold transition-all cursor-pointer ${
                  activeView === 'presets'
                    ? 'bg-gold-metallic text-black shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                ⚡ Rekomendasi
              </button>
              <button
                type="button"
                onClick={() => setActiveView('stepper')}
                className={`py-1.5 px-2 text-center font-bold transition-all cursor-pointer ${
                  activeView === 'stepper'
                    ? 'bg-gold-metallic text-black shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🎛️ Atur Cepat
              </button>
            </div>

            {/* Large Interactive Digital Time Display */}
            <div className="flex items-center justify-between bg-black/40 p-3 border border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-1">
                  Waktu Terpilih:
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Hour Segment */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('analog');
                      setDialMode('hour');
                    }}
                    className={`px-3 py-1.5 text-xl font-mono font-bold transition-all cursor-pointer border ${
                      dialMode === 'hour' && activeView === 'analog'
                        ? 'bg-gold-metallic text-black border-[#FFF0A8] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                        : 'bg-white/5 border-white/15 text-white hover:border-[#D4AF37]'
                    }`}
                    title="Klik untuk memilih Jam"
                  >
                    {String(hour).padStart(2, '0')}
                  </button>

                  <span className="text-xl font-bold font-mono text-[#D4AF37] animate-pulse">:</span>

                  {/* Minute Segment */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('analog');
                      setDialMode('minute');
                    }}
                    className={`px-3 py-1.5 text-xl font-mono font-bold transition-all cursor-pointer border ${
                      dialMode === 'minute' && activeView === 'analog'
                        ? 'bg-gold-metallic text-black border-[#FFF0A8] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                        : 'bg-white/5 border-white/15 text-white hover:border-[#D4AF37]'
                    }`}
                    title="Klik untuk memilih Menit"
                  >
                    {String(minute).padStart(2, '0')}
                  </button>

                  <div className="ml-2 flex flex-col">
                    <span className="text-xs font-mono font-bold text-white">WIB</span>
                    <span className={`text-[10px] flex items-center gap-1 ${period.color}`}>
                      <PeriodIcon className="w-2.5 h-2.5" />
                      <span>{period.label}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stepper +/- 1 Hour */}
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[10px] font-mono text-gray-400">Penyesuaian Cepat:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTime((hour - 1 + 24) % 24, minute)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10 text-xs font-mono cursor-pointer transition-colors"
                    title="Mundurkan 1 Jam"
                  >
                    -1 Jam
                  </button>
                  <button
                    type="button"
                    onClick={() => setTime((hour + 1) % 24, minute)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10 text-xs font-mono cursor-pointer transition-colors"
                    title="Majukan 1 Jam"
                  >
                    +1 Jam
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE ANALOG CLOCK */}
          {activeView === 'analog' && (
            <div className="space-y-3">
              {/* Dial Header & Mode Switcher */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400">
                  Mode Jam Analog:{' '}
                  <strong className="text-[#D4AF37]">
                    {dialMode === 'hour' ? '1. Pilih Angka Jam (00 - 23)' : '2. Pilih Angka Menit (00 - 59)'}
                  </strong>
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDialMode('hour')}
                    className={`px-2.5 py-1 border text-[11px] font-semibold uppercase transition-all cursor-pointer ${
                      dialMode === 'hour'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                        : 'border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Jam
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialMode('minute')}
                    className={`px-2.5 py-1 border text-[11px] font-semibold uppercase transition-all cursor-pointer ${
                      dialMode === 'minute'
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                        : 'border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Menit
                  </button>
                </div>
              </div>

              {/* Analog Clock Dial */}
              <div className="relative flex items-center justify-center py-2 select-none">
                <div
                  ref={clockRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#0A0A0A] border-2 border-[#D4AF37]/40 shadow-inner flex items-center justify-center cursor-pointer overflow-hidden touch-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at center, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.95) 75%)',
                  }}
                >
                  {/* Center Pin with Metallic Sheen */}
                  <div className="absolute w-4 h-4 bg-gold-metallic rounded-full z-30 shadow-[0_0_10px_rgba(212,175,55,0.5)] ring-2 ring-black" />

                  {/* Active Animated Clock Hand */}
                  <div
                    className="absolute z-20 transition-transform duration-150 ease-out origin-bottom pointer-events-none"
                    style={{
                      height: `${activeHandLength}px`,
                      bottom: '50%',
                      transform: `rotate(${activeHandAngle}deg)`,
                      width: '2.5px',
                      background: 'linear-gradient(to top, #8A6B14, #FFE899)',
                    }}
                  >
                    {/* Hand End Circle Knob / Indicator */}
                    <div className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full bg-gold-metallic shadow-[0_0_12px_rgba(212,175,55,0.6)] flex items-center justify-center ring-2 ring-black">
                      <div className="w-2 h-2 rounded-full bg-black" />
                    </div>
                  </div>

                  {/* Ghost Hour/Minute Hands for Visual Reference */}
                  {dialMode === 'minute' && (
                    <div
                      className="absolute z-10 origin-bottom pointer-events-none opacity-30"
                      style={{
                        height: '56px',
                        bottom: '50%',
                        transform: `rotate(${hourGhostAngle}deg)`,
                        width: '3.5px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  )}

                  {dialMode === 'hour' && (
                    <div
                      className="absolute z-10 origin-bottom pointer-events-none opacity-25"
                      style={{
                        height: '84px',
                        bottom: '50%',
                        transform: `rotate(${minuteGhostAngle}deg)`,
                        width: '2px',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  )}

                  {/* NUMBERS: Mode Hour (Outer 1-12, Inner 13-00) */}
                  {dialMode === 'hour' && (
                    <>
                      {/* Outer Ring 1 - 12 */}
                      {outerHours.map((h, i) => {
                        const angle = (i * 30 - 60) * (Math.PI / 180);
                        const radius = 104; // px from center for 288px clock
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const isSelected = hour === (h === 12 ? 12 : h);

                        return (
                          <button
                            key={`outer-${h}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHourSelect(h === 12 ? 12 : h);
                            }}
                            className={`absolute w-8 h-8 flex items-center justify-center text-xs font-mono font-bold rounded-full transition-all cursor-pointer z-25 ${
                              isSelected
                                ? 'bg-gold-metallic text-black font-extrabold shadow-[0_0_12px_rgba(212,175,55,0.6)] scale-110'
                                : 'text-gray-200 hover:text-white hover:bg-white/10'
                            }`}
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                          >
                            {h}
                          </button>
                        );
                      })}

                      {/* Inner Ring 13 - 00 (24 Hour format) */}
                      {innerHours.map((h, i) => {
                        const angle = (i * 30 - 60) * (Math.PI / 180);
                        const radius = 68; // px from center
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const val = h === '00' ? 0 : Number(h);
                        const isSelected = hour === val;

                        return (
                          <button
                            key={`inner-${h}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHourSelect(val);
                            }}
                            className={`absolute w-7 h-7 flex items-center justify-center text-[10px] font-mono rounded-full transition-all cursor-pointer z-25 ${
                              isSelected
                                ? 'bg-gold-metallic text-black font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.5)] scale-110'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                          >
                            {h}
                          </button>
                        );
                      })}
                    </>
                  )}

                  {/* NUMBERS: Mode Minute (00, 05, 10 ... 55) */}
                  {dialMode === 'minute' && (
                    <>
                      {minuteMarks.map((m, i) => {
                        const angle = (i * 30 - 60) * (Math.PI / 180);
                        const radius = 104; // px from center
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        const isSelected = minute === m;

                        return (
                          <button
                            key={`min-${m}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMinuteSelect(m);
                            }}
                            className={`absolute w-8 h-8 flex items-center justify-center text-xs font-mono font-bold rounded-full transition-all cursor-pointer z-25 ${
                              isSelected
                                ? 'bg-gold-metallic text-black font-extrabold shadow-[0_0_12px_rgba(212,175,55,0.6)] scale-110'
                                : 'text-gray-200 hover:text-white hover:bg-white/10'
                            }`}
                            style={{
                              transform: `translate(${x}px, ${y}px)`,
                            }}
                          >
                            {String(m).padStart(2, '0')}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 bg-white/5 p-2 border border-white/10">
                <span>💡 Sentuh atau klik langsung angka pada jam.</span>
                <span className="text-[#D4AF37] font-semibold">
                  {dialMode === 'hour' ? 'Lingkaran luar: 1-12 | Dalam: 13-00' : 'Kelipatan 5 menit'}
                </span>
              </div>
            </div>
          )}

          {/* VIEW 2: PRESET TIME SLOTS */}
          {activeView === 'presets' && (
            <div className="space-y-3.5 py-1">
              <div className="text-xs text-gray-300 font-mono flex items-center justify-between">
                <span>Pilih Slot Waktu Rekomendasi Studio:</span>
                <span className="text-[10px] text-gray-400">1-Klik Langsung Pilih</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {presetGroups.map((group, idx) => (
                  <div key={idx} className="p-3 bg-black/40 border border-white/10 space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white block">
                      {group.category}
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {group.slots.map((s) => {
                        const [sH, sM] = s.split(':').map(Number);
                        const isCurrentSelected = hour === sH && minute === sM;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setTime(sH, sM)}
                            className={`py-2 px-1 text-center font-mono text-xs font-semibold border transition-all cursor-pointer ${
                              isCurrentSelected
                                ? 'bg-gold-metallic text-black border-[#FFF0A8] font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)] scale-105'
                                : 'bg-[#181818] border-white/10 text-gray-300 hover:border-[#D4AF37] hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: STEPPERS & MANUAL ADJUSTMENT */}
          {activeView === 'stepper' && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-black/40 border border-white/10 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-gray-300 block font-semibold">
                  Penyesuaian Cepat Satuan Waktu:
                </span>

                {/* Hour Adjusters */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-gray-400 uppercase">Pengaturan Jam:</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setTime((hour - 2 + 24) % 24, minute)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      -2 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime((hour - 1 + 24) % 24, minute)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      -1 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime((hour + 1) % 24, minute)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      +1 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime((hour + 2) % 24, minute)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      +2 Jam
                    </button>
                  </div>
                </div>

                {/* Minute Adjusters */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-gray-400 uppercase">Pengaturan Menit:</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setTime(hour, (minute - 15 + 60) % 60)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      -15 Mnt
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime(hour, (minute - 5 + 60) % 60)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      -5 Mnt
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime(hour, (minute + 5) % 60)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      +5 Mnt
                    </button>
                    <button
                      type="button"
                      onClick={() => setTime(hour, (minute + 15) % 60)}
                      className="py-2 px-2 bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-white cursor-pointer"
                    >
                      +15 Mnt
                    </button>
                  </div>
                </div>

                {/* Direct Number Input */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">Atur Menit Tepat:</span>
                  <div className="flex gap-1.5">
                    {[0, 15, 30, 45].map((exactM) => (
                      <button
                        key={exactM}
                        type="button"
                        onClick={() => setTime(hour, exactM)}
                        className={`px-3 py-1 text-xs font-mono border transition-all cursor-pointer ${
                          minute === exactM
                            ? 'bg-gold-metallic text-black font-bold border-[#FFF0A8]'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        :{String(exactM).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Confirmation Bar */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTime(10, 0);
                  setDialMode('hour');
                }}
                className="px-3 py-2 bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-white/10 cursor-pointer transition-colors"
                title="Kembali ke Default (10:00 WIB)"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2.5 bg-gold-metallic hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all"
              id="btn-confirm-clock-time"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Gunakan Jam {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')} WIB</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
