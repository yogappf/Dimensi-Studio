import { BankAccountItem, StudioConfig } from '../types';

export interface BankPreset {
  code: string;
  name: string;
  shortName: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  accentColor: string;
  defaultPlaceholder: string;
}

export const INDONESIAN_BANK_PRESETS: BankPreset[] = [
  {
    code: 'BCA',
    name: 'Bank Central Asia (BCA)',
    shortName: 'BCA',
    badgeBg: 'bg-blue-600',
    badgeBorder: 'border-blue-400',
    textColor: 'text-blue-300',
    accentColor: 'border-blue-500',
    defaultPlaceholder: 'Contoh: 8720-1928-33',
  },
  {
    code: 'MANDIRI',
    name: 'Bank Mandiri',
    shortName: 'Mandiri',
    badgeBg: 'bg-amber-600',
    badgeBorder: 'border-amber-400',
    textColor: 'text-amber-300',
    accentColor: 'border-amber-500',
    defaultPlaceholder: 'Contoh: 137-00-1928374-1',
  },
  {
    code: 'BRI',
    name: 'Bank Rakyat Indonesia (BRI)',
    shortName: 'BRI',
    badgeBg: 'bg-sky-600',
    badgeBorder: 'border-sky-400',
    textColor: 'text-sky-300',
    accentColor: 'border-sky-500',
    defaultPlaceholder: 'Contoh: 0341-01-002938-50-8',
  },
  {
    code: 'BNI',
    name: 'Bank Negara Indonesia (BNI)',
    shortName: 'BNI',
    badgeBg: 'bg-orange-600',
    badgeBorder: 'border-orange-400',
    textColor: 'text-orange-300',
    accentColor: 'border-orange-500',
    defaultPlaceholder: 'Contoh: 0987-6543-210',
  },
  {
    code: 'BSI',
    name: 'Bank Syariah Indonesia (BSI)',
    shortName: 'BSI',
    badgeBg: 'bg-emerald-600',
    badgeBorder: 'border-emerald-400',
    textColor: 'text-emerald-300',
    accentColor: 'border-emerald-500',
    defaultPlaceholder: 'Contoh: 7123-4567-89',
  },
  {
    code: 'CIMB',
    name: 'Bank CIMB Niaga',
    shortName: 'CIMB Niaga',
    badgeBg: 'bg-red-700',
    badgeBorder: 'border-red-500',
    textColor: 'text-red-300',
    accentColor: 'border-red-600',
    defaultPlaceholder: 'Contoh: 800-12-34567-00',
  },
  {
    code: 'PERMATA',
    name: 'Bank Permata',
    shortName: 'Permata',
    badgeBg: 'bg-teal-600',
    badgeBorder: 'border-teal-400',
    textColor: 'text-teal-300',
    accentColor: 'border-teal-500',
    defaultPlaceholder: 'Contoh: 012-3456-789',
  },
  {
    code: 'DANAMON',
    name: 'Bank Danamon',
    shortName: 'Danamon',
    badgeBg: 'bg-amber-500',
    badgeBorder: 'border-amber-300',
    textColor: 'text-amber-200',
    accentColor: 'border-amber-400',
    defaultPlaceholder: 'Contoh: 003-512-345-67',
  },
  {
    code: 'BTN',
    name: 'Bank Tabungan Negara (BTN)',
    shortName: 'BTN',
    badgeBg: 'bg-blue-800',
    badgeBorder: 'border-blue-500',
    textColor: 'text-blue-200',
    accentColor: 'border-blue-600',
    defaultPlaceholder: 'Contoh: 0001-501-50-012345',
  },
  {
    code: 'JAGO',
    name: 'Bank Jago',
    shortName: 'Bank Jago',
    badgeBg: 'bg-purple-600',
    badgeBorder: 'border-purple-400',
    textColor: 'text-purple-300',
    accentColor: 'border-purple-500',
    defaultPlaceholder: 'Contoh: 1029-3847-5612',
  },
  {
    code: 'SEABANK',
    name: 'SeaBank Indonesia',
    shortName: 'SeaBank',
    badgeBg: 'bg-orange-500',
    badgeBorder: 'border-orange-300',
    textColor: 'text-orange-200',
    accentColor: 'border-orange-400',
    defaultPlaceholder: 'Contoh: 9012-3456-7890',
  },
  {
    code: 'BTPN',
    name: 'Bank BTPN / Jenius',
    shortName: 'Jenius / BTPN',
    badgeBg: 'bg-cyan-600',
    badgeBorder: 'border-cyan-400',
    textColor: 'text-cyan-300',
    accentColor: 'border-cyan-500',
    defaultPlaceholder: 'Contoh: 9001-0928-374',
  },
  {
    code: 'PANIN',
    name: 'Bank Panin',
    shortName: 'Panin',
    badgeBg: 'bg-green-700',
    badgeBorder: 'border-green-400',
    textColor: 'text-green-300',
    accentColor: 'border-green-500',
    defaultPlaceholder: 'Contoh: 109-283-7465',
  },
  {
    code: 'MEGA',
    name: 'Bank Mega',
    shortName: 'Bank Mega',
    badgeBg: 'bg-yellow-600',
    badgeBorder: 'border-yellow-400',
    textColor: 'text-yellow-200',
    accentColor: 'border-yellow-500',
    defaultPlaceholder: 'Contoh: 01-074-00-11-12345',
  },
  {
    code: 'OCBC',
    name: 'OCBC NISP',
    shortName: 'OCBC',
    badgeBg: 'bg-rose-600',
    badgeBorder: 'border-rose-400',
    textColor: 'text-rose-300',
    accentColor: 'border-rose-500',
    defaultPlaceholder: 'Contoh: 012-8000-1234-5',
  },
  {
    code: 'QRIS',
    name: 'QRIS / E-Wallet (GoPay, OVO, DANA)',
    shortName: 'QRIS / E-Wallet',
    badgeBg: 'bg-rose-700',
    badgeBorder: 'border-rose-400',
    textColor: 'text-rose-200',
    accentColor: 'border-rose-500',
    defaultPlaceholder: 'Contoh: ID1020304050607 / 0821-2345-6789',
  },
  {
    code: 'OTHER',
    name: 'Bank Lainnya / Rekening Custom',
    shortName: 'Bank Lain',
    badgeBg: 'bg-gray-700',
    badgeBorder: 'border-gray-500',
    textColor: 'text-gray-300',
    accentColor: 'border-gray-500',
    defaultPlaceholder: 'Nomor Rekening Bank',
  },
];

export const getBankPreset = (bankCodeOrName: string): BankPreset => {
  if (!bankCodeOrName) return INDONESIAN_BANK_PRESETS[0];
  const query = bankCodeOrName.toUpperCase().trim();
  
  const found = INDONESIAN_BANK_PRESETS.find(
    (b) => b.code === query || query.includes(b.code) || query.includes(b.shortName.toUpperCase())
  );
  
  return found || {
    code: 'OTHER',
    name: bankCodeOrName,
    shortName: bankCodeOrName,
    badgeBg: 'bg-neutral-700',
    badgeBorder: 'border-neutral-500',
    textColor: 'text-neutral-300',
    accentColor: 'border-neutral-500',
    defaultPlaceholder: 'Nomor Rekening',
  };
};

export const DEFAULT_INITIAL_BANK_ACCOUNTS: BankAccountItem[] = [
  {
    id: 'bank-bca',
    bankCode: 'BCA',
    bankName: 'Bank Central Asia (BCA)',
    accountNumber: '8720-1928-33',
    accountHolder: 'Dimensi Fotografi Studio',
    isActive: true,
    isPrimary: true,
  },
  {
    id: 'bank-mandiri',
    bankCode: 'MANDIRI',
    bankName: 'Bank Mandiri',
    accountNumber: '137-00-1928374-1',
    accountHolder: 'PT Dimensi Visual Karya',
    isActive: true,
    isPrimary: false,
  },
  {
    id: 'bank-bri',
    bankCode: 'BRI',
    bankName: 'Bank Rakyat Indonesia (BRI)',
    accountNumber: '0341-01-002938-50-8',
    accountHolder: 'Dimensi Fotografi',
    isActive: true,
    isPrimary: false,
  },
  {
    id: 'bank-bni',
    bankCode: 'BNI',
    bankName: 'Bank Negara Indonesia (BNI)',
    accountNumber: '0987-6543-21',
    accountHolder: 'Dimensi Fotografi Studio',
    isActive: false,
    isPrimary: false,
  },
  {
    id: 'bank-bsi',
    bankCode: 'BSI',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7123-4567-89',
    accountHolder: 'Dimensi Fotografi Studio',
    isActive: false,
    isPrimary: false,
  },
  {
    id: 'bank-qris',
    bankCode: 'QRIS',
    bankName: 'QRIS / E-Wallet (DANA/OVO/GoPay)',
    accountNumber: '0821-2345-6789',
    accountHolder: 'Dimensi Fotografi Studio',
    isActive: false,
    isPrimary: false,
  }
];

export const parseBankString = (bankStr: string, defaultCode: string, defaultName: string): BankAccountItem => {
  if (!bankStr) {
    return {
      id: `bank-${defaultCode.toLowerCase()}-${Date.now()}`,
      bankCode: defaultCode,
      bankName: defaultName,
      accountNumber: '',
      accountHolder: 'Dimensi Fotografi Studio',
      isActive: true,
    };
  }

  // Handle format "BCA 8720-1928-33 a/n Dimensi" or "BCA: 123-456 a.n Dimensi"
  const anParts = bankStr.split(/a\.?n\.?|a\/n/i);
  const accountHolder = anParts[1] ? anParts[1].trim() : 'Dimensi Fotografi Studio';
  const front = anParts[0] ? anParts[0].trim() : bankStr;
  
  const colonParts = front.split(':');
  let rawBankName = defaultName;
  let rawAccNumber = front;
  
  if (colonParts.length > 1) {
    rawBankName = colonParts[0].trim();
    rawAccNumber = colonParts.slice(1).join(':').trim();
  } else {
    // Check if starts with bank code (e.g. "BCA 8720-1928-33")
    const words = front.split(/\s+/);
    if (words.length > 1 && /^(BCA|MANDIRI|BRI|BNI|BSI|CIMB|PERMATA|DANAMON|JAGO|SEABANK|QRIS)$/i.test(words[0])) {
      rawBankName = words[0].toUpperCase();
      rawAccNumber = words.slice(1).join(' ');
    }
  }

  return {
    id: `bank-${defaultCode.toLowerCase()}`,
    bankCode: defaultCode,
    bankName: defaultName,
    accountNumber: rawAccNumber.trim(),
    accountHolder: accountHolder.trim(),
    isActive: true,
  };
};

export const getResolvedBankAccounts = (config?: StudioConfig): BankAccountItem[] => {
  if (config?.bankAccounts && Array.isArray(config.bankAccounts) && config.bankAccounts.length > 0) {
    return config.bankAccounts;
  }

  // Fallback from legacy bank fields
  const bca = parseBankString(config?.bankBCA || '', 'BCA', 'Bank Central Asia (BCA)');
  const mandiri = parseBankString(config?.bankMandiri || '', 'MANDIRI', 'Bank Mandiri');
  const bri = parseBankString(config?.bankBRI || '', 'BRI', 'Bank Rakyat Indonesia (BRI)');

  return [
    { ...bca, id: 'bank-bca', isActive: true, isPrimary: true },
    { ...mandiri, id: 'bank-mandiri', isActive: true, isPrimary: false },
    { ...bri, id: 'bank-bri', isActive: true, isPrimary: false },
    ...DEFAULT_INITIAL_BANK_ACCOUNTS.filter((d) => !['BCA', 'MANDIRI', 'BRI'].includes(d.bankCode)),
  ];
};
