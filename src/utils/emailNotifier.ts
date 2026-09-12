import { BookingOrder } from '../types';
import {
  formatRupiah,
  formatDateIndonesian,
  normalizeWhatsAppNumber,
  UpcomingSessionAlert,
} from './formatters';

export interface EmailDispatchResult {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Builds a clear, professional plain-text and structured summary of a booking order
 */
function buildOrderTextSummary(
  order: BookingOrder,
  studioName: string,
  dpAmount: number,
  orderTimeStr: string,
  clientWaClean: string
): string {
  let text = `=====================================================\n`;
  text += `📸 ${studioName.toUpperCase()}\n`;
  text += `NOTIFIKASI ORDERAN BARU MASUK\n`;
  text += `=====================================================\n\n`;

  text += `1. INFORMASI PESANAN\n`;
  text += `   - ID Pemesanan : #${order.id}\n`;
  text += `   - Waktu Masuk  : ${orderTimeStr} WIB\n`;
  text += `   - Status Awal  : ${order.status || 'Menunggu Konfirmasi'}\n\n`;

  text += `2. DATA KONSUMEN\n`;
  text += `   - Nama Lengkap : ${order.clientName}\n`;
  text += `   - No. WhatsApp : ${order.phone} ( https://wa.me/${clientWaClean} )\n`;
  text += `   - Alamat Email : ${order.email || '-'}\n\n`;

  text += `3. DETAIL PAKET & BIAYA\n`;
  text += `   - Paket Pilihan: ${order.packageName}\n`;
  text += `   - Harga Paket  : ${formatRupiah(order.packagePrice)}\n`;
  text += `   - Add-On / Plus: ${order.addOnsText || 'Tidak ada'}\n`;
  text += `   - Total Biaya  : ${formatRupiah(order.totalPrice)}\n`;
  text += `   - Ketentuan    : ${order.paymentPreference || 'DP 50%'}\n`;
  text += `   - Nominal DP   : ${formatRupiah(dpAmount)}\n\n`;

  text += `4. JADWAL & LOKASI PEMOTRETAN\n`;
  text += `   - Tanggal Sesi : ${formatDateIndonesian(order.sessionDate)}\n`;
  text += `   - Waktu / Jam  : ${order.sessionTime || '-'}\n`;
  text += `   - Tipe Lokasi  : ${(order.locationType || 'studio').toUpperCase()}\n`;
  text += `   - Alamat Lokasi: ${order.locationAddress || '-'}\n`;
  text += `   - Catatan/Ide  : ${order.notes || '-'}\n\n`;

  if (order.hasSecondSession && order.sessionDate2) {
    text += `5. JADWAL & LOKASI SESI KEDUA (MULTI-ACARA)\n`;
    text += `   - Tanggal Sesi : ${formatDateIndonesian(order.sessionDate2)}\n`;
    text += `   - Waktu / Jam  : ${order.sessionTime2 || '-'}\n`;
    text += `   - Tipe Lokasi  : ${(order.locationType2 || 'venue').toUpperCase()}\n`;
    text += `   - Alamat Lokasi: ${order.locationAddress2 || '-'}\n`;
    text += `   - Catatan Sesi : ${order.notes2 || '-'}\n\n`;
  }

  text += `=====================================================\n`;
  text += `*Email ini dikirim otomatis oleh sistem website ${studioName} setiap ada pemesanan baru.`;

  return text;
}

/**
 * Builds a comprehensive text summary for an upcoming session within 24 hours
 */
function buildUpcomingSessionTextSummary(
  session: UpcomingSessionAlert,
  studioName: string,
  clientWaClean: string
): string {
  const { order, sessionNumber, dateStr, timeStr, location, timeStatusLabel } = session;
  let text = `=====================================================\n`;
  text += `🚨 PERINGATAN SESI FOTO < 24 JAM\n`;
  text += `📸 ${studioName.toUpperCase()}\n`;
  text += `=====================================================\n\n`;

  text += `⏱ STATUS WAKTU: ${timeStatusLabel.toUpperCase()}\n`;
  text += `   - Tanggal Sesi : ${formatDateIndonesian(dateStr)}\n`;
  text += `   - Jam Mulai    : ${timeStr || 'Sesuai Jadwal'}\n`;
  text += `   - Sesi Acara   : Sesi ${sessionNumber} ${order.hasSecondSession ? '(Multi-Acara)' : ''}\n\n`;

  text += `👤 DATA KONSUMEN:\n`;
  text += `   - Nama Klien   : ${order.clientName}\n`;
  text += `   - WhatsApp     : ${order.phone} ( https://wa.me/${clientWaClean} )\n`;
  text += `   - Email Klien  : ${order.email || '-'}\n`;
  text += `   - ID Booking   : #${order.id}\n\n`;

  text += `📦 PAKET & LOKASI:\n`;
  text += `   - Paket Foto   : ${order.packageName}\n`;
  text += `   - Tipe Lokasi  : ${(session.locationType || order.locationType || 'studio').toUpperCase()}\n`;
  text += `   - Alamat Venue : ${location || '-'}\n`;
  text += `   - Catatan Sesi : ${sessionNumber === 2 ? (order.notes2 || order.notes || '-') : (order.notes || '-')}\n\n`;

  text += `💰 STATUS KEUANGAN:\n`;
  text += `   - Total Biaya  : ${formatRupiah(order.totalPrice)}\n`;
  text += `   - Status Order : ${order.status}\n`;
  text += `   - Preferensi   : ${order.paymentPreference}\n\n`;

  text += `✅ CHECKLIST KESIAPAN TIM STUDIO:\n`;
  text += `   [ ] Konfirmasi kedatangan klien via WhatsApp\n`;
  text += `   [ ] Kamera, baterai cadangan & memory card siap\n`;
  text += `   [ ] Setting lighting & background studio / alat outdoor\n`;
  text += `   [ ] Briefing fotografer & asisten lapangan\n\n`;

  text += `=====================================================\n`;
  text += `*Notifikasi otomatis untuk memastikan sesi pemotretan berjalan lancar dan tepat waktu.`;

  return text;
}

/**
 * Sends an automated email notification to Studio Admin in the background
 * for new incoming orders without requiring user confirmation.
 */
export async function sendAdminOrderNotificationEmail(
  order: BookingOrder,
  targetEmail = 'dimensi.idphoto@gmail.com',
  studioName = 'Dimensi Fotografi Studio'
): Promise<EmailDispatchResult> {
  const cleanEmail = (targetEmail || 'dimensi.idphoto@gmail.com').trim();
  const isLunas = order.paymentPreference === 'Lunas';
  const isDP30 = order.paymentPreference === 'DP 30%';
  const dpRatio = isLunas ? 1.0 : (isDP30 ? 0.3 : 0.5);
  const dpAmount = Math.round(order.totalPrice * dpRatio);

  const orderTimeStr = new Date(order.createdAt || Date.now()).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `[ORDER BARU] #${order.id} - ${order.clientName} (${order.packageName})`;
  const clientWaClean = normalizeWhatsAppNumber(order.phone);

  const fullSummaryText = buildOrderTextSummary(order, studioName, dpAmount, orderTimeStr, clientWaClean);

  const payload: Record<string, string> = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    
    // Header & Ringkasan Utama
    Studio: studioName,
    ID_Pemesanan: `#${order.id}`,
    Waktu_Masuk_Pesanan: `${orderTimeStr} WIB`,
    Status_Pesanan: order.status || 'Menunggu Konfirmasi',
    
    // Data Konsumen
    Nama_Konsumen: order.clientName,
    Nomor_WhatsApp_Konsumen: order.phone,
    Email_Konsumen: order.email || '-',
    Link_WhatsApp_Langsung: `https://wa.me/${clientWaClean}`,

    // Detail Paket & Biaya
    Paket_Foto_Dipilih: order.packageName,
    Harga_Paket_Foto: formatRupiah(order.packagePrice),
    Layanan_Tambahan_AddOn: order.addOnsText || 'Tidak ada',
    TOTAL_BIAYA_PESANAN: formatRupiah(order.totalPrice),
    Metode_Ketentuan_Bayar: order.paymentPreference || 'DP 50%',
    Nominal_Uang_Muka_DP: formatRupiah(dpAmount),

    // Jadwal & Lokasi Sesi 1
    Tanggal_Pemotretan_Sesi_1: formatDateIndonesian(order.sessionDate),
    Jam_Sesi_1: order.sessionTime || '-',
    Tipe_Lokasi_Sesi_1: (order.locationType || 'studio').toUpperCase(),
    Alamat_Lokasi_Sesi_1: order.locationAddress || '-',
    Catatan_Khusus_Konsumen: order.notes || '-',
  };

  // If multi-event / 2nd session exists
  if (order.hasSecondSession && order.sessionDate2) {
    payload.Tanggal_Pemotretan_Sesi_2 = formatDateIndonesian(order.sessionDate2);
    payload.Jam_Sesi_2 = order.sessionTime2 || '-';
    payload.Tipe_Lokasi_Sesi_2 = (order.locationType2 || 'venue').toUpperCase();
    payload.Alamat_Lokasi_Sesi_2 = order.locationAddress2 || '-';
    payload.Catatan_Sesi_2 = order.notes2 || '-';
  }

  payload.RINGKASAN_LENGKAP_PESANAN = fullSummaryText;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        message: `Email notifikasi pesanan #${order.id} berhasil dikirim ke ${cleanEmail}`,
        timestamp: new Date().toISOString(),
      };
    } else {
      const errText = await response.text().catch(() => '');
      return {
        success: false,
        message: `Pengiriman email gagal (Status ${response.status}): ${errText}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    console.warn('Background email notification notice:', error);
    return {
      success: false,
      message: error?.message || 'Gagal mengirim email otomatis (koneksi jaringan)',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Sends a high-priority 24-hour upcoming session alert email directly to Studio Admin
 */
export async function sendAdminUpcomingSessionEmail(
  session: UpcomingSessionAlert,
  targetEmail = 'dimensi.idphoto@gmail.com',
  studioName = 'Dimensi Fotografi Studio'
): Promise<EmailDispatchResult> {
  const cleanEmail = (targetEmail || 'dimensi.idphoto@gmail.com').trim();
  const { order, sessionNumber, dateStr, timeStr, location, timeStatusLabel, diffHours } = session;
  const clientWaClean = normalizeWhatsAppNumber(order.phone);

  const roundedHours = Math.max(0, Math.round(diffHours));
  const subject = `🚨 [REMINDER 24 JAM] Sesi Foto #${order.id}: ${order.clientName} - ${formatDateIndonesian(dateStr)} (${timeStr})`;

  const fullText = buildUpcomingSessionTextSummary(session, studioName, clientWaClean);

  const payload: Record<string, string> = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',

    // Status Urgensi
    PERINGATAN: `SESI FOTO BERLANGSUNG DALAM ${roundedHours} JAM KE DEPAN`,
    Status_Waktu: timeStatusLabel,
    Studio: studioName,

    // Data Sesi
    ID_Pemesanan: `#${order.id}`,
    Nama_Klien: order.clientName,
    WhatsApp_Klien: `${order.phone} ( https://wa.me/${clientWaClean} )`,
    Email_Klien: order.email || '-',
    
    // Paket & Jadwal
    Paket_Foto: order.packageName,
    Sesi_Ke: `Sesi ${sessionNumber} ${order.hasSecondSession ? '(Multi-Acara)' : ''}`,
    Tanggal_Pelaksanaan: formatDateIndonesian(dateStr),
    Jam_Pelaksanaan: timeStr || '-',
    Tipe_Lokasi: (session.locationType || order.locationType || 'studio').toUpperCase(),
    Alamat_Lokasi_Lengkap: location || '-',
    Catatan_Klien: sessionNumber === 2 ? (order.notes2 || order.notes || '-') : (order.notes || '-'),

    // Keuangan & Status
    Total_Biaya_Paket: formatRupiah(order.totalPrice),
    Status_Pemesanan: order.status,
    Ketentuan_Pembayaran: order.paymentPreference,

    // Checklist Kesiapan
    Checklist_Kesiapan_Studio: `[1] Konfirmasi Klien [2] Baterai & SD Card [3] Lighting & Setting [4] Brief Fotografer`,
    RINGKASAN_LENGKAP: fullText,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        message: `Notifikasi 24 jam sesi foto ${order.clientName} (Sesi ${sessionNumber}) berhasil dikirim ke ${cleanEmail}`,
        timestamp: new Date().toISOString(),
      };
    } else {
      const errText = await response.text().catch(() => '');
      return {
        success: false,
        message: `Pengiriman email peringatan gagal (Status ${response.status}): ${errText}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    console.warn('Upcoming session email error:', error);
    return {
      success: false,
      message: error?.message || 'Gagal mengirim email pengingat 24 jam',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Sends a batch digest of all upcoming photo sessions occurring in the next 24 hours
 */
export async function sendAdminUpcomingSessionsDigestEmail(
  sessions: UpcomingSessionAlert[],
  targetEmail = 'dimensi.idphoto@gmail.com',
  studioName = 'Dimensi Fotografi Studio'
): Promise<EmailDispatchResult> {
  const cleanEmail = (targetEmail || 'dimensi.idphoto@gmail.com').trim();
  if (!sessions || sessions.length === 0) {
    return {
      success: true,
      message: 'Tidak ada sesi foto yang berlangsung dalam 24 jam ke depan.',
      timestamp: new Date().toISOString(),
    };
  }

  const subject = `🚨 [REKAP 24 JAM] Ada ${sessions.length} Sesi Foto Berlangsung dalam 24 Jam ke Depan (${studioName})`;

  let summaryText = `=====================================================\n`;
  summaryText += `🚨 REKAP SESI FOTO 24 JAM KE DEPAN (${sessions.length} SESI)\n`;
  summaryText += `📸 ${studioName.toUpperCase()}\n`;
  summaryText += `Waktu Peringatan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB\n`;
  summaryText += `=====================================================\n\n`;

  const payload: Record<string, string> = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    Studio: studioName,
    JUMLAH_SESI_FOTO_24_JAM: `${sessions.length} Sesi Pemotretan`,
    WAKTU_DIGEST: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB',
  };

  sessions.forEach((s, idx) => {
    const num = idx + 1;
    const clientWa = normalizeWhatsAppNumber(s.order.phone);
    payload[`SESI_${num}_KLIEN`] = `${s.order.clientName} (Sesi ${s.sessionNumber}) - #${s.order.id}`;
    payload[`SESI_${num}_WAKTU`] = `${formatDateIndonesian(s.dateStr)} @ ${s.timeStr} (${s.timeStatusLabel})`;
    payload[`SESI_${num}_PAKET`] = s.order.packageName;
    payload[`SESI_${num}_LOKASI`] = `${(s.locationType || s.order.locationType || 'studio').toUpperCase()}: ${s.location}`;
    payload[`SESI_${num}_WA`] = `https://wa.me/${clientWa}`;

    summaryText += `[SESI ${num}] ${s.order.clientName} - #${s.order.id}\n`;
    summaryText += `  - Jadwal  : ${formatDateIndonesian(s.dateStr)} jam ${s.timeStr} (${s.timeStatusLabel})\n`;
    summaryText += `  - Paket   : ${s.order.packageName}\n`;
    summaryText += `  - Sesi    : Sesi ${s.sessionNumber}\n`;
    summaryText += `  - Lokasi  : ${s.location}\n`;
    summaryText += `  - Kontak  : ${s.order.phone} ( https://wa.me/${clientWa} )\n`;
    summaryText += `  - Status  : ${s.order.status} (${s.order.paymentPreference})\n\n`;
  });

  summaryText += `=====================================================\n`;
  summaryText += `*Pastikan tim dan peralatan studio sudah dalam kondisi prima.`;
  payload.RINGKASAN_LENGKAP = summaryText;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        message: `Rekap email peringatan 24 jam (${sessions.length} sesi foto) berhasil dikirim ke ${cleanEmail}`,
        timestamp: new Date().toISOString(),
      };
    } else {
      const errText = await response.text().catch(() => '');
      return {
        success: false,
        message: `Gagal mengirim rekap email (Status ${response.status}): ${errText}`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal mengirim rekap email 24 jam',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Sends a realistic sample 24-hour upcoming session reminder email
 * to test and verify the format received in the admin inbox.
 */
export async function sendTestAdminUpcomingReminderEmail(
  targetEmail: string,
  studioName = 'Dimensi Fotografi Studio'
): Promise<EmailDispatchResult> {
  const cleanEmail = (targetEmail || 'dimensi.idphoto@gmail.com').trim();
  
  const sampleSession: UpcomingSessionAlert = {
    order: {
      id: `DIM-${new Date().getFullYear()}-0889`,
      clientName: 'Aditya Pratama & Rania Putri (Tes Pengingat 24 Jam)',
      phone: '081234567890',
      email: cleanEmail,
      packageId: 'pkg-wedding-royal',
      packageName: 'Paket Wedding Royal Eternity',
      packagePrice: 4500000,
      addOnIds: ['addon-drone'],
      addOnsText: 'Drone Aerial Photography & 4K Video',
      addOnsTotal: 600000,
      totalPrice: 5100000,
      sessionDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0],
      sessionTime: '09:00 WIB',
      locationType: 'venue',
      locationAddress: 'Grand Ballroom Hotel Mulia Senayan, Jakarta Pusat',
      notes: 'Acara Akad Nikah adat Sunda dilanjutkan Resepsi Nasional. Mohon fotografer standby 45 menit sebelum acara.',
      status: 'Terkonfirmasi & Terjadwal',
      paymentPreference: 'Lunas',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    sessionNumber: 1,
    dateStr: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeStr: '09:00 WIB',
    location: 'Grand Ballroom Hotel Mulia Senayan, Jakarta Pusat',
    locationType: 'venue',
    sessionDateTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    diffHours: 8,
    diffMinutes: 480,
    isToday: true,
    isTomorrow: false,
    timeStatusLabel: 'Hari Ini, 09:00 WIB (Mulai dalam 8 jam)',
    urgencyLevel: 'imminent',
  };

  return sendAdminUpcomingSessionEmail(sampleSession, cleanEmail, studioName);
}

/**
 * Sends a realistic sample booking email notification to verify the exact format
 * that admin will receive when customers place orders.
 */
export async function sendTestAdminNotificationEmail(
  targetEmail: string,
  studioName = 'Dimensi Fotografi Studio'
): Promise<EmailDispatchResult> {
  const cleanEmail = (targetEmail || 'dimensi.idphoto@gmail.com').trim();
  
  // Create a realistic sample order with complete customer, package, schedule, and cost breakdown
  const sampleOrder: BookingOrder = {
    id: `DIM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    clientName: 'Siti Rahmawati (Contoh Pemesan)',
    phone: '081234567890',
    email: cleanEmail,
    packageId: 'sample-pkg-wedding',
    packageName: 'Prewedding Cinematic Signature 4K',
    packagePrice: 3500000,
    addOnIds: ['sample-addon-1', 'sample-addon-2'],
    addOnsText: 'Drone 4K Aerial (+Rp 600.000), Makeup Artist (+Rp 500.000)',
    addOnsTotal: 1100000,
    totalPrice: 4600000,
    sessionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionTime: '09:00 WIB',
    locationType: 'outdoor',
    locationAddress: 'Hutan Pinus Mangunan / Pantai Parangtritis, Yogyakarta',
    notes: 'Konsep foto casual vintage earthy tone, request golden hour sore hari.',
    status: 'Menunggu Konfirmasi',
    paymentPreference: 'DP 50%',
    createdAt: new Date().toISOString(),
  };

  const isLunas = sampleOrder.paymentPreference === 'Lunas';
  const dpRatio = isLunas ? 1.0 : 0.5;
  const dpAmount = Math.round(sampleOrder.totalPrice * dpRatio);

  const orderTimeStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `[CONTOH NOTIFIKASI ORDER] #${sampleOrder.id} - ${sampleOrder.clientName} (${sampleOrder.packageName})`;
  const clientWaClean = normalizeWhatsAppNumber(sampleOrder.phone);

  const fullSummaryText = buildOrderTextSummary(sampleOrder, studioName, dpAmount, orderTimeStr, clientWaClean);

  const payload: Record<string, string> = {
    _subject: subject,
    _template: 'table',
    _captcha: 'false',
    
    // Header & Status
    Studio: studioName,
    Keterangan_Email: 'INI ADALAH CONTOH TAMPILAN FORMAT EMAIL KETIKA ADA PESANAN MASUK',
    ID_Pemesanan: `#${sampleOrder.id}`,
    Waktu_Masuk_Pesanan: `${orderTimeStr} WIB`,
    Status_Pesanan: sampleOrder.status || 'Menunggu Konfirmasi',
    
    // Data Konsumen
    Nama_Konsumen: sampleOrder.clientName,
    Nomor_WhatsApp_Konsumen: sampleOrder.phone,
    Email_Konsumen: sampleOrder.email || '-',
    Link_WhatsApp_Langsung: `https://wa.me/${clientWaClean}`,

    // Detail Paket & Biaya
    Paket_Foto_Dipilih: sampleOrder.packageName,
    Harga_Paket_Foto: formatRupiah(sampleOrder.packagePrice),
    Layanan_Tambahan_AddOn: sampleOrder.addOnsText || 'Tidak ada',
    TOTAL_BIAYA_PESANAN: formatRupiah(sampleOrder.totalPrice),
    Metode_Ketentuan_Bayar: sampleOrder.paymentPreference || 'DP 50%',
    Nominal_Uang_Muka_DP: formatRupiah(dpAmount),

    // Jadwal & Lokasi Sesi
    Tanggal_Pemotretan_Sesi_1: formatDateIndonesian(sampleOrder.sessionDate),
    Jam_Sesi_1: sampleOrder.sessionTime || '-',
    Tipe_Lokasi_Sesi_1: (sampleOrder.locationType || 'studio').toUpperCase(),
    Alamat_Lokasi_Sesi_1: sampleOrder.locationAddress || '-',
    Catatan_Khusus_Konsumen: sampleOrder.notes || '-',

    RINGKASAN_LENGKAP_PESANAN: fullSummaryText,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cleanEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        success: true,
        message: `Format email pesanan lengkap (Contoh #${sampleOrder.id}) berhasil dikirim ke ${cleanEmail}. Silakan periksa inbox Anda!`,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: `Gagal mengirim email tes (Status ${response.status})`,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal menghubungi server email',
      timestamp: new Date().toISOString(),
    };
  }
}

