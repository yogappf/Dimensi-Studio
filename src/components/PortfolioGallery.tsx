import React, { useState } from 'react';
import { PORTFOLIO_ITEMS } from '../data/mockData';
import { CategoryType, PortfolioItem } from '../types';
import { Camera, MapPin, Sparkles, X, Eye } from 'lucide-react';

interface PortfolioGalleryProps {
  portfolios?: PortfolioItem[];
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolios = PORTFOLIO_ITEMS,
}) => {
  const [activeFilter, setActiveFilter] = useState<CategoryType>('all');
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

  const filters: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'Semua Karya' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'prewedding', label: 'Pre-Wedding' },
    { id: 'wisuda', label: 'Wisuda' },
    { id: 'keluarga', label: 'Keluarga' },
    { id: 'produk', label: 'Produk' },
    { id: 'event', label: 'Event' },
  ];

  const filteredItems = activeFilter === 'all'
    ? portfolios
    : portfolios.filter((item) => item.category === activeFilter);

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
            Sentuhan emosi, estetika komposisi murni, dan ketajaman warna sinematik dalam setiap jepretan cerita Anda.
          </p>
        </div>

        {/* Filter Pills - Geometric */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold border transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                  : 'bg-[#141414] text-gray-400 hover:text-white border-white/10 hover:border-[#D4AF37]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="group relative overflow-hidden bg-[#141414] border border-white/10 cursor-pointer aspect-[4/3] hover:border-[#D4AF37] transition-all duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              
              {/* Category Tag */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 bg-black/80 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">
                  {item.categoryName}
                </span>
              </div>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-[#D4AF37] text-black flex items-center justify-center shadow-lg">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-4 left-4 right-4 text-[#E0E0E0]">
                <h4 className="font-serif font-bold text-base text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{item.location}</span>
                </div>
                <p className="text-xs text-gray-300 mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
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
              <div className="lg:col-span-8 bg-black flex items-center justify-center max-h-[70vh]">
                <img
                  src={activeModalItem.imageUrl}
                  alt={activeModalItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[70vh]"
                />
              </div>

              <div className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-[#141414]">
                <div className="space-y-3">
                  <span className="px-2 py-0.5 bg-[#0A0A0A] border border-white/10 text-[#D4AF37] text-[10px] font-mono uppercase tracking-widest">
                    {activeModalItem.categoryName}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white">
                    {activeModalItem.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span>{activeModalItem.location}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-white/10">
                    {activeModalItem.description}
                  </p>
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
                    <span>Pesan Sesi Serupa</span>
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
