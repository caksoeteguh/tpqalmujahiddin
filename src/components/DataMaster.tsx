/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash, 
  Upload, 
  Database, 
  QrCode, 
  FileSpreadsheet, 
  ChevronRight, 
  Save, 
  X,
  Sparkles,
  RefreshCw,
  Download,
  FileDown
} from 'lucide-react';
import { Santri, Kelas, Ustadz, Jilid, Surat, IbadahMaterial } from '../types';
import ExcelImportExport from './ExcelImportExport';

interface DataMasterProps {
  currentTab: string;
  santriList: Santri[];
  kelasList: Kelas[];
  ustadzList: Ustadz[];
  jilidList: Jilid[];
  suratList: Surat[];
  ibadahMaterials?: IbadahMaterial[];
  subjectsList?: string[];
  currentUserRole?: string;
  onAddSantri: (s: Santri) => void;
  onEditSantri: (s: Santri) => void;
  onDeleteSantri: (id: string) => void;
  onAddKelas: (k: Kelas) => void;
  onEditKelas?: (k: Kelas) => void;
  onDeleteKelas?: (id: string) => void;
  onAddUstadz: (u: Ustadz) => void;
  onEditUstadz?: (u: Ustadz) => void;
  onDeleteUstadz?: (id: string) => void;
  onAddJilid: (j: Jilid) => void;
  onEditJilid?: (j: Jilid) => void;
  onAddSurat: (s: Surat) => void;
  onEditSurat?: (s: Surat) => void;
  onAddIbadahMaterial?: (m: IbadahMaterial) => void;
  onBulkImportSantri: (list: Santri[]) => void;
  onBulkImportUstadz?: (list: Ustadz[]) => void;
}

export default function DataMaster({
  currentTab,
  santriList,
  kelasList,
  ustadzList,
  jilidList,
  suratList,
  ibadahMaterials,
  subjectsList,
  currentUserRole,
  onAddSantri,
  onEditSantri,
  onDeleteSantri,
  onAddKelas,
  onEditKelas,
  onDeleteKelas,
  onAddUstadz,
  onEditUstadz,
  onDeleteUstadz,
  onAddJilid,
  onEditJilid,
  onAddSurat,
  onEditSurat,
  onAddIbadahMaterial,
  onBulkImportSantri,
  onBulkImportUstadz,
}: DataMasterProps) {

  // Modal forms states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form Field inputs (Student Santri)
  const [sName, setSName] = useState('');
  const [sBarcode, setSBarcode] = useState('');
  const [sBirthPlace, setSBirthPlace] = useState('');
  const [sBirthDate, setSBirthDate] = useState('');
  const [sKelasId, setSKelasId] = useState('');
  const [sParentName, setSParentName] = useState('');
  const [sParentPhone, setSParentPhone] = useState('');
  const [sParentUsername, setSParentUsername] = useState('');

  // Form field inputs (Kelas)
  const [kId, setKId] = useState('');
  const [kName, setKName] = useState('');
  const [kUstadzId, setKUstadzId] = useState('');

  // Form field inputs (Ustadz)
  const [uId, setUId] = useState('');
  const [uName, setUName] = useState('');
  const [uUsername, setUUsername] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uSubjects, setUSubjects] = useState<string[]>(['Jilid', 'Tahfidz']);

  // Form field inputs (Jilid)
  const [jName, setJName] = useState('');
  const [jTotalPages, setJTotalPages] = useState<number>(40);

  // Form field inputs (IbadahMaterial)
  const [imCategory, setImCategory] = useState<'Wudhu' | 'Sholat' | 'Doa'>('Wudhu');
  const [imName, setImName] = useState('');
  const [imDescription, setImDescription] = useState('');

  // Form field inputs (Surat)
  const [suratName, setSuratName] = useState('');
  const [suratTotalAyat, setSuratTotalAyat] = useState<number>(7);
  const [suratJuz, setSuratJuz] = useState<number>(30);

  // Master Data CSV Exporter
  const handleDownloadMasterCSV = () => {
    let csvContent = "";
    let fileName = "";

    // Helper for safe download
    const downloadFile = (content: string, name: string) => {
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (currentTab === 'master-santri') {
      csvContent = "ID Santri,Nama Santri,Barcode Card,Tempat Lahir,Tanggal Lahir,ID Kelas,Nama Kelas,Wali Santri,No HP Wali,Username Wali\r\n";
      santriList.forEach(s => {
        const className = kelasList.find(k => k.id === s.kelasId)?.name || 'Tanpa Kelas';
        csvContent += `"${s.id}","${s.name}","${s.barcode}","${s.birthPlace || '-'}","${s.birthDate || '-'}","${s.kelasId || '-'}","${className}","${s.parentName}","${s.parentPhone}","${s.parentUsername}"\r\n`;
      });
      fileName = "data_master_santri.csv";
    } else if (currentTab === 'master-kelas') {
      csvContent = "ID Kelas,Nama Rombel Kelas,ID Ustadz,Nama Ustadz Wali Kelas\r\n";
      kelasList.forEach(k => {
        const teacherName = ustadzList.find(u => u.id === k.ustadzId)?.name || 'Tanpa Wali';
        csvContent += `"${k.id}","${k.name}","${k.ustadzId || '-'}","${teacherName}"\r\n`;
      });
      fileName = "data_master_kelas.csv";
    } else if (currentTab === 'master-ustadz') {
      csvContent = "ID Ustadz,Nama Lengkap,Username Login,No Telepon,Materi Diampu\r\n";
      ustadzList.forEach(u => {
        csvContent += `"${u.id}","${u.name}","${u.username}","${u.phone || '-'}","${u.subjects.join(', ')}"\r\n`;
      });
      fileName = "data_master_ustadz.csv";
    } else if (currentTab === 'master-jilid') {
      csvContent = "ID Jilid,Nama Jilid,Total Halaman\r\n";
      jilidList.forEach(j => {
        csvContent += `"${j.id}","${j.name}","${j.totalPages}"\r\n`;
      });
      fileName = "data_master_materi_jilid.csv";
    } else if (currentTab === 'master-tahfidz') {
      csvContent = "ID Surat,Nama Surat,Total Ayat,Juz Al-Quran\r\n";
      suratList.forEach(s => {
        csvContent += `"${s.id}","${s.name}","${s.totalAyat}","${s.juz}"\r\n`;
      });
      fileName = "data_master_materi_tahfidz.csv";
    } else if (currentTab === 'master-ibadah' && ibadahMaterials) {
      csvContent = "ID Materi,Kategori Ibadah,Nama Kegiatan/Doa\r\n";
      ibadahMaterials.forEach(m => {
        csvContent += `"${m.id}","${m.category}","${m.name}"\r\n`;
      });
      fileName = "data_master_materi_ibadah.csv";
    }

    if (csvContent) {
      downloadFile(csvContent, fileName);
    }
  };

  // Open modal helper
  const openAddModal = () => {
    // Reset forms
    setSName('');
    setSBarcode(`SANTRI-${Math.floor(100 + Math.random() * 900)}`);
    setSBirthPlace('Surabaya');
    setSBirthDate('2016-01-01');
    setSKelasId(kelasList[0]?.id || '');
    setSParentName('');
    setSParentPhone('0812');
    setSParentUsername('');
    
    setKId(`K${Math.floor(10 + Math.random() * 90)}`);
    setKName('');
    setKUstadzId(ustadzList[0]?.id || '');

    setUId(`U${Math.floor(10 + Math.random() * 90)}`);
    setUName('');
    setUUsername('');
    setUPhone('0857');
    setUSubjects(['Jilid', 'Tahfidz']);

    setJName('');
    setJTotalPages(40);

    setImCategory('Wudhu');
    setImName('');
    setImDescription('');

    setSuratName('');
    setSuratTotalAyat(7);
    setSuratJuz(30);
    
    setEditingItem(null);
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    if (currentTab === 'master-santri') {
      setSName(item.name);
      setSBarcode(item.barcode);
      setSBirthPlace(item.birthPlace);
      setSBirthDate(item.birthDate);
      setSKelasId(item.kelasId);
      setSParentName(item.parentName);
      setSParentPhone(item.parentPhone);
      setSParentUsername(item.parentUsername);
    } else if (currentTab === 'master-kelas') {
      setKId(item.id);
      setKName(item.name);
      setKUstadzId(item.ustadzId);
    } else if (currentTab === 'master-jilid') {
      setJName(item.name);
      setJTotalPages(item.totalPages);
    } else if (currentTab === 'master-ibadah') {
      setImCategory(item.category);
      setImName(item.name);
      setImDescription(item.description || '');
    } else if (currentTab === 'master-ustadz') {
      setUId(item.id);
      setUName(item.name);
      setUUsername(item.username);
      setUPhone(item.phone);
      setUSubjects(item.subjects || ['Jilid', 'Tahfidz']);
    } else if (currentTab === 'master-tahfidz') {
      setSuratName(item.name);
      setSuratTotalAyat(item.totalAyat);
      setSuratJuz(item.juz || 30);
    }
    setShowAddModal(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTab === 'master-santri') {
      const data: Santri = {
        id: editingItem ? editingItem.id : `S_${Date.now()}`,
        name: sName,
        barcode: sBarcode,
        birthPlace: sBirthPlace,
        birthDate: sBirthDate,
        kelasId: sKelasId,
        parentName: sParentName,
        parentPhone: sParentPhone,
        parentUsername: sParentUsername || sName.toLowerCase().split(' ')[0] + Math.floor(10 + Math.random() * 90),
      };

      if (editingItem) {
        onEditSantri(data);
      } else {
        onAddSantri(data);
      }
    } else if (currentTab === 'master-kelas') {
      const data: Kelas = {
        id: editingItem ? editingItem.id : kId,
        name: kName,
        ustadzId: kUstadzId,
      };
      if (editingItem) {
        onEditKelas?.(data);
      } else {
        onAddKelas(data);
      }
    } else if (currentTab === 'master-ustadz') {
      const ustadzData: Ustadz = {
        id: editingItem ? editingItem.id : uId,
        name: uName,
        username: uUsername || uName.toLowerCase().split(' ')[0],
        phone: uPhone,
        subjects: uSubjects as Ustadz['subjects'],
        kelasIds: editingItem ? editingItem.kelasIds : [],
      };
      if (editingItem) {
        onEditUstadz?.(ustadzData);
      } else {
        onAddUstadz(ustadzData);
      }
    } else if (currentTab === 'master-jilid') {
      const data: Jilid = {
        id: editingItem ? editingItem.id : `J0${jilidList.length + 1}`,
        name: jName,
        totalPages: Number(jTotalPages),
      };
      if (editingItem) {
        onEditJilid?.(data);
      } else {
        onAddJilid(data);
      }
    } else if (currentTab === 'master-ibadah') {
      const data: IbadahMaterial = {
        id: editingItem ? editingItem.id : `IM${String((ibadahMaterials || []).length + 1).padStart(2, '0')}`,
        category: imCategory,
        name: imName,
        description: imDescription,
      };
      if (editingItem) {
        // Option to edit ibadah material if needed, or just call onAddIbadahMaterial to overwrite/append
        onAddIbadahMaterial?.(data);
      } else {
        onAddIbadahMaterial?.(data);
      }
    } else if (currentTab === 'master-tahfidz') {
      const data: Surat = {
        id: editingItem ? editingItem.id : `SR${String(suratList.length + 1).padStart(3, '0')}`,
        name: suratName,
        totalAyat: Number(suratTotalAyat),
        juz: Number(suratJuz),
      };
      if (editingItem) {
        onEditSurat?.(data);
      } else {
        onAddSurat(data);
      }
    }
    setShowAddModal(false);
  };

  const getBreadcrumbTitle = () => {
    if (currentTab === 'master-santri') return 'Database Santri (Siswa TPQ)';
    if (currentTab === 'master-kelas') return 'Data Rombongan Belajar (Kelas)';
    if (currentTab === 'master-ustadz') return 'Data Ustadz / Guru Bimbingan';
    if (currentTab === 'master-jilid') return 'Daftar Paket Jilid Mengaji';
    if (currentTab === 'master-tahfidz') return 'Daftar Surat / Ayat Tahfidz';
    if (currentTab === 'master-ibadah') return 'Silabus Ibadah Praktis';
    return 'Data Master';
  };

  return (
    <div className="space-y-6">
      
      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-white p-5 shadow-xs border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 className="text-md font-extrabold text-slate-800 dark:text-white">{getBreadcrumbTitle()}</h2>
          <p className="text-xs text-slate-400 mt-1">Kelola data master sistem TPQKita secara real-time.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Download master CSV button */}
          <button
            onClick={handleDownloadMasterCSV}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-400 cursor-pointer"
            title="Ekspor seluruh data master yang tampil di tabel ini ke file CSV / Excel"
          >
            <FileDown size={14} /> Ekspor Backup (CSV)
          </button>

          {/* Excel Import/Export for Santri */}
          {currentTab === 'master-santri' && (
            <ExcelImportExport 
              type="santri" 
              onImport={(data) => onBulkImportSantri(data as Santri[])} 
            />
          )}

          {/* Excel Import/Export for Ustadz */}
          {currentTab === 'master-ustadz' && onBulkImportUstadz && (
            <ExcelImportExport 
              type="ustadz" 
              onImport={(data) => onBulkImportUstadz(data as Ustadz[])} 
            />
          )}

          {/* Add item button */}
          {(['master-santri', 'master-kelas', 'master-ustadz', 'master-jilid', 'master-tahfidz'].includes(currentTab) || (currentTab === 'master-ibadah' && (currentUserRole === 'Walikelas' || currentUserRole === 'Admin'))) && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Tambah Baru
            </button>
          )}
        </div>
      </div>

      {/* Tables Content */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        
        {/* SANTRI TABLE */}
        {currentTab === 'master-santri' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">Nama Santri</th>
                  <th className="px-5 py-3">Barcode Card</th>
                  <th className="px-5 py-3">TTL</th>
                  <th className="px-5 py-3">Rombel Kelas</th>
                  <th className="px-5 py-3">Wali Santri / HP</th>
                  <th className="px-5 py-3">Username Wali</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {santriList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{s.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        <QrCode size={12} className="text-slate-500" />
                        {s.barcode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-600 dark:text-slate-400">
                      {s.birthPlace}, {new Date(s.birthDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                        {kelasList.find(k => k.id === s.kelasId)?.name || 'Tanpa Kelas'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-700 dark:text-slate-300">{s.parentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.parentPhone}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">{s.parentUsername}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          title="Ubah data"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus santri ${s.name}? Seluruh riwayat capaian mengaji akan terhapus.`)) {
                              onDeleteSantri(s.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          title="Hapus data"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* KELAS TABLE */}
        {currentTab === 'master-kelas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID Kelas</th>
                  <th className="px-5 py-3">Nama Rombel / Kelas</th>
                  <th className="px-5 py-3">Ustadz Pengampu</th>
                  <th className="px-5 py-3">Jumlah Santri</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {kelasList.map((k) => {
                  const teacher = ustadzList.find(u => u.id === k.ustadzId);
                  const count = santriList.filter(s => s.kelasId === k.id).length;
                  return (
                    <tr key={k.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-400">{k.id}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{k.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {teacher?.name || 'Belum ditugasi'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{count} anak</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(k)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Ubah data"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kelas ${k.name}?`)) {
                                onDeleteKelas?.(k.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            title="Hapus data"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* USTADZ TABLE */}
        {currentTab === 'master-ustadz' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID Guru</th>
                  <th className="px-5 py-3">Nama Lengkap Ustadz</th>
                  <th className="px-5 py-3">Username Login</th>
                  <th className="px-5 py-3">No. HP Aktif</th>
                  <th className="px-5 py-3">Mata Pelajaran Diampu</th>
                  {['Walikelas', 'Admin', 'KepalaTPQ'].includes(currentUserRole || '') && (
                    <th className="px-5 py-3 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ustadzList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-400">{u.id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{u.name}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">{u.username}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-400">{u.phone}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.subjects.map((s) => (
                          <span key={s} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    {['Walikelas', 'Admin', 'KepalaTPQ'].includes(currentUserRole || '') && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Ubah data"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus ustadz ${u.name}?`)) {
                                onDeleteUstadz?.(u.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            title="Hapus data"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* JILID MASTER CONFIG */}
        {currentTab === 'master-jilid' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID Jilid</th>
                  <th className="px-5 py-3">Nama Paket Jilid</th>
                  <th className="px-5 py-3">Total Halaman Silabus</th>
                  <th className="px-5 py-3">Deskripsi Materi</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jilidList.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-400">{j.id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{j.name}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">{j.totalPages} halaman</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">Materi pengenalan huruf hijaiyah dan tajwid dasar.</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEditModal(j)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        title="Ubah data"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAHFIDZ MASTER CONFIG */}
        {currentTab === 'master-tahfidz' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID Surat</th>
                  <th className="px-5 py-3">Nama Surat</th>
                  <th className="px-5 py-3">Total Ayat Quran</th>
                  <th className="px-5 py-3">Kategori Juz</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suratList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-400">{s.id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">QS. {s.name}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-300">{s.totalAyat} ayat</td>
                    <td className="px-5 py-3.5 font-medium text-emerald-700 dark:text-emerald-400">
                      Juz {s.juz || 30}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openEditModal(s)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        title="Ubah data"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* IBADAH PRAKTIS CONFIG */}
        {currentTab === 'master-ibadah' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Materi Evaluasi Ibadah Praktis</h3>
              <p className="text-xs text-slate-400 mt-1">Terdapat 3 pilar praktik ibadah harian yang dievaluasi berkala oleh ustadz:</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[9px] font-bold text-indigo-800 uppercase dark:bg-indigo-950 dark:text-indigo-400">
                  Pilar 1
                </span>
                <h4 className="font-bold text-sm mt-2 text-slate-800 dark:text-slate-200">Wudhu & Thoharoh</h4>
                <p className="text-xs text-slate-500 mt-1">Evaluasi praktik kebersihan meliputi niat wudhu, membasuh muka, berkumur, membasuh tangan, kepala, hingga tertib.</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase dark:bg-emerald-950 dark:text-emerald-400">
                  Pilar 2
                </span>
                <h4 className="font-bold text-sm mt-2 text-slate-800 dark:text-slate-200">Praktik Gerakan Sholat</h4>
                <p className="text-xs text-slate-500 mt-1">Evaluasi keselarasan rukun sholat, bacaan takbir, ruku, sujud, i'tidal, duduk diantara dua sujud, hingga tahiyyat.</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase dark:bg-amber-950 dark:text-amber-400">
                  Pilar 3
                </span>
                <h4 className="font-bold text-sm mt-2 text-slate-800 dark:text-slate-200">Hafalan Do'a Harian</h4>
                <p className="text-xs text-slate-500 mt-1">Hafalan doa-doa harian penting seperti doa sebelum/sesudah makan, tidur, kedua orang tua, masuk masjid, dan lainnya.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daftar Rincian Materi Evaluasi</h4>
                {(currentUserRole === 'Walikelas' || currentUserRole === 'Admin') && (
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
                  >
                    <Plus size={12} /> Tambah Rincian Materi
                  </button>
                )}
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-3">ID</th>
                      <th className="px-5 py-3">Kategori Pilar</th>
                      <th className="px-5 py-3">Nama Rincian Kegiatan</th>
                      <th className="px-5 py-3">Deskripsi Pencapaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(ibadahMaterials || []).map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-400">{mat.id}</td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            mat.category === 'Wudhu' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                            mat.category === 'Sholat' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}>
                            {mat.category === 'Wudhu' ? 'Wudhu & Thoharoh' :
                             mat.category === 'Sholat' ? 'Gerakan Sholat' : 'Doa Harian'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">{mat.name}</td>
                        <td className="px-5 py-3.5 text-slate-500">{mat.description || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --------------------- MODAL ADD/EDIT ITEM --------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                {editingItem ? 'Ubah Data Master' : 'Tambah Baru Ke Data Master'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 mt-4">
              
              {/* Form Santri */}
              {currentTab === 'master-santri' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Santri Lengkap</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={sName}
                      onChange={(e) => setSName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Barcode ID Card</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={sBarcode}
                        onChange={(e) => setSBarcode(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Rombel Kelas</label>
                      <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={sKelasId}
                        onChange={(e) => setSKelasId(e.target.value)}
                        required
                      >
                        {kelasList.map((k) => (
                          <option key={k.id} value={k.id}>{k.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Tempat Lahir</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={sBirthPlace}
                        onChange={(e) => setSBirthPlace(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Tanggal Lahir</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={sBirthDate}
                        onChange={(e) => setSBirthDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Orang Tua / Wali</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={sParentName}
                        onChange={(e) => setSParentName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">No. HP Orang Tua</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={sParentPhone}
                        onChange={(e) => setSParentPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Kelas */}
              {currentTab === 'master-kelas' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">ID Kelas (Kode)</label>
                    <input
                      type="text"
                      placeholder="cth: K04"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={kId}
                      onChange={(e) => setKId(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Kelas / Rombel</label>
                    <input
                      type="text"
                      placeholder="cth: Kelas Al-Falaq"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={kName}
                      onChange={(e) => setKName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Ustadz Pengampu</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={kUstadzId}
                      onChange={(e) => setKUstadzId(e.target.value)}
                      required
                    >
                      {ustadzList.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Form Ustadz */}
              {currentTab === 'master-ustadz' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Lengkap Ustadz</label>
                    <input
                      type="text"
                      placeholder="cth: Ustadz Ahmad Fauzi, S.Pd"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={uName}
                      onChange={(e) => setUName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Username Login</label>
                      <input
                        type="text"
                        placeholder="cth: ahmad"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={uUsername}
                        onChange={(e) => setUUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">No. HP Aktif</label>
                      <input
                        type="text"
                        placeholder="cth: 081234..."
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        value={uPhone}
                        onChange={(e) => setUPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Mata Pelajaran yang Diampu</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(subjectsList || ['Jilid', 'Tahfidz', 'Ibadah Praktis']).map((subject) => {
                        const isChecked = uSubjects.includes(subject);
                        return (
                          <label
                            key={subject}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold cursor-pointer select-none transition-all ${
                              isChecked
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400'
                                : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:border-slate-200 dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setUSubjects(uSubjects.filter((s) => s !== subject));
                                } else {
                                  setUSubjects([...uSubjects, subject]);
                                }
                              }}
                              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{subject}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Jilid */}
              {currentTab === 'master-jilid' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Paket Jilid</label>
                    <input
                      type="text"
                      placeholder="cth: Jilid 1 / Jilid Tajwid"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={jName}
                      onChange={(e) => setJName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Total Halaman Silabus</label>
                    <input
                      type="number"
                      placeholder="cth: 40"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={jTotalPages}
                      onChange={(e) => setJTotalPages(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Form IbadahMaterial */}
              {currentTab === 'master-ibadah' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Kategori Pilar Ibadah</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={imCategory}
                      onChange={(e) => setImCategory(e.target.value as 'Wudhu' | 'Sholat' | 'Doa')}
                      required
                    >
                      <option value="Wudhu">Pilar 1 - Wudhu & Thoharoh</option>
                      <option value="Sholat">Pilar 2 - Praktik Gerakan Sholat</option>
                      <option value="Doa">Pilar 3 - Hafalan Do'a Harian</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Rincian Kegiatan</label>
                    <input
                      type="text"
                      placeholder="cth: Doa Masuk Masjid / Niat Sholat Ashar"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={imName}
                      onChange={(e) => setImName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Deskripsi Pencapaian</label>
                    <textarea
                      placeholder="Masukkan detail kriteria penilaian..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      rows={3}
                      value={imDescription}
                      onChange={(e) => setImDescription(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Form Surat / Tahfidz */}
              {currentTab === 'master-tahfidz' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Surat</label>
                    <input
                      type="text"
                      placeholder="cth: Al-Baqarah / An-Nas"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={suratName}
                      onChange={(e) => setSuratName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Total Ayat Quran</label>
                    <input
                      type="number"
                      placeholder="cth: 6"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={suratTotalAyat}
                      onChange={(e) => setSuratTotalAyat(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Kategori Juz (Isi Manual berupa Angka)</label>
                    <input
                      type="number"
                      placeholder="cth: 30"
                      min={1}
                      max={30}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      value={suratJuz}
                      onChange={(e) => setSuratJuz(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* --------------------- MODAL EXCEL IMPORT REMOVED --------------------- */}
    </div>
  );
}
