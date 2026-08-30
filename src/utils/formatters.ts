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
  const dpAmount = Math.round(order.totalPrice * 0.5);

  let message = `Halo Dimensi Fotografi Studio! 📸✨

Saya ingin mengonfirmasi pendaftaran / order jasa foto dengan rincian berikut:

*ID Booking*: ${order.id}
*Nama Klien*: ${order.clientName}
*No. WhatsApp*: ${order.phone}
*Email*: ${order.email || '-'}

*Pilihan Paket*: ${order.packageName} (${formatRupiah(order.packagePrice)})
*Tambahan (Add-ons)*: ${order.addOnsText || 'Tidak ada'}
*Total Biaya*: ${formatRupiah(order.totalPrice)}
*Estimasi DP (50%)*: ${formatRupiah(dpAmount)}
*Ketentuan Bayar*: ${order.paymentPreference}

*Jadwal Sesi*: ${formatDateIndonesian(order.sessionDate)}
*Waktu Sesi*: ${order.sessionTime}
*Lokasi*: ${order.locationAddress} (${(order.locationType || 'studio').toUpperCase()})

*Catatan / Konsep*: ${order.notes || '-'}`;

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


