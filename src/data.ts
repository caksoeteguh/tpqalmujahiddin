/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ustadz, Kelas, Santri, Jilid, Surat, CapaianJilid, CapaianTahfidz, CapaianIbadahPraktis, User, IbadahMaterial } from './types';
import { QURAN_SURAHS } from './quran';

// Default initial data
export const INITIAL_USTADZ: Ustadz[] = [
  {
    id: 'U01',
    name: 'Ustadz Ahmad Fauzi, S.Pd.I',
    username: 'ahmad',
    phone: '081234567890',
    subjects: ['Jilid', 'Tahfidz', 'Ibadah Praktis'],
    kelasIds: ['K01', 'K02'],
  },
  {
    id: 'U02',
    name: 'Ustadzah Siti Aminah, S.Ag',
    username: 'aminah',
    phone: '082345678901',
    subjects: ['Jilid', 'Tahfidz'],
    kelasIds: ['K03'],
  },
  {
    id: 'U03',
    name: 'Ustadz Muhammad Yusuf',
    username: 'yusuf',
    phone: '083456789012',
    subjects: ['Tahfidz', 'Ibadah Praktis'],
    kelasIds: [],
  }
];

export const INITIAL_KELAS: Kelas[] = [
  { id: 'K01', name: 'Kelas Al-Fatih (Dasar)', ustadzId: 'U01' },
  { id: 'K02', name: 'Kelas Al-Ikhlas (Menengah)', ustadzId: 'U01' },
  { id: 'K03', name: 'Kelas An-Nas (Lanjutan)', ustadzId: 'U02' },
];

export const INITIAL_SANTRI: Santri[] = [
  {
    id: 'S01',
    name: 'Muhammad Rizky Pratama',
    barcode: 'SANTRI-001',
    birthPlace: 'Jakarta',
    birthDate: '2016-04-12',
    kelasId: 'K01',
    parentName: 'Budi Santoso',
    parentPhone: '081299998888',
    parentUsername: 'budi',
  },
  {
    id: 'S02',
    name: 'Aisya Zahra Salsabila',
    barcode: 'SANTRI-002',
    birthPlace: 'Surabaya',
    birthDate: '2017-08-20',
    kelasId: 'K01',
    parentName: 'Rina Herawati',
    parentPhone: '081277776666',
    parentUsername: 'rina',
  },
  {
    id: 'S03',
    name: 'Fatimah Az-Zahra',
    barcode: 'SANTRI-003',
    birthPlace: 'Bandung',
    birthDate: '2015-11-05',
    kelasId: 'K01',
    parentName: 'Hendra Wijaya',
    parentPhone: '081255554444',
    parentUsername: 'hendra',
  },
  {
    id: 'S04',
    name: 'Yusuf Al-Fatih',
    barcode: 'SANTRI-004',
    birthPlace: 'Yogyakarta',
    birthDate: '2016-01-30',
    kelasId: 'K02',
    parentName: 'Slamet Riyadi',
    parentPhone: '081233332222',
    parentUsername: 'slamet',
  },
  {
    id: 'S05',
    name: 'Zahra Humaira',
    barcode: 'SANTRI-005',
    birthPlace: 'Semarang',
    birthDate: '2015-09-14',
    kelasId: 'K02',
    parentName: 'Dewi Lestari',
    parentPhone: '081211110000',
    parentUsername: 'dewi',
  },
  {
    id: 'S06',
    name: 'Ibrahim Ali',
    barcode: 'SANTRI-006',
    birthPlace: 'Malang',
    birthDate: '2014-05-18',
    kelasId: 'K03',
    parentName: 'Joko Susilo',
    parentPhone: '081399887766',
    parentUsername: 'joko',
  }
];

export const INITIAL_JILID: Jilid[] = [
  { id: 'J01', name: 'Jilid 1', totalPages: 40 },
  { id: 'J02', name: 'Jilid 2', totalPages: 40 },
  { id: 'J03', name: 'Jilid 3', totalPages: 40 },
  { id: 'J04', name: 'Jilid 4', totalPages: 40 },
  { id: 'J05', name: 'Jilid 5', totalPages: 40 },
  { id: 'J06', name: 'Jilid 6', totalPages: 40 },
  { id: 'J07', name: 'Al-Qur\'an', totalPages: 604 },
];

export const INITIAL_SURAT: Surat[] = QURAN_SURAHS.map((s) => ({
  id: s.id,
  name: s.name,
  totalAyat: s.totalAyat,
}));

export const INITIAL_CAPAIAN_JILID: CapaianJilid[] = [
  {
    id: 'CJ01',
    santriId: 'S01',
    jilidId: 'J01',
    page: 12,
    status: 'Lulus',
    notes: 'Pelafalan makhraj huruf hijaiyah ber-harakat fathah sudah sangat baik dan lancar.',
    updatedAt: '2026-06-23T16:00:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CJ02',
    santriId: 'S01',
    jilidId: 'J01',
    page: 15,
    status: 'Lulus',
    notes: 'Lancar membedakan bunyi mad thabi\'i panjang 2 harakat.',
    updatedAt: '2026-06-24T16:30:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CJ03',
    santriId: 'S01',
    jilidId: 'J01',
    page: 18,
    status: 'Mengulang',
    notes: 'Perlu diperbaiki untuk pengucapan huruf syin (ش) dan sod (ص) agar tidak tertukar.',
    updatedAt: '2026-06-26T15:45:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CJ04',
    santriId: 'S02',
    jilidId: 'J01',
    page: 25,
    status: 'Lulus',
    notes: 'Membaca dengan harakat kasrah dan dhommah sangat lancar tanpa terbata-bata.',
    updatedAt: '2026-06-25T16:15:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CJ05',
    santriId: 'S04',
    jilidId: 'J03',
    page: 10,
    status: 'Lulus',
    notes: 'Pengucapan tanwin fathahtain sudah stabil dan tajwidnya konsisten.',
    updatedAt: '2026-06-25T16:40:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CJ06',
    santriId: 'S06',
    jilidId: 'J07', // Al-Qur'an
    page: 45,
    status: 'Lulus',
    notes: 'Surat Al-Baqarah ayat 10-20. Mad Jaiz Munfasil dibaca sempurna. Pertahankan.',
    updatedAt: '2026-06-26T16:20:00Z',
    ustadzId: 'U02',
  }
];

export const INITIAL_CAPAIAN_TAFHIDZ: CapaianTahfidz[] = [
  {
    id: 'CT01',
    santriId: 'S01',
    suratId: 'SR01', // An-Nas
    ayatRange: '1-3',
    status: 'Lulus',
    notes: 'Hafalan lancar, tajwid ghunnah pada "An-Nas" terbaca jelas.',
    updatedAt: '2026-06-23T16:15:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CT02',
    santriId: 'S01',
    suratId: 'SR01',
    ayatRange: '4-6',
    status: 'Lulus',
    notes: 'Alhamdulillah selesai surat An-Nas dengan makhraj sempurna.',
    updatedAt: '2026-06-24T16:45:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CT03',
    santriId: 'S01',
    suratId: 'SR02', // Al-Falaq
    ayatRange: '1-3',
    status: 'Mengulang',
    notes: 'Sering tertukar pengucapan "qalaq" di akhir ayat. Diulang kembali murojaahnya.',
    updatedAt: '2026-06-26T16:00:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CT04',
    santriId: 'S02',
    suratId: 'SR03', // Al-Ikhlas
    ayatRange: '1-4',
    status: 'Lulus',
    notes: 'Sangat lancar sekali. Sekali setoran langsung lulus tanpa catatan.',
    updatedAt: '2026-06-25T16:20:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CT05',
    santriId: 'S06',
    suratId: 'SR10', // Al-Fil
    ayatRange: '1-5',
    status: 'Lulus',
    notes: 'Selesai surat Al-Fil dengan hafalan yang kuat dan tempo stabil.',
    updatedAt: '2026-06-26T16:30:00Z',
    ustadzId: 'U02',
  }
];

export const INITIAL_CAPAIAN_IBADAH_PRAKTIS: CapaianIbadahPraktis[] = [
  {
    id: 'CI01',
    santriId: 'S01',
    category: 'Wudhu',
    item: 'Niat dan Gerakan Cuci Tangan-Muka',
    status: 'Lulus',
    notes: 'Lafal niat wudhu lancar, basuhan air merata.',
    updatedAt: '2026-06-23T16:20:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CI02',
    santriId: 'S01',
    category: 'Doa',
    item: 'Doa Sebelum & Sesudah Makan',
    status: 'Lulus',
    notes: 'Doa dibaca dengan khidmat dan hafal lengkap artinya.',
    updatedAt: '2026-06-24T16:50:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CI03',
    santriId: 'S01',
    category: 'Sholat',
    item: 'Gerakan Sholat & Bacaan Ruku\'',
    status: 'Mengulang',
    notes: 'Bacaan ruku\' terbalik dengan bacaan sujud. Harap dibantu murojaah di rumah.',
    updatedAt: '2026-06-26T16:10:00Z',
    ustadzId: 'U01',
  },
  {
    id: 'CI04',
    santriId: 'S02',
    category: 'Doa',
    item: 'Doa Kedua Orang Tua',
    status: 'Lulus',
    notes: 'Sangat bagus pelafalan doanya, lancar dan fasih.',
    updatedAt: '2026-06-25T16:25:00Z',
    ustadzId: 'U01',
  }
];

export const INITIAL_USERS: User[] = [
  // Admin
  { id: 'US01', username: 'admin', name: 'Ibu Hajjah Khadijah, M.Pd', role: 'Admin', password: 'password' },
  // Kepala TPQ
  { id: 'US02', username: 'kepala', name: 'KH. Maimun Zubair, Lc', role: 'KepalaTPQ', password: 'password' },
  // Ustadz
  { id: 'US03', username: 'ahmad', name: 'Ustadz Ahmad Fauzi, S.Pd.I', role: 'Ustadz', linkedId: 'U01', password: 'password' },
  { id: 'US04', username: 'aminah', name: 'Ustadzah Siti Aminah, S.Ag', role: 'Ustadz', linkedId: 'U02', password: 'password' },
  // Parents (Orang Tua)
  { id: 'US05', username: 'budi', name: 'Budi Santoso (Orang Tua Rizky)', role: 'OrangTua', linkedId: 'S01', password: 'password' },
  { id: 'US06', username: 'rina', name: 'Rina Herawati (Orang Tua Aisya)', role: 'OrangTua', linkedId: 'S02', password: 'password' },
  { id: 'US07', username: 'hendra', name: 'Hendra Wijaya (Orang Tua Fatimah)', role: 'OrangTua', linkedId: 'S03', password: 'password' },
  { id: 'US08', username: 'slamet', name: 'Slamet Riyadi (Orang Tua Yusuf)', role: 'OrangTua', linkedId: 'S04', password: 'password' },
  { id: 'US09', username: 'dewi', name: 'Dewi Lestari (Orang Tua Zahra)', role: 'OrangTua', linkedId: 'S05', password: 'password' },
  { id: 'US10', username: 'joko', name: 'Joko Susilo (Orang Tua Ibrahim)', role: 'OrangTua', linkedId: 'S06', password: 'password' },
];

export const INITIAL_IBADAH_MATERIALS: IbadahMaterial[] = [
  { id: 'IM01', category: 'Wudhu', name: 'Tata Cara Berwudhu (Urut & Sempurna)', description: 'Niat, membasuh wajah, tangan, menyapu kepala, kaki.' },
  { id: 'IM02', category: 'Wudhu', name: 'Niat Wudhu & Doa Setelah Wudhu', description: 'Pelafalan doa wudhu dan setelah selesai.' },
  { id: 'IM03', category: 'Sholat', name: 'Bacaan Takbiratul Ihram & Iftitah', description: 'Membaca takbiratul ihram dan doa iftitah.' },
  { id: 'IM04', category: 'Sholat', name: 'Bacaan Ruku dan I\'tidal', description: 'Membaca doa ruku dan i\'tidal dengan tumaninah.' },
  { id: 'IM05', category: 'Sholat', name: 'Bacaan Sujud dan Duduk Antara Dua Sujud', description: 'Doa sujud dan duduk di antara dua sujud.' },
  { id: 'IM06', category: 'Sholat', name: 'Bacaan Tahiyyat Akhir & Salam', description: 'Membaca doa tahiyyat akhir dan gerakan salam.' },
  { id: 'IM07', category: 'Doa', name: 'Doa Kedua Orang Tua', description: 'Mendoakan ibu dan bapak.' },
  { id: 'IM08', category: 'Doa', name: 'Doa Sebelum & Sesudah Makan', description: 'Doa makan harian.' },
  { id: 'IM09', category: 'Doa', name: 'Doa Sebelum & Bangun Tidur', description: 'Doa istirahat tidur.' }
];

// Helper to initialize and retrieve database
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(`ngajiku_${key}`);
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch (e) {
    console.error(`Failed to parse stored key: ngajiku_${key}`, e);
  }
  return defaultValue;
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`ngajiku_${key}`, JSON.stringify(value));
    
  } catch (e) {
    console.error(`Failed to store key: ngajiku_${key}`, e);
  }
}

// Global store accessor
export function initializeDB() {
  if (!localStorage.getItem('ngajiku_initialized')) {
    setStoredData('ustadz', INITIAL_USTADZ);
    setStoredData('kelas', INITIAL_KELAS);
    setStoredData('santri', INITIAL_SANTRI);
    setStoredData('jilid', INITIAL_JILID);
    setStoredData('surat', INITIAL_SURAT);
    setStoredData('capaian_jilid', INITIAL_CAPAIAN_JILID);
    setStoredData('capaian_tahfidz', INITIAL_CAPAIAN_TAFHIDZ);
    setStoredData('capaian_ibadah_praktis', INITIAL_CAPAIAN_IBADAH_PRAKTIS);
    setStoredData('ibadah_materials', INITIAL_IBADAH_MATERIALS);
    setStoredData('users', INITIAL_USERS);
    localStorage.setItem('ngajiku_initialized', 'true');
  }
}
