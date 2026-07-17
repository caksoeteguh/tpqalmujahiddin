/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Key, 
  Lock, 
  ShieldCheck, 
  Plus, 
  Edit, 
  Trash, 
  Eye, 
  EyeOff, 
  Search, 
  Save, 
  CheckCircle,
  X,
  UserCheck
} from 'lucide-react';
import ExcelImportExport from './ExcelImportExport';
import { User, Role } from '../types';

interface UserManagementProps {
  usersList: User[];
  onAddUser: (u: User) => void;
  onEditUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
}

export default function UserManagement({
  usersList,
  onAddUser,
  onEditUser,
  onDeleteUser
}: UserManagementProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form fields
  const [id, setId] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Ustadz');
  const [password, setPassword] = useState('password');
  const [linkedId, setLinkedId] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  const handleImportUsers = (newUsers: User[]) => {
    newUsers.forEach(u => onAddUser(u));
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setId(`US${Date.now().toString().slice(-4)}`);
    setUsername('');
    setName('');
    setRole('Ustadz');
    setPassword('password');
    setLinkedId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setId(u.id);
    setUsername(u.username);
    setName(u.name);
    setRole(u.role);
    setPassword(u.password || 'password');
    setLinkedId(u.linkedId || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;

    const userData: User = {
      id,
      username: username.trim().toLowerCase(),
      name: name.trim(),
      role,
      password: password || 'password',
      linkedId: linkedId.trim() || undefined
    };

    if (editingUser) {
      onEditUser(userData);
    } else {
      onAddUser(userData);
    }
    setIsModalOpen(false);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Filter users based on query and role matching
  const filteredUsers = usersList.filter(u => {
    const query = searchQuery.toLowerCase();
    const roleLabel = (u.role === 'Walikelas' || u.role === 'Admin') ? 'admin' : u.role.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      roleLabel.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
            🔑 Manajemen Akun & Kata Sandi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Menu Administrator untuk mengelola kredensial masuk (username dan password) bagi Ustadz/Guru Bimbingan, Admin, Wali Santri (Orang Tua), dan Kepala TPQ.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white transition-all hover:bg-indigo-700 hover:scale-[1.02] cursor-pointer"
        >
          <Plus size={15} /> Tambah Akun Baru
        </button>
      </div>

      {/* Import/Export */}
      <ExcelImportExport type="user" onImport={handleImportUsers} />

      {/* Search and Table Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 relative max-w-md">
          <Search className="absolute top-2.5 left-3 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Cari nama, username, atau peran pengguna..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-950"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
                <th className="px-5 py-3">Nama Pengguna</th>
                <th className="px-5 py-3">Username Login</th>
                <th className="px-5 py-3">Kata Sandi</th>
                <th className="px-5 py-3">Peran / Hak Akses</th>
                <th className="px-5 py-3">ID Terkait</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => {
                const showPassword = showPasswordMap[user.id] || false;
                const displayPassword = user.password || 'password';
                
                // Friendly badge color depending on role
                let roleColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                let displayRole: string = user.role;
                
                if (user.role === 'Admin' || user.role === 'Walikelas') {
                  roleColor = 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50';
                  displayRole = 'Admin';
                } else if (user.role === 'KepalaTPQ') {
                  roleColor = 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50';
                  displayRole = 'Kepala TPQ';
                } else if (user.role === 'Ustadz') {
                  roleColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50';
                  displayRole = 'Ustadz';
                } else if (user.role === 'OrangTua') {
                  roleColor = 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50';
                  displayRole = 'Wali Santri';
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-850 dark:text-slate-100">{user.name}</td>
                    <td className="px-5 py-3.5">
                      <code className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">{user.username}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-50 text-slate-600 border border-slate-100 dark:bg-slate-950 dark:border-slate-850 px-2 py-1 rounded-md font-mono text-[11px] min-w-[100px] block">
                          {showPassword ? displayPassword : '••••••••'}
                        </code>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleColor}`}>
                        {displayRole}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.linkedId ? (
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded-sm">
                          {user.linkedId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Tidak Ada</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          title="Ubah data"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus akun pengguna ${user.name}?`)) {
                              onDeleteUser(user.id);
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

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                    Pengguna tidak ditemukan. Silakan tambahkan akun baru!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT / ADD DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-850">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <Lock size={16} className="text-indigo-600" /> {editingUser ? 'Ubah Data Akun' : 'Tambah Akun Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Nama Lengkap Pengguna</label>
                <input
                  type="text"
                  placeholder="cth: Ustadz Ahmad Fauzi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Username Masuk (Login)</label>
                <input
                  type="text"
                  placeholder="cth: ahmad_fauzi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Kata Sandi (Password)</label>
                <input
                  type="text"
                  placeholder="cth: rahasia123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Hak Akses (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Ustadz">Ustadz / Guru</option>
                    <option value="OrangTua">Wali Santri</option>
                    <option value="KepalaTPQ">Kepala TPQ</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">ID Terkait (Opsional)</label>
                  <input
                    type="text"
                    placeholder="cth: U01 atau S01"
                    value={linkedId}
                    onChange={(e) => setLinkedId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  <Save size={14} /> Simpan Akun
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
