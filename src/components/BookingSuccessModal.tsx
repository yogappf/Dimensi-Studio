import React, { useState } from 'react';
import { BookingOrder, StudioConfig } from '../types';
import { STUDIO_INFO } from '../data/mockData';
import { formatRupiah, formatDateIndonesian, generateWhatsAppLink, normalizeWhatsAppNumber } from '../utils/formatters';
import {
  CheckCircle,
  MessageCircle,
  Printer,
  X,
  CreditCard,
  Copy,
  Check,
  Building,
  QrCode,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

interface BookingSuccessModalProps {
  order: BookingOrder | null;
  onClose: () => void;
  studioConfig?: StudioConfig;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  order,
  onClose,
  studioConfig,
}) => {
  if (!order) return null;

  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedBankKey, setSelectedBankKey] = useState<string>('bca');
  const [paymentSenderName, setPaymentSenderName] = useState<string>('');

  // Determine active studio configuration
  const activeConfig = studioConfig || {
    studioName: STUDIO_INFO.name,
    whatsapp: STUDIO_INFO.whatsapp,
    phone: STUDIO_INFO.phone,
    email: STUDIO_INFO.email,
    address: STUDIO_INFO.address,
    bankBCA: 'BCA: 123-456-7890 a.n Dimensi Fotografi',
    bankMandiri: 'Mandiri: 137-00-1234567-8 a.n Dimensi Studio',
    bankBRI: 'BRI: 0123-01-001234-53-0 a.n Dimensi ID',
  };

  const adminWhatsApp = activeConfig.whatsapp || activeConfig.phone || (activeConfig as any).masterPhone || STUDIO_INFO.whatsapp;

  // Parse bank strings into structured objects
  const parseBankInfo = (bankStr: string, defaultName: string) => {
    if (!bankStr) return { bankName: defaultName, accountNumber: '', accountHolder: '' };
    // Example format: "BCA: 123-456-7890 a.n Dimensi Fotografi" or "123-456-7890 a.n Dimensi"
    const parts = bankStr.split(':');
    let bankName = defaultName;
    let rest = bankStr;
    if (parts.length > 1) {
      bankName = parts[0].trim();
      rest = parts.slice(1).join(':').trim();
    }
    const anParts = rest.split(/a\.?n\.?/i);
    const accountNumber = anParts[0].trim();
    const accountHolder = anParts[1] ? anParts[1].trim() : 'Dimensi Fotografi Studio';
    return { bankName, accountNumber, accountHolder, raw: bankStr };
  };

  const bankList = [
    {
      key: 'bca',
      code: 'BCA',
      ...parseBankInfo(activeConfig.bankBCA || 'BCA: 123-456-7890 a.n Dimensi Fotografi', 'Bank BCA'),
      color: 'border-blue-500/40 hover:border-blue-400 bg-blue-950/20 text-blue-300',
      badgeBg: 'bg-blue-600 text-white',
    },
    {
      key: 'mandiri',
      code: 'Mandiri',
      ...parseBankInfo(activeConfig.bankMandiri || 'Mandiri: 137-00-1234567-8 a.n Dimensi Studio', 'Bank Mandiri'),
      color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/20 text-amber-300',
      badgeBg: 'bg-amber-600 text-white',
    },
    {
      key: 'bri',
      code: 'BRI',
      ...parseBankInfo(activeConfig.bankBRI || 'BRI: 0123-01-001234-53-0 a.n Dimensi ID', 'Bank BRI'),
      color: 'border-sky-500/40 hover:border-sky-400 bg-sky-950/20 text-sky-300',
      badgeBg: 'bg-sky-600 text-white',
    },
  ];

  const handleCopyAccountNumber = (textToCopy: string, bankKey: string) => {
    // Only copy clean numbers and dashes
    const cleanNumber = textToCopy.replace(/[^0-9-]/g, '') || textToCopy;
    try {
      navigator.clipboard.writeText(cleanNumber);
      setCopiedBank(bankKey);
      setTimeout(() => setCopiedBank(null), 3000);
    } catch {
      // Fallback
    }
  };

  const selectedBankObj = bankList.find((b) => b.key === selectedBankKey) || bankList[0];
  const dpAmount = Math.round(order.totalPrice * 0.5);

  const waLink = generateWhatsAppLink(
    order,
    adminWhatsApp,
    {
      selectedBank: selectedBankObj ? `${selectedBankObj.bankName} (${selectedBankObj.accountNumber})` : undefined,
      transferProofNote: paymentSenderName ? `Pengirim Rekening: ${paymentSenderName}` : undefined,
    }
  );

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/60 p-5 sm:p-7 shadow-2xl text-[#E0E0E0] my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/60 border border-white/10 text-gray-400 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer z-10"
          id="close-success-modal-btn"
          title="Tutup Nota"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center pb-5 border-b border-white/10">
          <div className="w-13 h-13 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-2.5">
            <CheckCircle className="w-7 h-7 stroke-[2]" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            Pendaftaran Berhasil Terdata
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
            Nota & Panduan Pembayaran Studio
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-lg mx-auto">
            Terima kasih, <strong className="text-white">{order.clientName}</strong>! Pesanan Anda telah tersimpan dengan nomor booking di bawah ini.
          </p>
        </div>

        {/* SECTION 1: REKENING RESMI PEMBAYARAN STUDIO */}
        <div className="mt-5 p-4 sm:p-5 bg-gradient-to-b from-[#1c1708] to-[#121212] border-2 border-[#D4AF37]/60 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4AF37]/30 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#D4AF37] text-black">
                <CreditCard className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Nomor Rekening Pembayaran Studio
                </h4>
                <p className="text-[11px] text-gray-300">
                  Pilih salah satu rekening resmi di bawah untuk transfer DP / Pelunasan:
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 self-start sm:self-auto">
              RESMI & TERVERIFIKASI
            </span>
          </div>

          {/* Bank Account Selection & Copy Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {bankList.map((bank) => {
              const isSelected = selectedBankKey === bank.key;
              const isCopied = copiedBank === bank.key;

              return (
                <div
                  key={bank.key}
                  onClick={() => setSelectedBankKey(bank.key)}
                  className={`p-3 border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1e1a0d] border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/50'
                      : 'bg-[#101010] border-white/10 hover:border-white/25 hover:bg-[#161616]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${bank.badgeBg}`}>
                        {bank.code}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-[#D4AF37] font-mono font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Dipilih
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono">No. Rekening:</div>
                    <div className="text-sm font-bold font-mono text-white tracking-wider my-0.5 truncate select-all">
                      {bank.accountNumber || '-'}
                    </div>

                    <div className="text-[10px] text-gray-400 truncate">
                      a.n <span className="text-gray-200 font-medium">{bank.accountHolder}</span>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAccountNumber(bank.accountNumber, bank.key);
                      }}
                      className={`w-full py-1.5 px-2 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500 text-black'
                          : 'bg-[#1f1f1f] hover:bg-[#D4AF37] hover:text-black text-gray-200 border border-white/10'
                      }`}
                      title="Salin Nomor Rekening"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin No Rek</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amount to transfer box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-[#0c0c0c] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-400 block">Minimal DP (50%):</span>
                <span className="text-base font-bold font-serif text-[#D4AF37]">
                  {formatRupiah(dpAmount)}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono text-right">Untuk kunci slot fotografer</span>
            </div>

            <div className="p-3 bg-[#0c0c0c] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-gray-400 block">Total Pelunasan:</span>
                <span className="text-base font-bold font-serif text-white">
                  {formatRupiah(order.totalPrice)}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono text-right">Bisa dilunasi saat hari-H</span>
            </div>
          </div>

          {/* Input nama rekening pengirim / bukti konfirmasi */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-300 mb-1">
              Nama Pemilik Rekening Pengirim (Opsional untuk WhatsApp):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paymentSenderName}
                onChange={(e) => setPaymentSenderName(e.target.value)}
                placeholder="Contoh: Transfer a.n Budi Santoso / Bank BCA"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/20 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DIGITAL RECEIPT SUMMARY */}
        <div className="mt-5 p-4 bg-[#0A0A0A] border border-white/10 space-y-3.5 print:border-black print:text-black">
          {/* Booking ID & Time badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block">ID Pemesanan:</span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#D4AF37]">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block">Tanggal Order:</span>
              <span className="text-xs text-gray-300 font-mono">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })} WIB
              </span>
            </div>
          </div>

          {/* Details 2-columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Jadwal Sesi Foto:</span>
                <span className="font-semibold text-white">
                  {formatDateIndonesian(order.sessionDate)} ({order.sessionTime})
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Lokasi Sesi:</span>
                <span className="text-gray-300">{order.locationAddress}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase font-mono block">Status:</span>
                <span className="inline-block px-2 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-mono font-bold uppercase">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized calculation */}
          <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs">
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
              <span className="text-xs uppercase tracking-wider">Total Biaya:</span>
              <span className="text-xl font-serif text-[#D4AF37]">{formatRupiah(order.totalPrice)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="p-2 bg-[#141414] border border-white/10 text-[11px] text-gray-300">
              <span className="font-semibold text-white">Catatan Khusus: </span>
              {order.notes}
            </div>
          )}
        </div>

        {/* SECTION 3: ACTION BUTTONS (WHATSAPP + PRINT + CLOSE) */}
        <div className="mt-5 space-y-2.5">
          {/* Main WhatsApp Send CTA */}
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer"
            id="modal-send-wa-btn"
          >
            <MessageCircle className="w-5 h-5 fill-black" />
            <span>Kirim Rincian Pemesanan & Konfirmasi WhatsApp</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              id="modal-print-btn"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-3 bg-[#0A0A0A] hover:bg-white/10 text-gray-300 border border-white/15 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              id="modal-done-btn"
            >
              <span>Selesai</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
