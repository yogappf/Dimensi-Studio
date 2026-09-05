import React, { useState, useMemo, useRef } from 'react';
import { PortfolioItem, CategoryType, PhotoPackage } from '../types';
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
  Eye,
  Upload,
  Link as LinkIcon,
  Star,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface PortfolioManagerProps {
  portfolios: PortfolioItem[];
  packages?: PhotoPackage[];
  onAddPortfolio: (item: PortfolioItem) => void;
  onUpdatePortfolio: (id: string, updated: Partial<PortfolioItem>) => void;
  onDeletePortfolio: (id: string) => void;
  onResetPortfolios: () => void;
}

const PACKAGE_CATEGORIES: { id: CategoryType; label: string; name: string }[] = [
  { id: 'wedding', label: '💍 Wedding & Akad', name: 'Pernikahan' },
  { id: 'prewedding', label: '💑 Pre-Wedding', name: 'Pre-Wedding' },
  { id: 'engagement', label: '💐 Engagement', name: 'Engagement / Lamaran' },
  { id: 'siraman', label: '🌿 Siraman', name: 'Siraman & Pengajian' },
  { id: 'wisuda', label: '🎓 Wisuda & Kelulusan', name: 'Wisuda & Kelulusan' },
  { id: 'keluarga', label: '👨‍👩‍👧 Keluarga & Maternity', name: 'Keluarga & Maternity' },
  { id: 'ulangtahun', label: '🎂 Ulang Tahun', name: 'Ulang Tahun & Sweet 17' },
  { id: 'event', label: '🎉 Event & Gathering', name: 'Event & Gathering' },
];

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolios,
  packages,
  onAddPortfolio,
  onUpdatePortfolio,
  onDeletePortfolio,
  onResetPortfolios,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imageOrientations, setImageOrientations] = useState<Record<string, 'portrait' | 'landscape' | 'square'>>({});

  // Input refs for file upload
  const appendFileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic category options derived from package catalog
  const categoryOptions = useMemo(() => {
    const list = [...PACKAGE_CATEGORIES];
    if (packages && packages.length > 0) {
      packages.forEach((pkg) => {
        if (pkg.category && !list.some((c) => c.id === pkg.category)) {
          list.push({
            id: pkg.category,
            label: `📁 ${pkg.category.toUpperCase()}`,
            name: pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1),
          });
        }
      });
    }
    return list;
  }, [packages]);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: CategoryType;
    categoryName: string;
    location: string;
    imageUrl: string;
    imageUrls: string[];
    description: string;
  }>({
    title: '',
    category: 'wedding',
    categoryName: 'Pernikahan',
    location: '',
    imageUrl: '',
    imageUrls: [],
    description: '',
  });

  const [inputUrlDraft, setInputUrlDraft] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to extract clean photos list from an item
  const getItemPhotos = (item: PortfolioItem): string[] => {
    const urls: string[] = [];
    if (item.imageUrls && item.imageUrls.length > 0) {
      item.imageUrls.forEach((u) => {
        if (u && u.trim() && !urls.includes(u.trim())) urls.push(u.trim());
      });
    }
    if (item.imageUrl && item.imageUrl.trim() && !urls.includes(item.imageUrl.trim())) {
      urls.unshift(item.imageUrl.trim());
    }
    return urls;
  };

  const handleFileUpload = async (files: FileList | null, isReplace: boolean) => {
    if (!files || files.length === 0) return;

    // Check size limit (max 15MB each)
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 15 * 1024 * 1024) {
        alert(`File "${files[i].name}" melebihi batas 15MB. Silakan pilih file foto lain.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgressText(`Memproses 0/${files.length} foto...`);

    try {
      const processedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgressText(`Mengompres foto HD ${i + 1}/${files.length}...`);
        const compressed = await compressImage(files[i], 1440, 1440, 0.78);
        processedUrls.push(compressed);
      }

      setFormData((prev) => {
        const existingList = prev.imageUrls && prev.imageUrls.length > 0
          ? prev.imageUrls
          : (prev.imageUrl ? [prev.imageUrl] : []);

        const finalUrls = isReplace
          ? processedUrls
          : [...existingList, ...processedUrls];

        return {
          ...prev,
          imageUrls: finalUrls,
          imageUrl: finalUrls[0] || '',
        };
      });

      showToast(
        isReplace
          ? `Foto lama diganti dengan ${processedUrls.length} foto baru.`
          : `Berhasil menambahkan ${processedUrls.length} foto baru!`
      );
    } catch (err) {
      console.error('Error uploading/compressing image:', err);
      alert('Gagal memproses unggahan foto. Pastikan format file gambar valid (JPG, PNG, WEBP).');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (appendFileInputRef.current) appendFileInputRef.current.value = '';
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  const handleAddUrlDraft = () => {
    const trimmed = inputUrlDraft.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      alert('Masukkan tautan URL foto yang valid (diawali https://).');
      return;
    }

    setFormData((prev) => {
      const existing = prev.imageUrls || (prev.imageUrl ? [prev.imageUrl] : []);
      if (existing.includes(trimmed)) {
        showToast('Foto dengan URL ini sudah ada di daftar.');
        return prev;
      }
      const updated = [...existing, trimmed];
      return {
        ...prev,
        imageUrls: updated,
        imageUrl: updated[0] || trimmed,
      };
    });

    setInputUrlDraft('');
    showToast('Tautan URL foto berhasil ditambahkan ke daftar.');
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setFormData((prev) => {
      const updated = prev.imageUrls.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        imageUrls: updated,
        imageUrl: updated[0] || '',
      };
    });
    showToast('Foto berhasil dihapus dari daftar.');
  };

  const handleSetCoverPhoto = (indexToCover: number) => {
    setFormData((prev) => {
      const targetUrl = prev.imageUrls[indexToCover];
      if (!targetUrl) return prev;
      const rest = prev.imageUrls.filter((_, idx) => idx !== indexToCover);
      const reordered = [targetUrl, ...rest];
      return {
        ...prev,
        imageUrls: reordered,
        imageUrl: targetUrl,
      };
    });
    showToast('Foto utama (cover) berhasil diperbarui.');
  };

  const handleOpenAdd = () => {
    const defaultCat = categoryOptions[0] || PACKAGE_CATEGORIES[0];
    setFormData({
      title: defaultCat.name,
      category: defaultCat.id,
      categoryName: defaultCat.name,
      location: '',
      imageUrl: '',
      imageUrls: [],
      description: '',
    });
    setInputUrlDraft('');
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    const photos = getItemPhotos(item);
    setEditingItem(item);
    setFormData({
      title: item.title || item.categoryName,
      category: item.category,
      categoryName: item.categoryName,
      location: item.location || '',
      imageUrl: photos[0] || item.imageUrl || '',
      imageUrls: photos,
      description: item.description || '',
    });
    setInputUrlDraft('');
  };

  const handleCategorySelect = (selectedSlug: string) => {
    const matched = categoryOptions.find((c) => c.id === selectedSlug);
    const catName = matched ? matched.name : selectedSlug;
    setFormData((prev) => ({
      ...prev,
      category: selectedSlug as CategoryType,
      categoryName: catName,
      title: catName,
    }));
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUrls = (formData.imageUrls || [])
      .map((u) => u.trim())
      .filter((u) => Boolean(u));

    if (cleanUrls.length === 0 && !formData.imageUrl.trim()) {
      alert('Silakan unggah minimal 1 foto atau masukkan tautan URL gambar portofolio terlebih dahulu.');
      return;
    }

    const finalImageUrls = cleanUrls.length > 0 ? cleanUrls : [formData.imageUrl.trim()];
    const finalImageUrl = finalImageUrls[0];

    const category = formData.category || 'wedding';
    const matchedCategory = categoryOptions.find((c) => c.id === category);
    const categoryName = formData.categoryName || matchedCategory?.name || category;
    const title = categoryName;
    const description = formData.description?.trim() || '';

    setIsSaving(true);
    try {
      if (editingItem) {
        await onUpdatePortfolio(editingItem.id, {
          title,
          category,
          categoryName,
          imageUrl: finalImageUrl,
          imageUrls: finalImageUrls,
          description,
        });
        showToast(`Karya kategori "${categoryName}" (${finalImageUrls.length} foto) berhasil disimpan.`);
        setEditingItem(null);
        setIsAddModalOpen(false);
      } else {
        const newId = `port-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        const newItem: PortfolioItem = {
          id: newId,
          title,
          category,
          categoryName,
          imageUrl: finalImageUrl,
          imageUrls: finalImageUrls,
          description,
        };
        await onAddPortfolio(newItem);
        showToast(`Karya portofolio kategori "${categoryName}" (${finalImageUrls.length} foto) berhasil disimpan.`);
        setIsAddModalOpen(false);
        setEditingItem(null);
      }
    } catch (err) {
      console.error('Error saving portfolio item:', err);
      alert('Gagal menyimpan foto portofolio. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const target = portfolios.find((p) => p.id === id);
    onDeletePortfolio(id);
    setDeleteConfirmId(null);
    showToast(`Karya kategori "${target?.categoryName || 'Portofolio'}" berhasil dihapus.`);
  };

  const filteredPortfolios = portfolios.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (item.categoryName || '').toLowerCase().includes(q) ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs for Direct Reliable Triggering */}
      <input
        type="file"
        ref={appendFileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, false)}
      />
      <input
        type="file"
        ref={replaceFileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, true)}
      />

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
            Kelola foto showcase publik, tambah foto tambahan per kategori, ganti foto utama, dan deskripsi artistik studio.
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
            placeholder="Cari judul/kategori karya..."
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
          const photos = getItemPhotos(item);
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

                  {/* Photo Count badge on bottom */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-black/80 border border-white/10 text-[10px] font-mono text-gray-300 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-[#D4AF37]" />
                    <span>{photos.length} Foto Thumbnail</span>
                  </div>
                </div>

                {/* Text Info */}
                <div className="p-4 sm:p-5">
                  <h4 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#D4AF37] transition-colors leading-snug font-serif">
                    Kategori: {item.categoryName || item.category}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
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
                    <span>Edit Foto</span>
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#D4AF37]/40 w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl animate-fadeIn">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingItem(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 bg-[#1F1F1F] border border-white/10 hover:border-[#D4AF37] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
                {editingItem ? `Edit Foto Portofolio: ${formData.categoryName}` : 'Tambah Karya Portofolio Baru'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Foto yang Anda tambahkan atau unggah akan langsung tampil di Galeri Portofolio publik sesuai kategori layanan.
            </p>

            <form onSubmit={handleSaveSubmit} noValidate className="space-y-5">
              {/* Category Select */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Kategori Layanan Pemotretan *
                </label>
                <select
                  required
                  value={formData.category || 'wedding'}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                  id="portfolio-form-category"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({cat.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload & Add Photo Area */}
              <div className="p-4 bg-[#0D0D0D] border border-white/10 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D4AF37] font-bold">
                    Koleksi Foto Portofolio ({formData.imageUrls?.length || 0} Foto)
                  </label>
                  {isUploading && (
                    <span className="text-[11px] font-mono text-[#D4AF37] animate-pulse">
                      {uploadProgressText || 'Memproses foto...'}
                    </span>
                  )}
                </div>

                {/* Direct Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => appendFileInputRef.current?.click()}
                    className="w-full py-3 px-3 bg-[#1A1A1A] hover:bg-[#252525] border border-dashed border-[#D4AF37] text-white hover:text-[#D4AF37] text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    id="btn-upload-append-photos"
                  >
                    <Upload className={`w-4 h-4 text-[#D4AF37] ${isUploading ? 'animate-spin' : ''}`} />
                    <span>+ Upload Foto Tambahan</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      if (formData.imageUrls.length > 0) {
                        if (confirm('Upload ulang akan menimpa dan mengganti seluruh foto lama di kategori ini. Lanjutkan?')) {
                          replaceFileInputRef.current?.click();
                        }
                      } else {
                        replaceFileInputRef.current?.click();
                      }
                    }}
                    className="w-full py-3 px-3 bg-[#1A1A1A] hover:bg-[#252525] border border-white/20 text-gray-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
                    id="btn-upload-replace-photos"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                    <span>Ganti / Upload Ulang Semua</span>
                  </button>
                </div>

                {/* Paste URL Input Option */}
                <div className="pt-2 border-t border-white/5 flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inputUrlDraft}
                      onChange={(e) => setInputUrlDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrlDraft();
                        }
                      }}
                      placeholder="Atau tempel tautan URL gambar (https://...)"
                      className="w-full pl-9 pr-3 py-2 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrlDraft}
                    className="px-3.5 py-2 bg-[#222] hover:bg-[#D4AF37] text-gray-300 hover:text-black border border-white/15 text-xs font-mono font-bold transition-colors cursor-pointer shrink-0"
                  >
                    + Tambah URL
                  </button>
                </div>

                {/* Attached Photos Grid Preview with Management Controls */}
                {formData.imageUrls && formData.imageUrls.length > 0 ? (
                  <div className="pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-gray-400">
                        Klik tombol bintang ★ untuk menjadikan Cover utama:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Hapus semua foto dari daftar ini?')) {
                            setFormData((prev) => ({ ...prev, imageUrls: [], imageUrl: '' }));
                            showToast('Semua foto di daftar telah dikosongkan.');
                          }
                        }}
                        className="text-[10px] font-mono text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Hapus Semua
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1.5 bg-[#080808] border border-white/10 rounded">
                      {formData.imageUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-[3/4] rounded-sm border overflow-hidden bg-black group transition-all ${
                            idx === 0 ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'border-white/15 hover:border-white/40'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Foto #${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />

                          {/* Index / Cover Badge */}
                          <div className="absolute top-1 left-1">
                            {idx === 0 ? (
                              <span className="px-1.5 py-0.5 bg-[#D4AF37] text-black text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                                Cover Utama
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-black/80 text-gray-300 text-[9px] font-mono">
                                #{idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setPreviewImage(url)}
                                className="p-1 bg-black/80 text-white hover:text-[#D4AF37] rounded"
                                title="Lihat Foto"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="p-1 bg-rose-950/80 text-rose-300 hover:bg-rose-900 rounded"
                                title="Hapus foto ini"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(idx)}
                                className="w-full py-1 bg-[#D4AF37] text-black text-[9px] font-mono font-bold uppercase flex items-center justify-center gap-1 rounded-xs"
                              >
                                <Star className="w-2.5 h-2.5 fill-black" />
                                <span>Jadikan Cover</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-white/10 bg-[#080808]">
                    <ImageIcon className="w-6 h-6 text-gray-600 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-400 font-mono">Belum ada foto yang ditambahkan.</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Gunakan tombol <strong>+ Upload Foto Tambahan</strong> di atas untuk menambahkan foto dari galeri HP/laptop Anda.
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Deskripsi Artistik / Cerita Visual
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contoh: Nuansa sakral adat modern berpadu pencahayaan hangat romantis."
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none font-mono"
                  id="portfolio-form-description"
                />
              </div>

              {/* Submit Buttons */}
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
                  disabled={isUploading || isSaving}
                  className={`px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg flex items-center gap-2 ${
                    isUploading || isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  id="portfolio-form-save-btn"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                      <span>Menyimpan ke Database...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'Simpan Perubahan' : 'Terbitkan Karya'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Image Full Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
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
