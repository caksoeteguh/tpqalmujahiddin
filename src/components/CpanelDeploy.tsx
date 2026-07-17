import { Server, FileText, AlertCircle, Database, Code } from 'lucide-react';

export const CpanelDeploy = () => {
  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Deploy ke CPanel / XAMPP (PHP & SQL)</h2>
      
      <div className="space-y-6 text-slate-600 dark:text-slate-300">
        <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-xl border border-amber-100 dark:border-amber-900 flex items-start gap-4">
          <AlertCircle size={24} className="text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200">Konfigurasi PHP Native</h3>
            <p className="text-sm">
              Karena Anda akan menggunakan PHP Native dan MySQL, aplikasi ini perlu disesuaikan untuk mengambil data dari backend PHP Anda, bukan dari localStorage.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Database size={18} />
              1. database.sql
            </h3>
            <p className="text-xs mb-3 text-slate-500">Buat database baru di MySQL/phpMyAdmin dan jalankan perintah ini:</p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-[10px] overflow-x-auto font-mono">
{`CREATE TABLE santri (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    barcode VARCHAR(100),
    kelasId VARCHAR(36),
    parentName VARCHAR(255)
);

-- Tambahkan tabel lainnya sesuai kebutuhan...`}
            </pre>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Code size={18} />
              2. api.php
            </h3>
            <p className="text-xs mb-3 text-slate-500">Buat file api.php untuk menangani request:</p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded text-[10px] overflow-x-auto font-mono">
{`<?php
header('Content-Type: application/json');
$pdo = new PDO('mysql:host=localhost;dbname=nama_db', 'user', 'pass');

$action = $_GET['action'] ?? '';

if ($action === 'get_santri') {
    $stmt = $pdo->query("SELECT * FROM santri");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>`}
            </pre>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-xl border border-blue-100 dark:border-blue-900 flex items-start gap-4">
          <Server size={24} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-200">Langkah-langkah Deploy:</h3>
            <ol className="list-decimal pl-5 space-y-2 mt-2 text-sm">
              <li>Jalankan <code>npm run build</code> di terminal proyek Anda.</li>
              <li>Salin isi folder <code>dist/</code> ke folder web server Anda (<code>public_html</code> atau <code>htdocs/app</code>).</li>
              <li>Upload file <code>api.php</code> ke folder yang sama.</li>
              <li>Sesuaikan kode React Anda untuk melakukan <code>fetch('/api.php?action=...')</code>.</li>
              <li>Buat file <code>.htaccess</code> (lihat di bawah).</li>
            </ol>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <FileText size={20} />
            Konfigurasi .htaccess (Wajib untuk SPA)
          </h3>
          <p className="text-sm mb-3">
            Agar routing aplikasi tidak error (404) saat diakses, 
            buat file bernama <code>.htaccess</code> di folder yang sama dengan <code>index.html</code> 
            dan masukkan kode berikut:
          </p>
          <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto font-mono">
{`<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`}
          </pre>
        </div>
      </div>
    </div>
  );
};
