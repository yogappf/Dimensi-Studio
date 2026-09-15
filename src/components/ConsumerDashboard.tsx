import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  BookingOrder,
  OrderStatus,
  PhotoPackage,
  AddOnItem,
  PortfolioItem,
  AdminStaff,
  StudioConfig,
  AuditLogItem,
} from '../types';
import { PHOTO_PACKAGES, ADD_ON_SERVICES, PORTFOLIO_ITEMS, INITIAL_CLIENT_ORDERS, STUDIO_INFO } from '../data/mockData';
import {
  formatRupiah,
  formatDateIndonesian,
  generateWhatsAppLink,
  generateClientDeliveryWhatsAppLink,
  generateClientConfirmationWhatsAppLink,
  generateClientCompletionWhatsAppLink,
  generateClientReminderMessage,
  generateClientReminderWhatsAppLink,
  checkScheduleSlotConflict,
  getBookedSlotsForDate,
  getBookedTimeWindowsForDate,
  getUpcomingSessionsWithin24Hours,
  isOrderWithin24Hours,
  UpcomingSessionAlert,
} from '../utils/formatters';
import {
  sendAdminUpcomingSessionEmail,
  sendAdminUpcomingSessionsDigestEmail,
} from '../utils/emailNotifier';
import { exportOrdersToExcel, exportOrdersToCSV } from '../utils/excelExport';
import { PackageManager } from './PackageManager';
import { AddonManager } from './AddonManager';
import { PortfolioManager } from './PortfolioManager';
import { DriveManager } from './DriveManager';
import { MasterAdminManager } from './MasterAdminManager';
import { PrintableReceipt } from './PrintableReceipt';
import { AnimatedClockPicker } from './AnimatedClockPicker';
import { printOrDownloadReceipt, downloadReceiptPDFFile } from '../utils/receiptPrinter';
import { getCategoryLabel, getCategoryIcon } from './BookingForm';
import { useToast } from '../context/ToastContext';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  MessageCircle,
  Users,
  DollarSign,
  CalendarCheck,
  Clock,
  RotateCcw,
  CheckCircle2,
  X,
  Phone,
  Mail,
  Loader2,
  MapPin,
  FileText,
  FileCheck,
  AlertCircle,
  Database,
  LogIn,
  LogOut,
  ShieldCheck,
  Package,
  Layers,
  Image as ImageIcon,
  Sparkles,
  HardDrive,
  FolderOpen,
  Share2,
  ExternalLink,
  Crown,
  Printer,
  Instagram,
  Star,
  Bell,
  BellRing,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Send,
  Timer,
  Copy,
  Check,
  Link2,
  Unlink,
} from 'lucide-react';

interface ConsumerDashboardProps {
  reviews?: any[];
  orders: BookingOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<BookingOrder>) => void;
  onDeleteReview?: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onAddManualOrder: (newOrder: BookingOrder) => void;
  onResetData: () => void;
  packages: PhotoPackage[];
  onAddPackage: (newPkg: PhotoPackage) => void;
  onUpdatePackage: (pkgId: string, updatedPkg: Partial<PhotoPackage>) => void;
  onDeletePackage: (pkgId: string) => void;
  onResetPackages: () => void;
  addons?: AddOnItem[];
  onAddAddon?: (addon: AddOnItem) => void;
  onUpdateAddon?: (addonId: string, updated: Partial<AddOnItem>) => void;
  onDeleteAddon?: (addonId: string) => void;
  onResetAddons?: () => void;
  portfolios?: PortfolioItem[];
  onAddPortfolio?: (item: PortfolioItem) => void;
  onUpdatePortfolio?: (id: string, updated: Partial<PortfolioItem>) => void;
  onDeletePortfolio?: (id: string) => void;
  onResetPortfolios?: () => void;
  currentUser?: User | null;
  onGoogleSignIn?: () => void;
  onLogOut?: () => void;
  isFirebaseConnected?: boolean;
  onExitAdmin?: () => void;
  isMasterAdmin?: boolean;
  studioConfig?: StudioConfig;
  onUpdateStudioConfig?: (config: StudioConfig) => void;
  staffList?: AdminStaff[];
  onAddStaff?: (staff: AdminStaff) => void;
  onUpdateStaff?: (id: string, updates: Partial<AdminStaff>) => void;
  onDeleteStaff?: (id: string) => void;
  auditLogs?: AuditLogItem[];
  onRestoreAllData?: (data: any) => Promise<void>;
}

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({
  orders,
  reviews = [],
  onUpdateOrderStatus,
  onUpdateOrder,
  onDeleteReview,
  onDeleteOrder,
  onAddManualOrder,
  onResetData,
  packages = PHOTO_PACKAGES,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  onResetPackages,
  addons = ADD_ON_SERVICES,
  onAddAddon = () => {},
  onUpdateAddon = () => {},
  onDeleteAddon = () => {},
  onResetAddons = () => {},
  portfolios = PORTFOLIO_ITEMS,
  onAddPortfolio = () => {},
  onUpdatePortfolio = () => {},
  onDeletePortfolio = () => {},
  onResetPortfolios = () => {},
  currentUser,
  onGoogleSignIn,
  onLogOut,
  isFirebaseConnected,
  onExitAdmin,
  isMasterAdmin = true,
  studioConfig = {
    studioName: STUDIO_INFO.name,
    tagline: STUDIO_INFO.tagline,
    description: STUDIO_INFO.description,
    phone: STUDIO_INFO.phone,
    whatsapp: STUDIO_INFO.whatsapp,
    email: STUDIO_INFO.email,
    instagram: STUDIO_INFO.instagram,
    address: STUDIO_INFO.address,
    operatingHours: STUDIO_INFO.operatingHours,
    bankBCA: 'BCA 8720-1928-33 a/n Dimensi Fotografi Studio',
    bankMandiri: 'Mandiri 137-00-1928374-1 a/n PT Dimensi Visual Karya',
    bankBRI: 'BRI 0341-01-002938-50-8 a/n Dimensi Fotografi',
    staffPasscode: 'DIMENSI2026',
    masterPasscode: 'MASTER_DIMENSI_2026',
  },
  onUpdateStudioConfig = () => {},
  staffList = [],
  onAddStaff = () => {},
  onUpdateStaff = () => {},
  onDeleteStaff = () => {},
  auditLogs = [],
  onRestoreAllData = async () => {},
}) => {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'packages' | 'addons' | 'portfolios' | 'drive' | 'master' | 'reviews'>('orders');
  const [isMasterUnlocked, setIsMasterUnlocked] = useState(false);
  const [isMasterUnlockModalOpen, setIsMasterUnlockModalOpen] = useState(false);
  const [masterPinInput, setMasterPinInput] = useState('');
  const [masterPinError, setMasterPinError] = useState('');

  const canAccessMaster = isMasterAdmin || isMasterUnlocked;

  const handleMasterTabClick = () => {
    if (canAccessMaster) {
      setActiveSubTab('master');
    } else {
      setMasterPinError('');
      setMasterPinInput('');
      setIsMasterUnlockModalOpen(true);
    }
  };

  const handleVerifyMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = masterPinInput.trim();
    let localMasterPasscode = '';
    try {
      const saved = localStorage.getItem('dimensi_studio_config_v1');
      if (saved) localMasterPasscode = JSON.parse(saved).masterPasscode || '';
    } catch {
      // ignore
    }
    const validMasterPins = [
      studioConfig?.masterPasscode,
      localMasterPasscode,
      'MASTER_DIMENSI_2026',
      'MASTER2026',
    ].filter(Boolean) as string[];

    const isValid = validMasterPins.some(
      (vp) => pin === vp || pin.toLowerCase() === vp.toLowerCase()
    );

    if (isValid) {
      setIsMasterUnlocked(true);
      setIsMasterUnlockModalOpen(false);
      setActiveSubTab('master');
    } else {
      setMasterPinError('PIN Master tidak valid. Akses ditolak.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'displayed' | 'hidden'>('all');
  
  // Upcoming session alert state (< 24 hours)
  const upcomingSessions = getUpcomingSessionsWithin24Hours(orders);
  const upcomingOrdersCount = orders.filter((o) => isOrderWithin24Hours(o)).length;
  const [isAlertBannerDismissed, setIsAlertBannerDismissed] = useState(false);
  const [isAlertBannerExpanded, setIsAlertBannerExpanded] = useState(true);
  const [isSending24hDigestEmail, setIsSending24hDigestEmail] = useState(false);
  const [sendingSessionEmailAlertId, setSendingSessionEmailAlertId] = useState<string | null>(null);

  // Trigger Toast Notification for upcoming sessions within 24 hours (Danger Red Theme)
  const hasNotifiedUpcomingRef = React.useRef(false);
  React.useEffect(() => {
    if (upcomingSessions.length > 0 && !hasNotifiedUpcomingRef.current) {
      hasNotifiedUpcomingRef.current = true;
      const firstSession = upcomingSessions[0];
      toast.error(
        `🚨 PERINGATAN DARURAT: Ada ${upcomingSessions.length} Sesi Foto dalam 24 Jam ke Depan!`,
        `Jadwal terdekat: ${firstSession.order.clientName} (${firstSession.timeStatusLabel}). Pastikan fotografer & kesiapan studio sudah siap.`,
        7500
      );
    }
  }, [upcomingSessions.length, toast]);

  // Automated Email Notification Dispatcher to Admin for Upcoming Sessions (< 24 Jam)
  const hasAutoEmailed24hRef = React.useRef<Record<string, number>>({});
  React.useEffect(() => {
    if (upcomingSessions.length === 0) return;
    if (studioConfig?.enableUpcoming24hEmailNotifications === false) return;

    const targetEmail = (studioConfig?.notificationEmail || studioConfig?.email || 'dimensi.idphoto@gmail.com').trim();
    const studioName = studioConfig?.studioName || 'Dimensi Fotografi Studio';
    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;

    upcomingSessions.forEach(async (session) => {
      const storageKey = `dimensi_24h_email_sent_${session.order.id}_s${session.sessionNumber}_${session.dateStr}`;
      let lastSent = hasAutoEmailed24hRef.current[storageKey] || 0;
      
      if (!lastSent) {
        try {
          const stored = localStorage.getItem(storageKey);
          if (stored) lastSent = parseInt(stored, 10) || 0;
        } catch {
          // ignore
        }
      }

      // If never sent or sent more than 12 hours ago
      if (now - lastSent > TWELVE_HOURS) {
        hasAutoEmailed24hRef.current[storageKey] = now;
        try {
          localStorage.setItem(storageKey, String(now));
        } catch {
          // ignore
        }

        const res = await sendAdminUpcomingSessionEmail(session, targetEmail, studioName);
        if (res.success) {
          toast.success(
            `📧 Peringatan 24 Jam Terkirim ke Email Admin (${targetEmail})`,
            `Sesi foto #${session.order.id} (${session.order.clientName}, Sesi ${session.sessionNumber}) dijadwalkan ${session.timeStatusLabel}.`
          );
        }
      }
    });
  }, [upcomingSessions, studioConfig, toast]);

  // Manual Trigger: Send 24-Hour Upcoming Sessions Digest Email
  const handleSend24hDigestEmail = async () => {
    if (upcomingSessions.length === 0) {
      toast.info('Tidak Ada Sesi Mendatang', 'Tidak ada jadwal sesi foto dalam 24 jam ke depan.');
      return;
    }

    const targetEmail = (studioConfig?.notificationEmail || studioConfig?.email || 'dimensi.idphoto@gmail.com').trim();
    const studioName = studioConfig?.studioName || 'Dimensi Fotografi Studio';

    setIsSending24hDigestEmail(true);
    try {
      const res = await sendAdminUpcomingSessionsDigestEmail(upcomingSessions, targetEmail, studioName);
      if (res.success) {
        toast.success(
          `📧 Rekap 24 Jam Terkirim ke ${targetEmail}`,
          `Rekap ${upcomingSessions.length} sesi foto mendatang berhasil dikirim ke email admin studio.`
        );
      } else {
        toast.error('Gagal Mengirim Email Rekap', res.message);
      }
    } catch (err: any) {
      toast.error('Gagal Mengirim Email', err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSending24hDigestEmail(false);
    }
  };

  // Manual Trigger: Send Single Session 24-Hour Reminder Email
  const handleSendSingleSessionEmail = async (session: UpcomingSessionAlert) => {
    const targetEmail = (studioConfig?.notificationEmail || studioConfig?.email || 'dimensi.idphoto@gmail.com').trim();
    const studioName = studioConfig?.studioName || 'Dimensi Fotografi Studio';
    const alertKey = `${session.order.id}-${session.sessionNumber}`;

    setSendingSessionEmailAlertId(alertKey);
    try {
      const res = await sendAdminUpcomingSessionEmail(session, targetEmail, studioName);
      if (res.success) {
        // Record timestamp in storage so auto-dispatcher knows it's fresh
        const storageKey = `dimensi_24h_email_sent_${session.order.id}_s${session.sessionNumber}_${session.dateStr}`;
        hasAutoEmailed24hRef.current[storageKey] = Date.now();
        try {
          localStorage.setItem(storageKey, String(Date.now()));
        } catch {
          // ignore
        }

        toast.success(
          `📧 Notifikasi Sesi Terkirim ke Admin (${targetEmail})`,
          `Rincian sesi foto #${session.order.id} (${session.order.clientName}) berhasil dikirim.`
        );
      } else {
        toast.error('Pengiriman Email Gagal', res.message);
      }
    } catch (err: any) {
      toast.error('Pengiriman Email Gagal', err?.message || 'Terjadi gangguan jaringan.');
    } finally {
      setSendingSessionEmailAlertId(null);
    }
  };

  // Modifikasi ini agar ulasan dari koleksi khusus ditampilkan
  const reviewsData = reviews || [];
  // Gabungkan dari kedua sumber: pesanan yang memiliki review tapi belum masuk ke koleksi reviews, dan dari koleksi reviews
  const reviewSourceData = [
    ...orders.filter(o => (o.review || o.rating) && !reviewsData.some(r => r.id === o.id)),
    ...reviewsData
  ];
    
  // Modals state
  const [detailOrder, setDetailOrder] = useState<BookingOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<BookingOrder | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<any | null>(null);
  const [reminderOrder, setReminderOrder] = useState<BookingOrder | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isCopiedReminder, setIsCopiedReminder] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState('');
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');
  
  // Consumer Details Link Management State
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [isCopiedDriveLink, setIsCopiedDriveLink] = useState(false);
  const [confirmDeleteLinkId, setConfirmDeleteLinkId] = useState<string | null>(null);

  // Sync driveLinkInput whenever detailOrder changes
  React.useEffect(() => {
    if (detailOrder) {
      setDriveLinkInput(detailOrder.driveFolderUrl || '');
      setConfirmDeleteLinkId(null);
    }
  }, [detailOrder?.id, detailOrder?.driveFolderUrl]);

  const handleSaveOrUpdateDriveLink = (targetOrder: BookingOrder, customVal?: string) => {
    const valToSave = (customVal !== undefined ? customVal : driveLinkInput).trim();
    if (onUpdateOrder) {
      onUpdateOrder(targetOrder.id, {
        driveFolderUrl: valToSave || '',
        driveFolderId: valToSave ? targetOrder.driveFolderId : '',
      });
      setDetailOrder({
        ...targetOrder,
        driveFolderUrl: valToSave || undefined,
        driveFolderId: valToSave ? targetOrder.driveFolderId : undefined,
      });
      setDriveLinkInput(valToSave);
      setConfirmDeleteLinkId(null);
      if (valToSave) {
        toast.success('Link Google Drive berhasil diperbarui & tersimpan!');
      } else {
        toast.success('Link Google Drive berhasil dikosongkan/dihapus.');
      }
    }
  };

  const handleExecuteDeleteDriveLink = (targetOrder: BookingOrder) => {
    if (onUpdateOrder) {
      onUpdateOrder(targetOrder.id, {
        driveFolderUrl: '',
        driveFolderId: '',
      });
    }
    setDetailOrder((prev) => {
      if (!prev || prev.id !== targetOrder.id) return prev;
      return {
        ...prev,
        driveFolderUrl: undefined,
        driveFolderId: undefined,
      };
    });
    setDriveLinkInput('');
    setConfirmDeleteLinkId(null);
    toast.success('Link Google Drive berhasil dihapus dari data konsumen!');
  };

  const handleCopyDriveLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopiedDriveLink(true);
    toast.success('Link Google Drive berhasil disalin ke clipboard!');
    setTimeout(() => setIsCopiedDriveLink(false), 2000);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      const deletedName = orderToDelete.clientName;
      const deletedId = orderToDelete.id;
      onDeleteOrder(orderToDelete.id);
      if (detailOrder?.id === orderToDelete.id) {
        setDetailOrder(null);
      }
      setOrderToDelete(null);
      setDeleteNotice(`Data konsumen "${deletedName}" (${deletedId}) berhasil dihapus.`);
      setTimeout(() => setDeleteNotice(''), 4000);
    }
  };

  const confirmDeleteReview = () => {
    if (reviewToDelete) {
      const deletedName = reviewToDelete.clientName;
      const reviewId = reviewToDelete.id;
      if (onDeleteReview) {
        onDeleteReview(reviewId);
      } else if (onUpdateOrder) {
        onUpdateOrder(reviewId, {
          rating: undefined,
          review: undefined,
          reviewedAt: undefined,
          showInTestimonials: undefined,
        });
      }
      setReviewToDelete(null);
      setDeleteNotice(`Ulasan dari "${deletedName}" berhasil dihapus.`);
      setTimeout(() => setDeleteNotice(''), 4000);
    }
  };

  // Manual Add Form State
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPkgId, setManualPkgId] = useState(packages[0]?.id || PHOTO_PACKAGES[0].id);
  const [manualAddonIds, setManualAddonIds] = useState<string[]>([]);
  
  // Sesi 1 State
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('10:00 WIB');
  const [manualLocationType, setManualLocationType] = useState<'studio' | 'outdoor' | 'venue'>('studio');
  const [manualLocation, setManualLocation] = useState('Dimensi Photo Studio (Studio 1 Utama)');
  const [manualNotes, setManualNotes] = useState('');

  // Sesi 2 State (Opsional / 2 Acara)
  const [manualHasSecondSession, setManualHasSecondSession] = useState(false);
  const [manualDate2, setManualDate2] = useState('');
  const [manualTime2, setManualTime2] = useState('18:30 WIB');
  const [manualLocationType2, setManualLocationType2] = useState<'studio' | 'outdoor' | 'venue'>('venue');
  const [manualLocation2, setManualLocation2] = useState('');
  const [manualNotes2, setManualNotes2] = useState('');

  const [manualStatus, setManualStatus] = useState<OrderStatus>('Terkonfirmasi & Terjadwal');
  const [manualPayment, setManualPayment] = useState<'DP 30%' | 'DP 50%' | 'Lunas'>('DP 50%');

  const handleManualLocationTypeChange = (type: 'studio' | 'outdoor' | 'venue') => {
    setManualLocationType(type);
    if (type === 'studio') {
      setManualLocation('Dimensi Photo Studio (Studio 1 Utama)');
    } else if (type === 'outdoor') {
      setManualLocation('Lokasi Outdoor / Alam Pilihan Klien');
    } else {
      setManualLocation('');
    }
  };

  const handleManualLocationType2Change = (type: 'studio' | 'outdoor' | 'venue') => {
    setManualLocationType2(type);
    if (type === 'studio') {
      setManualLocation2('Dimensi Photo Studio (Studio 1 Utama)');
    } else if (type === 'outdoor') {
      setManualLocation2('Lokasi Outdoor / Alam Pilihan Klien');
    } else {
      setManualLocation2('');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'upcoming24h'
        ? isOrderWithin24Hours(order)
        : order.status === statusFilter;

    const matchesPackage = packageFilter === 'all' || order.packageId === packageFilter;

    return matchesSearch && matchesStatus && matchesPackage;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Dibatalkan' ? o.totalPrice : 0), 0);
  const scheduledCount = orders.filter((o) => o.status === 'Terkonfirmasi & Terjadwal').length;
  const pendingCount = orders.filter((o) => o.status === 'Menunggu Konfirmasi').length;
  const editingCount = orders.filter((o) => o.status === 'Proses Editing').length;
  const completedCount = orders.filter((o) => o.status === 'Selesai').length;

  const handleExportExcel = () => {
    const success = exportOrdersToExcel(filteredOrders);
    if (success) {
      setExportSuccessMsg(`Berhasil mengekspor ${filteredOrders.length} data konsumen ke file Excel (.xlsx)`);
      toast.success('Ekspor Excel Berhasil!', `${filteredOrders.length} data konsumen berhasil diunduh ke file .xlsx`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } else {
      toast.error('Gagal mengekspor data ke Excel');
    }
  };

  const handleExportCSV = () => {
    const success = exportOrdersToCSV(filteredOrders);
    if (success) {
      setExportSuccessMsg(`Berhasil mengekspor ${filteredOrders.length} data konsumen ke file CSV`);
      toast.success('Ekspor CSV Berhasil!', `${filteredOrders.length} data konsumen berhasil diunduh ke file .csv`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    } else {
      toast.error('Gagal mengekspor data ke CSV');
    }
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      toast.error('Nama dan nomor telepon wajib diisi.');
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const targetDate = manualDate || todayStr;

    // Check conflict for Sesi 1
    const conflict1 = checkScheduleSlotConflict(targetDate, manualTime, orders);
    if (conflict1) {
      toast.warning(
        `Catatan Bentrok Jadwal Sesi 1: Tanggal ${formatDateIndonesian(targetDate)} pukul ${manualTime} bertabrakan dengan pesanan ${conflict1.clientName} (${conflict1.id}). Pesanan tetap disimpan oleh Admin.`
      );
    }

    // Check conflict for Sesi 2 if enabled
    let targetDate2 = manualDate2;
    if (manualHasSecondSession) {
      if (!targetDate2) {
        targetDate2 = targetDate;
      }
      const conflict2 = checkScheduleSlotConflict(targetDate2, manualTime2, orders);
      if (conflict2) {
        toast.warning(
          `Catatan Bentrok Jadwal Sesi 2: Tanggal ${formatDateIndonesian(targetDate2)} pukul ${manualTime2} bertabrakan dengan pesanan ${conflict2.clientName} (${conflict2.id}). Pesanan tetap disimpan oleh Admin.`
        );
      }
    }

    const pkg = packages.find((p) => p.id === manualPkgId) || packages[0] || PHOTO_PACKAGES[0];
    const selectedAddons = addons.filter((a) => manualAddonIds.includes(a.id));
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: BookingOrder = {
      id: `DMS-${new Date().getFullYear()}-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      clientName: manualName.trim(),
      phone: manualPhone.trim(),
      email: manualEmail.trim(),
      packageId: pkg.id,
      packageName: pkg.name,
      packagePrice: pkg.price,
      addOnIds: manualAddonIds,
      addOnsText: selectedAddons.length > 0 ? selectedAddons.map((a) => a.name).join(', ') : 'Tidak ada',
      addOnsTotal: addonsTotal,
      totalPrice: pkg.price + addonsTotal,
      // Sesi 1
      sessionDate: targetDate,
      sessionTime: manualTime,
      locationType: manualLocationType,
      locationAddress: manualLocation.trim() || (manualLocationType === 'studio' ? 'Dimensi Photo Studio' : 'Lokasi Sesi 1'),
      notes: manualNotes.trim(),
      // Sesi 2
      hasSecondSession: manualHasSecondSession,
      sessionDate2: manualHasSecondSession ? targetDate2 : undefined,
      sessionTime2: manualHasSecondSession ? manualTime2 : undefined,
      locationType2: manualHasSecondSession ? manualLocationType2 : undefined,
      locationAddress2: manualHasSecondSession ? (manualLocation2.trim() || (manualLocationType2 === 'studio' ? 'Dimensi Photo Studio' : 'Lokasi Sesi 2')) : undefined,
      notes2: manualHasSecondSession ? manualNotes2.trim() : undefined,
      status: manualStatus,
      completedAt: manualStatus === 'Selesai' ? new Date().toISOString() : undefined,
      paymentPreference: manualPayment,
    };

    onAddManualOrder(newOrder);
    setIsAddModalOpen(false);
    // Reset all form fields
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    setManualNotes('');
    setManualAddonIds([]);
    setManualDate('');
    setManualTime('10:00 WIB');
    setManualLocationType('studio');
    setManualLocation('Dimensi Photo Studio (Studio 1 Utama)');
    setManualHasSecondSession(false);
    setManualDate2('');
    setManualTime2('18:30 WIB');
    setManualLocationType2('venue');
    setManualLocation2('');
    setManualNotes2('');
    setManualPkgId(packages[0]?.id || PHOTO_PACKAGES[0].id);
    setManualStatus('Terkonfirmasi & Terjadwal');
    setManualPayment('DP 50%');
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Terkonfirmasi & Terjadwal':
        return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40';
      case 'Menunggu Konfirmasi':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Proses Editing':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
      case 'Selesai':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
      case 'Dibatalkan':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      default:
        return 'bg-white/10 text-gray-400 border-white/10';
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-[#E0E0E0]">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
            <span>Panel Manajemen & Database Konsumen</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white">
            Daftar Konsumen & <span className="italic font-serif text-[#D4AF37]">Jadwal Sesi Foto</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Kelola data pemesanan pemotretan pelanggan, pantau status pengerjaan, dan ekspor data langsung ke file Microsoft Excel (.xlsx).
          </p>
          <div className="flex items-center gap-3 mt-3">
            <a
              href={`https://instagram.com/${(studioConfig?.instagram || '@dimensi.idphoto').replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-black border border-pink-500/30 hover:border-pink-500/60 text-[11px] font-mono text-pink-300 transition-colors cursor-pointer"
              title="Kunjungi Instagram Resmi Studio"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>{studioConfig?.instagram || '@dimensi.idphoto'}</span>
              <ExternalLink className="w-2.5 h-2.5 text-gray-400 ml-0.5" />
            </a>
            <a
              href={`https://tiktok.com/@${(studioConfig?.tiktok || 'dimensifotografi').replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-white/15 hover:border-[#D4AF37]/50 text-[11px] font-mono text-gray-200 transition-colors cursor-pointer"
              title="Kunjungi TikTok Resmi Studio"
            >
              <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
              <span>@{studioConfig?.tiktok ? studioConfig.tiktok.replace('@', '') : 'dimensifotografi'}</span>
              <ExternalLink className="w-2.5 h-2.5 text-gray-400 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Action Buttons: Excel Export & Manual Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Cloud Sync Status */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#141414] border border-white/10 text-[11px] font-mono text-gray-300">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isFirebaseConnected ? 'Firebase Cloud Aktif' : 'Menghubungkan Cloud...'}</span>
          </div>

          {/* Google Auth Info (Only shown if signed in) */}
          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#D4AF37]/40 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400">Admin Terautentikasi</span>
                <span className="font-mono text-[11px] text-white max-w-[130px] truncate">{currentUser.email}</span>
              </div>
              <button
                onClick={onLogOut}
                className="ml-1 p-1 hover:text-rose-400 text-gray-400 transition-colors cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Excel Export Button */}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.18em] flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            id="btn-export-excel"
            title="Download file Microsoft Excel .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
            <span>Ekspor ke Excel (.xlsx)</span>
          </button>

          {/* CSV Export Option */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-[#141414] hover:bg-white/10 text-gray-300 border border-white/15 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            id="btn-export-csv"
            title="Download file CSV"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span>CSV</span>
          </button>

          {/* Add Manual Client */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 bg-[#141414] hover:border-[#D4AF37] text-[#D4AF37] border border-[#D4AF37]/50 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            id="btn-add-client-manual"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Manual</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation (Konsumen vs Paket vs Add-On vs Portofolio vs Google Drive vs Master Admin) */}
      <div className="space-y-3">
        {/* Navigation Bar Container */}
        <div className="bg-[#101010] p-2 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
            {/* 1. Data Konsumen */}
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                activeSubTab === 'orders'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg ring-1 ring-[#D4AF37]'
                  : 'bg-[#161616] text-gray-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#1f1f1f]'
              }`}
              id="tab-orders-view"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Users className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'orders' ? 'text-black' : 'text-[#D4AF37]'}`} />
                <span className="truncate">Data Konsumen</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {upcomingSessions.length > 0 && (
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-rose-600 text-white border border-rose-500 animate-pulse flex items-center gap-0.5 shadow-sm"
                    title={`Ada ${upcomingSessions.length} sesi pemotretan dalam 24 jam ke depan`}
                  >
                    <Bell className="w-2.5 h-2.5 fill-current" />
                    <span>{upcomingSessions.length}</span>
                  </span>
                )}
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                  activeSubTab === 'orders'
                    ? 'bg-black/20 text-black border-black/30'
                    : 'bg-black/40 text-gray-400 border-white/10'
                }`}>
                  {orders.length}
                </span>
              </div>
            </button>

            {/* 2. Master Paket */}
            <button
              onClick={() => setActiveSubTab('packages')}
              className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                activeSubTab === 'packages'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg ring-1 ring-[#D4AF37]'
                  : 'bg-[#161616] text-gray-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#1f1f1f]'
              }`}
              id="tab-packages-view"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Package className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'packages' ? 'text-black' : 'text-[#D4AF37]'}`} />
                <span className="truncate">Master Paket</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                activeSubTab === 'packages'
                  ? 'bg-black/20 text-black border-black/30'
                  : 'bg-black/40 text-gray-400 border-white/10'
              }`}>
                {packages.length}
              </span>
            </button>

            {/* 3. Layanan Add-On */}
            <button
              onClick={() => setActiveSubTab('addons')}
              className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                activeSubTab === 'addons'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg ring-1 ring-[#D4AF37]'
                  : 'bg-[#161616] text-gray-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#1f1f1f]'
              }`}
              id="tab-addons-view"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Layers className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'addons' ? 'text-black' : 'text-[#D4AF37]'}`} />
                <span className="truncate">Layanan Add-On</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                activeSubTab === 'addons'
                  ? 'bg-black/20 text-black border-black/30'
                  : 'bg-black/40 text-gray-400 border-white/10'
              }`}>
                {addons.length}
              </span>
            </button>

            {/* 4. Portofolio Galeri */}
            <button
              onClick={() => setActiveSubTab('portfolios')}
              className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                activeSubTab === 'portfolios'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg ring-1 ring-[#D4AF37]'
                  : 'bg-[#161616] text-gray-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#1f1f1f]'
              }`}
              id="tab-portfolios-view"
            >
              <div className="flex items-center gap-2.5 truncate">
                <ImageIcon className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'portfolios' ? 'text-black' : 'text-[#D4AF37]'}`} />
                <span className="truncate">Portofolio Galeri</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                activeSubTab === 'portfolios'
                  ? 'bg-black/20 text-black border-black/30'
                  : 'bg-black/40 text-gray-400 border-white/10'
              }`}>
                {portfolios.length}
              </span>
            </button>

            {/* 5. Google Drive Cloud Foto */}
            <button
              onClick={() => setActiveSubTab('drive')}
              className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                activeSubTab === 'drive'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg ring-1 ring-[#D4AF37]'
                  : 'bg-[#161616] text-gray-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#1f1f1f]'
              }`}
              id="tab-drive-view"
            >
              <div className="flex items-center gap-2.5 truncate">
                <HardDrive className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'drive' ? 'text-black' : 'text-[#D4AF37]'}`} />
                <span className="truncate">Google Drive</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                activeSubTab === 'drive'
                  ? 'bg-black/20 text-black border-black/30'
                  : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30'
              }`}>
                Cloud
              </span>
            </button>

            {/* 6. Manajemen Ulasan Klien */}
            <button
              onClick={() => setActiveSubTab('reviews')}
              className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                activeSubTab === 'reviews'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg ring-1 ring-[#D4AF37]'
                  : 'bg-[#161616] text-gray-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#1f1f1f]'
              }`}
              id="tab-reviews-view"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Star className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'reviews' ? 'text-black' : 'text-[#D4AF37]'}`} />
                <span className="truncate">Ulasan Klien</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                activeSubTab === 'reviews'
                  ? 'bg-black/20 text-black border-black/30'
                  : 'bg-black/40 text-gray-400 border-white/10'
              }`}>
                {reviewSourceData.length}
              </span>
            </button>

            {/* 7. Master Admin & Profil */}
            <button
              onClick={handleMasterTabClick}
              className={`px-3.5 py-3 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                activeSubTab === 'master'
                  ? 'bg-gold-metallic text-black border-[#FFF0A8] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] ring-1 ring-[#FFF0A8]'
                  : 'bg-[#181307] text-[#D4AF37] border-[#D4AF37]/40 hover:bg-[#D4AF37]/20 hover:text-white hover:border-[#D4AF37]'
              }`}
              id="tab-master-admin-view"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Crown className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'master' ? 'text-black' : 'text-[#D4AF37]'}`} />
                <span className="truncate">Master & Profil</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                activeSubTab === 'master'
                  ? 'bg-black/30 text-black border-black/30'
                  : canAccessMaster
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
              }`}>
                {canAccessMaster ? 'PRO' : '🔒 PIN'}
              </span>
            </button>
          </div>
        </div>

        {/* Role & Access Breadcrumb indicator */}
        <div className="flex items-center justify-between px-1 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${canAccessMaster ? 'bg-[#D4AF37]' : 'bg-blue-400'}`}></span>
            <span>
              Otoritas:{' '}
              <strong className={canAccessMaster ? 'text-[#D4AF37]' : 'text-blue-300'}>
                {canAccessMaster ? 'SUPER ADMINISTRATOR (FULL ACCESS)' : 'STAF OPERASIONAL STUDIO'}
              </strong>
            </span>
          </div>
          {!canAccessMaster && (
            <span className="text-gray-500 hidden sm:inline">
              Klik &apos;Master & Profil&apos; untuk membuka akses pemilik dengan PIN Master
            </span>
          )}
        </div>
      </div>

      {/* MODAL UNLOCK MASTER ADMIN FOR STAFF TERMINAL */}
      {isMasterUnlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-[#D4AF37]/50 p-6 space-y-5 shadow-2xl relative animate-scaleUp">
            <button
              onClick={() => setIsMasterUnlockModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Otorisasi Super Admin</h3>
              <p className="text-xs text-gray-400">
                Menu Master Admin & Profil Studio dilindungi. Masukkan PIN Master untuk membuka akses penuh.
              </p>
            </div>

            {masterPinError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{masterPinError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyMasterPin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  PIN Master Admin
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={masterPinInput}
                  onChange={(e) => setMasterPinInput(e.target.value)}
                  placeholder="Masukkan PIN Master"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/20 text-white text-xs font-mono tracking-widest focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMasterUnlockModalOpen(false)}
                  className="w-1/2 py-2.5 bg-[#1f1f1f] text-gray-300 text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
                >
                  Buka Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === 'reviews' && (
        <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] mb-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Moderasi & Kontrol Testimoni Publik</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase font-display">
                Manajemen Ulasan & Kepuasan Pelanggan
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Pilih ulasan mana yang ingin ditampilkan atau disembunyikan dari bagian Testimoni di Halaman Utama website studio.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-[#1a1a1a] border border-white/10 px-3 py-2 text-gray-300">
                Total Ulasan Masuk: <strong className="text-[#D4AF37]">{reviewSourceData.length}</strong>
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-gray-400 uppercase mr-2">Filter Tampilan:</span>
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 text-xs font-mono uppercase border transition-all cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                  : 'bg-[#181818] text-gray-300 border-white/10 hover:border-[#D4AF37]/50'
              }`}
            >
              Semua ({reviewSourceData.length})
            </button>
            <button
              onClick={() => setReviewFilter('displayed')}
              className={`px-3 py-1.5 text-xs font-mono uppercase border transition-all cursor-pointer ${
                reviewFilter === 'displayed'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                  : 'bg-[#181818] text-gray-300 border-white/10 hover:border-[#D4AF37]/50'
              }`}
            >
              Ditampilkan Publik ({reviewSourceData.filter(o => o.showInTestimonials !== false).length})
            </button>
            <button
              onClick={() => setReviewFilter('hidden')}
              className={`px-3 py-1.5 text-xs font-mono uppercase border transition-all cursor-pointer ${
                reviewFilter === 'hidden'
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                  : 'bg-[#181818] text-gray-300 border-white/10 hover:border-[#D4AF37]/50'
              }`}
            >
              Disembunyikan ({reviewSourceData.filter(o => o.showInTestimonials === false).length})
            </button>
          </div>

          {/* Reviews List */}
          {reviewSourceData.length === 0 ? (
            <div className="py-16 text-center bg-black/40 border border-white/10 space-y-3">
              <Star className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="text-white font-bold text-sm">Belum Ada Ulasan Klien</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Klien dapat memberikan ulasan dan rating kepuasan langsung melalui Portal Pelanggan setelah pesanan selesai atau diproses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewSourceData
                .filter((o) => {
                  if (reviewFilter === 'displayed') return o.showInTestimonials !== false;
                  if (reviewFilter === 'hidden') return o.showInTestimonials === false;
                  return true;
                })
                .map((order) => {
                  const isVisible = order.showInTestimonials !== false;
                  return (
                    <div
                      key={order.id}
                      className={`p-5 border transition-all flex flex-col justify-between space-y-4 ${
                        isVisible
                          ? 'bg-[#161616] border-white/15 hover:border-[#D4AF37]/50'
                          : 'bg-black/60 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#D4AF37]">
                            {[...Array(order.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                            ))}
                            <span className="ml-1 text-xs font-mono font-bold text-white">
                              {order.rating || 5}.0
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold border ${
                              isVisible
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                                : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {isVisible ? '● Ditampilkan Publik' : '○ Disembunyikan'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-white">{order.clientName}</h4>
                          <p className="text-[11px] text-[#D4AF37] font-mono">
                            {order.packageName} • ID: {order.id}
                          </p>
                        </div>

                        <p className="text-xs text-gray-300 italic bg-black/40 p-3 border border-white/5 leading-relaxed">
                          "{order.review || 'Tanpa komentar teks.'}"
                        </p>

                        <div className="text-[10px] text-gray-500 font-mono">
                          Diupload pada: {order.reviewedAt ? new Date(order.reviewedAt).toLocaleString('id-ID') : 'Tanggal tidak tercatat'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateOrder) {
                              onUpdateOrder(order.id, { showInTestimonials: !isVisible });
                            }
                          }}
                          className={`flex-1 py-2 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer border ${
                            isVisible
                              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                              : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isVisible ? 'Sembunyikan dari Testimoni' : 'Tampilkan di Testimoni'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setReviewToDelete(order);
                          }}
                          className="px-3 py-2 bg-red-950/30 border border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Hapus Ulasan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'master' && (
        <MasterAdminManager
          currentUser={currentUser}
          isMasterAdmin={canAccessMaster}
          studioConfig={studioConfig}
          onUpdateStudioConfig={onUpdateStudioConfig}
          staffList={staffList}
          onAddStaff={onAddStaff}
          onUpdateStaff={onUpdateStaff}
          onDeleteStaff={onDeleteStaff}
          auditLogs={auditLogs}
          orders={orders}
          packages={packages}
          addons={addons}
          portfolios={portfolios}
          onRestoreAllData={onRestoreAllData}
          isFirebaseConnected={isFirebaseConnected}
        />
      )}

      {activeSubTab === 'drive' && (
        <DriveManager
          orders={orders}
          onUpdateOrder={onUpdateOrder || (() => {})}
          currentUser={currentUser}
          onGoogleSignIn={onGoogleSignIn}
        />
      )}

      {activeSubTab === 'packages' && (
        <PackageManager
          packages={packages}
          onAddPackage={onAddPackage}
          onUpdatePackage={onUpdatePackage}
          onDeletePackage={onDeletePackage}
          onResetPackages={onResetPackages}
          isFirebaseConnected={isFirebaseConnected}
          portfolios={portfolios}
        />
      )}

      {activeSubTab === 'addons' && (
        <AddonManager
          addons={addons}
          onAddAddon={onAddAddon}
          onUpdateAddon={onUpdateAddon}
          onDeleteAddon={onDeleteAddon}
          onResetAddons={onResetAddons}
        />
      )}

      {activeSubTab === 'portfolios' && (
        <PortfolioManager
          portfolios={portfolios}
          packages={packages}
          onAddPortfolio={onAddPortfolio}
          onUpdatePortfolio={onUpdatePortfolio}
          onDeletePortfolio={onDeletePortfolio}
          onResetPortfolios={onResetPortfolios}
        />
      )}

      {activeSubTab === 'orders' && (
        <>
          {/* Export & Delete Success Notification Toasts */}
          {exportSuccessMsg && (
            <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn mb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>{exportSuccessMsg}</span>
              </div>
              <button onClick={() => setExportSuccessMsg('')} className="text-[#D4AF37] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {deleteNotice && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn mb-4">
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{deleteNotice}</span>
              </div>
              <button onClick={() => setDeleteNotice('')} className="text-rose-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 🚨 FITUR NOTIFIKASI PERINGATAN JADWAL SESI MENDEKAT (< 24 JAM) */}
          {upcomingSessions.length > 0 && !isAlertBannerDismissed && (
            <div
              id="alert-upcoming-sessions-banner"
              className="bg-gradient-to-r from-[#2c0b0b] via-[#1d0909] to-[#121212] border-2 border-rose-600/80 p-4 sm:p-5 shadow-[0_0_35px_rgba(225,29,72,0.25)] relative animate-fadeIn mb-6"
            >
              {/* Top Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-rose-500/30">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400 flex-shrink-0 animate-pulse shadow-lg">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-rose-500/30 text-rose-300 border border-rose-400/60 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                        🚨 Peringatan Sesi &lt; 24 Jam
                      </span>
                      <span className="text-xs font-mono text-gray-300 font-semibold">
                        {upcomingSessions.length} Sesi Terjadwal
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-white mt-1">
                      Ada <span className="text-rose-400 underline underline-offset-4 font-extrabold">{upcomingSessions.length} sesi foto</span> yang akan berlangsung dalam 24 jam ke depan!
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      Harap verifikasi kehadiran klien, briefing fotografer, serta kesiapan studio & perlengkapan lighting.
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                  <button
                    onClick={handleSend24hDigestEmail}
                    disabled={isSending24hDigestEmail}
                    className="px-3 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider border border-[#D4AF37] transition-all cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
                    title={`Kirim rekap email sesi foto 24 jam ke email admin (${studioConfig?.notificationEmail || studioConfig?.email || 'dimensi.idphoto@gmail.com'})`}
                  >
                    {isSending24hDigestEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim Rekap...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Admin ({upcomingSessions.length})</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setStatusFilter(statusFilter === 'upcoming24h' ? 'all' : 'upcoming24h')}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === 'upcoming24h'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg'
                        : 'bg-rose-950/50 text-rose-300 border-rose-500/50 hover:bg-rose-900/60'
                    }`}
                    title="Filter tabel konsumen untuk sesi 24 jam ke depan saja"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>{statusFilter === 'upcoming24h' ? 'Tampilkan Semua' : 'Filter Tabel'}</span>
                  </button>

                  <button
                    onClick={() => setIsAlertBannerExpanded(!isAlertBannerExpanded)}
                    className="px-2.5 py-1.5 bg-[#171717] hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
                    title={isAlertBannerExpanded ? 'Ciutkan rincian kartu' : 'Buka rincian kartu'}
                  >
                    {isAlertBannerExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ciutkan</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Rincian ({upcomingSessions.length})</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsAlertBannerDismissed(true)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                    title="Sembunyikan panel peringatan sementara"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Session Cards Grid */}
              {isAlertBannerExpanded && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {upcomingSessions.map((session, idx) => {
                    const isUrgent = session.urgencyLevel === 'imminent';
                    const isSendingThisSessionEmail = sendingSessionEmailAlertId === `${session.order.id}-${session.sessionNumber}`;
                    return (
                      <div
                        key={`${session.order.id}-sesi-${session.sessionNumber}-${idx}`}
                        className={`p-3.5 border bg-[#0e0e0e]/95 space-y-3 relative group transition-all ${
                          isUrgent
                            ? 'border-rose-500/60 hover:border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.18)] ring-1 ring-rose-500/30'
                            : 'border-amber-500/40 hover:border-[#D4AF37]'
                        }`}
                      >
                        {/* Card Top Info */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono text-[#D4AF37] font-bold">
                                {session.order.id}
                              </span>
                              <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${
                                session.sessionNumber === 1
                                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                              }`}>
                                Sesi {session.sessionNumber}
                              </span>
                            </div>
                            <h4 className="text-white font-serif font-bold text-sm leading-snug">
                              {session.order.clientName}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate max-w-[190px]">
                              {session.order.packageName}
                            </p>
                          </div>

                          {/* Urgency Pill */}
                          <div className="text-right flex-shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold border ${
                                isUrgent
                                  ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 animate-pulse'
                                  : session.isToday
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                              }`}
                            >
                              <Timer className="w-3 h-3" />
                              <span>{session.timeStatusLabel}</span>
                            </span>
                            <span className={`inline-block px-1.5 py-0.5 text-[8px] font-mono uppercase font-bold border mt-0.5 ${getStatusBadgeClass(session.order.status)} bg-[#0A0A0A]`}>
                              {session.order.status}
                            </span>
                          </div>
                        </div>

                        {/* Time & Location Details Box */}
                        <div className="p-2.5 bg-black/50 border border-white/5 space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 font-mono text-gray-200">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                            <span className="font-semibold text-white">{session.timeStr}</span>
                            <span className="text-gray-400 text-[11px]">({formatDateIndonesian(session.dateStr)})</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-gray-300 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{session.location}</span>
                          </div>
                          {session.order.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono pt-0.5">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span>{session.order.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Kirim Pengingat WA, Kirim Email Admin & Lihat Detail */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setReminderOrder(session.order);
                              setIsReminderModalOpen(true);
                            }}
                            className="px-2 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                            title="Buka template WhatsApp pengingat sesi foto"
                          >
                            <Send className="w-3 h-3" />
                            <span>WA Klien</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSendingThisSessionEmail}
                            onClick={() => handleSendSingleSessionEmail(session)}
                            className="px-2 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            title={`Kirim notifikasi email sesi ini ke ${studioConfig?.notificationEmail || studioConfig?.email || 'dimensi.idphoto@gmail.com'}`}
                          >
                            {isSendingThisSessionEmail ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            <span>Email Admin</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDetailOrder(session.order)}
                            className="px-2 py-1.5 bg-[#1a1a1a] hover:bg-white/10 text-gray-200 border border-white/15 font-semibold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                            title="Buka rincian lengkap pesanan konsumen"
                          >
                            <Eye className="w-3 h-3 text-[#D4AF37]" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Compact Dismissed Banner */}
          {upcomingSessions.length > 0 && isAlertBannerDismissed && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between gap-3 mb-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                <span>
                  Pemberitahuan: Terdapat <strong>{upcomingSessions.length} sesi pemotretan</strong> dalam 24 jam ke depan.
                </span>
              </div>
              <button
                onClick={() => setIsAlertBannerDismissed(false)}
                className="text-xs font-mono font-bold text-[#D4AF37] underline hover:text-white cursor-pointer shrink-0"
              >
                Buka Peringatan Lengkap
              </button>
            </div>
          )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 bg-[#141414] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider font-mono">
            <span>Total Konsumen</span>
            <Users className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-serif font-bold text-white">{orders.length}</div>
          <span className="text-[10px] text-gray-500 font-mono block">Semua pendaftar</span>
        </div>

        <div className="p-5 bg-[#141414] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider font-mono">
            <span>Estimasi Omset</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-lg sm:text-xl font-serif font-bold text-[#D4AF37]">
            {formatRupiah(totalRevenue)}
          </div>
          <span className="text-[10px] text-gray-500 font-mono block">Nilai total sesi aktif</span>
        </div>

        <div className="p-5 bg-[#141414] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider font-mono">
            <span>Sesi Terjadwal</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-400">{scheduledCount}</div>
          <span className="text-[10px] text-gray-500 font-mono block">Siap dieksekusi</span>
        </div>

        <div className="p-5 bg-[#141414] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider font-mono">
            <span>Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-400">{pendingCount}</div>
          <span className="text-[10px] text-gray-500 font-mono block">Perlu dihubungi admin</span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-5 bg-[#141414] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider font-mono">
            <span>Editing & Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-purple-300">
            {editingCount + completedCount}
          </div>
          <span className="text-[10px] text-gray-500 font-mono block">{editingCount} edit, {completedCount} selesai</span>
        </div>

      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 bg-[#141414] border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama konsumen, nomor WA, ID booking, atau paket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0A0A0A] border border-white/10 text-white text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none placeholder-gray-600 transition-colors"
              id="search-consumer-input"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none cursor-pointer"
              id="filter-status-select"
            >
              <option value="all">Semua Status Pesanan</option>
              {upcomingOrdersCount > 0 && (
                <option value="upcoming24h">🚨 Sesi &lt; 24 Jam ke Depan ({upcomingOrdersCount})</option>
              )}
              <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
              <option value="Terkonfirmasi & Terjadwal">Terkonfirmasi & Terjadwal</option>
              <option value="Proses Editing">Proses Editing</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          {/* Package Filter */}
          <div className="sm:col-span-3">
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none cursor-pointer"
              id="filter-package-select"
            >
              <option value="all">Semua Jenis Paket</option>
              {PHOTO_PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-400 pt-1 border-t border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Menampilkan <strong className="text-[#D4AF37]">{filteredOrders.length}</strong> dari {orders.length} konsumen</span>
            {upcomingOrdersCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter(statusFilter === 'upcoming24h' ? 'all' : 'upcoming24h')}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  statusFilter === 'upcoming24h'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-900/60 animate-pulse'
                }`}
                title="Saring tabel konsumen hanya untuk sesi foto dalam 24 jam ke depan"
              >
                <Timer className="w-3 h-3 text-amber-400" />
                <span>Sesi &lt; 24 Jam ({upcomingOrdersCount})</span>
              </button>
            )}
          </div>
          <button
            onClick={onResetData}
            className="flex items-center gap-1 text-gray-500 hover:text-[#D4AF37] text-xs transition-colors cursor-pointer font-mono"
            title="Kembalikan data sampel bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Contoh</span>
          </button>
        </div>
      </div>

      {/* Main Consumers Table */}
      <div className="bg-[#141414] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0A0A0A] text-gray-400 border-b border-white/10 uppercase tracking-widest font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4">ID & Tgl Daftar</th>
                <th className="py-3.5 px-4">Konsumen</th>
                <th className="py-3.5 px-4">Paket & Tambahan</th>
                <th className="py-3.5 px-4">Jadwal Sesi & Lokasi</th>
                <th className="py-3.5 px-4 text-right">Total Biaya</th>
                <th className="py-3.5 px-4 text-center">Status Pesanan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#E0E0E0]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 space-y-2">
                    <p className="text-sm">Tidak ada data konsumen yang sesuai dengan pencarian / filter.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setPackageFilter('all');
                      }}
                      className="text-[#D4AF37] hover:underline text-xs cursor-pointer font-mono"
                    >
                      Hapus Filter Pencarian
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const waLink = generateClientConfirmationWhatsAppLink(order);
                  const isUpcoming24h = isOrderWithin24Hours(order);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        isUpcoming24h ? 'bg-amber-950/15 border-l-2 border-l-amber-500' : ''
                      }`}
                    >
                      
                      {/* ID & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#D4AF37]">{order.id}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>

                      {/* Consumer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-xs sm:text-sm">{order.clientName}</div>
                        <div className="flex items-center gap-1 text-gray-400 text-[11px] mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-[#D4AF37]" />
                          <span>{order.phone}</span>
                        </div>
                        {order.email && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{order.email}</div>
                        )}
                      </td>

                      {/* Package & Addons */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-medium text-white line-clamp-1">{order.packageName}</div>
                        {order.addOnsTotal > 0 ? (
                          <div className="text-[10px] text-[#D4AF37] line-clamp-1 mt-0.5">
                            + {order.addOnsText}
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-600 font-mono">Tanpa Add-on</div>
                        )}
                      </td>

                      {/* Schedule & Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.hasSecondSession && order.sessionDate2 ? (
                          <div className="space-y-1.5">
                            <div>
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="px-1.5 py-0.2 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] font-mono font-bold uppercase">
                                  Sesi 1
                                </span>
                                <span className="text-xs text-white font-medium">{order.sessionDate}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono pl-0.5 mt-0.5 truncate max-w-[190px]">
                                {order.sessionTime} • {order.locationAddress}
                              </div>
                            </div>
                            <div className="pt-1 border-t border-white/10">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-mono font-bold uppercase">
                                  Sesi 2
                                </span>
                                <span className="text-xs text-cyan-200 font-medium">{order.sessionDate2}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono pl-0.5 mt-0.5 truncate max-w-[190px]">
                                {order.sessionTime2 || '-'} • {order.locationAddress2 || '-'}
                              </div>
                            </div>
                            {isUpcoming24h && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[9px] font-mono font-bold animate-pulse">
                                <Timer className="w-2.5 h-2.5 text-amber-400" />
                                <span>Sesi &lt; 24 Jam</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-200 flex items-center gap-1 font-mono">
                              <CalendarCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{order.sessionDate}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[170px]">
                              {order.sessionTime} • {order.locationAddress}
                            </div>
                            {isUpcoming24h && (
                              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[9px] font-mono font-bold mt-1 animate-pulse">
                                <Timer className="w-2.5 h-2.5 text-amber-400" />
                                <span>Sesi &lt; 24 Jam</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-serif font-bold text-[#D4AF37] text-sm">
                          {formatRupiah(order.totalPrice)}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">{order.paymentPreference}</div>
                        {order.paymentProofUrl && (
                          <button
                            type="button"
                            onClick={() => setDetailOrder(order)}
                            className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 mt-1 cursor-pointer hover:bg-emerald-900/50"
                            title="Klik untuk melihat bukti transfer pembayaran yang diunggah konsumen"
                          >
                            <FileCheck className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Bukti DP/Lunas</span>
                          </button>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          disabled={!order.paymentProofUrl && order.status === 'Menunggu Konfirmasi'}
                          title={!order.paymentProofUrl && order.status === 'Menunggu Konfirmasi' ? "Menunggu Bukti Transfer dari Klien" : "Ubah status pesanan konsumen"}
                          className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold border focus:outline-none ${
                            !order.paymentProofUrl && order.status === 'Menunggu Konfirmasi'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          } ${getStatusBadgeClass(order.status)} bg-[#0A0A0A]`}
                          id={`status-select-${order.id}`}
                        >
                          <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                          <option value="Terkonfirmasi & Terjadwal">Terkonfirmasi & Terjadwal</option>
                          <option value="Proses Editing">Proses Editing</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                        {order.status === 'Selesai' && (
                          <div
                            className="text-[9px] text-purple-300 font-mono mt-1 flex items-center justify-center gap-1"
                            title="Pesanan Selesai otomatis dihapus dari database setelah 30 hari (1 bulan)"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {(() => {
                                const refDateStr = order.completedAt || order.updatedAt || order.sessionDate || order.createdAt;
                                const refTime = new Date(refDateStr).getTime();
                                if (isNaN(refTime)) return 'Auto-hapus 30 hari';
                                const daysPassed = Math.floor((Date.now() - refTime) / (1000 * 60 * 60 * 24));
                                const daysLeft = Math.max(0, 30 - daysPassed);
                                return `Hapus dlm ${daysLeft} hr`;
                              })()}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Detail Button */}
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="p-1.5 bg-[#0A0A0A] hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title="Lihat Rincian Lengkap"
                            id={`btn-detail-order-${order.id}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp Direct Chat */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-[#0A0A0A] hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40 transition-colors cursor-pointer"
                            title="Kirim Konfirmasi WA ke Klien"
                            id={`btn-wa-order-${order.id}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete Record */}
                          <button
                            onClick={() => setOrderToDelete(order)}
                            className="p-1.5 bg-[#0A0A0A] hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                            title="Hapus Data Konsumen"
                            id={`btn-del-order-${order.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info banner for Excel */}
      <div className="p-4 bg-[#141414] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <FileSpreadsheet className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>
            Data konsumen di atas kompatibel langsung dengan Microsoft Excel, Google Sheets, dan format spreadsheet standar (.xlsx & .csv).
          </span>
        </div>
        <button
          onClick={handleExportExcel}
          className="px-3.5 py-1.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-black font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer"
        >
          Download Excel Sekarang
        </button>
      </div>
      </>
      )}

      {/* Modal: Client Detail View */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#141414] border border-[#D4AF37]/60 p-6 sm:p-7 shadow-2xl text-[#E0E0E0] max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setDetailOrder(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pr-8">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30">
                  {detailOrder.id}
                </span>
                <select
                  value={detailOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    onUpdateOrderStatus(detailOrder.id, newStatus);
                    setDetailOrder({
                      ...detailOrder,
                      status: newStatus,
                      completedAt: newStatus === 'Selesai' ? (detailOrder.completedAt || new Date().toISOString()) : undefined,
                    });
                  }}
                  disabled={!detailOrder.paymentProofUrl && detailOrder.status === 'Menunggu Konfirmasi'}
                  title={!detailOrder.paymentProofUrl && detailOrder.status === 'Menunggu Konfirmasi' ? "Menunggu Bukti Transfer dari Klien" : "Ubah status pesanan"}
                  className={`px-2.5 py-1 text-xs font-mono font-bold border focus:outline-none ${
                    !detailOrder.paymentProofUrl && detailOrder.status === 'Menunggu Konfirmasi'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  } ${getStatusBadgeClass(detailOrder.status)} bg-[#0A0A0A]`}
                  id={`modal-status-select-${detailOrder.id}`}
                >
                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                  <option value="Terkonfirmasi & Terjadwal">Terkonfirmasi & Terjadwal</option>
                  <option value="Proses Editing">Proses Editing</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            {detailOrder.status === 'Selesai' && (
              <div className="mb-4 text-xs text-purple-300 bg-purple-950/40 border border-purple-500/30 p-2.5 flex items-start gap-2">
                <Clock className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold block text-purple-200">Pembersihan Otomatis 1 Bulan (30 Hari):</span>
                  <span className="text-gray-300 text-[11px]">
                    Pesanan dengan status <strong>Selesai</strong> akan otomatis dihapus permanen dari database sistem setelah 30 hari (1 bulan) sejak status diselesaikan.
                  </span>
                </div>
              </div>
            )}

            <h3 className="text-xl font-serif font-bold text-white">
              {detailOrder.clientName}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Daftar pada: {new Date(detailOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
            </p>

            <div className="mt-6 space-y-4 text-xs border-t border-white/10 pt-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0A0A0A] border border-white/10">
                  <span className="text-[10px] text-gray-500 uppercase font-mono block">No. WhatsApp:</span>
                  <span className="font-semibold text-white font-mono">{detailOrder.phone}</span>
                </div>
                <div className="p-3 bg-[#0A0A0A] border border-white/10">
                  <span className="text-[10px] text-gray-500 uppercase font-mono block">Email:</span>
                  <span className="font-semibold text-white">{detailOrder.email || '-'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#0A0A0A] border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Paket:</span>
                  <span className="font-bold text-white">{detailOrder.packageName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Harga Paket:</span>
                  <span className="text-[#D4AF37] font-serif">{formatRupiah(detailOrder.packagePrice)}</span>
                </div>
                {detailOrder.addOnsTotal > 0 && (
                  <div className="flex justify-between items-center pt-1 border-t border-white/10">
                    <span className="text-gray-400">Add-ons ({detailOrder.addOnsText}):</span>
                    <span className="text-[#D4AF37] font-serif">+{formatRupiah(detailOrder.addOnsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold">
                  <span className="text-white">Total Biaya ({detailOrder.paymentPreference}):</span>
                  <span className="text-base font-serif text-[#D4AF37]">{formatRupiah(detailOrder.totalPrice)}</span>
                </div>
                {detailOrder.status?.toLowerCase() === 'selesai' && (() => {
                  const isLunasPref = detailOrder.paymentPreference === 'Lunas';
                  const isDP30Pref = detailOrder.paymentPreference === 'DP 30%';
                  const dpRatioPref = isLunasPref ? 1.0 : (isDP30Pref ? 0.3 : 0.5);
                  const dpAmtPref = Math.round(detailOrder.totalPrice * dpRatioPref);
                  const remainingPref = isLunasPref ? 0 : Math.max(0, detailOrder.totalPrice - dpAmtPref);
                  return (
                    <div className="pt-2 mt-2 border-t border-white/10 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center text-gray-400">
                        <span>Telah Dibayar (DP Awal - {detailOrder.paymentPreference}):</span>
                        <span className="text-gray-200">- {formatRupiah(dpAmtPref)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400 font-bold p-2 bg-emerald-950/30 border border-emerald-500/30">
                        <span>Sisa Tagihan Pelunasan:</span>
                        <span className="font-serif text-sm">{formatRupiah(remainingPref)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-3.5 bg-[#0A0A0A] border border-white/10 space-y-2">
                <div className="text-gray-400 font-mono text-[10px] uppercase">Jadwal & Lokasi Sesi:</div>
                <div className="p-2 bg-[#141414] border border-white/5 space-y-1">
                  <div className="text-xs font-bold text-[#D4AF37] font-mono">Acara Pertama (Sesi 1):</div>
                  <div className="text-white font-medium">📅 {formatDateIndonesian(detailOrder.sessionDate)} ({detailOrder.sessionTime})</div>
                  <div className="text-gray-300 text-[11px]">📍 {detailOrder.locationType?.toUpperCase()} - {detailOrder.locationAddress}</div>
                  {detailOrder.notes && (
                    <div className="text-gray-400 text-[11px] italic pt-1 border-t border-white/5">
                      Catatan: {detailOrder.notes}
                    </div>
                  )}
                </div>

                {detailOrder.hasSecondSession && detailOrder.sessionDate2 && (
                  <div className="p-2 bg-[#141414] border border-cyan-500/30 space-y-1 mt-2">
                    <div className="text-xs font-bold text-cyan-400 font-mono">Acara Kedua (Sesi 2):</div>
                    <div className="text-white font-medium">📅 {formatDateIndonesian(detailOrder.sessionDate2)} ({detailOrder.sessionTime2})</div>
                    <div className="text-gray-300 text-[11px]">📍 {detailOrder.locationType2?.toUpperCase()} - {detailOrder.locationAddress2}</div>
                    {detailOrder.notes2 && (
                      <div className="text-gray-400 text-[11px] italic pt-1 border-t border-white/5">
                        Catatan: {detailOrder.notes2}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Proof Verification Section */}
              {detailOrder.paymentProofUrl ? (
                <div className="p-3.5 bg-gradient-to-br from-amber-950/20 to-black border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-amber-300 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Bukti Transfer ({detailOrder.paymentProofType || 'DP / Pelunasan'})</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {detailOrder.paymentProofUploadedAt
                        ? new Date(detailOrder.paymentProofUploadedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Baru saja'}
                    </span>
                  </div>

                  {detailOrder.paymentProofBank && (
                    <div className="text-[11px] text-gray-300 font-mono">
                      <span className="text-gray-500">Tujuan:</span> {detailOrder.paymentProofBank}
                    </div>
                  )}

                  {detailOrder.paymentProofNote && (
                    <div className="text-[11px] text-gray-300 bg-black/50 p-2 border border-white/5">
                      <span className="text-gray-500 font-mono text-[10px] uppercase block">Catatan Pengirim:</span>
                      <span>{detailOrder.paymentProofNote}</span>
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setViewingProofUrl(detailOrder.paymentProofUrl || null)}
                      className="block w-full group relative overflow-hidden border border-white/10 bg-black max-h-48 cursor-pointer"
                    >
                      <img
                        src={detailOrder.paymentProofUrl}
                        alt="Bukti Transfer"
                        className="w-full h-40 object-contain mx-auto group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-mono text-white transition-opacity">
                        Klik untuk Buka Ukuran Penuh
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/[0.02] border border-white/10 text-xs text-gray-500 font-mono flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500/70 shrink-0" />
                  <span>Konsumen belum mengunggah foto bukti transfer DP/Pelunasan.</span>
                </div>
              )}

              {/* Quick Confirm Payment Proof Button for Admin */}
              {detailOrder.status === 'Menunggu Konfirmasi' && detailOrder.paymentProofUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOrderStatus(detailOrder.id, 'Terkonfirmasi & Terjadwal');
                    setDetailOrder({
                      ...detailOrder,
                      status: 'Terkonfirmasi & Terjadwal',
                    });
                    toast.success('Bukti transfer telah diverifikasi!', 'Status pesanan berhasil diubah menjadi Terkonfirmasi & Terjadwal.');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                  id="btn-admin-quick-confirm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Ubah Status Jadi Terkonfirmasi</span>
                </button>
              )}

              {/* Google Drive Photo Deliverables Cloud Section */}
              <div className="p-4 bg-gradient-to-br from-[#161616] via-[#111111] to-[#0A0A0A] border border-[#D4AF37]/40 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
                      <HardDrive className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <span className="font-semibold text-white uppercase text-[11px] font-mono tracking-wider">
                        Google Drive Cloud Foto
                      </span>
                    </div>
                  </div>
                  {detailOrder.driveFolderUrl ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Link Aktif Terhubung
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">
                      Belum Ada Link
                    </span>
                  )}
                </div>

                {/* Previously Saved Link Box with Delete & Actions */}
                {detailOrder.driveFolderUrl && (
                  <div className="p-3 bg-black/60 border border-emerald-500/20 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 mb-1">
                          <Link2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>Link Tersimpan Saat Ini:</span>
                        </div>
                        <a
                          href={detailOrder.driveFolderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs font-mono text-[#D4AF37] hover:text-white truncate hover:underline"
                          title={detailOrder.driveFolderUrl}
                        >
                          {detailOrder.driveFolderUrl}
                        </a>
                      </div>
                    </div>

                    {confirmDeleteLinkId === detailOrder.id ? (
                      <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Yakin hapus tautan Google Drive ini?</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleExecuteDeleteDriveLink(detailOrder)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] uppercase tracking-wider cursor-pointer shadow transition-all"
                            id={`btn-confirm-delete-drive-${detailOrder.id}`}
                          >
                            Ya, Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteLinkId(null)}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-gray-300 text-[11px] uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                        <a
                          href={detailOrder.driveFolderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-medium border border-[#D4AF37]/30 transition-colors"
                          id={`btn-open-drive-${detailOrder.id}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka Folder</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyDriveLink(detailOrder.driveFolderUrl!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/15 text-gray-200 text-[11px] font-medium border border-white/15 transition-colors cursor-pointer"
                          id={`btn-copy-drive-${detailOrder.id}`}
                        >
                          {isCopiedDriveLink ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin Link</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteLinkId(detailOrder.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-[11px] font-medium border border-rose-500/30 transition-colors cursor-pointer ml-auto"
                          id={`btn-delete-drive-${detailOrder.id}`}
                          title="Hapus tautan Google Drive dari pesanan ini"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                          <span>Hapus Link</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit / Update / Input Link Section */}
                <div className="space-y-1.5">
                  <label className="block text-gray-300 font-mono text-[10px] uppercase tracking-wider">
                    {detailOrder.driveFolderUrl ? 'Perbarui / Ganti Link Folder Google Drive:' : 'Masukkan Link Folder Google Drive Baru:'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={driveLinkInput}
                        onChange={(e) => setDriveLinkInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveOrUpdateDriveLink(detailOrder);
                          }
                        }}
                        id={`drive-input-${detailOrder.id}`}
                        className="w-full pl-3 pr-8 py-2 bg-black border border-white/15 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                      />
                      {driveLinkInput && (
                        <button
                          type="button"
                          onClick={() => setDriveLinkInput('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
                          title="Kosongkan input"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSaveOrUpdateDriveLink(detailOrder)}
                      className="px-3.5 py-2 bg-gold-metallic hover:opacity-90 text-black font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all shrink-0 flex items-center gap-1.5"
                      id={`btn-save-drive-${detailOrder.id}`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{detailOrder.driveFolderUrl ? 'Perbarui Link' : 'Simpan Link'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">
                    *Tautan yang disimpan otomatis disinkronkan ke cloud dan dapat diakses klien melalui Portal Konsumen.
                  </p>
                </div>

                {detailOrder.driveFolderUrl && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-gray-400">Klien dapat mengunduh langsung dari Portal Konsumen.</p>
                    <a
                      href={generateClientDeliveryWhatsAppLink(detailOrder)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider cursor-pointer transition-colors shrink-0 shadow-md"
                      id={`btn-wa-delivery-${detailOrder.id}`}
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Kirim ke WA Klien</span>
                    </a>
                  </div>
                )}
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3 no-print">
              {(detailOrder.status === 'Menunggu Konfirmasi' || detailOrder.status === 'Terkonfirmasi & Terjadwal') && (
                <button
                  type="button"
                  onClick={() => {
                    setReminderOrder(detailOrder);
                    setIsReminderModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#b08d28] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  id={`btn-wa-reminder-${detailOrder.id}`}
                  title="Kirim pesan pengingat ke WhatsApp klien"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Kirim Pengingat</span>
                </button>
              )}

              {detailOrder.status === 'Selesai' ? (
                <a
                  href={generateClientCompletionWhatsAppLink(detailOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-[#25D366] hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  id={`btn-wa-completion-${detailOrder.id}`}
                  title="Kirim pesan konfirmasi pesanan selesai ke WhatsApp klien"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Hubungi Saat Selesai</span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 bg-white/5 text-gray-500 border border-white/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                  id={`btn-wa-completion-disabled-${detailOrder.id}`}
                  title="Tombol ini hanya aktif jika status pesanan adalah 'Selesai'"
                >
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span>Hubungi Saat Selesai (Nonaktif)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => printOrDownloadReceipt(detailOrder, studioConfig)}
                className="px-4 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                id={`modal-btn-print-order-${detailOrder.id}`}
                title="Cetak nota atau simpan sebagai PDF (Ukuran A5 / Setengah A4)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak (A5)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadReceiptPDFFile(detailOrder, studioConfig)}
                className="px-3.5 py-2.5 bg-[#0A0A0A] hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                id={`modal-btn-download-order-${detailOrder.id}`}
                title="Unduh nota digital sebagai file HTML/PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
              <button
                onClick={() => setOrderToDelete(detailOrder)}
                className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Hapus Data Booking Ini"
                id={`modal-btn-del-order-${detailOrder.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
              <button
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>

          {/* Dedicated 1-Page Printable Receipt (Only visible during print / PDF generation) */}
          <PrintableReceipt
            order={detailOrder}
            studioConfig={studioConfig}
            className="hidden print:block"
          />
        </div>
      )}

      
      
      {/* FULLSCREEN IMAGE VIEWER MODAL */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-[#141414] border border-[#D4AF37]/50 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold uppercase text-[#D4AF37] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Pratinjau Bukti Transfer</span>
              </span>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="p-1 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={viewingProofUrl}
                alt="Bukti Transfer Pembayaran"
                className="max-h-[75vh] max-w-full object-contain"
              />
            </div>
            <div className="text-right pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setViewingProofUrl(null)}
                className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-white/10 text-white text-xs uppercase font-mono cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Reminder Message */}
      {isReminderModalOpen && reminderOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37]/60 p-6 shadow-2xl text-[#E0E0E0]">
            <button
              onClick={() => {
                setIsReminderModalOpen(false);
                setIsCopiedReminder(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Kirim Pengingat WhatsApp
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  ID: {reminderOrder.id} • {reminderOrder.clientName}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                  Template Pesan Otomatis
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    className="w-full h-48 p-3 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs sm:text-sm focus:border-[#D4AF37] focus:outline-none resize-none"
                    value={generateClientReminderMessage(reminderOrder)}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateClientReminderMessage(reminderOrder));
                      setIsCopiedReminder(true);
                      setTimeout(() => setIsCopiedReminder(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-[#1f1f1f] border border-white/10 text-gray-300 hover:text-white hover:border-white/30 transition-colors"
                    title="Salin Teks"
                  >
                    {isCopiedReminder ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReminderModalOpen(false);
                    setIsCopiedReminder(false);
                  }}
                  className="flex-1 py-3 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <a
                  href={generateClientReminderWhatsAppLink(reminderOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 bg-[#25D366] hover:bg-emerald-400 text-black border border-transparent text-xs uppercase tracking-wider font-bold text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  onClick={() => setIsReminderModalOpen(false)}
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  Kirim ke WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Client / Booking */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/60 p-6 sm:p-7 shadow-2xl text-[#E0E0E0] max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-light text-white mb-1">
              Tambah Data <span className="italic font-serif text-[#D4AF37]">Konsumen Manual</span>
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              Gunakan formulir ini untuk mencatat konsumen offline atau reservasi via telepon ke dalam database. Mendukung pilihan 1 atau 2 acara.
            </p>

            <form onSubmit={handleManualAddSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Nama Lengkap Konsumen *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Maya & Dimas"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                    Pilih Paket Foto (Dikelompokkan Tiap Kategori) *
                  </label>
                  <select
                    value={manualPkgId}
                    onChange={(e) => setManualPkgId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer font-sans"
                  >
                    {(() => {
                      const catMap = new Map<string, PhotoPackage[]>();
                      packages.forEach((pkg) => {
                        const cat = (pkg.category || 'other').toLowerCase();
                        if (!catMap.has(cat)) catMap.set(cat, []);
                        catMap.get(cat)!.push(pkg);
                      });

                      return Array.from(catMap.entries()).map(([catId, items]) => (
                        <optgroup
                          key={catId}
                          label={`${getCategoryIcon(catId)} ${getCategoryLabel(catId).toUpperCase()} (${items.length} Paket)`}
                          className="bg-[#141414] text-[#D4AF37] font-bold"
                        >
                          {items.map((p) => (
                            <option key={p.id} value={p.id} className="bg-[#0A0A0A] text-white font-normal py-1">
                              {p.name} — {formatRupiah(p.price)} ({p.duration})
                            </option>
                          ))}
                        </optgroup>
                      ));
                    })()}
                  </select>
                </div>

                {/* Add-ons Selector */}
                {addons.length > 0 && (
                  <div className="sm:col-span-2 p-3 bg-[#0A0A0A] border border-white/10">
                    <label className="block text-[#D4AF37] uppercase tracking-widest text-[10px] font-mono mb-2 font-bold">
                      Pilih Layanan Tambahan (Add-Ons):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {addons.map((a) => {
                        const isChecked = manualAddonIds.includes(a.id);
                        return (
                          <label
                            key={a.id}
                            className={`flex items-center gap-2 p-2 border text-[11px] cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                                : 'bg-[#141414] border-white/5 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setManualAddonIds([...manualAddonIds, a.id]);
                                } else {
                                  setManualAddonIds(manualAddonIds.filter((id) => id !== a.id));
                                }
                              }}
                              className="accent-[#D4AF37]"
                            />
                            <div className="truncate">
                              <span className="font-semibold block truncate">{a.name}</span>
                              <span className="text-[#D4AF37] font-mono text-[10px]">+{formatRupiah(a.price)}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PILIHAN BERAPA ACARA / SESI */}
                <div className="sm:col-span-2 p-3 bg-[#0D0D0D] border border-white/15 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white font-mono block">
                        Pilihan Jumlah Acara / Sesi:
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Sesuaikan untuk paket 1 sesi tunggal atau paket wedding 2 acara (beda hari/jam)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setManualHasSecondSession(false)}
                        className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                          !manualHasSecondSession
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                        }`}
                      >
                        1 Acara (Sesi Tunggal)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualHasSecondSession(true);
                          if (!manualDate2) {
                            setManualDate2(manualDate || new Date().toISOString().split('T')[0]);
                          }
                        }}
                        className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                          manualHasSecondSession
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'
                        }`}
                      >
                        2 Acara (Beda Tanggal & Jam)
                      </button>
                    </div>
                  </div>

                  {/* ================= ACARA PERTAMA (SESI 1) ================= */}
                  <div className="p-3 bg-[#141414] border border-[#D4AF37]/30 space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                        Acara Pertama (Sesi 1 Utama)
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono font-bold uppercase">
                        Wajib
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                          Tanggal Rencana Sesi 1 *
                        </label>
                        <input
                          type="date"
                          required
                          value={manualDate}
                          onChange={(e) => setManualDate(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                          Waktu Sesi 1 / Jam Acara *
                        </label>
                        <AnimatedClockPicker
                          value={manualTime}
                          onChange={(t) => setManualTime(t)}
                          isSlotUnavailable={Boolean(checkScheduleSlotConflict(manualDate || new Date().toISOString().split('T')[0], manualTime, orders))}
                          conflictReason={checkScheduleSlotConflict(manualDate || new Date().toISOString().split('T')[0], manualTime, orders)?.conflictReason}
                          bookedTimes={getBookedTimeWindowsForDate(manualDate || new Date().toISOString().split('T')[0], orders).map(w => w.windowLabel)}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                          Tipe Tempat Pemotretan 1:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'studio', label: 'Studio Dimensi' },
                            { id: 'outdoor', label: 'Outdoor / Alam' },
                            { id: 'venue', label: 'Gedung / Klien' },
                          ].map((loc) => (
                            <button
                              type="button"
                              key={loc.id}
                              onClick={() => handleManualLocationTypeChange(loc.id as any)}
                              className={`py-1.5 px-2 text-[11px] uppercase tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                                manualLocationType === loc.id
                                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                  : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                              }`}
                            >
                              {loc.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                          Detail Alamat Lokasi Sesi 1 *
                        </label>
                        <input
                          type="text"
                          required
                          value={manualLocation}
                          onChange={(e) => setManualLocation(e.target.value)}
                          placeholder="Contoh: Dimensi Photo Studio / Jl. Merdeka No. 12"
                          className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                          Catatan Khusus / Konsep Foto Sesi 1
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Catatan konsep, tema busana, prosesi..."
                          value={manualNotes}
                          onChange={(e) => setManualNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ================= ACARA KEDUA (SESI 2) ================= */}
                  {manualHasSecondSession && (
                    <div className="p-3 bg-[#141414] border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                          Acara Kedua (Sesi 2 - Beda Tanggal & Jam)
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono font-bold uppercase">
                          Sesi 2 Aktif
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                            Tanggal Rencana Sesi 2 *
                          </label>
                          <input
                            type="date"
                            required={manualHasSecondSession}
                            value={manualDate2}
                            onChange={(e) => setManualDate2(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                            Waktu Sesi 2 / Jam Acara *
                          </label>
                          <AnimatedClockPicker
                            value={manualTime2}
                            onChange={(t) => setManualTime2(t)}
                            isSlotUnavailable={Boolean(checkScheduleSlotConflict(manualDate2 || manualDate || new Date().toISOString().split('T')[0], manualTime2, orders))}
                            conflictReason={checkScheduleSlotConflict(manualDate2 || manualDate || new Date().toISOString().split('T')[0], manualTime2, orders)?.conflictReason}
                            bookedTimes={getBookedTimeWindowsForDate(manualDate2 || manualDate || new Date().toISOString().split('T')[0], orders).map(w => w.windowLabel)}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                            Tipe Tempat Pemotretan 2:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'studio', label: 'Studio Dimensi' },
                              { id: 'outdoor', label: 'Outdoor / Alam' },
                              { id: 'venue', label: 'Gedung / Klien' },
                            ].map((loc) => (
                              <button
                                type="button"
                                key={loc.id}
                                onClick={() => handleManualLocationType2Change(loc.id as any)}
                                className={`py-1.5 px-2 text-[11px] uppercase tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                                  manualLocationType2 === loc.id
                                    ? 'bg-cyan-500 text-black border-cyan-400'
                                    : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                }`}
                              >
                                {loc.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                            Detail Alamat Lokasi Sesi 2 *
                          </label>
                          <input
                            type="text"
                            required={manualHasSecondSession}
                            value={manualLocation2}
                            onChange={(e) => setManualLocation2(e.target.value)}
                            placeholder="Contoh: Ballroom Hotel Grand Sahid / Gedung Resepsi"
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">
                            Catatan Khusus / Konsep Foto Sesi 2
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Catatan resepsi, tema busana kedua, dekorasi..."
                            value={manualNotes2}
                            onChange={(e) => setManualNotes2(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Status Awal</label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                    <option value="Terkonfirmasi & Terjadwal">Terkonfirmasi & Terjadwal</option>
                    <option value="Proses Editing">Proses Editing</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Metode Bayar</label>
                  <select
                    value={manualPayment}
                    onChange={(e) => setManualPayment(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    <option value="DP 30%">DP 30%</option>
                    <option value="DP 50%">DP 50%</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                </div>

                <div className="sm:col-span-2 p-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[11px] text-[#D4AF37] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>
                    {manualStatus === 'Terkonfirmasi & Terjadwal'
                      ? 'Pesanan dengan status "Terkonfirmasi & Terjadwal" akan langsung aktif di data konsumen tanpa memerlukan upload bukti transfer.'
                      : `Status "${manualStatus}" dapat langsung dikelola dan aktif di data konsumen.`}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.18em] transition-colors cursor-pointer"
                >
                  Simpan Data Konsumen
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-3 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation for Consumer Order */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141414] border border-rose-500/40 w-full max-w-md p-6 text-center shadow-2xl relative text-[#E0E0E0]">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h4 className="text-lg font-serif font-bold text-white mb-2">
              Hapus Data Konsumen?
            </h4>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pemesanan konsumen berikut secara permanen dari database?
            </p>

            <div className="p-3.5 bg-[#0A0A0A] border border-white/10 text-left space-y-1.5 mb-6 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>ID Booking:</span>
                <span className="text-[#D4AF37] font-bold">{orderToDelete.id}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Nama Konsumen:</span>
                <span className="font-bold text-white">{orderToDelete.clientName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Paket Foto:</span>
                <span className="text-white truncate max-w-[200px]">{orderToDelete.packageName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Jadwal Sesi:</span>
                <span className="text-white">{formatDateIndonesian(orderToDelete.sessionDate)} ({orderToDelete.sessionTime})</span>
              </div>
              <div className="flex justify-between text-gray-300 pt-1.5 border-t border-white/10 font-bold">
                <span className="text-gray-400">Total Biaya:</span>
                <span className="text-[#D4AF37]">{formatRupiah(orderToDelete.totalPrice)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 bg-[#1A1A1A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
                id="btn-confirm-delete-order"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation for Review */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141414] border border-rose-500/40 w-full max-w-md p-6 text-center shadow-2xl relative text-[#E0E0E0]">
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h4 className="text-lg font-serif font-bold text-white mb-2">
              Hapus Ulasan Klien?
            </h4>

            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus ulasan dari konsumen berikut secara permanen?
            </p>

            <div className="p-3.5 bg-[#0A0A0A] border border-white/10 text-left space-y-1.5 mb-6 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Nama Klien:</span>
                <span className="font-bold text-white">{reviewToDelete.clientName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Paket:</span>
                <span className="text-white truncate max-w-[200px]">{reviewToDelete.packageName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span className="text-gray-400">Rating:</span>
                <span className="text-[#D4AF37] font-bold">★ {reviewToDelete.rating || 5}.0</span>
              </div>
              <div className="pt-1.5 border-t border-white/10 text-gray-400">
                <span className="block mb-1">Isi Ulasan:</span>
                <span className="text-gray-200 italic font-sans block bg-black/50 p-2 border border-white/5 line-clamp-3">
                  "{reviewToDelete.review || 'Tanpa komentar teks.'}"
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                className="flex-1 py-2.5 bg-[#1A1A1A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
                id="btn-confirm-delete-review"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Ulasan</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
