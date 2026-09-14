import React, { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { BookingOrder, OrderStatus, StudioConfig } from '../types';
import { formatRupiah, formatDateIndonesian, generateWhatsAppLink, normalizeWhatsAppNumber } from '../utils/formatters';
import { STUDIO_INFO } from '../data/mockData';
import { PrintableReceipt } from './PrintableReceipt';
import { printOrDownloadReceipt, downloadReceiptPDFFile } from '../utils/receiptPrinter';
import { getResolvedBankAccounts } from '../utils/bankOptions';
import { saveReviewToFirestore } from "../firebase/services";
import { compressImage } from '../utils/imageCompressor';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Receipt,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Film,
  Camera,
  ArrowRight,
  ExternalLink,
  Download,
  Share2,
  X,
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Loader2,
  Eye,
  FileCheck,
  CreditCard,
  Star,
  QrCode,
  ShieldCheck,
  Layers,
  ChevronRight,
  Printer,
  CalendarCheck,
} from 'lucide-react';

interface CustomerPortalProps {
  orders: BookingOrder[];
  currentUser: User | null;
  onGoToBooking: () => void;
  studioConfig?: StudioConfig;
  onUpdateOrder?: (orderId: string, updates: Partial<BookingOrder>) => Promise<void> | void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  currentUser,
  onGoToBooking,
  studioConfig,
  onUpdateOrder,
}) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);

  // Upload proof modal state
  const [uploadProofOrder, setUploadProofOrder] = useState<BookingOrder | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofType, setProofType] = useState<'DP' | 'Pelunasan'>('DP');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [proofNote, setProofNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);
  const [uploadSuccessOrder, setUploadSuccessOrder] = useState<BookingOrder | null>(null);

  // Image viewer modal for proof
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  // Review / Satisfaction rating modal state
  const [reviewOrder, setReviewOrder] = useState<BookingOrder | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !onUpdateOrder) return;
    setIsSubmittingReview(true);
    try {
      const updates: Partial<BookingOrder> = {
        rating: reviewRating,
        review: reviewComment.trim(),
        reviewedAt: new Date().toISOString(),
      };
      
      // Simpan juga ke koleksi khusus ulasan agar tidak terhapus saat pesanan dibersihkan
      await saveReviewToFirestore({
        id: reviewOrder.id,
        clientName: reviewOrder.clientName,
        packageName: reviewOrder.packageName,
        rating: reviewRating,
        review: reviewComment.trim(),
        reviewedAt: updates.reviewedAt as string,
        showInTestimonials: true
      });

      await onUpdateOrder(reviewOrder.id, updates);
      setReviewSuccessMessage(true);
      toast.success('Terima kasih! Ulasan berhasil dikirim', 'Ulasan dan bintang kepuasan Anda telah dicatat.');
      setTimeout(() => {
        setReviewSuccessMessage(false);
        setReviewOrder(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Gagal menyimpan ulasan');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const adminWhatsApp = normalizeWhatsAppNumber(
    studioConfig?.whatsapp || studioConfig?.phone || studioConfig?.masterPhone || STUDIO_INFO.whatsapp
  );
  const studioPhoneDisplay = studioConfig?.phone || studioConfig?.whatsapp || STUDIO_INFO.phone;
  const studioInstagramDisplay = studioConfig?.instagram || STUDIO_INFO.instagram;

  const activeBankAccounts = useMemo(() => {
    return getResolvedBankAccounts(studioConfig).filter((b) => b.isActive !== false);
  }, [studioConfig]);

  // If user is logged in with email, find orders matching email or phone or createdBy
  const userOrders = useMemo(() => {
    if (!currentUser?.email) return [];
    const email = currentUser.email.toLowerCase();
    return orders.filter(
      (ord) => ord.email?.toLowerCase() === email || (ord as any).createdBy === currentUser.uid
    );
  }, [orders, currentUser]);

  // Filtered orders from search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return orders.filter(
      (ord) =>
        ord.id.toLowerCase().includes(q) ||
        ord.clientName.toLowerCase().includes(q) ||
        ord.phone.includes(q) ||
        (ord.email && ord.email.toLowerCase().includes(q))
    );
  }, [orders, searchQuery]);

  // Display orders logic: If search has query, show search results. Otherwise show logged in user orders.
  const displayedOrders = searchQuery.trim() ? searchResults : userOrders;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase bg-gold-metallic text-black font-bold border border-[#FFF0A8]/60 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            <Hourglass className="w-3.5 h-3.5 animate-pulse text-black" />
            <span>Menunggu Konfirmasi</span>
          </span>
        );
      case 'Terkonfirmasi & Terjadwal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>Terkonfirmasi & Terjadwal</span>
          </span>
        );
      case 'Proses Editing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Film className="w-3.5 h-3.5" />
            <span>Proses Editing Foto</span>
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai & Siap Diunduh</span>
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Dibatalkan</span>
          </span>
        );
    }
  };

  const getStepProgress = (status: OrderStatus) => {
    const steps = [
      { id: 1, label: 'Booking Diterima', desc: 'Reservasi & Data Tersimpan' },
      { id: 2, label: 'Sesi Terjadwal', desc: 'Jadwal & Tim Fotografer Aktif' },
      { id: 3, label: 'Proses Editing', desc: 'Color Grading & Retouching' },
      { id: 4, label: 'Selesai', desc: 'Hasil Foto Siap Diunduh' },
    ];

    let currentStep = 1;
    if (status === 'Terkonfirmasi & Terjadwal') currentStep = 2;
    if (status === 'Proses Editing') currentStep = 3;
    if (status === 'Selesai') currentStep = 4;
    if (status === 'Dibatalkan') currentStep = 0;

    return { steps, currentStep };
  };

  const printReceipt = (order: BookingOrder) => {
    setSelectedOrder(order);
  };

  // Open upload modal
  const handleOpenUploadModal = (order: BookingOrder) => {
    setUploadProofOrder(order);
    setProofFile(null);
    setProofPreview(order.paymentProofUrl || null);
    setProofType(order.paymentPreference === 'Lunas' ? 'Pelunasan' : 'DP');
    setProofNote(order.paymentProofNote || '');
    const defaultBank = activeBankAccounts.find((b) => b.isPrimary) || activeBankAccounts[0];
    setSelectedBankId(defaultBank ? defaultBank.id : '');
  };

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Mohon pilih file gambar (JPG, PNG, WEBP).');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Copy bank number
  const handleCopyAccountNumber = (accNumber: string, id: string) => {
    navigator.clipboard.writeText(accNumber.replace(/[^0-9]/g, '') || accNumber);
    setCopiedBankId(id);
    toast.info('Nomor rekening disalin ke clipboard');
    setTimeout(() => setCopiedBankId(null), 2500);
  };

  // Submit proof
  const handleSubmitProof = async () => {
    if (!uploadProofOrder) return;
    if (!proofPreview && !proofFile) {
      toast.warning('Silakan pilih file foto bukti transfer terlebih dahulu');
      return;
    }

    setIsUploading(true);
    try {
      let finalProofUrl = proofPreview || '';
      if (proofFile) {
        finalProofUrl = await compressImage(proofFile, 800, 800, 0.60);
      }

      const selectedBank = activeBankAccounts.find((b) => b.id === selectedBankId);
      const bankLabel = selectedBank
        ? `${selectedBank.bankName} (${selectedBank.accountNumber})`
        : 'Transfer Bank Studio';

      const updates: Partial<BookingOrder> = {
        paymentProofUrl: finalProofUrl,
        paymentProofUploadedAt: new Date().toISOString(),
        paymentProofType: proofType,
        paymentProofBank: bankLabel,
        paymentProofNote: proofNote.trim() || undefined,
      };

      if (onUpdateOrder) {
        await onUpdateOrder(uploadProofOrder.id, updates);
      }

      const updatedOrderObj = { ...uploadProofOrder, ...updates };
      setUploadProofOrder(null);
      setUploadSuccessOrder(updatedOrderObj);
      toast.success('Bukti pembayaran berhasil diunggah!', 'Admin studio akan segera memverifikasi pesanan Anda.');
    } catch (err) {
      console.error('Failed to upload payment proof:', err);
      toast.error('Gagal memproses bukti transfer');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate WhatsApp confirmation link after uploading proof
  const generateProofWhatsAppLink = (order: BookingOrder) => {
    const isLunas = order.paymentPreference === 'Lunas';
    const isDP30 = order.paymentPreference === 'DP 30%';
    const dpRatio = isLunas ? 1.0 : (isDP30 ? 0.3 : 0.5);
    const nominal = Math.round(order.totalPrice * dpRatio);

    const message = `Halo Dimensi Fotografi Studio! 📸✨

Saya telah mengunggah bukti transfer untuk pesanan:
*ID Pesanan*: ${order.id}
*Nama Klien*: ${order.clientName}
*Paket Foto*: ${order.packageName}
*Jenis Pembayaran*: ${order.paymentProofType || (isLunas ? 'Pelunasan 100%' : `DP (${order.paymentPreference})`)}
*Nominal Transfer*: ${formatRupiah(nominal)}
*Bank Tujuan*: ${order.paymentProofBank || 'Bank Studio'}
${order.paymentProofNote ? `*Catatan*: ${order.paymentProofNote}\n` : ''}
Mohon untuk dikonfirmasi dan dicek verifikasinya. Terima kasih! 🙏`;

    return `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="portal-konsumen">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Portal Pelanggan & Lacak Pesanan</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white uppercase font-display">
          Cek Status & Riwayat Pemotretan
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Pantau progres jadwal pemotretan, proses editing foto, dan unduh bukti reservasi Anda secara transparan.
        </p>

        {/* Social Media Links Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          <a
            href="https://www.instagram.com/dimensi_id_?igsh=YWtmMWF0aWVhemUy"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-950/50 via-pink-950/40 to-black border border-pink-500/30 hover:border-pink-500/60 text-xs font-mono text-pink-300 transition-all cursor-pointer shadow-md"
            title="Kunjungi Instagram Resmi Dimensi"
          >
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            <span>Instagram: @dimensi_id_</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-400 ml-0.5" />
          </a>
          <a
            href="https://www.tiktok.com/@dimensi.id?_t=ZS-8xf3ifhaDn5&_r=1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#141414] border border-white/15 hover:border-[#D4AF37]/50 text-xs font-mono text-gray-200 transition-all cursor-pointer shadow-md"
            title="Kunjungi TikTok Resmi Dimensi"
          >
            <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
            <span>TikTok: @dimensi.id</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-400 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Search Bar / Order Lookup Box */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="bg-[#141414] border border-white/10 p-2 sm:p-3 flex items-center gap-2 shadow-xl focus-within:border-[#D4AF37] transition-all">
          <Search className="w-5 h-5 text-gray-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Pesanan (cth: ORD-8921), Nama, No WhatsApp, atau Email..."
            className="w-full bg-transparent text-white text-xs sm:text-sm px-2 py-1.5 focus:outline-none placeholder:text-gray-500"
            id="customer-search-order-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-400 hover:text-white px-2 py-1"
            >
              Hapus
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-500 font-mono">
          <span>💡 Tips: Masukkan 4 digit kode ID atau nomor telepon Anda saat reservasi.</span>
          {currentUser && (
            <span className="text-[#D4AF37]">Login sebagai: {currentUser.email}</span>
          )}
        </div>
      </div>

      {/* Results / User Order List */}
      {displayedOrders.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-200 font-mono">
                Hasil Lacak Pesanan ({displayedOrders.length} Ditemukan)
              </h3>
            </div>
            <button
              onClick={onGoToBooking}
              className="text-xs text-[#D4AF37] hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 transition-colors cursor-pointer"
            >
              <span>+ Booking Sesi Baru</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-6">
            {displayedOrders.map((order) => {
              const { steps, currentStep } = getStepProgress(order.status);
              const waLink = generateWhatsAppLink(order);
              const progressPercentage =
                order.status === 'Dibatalkan'
                  ? 0
                  : Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

              return (
                <div
                  key={order.id}
                  className="bg-[#111111] border border-white/15 hover:border-[#D4AF37]/60 transition-all p-5 sm:p-7 relative shadow-2xl"
                  id={`order-card-${order.id}`}
                >
                  {/* 1. Header Bar: ID, Date & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono uppercase text-gray-400">ID Pesanan:</span>
                        <span className="text-sm sm:text-base font-mono font-bold text-black tracking-wider px-2 py-0.5 bg-gold-metallic border border-[#FFF0A8] shadow-sm">
                          {order.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyAccountNumber(order.id, `order-id-${order.id}`)}
                          className="p-1 hover:text-white text-gray-400 transition-colors cursor-pointer"
                          title="Salin ID Pesanan"
                        >
                          {copiedBankId === `order-id-${order.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#D4AF37]" />
                        <span>Dipesan pada {formatDateIndonesian(order.createdAt)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div>{getStatusBadge(order.status)}</div>
                      <button
                        type="button"
                        onClick={() => printReceipt(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-gray-200 hover:text-white border border-white/20 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors"
                        title="Lihat Invoice & QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Invoice & QR</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Connected Horizontal Stepper Timeline (Matching User Manual) */}
                  {order.status !== 'Dibatalkan' && (
                    <div className="mb-6 p-4 sm:p-5 bg-[#161616] border border-white/10 rounded-none relative">
                      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Timeline Status Pengerjaan Foto:</span>
                        </span>
                        <span className="text-[#D4AF37]">
                          Tahap {currentStep} dari {steps.length}
                        </span>
                      </div>

                      <div className="relative">
                        {/* Connecting Track Line */}
                        <div className="absolute top-4 left-6 right-6 h-1 bg-white/10 -translate-y-1/2 z-0 hidden sm:block">
                          <div
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>

                        {/* Step items */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                          {steps.map((step) => {
                            const isCompleted = step.id < currentStep;
                            const isCurrent = step.id === currentStep;

                            return (
                              <div
                                key={step.id}
                                className={`text-center flex flex-col items-center p-2 rounded-none transition-all ${
                                  isCurrent ? 'bg-[#D4AF37]/5 sm:bg-transparent' : ''
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold mb-2 transition-all shadow-md ${
                                    isCurrent
                                      ? 'bg-gold-metallic text-black ring-4 ring-[#D4AF37]/40 scale-110 shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                                      : isCompleted
                                      ? 'bg-emerald-500 text-black'
                                      : 'bg-[#222222] text-gray-400 border border-white/15'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-4 h-4 text-black stroke-[3]" />
                                  ) : isCurrent ? (
                                    <span className="animate-pulse">{step.id}</span>
                                  ) : (
                                    step.id
                                  )}
                                </div>
                                <p
                                  className={`text-xs font-bold leading-tight ${
                                    isCurrent
                                      ? 'text-[#D4AF37]'
                                      : isCompleted
                                      ? 'text-white'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="text-[10px] text-gray-400 leading-tight mt-0.5 max-w-[140px]">
                                  {step.desc}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Bento Grid: Left (Sesi & Paket) | Right (Pembayaran & Google Drive) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
                    {/* Left Column (7 cols): Paket & Jadwal Acara */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Package & Client Info Box */}
                      <div className="p-4 bg-[#181818] border border-white/10 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-gray-400 block">Paket Fotografi</span>
                            <h4 className="text-base font-bold text-white font-serif">{order.packageName}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Investasi</span>
                            <span className="text-base font-mono font-bold text-[#D4AF37]">
                              {formatRupiah(order.totalPrice)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono block">
                              ({order.paymentPreference})
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block">Klien / Pemesan:</span>
                            <span className="font-semibold text-white">{order.clientName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 block">WhatsApp:</span>
                            <span className="font-mono text-gray-300">{order.phone}</span>
                          </div>
                        </div>

                        {order.addOnsText && order.addOnsText !== 'Tidak ada' && (
                          <div className="pt-2 border-t border-white/10 text-xs">
                            <span className="text-[10px] font-mono text-gray-400 block mb-1">Layanan Tambahan (Add-ons):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {order.addOnsText.split(',').map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-mono"
                                >
                                  {item.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sesi 1 Schedule Box */}
                      <div className="p-3.5 bg-black/50 border border-white/10 space-y-2">
                        <div className="text-[11px] font-mono font-bold text-[#D4AF37] uppercase flex items-center justify-between">
                          <span>{order.hasSecondSession ? 'Acara Utama (Sesi 1):' : 'Jadwal & Lokasi Sesi Pemotretan:'}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-white/10 text-gray-200 uppercase font-mono">
                            {order.locationType}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-2 text-gray-200">
                            <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span className="font-semibold">{formatDateIndonesian(order.sessionDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-200">
                            <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span className="font-mono font-semibold text-[#D4AF37]">{order.sessionTime} WIB</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-gray-300 pt-1.5 border-t border-white/5">
                          <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-gray-400 text-[11px]">{order.locationAddress}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sesi 2 if exists */}
                      {order.hasSecondSession && order.sessionDate2 && (
                        <div className="p-3.5 bg-black/50 border border-cyan-500/30 space-y-2">
                          <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase flex items-center justify-between">
                            <span>Acara Kedua (Sesi 2):</span>
                            <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 uppercase font-mono">
                              {order.locationType2 || 'venue'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 text-gray-200">
                              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span className="font-semibold">{formatDateIndonesian(order.sessionDate2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-200">
                              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span className="font-mono font-semibold text-cyan-300">{order.sessionTime2 || '-'} WIB</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-gray-300 pt-1.5 border-t border-white/5">
                            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-gray-400 text-[11px]">{order.locationAddress2 || '-'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column (5 cols): Google Drive Deliverables, Payment Proof & Bank Accounts */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Google Drive Photo Deliverables Box */}
                      {order.driveFolderUrl ? (
                        <div className="p-4 bg-gradient-to-br from-[#1c1910] via-[#141414] to-[#0f1a14] border-2 border-[#D4AF37] space-y-3 shadow-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono uppercase font-bold text-[#D4AF37] flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4" />
                              <span>Hasil Foto Selesai</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/40 animate-pulse">
                              SIAP UNDUH
                            </span>
                          </div>
                          <p className="text-xs text-gray-200">
                            Semua file foto resolusi tinggi, hasil color grading, dan video telah siap di Google Drive Cloud studio.
                          </p>
                          <div className="space-y-2 pt-1">
                            <a
                              href={order.driveFolderUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-gold-metallic hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.35)] cursor-pointer"
                              id={`open-drive-portal-${order.id}`}
                            >
                              <Download className="w-4 h-4" />
                              <span>Buka & Unduh di Google Drive</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopyAccountNumber(order.driveFolderUrl || '', `drive-link-${order.id}`)}
                              className="w-full py-1.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-white/15 text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            >
                              {copiedBankId === `drive-link-${order.id}` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Link Drive Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin Tautan Google Drive</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        (order.status === 'Selesai' || order.status === 'Proses Editing') && (
                          <div className="p-3.5 bg-[#171717] border border-white/10 text-xs text-gray-300 space-y-1.5">
                            <div className="flex items-center gap-2 text-[#D4AF37] font-mono text-[11px] uppercase font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Tahap Kurasi & Upload Cloud</span>
                            </div>
                            <p className="text-gray-400 text-[11px]">
                              Tim editor sedang melakukan color grading dan mengekspor foto master ke Google Drive.
                            </p>
                          </div>
                        )
                      )}

                      {/* Payment Proof Status Banner */}
                      {order.paymentProofUrl ? (
                        <div className="p-3.5 bg-[#181818] border border-emerald-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Bukti Transfer Terverifikasi</span>
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                              {order.paymentProofType || 'DP/Pelunasan'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <img
                              src={order.paymentProofUrl}
                              alt="Bukti Transfer"
                              className="w-12 h-12 object-cover border border-white/20 cursor-pointer bg-black"
                              onClick={() => setViewingProofUrl(order.paymentProofUrl || null)}
                            />
                            <div className="text-[11px] text-gray-300 truncate">
                              <span className="block truncate font-mono">
                                {order.paymentProofBank || 'Transfer Bank'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                {order.paymentProofUploadedAt
                                  ? `${new Date(order.paymentProofUploadedAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}`
                                  : 'Tercatat'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => setViewingProofUrl(order.paymentProofUrl || null)}
                              className="flex-1 py-1.5 bg-black/80 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Bukti</span>
                            </button>
                            {order.status === 'Menunggu Konfirmasi' && (
                              <button
                                type="button"
                                onClick={() => handleOpenUploadModal(order)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/15 text-[10px] font-mono uppercase cursor-pointer"
                              >
                                Ganti
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        order.status === 'Menunggu Konfirmasi' && (
                          <div className="p-3.5 bg-amber-950/25 border border-amber-500/40 space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-bold text-amber-300 block">
                                  Menunggu Bukti Transfer
                                </span>
                                <span className="text-[11px] text-gray-300 block mt-0.5">
                                  Unggah bukti transfer rekening untuk mengonfirmasi jadwal pemotretan Anda.
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenUploadModal(order)}
                              className="w-full py-2 bg-gold-metallic hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Bukti Transfer</span>
                            </button>
                          </div>
                        )
                      )}

                      {/* Official Studio Bank Accounts (Quick Copy) */}
                      <div className="p-3 bg-black/40 border border-white/10 space-y-1.5 text-xs">
                        <span className="text-[10px] font-mono uppercase text-gray-400 block">
                          Rekening Resmi Studio (Untuk DP/Pelunasan):
                        </span>
                        <div className="space-y-1">
                          {activeBankAccounts.slice(0, 2).map((bank) => (
                            <div
                              key={bank.id}
                              className="flex items-center justify-between p-1.5 bg-[#141414] border border-white/5"
                            >
                              <div className="truncate">
                                <span className="text-[10px] font-mono text-gray-400 uppercase font-bold mr-1">
                                  {bank.bankCode || bank.bankName}:
                                </span>
                                <span className="font-mono text-xs font-bold text-[#D4AF37]">
                                  {bank.accountNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyAccountNumber(bank.accountNumber, bank.id)}
                                className="px-2 py-0.5 bg-black hover:bg-white/10 text-[10px] font-mono text-gray-300 hover:text-white border border-white/10 uppercase cursor-pointer"
                              >
                                {copiedBankId === bank.id ? 'Tersalin' : 'Salin'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Customer Review / Satisfaction Section */}
                  {order.rating ? (
                    <div className="mb-5 p-3.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase font-bold text-[#D4AF37] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Ulasan & Kepuasan Pelanggan:</span>
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(order.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                          ))}
                        </div>
                      </div>
                      {order.review && (
                        <p className="text-xs text-gray-200 italic">"{order.review}"</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setReviewOrder(order);
                          setReviewRating(order.rating || 5);
                          setReviewComment(order.review || '');
                        }}
                        className="text-[10px] text-[#D4AF37] hover:underline font-mono uppercase tracking-wider mt-1 block cursor-pointer"
                      >
                        Ubah Ulasan
                      </button>
                    </div>
                  ) : (
                    <div className="mb-5 p-3.5 bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span className="text-xs text-gray-300">
                          Bagikan ulasan dan rating kepuasan Anda bersama tim fotografer Dimensi.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReviewOrder(order);
                          setReviewRating(5);
                          setReviewComment('');
                        }}
                        className="px-3.5 py-1.5 bg-gold-metallic hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                      >
                        Beri Ulasan Bintang
                      </button>
                    </div>
                  )}

                  {/* 5. Actions Bar (Print Receipt, WA Confirmation, PDF Download) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => printReceipt(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#D4AF37]/40 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
                        id={`print-receipt-${order.id}`}
                        title="Cetak nota atau simpan bukti reservasi digital (A5/PDF)"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Cetak / Unduh Invoice (A5)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadReceiptPDFFile(order, studioConfig)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-black hover:bg-white/10 text-gray-300 hover:text-white border border-white/15 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors"
                        title="Unduh file dokumen invoice"
                      >
                        <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Unduh Nota</span>
                      </button>
                    </div>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-lg transition-colors ml-auto"
                      id={`chat-wa-order-${order.id}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Konfirmasi via WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div className="text-center py-16 px-4 bg-[#121212] border border-white/10 max-w-2xl mx-auto">
          <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white uppercase font-display mb-1">
            {searchQuery ? 'Pesanan Tidak Ditemukan' : 'Belum Ada Pesanan yang Ditampilkan'}
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
            {searchQuery
              ? `Tidak ditemukan pesanan dengan kata kunci "${searchQuery}". Pastikan nomor WhatsApp atau ID pesanan sudah benar.`
              : 'Gunakan kolom pencarian di atas dengan nomor WhatsApp atau ID pesanan Anda, atau buat booking sesi foto baru bersama kami.'}
          </p>
          <button
            onClick={onGoToBooking}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
            id="empty-booking-cta-btn"
          >
            <span>Pesan Sesi Foto Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MODAL UPLOAD BUKTI TRANSFER DP / PELUNASAN */}
      {uploadProofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37]/60 p-6 sm:p-7 shadow-2xl text-[#E0E0E0] max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setUploadProofOrder(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-white/10 pb-4 mb-5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-mono uppercase tracking-wider mb-2">
                <Upload className="w-3 h-3" />
                <span>Upload Bukti Pembayaran</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white uppercase font-display">
                Unggah Bukti Transfer DP / Pelunasan
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                ID Pesanan: <strong className="text-[#D4AF37]">{uploadProofOrder.id}</strong> • {uploadProofOrder.clientName}
              </p>
            </div>

            {/* Billing Info Summary */}
            {(() => {
              const isLunasPref = uploadProofOrder.paymentPreference === 'Lunas';
              const isDP30Pref = uploadProofOrder.paymentPreference === 'DP 30%';
              const dpRatio = isLunasPref ? 1.0 : (isDP30Pref ? 0.3 : 0.5);
              const dpNominal = Math.round(uploadProofOrder.totalPrice * dpRatio);

              return (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#1A1A1A] border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Paket Foto</span>
                      <span className="font-semibold text-white">{uploadProofOrder.packageName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Total Investasi</span>
                      <span className="font-bold font-mono text-white">{formatRupiah(uploadProofOrder.totalPrice)}</span>
                    </div>
                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="text-gray-300">
                        {isLunasPref ? 'Ketentuan Bayar (Lunas)' : `Minimal DP (${isDP30Pref ? '30%' : '50%'})`}
                      </span>
                      <span className="text-sm font-bold font-mono text-[#D4AF37]">
                        {formatRupiah(dpNominal)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Type Selection */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-2">
                      1. Pilih Jenis Pembayaran yang Ditransfer:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProofType('DP')}
                        className={`p-2.5 text-xs text-left border cursor-pointer transition-all ${
                          proofType === 'DP'
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-bold'
                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Uang Muka (DP)</span>
                          {proofType === 'DP' && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                        </div>
                        <span className="text-[11px] font-mono text-[#D4AF37] block mt-1">
                          {formatRupiah(dpNominal)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProofType('Pelunasan')}
                        className={`p-2.5 text-xs text-left border cursor-pointer transition-all ${
                          proofType === 'Pelunasan'
                            ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white font-bold'
                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Pelunasan (100%)</span>
                          {proofType === 'Pelunasan' && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                        </div>
                        <span className="text-[11px] font-mono text-[#D4AF37] block mt-1">
                          {formatRupiah(uploadProofOrder.totalPrice)}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Studio Bank Accounts for Transfer */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-2">
                      2. Transfer ke Rekening Resmi Studio:
                    </label>
                    <div className="space-y-2">
                      {activeBankAccounts.map((bank) => {
                        const isSelected = selectedBankId === bank.id;
                        const isCopied = copiedBankId === bank.id;

                        return (
                          <div
                            key={bank.id}
                            onClick={() => setSelectedBankId(bank.id)}
                            className={`p-3 border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-[#1e1c15] border-[#D4AF37]'
                                : 'bg-[#0F0F0F] border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white/10 text-gray-200 uppercase">
                                  {bank.bankCode || bank.bankName}
                                </span>
                                <span className="text-xs font-semibold text-white truncate">{bank.bankName}</span>
                              </div>
                              <div className="font-mono text-sm font-bold text-[#D4AF37] mt-1 tracking-wider">
                                {bank.accountNumber || '-'}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                a/n {bank.accountHolder}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyAccountNumber(bank.accountNumber, bank.id);
                              }}
                              className="px-2.5 py-1.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-white/20 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors"
                              title="Salin Nomor Rekening"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-[#D4AF37]" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload Image Section */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-2">
                      3. Foto Bukti Transfer / Struk / Screenshot m-Banking:
                    </label>

                    {proofPreview ? (
                      <div className="relative p-2 bg-black border border-[#D4AF37]/50 rounded-none space-y-2">
                        <img
                          src={proofPreview}
                          alt="Bukti Transfer"
                          className="w-full max-h-56 object-contain bg-neutral-900 border border-white/10"
                        />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Foto bukti siap dikirim</span>
                          </span>
                          <label className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-white/20 text-[11px] uppercase font-mono cursor-pointer">
                            <span>Ganti Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-white/20 hover:border-[#D4AF37] bg-black/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-xs font-semibold text-white">Klik atau Tarik Foto Bukti ke Sini</span>
                        <span className="text-[10px] text-gray-400 mt-1 font-mono">Format JPG, PNG, WEBP (Maks 10MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Optional Note */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                      Catatan Tambahan (Opsional):
                    </label>
                    <input
                      type="text"
                      value={proofNote}
                      onChange={(e) => setProofNote(e.target.value)}
                      placeholder="Cth: Rekening atas nama Budi / Transfer lewat BCA Mobile"
                      className="w-full px-3 py-2 bg-black border border-white/15 text-xs text-white placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isUploading || (!proofPreview && !proofFile)}
                      onClick={handleSubmitProof}
                      className="flex-1 py-3 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                      id="btn-submit-payment-proof"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengunggah Bukti...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Kirim Bukti Transfer</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => setUploadProofOrder(null)}
                      className="px-4 py-3 bg-[#1A1A1A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL SUCCESS BUKTI TRANSFER TERKIRIM */}
      {uploadSuccessOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#141414] border border-[#D4AF37] p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white uppercase font-display">
                Bukti Transfer Berhasil Diunggah!
              </h3>
              <p className="text-xs text-gray-300">
                Terima kasih! Bukti pembayaran untuk pesanan <strong className="text-[#D4AF37]">{uploadSuccessOrder.id}</strong> telah tercatat di sistem kami dan sedang diverifikasi oleh admin.
              </p>
            </div>

            <div className="p-3 bg-black/60 border border-white/10 text-left text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Status Pesanan:</span>
                <span className="text-amber-400 font-bold">Menunggu Konfirmasi Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jenis:</span>
                <span className="text-white">{uploadSuccessOrder.paymentProofType || 'DP/Pelunasan'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={generateProofWhatsAppLink(uploadSuccessOrder)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
                id="btn-confirm-wa-after-upload"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Notifikasi via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setUploadSuccessOrder(null)}
                className="w-full py-2.5 bg-[#1A1A1A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE VIEWER MODAL */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-2xl w-full bg-[#141414] border border-[#D4AF37]/50 p-4 space-y-3 shadow-2xl">
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
            <div className="bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={viewingProofUrl}
                alt="Bukti Transfer Pembayaran"
                className="max-h-[70vh] max-w-full object-contain"
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

      {/* Digital Receipt / Invoice Modal (Hanya untuk pesanan yang sudah terkonfirmasi) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141414] border border-[#D4AF37]/60 p-6 sm:p-7 shadow-2xl text-[#E0E0E0] max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Receipt Content Area */}
            <div id="printable-receipt" className="space-y-4">
              {/* Receipt Header */}
              <div className="border-b-2 border-[#D4AF37]/50 pb-4 flex justify-between items-start gap-3">
                <div>
                  <div className="text-xl font-bold tracking-widest text-white font-serif">
                    DIMENSI<span className="text-[#D4AF37]">STUDIO</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">Studio & Outdoor Photography</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    WA: {studioPhoneDisplay} • IG: {studioInstagramDisplay}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold">
                      INVOICE DIGITAL (A5)
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    No: <span className="text-[#D4AF37]">{selectedOrder.id}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Client & Sesi Info */}
              <div className="grid grid-cols-2 gap-3 text-xs py-2 bg-[#1A1A1A] p-3 border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Nama Konsumen</span>
                  <span className="font-semibold text-white">{selectedOrder.clientName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">WhatsApp</span>
                  <span className="font-mono text-gray-300">{selectedOrder.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Tanggal Sesi</span>
                  <span className="text-white">{formatDateIndonesian(selectedOrder.sessionDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Waktu Sesi</span>
                  <span className="text-[#D4AF37] font-mono">{selectedOrder.sessionTime}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Lokasi</span>
                  <span className="text-gray-300">{selectedOrder.locationAddress} ({selectedOrder.locationType.toUpperCase()})</span>
                </div>
              </div>

              {/* Services Breakdown */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] font-mono mb-2 border-b border-white/10 pb-1">
                  Rincian Layanan & Biaya
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">{selectedOrder.packageName}</span>
                    <span className="font-mono text-gray-300">{formatRupiah(selectedOrder.packagePrice)}</span>
                  </div>
                  {selectedOrder.addOnsTotal > 0 && (
                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Add-ons ({selectedOrder.addOnsText})</span>
                      <span className="font-mono">+{formatRupiah(selectedOrder.addOnsTotal)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/15 pt-2 flex justify-between items-center text-sm font-bold text-white">
                    <span>Total Investasi</span>
                    <span className="text-[#D4AF37] font-mono text-base">{formatRupiah(selectedOrder.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Metode Pembayaran</span>
                    <span className="font-mono text-gray-300">{selectedOrder.paymentPreference}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Status Pesanan</span>
                    <span>{getStatusBadge(selectedOrder.status)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-2.5 bg-black/40 border border-white/5 text-xs text-gray-300">
                  <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Catatan Konsep:</span>
                  <p className="italic">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Google Drive Link if ready */}
              {selectedOrder.driveFolderUrl && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-xs">
                  <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block mb-1">
                    Link Folder Google Drive:
                  </span>
                  <a
                    href={selectedOrder.driveFolderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-emerald-300 underline break-all flex items-center gap-1"
                  >
                    <span>{selectedOrder.driveFolderUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              {/* Receipt Footer */}
              <div className="border-t border-white/10 pt-3 text-center text-[10px] text-gray-500 font-mono">
                <p>Terima kasih telah mempercayakan momen berharga Anda bersama Dimensi Fotografi.</p>
                <p className="mt-1">WhatsApp: {studioPhoneDisplay} | Instagram: {studioInstagramDisplay}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2 no-print">
              <button
                type="button"
                onClick={() => selectedOrder && printOrDownloadReceipt(selectedOrder, studioConfig)}
                className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                id="btn-print-receipt-action"
                title="Cetak nota atau simpan sebagai PDF (Ukuran A5 / Setengah A4)"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Cetak (A5)</span>
              </button>
              <button
                type="button"
                onClick={() => selectedOrder && downloadReceiptPDFFile(selectedOrder, studioConfig)}
                className="px-3.5 py-2.5 bg-[#0A0A0A] hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                id="btn-download-receipt-action"
                title="Unduh file nota digital"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
              <a
                href={generateWhatsAppLink(selectedOrder, adminWhatsApp)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WA Studio</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>

          {/* Dedicated 1-Page Printable Receipt (Only visible during print / PDF generation) */}
          <PrintableReceipt
            order={selectedOrder}
            studioConfig={studioConfig}
            className="hidden print:block"
          />
        </div>
      )}

      {/* MODAL BERI ULASAN & KEPUASAN PELANGGAN */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#141414] border border-[#D4AF37]/60 p-6 sm:p-7 shadow-2xl text-[#E0E0E0]">
            <button
              onClick={() => setReviewOrder(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                <Star className="w-5 h-5 fill-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase font-display tracking-wide">
                  Ulasan & Kepuasan Pelanggan
                </h3>
                <p className="text-xs text-[#D4AF37] font-mono">
                  {reviewOrder.packageName} • ID: {reviewOrder.id}
                </p>
              </div>
            </div>

            {reviewSuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-white text-base">Ulasan Berhasil Disimpan!</h4>
                <p className="text-xs text-gray-300">
                  Terima kasih atas penilaian dan ulasan berharga Anda. Ulasan Anda membantu kami meningkatkan kualitas layanan fotografi studio.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                    Rating Kepuasan (1 sampai 5 Bintang)
                  </label>
                  <div className="flex items-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-mono text-sm font-bold text-[#D4AF37]">
                      {reviewRating} / 5 Bintang
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                    Komentar / Kesan & Pesan Layanan Studio
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda selama sesi foto bersama Dimensi Fotografi..."
                    className="w-full px-3 py-2.5 bg-black/60 border border-white/15 focus:border-[#D4AF37] text-white text-xs outline-none resize-none transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewOrder(null)}
                    className="px-4 py-2 bg-black border border-white/15 text-gray-300 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Simpan Ulasan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
