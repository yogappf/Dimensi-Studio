import * as XLSX from 'xlsx';
import { BookingOrder } from '../types';

export function exportOrdersToExcel(orders: BookingOrder[], filename = 'Daftar_Konsumen_Dimensi_Fotografi.xlsx') {
  if (!orders || orders.length === 0) {
    alert('Tidak ada data konsumen untuk diekspor.');
    return false;
  }

  // Format the data for Excel columns
  const formattedData = orders.map((order, index) => ({
    'No': index + 1,
    'ID Booking': order.id,
    'Tanggal Daftar / Order': new Date(order.createdAt).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    'Nama Konsumen': order.clientName,
    'No. WhatsApp / Telp': order.phone,
    'Email Konsumen': order.email || '-',
    'Paket Foto': order.packageName,
    'Harga Paket (Rp)': order.packagePrice,
    'Layanan Tambahan (Add-ons)': order.addOnsText || 'Tidak ada',
    'Biaya Tambahan (Rp)': order.addOnsTotal,
    'Total Biaya Sesi (Rp)': order.totalPrice,
    'Metode Pembayaran': order.paymentPreference,
    'Jumlah Sesi': order.hasSecondSession && order.sessionDate2 ? '2 Sesi (Acara 1 & 2)' : '1 Sesi Tunggal',
    // Sesi 1
    'Tanggal Sesi 1': order.sessionDate,
    'Waktu Sesi 1': order.sessionTime,
    'Tipe Lokasi 1': order.locationType === 'studio' ? 'Studio Dimensi' : order.locationType === 'outdoor' ? 'Outdoor' : 'Venue / Gedung Klien',
    'Alamat Lokasi 1': order.locationAddress,
    'Catatan Sesi 1': order.notes || '-',
    // Sesi 2
    'Tanggal Sesi 2': order.hasSecondSession && order.sessionDate2 ? order.sessionDate2 : '-',
    'Waktu Sesi 2': order.hasSecondSession && order.sessionTime2 ? order.sessionTime2 : '-',
    'Tipe Lokasi 2': order.hasSecondSession && order.locationType2 ? (order.locationType2 === 'studio' ? 'Studio Dimensi' : order.locationType2 === 'outdoor' ? 'Outdoor' : 'Venue / Gedung Klien') : '-',
    'Alamat Lokasi 2': order.hasSecondSession && order.locationAddress2 ? order.locationAddress2 : '-',
    'Catatan Sesi 2': order.hasSecondSession && order.notes2 ? order.notes2 : '-',
    'Status Pesanan': order.status
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths for nice readability
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 16 }, // ID Booking
    { wch: 25 }, // Tanggal Daftar
    { wch: 25 }, // Nama Konsumen
    { wch: 18 }, // No WhatsApp
    { wch: 25 }, // Email
    { wch: 32 }, // Paket Foto
    { wch: 16 }, // Harga Paket
    { wch: 35 }, // Layanan Tambahan
    { wch: 18 }, // Biaya Tambahan
    { wch: 18 }, // Total Biaya
    { wch: 18 }, // Pembayaran
    { wch: 22 }, // Jumlah Sesi
    { wch: 16 }, // Tanggal Sesi 1
    { wch: 16 }, // Waktu 1
    { wch: 18 }, // Tipe Lokasi 1
    { wch: 35 }, // Alamat Lokasi 1
    { wch: 30 }, // Catatan 1
    { wch: 16 }, // Tanggal Sesi 2
    { wch: 16 }, // Waktu 2
    { wch: 18 }, // Tipe Lokasi 2
    { wch: 35 }, // Alamat Lokasi 2
    { wch: 30 }, // Catatan 2
    { wch: 22 }  // Status
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Konsumen');

  // Trigger download
  XLSX.writeFile(workbook, filename);
  return true;
}

export function exportOrdersToCSV(orders: BookingOrder[], filename = 'Daftar_Konsumen_Dimensi_Fotografi.csv') {
  if (!orders || orders.length === 0) {
    alert('Tidak ada data konsumen untuk diekspor.');
    return false;
  }

  const headers = [
    'No',
    'ID Booking',
    'Tanggal Order',
    'Nama Konsumen',
    'WhatsApp',
    'Email',
    'Paket Foto',
    'Harga Paket (IDR)',
    'Add-ons',
    'Biaya Add-ons (IDR)',
    'Total Biaya (IDR)',
    'Tipe Bayar',
    'Jumlah Sesi',
    'Tanggal Sesi 1',
    'Waktu Sesi 1',
    'Lokasi Sesi 1',
    'Catatan Sesi 1',
    'Tanggal Sesi 2',
    'Waktu Sesi 2',
    'Lokasi Sesi 2',
    'Catatan Sesi 2',
    'Status'
  ];

  const rows = orders.map((order, idx) => [
    idx + 1,
    `"${order.id}"`,
    `"${new Date(order.createdAt).toLocaleDateString('id-ID')}"`,
    `"${order.clientName.replace(/"/g, '""')}"`,
    `"${order.phone}"`,
    `"${order.email || ''}"`,
    `"${order.packageName.replace(/"/g, '""')}"`,
    order.packagePrice,
    `"${(order.addOnsText || '').replace(/"/g, '""')}"`,
    order.addOnsTotal,
    order.totalPrice,
    `"${order.paymentPreference}"`,
    `"${order.hasSecondSession && order.sessionDate2 ? '2 Sesi' : '1 Sesi'}"`,
    `"${order.sessionDate}"`,
    `"${order.sessionTime}"`,
    `"${order.locationAddress.replace(/"/g, '""')}"`,
    `"${(order.notes || '').replace(/"/g, '""')}"`,
    `"${order.hasSecondSession && order.sessionDate2 ? order.sessionDate2 : '-'}"`,
    `"${order.hasSecondSession && order.sessionTime2 ? order.sessionTime2 : '-'}"`,
    `"${(order.hasSecondSession && order.locationAddress2 ? order.locationAddress2 : '-').replace(/"/g, '""')}"`,
    `"${(order.hasSecondSession && order.notes2 ? order.notes2 : '-').replace(/"/g, '""')}"`,
    `"${order.status}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
