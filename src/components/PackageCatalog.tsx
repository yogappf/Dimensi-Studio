import React, { useState, useMemo } from 'react';
import { PhotoPackage, CategoryType, StudioConfig } from '../types';
import { PHOTO_PACKAGES, STUDIO_INFO } from '../data/mockData';
import { formatRupiah, generateDirectInquiryLink, normalizeWhatsAppNumber } from '../utils/formatters';
import { Check, Clock, Sparkles, MessageCircle, Share2, ArrowRight, Eye, X, Layers, ChevronRight, HelpCircle } from 'lucide-react';

interface PackageCatalogProps {
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  onSelectPackageForBooking: (pkg: PhotoPackage) => void;
  packages?: PhotoPackage[];
  studioConfig?: StudioConfig;
}

const DEFAULT_CATEGORIES: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'all', label: 'Semua Paket', icon: '✨' },
  { id: 'wedding', label: 'Wedding & Akad', icon: '💍' },
  { id: 'prewedding', label: 'Pre-Wedding', icon: '💑' },
  { id: 'engagement', label: 'Engagement', icon: '💐' },
  { id: 'siraman', label: 'Siraman', icon: '🌿' },
  { id: 'wisuda', label: 'Wisuda', icon: '🎓' },
  { id: 'keluarga', label: 'Keluarga & Maternity', icon: '👨‍👩‍👧' },
  { id: 'ulangtahun', label: 'Ulang Tahun', icon: '🎂' },
  { id: 'event', label: 'Event & Gathering', icon: '🎉' },
];

export const PackageCatalog: React.FC<PackageCatalogProps> = ({
  selectedCategory,
  setSelectedCategory,
  onSelectPackageForBooking,
  packages = PHOTO_PACKAGES,
  studioConfig,
}) => {
  const [detailModalPackage, setDetailModalPackage] = useState<PhotoPackage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const adminWhatsApp = normalizeWhatsAppNumber(
    studioConfig?.whatsapp || studioConfig?.phone || studioConfig?.masterPhone || STUDIO_INFO.whatsapp
  );

  // Compute categories including any custom categories in package list
  const categoryList = useMemo(() => {
    const list = [...DEFAULT_CATEGORIES];
    packages.forEach((pkg) => {
      if (pkg.category && !list.some((c) => c.id === pkg.category)) {
        list.push({
          id: pkg.category,
          label: pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1),
          icon: '📁',
        });
      }
    });
    return list;
  }, [packages]);

  // Filter packages based on selected category
  const filteredPackages = useMemo(() => {
    if (selectedCategory === 'all') return packages;
    return packages.filter((p) => p.category === selectedCategory);
  }, [packages, selectedCategory]);

  const handleCopyLink = (pkg: PhotoPackage) => {
    const url = `${window.location.origin}${window.location.pathname}#paket-${pkg.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pkg.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const currentCategoryObj = categoryList.find((c) => c.id === selectedCategory) || categoryList[0];

  return (
    <section id="paket-layanan" className="py-16 sm:py-20 bg-[#0A0A0A] text-[#E0E0E0] border-b border-white/10 scroll-mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
            <span>Katalog Layanan & Investasi</span>
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Pilihan Paket <span className="italic font-serif text-[#D4AF37]">Fotografi</span>
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
            Setiap paket dirancang dengan peralatan kamera sinema beresolusi tinggi, tata cahaya studio presisi, serta sentuhan grading tone eksklusif.
          </p>
        </div>

        {/* Mobile / Tablet Horizontal Category Scroll (Hidden on lg+) */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categoryList.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = cat.id === 'all' ? packages.length : packages.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                      : 'bg-[#141414] text-gray-400 hover:text-white border-white/10 hover:border-[#D4AF37]'
                  }`}
                  id={`cat-filter-mobile-${cat.id}`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono ml-0.5 px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/20 text-black font-bold' : 'bg-white/10 text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout (Sidebar Left + Catalog Grid Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Category Navigation (Sticky on Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-5">
            
            {/* Category Navigation Panel */}
            <div className="bg-[#121212] border border-white/10 p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em]">
                    Kategori Layanan
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 border border-white/10">
                  {packages.length} Paket
                </span>
              </div>

              {/* Vertical Category Button List */}
              <div className="space-y-1.5">
                {categoryList.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const count = cat.id === 'all'
                    ? packages.length
                    : packages.filter((p) => p.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3.5 py-3 transition-all duration-200 flex items-center justify-between group cursor-pointer border ${
                        isActive
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold shadow-md'
                          : 'bg-[#181818] hover:bg-[#202020] text-gray-300 hover:text-white border-white/5 hover:border-white/20'
                      }`}
                      id={`cat-filter-sidebar-${cat.id}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="text-base shrink-0">{cat.icon}</span>
                        <span className="text-xs uppercase tracking-wider truncate">
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                            isActive
                              ? 'bg-black text-[#D4AF37]'
                              : 'bg-white/10 text-gray-400 group-hover:text-white group-hover:bg-white/15'
                          }`}
                        >
                          {count}
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isActive
                              ? 'text-black translate-x-0.5'
                              : 'text-gray-600 group-hover:text-[#D4AF37] group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Consultation Callout Card */}
            <div className="bg-[#121212] border border-[#D4AF37]/30 p-4.5 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Paket Kustom / Luar Kota?</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Punya konsep foto unik, lokasi luar kota, atau kebutuhan durasi khusus? Diskusikan langsung dengan tim kreatif kami.
              </p>
              <a
                href={generateDirectInquiryLink('Konsultasi Paket Kustom Fotografi', 0, adminWhatsApp)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#25D366] text-emerald-400 hover:text-black border border-emerald-500/30 hover:border-[#25D366] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="btn-custom-consultation"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Konsultasi Bebas Biaya</span>
              </a>
            </div>

          </aside>

          {/* RIGHT COLUMN: Catalog Display & Grid */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Active Category Status Bar */}
            <div className="bg-[#121212] border border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{currentCategoryObj.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    {currentCategoryObj.label}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Menampilkan <span className="text-[#D4AF37] font-semibold">{filteredPackages.length}</span> paket fotografi siap booking
                  </div>
                </div>
              </div>

              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-[10px] uppercase font-mono tracking-wider transition-colors cursor-pointer"
                >
                  Tampilkan Semua ({packages.length})
                </button>
              )}
            </div>

            {/* Empty State */}
            {filteredPackages.length === 0 ? (
              <div className="bg-[#121212] border border-white/10 p-12 text-center space-y-4">
                <div className="text-3xl">📷</div>
                <h3 className="text-lg font-serif text-white">Belum ada paket pada kategori ini</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Paket untuk kategori ini sedang dipersiapkan oleh tim studio atau silakan pilih kategori lain.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer"
                >
                  Lihat Semua Paket
                </button>
              </div>
            ) : (
              /* Package Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => {
                  const discountPercent = pkg.originalPrice
                    ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={pkg.id}
                      id={`paket-${pkg.id}`}
                      className={`flex flex-col bg-[#141414] border transition-all duration-300 hover:border-[#D4AF37] relative overflow-hidden group shadow-lg ${
                        pkg.popular ? 'border-[#D4AF37]/80' : 'border-white/10'
                      }`}
                    >
                      {/* Popular Ribbon */}
                      {pkg.popular && (
                        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest shadow-md">
                          Paling Favorit
                        </div>
                      )}

                      {/* Package Thumbnail Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1A1A]">
                        <img
                          src={pkg.imageUrl}
                          alt={pkg.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/20 to-transparent opacity-90" />
                        
                        {/* Category & Duration Badge on image */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs gap-2">
                          <span className="px-2 py-0.5 bg-black/85 text-[#D4AF37] text-[10px] uppercase font-mono border border-white/10 truncate">
                            {pkg.recommendedFor}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-black/85 text-gray-300 text-[10px] border border-white/10 shrink-0 font-mono">
                            <Clock className="w-3 h-3 text-[#D4AF37]" />
                            <span>{pkg.duration}</span>
                          </span>
                        </div>
                      </div>

                      {/* Package Body */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-4">
                          {/* Title & Tagline */}
                          <div>
                            <h3 className="text-lg sm:text-xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                              {pkg.name}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {pkg.tagline}
                            </p>
                          </div>

                          {/* Price Section */}
                          <div className="pt-3 border-t border-white/10 flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">
                              {formatRupiah(pkg.price)}
                            </span>
                            {pkg.originalPrice && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500 line-through font-mono">
                                  {formatRupiah(pkg.originalPrice)}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold font-mono">
                                  -{discountPercent}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Key Features List */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest font-mono">Fasilitas Utama:</span>
                            <ul className="space-y-1.5 text-xs text-gray-300">
                              {pkg.features.slice(0, 4).map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Deliverables snippet */}
                          <div className="p-3 bg-[#0A0A0A] border border-white/10 text-[11px] text-gray-300 space-y-1">
                            <div className="font-semibold text-[#D4AF37] flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono">
                              <span>Output / Hasil:</span>
                            </div>
                            <p className="line-clamp-2 text-gray-400 leading-relaxed">
                              {pkg.deliverables.join(' • ')}
                            </p>
                          </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="pt-3 border-t border-white/10 space-y-2">
                          <button
                            onClick={() => onSelectPackageForBooking(pkg)}
                            className="w-full py-3 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.18em] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                            id={`btn-order-${pkg.id}`}
                          >
                            <span>Booking / Order Paket Ini</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <div className="grid grid-cols-3 gap-2">
                            {/* View Details Button */}
                            <button
                              onClick={() => setDetailModalPackage(pkg)}
                              className="py-2 px-1 bg-[#1A1A1A] hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Lihat Rincian Lengkap"
                              id={`btn-detail-${pkg.id}`}
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Rincian</span>
                            </button>

                            {/* Tanya WhatsApp */}
                            <a
                              href={generateDirectInquiryLink(pkg.name, pkg.price, adminWhatsApp)}
                              target="_blank"
                              rel="noreferrer"
                              className="py-2 px-1 bg-[#1A1A1A] hover:bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1 transition-colors"
                              title="Tanya Admin via WhatsApp"
                              id={`btn-wa-pkg-${pkg.id}`}
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Tanya WA</span>
                            </a>

                            {/* Share / Copy Link */}
                            <button
                              onClick={() => handleCopyLink(pkg)}
                              className={`py-2 px-1 border text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                copiedId === pkg.id
                                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                                  : 'bg-[#1A1A1A] hover:bg-white/10 text-gray-300 border-white/10'
                              }`}
                              title="Salin Link Produk Ini"
                              id={`btn-share-${pkg.id}`}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>{copiedId === pkg.id ? 'Disalin' : 'Link'}</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </main>

        </div>

      </div>

      {/* Package Detail Modal */}
      {detailModalPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl text-[#E0E0E0] max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setDetailModalPackage(null)}
              className="absolute top-4 right-4 p-2 bg-[#1F1F1F] text-gray-400 hover:text-white border border-white/10 hover:border-[#D4AF37] transition-colors cursor-pointer"
              id="close-package-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
              <img
                src={detailModalPackage.imageUrl}
                alt={detailModalPackage.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover border border-white/10 shrink-0"
              />
              <div>
                <span className="px-2 py-0.5 bg-[#0A0A0A] border border-white/10 text-[#D4AF37] text-[10px] font-mono uppercase tracking-widest">
                  {detailModalPackage.recommendedFor}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1.5">
                  {detailModalPackage.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{detailModalPackage.tagline}</p>
                <div className="mt-2 text-2xl font-serif font-bold text-[#D4AF37]">
                  {formatRupiah(detailModalPackage.price)}
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="mt-6 space-y-5 border-t border-white/10 pt-5">
              <div>
                <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2 font-mono">
                  Durasi & Sesi:
                </h4>
                <p className="text-xs text-gray-200 bg-[#0A0A0A] p-3 border border-white/10 flex items-center gap-2 font-mono">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>{detailModalPackage.duration}</span>
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2 font-mono">
                  Fasilitas & Kru:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailModalPackage.features.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-200 bg-[#1A1A1A] p-2.5 border border-white/5">
                      <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2 font-mono">
                  Output Hasil:
                </h4>
                <div className="space-y-2">
                  {detailModalPackage.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-200 bg-[#0A0A0A] p-2.5 border border-white/10">
                      <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onSelectPackageForBooking(detailModalPackage);
                  setDetailModalPackage(null);
                }}
                className="flex-1 py-3 px-4 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="modal-book-now-btn"
              >
                <span>Pesan Paket Ini Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={generateDirectInquiryLink(detailModalPackage.name, detailModalPackage.price, adminWhatsApp)}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-emerald-400 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                id="modal-wa-btn"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi WA</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

