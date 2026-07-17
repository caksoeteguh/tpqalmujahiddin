<?php
// ==========================================
// TPQKITA - MAIN DASHBOARD (index.php)
// Executive summaries, real-time metrics, & reports
// ==========================================

require_once 'header.php';

$db = getDB();

// Handle "OrangTua" dashboard variant
if ($role === 'OrangTua') {
    $santri_id = $_SESSION['linked_id'];
    
    // Fetch student data
    $stmtS = $db->prepare("
        SELECT s.*, k.name AS nama_kelas, u.name AS nama_ustadz, u.phone AS hp_ustadz
        FROM santri s
        LEFT JOIN kelas k ON s.kelas_id = k.id
        LEFT JOIN ustadz u ON k.ustadz_id = u.id
        WHERE s.id = ? LIMIT 1
    ");
    $stmtS->execute([$santri_id]);
    $santri = $stmtS->fetch();

    if (!$santri) {
        echo "<div class='bg-yellow-50 text-yellow-800 p-6 rounded-2xl border border-yellow-100'>Data santri tidak terhubung dengan akun Orang Tua Anda. Hubungi Administrator.</div>";
        require_once 'footer.php';
        exit();
    }

    // Fetch Jilid progress
    $stmtJ = $db->prepare("
        SELECT cj.*, j.name AS nama_jilid 
        FROM capaian_jilid cj 
        JOIN jilid j ON cj.jilid_id = j.id 
        WHERE cj.santri_id = ? 
        ORDER BY cj.updated_at DESC, cj.id DESC LIMIT 1
    ");
    $stmtJ->execute([$santri_id]);
    $capaian_jilid = $stmtJ->fetch();

    // Fetch Tahfidz progress
    $stmtT = $db->prepare("
        SELECT ct.*, s.name AS nama_surat 
        FROM capaian_tahfidz ct 
        JOIN surat s ON ct.surat_id = s.id 
        WHERE ct.santri_id = ? 
        ORDER BY ct.updated_at DESC, ct.id DESC LIMIT 1
    ");
    $stmtT->execute([$santri_id]);
    $capaian_tahfidz = $stmtT->fetch();

    // Fetch recent logs
    $recent_evals = [];
    try {
        $stmtLogs = $db->prepare("
            (SELECT 'jilid' AS type, j.name AS item, CAST(cj.page AS CHAR) AS detail, cj.status, cj.notes, cj.updated_at, u.name AS ustadz
             FROM capaian_jilid cj
             JOIN jilid j ON cj.jilid_id = j.id
             JOIN ustadz u ON cj.ustadz_id = u.id
             WHERE cj.santri_id = ?)
            UNION ALL
            (SELECT 'tahfidz' AS type, s.name AS item, ct.ayat_range AS detail, ct.status, ct.notes, ct.updated_at, u.name AS ustadz
             FROM capaian_tahfidz ct
             JOIN surat s ON ct.surat_id = s.id
             JOIN ustadz u ON ct.ustadz_id = u.id
             WHERE ct.santri_id = ?)
            UNION ALL
            (SELECT 'ibadah' AS type, cip.item AS item, cip.category AS detail, cip.status, cip.notes, cip.updated_at, u.name AS ustadz
             FROM capaian_ibadah_praktis cip
             JOIN ustadz u ON cip.ustadz_id = u.id
             WHERE cip.santri_id = ?)
            ORDER BY updated_at DESC LIMIT 15
        ");
        $stmtLogs->execute([$santri_id, $santri_id, $santri_id]);
        $recent_evals = $stmtLogs->fetchAll();
    } catch (Exception $ex) {
        // Fallback
    }
    ?>

    <!-- Orang Tua Dashboard Layout -->
    <div class="space-y-8 animate-fade-in">
        <!-- Welcoming title banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div class="relative z-10 space-y-2">
                <span class="text-emerald-400 font-extrabold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Portal Wali Santri</span>
                <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight">Assalamu'alaikum, Bapak/Ibu <?php echo htmlspecialchars($user_name); ?></h2>
                <p class="text-slate-300 text-sm max-w-xl">Pantau tumbuh kembang pembelajaran Al-Qur'an dan ibadah ananda tercinta secara langsung dan real-time dari rumah.</p>
            </div>
            
            <a href="cetak_kartu.php" class="relative z-10 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-5 rounded-2xl transition duration-150 shadow-lg shadow-emerald-500/10 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5m-3-11.25h13.5m-13.5 9h13.5M6.75 5.25h10.5a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1 .75-.75Z" />
                </svg>
                Cetak Kartu Lanyard
            </a>
        </div>

        <!-- Student profile grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Student card -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                <div class="text-center space-y-3 pb-6 border-b border-slate-100">
                    <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black border-4 border-white shadow-md">
                        <?php echo substr($santri['name'], 0, 1); ?>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-slate-800"><?php echo htmlspecialchars($santri['name']); ?></h3>
                        <p class="text-xs font-semibold text-slate-400 font-mono mt-0.5"><?php echo htmlspecialchars($santri['barcode']); ?></p>
                    </div>
                    <span class="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full"><?php echo htmlspecialchars($santri['nama_kelas'] ?? 'Belum Ditentukan'); ?></span>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400 font-medium">Ustadz Pembimbing</span>
                        <span class="font-semibold text-slate-700 text-right"><?php echo htmlspecialchars($santri['nama_ustadz'] ?? '-'); ?></span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400 font-medium">Tempat Lahir</span>
                        <span class="font-semibold text-slate-700"><?php echo htmlspecialchars($santri['birth_place'] ?? '-'); ?></span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400 font-medium">Tanggal Lahir</span>
                        <span class="font-semibold text-slate-700"><?php echo formatIndoDate($santri['birth_date']); ?></span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400 font-medium">Kontak Wali Kelas</span>
                        <span class="font-semibold text-indigo-600 font-mono"><?php echo htmlspecialchars($santri['hp_ustadz'] ?? '-'); ?></span>
                    </div>
                </div>
            </div>

            <!-- Capaian metrics -->
            <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Jilid progress -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
                    <div class="flex justify-between items-start mb-4">
                        <div class="space-y-1">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Capaian Jilid</span>
                            <h4 class="text-2xl font-black text-slate-800"><?php echo htmlspecialchars($capaian_jilid['nama_jilid'] ?? 'Belum Memulai'); ?></h4>
                        </div>
                        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 space-y-2">
                        <div class="flex justify-between text-xs font-bold">
                            <span class="text-slate-400">Halaman Terakhir</span>
                            <span class="text-slate-700">Hal. <?php echo htmlspecialchars($capaian_jilid['page'] ?? '-'); ?></span>
                        </div>
                        <div class="flex justify-between text-xs font-bold">
                            <span class="text-slate-400">Status Kelulusan</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider <?php echo (isset($capaian_jilid['status']) && $capaian_jilid['status'] === 'Lulus') ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'; ?>">
                                <?php echo htmlspecialchars($capaian_jilid['status'] ?? '-'); ?>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Tahfidz progress -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
                    <div class="flex justify-between items-start mb-4">
                        <div class="space-y-1">
                            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Tahfidz Qur'an</span>
                            <h4 class="text-2xl font-black text-slate-800">QS. <?php echo htmlspecialchars($capaian_tahfidz['nama_surat'] ?? 'Belum Memulai'); ?></h4>
                        </div>
                        <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.578 13.47a3.375 3.375 0 0 0-3.13-2.094H12c-.414 0-.75-.336-.75-.75V7.031c0-1.284-.705-2.454-1.83-3.035a2.25 2.25 0 0 0-3.26 2.231M19.5 19.5l-3-3m-3.5-3a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
                            </svg>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-100 space-y-2">
                        <div class="flex justify-between text-xs font-bold">
                            <span class="text-slate-400">Ayat Terakhir</span>
                            <span class="text-slate-700">Ayat <?php echo htmlspecialchars($capaian_tahfidz['ayat_range'] ?? '-'); ?></span>
                        </div>
                        <div class="flex justify-between text-xs font-bold">
                            <span class="text-slate-400">Status Setor</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider <?php echo (isset($capaian_tahfidz['status']) && $capaian_tahfidz['status'] === 'Lulus') ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'; ?>">
                                <?php echo htmlspecialchars($capaian_tahfidz['status'] ?? '-'); ?>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Progress Timeline list -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h3 class="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                Linimasa Riwayat Evaluasi Pembelajaran
            </h3>

            <?php if (empty($recent_evals)): ?>
                <div class="text-center py-10 space-y-2">
                    <p class="text-slate-400 font-bold text-sm">Belum ada catatan riwayat evaluasi.</p>
                    <p class="text-slate-400 text-xs">Catatan perkembangan ananda akan muncul di sini segera setelah dievaluasi oleh Ustadz.</p>
                </div>
            <?php else: ?>
                <div class="relative pl-6 border-l border-slate-100 space-y-6">
                    <?php foreach ($recent_evals as $eval): ?>
                        <div class="relative">
                            <!-- Bullet marker -->
                            <span class="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm <?php echo $eval['status'] === 'Lulus' ? 'bg-emerald-500' : 'bg-amber-500'; ?>"></span>
                            
                            <div class="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-colors duration-150 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div class="space-y-1.5">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700"><?php echo htmlspecialchars($eval['type']); ?></span>
                                        <span class="text-sm font-bold text-slate-800"><?php echo htmlspecialchars($eval['item']); ?> (<?php echo htmlspecialchars($eval['detail']); ?>)</span>
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase <?php echo $eval['status'] === 'Lulus' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-amber-700 bg-amber-50 border border-amber-100'; ?>"><?php echo htmlspecialchars($eval['status']); ?></span>
                                    </div>
                                    <?php if (!empty($eval['notes'])): ?>
                                        <p class="text-slate-600 text-sm italic font-medium">"<?php echo htmlspecialchars($eval['notes']); ?>"</p>
                                    <?php endif; ?>
                                    <div class="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span>Oleh: <strong><?php echo htmlspecialchars($eval['ustadz']); ?></strong></span>
                                    </div>
                                </div>
                                <span class="text-xs font-bold text-slate-400 whitespace-nowrap"><?php echo formatIndoDate($eval['updated_at']); ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>

<?php
// Handle Executive Dashboards for Admin / Ustadz / Walikelas / Kepala
} else {
    // 1. Calculate General metrics counts
    $total_santri = 0;
    $total_ustadz = 0;
    $total_kelas = 0;
    $total_evaluasi = 0;
    
    try {
        $total_santri = $db->query("SELECT COUNT(*) FROM santri")->fetchColumn();
        $total_ustadz = $db->query("SELECT COUNT(*) FROM ustadz")->fetchColumn();
        $total_kelas = $db->query("SELECT COUNT(*) FROM kelas")->fetchColumn();
        
        $j_eval = $db->query("SELECT COUNT(*) FROM capaian_jilid")->fetchColumn();
        $t_eval = $db->query("SELECT COUNT(*) FROM capaian_tahfidz")->fetchColumn();
        $i_eval = $db->query("SELECT COUNT(*) FROM capaian_ibadah_praktis")->fetchColumn();
        $total_evaluasi = $j_eval + $t_eval + $i_eval;
    } catch (Exception $e) {}

    // 2. Fetch recent assessment stream limit 6
    $recent_logs = [];
    try {
        $recent_logs = $db->query("
            (SELECT 'jilid' AS type, s.name AS santri, j.name AS item, CAST(cj.page AS CHAR) AS detail, cj.status, cj.updated_at, u.name AS ustadz
             FROM capaian_jilid cj
             JOIN santri s ON cj.santri_id = s.id
             JOIN jilid j ON cj.jilid_id = j.id
             JOIN ustadz u ON cj.ustadz_id = u.id)
            UNION ALL
            (SELECT 'tahfidz' AS type, s.name AS santri, sr.name AS item, ct.ayat_range AS detail, ct.status, ct.updated_at, u.name AS ustadz
             FROM capaian_tahfidz ct
             JOIN santri s ON ct.santri_id = s.id
             JOIN surat sr ON ct.surat_id = sr.id
             JOIN ustadz u ON ct.ustadz_id = u.id)
            UNION ALL
            (SELECT 'ibadah' AS type, s.name AS santri, cip.item AS item, cip.category AS detail, cip.status, cip.updated_at, u.name AS ustadz
             FROM capaian_ibadah_praktis cip
             JOIN santri s ON cip.santri_id = s.id
             JOIN ustadz u ON cip.ustadz_id = u.id)
            ORDER BY updated_at DESC LIMIT 6
        ")->fetchAll();
    } catch (Exception $e) {}

    // 3. Fetch classrooms listing
    $classrooms = [];
    try {
        $classrooms = $db->query("
            SELECT k.id, k.name, u.name AS ustadz_name,
                   (SELECT COUNT(*) FROM santri s WHERE s.kelas_id = k.id) AS total_santri
            FROM kelas k
            LEFT JOIN ustadz u ON k.ustadz_id = u.id
            ORDER BY k.name ASC
        ")->fetchAll();
    } catch (Exception $e) {}
    ?>

    <!-- Admin / Ustadz Executive Dashboard Layout -->
    <div class="space-y-8 animate-fade-in">
        
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div class="relative z-10 space-y-2">
                <span class="text-emerald-400 font-extrabold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Dasbor Utama</span>
                <h2 class="text-2xl md:text-3xl font-extrabold tracking-tight">Assalamu'alaikum, <?php echo htmlspecialchars($user_name); ?></h2>
                <p class="text-slate-300 text-sm max-w-xl">Selamat datang di sistem manajemen pembelajaran TPQ Digital. Kelola santri, pantau kurikulum, dan rekam hasil evaluasi dengan presisi.</p>
            </div>
            
            <div class="flex items-center gap-3 relative z-10 flex-wrap">
                <a href="scanner.php" class="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-5 rounded-2xl transition duration-150 shadow-lg shadow-emerald-500/10 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                    Buka Webcam Scanner
                </a>
                <a href="evaluasi.php" class="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-2xl border border-slate-700 transition duration-150 active:scale-95">
                    Evaluasi Manual
                </a>
            </div>
        </div>

        <!-- Metric summaries -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Santri metric -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                <div class="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.771m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </div>
                <div>
                    <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Santri</span>
                    <span class="block text-3xl font-black text-slate-800 leading-tight font-mono"><?php echo $total_santri; ?></span>
                </div>
            </div>

            <!-- Ustadz metric -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                <div class="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A5.905 5.905 0 0 1 8 3.443m1.232 4.095a50.565 50.565 0 0 1 5.536 0m.432-1.127a4.912 4.912 0 0 1 1.232 4.095" />
                    </svg>
                </div>
                <div>
                    <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Asatidzah (Guru)</span>
                    <span class="block text-3xl font-black text-slate-800 leading-tight font-mono"><?php echo $total_ustadz; ?></span>
                </div>
            </div>

            <!-- Kelas metric -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                <div class="p-4 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5" />
                    </svg>
                </div>
                <div>
                    <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Kelas</span>
                    <span class="block text-3xl font-black text-slate-800 leading-tight font-mono"><?php echo $total_kelas; ?></span>
                </div>
            </div>

            <!-- Evaluasi metric -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
                <div class="p-4 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m1.5-13.5h3.375c.621 0 1.125.504 1.125 1.125v17.25c0 .621-.504 1.125-1.125 1.125H5.625c-.621 0-1.125-.504-1.125-1.125V11.25M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                    </svg>
                </div>
                <div>
                    <span class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Log Evaluasi</span>
                    <span class="block text-3xl font-black text-slate-800 leading-tight font-mono"><?php echo $total_evaluasi; ?></span>
                </div>
            </div>
        </div>

        <!-- Main section layout charts/activities -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Statistics and Classes Listing -->
            <div class="lg:col-span-2 space-y-8">
                
                <!-- Chart Visuals Container -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                    <h3 class="text-base font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                        Analisis Distribusi Santri per Kelas
                    </h3>
                    
                    <div class="h-80 w-full relative">
                        <canvas id="classes-chart"></canvas>
                    </div>
                </div>

                <!-- Classes List cards -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                    <h3 class="text-base font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                        <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                        Status Kelas Pembelajaran Aktif
                    </h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <?php foreach ($classrooms as $cls): ?>
                            <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors duration-150 flex flex-col justify-between">
                                <div class="space-y-1.5">
                                    <h4 class="font-bold text-slate-800 text-sm"><?php echo htmlspecialchars($cls['name']); ?></h4>
                                    <p class="text-xs text-slate-400">Ustadz: <strong><?php echo htmlspecialchars($cls['ustadz_name'] ?? 'Belum Ditentukan'); ?></strong></p>
                                </div>
                                <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-200/50">
                                    <span class="text-xs text-slate-400 font-semibold">Jumlah Santri</span>
                                    <span class="text-xs font-extrabold text-indigo-600 font-mono"><?php echo $cls['total_santri']; ?> Santri</span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

            </div>

            <!-- Recent activity feeds stream -->
            <div class="space-y-6">
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col h-full">
                    <div class="pb-4 border-b border-slate-100 mb-6">
                        <h3 class="text-base font-extrabold text-slate-800 flex items-center gap-2">
                            <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                            Aktivitas Evaluasi Terbaru
                        </h3>
                    </div>

                    <?php if (empty($recent_logs)): ?>
                        <div class="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-2">
                            <p class="text-slate-400 font-bold text-xs">Belum ada evaluasi hari ini.</p>
                            <a href="scanner.php" class="text-xs text-emerald-600 font-extrabold hover:underline">Mulai Scan Webcam</a>
                        </div>
                    <?php else: ?>
                        <div class="space-y-5 flex-1 overflow-y-auto max-h-[500px] pr-1">
                            <?php foreach ($recent_logs as $log): ?>
                                <div class="text-xs flex items-start gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div class="p-2 rounded-xl shrink-0 mt-0.5 <?php echo $log['status'] === 'Lulus' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'; ?>">
                                        <?php if ($log['type'] === 'jilid'): ?>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292" />
                                            </svg>
                                        <?php elseif ($log['type'] === 'tahfidz'): ?>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.578 13.47a3.375 3.375 0 0 0-3.13-2.094H12c-.414 0-.75-.336-.75-.75V7.031" />
                                            </svg>
                                        <?php else: ?>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                            </svg>
                                        <?php endif; ?>
                                    </div>
                                    <div class="space-y-1 min-w-0 flex-1">
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="font-extrabold text-slate-800 truncate"><?php echo htmlspecialchars($log['santri']); ?></span>
                                            <span class="text-[9px] text-slate-400 shrink-0"><?php echo date('H:i', strtotime($log['updated_at'])); ?></span>
                                        </div>
                                        <p class="text-slate-500 font-medium">
                                            <?php echo htmlspecialchars($log['item']); ?> (<?php echo htmlspecialchars($log['detail']); ?>) &bull; 
                                            <strong class="<?php echo $log['status'] === 'Lulus' ? 'text-emerald-600' : 'text-amber-600'; ?>"><?php echo htmlspecialchars($log['status']); ?></strong>
                                        </p>
                                        <p class="text-[10px] text-slate-400">Ustadz: <?php echo htmlspecialchars($log['ustadz']); ?></p>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>

    </div>

    <!-- ChartJS via CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const ctx = document.getElementById('classes-chart');
            if (ctx) {
                // Prepare Chart Data from PHP classroom array
                const classNames = [<?php foreach ($classrooms as $c) { echo "'" . addslashes($c['name']) . "',"; } ?>];
                const studentCounts = [<?php foreach ($classrooms as $c) { echo $c['total_santri'] . ","; } ?>];

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: classNames,
                        datasets: [{
                            label: 'Jumlah Santri',
                            data: studentCounts,
                            backgroundColor: 'rgba(16, 185, 129, 0.85)', // Emerald-500
                            borderColor: 'rgb(16, 185, 129)',
                            borderWidth: 1.5,
                            borderRadius: 8,
                            barThickness: 28,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(241, 245, 249, 1)'
                                },
                                ticks: {
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        weight: '600'
                                    },
                                    color: '#64748b'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    font: {
                                        family: "'Plus Jakarta Sans', sans-serif",
                                        weight: '600'
                                    },
                                    color: '#64748b'
                                }
                            }
                        }
                    }
                });
            }
        });
    </script>
<?php
}

require_once 'footer.php';
?>
