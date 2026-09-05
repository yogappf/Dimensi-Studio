import React, { useState, useMemo } from 'react';
import { PORTFOLIO_ITEMS } from '../data/mockData';
import { CategoryType, PortfolioItem } from '../types';
import { Camera, Sparkles, X, Eye, Maximize2, ArrowLeft, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

interface PortfolioGalleryProps {
  portfolios?: PortfolioItem[];
}

interface FlattenedPhoto {
  id: string;
  url: string;
  category: CategoryType;
  categoryName: string;
  description?: string;
  parentItemId: string;
  index: number;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolios = PORTFOLIO_ITEMS,
}) => {
  const [activeFilter, setActiveFilter] = useState<CategoryType | 'all'>('all');
  const [largePhoto, setLargePhoto] = useState<{ url: string; categoryName: string; index: number; total: number } | null>(null);

  // Extract unique category list
  const uniqueSlugs = Array.from(new Set(portfolios.map(item => item.category)));
  const filters: { id: CategoryType | 'all'; label: string }[] = [
    { id: 'all', label: 'Semua Kategori' },
    ...uniqueSlugs.map(slug => {
      const found = portfolios.find(item => item.category === slug);
      return {
        id: slug as CategoryType,
        label: found?.categoryName || slug.toUpperCase(),
      };
    }),
  ];

  // Helper to extract all photo URLs for a portfolio item
  const getItemPhotos = (item: PortfolioItem): string[] => {
    const urls: string[] = [];
    if (item.imageUrls && item.imageUrls.length > 0) {
      item.imageUrls.forEach(u => {
        if (u && u.trim() && !urls.includes(u.trim())) urls.push(u.trim());
      });
    }
    if (item.imageUrl && !urls.includes(item.imageUrl.trim())) {
      urls.unshift(item.imageUrl.trim());
    }
    return urls;
  };

  // Flatten photos when a specific category is selected
  const activeCategoryPhotos = useMemo<FlattenedPhoto[]>(() => {
    if (activeFilter === 'all') return [];

    const categoryItems = portfolios.filter(item => item.category === activeFilter);
    const photos: FlattenedPhoto[] = [];

    categoryItems.forEach(item => {
      const urls = getItemPhotos(item);
      urls.forEach((url, idx) => {
        photos.push({
          id: `${item.id}-${idx}-${url.slice(-8)}`,
          url,
          category: item.category,
          categoryName: item.categoryName,
          description: item.description,
          parentItemId: item.id,
          index: photos.length,
        });
      });
    });

    return photos;
  }, [portfolios, activeFilter]);

  const handleOpenLarge = (photo: FlattenedPhoto, allPhotos: FlattenedPhoto[]) => {
    setLargePhoto({
      url: photo.url,
      categoryName: photo.categoryName,
      index: photo.index,
      total: allPhotos.length,
    });
  };

  const handleNextLargePhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!largePhoto || activeCategoryPhotos.length <= 1) return;
    const nextIdx = (largePhoto.index + 1) % activeCategoryPhotos.length;
    const nextPhoto = activeCategoryPhotos[nextIdx];
    if (nextPhoto) {
      setLargePhoto({
        url: nextPhoto.url,
        categoryName: nextPhoto.categoryName,
        index: nextIdx,
        total: activeCategoryPhotos.length,
      });
    }
  };

  const handlePrevLargePhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!largePhoto || activeCategoryPhotos.length <= 1) return;
    const prevIdx = (largePhoto.index - 1 + activeCategoryPhotos.length) % activeCategoryPhotos.length;
    const prevPhoto = activeCategoryPhotos[prevIdx];
    if (prevPhoto) {
      setLargePhoto({
        url: prevPhoto.url,
        categoryName: prevPhoto.categoryName,
        index: prevIdx,
        total: activeCategoryPhotos.length,
      });
    }
  };

  return (
    <section id="portofolio" className="py-16 md:py-24 bg-[#0A0A0A] relative border-b border-white/10 scroll-mt-10">
      <div id="portofolio-section" className="absolute -top-20 left-0"></div>
      <div id="portfolio" className="absolute -top-20 left-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono tracking-widest uppercase mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>Karya Autentik Dimensi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Portofolio Pemotretan <span className="italic font-serif text-[#D4AF37]">Dimensi</span>
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
            Pilih kategori pemotretan untuk melihat koleksi foto dalam bentuk thumbnail. Klik foto untuk melihat tampilan penuh resolusi tinggi.
          </p>
        </div>

        {/* Filter Pills - Geometric Category Selector */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg scale-105 font-bold'
                    : 'bg-[#141414] text-gray-400 hover:text-white border-white/10 hover:border-[#D4AF37]'
                }`}
                id={`filter-portfolio-${f.id}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* VIEW 1: All Categories Overview (When "Semua Kategori" is selected) */}
        {activeFilter === 'all' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((item) => {
                const photos = getItemPhotos(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveFilter(item.category)}
                    className="group relative overflow-hidden bg-[#141414] border border-white/10 cursor-pointer aspect-[4/3] hover:border-[#D4AF37] transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.categoryName || 'Portofolio'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />
                    
                    {/* Category Tag Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-black/85 border border-[#D4AF37]/40 text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                        {item.categoryName}
                      </span>
                    </div>

                    {/* View Thumbnails Indicator on Hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Lihat {photos.length} Thumbnail</span>
                      </div>
                    </div>

                    {/* Bottom Category Info */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[#E0E0E0]">
                      <div>
                        <span className="text-sm font-serif font-bold text-white tracking-wide group-hover:text-[#D4AF37] transition-colors block">
                          {item.categoryName}
                        </span>
                        <span className="text-[11px] text-gray-400 font-sans">
                          Klik untuk membuka thumbnail foto
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#D4AF37] bg-black/80 px-2.5 py-1 border border-white/10 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {photos.length} Foto
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Category Thumbnails Grid (When a specific category is selected) */}
        {activeFilter !== 'all' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sub-header with Back Button and Category Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#141414] border border-[#D4AF37]/30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFilter('all')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-gray-300 hover:text-white border border-white/10 hover:border-[#D4AF37] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Semua Kategori</span>
                </button>
                <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                    <span className="text-[#D4AF37]">
                      {filters.find(f => f.id === activeFilter)?.label}
                    </span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400">
                  Total <strong className="text-white">{activeCategoryPhotos.length}</strong> Foto Thumbnail
                </span>
                <button
                  onClick={() => {
                    const el = document.getElementById('formulir-order');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pesan Kategori Ini</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Grid */}
            {activeCategoryPhotos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
                {activeCategoryPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    onClick={() => handleOpenLarge(photo, activeCategoryPhotos)}
                    className="group relative overflow-hidden bg-[#141414] border border-white/10 hover:border-[#D4AF37] cursor-pointer aspect-[3/4] transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1"
                    title="Klik untuk melihat foto dalam ukuran besar"
                  >
                    <img
                      src={photo.url}
                      alt={`${photo.categoryName} - Foto #${index + 1}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 opacity-40 group-hover:opacity-60 transition-opacity" />

                    {/* Category Label Top Left */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-black/85 border border-[#D4AF37]/40 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold">
                        {photo.categoryName}
                      </span>
                    </div>

                    {/* Enlarge Hover Button in Center */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/35 backdrop-blur-[1px]">
                      <div className="w-10 h-10 bg-[#D4AF37] text-black rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Photo Index Info */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-gray-300 font-mono">
                      <span className="text-[10px] text-gray-300">Klik untuk perbesar</span>
                      <span className="text-[10px] text-[#D4AF37] font-mono font-bold">#{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#141414] border border-white/10 p-6">
                <p className="text-sm text-gray-400 font-mono">
                  Belum ada foto portofolio di kategori ini.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Full HD Large Photo Lightbox Modal */}
      {largePhoto && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-md animate-fadeIn"
          onClick={() => setLargePhoto(null)}
        >
          {/* Header Bar */}
          <div
            className="flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/90 to-transparent border-b border-white/10 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-[#141414] border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-mono uppercase tracking-widest font-semibold">
                {largePhoto.categoryName}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 font-mono">
                Foto {largePhoto.index + 1} dari {largePhoto.total}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLargePhoto(null);
                  const el = document.getElementById('formulir-order');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pesan Sesi {largePhoto.categoryName}</span>
              </button>

              <button
                onClick={() => setLargePhoto(null)}
                className="p-2.5 bg-[#141414] hover:bg-[#D4AF37] text-gray-300 hover:text-black border border-white/20 hover:border-[#D4AF37] transition-colors cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Large Photo with Navigation Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center p-2 sm:p-6 select-none overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            {largePhoto.total > 1 && (
              <button
                onClick={handlePrevLargePhoto}
                className="absolute left-3 sm:left-6 z-20 p-3 sm:p-4 bg-black/70 hover:bg-[#D4AF37] text-white hover:text-black border border-white/20 hover:border-[#D4AF37] transition-all cursor-pointer rounded-full shadow-2xl hover:scale-110"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* Large Image */}
            <div className="relative max-h-[72vh] sm:max-h-[78vh] flex items-center justify-center">
              <img
                src={largePhoto.url}
                alt={`${largePhoto.categoryName} - Foto ${largePhoto.index + 1}`}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] sm:max-h-[78vh] max-w-full w-auto object-contain border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)] rounded-sm"
              />
            </div>

            {/* Next Button */}
            {largePhoto.total > 1 && (
              <button
                onClick={handleNextLargePhoto}
                className="absolute right-3 sm:right-6 z-20 p-3 sm:p-4 bg-black/70 hover:bg-[#D4AF37] text-white hover:text-black border border-white/20 hover:border-[#D4AF37] transition-all cursor-pointer rounded-full shadow-2xl hover:scale-110"
                title="Foto Selanjutnya"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Thumbnail Strip Navigator */}
          <div
            className="bg-black/90 border-t border-white/10 px-4 py-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              {/* Thumbnail Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin">
                {activeCategoryPhotos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => {
                      setLargePhoto({
                        url: photo.url,
                        categoryName: photo.categoryName,
                        index: idx,
                        total: activeCategoryPhotos.length,
                      });
                    }}
                    className={`relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === largePhoto.index
                        ? 'border-[#D4AF37] scale-105 shadow-md brightness-110'
                        : 'border-white/20 hover:border-white/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Mobile Order Button */}
              <button
                onClick={() => {
                  setLargePhoto(null);
                  const el = document.getElementById('formulir-order');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="sm:hidden flex-shrink-0 px-3 py-2 bg-[#D4AF37] text-black text-[11px] font-bold uppercase tracking-wider"
              >
                Pesan
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

