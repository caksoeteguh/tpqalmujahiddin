<?php
// ==========================================
// TPQKITA - MANAGE SANTRI (santri.php)
// Comprehensive CRUD panel for student directory
// ==========================================

require_once 'header.php';
requireRoles(['Walikelas', 'KepalaTPQ']);

$db = getDB();
$alert = '';
$alert_type = ''; // success or error

// --- ACTIONS HANDLER ---

// 1. CREATE or UPDATE Santri
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_santri'])) {
    $id = trim($_POST['id']);
    $name = trim($_POST['name']);
    $barcode = trim($_POST['barcode']);
    $birth_place = trim($_POST['birth_place']);
    $birth_date = trim($_POST['birth_date']);
    $kelas_id = trim($_POST['kelas_id']);
    $parent_name = trim($_POST['parent_name']);
    $parent_phone = trim($_POST['parent_phone']);
    $parent_username = trim($_POST['parent_username']);
    $parent_password = $_POST['parent_password'];
    $is_edit = $_POST['is_edit'] === '1';

    if (empty($barcode)) {
        // Auto generate barcode if empty
        $barcode = 'SANTRI-' . strtoupper(substr(uniqid(), -6));
    }

    try {
        if ($is_edit) {
            // Update mode
            // Check if password was changed
            if (!empty($parent_password)) {
                $hash = password_hash($parent_password, PASSWORD_DEFAULT);
                $stmt = $db->prepare("
                    UPDATE santri SET 
                        name = ?, barcode = ?, birth_place = ?, birth_date = ?, 
                        kelas_id = ?, parent_name = ?, parent_phone = ?, 
                        parent_username = ?, parent_password_hash = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $name, $barcode, $birth_place, $birth_date, 
                    !empty($kelas_id) ? $kelas_id : null, $parent_name, $parent_phone, 
                    $parent_username, $hash, $id
                ]);
            } else {
                // Keep old password
                $stmt = $db->prepare("
                    UPDATE santri SET 
                        name = ?, barcode = ?, birth_place = ?, birth_date = ?, 
                        kelas_id = ?, parent_name = ?, parent_phone = ?, 
                        parent_username = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $name, $barcode, $birth_place, $birth_date, 
                    !empty($kelas_id) ? $kelas_id : null, $parent_name, $parent_phone, 
                    $parent_username, $id
                ]);
            }
            $alert = "Data santri <strong>" . htmlspecialchars($name) . "</strong> berhasil diperbarui!";
            $alert_type = 'success';
        } else {
            // Insert mode
            // Check if ID already exists
            $check = $db->prepare("SELECT id FROM santri WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                throw new Exception("ID Santri '$id' sudah digunakan!");
            }

            // Check if parent_username already exists
            $checkU = $db->prepare("SELECT id FROM santri WHERE parent_username = ?");
            $checkU->execute([$parent_username]);
            if ($checkU->fetch()) {
                throw new Exception("Username Wali '$parent_username' sudah digunakan!");
            }

            $hash = password_hash(!empty($parent_password) ? $parent_password : 'password', PASSWORD_DEFAULT);
            $stmt = $db->prepare("
                INSERT INTO santri 
                (id, name, barcode, birth_place, birth_date, kelas_id, parent_name, parent_phone, parent_username, parent_password_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id, $name, $barcode, $birth_place, $birth_date, 
                !empty($kelas_id) ? $kelas_id : null, $parent_name, $parent_phone, $parent_username, $hash
            ]);

            // Create user table entry as OrangTua helper
            try {
                $stmtUser = $db->prepare("INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES (?, ?, ?, ?, 'OrangTua', ?)");
                $stmtUser->execute(['U_PARENT_' . $id, $parent_username, $hash, $parent_name, $id]);
            } catch (Exception $exU) {
                // Silent catch if user already pre-exists
            }

            $alert = "Santri baru <strong>" . htmlspecialchars($name) . "</strong> berhasil didaftarkan!";
            $alert_type = 'success';
        }
    } catch (Exception $e) {
        $alert = "Gagal menyimpan data: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// 3. IMPORT CSV
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['import_csv'])) {
    if (isset($_FILES['csv_file']) && $_FILES['csv_file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['csv_file']['tmp_name'];
        $handle = fopen($file, "r");
        if ($handle !== FALSE) {
            $row = 0;
            $success_count = 0;
            $error_count = 0;
            
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                $row++;
                if ($row == 1) continue; // Skip header
                
                if (count($data) < 9) continue; // Skip incomplete

                $id = trim($data[0]);
                $name = trim($data[1]);
                $barcode = trim($data[2]);
                $birth_place = trim($data[3]);
                $birth_date = trim($data[4]);
                $kelas_id = trim($data[5]);
                $parent_name = trim($data[6]);
                $parent_phone = trim($data[7]);
                $parent_username = trim($data[8]);
                $parent_password = isset($data[9]) ? trim($data[9]) : '';

                if (empty($id) || empty($name) || empty($parent_username)) continue;

                if (empty($barcode)) {
                    $barcode = 'SANTRI-' . strtoupper(substr(uniqid(), -6));
                }

                try {
                    $db->beginTransaction();
                    
                    $check = $db->prepare("SELECT id FROM santri WHERE id = ?");
                    $check->execute([$id]);
                    $exists = $check->fetch();

                    $checkU = $db->prepare("SELECT id FROM users WHERE username = ? AND linked_id != ?");
                    $checkU->execute([$parent_username, $id]);
                    if ($checkU->fetch()) {
                        $db->rollBack();
                        $error_count++;
                        continue;
                    }
                    
                    $kelas_id_val = !empty($kelas_id) ? $kelas_id : null;
                    
                    if ($exists) {
                        if (!empty($parent_password)) {
                            $hash = password_hash($parent_password, PASSWORD_DEFAULT);
                            $stmt = $db->prepare("UPDATE santri SET name = ?, barcode = ?, birth_place = ?, birth_date = ?, kelas_id = ?, parent_name = ?, parent_phone = ?, parent_username = ?, parent_password_hash = ? WHERE id = ?");
                            $stmt->execute([$name, $barcode, $birth_place, $birth_date, $kelas_id_val, $parent_name, $parent_phone, $parent_username, $hash, $id]);
                            
                            $stmtUser = $db->prepare("UPDATE users SET name = ?, username = ?, password_hash = ? WHERE linked_id = ?");
                            $stmtUser->execute([$parent_name, $parent_username, $hash, $id]);
                        } else {
                            $stmt = $db->prepare("UPDATE santri SET name = ?, barcode = ?, birth_place = ?, birth_date = ?, kelas_id = ?, parent_name = ?, parent_phone = ?, parent_username = ? WHERE id = ?");
                            $stmt->execute([$name, $barcode, $birth_place, $birth_date, $kelas_id_val, $parent_name, $parent_phone, $parent_username, $id]);

                            $stmtUser = $db->prepare("UPDATE users SET name = ?, username = ? WHERE linked_id = ?");
                            $stmtUser->execute([$parent_name, $parent_username, $id]);
                        }
                    } else {
                        $hash = password_hash(!empty($parent_password) ? $parent_password : 'password', PASSWORD_DEFAULT);
                        $stmt = $db->prepare("INSERT INTO santri (id, name, barcode, birth_place, birth_date, kelas_id, parent_name, parent_phone, parent_username, parent_password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->execute([$id, $name, $barcode, $birth_place, $birth_date, $kelas_id_val, $parent_name, $parent_phone, $parent_username, $hash]);

                        $stmtUser = $db->prepare("INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES (?, ?, ?, ?, 'OrangTua', ?)");
                        $stmtUser->execute(['U_PARENT_' . $id, $parent_username, $hash, $parent_name, $id]);
                    }
                    $db->commit();
                    $success_count++;
                } catch (Exception $ex) {
                    if ($db->inTransaction()) {
                        $db->rollBack();
                    }
                    $error_count++;
                }
            }
            fclose($handle);
            $alert = "Berhasil mengimpor $success_count data santri. " . ($error_count > 0 ? "$error_count baris gagal (username duplikat atau format salah)." : "");
            $alert_type = 'success';
        } else {
            $alert = "Gagal membuka file.";
            $alert_type = 'error';
        }
    } else {
        $alert = "Gagal mengunggah file. Pastikan Anda memilih file yang valid.";
        $alert_type = 'error';
    }
}

// 2. DELETE Santri
if (isset($_GET['delete'])) {
    $del_id = $_GET['delete'];
    try {
        // Fetch name for alert feedback
        $stmtN = $db->prepare("SELECT name FROM santri WHERE id = ?");
        $stmtN->execute([$del_id]);
        $sName = $stmtN->fetchColumn();

        if ($sName) {
            $stmtDel = $db->prepare("DELETE FROM santri WHERE id = ?");
            $stmtDel->execute([$del_id]);
            
            // Delete associated parent user account if exists
            $stmtDelU = $db->prepare("DELETE FROM users WHERE linked_id = ? AND role = 'OrangTua'");
            $stmtDelU->execute([$del_id]);

            $alert = "Data santri <strong>" . htmlspecialchars($sName) . "</strong> berhasil dihapus.";
            $alert_type = 'success';
        }
    } catch (Exception $e) {
        $alert = "Gagal menghapus data: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// --- DATA FETCHING ---
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$filter_kelas = isset($_GET['filter_kelas']) ? trim($_GET['filter_kelas']) : '';

// Retrieve classes for options dropdown
$classes = $db->query("SELECT * FROM kelas ORDER BY name ASC")->fetchAll();

// Construct SQL Query
$queryStr = "
    SELECT s.*, k.name AS nama_kelas 
    FROM santri s 
    LEFT JOIN kelas k ON s.kelas_id = k.id
    WHERE 1=1
";
$params = [];

if (!empty($search)) {
    $queryStr .= " AND (s.name LIKE ? OR s.id LIKE ? OR s.barcode LIKE ? OR s.parent_name LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if (!empty($filter_kelas)) {
    $queryStr .= " AND s.kelas_id = ?";
    $params[] = $filter_kelas;
}

$queryStr .= " ORDER BY s.name ASC";
$stmt = $db->prepare($queryStr);
$stmt->execute($params);
$santri_list = $stmt->fetchAll();
?>

<div class="space-y-8 animate-fade-in">
    <!-- Header title -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight">Data Master Santri</h1>
            <p class="text-sm text-slate-500">Kelola informasi profil santri, data wali, serta kredensial masuk orang tua.</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-2">
            <a href="santri_template.php" class="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-sm border border-slate-200 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Template Excel
            </a>
            <button onclick="openImportModal()" class="flex items-center gap-2 bg-white hover:bg-slate-50 text-emerald-700 font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-sm border border-emerald-200 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Impor Excel
            </button>
            <button onclick="openAddModal()" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-md text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Santri
            </button>
        </div>
    </div>

    <!-- Feedback alert box -->
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

    <!-- Filter/Search Bar -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <form action="santri.php" method="GET" class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Cari Santri</label>
                <input type="text" name="search" value="<?php echo htmlspecialchars($search); ?>" placeholder="Ketik nama, ID, barcode..." 
                       class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
            </div>

            <div>
                <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Filter Kelas</label>
                <select name="filter_kelas" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    <option value="">-- Semua Kelas --</option>
                    <?php foreach ($classes as $cls): ?>
                        <option value="<?php echo $cls['id']; ?>" <?php echo $filter_kelas === $cls['id'] ? 'selected' : ''; ?>><?php echo htmlspecialchars($cls['name']); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="flex gap-2">
                <button type="submit" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition duration-150">
                    Terapkan Filter
                </button>
                <?php if (!empty($search) || !empty($filter_kelas)): ?>
                    <a href="santri.php" class="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-sm transition duration-150 flex items-center justify-center">
                        Reset
                    </a>
                <?php endif; ?>
            </div>
        </form>
    </div>

    <!-- Data Table Card -->
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600 border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th class="py-4 px-6">ID / Barcode</th>
                        <th class="py-4 px-6">Nama Santri</th>
                        <th class="py-4 px-6">Kelas</th>
                        <th class="py-4 px-6">Wali Santri (Orang Tua)</th>
                        <th class="py-4 px-6">Kredensial Login Wali</th>
                        <th class="py-4 px-6 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium">
                    <?php if (empty($santri_list)): ?>
                        <tr>
                            <td colspan="6" class="py-12 text-center text-slate-400">Tidak ada data santri ditemukan.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($santri_list as $s): ?>
                            <tr class="hover:bg-slate-50/50 transition-colors duration-150 text-slate-700">
                                <td class="py-4.5 px-6 font-mono text-xs">
                                    <span class="block text-slate-800 font-bold"><?php echo htmlspecialchars($s['id']); ?></span>
                                    <span class="block text-[10px] text-slate-400 font-semibold"><?php echo htmlspecialchars($s['barcode']); ?></span>
                                </td>
                                <td class="py-4.5 px-6">
                                    <span class="block font-bold text-slate-800"><?php echo htmlspecialchars($s['name']); ?></span>
                                    <span class="block text-[10px] text-slate-400 font-semibold"><?php echo htmlspecialchars($s['birth_place']); ?>, <?php echo formatIndoDate($s['birth_date']); ?></span>
                                </td>
                                <td class="py-4.5 px-6">
                                    <?php if ($s['nama_kelas']): ?>
                                        <span class="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full"><?php echo htmlspecialchars($s['nama_kelas']); ?></span>
                                    <?php else: ?>
                                        <span class="inline-block text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">Belum Ditentukan</span>
                                    <?php endif; ?>
                                </td>
                                <td class="py-4.5 px-6">
                                    <span class="block font-bold text-slate-800"><?php echo htmlspecialchars($s['parent_name']); ?></span>
                                    <span class="block text-xs text-slate-400 font-mono"><?php echo htmlspecialchars($s['parent_phone']); ?></span>
                                </td>
                                <td class="py-4.5 px-6">
                                    <span class="block text-xs text-slate-600">User: <strong class="font-mono text-slate-800 bg-slate-100 px-1 rounded"><?php echo htmlspecialchars($s['parent_username']); ?></strong></span>
                                </td>
                                <td class="py-4.5 px-6 text-center">
                                    <div class="flex items-center justify-center gap-1.5">
                                        <button onclick='openEditModal(<?php echo json_encode($s); ?>)' 
                                                class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-colors duration-150" 
                                                title="Edit Profil">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                        <a href="santri.php?delete=<?php echo $s['id']; ?>" 
                                           onclick="return confirm('Apakah Anda yakin ingin menghapus data santri ini? Semua riwayat capaian juga akan ikut terhapus.')" 
                                           class="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-lg transition-colors duration-150" 
                                           title="Hapus Santri">
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

<!-- Import CSV Modal -->
<div id="import-modal" class="hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 class="text-base font-extrabold text-slate-800">Impor Data Santri (Excel/CSV)</h3>
            <button onclick="closeImportModal()" class="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form method="POST" action="" enctype="multipart/form-data" class="flex flex-col">
            <div class="p-6 overflow-y-auto">
                <p class="text-sm text-slate-500 mb-4">
                    Gunakan file template Excel yang diunduh untuk mengisi data santri. Fitur ini memungkinkan Anda <b>menambah santri baru</b> secara massal sekaligus.
                </p>
                <div class="w-full">
                    <label class="block text-xs font-bold text-slate-500 mb-2">Pilih File Excel (CSV) *</label>
                    <input type="file" name="csv_file" accept=".csv" required
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                </div>
                <input type="hidden" name="import_csv" value="1">
            </div>

            <div class="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button type="button" onclick="closeImportModal()" class="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-2.5 px-5 rounded-xl text-sm transition duration-150">
                    Batal
                </button>
                <button type="submit" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition duration-150">
                    Mulai Impor
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Add/Edit Modal Overlay -->
<div id="santri-modal" class="hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 id="modal-title" class="text-base font-extrabold text-slate-800">Tambah Santri Baru</h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Body Scrollable Form -->
        <form action="santri.php" method="POST" class="flex-1 overflow-y-auto p-6 space-y-6">
            <input type="hidden" name="is_edit" id="form-is-edit" value="0">
            <input type="hidden" name="save_santri" value="1">

            <!-- Section 1: Student Demographics -->
            <div class="space-y-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <span class="w-1 h-3 bg-indigo-500 rounded-full"></span>
                    Informasi Profil Santri
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-2">ID Santri * (Unik, misal: S01)</label>
                        <input type="text" name="id" id="form-id" required placeholder="S01" 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-2">Barcode Kartu (Opsional)</label>
                        <input type="text" name="barcode" id="form-barcode" placeholder="Ketik atau biarkan kosong untuk generate" 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-2">Nama Lengkap Santri *</label>
                    <input type="text" name="name" id="form-name" required placeholder="Masukkan nama lengkap..." 
                           class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="sm:col-span-1">
                        <label class="block text-xs font-bold text-slate-500 mb-2">Tempat Lahir</label>
                        <input type="text" name="birth_place" id="form-birth-place" placeholder="Misal: Jakarta" 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    </div>
                    <div class="sm:col-span-1">
                        <label class="block text-xs font-bold text-slate-500 mb-2">Tanggal Lahir</label>
                        <input type="date" name="birth_date" id="form-birth-date" 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    </div>
                    <div class="sm:col-span-1">
                        <label class="block text-xs font-bold text-slate-500 mb-2">Kelas Penempatan</label>
                        <select name="kelas_id" id="form-kelas-id" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                            <option value="">-- Pilih Kelas --</option>
                            <?php foreach ($classes as $cls): ?>
                                <option value="<?php echo $cls['id']; ?>"><?php echo htmlspecialchars($cls['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Section 2: Parent Demographics & logins -->
            <div class="space-y-4 pt-4 border-t border-slate-100">
                <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <span class="w-1 h-3 bg-emerald-500 rounded-full"></span>
                    Informasi Orang Tua &amp; Kredensial Login Wali
                </h4>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-2">Nama Orang Tua (Ayah/Ibu) *</label>
                        <input type="text" name="parent_name" id="form-parent-name" required placeholder="Nama lengkap wali..." 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-2">No. HP Orang Tua *</label>
                        <input type="text" name="parent_phone" id="form-parent-phone" required placeholder="08xxxxxxxx" 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-2">Username Login Wali *</label>
                        <input type="text" name="parent_username" id="form-parent-username" required placeholder="username_wali" 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-2">Kata Sandi Login Wali</label>
                        <input type="password" name="parent_password" id="form-parent-password" placeholder="Kosongkan jika tidak ingin diubah" 
                               class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                        <span id="password-help" class="text-[10px] text-slate-400 font-semibold block mt-1">Default sandi jika kosong saat buat baru adalah: "password"</span>
                    </div>
                </div>
            </div>

            <!-- Submit action footer -->
            <div class="pt-6 border-t border-slate-100 flex justify-end gap-3 bg-white sticky bottom-0">
                <button type="button" onclick="closeModal()" class="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-2.5 px-5 rounded-xl text-sm transition duration-150">
                    Batal
                </button>
                <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition duration-150">
                    Simpan Data
                </button>
            </div>
        </form>
    </div>
</div>

<script>
    const modal = document.getElementById('santri-modal');
    const modalTitle = document.getElementById('modal-title');
    const formIsEdit = document.getElementById('form-is-edit');
    
    const formId = document.getElementById('form-id');
    const formBarcode = document.getElementById('form-barcode');
    const formName = document.getElementById('form-name');
    const formBirthPlace = document.getElementById('form-birth-place');
    const formBirthDate = document.getElementById('form-birth-date');
    const formKelasId = document.getElementById('form-kelas-id');
    const formParentName = document.getElementById('form-parent-name');
    const formParentPhone = document.getElementById('form-parent-phone');
    const formParentUsername = document.getElementById('form-parent-username');
    const formParentPassword = document.getElementById('form-parent-password');
    const pwdHelp = document.getElementById('password-help');

    function openImportModal() {
        document.getElementById('import-modal').classList.remove('hidden');
    }
    function closeImportModal() {
        document.getElementById('import-modal').classList.add('hidden');
    }

    function openAddModal() {
        modalTitle.innerText = "Tambah Santri Baru";
        formIsEdit.value = "0";
        formId.disabled = false;
        pwdHelp.innerText = 'Default sandi jika kosong saat buat baru adalah: "password"';

        // Reset inputs
        formId.value = "";
        formBarcode.value = "";
        formName.value = "";
        formBirthPlace.value = "";
        formBirthDate.value = "";
        formKelasId.value = "";
        formParentName.value = "";
        formParentPhone.value = "";
        formParentUsername.value = "";
        formParentPassword.value = "";

        modal.classList.remove('hidden');
    }

    function openEditModal(santri) {
        modalTitle.innerText = "Edit Profil Santri: " + santri.name;
        formIsEdit.value = "1";
        formId.disabled = true; // Cannot edit unique code primary keys
        pwdHelp.innerText = "Biarkan kosong jika tidak ingin mengganti kata sandi";

        // Prepopulate inputs
        formId.value = santri.id;
        // Inject fallback form inputs for ID so it posts back
        if (!document.getElementById('hidden-edit-id')) {
            const hInput = document.createElement('input');
            hInput.type = 'hidden';
            hInput.name = 'id';
            hInput.id = 'hidden-edit-id';
            formIsEdit.parentNode.appendChild(hInput);
        }
        document.getElementById('hidden-edit-id').value = santri.id;

        formBarcode.value = santri.barcode;
        formName.value = santri.name;
        formBirthPlace.value = santri.birth_place;
        formBirthDate.value = santri.birth_date;
        formKelasId.value = santri.kelas_id || "";
        formParentName.value = santri.parent_name;
        formParentPhone.value = santri.parent_phone;
        formParentUsername.value = santri.parent_username;
        formParentPassword.value = ""; // Always blank out passwords during editing for safety

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
