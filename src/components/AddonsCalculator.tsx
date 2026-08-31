import React, { useState, useMemo } from 'react';
import { PhotoPackage, AddOnItem, CategoryType } from '../types';
import { PHOTO_PACKAGES, ADD_ON_SERVICES } from '../data/mockData';
import { formatRupiah } from '../utils/formatters';
import { Calculator, Check, Plus, ArrowRight, Sparkles, Filter, Search, Tag } from 'lucide-react';

interface AddonsCalculatorProps {
  onProceedWithConfig: (packageId: string, addOnIds: string[]) => void;
  packages?: PhotoPackage[];
  addons?: AddOnItem[];
}

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  all: { label: 'Semua Kategori', icon: '✨' },
  wedding: { label: 'Wedding & Akad', icon: '💍' },
  prewedding: { label: 'Pre-Wedding', icon: '💑' },
  engagement: { label: 'Engagement', icon: '💐' },
  siraman: { label: 'Siraman', icon: '🌿' },
  wisuda: { label: 'Wisuda', icon: '🎓' },
  keluarga: { label: 'Keluarga & Maternity', icon: '👨‍👩‍👧' },
  ulangtahun: { label: 'Ulang Tahun', icon: '🎂' },
  event: { label: 'Event & Gathering', icon: '🎉' },
};

export const AddonsCalculator: React.FC<AddonsCalculatorProps> = ({
  onProceedWithConfig,
  packages = PHOTO_PACKAGES,
  addons = ADD_ON_SERVICES,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id || PHOTO_PACKAGES[0].id);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['addon-drone']);

  // Extract distinct categories from actual packages
  const categoryList = useMemo(() => {
    const presentCategories = new Set<string>();
    packages.forEach((pkg) => {
      if (pkg.category) {
        presentCategories.add(pkg.category);
      }
    });

    const list: { id: string; label: string; icon: string; count: number }[] = [
      {
        id: 'all',
        label: 'Semua',
        icon: '✨',
        count: packages.length,
      },
    ];

    // Add categories in standard order or custom
    Object.keys(CATEGORY_MAP).forEach((catKey) => {
      if (catKey !== 'all' && presentCategories.has(catKey)) {
        const catCount = packages.filter((p) => p.category === catKey).length;
        list.push({
          id: catKey,
          label: CATEGORY_MAP[catKey]?.label || catKey,
          icon: CATEGORY_MAP[catKey]?.icon || '📁',
          count: catCount,
        });
        presentCategories.delete(catKey);
      }
    });

    // Any remaining custom categories
    presentCategories.forEach((customCat) => {
      const catCount = packages.filter((p) => p.category === customCat).length;
      list.push({
        id: customCat,
        label: customCat.charAt(0).toUpperCase() + customCat.slice(1),
        icon: '📁',
        count: catCount,
      });
    });

    return list;
  }, [packages]);

  // Filter packages based on category & search
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.tagline?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [packages, selectedCategory, searchQuery]);

  const selectedPackage = packages.find((p) => p.id === selectedPkgId) || packages[0] || PHOTO_PACKAGES[0];

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const selectedAddonsList = addons.filter((a) => selectedAddonIds.includes(a.id));
  const addonsTotal = selectedAddonsList.reduce((acc, curr) => acc + curr.price, 0);
  const grandTotal = selectedPackage.price + addonsTotal;

  return (
    <section id="kalkulator-simulasi" className="py-16 bg-[#0A0A0A] text-[#E0E0E0] border-b border-white/10 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
            <span>Simulasi & Kustomisasi</span>
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Kalkulator Estimasi <span className="italic font-serif text-[#D4AF37]">Biaya Sesi</span>
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
            Sesuaikan kebutuhan sesi foto Anda dengan memfilter kategori paket utama dan menambahkan layanan ekstra (add-ons) sesuai konsep impian Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Package & Addons Picker */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Base Package with Category Filters */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#D4AF37] text-black font-mono flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Pilih Paket Utama Fotografi:</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-mono hidden sm:inline">Terpilih:</span>
                  <span className="text-xs text-[#D4AF37] font-semibold font-serif">{formatRupiah(selectedPackage.price)}</span>
                </div>
              </div>

              {/* Category Filter Pills & Search */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                    <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Filter Kategori:</span>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-[10px] text-gray-400 hover:text-white font-mono underline cursor-pointer"
                    >
                      Reset Cari
                    </button>
                  )}
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                  {categoryList.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-none whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37] shadow-sm'
                            : 'bg-[#0A0A0A] text-gray-400 hover:text-white border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                            isActive ? 'bg-black/20 text-black font-bold' : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Package summary alert if currently selected package is from another category */}
                {selectedPackage && selectedCategory !== 'all' && selectedPackage.category !== selectedCategory && (
                  <div className="p-2.5 bg-[#1F1A08] border border-[#D4AF37]/40 text-xs flex items-center justify-between gap-2 text-amber-200">
                    <div className="flex items-center gap-2 truncate">
                      <Tag className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span className="truncate">
                        Paket aktif: <strong className="text-white">{selectedPackage.name}</strong> ({CATEGORY_MAP[selectedPackage.category]?.label || selectedPackage.category})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="text-[10px] text-[#D4AF37] hover:underline font-mono whitespace-nowrap cursor-pointer"
                    >
                      Lihat Semua
                    </button>
                  </div>
                )}
              </div>

              {/* Package Grid */}
              {filteredPackages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {filteredPackages.map((pkg) => {
                    const isSelected = pkg.id === selectedPkgId;
                    const catInfo = CATEGORY_MAP[pkg.category] || { label: pkg.category, icon: '📁' };
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`p-3.5 text-left border transition-all flex flex-col justify-between cursor-pointer relative group ${
                          isSelected
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-sm ring-1 ring-[#D4AF37]/50'
                            : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-xs text-white line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                              {pkg.name}
                            </span>
                            {isSelected ? (
                              <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-gray-500 uppercase px-1.5 py-0.5 bg-white/5 border border-white/5 shrink-0">
                                {catInfo.icon} {catInfo.label.split(' ')[0]}
                              </span>
                            )}
                          </div>
                          {pkg.tagline && (
                            <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 font-sans">
                              {pkg.tagline}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] text-gray-400 font-mono uppercase">{pkg.duration}</span>
                          <span className="text-xs font-bold text-[#D4AF37] font-serif">{formatRupiah(pkg.price)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#0A0A0A] border border-dashed border-white/10 space-y-2">
                  <p className="text-xs text-gray-400 font-mono">
                    Tidak ada paket pada kategori ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 bg-[#D4AF37] text-black text-xs font-bold font-mono cursor-pointer"
                  >
                    Tampilkan Semua Paket
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Add-on Services */}
            <div className="p-6 bg-[#141414] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-xs uppercase tracking-widest font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 bg-[#D4AF37] text-black font-mono flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Layanan Tambahan (Opsional Add-ons):</span>
                </h3>
                <span className="text-[10px] uppercase font-mono text-gray-400">{selectedAddonIds.length} dipilih</span>
              </div>

              <div className="space-y-2.5">
                {addons.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon.id)}
                      className={`p-3.5 border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-sm'
                          : 'bg-[#0A0A0A] border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 mt-0.5 flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold'
                              : 'border-white/20 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-white">{addon.name}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{addon.description}</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-[#D4AF37] font-serif whitespace-nowrap shrink-0">
                        + {formatRupiah(addon.price)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right: Real-time Quotation Card */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="p-6 sm:p-7 bg-[#141414] border border-[#D4AF37]/60 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-mono">Ringkasan Estimasi</span>
                  <h4 className="text-lg font-serif font-bold text-white mt-1">Kalkulasi Sesi Pemotretan</h4>
                </div>
                <div className="w-9 h-9 border border-white/20 flex items-center justify-center text-[#D4AF37]">
                  <Calculator className="w-4 h-4" />
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-xs">
                
                {/* Base Package */}
                <div className="p-3 bg-[#0A0A0A] border border-white/10 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white block">{selectedPackage.name}</span>
                      <span className="text-[9px] font-mono px-1 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        {CATEGORY_MAP[selectedPackage.category]?.label || selectedPackage.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">Durasi: {selectedPackage.duration}</span>
                  </div>
                  <span className="font-bold text-[#D4AF37] font-serif">{formatRupiah(selectedPackage.price)}</span>
                </div>

                {/* Addons List */}
                {selectedAddonsList.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block">Layanan Tambahan Terpilih:</span>
                    {selectedAddonsList.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-center text-gray-300 pl-2.5 border-l border-[#D4AF37]">
                        <span className="text-[11px] truncate max-w-[200px]">{addon.name}</span>
                        <span className="text-[#D4AF37] font-medium font-serif">+{formatRupiah(addon.price)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-gray-500 italic py-1">
                    Belum ada add-ons tambahan yang dipilih
                  </div>
                )}

              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-gray-400 font-medium">Subtotal Add-ons:</span>
                  <span className="font-semibold text-gray-200 font-serif">{formatRupiah(addonsTotal)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-white block">Total Estimasi:</span>
                    <span className="text-[10px] text-gray-400">Opsi DP 30% atau 50%</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onProceedWithConfig(selectedPkgId, selectedAddonIds)}
                className="w-full py-3.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="calc-booking-btn"
              >
                <span>Lanjutkan ke Formulir Order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-mono">
                Pendaftaran resmi tercatat dengan nota digital.
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

