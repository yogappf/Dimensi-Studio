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
  UserCheck,
  UserCog,
  Eye,
  EyeOff,
  Key,
  Upload,
  Image as ImageIcon,
  Layers,
  Check,
  X,
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
  const [activeTab, setActiveTab] = useState<'master_user' | 'staff' | 'security' | 'profile' | 'backup' | 'audit'>('master_user');

  // Master User Form State
  const [masterUsername, setMasterUsername] = useState(studioConfig.masterUsername || 'dimensi');
  const [masterName, setMasterName] = useState(studioConfig.masterName || 'Master Admin Dimensi');
  const [masterEmail, setMasterEmail] = useState(studioConfig.masterEmail || 'dimensi.idphoto@gmail.com');
  const [masterPhone, setMasterPhone] = useState(studioConfig.masterPhone || '0821-2345-6789');
  const [masterPasscodeVal, setMasterPasscodeVal] = useState(studioConfig.masterPasscode || 'MASTER_DIMENSI_2026');
  const [showMasterPasscode, setShowMasterPasscode] = useState(false);
  const [saveMasterSuccess, setSaveMasterSuccess] = useState(false);

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
  const [isHeroPortfolioPickerOpen, setIsHeroPortfolioPickerOpen] = useState(false);
  const [heroToast, setHeroToast] = useState('');

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB agar performa database tetap optimal.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        const currentList = configForm.heroImageUrls && configForm.heroImageUrls.length > 0
          ? configForm.heroImageUrls
          : (configForm.heroImageUrl ? [configForm.heroImageUrl] : []);
        const updatedList = [...currentList, result];
        setConfigForm({
          ...configForm,
          heroImageUrl: updatedList[0],
          heroImageUrls: updatedList,
        });
        setHeroToast('Foto banner baru berhasil ditambahkan ke slideshow!');
        setTimeout(() => setHeroToast(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Security Passcode Form State
  const [staffPasscode, setStaffPasscode] = useState(studioConfig.staffPasscode || 'DIMENSI2026');
  const [masterPasscode, setMasterPasscode] = useState(studioConfig.masterPasscode || 'MASTER_DIMENSI_2026');
  const [savePasscodeSuccess, setSavePasscodeSuccess] = useState(false);

  // JSON Backup / Restore State
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [restoreStatusMsg, setRestoreStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Handle Master User Save
  const handleSaveMasterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = masterUsername.trim().toLowerCase();
    const p = masterPasscodeVal.trim();

    if (!u) {
      alert('Username Master Admin tidak boleh kosong.');
      return;
    }
    if (!p) {
      alert('PIN Master Admin tidak boleh kosong.');
      return;
    }

    const updated: StudioConfig = {
      ...studioConfig,
      ...configForm,
      masterUsername: u,
      masterName: masterName.trim(),
      masterEmail: masterEmail.trim().toLowerCase(),
      masterPhone: masterPhone.trim(),
      masterPasscode: p,
    };

    setConfigForm(updated);
    setMasterPasscode(p);
    onUpdateStudioConfig(updated);

    try {
      await saveStudioConfigToFirestore(updated);

      // Also sync Master staff record if present in staffList
      const masterStaff = staffList.find((s) => s.role === 'master');
      if (masterStaff) {
        const staffUpdates: Partial<AdminStaff> = {
          name: masterName.trim() || masterStaff.name,
          email: masterEmail.trim().toLowerCase() || masterStaff.email,
          phone: masterPhone.trim() || masterStaff.phone,
        };
        onUpdateStaff(masterStaff.id, staffUpdates);
        await updateStaffInFirestore(masterStaff.id, staffUpdates);
      }

      await logAuditEvent(
        currentUser?.email || masterEmail || 'Master Admin',
        'Update Master User',
        `Memperbarui data Master User: Username (${u}), Nama (${masterName}), PIN Master.`,
        'security'
      );

      setSaveMasterSuccess(true);
      setTimeout(() => setSaveMasterSuccess(false), 3500);
    } catch (err) {
      console.error('Error saving master user:', err);
    }
  };

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
      masterPasscodeVal: masterPasscode.trim(),
    };
    setMasterPasscodeVal(masterPasscode.trim());
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
          onClick={() => setActiveTab('master_user')}
          className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'master_user'
              ? 'bg-gradient-to-r from-[#D4AF37] to-amber-400 text-black border-[#D4AF37] font-bold shadow-md'
              : 'bg-[#1c1708] text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 hover:text-white'
          }`}
          id="tab-master-user-btn"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Pengaturan Master User</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'staff'
              ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
              : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white'
          }`}
          id="tab-staff-management-btn"
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
          id="tab-security-btn"
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
          id="tab-profile-btn"
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
          id="tab-backup-btn"
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
          id="tab-audit-btn"
        >
          <History className="w-3.5 h-3.5" />
          <span>Log Aktivitas ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 0: PENGATURAN MASTER USER */}
      {activeTab === 'master_user' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Master User Edit Form */}
          <div className="lg:col-span-2 bg-[#141414] border border-[#D4AF37]/30 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
                  <Crown className="w-4 h-4 text-[#D4AF37]" />
                  <span>Akun Utama Super Administrator</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white mt-1">
                  Pengaturan & Update Kredensial Master User
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ubah username, nama pemilik, email resmi, dan PIN akses Super Admin Dimensi Fotografi.
                </p>
              </div>
            </div>

            {saveMasterSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Kredensial Master User berhasil diperbarui dan disinkronkan ke Google Cloud Firestore!</span>
              </div>
            )}

            <form onSubmit={handleSaveMasterUser} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Username Master */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Username Master Admin</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={masterUsername}
                    onChange={(e) => setMasterUsername(e.target.value)}
                    placeholder="Contoh: dimensi / superadmin"
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-amber-500/40 text-amber-100 text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                    id="input-master-username"
                  />
                  <p className="text-[10px] text-gray-500">
                    Digunakan saat login di kolom Username Portal Admin.
                  </p>
                </div>

                {/* 2. Nama Pemilik / Master */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300">
                    Nama Pemilik / Super Admin
                  </label>
                  <input
                    type="text"
                    required
                    value={masterName}
                    onChange={(e) => setMasterName(e.target.value)}
                    placeholder="Contoh: Master Admin Dimensi"
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                    id="input-master-name"
                  />
                  <p className="text-[10px] text-gray-500">
                    Nama yang tercatat pada log audit dan struk studio.
                  </p>
                </div>

                {/* 3. Email Resmi Master */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Resmi Super Admin</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={masterEmail}
                    onChange={(e) => setMasterEmail(e.target.value)}
                    placeholder="dimensi.idphoto@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                    id="input-master-email"
                  />
                  <p className="text-[10px] text-gray-500">
                    Alamat email utama penanggung jawab studio.
                  </p>
                </div>

                {/* 4. Nomor WhatsApp / Kontak Master */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>No. WhatsApp / HP Master</span>
                  </label>
                  <input
                    type="tel"
                    value={masterPhone}
                    onChange={(e) => setMasterPhone(e.target.value)}
                    placeholder="0821-2345-6789"
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                    id="input-master-phone"
                  />
                  <p className="text-[10px] text-gray-500">
                    Kontak darurat pemilik studio.
                  </p>
                </div>
              </div>

              {/* 5. PIN Master Admin Passcode */}
              <div className="pt-3 border-t border-white/10 space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>PIN Rahasia Master Admin (Passcode Akses Penuh)</span>
                </label>
                <div className="relative">
                  <input
                    type={showMasterPasscode ? 'text' : 'password'}
                    required
                    value={masterPasscodeVal}
                    onChange={(e) => setMasterPasscodeVal(e.target.value)}
                    placeholder="Contoh: MASTER_DIMENSI_2026"
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-amber-500/40 text-amber-200 text-xs font-mono tracking-wider focus:border-amber-400 focus:outline-none"
                    id="input-master-passcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMasterPasscode(!showMasterPasscode)}
                    className="absolute right-3.5 top-2.5 text-gray-400 hover:text-white cursor-pointer p-0.5"
                  >
                    {showMasterPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-amber-400/80">
                  PIN ini memberikan otorisasi penuh untuk mengedit seluruh paket foto, portofolio galeri, Google Drive cloud, profil studio, dan mengelola staf.
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-mono">
                  Sinkronisasi langsung ke database cloud Firestore
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  id="btn-save-master-user"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data Master User</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Summary Info Card */}
          <div className="bg-[#141414] border border-white/10 p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Crown className="w-6 h-6" />
              </div>

              <div>
                <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold uppercase font-mono tracking-wider">
                  ROLE: SUPER ADMINISTRATOR
                </span>
                <h4 className="text-base font-serif font-bold text-white mt-2">
                  Status Akun Master
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Akun Master User memiliki wewenang mutlak atas operasional digital studio. Pastikan username dan PIN dijaga kerahasiaannya.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Username Login:</span>
                  <span className="text-[#D4AF37] font-bold">{masterUsername || 'dimensi'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Nama Akun:</span>
                  <span className="text-white">{masterName || 'Master Admin'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Email Resmi:</span>
                  <span className="text-gray-300 truncate max-w-[150px]">{masterEmail}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-400">Status Otoritas:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Full Access
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#0A0A0A] border border-white/10 text-[11px] text-gray-400 space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" /> Proteksi Hak Akses
              </span>
              <p className="text-gray-400">
                Staf operasional dengan PIN Staf tidak dapat mengakses menu Master User atau merubah pengaturan krusial studio.
              </p>
            </div>
          </div>
        </div>
      )}

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
            {/* Hero Showcase Image & Dashboard Content Section */}
            <div className="p-4 bg-[#0A0A0A] border border-[#D4AF37]/30 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-bold flex items-center gap-2 pb-2 border-b border-white/10">
                <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>Pengaturan Home / Dashboard (Hero Section)</span>
              </h4>

              {heroToast && (
                <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{heroToast}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[11px] font-mono uppercase text-gray-300 block">Foto Banner / Showcase Samping</label>
                  <div className="w-full aspect-[4/5] max-w-[200px] bg-black border border-white/20 overflow-hidden relative">
                    {configForm.heroImageUrl ? (
                      <img src={configForm.heroImageUrl} alt="Hero Showcase" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 max-w-[200px]">
                    <label className="w-full cursor-pointer px-2 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] border border-dashed border-[#D4AF37]/50 text-gray-300 hover:text-white text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Upload Lokal</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsHeroPortfolioPickerOpen(true)}
                      className="w-full py-1.5 px-2 bg-[#1A1A1A] hover:bg-[#222222] border border-[#D4AF37]/30 text-[#D4AF37] hover:text-amber-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Dari Portofolio</span>
                    </button>

                    {/* Banner Slideshow List Thumbnails */}
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] font-mono text-gray-400 uppercase block">Slideshow ({configForm.heroImageUrls?.length || (configForm.heroImageUrl ? 1 : 0)})</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-black/40 border border-white/10">
                        {(configForm.heroImageUrls && configForm.heroImageUrls.length > 0 ? configForm.heroImageUrls : (configForm.heroImageUrl ? [configForm.heroImageUrl] : [])).map((img, idx) => (
                          <div key={idx} className="relative w-10 h-12 bg-black border border-white/20 group">
                            <img src={img} alt={`Banner ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                const list = configForm.heroImageUrls && configForm.heroImageUrls.length > 0
                                  ? configForm.heroImageUrls
                                  : [configForm.heroImageUrl || ''];
                                const filtered = list.filter((_, i) => i !== idx);
                                setConfigForm({
                                  ...configForm,
                                  heroImageUrls: filtered,
                                  heroImageUrl: filtered[0] || '',
                                });
                              }}
                              className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Hapus"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-1">URL Gambar Banner</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={configForm.heroImageUrl || ''}
                      onChange={(e) => setConfigForm({ ...configForm, heroImageUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#141414] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] font-mono text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Slogan Atas (Eyebrow)</label>
                      <input
                        type="text"
                        value={configForm.heroEyebrow || ''}
                        onChange={(e) => setConfigForm({ ...configForm, heroEyebrow: e.target.value })}
                        placeholder="Dimensi Photography..."
                        className="w-full px-3 py-1.5 bg-[#141414] border border-white/15 text-white text-xs focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Judul Utama (Headline)</label>
                      <input
                        type="text"
                        value={configForm.heroTitleMain || ''}
                        onChange={(e) => setConfigForm({ ...configForm, heroTitleMain: e.target.value })}
                        placeholder="Abadikan Momen"
                        className="w-full px-3 py-1.5 bg-[#141414] border border-white/15 text-white text-xs focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Kata Highlight (Warna Emas)</label>
                      <input
                        type="text"
                        value={configForm.heroTitleHighlight || ''}
                        onChange={(e) => setConfigForm({ ...configForm, heroTitleHighlight: e.target.value })}
                        placeholder="Terbaik"
                        className="w-full px-3 py-1.5 bg-[#141414] border border-white/15 text-white text-xs focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Label Badge Atas Gambar</label>
                      <input
                        type="text"
                        value={configForm.heroBadgeText || ''}
                        onChange={(e) => setConfigForm({ ...configForm, heroBadgeText: e.target.value })}
                        placeholder="Top Rated Studio"
                        className="w-full px-3 py-1.5 bg-[#141414] border border-white/15 text-white text-xs focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Deskripsi / Sub-headline Beranda</label>
                    <textarea
                      rows={2}
                      value={configForm.heroDescription || ''}
                      onChange={(e) => setConfigForm({ ...configForm, heroDescription: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#141414] border border-white/15 text-white text-xs focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>



              {/* Stats Bar Settings */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Stat 1 (Angka & Label)</label>
                  <input
                    type="text"
                    value={configForm.heroStat1Value || ''}
                    onChange={(e) => setConfigForm({ ...configForm, heroStat1Value: e.target.value })}
                    placeholder="4.9 / 5.0"
                    className="w-full px-2.5 py-1 bg-[#141414] border border-white/15 text-white text-xs mb-1"
                  />
                  <input
                    type="text"
                    value={configForm.heroStat1Label || ''}
                    onChange={(e) => setConfigForm({ ...configForm, heroStat1Label: e.target.value })}
                    placeholder="1.500+ Klien Puas"
                    className="w-full px-2.5 py-1 bg-[#141414] border border-white/15 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Stat 2 (Angka & Label)</label>
                  <input
                    type="text"
                    value={configForm.heroStat2Value || ''}
                    onChange={(e) => setConfigForm({ ...configForm, heroStat2Value: e.target.value })}
                    placeholder="8+ Tahun"
                    className="w-full px-2.5 py-1 bg-[#141414] border border-white/15 text-white text-xs mb-1"
                  />
                  <input
                    type="text"
                    value={configForm.heroStat2Label || ''}
                    onChange={(e) => setConfigForm({ ...configForm, heroStat2Label: e.target.value })}
                    placeholder="Pengalaman Visual"
                    className="w-full px-2.5 py-1 bg-[#141414] border border-white/15 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1">Stat 3 (Angka & Label)</label>
                  <input
                    type="text"
                    value={configForm.heroStat3Value || ''}
                    onChange={(e) => setConfigForm({ ...configForm, heroStat3Value: e.target.value })}
                    placeholder="100%"
                    className="w-full px-2.5 py-1 bg-[#141414] border border-white/15 text-white text-xs mb-1"
                  />
                  <input
                    type="text"
                    value={configForm.heroStat3Label || ''}
                    onChange={(e) => setConfigForm({ ...configForm, heroStat3Label: e.target.value })}
                    placeholder="Garansi High-Res"
                    className="w-full px-2.5 py-1 bg-[#141414] border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

            </div>

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

      {/* PORTFOLIO PICKER FOR HERO SHOWCASE IMAGE */}
      {isHeroPortfolioPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-3xl bg-[#141414] border border-[#D4AF37] p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>Pilih Foto Banner "Top Rated Studio" dari Portofolio</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsHeroPortfolioPickerOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {portfolios.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-gray-600" />
                <p className="text-xs">Belum ada foto di galeri portofolio aplikasi.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {portfolios.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const currentList = configForm.heroImageUrls && configForm.heroImageUrls.length > 0
                        ? configForm.heroImageUrls
                        : (configForm.heroImageUrl ? [configForm.heroImageUrl] : []);
                      const updatedList = [...currentList, item.imageUrl];
                      setConfigForm({
                        ...configForm,
                        heroImageUrl: updatedList[0],
                        heroImageUrls: updatedList,
                      });
                      setIsHeroPortfolioPickerOpen(false);
                      setHeroToast(`Berhasil menambahkan banner dari portofolio: ${item.title}`);
                      setTimeout(() => setHeroToast(''), 3000);
                    }}
                    className={`group relative aspect-square bg-[#0A0A0A] border overflow-hidden cursor-pointer transition-all ${
                      configForm.heroImageUrl === item.imageUrl
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]'
                        : 'border-white/10 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                      <span className="text-[9px] text-[#D4AF37] uppercase">{item.category}</span>
                    </div>
                    {configForm.heroImageUrl === item.imageUrl && (
                      <div className="absolute top-2 right-2 bg-[#D4AF37] text-black p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
