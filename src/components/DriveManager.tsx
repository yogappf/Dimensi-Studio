import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { BookingOrder, DriveFileItem } from '../types';
import {
  listDriveFiles,
  createDriveFolder,
  uploadFileToDrive,
  deleteDriveFile,
  createClientOrderFolderStructure,
} from '../services/googleDrive';
import { getCachedAccessToken } from '../firebase/services';
import {
  HardDrive,
  FolderPlus,
  UploadCloud,
  ExternalLink,
  Trash2,
  Search,
  RefreshCw,
  Folder,
  Image as ImageIcon,
  FileText,
  Video,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  Sparkles,
  Users,
  Send,
  Loader2,
  X,
  File,
} from 'lucide-react';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';

interface DriveManagerProps {
  orders: BookingOrder[];
  onUpdateOrder: (orderId: string, updates: Partial<BookingOrder>) => void;
  currentUser?: User | null;
  onGoogleSignIn?: () => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export const DriveManager: React.FC<DriveManagerProps> = ({
  orders,
  onUpdateOrder,
  currentUser,
  onGoogleSignIn,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'Google Drive Studio' }]);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchTerm] = useState<string>('');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'folders' | 'images' | 'others'>('all');

  // Modal States
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Delete Confirmation Modal (User Confirmation MANDATORY)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Client Order Auto-Folder Generator Modal
  const [isOrderGenOpen, setIsOrderGenOpen] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [isGeneratingStructure, setIsGeneratingStructure] = useState<boolean>(false);
  const [genSuccessMessage, setGenSuccessMessage] = useState<string | null>(null);

  // Toast
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Update token from cache if changed
  useEffect(() => {
    const token = getCachedAccessToken();
    setAccessToken(token);
  }, [currentUser]);

  // Load files when folder or token changes
  useEffect(() => {
    if (accessToken) {
      loadFiles(currentFolderId, searchQuery);
    }
  }, [accessToken, currentFolderId]);

  const loadFiles = async (folderId: string, search: string = '') => {
    if (!accessToken) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const items = await listDriveFiles(accessToken, folderId, search);
      setFiles(items);
    } catch (err: any) {
      console.error('Drive files load error:', err);
      setErrorMessage(err.message || 'Gagal memuat file dari Google Drive. Pastikan akun Google sudah terhubung.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadFiles(currentFolderId, searchQuery);
  };

  const handleNavigateToFolder = (folder: DriveFileItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setCurrentFolderId(target.id);
    setSearchTerm('');
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await createDriveFolder(accessToken, newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      await loadFiles(currentFolderId);
    } catch (err: any) {
      alert(`Gagal membuat folder: ${err.message}`);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUploadFiles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(`Mengunggah 0 dari ${selectedFiles.length} file...`);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(`Mengunggah file (${i + 1}/${selectedFiles.length}): ${selectedFiles[i].name}...`);
        await uploadFileToDrive(accessToken, selectedFiles[i], currentFolderId);
      }
      setSelectedFiles([]);
      setIsUploadOpen(false);
      await loadFiles(currentFolderId);
    } catch (err: any) {
      alert(`Gagal mengunggah file: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const confirmDeleteFile = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setFileToDelete(null);
      await loadFiles(currentFolderId);
    } catch (err: any) {
      alert(`Gagal menghapus file: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateClientFolder = async () => {
    if (!accessToken || !selectedOrderId) return;
    const targetOrder = orders.find((o) => o.id === selectedOrderId);
    if (!targetOrder) return;

    setIsGeneratingStructure(true);
    setGenSuccessMessage(null);

    try {
      const result = await createClientOrderFolderStructure(
        accessToken,
        targetOrder.clientName,
        targetOrder.id,
        targetOrder.packageName
      );

      // Save folder URL to order in Firestore and state
      onUpdateOrder(targetOrder.id, {
        driveFolderId: result.mainFolderId,
        driveFolderUrl: result.mainFolderUrl,
      });

      setGenSuccessMessage(
        `Berhasil membuat struktur folder untuk ${targetOrder.clientName}! Link folder Google Drive telah terhubung otomatis ke data pemesanan.`
      );
      
      // Reload current list if in root
      await loadFiles(currentFolderId);
    } catch (err: any) {
      alert(`Gagal membuat folder klien: ${err.message}`);
    } finally {
      setIsGeneratingStructure(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(`${label} disalin ke clipboard!`);
    setTimeout(() => setCopyToast(null), 3000);
  };

  const filteredFiles = files.filter((file) => {
    if (fileTypeFilter === 'folders') return file.isFolder;
    if (fileTypeFilter === 'images') return !file.isFolder && (file.mimeType.startsWith('image/') || file.thumbnailLink);
    if (fileTypeFilter === 'others') return !file.isFolder && !file.mimeType.startsWith('image/');
    return true;
  });

  const getFileIcon = (file: DriveFileItem) => {
    if (file.isFolder) return <Folder className="w-8 h-8 text-[#D4AF37]" />;
    if (file.mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-sky-400" />;
    if (file.mimeType.startsWith('video/')) return <Video className="w-8 h-8 text-emerald-400" />;
    if (file.mimeType.includes('pdf') || file.mimeType.includes('document')) return <FileText className="w-8 h-8 text-amber-400" />;
    return <File className="w-8 h-8 text-gray-400" />;
  };

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return '-';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#D4AF37] text-black font-semibold text-xs px-4 py-3 shadow-2xl rounded flex items-center gap-2 border border-black/20 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Header Info & Connection Card */}
      <div className="bg-[#141414] border border-white/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
                Google Drive Cloud Photo Hub
                <span className="text-[10px] font-sans px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-widest font-bold">
                  Official Integration
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Penyimpanan cloud terintegrasi untuk hasil foto resolusi tinggi, file RAW, dan pembagian link folder kepada konsumen.
              </p>
            </div>
          </div>
        </div>

        {/* Auth / Account Status */}
        <div className="flex items-center gap-3">
          {currentUser && accessToken ? (
            <div className="flex items-center gap-3 bg-[#0A0A0A] p-2 px-3 border border-emerald-500/30">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                  Drive Terhubung
                </span>
                <span className="text-xs text-gray-300 font-mono truncate max-w-[200px] block">
                  {currentUser.email}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              id="btn-connect-google-drive"
              className="px-4 py-2.5 bg-white text-gray-800 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all border border-gray-300 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Hubungkan Google Drive</span>
            </button>
          )}

          <button
            onClick={() => loadFiles(currentFolderId, searchQuery)}
            disabled={isLoading || !accessToken}
            className="p-2.5 bg-[#0A0A0A] border border-white/10 hover:border-white/30 text-gray-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Data Drive"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Action Bar for Photo Studio Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 1-Click Folder Generator for Client Order */}
        <div className="bg-[#141414] border border-[#D4AF37]/30 p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Otomatisasi Folder Klien</span>
            </div>
            <h3 className="text-white font-bold text-sm mb-1">Struktur Folder Pemesanan</h3>
            <p className="text-gray-400 text-xs mb-4">
              Buat folder utama + 4 subfolder foto otomatis (*Hi-Res, RAW, Cetak, Reels*) dan kaitkan langsung ke pesanan konsumen.
            </p>
          </div>
          <button
            onClick={() => setIsOrderGenOpen(true)}
            disabled={!accessToken}
            id="btn-open-order-generator"
            className="w-full py-2.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Generate Folder Pesanan</span>
          </button>
        </div>

        {/* Card 2: Create Custom Folder */}
        <div className="bg-[#141414] border border-white/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <Folder className="w-4 h-4" />
              <span>Folder Kustom</span>
            </div>
            <h3 className="text-white font-bold text-sm mb-1">Buat Folder Baru</h3>
            <p className="text-gray-400 text-xs mb-4">
              Buat folder arsip pemotretan khusus di direktori aktif saat ini untuk pengorganisasian studio.
            </p>
          </div>
          <button
            onClick={() => setIsCreateFolderOpen(true)}
            disabled={!accessToken}
            id="btn-open-create-folder"
            className="w-full py-2.5 bg-[#0A0A0A] border border-white/20 text-white font-bold text-xs uppercase tracking-wider hover:border-sky-400 hover:text-sky-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Folder Baru</span>
          </button>
        </div>

        {/* Card 3: Upload Photo/Files */}
        <div className="bg-[#141414] border border-white/10 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <UploadCloud className="w-4 h-4" />
              <span>Upload Hasil Foto</span>
            </div>
            <h3 className="text-white font-bold text-sm mb-1">Unggah ke Google Drive</h3>
            <p className="text-gray-400 text-xs mb-4">
              Upload foto resolusi tinggi, hasil edit, atau dokumen invoice langsung ke folder Google Drive studio.
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            disabled={!accessToken}
            id="btn-open-upload-files"
            className="w-full py-2.5 bg-[#0A0A0A] border border-white/20 text-white font-bold text-xs uppercase tracking-wider hover:border-emerald-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File / Foto</span>
          </button>
        </div>
      </div>

      {/* Client Orders with Linked Drive Folders Bar */}
      {orders.some((o) => o.driveFolderUrl) && (
        <div className="bg-[#141414] border border-[#D4AF37]/20 p-4">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Folder Google Drive Konsumen Aktif</span>
            </span>
            <span className="text-[11px] text-gray-400">
              {orders.filter((o) => o.driveFolderUrl).length} pesanan terhubung ke Google Drive
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orders
              .filter((o) => o.driveFolderUrl)
              .map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-[#0A0A0A] border border-white/10 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{order.clientName}</span>
                      <span className="text-[10px] font-mono text-[#D4AF37]">{order.id}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{order.packageName}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <a
                      href={order.driveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-semibold border border-[#D4AF37]/30 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Drive</span>
                    </a>
                    <button
                      onClick={() => copyToClipboard(order.driveFolderUrl!, `Link Drive ${order.clientName}`)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs transition-colors cursor-pointer"
                      title="Salin Link Google Drive"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {order.phone && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${order.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                          `Halo Kak ${order.clientName}, berikut kami kirimkan link folder Google Drive untuk hasil sesi foto ${order.packageName} dari Dimensi Fotografi:\n\n🔗 ${order.driveFolderUrl}\n\nTerima kasih atas kepercayaannya!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs transition-colors"
                        title="Kirim Link ke WhatsApp Konsumen"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Main Drive Explorer Card */}
      <div className="bg-[#141414] border border-white/10">
        {/* Explorer Header & Controls */}
        <div className="p-4 border-b border-white/10 space-y-3">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 text-xs">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id + idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />}
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                    idx === breadcrumbs.length - 1
                      ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {idx === 0 ? '📁 ' + crumb.name : crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Cari file atau nama folder di Drive..."
                value={searchQuery}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 px-3.5 py-2 pl-9 text-xs text-white placeholder-gray-500 focus:border-[#D4AF37] focus:outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </form>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'folders', label: '📁 Folder' },
                  { id: 'images', label: '🖼️ Foto' },
                  { id: 'others', label: '📄 Lainnya' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFileTypeFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                    fileTypeFilter === tab.id
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'bg-[#0A0A0A] text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Explorer Content */}
        <div className="p-4">
          {!accessToken ? (
            <div className="py-16 text-center">
              <HardDrive className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-2">Google Drive Belum Terhubung</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                Klik tombol di bawah ini untuk menghubungkan akun Google Anda dengan izin akses Google Drive untuk mengelola dan membagikan folder foto studio.
              </p>
              <button
                onClick={onGoogleSignIn}
                className="px-6 py-3 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors shadow-lg cursor-pointer inline-flex items-center gap-2"
              >
                <HardDrive className="w-4 h-4" />
                <span>Masuk & Otorisasi Google Drive</span>
              </button>
            </div>
          ) : isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto mb-3" />
              <p className="text-xs text-gray-400">Sinkronisasi file Google Drive...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 text-center my-4">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <p className="text-xs text-rose-300 mb-3">{errorMessage}</p>
              <button
                onClick={() => loadFiles(currentFolderId)}
                className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center">
              <Folder className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-gray-300 mb-1">Folder Kosong</h4>
              <p className="text-xs text-gray-500 mb-4">
                Belum ada file atau folder di direktori ini. Anda dapat membuat folder baru atau mengunggah foto.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="px-3.5 py-2 bg-[#0A0A0A] border border-white/20 text-white text-xs font-semibold hover:border-[#D4AF37] cursor-pointer"
                >
                  + Buat Folder
                </button>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-3.5 py-2 bg-[#D4AF37] text-black text-xs font-bold hover:bg-[#E5C158] cursor-pointer"
                >
                  Upload File
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`p-3 bg-[#0A0A0A] border transition-all flex flex-col justify-between group ${
                    file.isFolder
                      ? 'border-white/10 hover:border-[#D4AF37] cursor-pointer'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  onClick={() => {
                    if (file.isFolder) {
                      handleNavigateToFolder(file);
                    }
                  }}
                >
                  {/* File / Folder Preview Header */}
                  <div>
                    <div className="aspect-video bg-[#141414] border border-white/5 mb-2.5 overflow-hidden relative flex items-center justify-center">
                      {file.thumbnailLink && !file.isFolder ? (
                        <img
                          src={file.thumbnailLink}
                          alt={file.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="p-3">{getFileIcon(file)}</div>
                      )}

                      {/* Badge for Folder vs File */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 text-[9px] font-mono uppercase text-gray-300">
                        {file.isFolder ? 'Folder' : file.mimeType.split('/')[1] || 'File'}
                      </span>
                    </div>

                    <h4
                      className="text-xs font-semibold text-white truncate mb-1"
                      title={file.name}
                    >
                      {file.name}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                      <span>{formatFileSize(file.size)}</span>
                      <span>
                        {file.modifiedTime
                          ? new Date(file.modifiedTime).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div
                    className="flex items-center justify-between gap-1 pt-2.5 mt-2 border-t border-white/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {file.webViewLink ? (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-colors"
                        title="Buka di Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-1">
                      {file.webViewLink && (
                        <button
                          onClick={() => copyToClipboard(file.webViewLink!, file.name)}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
                          title="Salin Link Share"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete button triggering confirmation modal */}
                      <button
                        onClick={() => setFileToDelete(file)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs transition-colors cursor-pointer"
                        title="Hapus dari Google Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Create Client Order Folder Structure */}
      {isOrderGenOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#D4AF37] max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Generate Folder Google Drive Pesanan</span>
              </h3>
              <button
                onClick={() => setIsOrderGenOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Sistem akan otomatis membuat folder induk pesanan di Google Drive Anda serta 4 subfolder profesional (*Hi-Res Edited, File RAW, Cetak Kanvas & Album, Video Reels/Teaser*). Link folder akan otomatis disimpan ke pesanan untuk dibagikan kepada klien.
            </p>

            {genSuccessMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{genSuccessMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5">
                Pilih Pesanan Konsumen:
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/20 p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.clientName} - {o.packageName} ({o.id}) {o.driveFolderUrl ? ' [Sudah Ada Folder]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-[#0A0A0A] p-3 border border-white/5 text-[11px] text-gray-400 space-y-1">
              <span className="font-bold text-white block">Subfolder yang akan otomatis dibuat:</span>
              <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                <li>01_Hasil_Foto_Edited_HiRes</li>
                <li>02_File_Mentahan_RAW</li>
                <li>03_Pilihan_Cetak_Kanvas_Album</li>
                <li>04_Teaser_Video_Reels</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsOrderGenOpen(false)}
                className="px-4 py-2 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleGenerateClientFolder}
                disabled={isGeneratingStructure || !selectedOrderId}
                className="px-5 py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingStructure ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuat Folder...</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    <span>Buat Folder Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Custom Folder */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFolder} className="bg-[#141414] border border-white/20 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#D4AF37]" />
                <span>Buat Folder Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5">
                Nama Folder:
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Hasil Foto Wedding Reza & Maya"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/20 p-2.5 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-4 py-2 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="px-5 py-2 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#E5C158] transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCreatingFolder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Folder</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Upload Files */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUploadFiles} className="bg-[#141414] border border-white/20 max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Upload File ke Google Drive</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-gray-300 text-xs font-semibold mb-1.5">
                Pilih Foto / Dokumen / RAW:
              </label>
              <input
                type="file"
                multiple
                required
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(Array.from(e.target.files));
                  }
                }}
                className="w-full bg-[#0A0A0A] border border-white/20 p-3 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-black hover:file:bg-[#E5C158] cursor-pointer"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">
                Mendukung file format JPEG, PNG, CR2, NEF, ARW, MP4, PDF, dll.
              </span>
            </div>

            {selectedFiles.length > 0 && (
              <div className="bg-[#0A0A0A] p-3 border border-white/10 max-h-36 overflow-y-auto space-y-1">
                <span className="text-[11px] font-bold text-white block">
                  {selectedFiles.length} file dipilih:
                </span>
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="truncate max-w-[280px]">{f.name}</span>
                    <span className="font-mono">{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            )}

            {isUploading && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{uploadProgress}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUploading || selectedFiles.length === 0}
                className="px-5 py-2 bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Mulai Upload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: User Confirmation for Destructive Deletion (MANDATORY RULE) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-rose-500/50 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-400 border-b border-white/10 pb-3">
              <div className="p-2 bg-rose-500/10 rounded">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">Konfirmasi Hapus dari Google Drive</h3>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Tindakan Permanen</span>
              </div>
            </div>

            <div className="bg-[#0A0A0A] p-3 border border-white/10 text-xs space-y-2">
              <p className="text-gray-300">
                Apakah Anda yakin ingin menghapus {fileToDelete.isFolder ? 'folder' : 'file'} berikut dari Google Drive Anda?
              </p>
              <div className="p-2 bg-white/5 border border-white/10 text-white font-mono text-xs break-all">
                {fileToDelete.name}
              </div>
              <p className="text-[11px] text-rose-400">
                ⚠️ Tindakan ini akan menghapus file dari cloud storage Google Drive dan tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#0A0A0A] border border-white/10 text-gray-300 text-xs font-semibold hover:text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
