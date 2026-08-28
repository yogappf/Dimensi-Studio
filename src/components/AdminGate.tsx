import React, { useState } from 'react';
import { Shield, Lock, LogIn, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, Crown } from 'lucide-react';
import { User } from 'firebase/auth';
import { StudioConfig } from '../types';

interface AdminGateProps {
  onAdminAuthenticated: (isMaster?: boolean) => void;
  onGoogleSignIn: () => void;
  onBackToCustomer: () => void;
  currentUser: User | null;
  isAdminEmail: boolean;
  isMasterEmail?: boolean;
  studioConfig?: StudioConfig;
}

export const AdminGate: React.FC<AdminGateProps> = ({
  onAdminAuthenticated,
  onGoogleSignIn,
  onBackToCustomer,
  currentUser,
  isAdminEmail,
  isMasterEmail,
  studioConfig,
}) => {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const STAFF_PASSCODE = studioConfig?.staffPasscode || 'DIMENSI2026';
  const MASTER_PASSCODE = studioConfig?.masterPasscode || 'MASTER_DIMENSI_2026';

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = passcode.trim();
    if (!input) {
      setErrorMsg('Masukkan kata sandi / PIN Admin Studio.');
      return;
    }

    if (input === MASTER_PASSCODE || input.toUpperCase() === 'MASTER_DIMENSI_2026') {
      setErrorMsg('');
      onAdminAuthenticated(true); // Master Admin
    } else if (
      input.toUpperCase() === STAFF_PASSCODE.toUpperCase() ||
      input === 'DIMENSI2026' ||
      input === '123456'
    ) {
      setErrorMsg('');
      onAdminAuthenticated(false); // Staff Admin
    } else {
      setErrorMsg('Kata sandi / PIN Admin salah. Silakan periksa kembali atau login dengan Akun Google Admin.');
    }
  };

  const handleGoogleAdminClick = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 p-6 sm:p-8 relative shadow-2xl">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
          <div className="absolute transform rotate-45 bg-[#D4AF37] text-[9px] font-bold text-black py-0.5 right-[-35px] top-[18px] w-[120px] text-center font-mono">
            {isMasterEmail ? 'MASTER' : 'ADMIN'}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-[#D4AF37] transition-colors mb-6 cursor-pointer"
          id="admin-gate-back-btn"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Konsumen</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#1A1A1A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            {isMasterEmail ? <Crown className="w-7 h-7 stroke-[1.8]" /> : <Shield className="w-7 h-7 stroke-[1.8]" />}
          </div>
          <h2 className="text-xl font-bold tracking-wider text-white uppercase font-display flex items-center justify-center gap-2">
            <span>Portal Admin Studio</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Halaman ini khusus untuk manajemen studio, fotografer, & rekap data konsumen.
          </p>
        </div>

        {/* Current User Info if signed in but not recognized */}
        {currentUser && !isAdminEmail && (
          <div className="mb-6 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <p className="font-semibold mb-1">Akun Terhubung: {currentUser.email}</p>
            <p className="text-[11px] text-amber-200/80">
              Akun ini terdaftar sebagai Konsumen. Masukkan PIN Admin Studio di bawah untuk mengakses panel manajemen.
            </p>
          </div>
        )}

        {currentUser && isAdminEmail && (
          <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">{isMasterEmail ? '👑 Master Admin Terverifikasi' : 'Akun Admin Resmi Terdeteksi'}</span>
                <p className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px]">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={() => onAdminAuthenticated(isMasterEmail)}
              className="px-3 py-1.5 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-md"
            >
              Masuk
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Method 1: Google Sign-in */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleAdminClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1A1A1A] hover:bg-[#242424] text-white border border-white/20 hover:border-[#D4AF37] transition-all text-xs font-bold tracking-wider uppercase cursor-pointer"
            id="admin-google-login-btn"
          >
            <LogIn className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'Memproses...' : 'Login dengan Google Admin'}</span>
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full"></div>
            <span className="bg-[#121212] px-3 text-[10px] uppercase font-mono tracking-widest text-gray-500 absolute">
              Atau Gunakan PIN Studio
            </span>
          </div>

          {/* Method 2: Passcode Form */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-2">
                PIN / Passcode Admin Studio
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Masukkan PIN Admin (cth: DIMENSI2026)"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none font-mono"
                  id="admin-passcode-input"
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute right-3.5 top-3 pointer-events-none" />
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 font-mono">
                Hint staf: <span className="text-[#D4AF37]">{STAFF_PASSCODE}</span> | Master: <span className="text-amber-400/70">{MASTER_PASSCODE}</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4AF37] hover:bg-white text-black transition-all text-xs font-bold tracking-wider uppercase cursor-pointer shadow-lg"
              id="admin-passcode-submit-btn"
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Buka Panel Admin</span>
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-gray-500">
            Bukan staf studio? Silakan kembali ke katalog untuk memesan sesi foto.
          </p>
        </div>
      </div>
    </div>
  );
};

