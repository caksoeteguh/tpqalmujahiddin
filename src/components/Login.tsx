/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  BookOpenCheck, 
  RefreshCw, 
  ShieldAlert, 
  Check, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { User as UserType, Role, TpqIdentity } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType, remember: boolean) => void;
  usersList: UserType[];
  tpqIdentity: TpqIdentity;
}

export default function Login({ onLoginSuccess, usersList, tpqIdentity }: LoginProps) {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password'); // pre-seed 'password'
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password reset simulation
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Coba login via PHP API (cPanel MySQL) jika tersedia
    fetch('/php/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(async (res) => {
      // Periksa apakah responsenya valid JSON (menghindari error HTML jika path salah)
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;
      
      if (res.ok && data && data.status === 'success') {
        onLoginSuccess(data.user, rememberMe);
      } else if (data && data.status === 'error') {
        setErrorMsg(data.message || 'Username atau Password tidak cocok.');
      } else {
        throw new Error("Invalid API response");
      }
    })
    .catch(err => {
      console.warn("Gagal menghubungi PHP API, menggunakan mode offline (localStorage):", err);
      // Fallback offline / localStorage (untuk preview di AI Studio)
      const cleanUser = username.trim().toLowerCase();
      const foundUser = usersList.find(u => u.username.toLowerCase() === cleanUser);
      const expectedPassword = foundUser?.password || 'password';

      if (foundUser && password === expectedPassword) {
        onLoginSuccess(foundUser, rememberMe);
      } else {
        setErrorMsg(`Username atau Password tidak cocok. (Gunakan kata sandi: "${expectedPassword}")`);
      }
    });
  };

  // Quick action shortcut loggers (great for evaluators)
  const handleQuickLogin = (user: UserType) => {
    onLoginSuccess(user, rememberMe);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername.trim()) return;

    // Simulate reset
    setResetSuccess(`Instruksi pengaturan ulang sandi dikirim ke email terdaftar untuk username: "${resetUsername}"!`);
    setTimeout(() => {
      setResetSuccess(null);
      setShowResetModal(false);
      setResetUsername('');
    }, 4000);
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none mb-4 overflow-hidden">
            {tpqIdentity.logo && tpqIdentity.logo.startsWith('data:image') ? (
              <img src={tpqIdentity.logo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${
                tpqIdentity.logo === 'PRESET_BLUE' ? 'bg-indigo-600' :
                tpqIdentity.logo === 'PRESET_GOLD' ? 'bg-amber-500 text-slate-900' :
                tpqIdentity.logo === 'PRESET_TEAL' ? 'bg-teal-500' :
                'bg-emerald-500'
              }`}>
                <BookOpenCheck size={32} />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            {tpqIdentity.name}
          </h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Sistem Informasi Evaluasi Mengaji TPQ Terintegrasi
          </p>
        </div>

        {/* Card wrapper */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-900 dark:bg-slate-900/60">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-600 flex items-center gap-2 dark:bg-rose-950/20 dark:text-rose-400">
                <ShieldAlert size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block dark:text-slate-400">Username Akun</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan username Anda..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
                <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block dark:text-slate-400">Kata Sandi</label>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-semibold text-slate-600 cursor-pointer dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Ingat Saya di Browser Ini
              </label>
              <span className="text-slate-400">Session Aktif</span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none"
            >
              Masuk Dashboard Aplikasi &raquo;
            </button>

          </form>

        </div>

        {/* Footer legalities */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          {tpqIdentity.name} &copy; 2026 | Created by Cak Soeteguh Al Mujahidin
        </p>
      </div>

      {/* PASSWORD RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800 animate-fadeIn">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Lupa Kata Sandi?</h3>
            <p className="text-xs text-slate-400 mt-1">Masukkan username akun Anda untuk menyetel ulang.</p>

            <form onSubmit={handleResetSubmit} className="space-y-4 mt-4">
              {resetSuccess ? (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  {resetSuccess}
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 dark:text-slate-400">Username Terdaftar</label>
                  <input
                    type="text"
                    placeholder="cth: admin"
                    value={resetUsername}
                    onChange={(e) => setResetUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold outline-hidden focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Tutup
                </button>
                {!resetSuccess && (
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    Setel Ulang Sandi
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        </div>
      )}

    </div>
  );
}
