import React from 'react';
import { BookingOrder } from '../types';
import { STUDIO_INFO } from '../data/mockData';
import { formatRupiah, formatDateIndonesian, generateWhatsAppLink } from '../utils/formatters';
import { CheckCircle, MessageCircle, Printer, X, Sparkles, Share2, Calendar, MapPin, Phone, User, Clock } from 'lucide-react';

interface BookingSuccessModalProps {
  order: BookingOrder | null;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const waLink = generateWhatsAppLink(order, STUDIO_INFO.whatsapp);

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/60 p-6 sm:p-8 shadow-2xl text-[#E0E0E0] my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-white hover:border-[#D4AF37] transition-colors"
          id="close-success-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center pb-6 border-b border-white/10">
          <div className="w-14 h-14 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 stroke-[2]" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Pendaftaran Berhasil Terdata</span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Nota Digital Pemesanan Foto
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Terima kasih, <strong className="text-white">{order.clientName}</strong>! Booking Anda telah tersimpan di sistem Dimensi Studio.
          </p>
        </div>

        {/* Digital Receipt Card */}
        <div className="mt-6 p-5 bg-[#0A0A0A] border border-white/10 space-y-4 print:border-black print:text-black">
          
          {/* Booking ID & Time badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block">Nomor ID Booking:</span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#D4AF37]">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block">Waktu Pendaftaran:</span>
              <span className="text-xs text-gray-300 font-mono">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} WIB
              </span>
            </div>
          </div>

          {/* Details 2-columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Nama Klien:</span>
                <span className="font-semibold text-white">{order.clientName}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Nomor WhatsApp:</span>
                <span className="font-semibold text-white font-mono">{order.phone}</span>
              </div>
              {order.email && (
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-mono block">Email:</span>
                  <span className="text-gray-300">{order.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Tanggal & Waktu Sesi:</span>
                <span className="font-semibold text-white">
                  {formatDateIndonesian(order.sessionDate)} ({order.sessionTime})
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Lokasi Pemotretan:</span>
                <span className="text-gray-300">{order.locationAddress}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Status Pesanan:</span>
                <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-mono font-bold uppercase">
                  {order.status}
                </span>
              </div>
            </div>

          </div>

          {/* Itemized calculation */}
          <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-gray-300">
              <span>{order.packageName}</span>
              <span className="font-semibold font-serif text-white">{formatRupiah(order.packagePrice)}</span>
            </div>

            {order.addOnsTotal > 0 && (
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span className="max-w-[320px]">Tambahan: {order.addOnsText}</span>
                <span className="text-[#D4AF37] font-serif">+{formatRupiah(order.addOnsTotal)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-400 text-[11px]">
              <span>Ketentuan Bayar:</span>
              <span className="font-mono text-white">{order.paymentPreference}</span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-white/10 text-white font-bold">
              <span className="text-xs uppercase tracking-wider">Total Biaya Sesi:</span>
              <span className="text-xl font-serif text-[#D4AF37]">{formatRupiah(order.totalPrice)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="p-2.5 bg-[#141414] border border-white/10 text-[11px] text-gray-300">
              <span className="font-semibold text-white">Catatan Khusus: </span>
              {order.notes}
            </div>
          )}

        </div>

        {/* Action CTAs */}
        <div className="mt-6 space-y-3">
          {/* Main WhatsApp Send CTA */}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
            id="modal-send-wa-btn"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Kirim Rincian Pemesanan via WhatsApp</span>
          </a>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              id="modal-print-btn"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Cetak Nota</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-3 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              id="modal-done-btn"
            >
              <span>Tutup</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
