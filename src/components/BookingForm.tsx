import React, { useState, useEffect, useMemo } from 'react';
import { PhotoPackage, AddOnItem, BookingOrder } from '../types';
import { PHOTO_PACKAGES, ADD_ON_SERVICES } from '../data/mockData';
import { formatRupiah, formatDateIndonesian, checkScheduleSlotConflict, getBookedSlotsForDate } from '../utils/formatters';
import { AnimatedClockPicker } from './AnimatedClockPicker';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Ban,
  Layers,
  Tag,
  Check,
  Star,
  ChevronDown,
} from 'lucide-react';

// Category label & icon dictionary for consistent presentation
export const CATEGORY_META: Record<string, { label: string; icon: string }> = {
  all: { label: 'Semua Kategori', icon: '✨' },
  wedding: { label: 'Wedding & Akad', icon: '💍' },
  prewedding: { label: 'Pre-Wedding', icon: '💑' },
  engagement: { label: 'Engagement & Lamaran', icon: '💐' },
  siraman: { label: 'Siraman & Pengajian', icon: '🌿' },
  wisuda: { label: 'Wisuda & Graduation', icon: '🎓' },
  keluarga: { label: 'Keluarga & Maternity', icon: '👨‍👩‍👧' },
  ulangtahun: { label: 'Ulang Tahun & Kids', icon: '🎂' },
  event: { label: 'Event & Gathering', icon: '🎉' },
  studio: { label: 'Studio & Personal', icon: '📸' },
};

export const getCategoryLabel = (categoryKey?: string): string => {
  const key = (categoryKey || '').toLowerCase();
  return CATEGORY_META[key]?.label || (categoryKey ? categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1) : 'Umum');
};

export const getCategoryIcon = (categoryKey?: string): string => {
  const key = (categoryKey || '').toLowerCase();
  return CATEGORY_META[key]?.icon || '📁';
};

interface BookingFormProps {
  initialPackageId?: string;
  initialAddOnIds?: string[];
  onOrderCreated: (order: BookingOrder) => void;
  packages?: PhotoPackage[];
  addons?: AddOnItem[];
  existingOrders?: BookingOrder[];
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialPackageId,
  initialAddOnIds = [],
  onOrderCreated,
  packages = PHOTO_PACKAGES,
  addons = ADD_ON_SERVICES,
  existingOrders = [],
}) => {
  const [packageId, setPackageId] = useState<string>(initialPackageId || (packages[0]?.id || 'pkg-default'));
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(initialAddOnIds);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  // Form Fields
  // Acara Pertama Fields
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('10:00 WIB');
  const [locationType, setLocationType] = useState<'studio' | 'outdoor' | 'venue'>('studio');
  const [locationAddress, setLocationAddress] = useState('Dimensi Photo Studio (Studio 1 Utama)');
  const [notes, setNotes] = useState('');

  // Acara Kedua Fields (Multi-Event / Wedding)
  const [hasSecondSession, setHasSecondSession] = useState(false);
  const [sessionDate2, setSessionDate2] = useState('');
  const [sessionTime2, setSessionTime2] = useState('18:30 WIB');
  const [locationType2, setLocationType2] = useState<'studio' | 'outdoor' | 'venue'>('venue');
  const [locationAddress2, setLocationAddress2] = useState('');
  const [notes2, setNotes2] = useState('');

  const [paymentPreference, setPaymentPreference] = useState<'DP 30%' | 'DP 50%' | 'Lunas'>('DP 30%');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for quota / slot conflict against existing client orders for Acara 1
  const slotConflict = sessionDate && sessionTime ? checkScheduleSlotConflict(sessionDate, sessionTime, existingOrders) : null;
  const bookedSlotsOnDate = sessionDate ? getBookedSlotsForDate(sessionDate, existingOrders) : [];

  // Check for quota / slot conflict against existing client orders for Acara 2
  const slotConflict2 = hasSecondSession && sessionDate2 && sessionTime2 ? checkScheduleSlotConflict(sessionDate2, sessionTime2, existingOrders) : null;
  const bookedSlotsOnDate2 = hasSecondSession && sessionDate2 ? getBookedSlotsForDate(sessionDate2, existingOrders) : [];

  // Synchronize when parent props change
  useEffect(() => {
    if (initialPackageId) {
      setPackageId(initialPackageId);
      const pkg = packages.find((p) => p.id === initialPackageId);
      if (pkg?.category) {
        setSelectedCategoryTab(pkg.category.toLowerCase());
      }
    }
  }, [initialPackageId, packages]);

  useEffect(() => {
    if (initialAddOnIds && initialAddOnIds.length > 0) {
      setSelectedAddOns(initialAddOnIds);
    }
  }, [initialAddOnIds]);

  const currentPackage = packages.find((p) => p.id === packageId) || packages[0] || PHOTO_PACKAGES[0];
  const selectedAddonsList = addons.filter((a) => selectedAddOns.includes(a.id));
  const addonsTotal = selectedAddonsList.reduce((acc, a) => acc + a.price, 0);
  const totalPrice = currentPackage.price + addonsTotal;

  // Extract available distinct categories from package list
  const categoryOptions = useMemo(() => {
    const map = new Map<string, number>();
    packages.forEach((pkg) => {
      const cat = (pkg.category || 'other').toLowerCase();
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const list: { id: string; label: string; icon: string; count: number }[] = [
      { id: 'all', label: 'Semua Kategori', icon: '✨', count: packages.length },
    ];

    map.forEach((count, catId) => {
      list.push({
        id: catId,
        label: getCategoryLabel(catId),
        icon: getCategoryIcon(catId),
        count,
      });
    });

    return list;
  }, [packages]);

  // Group packages by category
  const groupedPackages = useMemo(() => {
    const groups: { categoryId: string; categoryLabel: string; icon: string; items: PhotoPackage[] }[] = [];
    const catMap = new Map<string, PhotoPackage[]>();

    packages.forEach((pkg) => {
      const cat = (pkg.category || 'other').toLowerCase();
      if (!catMap.has(cat)) {
        catMap.set(cat, []);
      }
      catMap.get(cat)!.push(pkg);
    });

    catMap.forEach((items, catId) => {
      groups.push({
        categoryId: catId,
        categoryLabel: getCategoryLabel(catId),
        icon: getCategoryIcon(catId),
        items,
      });
    });

    return groups;
  }, [packages]);

  // Packages to display based on selected category tab
  const visiblePackages = useMemo(() => {
    if (selectedCategoryTab === 'all') return packages;
    return packages.filter((p) => (p.category || 'other').toLowerCase() === selectedCategoryTab);
  }, [packages, selectedCategoryTab]);

  // Handle selecting package directly
  const handleSelectPackage = (pkg: PhotoPackage) => {
    setPackageId(pkg.id);
  };

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

  // Auto set default address when locationType2 changes
  const handleLocationTypeChange2 = (type: 'studio' | 'outdoor' | 'venue') => {
    setLocationType2(type);
    if (type === 'studio') {
      setLocationAddress2('Dimensi Photo Studio (Jl. Melati Indah No. 45, Studio Dimensi Visual)');
    } else if (type === 'outdoor') {
      setLocationAddress2('Lokasi Outdoor (Contoh: Hutan Kota GBK / PIK / Pantai)');
    } else {
      setLocationAddress2('');
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

    // Validation for Acara Pertama
    if (!sessionDate) {
      setFormError('Silakan tentukan tanggal rencana sesi untuk Acara Pertama.');
      return;
    }

    if (!sessionTime.trim()) {
      setFormError('Silakan atur waktu sesi untuk Acara Pertama.');
      return;
    }

    // STRICT QUOTA VALIDATION: Reject booking if date & time slot is already taken in the database
    const conflict = checkScheduleSlotConflict(sessionDate, sessionTime, existingOrders);
    if (conflict) {
      setFormError(
        `⛔ PESANAN DITOLAK (Acara Pertama): Kuota pada hari dan tanggal ${formatDateIndonesian(sessionDate)} pukul ${sessionTime} sudah penuh! Jadwal ini telah terdaftar oleh pesanan lain di sistem. Silakan pilih jam atau tanggal yang berbeda.`
      );
      return;
    }

    if (!locationAddress.trim()) {
      setFormError('Silakan isi detail alamat lokasi pemotretan untuk Acara Pertama.');
      return;
    }

    // Validation for Acara Kedua if enabled
    if (hasSecondSession) {
      if (!sessionDate2) {
        setFormError('Silakan tentukan tanggal rencana sesi untuk Acara Kedua.');
        return;
      }
      if (!sessionTime2.trim()) {
        setFormError('Silakan atur waktu sesi untuk Acara Kedua.');
        return;
      }
      const conflict2 = checkScheduleSlotConflict(sessionDate2, sessionTime2, existingOrders);
      if (conflict2) {
        setFormError(
          `⛔ PESANAN DITOLAK (Acara Kedua): Kuota pada hari dan tanggal ${formatDateIndonesian(sessionDate2)} pukul ${sessionTime2} sudah penuh! Jadwal ini telah terdaftar oleh pesanan lain di sistem. Silakan pilih jam atau tanggal yang berbeda.`
        );
        return;
      }
      if (!locationAddress2.trim()) {
        setFormError('Silakan isi detail alamat lokasi pemotretan untuk Acara Kedua.');
        return;
      }
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
      // Acara Pertama (Sesi 1)
      sessionDate: sessionDate,
      sessionTime: sessionTime.trim(),
      locationType: locationType,
      locationAddress: locationAddress.trim(),
      notes: notes.trim(),
      // Acara Kedua (Sesi 2)
      hasSecondSession: hasSecondSession,
      sessionDate2: hasSecondSession ? sessionDate2 : undefined,
      sessionTime2: hasSecondSession ? sessionTime2.trim() : undefined,
      locationType2: hasSecondSession ? locationType2 : undefined,
      locationAddress2: hasSecondSession ? locationAddress2.trim() : undefined,
      notes2: hasSecondSession ? notes2.trim() : undefined,
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
      // Reset form data diri & kontak konsumen serta jadwal ke keadaan semula
      setClientName('');
      setPhone('');
      setEmail('');
      setNotes('');
      setNotes2('');
      setSessionDate('');
      setSessionDate2('');
      setHasSecondSession(false);
      setSessionTime('10:00 WIB');
      setSessionTime2('18:30 WIB');
      setLocationType('studio');
      setLocationType2('venue');
      setLocationAddress('Dimensi Photo Studio (Studio 1 Utama)');
      setLocationAddress2('');
      setSelectedAddOns([]);
      setFormError('');
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
            <div className="p-6 bg-[#141414] border border-white/10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#D4AF37] text-black font-mono flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Pilihan Kategori & Paket Fotografi</span>
                </h3>
                <span className="text-[11px] font-mono text-gray-400">
                  Total <strong className="text-[#D4AF37]">{packages.length}</strong> paket tersedia
                </span>
              </div>

              {/* 1.1 Category Filter Navigation (Tab / Pills) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] uppercase tracking-wider text-gray-400 font-mono flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Kelompokkan Berdasarkan Kategori:</span>
                  </label>
                  {selectedCategoryTab !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryTab('all')}
                      className="text-[10px] font-mono text-[#D4AF37] hover:underline cursor-pointer"
                    >
                      Lihat Semua Kategori
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {categoryOptions.map((cat) => {
                    const isActive = selectedCategoryTab === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryTab(cat.id)}
                        className={`px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md ring-1 ring-[#D4AF37]/50'
                            : 'bg-[#0A0A0A] text-gray-300 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5'
                        }`}
                        id={`btn-cat-filter-${cat.id}`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? 'bg-black/20 text-black font-bold' : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1.2 Interactive Grouped Package Selection Cards */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="block uppercase tracking-wider text-gray-400 font-mono text-[11px] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Pilih Paket ({visiblePackages.length} Pilihan):</span> <span className="text-[#D4AF37]">*</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">Klik kartu untuk memilih</span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {visiblePackages.map((pkg) => {
                    const isSelected = pkg.id === packageId;
                    const catIcon = getCategoryIcon(pkg.category);
                    const catLabel = getCategoryLabel(pkg.category);

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handleSelectPackage(pkg)}
                        className={`p-3.5 border text-left cursor-pointer transition-all relative flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)] ring-1 ring-[#D4AF37]'
                            : 'bg-[#0A0A0A] border-white/10 hover:border-white/30 hover:bg-white/[0.02]'
                        }`}
                        id={`card-package-${pkg.id}`}
                      >
                        <div>
                          {/* Card Header: Category badge & popular badge */}
                          <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono">
                              <span>{catIcon}</span>
                              <span className="truncate max-w-[120px]">{catLabel}</span>
                            </span>

                            <div className="flex items-center gap-1">
                              {pkg.popular && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  <span>Populer</span>
                                </span>
                              )}
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                                    : 'border-white/30 group-hover:border-white/60 text-transparent'
                                }`}
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            </div>
                          </div>

                          {/* Package Title */}
                          <h4 className={`text-sm font-bold leading-snug transition-colors ${isSelected ? 'text-[#D4AF37]' : 'text-white group-hover:text-gray-100'}`}>
                            {pkg.name}
                          </h4>

                          {pkg.tagline && (
                            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                              {pkg.tagline}
                            </p>
                          )}
                        </div>

                        {/* Card Bottom: Duration & Price */}
                        <div className="pt-3 mt-3 border-t border-white/5 flex items-end justify-between gap-2">
                          <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#D4AF37]" />
                            <span className="truncate">{pkg.duration}</span>
                          </div>
                          <div className="text-right">
                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                              <div className="text-[10px] text-gray-500 line-through font-mono">
                                {formatRupiah(pkg.originalPrice)}
                              </div>
                            )}
                            <div className="text-sm font-bold text-[#D4AF37] font-serif">
                              {formatRupiah(pkg.price)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Package Highlight Bar */}
                <div className="p-3 bg-[#0A0A0A] border border-[#D4AF37]/40 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-sm flex-shrink-0">
                      {getCategoryIcon(currentPackage.category)}
                    </div>
                    <div className="truncate">
                      <div className="text-[10px] text-gray-400 uppercase font-mono flex items-center gap-1.5">
                        <span>Paket Terpilih ({getCategoryLabel(currentPackage.category)})</span>
                      </div>
                      <div className="text-white font-bold truncate text-xs">{currentPackage.name}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-[#D4AF37] font-serif block">{formatRupiah(currentPackage.price)}</span>
                    <span className="text-[10px] font-mono text-gray-400">{currentPackage.duration}</span>
                  </div>
                </div>

                {/* Add-ons checkboxes */}
                <div className="pt-3 border-t border-white/10">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2 font-mono flex items-center justify-between">
                    <span>Layanan Tambahan (Opsional Add-ons):</span>
                    {selectedAddOns.length > 0 && (
                      <span className="text-[#D4AF37] font-bold text-[11px]">
                        +{formatRupiah(addonsTotal)} ({selectedAddOns.length} dipilih)
                      </span>
                    )}
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
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-xs truncate">{addon.name}</div>
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

            {/* Step 3: Schedule & Location - 2 Sessions Support */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#D4AF37] text-black font-mono flex items-center justify-center text-[10px] font-black">3</span>
                  <span>Jadwal & Lokasi Sesi Pemotretan</span>
                </h3>
                <span className="text-[10px] font-mono text-gray-400">
                  Mendukung hingga 2 sesi acara (beda tanggal & jam)
                </span>
              </div>

              {/* ================= ACARA PERTAMA ================= */}
              <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                    Acara Pertama (Sesi 1 Utama)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-white/10 text-white font-mono uppercase">Wajib</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                      tanggal rencana sesi : <span className="text-[#D4AF37]">*</span>
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
                        id="input-session-date-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                      waktu : <span className="text-[#D4AF37]">*</span>
                    </label>
                    <AnimatedClockPicker
                      value={sessionTime}
                      onChange={(newTime) => setSessionTime(newTime)}
                      isSlotUnavailable={Boolean(slotConflict)}
                      bookedTimes={bookedSlotsOnDate.map((o) => o.sessionTime)}
                    />
                  </div>

                  {/* Quota Feedback for Acara Pertama */}
                  {sessionDate && (
                    <div className="sm:col-span-2">
                      {slotConflict ? (
                        <div className="p-3.5 bg-rose-950/50 border-2 border-rose-500/70 text-rose-200 text-xs space-y-2 animate-in fade-in">
                          <div className="flex items-center gap-2 font-bold text-rose-300 uppercase tracking-wider text-[11px] font-mono">
                            <Ban className="w-4 h-4 shrink-0 text-rose-400 stroke-[2.5]" />
                            <span>⛔ Kuota Acara Pertama Penuh!</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-rose-100">
                            Slot pada <strong>{formatDateIndonesian(sessionDate)}</strong> pukul <strong>{sessionTime}</strong> sudah terisi oleh pesanan lain di sistem.
                          </p>
                          {bookedSlotsOnDate.length > 0 && (
                            <div className="pt-2 border-t border-rose-500/30 text-[10px] text-gray-300">
                              <span className="font-semibold text-rose-300 uppercase font-mono">Jam terisi di hari ini:</span>{' '}
                              <span className="font-mono text-white font-semibold">
                                {bookedSlotsOnDate.map((o) => o.sessionTime).join(' • ')}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center justify-between animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                            <span>✓ Acara 1 Tersedia: {formatDateIndonesian(sessionDate)} ({sessionTime})</span>
                          </div>
                          {bookedSlotsOnDate.length > 0 && (
                            <span className="text-[10px] text-gray-400 hidden sm:inline">
                              ({bookedSlotsOnDate.length} slot lain terisi)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                      tipe tempat pemotretan :
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
                      detail alamat : <span className="text-[#D4AF37]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        placeholder="Contoh: Jl. Melati Indah No. 45 / Gedung Sasana Kriya TMII"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                        id="input-location-address-1"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                      catatan khusus / konsep foto yang diinginkan :
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Nuansa adat Jawa, prosesi akad nikah khidmat, candid ekspresi keluarga..."
                        className="w-full pl-10 pr-3.5 py-2 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                        id="input-notes-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= ACARA KEDUA (TOGGLEABLE) ================= */}
              <div className="p-4 bg-[#0D0D0D] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Acara Kedua (Sesi 2 - Opsional / Beda Tanggal & Jam)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !hasSecondSession;
                      setHasSecondSession(nextVal);
                      if (nextVal && !sessionDate2) {
                        setSessionDate2(sessionDate || minDateStr);
                      }
                    }}
                    className={`px-3 py-1 text-[11px] font-mono uppercase font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      hasSecondSession
                        ? 'bg-cyan-500 text-black border-cyan-400'
                        : 'bg-white/5 text-gray-300 border-white/20 hover:border-cyan-400/60 hover:text-white'
                    }`}
                  >
                    <span>{hasSecondSession ? '✓ Sesi 2 Aktif' : '+ Tambah Acara Kedua'}</span>
                  </button>
                </div>

                {hasSecondSession ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                        tanggal rencana sesi : <span className="text-[#D4AF37]">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          required={hasSecondSession}
                          min={minDateStr}
                          value={sessionDate2}
                          onChange={(e) => setSessionDate2(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none [color-scheme:dark]"
                          id="input-session-date-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                        waktu : <span className="text-[#D4AF37]">*</span>
                      </label>
                      <AnimatedClockPicker
                        value={sessionTime2}
                        onChange={(newTime) => setSessionTime2(newTime)}
                        isSlotUnavailable={Boolean(slotConflict2)}
                        bookedTimes={bookedSlotsOnDate2.map((o) => o.sessionTime)}
                      />
                    </div>

                    {/* Quota Feedback for Acara Kedua */}
                    {sessionDate2 && (
                      <div className="sm:col-span-2">
                        {slotConflict2 ? (
                          <div className="p-3.5 bg-rose-950/50 border-2 border-rose-500/70 text-rose-200 text-xs space-y-2 animate-in fade-in">
                            <div className="flex items-center gap-2 font-bold text-rose-300 uppercase tracking-wider text-[11px] font-mono">
                              <Ban className="w-4 h-4 shrink-0 text-rose-400 stroke-[2.5]" />
                              <span>⛔ Kuota Acara Kedua Penuh!</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-rose-100">
                              Slot pada <strong>{formatDateIndonesian(sessionDate2)}</strong> pukul <strong>{sessionTime2}</strong> sudah terisi oleh pesanan lain di sistem.
                            </p>
                            {bookedSlotsOnDate2.length > 0 && (
                              <div className="pt-2 border-t border-rose-500/30 text-[10px] text-gray-300">
                                <span className="font-semibold text-rose-300 uppercase font-mono">Jam terisi di hari ini:</span>{' '}
                                <span className="font-mono text-white font-semibold">
                                  {bookedSlotsOnDate2.map((o) => o.sessionTime).join(' • ')}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                              <span>✓ Acara 2 Tersedia: {formatDateIndonesian(sessionDate2)} ({sessionTime2})</span>
                            </div>
                            {bookedSlotsOnDate2.length > 0 && (
                              <span className="text-[10px] text-gray-400 hidden sm:inline">
                                ({bookedSlotsOnDate2.length} slot lain terisi)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                        tipe tempat pemotretan :
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
                            onClick={() => handleLocationTypeChange2(loc.id as any)}
                            className={`py-2 px-2 text-xs uppercase tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                              locationType2 === loc.id
                                ? 'bg-cyan-500 text-black border-cyan-400'
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
                        detail alamat : <span className="text-[#D4AF37]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required={hasSecondSession}
                          value={locationAddress2}
                          onChange={(e) => setLocationAddress2(e.target.value)}
                          placeholder="Contoh: Ballroom Hotel Mulia Senayan, Jakarta"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                          id="input-location-address-2"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5 font-mono">
                        catatan khusus / konsep foto yang diinginkan :
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                        <textarea
                          rows={2}
                          value={notes2}
                          onChange={(e) => setNotes2(e.target.value)}
                          placeholder="Contoh: Resepsi malam hari, lighting dramatis, dokumentasi tamu VVIP dan hiburan musik..."
                          className="w-full pl-10 pr-3.5 py-2 bg-[#0A0A0A] border border-white/15 text-white text-xs focus:border-[#D4AF37] focus:outline-none placeholder-gray-600"
                          id="input-notes-2"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    Gunakan opsi ini jika paket Anda memiliki 2 acara berbeda (seperti Akad Nikah di hari pertama dan Resepsi / Pesta di hari kedua, atau sesi Studio dan sesi Outdoor).
                  </p>
                )}
              </div>

              {/* Payment preference */}
              <div className="pt-2 border-t border-white/10">
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
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono uppercase text-gray-400">Paket Pilihan:</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[9px] font-mono font-bold uppercase">
                      <span>{getCategoryIcon(currentPackage.category)}</span>
                      <span>{getCategoryLabel(currentPackage.category)}</span>
                    </span>
                  </div>
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

                {/* Acara 1 in summary */}
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold block">
                    Jadwal Acara Pertama (Sesi 1):
                  </span>
                  <div className="text-white font-medium">
                    {sessionDate ? formatDateIndonesian(sessionDate) : '(Pilih tanggal di formulir)'}
                  </div>
                  <div className="text-gray-400 text-[11px] font-mono">
                    {sessionTime} • {locationType === 'studio' ? 'Studio Dimensi' : locationType === 'outdoor' ? 'Outdoor / Alam' : 'Gedung / Klien'}
                  </div>
                  {locationAddress && (
                    <div className="text-gray-400 text-[11px] truncate">
                      📍 {locationAddress}
                    </div>
                  )}
                </div>

                {/* Acara 2 in summary (if enabled) */}
                {hasSecondSession && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                      Jadwal Acara Kedua (Sesi 2):
                    </span>
                    <div className="text-white font-medium">
                      {sessionDate2 ? formatDateIndonesian(sessionDate2) : '(Pilih tanggal Acara 2)'}
                    </div>
                    <div className="text-gray-400 text-[11px] font-mono">
                      {sessionTime2} • {locationType2 === 'studio' ? 'Studio Dimensi' : locationType2 === 'outdoor' ? 'Outdoor / Alam' : 'Gedung / Klien'}
                    </div>
                    {locationAddress2 && (
                      <div className="text-gray-400 text-[11px] truncate">
                        📍 {locationAddress2}
                      </div>
                    )}
                  </div>
                )}

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
                disabled={isSubmitting || Boolean(slotConflict) || Boolean(slotConflict2)}
                className={`w-full py-3.5 font-bold text-xs uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  slotConflict || slotConflict2
                    ? 'bg-rose-900/80 border border-rose-500/50 text-rose-200 cursor-not-allowed opacity-90'
                    : 'bg-[#D4AF37] hover:bg-white text-black disabled:opacity-50'
                }`}
                id="submit-order-btn"
              >
                {isSubmitting ? (
                  <span>Mendaftarkan Pesanan...</span>
                ) : slotConflict || slotConflict2 ? (
                  <>
                    <Ban className="w-4 h-4 stroke-[2.5] text-rose-300" />
                    <span>⛔ Kuota Penuh (Pilih Jam/Hari Lain)</span>
                  </>
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
