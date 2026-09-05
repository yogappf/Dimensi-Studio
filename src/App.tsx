import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  BookingOrder,
  CategoryType,
  OrderStatus,
  PhotoPackage,
  AddOnItem,
  PortfolioItem,
  AdminStaff,
  StudioConfig,
  AuditLogItem,
  ReviewItem,
} from './types';
import { INITIAL_CLIENT_ORDERS, PHOTO_PACKAGES, ADD_ON_SERVICES, PORTFOLIO_ITEMS, STUDIO_INFO } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PackageCatalog } from './components/PackageCatalog';
import { AddonsCalculator } from './components/AddonsCalculator';
import { PortfolioGallery } from './components/PortfolioGallery';
import { BookingForm } from './components/BookingForm';
import { BookingSuccessModal } from './components/BookingSuccessModal';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminGate } from './components/AdminGate';
import { TestimonialsFAQ } from './components/TestimonialsFAQ';
import { Footer } from './components/Footer';
import { useToast } from './context/ToastContext';
import { testConnection } from './firebase/config';
import {
  subscribeToBookings,
  subscribeToPackages,
  subscribeToAddons,
  subscribeToPortfolios,
  subscribeToStudioConfig,
  subscribeToStaff,
  subscribeToAuditLogs,
  subscribeToAuth,
  subscribeToReviews,
  saveReviewToFirestore,
  updateReviewInFirestore,
  deleteReviewFromFirestore,
  REVIEWS_STORAGE_KEY,
  checkAndCleanupExpiredCompletedOrders,
  saveBookingToFirestore,
  updateBookingInFirestore,
  deleteBookingFromFirestore,
  savePackageToFirestore,
  updatePackageInFirestore,
  deletePackageFromFirestore,
  saveAddonToFirestore,
  updateAddonInFirestore,
  deleteAddonFromFirestore,
  savePortfolioToFirestore,
  updatePortfolioInFirestore,
  deletePortfolioFromFirestore,
  saveStudioConfigToFirestore,
  saveStaffToFirestore,
  updateStaffInFirestore,
  deleteStaffFromFirestore,
  logAuditEvent,
  signInWithGoogle,
  logOut,
  DEFAULT_STUDIO_CONFIG,
  INITIAL_ADMIN_STAFF,
} from './firebase/services';

const STORAGE_KEY = 'dimensi_photo_orders_v1';
const PACKAGES_STORAGE_KEY = 'dimensi_photo_packages_v1';
const ADDONS_STORAGE_KEY = 'dimensi_photo_addons_v1';
const PORTFOLIOS_STORAGE_KEY = 'dimensi_photo_portfolios_v1';
const CONFIG_STORAGE_KEY = 'dimensi_studio_config_v1';
const ADMIN_SESSION_KEY = 'dimensi_admin_session_v1';
const MASTER_SESSION_KEY = 'dimensi_master_session_v1';
const STUDIO_ADMIN_EMAIL = 'dimensi.idphoto@gmail.com';

export default function App() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'showcase' | 'admin' | 'customer-portal'>('showcase');
  
  const [orders, setOrders] = useState<BookingOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CLIENT_ORDERS;
  });

  const [packages, setPackages] = useState<PhotoPackage[]>(() => {
    try {
      const saved = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PHOTO_PACKAGES;
  });

  const [addons, setAddons] = useState<AddOnItem[]>(() => {
    try {
      const saved = localStorage.getItem(ADDONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return ADD_ON_SERVICES;
  });

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PORTFOLIO_ITEMS;
  });

  const [studioConfig, setStudioConfig] = useState<StudioConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STUDIO_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDIO_CONFIG;
  });

  const [staffList, setStaffList] = useState<AdminStaff[]>(INITIAL_ADMIN_STAFF);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isMasterAdminSession, setIsMasterAdminSession] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(MASTER_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [bookingPackageId, setBookingPackageId] = useState<string>(packages[0]?.id || PHOTO_PACKAGES[0].id);
  const [bookingAddOnIds, setBookingAddOnIds] = useState<string[]>([]);
  const [latestCreatedOrder, setLatestCreatedOrder] = useState<BookingOrder | null>(null);

  // Check if current authenticated user has admin or master role
  const isGoogleAdminEmail = currentUser?.email?.toLowerCase() === STUDIO_ADMIN_EMAIL.toLowerCase();
  const isStaffAdminUser = Boolean(
    currentUser?.email &&
      staffList.some((s) => s.email.toLowerCase() === currentUser.email?.toLowerCase() && s.status === 'active')
  );
  const isMasterStaffUser = Boolean(
    currentUser?.email &&
      staffList.some(
        (s) => s.email.toLowerCase() === currentUser.email?.toLowerCase() && s.role === 'master' && s.status === 'active'
      )
  );

  const isAdminAuthenticated = isGoogleAdminEmail || isStaffAdminUser || isAdminSession;
  const isMasterAdmin = isGoogleAdminEmail || isMasterStaffUser || isMasterAdminSession;

  // Validate Firestore Connection on initial boot
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user?.email?.toLowerCase() === STUDIO_ADMIN_EMAIL.toLowerCase()) {
        setIsAdminSession(true);
        setIsMasterAdminSession(true);
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        sessionStorage.setItem(MASTER_SESSION_KEY, 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Realtime Bookings from Firestore with Auto-Cleanup for orders completed > 30 days
  useEffect(() => {
    const unsubscribe = subscribeToBookings(
      async (firestoreOrders) => {
        if (firestoreOrders) {
          const { cleanedOrders, deletedCount } = await checkAndCleanupExpiredCompletedOrders(firestoreOrders);
          setOrders(cleanedOrders);
          setIsFirebaseConnected(true);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedOrders));
          } catch {
            // ignore
          }
          if (deletedCount > 0) {
            await logAuditEvent(
              'Sistem Otomatis',
              'Pembersihan Otomatis Pesanan',
              `${deletedCount} pesanan berstatus Selesai yang telah berumur lebih dari 30 hari (1 bulan) otomatis dihapus dari database.`,
              'system'
            );
          }
        }
      },
      (error) => {
        console.warn('Realtime listener error fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to Realtime Packages from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPackages(
      (firestorePackages) => {
        if (firestorePackages && firestorePackages.length > 0) {
          setPackages(firestorePackages);
        }
      },
      (error) => {
        console.warn('Realtime package listener error fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to Realtime Add-ons from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToAddons(
      (firestoreAddons) => {
        if (firestoreAddons && firestoreAddons.length > 0) {
          setAddons(firestoreAddons);
        }
      },
      (error) => {
        console.warn('Realtime addons listener error fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to Realtime Portfolios from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPortfolios(
      (firestorePortfolios) => {
        if (firestorePortfolios && firestorePortfolios.length > 0) {
          setPortfolios(firestorePortfolios);
        }
      },
      (error) => {
        console.warn('Realtime portfolios listener error fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to Realtime Studio Config
  useEffect(() => {
    const unsubscribe = subscribeToStudioConfig((config) => {
      if (config) {
        try {
          const localSaved = localStorage.getItem(CONFIG_STORAGE_KEY);
          if (localSaved) {
            const localConfig = JSON.parse(localSaved);
            if (localConfig.heroImageUrls && localConfig.heroImageUrls.length > (config.heroImageUrls?.length || 0)) {
              config.heroImageUrls = localConfig.heroImageUrls;
              config.heroImageUrl = localConfig.heroImageUrl || config.heroImageUrl;
            }
            if (localConfig.masterPasscode && (!config.masterPasscode || config.masterPasscode === 'MASTER_DIMENSI_2026')) {
              config.masterPasscode = localConfig.masterPasscode;
            }
          }
        } catch {
          // ignore
        }

        setStudioConfig(config);
        try {
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        } catch {
          // ignore
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Realtime Staff
  useEffect(() => {
    const unsubscribe = subscribeToStaff((staff) => {
      if (staff && staff.length > 0) {
        setStaffList(staff);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Realtime Reviews
  useEffect(() => {
    const unsubscribe = subscribeToReviews((data) => {
      if (data) {
        setReviews(data);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Realtime Audit Logs
  useEffect(() => {
    const unsubscribe = subscribeToAuditLogs((logs) => {
      if (logs) {
        setAuditLogs(logs);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync backup orders, packages, addons & portfolios to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(packages));
    } catch {
      // ignore
    }
  }, [packages]);

  useEffect(() => {
    try {
      localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(addons));
    } catch {
      // ignore
    }
  }, [addons]);

  useEffect(() => {
    try {
      localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(portfolios));
    } catch {
      // ignore
    }
  }, [portfolios]);

  // Handle new booking creation
  const handleOrderCreated = async (newOrder: BookingOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setLatestCreatedOrder(newOrder);

    try {
      await saveBookingToFirestore(newOrder);
      await logAuditEvent(newOrder.clientName, 'Pemesanan Baru', `Booking paket ${newOrder.packageName} dibuat.`, 'order');
      toast.success('Data pesanan berhasil disimpan!', `Paket: ${newOrder.packageName} (${newOrder.clientName})`);
    } catch (err) {
      console.error('Error saving order to Firestore:', err);
      toast.error('Gagal menyimpan pesanan ke database cloud');
    }
  };

  // Select package from catalog & scroll to booking form
  const handleSelectPackageForBooking = (pkg: PhotoPackage) => {
    setBookingPackageId(pkg.id);
    setBookingAddOnIds([]);
    setActiveTab('showcase');
    setTimeout(() => {
      const el = document.getElementById('formulir-order');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Proceed from Calculator & scroll to booking form
  const handleProceedWithCalculator = (packageId: string, addOnIds: string[]) => {
    setBookingPackageId(packageId);
    setBookingAddOnIds(addOnIds);
    setActiveTab('showcase');
    setTimeout(() => {
      const el = document.getElementById('formulir-order');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Scroll to booking form from generic CTAs
  const handleOpenBooking = () => {
    setActiveTab('showcase');
    setTimeout(() => {
      const el = document.getElementById('formulir-order');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  // Admin session authentication
  const handleAdminAuthenticated = (isMaster?: boolean) => {
    setIsAdminSession(true);
    if (isMaster) {
      setIsMasterAdminSession(true);
      try {
        sessionStorage.setItem(MASTER_SESSION_KEY, 'true');
      } catch {
        // ignore
      }
    } else {
      setIsMasterAdminSession(false);
      try {
        sessionStorage.removeItem(MASTER_SESSION_KEY);
      } catch {
        // ignore
      }
    }
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    toast.success(isMaster ? 'Login Master Admin Berhasil' : 'Login Admin Berhasil', 'Selamat datang di Panel Manajemen Studio');
  };

  // Exit Admin session back to customer mode
  const handleExitAdmin = () => {
    setIsAdminSession(false);
    setIsMasterAdminSession(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(MASTER_SESSION_KEY);
    } catch {
      // ignore
    }
    setActiveTab('showcase');
    toast.info('Keluar dari Panel Admin');
  };

  // Admin order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const nowIso = new Date().toISOString();
    const targetOrder = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? {
        ...ord,
        status: newStatus,
        completedAt: newStatus === 'Selesai' ? (ord.completedAt || nowIso) : undefined,
        updatedAt: nowIso,
      } : ord))
    );

    try {
      await updateBookingInFirestore(orderId, {
        status: newStatus,
        completedAt: newStatus === 'Selesai' ? nowIso : undefined,
      });
      await logAuditEvent(
        currentUser?.email || 'Admin',
        'Update Status Pesanan',
        `Pesanan ${orderId} diubah menjadi: ${newStatus}${newStatus === 'Selesai' ? ' (Otomatis akan dihapus sistem setelah 30 hari/1 bulan)' : ''}`,
        'order'
      );
      toast.success('Update status sukses', `${targetOrder ? targetOrder.clientName : 'Pesanan'} diubah menjadi "${newStatus}"`);
    } catch (err) {
      console.error('Error updating order status in Firestore:', err);
      toast.error('Gagal memperbarui status di cloud');
    }
  };

  // Admin order generic update (e.g., Drive folder URL, dates, notes, testimonial visibility)
  const handleUpdateOrder = async (orderId: string, updates: Partial<BookingOrder>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
    );

    if (updates.showInTestimonials !== undefined || updates.rating !== undefined || updates.review !== undefined) {
      setReviews((prev) => {
        const exists = prev.some((r) => r.id === orderId);
        let updatedList: ReviewItem[];
        if (exists) {
          updatedList = prev.map((r) => (r.id === orderId ? { ...r, ...updates } : r));
        } else {
          const ord = orders.find((o) => o.id === orderId);
          if (ord) {
            const newRev: ReviewItem = {
              id: ord.id,
              clientName: ord.clientName,
              packageName: ord.packageName,
              rating: updates.rating !== undefined ? updates.rating : (ord.rating || 5),
              review: updates.review !== undefined ? updates.review : (ord.review || ''),
              reviewedAt: updates.reviewedAt || ord.reviewedAt || new Date().toISOString(),
              showInTestimonials: updates.showInTestimonials !== undefined ? updates.showInTestimonials : (ord.showInTestimonials !== false),
            };
            updatedList = [...prev, newRev];
          } else {
            updatedList = prev;
          }
        }
        try {
          localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updatedList));
        } catch {
          // ignore
        }
        return updatedList;
      });
    }

    try {
      await updateBookingInFirestore(orderId, updates);
      if (updates.showInTestimonials !== undefined || updates.rating !== undefined || updates.review !== undefined) {
        await updateReviewInFirestore(orderId, updates as any);
      }
      toast.success('Data pesanan berhasil disimpan');
    } catch (err) {
      console.error('Error updating order in Firestore:', err);
      toast.error('Gagal menyimpan perubahan ke Firestore');
    }
  };

  // Admin delete order (Data konsumen dihapus dari pesanan, ulasan tetap dipertahankan untuk publik)
  const handleDeleteOrder = async (orderId: string) => {
    // 1. Pastikan ulasan konsumen tersimpan aman di koleksi ulasan sebelum data pesanan dihapus
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder && (targetOrder.review || targetOrder.rating)) {
      const preservedReview: ReviewItem = {
        id: targetOrder.id,
        clientName: targetOrder.clientName,
        packageName: targetOrder.packageName,
        rating: targetOrder.rating || 5,
        review: targetOrder.review || '',
        reviewedAt: targetOrder.reviewedAt || new Date().toISOString(),
        showInTestimonials: targetOrder.showInTestimonials !== false,
      };

      setReviews((prev) => {
        const exists = prev.some((r) => r.id === orderId);
        if (!exists) {
          const updated = [...prev, preservedReview];
          try {
            localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        }
        return prev;
      });

      // Simpan ke Firestore reviews agar ulasan publik abadi
      saveReviewToFirestore(preservedReview).catch(() => {});
    }

    // 2. Hapus pesanan dari state lokal
    setOrders((prev) => {
      const updated = prev.filter((ord) => ord.id !== orderId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // 3. Hapus pesanan dari Firestore bookings (TETAP MENYIMPAN ULASAN DI KOLEKSI REVIEWS)
    try {
      await deleteBookingFromFirestore(orderId);
      await logAuditEvent(
        currentUser?.email || 'Admin',
        'Hapus Pesanan',
        `Pesanan ${orderId} (${targetOrder?.clientName || 'Klien'}) telah dihapus. Ulasan testimoni tetap dipertahankan di publik.`,
        'order'
      );
      toast.info('Pesanan berhasil dihapus');
    } catch (err) {
      console.error('Error deleting order in Firestore:', err);
      toast.error('Gagal menghapus pesanan dari database');
    }
  };

  const handleDeleteReview = async (orderId: string) => {
    // 1. Immediately remove from reviews state
    setReviews((prev) => prev.filter((r) => r.id !== orderId));

    // 2. Immediately remove review fields from local orders state
    setOrders((prev) => {
      const updated = prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              review: undefined,
              rating: undefined,
              showInTestimonials: undefined,
              reviewedAt: undefined,
            }
          : ord
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // 3. Update localStorage for reviews
    try {
      const savedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (savedReviews) {
        const list = JSON.parse(savedReviews);
        localStorage.setItem(
          REVIEWS_STORAGE_KEY,
          JSON.stringify(list.filter((r: any) => r.id !== orderId))
        );
      }
    } catch {
      // ignore
    }

    // 4. Delete from Firestore reviews collection
    try {
      await deleteReviewFromFirestore(orderId);
      await logAuditEvent(
        currentUser?.email || 'Admin',
        'Hapus Ulasan',
        `Ulasan untuk pesanan/klien ID ${orderId} telah dihapus.`,
        'order'
      );
      toast.info('Ulasan testimoni berhasil dihapus');
    } catch (err) {
      console.error('Error deleting from reviews collection:', err);
    }

    // 5. Clean up review fields in Firebase bookings document
    try {
      const { doc, updateDoc, deleteField } = await import('firebase/firestore');
      const { db } = await import('./firebase/config');
      const docRef = doc(db, 'bookings', orderId);
      await updateDoc(docRef, {
        review: deleteField(),
        rating: deleteField(),
        showInTestimonials: deleteField(),
        reviewedAt: deleteField(),
      }).catch(() => {});
    } catch (err) {
      console.error('Error deleting review fields from bookings:', err);
    }
  };

  // Admin manual order addition
  const handleAddManualOrder = async (newOrder: BookingOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    try {
      await saveBookingToFirestore(newOrder);
      await logAuditEvent(
        currentUser?.email || 'Admin',
        'Tambah Pesanan Manual',
        `Pesanan ${newOrder.clientName} (${newOrder.packageName}) ditambahkan manual.`,
        'order'
      );
      toast.success('Data pesanan berhasil disimpan!', `Klien: ${newOrder.clientName}`);
    } catch (err) {
      console.error('Error adding manual order to Firestore:', err);
      toast.error('Gagal menyimpan pesanan manual ke cloud');
    }
  };

  // Reset to default sample orders
  const handleResetData = async () => {
    if (confirm('Kembalikan data ke contoh awal bawaan studio dan sinkronkan ke Firebase?')) {
      setOrders(INITIAL_CLIENT_ORDERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLIENT_ORDERS));
      for (const order of INITIAL_CLIENT_ORDERS) {
        try {
          await saveBookingToFirestore(order);
        } catch {
          // ignore
        }
      }
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Reset Data Pesanan', 'Seluruh data pesanan direset ke default.', 'system');
      toast.info('Data pesanan direset ke default bawaan');
    }
  };

  // Package Management Handlers
  const handleAddPackage = async (newPkg: PhotoPackage) => {
    setPackages((prev) => {
      const next = [newPkg, ...prev];
      try {
        localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await savePackageToFirestore(newPkg);
      await logAuditEvent(currentUser?.email || 'Admin', 'Tambah Paket Foto', `Paket "${newPkg.name}" ditambahkan.`, 'package');
      toast.success('Paket foto berhasil ditambahkan', newPkg.name);
    } catch (err) {
      console.warn('Error adding package to Firestore:', err);
      toast.error('Gagal menyimpan paket ke database cloud');
    }
  };

  const handleUpdatePackage = async (pkgId: string, updatedPkg: Partial<PhotoPackage>) => {
    setPackages((prev) => {
      const next = prev.map((p) => (p.id === pkgId ? { ...p, ...updatedPkg } : p));
      try {
        localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await updatePackageInFirestore(pkgId, updatedPkg);
      await logAuditEvent(currentUser?.email || 'Admin', 'Update Paket Foto', `Paket ID ${pkgId} diperbarui.`, 'package');
      toast.success('Paket foto berhasil diperbarui');
    } catch (err) {
      console.warn('Error updating package in Firestore:', err);
      toast.error('Gagal memperbarui paket');
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    setPackages((prev) => {
      const next = prev.filter((p) => p.id !== pkgId);
      try {
        localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await deletePackageFromFirestore(pkgId);
      await logAuditEvent(currentUser?.email || 'Admin', 'Hapus Paket Foto', `Paket ID ${pkgId} dihapus.`, 'package');
      toast.info('Paket foto berhasil dihapus');
    } catch (err) {
      console.warn('Error deleting package in Firestore:', err);
      toast.error('Gagal menghapus paket dari cloud');
    }
  };

  const handleResetPackages = async () => {
    if (confirm('Kembalikan semua paket foto ke daftar default bawaan studio?')) {
      setPackages(PHOTO_PACKAGES);
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(PHOTO_PACKAGES));
      for (const pkg of PHOTO_PACKAGES) {
        try {
          await savePackageToFirestore(pkg);
        } catch {
          // ignore
        }
      }
      toast.info('Katalog paket dikembalikan ke default');
    }
  };

  // Add-on Management Handlers
  const handleAddAddon = async (newAddon: AddOnItem) => {
    setAddons((prev) => {
      const next = [newAddon, ...prev];
      try {
        localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await saveAddonToFirestore(newAddon);
      toast.success('Layanan add-on berhasil ditambahkan', newAddon.name);
    } catch (err) {
      console.warn('Error adding addon to Firestore:', err);
      toast.error('Gagal menyimpan add-on ke database cloud');
    }
  };

  const handleUpdateAddon = async (addonId: string, updated: Partial<AddOnItem>) => {
    setAddons((prev) => {
      const next = prev.map((a) => (a.id === addonId ? { ...a, ...updated } : a));
      try {
        localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await updateAddonInFirestore(addonId, updated);
      toast.success('Layanan add-on berhasil diperbarui');
    } catch (err) {
      console.warn('Error updating addon in Firestore:', err);
      toast.error('Gagal memperbarui add-on');
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    setAddons((prev) => {
      const next = prev.filter((a) => a.id !== addonId);
      try {
        localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await deleteAddonFromFirestore(addonId);
      toast.info('Layanan add-on berhasil dihapus');
    } catch (err) {
      console.warn('Error deleting addon in Firestore:', err);
      toast.error('Gagal menghapus add-on');
    }
  };

  const handleResetAddons = async () => {
    if (confirm('Kembalikan semua layanan add-on ke daftar default bawaan studio?')) {
      setAddons(ADD_ON_SERVICES);
      localStorage.setItem(ADDONS_STORAGE_KEY, JSON.stringify(ADD_ON_SERVICES));
      for (const a of ADD_ON_SERVICES) {
        try {
          await saveAddonToFirestore(a);
        } catch {
          // ignore
        }
      }
      toast.info('Layanan add-on dikembalikan ke default');
    }
  };

  // Portfolio Management Handlers
  const handleAddPortfolio = async (newItem: PortfolioItem) => {
    setPortfolios((prev) => {
      const next = [newItem, ...prev];
      try {
        localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await savePortfolioToFirestore(newItem);
      toast.success('Karya portofolio berhasil ditambahkan', newItem.title);
    } catch (err) {
      console.warn('Error adding portfolio to Firestore:', err);
      toast.error('Gagal menyimpan portofolio ke database cloud');
    }
  };

  const handleUpdatePortfolio = async (id: string, updated: Partial<PortfolioItem>) => {
    let targetItem: PortfolioItem | undefined;
    setPortfolios((prev) => {
      const next = prev.map((item) => {
        if (item.id === id) {
          targetItem = { ...item, ...updated };
          return targetItem;
        }
        return item;
      });
      try {
        localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      if (targetItem) {
        await savePortfolioToFirestore(targetItem);
      } else {
        await updatePortfolioInFirestore(id, updated);
      }
      toast.success('Karya portofolio berhasil diperbarui');
    } catch (err) {
      console.warn('Error updating portfolio in Firestore:', err);
      toast.error('Gagal memperbarui portofolio di cloud');
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    setPortfolios((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    try {
      await deletePortfolioFromFirestore(id);
      toast.info('Karya portofolio berhasil dihapus');
    } catch (err) {
      console.warn('Error deleting portfolio in Firestore:', err);
      toast.error('Gagal menghapus karya portofolio');
    }
  };

  const handleResetPortfolios = async () => {
    if (confirm('Kembalikan semua item portofolio ke galeri default bawaan studio?')) {
      setPortfolios(PORTFOLIO_ITEMS);
      localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(PORTFOLIO_ITEMS));
      for (const item of PORTFOLIO_ITEMS) {
        try {
          await savePortfolioToFirestore(item);
        } catch {
          // ignore
        }
      }
      toast.info('Galeri portofolio dikembalikan ke default');
    }
  };

  // Studio Config Handlers
  const handleUpdateStudioConfig = async (config: StudioConfig) => {
    setStudioConfig(config);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      await saveStudioConfigToFirestore(config);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Update Pengaturan Studio', 'Profil, nomor kontak, atau keamanan studio diperbarui.', 'security');
      toast.success('Pengaturan studio berhasil disimpan!');
    } catch (err) {
      console.error('Error saving studio config:', err);
      toast.error('Gagal menyimpan konfigurasi studio');
    }
  };

  // Staff Handlers
  const handleAddStaff = async (staff: AdminStaff) => {
    setStaffList((prev) => [staff, ...prev]);
    try {
      await saveStaffToFirestore(staff);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Tambah Staf Admin', `Staf baru ${staff.name} (${staff.role}) didaftarkan.`, 'staff');
      toast.success('Staf admin berhasil ditambahkan', staff.name);
    } catch (err) {
      console.error('Error adding staff:', err);
      toast.error('Gagal mendaftarkan staf admin');
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<AdminStaff>) => {
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    try {
      await updateStaffInFirestore(id, updates);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Update Data Staf', `Data staf ID ${id} diperbarui.`, 'staff');
      toast.success('Data staf berhasil diperbarui');
    } catch (err) {
      console.error('Error updating staff:', err);
      toast.error('Gagal memperbarui staf');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteStaffFromFirestore(id);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Hapus Staf Admin', `Staf ID ${id} telah dinonaktifkan/dihapus.`, 'staff');
      toast.info('Staf admin berhasil dinonaktifkan/dihapus');
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error('Gagal menghapus staf');
    }
  };

  // Backup & Restore Handlers
  const handleRestoreAllData = async (data: any) => {
    if (data.orders && Array.isArray(data.orders)) {
      setOrders(data.orders);
      for (const ord of data.orders) {
        try {
          await saveBookingToFirestore(ord);
        } catch {}
      }
    }
    if (data.packages && Array.isArray(data.packages)) {
      setPackages(data.packages);
      for (const p of data.packages) {
        try {
          await savePackageToFirestore(p);
        } catch {}
      }
    }
    if (data.addons && Array.isArray(data.addons)) {
      setAddons(data.addons);
      for (const a of data.addons) {
        try {
          await saveAddonToFirestore(a);
        } catch {}
      }
    }
    if (data.portfolios && Array.isArray(data.portfolios)) {
      setPortfolios(data.portfolios);
      for (const pf of data.portfolios) {
        try {
          await savePortfolioToFirestore(pf);
        } catch {}
      }
    }
    if (data.studioConfig) {
      setStudioConfig(data.studioConfig);
      try {
        await saveStudioConfigToFirestore(data.studioConfig);
      } catch {}
    }
    await logAuditEvent(currentUser?.email || 'Master Admin', 'Restore Database', 'Database sistem dipulihkan dari file backup.', 'system');
    toast.success('Database berhasil dipulihkan dari file backup!');
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.user?.email) {
        const email = res.user.email.toLowerCase();
        const isMaster =
          email === STUDIO_ADMIN_EMAIL.toLowerCase() ||
          email.includes('dimensi') ||
          staffList.some((s) => s.email.toLowerCase() === email && s.role === 'master' && s.status === 'active');
        const isStaff = staffList.some((s) => s.email.toLowerCase() === email && s.status === 'active');

        if (isMaster) {
          handleAdminAuthenticated(true);
        } else if (isStaff) {
          handleAdminAuthenticated(false);
        }
      }
      return res;
    } catch (err) {
      console.error('Google login error:', err);
      throw err;
    }
  };

  const handleLogOut = async () => {
    try {
      await logOut();
      setIsAdminSession(false);
      setIsMasterAdminSession(false);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem(MASTER_SESSION_KEY);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans selection:bg-[#D4AF37] selection:text-black antialiased">
      
      {/* Sticky Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        orderCount={orders.length}
        onOpenBooking={handleOpenBooking}
        currentUser={currentUser}
        isAdminAuthenticated={isAdminAuthenticated}
        isMasterAdmin={isMasterAdminSession || isGoogleAdminEmail}
        onGoogleSignIn={handleGoogleSignIn}
        onLogOut={handleLogOut}
        isFirebaseConnected={isFirebaseConnected}
        studioConfig={studioConfig}
        onExitAdmin={handleExitAdmin}
      />

      {/* Main View Switching */}
      <main>
        {activeTab === 'showcase' && (
          <>
            {/* Promotional Hero */}
            <Hero
              onOpenBooking={handleOpenBooking}
              onSelectPackageFilter={(cat) => setSelectedCategory(cat as CategoryType)}
              studioConfig={studioConfig}
            />

            {/* Package Catalog & Pricing */}
            <PackageCatalog
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectPackageForBooking={handleSelectPackageForBooking}
              packages={packages}
              studioConfig={studioConfig}
            />

            {/* Interactive Addons & Price Calculator */}
            <AddonsCalculator
              onProceedWithConfig={handleProceedWithCalculator}
              packages={packages}
              addons={addons}
            />

            {/* Visual Portfolio Gallery */}
            <PortfolioGallery portfolios={portfolios} />

            {/* Booking & Registration Form */}
            <BookingForm
              initialPackageId={bookingPackageId}
              initialAddOnIds={bookingAddOnIds}
              onOrderCreated={handleOrderCreated}
              packages={packages}
              addons={addons}
              existingOrders={orders}
            />

            {/* Testimonials & FAQs */}
            <TestimonialsFAQ orders={orders} reviews={reviews} />
          </>
        )}

        {activeTab === 'customer-portal' && (
          /* Dedicated Regular User / Customer Order Tracker Portal */
          <CustomerPortal
            orders={orders}
            currentUser={currentUser}
            onGoToBooking={handleOpenBooking}
            studioConfig={studioConfig}
            onUpdateOrder={handleUpdateOrder}
          />
        )}

        {activeTab === 'admin' && (
          /* Admin View: Guarded by AdminGate if not authenticated */
          isAdminAuthenticated ? (
            <ConsumerDashboard
              reviews={reviews}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateOrder={handleUpdateOrder}
              onDeleteReview={handleDeleteReview}
              onDeleteOrder={handleDeleteOrder}
              onAddManualOrder={handleAddManualOrder}
              onResetData={handleResetData}
              packages={packages}
              onAddPackage={handleAddPackage}
              onUpdatePackage={handleUpdatePackage}
              onDeletePackage={handleDeletePackage}
              onResetPackages={handleResetPackages}
              addons={addons}
              onAddAddon={handleAddAddon}
              onUpdateAddon={handleUpdateAddon}
              onDeleteAddon={handleDeleteAddon}
              onResetAddons={handleResetAddons}
              portfolios={portfolios}
              onAddPortfolio={handleAddPortfolio}
              onUpdatePortfolio={handleUpdatePortfolio}
              onDeletePortfolio={handleDeletePortfolio}
              onResetPortfolios={handleResetPortfolios}
              currentUser={currentUser}
              onGoogleSignIn={handleGoogleSignIn}
              onLogOut={handleLogOut}
              isFirebaseConnected={isFirebaseConnected}
              onExitAdmin={handleExitAdmin}
              isMasterAdmin={isMasterAdmin}
              studioConfig={studioConfig}
              onUpdateStudioConfig={handleUpdateStudioConfig}
              staffList={staffList}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
              auditLogs={auditLogs}
              onRestoreAllData={handleRestoreAllData}
            />
          ) : (
            <AdminGate
              onAdminAuthenticated={handleAdminAuthenticated}
              onBackToCustomer={() => setActiveTab('showcase')}
              currentUser={currentUser}
              isAdminEmail={isGoogleAdminEmail || isStaffAdminUser}
              isMasterEmail={isGoogleAdminEmail || isMasterStaffUser}
              studioConfig={studioConfig}
              staffList={staffList}
            />
          )
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={handleOpenBooking}
        onOpenAdmin={() => {
          setActiveTab('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        studioConfig={studioConfig}
      />

      {/* Digital Receipt / Booking Confirmation Modal */}
      <BookingSuccessModal
        order={latestCreatedOrder}
        onClose={() => setLatestCreatedOrder(null)}
        studioConfig={studioConfig}
      />

    </div>
  );
}

