import React, { useState } from 'react';
import { PhotoPackage, CategoryType } from '../types';
import { PHOTO_PACKAGES } from '../data/mockData';
import { formatRupiah } from '../utils/formatters';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  RotateCcw,
  X,
  Image as ImageIcon,
  Clock,
  Tag,
  DollarSign,
  Layers,
  Eye,
  CheckCircle2,
  Search,
  Filter,
  Star,
} from 'lucide-react';

interface PackageManagerProps {
  packages: PhotoPackage[];
  onAddPackage: (newPkg: PhotoPackage) => void;
  onUpdatePackage: (pkgId: string, updatedPkg: Partial<PhotoPackage>) => void;
  onDeletePackage: (pkgId: string) => void;
  onResetPackages: () => void;
  isFirebaseConnected?: boolean;
}

const CATEGORY_OPTIONS: { id: CategoryType; label: string }[] = [
  { id: 'wedding', label: '💍 Wedding & Akad' },
  { id: 'prewedding', label: '💑 Pre-Wedding' },
  { id: 'wisuda', label: '🎓 Wisuda & Kelulusan' },
  { id: 'keluarga', label: '👨‍👩‍👧 Keluarga & Maternity' },
  { id: 'produk', label: '📦 Produk & UMKM' },
  { id: 'event', label: '🎉 Event & Gathering' },
];

const PRESET_IMAGES = [
  { label: 'Wedding Royal', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Akad Nikah', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Pre-Wedding', url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Wisuda', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Keluarga & Bayi', url: 'https://images.unsplash.com/photo-1581953153629-9e87bb363a03?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Produk Studio', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Studio Minimalis', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80' },
];

export const PackageManager: React.FC<PackageManagerProps> = ({
  packages,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  onResetPackages,
  isFirebaseConnected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingPackage, setEditingPackage] = useState<PhotoPackage | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  // Form Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('wedding');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState<number>(1500000);
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [duration, setDuration] = useState('2-3 Jam Sesi');
  const [popular, setPopular] = useState(false);
  const [featuresText, setFeaturesText] = useState('1 Fotografer Senior\nSemua Softcopy HD di Google Drive\nGrading Warna Eksklusif');
  const [deliverablesText, setDeliverablesText] = useState('1 Cetak 30x40cm Frame Kayu\nFlashdisk Custom Box\nLink Cloud Private 1 Tahun');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [recommendedFor, setRecommendedFor] = useState('Semua Klien & Pasangan');
  const [formError, setFormError] = useState('');

  // Open Form for Adding New Package
  const handleOpenAddForm = () => {
    setEditingPackage(null);
    setName('');
    setCategory('wedding');
    setTagline('');
    setPrice(1500000);
    setOriginalPrice('');
    setDuration('2-3 Jam Sesi');
    setPopular(false);
    setFeaturesText('1 Fotografer Utama & 1 Crew\nUnlimited Poses & Shoots\nGrading Warna Dimensi Signature\nAll Master Softcopy High-Res');
    setDeliverablesText('1 Cetak 30x45cm Frame Minimalis\n1 Album Foto Hardcover\nGoogle Drive Folder');
    setImageUrl(PRESET_IMAGES[0].url);
    setRecommendedFor('Pasangan & Acara Keluarga');
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Package
  const handleOpenEditForm = (pkg: PhotoPackage) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setCategory(pkg.category);
    setTagline(pkg.tagline);
    setPrice(pkg.price);
    setOriginalPrice(pkg.originalPrice ? String(pkg.originalPrice) : '');
    setDuration(pkg.duration);
    setPopular(Boolean(pkg.popular));
    setFeaturesText(pkg.features.join('\n'));
    setDeliverablesText(pkg.deliverables.join('\n'));
    setImageUrl(pkg.imageUrl);
    setRecommendedFor(pkg.recommendedFor || '');
    setFormError('');
    setIsFormOpen(true);
  };

  // Save (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Nama paket fotografi wajib diisi.');
      return;
    }

    if (isNaN(price) || price < 0) {
      setFormError('Harga paket harus berupa angka valid.');
      return;
    }

    const featuresList = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const deliverablesList = deliverablesText
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    if (featuresList.length === 0) {
      setFormError('Masukkan minimal 1 fitur / layanan dalam paket.');
      return;
    }

    const parsedOrigPrice = originalPrice.trim() ? Number(originalPrice) : undefined;

    if (editingPackage) {
      // UPDATE
      const updated: Partial<PhotoPackage> = {
        name: name.trim(),
        category,
        tagline: tagline.trim(),
        price,
        originalPrice: parsedOrigPrice,
        duration: duration.trim(),
        popular,
        features: featuresList,
        deliverables: deliverablesList,
        imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
        recommendedFor: recommendedFor.trim(),
      };

      onUpdatePackage(editingPackage.id, updated);
      setSuccessNotice(`Paket "${name}" berhasil diperbarui.`);
    } else {
      // CREATE NEW
      const newId = `pkg-${category}-${Date.now().toString().slice(-4)}`;
      const newPkg: PhotoPackage = {
        id: newId,
        name: name.trim(),
        category,
        tagline: tagline.trim(),
        price,
        originalPrice: parsedOrigPrice,
        duration: duration.trim() || '60 Menit',
        popular,
        features: featuresList,
        deliverables: deliverablesList,
        imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
        recommendedFor: recommendedFor.trim() || 'Semua Klien',
      };

      onAddPackage(newPkg);
      setSuccessNotice(`Paket baru "${name}" berhasil ditambahkan ke katalog & cloud.`);
    }

    setIsFormOpen(false);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Delete Handler
  const handleDelete = (pkg: PhotoPackage) => {
    if (confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.name}"? Paket ini tidak akan muncul lagi di katalog pemesanan.`)) {
      onDeletePackage(pkg.id);
      setSuccessNotice(`Paket "${pkg.name}" berhasil dihapus.`);
      setTimeout(() => setSuccessNotice(''), 4000);
    }
  };

  // Filtered packages
  const filtered = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Manajemen Paket & Layanan Fotografi
              </h2>
              <p className="text-xs text-gray-400">
                Kelola daftar paket foto, atur harga, durasi sesi, bonus output cetak, dan status populer secara realtime.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onResetPackages}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#141414] hover:bg-white/5 text-gray-400 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
            title="Reset ke paket bawaan studio"
            id="reset-packages-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>

          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#b89428] text-black font-semibold text-xs tracking-wider uppercase transition-colors shadow-lg cursor-pointer"
            id="add-package-btn"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Paket Baru</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Cari nama paket, fitur, atau deskripsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#D4AF37]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-4 relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#141414] border border-white/10 text-white text-xs focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
          >
            <option value="all">Semua Kategori ({packages.length})</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((pkg) => (
          <div
            key={pkg.id}
            className="relative bg-[#141414] border border-white/10 hover:border-[#D4AF37]/50 transition-all flex flex-col group"
            id={`pkg-card-${pkg.id}`}
          >
            {/* Package Cover Image Banner */}
            <div className="relative h-44 w-full bg-black/60 overflow-hidden border-b border-white/10">
              <img
                src={pkg.imageUrl}
                alt={pkg.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/30 to-transparent"></div>

              {/* Badges Top Left & Right */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-white/20 text-[10px] uppercase font-mono tracking-wider text-gray-200">
                  {pkg.category.toUpperCase()}
                </span>
                {pkg.popular && (
                  <span className="px-2 py-0.5 bg-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 fill-black" />
                    Best Seller
                  </span>
                )}
              </div>

              {/* Duration Tag Bottom Left */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] text-gray-300 font-mono bg-black/70 px-2 py-0.5 border border-white/10">
                <Clock className="w-3 h-3 text-[#D4AF37]" />
                <span>{pkg.duration}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {pkg.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {pkg.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-3.5 pt-3 border-t border-white/10 flex items-baseline gap-2">
                  <span className="text-lg font-serif font-bold text-[#D4AF37]">
                    {formatRupiah(pkg.price)}
                  </span>
                  {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                    <span className="text-xs text-gray-500 line-through font-mono">
                      {formatRupiah(pkg.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Feature Highlights (Up to 3) */}
                <div className="mt-3.5 space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-mono block">
                    Fitur & Output Utama:
                  </span>
                  {pkg.features.slice(0, 3).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-300">
                      <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                  {pkg.features.length > 3 && (
                    <span className="text-[11px] text-gray-500 italic pl-5">
                      +{pkg.features.length - 3} fitur lainnya
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit & Delete */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenEditForm(pkg)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1F1F1F] hover:bg-[#D4AF37] hover:text-black text-gray-200 border border-white/10 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  id={`edit-btn-${pkg.id}`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Paket</span>
                </button>

                <button
                  onClick={() => handleDelete(pkg)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1F1F1F] hover:bg-rose-950/60 hover:text-rose-400 hover:border-rose-500/40 text-gray-400 border border-white/10 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  id={`delete-btn-${pkg.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-[#141414] border border-white/10 p-8 space-y-3">
          <Package className="w-10 h-10 text-gray-500 mx-auto" />
          <p className="text-sm text-gray-300 font-medium">Tidak ada paket yang sesuai dengan pencarian / filter.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
            }}
            className="text-xs text-[#D4AF37] hover:underline font-mono"
          >
            Reset Filter Pencarian
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL FORM: TAMBAH / EDIT PAKET FOTOGRAFI                                */}
      {/* ========================================================================= */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl text-[#E0E0E0] my-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  <Package className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingPackage ? 'Edit Paket Fotografi' : 'Tambah Paket Fotografi Baru'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {editingPackage
                      ? `Memperbarui paket: ${editingPackage.name}`
                      : 'Lengkapi rincian paket untuk ditampilkan di katalog konsumen'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Row 1: Nama Paket & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold flex items-center gap-1">
                    <span>Nama Paket *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paket Wedding Signature"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
                    Kategori Layanan *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tagline / Subtitle */}
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
                  Tagline / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dokumentasi momen sakral pernikahan lengkap dan berkelas"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Row 2: Harga & Harga Coret (Diskon) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#D4AF37]" />
                    <span>Harga Paket (Rp) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50000}
                    placeholder="1500000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
                    Harga Normal / Coret (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    placeholder="2000000 (Opsional)"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-gray-300 font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    <span>Durasi Sesi *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3-4 Jam Sesi"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Popular Badge Toggle & Recommended For */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
                    Rekomendasi Untuk
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pasangan Akad & Resepsi Gedung"
                    value={recommendedFor}
                    onChange={(e) => setRecommendedFor(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={popular}
                      onChange={(e) => setPopular(e.target.checked)}
                      className="w-4 h-4 accent-[#D4AF37] rounded-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-300 font-medium">
                      Tandai sebagai <strong className="text-[#D4AF37]">Paket Best Seller / Populer</strong>
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 3: Fitur & Output (Deliverables) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
                    Fitur & Pelayanan (1 Baris = 1 Item) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh:&#10;2 Fotografer Senior&#10;Unlimited Photoshoots&#10;Tone Warna Signature"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] font-mono leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
                    Hasil Cetak & Deliverables (1 Baris = 1 Item) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh:&#10;1 Album Kolase Magnetik&#10;1 Cetak 40x60cm Frame&#10;Flashdisk Box 64GB&#10;Google Drive Link"
                    value={deliverablesText}
                    onChange={(e) => setDeliverablesText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Cover Image & Preset Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-[#D4AF37]" />
                    <span>URL Foto Banner / Cover</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">Pilih preset atau masukkan link URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] font-mono text-[11px]"
                />

                {/* Preset Thumbnails */}
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setImageUrl(preset.url)}
                      className={`px-2 py-1 text-[10px] border shrink-0 transition-colors ${
                        imageUrl === preset.url
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-bold'
                          : 'border-white/10 bg-[#0A0A0A] text-gray-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 bg-[#0A0A0A] hover:bg-white/5 text-gray-300 border border-white/15 uppercase tracking-wider font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#b89428] text-black uppercase tracking-wider font-bold text-xs transition-colors shadow-lg cursor-pointer"
                  id="save-package-submit-btn"
                >
                  {editingPackage ? 'Simpan Perubahan' : 'Terbitkan Paket Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
