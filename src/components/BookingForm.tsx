import React, { useState, useEffect } from 'react';
import { PhotoPackage, AddOnItem, BookingOrder } from '../types';
import { PHOTO_PACKAGES, ADD_ON_SERVICES } from '../data/mockData';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface BookingFormProps {
  initialPackageId?: string;
  initialAddOnIds?: string[];
  onOrderCreated: (order: BookingOrder) => void;
  packages?: PhotoPackage[];
  addons?: AddOnItem[];
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialPackageId,
  initialAddOnIds = [],
  onOrderCreated,
  packages = PHOTO_PACKAGES,
  addons = ADD_ON_SERVICES,
}) => {
  const [packageId, setPackageId] = useState<string>(initialPackageId || (packages[0]?.id || 'pkg-default'));
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(initialAddOnIds);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('10:00 WIB');
  const [locationType, setLocationType] = useState<'studio' | 'outdoor' | 'venue'>('studio');
  const [locationAddress, setLocationAddress] = useState('Dimensi Photo Studio (Studio 1 Utama)');
  const [notes, setNotes] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'DP 30%' | 'DP 50%' | 'Lunas'>('DP 30%');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize when parent props change
  useEffect(() => {
    if (initialPackageId) {
      setPackageId(initialPackageId);
    }
  }, [initialPackageId]);

  useEffect(() => {
    if (initialAddOnIds && initialAddOnIds.length > 0) {
      setSelectedAddOns(initialAddOnIds);
    }
  }, [initialAddOnIds]);

  const currentPackage = packages.find((p) => p.id === packageId) || packages[0] || PHOTO_PACKAGES[0];
  const selectedAddonsList = addons.filter((a) => selectedAddOns.includes(a.id));
  const addonsTotal = selectedAddonsList.reduce((acc, a) => acc + a.price, 0);
  const totalPrice = currentPackage.price + addonsTotal;

  // Auto set default address when locationType changes
  const handleLocationTypeChange = (type: 'studio' | 'outdoor' | 'venue') => {
    setLocationType(type);
    if (type === 'studio') {
      setLocationAddress('Dimensi Photo Studio (Jl. Melati Indah No. 45, Studio Dimensi Visual)');
    } else if (type === 'outdoor') {
      setLocationAddress('Lokasi Outdoor (Contoh: Hutan Kota GBK / PIK / Pantai)');
    } else {
      setLocationAddress('');
    }
  };

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!clientName.trim()) {
      setFormError('Silakan masukkan nama lengkap Anda.');
      return;
    }

    if (!phone.trim() || phone.trim().replace(/\D/g, '').length < 8) {
      setFormError('Silakan masukkan nomor WhatsApp aktif yang valid (minimal 8 digit angka).');
      return;
    }

    if (!sessionDate) {
      setFormError('Silakan tentukan tanggal jadwal sesi pemotretan.');
      return;
    }

    if (!locationAddress.trim()) {
      setFormError('Silakan isi detail alamat lokasi pemotretan.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBookingId = `DMS-${new Date().getFullYear()}-${randomSuffix}`;

    const newOrder: BookingOrder = {
      id: newBookingId,
      createdAt: new Date().toISOString(),
      clientName: clientName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      packageId: currentPackage.id,
      packageName: currentPackage.name,
      packagePrice: currentPackage.price,
      addOnIds: selectedAddOns,
      addOnsText: selectedAddonsList.length > 0 ? selectedAddonsList.map((a) => a.name).join(', ') : 'Tidak ada',
      addOnsTotal: addonsTotal,
      totalPrice: totalPrice,
      sessionDate: sessionDate,
      sessionTime: sessionTime,
      locationType: locationType,
      locationAddress: locationAddress.trim(),
      notes: notes.trim(),
      status: 'Menunggu Konfirmasi',
      paymentPreference: paymentPreference,
    };

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff'],
      });
    } catch {
      // fallback
    }

    setTimeout(() => {
      onOrderCreated(newOrder);
      setIsSubmitting(false);
      // Reset form fields
      setClientName('');
      setPhone('');
      setEmail('');
      setNotes('');
    }, 400);
  };

  // Local min date helper (today)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const minDateStr = `${year}-${month}-${day}`;

  return (
    <section id="formulir-order" className="py-16 bg-[#0A0A0A] text-[#E0E0E0] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
            <span>Reservasi & Order</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Formulir Order <span className="italic font-serif text-[#D4AF37]">Jasa Foto</span>
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
            Isi formulir pendaftaran pemotretan di bawah ini. Pesanan Anda akan langsung terdata dalam sistem dan diterbitkan nota digital resmi seketika.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Input Fields */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Package & Add-ons selection */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="w-5 h-5 bg-[#D4AF37] text-black font-mono flex items-center justify-center text-[10px] font-black">1</span>
                <span>Pilihan Paket & Tambahan (Add-ons)</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Paket Fotografi <span className="text-[#D4AF37]">*</span>
                  </label>
                  <select
                    value={packageId}
                    onChange={(e) => setPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                    id="select-package"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — {formatRupiah(pkg.price)} ({pkg.duration})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add-ons checkboxes */}
                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-mono">
                    Layanan Tambahan (Opsional Add-ons):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {addons.map((addon) => {
                      const isChecked = selectedAddOns.includes(addon.id);
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-start gap-2.5 p-3 border cursor-pointer text-xs transition-all ${
                            isChecked
                              ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white'
                              : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAddon(addon.id)}
                            className="mt-0.5 border-white/20 text-[#D4AF37] focus:ring-0 accent-[#D4AF37]"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-white text-xs">{addon.name}</div>
                            <div className="text-[#D4AF37] font-medium font-serif text-[11px] mt-0.5">+{formatRupiah(addon.price)}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Contact Info */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="w-5 h-5 bg-[#D4AF37] text-black font-mono flex items-center justify-center text-[10px] font-black">2</span>
                <span>Data Diri & Kontak Konsumen</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Nama Lengkap Konsumen / Klien <span className="text-[#D4AF37]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rian Pratama & Siska"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                      id="input-client-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Nomor WhatsApp / HP <span className="text-[#D4AF37]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                      id="input-client-phone"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono mt-1 block">Untuk konfirmasi nota & jadwal</span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Alamat Email (Opsional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="email@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                      id="input-client-email"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono mt-1 block">Untuk pengiriman link Google Drive</span>
                </div>

              </div>
            </div>

            {/* Step 3: Schedule & Location */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span className="w-5 h-5 bg-[#D4AF37] text-black font-mono flex items-center justify-center text-[10px] font-black">3</span>
                <span>Jadwal & Lokasi Sesi Pemotretan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Tanggal Rencana Sesi <span className="text-[#D4AF37]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      min={minDateStr}
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none [color-scheme:dark]"
                      id="input-session-date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Pilihan Waktu / Slot <span className="text-[#D4AF37]">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                      id="select-session-time"
                    >
                      <option value="08:30 WIB (Pagi)">08:30 WIB (Pagi Segar)</option>
                      <option value="10:00 WIB (Pagi)">10:00 WIB</option>
                      <option value="13:30 WIB (Siang)">13:30 WIB</option>
                      <option value="15:30 WIB (Golden Hour)">15:30 WIB (Golden Hour Senja)</option>
                      <option value="18:30 WIB (Malam)">18:30 WIB (Studio Malam)</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Tipe Tempat Pemotretan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'studio', label: 'Studio Dimensi' },
                      { id: 'outdoor', label: 'Outdoor / Alam' },
                      { id: 'venue', label: 'Gedung / Klien' },
                    ].map((loc) => (
                      <button
                        type="button"
                        key={loc.id}
                        onClick={() => handleLocationTypeChange(loc.id as any)}
                        className={`py-2 px-2 text-xs uppercase tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                          locationType === loc.id
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Detail Alamat / Nama Lokasi <span className="text-[#D4AF37]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Masukkan alamat venue, studio, atau lokasi pemotretan"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                      id="input-location-address"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Catatan Khusus / Konsep Foto yang Diinginkan (Opsional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Nuansa adat Jawa, bawa 2 kostum casual, fokus candid ekspresi natural..."
                      className="w-full pl-10 pr-3.5 py-2 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                      id="input-notes"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                    Pilihan Ketentuan Pembayaran:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['DP 30%', 'DP 50%', 'Lunas'] as const).map((pref) => (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => setPaymentPreference(pref)}
                        className={`py-2 px-2 text-xs uppercase tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                          paymentPreference === pref
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                            : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

          </div>

          {/* Right: Real-time Order Summary Card & Submit */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            
            <div className="p-6 bg-[#141414] border border-[#D4AF37]/60 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-mono">Rincian Reservasi</span>
                  <h4 className="text-lg font-serif font-bold text-white mt-1">Ringkasan Pendaftaran</h4>
                </div>
                <div className="w-9 h-9 border border-white/20 flex items-center justify-center text-[#D4AF37]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              {/* Summary details */}
              <div className="space-y-3 text-xs">
                
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Paket Pilihan:</span>
                  <div className="font-semibold text-white text-sm mt-0.5">{currentPackage.name}</div>
                  <div className="flex justify-between items-center text-gray-300 mt-1">
                    <span className="text-[10px] font-mono text-gray-400">Durasi: {currentPackage.duration}</span>
                    <span className="font-bold text-[#D4AF37] font-serif">{formatRupiah(currentPackage.price)}</span>
                  </div>
                </div>

                {selectedAddonsList.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-gray-400 block">Layanan Tambahan:</span>
                    {selectedAddonsList.map((a) => (
                      <div key={a.id} className="flex justify-between text-gray-300 text-[11px]">
                        <span className="truncate max-w-[180px]">• {a.name}</span>
                        <span className="text-[#D4AF37] font-serif">+{formatRupiah(a.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Jadwal & Lokasi:</span>
                  <div className="text-white">
                    {sessionDate ? formatDateIndonesian(sessionDate) : '(Pilih tanggal di formulir)'}
                  </div>
                  <div className="text-gray-400 text-[11px] font-mono">
                    {sessionTime} • {locationType.toUpperCase()}
                  </div>
                </div>

              </div>

              {/* Total Calculation */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-gray-400">Pilihan Bayar:</span>
                  <span className="font-semibold text-[#D4AF37] font-mono">{paymentPreference}</span>
                </div>
                
                {paymentPreference !== 'Lunas' && (
                  <div className="flex justify-between items-baseline text-xs text-gray-300">
                    <span>Estimasi DP:</span>
                    <span className="font-semibold text-white font-serif">
                      {formatRupiah(Math.round(totalPrice * (paymentPreference === 'DP 30%' ? 0.3 : 0.5)))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                  <span className="text-xs uppercase tracking-wider font-bold text-white">Total Biaya:</span>
                  <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                id="submit-order-btn"
              >
                {isSubmitting ? (
                  <span>Mendaftarkan Pesanan...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Konfirmasi Booking Sekarang</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-[#0A0A0A] border border-white/10 text-[10px] text-gray-400 space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="uppercase tracking-wider font-mono">Proses Pemesanan Aman:</span>
                </div>
                <p className="leading-relaxed">
                  Data otomatis tercatat dalam basis data konsumen studio & nota digital resmi akan langsung diterbitkan beserta tautan konfirmasi WhatsApp.
                </p>
              </div>

            </div>

          </div>

        </form>

      </div>
    </section>
  );
};
