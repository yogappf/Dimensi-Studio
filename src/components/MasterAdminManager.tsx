import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { compressImage } from '../utils/imageCompressor';
import {
  AdminStaff,
  AdminRole,
  StudioConfig,
  AuditLogItem,
  BookingOrder,
  PhotoPackage,
  AddOnItem,
  PortfolioItem,
  BankAccountItem,
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
  Loader2,
  Crop,
  Star,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from 'lucide-react';
import { BannerCropperModal } from './BannerCropperModal';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import {
  INDONESIAN_BANK_PRESETS,
  getBankPreset,
  getResolvedBankAccounts,
  BankPreset,
} from '../utils/bankOptions';
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
  const [isSavingMaster, setIsSavingMaster] = useState(false);

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
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isHeroPortfolioPickerOpen, setIsHeroPortfolioPickerOpen] = useState(false);
  const [heroToast, setHeroToast] = useState('');

  // Security Passcode Form State
  const [staffPasscode, setStaffPasscode] = useState(studioConfig.staffPasscode || 'DIMENSI2026');
  const [masterPasscode, setMasterPasscode] = useState(studioConfig.masterPasscode || 'MASTER_DIMENSI_2026');
  const [savePasscodeSuccess, setSavePasscodeSuccess] = useState(false);
  const [isSavingPasscodes, setIsSavingPasscodes] = useState(false);

  // Ref to prevent user input from being overwritten by external polling/snapshot while editing
  const isMasterUserDirty = useRef(false);
  const isSecurityDirty = useRef(false);

  // Synchronize when studioConfig prop updates from Firestore or parent
  useEffect(() => {
    if (studioConfig) {
      if (!isMasterUserDirty.current) {
        if (studioConfig.masterUsername) setMasterUsername(studioConfig.masterUsername);
        if (studioConfig.masterName) setMasterName(studioConfig.masterName);
        if (studioConfig.masterEmail) setMasterEmail(studioConfig.masterEmail);
        if (studioConfig.masterPhone) setMasterPhone(studioConfig.masterPhone);
        if (studioConfig.masterPasscode) {
          setMasterPasscodeVal(studioConfig.masterPasscode);
        }
      }
      if (!isSecurityDirty.current) {
        if (studioConfig.staffPasscode) setStaffPasscode(studioConfig.staffPasscode);
        if (studioConfig.masterPasscode) setMasterPasscode(studioConfig.masterPasscode);
      }
      setConfigForm((prev) => {
        const resolvedBanks = getResolvedBankAccounts(studioConfig);
        return {
          ...prev,
          ...studioConfig,
          bankAccounts: studioConfig.bankAccounts && studioConfig.bankAccounts.length > 0
            ? studioConfig.bankAccounts
            : resolvedBanks,
        };
      });
    }
  }, [studioConfig]);

  // Bank accounts helper handlers
  const bankAccountsList: BankAccountItem[] = configForm.bankAccounts && configForm.bankAccounts.length > 0
    ? configForm.bankAccounts
    : getResolvedBankAccounts(configForm);

  const handleUpdateBankList = (newList: BankAccountItem[]) => {
    // Keep legacy bank strings in sync for any external consumer
    const bcaAcc = newList.find((b) => b.bankCode === 'BCA' || b.bankName.toUpperCase().includes('BCA'));
    const mandiriAcc = newList.find((b) => b.bankCode === 'MANDIRI' || b.bankName.toUpperCase().includes('MANDIRI'));
    const briAcc = newList.find((b) => b.bankCode === 'BRI' || b.bankName.toUpperCase().includes('BRI'));

    setConfigForm((prev) => ({
      ...prev,
      bankAccounts: newList,
      bankBCA: bcaAcc ? `${bcaAcc.bankName}: ${bcaAcc.accountNumber} a.n ${bcaAcc.accountHolder}` : prev.bankBCA,
      bankMandiri: mandiriAcc ? `${mandiriAcc.bankName}: ${mandiriAcc.accountNumber} a.n ${mandiriAcc.accountHolder}` : prev.bankMandiri,
      bankBRI: briAcc ? `${briAcc.bankName}: ${briAcc.accountNumber} a.n ${briAcc.accountHolder}` : prev.bankBRI,
    }));
  };

  const handleToggleBankActive = (id: string) => {
    const updated = bankAccountsList.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    handleUpdateBankList(updated);
  };

  const handleSetPrimaryBank = (id: string) => {
    const updated = bankAccountsList.map((item) => ({
      ...item,
      isPrimary: item.id === id,
      isActive: item.id === id ? true : item.isActive,
    }));
    handleUpdateBankList(updated);
  };

  const handleUpdateBankField = (id: string, field: keyof BankAccountItem, value: any) => {
    const updated = bankAccountsList.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    handleUpdateBankList(updated);
  };

  const handleBankPresetChange = (id: string, presetCode: string) => {
    const preset = getBankPreset(presetCode);
    const updated = bankAccountsList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          bankCode: preset.code,
          bankName: preset.code === 'OTHER' ? (item.bankName || 'Bank Lainnya') : preset.name,
        };
      }
      return item;
    });
    handleUpdateBankList(updated);
  };

  const handleAddBankAccount = () => {
    const availablePreset = INDONESIAN_BANK_PRESETS.find(
      (p) => !bankAccountsList.some((b) => b.bankCode === p.code)
    ) || INDONESIAN_BANK_PRESETS[0];

    const newAcc: BankAccountItem = {
      id: `bank-${Date.now()}`,
      bankCode: availablePreset.code,
      bankName: availablePreset.name,
      accountNumber: '',
      accountHolder: configForm.studioName || 'Dimensi Fotografi Studio',
      isActive: true,
      isPrimary: bankAccountsList.length === 0,
    };
    handleUpdateBankList([...bankAccountsList, newAcc]);
  };

  const handleDeleteBankAccount = (id: string) => {
    if (bankAccountsList.length <= 1) {
      alert('Minimal harus ada 1 data rekening bank studio.');
      return;
    }
    const filtered = bankAccountsList.filter((b) => b.id !== id);
    if (filtered.length > 0 && !filtered.some((b) => b.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    handleUpdateBankList(filtered);
  };

  const handleToggleAllBanks = (active: boolean) => {
    const updated = bankAccountsList.map((item, idx) => ({
      ...item,
      isActive: active || idx === 0,
    }));
    handleUpdateBankList(updated);
  };

  const handleQRISFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar QRIS (PNG, JPG, WEBP).');
        return;
      }
      try {
        const compressed = await compressImage(file, 800, 800, 0.8);
        setConfigForm((prev) => ({ ...prev, qrisUrl: compressed }));
      } catch (err) {
        console.error('QRIS compression failed:', err);
        alert('Gagal memproses gambar QRIS.');
      }
    }
  };

  const [bannerReplaceMode, setBannerReplaceMode] = useState(true);
  const [staffToDelete, setStaffToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [isBannerCropperOpen, setIsBannerCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [cropperTargetIndex, setCropperTargetIndex] = useState<number | null>(null);

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (!src) return reject(new Error('Gagal membaca file'));
        const img = new Image();
        img.onload = () => {
          const maxDim = 960;
          let w = img.naturalWidth;
          let h = img.naturalHeight;
          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(src);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(src);
        img.src = src;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetIdx: number | null = null) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Multi-file upload selected
    if (files.length > 1 && targetIdx === null) {
      try {
        setHeroToast(`Memproses ${files.length} foto banner...`);
        const processedImages: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            const dataUrl = await processImageFile(file);
            processedImages.push(dataUrl);
          }
        }

        if (processedImages.length === 0) {
          alert('Tidak ada file gambar yang valid.');
          return;
        }

        const currentList: string[] = (configForm.heroImageUrls && configForm.heroImageUrls.length > 0)
          ? [...configForm.heroImageUrls]
          : (configForm.heroImageUrl ? [configForm.heroImageUrl] : []);

        const updatedList = bannerReplaceMode
          ? processedImages
          : [...currentList, ...processedImages];

        const updatedConfig: StudioConfig = {
          ...studioConfig,
          ...configForm,
          heroImageUrl: updatedList[0] || '',
          heroImageUrls: updatedList,
        };

        setConfigForm(updatedConfig);
        onUpdateStudioConfig(updatedConfig);
        setSelectedSlideIndex(bannerReplaceMode ? 0 : updatedList.length - 1);

        try {
          await saveStudioConfigToFirestore(updatedConfig);
        } catch (firestoreErr) {
          console.warn('Firestore save warning:', firestoreErr);
        }

        setHeroToast(
          bannerReplaceMode
            ? `Berhasil menimpa banner dengan ${processedImages.length} foto baru!`
            : `Berhasil menambahkan ${processedImages.length} foto baru (Total: ${updatedList.length} slide)!`
        );
        setTimeout(() => setHeroToast(''), 3500);
      } catch (err) {
        console.error('Error uploading multiple images:', err);
        alert('Gagal mengupload beberapa foto.');
      } finally {
        e.target.value = '';
      }
      return;
    }

    // Single file upload: open crop modal
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('Ukuran file maksimal 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCropperImageSrc(result);
        setCropperTargetIndex(targetIdx);
        setIsBannerCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      // Retrieve current slide list reliably
      const currentList: string[] = (configForm.heroImageUrls && configForm.heroImageUrls.length > 0)
        ? [...configForm.heroImageUrls]
        : (configForm.heroImageUrl ? [configForm.heroImageUrl] : []);

      let updatedList: string[] = [];

      if (cropperTargetIndex !== null && cropperTargetIndex >= 0 && cropperTargetIndex < currentList.length) {
        // Editing / replacing an existing slide at target index
        updatedList = [...currentList];
        updatedList[cropperTargetIndex] = croppedDataUrl;
        setSelectedSlideIndex(cropperTargetIndex);
      } else {
        // New upload: respect bannerReplaceMode (Timpa replaces, Tambah appends)
        updatedList = bannerReplaceMode ? [croppedDataUrl] : [...currentList, croppedDataUrl];
        setSelectedSlideIndex(bannerReplaceMode ? 0 : updatedList.length - 1);
      }

      const updatedConfig: StudioConfig = {
        ...studioConfig,
        ...configForm,
        heroImageUrl: updatedList[0] || croppedDataUrl,
        heroImageUrls: updatedList,
      };

      setConfigForm(updatedConfig);
      onUpdateStudioConfig(updatedConfig);

      try {
        await saveStudioConfigToFirestore(updatedConfig);
      } catch (firestoreErr) {
        console.warn('Firestore save warning (saved locally):', firestoreErr);
      }

      setHeroToast(
        cropperTargetIndex !== null
          ? `Slide #${cropperTargetIndex + 1} berhasil diperbarui & disimpan!`
          : bannerReplaceMode
          ? 'Foto banner berhasil di-crop & disimpan!'
          : `Foto banner baru berhasil di-crop & ditambahkan (Total: ${updatedList.length} slide)!`
      );
      setTimeout(() => setHeroToast(''), 3500);
    } catch (err) {
      console.error('Error saving cropped banner:', err);
      alert('Gagal menyimpan hasil crop banner.');
    }
  };

  const openCropperForImage = (imageSrc: string, targetIdx: number | null = null) => {
    if (!imageSrc) return;
    setCropperImageSrc(imageSrc);
    setCropperTargetIndex(targetIdx);
    setIsBannerCropperOpen(true);
  };

  // JSON Backup / Restore State
  const [restoreJsonText, setRestoreJsonText] = useState('');
  const [restoreStatusMsg, setRestoreStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Handle Master User Save
  const handleSaveMasterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = masterUsername.trim().toLowerCase();
    const p = masterPasscodeVal.trim();
    const name = masterName.trim() || 'Master Admin Dimensi';
    const email = masterEmail.trim().toLowerCase() || 'dimensi.idphoto@gmail.com';
    const phone = masterPhone.trim();

    if (!u) {
      alert('Username Master Admin tidak boleh kosong.');
      return;
    }
    if (!p) {
      alert('PIN Master Admin tidak boleh kosong.');
      return;
    }

    setIsSavingMaster(true);

    const updated: StudioConfig = {
      ...studioConfig,
      ...configForm,
      masterUsername: u,
      masterName: name,
      masterEmail: email,
      masterPhone: phone,
      masterPasscode: p,
    };

    setMasterPasscodeVal(p);
    setMasterPasscode(p);
    setConfigForm(updated);

    // 1. Direct local persistence backup
    try {
      localStorage.setItem('dimensi_studio_config_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // 2. React state update
    onUpdateStudioConfig(updated);
    isMasterUserDirty.current = false;

    // 3. Firestore update
    try {
      await saveStudioConfigToFirestore(updated);
    } catch (fErr) {
      console.warn('Firestore sync note (saved locally):', fErr);
    }

    // 4. Staff update if present
    try {
      const masterStaff = staffList.find((s) => s.role === 'master');
      if (masterStaff) {
        const staffUpdates: Partial<AdminStaff> = {
          name: name || masterStaff.name,
          email: email || masterStaff.email,
          phone: phone || masterStaff.phone,
        };
        onUpdateStaff(masterStaff.id, staffUpdates);
        await updateStaffInFirestore(masterStaff.id, staffUpdates);
      }
    } catch (sErr) {
      console.warn('Staff update note:', sErr);
    }

    // 5. Audit log
    try {
      await logAuditEvent(
        currentUser?.email || email || 'Master Admin',
        'Update Master User',
        `Memperbarui data Master User: Username (${u}), Nama (${name}), PIN Master baru.`,
        'security'
      );
    } catch (aErr) {
      console.warn('Audit log note:', aErr);
    }

    setIsSavingMaster(false);
    setSaveMasterSuccess(true);
    setTimeout(() => setSaveMasterSuccess(false), 4000);
  };

  // Handle Studio Config Save
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);

    const bcaAcc = bankAccountsList.find((b) => b.bankCode === 'BCA' || b.bankName.toUpperCase().includes('BCA'));
    const mandiriAcc = bankAccountsList.find((b) => b.bankCode === 'MANDIRI' || b.bankName.toUpperCase().includes('MANDIRI'));
    const briAcc = bankAccountsList.find((b) => b.bankCode === 'BRI' || b.bankName.toUpperCase().includes('BRI'));

    const mergedConfig: StudioConfig = {
      ...studioConfig,
      ...configForm,
      bankAccounts: bankAccountsList,
      bankBCA: bcaAcc ? `${bcaAcc.bankName}: ${bcaAcc.accountNumber} a.n ${bcaAcc.accountHolder}` : (configForm.bankBCA || studioConfig.bankBCA),
      bankMandiri: mandiriAcc ? `${mandiriAcc.bankName}: ${mandiriAcc.accountNumber} a.n ${mandiriAcc.accountHolder}` : (configForm.bankMandiri || studioConfig.bankMandiri),
      bankBRI: briAcc ? `${briAcc.bankName}: ${briAcc.accountNumber} a.n ${briAcc.accountHolder}` : (configForm.bankBRI || studioConfig.bankBRI),
      masterPasscode: masterPasscodeVal || studioConfig.masterPasscode || 'MASTER_DIMENSI_2026',
      masterUsername: masterUsername || studioConfig.masterUsername || 'dimensi',
      staffPasscode: staffPasscode || studioConfig.staffPasscode || 'DIMENSI2026',
    };
    setConfigForm(mergedConfig);
    
    try {
      localStorage.setItem('dimensi_studio_config_v1', JSON.stringify(mergedConfig));
    } catch {
      // ignore
    }

    onUpdateStudioConfig(mergedConfig);
    try {
      await saveStudioConfigToFirestore(mergedConfig);
      await logAuditEvent(
        currentUser?.email || 'Master Admin',
        'Update Profil Studio',
        `Memperbarui identitas studio, kontak, dan ${bankAccountsList.filter((b) => b.isActive).length} rekening bank aktif untuk konsumen.`,
        'system'
      );
    } catch (err) {
      console.warn('Config save note:', err);
    } finally {
      setIsSavingConfig(false);
      setSaveConfigSuccess(true);
      setTimeout(() => setSaveConfigSuccess(false), 3500);
    }
  };

  // Handle Passcode Save
  const handleSavePasscodes = async (e: React.FormEvent) => {
    e.preventDefault();
    const sPass = staffPasscode.trim();
    const mPass = masterPasscode.trim();

    if (!sPass || !mPass) {
      alert('Passcode tidak boleh kosong.');
      return;
    }

    setIsSavingPasscodes(true);

    const updated: StudioConfig = {
      ...studioConfig,
      ...configForm,
      staffPasscode: sPass,
      masterPasscode: mPass,
    };
    setStaffPasscode(sPass);
    setMasterPasscode(mPass);
    setMasterPasscodeVal(mPass);
    setConfigForm(updated);

    try {
      localStorage.setItem('dimensi_studio_config_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }

    onUpdateStudioConfig(updated);
    isSecurityDirty.current = false;
    isMasterUserDirty.current = false;

    try {
      await saveStudioConfigToFirestore(updated);
      await logAuditEvent(
        currentUser?.email || 'Master Admin',
        'Update PIN Keamanan',
        `Memperbarui PIN Staff Admin & PIN Master Admin (${mPass}).`,
        'security'
      );
    } catch (err) {
      console.warn('Passcode save note:', err);
    } finally {
      setIsSavingPasscodes(false);
      setSavePasscodeSuccess(true);
      setTimeout(() => setSavePasscodeSuccess(false), 3500);
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

  const handleDeleteStaffClick = (staffId: string, name: string) => {
    setStaffToDelete({ id: staffId, name });
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    const { id: staffId, name } = staffToDelete;
    onDeleteStaff(staffId);
    setStaffToDelete(null);
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
                    onChange={(e) => {
                      isMasterUserDirty.current = true;
                      setMasterUsername(e.target.value);
                    }}
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
                    onChange={(e) => {
                      isMasterUserDirty.current = true;
                      setMasterName(e.target.value);
                    }}
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
                    onChange={(e) => {
                      isMasterUserDirty.current = true;
                      setMasterEmail(e.target.value);
                    }}
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
                    onChange={(e) => {
                      isMasterUserDirty.current = true;
                      setMasterPhone(e.target.value);
                    }}
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
                    onChange={(e) => {
                      isMasterUserDirty.current = true;
                      setMasterPasscodeVal(e.target.value);
                    }}
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
                  disabled={isSavingMaster}
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-save-master-user"
                >
                  {isSavingMaster ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Data...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Data Master User</span>
                    </>
                  )}
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
                onChange={(e) => {
                  isSecurityDirty.current = true;
                  setStaffPasscode(e.target.value);
                }}
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
                onChange={(e) => {
                  isSecurityDirty.current = true;
                  setMasterPasscode(e.target.value);
                }}
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
                disabled={isSavingPasscodes}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingPasscodes ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan PIN...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan PIN Keamanan</span>
                  </>
                )}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-1 space-y-2.5">
                  {(() => {
                    const heroSlides = configForm.heroImageUrls && configForm.heroImageUrls.length > 0
                      ? configForm.heroImageUrls
                      : (configForm.heroImageUrl ? [configForm.heroImageUrl] : []);
                    const activeIndex = Math.min(Math.max(0, selectedSlideIndex), Math.max(0, heroSlides.length - 1));
                    const activeImage = heroSlides[activeIndex] || configForm.heroImageUrl || '';

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono uppercase text-gray-300 block font-bold">
                            Foto Banner Showcase
                          </label>
                          {heroSlides.length > 0 && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-semibold">
                              Slide #{activeIndex + 1} / {heroSlides.length}
                            </span>
                          )}
                        </div>

                        {/* Banner Preview Frame */}
                        <div className="w-full aspect-[4/5] max-w-[210px] bg-black border-2 border-[#D4AF37]/60 overflow-hidden relative group shadow-2xl">
                          {activeImage ? (
                            <>
                              <img
                                src={activeImage}
                                alt={`Hero Showcase Slide ${activeIndex + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />

                              {/* Slide number watermark */}
                              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/85 backdrop-blur-sm border border-white/20 text-[9px] font-mono text-[#D4AF37] pointer-events-none">
                                Slide #{activeIndex + 1}
                              </div>

                              {/* Overlay actions on hover */}
                              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2.5">
                                <button
                                  type="button"
                                  onClick={() => openCropperForImage(activeImage, activeIndex)}
                                  className="px-2.5 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-[10px] font-mono flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer w-full justify-center"
                                >
                                  <Crop className="w-3.5 h-3.5" />
                                  <span>Crop Slide #{activeIndex + 1}</span>
                                </button>

                                {activeIndex > 0 && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const reordered = [
                                        activeImage,
                                        ...heroSlides.filter((_, i) => i !== activeIndex),
                                      ];
                                      const updatedConfig = {
                                        ...studioConfig,
                                        ...configForm,
                                        heroImageUrl: reordered[0],
                                        heroImageUrls: reordered,
                                      };
                                      setConfigForm(updatedConfig);
                                      onUpdateStudioConfig(updatedConfig);
                                      setSelectedSlideIndex(0);
                                      try {
                                        await saveStudioConfigToFirestore(updatedConfig);
                                      } catch {
                                        // ignore
                                      }
                                      setHeroToast('Slide ini dipindah menjadi Slide Utama (Slide #1)!');
                                      setTimeout(() => setHeroToast(''), 3000);
                                    }}
                                    className="px-2 py-1 bg-black/80 hover:bg-black border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white text-[9px] font-mono flex items-center gap-1 transition-colors cursor-pointer w-full justify-center"
                                  >
                                    <span>★ Jadikan Slide 1</span>
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 p-3 text-center">
                              <ImageIcon className="w-7 h-7 mb-1" />
                              <span className="text-[10px] font-mono">Belum ada foto banner</span>
                            </div>
                          )}
                        </div>

                        {activeImage && (
                          <div className="grid grid-cols-2 gap-1.5 max-w-[210px]">
                            <button
                              type="button"
                              onClick={() => openCropperForImage(activeImage, activeIndex)}
                              className="py-1 px-1.5 bg-black/70 hover:bg-black border border-[#D4AF37]/50 text-[#D4AF37] hover:text-white text-[10px] font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title={`Crop / Atur Posisi Bounding Box Slide #${activeIndex + 1}`}
                            >
                              <Crop className="w-3 h-3 text-[#D4AF37]" />
                              <span>Crop #{activeIndex + 1}</span>
                            </button>

                            <label className="cursor-pointer py-1 px-1.5 bg-black/70 hover:bg-black border border-white/30 text-gray-300 hover:text-white text-[10px] font-mono flex items-center justify-center gap-1 transition-colors">
                              <RefreshCw className="w-3 h-3 text-amber-400" />
                              <span>Ganti #{activeIndex + 1}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleHeroFileUpload(e, activeIndex)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}

                        <div className="space-y-2 max-w-[210px] pt-1">
                          {/* Banner Mode Toggle (Timpa / Tambah) */}
                          <div className="flex items-center gap-1 p-1 bg-black/70 border border-white/15">
                            <button
                              type="button"
                              onClick={() => setBannerReplaceMode(true)}
                              className={`flex-1 py-1 text-[10px] font-mono transition-colors cursor-pointer font-bold ${
                                bannerReplaceMode
                                  ? 'bg-[#D4AF37] text-black shadow'
                                  : 'bg-transparent text-gray-400 hover:text-white'
                              }`}
                              title="Mode Timpa: Foto baru akan menggantikan seluruh slide banner"
                            >
                              ✓ Timpa
                            </button>
                            <button
                              type="button"
                              onClick={() => setBannerReplaceMode(false)}
                              className={`flex-1 py-1 text-[10px] font-mono transition-colors cursor-pointer font-bold ${
                                !bannerReplaceMode
                                  ? 'bg-[#D4AF37] text-black shadow'
                                  : 'bg-transparent text-gray-400 hover:text-white'
                              }`}
                              title="Mode Tambah: Foto baru akan ditambahkan ke daftar slide banner"
                            >
                              + Tambah
                            </button>
                          </div>

                          {/* Upload Banner Button (Multiple Files Supported) */}
                          <label className="w-full cursor-pointer px-2 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-dashed border-[#D4AF37] text-white hover:text-[#D4AF37] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors shadow">
                            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="font-bold">
                              {bannerReplaceMode ? 'Upload Foto (Timpa)' : 'Upload Foto (+ Tambah)'}
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleHeroFileUpload(e, null)}
                              className="hidden"
                            />
                          </label>

                          <p className="text-[9px] text-gray-400 font-sans leading-tight">
                            Bisa pilih 1 foto (untuk di-crop) atau beberapa foto sekaligus.
                          </p>

                          <button
                            type="button"
                            onClick={() => setIsHeroPortfolioPickerOpen(true)}
                            className="w-full py-1.5 px-2 bg-[#1A1A1A] hover:bg-[#222222] border border-white/20 text-[#D4AF37] hover:text-amber-300 text-[10px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{bannerReplaceMode ? 'Pilih Portofolio (Timpa)' : '+ Dari Portofolio'}</span>
                          </button>

                          {/* Banner Slideshow List Thumbnails */}
                          <div className="pt-2 border-t border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-gray-300 font-semibold uppercase block">
                                Daftar Slideshow ({heroSlides.length})
                              </span>
                              {heroSlides.length > 0 && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!confirm('Hapus semua slide banner?')) return;
                                    const updatedConfig = {
                                      ...studioConfig,
                                      ...configForm,
                                      heroImageUrl: '',
                                      heroImageUrls: [],
                                    };
                                    setConfigForm(updatedConfig);
                                    onUpdateStudioConfig(updatedConfig);
                                    setSelectedSlideIndex(0);
                                    try {
                                      await saveStudioConfigToFirestore(updatedConfig);
                                    } catch {
                                      // ignore
                                    }
                                    setHeroToast('Semua foto banner dihapus.');
                                    setTimeout(() => setHeroToast(''), 3000);
                                  }}
                                  className="text-[9px] font-mono text-rose-400 hover:text-rose-300 cursor-pointer"
                                >
                                  Hapus Semua
                                </button>
                              )}
                            </div>

                            <p className="text-[9.5px] text-gray-400 font-sans leading-tight">
                              Klik pada thumbnail untuk melihat hasil crop di kolom banner atas:
                            </p>

                            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-black/60 border border-white/15">
                              {heroSlides.map((img, idx) => {
                                const isCurrentActive = activeIndex === idx;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => setSelectedSlideIndex(idx)}
                                    className={`relative w-12 h-15 bg-black cursor-pointer transition-all duration-150 group border ${
                                      isCurrentActive
                                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] shadow-lg z-10 scale-105'
                                        : 'border-white/20 hover:border-white/60 opacity-75 hover:opacity-100'
                                    }`}
                                    title={`Klik untuk melihat hasil crop Slide #${idx + 1}`}
                                  >
                                    <img
                                      src={img}
                                      alt={`Banner ${idx}`}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />

                                    {/* Number tag */}
                                    <div className={`absolute top-0.5 left-0.5 px-1 font-mono font-bold text-[8px] leading-tight ${
                                      isCurrentActive ? 'bg-[#D4AF37] text-black' : 'bg-black/80 text-gray-300'
                                    }`}>
                                      #{idx + 1}
                                    </div>

                                    {/* Action Buttons on Hover */}
                                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openCropperForImage(img, idx);
                                        }}
                                        className="bg-[#D4AF37] hover:bg-white text-black p-1 rounded-none transition-colors w-full flex items-center justify-center"
                                        title="Crop / Atur Posisi Slide Ini"
                                      >
                                        <Crop className="w-2.5 h-2.5" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          const filtered = heroSlides.filter((_, i) => i !== idx);
                                          const updatedConfig = {
                                            ...studioConfig,
                                            ...configForm,
                                            heroImageUrls: filtered,
                                            heroImageUrl: filtered[0] || '',
                                          };
                                          setConfigForm(updatedConfig);
                                          onUpdateStudioConfig(updatedConfig);
                                          if (selectedSlideIndex >= filtered.length) {
                                            setSelectedSlideIndex(Math.max(0, filtered.length - 1));
                                          }
                                          try {
                                            await saveStudioConfigToFirestore(updatedConfig);
                                          } catch {
                                            // ignore
                                          }
                                          setHeroToast('Foto banner dihapus dari database.');
                                          setTimeout(() => setHeroToast(''), 3000);
                                        }}
                                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-none transition-colors w-full flex items-center justify-center"
                                        title="Hapus Slide Ini dari Database"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
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

            {/* Bank Accounts Section with Indonesian Bank List & Customer Visibility Toggle */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111] p-4 border border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#D4AF37] text-black">
                      <CreditCard className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      Rincian Rekening Bank & Pengaturan Tampilan Konsumen
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400 max-w-2xl">
                    Pilih rekening bank mana saja yang ingin ditampilkan ke konsumen saat melakukan checkout booking dan nota pembayaran. Anda dapat memilih dari daftar nama bank Indonesia terlengkap atau menambahkan rekening baru.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] whitespace-nowrap">
                    {bankAccountsList.filter((b) => b.isActive).length} Aktif Ditampilkan ({bankAccountsList.length} Total)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBankAccount}
                    className="px-3 py-1.5 bg-[#D4AF37] hover:bg-white text-black text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Tambah Rekening Bank Baru"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Rekening</span>
                  </button>
                </div>
              </div>

              {/* Bulk toggles */}
              <div className="flex items-center justify-between gap-2 px-1 text-[11px] font-mono text-gray-400">
                <span>Daftar Rekening Studio:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleAllBanks(true)}
                    className="text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Tampilkan Semua ke Konsumen
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={() => handleToggleAllBanks(false)}
                    className="text-gray-400 hover:text-white hover:underline cursor-pointer"
                  >
                    Sembunyikan Selain Utama
                  </button>
                </div>
              </div>

              {/* Bank accounts cards list */}
              <div className="space-y-3">
                {bankAccountsList.map((bank, index) => {
                  const preset = getBankPreset(bank.bankCode || bank.bankName);
                  const isCustom = bank.bankCode === 'OTHER';

                  return (
                    <div
                      key={bank.id}
                      className={`p-4 border transition-all ${
                        bank.isActive
                          ? 'bg-[#141414] border-[#D4AF37]/40 shadow-md'
                          : 'bg-[#0d0d0d] border-white/10 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Top bar within each card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 text-xs font-mono font-bold uppercase ${preset.badgeBg} text-white`}>
                            {preset.shortName || bank.bankCode || `BANK #${index + 1}`}
                          </span>
                          
                          {/* Visibility Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleBankActive(bank.id)}
                            className={`px-2.5 py-1 text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                              bank.isActive
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 hover:bg-emerald-900/50'
                                : 'bg-neutral-900 border-white/20 text-gray-400 hover:text-white hover:border-white/40'
                            }`}
                            title={bank.isActive ? 'Klik untuk sembunyikan dari konsumen' : 'Klik untuk tampilkan ke konsumen'}
                          >
                            {bank.isActive ? (
                              <>
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                <span>TAMPILKAN KE KONSUMEN (AKTIF)</span>
                              </>
                            ) : (
                              <>
                                <Square className="w-3.5 h-3.5 text-gray-500" />
                                <span>DISEMBUNYIKAN (NONAKTIF)</span>
                              </>
                            )}
                          </button>

                          {/* Primary Badge */}
                          {bank.isPrimary ? (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center gap-1">
                              <Star className="w-3 h-3 fill-[#D4AF37]" /> Rekening Utama
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryBank(bank.id)}
                              className="text-[10px] font-mono text-gray-400 hover:text-[#D4AF37] hover:underline cursor-pointer"
                            >
                              Jadikan Utama
                            </button>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBankAccount(bank.id)}
                          className="text-gray-400 hover:text-red-400 p-1 transition-colors self-end sm:self-auto cursor-pointer"
                          title="Hapus Rekening Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Preset Bank List Dropdown */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono text-gray-300">
                            Pilih Nama Bank
                          </label>
                          <select
                            value={bank.bankCode || 'BCA'}
                            onChange={(e) => handleBankPresetChange(bank.id, e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                          >
                            {INDONESIAN_BANK_PRESETS.map((p) => (
                              <option key={p.code} value={p.code}>
                                {p.name}
                              </option>
                            ))}
                          </select>

                          {isCustom && (
                            <input
                              type="text"
                              placeholder="Ketik Nama Bank / E-Wallet..."
                              value={bank.bankName}
                              onChange={(e) => handleUpdateBankField(bank.id, 'bankName', e.target.value)}
                              className="w-full mt-1.5 px-3 py-1.5 bg-[#0A0A0A] border border-white/20 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                            />
                          )}
                        </div>

                        {/* Account Number */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono text-gray-300">
                            Nomor Rekening
                          </label>
                          <input
                            type="text"
                            placeholder={preset.defaultPlaceholder || 'Contoh: 8720-1928-33'}
                            value={bank.accountNumber}
                            onChange={(e) => handleUpdateBankField(bank.id, 'accountNumber', e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none tracking-wider"
                          />
                        </div>

                        {/* Account Holder */}
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono text-gray-300">
                            Atas Nama (a.n)
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Dimensi Fotografi Studio"
                            value={bank.accountHolder}
                            onChange={(e) => handleUpdateBankField(bank.id, 'accountHolder', e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer Live Preview Box */}
              <div className="p-4 bg-gradient-to-b from-[#18140a] to-[#0d0d0d] border border-[#D4AF37]/50 mt-4">
                <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-[#D4AF37]/30">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau Tampilan Pilihan Bank Konsumen di Nota Booking:</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    ({bankAccountsList.filter((b) => b.isActive).length} Rekening Aktif Tampil)
                  </span>
                </div>

                {bankAccountsList.filter((b) => b.isActive).length === 0 ? (
                  <p className="text-xs text-amber-300 py-2 italic font-mono">
                    ⚠️ Semua rekening disembunyikan. Harap aktifkan minimal 1 rekening agar konsumen dapat melakukan transfer pembayaran.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {bankAccountsList.filter((b) => b.isActive).map((bank) => {
                      const preset = getBankPreset(bank.bankCode || bank.bankName);
                      return (
                        <div
                          key={`preview-${bank.id}`}
                          className="p-2.5 bg-[#121212] border border-[#D4AF37]/40 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${preset.badgeBg} text-white`}>
                                {preset.shortName || bank.bankCode}
                              </span>
                              {bank.isPrimary && (
                                <span className="text-[9px] text-[#D4AF37] font-mono">Utama</span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">{bank.bankName}</div>
                            <div className="text-xs font-mono font-bold text-white tracking-wider my-0.5 truncate">
                              {bank.accountNumber || '-'}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">
                              a.n <span className="text-gray-200">{bank.accountHolder || '-'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* QRIS Code Payment Guide Upload Section */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111111] p-4 border border-white/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#D4AF37] text-black">
                        <ImageIcon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Unggah Foto QRIS Pembayaran Studio
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-400 max-w-2xl">
                      Unggah kode QRIS resmi studio (GoPay, QRIS Nasional, BCA, dll). Gambar ini akan otomatis muncul di bagian bawah nota pembayaran/reservasi sebagai panduan transfer instan bagi pelanggan.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#141414] border border-white/15 space-y-4">
                  {configForm.qrisUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-36 h-36 bg-white border border-[#D4AF37] p-2 flex items-center justify-center shrink-0">
                        <img
                          src={configForm.qrisUrl}
                          alt="QRIS Studio"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2 flex-1 text-left">
                        <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>QRIS Studio Berhasil Diunggah & Aktif</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Kode QRIS ini akan dicetak di bagian bawah nota pembayaran A5 agar konsumen dapat langsung melakukan scan QR untuk pelunasan atau DP.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <label className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-white/20 text-xs font-mono uppercase cursor-pointer">
                            <span>Ganti Gambar QRIS</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQRISFileSelect}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setConfigForm({ ...configForm, qrisUrl: '' })}
                            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-mono uppercase cursor-pointer"
                          >
                            Hapus QRIS
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-white/20 hover:border-[#D4AF37] bg-black/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                      <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-xs font-semibold text-white">Klik atau Tarik Foto QRIS ke Sini</span>
                      <span className="text-[10px] text-gray-400 mt-1 font-mono">Format PNG, JPG, WEBP (Disarankan ukuran kotak / QR Code)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRISFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Profil...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
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
                    onClick={async () => {
                      const currentList = configForm.heroImageUrls && configForm.heroImageUrls.length > 0
                        ? configForm.heroImageUrls
                        : (configForm.heroImageUrl ? [configForm.heroImageUrl] : []);
                      
                      const updatedList = bannerReplaceMode
                        ? [item.imageUrl]
                        : (currentList.includes(item.imageUrl) ? currentList : [...currentList, item.imageUrl]);

                      const updatedConfig: StudioConfig = {
                        ...studioConfig,
                        ...configForm,
                        heroImageUrl: updatedList[0] || item.imageUrl,
                        heroImageUrls: updatedList,
                      };
                      setConfigForm(updatedConfig);
                      onUpdateStudioConfig(updatedConfig);
                      setSelectedSlideIndex(bannerReplaceMode ? 0 : updatedList.length - 1);
                      setIsHeroPortfolioPickerOpen(false);
                      try {
                        await saveStudioConfigToFirestore(updatedConfig);
                      } catch (err) {
                        console.warn('Firestore save warning:', err);
                      }
                      setHeroToast(
                        bannerReplaceMode
                          ? `Banner diganti dengan foto portofolio: ${item.categoryName || item.category}`
                          : `Berhasil menambahkan banner dari portofolio: ${item.categoryName || item.category} (Total: ${updatedList.length} slide)`
                      );
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
                      alt={item.categoryName || item.title || 'Foto Portofolio'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-[11px] font-bold text-white truncate">{item.categoryName || item.category}</p>
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

      {/* Banner Image Cropper Modal */}
      <BannerCropperModal
        isOpen={isBannerCropperOpen}
        imageSrc={cropperImageSrc}
        onClose={() => {
          setIsBannerCropperOpen(false);
          setCropperImageSrc(null);
          setCropperTargetIndex(null);
        }}
        onCropComplete={handleCropComplete}
        title={configForm.heroCardTitle || 'The Royal Eternity'}
        subtitle={configForm.heroCardSubtitle || 'Signature Series'}
        badgeText={configForm.heroBadgeText || 'Top Rated Studio'}
      />

      {/* Modal: Delete Confirmation for Staff */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141414] border border-rose-500/40 w-full max-w-md p-6 text-center shadow-2xl relative text-[#E0E0E0]">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h4 className="text-lg font-serif font-bold text-white mb-2">
              Hapus Akses Staf Admin?
            </h4>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus hak akses admin untuk staf <strong className="text-white">"{staffToDelete.name}"</strong>?
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="flex-1 py-2.5 bg-[#1A1A1A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteStaff}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
                id="btn-confirm-delete-staff"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Akses</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
