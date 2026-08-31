import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, Eye, Sparkles, Sliders, RefreshCw } from 'lucide-react';

interface BannerCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  initialAspectRatio?: number; // width / height, default 4/5 (0.8)
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

interface AspectRatioOption {
  id: string;
  label: string;
  ratio: number | null; // width / height
  badge?: string;
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: '4:5', label: '4:5 Dashboard', ratio: 4 / 5, badge: 'Rekomendasi' },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
  { id: '1:1', label: '1:1 Square', ratio: 1 / 1 },
  { id: '16:9', label: '16:9 Banner Luas', ratio: 16 / 9 },
  { id: 'free', label: 'Bebas', ratio: null },
];

export const BannerCropperModal: React.FC<BannerCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  initialAspectRatio = 4 / 5,
  title = 'The Royal Eternity',
  subtitle = 'Signature Series',
  badgeText = 'Top Rated Studio',
}) => {
  const [selectedRatioId, setSelectedRatioId] = useState<string>('4:5');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Reset controls when image changes
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setSelectedRatioId('4:5');
    }
  }, [imageSrc]);

  // Load image dimensions
  const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Current ratio calculation
  const currentRatioOption = ASPECT_RATIOS.find((r) => r.id === selectedRatioId) || ASPECT_RATIOS[0];
  const targetRatio = currentRatioOption.ratio || (4 / 5);

  // Generate cropped image from canvas
  const handleApplyCrop = async () => {
    if (!imageSrc || isProcessing) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const container = containerRef.current;
      if (!container) {
        throw new Error('Crop container not found');
      }

      const rect = container.getBoundingClientRect();
      const cropWidth = rect.width;
      const cropHeight = rect.height;

      // Target high-resolution canvas output
      const outputWidth = 1000;
      const outputHeight = Math.round(outputWidth / targetRatio);

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Fill background dark in case of transparent borders
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      // Scale factor from preview container to output canvas
      const scaleToOutput = outputWidth / cropWidth;

      ctx.save();
      // Move context to center of output canvas
      ctx.translate(outputWidth / 2, outputHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply offset and zoom
      const drawX = offset.x * scaleToOutput;
      const drawY = offset.y * scaleToOutput;

      // Base display scale
      let baseScale = 1;
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;

      const scaleW = cropWidth / nw;
      const scaleH = cropHeight / nh;
      baseScale = Math.max(scaleW, scaleH) * scaleToOutput;

      const finalW = nw * baseScale * zoom;
      const finalH = nh * baseScale * zoom;

      ctx.drawImage(img, -finalW / 2 + drawX, -finalH / 2 + drawY, finalW, finalH);
      ctx.restore();

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      onCropComplete(croppedBase64);
      onClose();
    } catch (err) {
      console.error('Error cropping image:', err);
      alert('Terjadi kesalahan saat memotong gambar. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121212] border border-[#D4AF37]/40 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>Atur & Crop Foto Banner Dashboard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  Preset 4:5
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">
                Geser (drag) dan perbesar foto agar pas dengan ukuran banner beranda utama.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two columns on desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left / Center: Interactive Crop Canvas Area */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            {/* Aspect Ratio Crop Window Frame */}
            <div className="w-full flex items-center justify-center bg-black/80 p-2 sm:p-4 border border-white/10 relative select-none">
              
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                className="relative overflow-hidden border-2 border-[#D4AF37] shadow-2xl cursor-grab active:cursor-grabbing group bg-[#0A0A0A]"
                style={{
                  width: '100%',
                  maxWidth: targetRatio >= 1 ? '420px' : '320px',
                  aspectRatio: `${targetRatio}`,
                }}
              >
                {/* Image under transform */}
                <div
                  className="w-full h-full flex items-center justify-center origin-center transition-transform duration-75"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  }}
                >
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Crop preview"
                    onLoad={onImageLoaded}
                    className="max-w-none max-h-none pointer-events-none select-none object-cover"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Grid Overlay Guide Lines (Rule of Thirds) */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/15">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div />
                </div>

                {/* Live Simulation Overlay in Dashboard (Top Badge & Compact Bottom Card) */}
                {showLivePreview && (
                  <>
                    {/* Simulated Top Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#0A0A0A]/85 backdrop-blur-sm border border-white/20 text-[8px] uppercase tracking-widest text-[#D4AF37] pointer-events-none flex items-center gap-1 shadow-md">
                      <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                      <span>{badgeText}</span>
                    </div>

                    {/* Simulated Sleeker Bottom Card */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 bg-[#0F0F0F]/85 backdrop-blur-sm border border-white/15 text-[#E0E0E0] pointer-events-none shadow-xl">
                      <span className="text-[8px] font-bold tracking-wider text-[#D4AF37] uppercase block">{subtitle}</span>
                      <h5 className="font-serif font-semibold text-[11px] text-white truncate leading-tight">{title}</h5>
                    </div>
                  </>
                )}

                {/* Instruction tag floating on top */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 text-[9px] font-mono text-gray-300 pointer-events-none flex items-center gap-1 border border-white/10">
                  <Move className="w-2.5 h-2.5 text-[#D4AF37]" />
                  <span>Tarik Geser</span>
                </div>
              </div>
            </div>

            {/* Quick action bar beneath the frame */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className={`px-2.5 py-1 text-xs font-mono border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  showLivePreview
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Simulasi Teks Dashboard: {showLivePreview ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-xs font-mono bg-black/40 hover:bg-black border border-white/10 text-gray-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Kembalikan ke posisi awal"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Posisi</span>
              </button>
            </div>

          </div>

          {/* Right Column: Controls & Settings */}
          <div className="lg:col-span-5 space-y-5 bg-[#171717] p-4 sm:p-5 border border-white/10">
            
            {/* Aspect Ratio Selector */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-300 font-bold block mb-2">
                Pilih Rasio Ukuran Banner:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((opt) => {
                  const isSelected = selectedRatioId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedRatioId(opt.id);
                        setOffset({ x: 0, y: 0 });
                      }}
                      className={`p-2 text-left border font-mono text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37] shadow-sm'
                          : 'bg-[#0A0A0A] text-gray-400 hover:text-white border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="truncate">{opt.label}</div>
                      {opt.badge && (
                        <span className={`text-[9px] block mt-0.5 ${isSelected ? 'text-black/80 font-bold' : 'text-[#D4AF37]'}`}>
                          ★ {opt.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-mono text-gray-300">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Zoom / Skala Foto</span>
                </span>
                <span className="text-[#D4AF37] font-bold">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                  className="w-7 h-7 bg-black border border-white/15 text-white flex items-center justify-center hover:border-[#D4AF37] cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-[#D4AF37] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                  className="w-7 h-7 bg-black border border-white/15 text-white flex items-center justify-center hover:border-[#D4AF37] cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rotate & Alignment */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <label className="text-xs font-mono uppercase tracking-wider text-gray-300 font-bold block">
                Rotasi & Sudut Gambar
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex-1 py-2 bg-black border border-white/15 text-gray-300 hover:text-white hover:border-[#D4AF37] text-xs font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Putar 90° ({rotation}°)</span>
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-3 bg-black/50 border border-white/5 text-[11px] text-gray-400 space-y-1">
              <div className="text-[#D4AF37] font-semibold flex items-center gap-1 text-xs">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Tips Komposisi Sempurna:</span>
              </div>
              <p>
                Posisikan wajah subjek / pengantin berada di sepertiga atas frame agar tidak tertutup kartu teks di bawah.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#181818] gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-white/15 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing}
            className={`px-6 py-2.5 font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              isProcessing
                ? 'bg-amber-600/50 text-black cursor-not-allowed'
                : 'bg-[#D4AF37] hover:bg-white text-black'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isProcessing ? 'Memproses Crop...' : 'Terapkan & Simpan Crop Banner'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
