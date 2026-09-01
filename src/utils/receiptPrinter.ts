import { BookingOrder, StudioConfig } from '../types';
import { STUDIO_INFO } from '../data/mockData';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import { getResolvedBankAccounts } from '../utils/bankOptions';
import { DEFAULT_STUDIO_CONFIG } from '../firebase/services';

/**
 * Generates standalone clean HTML string for 1-Page A5 (Half A4) Studio Receipt
 */
export function generateReceiptHTML(order: BookingOrder, studioConfig?: StudioConfig, selectedBankId?: string): string {
  const activeConfig: StudioConfig = studioConfig || DEFAULT_STUDIO_CONFIG;
  const studioName = activeConfig.studioName || STUDIO_INFO.name || 'DIMENSI FOTOGRAFI STUDIO';
  const studioAddress = activeConfig.address || STUDIO_INFO.address || 'Jl. Fotografi No. 88, Studio Creative Hub';
  const studioWhatsApp = activeConfig.whatsapp || activeConfig.phone || (activeConfig as any).masterPhone || STUDIO_INFO.whatsapp || '081234567890';
  const studioEmail = activeConfig.email || STUDIO_INFO.email || 'dimensi.idphoto@gmail.com';
  const studioInstagram = activeConfig.instagram || '@dimensifotografi';

  const allBanks = getResolvedBankAccounts(activeConfig);
  const activeBanks = allBanks.filter((b) => b.isActive !== false);
  const displayBanks = activeBanks.length > 0 ? activeBanks : allBanks;

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
  const orderDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota Reservasi - ${order.id} - ${order.clientName}</title>
  <style>
    @page {
      size: A5 portrait;
      margin: 3mm 5mm 4mm 5mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f4f5;
      color: #18181b;
      padding: 4px 8px 12px 8px;
      font-size: 9.5px;
      line-height: 1.35;
    }
    .receipt-card {
      background: #ffffff;
      max-width: 148mm;
      width: 100%;
      min-height: auto;
      margin: 0 auto;
      padding: 8px 12px;
      border: 1.5px solid #18181b;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
    .header-table {
      width: 100%;
      border-bottom: 1.5px solid #18181b;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .studio-title {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #09090b;
      font-family: Georgia, serif;
    }
    .studio-subtitle {
      font-size: 7.5px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #52525b;
      font-weight: 700;
      margin-top: 1px;
    }
    .studio-meta {
      font-size: 8.5px;
      color: #3f3f46;
      margin-top: 2px;
      line-height: 1.25;
    }
    .doc-badge {
      display: inline-block;
      background: #e4e4e7;
      border: 1px solid #18181b;
      padding: 2px 6px;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #fafafa;
      border: 1px solid #d4d4d8;
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .info-section-title {
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #52525b;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 2px;
      margin-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 9px;
    }
    .info-label {
      color: #71717a;
    }
    .info-value {
      font-weight: 600;
      color: #09090b;
    }
    .table-items {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #18181b;
      margin-bottom: 8px;
    }
    .table-items th {
      background: #f4f4f5;
      border: 1px solid #18181b;
      padding: 4px 6px;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }
    .table-items td {
      border: 1px solid #e4e4e7;
      padding: 5px 6px;
      font-size: 9px;
    }
    .bank-box {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 8px;
      background: #fafafa;
      border: 1px solid #18181b;
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .footer-signs {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 6px;
      border-top: 1px solid #18181b;
      margin-top: 6px;
      font-size: 8.5px;
    }
    .action-bar {
      max-width: 148mm;
      margin: 0 auto 6px auto;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .btn {
      background: #18181b;
      color: #ffffff;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }
    .btn-gold {
      background: #d4af37;
      color: #000000;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .receipt-card {
        border: 1.5px solid #000000 !important;
        box-shadow: none !important;
        padding: 4px 8px 6px 8px !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 148mm !important;
      }
      .action-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="btn btn-gold" onclick="window.print()">🖨️ Cetak / Simpan PDF (A5)</button>
    <button class="btn" onclick="window.close()">Tutup Jendela</button>
  </div>

  <div class="receipt-card">
    <!-- Header -->
    <table style="width: 100%; border-bottom: 1.5px solid #18181b; padding-bottom: 6px; margin-bottom: 8px;">
      <tr>
        <td style="vertical-align: top;">
          <div class="studio-title">${studioName}</div>
          <div class="studio-subtitle">Professional Photography & Studio Services</div>
          <div class="studio-meta">${studioAddress}</div>
          <div class="studio-meta">WA: <strong>${studioWhatsApp}</strong> | IG: ${studioInstagram}</div>
        </td>
        <td style="vertical-align: top; text-align: right; width: 170px; border-left: 1.5px solid #18181b; padding-left: 8px;">
          <div class="doc-badge">NOTA RESERVASI (A5)</div>
          <div style="font-size: 11px; font-weight: 800; margin-top: 2px; font-family: monospace;">
            NO: ${order.id}
          </div>
          <div style="font-size: 8px; color: #52525b; margin-top: 1px;">Tgl: ${orderDate}</div>
          <div style="margin-top: 2px;">
            <span style="background: #18181b; color: #fff; padding: 1.5px 5px; font-size: 8px; font-weight: bold; text-transform: uppercase;">
              STATUS: ${order.status.toUpperCase()}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Info Grid -->
    <div class="info-grid">
      <div>
        <div class="info-section-title">DATA KONSUMEN / PEMESAN</div>
        <div class="info-row">
          <span class="info-label">Nama:</span>
          <span class="info-value">${order.clientName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">WhatsApp:</span>
          <span class="info-value">${order.phone}</span>
        </div>
        ${order.email ? `
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${order.email}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="info-label">Ketentuan:</span>
          <span class="info-value">${order.paymentPreference}</span>
        </div>
      </div>

      <div style="border-left: 1px solid #e4e4e7; padding-left: 8px;">
        <div class="info-section-title">JADWAL & LOKASI SESI</div>
        <div class="info-row">
          <span class="info-label">Tgl Sesi:</span>
          <span class="info-value">${formatDateIndonesian(order.sessionDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Waktu:</span>
          <span class="info-value">${order.sessionTime} WIB</span>
        </div>
        <div class="info-row">
          <span class="info-label">Lokasi:</span>
          <span class="info-value" style="text-transform: uppercase;">${order.locationType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Alamat:</span>
          <span class="info-value truncate" style="max-width: 110px; text-align: right;">${order.locationAddress}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="table-items">
      <thead>
        <tr>
          <th style="width: 24px; text-align: center;">No</th>
          <th>Deskripsi Paket / Layanan</th>
          <th style="width: 70px; text-align: center;">Kategori</th>
          <th style="width: 95px; text-align: right;">Biaya (IDR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: bold;">1</td>
          <td>
            <strong>${order.packageName}</strong>
            ${order.notes ? `<div style="font-size: 8px; color: #52525b; font-style: italic;">Catatan: ${order.notes}</div>` : ''}
          </td>
          <td style="text-align: center; font-size: 8px; text-transform: uppercase;">Paket Utama</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace;">${formatRupiah(order.packagePrice)}</td>
        </tr>
        ${order.addOnsTotal > 0 ? `
        <tr style="background: #fafafa;">
          <td style="text-align: center; font-weight: bold;">2</td>
          <td>
            <strong>Layanan Tambahan (Add-ons)</strong>
            <div style="font-size: 8px; color: #52525b;">${order.addOnsText}</div>
          </td>
          <td style="text-align: center; font-size: 8px; text-transform: uppercase;">Tambahan</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace;">+${formatRupiah(order.addOnsTotal)}</td>
        </tr>` : ''}
      </tbody>
      <tfoot>
        <tr style="background: #f4f4f5; font-weight: bold; border-top: 1.5px solid #18181b;">
          <td colspan="3" style="text-align: right; text-transform: uppercase; font-size: 9px;">TOTAL BIAYA:</td>
          <td style="text-align: right; font-size: 11px; font-weight: 800; font-family: monospace; color: #09090b;">${formatRupiah(order.totalPrice)}</td>
        </tr>
        <tr style="background: #fafafa; font-size: 8px;">
          <td colspan="3" style="text-align: right; color: #52525b;">${dpLabel}</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace; color: #18181b;">${formatRupiah(dpAmount)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Bank & Instructions -->
    <div class="bank-box">
      <div>
        <div class="info-section-title">REKENING PEMBAYARAN STUDIO</div>
        ${primaryBank ? `
          <div style="font-weight: bold; font-size: 9.5px;">${primaryBank.bankName} (${primaryBank.bankCode})</div>
          <div style="font-size: 11px; font-weight: 800; font-family: monospace; letter-spacing: 0.5px; margin: 1px 0; background: #ffffff; display: inline-block; padding: 1px 4px; border: 1px solid #d4d4d8;">
            ${primaryBank.accountNumber}
          </div>
          <div style="font-size: 8.5px; color: #3f3f46;">A/N: <strong>${primaryBank.accountHolder}</strong></div>
        ` : `
          <div style="font-size: 9px;">Bank BCA: 123-456-7890 a.n Dimensi Fotografi</div>
        `}
      </div>

      <div style="border-left: 1px solid #e4e4e7; padding-left: 8px; font-size: 8px; color: #3f3f46; line-height: 1.25;">
        <div class="info-section-title">KETENTUAN SESI</div>
        <p>1. Tiba <strong>15 menit sebelum</strong> sesi.</p>
        <p>2. Konfirmasi DP via WA: <strong>${studioWhatsApp}</strong>.</p>
        <p>3. File Google Drive dikirim setelah pelunasan.</p>
      </div>
    </div>

    ${activeConfig.qrisUrl ? `
      <!-- QRIS Guide Box -->
      <div style="margin-top: 8px; padding: 6px 8px; background: #fafafa; border: 1.5px solid #18181b; display: flex; align-items: center; gap: 10px;">
        <div style="text-align: center; flex-shrink: 0;">
          <img src="${activeConfig.qrisUrl}" alt="QRIS Studio" style="width: 56px; height: 56px; object-fit: contain; background: #fff; border: 1px solid #18181b; padding: 1px;" />
          <div style="font-size: 6px; font-family: monospace; font-weight: bold; text-transform: uppercase; margin-top: 1px;">SCAN QRIS</div>
        </div>
        <div style="font-size: 7.5px; color: #27272a; line-height: 1.25;">
          <div style="font-weight: bold; font-family: monospace; text-transform: uppercase; color: #09090b; margin-bottom: 2px;">
            Panduan Pembayaran Instan (QRIS):
          </div>
          <p>1. Buka aplikasi m-Banking atau e-Wallet (BCA, GoPay, OVO, Dana, ShopeePay).</p>
          <p>2. Pilih menu <strong>Scan QR / QRIS</strong> dan arahkan kamera ke kode QR di samping.</p>
          <p>3. Masukkan nominal transfer sesuai tagihan, lalu selesaikan pembayaran.</p>
        </div>
      </div>
    ` : ''}

    <!-- Signatures -->
    <div class="footer-signs">
      <div style="text-align: center; width: 100px;">
        <div>Pemesan / Klien,</div>
        <div style="height: 24px;"></div>
        <div style="border-top: 1px solid #71717a; font-weight: bold; padding-top: 1px;">(${order.clientName})</div>
      </div>

      <div style="text-align: center; font-size: 7.5px; color: #71717a; max-width: 160px;">
        <div>Nota sah & diterbitkan resmi oleh ${studioName}.</div>
        <div style="font-family: monospace; margin-top: 1px;">ID: ${order.id} | Valid & Terverifikasi</div>
      </div>

      <div style="text-align: center; width: 100px;">
        <div>Admin & Keuangan,</div>
        <div style="height: 24px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 7px; font-weight: bold; border: 1px solid #71717a; padding: 1px 3px; text-transform: uppercase;">VERIFIED STUDIO</span>
        </div>
        <div style="border-top: 1px solid #71717a; font-weight: bold; padding-top: 1px;">(${studioName})</div>
      </div>
    </div>
  </div>

  <script>
    // Auto-trigger print if not in iframe or when requested
    window.addEventListener('DOMContentLoaded', () => {
      // Optional slight delay to ensure fonts and styles render
    });
  </script>
</body>
</html>`;
}

/**
 * Triggers universal print receipt:
 * 1. Tries window.print() for normal tab / browser contexts.
 * 2. Also provides opening clean standalone printable window or downloading clean HTML receipt.
 */
export function printOrDownloadReceipt(
  order: BookingOrder,
  studioConfig?: StudioConfig,
  selectedBankId?: string
): void {
  try {
    // Generate HTML
    const htmlContent = generateReceiptHTML(order, studioConfig, selectedBankId);

    // Try opening popup / print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // Ignore if user cancels
        }
      }, 350);
      return;
    }
  } catch {
    // Fallback to window.print()
  }

  // Fallback to standard window.print
  try {
    window.print();
  } catch (err) {
    console.error('Print failed:', err);
  }
}

/**
 * Downloads receipt as standalone HTML file that can be opened or converted to PDF anywhere
 */
export function downloadReceiptHTMLFile(
  order: BookingOrder,
  studioConfig?: StudioConfig,
  selectedBankId?: string
): void {
  const htmlContent = generateReceiptHTML(order, studioConfig, selectedBankId);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Nota_Reservasi_${order.id}_${order.clientName.replace(/\s+/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
