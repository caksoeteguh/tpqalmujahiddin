/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Code, 
  Copy, 
  Check, 
  Database, 
  Server, 
  FileCode, 
  Terminal, 
  CheckCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { 
  MYSQL_SCHEMA, 
  PHP_CONFIG, 
  PHP_LOGIN, 
  PHP_SCAN_BARCODE, 
  PHP_SUBMIT_EVALUATION,
  PHP_GET_DASHBOARD_DATA,
  PHP_MANAGE_SANTRI,
  PHP_MANAGE_USTADZ,
  PHP_MANAGE_KELAS,
  PHP_MANAGE_IDENTITY,
  PHP_MANAGE_CURRICULUM
} from '../mysql_php_export';

type CodeTab = 'sql' | 'config' | 'login' | 'scan' | 'submit' | 'dashboard' | 'santri' | 'ustadz' | 'kelas' | 'identity' | 'curriculum';

export default function IntegrasiHub() {

  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('sql');
  const [copied, setCopied] = useState(false);

  const getCodeContent = () => {
    switch (activeCodeTab) {
      case 'sql': return MYSQL_SCHEMA;
      case 'config': return PHP_CONFIG;
      case 'login': return PHP_LOGIN;
      case 'scan': return PHP_SCAN_BARCODE;
      case 'submit': return PHP_SUBMIT_EVALUATION;
      case 'dashboard': return PHP_GET_DASHBOARD_DATA;
      case 'santri': return PHP_MANAGE_SANTRI;
      case 'ustadz': return PHP_MANAGE_USTADZ;
      case 'kelas': return PHP_MANAGE_KELAS;
      case 'identity': return PHP_MANAGE_IDENTITY;
      case 'curriculum': return PHP_MANAGE_CURRICULUM;
      default: return '';
    }
  };

  const getFilename = () => {
    switch (activeCodeTab) {
      case 'sql': return 'db_tpqkita.sql';
      case 'config': return 'config.php';
      case 'login': return 'login.php';
      case 'scan': return 'scan_barcode.php';
      case 'submit': return 'submit_evaluation.php';
      case 'dashboard': return 'get_dashboard_data.php';
      case 'santri': return 'manage_santri.php';
      case 'ustadz': return 'manage_ustadz.php';
      case 'kelas': return 'manage_kelas.php';
      case 'identity': return 'manage_identity.php';
      case 'curriculum': return 'manage_curriculum.php';
      default: return 'code.txt';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };


  return (
    <div className="space-y-6">
      
      {/* Dev Hub Explanation Banner */}
      <div className="rounded-xl border border-indigo-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-4 items-start">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 shrink-0">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Ekspor Database & Back-End API (PHP 7.3 + MySQL)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Aplikasi ini sepenuhnya dirancang agar **mudah di-deploy** pada server PHP 7.3 & database MySQL/MariaDB tradisional (seperti XAMPP, cPanel, atau VPS). Salin kode-kode di bawah ini untuk membuat database dan mengaktifkan REST API backend server Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Step-by-Step implementation instructions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Terminal size={14} /> Langkah Instalasi:
            </h4>
            
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-[10px] shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-300">Buat Database</p>
                  <p className="mt-0.5">Salin tab <span className="font-semibold">MySQL Schema</span> dan eksekusi di phpMyAdmin atau terminal database.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-[10px] shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-300">Buat File Server</p>
                  <p className="mt-0.5">Buat folder baru di htdocs (cth: <span className="font-mono font-bold bg-slate-100 px-1 rounded dark:bg-slate-800">/tpqkita/</span>) dan buat file php sesuai tab masing-masing.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-[10px] shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-300">Konfigurasi DB</p>
                  <p className="mt-0.5">Edit file <span className="font-mono font-semibold text-indigo-500">config.php</span> sesuaikan dengan host, username, & password MySQL Anda.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-[10px] shrink-0">4</span>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-300">Siap Digunakan</p>
                  <p className="mt-0.5">Aplikasi client siap berkomunikasi menggunakan Axios menuju backend PHP Anda!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50/50 p-4 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/40">
            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
              <FolderOpen size={14} /> Struktur Folder API:
            </h4>
            <pre className="mt-2 text-[10px] font-mono text-indigo-900 dark:text-indigo-300">
{`/xampp/htdocs/tpqkita/
  ├── config.php
  ├── login.php
  ├── scan_barcode.php
  ├── submit_evaluation.php
  ├── get_dashboard_data.php
  ├── manage_santri.php
  ├── manage_ustadz.php
  ├── manage_kelas.php
  ├── manage_identity.php
  └── manage_curriculum.php`}
            </pre>
          </div>
        </div>

        {/* Code tabs displayer */}
        <div className="lg:col-span-3 rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          
          {/* Categorized Files tabs selection */}
          <div className="bg-slate-50 border-b border-slate-100 p-3 dark:border-slate-800 dark:bg-slate-950/40 space-y-3">
            {/* Category 1 */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">1. Konfigurasi & Basis Data</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveCodeTab('sql')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'sql' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Database size={12} /> db_tpqkita.sql
                </button>
                <button
                  onClick={() => setActiveCodeTab('config')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'config' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> config.php
                </button>
                <button
                  onClick={() => setActiveCodeTab('identity')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'identity' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> manage_identity.php
                </button>
              </div>
            </div>

            {/* Category 2 */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">2. Otentikasi & Layanan Data</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveCodeTab('login')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'login' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> login.php
                </button>
                <button
                  onClick={() => setActiveCodeTab('scan')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'scan' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> scan_barcode.php
                </button>
                <button
                  onClick={() => setActiveCodeTab('dashboard')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> get_dashboard_data.php
                </button>
              </div>
            </div>

            {/* Category 3 */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">3. Manajemen Kurikulum & CRUD Master</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveCodeTab('submit')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'submit' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> submit_evaluation.php
                </button>
                <button
                  onClick={() => setActiveCodeTab('santri')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'santri' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> manage_santri.php
                </button>
                <button
                  onClick={() => setActiveCodeTab('ustadz')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'ustadz' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> manage_ustadz.php
                </button>
                <button
                  onClick={() => setActiveCodeTab('kelas')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'kelas' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> manage_kelas.php
                </button>
                <button
                  onClick={() => setActiveCodeTab('curriculum')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCodeTab === 'curriculum' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
                  }`}
                >
                  <FileCode size={12} /> manage_curriculum.php
                </button>
              </div>
            </div>
          </div>


          {/* Code Window Header */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
            <span className="text-xs font-mono font-medium">{getFilename()}</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded hover:bg-slate-750 transition-all text-white"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Actual Code editor area */}
          <div className="relative">
            <pre className="p-5 overflow-auto text-xs font-mono bg-slate-950 text-slate-300 max-h-[460px] leading-relaxed select-all">
              {getCodeContent()}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
