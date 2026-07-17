/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Save, 
  Sparkles, 
  BookOpen, 
  Award, 
  CheckSquare, 
  GraduationCap, 
  Check, 
  Search,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { 
  Santri, 
  Kelas, 
  Jilid, 
  Surat, 
  IbadahMaterial, 
  CapaianJilid, 
  CapaianTahfidz, 
  CapaianIbadahPraktis 
} from '../types';

interface PenempatanSantriProps {
  santriList: Santri[];
  kelasList: Kelas[];
  jilidList: Jilid[];
  suratList: Surat[];
  ibadahMaterials: IbadahMaterial[];
  onEditSantri: (s: Santri) => void;
  onAddJilidEvaluation: (evalObj: Omit<CapaianJilid, 'id' | 'updatedAt'>) => void;
  onAddTahfidzEvaluation: (evalObj: Omit<CapaianTahfidz, 'id' | 'updatedAt'>) => void;
  onAddIbadahEvaluation: (evalObj: Omit<CapaianIbadahPraktis, 'id' | 'updatedAt'>) => void;
  capaianJilid: CapaianJilid[];
  capaianTahfidz: CapaianTahfidz[];
  capaianIbadah: CapaianIbadahPraktis[];
}

export default function PenempatanSantri({
  santriList,
  kelasList,
  jilidList,
  suratList,
  ibadahMaterials,
  onEditSantri,
  onAddJilidEvaluation,
  onAddTahfidzEvaluation,
  onAddIbadahEvaluation,
  capaianJilid,
  capaianTahfidz,
  capaianIbadah,
}: PenempatanSantriProps) {
  
  const [selectedSantriId, setSelectedSantriId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Placement states
  const [placementKelasId, setPlacementKelasId] = useState<string>('');
  const [placementJilidId, setPlacementJilidId] = useState<string>('');
  const [placementJilidPage, setPlacementJilidPage] = useState<number>(1);
  const [placementSuratId, setPlacementSuratId] = useState<string>('');
  const [placementAyatRange, setPlacementAyatRange] = useState<string>('1-5');
  const [completedIbadahNames, setCompletedIbadahNames] = useState<string[]>([]);
  
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Find selected santri details
  const selectedSantri = santriList.find(s => s.id === selectedSantriId);

  // Initialize form when selected santri changes
  useEffect(() => {
    if (selectedSantri) {
      setPlacementKelasId(selectedSantri.kelasId);
      
      // Get latest Jilid
      const studentJilidLogs = capaianJilid.filter(c => c.santriId === selectedSantri.id);
      if (studentJilidLogs.length > 0) {
        const latest = studentJilidLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr);
        setPlacementJilidId(latest.jilidId);
        setPlacementJilidPage(latest.page);
      } else {
        setPlacementJilidId(jilidList[0]?.id || '');
        setPlacementJilidPage(1);
      }

      // Get latest Tahfidz
      const studentTahfidzLogs = capaianTahfidz.filter(c => c.santriId === selectedSantri.id);
      if (studentTahfidzLogs.length > 0) {
        const latest = studentTahfidzLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr);
        setPlacementSuratId(latest.suratId);
        setPlacementAyatRange(latest.ayatRange);
      } else {
        setPlacementSuratId(suratList[0]?.id || '');
        setPlacementAyatRange('1-5');
      }

      // Get latest Ibadah Praktis (items with Lulus status)
      const studentIbadahLogs = capaianIbadah.filter(c => c.santriId === selectedSantri.id && c.status === 'Lulus');
      const passedNames = studentIbadahLogs.map(log => log.item);
      setCompletedIbadahNames(passedNames);
      
      setSuccessMessage('');
    }
  }, [selectedSantriId, selectedSantri, capaianJilid, capaianTahfidz, capaianIbadah, jilidList, suratList]);

  // Search filtered santri list
  const filteredSantri = santriList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleIbadah = (name: string) => {
    if (completedIbadahNames.includes(name)) {
      setCompletedIbadahNames(completedIbadahNames.filter(n => n !== name));
    } else {
      setCompletedIbadahNames([...completedIbadahNames, name]);
    }
  };

  const handleSavePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    // 1. Update Student Class
    onEditSantri({
      ...selectedSantri,
      kelasId: placementKelasId
    });

    // 2. Save Initial Jilid progress log (Only save if they have a jilid selected)
    if (placementJilidId) {
      onAddJilidEvaluation({
        santriId: selectedSantri.id,
        jilidId: placementJilidId,
        page: Number(placementJilidPage),
        status: 'Lulus',
        notes: 'Penempatan Awal oleh Wali Kelas',
        ustadzId: 'SYSTEM_WALIKELAS'
      });
    }

    // 3. Save Initial Tahfidz progress log
    if (placementSuratId) {
      onAddTahfidzEvaluation({
        santriId: selectedSantri.id,
        suratId: placementSuratId,
        ayatRange: placementAyatRange,
        status: 'Lulus',
        notes: 'Penempatan Awal oleh Wali Kelas',
        ustadzId: 'SYSTEM_WALIKELAS'
      });
    }

    // 4. Save checked Ibadah Praktis as "Lulus" initial settings
    // Filter out existing logs to avoid duplicate duplicates on the same day if desired,
    // but the system will display the latest log as current anyway.
    completedIbadahNames.forEach(ibadahName => {
      // Find material category
      const material = ibadahMaterials.find(m => m.name === ibadahName);
      if (material) {
        // Only save if no "Lulus" log exists for this item to avoid duplicates
        const alreadySaved = capaianIbadah.some(
          c => c.santriId === selectedSantri.id && c.item === ibadahName && c.status === 'Lulus'
        );
        if (!alreadySaved) {
          onAddIbadahEvaluation({
            santriId: selectedSantri.id,
            category: material.category,
            item: ibadahName,
            status: 'Lulus',
            notes: 'Penempatan Awal oleh Wali Kelas',
            ustadzId: 'SYSTEM_WALIKELAS'
          });
        }
      }
    });

    // Handle unchecked items (if Wali Kelas unchecked something, save as Mengulang/reset or just let it be. Usually let it be is fine)

    setSuccessMessage(`Subhanallah, penempatan awal santri ${selectedSantri.name} berhasil disimpan dan dikoneksikan ke bimbingan ustadz!`);
    
    // Scroll right column top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
          🎯 Penempatan Awal & Set Rombel Santri
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Menu khusus Wali Kelas / Admin untuk menempatkan santri baru pada Rombel Kelas, Jilid awal, target Surat Tahfidz, dan kelulusan Ibadah Praktis perdana agar terkoneksi instan dengan guru pembimbing (ustadz).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: SANTRI SELECTOR LIST */}
        <div className="lg:col-span-4 flex flex-col h-[650px] bg-white border border-slate-100 rounded-2xl p-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-4">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              CARI SANTRI
            </label>
            <div className="relative">
              <Search className="absolute top-2.5 left-3 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Cari nama atau barcode santri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {filteredSantri.map((s) => {
              const isSelected = s.id === selectedSantriId;
              
              // Get current placements details for info
              const sClass = kelasList.find(k => k.id === s.kelasId)?.name || 'Tanpa Kelas';
              
              const jLogs = capaianJilid.filter(c => c.santriId === s.id);
              const latestJ = jLogs.length > 0 
                ? jLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
                : null;
              const jName = latestJ ? `${jilidList.find(j => j.id === latestJ.jilidId)?.name || 'Jilid'} (Hal. ${latestJ.page})` : 'Belum Mulai';

              const tLogs = capaianTahfidz.filter(c => c.santriId === s.id);
              const latestT = tLogs.length > 0
                ? tLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
                : null;
              const tName = latestT ? `QS. ${suratList.find(st => st.id === latestT.suratId)?.name || 'Surat'} (${latestT.ayatRange})` : 'Belum Mulai';

              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSantriId(s.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-200 shadow-xs dark:bg-indigo-950/20 dark:border-indigo-900/40' 
                      : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{s.name}</h4>
                    <p className="text-[10px] text-indigo-600 font-bold dark:text-indigo-400 mt-0.5">{sClass}</p>
                    
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] font-medium text-slate-400">
                      <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm dark:bg-slate-950 dark:border-slate-800 truncate">📖 {jName}</span>
                      <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-sm dark:bg-slate-950 dark:border-slate-800 truncate">🕌 {tName}</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300'} />
                </button>
              );
            })}

            {filteredSantri.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-8">Santri tidak ditemukan.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INITIAL PLACEMENT CONTROL FORM */}
        <div className="lg:col-span-8">
          {selectedSantri ? (
            <form onSubmit={handleSavePlacement} className="space-y-6">
              
              {/* Alert Message */}
              {successMessage && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950/30 dark:bg-emerald-950/10 flex items-start gap-2.5 animate-fadeIn">
                  <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black text-emerald-800 dark:text-emerald-400">Penyelarasan Sukses!</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Bento Card: Santri Profile Header */}
              <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded-full tracking-wider text-indigo-200">PENEMPATAN AKTIF</span>
                  <h3 className="text-base font-black mt-1">{selectedSantri.name}</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">NIS: {selectedSantri.barcode} &bull; Wali: {selectedSantri.parentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-indigo-300">STATUS HARI INI</p>
                  <p className="text-xs font-black mt-0.5">Siap Dikelola &amp; Disinkronkan</p>
                </div>
              </div>

              {/* Rombel Kelas Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 dark:border-slate-800/50">
                  <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={18} />
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">1. PENETAPAN KELAS (ROMBEL)</h4>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">PILIK KELAS BIMBINGAN</label>
                  <select
                    value={placementKelasId}
                    onChange={(e) => setPlacementKelasId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map(k => (
                      <option key={k.id} value={k.id}>{k.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jilid Starter Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 dark:border-slate-800/50">
                  <BookOpen className="text-indigo-600 dark:text-indigo-400" size={18} />
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">2. PENEMPATAN BUKU JILID (IQRA)</h4>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Mulai Jilid</label>
                    <select
                      value={placementJilidId}
                      onChange={(e) => setPlacementJilidId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="">-- Pilih Jilid --</option>
                      {jilidList.map(j => (
                        <option key={j.id} value={j.id}>{j.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Mulai Halaman</label>
                    <input
                      type="number"
                      min={1}
                      max={jilidList.find(j => j.id === placementJilidId)?.totalPages || 100}
                      value={placementJilidPage}
                      onChange={(e) => setPlacementJilidPage(Number(e.target.value))}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tahfidz Quran Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 dark:border-slate-800/50">
                  <Award className="text-indigo-600 dark:text-indigo-400" size={18} />
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">3. CAPAIAN AWAL TAHFIDZ (HAFALAN)</h4>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Mulai Surat</label>
                    <select
                      value={placementSuratId}
                      onChange={(e) => setPlacementSuratId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    >
                      <option value="">-- Pilih Surat --</option>
                      {suratList.map(s => (
                        <option key={s.id} value={s.id}>QS. {s.name} ({s.totalAyat} ayat)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">Rentang Ayat Mulai</label>
                    <input
                      type="text"
                      placeholder="cth: 1-5"
                      value={placementAyatRange}
                      onChange={(e) => setPlacementAyatRange(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ibadah Praktis Checklist Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 dark:border-slate-800/50">
                  <CheckSquare className="text-indigo-600 dark:text-indigo-400" size={18} />
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">4. KELULUSAN AWAL IBADAH PRAKTIS</h4>
                </div>
                
                <p className="text-[11px] text-slate-400 mt-1">
                  Centang materi-materi ibadah harian yang sekiranya SUDAH dikuasai / lulus sempurna oleh santri ini agar tidak perlu dievaluasi dari awal oleh ustadz pengampu.
                </p>

                <div className="space-y-4 pt-2">
                  {(['Wudhu', 'Sholat', 'Doa'] as const).map(category => {
                    const categoryMaterials = ibadahMaterials.filter(m => m.category === category);
                    return (
                      <div key={category} className="space-y-2">
                        <h5 className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/20 px-2.5 py-1 rounded-md inline-block dark:text-indigo-400">
                          {category === 'Wudhu' && '💦 Wudhu & Thoharoh'}
                          {category === 'Sholat' && '🧎 Gerakan & Bacaan Sholat'}
                          {category === 'Doa' && '🤲 Do\'a-do\'a Harian'}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {categoryMaterials.map(mat => {
                            const isChecked = completedIbadahNames.includes(mat.name);
                            return (
                              <label
                                key={mat.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                                  isChecked 
                                    ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                                    : 'bg-slate-50/30 border-slate-100 text-slate-600 hover:border-slate-200 dark:bg-slate-950/10 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleIbadah(mat.name)}
                                  className="mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold leading-tight">{mat.name}</p>
                                  {mat.description && (
                                    <p className="text-[9px] text-slate-400 mt-0.5 truncate">{mat.description}</p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Panel Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white transition-all hover:bg-indigo-700 shadow-md cursor-pointer group"
                >
                  <Sparkles size={14} className="group-hover:animate-pulse" /> Simpan Penempatan Awal Santri &amp; Hubungkan Data
                </button>
              </div>

            </form>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-950/20 h-full flex flex-col items-center justify-center">
              <AlertCircle size={28} className="text-slate-400 mb-3" />
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">SILAKAN PILIH SANTRI</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5">
                Pilih salah satu nama santri di panel kiri terlebih dahulu untuk memulai penempatan awal, rombel kelas, jilid, tahfidz, dan ibadah praktis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
