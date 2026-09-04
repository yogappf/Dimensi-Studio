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
import { formatRupiah, formatDateIndonesian, generateWhatsAppLink, generateClientDeliveryWhatsAppLink, generateClientConfirmationWhatsAppLink, generateClientCompletionWhatsAppLink, generateClientReminderMessage, generateClientReminderWhatsAppLink } from '../utils/formatters';
import { exportOrdersToExcel, exportOrdersToCSV } from '../utils/excelExport';
import { PackageManager } from './PackageManager';
import { AddonManager } from './AddonManager';
import { PortfolioManager } from './PortfolioManager';
import { DriveManager } from './DriveManager';
import { MasterAdminManager } from './MasterAdminManager';
import { PrintableReceipt } from './PrintableReceipt';
import { printOrDownloadReceipt, downloadReceiptPDFFile } from '../utils/receiptPrinter';
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
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('10:00 WIB');
  const [manualLocation, setManualLocation] = useState('Studio Dimensi');
  const [manualNotes, setManualNotes] = useState('');
  const [manualStatus, setManualStatus] = useState<OrderStatus>('Terkonfirmasi & Terjadwal');
  const [manualPayment, setManualPayment] = useState<'DP 30%' | 'DP 50%' | 'Lunas'>('DP 50%');

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
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
      setTimeout(() => setExportSuccessMsg(''), 4000);
    }
  };

  const handleExportCSV = () => {
    const success = exportOrdersToCSV(filteredOrders);
    if (success) {
      setExportSuccessMsg(`Berhasil mengekspor ${filteredOrders.length} data konsumen ke file CSV`);
      setTimeout(() => setExportSuccessMsg(''), 4000);
    }
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      alert('Nama dan nomor telepon wajib diisi.');
      return;
    }

    const pkg = packages.find((p) => p.id === manualPkgId) || packages[0] || PHOTO_PACKAGES[0];
    const selectedAddons = addons.filter((a) => manualAddonIds.includes(a.id));
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

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
      sessionDate: manualDate || todayStr,
      sessionTime: manualTime,
      locationType: 'studio',
      locationAddress: manualLocation,
      notes: manualNotes.trim(),
      status: manualStatus,
      completedAt: manualStatus === 'Selesai' ? new Date().toISOString() : undefined,
      paymentPreference: manualPayment,
    };

    onAddManualOrder(newOrder);
    setIsAddModalOpen(false);
    // Reset fields
    setManualName('');
    setManualPhone('');
    setManualEmail('');
    setManualNotes('');
    setManualAddonIds([]);
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
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                activeSubTab === 'orders'
                  ? 'bg-black/20 text-black border-black/30'
                  : 'bg-black/40 text-gray-400 border-white/10'
              }`}>
                {orders.length}
              </span>
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
                  ? 'bg-gradient-to-r from-[#D4AF37] to-amber-400 text-black border-[#D4AF37] font-bold shadow-xl ring-1 ring-[#D4AF37]'
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

        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
          <span>Menampilkan <strong className="text-[#D4AF37]">{filteredOrders.length}</strong> dari {orders.length} konsumen</span>
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
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                      
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
                        <div className="font-medium text-gray-200 flex items-center gap-1 font-mono">
                          <CalendarCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{order.sessionDate}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[170px]">
                          {order.sessionTime} • {order.locationAddress}
                        </div>
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

              <div className="p-3.5 bg-[#0A0A0A] border border-white/10 space-y-1.5">
                <div className="text-gray-400 font-mono text-[10px] uppercase">Jadwal & Lokasi:</div>
                <div className="text-white font-medium">📅 {formatDateIndonesian(detailOrder.sessionDate)} ({detailOrder.sessionTime})</div>
                <div className="text-gray-300">📍 {detailOrder.locationAddress}</div>
              </div>

              {detailOrder.notes && (
                <div className="p-3 bg-[#0A0A0A] border border-white/10">
                  <span className="text-gray-500 font-mono text-[10px] uppercase block mb-1">Catatan / Konsep Khusus:</span>
                  <p className="text-gray-300">{detailOrder.notes}</p>
                </div>
              )}

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
                    alert('Bukti transfer telah diverifikasi! Status pesanan berhasil diubah menjadi Terkonfirmasi & Terjadwal.');
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                  id="btn-admin-quick-confirm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verifikasi & Ubah Status Jadi Terkonfirmasi</span>
                </button>
              )}

              {/* Google Drive Photo Deliverables Cloud Section */}
              <div className="p-3.5 bg-gradient-to-br from-[#141414] to-[#0A0A0A] border border-[#D4AF37]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-semibold text-white uppercase text-[11px] font-mono">
                      Google Drive Cloud Foto
                    </span>
                  </div>
                  {detailOrder.driveFolderUrl ? (
                    <a
                      href={detailOrder.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka Folder Drive</span>
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-mono">Belum ada link folder</span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 font-mono text-[10px] mb-1">
                    Link Folder Google Drive (Hasil Foto Klien):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://drive.google.com/drive/folders/..."
                      defaultValue={detailOrder.driveFolderUrl || ''}
                      id={`drive-input-${detailOrder.id}`}
                      className="flex-1 px-3 py-1.5 bg-black border border-white/15 text-xs text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`drive-input-${detailOrder.id}`) as HTMLInputElement;
                        if (input && onUpdateOrder) {
                          const val = input.value.trim();
                          onUpdateOrder(detailOrder.id, { driveFolderUrl: val || undefined });
                          setDetailOrder({ ...detailOrder, driveFolderUrl: val || undefined });
                          alert('Link Google Drive berhasil diperbarui dan tersimpan ke Firebase Cloud!');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Simpan Link
                    </button>
                  </div>
                </div>

                {detailOrder.driveFolderUrl && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">Klien dapat mengunduh langsung dari Portal Konsumen.</p>
                    <a
                      href={generateClientDeliveryWhatsAppLink(detailOrder)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Kirim Link Drive ke WA Klien</span>
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
          <div className="relative w-full max-w-xl bg-[#141414] border border-[#D4AF37]/60 p-6 sm:p-7 shadow-2xl text-[#E0E0E0] max-h-[90vh] overflow-y-auto">
            
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
              Gunakan formulir ini untuk mencatat konsumen offline atau reservasi via telepon ke dalam database.
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
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Pilih Paket Foto *</label>
                  <select
                    value={manualPkgId}
                    onChange={(e) => setManualPkgId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatRupiah(p.price)}
                      </option>
                    ))}
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

                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Tanggal Sesi</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white font-mono focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Waktu Sesi</label>
                  <input
                    type="text"
                    placeholder="10:00 WIB"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Lokasi / Venue</label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
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

                <div className="sm:col-span-2">
                  <label className="block text-gray-400 uppercase tracking-widest text-[10px] font-mono mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    placeholder="Catatan konsep / permintaan khusus..."
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
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
