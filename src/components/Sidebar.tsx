/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Database, 
  BookOpen, 
  Award, 
  CheckSquare, 
  Users, 
  UserCheck, 
  GraduationCap, 
  QrCode, 
  FileSpreadsheet, 
  Code, 
  LogOut, 
  BookOpenCheck,
  Settings,
  Sparkles,
  UserPlus,
  Key,
  BookMarked,
  Server
} from 'lucide-react';
import { Role, TpqIdentity } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  role: Role;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tpqIdentity: TpqIdentity;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  role,
  onLogout,
  isOpen,
  setIsOpen,
  tpqIdentity
}: SidebarProps) {
  
  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    // On mobile, close sidebar on navigation
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // Sneat styling colors: emerald & slate gradient
  const activeClass = "active-nav text-emerald-400 font-semibold";
  const inactiveClass = "text-slate-400 hover:bg-slate-800/40 hover:text-white transition-colors duration-200";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-850 sidebar-gradient text-slate-300 transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800/40">
          <div className="flex items-center gap-3 overflow-hidden">
            {tpqIdentity.logo && tpqIdentity.logo.startsWith('data:image') ? (
              <img src={tpqIdentity.logo} alt="Logo" className="h-10 w-10 object-cover rounded-xl shadow-md" />
            ) : (
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                tpqIdentity.logo === 'PRESET_BLUE' ? 'bg-indigo-600' :
                tpqIdentity.logo === 'PRESET_GOLD' ? 'bg-amber-500 text-slate-900' :
                tpqIdentity.logo === 'PRESET_TEAL' ? 'bg-teal-500' :
                'bg-emerald-500'
              }`}>
                <BookOpenCheck size={22} className="animate-pulse" />
              </div>
            )}
            <div className="overflow-hidden">
              <span className="text-[13px] font-extrabold tracking-tight text-white block truncate max-w-[140px]">
                {tpqIdentity.name}
              </span>
              <p className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">TPQ Digital App</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 lg:hidden"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Menu Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Main Group */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Menu Utama</p>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  currentTab === 'dashboard' ? activeClass : inactiveClass
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>

              {/* Barcode scan - accessible to Ustadz, Admin */}
              {['Walikelas', 'Admin', 'Ustadz'].includes(role) && (
                <button
                  onClick={() => handleNav('scanner')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'scanner' ? activeClass : inactiveClass
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode size={18} />
                    <span>Scan Barcode</span>
                  </div>
                  {role === 'Ustadz' && (
                    <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                      Scan
                    </span>
                  )}
                </button>
              )}

              {/* Rekapitulasi - accessible to Admin and Ustadz */}
              {['Walikelas', 'Admin', 'Ustadz'].includes(role) && (
                <button
                  onClick={() => handleNav('rekapitulasi')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'rekapitulasi' ? activeClass : inactiveClass
                  }`}
                >
                  <FileSpreadsheet size={18} />
                  <span>Rekap Capaian</span>
                </button>
              )}

              {/* Penempatan Awal Santri - accessible to Admin */}
              {['Walikelas', 'Admin'].includes(role) && (
                <button
                  onClick={() => handleNav('penempatan-santri')}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'penempatan-santri' ? activeClass : inactiveClass
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserPlus size={18} className="text-indigo-400" />
                    <span>Penempatan Santri</span>
                  </div>
                  <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400">
                    Baru
                  </span>
                </button>
              )}
            </nav>
          </div>

          {/* Data Master Group (Only shown to Admin) */}
          {['Walikelas', 'Admin'].includes(role) && (
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Data Master</span>
                {(role === 'Walikelas' || role === 'Admin') && (
                  <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Admin</span>
                )}
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('master-santri')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-santri' ? activeClass : inactiveClass
                  }`}
                >
                  <Users size={18} />
                  <span>Data Santri</span>
                </button>

                <button
                  onClick={() => handleNav('cetak-kartu')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'cetak-kartu' ? activeClass : inactiveClass
                  }`}
                >
                  <QrCode size={18} className="text-emerald-400" />
                  <span>Cetak Kartu & Barcode</span>
                </button>

                <button
                  onClick={() => handleNav('master-kelas')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-kelas' ? activeClass : inactiveClass
                  }`}
                >
                  <GraduationCap size={18} />
                  <span>Data Kelas</span>
                </button>

                <button
                  onClick={() => handleNav('master-ustadz')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-ustadz' ? activeClass : inactiveClass
                  }`}
                >
                  <UserCheck size={18} />
                  <span>Data Ustadz</span>
                </button>

                <button
                  onClick={() => handleNav('master-jilid')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-jilid' ? activeClass : inactiveClass
                  }`}
                >
                  <BookOpen size={18} />
                  <span>Materi Jilid</span>
                </button>

                <button
                  onClick={() => handleNav('master-tahfidz')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-tahfidz' ? activeClass : inactiveClass
                  }`}
                >
                  <Award size={18} />
                  <span>Materi Tahfidz</span>
                </button>

                <button
                  onClick={() => handleNav('master-ibadah')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-ibadah' ? activeClass : inactiveClass
                  }`}
                >
                  <CheckSquare size={18} />
                  <span>Ibadah Praktis</span>
                </button>
              </nav>
            </div>
          )}

          {/* Settings / Configuration group (Only shown to Admin) */}
          {['Walikelas', 'Admin'].includes(role) && (
            <div>
              <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Pengaturan TPQ</p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('identitas')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'identitas' ? activeClass : inactiveClass
                  }`}
                >
                  <Settings size={18} className="text-emerald-400" />
                  <span>Identitas & Logo</span>
                </button>

                <button
                  onClick={() => handleNav('kurikulum')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'kurikulum' ? activeClass : inactiveClass
                  }`}
                >
                  <BookMarked size={18} className="text-indigo-400" />
                  <span>Kurikulum & Mapel</span>
                </button>

                <button
                  onClick={() => handleNav('users')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'users' ? activeClass : inactiveClass
                  }`}
                >
                  <Key size={18} className="text-amber-400" />
                  <span>Manajemen Akun & Sandi</span>
                </button>
              </nav>
            </div>
          )}

          {/* Integration & Developer center (Only shown to Admin) */}
          {['Walikelas', 'Admin'].includes(role) && (
            <div>
              <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Integrasi Database</p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('integrasi')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'integrasi' ? activeClass : inactiveClass
                  }`}
                >
                  <Code size={18} className="text-emerald-400" />
                  <span className="font-medium text-slate-400">Ekspor PHP & MySQL</span>
                </button>
                <button
                  onClick={() => handleNav('cpanel')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'cpanel' ? activeClass : inactiveClass
                  }`}
                >
                  <Server size={18} className="text-blue-400" />
                  <span className="font-medium text-slate-400">Deploy ke CPanel</span>
                </button>
              </nav>
            </div>
          )}

        </div>

        {/* Footer info & Logout */}
        <div className="border-t border-slate-800/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/30 p-3 mb-3 border border-slate-800/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm">
              {(role === 'Walikelas' || role === 'Admin') ? 'A' : role[0]}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">Role: {role === 'Walikelas' || role === 'Admin' ? 'Admin' : role === 'OrangTua' ? 'Wali Santri' : role === 'KepalaTPQ' ? 'Kepala TPQ' : role}</p>
              <p className="text-[10px] text-slate-400 truncate">Sistem Online</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Simple internal X icon helper to ensure compilation is safe and light
function XIcon({ size = 18, className = '' }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
