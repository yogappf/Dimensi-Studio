import React, { useState } from 'react';
import { PhotoPackage, CategoryType } from '../types';
import { PHOTO_PACKAGES, STUDIO_INFO } from '../data/mockData';
import { formatRupiah, generateDirectInquiryLink } from '../utils/formatters';
import { Check, Clock, Sparkles, MessageCircle, Share2, ArrowRight, Info, Eye, X } from 'lucide-react';

interface PackageCatalogProps {
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  onSelectPackageForBooking: (pkg: PhotoPackage) => void;
  packages?: PhotoPackage[];
}

export const PackageCatalog: React.FC<PackageCatalogProps> = ({
  selectedCategory,
  setSelectedCategory,
  onSelectPackageForBooking,
  packages = PHOTO_PACKAGES,
}) => {
  const [detailModalPackage, setDetailModalPackage] = useState<PhotoPackage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: '✨ Semua Paket' },
    { id: 'wedding', label: '💍 Wedding & Akad' },
    { id: 'prewedding', label: '💑 Pre-Wedding' },
    { id: 'wisuda', label: '🎓 Wisuda' },
    { id: 'keluarga', label: '👨‍👩‍👧 Keluarga & Maternity' },
    { id: 'produk', label: '📦 Produk UMKM' },
    { id: 'event', label: '🎉 Event & Gathering' },
  ];

  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter((p) => p.category === selectedCategory);

  const handleCopyLink = (pkg: PhotoPackage) => {
    const url = `${window.location.origin}${window.location.pathname}#paket-${pkg.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pkg.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="paket-layanan" className="py-16 bg-[#0A0A0A] text-[#E0E0E0] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
            <span>Katalog Layanan & Investasi</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Pilihan Paket <span className="italic font-serif text-[#D4AF37]">Fotografi</span>
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
            Setiap paket dirancang dengan peralatan kamera sinema beresolusi tinggi, tata cahaya studio presisi, serta sentuhan grading tone eksklusif.
          </p>
        </div>

        {/* Category Tabs - Geometric */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar mb-10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                    : 'bg-[#141414] text-gray-400 hover:text-white border-white/10 hover:border-[#D4AF37]'
                }`}
                id={`cat-filter-${cat.id}`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Package Grid - Geometric */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const discountPercent = pkg.originalPrice
              ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
              : 0;

            return (
              <div
                key={pkg.id}
                id={`paket-${pkg.id}`}
                className={`flex flex-col bg-[#141414] border transition-all duration-300 hover:border-[#D4AF37] relative overflow-hidden group ${
                  pkg.popular ? 'border-[#D4AF37]' : 'border-white/10'
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />
                  
                  {/* Category & Duration Badge on image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 bg-black/80 text-[#D4AF37] text-[10px] uppercase font-mono border border-white/10">
                      {pkg.recommendedFor}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-black/80 text-gray-300 text-[10px] border border-white/10">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      <span>{pkg.duration}</span>
                    </span>
                  </div>
                </div>

                {/* Package Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    {/* Title & Tagline */}
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {pkg.tagline}
                    </p>

                    {/* Price Section */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-serif font-bold text-[#D4AF37]">
                        {formatRupiah(pkg.price)}
                      </span>
                      {pkg.originalPrice && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500 line-through">
                            {formatRupiah(pkg.originalPrice)}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 font-bold font-mono">
                            -{discountPercent}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Key Features List */}
                    <div className="mt-5 space-y-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Fasilitas Utama:</span>
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
                    <div className="mt-4 p-3 bg-[#0A0A0A] border border-white/10 text-[11px] text-gray-300 space-y-1">
                      <div className="font-semibold text-[#D4AF37] flex items-center gap-1 text-[10px] uppercase tracking-wider">
                        <span>Output / Hasil:</span>
                      </div>
                      <p className="line-clamp-2 text-gray-400">
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
                        href={generateDirectInquiryLink(pkg.name, pkg.price, STUDIO_INFO.whatsapp)}
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

      </div>

      {/* Package Detail Modal */}
      {detailModalPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl text-[#E0E0E0] max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setDetailModalPackage(null)}
              className="absolute top-4 right-4 p-2 bg-[#1F1F1F] text-gray-400 hover:text-white border border-white/10 hover:border-[#D4AF37] transition-colors"
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
                <p className="text-xs text-gray-200 bg-[#0A0A0A] p-3 border border-white/10 flex items-center gap-2">
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
                className="flex-1 py-3 px-4 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2"
                id="modal-book-now-btn"
              >
                <span>Pesan Paket Ini Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={generateDirectInquiryLink(detailModalPackage.name, detailModalPackage.price, STUDIO_INFO.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-emerald-400 border border-emerald-500/40 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
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
