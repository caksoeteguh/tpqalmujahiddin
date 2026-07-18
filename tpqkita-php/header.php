<?php
// ==========================================
// TPQKITA - SHARED HEADER (header.php)
// Implements unified layout, sidebar & auth guards
// ==========================================

require_once 'config.php';
requireLogin();

// Fetch TPQ Identity name from database
$tpq_name = 'TPQ Al-Falah';
$tpq_footer = 'TPQKita Digital Workspace';
try {
    $db = getDB();
    $stmtId = $db->query("SELECT name, footer_text FROM tpq_identity LIMIT 1");
    $identity = $stmtId->fetch();
    if ($identity) {
        $tpq_name = $identity['name'];
        $tpq_footer = $identity['footer_text'];
    }
} catch (Exception $e) {
    // Silent fallback
}

$role = $_SESSION['role'];
$user_name = $_SESSION['name'];

// Helper to check if a menu is active
function isPageActive($pageName) {
    $current = basename($_SERVER['PHP_SELF']);
    return $current === $pageName;
}
?>
<!DOCTYPE html>
<html lang="id" class="h-full bg-slate-50 text-slate-950">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $tpq_name; ?> - Dashboard Manajemen TPQ</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Plus Jakarta Sans Font -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        @media print {
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body class="h-full flex flex-col md:flex-row bg-slate-50 text-slate-800">

    <!-- Mobile Top Navigation Header -->
    <header class="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 border-b border-slate-800 shadow-md z-30 no-print">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  <path d="m16 10 2 2 4-4"/>
                </svg>
            </div>
            <div>
                <span class="font-extrabold text-lg text-white block">TPQKita</span>
                <span class="text-xs text-slate-400 block max-w-[150px] truncate"><?php echo $tpq_name; ?></span>
            </div>
        </div>
        <button id="mobile-menu-toggle" class="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>
    </header>

    <!-- Sidebar Navigation Drawer -->
    <aside id="sidebar-drawer" class="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 shrink-0 z-40 no-print transition-all duration-300">
        <!-- Sidebar Brand header -->
        <div class="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950">
            <div class="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <div>
                <span class="font-extrabold text-xl text-white tracking-tight">TPQKita</span>
                <span class="text-xs text-slate-400 block max-w-[160px] truncate"><?php echo $tpq_name; ?></span>
            </div>
        </div>

        <!-- Sidebar Navigation Items -->
        <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
            
            <!-- Link Dashboard -->
            <a href="index.php" class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('index.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21.75h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21.75h11.25" />
                </svg>
                Dashboard
            </a>

            <!-- Submenu Master Data (Admins/Kepala/Walikelas) -->
            <?php if (in_array($role, ['Walikelas', 'KepalaTPQ'])): ?>
                <div class="pt-4 pb-2 px-4">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Master Data</span>
                </div>
                
                <a href="santri.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('santri.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.771m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    Data Santri
                </a>

                <a href="ustadz.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('ustadz.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A5.905 5.905 0 0 1 8 3.443m1.232 4.095a50.565 50.565 0 0 1 5.536 0m.432-1.127a4.912 4.912 0 0 1 1.232 4.095m0 0c.135.845.21 1.706.224 2.583m-12.224 0c.134-.877.21-1.738.224-2.583m4.328-1.233a3 3 0 1 1-3 3M12 18.75a6 6 0 0 0 6-6V12a6 6 0 0 0-12 0v.75a6 6 0 0 0 6 6Z" />
                    </svg>
                    Data Ustadz
                </a>

                <a href="kelas.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('kelas.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3.75-6H15m-1.5 3H15m-1.5 3H15M9 16.5h1.5M13.5 16.5H15" />
                    </svg>
                    Data Kelas
                </a>
                
                <a href="penempatan.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('penempatan.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                    Penempatan Kelas
                </a>

                <a href="kurikulum.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('kurikulum.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                    Data Kurikulum
                </a>
            <?php endif; ?>

            <!-- Operational Sections -->
            <div class="pt-4 pb-2 px-4">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evaluasi &amp; Cetak</span>
            </div>

            <?php if ($role !== 'OrangTua'): ?>
                <!-- Camera Web Scanner -->
                <a href="scanner.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('scanner.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    Scanner Kamera (Webcam)
                </a>

                <!-- Manual evaluation -->
                <a href="evaluasi.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('evaluasi.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Input Evaluasi Manual
                </a>
            <?php endif; ?>

            <!-- Cetak Kartu Lanyard (Available for Parents (only their kids) or admins) -->
            <a href="cetak_kartu.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('cetak_kartu.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5m-3-11.25h13.5m-13.5 9h13.5M6.75 5.25h10.5a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 .75-.75Z" />
                </svg>
                Cetak Kartu &amp; Lanyard
            </a>

            <!-- Rekapitulasi Pembelajaran -->
            <a href="rekapitulasi.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('rekapitulasi.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                Rekapitulasi Capaian
            </a>

            <!-- Identitas TPQ (Admins/Kepala) -->
            <?php if (in_array($role, ['Walikelas', 'KepalaTPQ'])): ?>
                <div class="pt-4 pb-2 px-4">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lembaga</span>
                </div>
                
                <a href="identitas.php" class="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition duration-150 <?php echo isPageActive('identitas.php') ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'hover:bg-slate-800 hover:text-white text-slate-400'; ?>">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 0 0-4.5 4.5v.75h18V21a4.5 4.5 0 0 0-4.5-4.5h-.75c-.702 0-1.4-.03-2.089-.09m0-5.625a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM20.25 6H18.75V4.5A1.5 1.5 0 0 0 17.25 3h-10.5A1.5 1.5 0 0 0 5.25 4.5V6H3.75A1.5 1.5 0 0 0 2.25 7.5v6.75A1.5 1.5 0 0 0 3.75 15.75h16.5a1.5 1.5 0 0 0 1.5-1.5V7.5A1.5 1.5 0 0 0 20.25 6Z" />
                    </svg>
                    Profil Lembaga TPQ
                </a>
            <?php endif; ?>

        </nav>

        <!-- Sidebar footer / log out -->
        <div class="p-4 border-t border-slate-800 bg-slate-950">
            <div class="flex items-center gap-3 mb-3.5 px-2">
                <div class="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-100 uppercase text-sm border border-slate-700">
                    <?php echo substr($user_name, 0, 2); ?>
                </div>
                <div class="min-w-0">
                    <span class="block text-sm font-bold text-white truncate"><?php echo $user_name; ?></span>
                    <span class="block text-[11px] font-semibold text-emerald-400 uppercase tracking-wider"><?php echo $role; ?></span>
                </div>
            </div>
            <a href="logout.php" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
                Keluar Sistem
            </a>
        </div>
    </aside>

    <!-- Main Workspace Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        
        <!-- Top Sticky Header for Large Screens -->
        <header class="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200/80 shadow-sm z-10 no-print">
            <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Workspace Digital</span>
                <span class="text-slate-300">&bull;</span>
                <span class="text-xs text-slate-500 font-bold"><?php echo formatIndoDate(date('Y-m-d')); ?></span>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="text-right">
                    <span class="block text-sm font-bold text-slate-800 leading-none"><?php echo $user_name; ?></span>
                    <span class="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-1"><?php echo $role; ?></span>
                </div>
                <div class="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center uppercase shadow-sm">
                    <?php echo substr($user_name, 0, 2); ?>
                </div>
            </div>
        </header>

        <!-- Content Page wrapper -->
        <div class="p-4 md:p-8 flex-1">
