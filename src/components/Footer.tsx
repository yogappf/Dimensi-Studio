import React from 'react';
import { Camera, MapPin, Phone, Mail, Instagram, Clock, ArrowUp, Heart } from 'lucide-react';
import { STUDIO_INFO } from '../data/mockData';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                <span className="font-serif text-2xl font-bold tracking-tight text-white">DIMENSI</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF37]">STUDIO</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md">
              {STUDIO_INFO.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${STUDIO_INFO.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#141414] border border-white/10 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                title="WhatsApp Dimensi Studio"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-[#141414] border border-white/10 text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
                title="Instagram Dimensi Studio"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${STUDIO_INFO.email}`}
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
                <span>{STUDIO_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{STUDIO_INFO.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span className="font-mono">WhatsApp: +{STUDIO_INFO.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Email: {STUDIO_INFO.email}</span>
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
