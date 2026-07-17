<?php
// ==========================================
// TPQKITA - MANAGE KELAS (kelas.php)
// Classrooms directory and wali kelas setup
// ==========================================

require_once 'header.php';
requireRoles(['Walikelas', 'KepalaTPQ']);

$db = getDB();
$alert = '';
$alert_type = '';

// --- ACTIONS HANDLER ---

// 1. SAVE KELAS (CREATE or UPDATE)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_kelas'])) {
    $id = trim($_POST['id']);
    $name = trim($_POST['name']);
    $ustadz_id = trim($_POST['ustadz_id']);
    $is_edit = $_POST['is_edit'] === '1';

    try {
        if ($is_edit) {
            // Update
            $stmt = $db->prepare("UPDATE kelas SET name = ?, ustadz_id = ? WHERE id = ?");
            $stmt->execute([$name, !empty($ustadz_id) ? $ustadz_id : null, $id]);
            $alert = "Data Kelas <strong>" . htmlspecialchars($name) . "</strong> berhasil diperbarui!";
            $alert_type = 'success';
        } else {
            // Create
            // Check unique ID
            $check = $db->prepare("SELECT id FROM kelas WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                throw new Exception("ID Kelas '$id' sudah digunakan!");
            }

            $stmt = $db->prepare("INSERT INTO kelas (id, name, ustadz_id) VALUES (?, ?, ?)");
            $stmt->execute([$id, $name, !empty($ustadz_id) ? $ustadz_id : null]);
            $alert = "Kelas baru <strong>" . htmlspecialchars($name) . "</strong> berhasil dibuat!";
            $alert_type = 'success';
        }
    } catch (Exception $e) {
        $alert = "Gagal menyimpan data: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// 2. DELETE KELAS
if (isset($_GET['delete'])) {
    $del_id = $_GET['delete'];
    try {
        $stmtN = $db->prepare("SELECT name FROM kelas WHERE id = ?");
        $stmtN->execute([$del_id]);
        $kName = $stmtN->fetchColumn();

        if ($kName) {
            // Clear class assignments in santri before deleting to prevent constraint issues
            $stmtClear = $db->prepare("UPDATE santri SET kelas_id = NULL WHERE kelas_id = ?");
            $stmtClear->execute([$del_id]);

            $stmtDel = $db->prepare("DELETE FROM kelas WHERE id = ?");
            $stmtDel->execute([$del_id]);

            $alert = "Kelas <strong>" . htmlspecialchars($kName) . "</strong> berhasil dihapus.";
            $alert_type = 'success';
        }
    } catch (Exception $e) {
        $alert = "Gagal menghapus kelas: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// --- DATA FETCHING ---
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

// Retrieve list of all ustadz for dropdown options
$ustadz_list = $db->query("SELECT id, name FROM ustadz ORDER BY name ASC")->fetchAll();

// Construct SQL query for classes with aggregate statistics
$queryStr = "
    SELECT k.*, u.name AS nama_ustadz,
           (SELECT COUNT(*) FROM santri s WHERE s.kelas_id = k.id) AS total_santri
    FROM kelas k
    LEFT JOIN ustadz u ON k.ustadz_id = u.id
    WHERE 1=1
";
$params = [];

if (!empty($search)) {
    $queryStr .= " AND (k.name LIKE ? OR k.id LIKE ? OR u.name LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$queryStr .= " ORDER BY k.name ASC";
$stmt = $db->prepare($queryStr);
$stmt->execute($params);
$kelas_list = $stmt->fetchAll();
?>

<div class="space-y-8 animate-fade-in">
    <!-- Title header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight">Data Master Kelas</h1>
            <p class="text-sm text-slate-500">Kelola daftar rombongan belajar (kelas), pengawas wali kelas, serta statistik siswa.</p>
        </div>
        
        <button onclick="openAddModal()" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Buat Kelas Baru
        </button>
    </div>

    <!-- Alert banner -->
    <?php if (!empty($alert)): ?>
        <div class="rounded-2xl border p-4 flex items-start gap-3 <?php echo $alert_type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'; ?>">
            <div class="shrink-0">
                <?php if ($alert_type === 'success'): ?>
                    <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                <?php else: ?>
                    <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                <?php endif; ?>
            </div>
            <p class="text-sm"><?php echo $alert; ?></p>
        </div>
    <?php endif; ?>

    <!-- Search options -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <form action="kelas.php" method="GET" class="flex flex-col sm:flex-row gap-3">
            <input type="text" name="search" value="<?php echo htmlspecialchars($search); ?>" placeholder="Cari nama kelas atau wali kelas..." 
                   class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
            <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition duration-150 shadow-sm">
                Cari Kelas
            </button>
            <?php if (!empty($search)): ?>
                <a href="kelas.php" class="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center">
                    Reset
                </a>
            <?php endif; ?>
        </form>
    </div>

    <!-- Classes directory list -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-4 px-6">ID Kelas</th>
                        <th class="py-4 px-6">Nama Kelas / Rombel</th>
                        <th class="py-4 px-6">Wali Kelas (Asatidzah)</th>
                        <th class="py-4 px-6">Jumlah Anggota Santri</th>
                        <th class="py-4 px-6 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                    <?php if (empty($kelas_list)): ?>
                        <tr>
                            <td colspan="5" class="py-12 text-center text-slate-400">Tidak ada rombongan belajar ditemukan.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($kelas_list as $k): ?>
                            <tr class="hover:bg-slate-50/50 transition-colors duration-150 text-slate-700">
                                <td class="py-4.5 px-6 font-mono text-xs font-bold text-slate-800">
                                    <?php echo htmlspecialchars($k['id']); ?>
                                </td>
                                <td class="py-4.5 px-6 font-bold text-slate-800">
                                    <?php echo htmlspecialchars($k['name']); ?>
                                </td>
                                <td class="py-4.5 px-6">
                                    <?php if ($k['nama_ustadz']): ?>
                                        <span class="font-bold text-slate-700"><?php echo htmlspecialchars($k['nama_ustadz']); ?></span>
                                    <?php else: ?>
                                        <span class="text-xs text-slate-400 italic">Belum ditentukan</span>
                                    <?php endif; ?>
                                </td>
                                <td class="py-4.5 px-6">
                                    <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full font-mono"><?php echo $k['total_santri']; ?> Santri</span>
                                </td>
                                <td class="py-4.5 px-6 text-center">
                                    <div class="flex items-center justify-center gap-1.5">
                                        <button onclick='openEditModal(<?php echo json_encode($k); ?>)' 
                                                class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-colors duration-150" 
                                                title="Edit Kelas">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                        <a href="kelas.php?delete=<?php echo $k['id']; ?>" 
                                           onclick="return confirm('Apakah Anda yakin ingin menghapus kelas ini? Keanggotaan santri akan di-set kosong.')" 
                                           class="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-lg transition-colors duration-150" 
                                           title="Hapus Kelas">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal Dialog -->
<div id="kelas-modal" class="hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 id="modal-title" class="text-base font-extrabold text-slate-800">Tambah Kelas Baru</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form action="kelas.php" method="POST" class="p-6 space-y-5">
            <input type="hidden" name="is_edit" id="form-is-edit" value="0">
            <input type="hidden" name="save_kelas" value="1">

            <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">ID Kelas * (Misal: K04)</label>
                <input type="text" name="id" id="form-id" required placeholder="K04" 
                       class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Nama Kelas *</label>
                <input type="text" name="name" id="form-name" required placeholder="Misal: Kelas Al-Kautsar (Menengah)..." 
                       class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Pilih Wali Kelas (Ustadz)</label>
                <select name="ustadz_id" id="form-ustadz-id" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    <option value="">-- Pilih Ustadz Pengampu --</option>
                    <?php foreach ($ustadz_list as $u): ?>
                        <option value="<?php echo $u['id']; ?>"><?php echo htmlspecialchars($u['name']); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Modal Action Footer -->
            <div class="pt-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button type="button" onclick="closeModal()" class="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs transition duration-150">
                    Batal
                </button>
                <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-xl text-xs transition duration-150">
                    Simpan Kelas
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('kelas-modal');
    const modalTitle = document.getElementById('modal-title');
    const formIsEdit = document.getElementById('form-is-edit');
    
    const formId = document.getElementById('form-id');
    const formName = document.getElementById('form-name');
    const formUstadzId = document.getElementById('form-ustadz-id');

    function openAddModal() {
        modalTitle.innerText = "Buat Kelas Baru";
        formIsEdit.value = "0";
        formId.disabled = false;

        formId.value = "";
        formName.value = "";
        formUstadzId.value = "";

        modal.classList.remove('hidden');
    }

    function openEditModal(kelas) {
        modalTitle.innerText = "Edit Kelas: " + kelas.name;
        formIsEdit.value = "1";
        formId.disabled = true;

        formId.value = kelas.id;
        if (!document.getElementById('hidden-edit-id')) {
            const hInput = document.createElement('input');
            hInput.type = 'hidden';
            hInput.name = 'id';
            hInput.id = 'hidden-edit-id';
            formIsEdit.parentNode.appendChild(hInput);
        }
        document.getElementById('hidden-edit-id').value = kelas.id;

        formName.value = kelas.name;
        formUstadzId.value = kelas.ustadz_id || "";

        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        if (document.getElementById('hidden-edit-id')) {
            document.getElementById('hidden-edit-id').remove();
        }
    }
</script>

<?php
require_once 'footer.php';
?>
