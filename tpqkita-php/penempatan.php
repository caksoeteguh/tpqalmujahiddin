<?php
// ==========================================
// TPQKITA - PENEMPATAN SANTRI (penempatan.php)
// Bulk/individual classroom placement and transfers
// ==========================================

require_once 'header.php';
requireRoles(['Walikelas', 'KepalaTPQ']);

$db = getDB();
$alert = '';
$alert_type = '';

// Handle class placement submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['assign_class'])) {
    $santri_id = trim($_POST['santri_id']);
    $kelas_id = trim($_POST['kelas_id']);
    
    try {
        $stmt = $db->prepare("UPDATE santri SET kelas_id = ? WHERE id = ?");
        $stmt->execute([!empty($kelas_id) ? $kelas_id : null, $santri_id]);
        
        $alert = "Penempatan kelas santri berhasil diperbarui!";
        $alert_type = 'success';
    } catch (Exception $e) {
        $alert = "Gagal memindahkan santri: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// Retrieve classrooms list
$classrooms = $db->query("SELECT * FROM kelas ORDER BY name ASC")->fetchAll();

// Retrieve list of all santri
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$filter_kelas = isset($_GET['filter_kelas']) ? trim($_GET['filter_kelas']) : '';

$queryStr = "
    SELECT s.id, s.name, s.barcode, s.kelas_id, k.name AS nama_kelas
    FROM santri s
    LEFT JOIN kelas k ON s.kelas_id = k.id
    WHERE 1=1
";
$params = [];

if (!empty($search)) {
    $queryStr .= " AND (s.name LIKE ? OR s.id LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($filter_kelas === 'null') {
    $queryStr .= " AND s.kelas_id IS NULL";
} elseif (!empty($filter_kelas)) {
    $queryStr .= " AND s.kelas_id = ?";
    $params[] = $filter_kelas;
}

$queryStr .= " ORDER BY s.name ASC";
$stmt = $db->prepare($queryStr);
$stmt->execute($params);
$santri_list = $stmt->fetchAll();
?>

<div class="space-y-8 animate-fade-in">
    <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Penempatan Kelas Santri</h1>
        <p class="text-sm text-slate-500">Posisikan santri ke dalam ruang kelas belajar yang sesuai atau pindahkan santri antar rombel.</p>
    </div>

    <!-- Feedback alerts -->
    <?php if (!empty($alert)): ?>
        <div class="rounded-2xl border p-4 flex items-start gap-3 <?php echo $alert_type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'; ?>">
            <div class="shrink-0">
                <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
                </svg>
            </div>
            <p class="text-sm"><?php echo $alert; ?></p>
        </div>
    <?php endif; ?>

    <!-- Search / Filter options -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <form action="penempatan.php" method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Cari Santri</label>
                <input type="text" name="search" value="<?php echo htmlspecialchars($search); ?>" placeholder="Nama santri..." 
                       class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
            </div>

            <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Filter Berdasarkan Kelas</label>
                <select name="filter_kelas" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    <option value="">-- Semua Santri --</option>
                    <option value="null" <?php echo $filter_kelas === 'null' ? 'selected' : ''; ?>>Belum Punya Kelas (Siswa Baru)</option>
                    <?php foreach ($classrooms as $cls): ?>
                        <option value="<?php echo $cls['id']; ?>" <?php echo $filter_kelas === $cls['id'] ? 'selected' : ''; ?>><?php echo htmlspecialchars($cls['name']); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition duration-150">
                    Terapkan Filter
                </button>
                <?php if (!empty($search) || !empty($filter_kelas)): ?>
                    <a href="penempatan.php" class="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center">
                        Reset
                    </a>
                <?php endif; ?>
            </div>
        </form>
    </div>

    <!-- Student assignments list -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-4 px-6">ID Santri</th>
                        <th class="py-4 px-6">Nama Lengkap Santri</th>
                        <th class="py-4 px-6">Kelas Saat Ini</th>
                        <th class="py-4 px-6">Pindahkan/Tentukan Kelas</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                    <?php if (empty($santri_list)): ?>
                        <tr>
                            <td colspan="4" class="py-12 text-center text-slate-400">Tidak ada data santri untuk filter ini.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($santri_list as $s): ?>
                            <tr class="hover:bg-slate-50/50 transition-colors duration-150 text-slate-700">
                                <td class="py-4 px-6 font-mono text-xs font-bold"><?php echo htmlspecialchars($s['id']); ?></td>
                                <td class="py-4 px-6">
                                    <span class="block font-bold text-slate-800"><?php echo htmlspecialchars($s['name']); ?></span>
                                    <span class="block text-[10px] text-slate-400 font-semibold font-mono"><?php echo htmlspecialchars($s['barcode']); ?></span>
                                </td>
                                <td class="py-4 px-6">
                                    <?php if ($s['nama_kelas']): ?>
                                        <span class="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full"><?php echo htmlspecialchars($s['nama_kelas']); ?></span>
                                    <?php else: ?>
                                        <span class="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-3 py-0.5 rounded-full">Belum Menetap</span>
                                    <?php endif; ?>
                                </td>
                                <td class="py-3 px-6">
                                    <form action="penempatan.php" method="POST" class="flex items-center gap-2 max-w-xs">
                                        <input type="hidden" name="santri_id" value="<?php echo $s['id']; ?>">
                                        <input type="hidden" name="assign_class" value="1">
                                        
                                        <select name="kelas_id" required onchange="this.form.submit()" 
                                                class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700">
                                            <option value="">-- Kosongkan Kelas --</option>
                                            <?php foreach ($classrooms as $cls): ?>
                                                <option value="<?php echo $cls['id']; ?>" <?php echo $s['kelas_id'] === $cls['id'] ? 'selected' : ''; ?>>
                                                    <?php echo htmlspecialchars($cls['name']); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php
require_once 'footer.php';
?>
