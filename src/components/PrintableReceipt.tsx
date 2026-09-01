import React from 'react';
import { BookingOrder, StudioConfig } from '../types';
import { STUDIO_INFO } from '../data/mockData';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import { getResolvedBankAccounts, getBankPreset } from '../utils/bankOptions';
import { DEFAULT_STUDIO_CONFIG } from '../firebase/services';

interface PrintableReceiptProps {
  order: BookingOrder;
  studioConfig?: StudioConfig;
  selectedBankId?: string;
  className?: string;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  order,
  studioConfig,
  selectedBankId,
  className = '',
}) => {
  const activeConfig: StudioConfig = studioConfig || DEFAULT_STUDIO_CONFIG;
  const studioName = activeConfig.studioName || STUDIO_INFO.name || 'DIMENSI FOTOGRAFI STUDIO';
  const studioAddress = activeConfig.address || STUDIO_INFO.address || 'Jl. Fotografi No. 88, Studio Creative Hub';
  const studioWhatsApp = activeConfig.whatsapp || activeConfig.phone || (activeConfig as any).masterPhone || STUDIO_INFO.whatsapp || '081234567890';
  const studioEmail = activeConfig.email || STUDIO_INFO.email || 'dimensi.idphoto@gmail.com';
  const studioInstagram = activeConfig.instagram || '@dimensifotografi';

  const allBanks = getResolvedBankAccounts(activeConfig);
  const activeBanks = allBanks.filter((b) => b.isActive !== false);
  const displayBanks = activeBanks.length > 0 ? activeBanks : allBanks;

  // Selected bank or primary bank or first bank
  const primaryBank = displayBanks.find((b) => b.id === selectedBankId) ||
    displayBanks.find((b) => b.isPrimary) ||
    displayBanks[0];

  const isLunas = order.paymentPreference === 'Lunas';
  const isDP30 = order.paymentPreference === 'DP 30%';
  const dpRatio = isLunas ? 1.0 : (isDP30 ? 0.3 : 0.5);
  const dpAmount = Math.round(order.totalPrice * dpRatio);
  const dpLabel = isLunas
    ? 'Ketentuan Pembayaran (Lunas 100%):'
    : (isDP30 ? 'Minimal DP (30% untuk kunci jadwal):' : 'Minimal DP (50% untuk kunci jadwal):');

  return (
    <div
      className={`printable-receipt-container bg-white text-black pt-2 px-3 pb-2.5 font-sans text-[9px] leading-tight border-[1.5px] border-black ${className}`}
      id={`receipt-${order.id}`}
      style={{ maxWidth: '148mm', margin: '0 auto' }}
    >
      {/* 1. Header: Studio Brand & Receipt Title */}
      <div className="flex justify-between items-start border-b-[1.5px] border-black pb-2 mb-2">
        <div>
          <div className="text-sm font-extrabold font-serif tracking-wider uppercase text-black">
            {studioName}
          </div>
          <div className="text-[7.5px] uppercase font-mono text-gray-700 tracking-widest mt-0.5">
            Professional Photography & Visual Studio
          </div>
          <div className="text-[8px] text-gray-800 mt-0.5 max-w-xs leading-tight">
            {studioAddress}
          </div>
          <div className="text-[8px] text-gray-800 font-mono mt-0.5">
            WA: <span className="font-bold">{studioWhatsApp}</span> | IG: {studioInstagram}
          </div>
        </div>

        <div className="text-right border-l-[1.5px] border-black pl-2.5 min-w-[140px]">
          <div className="text-[8.5px] font-bold font-mono uppercase tracking-wider text-black bg-gray-200 px-1.5 py-0.5 inline-block mb-0.5 border border-black">
            NOTA RESERVASI (A5)
          </div>
          <div className="text-[10px] font-mono font-bold text-black mt-0.5">
            No: <span className="text-xs font-bold tracking-wider">{order.id}</span>
          </div>
          <div className="text-[8px] font-mono text-gray-700">
            Tgl: {new Date(order.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="mt-0.5">
            <span className="text-[7.5px] font-mono font-bold uppercase px-1.5 py-0.5 bg-black text-white">
              STATUS: {order.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Customer Information & Session Schedule (2 Columns) */}
      <div className="grid grid-cols-2 gap-2 mb-2 text-[8.5px] bg-gray-50 p-1.5 border border-gray-300">
        <div className="space-y-0.5">
          <div className="text-[8px] font-bold font-mono uppercase text-gray-700 border-b border-gray-300 pb-0.5">
            DATA KONSUMEN / PEMESAN
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nama Klien:</span>
            <span className="font-bold text-black">{order.clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">WhatsApp:</span>
            <span className="font-mono font-bold text-black">{order.phone}</span>
          </div>
          {order.email && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-black truncate max-w-[90px]">{order.email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Ketentuan:</span>
            <span className="font-mono text-black font-semibold">{order.paymentPreference}</span>
          </div>
        </div>

        <div className="space-y-0.5 border-l border-gray-300 pl-2">
          <div className="text-[8px] font-bold font-mono uppercase text-gray-700 border-b border-gray-300 pb-0.5">
            JADWAL & LOKASI SESI
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tgl Sesi:</span>
            <span className="font-bold text-black">{formatDateIndonesian(order.sessionDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Waktu:</span>
            <span className="font-mono font-bold text-black">{order.sessionTime} WIB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lokasi:</span>
            <span className="font-semibold text-black uppercase">{order.locationType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Alamat:</span>
            <span className="text-black truncate max-w-[100px] text-right font-medium">{order.locationAddress}</span>
          </div>
        </div>
      </div>

      {/* 3. Itemized Pricing Table */}
      <div className="mb-2">
        <table className="w-full text-left border-collapse border border-black text-[8.5px]">
          <thead>
            <tr className="bg-gray-200 border-b border-black text-[8px] font-mono uppercase">
              <th className="p-1 border-r border-black w-6 text-center">No</th>
              <th className="p-1 border-r border-black">Deskripsi Paket / Layanan</th>
              <th className="p-1 border-r border-black text-center w-16">Kategori</th>
              <th className="p-1 text-right w-20">Biaya (IDR)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="p-1 border-r border-black text-center font-mono">1</td>
              <td className="p-1 border-r border-black font-semibold">
                {order.packageName}
                {order.notes && (
                  <div className="text-[7.5px] font-normal text-gray-600 italic">
                    Catatan: {order.notes}
                  </div>
                )}
              </td>
              <td className="p-1 border-r border-black text-center font-mono uppercase text-[7.5px]">
                Paket Utama
              </td>
              <td className="p-1 text-right font-mono font-bold">
                {formatRupiah(order.packagePrice)}
              </td>
            </tr>

            {order.addOnsTotal > 0 && (
              <tr className="border-b border-gray-300 bg-gray-50">
                <td className="p-1 border-r border-black text-center font-mono">2</td>
                <td className="p-1 border-r border-black">
                  <span className="font-semibold">Layanan Tambahan (Add-ons)</span>
                  <div className="text-[7.5px] text-gray-600">{order.addOnsText}</div>
                </td>
                <td className="p-1 border-r border-black text-center font-mono uppercase text-[7.5px]">
                  Tambahan
                </td>
                <td className="p-1 text-right font-mono font-bold">
                  +{formatRupiah(order.addOnsTotal)}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold border-t border-black">
              <td colSpan={3} className="p-1 border-r border-black text-right uppercase text-[8px] font-mono">
                Total Biaya:
              </td>
              <td className="p-1 text-right font-mono text-[10px] font-bold text-black">
                {formatRupiah(order.totalPrice)}
              </td>
            </tr>
            <tr className="bg-gray-50 text-[7.5px] border-t border-gray-300">
              <td colSpan={3} className="p-0.5 border-r border-black text-right text-gray-700">
                {dpLabel}
              </td>
              <td className="p-0.5 text-right font-mono font-bold text-black">
                {formatRupiah(dpAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. Official Bank Account for Transfer & Payment Notice */}
      <div className="grid grid-cols-2 gap-2 mb-2 p-1.5 bg-gray-50 border border-black text-[8px]">
        <div>
          <div className="text-[8px] font-mono font-bold uppercase text-gray-800 border-b border-gray-300 pb-0.5 mb-0.5">
            REKENING PEMBAYARAN:
          </div>
          {primaryBank ? (
            <div className="space-y-0.5">
              <div className="font-bold text-black font-mono text-[8.5px]">
                {primaryBank.bankName} ({primaryBank.bankCode})
              </div>
              <div className="font-mono text-[10px] font-bold text-black tracking-wider bg-white px-1.5 py-0.5 border border-gray-400 inline-block my-0.5">
                {primaryBank.accountNumber}
              </div>
              <div className="text-[7.5px] text-gray-700">
                A/N: <span className="font-bold text-black">{primaryBank.accountHolder}</span>
              </div>
            </div>
          ) : (
            <div className="text-[8px] text-gray-600 font-mono">
              Bank BCA: 123-456-7890 a.n Dimensi Fotografi
            </div>
          )}
        </div>

        <div className="text-[7.5px] text-gray-700 border-l border-gray-300 pl-2 space-y-0.5">
          <div className="font-bold font-mono uppercase text-gray-800 border-b border-gray-300 pb-0.5">
            KETENTUAN SESI:
          </div>
          <p>1. Tiba di studio/lokasi <strong>15 menit sebelum</strong> sesi.</p>
          <p>2. Konfirmasi bukti DP via WA: <strong>{studioWhatsApp}</strong>.</p>
          <p>3. File Google Drive dikirim setelah pelunasan.</p>
        </div>
      </div>

      {/* QRIS Payment Guide Section (if configured) */}
      {activeConfig.qrisUrl && (
        <div className="mb-2 p-1.5 bg-gray-50 border border-black flex items-center gap-2.5">
          <div className="shrink-0 text-center">
            <img
              src={activeConfig.qrisUrl}
              alt="QRIS Studio"
              className="w-16 h-16 object-contain bg-white border border-black p-0.5"
            />
            <div className="text-[6px] font-mono uppercase font-bold mt-0.5">SCAN QRIS</div>
          </div>
          <div className="text-[7.5px] text-gray-800 space-y-0.5">
            <div className="font-bold font-mono uppercase text-black">
              Panduan Pembayaran Instan (QRIS):
            </div>
            <p>1. Buka aplikasi m-Banking atau e-Wallet (BCA, GoPay, OVO, Dana, ShopeePay).</p>
            <p>2. Pilih menu <strong>Scan QR / QRIS</strong> dan arahkan kamera ke kode QR di samping.</p>
            <p>3. Masukkan nominal transfer sesuai tagihan, lalu konfirmasi pembayaran.</p>
          </div>
        </div>
      )}

      {/* 5. Signatures & Footer Acknowledgement */}
      <div className="pt-1.5 border-t border-black flex justify-between items-end text-[7.5px] text-gray-700">
        <div className="text-center w-24">
          <div>Pemesan / Klien,</div>
          <div className="h-6"></div>
          <div className="font-bold text-black border-t border-gray-400 pt-0.5">
            ({order.clientName})
          </div>
        </div>

        <div className="text-center text-[7px] text-gray-500 max-w-[140px]">
          <div>Nota resmi diterbitkan oleh {studioName}.</div>
          <div className="font-mono mt-0.5">ID: {order.id} | Valid</div>
        </div>

        <div className="text-center w-24">
          <div>Admin Studio,</div>
          <div className="h-6 flex items-center justify-center">
            <span className="text-[6.5px] font-mono font-bold uppercase text-gray-600 border border-gray-400 px-1 py-0.2">
              VERIFIED
            </span>
          </div>
          <div className="font-bold text-black border-t border-gray-400 pt-0.5">
            ({studioName})
          </div>
        </div>
      </div>
    </div>
  );
};
