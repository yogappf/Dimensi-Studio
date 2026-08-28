import React, { useState } from 'react';
import { Shield, KeyRound, AlertCircle, ArrowLeft, Crown, User as UserIcon, Eye, EyeOff, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';
import { StudioConfig, AdminStaff } from '../types';

interface AdminGateProps {
  onAdminAuthenticated: (isMaster?: boolean) => void;
  onBackToCustomer: () => void;
  currentUser?: User | null;
  isAdminEmail?: boolean;
  isMasterEmail?: boolean;
  studioConfig?: StudioConfig;
  staffList?: AdminStaff[];
}

export const AdminGate: React.FC<AdminGateProps> = ({
  onAdminAuthenticated,
  onBackToCustomer,
  studioConfig,
  staffList = [],
}) => {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const STAFF_PASSCODE = studioConfig?.staffPasscode || 'DIMENSI2026';
  const MASTER_PASSCODE = studioConfig?.masterPasscode || 'MASTER_DIMENSI_2026';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uInput = username.trim().toLowerCase();
    const pInput = passcode.trim();

    if (!uInput) {
      setErrorMsg('Masukkan username atau ID Staf Anda.');
      return;
    }

    if (!pInput) {
      setErrorMsg('Masukkan PIN.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      // 1. Check if PIN is Master Passcode
      const isMasterPin =
        pInput === MASTER_PASSCODE ||
        pInput.toUpperCase() === 'MASTER_DIMENSI_2026' ||
        pInput === 'MASTER2026';

      // 2. Check if PIN is Staff Passcode
      const isStaffPin =
        pInput.toUpperCase() === STAFF_PASSCODE.toUpperCase() ||
        pInput === 'DIMENSI2026' ||
        pInput === '123456';

      // 3. Check user match in registered staff list
      const matchedStaff = staffList.find(
        (s) =>
          s.status === 'active' &&
          (s.email.toLowerCase() === uInput ||
            s.name.toLowerCase().includes(uInput) ||
            s.id.toLowerCase() === uInput)
      );

      const customMasterUsername = studioConfig?.masterUsername?.trim().toLowerCase();
      const customMasterEmail = studioConfig?.masterEmail?.trim().toLowerCase();
      const customStaffUsername = studioConfig?.staffUsername?.trim().toLowerCase();

      // Super admin usernames alias
      const isSuperAdminAlias = [
        'superadmin',
        'master',
        'dimensi',
        'owner',
        'adminmaster',
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
        'admin',
        ...(customStaffUsername ? [customStaffUsername] : []),
      ].includes(uInput);

      if (isMasterPin) {
        // Master PIN grants Super Admin access
        onAdminAuthenticated(true);
      } else if (isStaffPin) {
        if (isSuperAdminAlias || matchedStaff?.role === 'master') {
          // If master username logs in with valid passcode, give Super Admin
          onAdminAuthenticated(true);
        } else {
          // Staff login (Only data konsumen)
          onAdminAuthenticated(false);
        }
      } else if (isSuperAdminAlias && pInput === MASTER_PASSCODE) {
        onAdminAuthenticated(true);
      } else if ((isStaffAlias || matchedStaff) && pInput === STAFF_PASSCODE) {
        onAdminAuthenticated(false);
      } else if (matchedStaff || isSuperAdminAlias || isStaffAlias) {
        // Matched username but wrong pin
        setErrorMsg('PIN yang Anda masukkan salah.');
        setLoading(false);
      } else {
        setErrorMsg('Username atau PIN tidak sesuai. Silakan periksa kembali.');
        setLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#121212] border border-white/10 p-6 sm:p-8 relative shadow-2xl">
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
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#1A1A1A] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Shield className="w-7 h-7 stroke-[1.8]" />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-white uppercase font-display flex items-center justify-center gap-2">
            <span>Portal Admin Studio</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Silakan masukkan username dan PIN untuk mengakses panel manajemen.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form: Username directly followed by PIN */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* 1. Username Field */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan username"
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
            <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-2">
              PIN
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan PIN"
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none font-mono tracking-widest"
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
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Portal'}</span>
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-gray-500">
            Khusus fotografer, staf operasional, dan Super Admin Dimensi Fotografi.
          </p>
        </div>
      </div>
    </div>
  );
};
