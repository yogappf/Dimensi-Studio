import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  AdminStaff,
  AdminRole,
  StudioConfig,
  AuditLogItem,
  BookingOrder,
  PhotoPackage,
  AddOnItem,
  PortfolioItem,
} from '../types';
import {
  Crown,
  Shield,
  ShieldCheck,
  KeyRound,
  Users,
  Building,
  Database,
  FileDown,
  FileUp,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Save,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import {
  saveStudioConfigToFirestore,
  saveStaffToFirestore,
  updateStaffInFirestore,
  deleteStaffFromFirestore,
  logAuditEvent,
  DEFAULT_STUDIO_CONFIG,
} from '../firebase/services';

interface MasterAdminManagerProps {
  currentUser?: User | null;
  isMasterAdmin: boolean;
  studioConfig: StudioConfig;
  onUpdateStudioConfig: (newConfig: StudioConfig) => void;
  staffList: AdminStaff[];
  onAddStaff: (staff: AdminStaff) => void;
  onUpdateStaff: (id: string, updates: Partial<AdminStaff>) => void;
  onDeleteStaff: (id: string) => void;
  auditLogs: AuditLogItem[];
  // Full datasets for JSON backup/restore
  orders: BookingOrder[];
  packages: PhotoPackage[];
  addons: AddOnItem[];
  portfolios: PortfolioItem[];
  onRestoreAllData: (data: {
    orders?: BookingOrder[];
    packages?: PhotoPackage[];
    addons?: AddOnItem[];
    portfolios?: PortfolioItem[];
    staff?: AdminStaff[];
    config?: StudioConfig;
  }) => Promise<void>;
  isFirebaseConnected?: boolean;
}

export const MasterAdminManager: React.FC<MasterAdminManagerProps> = ({
  currentUser,
  isMasterAdmin,
  studioConfig,
  onUpdateStudioConfig,
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  auditLogs,
  orders,
  packages,
  addons,
  portfolios,
  onRestoreAllData,
  isFirebaseConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'security' | 'profile' | 'backup' | 'audit'>('staff');

  // Form states: Staff Add/Edit
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<AdminRole>('editor');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffStatus, setStaffStatus] = useState<'active' | 'inactive'>('active');

  // Studio Profile Form State
  const [configForm, setConfigForm] = useState<StudioConfig>(studioConfig);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);

  // Security Passcode Form State
  const [staffPasscode, setStaffPasscode] = useState(studioConfig.staffPasscode || 'DIMENSI2026');
  const [masterPasscode, setMasterPasscode] = useState(studioConfig.masterPasscode || 'MASTER_DIMENSI_2026');
  const [savePasscodeSuccess, setSavePasscodeSuccess] = useState(false);

  // JSON Backup / Restore State
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [restoreStatusMsg, setRestoreStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Handle Studio Config Save
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudioConfig(configForm);
    try {
      await saveStudioConfigToFirestore(configForm);
      await logAuditEvent(
        currentUser?.email || 'Master Admin',
        'Update Profil Studio',
        'Memperbarui identitas studio, kontak, dan info rekening pembayaran.',
        'system'
      );
      setSaveConfigSuccess(true);
      setTimeout(() => setSaveConfigSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  // Handle Passcode Save
  const handleSavePasscodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffPasscode.trim() || !masterPasscode.trim()) {
      alert('Passcode tidak boleh kosong.');
      return;
    }

    const updated = {
      ...configForm,
      staffPasscode: staffPasscode.trim(),
      masterPasscode: masterPasscode.trim(),
    };
    setConfigForm(updated);
    onUpdateStudioConfig(updated);
    try {
      await saveStudioConfigToFirestore(updated);
      await logAuditEvent(
        currentUser?.email || 'Master Admin',
        'Update PIN Keamanan',
        'Memperbarui PIN Staff Admin & Master Admin Passcode.',
        'security'
      );
      setSavePasscodeSuccess(true);
      setTimeout(() => setSavePasscodeSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving passcodes:', err);
    }
  };

  // Handle Open Staff Modal for Create / Edit
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffRole('editor');
    setStaffPhone('');
    setStaffStatus('active');
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (st: AdminStaff) => {
    setEditingStaffId(st.id);
    setStaffName(st.name);
    setStaffEmail(st.email);
    setStaffRole(st.role);
    setStaffPhone(st.phone || '');
    setStaffStatus(st.status);
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) {
      alert('Nama dan Email staf admin wajib diisi.');
      return;
    }

    if (editingStaffId) {
      const updates: Partial<AdminStaff> = {
        name: staffName.trim(),
        email: staffEmail.trim().toLowerCase(),
        role: staffRole,
        phone: staffPhone.trim(),
        status: staffStatus,
      };
      onUpdateStaff(editingStaffId, updates);
      try {
        await updateStaffInFirestore(editingStaffId, updates);
        await logAuditEvent(
          currentUser?.email || 'Master Admin',
          'Edit Data Staf Admin',
          `Memperbarui staf: ${staffName} (${staffRole})`,
          'security'
        );
      } catch (err) {
        console.error('Error updating staff:', err);
      }
    } else {
      const newStaff: AdminStaff = {
        id: `staff-${Date.now()}`,
        name: staffName.trim(),
        email: staffEmail.trim().toLowerCase(),
        role: staffRole,
        phone: staffPhone.trim(),
        addedAt: new Date().toISOString(),
        status: staffStatus,
      };
      onAddStaff(newStaff);
      try {
        await saveStaffToFirestore(newStaff);
        await logAuditEvent(
          currentUser?.email || 'Master Admin',
          'Tambah Staf Admin Baru',
          `Menambahkan staf: ${staffName} (${staffRole})`,
          'security'
        );
      } catch (err) {
        console.error('Error adding staff:', err);
      }
    }

    setIsStaffModalOpen(false);
  };

  const handleDeleteStaffClick = async (staffId: string, name: string) => {
    if (confirm(`Yakin ingin menghapus akses admin untuk ${name}?`)) {
      onDeleteStaff(staffId);
      try {
        await deleteStaffFromFirestore(staffId);
        await logAuditEvent(
          currentUser?.email || 'Master Admin',
          'Hapus Akses Staf Admin',
          `Menghapus akses staf: ${name}`,
          'security'
        );
      } catch (err) {
        console.error('Error deleting staff:', err);
      }
    }
  };

  // Full Database JSON Backup Export
  const handleExportFullBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      studioName: studioConfig.studioName,
      version: '2.0.0',
      totalRecords: {
        bookings: orders.length,
        packages: packages.length,
        addons: addons.length,
        portfolios: portfolios.length,
        staff: staffList.length,
      },
      data: {
        orders,
        packages,
        addons,
        portfolios,
        staff: staffList,
        config: studioConfig,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `DIMENSI_STUDIO_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logAuditEvent(
      currentUser?.email || 'Master Admin',
      'Ekspor Backup Database JSON',
      `Berhasil mengunduh backup lengkap database (${orders.length} order, ${packages.length} paket).`,
      'system'
    );
  };

  // Handle File Input for Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        if (event.target?.result) {
          setRestoreJsonText(event.target.result as string);
        }
      };
    }
  };

  // Execute Restore from JSON
  const handleExecuteRestore = async () => {
    if (!restoreJsonText.trim()) {
      setRestoreStatusMsg({ type: 'error', text: 'Pilih atau tempel data JSON backup terlebih dahulu.' });
      return;
    }

    try {
      setIsRestoring(true);
      setRestoreStatusMsg(null);
      const parsed = JSON.parse(restoreJsonText);
      const dataToRestore = parsed.data || parsed;

      if (!dataToRestore.orders && !dataToRestore.packages) {
        throw new Error('Format JSON tidak valid. Pastikan file adalah hasil backup resmi Dimensi Studio.');
      }

      await onRestoreAllData(dataToRestore);
      await logAuditEvent(
        currentUser?.email || 'Master Admin',
        'Restore Database dari JSON',
        'Memulihkan database studio dari file cadangan JSON.',
        'system'
      );

      setRestoreStatusMsg({
        type: 'success',
        text: 'Database berhasil dipulihkan dan disinkronkan ke Google Cloud Firestore!',
      });
      setRestoreJsonText('');
    } catch (err: any) {
      setRestoreStatusMsg({ type: 'error', text: `Gagal memulihkan data: ${err?.message || 'Format tidak valid'}` });
    } finally {
      setIsRestoring(false);
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'master':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider font-mono">
            <Crown className="w-3 h-3" /> Master Admin
          </span>
        );
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-bold uppercase tracking-wider font-mono">
            Lead Photographer & Editor
          </span>
        );
      case 'finance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider font-mono">
            Finance & CS Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 border border-white/20 text-gray-300 text-[10px] font-mono">
            Staff Operasional
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Master Admin Authority Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1c1708] via-[#141414] to-[#121212] border border-[#D4AF37]/50 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#D4AF37] text-black flex items-center justify-center font-bold shrink-0 shadow-lg">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest font-mono">
                  MASTER PRIVILEGES
                </span>
                <span className="text-xs font-mono text-gray-400">
                  ID: {currentUser?.email || 'dimensi.idphoto@gmail.com'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Pusat Kendali <span className="italic text-[#D4AF37]">Master Admin Studio</span>
              </h2>
              <p className="text-xs text-gray-300 max-w-2xl mt-1">
                Sebagai Master Admin, Anda memegang hak akses tertinggi untuk mengatur staf studio, keamanan PIN, profil pembayaran konsumen, hingga backup & pemulihan database Firestore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleExportFullBackup}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="Unduh Backup Lengkap Database"
            >
              <FileDown className="w-4 h-4" />
              <span>Backup JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Master Admin */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
              : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Kelola Staf & Akses ({staffList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
              : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Keamanan & PIN Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
              : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Profil Bisnis & Rekening Bank</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'backup'
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
              : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Restore Cloud</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
              : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Log Aktivitas ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: KELOLA STAF & HAK AKSES */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#141414] border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Daftar Staf Administrator & Fotografer
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Staf terdaftar dapat mengakses portal admin sesuai peran (Master Admin, Lead Editor, Finance/CS).
              </p>
            </div>
            <button
              onClick={handleOpenAddStaff}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Staf Admin</span>
            </button>
          </div>

          <div className="bg-[#141414] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0A0A0A] border-b border-white/10 text-gray-400 font-mono uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">Nama & Kontak</th>
                    <th className="p-3.5">Email Akun</th>
                    <th className="p-3.5">Peran / Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Terdaftar</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{st.name}</div>
                        {st.phone && <div className="text-[11px] text-gray-400 font-mono">{st.phone}</div>}
                      </td>
                      <td className="p-3.5 font-mono text-gray-300">
                        {st.email}
                      </td>
                      <td className="p-3.5">
                        {getRoleBadge(st.role)}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase ${
                          st.status === 'active'
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                            : 'text-gray-400 bg-white/5 border border-white/10'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.status === 'active' ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                          {st.status === 'active' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-gray-400">
                        {st.addedAt ? st.addedAt.slice(0, 10) : '-'}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditStaff(st)}
                          className="p-1.5 bg-[#1F1F1F] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Edit Staf"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        </button>
                        {st.role !== 'master' && (
                          <button
                            onClick={() => handleDeleteStaffClick(st.id, st.name)}
                            className="p-1.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-800/30 transition-colors cursor-pointer"
                            title="Hapus Akses"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEAMANAN & PASSCODE STUDIO */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-[#141414] border border-white/10 p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>Manajemen Kredensial Keamanan Studio</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-white mt-1">
              Atur PIN Passcode Akses Cepat
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Passcode ini digunakan untuk staf studio atau fotografer yang login tanpa akun Google Admin langsung.
            </p>
          </div>

          {savePasscodeSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PIN Passcode berhasil diperbarui dan disinkronkan ke Firestore!</span>
            </div>
          )}

          <form onSubmit={handleSavePasscodes} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                PIN Staf Admin Studio (Staff Passcode)
              </label>
              <input
                type="text"
                value={staffPasscode}
                onChange={(e) => setStaffPasscode(e.target.value)}
                placeholder="Contoh: DIMENSI2026"
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
              />
              <p className="text-[11px] text-gray-500">
                Digunakan oleh tim editor, fotografer lapangan, dan CS untuk membuka panel pesanan.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>PIN Master Admin Passcode (Otoritas Penuh)</span>
              </label>
              <input
                type="text"
                value={masterPasscode}
                onChange={(e) => setMasterPasscode(e.target.value)}
                placeholder="Contoh: MASTER_DIMENSI_2026"
                className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-amber-500/40 text-amber-200 text-xs font-mono focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[11px] text-amber-400/80">
                PIN darurat untuk membuka akses Master Admin jika login Google mengalami kendala di perangkat tertentu.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan PIN Keamanan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PROFIL BISNIS & REKENING PEMBAYARAN */}
      {activeTab === 'profile' && (
        <div className="bg-[#141414] border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-white">
                Identitas Studio & Rekening Bank Pembayaran
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Informasi ini otomatis tampil pada struk booking digital konsumen, formulir order, dan pesan WhatsApp konfirmasi.
              </p>
            </div>
          </div>

          {saveConfigSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Profil studio dan rekening bank berhasil disimpan ke cloud!</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-6">
            {/* Studio Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Nama Studio Fotografi
                </label>
                <input
                  type="text"
                  value={configForm.studioName}
                  onChange={(e) => setConfigForm({ ...configForm, studioName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Tagline Studio
                </label>
                <input
                  type="text"
                  value={configForm.tagline}
                  onChange={(e) => setConfigForm({ ...configForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  WhatsApp Admin (Format: 628...)
                </label>
                <input
                  type="text"
                  value={configForm.whatsapp}
                  onChange={(e) => setConfigForm({ ...configForm, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Email Resmi Studio
                </label>
                <input
                  type="email"
                  value={configForm.email}
                  onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Alamat Fisik Studio
                </label>
                <input
                  type="text"
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Jam Operasional & Pelayanan
                </label>
                <input
                  type="text"
                  value={configForm.operatingHours}
                  onChange={(e) => setConfigForm({ ...configForm, operatingHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            {/* Bank Accounts Section */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Rincian Rekening Bank & Pembayaran DP Konsumen</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-gray-300">Rekening Bank BCA</label>
                  <input
                    type="text"
                    value={configForm.bankBCA}
                    onChange={(e) => setConfigForm({ ...configForm, bankBCA: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-gray-300">Rekening Bank Mandiri</label>
                  <input
                    type="text"
                    value={configForm.bankMandiri}
                    onChange={(e) => setConfigForm({ ...configForm, bankMandiri: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-gray-300">Rekening Bank BRI</label>
                  <input
                    type="text"
                    value={configForm.bankBRI}
                    onChange={(e) => setConfigForm({ ...configForm, bankBRI: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: BACKUP & RESTORE DATABASE CLOUD */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Export Full Backup */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
              <div className="w-10 h-10 bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <FileDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-white">
                Unduh Cadangan Lengkap (.json)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Ekspor seluruh data pemesanan ({orders.length} order), paket foto ({packages.length}), add-on ({addons.length}), portofolio ({portfolios.length}), staf admin ({staffList.length}), dan pengaturan studio ke dalam 1 file JSON mandiri.
              </p>
              <button
                onClick={handleExportFullBackup}
                className="w-full py-3 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Cadangan JSON Sekarang</span>
              </button>
            </div>

            {/* Box 2: Restore from JSON */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
              <div className="w-10 h-10 bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300">
                <FileUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-white">
                Pulihkan / Restore dari File JSON
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Unggah file cadangan JSON untuk memulihkan seluruh struktur data secara otomatis ke Firestore.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-semibold file:bg-[#1F1F1F] file:text-[#D4AF37] hover:file:bg-[#2A2A2A] cursor-pointer"
              />
            </div>

          </div>

          {/* JSON Text Editor for Manual Restore */}
          <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-gray-300 flex items-center justify-between">
              <span>Isi Data JSON Restore</span>
              {restoreJsonText && (
                <span className="text-emerald-400 text-[11px]">
                  File Terbaca ({Math.round(restoreJsonText.length / 1024)} KB)
                </span>
              )}
            </h4>

            {restoreStatusMsg && (
              <div
                className={`p-3 text-xs flex items-center gap-2 ${
                  restoreStatusMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {restoreStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
                <span>{restoreStatusMsg.text}</span>
              </div>
            )}

            <textarea
              value={restoreJsonText}
              onChange={(e) => setRestoreJsonText(e.target.value)}
              placeholder="Pilih file JSON di atas atau tempel struktur JSON cadangan di sini..."
              rows={6}
              className="w-full p-3 bg-[#0A0A0A] border border-white/15 text-white font-mono text-[11px] focus:border-[#D4AF37] focus:outline-none"
            />

            <button
              onClick={handleExecuteRestore}
              disabled={isRestoring || !restoreJsonText.trim()}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
              <span>{isRestoring ? 'Memulihkan Data ke Firestore...' : 'Jalankan Sinkronisasi Restore'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#141414] border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Audit Trail & Log Aktivitas Sistem
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Mencatat seluruh aksi administratif untuk transparansi operasional studio.
              </p>
            </div>
            <span className="text-xs font-mono text-[#D4AF37] px-2.5 py-1 bg-[#1A1A1A] border border-white/10">
              {auditLogs.length} Aktivitas Tercatat
            </span>
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 font-mono">
                Belum ada catatan aktivitas administratif.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white/[0.02] flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="px-2 py-0.2 text-[9px] font-mono uppercase bg-white/10 text-gray-300 border border-white/10">
                        {log.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px]">{log.details}</p>
                    <div className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                      <span>Oleh: <strong className="text-gray-400">{log.actor}</strong></span>
                      <span>•</span>
                      <span>{formatDateIndonesian(log.timestamp.slice(0, 10))} {log.timestamp.slice(11, 16)} WIB</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-white/20 p-6 space-y-5 shadow-2xl relative">
            <h3 className="text-base font-serif font-bold text-white">
              {editingStaffId ? 'Edit Akses Staf Admin' : 'Tambah Staf Administrator Baru'}
            </h3>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Nama Lengkap Staf
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Contoh: Rian Dimensi Photography"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Email Akun Google / Staf
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="staf.dimensiphoto@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Nomor WhatsApp Staf
                </label>
                <input
                  type="tel"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Peran / Hak Akses (Role)
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="editor">📸 Lead Photographer & Retoucher (Jadwal, Portofolio & Drive)</option>
                  <option value="finance">💼 Finance & Customer Service (Rekap Konsumen & Excel)</option>
                  <option value="staff">👤 Staff Operasional (Lihat Sesi Foto)</option>
                  <option value="master">👑 Master Admin (Akses Penuh & Konfigurasi Studio)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                  Status Akun
                </label>
                <select
                  value={staffStatus}
                  onChange={(e) => setStaffStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif / Ditangguhkan</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 bg-[#1F1F1F] hover:bg-white/10 text-gray-300 text-xs uppercase tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
