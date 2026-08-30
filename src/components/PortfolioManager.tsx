import React, { useState } from 'react';
import { PortfolioItem, CategoryType } from '../types';
import { compressImage } from '../utils/imageCompressor';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  X,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  ExternalLink,
  Eye,
  Upload,
} from 'lucide-react';

interface PortfolioManagerProps {
  portfolios: PortfolioItem[];
  onAddPortfolio: (item: PortfolioItem) => void;
  onUpdatePortfolio: (id: string, updated: Partial<PortfolioItem>) => void;
  onDeletePortfolio: (id: string) => void;
  onResetPortfolios: () => void;
}

const CATEGORY_OPTIONS: { id: CategoryType; label: string; name: string }[] = [
  { id: 'wedding', label: 'Wedding', name: 'Pernikahan' },
  { id: 'prewedding', label: 'Pre-Wedding', name: 'Pre-Wedding' },
  { id: 'wisuda', label: 'Wisuda', name: 'Wisuda & Kelulusan' },
  { id: 'keluarga', label: 'Keluarga', name: 'Keluarga & Maternity' },
  { id: 'produk', label: 'Produk', name: 'Produk Komersil & UMKM' },
  { id: 'event', label: 'Event', name: 'Event & Gathering' },
];

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolios,
  onAddPortfolio,
  onUpdatePortfolio,
  onDeletePortfolio,
  onResetPortfolios,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imageOrientations, setImageOrientations] = useState<Record<string, 'portrait' | 'landscape' | 'square'>>({});

  // Form State
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    title: '',
    category: 'wedding',
    categoryName: 'Pernikahan',
    location: '',
    imageUrl: '',
    imageUrls: [],
    description: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let allValid = true;
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 10 * 1024 * 1024) {
        allValid = false;
      }
    }

    if (!allValid) {
      alert('Terdapat ukuran file yang melebihi 10MB.');
      return;
    }

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], 1200, 1200, 0.75);
        newUrls.push(compressed);
      }
      
      const updatedUrls = [...(formData.imageUrls || []), ...newUrls];
      setFormData({ 
        ...formData, 
        imageUrls: updatedUrls,
        imageUrl: formData.imageUrl || updatedUrls[0] || '' 
      });
      showToast(`${files.length} gambar berhasil dikompres dan siap disimpan.`);
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Gagal memproses gambar. Silakan coba lagi.');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'wedding',
      categoryName: 'Pernikahan',
      location: 'Dimensi Studio Jakarta',
      imageUrl: '',
      imageUrls: [],
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      categoryName: item.categoryName,
      location: item.location,
      imageUrl: item.imageUrl,
      imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : []),
      description: item.description,
    });
  };

  const handleCategoryNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'koleksi';
    setFormData({
      ...formData,
      category: slug,
      categoryName: name,
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Judul portofolio wajib diisi.');
      return;
    }
    if (!formData.imageUrl?.trim()) {
      alert('Tautan URL gambar portofolio wajib diisi.');
      return;
    }

    if (editingItem) {
      onUpdatePortfolio(editingItem.id, {
        title: formData.title.trim(),
        category: formData.category || 'wedding',
        categoryName: formData.categoryName || 'Koleksi',
        location: formData.location?.trim() || 'Dimensi Studio',
        imageUrl: formData.imageUrl.trim(),
        imageUrls: formData.imageUrls,
        description: formData.description?.trim() || '',
      });
      showToast(`Karya "${formData.title}" berhasil diperbarui.`);
      setEditingItem(null);
    } else {
      const newId = `port-${Date.now().toString(36)}`;
      const newItem: PortfolioItem = {
        id: newId,
        title: formData.title.trim(),
        category: formData.category || 'wedding',
        categoryName: formData.categoryName || 'Koleksi',
        location: formData.location?.trim() || 'Dimensi Studio',
        imageUrl: formData.imageUrl.trim(),
        imageUrls: formData.imageUrls,
        description: formData.description?.trim() || '',
      };
      onAddPortfolio(newItem);
      showToast(`Karya portofolio baru "${newItem.title}" berhasil ditambahkan.`);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const target = portfolios.find((p) => p.id === id);
    onDeletePortfolio(id);
    setDeleteConfirmId(null);
    showToast(`Karya "${target?.title || 'Portofolio'}" berhasil dihapus.`);
  };

  const filteredPortfolios = portfolios.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#D4AF37] text-black px-4 py-2.5 font-mono text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="bg-[#121212] border border-white/10 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Manajemen Galeri Portofolio
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Kelola foto showcase publik, judul sesi, lokasi, kategori karya, dan deskripsi artistik studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetPortfolios}
            className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 hover:text-white border border-white/15 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kembalikan portofolio ke karya awal studio"
            id="btn-reset-portfolios"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
            id="btn-add-new-portfolio"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Karya Portofolio</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121212] border border-white/10 p-3">
        <div className="flex items-center flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#D4AF37] text-black font-bold'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            Semua ({portfolios.length})
          </button>
          {Array.from(new Set(portfolios.map((p) => p.category))).map((catSlug) => {
            const sampleItem = portfolios.find((p) => p.category === catSlug);
            const label = sampleItem?.categoryName || catSlug;
            const count = portfolios.filter((p) => p.category === catSlug).length;
            return (
              <button
                key={catSlug}
                onClick={() => setActiveCategory(catSlug)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === catSlug
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-64 bg-[#0A0A0A] border border-white/15 px-3 py-1.5">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul/lokasi karya..."
            className="w-full bg-transparent text-white text-xs focus:outline-none placeholder:text-gray-600"
            id="search-portfolio-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-xs text-gray-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Portfolio Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolios.map((item) => {
          const orientation = imageOrientations[item.id] || 'landscape';
          const aspectClass = orientation === 'portrait' ? 'aspect-[3/4]' : orientation === 'square' ? 'aspect-square' : 'aspect-[4/3]';
          return (
            <div
              key={item.id}
              className="bg-[#141414] border border-white/10 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between group overflow-hidden"
              id={`portfolio-admin-card-${item.id}`}
            >
              <div>
                {/* Image Preview Container */}
                <div className={`relative ${aspectClass} bg-black/60 overflow-hidden transition-all duration-300`}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      const orient = img.naturalHeight > img.naturalWidth ? 'portrait' : img.naturalWidth > img.naturalHeight ? 'landscape' : 'square';
                      if (imageOrientations[item.id] !== orient) {
                        setImageOrientations((prev) => ({ ...prev, [item.id]: orient }));
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Badge Category */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] font-mono uppercase bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40 tracking-wider">
                    {item.categoryName || item.category}
                  </span>
                </div>

                {/* Quick Zoom Preview button */}
                <button
                  onClick={() => setPreviewImage(item.imageUrl)}
                  className="absolute top-3 right-3 p-1.5 bg-black/80 hover:bg-[#D4AF37] text-white hover:text-black transition-colors cursor-pointer"
                  title="Lihat Foto Full"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Location on image footer */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-gray-300 text-xs font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                  <span className="truncate">{item.location || 'Dimensi Studio'}</span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-4 sm:p-5">
                <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                  {item.description || 'Koleksi dokumentasi visual Dimensi Fotografi.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 p-4 pt-0 border-t border-white/5 mt-2">
              <span className="text-[10px] font-mono text-gray-500">{item.id}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-2.5 py-1.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-gray-300 hover:text-white border border-white/10 text-xs font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  id={`btn-edit-portfolio-${item.id}`}
                >
                  <Edit2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmId(item.id)}
                  className="px-2.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 text-xs font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  id={`btn-delete-portfolio-${item.id}`}
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filteredPortfolios.length === 0 && (
        <div className="text-center py-12 bg-[#121212] border border-white/10">
          <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Tidak ada karya portofolio ditemukan</p>
          <p className="text-xs text-gray-500 mt-1">Coba filter kategori lain atau tambahkan karya baru ke galeri.</p>
        </div>
      )}

      {/* Modal: Add / Edit Portfolio Item */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/20 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl animate-fadeIn">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
                {editingItem ? 'Edit Karya Portofolio' : 'Tambah Karya Portofolio Baru'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Karya ini akan langsung dipublikasikan pada Galeri Portofolio di halaman utama beranda konsumen.
            </p>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Judul Karya / Sesi Foto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: The Royal Heritage Wedding of Reza & Dinda"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                  id="portfolio-form-title"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                    Kategori Sesi *
                  </label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.categoryName || ''}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    placeholder="Ketik kategori baru atau pilih..."
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                    id="portfolio-form-category"
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.name} />
                    ))}
                    {Array.from(new Set(portfolios.map(p => p.categoryName))).map((cName, idx) => (
                      <option key={idx} value={cName} />
                    ))}
                  </datalist>
                  <span className="text-[10px] text-gray-500 mt-1 block">Anda dapat mengetik kategori baru secara fleksibel.</span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                    Lokasi Pemotretan
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Dharmawangsa Jakarta"
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                    id="portfolio-form-location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Tautan URL Foto (High Resolution) *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                  id="portfolio-form-image"
                />

                {/* Local Computer File Upload */}
                <div className="mt-2.5">
                  <label className="w-full cursor-pointer px-3 py-2 bg-[#1A1A1A] hover:bg-[#222222] border border-dashed border-[#D4AF37]/50 text-gray-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span>Upload Foto dari Komputer Lokal (Bisa Multiple)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">Mendukung file JPG, PNG, WebP (Maks. 10MB per file). Pilih beberapa file sekaligus.</p>
                </div>

                {/* Image Live Previews */}
                {(formData.imageUrls && formData.imageUrls.length > 0) ? (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {formData.imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded border border-white/15 overflow-hidden bg-black group">
                        <img
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-[#D4AF37]">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = formData.imageUrls?.filter((_, i) => i !== idx) || [];
                            setFormData({
                              ...formData,
                              imageUrls: newUrls,
                              imageUrl: newUrls[0] || ''
                            });
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/80 text-rose-400 hover:text-rose-300 hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : formData.imageUrl ? (
                  <div className="mt-3 aspect-video w-full max-w-sm rounded border border-white/15 overflow-hidden relative bg-black">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-[10px] font-mono text-[#D4AF37]">
                      Live Preview
                    </span>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Deskripsi Artistik / Cerita Visual
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Nuansa sakral adat Jawa modern berpadu pencahayaan hangat romantis."
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                  id="portfolio-form-description"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 border border-white/15 text-xs font-mono uppercase tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
                  id="portfolio-form-save-btn"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Terbitkan Karya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Image Full Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] p-2 bg-black border border-white/20">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#D4AF37] p-1 text-sm font-mono flex items-center gap-1"
            >
              <X className="w-5 h-5" />
              <span>Tutup</span>
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[80vh] w-auto object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-rose-500/30 w-full max-w-sm p-6 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-2 font-display">Hapus Karya Portofolio?</h4>
            <p className="text-xs text-gray-400 mb-6">
              Foto karya ini akan dihapus dari galeri publik di halaman beranda utama.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#1A1A1A] text-gray-300 border border-white/15 text-xs font-mono uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                id="confirm-delete-portfolio-btn"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
