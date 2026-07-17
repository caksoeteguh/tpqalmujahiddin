/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'Ustadz' | 'Admin' | 'OrangTua' | 'KepalaTPQ' | 'Walikelas';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  linkedId?: string; // Links to ustadzId for 'Ustadz', parentName/phone or santriId for 'OrangTua'
  password?: string; // Optional custom password (defaults to 'password' if not set)
}

export interface Ustadz {
  id: string;
  name: string;
  username: string;
  phone: string;
  subjects: ('Jilid' | 'Tahfidz' | 'Ibadah Praktis')[];
  kelasIds: string[];
}

export interface Kelas {
  id: string;
  name: string;
  ustadzId: string;
}

export interface Santri {
  id: string;
  name: string;
  barcode: string;
  birthPlace: string;
  birthDate: string;
  kelasId: string;
  parentName: string;
  parentPhone: string;
  parentUsername: string;
}

export interface Jilid {
  id: string;
  name: string;
  totalPages: number;
}

export interface Surat {
  id: string;
  name: string;
  totalAyat: number;
  juz?: number;
}

export interface CapaianJilid {
  id: string;
  santriId: string;
  jilidId: string;
  page: number;
  status: 'Lulus' | 'Mengulang';
  notes: string;
  updatedAt: string;
  ustadzId: string;
}

export interface CapaianTahfidz {
  id: string;
  santriId: string;
  suratId: string;
  ayatRange: string;
  status: 'Lulus' | 'Mengulang';
  notes: string;
  updatedAt: string;
  ustadzId: string;
}

export interface CapaianIbadahPraktis {
  id: string;
  santriId: string;
  category: string;
  item: string; // e.g., "Praktik Berwudhu", "Bacaan Ruku", "Doa Kedua Orang Tua"
  status: 'Lulus' | 'Mengulang';
  notes: string;
  updatedAt: string;
  ustadzId: string;
  subject?: string; // Optional custom subject name
}

export interface IbadahMaterial {
  id: string;
  category: string;
  name: string;
  description?: string;
  subject?: string; // Optional custom subject name
}

export interface TpqIdentity {
  name: string;
  address: string;
  phone: string;
  logo: string; // Base64 image data or empty for default
  footerText: string;
  principalName?: string;
}
