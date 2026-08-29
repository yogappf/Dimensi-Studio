import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
} from 'firebase/auth';
import { db, auth, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { BookingOrder, OrderStatus, PhotoPackage, AddOnItem, PortfolioItem, AdminStaff, StudioConfig, AuditLogItem } from '../types';
import { INITIAL_CLIENT_ORDERS, PHOTO_PACKAGES, ADD_ON_SERVICES, PORTFOLIO_ITEMS, STUDIO_INFO } from '../data/mockData';

const BOOKINGS_COLLECTION = 'bookings';
const PACKAGES_COLLECTION = 'packages';
const ADDONS_COLLECTION = 'addons';
const PORTFOLIOS_COLLECTION = 'portfolios';
const SETTINGS_COLLECTION = 'settings';
const ADMIN_STAFF_COLLECTION = 'admin_staff';
const AUDIT_LOGS_COLLECTION = 'audit_logs';

export const DEFAULT_STUDIO_CONFIG: StudioConfig = {
  studioName: STUDIO_INFO.name,
  tagline: STUDIO_INFO.tagline,
  description: STUDIO_INFO.description,
  phone: STUDIO_INFO.phone,
  whatsapp: STUDIO_INFO.whatsapp,
  email: STUDIO_INFO.email,
  instagram: STUDIO_INFO.instagram,
  address: STUDIO_INFO.address,
  operatingHours: STUDIO_INFO.operatingHours,
  bankBCA: 'BCA 8720-1928-33 a/n Dimensi Fotografi Studio',
  bankMandiri: 'Mandiri 137-00-1928374-1 a/n PT Dimensi Visual Karya',
  bankBRI: 'BRI 0341-01-002938-50-8 a/n Dimensi Fotografi',
  qrisUrl: '',
  staffPasscode: 'DIMENSI2026',
  masterPasscode: 'MASTER_DIMENSI_2026',
  masterUsername: 'dimensi',
  masterName: 'Master Admin Dimensi',
  masterEmail: 'dimensi.idphoto@gmail.com',
  masterPhone: '0821-2345-6789',
  staffUsername: 'staff',
  heroImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  heroImageUrls: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80'
  ],
  heroEyebrow: 'Dimensi Photography & Art Studio',
  heroTitleMain: 'Abadikan Momen',
  heroTitleHighlight: 'Terbaik',
  heroDescription: 'Kami menghadirkan seni dalam setiap jepretan. Dari pernikahan sakral, portrait wisuda, keluarga, hingga produk komersial, Dimensi Studio memberikan hasil visual presisi yang bercerita.',
  heroButtonText: 'Pesan Sekarang',
  heroSecondaryButtonText: 'Lihat Layanan',
  heroCardTitle: 'The Royal Eternity',
  heroCardSubtitle: 'Signature Series',
  heroCardDescription: 'Dokumentasi wedding sinematik 4K dengan color grading eksklusif.',
  heroBadgeText: 'Top Rated Studio',
  heroStat1Value: '4.9 / 5.0',
  heroStat1Label: '1.500+ Klien Puas',
  heroStat2Value: '8+ Tahun',
  heroStat2Label: 'Pengalaman Visual',
  heroStat3Value: '100%',
  heroStat3Label: 'Garansi High-Res',
};

export const INITIAL_ADMIN_STAFF: AdminStaff[] = [
  {
    id: 'staff-master-1',
    name: 'Master Admin Dimensi (Utama)',
    email: 'dimensi.idphoto@gmail.com',
    role: 'master',
    phone: '0821-2345-6789',
    addedAt: '2026-01-01T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'staff-editor-1',
    name: 'Senior Lead Photographer',
    email: 'editor.dimensiphoto@gmail.com',
    role: 'editor',
    phone: '0821-9988-7766',
    addedAt: '2026-02-15T00:00:00.000Z',
    status: 'active',
  },
  {
    id: 'staff-finance-1',
    name: 'Customer Support & Finance',
    email: 'finance.dimensiphoto@gmail.com',
    role: 'finance',
    phone: '0821-3344-5566',
    addedAt: '2026-03-01T00:00:00.000Z',
    status: 'active',
  },
];

// In-memory access token cache for Google Workspace & Drive APIs (never stored in localStorage)
let cachedAccessToken: string | null = null;

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

// Sign in with Google Popup and extract access token for Drive APIs
export async function signInWithGoogle(): Promise<{ user: User; accessToken: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

// Sign out and clear in-memory token
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('Sign-Out failed:', error);
    throw error;
  }
}

// Listen to Auth State Changes
export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
    }
    callback(user);
  });
}

// Save or Create a Booking Order in Firestore
export async function saveBookingToFirestore(order: BookingOrder): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${order.id}`;
  try {
    const cleanPayload: Record<string, any> = {
      id: order.id,
      clientName: order.clientName,
      phone: order.phone,
      email: order.email || '',
      packageId: order.packageId,
      packageName: order.packageName,
      packagePrice: Number(order.packagePrice) || 0,
      addOnIds: Array.isArray(order.addOnIds) ? order.addOnIds : [],
      addOnsText: order.addOnsText || 'Tidak ada',
      addOnsTotal: Number(order.addOnsTotal) || 0,
      totalPrice: Number(order.totalPrice) || 0,
      sessionDate: order.sessionDate,
      sessionTime: order.sessionTime,
      locationType: order.locationType || 'studio',
      locationAddress: order.locationAddress || 'Dimensi Photography Studio',
      notes: order.notes || '',
      status: order.status || 'Menunggu Konfirmasi',
      paymentPreference: order.paymentPreference || 'DP 50%',
      driveFolderId: order.driveFolderId || '',
      driveFolderUrl: order.driveFolderUrl || '',
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    if (auth.currentUser?.uid) {
      cleanPayload.createdBy = auth.currentUser.uid;
    }

    const docRef = doc(db, BOOKINGS_COLLECTION, order.id);
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update a Booking Order in Firestore
export async function updateBookingInFirestore(
  orderId: string,
  updates: Partial<BookingOrder>
): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, orderId);
    const sanitizedUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, sanitizedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete a Booking Order from Firestore
export async function deleteBookingFromFirestore(orderId: string): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${orderId}`;
  try {
    const docRef = doc(db, BOOKINGS_COLLECTION, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to real-time updates of all bookings
export function subscribeToBookings(
  onData: (orders: BookingOrder[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = BOOKINGS_COLLECTION;
  const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: BookingOrder[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        orders.push({
          id: data.id || docSnapshot.id,
          createdAt: data.createdAt || new Date().toISOString(),
          clientName: data.clientName || 'Konsumen',
          phone: data.phone || '',
          email: data.email || '',
          packageId: data.packageId || 'pkg-custom',
          packageName: data.packageName || 'Layanan Studio',
          packagePrice: Number(data.packagePrice) || 0,
          addOnIds: Array.isArray(data.addOnIds) ? data.addOnIds : [],
          addOnsText: data.addOnsText || 'Tidak ada',
          addOnsTotal: Number(data.addOnsTotal) || 0,
          totalPrice: Number(data.totalPrice) || 0,
          sessionDate: data.sessionDate || '',
          sessionTime: data.sessionTime || '',
          locationType: data.locationType || 'studio',
          locationAddress: data.locationAddress || 'Dimensi Photography Studio',
          notes: data.notes || '',
          status: (data.status as OrderStatus) || 'Menunggu Konfirmasi',
          paymentPreference: data.paymentPreference || 'DP 50%',
          driveFolderId: data.driveFolderId || undefined,
          driveFolderUrl: data.driveFolderUrl || undefined,
        });
      });

      // If Firestore collection is empty, seed initial sample data so users have an immediate rich demo
      if (snapshot.empty && orders.length === 0) {
        seedInitialBookings();
      } else {
        onData(orders);
      }
    },
    (error) => {
      console.warn('Realtime listener notice (fallback active):', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Seed initial bookings into Firestore if empty
let isSeeding = false;
export async function seedInitialBookings(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;
  try {
    const existingSnap = await getDocs(collection(db, BOOKINGS_COLLECTION));
    if (existingSnap.empty) {
      console.log('Seeding initial mock bookings into Firestore...');
      for (const order of INITIAL_CLIENT_ORDERS) {
        await saveBookingToFirestore(order);
      }
      console.log('Initial bookings successfully seeded to Firestore.');
    }
  } catch (error) {
    console.warn('Could not seed initial bookings to Firestore:', error);
  } finally {
    isSeeding = false;
  }
}

// ---------------------------------------------
// PACKAGE SERVICES (Tambah, Edit, Hapus, Sync)
// ---------------------------------------------

// Save or Add Package in Firestore
export async function savePackageToFirestore(pkg: PhotoPackage): Promise<void> {
  const path = `${PACKAGES_COLLECTION}/${pkg.id}`;
  try {
    const cleanPayload: Record<string, any> = {
      id: pkg.id,
      name: pkg.name,
      category: pkg.category,
      tagline: pkg.tagline || '',
      price: Number(pkg.price) || 0,
      originalPrice: pkg.originalPrice ? Number(pkg.originalPrice) : null,
      duration: pkg.duration || '60 Menit',
      popular: Boolean(pkg.popular),
      features: Array.isArray(pkg.features) ? pkg.features : [],
      deliverables: Array.isArray(pkg.deliverables) ? pkg.deliverables : [],
      imageUrl: pkg.imageUrl || '',
      recommendedFor: pkg.recommendedFor || '',
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, PACKAGES_COLLECTION, pkg.id);
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update Package in Firestore
export async function updatePackageInFirestore(
  pkgId: string,
  updates: Partial<PhotoPackage>
): Promise<void> {
  const path = `${PACKAGES_COLLECTION}/${pkgId}`;
  try {
    const docRef = doc(db, PACKAGES_COLLECTION, pkgId);
    const sanitizedUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, sanitizedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete Package from Firestore
export async function deletePackageFromFirestore(pkgId: string): Promise<void> {
  const path = `${PACKAGES_COLLECTION}/${pkgId}`;
  try {
    const docRef = doc(db, PACKAGES_COLLECTION, pkgId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to real-time updates of all packages
export function subscribeToPackages(
  onData: (packages: PhotoPackage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = PACKAGES_COLLECTION;
  const q = collection(db, PACKAGES_COLLECTION);

  return onSnapshot(
    q,
    (snapshot) => {
      const packagesList: PhotoPackage[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        packagesList.push({
          id: data.id || docSnapshot.id,
          name: data.name || 'Paket Foto',
          category: data.category || 'all',
          tagline: data.tagline || '',
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          duration: data.duration || '60 Menit',
          popular: Boolean(data.popular),
          features: Array.isArray(data.features) ? data.features : [],
          deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
          recommendedFor: data.recommendedFor || '',
        });
      });

      if (snapshot.empty && packagesList.length === 0) {
        seedInitialPackages();
      } else {
        onData(packagesList);
      }
    },
    (error) => {
      console.warn('Realtime packages listener fallback:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Seed initial packages into Firestore if collection is empty
let isSeedingPackages = false;
export async function seedInitialPackages(): Promise<void> {
  if (isSeedingPackages) return;
  isSeedingPackages = true;
  try {
    const existingSnap = await getDocs(collection(db, PACKAGES_COLLECTION));
    if (existingSnap.empty) {
      console.log('Seeding initial photo packages to Firestore...');
      for (const pkg of PHOTO_PACKAGES) {
        await savePackageToFirestore(pkg);
      }
      console.log('Initial packages successfully seeded to Firestore.');
    }
  } catch (error) {
    console.warn('Could not seed initial packages to Firestore:', error);
  } finally {
    isSeedingPackages = false;
  }
}

// ---------------------------------------------
// ADD-ON SERVICES (Tambah, Edit, Hapus, Sync)
// ---------------------------------------------

// Save or Add Add-on in Firestore
export async function saveAddonToFirestore(addon: AddOnItem): Promise<void> {
  const path = `${ADDONS_COLLECTION}/${addon.id}`;
  try {
    const cleanPayload: Record<string, any> = {
      id: addon.id,
      name: addon.name,
      price: Number(addon.price) || 0,
      description: addon.description || '',
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, ADDONS_COLLECTION, addon.id);
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update Add-on in Firestore
export async function updateAddonInFirestore(
  addonId: string,
  updates: Partial<AddOnItem>
): Promise<void> {
  const path = `${ADDONS_COLLECTION}/${addonId}`;
  try {
    const docRef = doc(db, ADDONS_COLLECTION, addonId);
    const sanitizedUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, sanitizedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete Add-on from Firestore
export async function deleteAddonFromFirestore(addonId: string): Promise<void> {
  const path = `${ADDONS_COLLECTION}/${addonId}`;
  try {
    const docRef = doc(db, ADDONS_COLLECTION, addonId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to real-time updates of all add-ons
export function subscribeToAddons(
  onData: (addons: AddOnItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = ADDONS_COLLECTION;
  const q = collection(db, ADDONS_COLLECTION);

  return onSnapshot(
    q,
    (snapshot) => {
      const addonsList: AddOnItem[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        addonsList.push({
          id: data.id || docSnapshot.id,
          name: data.name || 'Layanan Tambahan',
          price: Number(data.price) || 0,
          description: data.description || '',
        });
      });

      if (snapshot.empty && addonsList.length === 0) {
        seedInitialAddons();
      } else {
        onData(addonsList);
      }
    },
    (error) => {
      console.warn('Realtime addons listener fallback:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Seed initial add-ons into Firestore if empty
let isSeedingAddons = false;
export async function seedInitialAddons(): Promise<void> {
  if (isSeedingAddons) return;
  isSeedingAddons = true;
  try {
    const existingSnap = await getDocs(collection(db, ADDONS_COLLECTION));
    if (existingSnap.empty) {
      console.log('Seeding initial add-on services to Firestore...');
      for (const addon of ADD_ON_SERVICES) {
        await saveAddonToFirestore(addon);
      }
      console.log('Initial add-on services successfully seeded to Firestore.');
    }
  } catch (error) {
    console.warn('Could not seed initial add-ons to Firestore:', error);
  } finally {
    isSeedingAddons = false;
  }
}

// --------------------------------------------------
// PORTFOLIO SERVICES (Tambah, Edit, Hapus, Sync)
// --------------------------------------------------

// Save or Add Portfolio Item in Firestore
export async function savePortfolioToFirestore(item: PortfolioItem): Promise<void> {
  const path = `${PORTFOLIOS_COLLECTION}/${item.id}`;
  try {
    const cleanPayload: Record<string, any> = {
      id: item.id,
      title: item.title,
      category: item.category,
      categoryName: item.categoryName || '',
      location: item.location || '',
      imageUrl: item.imageUrl || '',
      description: item.description || '',
      updatedAt: new Date().toISOString(),
    };

    const docRef = doc(db, PORTFOLIOS_COLLECTION, item.id);
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update Portfolio Item in Firestore
export async function updatePortfolioInFirestore(
  portfolioId: string,
  updates: Partial<PortfolioItem>
): Promise<void> {
  const path = `${PORTFOLIOS_COLLECTION}/${portfolioId}`;
  try {
    const docRef = doc(db, PORTFOLIOS_COLLECTION, portfolioId);
    const sanitizedUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, sanitizedUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Delete Portfolio Item from Firestore
export async function deletePortfolioFromFirestore(portfolioId: string): Promise<void> {
  const path = `${PORTFOLIOS_COLLECTION}/${portfolioId}`;
  try {
    const docRef = doc(db, PORTFOLIOS_COLLECTION, portfolioId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Subscribe to real-time updates of all portfolio items
export function subscribeToPortfolios(
  onData: (items: PortfolioItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = PORTFOLIOS_COLLECTION;
  const q = collection(db, PORTFOLIOS_COLLECTION);

  return onSnapshot(
    q,
    (snapshot) => {
      const portfolioList: PortfolioItem[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        portfolioList.push({
          id: data.id || docSnapshot.id,
          title: data.title || 'Karya Fotografi',
          category: data.category || 'all',
          categoryName: data.categoryName || 'Koleksi',
          location: data.location || '',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          description: data.description || '',
        });
      });

      if (snapshot.empty && portfolioList.length === 0) {
        seedInitialPortfolios();
      } else {
        onData(portfolioList);
      }
    },
    (error) => {
      console.warn('Realtime portfolios listener fallback:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Seed initial portfolio items into Firestore if empty
let isSeedingPortfolios = false;
export async function seedInitialPortfolios(): Promise<void> {
  if (isSeedingPortfolios) return;
  isSeedingPortfolios = true;
  try {
    const existingSnap = await getDocs(collection(db, PORTFOLIOS_COLLECTION));
    if (existingSnap.empty) {
      console.log('Seeding initial portfolio items to Firestore...');
      for (const item of PORTFOLIO_ITEMS) {
        await savePortfolioToFirestore(item);
      }
      console.log('Initial portfolio items successfully seeded to Firestore.');
    }
  } catch (error) {
    console.warn('Could not seed initial portfolios to Firestore:', error);
  } finally {
    isSeedingPortfolios = false;
  }
}

// ==========================================
// MASTER ADMIN: STUDIO CONFIGURATION SERVICES
// ==========================================

export async function saveStudioConfigToFirestore(config: StudioConfig): Promise<void> {
  const path = `${SETTINGS_COLLECTION}/studio_config`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'studio_config');
    await setDoc(docRef, config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToStudioConfig(
  onData: (config: StudioConfig) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, SETTINGS_COLLECTION, 'studio_config');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<StudioConfig>;
        onData({
          ...DEFAULT_STUDIO_CONFIG,
          ...data,
        });
      } else {
        // Initialize with default
        saveStudioConfigToFirestore(DEFAULT_STUDIO_CONFIG);
        onData(DEFAULT_STUDIO_CONFIG);
      }
    },
    (error) => {
      console.warn('Studio config listener fallback to default:', error);
      if (onError) onError(error);
      onData(DEFAULT_STUDIO_CONFIG);
    }
  );
}

// ==========================================
// MASTER ADMIN: STAFF MANAGEMENT SERVICES
// ==========================================

export async function saveStaffToFirestore(staff: AdminStaff): Promise<void> {
  const path = `${ADMIN_STAFF_COLLECTION}/${staff.id}`;
  try {
    const docRef = doc(db, ADMIN_STAFF_COLLECTION, staff.id);
    await setDoc(docRef, staff, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateStaffInFirestore(staffId: string, updates: Partial<AdminStaff>): Promise<void> {
  const path = `${ADMIN_STAFF_COLLECTION}/${staffId}`;
  try {
    const docRef = doc(db, ADMIN_STAFF_COLLECTION, staffId);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStaffFromFirestore(staffId: string): Promise<void> {
  const path = `${ADMIN_STAFF_COLLECTION}/${staffId}`;
  try {
    const docRef = doc(db, ADMIN_STAFF_COLLECTION, staffId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToStaff(
  onData: (staffList: AdminStaff[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = collection(db, ADMIN_STAFF_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const list: AdminStaff[] = [];
      snapshot.forEach((snap) => {
        const d = snap.data();
        list.push({
          id: d.id || snap.id,
          name: d.name || 'Staf Admin',
          email: d.email || '',
          role: d.role || 'staff',
          phone: d.phone || '',
          addedAt: d.addedAt || new Date().toISOString(),
          status: d.status || 'active',
          lastActive: d.lastActive,
        });
      });

      if (snapshot.empty && list.length === 0) {
        seedInitialStaff();
      } else {
        onData(list);
      }
    },
    (error) => {
      console.warn('Staff listener fallback to initial list:', error);
      if (onError) onError(error);
      onData(INITIAL_ADMIN_STAFF);
    }
  );
}

let isSeedingStaff = false;
export async function seedInitialStaff(): Promise<void> {
  if (isSeedingStaff) return;
  isSeedingStaff = true;
  try {
    const snap = await getDocs(collection(db, ADMIN_STAFF_COLLECTION));
    if (snap.empty) {
      for (const st of INITIAL_ADMIN_STAFF) {
        await saveStaffToFirestore(st);
      }
    }
  } catch (err) {
    console.warn('Error seeding initial staff:', err);
  } finally {
    isSeedingStaff = false;
  }
}

// ==========================================
// MASTER ADMIN: AUDIT LOG SERVICES
// ==========================================

export async function logAuditEvent(
  actor: string,
  action: string,
  details: string,
  category: AuditLogItem['category'] = 'system'
): Promise<void> {
  const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const logItem: AuditLogItem = {
    id: logId,
    timestamp: new Date().toISOString(),
    actor,
    action,
    details,
    category,
  };
  try {
    const docRef = doc(db, AUDIT_LOGS_COLLECTION, logId);
    await setDoc(docRef, logItem);
  } catch (err) {
    // Audit logs non-blocking fallback
    try {
      const savedLogs = JSON.parse(localStorage.getItem('dimensi_audit_logs_v1') || '[]');
      savedLogs.unshift(logItem);
      localStorage.setItem('dimensi_audit_logs_v1', JSON.stringify(savedLogs.slice(0, 100)));
    } catch {
      // ignore
    }
  }
}

export function subscribeToAuditLogs(
  onData: (logs: AuditLogItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = collection(db, AUDIT_LOGS_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLogItem[] = [];
      snapshot.forEach((snap) => {
        const d = snap.data();
        logs.push({
          id: d.id || snap.id,
          timestamp: d.timestamp || new Date().toISOString(),
          actor: d.actor || 'System',
          action: d.action || '',
          details: d.details || '',
          category: d.category || 'system',
        });
      });

      // Sort newest first
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onData(logs.slice(0, 80));
    },
    (error) => {
      console.warn('Audit logs listener fallback:', error);
      if (onError) onError(error);
      try {
        const savedLogs = JSON.parse(localStorage.getItem('dimensi_audit_logs_v1') || '[]');
        onData(savedLogs);
      } catch {
        onData([]);
      }
    }
  );
}

