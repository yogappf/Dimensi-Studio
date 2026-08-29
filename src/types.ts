export type CategoryType = 'all' | 'wedding' | 'prewedding' | 'wisuda' | 'keluarga' | 'produk' | 'event';

export type UserRole = 'customer' | 'admin';

export interface PhotoPackage {
  id: string;
  name: string;
  category: CategoryType;
  tagline: string;
  price: number;
  originalPrice?: number;
  duration: string;
  popular?: boolean;
  features: string[];
  deliverables: string[];
  imageUrl: string;
  recommendedFor: string;
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export type OrderStatus = 'Menunggu Konfirmasi' | 'Terkonfirmasi & Terjadwal' | 'Proses Editing' | 'Selesai' | 'Dibatalkan';

export interface BookingOrder {
  id: string;
  createdAt: string; // ISO date string
  clientName: string;
  phone: string;
  email: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  addOnIds: string[];
  addOnsText: string;
  addOnsTotal: number;
  totalPrice: number;
  sessionDate: string;
  sessionTime: string;
  locationType: 'studio' | 'outdoor' | 'venue';
  locationAddress: string;
  notes?: string;
  status: OrderStatus;
  paymentPreference: 'DP 30%' | 'DP 50%' | 'Lunas';
  driveFolderId?: string;
  driveFolderUrl?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: CategoryType;
  categoryName: string;
  location: string;
  imageUrl: string;
  description: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  isFolder?: boolean;
  iconLink?: string;
  parents?: string[];
}

export type AdminRole = 'master' | 'editor' | 'finance' | 'staff';

export interface AdminStaff {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  phone?: string;
  addedAt: string;
  lastActive?: string;
  status: 'active' | 'inactive';
}

export interface StudioConfig {
  studioName: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  operatingHours: string;
  bankBCA: string;
  bankMandiri: string;
  bankBRI: string;
  qrisUrl?: string;
  staffPasscode: string;
  masterPasscode: string;
  masterUsername?: string;
  masterName?: string;
  masterEmail?: string;
  masterPhone?: string;
  staffUsername?: string;
  heroImageUrl?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  category: 'booking' | 'order' | 'package' | 'addon' | 'portfolio' | 'security' | 'staff' | 'system';
}

