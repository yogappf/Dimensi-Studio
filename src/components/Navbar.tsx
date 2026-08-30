import React from 'react';
import {
  Camera,
  CalendarCheck,
  Users,
  MessageCircle,
  LogIn,
  LogOut,
  ShieldCheck,
  Shield,
  Search,
  ArrowLeft,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { STUDIO_INFO } from '../data/mockData';
import { StudioConfig } from '../types';
import { normalizeWhatsAppNumber } from '../utils/formatters';

interface NavbarProps {
  activeTab: 'showcase' | 'admin' | 'customer-portal';
  setActiveTab: (tab: 'showcase' | 'admin' | 'customer-portal') => void;
  orderCount: number;
  onOpenBooking: () => void;
  currentUser?: User | null;
  isAdminAuthenticated: boolean;
  isMasterAdmin?: boolean;
  onGoogleSignIn?: () => void;
  onLogOut?: () => void;
  isFirebaseConnected?: boolean;
  studioConfig?: StudioConfig;
  onExitAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  orderCount,
  onOpenBooking,
  currentUser,
  isAdminAuthenticated,
  isMasterAdmin = false,
  onGoogleSignIn,
  onLogOut,
  isFirebaseConnected,
  studioConfig,
  onExitAdmin,
}) => {
  const adminWhatsApp = normalizeWhatsAppNumber(
    studioConfig?.whatsapp || studioConfig?.phone || studioConfig?.masterPhone || STUDIO_INFO.whatsapp
  );

  const handleNavClick = (sectionId: string) => {
    setActiveTab('showcase');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo - Geometric */}
          <div
            onClick={() => setActiveTab('showcase')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37] transition-colors">
              <Camera className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold tracking-widest text-white flex items-center gap-2">
                <span>DIMENSI<span className="text-[#D4AF37]">STUDIO</span></span>
                {isAdminAuthenticated && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 border tracking-wider ${
                    isMasterAdmin
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {isMasterAdmin ? 'MASTER' : 'STAF'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.25em]">Photography & Visual Art</p>
                {isFirebaseConnected && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Firebase
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Center Links - Visible on Showcase */}
          <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-widest font-medium">
            <button
              onClick={() => handleNavClick('paket-layanan')}
              className={`transition-colors py-1 cursor-pointer ${
                activeTab === 'showcase' ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-400 hover:text-white'
              }`}
              id="nav-paket-btn"
            >
              Layanan & Paket
            </button>
            <button
              onClick={() => handleNavClick('portofolio')}
              className="text-gray-300 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              id="nav-portfolio-btn"
            >
              Portfolio
            </button>
            <button
              onClick={() => handleNavClick('kalkulator-simulasi')}
              className="text-gray-300 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
              id="nav-simulasi-btn"
            >
              Simulasi Biaya
            </button>
            
            {/* Lacak Pesanan Konsumen Tab */}
            <button
              onClick={() => setActiveTab('customer-portal')}
              className={`transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'customer-portal'
                  ? 'text-[#D4AF37] font-bold border-b border-[#D4AF37]'
                  : 'text-gray-300 hover:text-[#D4AF37]'
              }`}
              id="nav-track-order-btn"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lacak Pesanan</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Customer Portal Button (Mobile / Quick access) */}
            {activeTab !== 'customer-portal' && activeTab !== 'admin' && (
              <button
                onClick={() => setActiveTab('customer-portal')}
                className="lg:hidden flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-mono text-gray-300 hover:text-[#D4AF37] bg-[#141414] border border-white/10 transition-colors"
                title="Lacak Status Pesanan Saya"
              >
                <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Lacak</span>
              </button>
            )}

            {/* Portal Admin Switcher Button & Exit Button */}
            {activeTab === 'admin' ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setActiveTab('showcase')}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer shadow-sm"
                  id="btn-back-to-showcase"
                  title="Kembali ke Tampilan Pengunjung (Mode Konsumen)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mode Konsumen</span>
                  <span className="sm:hidden">Konsumen</span>
                </button>

                {isAdminAuthenticated && onExitAdmin && (
                  <button
                    onClick={onExitAdmin}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-[11px] font-semibold font-mono uppercase tracking-wider bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-700/50 hover:border-rose-500 transition-all cursor-pointer shadow-sm"
                    id="nav-btn-exit-admin"
                    title={isMasterAdmin ? 'Kunci & Keluar dari Panel Admin' : 'Kunci & Keluar dari Portal Staf'}
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isMasterAdmin ? 'Keluar Admin' : 'Keluar Staf'}</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                  isAdminAuthenticated
                    ? 'bg-[#1c1708] border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                    : 'bg-[#141414] text-gray-400 border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]'
                }`}
                id="tab-switcher-admin-btn"
                title={isAdminAuthenticated ? (isMasterAdmin ? "Akses Panel Super Admin" : "Akses Portal Staf") : "Akses Portal Masuk Admin & Staf"}
              >
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">
                  {isAdminAuthenticated ? (isMasterAdmin ? 'Panel Master' : 'Portal Staf') : 'Portal Admin'}
                </span>
                <span className="sm:hidden">{isMasterAdmin ? 'Master' : 'Staf'}</span>
                {orderCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-black/50 text-[#D4AF37] text-[10px] border border-white/10 font-mono">
                    {orderCount}
                  </span>
                )}
              </button>
            )}

            {/* Google Auth Status (Only shown if signed in) */}
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-300 max-w-[130px] truncate" title={currentUser.email || ''}>
                  {isAdminAuthenticated ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={onLogOut}
                  className="p-1.5 bg-[#141414] hover:bg-rose-950/40 hover:text-rose-400 text-gray-400 border border-white/10 transition-colors cursor-pointer"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Direct Order CTA on showcase */}
            {activeTab === 'showcase' && (
              <button
                onClick={onOpenBooking}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] bg-[#D4AF37] text-black hover:bg-white transition-all shadow-sm cursor-pointer"
                id="header-booking-cta-btn"
              >
                <CalendarCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">Pesan Sekarang</span>
                <span className="sm:hidden">Pesan</span>
              </button>
            )}

            {/* WhatsApp Floating link */}
            <a
              href={`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent('Halo Dimensi Fotografi, saya ingin tanya info paket dan booking foto.')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 sm:p-2.5 bg-[#141414] text-gray-300 border border-white/10 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-colors"
              title="Chat WhatsApp Studio"
              id="header-wa-btn"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
