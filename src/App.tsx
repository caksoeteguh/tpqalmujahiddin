/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  getStoredData, 
  setStoredData, 
  initializeDB,
  INITIAL_IBADAH_MATERIALS
} from './data';
import { QURAN_SURAHS } from './quran';
import { 
  User, 
  Santri, 
  Kelas, 
  Ustadz, 
  Jilid, 
  Surat, 
  CapaianJilid, 
  CapaianTahfidz, 
  CapaianIbadahPraktis, 
  Role,
  IbadahMaterial,
  TpqIdentity
} from './types';

// Modular Component imports
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BarcodeScanner from './components/BarcodeScanner';
import DataMaster from './components/DataMaster';
import Rekapitulasi from './components/Rekapitulasi';
import IntegrasiHub from './components/IntegrasiHub';
import { CpanelDeploy } from './components/CpanelDeploy';
import Login from './components/Login';
import IdentitasTpq from './components/IdentitasTpq';
import PenempatanSantri from './components/PenempatanSantri';
import UserManagement from './components/UserManagement';
import CurriculumManager from './components/CurriculumManager';
import CetakKartu from './components/CetakKartu';

export default function App() {
  
  // 1. Initialize databases on mount
  useEffect(() => {
    initializeDB();
  }, []);

  // 2. Load lists from local storage with pre-seeded fallback
  const [usersList, setUsersList] = useState<User[]>(() => getStoredData('users', []));
  const [santriList, setSantriList] = useState<Santri[]>(() => getStoredData('santri', []));
  const [kelasList, setKelasList] = useState<Kelas[]>(() => getStoredData('kelas', []));
  const [ustadzList, setUstadzList] = useState<Ustadz[]>(() => getStoredData('ustadz', []));
  const [jilidList, setJilidList] = useState<Jilid[]>(() => getStoredData('jilid', []));
  const [suratList, setSuratList] = useState<Surat[]>(() => {
    const list = getStoredData('surat', []);
    const needsMigration = list.length === 0 || (list.length > 0 && typeof list[0].juz === 'undefined');
    if (list.length < 114 || needsMigration) {
      const mapped = QURAN_SURAHS.map(s => {
        let defaultJuz = 30;
        if (s.number === 1) defaultJuz = 1;
        else if (s.number === 2) defaultJuz = 1;
        else if (s.number === 3) defaultJuz = 3;
        else if (s.number === 4) defaultJuz = 4;
        else if (s.number === 5) defaultJuz = 6;
        else if (s.number === 6) defaultJuz = 7;
        else if (s.number === 7) defaultJuz = 8;
        else if (s.number === 8) defaultJuz = 9;
        else if (s.number === 9) defaultJuz = 10;
        else if (s.number >= 10 && s.number <= 11) defaultJuz = 11;
        else if (s.number === 12) defaultJuz = 12;
        else if (s.number >= 13 && s.number <= 14) defaultJuz = 13;
        else if (s.number >= 15 && s.number <= 16) defaultJuz = 14;
        else if (s.number === 17) defaultJuz = 15;
        else if (s.number === 18) defaultJuz = 15;
        else if (s.number >= 19 && s.number <= 20) defaultJuz = 16;
        else if (s.number === 21) defaultJuz = 17;
        else if (s.number === 22) defaultJuz = 17;
        else if (s.number >= 23 && s.number <= 25) defaultJuz = 18;
        else if (s.number >= 26 && s.number <= 27) defaultJuz = 19;
        else if (s.number >= 28 && s.number <= 29) defaultJuz = 20;
        else if (s.number >= 30 && s.number <= 32) defaultJuz = 21;
        else if (s.number >= 33 && s.number <= 34) defaultJuz = 22;
        else if (s.number >= 35 && s.number <= 36) defaultJuz = 22;
        else if (s.number >= 37 && s.number <= 39) defaultJuz = 23;
        else if (s.number >= 40 && s.number <= 41) defaultJuz = 24;
        else if (s.number >= 42 && s.number <= 45) defaultJuz = 25;
        else if (s.number === 46) defaultJuz = 26;
        else if (s.number >= 47 && s.number <= 51) defaultJuz = 26;
        else if (s.number >= 52 && s.number <= 57) defaultJuz = 27;
        else if (s.number >= 58 && s.number <= 66) defaultJuz = 28;
        else if (s.number >= 67 && s.number <= 77) defaultJuz = 29;
        else if (s.number >= 78) defaultJuz = 30;

        return { id: s.id, name: s.name, totalAyat: s.totalAyat, juz: defaultJuz };
      });
      setStoredData('surat', mapped);
      return mapped;
    }
    return list;
  });
  
  const [capaianJilid, setCapaianJilid] = useState<CapaianJilid[]>(() => getStoredData('capaian_jilid', []));
  const [capaianTahfidz, setCapaianTahfidz] = useState<CapaianTahfidz[]>(() => getStoredData('capaian_tahfidz', []));
  const [capaianIbadah, setCapaianIbadah] = useState<CapaianIbadahPraktis[]>(() => getStoredData('capaian_ibadah_praktis', []));
  const [ibadahMaterials, setIbadahMaterials] = useState<IbadahMaterial[]>(() => getStoredData('ibadah_materials', INITIAL_IBADAH_MATERIALS));
  const [subjectsList, setSubjectsList] = useState<string[]>(() => 
    getStoredData('subjects_list', ['Jilid', 'Tahfidz', 'Ibadah Praktis'])
  );

  const handleUpdateSubjectsList = (newSubjects: string[]) => {
    setSubjectsList(newSubjects);
    setStoredData('subjects_list', newSubjects);
  };

  // 3. App Environment State
  const [tpqIdentity, setTpqIdentity] = useState<TpqIdentity>(() => getStoredData('tpq_identity', {
    name: 'TPQ TPQKita',
    address: 'Gedung Pusat Kajian Islam No. 5',
    phone: '0812-9999-8888',
    logo: '',
    footerText: 'TPQKita Digital Workspace'
  }));

  const handleUpdateIdentity = (newIdentity: TpqIdentity) => {
    setTpqIdentity(newIdentity);
    setStoredData('tpq_identity', newIdentity);
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredData('active_session', null));
  const [darkMode, setDarkMode] = useState<boolean>(() => getStoredData('dark_mode', false));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedBarcodeForEvaluation, setSelectedBarcodeForEvaluation] = useState('');


  // Apply Tailwind theme class on change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setStoredData('dark_mode', darkMode);
  }, [darkMode]);

  // Auth triggers
  const handleLoginSuccess = (user: User, remember: boolean) => {
    setCurrentUser(user);
    if (remember) {
      setStoredData('active_session', user);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ngajiku_active_session');
  };

  const handleQuickSwitchRole = (role: Role) => {
    if (!currentUser) return;
    const matchUser = usersList.find(u => u.role === role) || {
      id: `SIM_${role}`,
      name: `Simulasi ${role}`,
      username: role.toLowerCase(),
      role: role
    };
    
    // Maintain correct linkedId for Orang Tua so they see their child
    if (role === 'OrangTua') {
      matchUser.linkedId = 'S01'; // Default link to Muhammad Rizky
      matchUser.name = 'Budi Santoso (Orang Tua)';
    } else if (role === 'Ustadz') {
      matchUser.linkedId = 'U01';
      matchUser.name = 'Ustadz Ahmad Fauzi, S.Pd.I';
    }

    setCurrentUser(matchUser);
    setStoredData('active_session', matchUser);
  };

  // State modifiers & persistence syncing
  const handleAddSantri = (newSantri: Santri) => {
    const updated = [newSantri, ...santriList];
    setSantriList(updated);
    setStoredData('santri', updated);
  };

  const handleEditSantri = (edited: Santri) => {
    const updated = santriList.map(s => s.id === edited.id ? edited : s);
    setSantriList(updated);
    setStoredData('santri', updated);
  };

  const handleDeleteSantri = (id: string) => {
    const updated = santriList.filter(s => s.id !== id);
    setSantriList(updated);
    setStoredData('santri', updated);
  };

  const handleAddKelas = (newKelas: Kelas) => {
    const updated = [...kelasList, newKelas];
    setKelasList(updated);
    setStoredData('kelas', updated);
  };

  const handleEditKelas = (edited: Kelas) => {
    const updated = kelasList.map(k => k.id === edited.id ? edited : k);
    setKelasList(updated);
    setStoredData('kelas', updated);
  };

  const handleDeleteKelas = (id: string) => {
    const updated = kelasList.filter(k => k.id !== id);
    setKelasList(updated);
    setStoredData('kelas', updated);
  };

  const handleAddUstadz = (newUstadz: Ustadz) => {
    const updated = [...ustadzList, newUstadz];
    setUstadzList(updated);
    setStoredData('ustadz', updated);
  };

  const handleEditUstadz = (edited: Ustadz) => {
    const updated = ustadzList.map(u => u.id === edited.id ? edited : u);
    setUstadzList(updated);
    setStoredData('ustadz', updated);
  };

  const handleDeleteUstadz = (id: string) => {
    const updated = ustadzList.filter(u => u.id !== id);
    setUstadzList(updated);
    setStoredData('ustadz', updated);
  };

  const handleAddJilid = (newJilid: Jilid) => {
    const updated = [...jilidList, newJilid];
    setJilidList(updated);
    setStoredData('jilid', updated);
  };

  const handleEditJilid = (edited: Jilid) => {
    const updated = jilidList.map(j => j.id === edited.id ? edited : j);
    setJilidList(updated);
    setStoredData('jilid', updated);
  };

  const handleDeleteJilid = (id: string) => {
    const updated = jilidList.filter(j => j.id !== id);
    setJilidList(updated);
    setStoredData('jilid', updated);
  };

  const handleAddIbadahMaterial = (newMaterial: IbadahMaterial) => {
    const exists = ibadahMaterials.some(m => m.id === newMaterial.id);
    const updated = exists 
      ? ibadahMaterials.map(m => m.id === newMaterial.id ? newMaterial : m)
      : [...ibadahMaterials, newMaterial];
    setIbadahMaterials(updated);
    setStoredData('ibadah_materials', updated);
  };

  const handleDeleteIbadahMaterial = (id: string) => {
    const updated = ibadahMaterials.filter(m => m.id !== id);
    setIbadahMaterials(updated);
    setStoredData('ibadah_materials', updated);
  };

  const handleAddSurat = (newSurat: Surat) => {
    const updated = [...suratList, newSurat];
    setSuratList(updated);
    setStoredData('surat', updated);
  };

  const handleEditSurat = (edited: Surat) => {
    const updated = suratList.map(s => s.id === edited.id ? edited : s);
    setSuratList(updated);
    setStoredData('surat', updated);
  };

  const handleDeleteSurat = (id: string) => {
    const updated = suratList.filter(s => s.id !== id);
    setSuratList(updated);
    setStoredData('surat', updated);
  };

  const handleAddUser = (newUser: User) => {
    const updated = [newUser, ...usersList];
    setUsersList(updated);
    setStoredData('users', updated);
  };

  const handleEditUser = (editedUser: User) => {
    const updated = usersList.map(u => u.id === editedUser.id ? editedUser : u);
    setUsersList(updated);
    setStoredData('users', updated);
  };

  const handleDeleteUser = (userId: string) => {
    const updated = usersList.filter(u => u.id !== userId);
    setUsersList(updated);
    setStoredData('users', updated);
  };

  const handleBulkImportSantri = (importedList: Santri[]) => {
    const updated = [...importedList, ...santriList];
    setSantriList(updated);
    setStoredData('santri', updated);
  };

  const handleBulkImportUstadz = (importedList: Ustadz[]) => {
    const updated = [...importedList, ...ustadzList];
    setUstadzList(updated);
    setStoredData('ustadz', updated);
  };

  // Student progress evaluators
  const handleAddJilidEvaluation = (evalObj: Omit<CapaianJilid, 'id' | 'updatedAt'>) => {
    const newLog: CapaianJilid = {
      ...evalObj,
      id: `CJ_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const updated = [newLog, ...capaianJilid];
    setCapaianJilid(updated);
    setStoredData('capaian_jilid', updated);
  };

  const handleAddTahfidzEvaluation = (evalObj: Omit<CapaianTahfidz, 'id' | 'updatedAt'>) => {
    const newLog: CapaianTahfidz = {
      ...evalObj,
      id: `CT_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const updated = [newLog, ...capaianTahfidz];
    setTahfidzStatus(updated);
    setStoredData('capaian_tahfidz', updated);
  };

  const setTahfidzStatus = (updated: CapaianTahfidz[]) => {
    setCapaianTahfidz(updated);
  };

  const handleAddIbadahEvaluation = (evalObj: Omit<CapaianIbadahPraktis, 'id' | 'updatedAt'>) => {
    const newLog: CapaianIbadahPraktis = {
      ...evalObj,
      id: `CI_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const updated = [newLog, ...capaianIbadah];
    setCapaianIbadah(updated);
    setStoredData('capaian_ibadah_praktis', updated);
  };

  // Render Login screen if not authenticated
  if (!currentUser) {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        tpqIdentity={tpqIdentity}
        usersList={usersList.length > 0 ? usersList : [
          { id: 'US01', username: 'walikelas', name: 'Ibu Hajjah Khadijah, M.Pd', role: 'Walikelas' },
          { id: 'US02', username: 'kepala', name: 'KH. Maimun Zubair, Lc', role: 'KepalaTPQ' },
          { id: 'US03', username: 'ahmad', name: 'Ustadz Ahmad Fauzi, S.Pd.I', role: 'Ustadz', linkedId: 'U01' },
          { id: 'US05', username: 'budi', name: 'Budi Santoso', role: 'OrangTua', linkedId: 'S01' }
        ]}
      />
    );
  }

  // Render main app container
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 antialiased">
      
      {/* Sidebar navigation drawer */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        role={currentUser.role}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        tpqIdentity={tpqIdentity}
      />

      {/* Outer workspace content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Navbar */}
        <Navbar
          currentUser={currentUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentTab={currentTab}
          allRoles={['Ustadz', 'Walikelas', 'OrangTua', 'KepalaTPQ']}
          onQuickSwitchRole={handleQuickSwitchRole}
          tpqIdentity={tpqIdentity}
        />


         {/* Content canvas viewport */}
         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
           <div className="mx-auto max-w-7xl">
             
             {/* Security check for OrangTua role */}
             {currentUser?.role === 'OrangTua' && currentTab !== 'dashboard' && (
               (() => {
                 setTimeout(() => setCurrentTab('dashboard'), 0);
                 return null;
               })()
             )}

             {/* Dashboard Tab */}
            {currentTab === 'dashboard' && (
              <Dashboard
                currentUser={currentUser}
                santriList={santriList}
                kelasList={kelasList}
                ustadzList={ustadzList}
                capaianJilid={capaianJilid}
                capaianTahfidz={capaianTahfidz}
                capaianIbadah={capaianIbadah}
                jilidList={jilidList}
                suratList={suratList}
                setCurrentTab={setCurrentTab}
                onSetSelectedBarcodeForEvaluation={setSelectedBarcodeForEvaluation}
                tpqIdentity={tpqIdentity}
              />
            )}

            {/* Barcode Scanner Evaluation Tab */}
            {currentTab === 'scanner' && (
              <BarcodeScanner
                santriList={santriList}
                kelasList={kelasList}
                ustadzList={ustadzList}
                jilidList={jilidList}
                suratList={suratList}
                capaianJilid={capaianJilid}
                capaianTahfidz={capaianTahfidz}
                capaianIbadah={capaianIbadah}
                ibadahMaterials={ibadahMaterials}
                subjectsList={subjectsList}
                onAddJilidEvaluation={handleAddJilidEvaluation}
                onAddTahfidzEvaluation={handleAddTahfidzEvaluation}
                onAddIbadahEvaluation={handleAddIbadahEvaluation}
                initialScannedBarcode={selectedBarcodeForEvaluation}
                clearInitialBarcode={() => setSelectedBarcodeForEvaluation('')}
              />
            )}

            {/* Rekapitulasi tab */}
            {currentTab === 'rekapitulasi' && (
              <Rekapitulasi
                santriList={santriList}
                kelasList={kelasList}
                ustadzList={ustadzList}
                jilidList={jilidList}
                suratList={suratList}
                capaianJilid={capaianJilid}
                capaianTahfidz={capaianTahfidz}
                capaianIbadah={capaianIbadah}
                currentUserRole={currentUser?.role}
              />
            )}

            {/* Penempatan Santri tab */}
            {currentTab === 'penempatan-santri' && (
              <PenempatanSantri
                santriList={santriList}
                kelasList={kelasList}
                jilidList={jilidList}
                suratList={suratList}
                ibadahMaterials={ibadahMaterials}
                onEditSantri={handleEditSantri}
                onAddJilidEvaluation={handleAddJilidEvaluation}
                onAddTahfidzEvaluation={handleAddTahfidzEvaluation}
                onAddIbadahEvaluation={handleAddIbadahEvaluation}
                capaianJilid={capaianJilid}
                capaianTahfidz={capaianTahfidz}
                capaianIbadah={capaianIbadah}
              />
            )}

            {/* Data Master Tabs */}
            {currentTab.startsWith('master-') && (
              <DataMaster
                currentTab={currentTab}
                santriList={santriList}
                kelasList={kelasList}
                ustadzList={ustadzList}
                jilidList={jilidList}
                suratList={suratList}
                ibadahMaterials={ibadahMaterials}
                subjectsList={subjectsList}
                currentUserRole={currentUser?.role}
                onAddSantri={handleAddSantri}
                onEditSantri={handleEditSantri}
                onDeleteSantri={handleDeleteSantri}
                onAddKelas={handleAddKelas}
                onEditKelas={handleEditKelas}
                onDeleteKelas={handleDeleteKelas}
                onAddUstadz={handleAddUstadz}
                onEditUstadz={handleEditUstadz}
                onDeleteUstadz={handleDeleteUstadz}
                onAddJilid={handleAddJilid}
                onEditJilid={handleEditJilid}
                onAddSurat={handleAddSurat}
                onEditSurat={handleEditSurat}
                onAddIbadahMaterial={handleAddIbadahMaterial}
                onBulkImportSantri={handleBulkImportSantri}
                onBulkImportUstadz={handleBulkImportUstadz}
              />
            )}

            {/* Cetak Kartu & Barcode Tab */}
            {currentTab === 'cetak-kartu' && (
              <CetakKartu
                santriList={santriList}
                kelasList={kelasList}
                tpqIdentity={tpqIdentity}
              />
            )}

            {/* PHP & MySQL Integration Tab */}
            {currentTab === 'integrasi' && (
              <IntegrasiHub />
            )}

            {/* CPanel Deployment Tab */}
            {currentTab === 'cpanel' && (
              <CpanelDeploy />
            )}

            {/* Curriculum & Custom Subjects Manager */}
            {currentTab === 'kurikulum' && (
              <CurriculumManager
                subjectsList={subjectsList}
                onUpdateSubjectsList={handleUpdateSubjectsList}
                jilidList={jilidList}
                onAddJilid={handleAddJilid}
                onEditJilid={handleEditJilid}
                onDeleteJilid={handleDeleteJilid}
                suratList={suratList}
                onAddSurat={handleAddSurat}
                onEditSurat={handleEditSurat}
                onDeleteSurat={handleDeleteSurat}
                ibadahMaterials={ibadahMaterials}
                onAddIbadahMaterial={handleAddIbadahMaterial}
                onDeleteIbadahMaterial={handleDeleteIbadahMaterial}
                currentUserRole={currentUser?.role || 'Ustadz'}
              />
            )}

            {/* Identitas TPQ Tab */}
            {currentTab === 'identitas' && (
              <IdentitasTpq
                tpqIdentity={tpqIdentity}
                onUpdateIdentity={handleUpdateIdentity}
                currentUserRole={currentUser?.role || 'Ustadz'}
              />
            )}

            {/* User Management Tab */}
            {currentTab === 'users' && (
              <UserManagement
                usersList={usersList}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-3.5 text-center text-[11px] font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          <p>
            {tpqIdentity.footerText} &bull; Created by Cak Soeteguh Al Mujahidin &bull; Crafted with React, Tailwind v4 and Recharts. Designed for desktop and mobile touch.
          </p>
        </footer>

      </div>
    </div>
  );
}
