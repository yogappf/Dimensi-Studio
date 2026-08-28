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
import { formatRupiah, formatDateIndonesian, generateWhatsAppLink, generateClientDeliveryWhatsAppLink } from '../utils/formatters';
import { exportOrdersToExcel, exportOrdersToCSV } from '../utils/excelExport';
import { PackageManager } from './PackageManager';
import { AddonManager } from './AddonManager';
import { PortfolioManager } from './PortfolioManager';
import { DriveManager } from './DriveManager';
import { MasterAdminManager } from './MasterAdminManager';
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
} from 'lucide-react';

interface ConsumerDashboardProps {
  orders: BookingOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateOrder?: (orderId: string, updates: Partial<BookingOrder>) => void;
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
  onUpdateOrderStatus,
  onUpdateOrder,
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
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'packages' | 'addons' | 'portfolios' | 'drive' | 'master'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  
  // Modals state
  const [detailOrder, setDetailOrder] = useState<BookingOrder | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

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
        </div>

        {/* Action Buttons: Excel Export & Manual Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Cloud Sync Status */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-[#141414] border border-white/10 text-[11px] font-mono text-gray-300">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isFirebaseConnected ? 'Firebase Cloud Aktif' : 'Menghubungkan Cloud...'}</span>
          </div>

          {/* Google Auth Button */}
          {currentUser ? (
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
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="px-3.5 py-2.5 bg-[#141414] hover:border-[#D4AF37] text-gray-300 hover:text-[#D4AF37] border border-white/15 font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              id="dashboard-login-btn"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Google</span>
            </button>
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

          {/* Exit / Lock Admin Session */}
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="px-3 py-2.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isMasterAdmin ? 'Kunci & Keluar dari Panel Admin' : 'Kunci & Keluar dari Portal Staf'}
              id="btn-lock-admin"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{isMasterAdmin ? 'Keluar Admin' : 'Keluar Staf'}</span>
            </button>
          )}

        </div>
      </div>

      {/* Sub-tab Navigation (Konsumen vs Paket vs Add-On vs Portofolio vs Google Drive vs Master Admin) */}
      {isMasterAdmin ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'orders'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg'
                : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
            id="tab-orders-view"
          >
            <Users className="w-4 h-4" />
            <span>Data Konsumen ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('packages')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'packages'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg'
                : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
            id="tab-packages-view"
          >
            <Package className="w-4 h-4" />
            <span>📦 Master Paket ({packages.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('addons')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'addons'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg'
                : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
            id="tab-addons-view"
          >
            <Layers className="w-4 h-4" />
            <span>➕ Layanan Add-On ({addons.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('portfolios')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'portfolios'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg'
                : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
            id="tab-portfolios-view"
          >
            <ImageIcon className="w-4 h-4" />
            <span>🖼️ Portofolio Galeri ({portfolios.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('drive')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'drive'
                ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-lg'
                : 'bg-[#141414] text-gray-400 border-white/10 hover:text-white hover:border-white/30'
            }`}
            id="tab-drive-view"
          >
            <HardDrive className="w-4 h-4 text-[#D4AF37]" />
            <span>📁 Google Drive Cloud Foto</span>
          </button>

          {/* Master Admin Tab */}
          <button
            onClick={() => setActiveSubTab('master')}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ml-auto ${
              activeSubTab === 'master'
                ? 'bg-gradient-to-r from-[#D4AF37] to-amber-400 text-black border-[#D4AF37] font-bold shadow-xl ring-1 ring-[#D4AF37]/50'
                : 'bg-[#1c1708] text-[#D4AF37] border-[#D4AF37]/40 hover:bg-[#D4AF37]/20 hover:text-white'
            }`}
            id="tab-master-admin-view"
          >
            <Crown className="w-4 h-4 text-amber-900" />
            <span>👑 Master Admin & Profil</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-[#141414] border border-[#D4AF37]/40 text-xs font-mono text-gray-200">
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-semibold text-white">Mode Akses Staf Studio</span>
            <span className="text-gray-400">| Rekap Data Konsumen ({orders.length} Pesanan)</span>
          </div>
          <span className="text-[11px] font-mono text-gray-400">
            💡 Menu Master Paket, Profil Studio & Staf dikhususkan untuk Super Admin.
          </span>
        </div>
      )}

      {isMasterAdmin && activeSubTab === 'master' && (
        <MasterAdminManager
          currentUser={currentUser}
          isMasterAdmin={isMasterAdmin}
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

      {isMasterAdmin && activeSubTab === 'drive' && (
        <DriveManager
          orders={orders}
          onUpdateOrder={onUpdateOrder || (() => {})}
          currentUser={currentUser}
          onGoogleSignIn={onGoogleSignIn}
        />
      )}

      {isMasterAdmin && activeSubTab === 'packages' && (
        <PackageManager
          packages={packages}
          onAddPackage={onAddPackage}
          onUpdatePackage={onUpdatePackage}
          onDeletePackage={onDeletePackage}
          onResetPackages={onResetPackages}
          isFirebaseConnected={isFirebaseConnected}
        />
      )}

      {isMasterAdmin && activeSubTab === 'addons' && (
        <AddonManager
          addons={addons}
          onAddAddon={onAddAddon}
          onUpdateAddon={onUpdateAddon}
          onDeleteAddon={onDeleteAddon}
          onResetAddons={onResetAddons}
        />
      )}

      {isMasterAdmin && activeSubTab === 'portfolios' && (
        <PortfolioManager
          portfolios={portfolios}
          onAddPortfolio={onAddPortfolio}
          onUpdatePortfolio={onUpdatePortfolio}
          onDeletePortfolio={onDeletePortfolio}
          onResetPortfolios={onResetPortfolios}
        />
      )}

      {(!isMasterAdmin || activeSubTab === 'orders') && (
        <>
          {/* Export Success Notification Toast */}
      {exportSuccessMsg && (
        <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] text-xs sm:text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg('')} className="text-[#D4AF37] hover:text-white cursor-pointer">
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
                  const waLink = generateWhatsAppLink(order, STUDIO_INFO.whatsapp);
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
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold border focus:outline-none cursor-pointer ${getStatusBadgeClass(
                            order.status
                          )} bg-[#0A0A0A]`}
                          id={`status-select-${order.id}`}
                        >
                          <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                          <option value="Terkonfirmasi & Terjadwal">Terkonfirmasi & Terjadwal</option>
                          <option value="Proses Editing">Proses Editing</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
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
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus data booking ${order.clientName} (${order.id})?`)) {
                                onDeleteOrder(order.id);
                              }
                            }}
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

            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs px-2.5 py-1 bg-[#D4AF37]/15 text-[#D4AF37] font-bold border border-[#D4AF37]/30">
                {detailOrder.id}
              </span>
              <span className={`px-2.5 py-1 text-xs font-mono font-bold border ${getStatusBadgeClass(detailOrder.status)}`}>
                {detailOrder.status}
              </span>
            </div>

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

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3">
              <a
                href={generateWhatsAppLink(detailOrder, STUDIO_INFO.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-[#25D366] hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>Hubungi via WhatsApp</span>
              </a>
              <button
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Tutup
              </button>
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

    </div>
  );
};
