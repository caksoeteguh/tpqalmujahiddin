/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Award, 
  CheckSquare, 
  Plus, 
  Edit, 
  Trash, 
  Save, 
  X, 
  GraduationCap, 
  Layers, 
  ChevronRight,
  BookOpenCheck,
  Search,
  BookMarked,
  Sparkles
} from 'lucide-react';
import { Jilid, Surat, IbadahMaterial, Role } from '../types';

interface CurriculumManagerProps {
  subjectsList: string[];
  onUpdateSubjectsList: (list: string[]) => void;
  jilidList: Jilid[];
  onAddJilid: (j: Jilid) => void;
  onEditJilid?: (j: Jilid) => void;
  onDeleteJilid?: (id: string) => void;
  suratList: Surat[];
  onAddSurat: (s: Surat) => void;
  onEditSurat?: (s: Surat) => void;
  onDeleteSurat?: (id: string) => void;
  ibadahMaterials: IbadahMaterial[];
  onAddIbadahMaterial: (m: IbadahMaterial) => void;
  onDeleteIbadahMaterial: (id: string) => void;
  currentUserRole: string;
}

export default function CurriculumManager({
  subjectsList,
  onUpdateSubjectsList,
  jilidList,
  onAddJilid,
  onEditJilid,
  onDeleteJilid,
  suratList,
  onAddSurat,
  onEditSurat,
  onDeleteSurat,
  ibadahMaterials,
  onAddIbadahMaterial,
  onDeleteIbadahMaterial,
  currentUserRole
}: CurriculumManagerProps) {

  const isEditable = ['Walikelas', 'Admin', 'KepalaTPQ'].includes(currentUserRole);

  const [activeTab, setActiveTab] = useState<string>(subjectsList[0] || 'Jilid');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  
  // General Search
  const [searchQuery, setSearchQuery] = useState('');

  // Material forms states
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [materialCategory, setMaterialCategory] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');

  // Jilid / Surat forms states
  const [isJilidModalOpen, setIsJilidModalOpen] = useState(false);
  const [editingJilidId, setEditingJilidId] = useState<string | null>(null);
  const [jilidName, setJilidName] = useState('');
  const [jilidTotalPages, setJilidTotalPages] = useState(40);

  const [isSuratModalOpen, setIsSuratModalOpen] = useState(false);
  const [editingSuratId, setEditingSuratId] = useState<string | null>(null);
  const [suratName, setSuratName] = useState('');
  const [suratTotalAyat, setSuratTotalAyat] = useState(7);
  const [suratJuz, setSuratJuz] = useState(30);

  // Add a new custom subject
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const cleaned = newSubjectName.trim();
    if (subjectsList.map(s => s.toLowerCase()).includes(cleaned.toLowerCase())) {
      alert('Mata pelajaran tersebut sudah ada!');
      return;
    }
    const updated = [...subjectsList, cleaned];
    onUpdateSubjectsList(updated);
    setNewSubjectName('');
    setIsAddSubjectOpen(false);
    setActiveTab(cleaned);
  };

  // Delete a subject
  const handleDeleteSubject = (subjectToDelete: string) => {
    if (['Jilid', 'Tahfidz', 'Ibadah Praktis'].includes(subjectToDelete)) {
      if (!confirm(`Perhatian: "${subjectToDelete}" adalah mata pelajaran inti/bawaan sistem. Menghapusnya dapat membatasi beberapa fitur bimbingan. Apakah Anda yakin ingin menghapus?`)) {
        return;
      }
    } else {
      if (!confirm(`Hapus mata pelajaran "${subjectToDelete}" beserta seluruh kurikulum/silabus di dalamnya?`)) {
        return;
      }
    }
    const updated = subjectsList.filter(s => s !== subjectToDelete);
    onUpdateSubjectsList(updated);
    if (activeTab === subjectToDelete) {
      setActiveTab(updated[0] || '');
    }
  };

  // Manage generic subjects material (like Ibadah Praktis, Fiqih, Aqidah, etc.)
  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim() || !materialCategory.trim()) return;

    const materialData: IbadahMaterial = {
      id: editingMaterialId || `MAT-${Date.now().toString().slice(-4)}`,
      category: materialCategory.trim(),
      name: materialName.trim(),
      description: materialDescription.trim(),
      subject: activeTab
    };

    onAddIbadahMaterial(materialData);
    setIsMaterialModalOpen(false);
    setEditingMaterialId(null);
    setMaterialName('');
    setMaterialCategory('');
    setMaterialDescription('');
  };

  const handleOpenEditMaterial = (m: IbadahMaterial) => {
    setEditingMaterialId(m.id);
    setMaterialCategory(m.category);
    setMaterialName(m.name);
    setMaterialDescription(m.description || '');
    setIsMaterialModalOpen(true);
  };

  const handleOpenAddMaterial = () => {
    setEditingMaterialId(null);
    setMaterialCategory('');
    setMaterialName('');
    setMaterialDescription('');
    setIsMaterialModalOpen(true);
  };

  // Manage Jilid lists
  const handleSaveJilid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jilidName.trim()) return;

    const jilidData: Jilid = {
      id: editingJilidId || `J0${jilidList.length + 1}`,
      name: jilidName.trim(),
      totalPages: Number(jilidTotalPages)
    };

    if (editingJilidId && onEditJilid) {
      onEditJilid(jilidData);
    } else {
      onAddJilid(jilidData);
    }
    setIsJilidModalOpen(false);
    setEditingJilidId(null);
    setJilidName('');
    setJilidTotalPages(40);
  };

  const handleOpenAddJilid = () => {
    setEditingJilidId(null);
    setJilidName('');
    setJilidTotalPages(40);
    setIsJilidModalOpen(true);
  };

  const handleOpenEditJilid = (j: Jilid) => {
    setEditingJilidId(j.id);
    setJilidName(j.name);
    setJilidTotalPages(j.totalPages);
    setIsJilidModalOpen(true);
  };

  // Manage Surat lists
  const handleSaveSurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suratName.trim()) return;

    const suratData: Surat = {
      id: editingSuratId || `SR${String(suratList.length + 1).padStart(3, '0')}`,
      name: suratName.trim(),
      totalAyat: Number(suratTotalAyat),
      juz: Number(suratJuz)
    };

    if (editingSuratId && onEditSurat) {
      onEditSurat(suratData);
    } else {
      onAddSurat(suratData);
    }
    setIsSuratModalOpen(false);
    setEditingSuratId(null);
    setSuratName('');
    setSuratTotalAyat(7);
    setSuratJuz(30);
  };

  const handleOpenAddSurat = () => {
    setEditingSuratId(null);
    setSuratName('');
    setSuratTotalAyat(7);
    setSuratJuz(30);
    setIsSuratModalOpen(true);
  };

  const handleOpenEditSurat = (s: Surat) => {
    setEditingSuratId(s.id);
    setSuratName(s.name);
    setSuratTotalAyat(s.totalAyat);
    setSuratJuz(s.juz || 30);
    setIsSuratModalOpen(true);
  };

  // Filter dynamic list of materials for the selected dynamic subject
  // For 'Ibadah Praktis' or custom subjects (e.g. 'Fiqih')
  const filteredMaterials = ibadahMaterials.filter(m => {
    const belongsToActive = activeTab === 'Ibadah Praktis' 
      ? (!m.subject || m.subject === 'Ibadah Praktis')
      : (m.subject === activeTab);
      
    if (!belongsToActive) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query) ||
      (m.description || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
            📚 Kurikulum & Mata Pelajaran TPQ
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sesuaikan kurikulum, pilar belajar, jilid bimbingan, surah Al-Qur'an, dan pilar ibadah / keagamaan sesuai dengan latar belakang dan aliran TPQ Anda.
          </p>
        </div>
        {isEditable && (
          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white transition-all hover:bg-indigo-700 hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={15} /> Tambah Mapel Baru
          </button>
        )}
      </div>

      {/* Subjects Grid Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {subjectsList.map((subject) => {
          const isActive = activeTab === subject;
          
          // Count items in each subject
          let countText = '';
          if (subject === 'Jilid') {
            countText = `${jilidList.length} Jilid Buku`;
          } else if (subject === 'Tahfidz') {
            countText = `${suratList.length} Surat Quran`;
          } else {
            const count = ibadahMaterials.filter(m => 
              subject === 'Ibadah Praktis' ? (!m.subject || m.subject === 'Ibadah Praktis') : m.subject === subject
            ).length;
            countText = `${count} Materi Silabus`;
          }

          return (
            <div
              key={subject}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                  : 'bg-white border-slate-100 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
              }`}
              onClick={() => setActiveTab(subject)}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400'
                  }`}>
                    {subject === 'Jilid' && <BookOpen size={16} />}
                    {subject === 'Tahfidz' && <Award size={16} />}
                    {subject === 'Ibadah Praktis' && <CheckSquare size={16} />}
                    {!['Jilid', 'Tahfidz', 'Ibadah Praktis'].includes(subject) && <BookMarked size={16} />}
                  </div>
                  
                  {/* Delete Option for Admins */}
                  {isEditable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject);
                      }}
                      className={`p-1 rounded-sm hover:bg-red-500/10 hover:text-red-300 transition-colors ${
                        isActive ? 'text-indigo-200 hover:text-white' : 'text-slate-300 hover:text-rose-500'
                      }`}
                    >
                      <Trash size={12} />
                    </button>
                  )}
                </div>

                <h4 className="text-xs font-extrabold uppercase tracking-wider line-clamp-1">
                  {subject}
                </h4>
              </div>

              <div className="mt-4">
                <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {countText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Curriculum Detail Syllabus & Materials */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 dark:bg-slate-900 dark:border-slate-800 space-y-6">
        
        {/* Detail Tab Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-850">
          <div>
            <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
              Syllabus & Silabus Mapel
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider mt-1 flex items-center gap-1.5">
              📁 Detil Kurikulum: {activeTab}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Search filter for list items */}
            {activeTab !== 'Jilid' && activeTab !== 'Tahfidz' && (
              <div className="relative">
                <Search className="absolute top-2 left-2.5 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Cari materi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-[11px] font-semibold outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            )}

            {isEditable && (
              <>
                {activeTab === 'Jilid' && (
                  <button
                    onClick={handleOpenAddJilid}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    <Plus size={13} /> Tambah Buku Jilid
                  </button>
                )}
                {activeTab === 'Tahfidz' && (
                  <button
                    onClick={handleOpenAddSurat}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    <Plus size={13} /> Tambah Surat
                  </button>
                )}
                {activeTab !== 'Jilid' && activeTab !== 'Tahfidz' && (
                  <button
                    onClick={handleOpenAddMaterial}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    <Plus size={13} /> Tambah Silabus
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Dynamic List Render based on Active Subject Type */}
        {activeTab === 'Jilid' ? (
          /* Jilid Curriculum Manager Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID Jilid</th>
                  <th className="px-5 py-3">Tingkatan / Nama Jilid</th>
                  <th className="px-5 py-3">Total Halaman</th>
                  {isEditable && <th className="px-5 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jilidList.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40">
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{j.id}</td>
                    <td className="px-5 py-3 font-bold text-slate-850 dark:text-slate-100">{j.name}</td>
                    <td className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-400">{j.totalPages} Halaman</td>
                    {isEditable && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditJilid(j)}
                            className="rounded-lg p-1 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          >
                            <Edit size={13} />
                          </button>
                          {onDeleteJilid && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus ${j.name}?`)) onDeleteJilid(j.id);
                              }}
                              className="rounded-lg p-1 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            >
                              <Trash size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'Tahfidz' ? (
          /* Tahfidz Quran Curriculum Manager Table */
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID Surat</th>
                  <th className="px-5 py-3">Nama Surat</th>
                  <th className="px-5 py-3">Total Ayat</th>
                  <th className="px-5 py-3">Juz Al-Quran</th>
                  {isEditable && <th className="px-5 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {suratList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40">
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{s.id}</td>
                    <td className="px-5 py-3 font-bold text-slate-850 dark:text-slate-100">{s.name}</td>
                    <td className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-400">{s.totalAyat} Ayat</td>
                    <td className="px-5 py-3 font-semibold text-slate-600 dark:text-slate-400">Juz {s.juz || 30}</td>
                    {isEditable && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditSurat(s)}
                            className="rounded-lg p-1 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          >
                            <Edit size={13} />
                          </button>
                          {onDeleteSurat && (
                            <button
                              onClick={() => {
                                if (confirm(`Hapus Surat ${s.name}?`)) onDeleteSurat(s.id);
                              }}
                              className="rounded-lg p-1 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            >
                              <Trash size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* General Syllabus Table for 'Ibadah Praktis' or any Custom Subject (like Fiqih, Aqidah, etc.) */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-3">ID Silabus</th>
                  <th className="px-5 py-3">Pilar / Kategori</th>
                  <th className="px-5 py-3">Nama Rincian Kegiatan / Bab</th>
                  <th className="px-5 py-3">Deskripsi / Detail Penilaian</th>
                  {isEditable && <th className="px-5 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{m.id}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">{m.category}</td>
                    <td className="px-5 py-3.5 font-black text-slate-850 dark:text-slate-100">{m.name}</td>
                    <td className="px-5 py-3.5 text-slate-500 italic max-w-sm truncate dark:text-slate-400">{m.description || '-'}</td>
                    {isEditable && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditMaterial(m)}
                            className="rounded-lg p-1 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus materi silabus ${m.name}?`)) {
                                onDeleteIbadahMaterial(m.id);
                              }
                            }}
                            className="rounded-lg p-1 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          >
                            <Trash size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 italic">
                      Materi silabus belum tersedia untuk kurikulum ini. Silakan tambahkan rincian baru!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL: ADD MAPEL (MATA PELAJARAN) */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-600" /> Tambah Mata Pelajaran Baru
              </h3>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Pelajaran / Kurikulum</label>
                <input
                  type="text"
                  placeholder="cth: Aqidah Akhlak, Fiqih, Sejarah Islam"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">Mata pelajaran baru akan otomatis bisa diajarkan oleh Ustadz dan dievaluasi di scanner bimbingan.</p>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  <Save size={14} /> Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT GENERIC SILABUS MATERIAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" /> {editingMaterialId ? 'Ubah Rincian Silabus' : 'Tambah Rincian Silabus'}
              </h3>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Mapel Terkait</label>
                <input
                  type="text"
                  value={activeTab}
                  disabled
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Kategori / Bab / Pilar</label>
                <input
                  type="text"
                  placeholder="cth: Rukun Iman / Tata Cara Wudhu / Bab 1"
                  value={materialCategory}
                  onChange={(e) => setMaterialCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Rincian Kegiatan / Materi</label>
                <input
                  type="text"
                  placeholder="cth: Menyebutkan Rukun Iman ke-1 / Gerakan Membasuh Tangan"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Detail / Deskripsi Penilaian (Opsional)</label>
                <textarea
                  placeholder="Masukkan detail penjelasan bab / kriteria penilaian lulus..."
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  <Save size={14} /> Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT JILID */}
      {isJilidModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" /> {editingJilidId ? 'Ubah Buku Jilid' : 'Tambah Buku Jilid'}
              </h3>
              <button
                onClick={() => setIsJilidModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveJilid} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Tingkat / Jilid</label>
                <input
                  type="text"
                  placeholder="cth: Yanbu'a Jilid 1 / Iqro' Jilid 2"
                  value={jilidName}
                  onChange={(e) => setJilidName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Total Halaman Buku</label>
                <input
                  type="number"
                  value={jilidTotalPages}
                  onChange={(e) => setJilidTotalPages(Number(e.target.value))}
                  min={1}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsJilidModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  <Save size={14} /> Simpan Jilid
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT SURAT */}
      {isSuratModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Award size={16} className="text-indigo-600" /> {editingSuratId ? 'Ubah Surat Al-Quran' : 'Tambah Surat Al-Quran'}
              </h3>
              <button
                onClick={() => setIsSuratModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSurat} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Surat</label>
                <input
                  type="text"
                  placeholder="cth: An-Naba' / Al-Mulk"
                  value={suratName}
                  onChange={(e) => setSuratName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Total Ayat</label>
                  <input
                    type="number"
                    value={suratTotalAyat}
                    onChange={(e) => setSuratTotalAyat(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Juz Al-Quran</label>
                  <input
                    type="number"
                    value={suratJuz}
                    onChange={(e) => setSuratJuz(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsSuratModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  <Save size={14} /> Simpan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

    </div>
  );
}
