const fs = require('fs');
let content = fs.readFileSync('src/utils/formatters.ts', 'utf8');

const newFunction = `
export function generateClientReminderMessage(order: any): string {
  let message = \`Halo Kak \${order.clientName}! 📸✨\\n\\nKami dari *Dimensi Fotografi Studio* ingin mengingatkan kembali mengenai pesanan pemotretan Anda.\\n\\n\`;

  if (order.status === 'Menunggu Konfirmasi') {
    message += \`Saat ini status pesanan Anda masih *Menunggu Konfirmasi*. Jika belum melakukan pembayaran DP/Lunas, silakan konfirmasi pembayaran (kirim bukti transfer) agar jadwal Anda dapat kami amankan.\\n\\n\`;
  } else if (order.status === 'Terkonfirmasi & Terjadwal') {
    message += \`Jadwal pemotretan Anda telah *Terkonfirmasi & Terjadwal*. Mohon datang tepat waktu (idealnya 15 menit sebelumnya) sesuai jadwal berikut ya Kak:\\n\\n\`;
  } else {
    message += \`Kami menunggu kehadiran Anda di studio kami pada jadwal berikut:\\n\\n\`;
  }

  message += \`*Detail Pesanan*:\\n- *ID Booking*: \${order.id}\\n- *Paket Foto*: \${order.packageName}\\n- *Tanggal Sesi*: \${formatDateIndonesian(order.sessionDate)}\\n- *Waktu*: \${order.sessionTime}\\n- *Lokasi*: \${order.locationAddress} (\${(order.locationType || 'studio').toUpperCase()})\\n\\nJika ada pertanyaan lebih lanjut atau ingin mengubah jadwal, silakan balas pesan ini. Terima kasih! 🙏\`;

  return message;
}

export function generateClientReminderWhatsAppLink(order: any): string {
  const cleanPhone = normalizeWhatsAppNumber(order.phone);
  const message = generateClientReminderMessage(order);
  return \`https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(message)}\`;
}
`;

content += '\n' + newFunction;
fs.writeFileSync('src/utils/formatters.ts', content);
