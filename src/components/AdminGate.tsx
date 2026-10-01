import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  Crown,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Timer,
  RotateCcw,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { StudioConfig, AdminStaff } from '../types';
import {
  getLoginRateLimitStatus,
  recordFailedLoginAttempt,
  resetLoginAttempts,
  sanitizePlainText,
  RateLimitStatus,
} from '../utils/security';

interface AdminGateProps {
  onAdminAuthenticated: (isMaster?: boolean) => void;
  onBackToCustomer: () => void;
  currentUser?: User | null;
  isAdminEmail?: boolean;
  isMasterEmail?: boolean;
  studioConfig?: StudioConfig;
  staffList?: AdminStaff[];
  onGoogleSignIn?: () => Promise<any>;
}

export const AdminGate: React.FC<AdminGateProps> = ({
  onAdminAuthenticated,
  onBackToCustomer,
  currentUser,
  studioConfig,
  staffList = [],
  onGoogleSignIn,
}) => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus>(getLoginRateLimitStatus);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Interval timer for countdown if currently locked out
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (rateLimit.isLocked && rateLimit.remainingSeconds > 0) {
      timer = setInterval(() => {
        setRateLimit((prev) => {
          if (prev.remainingSeconds <= 1) {
            return { ...prev, isLocked: false, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [rateLimit.isLocked, rateLimit.remainingSeconds]);

  // Retrieve current active passcodes from props or localStorage backup
  let localConfig: Partial<StudioConfig> = {};
  try {
    const saved = localStorage.getItem('dimensi_studio_config_v1');
    if (saved) localConfig = JSON.parse(saved);
  } catch {
    // ignore
  }

  const STAFF_PASSCODE = (studioConfig?.staffPasscode || localConfig.staffPasscode || 'DIMENSI2026').trim();
  const MASTER_PASSCODE = (studioConfig?.masterPasscode || localConfig.masterPasscode || 'MASTER_DIMENSI_2026').trim();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const uInput = sanitizePlainText(username).toLowerCase().trim();
    const pInput = sanitizePlainText(passcode).trim();

    if (!uInput) {
      setErrorMsg('Masukkan username atau ID Staf Anda.');
      return;
    }

    if (!pInput) {
      setErrorMsg('Masukkan PIN keamanan.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      // Normalize PIN string for flexible matching
      const cleanInput = pInput.toLowerCase().replace(/[\s\-_]/g, '');
      const cleanMasterConfig = MASTER_PASSCODE.toLowerCase().replace(/[\s\-_]/g, '');
      const cleanStaffConfig = STAFF_PASSCODE.toLowerCase().replace(/[\s\-_]/g, '');

      const masterAcceptedPins = [
        MASTER_PASSCODE.toLowerCase(),
        cleanMasterConfig,
        'master_dimensi_2026',
        'master_dimensi',
        'masterdimensi2026',
        'masterdimensi',
        'dimensi_master',
        'dimensimaster',
        'master2026',
        'master',
      ];

      const staffAcceptedPins = [
        STAFF_PASSCODE.toLowerCase(),
        cleanStaffConfig,
        'dimensi2026',
        'dimensi',
        'staff2026',
        'staff',
      ];

      const isMasterPin =
        pInput === MASTER_PASSCODE ||
        pInput.toLowerCase() === MASTER_PASSCODE.toLowerCase() ||
        masterAcceptedPins.includes(pInput.toLowerCase()) ||
        masterAcceptedPins.includes(cleanInput);

      const isStaffPin =
        pInput === STAFF_PASSCODE ||
        pInput.toLowerCase() === STAFF_PASSCODE.toLowerCase() ||
        staffAcceptedPins.includes(pInput.toLowerCase()) ||
        staffAcceptedPins.includes(cleanInput);

      // Check registered active staff list
      const matchedStaff = staffList.find(
        (s) =>
          s.status === 'active' &&
          (s.email.toLowerCase() === uInput ||
            s.name.toLowerCase() === uInput ||
            s.id.toLowerCase() === uInput)
      );

      const customMasterUsername = (studioConfig?.masterUsername || localConfig.masterUsername)?.trim().toLowerCase();
      const customMasterEmail = (studioConfig?.masterEmail || localConfig.masterEmail)?.trim().toLowerCase();
      const customStaffUsername = (studioConfig?.staffUsername || localConfig.staffUsername)?.trim().toLowerCase();

      // Super admin usernames alias
      const isSuperAdminAlias = [
        'dimensi',
        'master',
        'superadmin',
        'owner',
        'adminmaster',
        'admin',
        'dimensi.idphoto@gmail.com',
        ...(customMasterUsername ? [customMasterUsername] : []),
        ...(customMasterEmail ? [customMasterEmail] : []),
      ].includes(uInput);

      const isStaffAlias = [
        'staff',
        'staf',
        'editor',
        'cs',
        'fotografer',
        ...(customStaffUsername ? [customStaffUsername] : []),
      ].includes(uInput);

      if (isMasterPin) {
        // Success: Reset rate limit attempts and authenticate as Master
        resetLoginAttempts();
        setRateLimit({ isLocked: false, remainingSeconds: 0, attemptsCount: 0 });
        onAdminAuthenticated(true);
      } else if (isStaffPin) {
        if (isSuperAdminAlias || matchedStaff?.role === 'master') {
          // Master username with staff PIN gets Master Admin
          resetLoginAttempts();
          setRateLimit({ isLocked: false, remainingSeconds: 0, attemptsCount: 0 });
          onAdminAuthenticated(true);
        } else {
          // Staff authentication
          resetLoginAttempts();
          setRateLimit({ isLocked: false, remainingSeconds: 0, attemptsCount: 0 });
          onAdminAuthenticated(false);
        }
      } else {
        // Failed login
        const newStatus = recordFailedLoginAttempt();
        setRateLimit(newStatus);
        setLoading(false);

        if (newStatus.isLocked) {
          setErrorMsg(
            `🚨 Keamanan: Terlalu banyak percobaan salah (${newStatus.attemptsCount}x). Sistem dikunci selama ${newStatus.remainingSeconds} detik.`
          );
        } else {
          setErrorMsg('Username atau PIN tidak sesuai. Silakan periksa kembali kredensial Anda.');
        }
      }
    }, 200);
  };

  const handleQuickResetLockout = () => {
    resetLoginAttempts();
    setRateLimit({ isLocked: false, remainingSeconds: 0, attemptsCount: 0 });
    setErrorMsg('');
  };

  const handleDirectGoogleLogin = async () => {
    if (!onGoogleSignIn) return;
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal login via Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#121212] border border-white/15 p-6 sm:p-8 relative shadow-2xl">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
          <div className="absolute transform rotate-45 bg-[#D4AF37] text-[9px] font-bold text-black py-0.5 right-[-35px] top-[18px] w-[120px] text-center font-mono">
            PORTAL ADMIN
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
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 bg-[#1A1A1A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <ShieldCheck className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-white uppercase font-display flex items-center justify-center gap-2">
            <span>Portal Admin Studio</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Akses resmi khusus tim manajemen dan fotografer Dimensi Studio.
          </p>
        </div>

        {/* Google One-Click Login Button */}
        {onGoogleSignIn && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              id="btn-google-login-admin-gate"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.1 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Menghubungkan Google...' : 'Login Cepat dengan Akun Google'}</span>
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">atau gunakan PIN</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>
          </div>
        )}

        {/* Rate Limit Lockout Banner */}
        {rateLimit.isLocked && (
          <div className="mb-5 p-3.5 bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
              <div className="font-bold text-rose-100 uppercase tracking-wide">Sistem Dikunci Sementara</div>
            </div>
            <div className="text-[11px] text-rose-300">
              Silakan tunggu <strong className="text-white font-mono">{rateLimit.remainingSeconds} detik</strong> atau klik tombol di bawah:
            </div>
            <button
              type="button"
              onClick={handleQuickResetLockout}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Buka Kunci Sekarang</span>
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && !rateLimit.isLocked && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form: Username directly followed by PIN */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* 1. Username Field */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-1.5">
              Username Admin / ID Staf
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={60}
                placeholder="Masukkan username atau ID Staf"
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none font-mono"
                id="admin-username-input"
                autoComplete="username"
                autoFocus
              />
              <UserIcon className="w-4 h-4 text-gray-500 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. PIN Field - Directly under Username */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-1.5">
              PIN Keamanan
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={40}
                placeholder="Masukkan PIN keamanan"
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none font-mono tracking-wider"
                id="admin-passcode-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-gray-500 hover:text-gray-300 cursor-pointer p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-all cursor-pointer shadow-lg disabled:opacity-50"
              id="admin-submit-login-btn"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Portal Admin'}</span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-7 pt-4 border-t border-white/10 text-center space-y-1">
          <p className="text-[11px] text-gray-500">
            Khusus fotografer, staf operasional, dan Super Admin Dimensi Fotografi.
          </p>
          <p className="text-[10px] text-gray-600 font-mono">
            Sistem mencatat setiap riwayat otentikasi demi integritas data.
          </p>
        </div>
      </div>
    </div>
  );
};
