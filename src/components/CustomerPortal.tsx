import React, { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { BookingOrder, OrderStatus, StudioConfig } from '../types';
import { formatRupiah, formatDateIndonesian, generateWhatsAppLink, normalizeWhatsAppNumber } from '../utils/formatters';
import { STUDIO_INFO } from '../data/mockData';
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
} from 'lucide-react';

interface CustomerPortalProps {
  orders: BookingOrder[];
  currentUser: User | null;
  onGoToBooking: () => void;
  studioConfig?: StudioConfig;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  currentUser,
  onGoToBooking,
  studioConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);

  const adminWhatsApp = normalizeWhatsAppNumber(
    studioConfig?.whatsapp || studioConfig?.phone || studioConfig?.masterPhone || STUDIO_INFO.whatsapp
  );
  const studioPhoneDisplay = studioConfig?.phone || studioConfig?.whatsapp || STUDIO_INFO.phone;
  const studioInstagramDisplay = studioConfig?.instagram || STUDIO_INFO.instagram;

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Hourglass className="w-3.5 h-3.5 animate-pulse" />
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
      { id: 1, label: 'Reservasi Diterima' },
      { id: 2, label: 'Jadwal Terkonfirmasi' },
      { id: 3, label: 'Pemotretan & Editing' },
      { id: 4, label: 'Hasil Selesai' },
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
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 font-mono">
              Daftar Pesanan Ditemukan ({displayedOrders.length})
            </h3>
            <button
              onClick={onGoToBooking}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>+ Booking Sesi Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedOrders.map((order) => {
              const { steps, currentStep } = getStepProgress(order.status);
              const waLink = generateWhatsAppLink(order);

              return (
                <div
                  key={order.id}
                  className="bg-[#121212] border border-white/10 hover:border-[#D4AF37]/50 transition-all p-5 sm:p-6 relative flex flex-col justify-between"
                  id={`order-card-${order.id}`}
                >
                  <div>
                    {/* Top Row: ID & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#D4AF37] tracking-wider">
                          {order.id}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Dipesan pada {formatDateIndonesian(order.createdAt)}
                        </p>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    {/* Progress Stepper */}
                    {order.status !== 'Dibatalkan' && (
                      <div className="mb-6 p-3.5 bg-[#171717] border border-white/5">
                        <div className="grid grid-cols-4 gap-1 relative">
                          {steps.map((step) => {
                            const isCompleted = step.id <= currentStep;
                            const isCurrent = step.id === currentStep;

                            return (
                              <div key={step.id} className="text-center">
                                <div
                                  className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-[10px] font-mono font-bold mb-1.5 transition-colors ${
                                    isCurrent
                                      ? 'bg-[#D4AF37] text-black ring-2 ring-[#D4AF37]/30'
                                      : isCompleted
                                      ? 'bg-emerald-500 text-black'
                                      : 'bg-white/10 text-gray-500'
                                  }`}
                                >
                                  {step.id}
                                </div>
                                <p
                                  className={`text-[9px] sm:text-[10px] leading-tight ${
                                    isCurrent
                                      ? 'text-[#D4AF37] font-semibold'
                                      : isCompleted
                                      ? 'text-gray-300'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {step.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Package & Schedule Info */}
                    <div className="space-y-3 mb-6">
                      <div className="p-3 bg-[#1A1A1A] border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-gray-400 uppercase">Paket Foto</span>
                          <span className="text-xs font-bold text-white">{order.packageName}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                          <span className="text-[11px] text-gray-400">Total Investasi</span>
                          <span className="text-xs font-bold text-[#D4AF37] font-mono">
                            {formatRupiah(order.totalPrice)} ({order.paymentPreference})
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-300 p-2.5 bg-black/40 border border-white/5">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" />
                          <span>{formatDateIndonesian(order.sessionDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 p-2.5 bg-black/40 border border-white/5">
                          <Clock className="w-4 h-4 text-[#D4AF37]" />
                          <span>{order.sessionTime}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-gray-300 p-2.5 bg-black/40 border border-white/5">
                        <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-white uppercase text-[11px]">
                            Lokasi ({order.locationType}):
                          </span>{' '}
                          <span className="text-gray-400">{order.locationAddress}</span>
                        </div>
                      </div>

                      {order.addOnsText && order.addOnsText !== 'Tidak ada' && (
                        <div className="text-xs text-gray-400 p-2 bg-white/5">
                          <span className="text-gray-300 font-semibold">Layanan Tambahan:</span> {order.addOnsText}
                        </div>
                      )}

                      {/* Google Drive Photo Deliverables Link */}
                      {order.driveFolderUrl ? (
                        <div className="p-3 bg-gradient-to-r from-[#D4AF37]/15 to-emerald-500/10 border border-[#D4AF37]/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase font-bold text-[#D4AF37] flex items-center gap-1.5">
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Hasil Foto Google Drive Tersedia</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                              SIAP UNDUH
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300">
                            Folder Google Drive berisi file foto resolusi tinggi, hasil color grading, dan siap cetak.
                          </p>
                          <a
                            href={order.driveFolderUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full py-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            id={`open-drive-portal-${order.id}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Buka & Unduh Foto di Google Drive</span>
                          </a>
                        </div>
                      ) : (
                        (order.status === 'Selesai' || order.status === 'Proses Editing') && (
                          <div className="p-2.5 bg-white/[0.02] border border-white/10 text-[11px] text-gray-400 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span>Foto sedang dalam tahap kurasi/unggah ke Google Drive Cloud studio.</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => printReceipt(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-white/15 text-xs font-mono uppercase tracking-wider cursor-pointer"
                      id={`print-receipt-${order.id}`}
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Cetak Bukti</span>
                    </button>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md"
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

      {/* Digital Receipt / Invoice Modal */}
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
              <div className="border-b-2 border-[#D4AF37]/50 pb-4 flex justify-between items-end">
                <div>
                  <div className="text-xl font-bold tracking-widest text-white">
                    DIMENSI<span className="text-[#D4AF37]">STUDIO</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">Studio & Outdoor Photography</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Bukti Reservasi</div>
                  <div className="text-xs font-mono font-bold text-[#D4AF37]">{selectedOrder.id}</div>
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
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                id="btn-print-receipt-action"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
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
        </div>
      )}
    </section>
  );
};
