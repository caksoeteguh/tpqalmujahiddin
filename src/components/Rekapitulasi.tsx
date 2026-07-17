/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  BookOpen, 
  Award, 
  CheckSquare, 
  FileDown 
} from 'lucide-react';
import { Santri, Kelas, Ustadz, CapaianJilid, CapaianTahfidz, CapaianIbadahPraktis, Jilid, Surat } from '../types';

interface RekapitulasiProps {
  santriList: Santri[];
  kelasList: Kelas[];
  ustadzList: Ustadz[];
  jilidList: Jilid[];
  suratList: Surat[];
  capaianJilid: CapaianJilid[];
  capaianTahfidz: CapaianTahfidz[];
  capaianIbadah: CapaianIbadahPraktis[];
  currentUserRole?: string;
}

export default function Rekapitulasi({
  santriList,
  kelasList,
  ustadzList,
  jilidList,
  suratList,
  capaianJilid,
  capaianTahfidz,
  capaianIbadah,
  currentUserRole = 'Ustadz',
}: RekapitulasiProps) {

  const [selectedKelasId, setSelectedKelasId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Filter students based on classroom & search query
  const filteredSantris = santriList.filter((s) => {
    const matchKelas = selectedKelasId === 'all' || s.kelasId === selectedKelasId;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKelas && matchSearch;
  });

  // Helper for safe CSV download using Blob & UTF-8 BOM
  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side CSV Exporter
  const handleDownloadCSV = () => {
    // CSV Header
    let csvContent = "Nama Santri,Barcode,Kelas,Capaian Jilid Terakhir,Capaian Tahfidz Terakhir,Capaian Wudhu,Capaian Sholat,Capaian Doa\r\n";

    filteredSantris.forEach((s) => {
      const currentKelas = kelasList.find(k => k.id === s.kelasId)?.name || 'Tanpa Kelas';
      
      // Jilid progress
      const studentJilid = capaianJilid.filter(l => l.santriId === s.id);
      const latestJilid = studentJilid && studentJilid.length > 0 
        ? studentJilid.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
        : null;
      const jilidText = latestJilid 
        ? `"${jilidList.find(j => j.id === latestJilid.jilidId)?.name || ''} hal ${latestJilid.page} (${latestJilid.status})"`
        : '"- "';

      // Tahfidz progress
      const studentTahfidz = capaianTahfidz.filter(l => l.santriId === s.id);
      const latestTahfidz = studentTahfidz && studentTahfidz.length > 0 
        ? studentTahfidz.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
        : null;
      const tahfidzText = latestTahfidz 
        ? `"Surat ${suratList.find(su => su.id === latestTahfidz.suratId)?.name || ''} ayat ${latestTahfidz.ayatRange} (${latestTahfidz.status})"`
        : '"- "';

      // Ibadah progress
      const studentIbadah = capaianIbadah.filter(l => l.santriId === s.id);
      const wudhuLog = studentIbadah.filter(i => i.category === 'Wudhu');
      const sholatLog = studentIbadah.filter(i => i.category === 'Sholat');
      const doaLog = studentIbadah.filter(i => i.category === 'Doa');

      const latestWudhu = wudhuLog.length > 0 ? wudhuLog.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;
      const latestSholat = sholatLog.length > 0 ? sholatLog.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;
      const latestDoa = doaLog.length > 0 ? doaLog.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;

      const wudhuText = latestWudhu ? `"${latestWudhu.item} (${latestWudhu.status})"` : '"- "';
      const sholatText = latestSholat ? `"${latestSholat.item} (${latestSholat.status})"` : '"- "';
      const doaText = latestDoa ? `"${latestDoa.item} (${latestDoa.status})"` : '"- "';

      csvContent += `"${s.name}","${s.barcode}","${currentKelas}",${jilidText},${tahfidzText},${wudhuText},${sholatText},${doaText}\r\n`;
    });

    downloadFile(csvContent, `rekap_capaian_ngajiku_${selectedKelasId}.csv`);
  };

  const handleDownloadCapaianJilidCSV = () => {
    let csvContent = "ID Evaluasi,Tanggal Setoran,Nama Santri,Materi Jilid,Halaman,Status Penilaian,Catatan Guru,Ustadz Penguji\r\n";
    capaianJilid.forEach((item) => {
      const santriName = santriList.find(s => s.id === item.santriId)?.name || 'Tidak Diketahui';
      const jilidName = jilidList.find(j => j.id === item.jilidId)?.name || 'Jilid';
      const ustadzName = ustadzList.find(u => u.id === item.ustadzId)?.name || 'Ustadz';
      const dateStr = new Date(item.updatedAt).toLocaleDateString('id-ID');
      
      csvContent += `"${item.id}","${dateStr}","${santriName}","${jilidName}","${item.page}","${item.status}","${item.notes || '-'}","${ustadzName}"\r\n`;
    });
    
    downloadFile(csvContent, "riwayat_setoran_jilid_lengkap.csv");
  };

  const handleDownloadCapaianTahfidzCSV = () => {
    let csvContent = "ID Evaluasi,Tanggal Setoran,Nama Santri,Nama Surat,Rentang Ayat,Status Penilaian,Catatan Guru,Ustadz Penguji\r\n";
    capaianTahfidz.forEach((item) => {
      const santriName = santriList.find(s => s.id === item.santriId)?.name || 'Tidak Diketahui';
      const suratName = suratList.find(su => su.id === item.suratId)?.name || 'Surat';
      const ustadzName = ustadzList.find(u => u.id === item.ustadzId)?.name || 'Ustadz';
      const dateStr = new Date(item.updatedAt).toLocaleDateString('id-ID');
      
      csvContent += `"${item.id}","${dateStr}","${santriName}","${suratName}","${item.ayatRange}","${item.status}","${item.notes || '-'}","${ustadzName}"\r\n`;
    });
    
    downloadFile(csvContent, "riwayat_setoran_tahfidz_lengkap.csv");
  };

  const handleDownloadCapaianIbadahCSV = () => {
    let csvContent = "ID Evaluasi,Tanggal Penilaian,Nama Santri,Kategori,Materi Ibadah,Status Penilaian,Catatan Guru,Ustadz Penguji\r\n";
    capaianIbadah.forEach((item) => {
      const santriName = santriList.find(s => s.id === item.santriId)?.name || 'Tidak Diketahui';
      const ustadzName = ustadzList.find(u => u.id === item.ustadzId)?.name || 'Ustadz';
      const dateStr = new Date(item.updatedAt).toLocaleDateString('id-ID');
      
      csvContent += `"${item.id}","${dateStr}","${santriName}","${item.category}","${item.item}","${item.status}","${item.notes || '-'}","${ustadzName}"\r\n`;
    });
    
    downloadFile(csvContent, "riwayat_penilaian_ibadah_lengkap.csv");
  };

  return (
    <div className="space-y-6">
      
      {/* Pusat Unduh Laporan Panel */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div 
          onClick={() => setShowExportPanel(!showExportPanel)}
          className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-all select-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FileDown size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pusat Ekspor & Unduh Laporan Backup</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Ekspor laporan capaian terpadu dan riwayat penilaian santri ke format CSV/Excel.</p>
            </div>
          </div>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
            {showExportPanel ? 'Sembunyikan' : 'Tampilkan Menu'}
          </button>
        </div>

        {showExportPanel && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50/30 dark:bg-slate-950/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Card 1: Rekapitulasi */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet size={16} className="text-emerald-500" />
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">Rekap Capaian Terpadu</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mb-4">
                    Unduh file rekapitulasi utama untuk seluruh santri yang aktif saat ini, lengkap dengan status kelulusan Jilid, Tahfidz, dan Ibadah terbaru.
                  </p>
                </div>
                <button
                  onClick={handleDownloadCSV}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 shadow-xs"
                >
                  <Download size={13} /> Ekspor Rekap Utama (CSV)
                </button>
              </div>

              {/* Card 2: Log Setoran Mengaji */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-indigo-500" />
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">Riwayat Setoran Mengaji</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mb-4">
                    Ekspor seluruh data transaksional log setoran Jilid Paket dan Tahfidz Quran yang telah diujikan oleh para asatidzah secara detail.
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleDownloadCapaianJilidCSV}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 py-1.5 text-xs font-bold text-indigo-700 transition-all hover:bg-indigo-100/70 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-400"
                  >
                    <Download size={12} /> Log Buku Jilid (CSV)
                  </button>
                  <button
                    onClick={handleDownloadCapaianTahfidzCSV}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/50 py-1.5 text-xs font-bold text-teal-700 transition-all hover:bg-teal-100/70 dark:border-teal-900 dark:bg-teal-950/20 dark:text-teal-400"
                  >
                    <Download size={12} /> Log Tahfidz Quran (CSV)
                  </button>
                </div>
              </div>

              {/* Card 3: Riwayat Penilaian Ibadah */}
              <div className="rounded-xl border border-slate-200/60 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={16} className="text-amber-500" />
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">Riwayat Evaluasi Ibadah</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mb-4">
                    Unduh file lengkap riwayat penilaian dan skor kompetensi ibadah praktis (meliputi gerakan Sholat, tatacara Wudhu, dan Doa Harian).
                  </p>
                </div>
                <button
                  onClick={handleDownloadCapaianIbadahCSV}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/50 py-2 text-xs font-bold text-amber-800 transition-all hover:bg-amber-100/70 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400"
                >
                  <Download size={13} /> Log Evaluasi Ibadah (CSV)
                </button>
              </div>

            </div>
            
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-3 dark:border-slate-800 text-[10px] text-slate-400">
              <p>Otorisasi Download: <strong className="text-slate-600 dark:text-slate-300">{currentUserRole}</strong> &bull; File yang dihasilkan kompatibel dengan Microsoft Excel, Google Sheets, dan LibreOffice.</p>
              <p className="italic font-semibold text-slate-500 dark:text-slate-400">Sistem Keamanan TPQKita Encrypted Backup</p>
            </div>
          </div>
        )}
      </div>

      {/* Search & filters control bar */}
      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Class filter dropdown */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950">
              <Filter size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Kelas:</span>
              <select
                value={selectedKelasId}
                onChange={(e) => setSelectedKelasId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-hidden dark:text-slate-200 cursor-pointer"
              >
                <option value="all">Semua Rombel</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>

            {/* Student Search Query */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama / barcode santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs font-medium outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
            </div>
          </div>

          {/* Quick Filter Info & Direct Exporter */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <FileDown size={14} /> Unduh Laporan Filtered (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Grid records display */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3">Nama Santri / ID</th>
                <th className="px-5 py-3">Rombel Kelas</th>
                <th className="px-5 py-3">
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} className="text-indigo-500" />
                    Capaian Mengaji Paket Jilid
                  </span>
                </th>
                <th className="px-5 py-3">
                  <span className="flex items-center gap-1">
                    <Award size={12} className="text-emerald-500" />
                    Setoran Tahfidz Quran
                  </span>
                </th>
                <th className="px-5 py-3">
                  <span className="flex items-center gap-1">
                    <CheckSquare size={12} className="text-amber-500" />
                    Ibadah Praktis (Wudhu-Sholat-Doa)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSantris.map((s) => {
                const currentKelas = kelasList.find(k => k.id === s.kelasId);
                const teacher = ustadzList.find(u => u.id === currentKelas?.ustadzId);

                // Fetch student's specific Jilid progress
                const studentJilid = capaianJilid.filter(l => l.santriId === s.id);
                const latestJilid = studentJilid.length > 0 
                  ? studentJilid.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
                  : null;

                // Fetch student's specific Tahfidz progress
                const studentTahfidz = capaianTahfidz.filter(l => l.santriId === s.id);
                const latestTahfidz = studentTahfidz.length > 0 
                  ? studentTahfidz.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
                  : null;

                // Fetch student's Ibadah progress
                const studentIbadah = capaianIbadah.filter(l => l.santriId === s.id);
                const wudhuProgress = studentIbadah.filter(i => i.category === 'Wudhu');
                const sholatProgress = studentIbadah.filter(i => i.category === 'Sholat');
                const doaProgress = studentIbadah.filter(i => i.category === 'Doa');

                const latestWudhu = wudhuProgress.length > 0 ? wudhuProgress.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;
                const latestSholat = sholatProgress.length > 0 ? sholatProgress.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;
                const latestDoa = doaProgress.length > 0 ? doaProgress.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20">
                    {/* Student Identity */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{s.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{s.barcode}</p>
                    </td>

                    {/* Classroom details */}
                    <td className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      <p>{currentKelas?.name || '-'}</p>
                      <p className="text-[10px] text-slate-400 font-normal italic">Ustadz: {teacher?.name.split(',')[0] || '-'}</p>
                    </td>

                    {/* Jilid Column progress */}
                    <td className="px-5 py-4">
                      {latestJilid ? (
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {jilidList.find(j => j.id === latestJilid.jilidId)?.name || 'Jilid'} - hal {latestJilid.page}
                          </p>
                          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase mt-1 ${
                            latestJilid.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {latestJilid.status}
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">Belum mengaji</p>
                      )}
                    </td>

                    {/* Tahfidz Column progress */}
                    <td className="px-5 py-4">
                      {latestTahfidz ? (
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            QS. {suratList.find(su => su.id === latestTahfidz.suratId)?.name || 'Surat'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold dark:text-slate-400 mt-0.5">Ayat {latestTahfidz.ayatRange}</p>
                          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase mt-1 ${
                            latestTahfidz.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {latestTahfidz.status}
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">Belum setor</p>
                      )}
                    </td>

                    {/* Ibadah Praktis indicators list */}
                    <td className="px-5 py-4">
                      <div className="space-y-1 w-full max-w-[180px]">
                        {/* Wudhu */}
                        <div className="flex items-center justify-between text-[11px] border-b border-slate-50 pb-1 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Wudhu:</span>
                          {latestWudhu ? (
                            <span className={`font-bold ${latestWudhu.status === 'Lulus' ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {latestWudhu.status}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>

                        {/* Sholat */}
                        <div className="flex items-center justify-between text-[11px] border-b border-slate-50 pb-1 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Sholat:</span>
                          {latestSholat ? (
                            <span className={`font-bold ${latestSholat.status === 'Lulus' ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {latestSholat.status}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>

                        {/* Doa */}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Doa Harian:</span>
                          {latestDoa ? (
                            <span className={`font-bold ${latestDoa.status === 'Lulus' ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {latestDoa.status}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
