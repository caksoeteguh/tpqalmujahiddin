<?php
// ==========================================
// TPQKITA - REPORT CENTER (rekapitulasi.php)
// Multi-tab progression log reporting
// ==========================================

require_once 'header.php';

$db = getDB();
$active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'jilid';

// Filtering parameters
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$filter_kelas = isset($_GET['filter_kelas']) ? trim($_GET['filter_kelas']) : '';
$filter_status = isset($_GET['filter_status']) ? trim($_GET['filter_status']) : '';

// Restrict parents to only view their own children's rekap
$parent_clause = "";
if ($role === 'OrangTua') {
    $parent_clause = " AND s.id = " . $db->quote($_SESSION['linked_id']);
}

// Retrieve classrooms list for filter
$classes = $db->query("SELECT * FROM kelas ORDER BY name ASC")->fetchAll();

// Construct Queries based on active tab
$logs = [];

if ($active_tab === 'jilid') {
    $sql = "
        SELECT cj.*, s.name AS nama_santri, k.name AS nama_kelas, j.name AS nama_jilid, u.name AS nama_ustadz
        FROM capaian_jilid cj
        JOIN santri s ON cj.santri_id = s.id
        LEFT JOIN kelas k ON s.kelas_id = k.id
        JOIN jilid j ON cj.jilid_id = j.id
        JOIN ustadz u ON cj.ustadz_id = u.id
        WHERE 1=1 $parent_clause
    ";
    $params = [];
    if (!empty($search)) {
        $sql .= " AND s.name LIKE ?";
        $params[] = "%$search%";
    }
    if (!empty($filter_kelas)) {
        $sql .= " AND s.kelas_id = ?";
        $params[] = $filter_kelas;
    }
    if (!empty($filter_status)) {
        $sql .= " AND cj.status = ?";
        $params[] = $filter_status;
    }
    $sql .= " ORDER BY cj.updated_at DESC, cj.id DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();

} elseif ($active_tab === 'tahfidz') {
    $sql = "
        SELECT ct.*, s.name AS nama_santri, k.name AS nama_kelas, sr.name AS nama_surat, u.name AS nama_ustadz
        FROM capaian_tahfidz ct
        JOIN santri s ON ct.santri_id = s.id
        LEFT JOIN kelas k ON s.kelas_id = k.id
        JOIN surat sr ON ct.surat_id = sr.id
        JOIN ustadz u ON ct.ustadz_id = u.id
        WHERE 1=1 $parent_clause
    ";
    $params = [];
    if (!empty($search)) {
        $sql .= " AND s.name LIKE ?";
        $params[] = "%$search%";
    }
    if (!empty($filter_kelas)) {
        $sql .= " AND s.kelas_id = ?";
        $params[] = $filter_kelas;
    }
    if (!empty($filter_status)) {
        $sql .= " AND ct.status = ?";
        $params[] = $filter_status;
    }
    $sql .= " ORDER BY ct.updated_at DESC, ct.id DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();

} else { // ibadah
    $sql = "
        SELECT cip.*, s.name AS nama_santri, k.name AS nama_kelas, u.name AS nama_ustadz
        FROM capaian_ibadah_praktis cip
        JOIN santri s ON cip.santri_id = s.id
        LEFT JOIN kelas k ON s.kelas_id = k.id
        JOIN ustadz u ON cip.ustadz_id = u.id
        WHERE 1=1 $parent_clause
    ";
    $params = [];
    if (!empty($search)) {
        $sql .= " AND s.name LIKE ?";
        $params[] = "%$search%";
    }
    if (!empty($filter_kelas)) {
        $sql .= " AND s.kelas_id = ?";
        $params[] = $filter_kelas;
    }
    if (!empty($filter_status)) {
        $sql .= " AND cip.status = ?";
        $params[] = $filter_status;
    }
    $sql .= " ORDER BY cip.updated_at DESC, cip.id DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll();
}
?>

<div class="space-y-8 animate-fade-in">
    <!-- Header title -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight">Rekapitulasi Capaian Pembelajaran</h1>
            <p class="text-sm text-slate-500">Analisis dan evaluasi seluruh rekaman capaian jilid iqra, hafalan, dan ibadah santri secara mendalam.</p>
        </div>
        
        <button onclick="window.print()" class="flex items-center gap-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.821V7.5a3.75 3.75 0 1 1 7.5 0v6.321m0 0a4.5 4.5 0 0 1-7.5 0M10.5 18v3" />
            </svg>
            Cetak Laporan
        </button>
    </div>

    <!-- Navigation Tabs (Hidden on Print) -->
    <div class="flex border-b border-slate-200 no-print">
        <a href="rekapitulasi.php?tab=jilid&search=<?php echo urlencode($search); ?>&filter_kelas=<?php echo urlencode($filter_kelas); ?>&filter_status=<?php echo urlencode($filter_status); ?>" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'jilid' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Perkembangan Jilid Iqra'
        </a>
        <a href="rekapitulasi.php?tab=tahfidz&search=<?php echo urlencode($search); ?>&filter_kelas=<?php echo urlencode($filter_kelas); ?>&filter_status=<?php echo urlencode($filter_status); ?>" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'tahfidz' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Setoran Hafalan (Tahfidz)
        </a>
        <a href="rekapitulasi.php?tab=ibadah&search=<?php echo urlencode($search); ?>&filter_kelas=<?php echo urlencode($filter_kelas); ?>&filter_status=<?php echo urlencode($filter_status); ?>" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'ibadah' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Praktik Ibadah Praktis
        </a>
    </div>

    <!-- Filter Dashboard Section (Hidden on Print) -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm no-print">
        <form action="rekapitulasi.php" method="GET" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <input type="hidden" name="tab" value="<?php echo htmlspecialchars($active_tab); ?>">
            
            <?php if ($role !== 'OrangTua'): ?>
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Cari Santri</label>
                    <input type="text" name="search" value="<?php echo htmlspecialchars($search); ?>" placeholder="Ketik nama santri..." 
                           class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Filter Rombel Kelas</label>
                    <select name="filter_kelas" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none">
                        <option value="">-- Semua Kelas --</option>
                        <?php foreach ($classes as $cls): ?>
                            <option value="<?php echo $cls['id']; ?>" <?php echo $filter_kelas === $cls['id'] ? 'selected' : ''; ?>><?php echo htmlspecialchars($cls['name']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            <?php else: ?>
                <!-- Hidden filler for parent layout sizes -->
                <div class="md:col-span-2"></div>
            <?php endif; ?>

            <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Status Penilaian</label>
                <select name="filter_status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none">
                    <option value="">-- Semua Hasil --</option>
                    <option value="Lulus" <?php echo $filter_status === 'Lulus' ? 'selected' : ''; ?>>LULUS</option>
                    <option value="Mengulang" <?php echo $filter_status === 'Mengulang' ? 'selected' : ''; ?>>MENGULANG</option>
                </select>
            </div>

            <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150">Saring</button>
                <a href="rekapitulasi.php?tab=<?php echo $active_tab; ?>" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center">Reset</a>
            </div>
        </form>
    </div>

    <!-- Active Report Heading Display -->
    <div class="text-center py-4 border-b border-slate-200 bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-black text-slate-800">LAPORAN CAPAIAN SANTRI - <?php echo strtoupper($active_tab); ?></h2>
        <p class="text-xs text-slate-400 font-semibold mt-1">Lembaga: <?php echo htmlspecialchars($tpq_name); ?> | Tanggal Unduh: <?php echo date('d-m-Y H:i'); ?></p>
    </div>

    <!-- Progress logs listings table -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm text-slate-600">
            <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th class="py-3 px-6">Tanggal</th>
                    <th class="py-3 px-6">Nama Santri</th>
                    <th class="py-3 px-6">Kelas</th>
                    
                    <?php if ($active_tab === 'jilid'): ?>
                        <th class="py-3 px-6">Tingkatan</th>
                        <th class="py-3 px-6 font-mono">Halaman</th>
                    <?php elseif ($active_tab === 'tahfidz'): ?>
                        <th class="py-3 px-6">Nama Sura</th>
                        <th class="py-3 px-6 font-mono">Rentang Ayat</th>
                    <?php else: ?>
                        <th class="py-3 px-6">Kategori Praktik</th>
                        <th class="py-3 px-6">Item Hafalan</th>
                    <?php endif; ?>

                    <th class="py-3 px-6">Hasil</th>
                    <th class="py-3 px-6">Catatan Ustadz</th>
                    <th class="py-3 px-6">Penguji</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-xs">
                <?php if (empty($logs)): ?>
                    <tr>
                        <td colspan="8" class="py-12 text-center text-slate-400 font-bold">Tidak ada catatan data log capaian untuk kriteria ini.</td>
                    </tr>
                <?php else: ?>
                    <?php foreach ($logs as $l): ?>
                        <tr class="hover:bg-slate-50/20 text-slate-700">
                            <td class="py-3.5 px-6 whitespace-nowrap text-slate-400 font-bold"><?php echo date('d-m-Y', strtotime($l['updated_at'])); ?></td>
                            <td class="py-3.5 px-6 font-bold text-slate-800"><?php echo htmlspecialchars($l['nama_santri']); ?></td>
                            <td class="py-3.5 px-6 whitespace-nowrap">
                                <span class="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600"><?php echo htmlspecialchars($l['nama_kelas'] ?? 'Siswa Baru'); ?></span>
                            </td>
                            
                            <?php if ($active_tab === 'jilid'): ?>
                                <td class="py-3.5 px-6 text-slate-800 font-extrabold"><?php echo htmlspecialchars($l['nama_jilid']); ?></td>
                                <td class="py-3.5 px-6 font-mono font-bold text-indigo-600 text-sm">Hal. <?php echo $l['page']; ?></td>
                            <?php elseif ($active_tab === 'tahfidz'): ?>
                                <td class="py-3.5 px-6 text-slate-800 font-extrabold">QS. <?php echo htmlspecialchars($l['nama_surat']); ?></td>
                                <td class="py-3.5 px-6 font-mono font-bold text-indigo-600 text-sm">Ayat <?php echo htmlspecialchars($l['ayat_range']); ?></td>
                            <?php else: ?>
                                <td class="py-3.5 px-6 text-slate-800 font-extrabold"><?php echo htmlspecialchars($l['category']); ?></td>
                                <td class="py-3.5 px-6 text-indigo-600 font-bold"><?php echo htmlspecialchars($l['item']); ?></td>
                            <?php endif; ?>

                            <td class="py-3.5 px-6 whitespace-nowrap">
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider <?php echo $l['status'] === 'Lulus' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-amber-700 bg-amber-50 border border-amber-100'; ?>">
                                    <?php echo htmlspecialchars($l['status']); ?>
                                </span>
                            </td>
                            <td class="py-3.5 px-6 italic text-slate-500 max-w-[180px] truncate" title="<?php echo htmlspecialchars($l['notes']); ?>">
                                <?php echo !empty($l['notes']) ? '"' . htmlspecialchars($l['notes']) . '"' : '-'; ?>
                            </td>
                            <td class="py-3.5 px-6 text-slate-400 font-bold whitespace-nowrap"><?php echo htmlspecialchars($l['nama_ustadz']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php
require_once 'footer.php';
?>
