import React, { useState } from 'react';
import { AddOnItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface AddonManagerProps {
  addons: AddOnItem[];
  onAddAddon: (addon: AddOnItem) => void;
  onUpdateAddon: (addonId: string, updated: Partial<AddOnItem>) => void;
  onDeleteAddon: (addonId: string) => void;
  onResetAddons: () => void;
}

export const AddonManager: React.FC<AddonManagerProps> = ({
  addons,
  onAddAddon,
  onUpdateAddon,
  onDeleteAddon,
  onResetAddons,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddOnItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AddOnItem>>({
    name: '',
    price: 300000,
    description: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      price: 250000,
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: AddOnItem) => {
    setEditingAddon(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Nama layanan add-on wajib diisi.');
      return;
    }

    if (editingAddon) {
      onUpdateAddon(editingAddon.id, {
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        description: formData.description?.trim() || '',
      });
      showToast(`Layanan "${formData.name}" berhasil diperbarui.`);
      setEditingAddon(null);
    } else {
      const newId = `addon-${Date.now().toString(36)}`;
      const newAddon: AddOnItem = {
        id: newId,
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        description: formData.description?.trim() || '',
      };
      onAddAddon(newAddon);
      showToast(`Layanan add-on baru "${newAddon.name}" berhasil ditambahkan.`);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteConfirm = (id: string) => {
    const target = addons.find((a) => a.id === id);
    onDeleteAddon(id);
    setDeleteConfirmId(null);
    showToast(`Layanan "${target?.name || 'Add-on'}" berhasil dihapus.`);
  };

  const filteredAddons = addons.filter((addon) => {
    const q = searchTerm.toLowerCase();
    return (
      addon.name.toLowerCase().includes(q) ||
      addon.description.toLowerCase().includes(q) ||
      addon.id.toLowerCase().includes(q)
    );
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
              Manajemen Layanan Tambahan (Add-Ons)
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Kelola pilihan ekstra layanan foto seperti drone, MUA, cetak kanvas tambahan, dan express editing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetAddons}
            className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 hover:text-white border border-white/15 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Kembalikan semua add-on ke pengaturan awal studio"
            id="btn-reset-addons"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
            id="btn-add-new-addon"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Add-On Baru</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#121212] border border-white/10 p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-500 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari layanan add-on berdasarkan nama atau deskripsi..."
          className="w-full bg-transparent text-white text-xs px-2 py-1 focus:outline-none placeholder:text-gray-600"
          id="search-addons-input"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-gray-400 hover:text-white px-2 py-0.5"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid of Addons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAddons.map((addon) => (
          <div
            key={addon.id}
            className="bg-[#141414] border border-white/10 hover:border-[#D4AF37]/50 transition-all p-5 flex flex-col justify-between group relative"
            id={`addon-card-${addon.id}`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-[#D4AF37]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">{addon.id}</span>
                </div>
                <span className="text-sm font-bold text-[#D4AF37] font-mono">
                  {formatRupiah(addon.price)}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                {addon.name}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed min-h-[38px]">
                {addon.description || 'Tidak ada deskripsi layanan.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => handleOpenEdit(addon)}
                className="px-2.5 py-1.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-gray-300 hover:text-white border border-white/10 text-xs font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                id={`btn-edit-addon-${addon.id}`}
              >
                <Edit2 className="w-3 h-3 text-[#D4AF37]" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setDeleteConfirmId(addon.id)}
                className="px-2.5 py-1.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 text-xs font-mono uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                id={`btn-delete-addon-${addon.id}`}
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAddons.length === 0 && (
        <div className="text-center py-12 bg-[#121212] border border-white/10">
          <Layers className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">Tidak ada layanan add-on ditemukan</p>
          <p className="text-xs text-gray-500 mt-1">Coba kata kunci pencarian lain atau tambahkan layanan baru.</p>
        </div>
      )}

      {/* Modal: Add / Edit Add-on */}
      {(isAddModalOpen || editingAddon) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/20 w-full max-w-lg p-6 sm:p-8 relative shadow-2xl animate-fadeIn">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingAddon(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
                {editingAddon ? 'Edit Layanan Add-On' : 'Tambah Layanan Add-On Baru'}
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Layanan tambahan ini akan otomatis muncul pada Kalkulator Biaya dan Formulir Pemesanan Konsumen.
            </p>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Nama Layanan Tambahan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Drone Aerial Photography & 4K Video"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                  id="addon-form-name"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Harga Investasi (IDR) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={10000}
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-[#D4AF37] font-mono font-bold text-sm focus:border-[#D4AF37] focus:outline-none"
                  id="addon-form-price"
                />
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  Preview: <span className="text-[#D4AF37] font-bold">{formatRupiah(formData.price || 0)}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-1.5">
                  Deskripsi & Keunggulan Layanan
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail apa saja yang didapatkan konsumen dari layanan ekstra ini..."
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 text-white text-xs placeholder:text-gray-600 focus:border-[#D4AF37] focus:outline-none"
                  id="addon-form-description"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingAddon(null);
                  }}
                  className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 border border-white/15 text-xs font-mono uppercase tracking-wider cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
                  id="addon-form-save-btn"
                >
                  {editingAddon ? 'Simpan Perubahan' : 'Tambah Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-rose-500/30 w-full max-w-sm p-6 text-center shadow-2xl">
            <Trash2 className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-2 font-display">Hapus Layanan Add-On?</h4>
            <p className="text-xs text-gray-400 mb-6">
              Layanan ini tidak akan tersedia lagi pada kalkulator harga dan formulir booking konsumen.
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
                id="confirm-delete-addon-btn"
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
