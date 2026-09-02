import { PhotoPackage, AddOnItem, BookingOrder, PortfolioItem } from '../types';

export const PHOTO_PACKAGES: PhotoPackage[] = [
  {
    id: 'pkg-wedding-royal',
    name: 'Paket Wedding Royal Eternity',
    category: 'wedding',
    tagline: 'Dokumentasi momen sakral pernikahan lengkap dan berkelas',
    price: 4500000,
    originalPrice: 5500000,
    duration: 'Full Day (Hingga 10 Jam)',
    popular: true,
    features: [
      '2 Fotografer Utama & 1 Asisten Lighting',
      '1 Videografer Cinematic + Teaser Reels 60s',
      'Liputan Akad Nikah, Resepsi & Sesi Keluarga',
      'Unlimited Photoshoots & All Raw Files',
      'Grading Tone Warna Eksklusif Dimensi Signature'
    ],
    deliverables: [
      '1 Album Kolase Magnetik 20x30cm (22 Hal)',
      '1 Cetak Pembesaran 40x60cm + Frame Minimalis',
      'Flashdisk Kayu Custom Box 64GB',
      'Link Google Drive High-Resolution Active 1 Tahun',
      'Video Cinematic 3-5 Menit (Full HD 4K)'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Pernikahan Akad & Resepsi Gedung / Rumah'
  },
  {
    id: 'pkg-wedding-intimate',
    name: 'Paket Wedding Akad Intimate',
    category: 'wedding',
    tagline: 'Pilihan pas untuk momen akad dan syukuran keluarga hangat',
    price: 2400000,
    originalPrice: 2900000,
    duration: '4-5 Jam Liputan',
    popular: false,
    features: [
      '1 Fotografer Senior + 1 Crew Support',
      'Liputan Prosesi Ijab Qabul & Sungkeman',
      'Sesi Foto Couple Pengantin Eksklusif',
      'Foto Keluarga Inti & Tamu',
      'Color Grading 70+ Foto Terpilih'
    ],
    deliverables: [
      '1 Album Mini Magazine 20x25cm (16 Hal)',
      '1 Cetak 30x45cm + Frame Kayu Solid',
      'Semua File Mentah & Edited di Google Drive',
      'Flashdisk 32GB'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Akad Nikah, Pemberkatan, atau Resepsi Intimate'
  },
  {
    id: 'pkg-prewed-romance',
    name: 'Paket Pre-Wedding Cinematic Romance',
    category: 'prewedding',
    tagline: 'Kisah cinta visual dengan konsep outdoor memukau',
    price: 1950000,
    originalPrice: 2500000,
    duration: '4 Jam Sesi (2 Lokasi / 2 Kostum)',
    popular: true,
    features: [
      '1 Fotografer Konseptual + 1 Lighting Assistant',
      'Bebas Konsultasi Moodboard & Pemilihan Outfit',
      '30 Foto Best Retouched & Fine Skin Tone',
      'All Unedited Master Files Provided',
      'Bonus Video Teaser TikTok/Instagram Reel 30 Detik'
    ],
    deliverables: [
      '2 Cetak 30x40cm + Frame Eksklusif untuk Welcome Sign',
      'Link Cloud Private Gallery',
      'USB Flashdisk Box'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Pasangan Menjelang Pernikahan (Indoor / Outdoor)'
  },
  {
    id: 'pkg-wisuda-premium',
    name: 'Paket Wisuda & Kelulusan Prestisius',
    category: 'wisuda',
    tagline: 'Rayakan pencapaian sarjana dengan potret elegan berkesan',
    price: 650000,
    originalPrice: 850000,
    duration: '60 Menit Sesi Studio / Kampus',
    popular: true,
    features: [
      'Sesi Foto Wisudawan + Maksimal 6 Anggota Keluarga',
      'Unlimited Poses & Penggunaan Properti Toga / Balon',
      '15 Foto Edit Halus (Retouch Wajah & Warna)',
      'Semua File Original Diberikan Hari H'
    ],
    deliverables: [
      '1 Cetak 12R (30x40cm) + Frame Modern',
      '4 Cetak 4R Foto Pilihan',
      'Akses Link Download High-Res Cepat'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Wisuda Individu, Pasangan, atau Bersama Keluarga'
  },
  {
    id: 'pkg-wisuda-group',
    name: 'Paket Wisuda Sahabat / Geng (Group)',
    category: 'wisuda',
    tagline: 'Abadikan persahabatan kampus sebelum melangkah ke masa depan',
    price: 1100000,
    originalPrice: 1400000,
    duration: '90 Menit Sesi (Hingga 10 Orang)',
    popular: false,
    features: [
      'Bebas Foto Grup & Foto Masing-masing Personal',
      '2 Background Pilihan di Studio atau Spot Outdoor Kampus',
      '25 Foto Edit Retouch Eksklusif',
      'Semua Soft Files HD'
    ],
    deliverables: [
      'Cetak 10 Lembar 5R untuk Seluruh Anggota',
      '1 Cetak 12R Frame untuk Kolektif',
      'Google Drive Folder Bersama'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Grup Mahasiswa, Sahabat, dan Teman Seangkatan'
  },
  {
    id: 'pkg-keluarga-warmth',
    name: 'Paket Foto Keluarga & Maternity Harmony',
    category: 'keluarga',
    tagline: 'Kehangatan keluarga dan momen kehamilan dalam bingkai abadi',
    price: 850000,
    originalPrice: 1100000,
    duration: '75 Menit Sesi Studio Nyaman',
    popular: false,
    features: [
      'Kapasitas hingga 8 Anggota Keluarga (Termasuk Anak & Kakek/Nenek)',
      'Pilihan Tema Casual, Etnik, atau Gaun Maternity',
      'Studio Full AC, Nyaman untuk Balita dan Ibu Hamil',
      '20 Foto Edit Pilihan Klien'
    ],
    deliverables: [
      '1 Cetak Kanvas Mini 30x45cm Berbingkai Mewah',
      'Album Mini Hardcover 10 Halaman',
      'Semua Soft Copy Asli & Edit dikirim via Cloud'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581953153629-9e87bb363a03?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Foto Keluarga Besar, Balita / Bayi, & Maternity Shoot'
  },
  {
    id: 'pkg-engagement-special',
    name: 'Paket Engagement & Lamaran Elegance',
    category: 'engagement',
    tagline: 'Dokumentasi sakral pengikatan janji suci lamaran penuh kehangatan',
    price: 1750000,
    originalPrice: 2200000,
    duration: '3-4 Jam Sesi Liputan',
    popular: true,
    features: [
      '1 Fotografer Utama + 1 Asisten Lighting',
      'Liputan Prosesi Seserahan & Tukar Cincin',
      'Mini Sesi Couple Pasangan & Foto Keluarga',
      'Grading Warna Eksklusif Dimensi Signature',
      'Semua File Master High-Resolution'
    ],
    deliverables: [
      '1 Album Mini Magazine 20x25cm (16 Hal)',
      '1 Cetak 30x45cm + Frame Minimalis',
      'Link Google Drive Gallery Aktif 1 Tahun'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Acara Lamaran & Pertunangan (Rumah / Restoran / Venue)'
  },
  {
    id: 'pkg-siraman-sacred',
    name: 'Paket Tradisi Siraman & Pengajian Khidmat',
    category: 'siraman',
    tagline: 'Mengabadikan kesucian prosesi adat siraman & doa pengajian',
    price: 1850000,
    originalPrice: 2300000,
    duration: '4 Jam Sesi Liputan',
    popular: false,
    features: [
      '1 Fotografer Senior Berpengalaman Adat',
      'Liputan Khidmat Pengajian, Sungkeman & Guyuran Siraman',
      'Detail Foto Roncean Melati, Air Bunga & Dekorasi Tradisional',
      '30 Foto Best Retouched Skin & Tone',
      'All Raw Files High Resolution'
    ],
    deliverables: [
      '1 Album Kolase Hardcover 20x30cm',
      '1 Cetak Pembesaran 30x40cm + Frame Kayu',
      'Link Cloud Private Download Cepat'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Prosesi Adat Siraman, Pengajian, & Midodareni'
  },
  {
    id: 'pkg-birthday-celebration',
    name: 'Paket Ulang Tahun & Sweet 17 Joyful',
    category: 'ulangtahun',
    tagline: 'Rayakan pertambahan usia dengan dokumentasi penuh keceriaan',
    price: 1350000,
    originalPrice: 1700000,
    duration: '3 Jam Sesi Acara',
    popular: false,
    features: [
      '1 Fotografer Profesional + Lensa Portrait & Wide',
      'Liputan Momen Tiup Lilin, Potong Kue, & Games',
      'Sesi Foto Personal Birthday Person & Teman/Keluarga',
      '50 Foto Edited Vibrant Tone',
      'Semua Foto Master Diberikan'
    ],
    deliverables: [
      '1 Cetak 30x40cm + Frame Modern',
      'Link Google Drive High-Res Selamanya',
      'Bonus 10 Sneak Peek Foto Siap Upload Sosmed'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Ulang Tahun Anak, Sweet 17th, & Pesta Dewasa'
  },
  {
    id: 'pkg-event-gathering',
    name: 'Paket Dokumentasi Event & Corporate Gathering',
    category: 'event',
    tagline: 'Rekam kemeriahan konser, seminar, reuni, dan acara kantor',
    price: 2200000,
    originalPrice: 2700000,
    duration: '5 Jam Durasi Acara',
    popular: false,
    features: [
      '1 Fotografer Event Gerak Cepat + Lensa Tele & Wide Pro',
      'Dokumentasi Pembicara, Peserta, Suasana & Detail Acara',
      'Real-time Sneak Peek 10 Foto dalam 2 Jam untuk Kebutuhan Sosmed',
      'Ratusan Foto Momen Spontan Candid & Formal'
    ],
    deliverables: [
      'Semua Foto Lengkap (High Resolution)',
      'Highlight 50 Foto Best Tone',
      'Link Download Cloud Aktif Selamanya'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    recommendedFor: 'Ulang Tahun, Seminar, Peresmian Kantor, Reuni'
  }
];

export const ADD_ON_SERVICES: AddOnItem[] = [
  {
    id: 'addon-drone',
    name: 'Drone Aerial Photography & 4K Video',
    price: 600000,
    description: 'Sudut pandang sinematik udara dari ketinggian oleh pilot bersertifikat'
  },
  {
    id: 'addon-photographer-extra',
    name: 'Ekstra 1 Fotografer Tambahan',
    price: 750000,
    description: 'Lebih banyak sudut pandang candid dan liputan tamu tanpa ada yang terlewat'
  },
  {
    id: 'addon-mua',
    name: 'Make Up Artist (MUA) & Hairdo Profesional',
    price: 450000,
    description: 'Riasan flawless tahan lama untuk sesi foto studio / outdoor'
  },
  {
    id: 'addon-express-edit',
    name: 'Layanan Express Editing (24 Jam Selesai)',
    price: 300000,
    description: 'Hasil edit prioritas selesai dalam 1 hari kerja untuk kebutuhan mendesak'
  },
  {
    id: 'addon-canvas-extra',
    name: 'Tambahan Cetak Kanvas 50x70cm + Frame Gold/Hitam',
    price: 350000,
    description: 'Cetak kanvas bertekstur mewah tahan luntur hingga puluhan tahun'
  },
  {
    id: 'addon-wooden-box',
    name: 'Kotak Kayu Jati Custom Gravir Nama + Flashdisk 64GB',
    price: 250000,
    description: 'Souvenir kenang-kenangan fisik eksklusif berukir nama pasangan/keluarga'
  }
];

export const INITIAL_CLIENT_ORDERS: BookingOrder[] = [
  {
    id: 'DMS-2026-0801',
    createdAt: '2026-08-18T10:15:00.000Z',
    clientName: 'Aditya Pratama & Rania Putri',
    phone: '081234567890',
    email: 'aditya.pratama@gmail.com',
    packageId: 'pkg-wedding-royal',
    packageName: 'Paket Wedding Royal Eternity',
    packagePrice: 4500000,
    addOnIds: ['addon-drone', 'addon-wooden-box'],
    addOnsText: 'Drone Aerial Photography & 4K Video, Kotak Kayu Jati Custom Gravir Nama + Flashdisk 64GB',
    addOnsTotal: 850000,
    totalPrice: 5350000,
    sessionDate: '2026-09-12',
    sessionTime: '08:00 WIB',
    locationType: 'venue',
    locationAddress: 'Grand Ballroom Hotel Santika Premiere, Jakarta Barat',
    notes: 'Mohon fokus lebih banyak pada foto sungkeman adat Jawa dan candid interaksi tamu.',
    status: 'Terkonfirmasi & Terjadwal',
    paymentPreference: 'DP 50%'
  },
  {
    id: 'DMS-2026-0802',
    createdAt: '2026-08-19T14:30:00.000Z',
    clientName: 'Siti Nurhaliza',
    phone: '085712349988',
    email: 'siti.nurhaliza.ui@gmail.com',
    packageId: 'pkg-wisuda-premium',
    packageName: 'Paket Wisuda & Kelulusan Prestisius',
    packagePrice: 650000,
    addOnIds: ['addon-mua'],
    addOnsText: 'Make Up Artist (MUA) & Hairdo Profesional',
    addOnsTotal: 450000,
    totalPrice: 1100000,
    sessionDate: '2026-08-28',
    sessionTime: '13:30 WIB',
    locationType: 'studio',
    locationAddress: 'Dimensi Photo Studio (Studio 1 Main Area)',
    notes: 'Foto bersama orang tua dan adik. Ingin tema background beige aesthetic.',
    status: 'Terkonfirmasi & Terjadwal',
    paymentPreference: 'Lunas'
  },
  {
    id: 'DMS-2026-0803',
    createdAt: '2026-08-20T09:00:00.000Z',
    clientName: 'Ferry Hendrawan (Kopi Kenangan Senja)',
    phone: '081398765432',
    email: 'ferry.coffee@business.co.id',
    packageId: 'pkg-produk-commercial',
    packageName: 'Paket Foto Produk & Katalog UMKM / Brand',
    packagePrice: 1200000,
    addOnIds: ['addon-express-edit'],
    addOnsText: 'Layanan Express Editing (24 Jam Selesai)',
    addOnsTotal: 300000,
    totalPrice: 1500000,
    sessionDate: '2026-08-25',
    sessionTime: '10:00 WIB',
    locationType: 'studio',
    locationAddress: 'Dimensi Studio - Tabletop Setup',
    notes: 'Produk cold brew botol kaca 6 varian rasa & biji kopi roasted dalam pouch hitam.',
    status: 'Proses Editing',
    paymentPreference: 'DP 50%'
  },
  {
    id: 'DMS-2026-0804',
    createdAt: '2026-08-20T16:45:00.000Z',
    clientName: 'Bagas Wicaksono & Clarissa',
    phone: '082199887766',
    email: 'bagas.clarissa@yahoo.com',
    packageId: 'pkg-prewed-romance',
    packageName: 'Paket Pre-Wedding Cinematic Romance',
    packagePrice: 1950000,
    addOnIds: ['addon-canvas-extra'],
    addOnsText: 'Tambahan Cetak Kanvas 50x70cm + Frame Gold/Hitam',
    addOnsTotal: 350000,
    totalPrice: 2300000,
    sessionDate: '2026-09-05',
    sessionTime: '15:30 WIB (Golden Hour)',
    locationType: 'outdoor',
    locationAddress: 'Pantai Indah Kapuk 2 (Mangrove & Urban Spot)',
    notes: 'Kostum pertama casual monokrom, kostum kedua semi formal dress.',
    status: 'Menunggu Konfirmasi',
    paymentPreference: 'DP 30%'
  },
  {
    id: 'DMS-2026-0805',
    createdAt: '2026-08-16T11:20:00.000Z',
    clientName: 'Dr. Hendra Gunawan Sp.A',
    phone: '08118822334',
    email: 'hendra.gunawan@medikahospital.com',
    packageId: 'pkg-keluarga-warmth',
    packageName: 'Paket Foto Keluarga & Maternity Harmony',
    packagePrice: 850000,
    addOnIds: [],
    addOnsText: 'Tidak ada',
    addOnsTotal: 0,
    totalPrice: 850000,
    sessionDate: '2026-08-17',
    sessionTime: '11:00 WIB',
    locationType: 'studio',
    locationAddress: 'Dimensi Studio - Family Living Room Set',
    notes: 'Ulang tahun pernikahan ke-10 bersama 3 anak.',
    status: 'Selesai',
    paymentPreference: 'Lunas'
  }
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'The Royal Heritage Wedding of Reza & Dinda',
    category: 'wedding',
    categoryName: 'Pernikahan',
    location: 'Dharmawangsa Jakarta',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    description: 'Nuansa sakral adat Jawa modern berpadu pencahayaan hangat romantis.'
  },
  {
    id: 'port-2',
    title: 'Golden Hour Pre-Wedding in Pine Forest',
    category: 'prewedding',
    categoryName: 'Pre-Wedding',
    location: 'Hutan Pinus Cikole, Bandung',
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
    description: 'Siluet cahaya senja dan sentuhan sinematik alami tanpa berlebihan.'
  },
  {
    id: 'port-3',
    title: 'Honor & Glory Graduation Day',
    category: 'wisuda',
    categoryName: 'Wisuda',
    location: 'Dimensi Studio 1',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    description: 'Potret kelulusan sarjana dengan pencahayaan studio tajam dan berkarakter.'
  },
  {
    id: 'port-4',
    title: 'Sweet Family & New Born Maternity',
    category: 'keluarga',
    categoryName: 'Keluarga & Ibu Hamil',
    location: 'Dimensi Studio 2 Warm Set',
    imageUrl: 'https://images.unsplash.com/photo-1581953153629-9e87bb363a03?auto=format&fit=crop&w=1200&q=80',
    description: 'Potret penuh kasih keluarga menyambut kelahiran buah hati pertama.'
  },
  {
    id: 'port-5',
    title: 'Joyful Sweet 17th & Birthday Bash',
    category: 'ulangtahun',
    categoryName: 'Ulang Tahun',
    location: 'Dimensi Studio & Outdoor Garden',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    description: 'Dokumentasi perayaan ulang tahun penuh tawa, dekorasi ceria, dan candid emosional.'
  },
  {
    id: 'port-6',
    title: 'Intimate Engagement of Dimas & Sarah',
    category: 'engagement',
    categoryName: 'Engagement',
    location: 'Plataran Dharmawangsa',
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    description: 'Momen sakral penyematan cincin tunangan dengan balutan adat modern.'
  },
  {
    id: 'port-7',
    title: 'Prosesi Adat Siraman & Pengajian Khidmat',
    category: 'siraman',
    categoryName: 'Siraman',
    location: 'Kediaman Mempelai, Jakarta',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    description: 'Kesakralan doa restu orang tua dan guyuran air tujuh sumber melati.'
  },
  {
    id: 'port-8',
    title: 'Tech Summit & Gala Dinner Annual Night',
    category: 'event',
    categoryName: 'Dokumentasi Acara',
    location: 'Ritz-Carlton Pacific Place',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description: 'Liputan dinamis menangkap antusiasme peserta dan atmosfer panggung megah.'
  }
];

export const STUDIO_INFO = {
  name: 'Dimensi Fotografi Studio',
  tagline: 'Abadikan Keajaiban Momen Terbaik Anda Bersama Kami',
  description: 'Studio fotografi profesional berbasis di Indonesia yang melayani dokumentasi pernikahan, engagement, siraman, pre-wedding sinematik, wisuda, keluarga, ulang tahun, dan acara bergengsi dengan peralatan terdepan dan sentuhan visual berkelas.',
  phone: '0821-2345-6789',
  whatsapp: '6282123456789',
  email: 'dimensi.idphoto@gmail.com',
  instagram: '@dimensi_id_',
  instagramUrl: 'https://www.instagram.com/dimensi_id_?igsh=YWtmMWF0aWVhemUy',
  tiktok: '@dimensi.id',
  tiktokUrl: 'https://www.tiktok.com/@dimensi.id?_t=ZS-8xf3ifhaDn5&_r=1',
  address: 'Jl. Melati Indah No. 45, Studio Dimensi Visual, Kebayoran Baru, Jakarta Selatan',
  operatingHours: 'Setiap Hari: 08:30 - 20:00 WIB (Reservasi Diperlukan)',
};
