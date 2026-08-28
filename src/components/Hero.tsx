import React from 'react';
import { Camera, Sparkles, Award, ShieldCheck, Clock, ArrowRight, MessageCircle, Star, Heart } from 'lucide-react';
import { STUDIO_INFO } from '../data/mockData';

interface HeroProps {
  onOpenBooking: () => void;
  onSelectPackageFilter: (category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onSelectPackageFilter }) => {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] text-[#E0E0E0] pt-10 pb-16 lg:py-20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column - Promotion copy & Call to Action */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top promotional pill / eyebrow */}
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
              <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
              <span>Dimensi Photography & Art Studio</span>
            </div>

            {/* Main Headline - Geometric Balance Typography */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-white tracking-tight">
              Abadikan <br/>
              Momen <span className="italic font-serif text-[#D4AF37]">Terbaik</span> Anda
            </h1>

            {/* Subtext */}
            <p className="text-gray-400 max-w-lg text-sm sm:text-base leading-relaxed">
              Kami menghadirkan seni dalam setiap jepretan. Dari pernikahan sakral, portrait wisuda, keluarga, hingga produk komersial, Dimensi Studio memberikan hasil visual presisi yang bercerita.
            </p>

            {/* Action buttons - Geometric Balance */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenBooking}
                className="bg-[#D4AF37] text-black font-bold py-3.5 px-6 text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-md flex items-center gap-2.5 cursor-pointer group"
                id="hero-order-btn"
              >
                <span>Pesan Sekarang</span>
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
                Lihat Layanan
              </button>

              <a
                href={`https://wa.me/${STUDIO_INFO.whatsapp}?text=Halo%20Dimensi%20Fotografi,%20saya%20tertarik%20untuk%20konsultasi%20paket%20foto`}
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
                  onSelectPackageFilter('produk');
                  const el = document.getElementById('paket-layanan');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#222222] border border-white/10 p-3.5 sm:p-4 flex flex-col justify-end relative h-28 cursor-pointer hover:border-[#D4AF37] transition-colors group"
              >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-gray-500 group-hover:text-[#D4AF37] transition-colors">02</div>
                <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] mb-0.5">Product</div>
                <div className="text-xs sm:text-sm font-medium text-white">Komersial</div>
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
                  <span>4.9 / 5.0</span>
                </div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">1.500+ Klien Puas</p>
              </div>
              <div>
                <div className="text-[#D4AF37] font-bold text-base">8+ Tahun</div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Pengalaman Visual</p>
              </div>
              <div>
                <div className="text-[#D4AF37] font-bold text-base">100%</div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Garansi High-Res</p>
              </div>
            </div>

          </div>

          {/* Right Column - Visual Showcase Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Card - Geometric Frame */}
              <div className="relative overflow-hidden border border-white/10 bg-[#141414] aspect-[4/5] group">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"
                  alt="Dimensi Studio Showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                
                {/* Floating geometric overlay card bottom */}
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0F0F0F]/95 border border-white/10 text-[#E0E0E0]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">Signature Series</span>
                      <h4 className="font-serif font-bold text-sm text-white">The Royal Eternity</h4>
                    </div>
                    <div className="w-8 h-8 border border-white/20 flex items-center justify-center text-[#D4AF37]">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                    Dokumentasi wedding sinematik 4K dengan color grading eksklusif.
                  </p>
                </div>

                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-[#0A0A0A]/90 border border-white/10 text-[10px] uppercase tracking-widest text-[#D4AF37]">
                  <Award className="w-3 h-3 text-[#D4AF37]" />
                  <span>Top Rated Studio</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
