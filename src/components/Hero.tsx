import React from 'react';
import { Camera, Sparkles, Award, ShieldCheck, Clock, ArrowRight, MessageCircle, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { STUDIO_INFO } from '../data/mockData';
import { StudioConfig } from '../types';
import { normalizeWhatsAppNumber } from '../utils/formatters';

interface HeroProps {
  onOpenBooking: () => void;
  onSelectPackageFilter: (category: string) => void;
  studioConfig?: StudioConfig;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onSelectPackageFilter, studioConfig }) => {
  const adminWhatsApp = normalizeWhatsAppNumber(
    studioConfig?.whatsapp || studioConfig?.phone || studioConfig?.masterPhone || STUDIO_INFO.whatsapp
  );

  const eyebrow = studioConfig?.heroEyebrow || 'Dimensi Photography & Art Studio';
  const titleMain = studioConfig?.heroTitleMain || 'Abadikan Momen';
  const titleHighlight = studioConfig?.heroTitleHighlight || 'Terbaik';
  const description = studioConfig?.heroDescription || 'Kami menghadirkan seni dalam setiap jepretan. Dari pernikahan sakral, portrait wisuda, keluarga, hingga produk komersial, Dimensi Studio memberikan hasil visual presisi yang bercerita.';
  const buttonText = studioConfig?.heroButtonText || 'Pesan Sekarang';
  const secondaryButtonText = studioConfig?.heroSecondaryButtonText || 'Lihat Layanan';
  const cardTitle = studioConfig?.heroCardTitle || 'The Royal Eternity';
  const cardSubtitle = studioConfig?.heroCardSubtitle || 'Signature Series';
  const cardDescription = studioConfig?.heroCardDescription || 'Dokumentasi wedding sinematik 4K dengan color grading eksklusif.';
  const badgeText = studioConfig?.heroBadgeText || 'Top Rated Studio';
  const stat1Val = studioConfig?.heroStat1Value || '4.9 / 5.0';
  const stat1Lbl = studioConfig?.heroStat1Label || '1.500+ Klien Puas';
  const stat2Val = studioConfig?.heroStat2Value || '8+ Tahun';
  const stat2Lbl = studioConfig?.heroStat2Label || 'Pengalaman Visual';
  const stat3Val = studioConfig?.heroStat3Value || '100%';
  const stat3Lbl = studioConfig?.heroStat3Label || 'Garansi High-Res';

  const bannerImages = (studioConfig?.heroImageUrls && studioConfig.heroImageUrls.length > 0)
    ? studioConfig.heroImageUrls
    : [studioConfig?.heroImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'];

  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    if (bannerImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] text-[#E0E0E0] pt-10 pb-16 lg:py-20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Promotion copy & Call to Action */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top promotional pill / eyebrow */}
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
              <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
              <span>{eyebrow}</span>
            </div>

            {/* Main Headline - Geometric Balance Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-white tracking-tight">
              {titleMain} <br/>
              <span className="italic font-serif text-[#D4AF37]">{titleHighlight}</span>
            </h1>

            {/* Subtext */}
            <p className="text-gray-400 max-w-lg text-sm sm:text-base leading-relaxed">
              {description}
            </p>

            {/* Action buttons - Geometric Balance */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenBooking}
                className="bg-[#D4AF37] text-black font-bold py-3.5 px-6 text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-md flex items-center gap-2.5 cursor-pointer group"
                id="hero-order-btn"
              >
                <span>{buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('paket-layanan');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-white/20 text-white font-semibold py-3.5 px-5 text-xs uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all cursor-pointer"
                id="hero-view-packages-btn"
              >
                {secondaryButtonText}
              </button>

              <a
                href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent('Halo Dimensi Fotografi, saya tertarik untuk konsultasi paket foto.')}`}
                target="_blank"
                rel="noreferrer"
                className="border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-500/10 py-3.5 px-4 text-xs font-semibold flex items-center gap-2 transition-all"
                id="hero-wa-btn"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Geometric Showcase 3-Boxes Grid */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div 
                onClick={() => {
                  onSelectPackageFilter('wedding');
                  const el = document.getElementById('paket-layanan');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#1A1A1A] border border-white/10 p-3.5 sm:p-4 flex flex-col justify-end relative h-28 cursor-pointer hover:border-[#D4AF37] transition-colors group"
              >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-gray-500 group-hover:text-[#D4AF37] transition-colors">01</div>
                <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] mb-0.5">Wedding</div>
                <div className="text-xs sm:text-sm font-medium text-white">Janji Suci</div>
              </div>

              <div 
                onClick={() => {
                  onSelectPackageFilter('engagement');
                  const el = document.getElementById('paket-layanan');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#222222] border border-white/10 p-3.5 sm:p-4 flex flex-col justify-end relative h-28 cursor-pointer hover:border-[#D4AF37] transition-colors group"
              >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-gray-500 group-hover:text-[#D4AF37] transition-colors">02</div>
                <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] mb-0.5">Engagement</div>
                <div className="text-xs sm:text-sm font-medium text-white">Lamaran</div>
              </div>

              <div 
                onClick={() => {
                  onSelectPackageFilter('wisuda');
                  const el = document.getElementById('paket-layanan');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#1A1A1A] border border-white/10 p-3.5 sm:p-4 flex flex-col justify-end relative h-28 cursor-pointer hover:border-[#D4AF37] transition-colors group"
              >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-gray-500 group-hover:text-[#D4AF37] transition-colors">03</div>
                <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] mb-0.5">Portrait</div>
                <div className="text-xs sm:text-sm font-medium text-white">Profil Studio</div>
              </div>
            </div>

            {/* Trust points - Geometric hairline */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
              <div>
                <div className="flex items-center gap-1 text-[#D4AF37] font-bold text-base">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  <span>{stat1Val}</span>
                </div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{stat1Lbl}</p>
              </div>
              <div>
                <div className="text-[#D4AF37] font-bold text-base">{stat2Val}</div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{stat2Lbl}</p>
              </div>
              <div>
                <div className="text-[#D4AF37] font-bold text-base">{stat3Val}</div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{stat3Lbl}</p>
              </div>
            </div>

          </div>

          {/* Right Column - Visual Showcase Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Card - Geometric Frame with Slideshow */}
              <div className="relative overflow-hidden border border-white/10 bg-[#141414] aspect-[4/5] group">
                {bannerImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Dimensi Studio Showcase ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-20 pointer-events-none" />

                {/* Carousel Navigation Arrows if multiple */}
                {bannerImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/60 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                      title="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-black/60 hover:bg-[#D4AF37] hover:text-black text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                      title="Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-sm border border-white/10 shadow-md">
                      {bannerImages.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentSlide ? 'bg-[#D4AF37] w-4' : 'bg-white/40 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Floating geometric overlay card bottom */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0F0F0F]/95 border border-white/10 text-[#E0E0E0] z-30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">{cardSubtitle}</span>
                      <h4 className="font-serif font-bold text-sm text-white">{cardTitle}</h4>
                    </div>
                    <div className="w-8 h-8 border border-white/20 flex items-center justify-center text-[#D4AF37]">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                    {cardDescription}
                  </p>
                </div>

                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-[#0A0A0A]/90 border border-white/10 text-[10px] uppercase tracking-widest text-[#D4AF37]">
                  <Award className="w-3 h-3 text-[#D4AF37]" />
                  <span>{badgeText}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
