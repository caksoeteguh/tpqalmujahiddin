/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  Award, 
  CheckSquare, 
  QrCode, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  Smile, 
  FileSpreadsheet, 
  Check, 
  AlertCircle,
  Heart,
  Sparkles,
  Printer,
  Download,
  FileText,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Santri, 
  Kelas, 
  Ustadz, 
  CapaianJilid, 
  CapaianTahfidz, 
  CapaianIbadahPraktis, 
  User,
  Jilid,
  Surat,
  TpqIdentity
} from '../types';

interface DashboardProps {
  currentUser: User;
  santriList: Santri[];
  kelasList: Kelas[];
  ustadzList: Ustadz[];
  capaianJilid: CapaianJilid[];
  capaianTahfidz: CapaianTahfidz[];
  capaianIbadah: CapaianIbadahPraktis[];
  jilidList: Jilid[];
  suratList: Surat[];
  setCurrentTab: (tab: string) => void;
  onSetSelectedBarcodeForEvaluation: (barcode: string) => void;
  tpqIdentity: TpqIdentity;
}

export default function Dashboard({
  currentUser,
  santriList,
  kelasList,
  ustadzList,
  capaianJilid,
  capaianTahfidz,
  capaianIbadah,
  jilidList,
  suratList,
  setCurrentTab,
  onSetSelectedBarcodeForEvaluation,
  tpqIdentity,
}: DashboardProps) {

  // Color constants for charts
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  const [showReportModal, setShowReportModal] = useState(false);
  const [kepalaTab, setKepalaTab] = useState<'rekap' | 'kinerja'>('rekap');
  const [ustadzPerfNotes, setUstadzPerfNotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('ngajiku_ustadz_perf_notes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveUstadzPerfNotes = (ustadzId: string, notes: string) => {
    const updated = { ...ustadzPerfNotes, [ustadzId]: notes };
    setUstadzPerfNotes(updated);
    localStorage.setItem('ngajiku_ustadz_perf_notes', JSON.stringify(updated));
  };

  const currentUstadzProfile = ustadzList.find(
    (u) => u.id === currentUser.linkedId || u.username === currentUser.username || u.name === currentUser.name
  );
  const myPerformanceNotes = currentUstadzProfile ? ustadzPerfNotes[currentUstadzProfile.id] : null;

  // Calculate General statistics
  const totalSantri = santriList.length;
  const totalKelas = kelasList.length;
  const totalUstadz = ustadzList.length;
  const totalEvaluations = capaianJilid.length + capaianTahfidz.length + capaianIbadah.length;

  // Chart 1: Santri distribution per Class (Kelas)
  const getSantriPerKelasData = () => {
    return kelasList.map((k) => {
      const count = santriList.filter((s) => s.kelasId === k.id).length;
      return {
        name: k.name.replace(' (Dasar)', '').replace(' (Menengah)', '').replace(' (Lanjutan)', ''),
        'Jumlah Santri': count
      };
    });
  };

  // Chart 2: Student evaluation logs distribution
  const getEvaluationTypeData = () => {
    return [
      { name: 'Mengaji Jilid', value: capaianJilid.length },
      { name: 'Setoran Tahfidz', value: capaianTahfidz.length },
      { name: 'Ibadah Praktis', value: capaianIbadah.length }
    ];
  };

  // Chart 3: Class performance average page (for Kepala TPQ)
  const getClassPerformanceData = () => {
    return kelasList.map((k) => {
      const classSantris = santriList.filter((s) => s.kelasId === k.id);
      let totalPageProgress = 0;
      let evaluatedCount = 0;

      classSantris.forEach((s) => {
        const studentLogs = capaianJilid.filter((l) => l.santriId === s.id);
        if (studentLogs.length > 0) {
          // Get the latest page scored for this student
          const latestLog = studentLogs.reduce((prev, current) => 
            new Date(prev.updatedAt) > new Date(current.updatedAt) ? prev : current
          );
          totalPageProgress += latestLog.page;
          evaluatedCount++;
        }
      });

      const avgPage = evaluatedCount > 0 ? Math.round(totalPageProgress / evaluatedCount) : 0;
      return {
        name: k.name.split(' ')[1] || k.name,
        'Rata-rata Halaman': avgPage
      };
    });
  };

  // Render parent's child profile dashboard directly
  const renderParentDashboard = () => {
    // Find child linked to parent - SECURE: STRICTLY restrict to linkedId, NO fallback to student S01 if not authorized
    const child = santriList.find(s => s.id === currentUser.linkedId);
    
    if (!child) return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <AlertCircle className="mx-auto mb-4 text-rose-500 animate-pulse" size={48} />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Akses Dibatasi</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Akun Anda belum dikaitkan dengan data santri aktif. Silakan hubungi Wali Kelas atau Pengurus TPQ untuk menautkan akun Anda.
        </p>
      </div>
    );

    // Get latest progress
    const childJilidLogs = capaianJilid.filter(l => l.santriId === child.id);
    const childTahfidzLogs = capaianTahfidz.filter(l => l.santriId === child.id);
    const childIbadahLogs = capaianIbadah.filter(l => l.santriId === child.id);

    const latestJilidLog = childJilidLogs.length > 0 
      ? childJilidLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
      : null;

    const latestTahfidzLog = childTahfidzLogs.length > 0 
      ? childTahfidzLogs.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr)
      : null;

    // Latest ibadah items
    const wudhuProgress = childIbadahLogs.filter(i => i.category === 'Wudhu');
    const latestWudhu = wudhuProgress.length > 0 ? wudhuProgress.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;

    const sholatProgress = childIbadahLogs.filter(i => i.category === 'Sholat');
    const latestSholat = sholatProgress.length > 0 ? sholatProgress.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;

    const doaProgress = childIbadahLogs.filter(i => i.category === 'Doa');
    const latestDoa = doaProgress.length > 0 ? doaProgress.reduce((prev, curr) => new Date(prev.updatedAt) > new Date(curr.updatedAt) ? prev : curr) : null;

    // Class & Ustadz information
    const currentKelas = kelasList.find(k => k.id === child.kelasId);
    const currentTeacher = ustadzList.find(u => u.id === currentKelas?.ustadzId);

    // Dynamic calculations
    const jilidObj = latestJilidLog ? jilidList.find(j => j.id === latestJilidLog.jilidId) : null;
    const totalPages = jilidObj?.totalPages || 40;
    const jilidProgressPercent = latestJilidLog 
      ? Math.min(100, Math.round((latestJilidLog.page / totalPages) * 100))
      : 0;

    // Tahfidz Juz 30 Completion Count
    const uniqueCompletedSuras = Array.from(new Set(
      childTahfidzLogs
        .filter(l => l.status === 'Lulus')
        .map(l => l.suratId)
    )).length;
    const totalSurasInJuz30 = 37;
    const tahfidzPercent = Math.round((uniqueCompletedSuras / totalSurasInJuz30) * 100);

    return (
      <div className="space-y-8 animate-fade-in">
        
        {/* Quranic Motivation & Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-md">
          <div className="absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute left-1/3 bottom-0 -mb-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-lg" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Sparkles size={14} className="text-amber-300 animate-pulse" />
                <span>Rapor Digital Santri</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Assalamu'alaikum Bapak/Ibu {currentUser.name}</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Mari pantau tumbuh kembang akhlak dan kualitas mengaji Al-Qur'an Ananda <span className="underline decoration-amber-400 decoration-2 font-bold">{child.name}</span> secara berkala demi mewujudkan generasi Rabbani.
              </p>
            </div>
            
            {/* Islamic Quote Callout */}
            <div className="rounded-xl bg-black/10 p-4 backdrop-blur-xs border border-white/10 text-right max-w-xs self-start md:self-auto">
              <p className="font-serif italic text-sm text-amber-200">
                "Sebaik-baik kalian adalah orang yang mempelajari Al-Qur'an dan mengajarkannya."
              </p>
              <span className="text-[10px] text-emerald-200 font-bold block mt-1.5">— HR. Al-Bukhari</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ikhtisar Capaian Ananda</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Informasi rekapitulasi penilaian kurikulum Jilid, Tahfidz, dan Ibadah</p>
          </div>
          <button 
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-emerald-700 hover:shadow-md cursor-pointer active:scale-95 animate-fade-in"
          >
            <Printer size={16} />
            <span>Cetak Rapor Capaian Santri</span>
          </button>
        </div>

        {/* Bento Grid layout */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Bento Column 1: Profil & Identitas */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Profil Santri</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">AKTIF</span>
              </div>
              
              <div className="flex items-center gap-4 py-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg dark:bg-emerald-950/50 dark:text-emerald-400">
                  {child.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{child.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">ID: {child.barcode}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 my-4 dark:border-slate-800" />

              <div className="space-y-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Kelas / Rombel</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentKelas?.name || 'Belum diplot'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Ustadz Wali Kelas</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentTeacher?.name || 'Tidak ada'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tempat, Tgl Lahir</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {child.birthPlace}, {new Date(child.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated QR/Barcode Display */}
            <div className="mt-6 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-md border border-slate-200 dark:border-slate-700">
                  <QrCode size={36} className="text-slate-700" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kartu Santri Digital</p>
                  <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{child.barcode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Column 2: Capaian Jilid */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Metodologi Jilid</span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">UTAMA</span>
              </div>

              {latestJilidLog ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Capaian Saat Ini</p>
                      <h4 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {jilidObj?.name || 'Mengaji'}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Halaman</p>
                      <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{latestJilidLog.page}</span>
                      <span className="text-xs text-slate-400">/{totalPages}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Progres Jilid</span>
                      <span>{jilidProgressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500" 
                        style={{ width: `${jilidProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Status Evaluasi</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        latestJilidLog.status === 'Lulus' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {latestJilidLog.status === 'Lulus' ? 'Lulus / Tuntas' : 'Mengulang'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Catatan Guru:</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
                      "{latestJilidLog.notes || 'Ananda mengaji dengan baik, perlu menjaga konsistensi makhorijul huruf.'}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <BookOpen size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Belum ada evaluasi mengaji Jilid.</p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
              <Clock size={11} />
              <span>Pembaruan terakhir: {latestJilidLog ? new Date(latestJilidLog.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span>
            </div>
          </div>

          {/* Bento Column 3: Setoran Tahfidz */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Tahfidzul Qur'an</span>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">TARGET</span>
              </div>

              {latestTahfidzLog ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">Surat Terakhir Dinilai</p>
                    <div className="flex items-center justify-between mt-1">
                      <h4 className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                        S. {suratList.find(s => s.id === latestTahfidzLog.suratId)?.name || 'Surat'}
                      </h4>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Ayat {latestTahfidzLog.ayatRange}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar of Juz 30 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>Progres Juz 30</span>
                      <span>{uniqueCompletedSuras}/{totalSurasInJuz30} Surat ({tahfidzPercent}%)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500" 
                        style={{ width: `${tahfidzPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Kategori Hafalan</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        latestTahfidzLog.status === 'Lulus' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {latestTahfidzLog.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Catatan Guru:</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
                      "{latestTahfidzLog.notes || 'Hafalan lancar dan tajwid cukup terjaga.'}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Award size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Belum ada evaluasi hafalan surat.</p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1">
              <Clock size={11} />
              <span>Pembaruan terakhir: {latestTahfidzLog ? new Date(latestTahfidzLog.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span>
            </div>
          </div>

        </div>

        {/* Column 4: Ibadah Praktis Status Checklist */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Kompetensi Ibadah Praktis & Doa</h4>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">AKHLAK</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            
            {/* Wudhu Card */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 p-4 dark:bg-slate-800/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Wudhu & Thaharah</span>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">Gerakan Wudhu</h5>
                {latestWudhu ? (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        latestWudhu.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30'
                      }`}>
                        {latestWudhu.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(latestWudhu.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{latestWudhu.notes || '-'}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-3 italic">Belum dievaluasi</p>
                )}
              </div>
            </div>

            {/* Sholat Card */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 p-4 dark:bg-slate-800/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Praktek Shalat</span>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">Bacaan & Gerakan</h5>
                {latestSholat ? (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        latestSholat.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30'
                      }`}>
                        {latestSholat.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(latestSholat.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{latestSholat.notes || '-'}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-3 italic">Belum dievaluasi</p>
                )}
              </div>
            </div>

            {/* Doa Card */}
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 p-4 dark:bg-slate-800/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Hafalan Doa Harian</span>
                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1">Hafalan Doa</h5>
                {latestDoa ? (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        latestDoa.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30'
                      }`}>
                        {latestDoa.status}
                      </span>
                      <span className="text-[10px] text-slate-400">{new Date(latestDoa.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{latestDoa.notes || '-'}"</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-3 italic">Belum dievaluasi</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Table Column: Full History logs */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-200">Riwayat Catatan Belajar Lengkap</h3>
            <p className="text-xs text-slate-400">Seluruh riwayat evaluasi harian setoran yang dicatat oleh Ustadz pembimbing</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Kategori Evaluasi</th>
                  <th className="px-4 py-3">Materi / Kemajuan</th>
                  <th className="px-4 py-3">Hasil / Status</th>
                  <th className="px-4 py-3">Ustadz Penguji</th>
                  <th className="px-4 py-3">Catatan Pembimbing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  ...childJilidLogs.map(l => ({ ...l, type: 'Jilid', details: `${jilidList.find(j => j.id === l.jilidId)?.name || 'Jilid'} - Halaman ${l.page}` })),
                  ...childTahfidzLogs.map(l => ({ ...l, type: 'Tahfidz', details: `Surat ${suratList.find(s => s.id === l.suratId)?.name || 'Surat'} (Ayat ${l.ayatRange})` })),
                  ...childIbadahLogs.map(l => ({ ...l, type: `Ibadah (${l.category})`, details: l.item }))
                ]
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map((log) => {
                  const teacher = ustadzList.find(u => u.id === log.ustadzId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">
                        {new Date(log.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          log.type.startsWith('Jilid') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                          log.type.startsWith('Tahfidz') ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{log.details}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                          log.status === 'Lulus' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400' : 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {log.status === 'Lulus' ? 'Lulus / Tuntas' : 'Mengulang'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">{teacher?.name || 'Ustadz'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 italic">"{log.notes || '-'}"</td>
                    </tr>
                  );
                })}
                {childJilidLogs.length === 0 && childTahfidzLogs.length === 0 && childIbadahLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                      Belum ada riwayat catatan belajar untuk ananda {child.name}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Digital Report Card Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-900">
              
              {/* Modal controls */}
              <div className="absolute right-4 top-4 flex items-center gap-2 no-print">
                <button 
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Cetak PDF</span>
                </button>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <AlertCircle size={16} className="rotate-45" />
                </button>
              </div>

              {/* Rapor Document Container */}
              <div id="printable-rapor-card" className="border-4 border-double border-emerald-800 p-6 sm:p-8 bg-white font-sans text-slate-800">
                
                {/* Header Kop Surat */}
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b-2 border-emerald-800 pb-5 text-center sm:text-left">
                  {tpqIdentity.logo ? (
                    <img src={tpqIdentity.logo} alt="Logo" className="h-16 w-16 object-contain" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-800 text-white font-serif text-2xl font-black">
                      TPQ
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-emerald-800 uppercase">{tpqIdentity.name}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{tpqIdentity.address}</p>
                    <p className="text-[10px] text-slate-500">Hubungi: {tpqIdentity.phone} &bull; Email: tpqdigital@gmail.com</p>
                  </div>
                </div>

                {/* Title */}
                <div className="my-6 text-center">
                  <h3 className="font-serif text-lg font-black tracking-wide text-slate-800 uppercase decoration-2 underline decoration-emerald-800">
                    Laporan Hasil Capaian Belajar Santri (Rapor Digital)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Laporan Perkembangan Kurikulum Harian TPQ Modern Terpadu</p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-emerald-50/50 p-4 border border-emerald-100 text-xs mb-6">
                  <div className="space-y-1.5">
                    <p><span className="font-semibold text-slate-500 w-24 inline-block">Nama Santri:</span> <span className="font-bold text-slate-800">{child.name}</span></p>
                    <p><span className="font-semibold text-slate-500 w-24 inline-block">Nomor Induk:</span> <span className="font-bold text-slate-800 font-mono">{child.barcode}</span></p>
                    <p><span className="font-semibold text-slate-500 w-24 inline-block">TTL:</span> <span className="font-medium text-slate-800">{child.birthPlace}, {new Date(child.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                  </div>
                  <div className="space-y-1.5">
                    <p><span className="font-semibold text-slate-500 w-24 inline-block">Kelas/Rombel:</span> <span className="font-bold text-slate-800">{currentKelas?.name || '-'}</span></p>
                    <p><span className="font-semibold text-slate-500 w-24 inline-block">Wali Kelas:</span> <span className="font-bold text-slate-800">{currentTeacher?.name || '-'}</span></p>
                    <p><span className="font-semibold text-slate-500 w-24 inline-block">Tanggal Cetak:</span> <span className="font-medium text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                  </div>
                </div>

                {/* Scores Matrix Section */}
                <div className="space-y-5">
                  
                  {/* 1. Kurikulum Jilid */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 border-l-4 border-emerald-800 pl-2">I. Kemampuan Membaca (Jilid)</h4>
                    <table className="w-full text-xs text-left border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                          <th className="p-2 border-r border-slate-200">Metodologi Jilid</th>
                          <th className="p-2 border-r border-slate-200 text-center">Halaman Terakhir</th>
                          <th className="p-2 border-r border-slate-200 text-center">Status Kelulusan</th>
                          <th className="p-2">Catatan Evaluasi Pembimbing</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 font-bold text-emerald-800">{jilidObj?.name || 'Mengaji Jilid'}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-base">{latestJilidLog?.page || '-'}</td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${latestJilidLog?.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {latestJilidLog ? (latestJilidLog.status === 'Lulus' ? 'LULUS / TUNTAS' : 'MENGULANG') : 'Belum Ada'}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 italic">"{latestJilidLog?.notes || 'Pertahankan ketelitian membaca, perhatikan panjang pendek bacaan mad.'}"</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Kurikulum Tahfidz */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 border-l-4 border-emerald-800 pl-2">II. Kurikulum Hafalan (Tahfidzul Qur'an)</h4>
                    <table className="w-full text-xs text-left border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                          <th className="p-2 border-r border-slate-200">Surat Terakhir</th>
                          <th className="p-2 border-r border-slate-200 text-center">Target Ayat</th>
                          <th className="p-2 border-r border-slate-200 text-center">Total Sura Juz 30</th>
                          <th className="p-2 border-r border-slate-200 text-center">Predikat</th>
                          <th className="p-2">Catatan Evaluasi Hafalan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 font-bold text-emerald-800">S. {suratList.find(s => s.id === latestTahfidzLog?.suratId)?.name || 'Belum Setoran'}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold">{latestTahfidzLog?.ayatRange || '-'}</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold">{uniqueCompletedSuras} dari {totalSurasInJuz30} Surat</td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold text-emerald-700">{latestTahfidzLog?.status || '-'}</td>
                          <td className="p-2 text-slate-600 italic">"{latestTahfidzLog?.notes || 'Hafalan cukup lancar, makhroj huruf sudah baik.'}"</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 3. Kurikulum Ibadah Praktis */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 border-l-4 border-emerald-800 pl-2">III. Praktik Ibadah, Wudhu & Doa Harian</h4>
                    <table className="w-full text-xs text-left border-collapse border border-slate-200">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                          <th className="p-2 border-r border-slate-200">Aspek Evaluasi</th>
                          <th className="p-2 border-r border-slate-200">Materi Evaluasi</th>
                          <th className="p-2 border-r border-slate-200 text-center">Status Kelulusan</th>
                          <th className="p-2">Catatan Guru Pembimbing</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-700">Wudhu & Thaharah</td>
                          <td className="p-2 border-r border-slate-200">{latestWudhu?.item || 'Gerakan & Syarat Wudhu'}</td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {latestWudhu?.status || 'Lulus'}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 italic">"{latestWudhu?.notes || 'Urutan berwudhu sudah tertib.'}"</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-700">Praktek Sholat</td>
                          <td className="p-2 border-r border-slate-200">{latestSholat?.item || 'Bacaan Sholat Fardhu'}</td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {latestSholat?.status || 'Lulus'}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 italic">"{latestSholat?.notes || 'Gerakan sholat tumaninah, bacaan lancar.'}"</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 font-bold text-slate-700">Doa Harian</td>
                          <td className="p-2 border-r border-slate-200">{latestDoa?.item || 'Doa Kedua Orang Tua & Sapu Jagad'}</td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {latestDoa?.status || 'Lulus'}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 italic">"{latestDoa?.notes || 'Doa dihafal dengan lafadz yang jelas.'}"</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Closing / Footnotes */}
                <p className="text-[10px] text-slate-400 mt-6 leading-relaxed italic text-center">
                  *Rapor Digital ini merupakan salinan sah dari Database TPQ Digital App. Dicetak secara otomatis oleh sistem atas otorisasi orang tua santri.
                </p>

                {/* Signatures Area */}
                <div className="mt-10 grid grid-cols-3 text-center text-xs text-slate-700">
                  <div>
                    <p className="mb-14">Mengetahui,<br /><span className="font-bold">Orang Tua/Wali Santri</span></p>
                    <p className="font-bold underline text-slate-800">{currentUser.name}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-14 w-14 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-emerald-800 font-bold text-[9px] rotate-12">
                      STEMPEL TPQ
                    </div>
                  </div>
                  <div>
                    <p className="mb-14">Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br /><span className="font-bold">Kepala Sekolah TPQ</span></p>
                    <p className="font-bold underline text-slate-800">{tpqIdentity.principalName || 'Ustadz KH. Ahmad Dahlan'}</p>
                  </div>
                </div>

              </div>

              {/* Back controls */}
              <div className="mt-6 flex justify-end gap-2 no-print">
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Tutup Rapor
                </button>
              </div>

            </div>
          </div>
          </div>
        )}

      </div>
    );
  };

  const renderKepalaTPQDashboard = () => {
    // Calculative metrics
    const totalJilidLogs = capaianJilid.length;
    const lulusJilidLogs = capaianJilid.filter(l => l.status === 'Lulus').length;
    const jilidPassRate = totalJilidLogs > 0 ? Math.round((lulusJilidLogs / totalJilidLogs) * 100) : 0;

    const lulusTahfidzLogs = capaianTahfidz.filter(l => l.status === 'Lulus').length;
    
    const totalIbadahLogs = capaianIbadah.length;

    // Sebaran ibadah per kategori
    const ibadahWudhu = capaianIbadah.filter(l => l.category === 'Wudhu').length;
    const ibadahSholat = capaianIbadah.filter(l => l.category === 'Sholat').length;
    const ibadahDoa = capaianIbadah.filter(l => l.category === 'Doa').length;

    const ibadahData = [
      { name: 'Wudhu & Thoharoh', value: ibadahWudhu },
      { name: 'Gerakan Sholat', value: ibadahSholat },
      { name: 'Hafalan Doa', value: ibadahDoa }
    ];

    const COLORS_IBADAH = ['#6366f1', '#10b981', '#f59e0b'];

    // Sebaran Jilid per Kelas data
    const jilidPerKelas = kelasList.map(k => {
      const classSantris = santriList.filter(s => s.kelasId === k.id);
      const classSantriIds = classSantris.map(s => s.id);
      
      const classJilidLogs = capaianJilid.filter(l => classSantriIds.includes(l.santriId));
      const avgPage = classJilidLogs.length > 0 ? Math.round(classJilidLogs.reduce((acc, curr) => acc + curr.page, 0) / classJilidLogs.length) : 0;
      
      const classTahfidzLogs = capaianTahfidz.filter(l => classSantriIds.includes(l.santriId) && l.status === 'Lulus');
      
      return {
        name: k.name,
        'Rata-rata Halaman': avgPage,
        'Hafalan Lulus (Setoran)': classTahfidzLogs.length,
        'Santri': classSantris.length,
        'Evaluasi Ibadah': capaianIbadah.filter(l => classSantriIds.includes(l.santriId)).length
      };
    });

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Navigation Tabs for Kepala TPQ */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 pb-1 items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
            <button
              onClick={() => setKepalaTab('rekap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                kepalaTab === 'rekap'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp size={14} />
              <span>Rekap Capaian Umum</span>
            </button>
            <button
              onClick={() => setKepalaTab('kinerja')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                kepalaTab === 'kinerja'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck size={14} />
              <span>Pantau Kinerja Ustadz</span>
            </button>
          </div>
          <span className="text-[10px] bg-slate-50 border border-slate-100 font-mono text-slate-400 font-bold px-2.5 py-1 rounded-lg dark:bg-slate-950 dark:border-slate-800">
            Hak Akses: Eksekutif Kepala TPQ
          </span>
        </div>

        {kepalaTab === 'rekap' ? (
          <>
            {/* Kepala TPQ Executive Summary Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat Kelulusan Jilid</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{jilidPassRate}%</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm dark:bg-emerald-950/20">Lulus</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Dari total {totalJilidLogs} bimbingan jilid</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Setoran Hafalan Lulus</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{lulusTahfidzLogs}</p>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm dark:bg-indigo-950/20">Setoran</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Ayat Al-Quran & Juz Amma tervalidasi</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluasi Mapel & Ibadah</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{totalIbadahLogs}</p>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm dark:bg-amber-950/20">Log</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Wudhu, sholat, & doa terekam</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rasio Keaktifan Kelas</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                    {kelasList.length > 0 ? Math.round((capaianJilid.length + capaianTahfidz.length) / kelasList.length) : 0}
                  </p>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-sm dark:bg-teal-950/20">Log/Kelas</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Rata-rata aktivitas bimbingan terinput</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Chart 1: Jilid Progress per Class */}
              <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Indikator Progress Jilid & Hafalan per Rombel</h3>
                    <p className="text-[10px] text-slate-400">Rata-rata halaman jilid dan total setoran tahfidz berstatus lulus</p>
                  </div>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                    Eksekutif Kepala TPQ
                  </span>
                </div>
                <div className="h-64 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={jilidPerKelas} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Rata-rata Halaman" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                      <Bar dataKey="Hafalan Lulus (Setoran)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={25} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Ibadah Sebaran */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Sebaran Kegiatan Ibadah Praktis</h3>
                <p className="text-[10px] text-slate-400 -mt-3 mb-3">Distribusi penilaian rincian ibadah harian</p>
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full flex justify-center text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ibadahData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {ibadahData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_IBADAH[index % COLORS_IBADAH.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-2 space-y-1.5 w-full">
                    {ibadahData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS_IBADAH[index % COLORS_IBADAH.length] }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.value} evaluasi</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Class Overview Grid Table */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Rangkuman Aktivitas & Progress Kelas</h3>
                <p className="text-[10px] text-slate-400">Monitoring real-time capaian santri lintas rombel pengampu ustadz</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Nama Rombel / Kelas</th>
                      <th className="px-4 py-3">Ustadz Pengampu</th>
                      <th className="px-4 py-3">Jumlah Santri</th>
                      <th className="px-4 py-3">Rata-rata Progress Jilid</th>
                      <th className="px-4 py-3">Total Setoran Tahfidz</th>
                      <th className="px-4 py-3">Evaluasi Mapel & Ibadah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {jilidPerKelas.map((cls) => {
                      const origClass = kelasList.find(k => k.name === cls.name);
                      const teacher = ustadzList.find(u => u.id === origClass?.ustadzId);
                      return (
                        <tr key={cls.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{cls.name}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300">{teacher?.name || 'Belum Ditunjuk'}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-100">{cls.Santri} santri</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{cls['Rata-rata Halaman']} hlm</span>
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, cls['Rata-rata Halaman'] * 2)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-indigo-600 dark:text-indigo-400">{cls['Hafalan Lulus (Setoran)']} setoran</td>
                          <td className="px-4 py-3.5 font-bold text-amber-600 dark:text-amber-400">{cls['Evaluasi Ibadah']} log</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Introductory section */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 dark:border-indigo-950/40 dark:bg-indigo-950/10">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Monitoring Kinerja & Pembinaan Ustadz</span>
              </h3>
              <p className="text-xs text-indigo-600/90 dark:text-indigo-400/80 mt-1 max-w-4xl leading-relaxed">
                Halaman pemantauan produktivitas ustadz pengampu kelas secara real-time. Kepala TPQ dapat memantau kuantitas log bimbingan, rasio penilaian kelulusan, dan memberikan catatan kinerja pembinaan yang langsung tersinkronkan.
              </p>
            </div>

            {/* Grid of Ustadz Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {ustadzList.map((ustadz) => {
                const ustadzClasses = kelasList.filter(k => k.ustadzId === ustadz.id);
                const jLogs = capaianJilid.filter(l => l.ustadzId === ustadz.id);
                const tLogs = capaianTahfidz.filter(l => l.ustadzId === ustadz.id);
                const iLogs = capaianIbadah.filter(l => l.ustadzId === ustadz.id);
                const totalLogs = jLogs.length + tLogs.length + iLogs.length;
                const lulusCount = [...jLogs, ...tLogs, ...iLogs].filter(l => l.status === 'Lulus').length;
                const passRate = totalLogs > 0 ? Math.round((lulusCount / totalLogs) * 100) : 0;

                // Sort logs to find latest date
                const allLogs = [...jLogs, ...tLogs, ...iLogs];
                const sortedLogs = allLogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                const lastActiveStr = sortedLogs.length > 0 
                  ? new Date(sortedLogs[0].updatedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Belum ada aktivitas';

                const currentNotes = ustadzPerfNotes[ustadz.id] || '';

                return (
                  <div 
                    key={ustadz.id} 
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:border-indigo-100 dark:hover:border-indigo-950/40 transition-all duration-300"
                  >
                    <div>
                      {/* Profile Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-indigo-50/80 flex items-center justify-center text-indigo-600 font-extrabold text-sm dark:bg-slate-800 dark:text-indigo-400 border border-indigo-100/30">
                            {ustadz.name.split(' ').filter(n => !['Ustadz', 'Ustadzah', 'S.Pd.I', 'S.Ag'].includes(n)).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{ustadz.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Username: <span className="font-mono">{ustadz.username}</span> • {ustadz.phone || '-'}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          ID: {ustadz.id}
                        </span>
                      </div>

                      {/* Managed Classes & Subjects */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 dark:bg-slate-950/30 dark:border-slate-800/40">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kelas Diampu</span>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                            {ustadzClasses.map(c => c.name).join(', ') || 'Belum Ditunjuk'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mata Pelajaran</span>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">
                            {ustadz.subjects && ustadz.subjects.length > 0 ? ustadz.subjects.join(', ') : 'Jilid, Tahfidz, Ibadah'}
                          </p>
                        </div>
                      </div>

                      {/* Performance KPIs */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-2xs dark:bg-slate-950 dark:border-slate-800/80 text-center">
                          <span className="text-[10px] font-bold text-slate-400 block">Total Input</span>
                          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 block mt-0.5">
                            {totalLogs} <span className="text-[9px] font-semibold text-slate-400">Log</span>
                          </span>
                        </div>
                        <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-2xs dark:bg-slate-950 dark:border-slate-800/80 text-center">
                          <span className="text-[10px] font-bold text-slate-400 block">Tingkat Lulus</span>
                          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">{passRate}%</span>
                        </div>
                        <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-2xs dark:bg-slate-950 dark:border-slate-800/80 text-center">
                          <span className="text-[10px] font-bold text-slate-400 block">Perlu Mengulang</span>
                          <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400 block mt-0.5">
                            {totalLogs - lulusCount} <span className="text-[9px] font-semibold text-slate-400">Log</span>
                          </span>
                        </div>
                      </div>

                      {/* Detail breakdown & last active */}
                      <div className="mt-3 flex flex-wrap items-center justify-between text-[10px] font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-lg dark:bg-slate-800/40 gap-2">
                        <span>Kontribusi: {jLogs.length} Jilid • {tLogs.length} Tahfidz • {iLogs.length} Ibadah</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> Aktif: {lastActiveStr}
                        </span>
                      </div>

                      {/* Feedback Notes Area */}
                      <div className="mt-4 space-y-2">
                        <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 dark:text-slate-400">
                          <MessageSquare size={12} className="text-indigo-500" />
                          <span>Catatan Kinerja Kepala TPQ</span>
                        </label>
                        <textarea
                          rows={2.5}
                          placeholder="Tulis saran pembinaan, apresiasi, atau masukan kinerja untuk ustadz ini..."
                          value={currentNotes}
                          onChange={(e) => saveUstadzPerfNotes(ustadz.id, e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />

                        {/* Presets Chips */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {[
                            'Sangat Berdedikasi',
                            'Disiplin & Aktif',
                            'Sabar Mengajar',
                            'Input Nilai Tertib',
                            'Perlu Tingkatkan Input',
                            'Makhraj Sangat Baik'
                          ].map(tag => {
                            const isPresent = currentNotes.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  let nextNote = currentNotes.trim();
                                  if (isPresent) {
                                    nextNote = nextNote.replace(new RegExp(`\\s*-\\s*${tag}\\s*`, 'g'), '').replace(tag, '').trim();
                                  } else {
                                    nextNote = nextNote ? `${nextNote} - ${tag}` : tag;
                                  }
                                  saveUstadzPerfNotes(ustadz.id, nextNote);
                                }}
                                className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                                  isPresent
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                              >
                                {isPresent ? `✓ ${tag}` : `+ ${tag}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <ThumbsUp size={11} className="text-slate-400" />
                        Terpantau di Dashboard
                      </span>
                      <span className="text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/30">
                        <Check size={10} /> Auto-Sync
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner (Matched with PHP Version) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10 space-y-2">
              <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Dasbor Utama</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Assalamu'alaikum, {currentUser.name}</h2>
              <p className="text-slate-300 text-sm max-w-xl">Selamat datang di sistem manajemen pembelajaran TPQ Digital. Kelola santri, pantau kurikulum, dan rekam hasil evaluasi dengan presisi.</p>
          </div>
          
          <div className="flex items-center gap-3 relative z-10 flex-wrap">
              <button onClick={() => setCurrentTab('scanner')} className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-5 rounded-2xl transition duration-150 shadow-lg shadow-emerald-500/10 active:scale-95">
                  <QrCode size={20} />
                  Buka Webcam Scanner
              </button>
              <button onClick={() => setCurrentTab('evaluasi')} className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-2xl border border-slate-700 transition duration-150 active:scale-95">
                  Evaluasi Manual
              </button>
          </div>
      </div>

      {/* Catatan Kepala TPQ untuk Ustadz */}
      {myPerformanceNotes && (currentUser.role === 'Ustadz' || currentUser.role === 'Walikelas') && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-emerald-50/10 p-5 shadow-xs dark:border-indigo-950/40 dark:from-indigo-950/10 dark:to-transparent animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <MessageSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span>Catatan Pembinaan Kepala TPQ (Murobby)</span>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full dark:bg-indigo-950/50 dark:text-indigo-300">
              Baru / Terupdate
            </span>
          </div>
          
          <div className="bg-white border border-slate-100 p-4 rounded-xl dark:bg-slate-900 dark:border-slate-800 shadow-2xs relative overflow-hidden">
            <div className="absolute right-3 bottom-0 text-slate-100 dark:text-slate-950/10 pointer-events-none select-none">
              <MessageSquare size={100} className="stroke-1 opacity-10" />
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed relative z-10">
              "{myPerformanceNotes}"
            </p>
            <div className="mt-3 flex items-center gap-2.5 pt-3 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
              <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-[10px] shadow-xs">
                KM
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">KH. Maimun Zubair, Lc</p>
                <p className="text-[9px] text-slate-400 font-medium">Kepala TPQ • Dewan Pembina Pembimbing</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render custom Parent/KepalaTPQ Dashboards directly */}
      {currentUser.role === 'OrangTua' ? (
        renderParentDashboard()
      ) : currentUser.role === 'KepalaTPQ' ? (
        renderKepalaTPQDashboard()
      ) : (
        <>
          {/* General TPQ statistics cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Santri Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Santri</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{totalSantri}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shadow-xs">
                  <Users size={22} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">Terdaftar aktif di sistem</p>
            </div>

            {/* Kelas Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Kelas</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{totalKelas}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
                  <GraduationCap size={22} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">Rombongan belajar TPQ</p>
            </div>

            {/* Ustadz Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Guru / Ustadz</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{totalUstadz}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shadow-xs">
                  <UserCheck size={22} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">Pengajar bimbingan aktif</p>
            </div>

            {/* Evaluations Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Kegiatan</p>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{totalEvaluations}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 shadow-xs">
                  <TrendingUp size={22} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium">Setoran nilai terinput</p>
            </div>
          </div>

          {/* Core Dashboards sections */}
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* Visual Charts section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Chart 1: Bar graph */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Sebaran Jumlah Santri per Kelas</h3>
                    <p className="text-[10px] text-slate-400">Distribusi rombel aktif TPQ saat ini</p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                    Sistem Rombel
                  </span>
                </div>
                <div className="h-64 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getSantriPerKelasData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend />
                      <Bar dataKey="Jumlah Santri" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Kepala TPQ Class Progress Average */}
              {['KepalaTPQ', 'Walikelas', 'Admin'].includes(currentUser.role) && (
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Indikator Capaian Mengaji Jilid per Rombel</h3>
                      <p className="text-[10px] text-slate-400">Rata-rata halaman jilid yang dicapai santri per kelas</p>
                    </div>
                  </div>
                  <div className="h-60 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getClassPerformanceData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Rata-rata Halaman" stroke="#10b981" fillOpacity={1} fill="url(#colorPage)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar widgets of Dashboard */}
            <div className="space-y-6">
              
              {/* Fast barcode entry widget for Ustadz */}
              {currentUser.role === 'Ustadz' && (
                <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md shadow-emerald-500/10 dark:shadow-none">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white/20 p-2 backdrop-blur-md">
                      <QrCode size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Evaluasi Scan Cepat</h3>
                      <p className="text-[10px] text-emerald-100">Scan barcode santri menghadap</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-emerald-100">Pilih santri untuk simulasi scan barcode instant:</p>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          onSetSelectedBarcodeForEvaluation(e.target.value);
                          setCurrentTab('scanner');
                        }
                      }}
                      defaultValue=""
                      className="mt-2 w-full rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white placeholder-emerald-200 outline-hidden border border-white/15 cursor-pointer hover:bg-white/15"
                    >
                      <option value="" className="text-slate-800">-- Pilih Santri Scan --</option>
                      {santriList.map((s) => (
                        <option key={s.id} value={s.barcode} className="text-slate-800">
                          {s.name} ({s.barcode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setCurrentTab('scanner')}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-50"
                  >
                    Buka Simulator Kamera Scanner
                  </button>
                </div>
              )}

              {/* Pie chart representing evaluated categories */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">Persentase Aktivitas Mengaji</h3>
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full flex justify-center text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getEvaluationTypeData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {getEvaluationTypeData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-2 space-y-1.5 w-full">
                    {getEvaluationTypeData().map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.value} log</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Excel Import Quick Link */}
              {(currentUser.role === 'Walikelas' || currentUser.role === 'Admin') && (
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/20 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/10">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400 shrink-0" size={20} />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Impor Data Santri Massal</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mulai impor data santri baru, surat tahfidz, dan jilid lewat format Excel xlsx.</p>
                      <button
                        onClick={() => setCurrentTab('master-santri')}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        Mulai Impor Sekarang &raquo;
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Recent Evaluations Table logs */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Nilai Evaluasi Santri Terbaru</h3>
                <p className="text-[10px] text-slate-400">Pencatatan real-time seluruh aktivitas ustadz</p>
              </div>
              <button
                onClick={() => setCurrentTab('rekapitulasi')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Lihat Rekap Lengkap &raquo;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5">Nama Santri</th>
                    <th className="px-4 py-2.5">Kategori</th>
                    <th className="px-4 py-2.5">Materi / Halaman</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Catatan Ustadz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    ...capaianJilid.map(l => ({ ...l, type: 'Jilid', details: `${jilidList.find(j => j.id === l.jilidId)?.name || 'Jilid'} - Halaman ${l.page}` })),
                    ...capaianTahfidz.map(l => ({ ...l, type: 'Tahfidz', details: `Surat ${suratList.find(s => s.id === l.suratId)?.name || 'Surat'} (Ayat ${l.ayatRange})` })),
                    ...capaianIbadah.map(l => ({ ...l, type: `Ibadah (${l.category})`, details: l.item }))
                  ]
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 5)
                  .map((log) => {
                    const student = santriList.find(s => s.id === log.santriId);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-4 py-3 font-semibold text-slate-400">
                          {new Date(log.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} {new Date(log.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{student?.name || 'Santri'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            log.type.startsWith('Jilid') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            log.type.startsWith('Tahfidz') ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{log.details}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            log.status === 'Lulus' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate italic">"{log.notes}"</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
