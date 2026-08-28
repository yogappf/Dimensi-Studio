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

  // Listen to Realtime Bookings from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToBookings(
      (firestoreOrders) => {
        if (firestoreOrders && firestoreOrders.length > 0) {
          setOrders(firestoreOrders);
          setIsFirebaseConnected(true);
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
    } catch (err) {
      console.error('Error saving order to Firestore:', err);
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
  };

  // Admin order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );

    try {
      await updateBookingInFirestore(orderId, { status: newStatus });
      await logAuditEvent(
        currentUser?.email || 'Admin',
        'Update Status Pesanan',
        `Pesanan ${orderId} diubah menjadi: ${newStatus}`,
        'order'
      );
    } catch (err) {
      console.error('Error updating order status in Firestore:', err);
    }
  };

  // Admin order generic update (e.g., Drive folder URL, dates, notes)
  const handleUpdateOrder = async (orderId: string, updates: Partial<BookingOrder>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
    );

    try {
      await updateBookingInFirestore(orderId, updates);
    } catch (err) {
      console.error('Error updating order in Firestore:', err);
    }
  };

  // Admin delete order
  const handleDeleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    try {
      await deleteBookingFromFirestore(orderId);
      await logAuditEvent(currentUser?.email || 'Admin', 'Hapus Pesanan', `Pesanan ${orderId} telah dihapus.`, 'order');
    } catch (err) {
      console.error('Error deleting order in Firestore:', err);
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
    } catch (err) {
      console.error('Error adding manual order to Firestore:', err);
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
    }
  };

  // Package Management Handlers
  const handleAddPackage = async (newPkg: PhotoPackage) => {
    setPackages((prev) => [newPkg, ...prev]);
    try {
      await savePackageToFirestore(newPkg);
      await logAuditEvent(currentUser?.email || 'Admin', 'Tambah Paket Foto', `Paket "${newPkg.name}" ditambahkan.`, 'package');
    } catch (err) {
      console.error('Error adding package to Firestore:', err);
    }
  };

  const handleUpdatePackage = async (pkgId: string, updatedPkg: Partial<PhotoPackage>) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === pkgId ? { ...p, ...updatedPkg } : p))
    );
    try {
      await updatePackageInFirestore(pkgId, updatedPkg);
      await logAuditEvent(currentUser?.email || 'Admin', 'Update Paket Foto', `Paket ID ${pkgId} diperbarui.`, 'package');
    } catch (err) {
      console.error('Error updating package in Firestore:', err);
    }
  };

  const handleDeletePackage = async (pkgId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== pkgId));
    try {
      await deletePackageFromFirestore(pkgId);
      await logAuditEvent(currentUser?.email || 'Admin', 'Hapus Paket Foto', `Paket ID ${pkgId} dihapus.`, 'package');
    } catch (err) {
      console.error('Error deleting package in Firestore:', err);
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
    }
  };

  // Add-on Management Handlers
  const handleAddAddon = async (newAddon: AddOnItem) => {
    setAddons((prev) => [newAddon, ...prev]);
    try {
      await saveAddonToFirestore(newAddon);
    } catch (err) {
      console.error('Error adding addon to Firestore:', err);
    }
  };

  const handleUpdateAddon = async (addonId: string, updated: Partial<AddOnItem>) => {
    setAddons((prev) =>
      prev.map((a) => (a.id === addonId ? { ...a, ...updated } : a))
    );
    try {
      await updateAddonInFirestore(addonId, updated);
    } catch (err) {
      console.error('Error updating addon in Firestore:', err);
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    setAddons((prev) => prev.filter((a) => a.id !== addonId));
    try {
      await deleteAddonFromFirestore(addonId);
    } catch (err) {
      console.error('Error deleting addon in Firestore:', err);
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
    }
  };

  // Portfolio Management Handlers
  const handleAddPortfolio = async (newItem: PortfolioItem) => {
    setPortfolios((prev) => [newItem, ...prev]);
    try {
      await savePortfolioToFirestore(newItem);
    } catch (err) {
      console.error('Error adding portfolio to Firestore:', err);
    }
  };

  const handleUpdatePortfolio = async (id: string, updated: Partial<PortfolioItem>) => {
    setPortfolios((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
    try {
      await updatePortfolioInFirestore(id, updated);
    } catch (err) {
      console.error('Error updating portfolio in Firestore:', err);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    setPortfolios((prev) => prev.filter((item) => item.id !== id));
    try {
      await deletePortfolioFromFirestore(id);
    } catch (err) {
      console.error('Error deleting portfolio in Firestore:', err);
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
    }
  };

  // Studio Config Handlers
  const handleUpdateStudioConfig = async (config: StudioConfig) => {
    setStudioConfig(config);
    try {
      await saveStudioConfigToFirestore(config);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Update Pengaturan Studio', 'Profil, nomor kontak, atau keamanan studio diperbarui.', 'security');
    } catch (err) {
      console.error('Error saving studio config:', err);
    }
  };

  // Staff Handlers
  const handleAddStaff = async (staff: AdminStaff) => {
    setStaffList((prev) => [staff, ...prev]);
    try {
      await saveStaffToFirestore(staff);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Tambah Staf Admin', `Staf baru ${staff.name} (${staff.role}) didaftarkan.`, 'staff');
    } catch (err) {
      console.error('Error adding staff:', err);
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<AdminStaff>) => {
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    try {
      await updateStaffInFirestore(id, updates);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Update Data Staf', `Data staf ID ${id} diperbarui.`, 'staff');
    } catch (err) {
      console.error('Error updating staff:', err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteStaffFromFirestore(id);
      await logAuditEvent(currentUser?.email || 'Master Admin', 'Hapus Staf Admin', `Staf ID ${id} telah dinonaktifkan/dihapus.`, 'staff');
    } catch (err) {
      console.error('Error deleting staff:', err);
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
      />

      {/* Main View Switching */}
      <main>
        {activeTab === 'showcase' && (
          <>
            {/* Promotional Hero */}
            <Hero
              onOpenBooking={handleOpenBooking}
              onSelectPackageFilter={(cat) => setSelectedCategory(cat as CategoryType)}
            />

            {/* Package Catalog & Pricing */}
            <PackageCatalog
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectPackageForBooking={handleSelectPackageForBooking}
              packages={packages}
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
            />

            {/* Testimonials & FAQs */}
            <TestimonialsFAQ />
          </>
        )}

        {activeTab === 'customer-portal' && (
          /* Dedicated Regular User / Customer Order Tracker Portal */
          <CustomerPortal
            orders={orders}
            currentUser={currentUser}
            onGoToBooking={handleOpenBooking}
          />
        )}

        {activeTab === 'admin' && (
          /* Admin View: Guarded by AdminGate if not authenticated */
          isAdminAuthenticated ? (
            <ConsumerDashboard
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateOrder={handleUpdateOrder}
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
      />

      {/* Digital Receipt / Booking Confirmation Modal */}
      <BookingSuccessModal
        order={latestCreatedOrder}
        onClose={() => setLatestCreatedOrder(null)}
      />

    </div>
  );
}

