/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, Moon, Menu, ChevronRight, User, Key, RefreshCw, UserCheck } from 'lucide-react';
import { Role, User as UserType, TpqIdentity } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onToggleSidebar: () => void;
  currentTab: string;
  allRoles: Role[];
  onQuickSwitchRole: (role: Role) => void;
  tpqIdentity: TpqIdentity;
}

export default function Navbar({
  currentUser,
  darkMode,
  setDarkMode,
  onToggleSidebar,
  currentTab,
  allRoles,
  onQuickSwitchRole,
  tpqIdentity
}: NavbarProps) {
  
  // Format tab names to be readable
  const getBreadcrumb = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'scanner': return 'Evaluasi & Scan Barcode';
      case 'rekapitulasi': return 'Rekapitulasi Capaian Kelas';
      case 'penempatan-santri': return 'Penempatan Awal Santri';
      case 'master-santri': return 'Data Master » Santri';
      case 'master-kelas': return 'Data Master » Kelas';
      case 'master-ustadz': return 'Data Master » Ustadz';
      case 'master-jilid': return 'Data Master » Jilid';
      case 'master-tahfidz': return 'Data Master » Tahfidz';
      case 'master-ibadah': return 'Data Master » Ibadah Praktis';
      case 'integrasi': return 'Integrasi Database MySQL & PHP';
      case 'identitas': return 'Pengaturan Identitas & Logo';
      case 'users': return 'Manajemen Akun & Sandi';
      default: return tpqIdentity.name;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left section: Hamburger menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          id="btn-toggle-sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="hidden items-center gap-2 text-sm lg:flex">
          <span className="font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[160px]">{tpqIdentity.name}</span>
          <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
          <span className="font-medium text-slate-700 dark:text-slate-200">{getBreadcrumb(currentTab)}</span>
        </div>
      </div>

      {/* Right section: Dark Mode Toggle, Quick Role Switch, and User Profile */}
      <div className="flex items-center gap-3">
        
        {/* Quick Role Simulation Selector - highly convenient for testing */}
        {currentUser && (
          <div className="hidden items-center gap-1.5 rounded-lg bg-emerald-50/50 px-2.5 py-1 text-xs border border-emerald-100 lg:flex dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <UserCheck size={13} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 mr-1">Simulasi Role:</span>
            <select
              value={currentUser.role}
              onChange={(e) => onQuickSwitchRole(e.target.value as Role)}
              className="bg-transparent font-medium text-emerald-900 outline-hidden cursor-pointer dark:text-emerald-300"
              id="select-quick-role"
            >
              {allRoles.map((r) => (
                <option key={r} value={r} className="text-slate-800 dark:text-slate-900">
                  {r === 'Walikelas' || r === 'Admin' ? 'Admin' : r === 'OrangTua' ? 'Wali Santri' : r === 'KepalaTPQ' ? 'Kepala TPQ' : r}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Light/Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          title="Toggle tema warna"
          id="btn-toggle-darkmode"
        >
          {darkMode ? <Sun size={19} className="text-amber-500" /> : <Moon size={19} />}
        </button>

        {/* User Card */}
        {currentUser && (
          <div className="flex items-center gap-3 border-l border-slate-100 pl-3 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{currentUser.name}</p>
              <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 uppercase dark:bg-emerald-950/60 dark:text-emerald-400">
                {currentUser.role === 'Walikelas' || currentUser.role === 'Admin' ? 'Admin' : currentUser.role === 'OrangTua' ? 'Wali Santri' : currentUser.role === 'KepalaTPQ' ? 'Kepala TPQ' : currentUser.role}
              </span>
            </div>
            
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xs">
              <User size={18} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
