<?php
// ==========================================
// TPQKITA - CONFIGURATION FILE (config.php)
// Compatible with XAMPP (PHP 5.6 to PHP 8.3+)
// ==========================================

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_tpqkita');

// Start PHP Session
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

/**
 * Returns a PDO connection to the MySQL database.
 */
function getDB() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // If connection fails, output a beautifully designed error page
        die("
        <!DOCTYPE html>
        <html lang='id'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Koneksi Database Gagal - TPQKita</title>
            <script src='https://cdn.tailwindcss.com'></script>
        </head>
        <body class='bg-slate-50 flex items-center justify-center min-h-screen p-4 font-sans'>
            <div class='bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md w-full text-center'>
                <div class='w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor' class='w-8 h-8'>
                        <path stroke-linecap='round' stroke-linejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' />
                    </svg>
                </div>
                <h1 class='text-2xl font-bold text-slate-800 mb-2'>Koneksi Database Gagal</h1>
                <p class='text-slate-600 text-sm mb-6'>
                    Aplikasi gagal terhubung ke database MySQL. Pastikan MySQL di control panel XAMPP Anda sudah aktif, dan database bernama <code class='bg-slate-100 px-1 py-0.5 rounded font-mono text-red-600 font-bold'>db_tpqkita</code> sudah di-import melalui phpMyAdmin.
                </p>
                <div class='bg-slate-50 rounded-xl p-4 text-left font-mono text-xs text-slate-500 overflow-x-auto mb-6'>
                    <strong>Detail Error:</strong><br>" . htmlspecialchars($e->getMessage()) . "
                </div>
                <button onclick='window.location.reload()' class='w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-200 shadow-md shadow-slate-900/10'>
                    Coba Hubungkan Ulang
                </button>
            </div>
        </body>
        </html>
        ");
    }
}

/**
 * Checks if the user is authenticated, else redirects to login.php
 */
function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit();
    }
}

/**
 * Checks if current user belongs to allowed roles.
 */
function requireRoles($allowedRoles) {
    requireLogin();
    if (!in_array($_SESSION['role'], $allowedRoles)) {
        header("Location: index.php?error=unauthorized");
        exit();
    }
}

/**
 * Returns formatted date in Indonesian format.
 */
function formatIndoDate($dateString) {
    if (!$dateString) return '-';
    $months = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $time = strtotime($dateString);
    $day = date('j', $time);
    $month = $months[(int)date('n', $time)];
    $year = date('Y', $time);
    return "$day $month $year";
}

/**
 * Sanitizes input string to prevent XSS.
 */
function sanitize($str) {
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}
?>
