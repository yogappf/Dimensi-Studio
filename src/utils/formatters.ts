import { BookingOrder } from '../types';

export function normalizeWhatsAppNumber(phone?: string): string {
  if (!phone) return '6282123456789';
  let clean = phone.replace(/\D/g, '');
  if (!clean) return '6282123456789';
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean;
  }
  return clean;
}

export function formatRupiah(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateIndonesian(dateString: string): string {
  if (!dateString) return '-';
  try {
    // Parse YYYY-MM-DD without UTC shift
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const localDate = new Date(year, month, day);
      if (!isNaN(localDate.getTime())) {
        return localDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function generateWhatsAppLink(
  order: BookingOrder,
  studioPhone = '6282123456789',
  paymentInfo?: { selectedBank?: string; transferProofNote?: string }
): string {
  const cleanPhone = normalizeWhatsAppNumber(studioPhone);
  const isLunas = order.paymentPreference === 'Lunas';
  const isDP30 = order.paymentPreference === 'DP 30%';
  const dpRatio = isLunas ? 1.0 : (isDP30 ? 0.3 : 0.5);
  const dpAmount = Math.round(order.totalPrice * dpRatio);
  const dpLabelText = isLunas
    ? `*Ketentuan Bayar*: Lunas 100% (${formatRupiah(dpAmount)})`
    : (isDP30
        ? `*Estimasi DP (30%)*: ${formatRupiah(dpAmount)}\n*Ketentuan Bayar*: ${order.paymentPreference}`
        : `*Estimasi DP (50%)*: ${formatRupiah(dpAmount)}\n*Ketentuan Bayar*: ${order.paymentPreference}`);

  let message = `Halo Dimensi Fotografi Studio! 📸✨

Saya ingin mengonfirmasi pendaftaran / order jasa foto dengan rincian berikut:

*ID Booking*: ${order.id}
*Nama Klien*: ${order.clientName}
*No. WhatsApp*: ${order.phone}
*Email*: ${order.email || '-'}

*Pilihan Paket*: ${order.packageName} (${formatRupiah(order.packagePrice)})
*Tambahan (Add-ons)*: ${order.addOnsText || 'Tidak ada'}
*Total Biaya*: ${formatRupiah(order.totalPrice)}
${dpLabelText}

*JADWAL & LOKASI PEMOTRETAN*:
📌 *Acara Pertama (Sesi 1)*:
- Tanggal: ${formatDateIndonesian(order.sessionDate)}
- Waktu: ${order.sessionTime}
- Tipe Tempat: ${(order.locationType || 'studio').toUpperCase()}
- Alamat: ${order.locationAddress}
- Catatan: ${order.notes || '-'}`;

  if (order.hasSecondSession && order.sessionDate2) {
    message += `\n\n📌 *Acara Kedua (Sesi 2)*:
- Tanggal: ${formatDateIndonesian(order.sessionDate2)}
- Waktu: ${order.sessionTime2 || '-'}
- Tipe Tempat: ${(order.locationType2 || 'venue').toUpperCase()}
- Alamat: ${order.locationAddress2 || '-'}
- Catatan: ${order.notes2 || '-'}`;
  }

  if (paymentInfo?.selectedBank) {
    message += `\n\n*Rekening Tujuan Transfer*: ${paymentInfo.selectedBank}`;
  }
  if (paymentInfo?.transferProofNote) {
    message += `\n*Catatan Pembayaran / Pengirim*: ${paymentInfo.transferProofNote}`;
  }

  if (order.driveFolderUrl) {
    message += `\n\n*Link Google Drive*: ${order.driveFolderUrl}`;
  }

  message += `\n\nSaya telah mencatat nomor rekening pembayaran studio dan ingin mengonfirmasi jadwal fotografer. Terima kasih! 🙏`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateClientConfirmationWhatsAppLink(order: BookingOrder): string {
  const cleanPhone = normalizeWhatsAppNumber(order.phone);
  const dpAmount = Math.round(order.totalPrice * 0.5);
  const message = `Halo Kak ${order.clientName}! 📸✨

Kami dari *Dimensi Fotografi Studio* ingin mengonfirmasi pendaftaran / pesanan sesi foto Anda:

*ID Booking*: ${order.id}
*Pilihan Paket*: ${order.packageName} (${formatRupiah(order.packagePrice)})
*Tambahan (Add-ons)*: ${order.addOnsText || 'Tidak ada'}
*Total Biaya*: ${formatRupiah(order.totalPrice)}
*Estimasi DP (50%)*: ${formatRupiah(dpAmount)}
*Ketentuan Bayar*: ${order.paymentPreference}

*Jadwal Sesi*: ${formatDateIndonesian(order.sessionDate)}
*Waktu Sesi*: ${order.sessionTime}
*Lokasi*: ${order.locationAddress} (${(order.locationType || 'studio').toUpperCase()})

Silakan lakukan transfer DP ke rekening resmi studio dan balas pesan ini ya Kak. Terima kasih! 🙏`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateClientCompletionWhatsAppLink(order: BookingOrder): string {
  const cleanPhone = normalizeWhatsAppNumber(order.phone);
  let message = `Halo Kak ${order.clientName}! 📸✨

Kami dari *Dimensi Fotografi Studio* menginformasikan bahwa pesanan sesi foto Anda telah *SELESAI* diproses & diedit sepenuhnya! 🎉

*Rincian Pesanan*:
- *ID Booking*: ${order.id}
- *Paket Foto*: ${order.packageName}
- *Jadwal Sesi*: ${formatDateIndonesian(order.sessionDate)}
- *Status*: *Selesai*`;

  if (order.driveFolderUrl) {
    message += `\n\n🔗 *Link Hasil Foto (Google Drive)*:\n${order.driveFolderUrl}`;
  }

  message += `\n\nTerima kasih banyak telah mempercayakan momen berharga Anda kepada Dimensi Fotografi Studio. Semoga Kakak puas dengan hasil karya kami! Jika ada pertanyaan atau kebutuhan cetak foto tambahan, jangan ragu untuk menghubungi kami ya Kak. 🙏✨`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateClientDeliveryWhatsAppLink(order: BookingOrder): string {
  const cleanPhone = normalizeWhatsAppNumber(order.phone);
  const message = `Halo Kak ${order.clientName}! 📸✨

Terima kasih telah mempercayakan sesi foto Anda bersama *Dimensi Fotografi*.

Berikut kami kirimkan link folder *Google Drive* yang berisi seluruh hasil foto resolusi tinggi, file RAW, dan pilihan cetak Anda:

🔗 *Link Google Drive Foto*:
${order.driveFolderUrl || 'Link sedang dipersiapkan oleh tim studio'}

*Detail Pemesanan*:
- ID Booking: ${order.id}
- Paket: ${order.packageName}
- Status: ${order.status}

Silakan diunduh dan disimpan ya Kak. Jika ada foto yang ingin direvisi atau dicetak ke kanvas/album, silakan beri tahu kami! 😊`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateDirectInquiryLink(
  packageName: string,
  packagePrice: number,
  studioPhone = '6282123456789'
): string {
  const cleanPhone = normalizeWhatsAppNumber(studioPhone);
  const message = `Halo Dimensi Fotografi, saya tertarik dan ingin konsultasi mengenai *${packageName}* (${formatRupiah(packagePrice)}). Boleh dibantu info ketersediaan slot tanggal & detailnya?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}




export function generateClientReminderMessage(order: BookingOrder): string {
  let message = `Halo Kak ${order.clientName}! 📸✨\n\nKami dari *Dimensi Fotografi Studio* ingin mengingatkan kembali mengenai pesanan pemotretan Anda.\n\n`;

  if (order.status === 'Menunggu Konfirmasi') {
    message += `Saat ini status pesanan Anda masih *Menunggu Konfirmasi*. Jika belum melakukan pembayaran DP/Lunas, silakan konfirmasi pembayaran (kirim bukti transfer) agar jadwal Anda dapat kami amankan.\n\n`;
  } else if (order.status === 'Terkonfirmasi & Terjadwal') {
    message += `Jadwal pemotretan Anda telah *Terkonfirmasi & Terjadwal*. Mohon datang tepat waktu (idealnya 15 menit sebelumnya) sesuai jadwal berikut ya Kak:\n\n`;
  } else {
    message += `Kami menunggu kehadiran Anda di studio kami pada jadwal berikut:\n\n`;
  }

  message += `*Detail Pesanan*:\n- *ID Booking*: ${order.id}\n- *Paket Foto*: ${order.packageName}\n- *Tanggal Sesi*: ${formatDateIndonesian(order.sessionDate)}\n- *Waktu*: ${order.sessionTime}\n- *Lokasi*: ${order.locationAddress} (${(order.locationType || 'studio').toUpperCase()})\n\nJika ada pertanyaan lebih lanjut atau ingin mengubah jadwal, silakan balas pesan ini. Terima kasih! 🙏`;

  return message;
}

export function generateClientReminderWhatsAppLink(order: BookingOrder): string {
  const cleanPhone = normalizeWhatsAppNumber(order.phone);
  const message = generateClientReminderMessage(order);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Normalizes date string to YYYY-MM-DD
 */
export function normalizeDate(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // fallback
  }
  return trimmed;
}

/**
 * Normalizes time string to HH:MM format
 */
export function normalizeTime(timeStr?: string): string {
  if (!timeStr) return '';
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return timeStr.trim().toLowerCase();
}

/**
 * Checks if a requested date and time slot conflicts with existing orders
 */
export function checkScheduleSlotConflict(
  requestedDate: string,
  requestedTime: string,
  existingOrders: BookingOrder[],
  excludeOrderId?: string
): BookingOrder | null {
  if (!requestedDate || !requestedTime || !Array.isArray(existingOrders)) return null;

  const targetDate = normalizeDate(requestedDate);
  const targetTime = normalizeTime(requestedTime);

  if (!targetDate || !targetTime) return null;

  for (const order of existingOrders) {
    if (excludeOrderId && order.id === excludeOrderId) continue;
    // Don't count cancelled orders as occupying slots
    if (order.status === 'Dibatalkan' || (order.status as string) === 'Batal') continue;

    // Check Sesi 1
    const orderDate1 = normalizeDate(order.sessionDate);
    const orderTime1 = normalizeTime(order.sessionTime);
    if (orderDate1 && orderDate1 === targetDate && orderTime1 && orderTime1 === targetTime) {
      return order;
    }

    // Check Sesi 2 if exists
    if (order.hasSecondSession && order.sessionDate2 && order.sessionTime2) {
      const orderDate2 = normalizeDate(order.sessionDate2);
      const orderTime2 = normalizeTime(order.sessionTime2);
      if (orderDate2 && orderDate2 === targetDate && orderTime2 && orderTime2 === targetTime) {
        return order;
      }
    }
  }

  return null;
}

/**
 * Returns all booked slots for a specific date
 */
export function getBookedSlotsForDate(
  dateStr: string,
  existingOrders: BookingOrder[],
  excludeOrderId?: string
): BookingOrder[] {
  if (!dateStr || !Array.isArray(existingOrders)) return [];
  const targetDate = normalizeDate(dateStr);
  if (!targetDate) return [];

  return existingOrders.filter((ord) => {
    if (excludeOrderId && ord.id === excludeOrderId) return false;
    if (ord.status === 'Dibatalkan' || (ord.status as string) === 'Batal') return false;
    const match1 = normalizeDate(ord.sessionDate) === targetDate;
    const match2 = ord.hasSecondSession && ord.sessionDate2 && normalizeDate(ord.sessionDate2) === targetDate;
    return match1 || match2;
  });
}

export interface UpcomingSessionAlert {
  order: BookingOrder;
  sessionNumber: 1 | 2;
  dateStr: string;
  timeStr: string;
  location: string;
  locationType?: 'studio' | 'outdoor' | 'venue';
  sessionDateTime: Date;
  diffHours: number;
  diffMinutes: number;
  isToday: boolean;
  isTomorrow: boolean;
  timeStatusLabel: string;
  urgencyLevel: 'imminent' | 'today' | 'tomorrow' | 'upcoming';
}

/**
 * Parses session date and time into a valid Date object
 */
export function parseSessionDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const cleanDate = normalizeDate(dateStr);
  if (!cleanDate) return null;

  const dateParts = cleanDate.split('-');
  if (dateParts.length !== 3) return null;
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);

  let hour = 9;
  let minute = 0;
  if (timeStr) {
    const match = timeStr.match(/(\d{1,2})[:.](\d{2})/);
    if (match) {
      hour = parseInt(match[1], 10);
      minute = parseInt(match[2], 10);
    }
  }

  const d = new Date(year, month, day, hour, minute, 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Checks if a specific order has any session scheduled within the next 24 hours
 */
export function isOrderWithin24Hours(order: BookingOrder, referenceDate: Date = new Date()): boolean {
  if (!order || order.status === 'Selesai' || order.status === 'Dibatalkan' || (order.status as string) === 'Batal') {
    return false;
  }

  const refMs = referenceDate.getTime();
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();
  const todayStr = `${refYear}-${String(refMonth + 1).padStart(2, '0')}-${String(refDay).padStart(2, '0')}`;
  const tomorrow = new Date(refYear, refMonth, refDay + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  // Check Sesi 1
  const dt1 = parseSessionDateTime(order.sessionDate, order.sessionTime);
  if (dt1) {
    const diffHours = (dt1.getTime() - refMs) / (1000 * 60 * 60);
    const normDate1 = normalizeDate(order.sessionDate);
    const isToday1 = normDate1 === todayStr;
    const isTomorrow1 = normDate1 === tomorrowStr;
    if ((diffHours >= -4 && diffHours <= 24) || (isToday1 && diffHours > -8) || (isTomorrow1 && diffHours <= 24)) {
      return true;
    }
  }

  // Check Sesi 2
  if (order.hasSecondSession && order.sessionDate2) {
    const dt2 = parseSessionDateTime(order.sessionDate2, order.sessionTime2);
    if (dt2) {
      const diffHours2 = (dt2.getTime() - refMs) / (1000 * 60 * 60);
      const normDate2 = normalizeDate(order.sessionDate2);
      const isToday2 = normDate2 === todayStr;
      const isTomorrow2 = normDate2 === tomorrowStr;
      if ((diffHours2 >= -4 && diffHours2 <= 24) || (isToday2 && diffHours2 > -8) || (isTomorrow2 && diffHours2 <= 24)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns all upcoming sessions scheduled within 24 hours
 */
export function getUpcomingSessionsWithin24Hours(
  orders: BookingOrder[],
  referenceDate: Date = new Date()
): UpcomingSessionAlert[] {
  if (!Array.isArray(orders)) return [];
  const results: UpcomingSessionAlert[] = [];
  const refMs = referenceDate.getTime();

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();
  const todayStr = `${refYear}-${String(refMonth + 1).padStart(2, '0')}-${String(refDay).padStart(2, '0')}`;

  const tomorrow = new Date(refYear, refMonth, refDay + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  for (const order of orders) {
    if (order.status === 'Selesai' || order.status === 'Dibatalkan' || (order.status as string) === 'Batal') {
      continue;
    }

    // Check Sesi 1
    const dt1 = parseSessionDateTime(order.sessionDate, order.sessionTime);
    if (dt1) {
      const diffMs = dt1.getTime() - refMs;
      const diffHours = diffMs / (1000 * 60 * 60);
      const normDate1 = normalizeDate(order.sessionDate);
      const isToday = normDate1 === todayStr;
      const isTomorrow = normDate1 === tomorrowStr;

      if ((diffHours >= -4 && diffHours <= 24) || (isToday && diffHours > -8)) {
        let urgencyLevel: 'imminent' | 'today' | 'tomorrow' | 'upcoming' = 'upcoming';
        let timeStatusLabel = '';

        if (diffHours < 0 && isToday) {
          urgencyLevel = 'imminent';
          timeStatusLabel = `Hari Ini (${order.sessionTime || 'Sedang Berlangsung'})`;
        } else if (diffHours >= 0 && diffHours < 1) {
          urgencyLevel = 'imminent';
          const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
          timeStatusLabel = `🚨 Mulai dalam ${mins} menit!`;
        } else if (diffHours >= 1 && diffHours <= 6) {
          urgencyLevel = 'imminent';
          timeStatusLabel = `⏰ Mulai dalam ${Math.round(diffHours)} jam (${isToday ? 'Hari Ini' : 'Besok'}, ${order.sessionTime})`;
        } else if (isToday) {
          urgencyLevel = 'today';
          timeStatusLabel = `Hari Ini, ${order.sessionTime} (dalam ${Math.round(diffHours)} jam)`;
        } else if (isTomorrow) {
          urgencyLevel = 'tomorrow';
          timeStatusLabel = `Besok, ${order.sessionTime} (dalam ${Math.round(diffHours)} jam)`;
        } else {
          timeStatusLabel = `Dalam ${Math.round(diffHours)} jam (${formatDateIndonesian(order.sessionDate)})`;
        }

        results.push({
          order,
          sessionNumber: 1,
          dateStr: order.sessionDate,
          timeStr: order.sessionTime,
          location: order.locationAddress,
          locationType: order.locationType,
          sessionDateTime: dt1,
          diffHours,
          diffMinutes: Math.round(diffMs / (1000 * 60)),
          isToday,
          isTomorrow,
          timeStatusLabel,
          urgencyLevel,
        });
      }
    }

    // Check Sesi 2 if exists
    if (order.hasSecondSession && order.sessionDate2) {
      const dt2 = parseSessionDateTime(order.sessionDate2, order.sessionTime2);
      if (dt2) {
        const diffMs2 = dt2.getTime() - refMs;
        const diffHours2 = diffMs2 / (1000 * 60 * 60);
        const normDate2 = normalizeDate(order.sessionDate2);
        const isToday2 = normDate2 === todayStr;
        const isTomorrow2 = normDate2 === tomorrowStr;

        if ((diffHours2 >= -4 && diffHours2 <= 24) || (isToday2 && diffHours2 > -8)) {
          let urgencyLevel: 'imminent' | 'today' | 'tomorrow' | 'upcoming' = 'upcoming';
          let timeStatusLabel = '';

          if (diffHours2 < 0 && isToday2) {
            urgencyLevel = 'imminent';
            timeStatusLabel = `Hari Ini (Sesi 2, ${order.sessionTime2 || 'Sedang Berlangsung'})`;
          } else if (diffHours2 >= 0 && diffHours2 < 1) {
            urgencyLevel = 'imminent';
            const mins = Math.max(1, Math.round(diffMs2 / (1000 * 60)));
            timeStatusLabel = `🚨 Sesi 2 mulai dalam ${mins} menit!`;
          } else if (diffHours2 >= 1 && diffHours2 <= 6) {
            urgencyLevel = 'imminent';
            timeStatusLabel = `⏰ Sesi 2 dalam ${Math.round(diffHours2)} jam (${isToday2 ? 'Hari Ini' : 'Besok'})`;
          } else if (isToday2) {
            urgencyLevel = 'today';
            timeStatusLabel = `Hari Ini (Sesi 2), ${order.sessionTime2} (dalam ${Math.round(diffHours2)} jam)`;
          } else if (isTomorrow2) {
            urgencyLevel = 'tomorrow';
            timeStatusLabel = `Besok (Sesi 2), ${order.sessionTime2} (dalam ${Math.round(diffHours2)} jam)`;
          } else {
            timeStatusLabel = `Sesi 2 dalam ${Math.round(diffHours2)} jam (${formatDateIndonesian(order.sessionDate2)})`;
          }

          results.push({
            order,
            sessionNumber: 2,
            dateStr: order.sessionDate2,
            timeStr: order.sessionTime2 || '',
            location: order.locationAddress2 || order.locationAddress,
            locationType: order.locationType2 || 'venue',
            sessionDateTime: dt2,
            diffHours: diffHours2,
            diffMinutes: Math.round(diffMs2 / (1000 * 60)),
            isToday: isToday2,
            isTomorrow: isTomorrow2,
            timeStatusLabel,
            urgencyLevel,
          });
        }
      }
    }
  }

  return results.sort((a, b) => a.sessionDateTime.getTime() - b.sessionDateTime.getTime());
}
