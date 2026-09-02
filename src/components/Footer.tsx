import React from 'react';
import { Camera, MapPin, Phone, Mail, Instagram, Clock, ArrowUp, Heart } from 'lucide-react';
import { STUDIO_INFO } from '../data/mockData';
import { StudioConfig } from '../types';
import { normalizeWhatsAppNumber } from '../utils/formatters';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  studioConfig?: StudioConfig;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenAdmin, studioConfig }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const adminWhatsApp = normalizeWhatsAppNumber(
    studioConfig?.whatsapp || studioConfig?.phone || studioConfig?.masterPhone || STUDIO_INFO.whatsapp
  );
  const studioName = studioConfig?.studioName || 'DIMENSI';
  const studioAddress = studioConfig?.address || STUDIO_INFO.address;
  const studioHours = studioConfig?.operatingHours || STUDIO_INFO.operatingHours;
  const studioEmail = studioConfig?.email || STUDIO_INFO.email;
  const studioPhone = studioConfig?.whatsapp || studioConfig?.phone || STUDIO_INFO.phone;

  return (
    <footer className="bg-[#0A0A0A] text-gray-400 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#D4AF37] flex items-center justify-center text-black font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-white">{studioName}</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF37]">STUDIO</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md">
              {studioConfig?.tagline || STUDIO_INFO.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent('Halo ' + studioName + ', saya ingin bertanya mengenai layanan foto.')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#141414] border border-white/10 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                title="WhatsApp Dimensi Studio"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/dimensi_id_?igsh=YWtmMWF0aWVhemUy"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#141414] border border-white/10 text-gray-400 hover:text-pink-400 hover:border-pink-500/50 transition-colors"
                title="Instagram Dimensi Studio"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@dimensi.id?_t=ZS-8xf3ifhaDn5&_r=1"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#141414] border border-white/10 text-gray-400 hover:text-white hover:border-[#D4AF37] transition-colors flex items-center justify-center"
                title="TikTok Dimensi Studio"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a
                href={`mailto:${studioEmail}`}
                className="p-2.5 bg-[#141414] border border-white/10 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                title="Email Dimensi Studio"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
              Layanan Utama
            </h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#paket-layanan" className="hover:text-white transition-colors">Wedding & Akad Nikah</a></li>
              <li><a href="#paket-layanan" className="hover:text-white transition-colors">Pre-Wedding Sinematik</a></li>
              <li><a href="#paket-layanan" className="hover:text-white transition-colors">Wisuda & Graduation</a></li>
              <li><a href="#paket-layanan" className="hover:text-white transition-colors">Foto Keluarga & Maternity</a></li>
              <li><a href="#paket-layanan" className="hover:text-white transition-colors">Foto Produk & E-Commerce</a></li>
              <li><a href="#paket-layanan" className="hover:text-white transition-colors">Dokumentasi Event</a></li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF37]">
              Kontak & Studio
            </h4>
            <div className="space-y-2.5 text-gray-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{studioAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{studioHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="font-mono">WhatsApp: +{adminWhatsApp}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Email: {studioEmail}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="px-3.5 py-2 bg-[#141414] border border-white/10 text-[11px] font-mono text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors cursor-pointer uppercase tracking-wider"
              >
                📊 Panel Admin / Ekspor Excel
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <div>
            © {new Date().getFullYear()} <strong className="text-gray-400 font-normal">Dimensi Fotografi Studio</strong>. Hak Cipta Dilindungi.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-gray-400 hover:text-[#D4AF37] transition-colors cursor-pointer uppercase tracking-wider"
            >
              <span>Kembali ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
