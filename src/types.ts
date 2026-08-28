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

