import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Camera,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  Clock,
  Mail,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Printer,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Smartphone,
  Sliders,
  DollarSign,
  FileSpreadsheet,
  QrCode,
  Lock,
} from 'lucide-react';
import screenshotLanding from '../assets/images/screenshot_landing_page_1789363732701.jpg';
import screenshotBooking from '../assets/images/screenshot_booking_form_1789363746894.jpg';
import screenshotAdmin from '../assets/images/screenshot_admin_dashboard_1789363760099.jpg';
import screenshotCustomer from '../assets/images/screenshot_customer_portal_1789363774392.jpg';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioName?: string;
  adminEmail?: string;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  studioName = 'Dimensi Fotografi Studio',
  adminEmail = 'dimensi.idphoto@gmail.com',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customer' | 'admin_ops' | 'master_admin' | 'faq'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0F0F0F] border border-[#D4AF37]/40 shadow-2xl my-auto text-white flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#141414] px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-metallic text-black flex items-center justify-center font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif tracking-wide text-white">
                  Buku Panduan Pengguna (User Manual)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-gold-metallic text-black font-bold border border-[#FFF0A8] shadow-sm">
                  v2.5 Full Edition
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Panduan Operasional & Dokumentasi Lengkap Sistem {studioName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-[#1F1F1F] hover:bg-white/15 border border-white/15 text-gray-200 transition-colors cursor-pointer"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-[#1A1A1A] hover:bg-rose-950 text-gray-400 hover:text-rose-300 border border-white/10 transition-colors cursor-pointer"
              title="Tutup Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#0A0A0A] px-4 pt-3 border-b border-white/10 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#D4AF37] text-gold-metallic bg-[#171717]'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Ringkasan & Arsitektur</span>
          </button>

          <button
            onClick={() => setActiveTab('customer')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'customer'
                ? 'border-[#D4AF37] text-gold-metallic bg-[#171717]'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Panduan Pelanggan</span>
          </button>

          <button
            onClick={() => setActiveTab('admin_ops')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'admin_ops'
                ? 'border-[#D4AF37] text-gold-metallic bg-[#171717]'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>3. Admin & Staf Operasional</span>
          </button>

          <button
            onClick={() => setActiveTab('master_admin')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'master_admin'
                ? 'border-[#D4AF37] text-gold-metallic bg-[#171717]'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Portal Master Admin</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-[#D4AF37] text-gold-metallic bg-[#171717]'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>5. FAQ & Troubleshooting</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-gray-300 text-sm leading-relaxed max-h-[calc(92vh-130px)]">

          {/* TAB 1: OVERVIEW & ARCHITECTURE */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#141414] p-5 border border-white/10 space-y-4">
                <div className="flex items-center gap-2.5 text-[#D4AF37]">
                  <Camera className="w-5 h-5" />
                  <h3 className="text-base font-bold font-serif text-white uppercase tracking-wider">
                    Tentang Aplikasi {studioName}
                  </h3>
                </div>
                <p className="text-sm text-gray-300">
                  Aplikasi Web Terpadu <strong>{studioName}</strong> adalah platform sistem pemesanan (booking),
                  penjadwalan real-time, manajemen studio fotografi, notifikasi cerdas multi-channel (WhatsApp & Email),
                  serta pelacakan status pesanan konsumen secara transparan.
                </p>

                {/* Screenshot 1 */}
                <div className="mt-4 border border-white/15 bg-black/60 p-2 space-y-2">
                  <div className="relative overflow-hidden group">
                    <img
                      src={screenshotLanding}
                      alt="Tampilan Beranda Showcase & Katalog Paket Dimensi Studio"
                      className="w-full h-auto object-cover rounded-none border border-white/10 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/80 text-[#D4AF37] font-mono text-[11px] border border-[#D4AF37]/30">
                      Gambar 1.0: Halaman Utama Showcase & Katalog Layanan Fotografi
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-mono px-1">
                    Halaman depan menyajikan visual hero banner, filter kategori paket (Wedding, Prewedding, Wisuda, dsb.), galeri portofolio, kalkulator simulasi add-on, serta akses cepat ke Portal Pelanggan dan Panel Admin.
                  </p>
                </div>
              </div>

              {/* Core Feature Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                  <div className="w-8 h-8 bg-amber-500/20 text-[#D4AF37] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                    Proteksi Jadwal 7 Jam
                  </h4>
                  <p className="text-xs text-gray-400">
                    Sistem otomatis mengunci 3 jam sebelum dan 4 jam setelah jam yang sudah terisi guna mencegah bentrok jadwal (anti-double booking) tim fotografer.
                  </p>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                  <div className="w-8 h-8 bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                    Notifikasi Email 24 Jam
                  </h4>
                  <p className="text-xs text-gray-400">
                    Peringatan otomatis prioritas tinggi dikirim langsung ke email admin ({adminEmail}) ketika sesi foto akan berlangsung dalam kurun waktu 24 jam.
                  </p>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                  <div className="w-8 h-8 bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                    Portal Lacak & Invoice
                  </h4>
                  <p className="text-xs text-gray-400">
                    Konsumen dapat melacak progress foto (Booking &rarr; Sesi &rarr; Editing &rarr; Siap Unduh) serta mencetak invoice resmi ber-QR Code.
                  </p>
                </div>
              </div>

              {/* User Roles & Access Hierarchy */}
              <div className="bg-[#141414] p-5 border border-white/10 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Struktur Peran Pengguna (Role-Based Access)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#0A0A0A] border-l-2 border-blue-400 flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <strong className="text-blue-300 font-mono">1. Konsumen / Klien (Publik)</strong>
                      <p className="text-gray-400 mt-0.5">Memilih paket, simulasi add-on, menentukan tanggal & jam, input data pemesanan, dan melacak status pesanan via ID Booking.</p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 shrink-0">Tanpa Login Sandi</span>
                  </div>

                  <div className="p-3 bg-[#0A0A0A] border-l-2 border-emerald-400 flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <strong className="text-emerald-300 font-mono">2. Staf Operasional & Fotografer</strong>
                      <p className="text-gray-400 mt-0.5">Mengelola status pesanan, melihat kalender jadwal, mengirim reminder WhatsApp klien, dan mengirim email sesi mendatang 24 jam.</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 shrink-0">Passcode Staf</span>
                  </div>

                  <div className="p-3 bg-[#0A0A0A] border-l-2 border-[#D4AF37] flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <strong className="text-[#D4AF37] font-mono">3. Master Admin / Owner Studio</strong>
                      <p className="text-gray-400 mt-0.5">Akses penuh mengedit katalog paket, add-on, portofolio, manajemen staf & passcode, konfigurasi rekening bank, audit logs, dan ekspor data.</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#D4AF37] shrink-0">Master Passcode / Google Auth</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PANDUAN PELANGGAN */}
          {activeTab === 'customer' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#141414] p-5 border border-white/10 space-y-3">
                <h3 className="text-base font-bold font-serif text-[#D4AF37] flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Alur Pemesanan Sesi Foto (Langkah demi Langkah)
                </h3>
                <p className="text-xs text-gray-300">
                  Berikut adalah panduan lengkap bagi konsumen untuk melakukan reservasi dan memeriksa status jadwal pemotretan.
                </p>

                {/* Screenshot 2 */}
                <div className="mt-3 border border-white/15 bg-black/60 p-2 space-y-2">
                  <div className="relative overflow-hidden group">
                    <img
                      src={screenshotBooking}
                      alt="Tampilan Formulir Booking & Clock Picker Proteksi 7 Jam"
                      className="w-full h-auto object-cover rounded-none border border-white/10 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/80 text-[#D4AF37] font-mono text-[11px] border border-[#D4AF37]/30">
                      Gambar 2.0: Formulir Pemesanan Interaktif & Pemilih Waktu dengan Buffer 7 Jam
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-mono px-1">
                    Formulir pemesanan menampilkan ringkasan harga real-time, pemilihan tanggal, kalkulator add-on opsional, dan sistem validasi anti-bentrok jadwal.
                  </p>
                </div>
              </div>

              {/* Step By Step Guide */}
              <div className="space-y-3">
                <div className="bg-[#141414] p-4 border border-white/10 flex gap-3.5 items-start">
                  <div className="w-7 h-7 bg-[#D4AF37] text-black font-mono font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                      Pilih Paket Fotografi & Tambahan (Add-Ons)
                    </h4>
                    <p className="text-xs text-gray-300">
                      Buka menu <strong>Layanan & Paket</strong>. Klik <strong>"Pilih Paket Ini"</strong> pada paket yang diinginkan (misal: Wedding, Prewedding, Wisuda). Anda juga dapat mencentang layanan tambahan seperti Cetak Canvas, Drone 4K, atau Flashdisk Kayu.
                    </p>
                  </div>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 flex gap-3.5 items-start">
                  <div className="w-7 h-7 bg-[#D4AF37] text-black font-mono font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                      Tentukan Tanggal & Jam Sesi Pemotretan
                    </h4>
                    <p className="text-xs text-gray-300">
                      Pilih tanggal yang diinginkan pada kalender. Gunakan pemilih jam interaktif. Jika jam yang dipilih berada dalam rentang buffer 7 jam dari pesanan lain, sistem akan memberi tanda merah dan menonaktifkan tombol pemesanan demi menjamin ketersediaan tim.
                    </p>
                  </div>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 flex gap-3.5 items-start">
                  <div className="w-7 h-7 bg-[#D4AF37] text-black font-mono font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                      Isi Data Kontak & Kirim Reservasi
                    </h4>
                    <p className="text-xs text-gray-300">
                      Masukkan Nama Lengkap, Nomor WhatsApp, Email, dan Alamat Lokasi (Studio / Venue). Klik tombol <strong>"Konfirmasi Booking Sekarang"</strong>. Sistem akan langsung mengarahkan Anda ke WhatsApp Studio dengan pesan draft otomatis berformat rapi.
                    </p>
                  </div>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 flex gap-3.5 items-start">
                  <div className="w-7 h-7 bg-[#D4AF37] text-black font-mono font-bold flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                      Pelacakan Pesanan & Unduh Foto Hasil Jadi
                    </h4>
                    <p className="text-xs text-gray-300">
                      Buka menu <strong>"Lacak Pesanan"</strong> pada navbar. Masukkan ID Booking Anda (contoh: <code className="text-[#D4AF37]">#DIM-2026-0001</code>) atau nomor WhatsApp Anda. Anda dapat melihat status pengerjaan, mencetak invoice, serta mengakses link Google Drive foto resolusi tinggi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Screenshot 4: Customer Portal */}
              <div className="border border-white/15 bg-black/60 p-2 space-y-2">
                <div className="relative overflow-hidden group">
                  <img
                    src={screenshotCustomer}
                    alt="Tampilan Portal Pelanggan, Invoice QR Code & Timeline Tracking"
                    className="w-full h-auto object-cover rounded-none border border-white/10 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/80 text-[#D4AF37] font-mono text-[11px] border border-[#D4AF37]/30">
                    Gambar 2.1: Portal Lacak Pesanan Konsumen dengan Timeline & Invoice
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN & STAF OPERASIONAL */}
          {activeTab === 'admin_ops' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#141414] p-5 border border-white/10 space-y-3">
                <h3 className="text-base font-bold font-serif text-[#D4AF37] flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5" />
                  Panduan Dashboard Operasional & Penjadwalan
                </h3>
                <p className="text-xs text-gray-300">
                  Dashboard Operasional digunakan oleh staf dan fotografer untuk memproses pesanan, memantau kalender sesi foto harian, serta mengirimkan reminder ke klien dan alert ke admin.
                </p>

                {/* Screenshot 3: Admin Dashboard */}
                <div className="mt-3 border border-white/15 bg-black/60 p-2 space-y-2">
                  <div className="relative overflow-hidden group">
                    <img
                      src={screenshotAdmin}
                      alt="Tampilan Dashboard Admin dengan Banner Peringatan 24 Jam"
                      className="w-full h-auto object-cover rounded-none border border-white/10 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/80 text-[#D4AF37] font-mono text-[11px] border border-[#D4AF37]/30">
                      Gambar 3.0: Dashboard Operasional Admin & Banner Peringatan Sesi &lt; 24 Jam
                    </div>
                  </div>
                </div>
              </div>

              {/* Fitur Utama Admin Ops */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-[#D4AF37]">
                    <Clock className="w-4 h-4" />
                    Peringatan Sesi &lt; 24 Jam (Red Banner)
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Banner peringatan di bagian atas dashboard secara otomatis mendeteksi pesanan yang dijadwalkan dalam 24 jam ke depan. Admin dapat menekan tombol:
                  </p>
                  <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4 font-mono">
                    <li><strong className="text-white">"Email Admin (X Sesi)"</strong>: Mengirim rekap digest seluruh sesi 24 jam ke email admin.</li>
                    <li><strong className="text-white">"WA Klien"</strong>: Membuka template chat pengingat H-1 ke WhatsApp konsumen.</li>
                    <li><strong className="text-white">"Email Admin"</strong>: Mengirim email notifikasi individual per pesanan.</li>
                  </ul>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-[#D4AF37]">
                    <Sliders className="w-4 h-4" />
                    Manajemen Status & Link Drive Foto
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Setiap pesanan dapat diubah statusnya melalui dropdown:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    <span className="p-1 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">1. Menunggu Konfirmasi</span>
                    <span className="p-1 bg-blue-500/10 text-blue-300 border border-blue-500/20">2. Terkonfirmasi</span>
                    <span className="p-1 bg-purple-500/10 text-purple-300 border border-purple-500/20">3. Proses Editing</span>
                    <span className="p-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">4. Selesai (Siap Unduh)</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Input <em>Google Drive URL</em> pada pesanan agar klien dapat langsung mengunduh hasil fotonya di Portal Konsumen.
                  </p>
                </div>
              </div>

              {/* Aturan Buffer 7 Jam */}
              <div className="bg-[#141414] p-4 border border-amber-500/30 space-y-2">
                <h4 className="font-bold text-amber-300 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Ketentuan Buffer Penjadwalan 7 Jam
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Untuk menjaga kualitas layanan dan mobilitas tim, sistem menerapkan aturan buffer 7 jam:
                </p>
                <div className="p-3 bg-black/60 border border-white/10 font-mono text-xs space-y-1 text-gray-300">
                  <div className="text-amber-400 font-bold">Contoh Sesi Terisi: Pukul 10:00 WIB</div>
                  <div>&bull; <strong>3 Jam Sebelum (07:00 - 10:00 WIB)</strong>: Terkunci untuk persiapan & perjalanan tim fotografer.</div>
                  <div>&bull; <strong>Jam Acara (10:00 WIB)</strong>: Sesi utama berlangsung.</div>
                  <div>&bull; <strong>4 Jam Setelah (10:00 - 14:00 WIB)</strong>: Terkunci untuk durasi pemotretan & pasca-sesi.</div>
                  <div className="text-emerald-400 font-bold mt-1">&rarr; Total Rentang Terblokir: 07:00 s/d 14:00 WIB</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MASTER ADMIN PORTAL */}
          {activeTab === 'master_admin' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#141414] p-5 border border-white/10 space-y-3">
                <h3 className="text-base font-bold font-serif text-[#D4AF37] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Portal Master Admin & Konfigurasi Studio
                </h3>
                <p className="text-xs text-gray-300">
                  Portal Master Admin diperuntukkan khusus bagi Owner / Pimpinan Studio untuk mengelola seluruh aspek bisnis, aset, personil staf, serta keamanan sistem.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-[#141414] p-4 border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    1. Manajemen Paket, Add-On & Portofolio
                  </h4>
                  <p className="text-xs text-gray-300">
                    Tambah, edit harga, ubah rincian benefit paket foto, upload foto contoh portofolio baru, serta atur daftar item add-on (cetak album, drone, makeup).
                  </p>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    2. Pengaturan Keamanan & Passcode Akses
                  </h4>
                  <p className="text-xs text-gray-300">
                    Master Admin dapat memperbarui <strong>Staff Passcode</strong> (untuk staf lapangan) dan <strong>Master Passcode</strong> (untuk kontrol penuh sistem) kapan saja secara real-time.
                  </p>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    3. Konfigurasi Email & Rekening Bank
                  </h4>
                  <p className="text-xs text-gray-300">
                    Tentukan alamat email penerima notifikasi (<code className="text-[#D4AF37]">dimensi.idphoto@gmail.com</code>), aktifkan/nonaktifkan notifikasi 24 jam, lakukan uji coba email (Test Button), serta kelola daftar rekening bank (BCA, Mandiri, BRI, BNI, QRIS).
                  </p>
                </div>

                <div className="bg-[#141414] p-4 border border-white/10 space-y-1.5">
                  <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    4. Ekspor Data Excel & CSV
                  </h4>
                  <p className="text-xs text-gray-300">
                    Unduh seluruh data pesanan, pendapatan bulanan, dan histori transaksi dalam format <strong>Excel (.xlsx)</strong> atau <strong>CSV</strong> untuk kebutuhan pembukuan akuntansi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & TROUBLESHOOTING */}
          {activeTab === 'faq' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
                  Q: Mengapa jam tertentu tidak bisa dipilih di formulir booking?
                </h4>
                <p className="text-xs text-gray-300">
                  A: Jam tersebut terkena aturan proteksi buffer 7 jam (3 jam sebelum atau 4 jam setelah) dari jadwal pemotretan pesanan lain yang sudah terkonfirmasi. Silakan pilih jam atau tanggal lain.
                </p>
              </div>

              <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
                  Q: Bagaimana cara kerja pengiriman email 24 jam?
                </h4>
                <p className="text-xs text-gray-300">
                  A: Sistem memindai seluruh pesanan yang memiliki jadwal dalam kurun waktu 24 jam ke depan. Email dikirim secara otomatis ke email admin studio dan dilengkapi tombol pengiriman manual di banner atas dashboard.
                </p>
              </div>

              <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
                  Q: Bagaimana jika koneksi Firebase terputus?
                </h4>
                <p className="text-xs text-gray-300">
                  A: Aplikasi dilengkapi sistem <em>Local Storage Fallback</em> otomatis. Seluruh data pesanan dan pengaturan tetap tersimpan secara aman di browser lokal Anda hingga koneksi cloud pulih kembali.
                </p>
              </div>

              <div className="bg-[#141414] p-4 border border-white/10 space-y-2">
                <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
                  Q: Bagaimana cara menghubungi tim teknis atau support?
                </h4>
                <p className="text-xs text-gray-300">
                  A: Hubungi melalui email <code className="text-[#D4AF37]">{adminEmail}</code> atau via WhatsApp resmi studio yang tercantum di bagian bawah halaman.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-[#141414] px-5 py-3.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Dokumentasi Resmi & Terverifikasi {studioName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#222222] hover:bg-white text-white hover:text-black text-xs font-mono font-bold uppercase tracking-wider border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Panduan</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
