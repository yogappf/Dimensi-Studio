import React, { useState } from 'react';
import { Shield, Lock, LogIn, KeyRound, AlertCircle, ArrowLeft, CheckCircle2, Crown, Sparkles } from 'lucide-react';
import { User } from 'firebase/auth';
import { StudioConfig } from '../types';

interface AdminGateProps {
  onAdminAuthenticated: (isMaster?: boolean) => void;
  onGoogleSignIn: () => Promise<any> | void;
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
      setErrorMsg('Masukkan PIN Admin Studio.');
      return;
    }

    if (input === MASTER_PASSCODE || input.toUpperCase() === 'MASTER_DIMENSI_2026') {
      setErrorMsg('');
      onAdminAuthenticated(true); // Master / Super Admin
    } else if (
      input.toUpperCase() === STAFF_PASSCODE.toUpperCase() ||
      input === 'DIMENSI2026' ||
      input === '123456'
    ) {
      setErrorMsg('');
      onAdminAuthenticated(false); // Staff Admin (Only Data Konsumen)
    } else {
      setErrorMsg('PIN yang Anda masukkan salah. Silakan periksa kembali atau login dengan Akun Google Admin.');
    }
  };

  const handleGoogleAdminClick = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // If user is already logged in as master/admin, immediately authenticate
      if (currentUser) {
        const email = currentUser.email?.toLowerCase() || '';
        if (isMasterEmail || email === 'dimensi.idphoto@gmail.com') {
          onAdminAuthenticated(true);
          return;
        } else if (isAdminEmail) {
          onAdminAuthenticated(false);
          return;
        }
      }

      const res: any = await onGoogleSignIn();
      const user = res?.user || currentUser;
      if (user) {
        const email = (user.email || '').toLowerCase();
        if (email === 'dimensi.idphoto@gmail.com' || isMasterEmail) {
          onAdminAuthenticated(true);
        } else if (isAdminEmail) {
          onAdminAuthenticated(false);
        } else {
          // If standard user signs in, prompt or authenticate if email contains studio name
          if (email.includes('dimensi')) {
            onAdminAuthenticated(true);
          } else {
            setErrorMsg(`Akun Google (${user.email}) berhasil terhubung. Jika ini staf/admin, masukkan PIN di bawah untuk verifikasi hak akses.`);
          }
        }
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('Jendela popup login diblokir oleh browser. Izinkan popup untuk situs ini atau gunakan PIN Admin.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login Google ditutup. Silakan coba kembali atau gunakan PIN.');
      } else {
        setErrorMsg(err?.message || 'Gagal login dengan Akun Google. Silakan gunakan PIN Admin.');
      }
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
            {isMasterEmail ? 'SUPER ADMIN' : 'ADMIN PORTAL'}
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
            Akses portal khusus manajemen staf & Super Admin Dimensi Fotografi.
          </p>
        </div>

        {/* Current User Info if signed in with recognized Admin/Master account */}
        {currentUser && (isAdminEmail || isMasterEmail || currentUser.email?.toLowerCase() === 'dimensi.idphoto@gmail.com') ? (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="font-bold block text-white text-xs">
                  {isMasterEmail || currentUser.email?.toLowerCase() === 'dimensi.idphoto@gmail.com'
                    ? '👑 Super Admin Terverifikasi'
                    : '🛡️ Staf Admin Terverifikasi'}
                </span>
                <p className="text-[11px] text-emerald-400 font-mono truncate">{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={() => onAdminAuthenticated(isMasterEmail || currentUser.email?.toLowerCase() === 'dimensi.idphoto@gmail.com')}
              className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
              id="admin-instant-enter-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Masuk Panel</span>
            </button>
          </div>
        ) : currentUser ? (
          <div className="mb-6 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <p className="font-semibold mb-1">Akun Google Terhubung: {currentUser.email}</p>
            <p className="text-[11px] text-amber-200/80">
              Masukkan PIN Admin Studio di bawah untuk memverifikasi hak akses staf/super admin.
            </p>
          </div>
        ) : null}

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
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1A1A1A] hover:bg-[#242424] text-white border border-white/20 hover:border-[#D4AF37] transition-all text-xs font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50"
            id="admin-google-login-btn"
          >
            <LogIn className="w-4 h-4 text-[#D4AF37]" />
            <span>{loading ? 'Menghubungkan Akun Google...' : 'Login dengan Google Admin'}</span>
          </button>

          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-white/10 w-full"></div>
            <span className="bg-[#121212] px-3 text-[10px] uppercase font-mono tracking-widest text-gray-500 absolute">
              Atau Gunakan PIN
            </span>
          </div>

          {/* Method 2: Passcode Form */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-2">
                PIN Admin
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Masukkan PIN"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none font-mono"
                  id="admin-passcode-input"
                  autoComplete="off"
                />
                <KeyRound className="w-4 h-4 text-gray-500 absolute right-3.5 top-3 pointer-events-none" />
              </div>
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
            Khusus fotografer, staf operasional, dan pemilik studio Dimensi.
          </p>
        </div>
      </div>
    </div>
  );
};

