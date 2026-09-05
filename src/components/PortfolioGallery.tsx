import React, { useState, useEffect } from 'react';
import { PORTFOLIO_ITEMS } from '../data/mockData';
import { CategoryType, PortfolioItem } from '../types';
import { Camera, Sparkles, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface PortfolioGalleryProps {
  portfolios?: PortfolioItem[];
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolios = PORTFOLIO_ITEMS,
}) => {
  const [activeFilter, setActiveFilter] = useState<CategoryType>('all');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageOrientations, setImageOrientations] = useState<Record<string, 'portrait' | 'landscape' | 'square'>>({});

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeModalItem]);

  const uniqueSlugs = Array.from(new Set(portfolios.map(item => item.category)));
  const filters: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'Semua Kategori' },
    ...uniqueSlugs.map(slug => {
      const found = portfolios.find(item => item.category === slug);
      return {
        id: slug,
        label: found?.categoryName || slug.toUpperCase(),
      };
    }),
  ];

  const filteredItems = activeFilter === 'all'
    ? portfolios
    : portfolios.filter((item) => item.category === activeFilter);

  const handleNextImage = () => {
    if (!activeModalItem) return;
    const urls = activeModalItem.imageUrls || [activeModalItem.imageUrl];
    setCurrentImageIndex((prev) => (prev + 1) % urls.length);
  };

  const handlePrevImage = () => {
    if (!activeModalItem) return;
    const urls = activeModalItem.imageUrls || [activeModalItem.imageUrl];
    setCurrentImageIndex((prev) => (prev - 1 + urls.length) % urls.length);
  };

  return (
    <section id="portofolio" className="py-16 bg-[#0A0A0A] text-[#E0E0E0] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
            <span className="w-6 h-[1px] bg-[#D4AF37]"></span>
            <span>Galeri Karya Visual</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
            Portofolio Pemotretan <span className="italic font-serif text-[#D4AF37]">Dimensi</span>
          </h2>
          <p className="mt-3 text-gray-400 text-sm sm:text-base leading-relaxed">
            Sentuhan emosi, estetika komposisi murni, dan ketajaman warna sinematik dalam setiap kategori pemotretan.
          </p>
        </div>

        {/* Filter Pills - Geometric Category Selector */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold border transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md'
                  : 'bg-[#141414] text-gray-400 hover:text-white border-white/10 hover:border-[#D4AF37]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid - Display purely categorized photos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const orientation = imageOrientations[item.id] || 'landscape';
            const aspectClass = orientation === 'portrait' ? 'aspect-[3/4]' : orientation === 'square' ? 'aspect-square' : 'aspect-[4/3]';
            return (
              <div
                key={item.id}
                onClick={() => setActiveModalItem(item)}
                className={`group relative overflow-hidden bg-[#141414] border border-white/10 cursor-pointer ${aspectClass} hover:border-[#D4AF37] transition-all duration-300`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.categoryName || 'Portofolio'}
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const orient = img.naturalHeight > img.naturalWidth ? 'portrait' : img.naturalWidth > img.naturalHeight ? 'landscape' : 'square';
                    if (imageOrientations[item.id] !== orient) {
                      setImageOrientations((prev) => ({ ...prev, [item.id]: orient }));
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Category Tag Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-black/85 border border-[#D4AF37]/40 text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">
                    {item.categoryName}
                  </span>
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-[#D4AF37] text-black flex items-center justify-center shadow-lg">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Category Info only */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[#E0E0E0]">
                  <span className="text-xs font-serif font-bold text-white tracking-wide group-hover:text-[#D4AF37] transition-colors">
                    Kategori: {item.categoryName}
                  </span>
                  {(item.imageUrls && item.imageUrls.length > 1) && (
                    <span className="text-[10px] font-mono text-gray-400 bg-black/70 px-2 py-0.5 border border-white/10">
                      {item.imageUrls.length} Foto
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Modal Preview */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#141414] border border-[#D4AF37]/50 overflow-hidden shadow-2xl">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/80 text-gray-400 hover:text-white border border-white/10 hover:border-[#D4AF37] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 bg-black flex items-center justify-center max-h-[70vh] relative group">
                <img
                  src={(activeModalItem.imageUrls && activeModalItem.imageUrls.length > 0) ? activeModalItem.imageUrls[currentImageIndex] : activeModalItem.imageUrl}
                  alt={activeModalItem.categoryName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[70vh]"
                />
                
                {/* Slideshow Controls */}
                {(activeModalItem.imageUrls && activeModalItem.imageUrls.length > 1) && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-4 p-2 bg-black/60 text-white hover:bg-[#D4AF37] hover:text-black transition-colors opacity-0 group-hover:opacity-100 rounded-full"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-4 p-2 bg-black/60 text-white hover:bg-[#D4AF37] hover:text-black transition-colors opacity-0 group-hover:opacity-100 rounded-full"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full">
                      {activeModalItem.imageUrls.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            idx === currentImageIndex ? 'bg-[#D4AF37] w-3' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-[#141414]">
                <div className="space-y-3">
                  <span className="px-2 py-0.5 bg-[#0A0A0A] border border-white/10 text-[#D4AF37] text-[10px] font-mono uppercase tracking-widest">
                    Kategori Layanan
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white">
                    {activeModalItem.categoryName}
                  </h3>
                  {activeModalItem.description && (
                    <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-white/10">
                      {activeModalItem.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setActiveModalItem(null);
                      const el = document.getElementById('formulir-order');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-white text-black font-bold text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Pesan Sesi {activeModalItem.categoryName}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

