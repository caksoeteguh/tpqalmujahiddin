<?php
$content = file_get_contents('tpqkita-php/santri.php');

$import_logic = <<<HTML
// 3. IMPORT CSV
if (\$_SERVER['REQUEST_METHOD'] === 'POST' && isset(\$_POST['import_csv'])) {
    if (isset(\$_FILES['csv_file']) && \$_FILES['csv_file']['error'] === UPLOAD_ERR_OK) {
        \$file = \$_FILES['csv_file']['tmp_name'];
        \$handle = fopen(\$file, "r");
        if (\$handle !== FALSE) {
            \$row = 0;
            \$success_count = 0;
            \$error_count = 0;
            
            // Allow processing some rows even if others fail
            while ((\$data = fgetcsv(\$handle, 1000, ",")) !== FALSE) {
                \$row++;
                if (\$row == 1) continue; // Skip header
                
                if (count(\$data) < 9) continue; // Skip incomplete

                \$id = trim(\$data[0]);
                \$name = trim(\$data[1]);
                \$barcode = trim(\$data[2]);
                \$birth_place = trim(\$data[3]);
                \$birth_date = trim(\$data[4]);
                \$kelas_id = trim(\$data[5]);
                \$parent_name = trim(\$data[6]);
                \$parent_phone = trim(\$data[7]);
                \$parent_username = trim(\$data[8]);
                \$parent_password = isset(\$data[9]) ? trim(\$data[9]) : '';

                if (empty(\$id) || empty(\$name) || empty(\$parent_username)) continue;

                if (empty(\$barcode)) {
                    \$barcode = 'SANTRI-' . strtoupper(substr(uniqid(), -6));
                }

                try {
                    \$db->beginTransaction();
                    
                    // Check if ID exists
                    \$check = \$db->prepare("SELECT id FROM santri WHERE id = ?");
                    \$check->execute([\$id]);
                    \$exists = \$check->fetch();

                    // Check username duplicate (across users table as well to be safe)
                    \$checkU = \$db->prepare("SELECT id FROM users WHERE username = ? AND linked_id != ?");
                    \$checkU->execute([\$parent_username, \$id]);
                    if (\$checkU->fetch()) {
                        \$db->rollBack();
                        \$error_count++;
                        continue;
                    }
                    
                    \$kelas_id_val = !empty(\$kelas_id) ? \$kelas_id : null;
                    
                    if (\$exists) {
                        if (!empty(\$parent_password)) {
                            \$hash = password_hash(\$parent_password, PASSWORD_DEFAULT);
                            \$stmt = \$db->prepare("UPDATE santri SET name = ?, barcode = ?, birth_place = ?, birth_date = ?, kelas_id = ?, parent_name = ?, parent_phone = ?, parent_username = ?, parent_password_hash = ? WHERE id = ?");
                            \$stmt->execute([\$name, \$barcode, \$birth_place, \$birth_date, \$kelas_id_val, \$parent_name, \$parent_phone, \$parent_username, \$hash, \$id]);
                            
                            \$stmtUser = \$db->prepare("UPDATE users SET name = ?, username = ?, password_hash = ? WHERE linked_id = ?");
                            \$stmtUser->execute([\$parent_name, \$parent_username, \$hash, \$id]);
                        } else {
                            \$stmt = \$db->prepare("UPDATE santri SET name = ?, barcode = ?, birth_place = ?, birth_date = ?, kelas_id = ?, parent_name = ?, parent_phone = ?, parent_username = ? WHERE id = ?");
                            \$stmt->execute([\$name, \$barcode, \$birth_place, \$birth_date, \$kelas_id_val, \$parent_name, \$parent_phone, \$parent_username, \$id]);

                            \$stmtUser = \$db->prepare("UPDATE users SET name = ?, username = ? WHERE linked_id = ?");
                            \$stmtUser->execute([\$parent_name, \$parent_username, \$id]);
                        }
                    } else {
                        \$hash = password_hash(!empty(\$parent_password) ? \$parent_password : 'password', PASSWORD_DEFAULT);
                        \$stmt = \$db->prepare("INSERT INTO santri (id, name, barcode, birth_place, birth_date, kelas_id, parent_name, parent_phone, parent_username, parent_password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        \$stmt->execute([\$id, \$name, \$barcode, \$birth_place, \$birth_date, \$kelas_id_val, \$parent_name, \$parent_phone, \$parent_username, \$hash]);

                        \$stmtUser = \$db->prepare("INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES (?, ?, ?, ?, 'OrangTua', ?)");
                        \$stmtUser->execute(['U_PARENT_' . \$id, \$parent_username, \$hash, \$parent_name, \$id]);
                    }
                    \$db->commit();
                    \$success_count++;
                } catch (Exception \$ex) {
                    if (\$db->inTransaction()) {
                        \$db->rollBack();
                    }
                    \$error_count++;
                }
            }
            fclose(\$handle);
            \$alert = "Berhasil mengimpor \$success_count data santri. " . (\$error_count > 0 ? "\$error_count baris gagal (username duplikat atau format salah)." : "");
            \$alert_type = 'success';
        } else {
            \$alert = "Gagal membuka file.";
            \$alert_type = 'error';
        }
    } else {
        \$alert = "Gagal mengunggah file. Pastikan Anda memilih file yang valid.";
        \$alert_type = 'error';
    }
}
HTML;

$content = str_replace("// 2. DELETE Santri", $import_logic . "\n\n// 2. DELETE Santri", $content);

$buttons_old = <<<HTML
        <button onclick="openAddModal()" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Santri Baru
        </button>
HTML;

$buttons_new = <<<HTML
        <div class="flex flex-wrap items-center gap-2">
            <a href="santri_template.php" class="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-sm border border-slate-200 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Template
            </a>
            <button onclick="openImportModal()" class="flex items-center gap-2 bg-white hover:bg-slate-50 text-emerald-700 font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-sm border border-emerald-200 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Impor Excel (CSV)
            </button>
            <button onclick="openAddModal()" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-md text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tambah Santri
            </button>
        </div>
HTML;

$content = str_replace($buttons_old, $buttons_new, $content);

$modal_import = <<<HTML
<!-- Import CSV Modal -->
<div id="import-modal" class="hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 class="text-base font-extrabold text-slate-800">Impor Data Santri (CSV)</h3>
            <button onclick="closeImportModal()" class="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Body -->
        <form method="POST" action="" enctype="multipart/form-data" class="flex flex-col">
            <div class="p-6 overflow-y-auto">
                <p class="text-sm text-slate-500 mb-4">
                    Gunakan file template Excel (CSV) untuk mengimpor data santri. Jika ID Santri sudah ada, datanya akan diubah (update). Jika belum, akan ditambahkan (insert).
                </p>
                <div class="w-full">
                    <label class="block text-xs font-bold text-slate-500 mb-2">Pilih File CSV *</label>
                    <input type="file" name="csv_file" accept=".csv" required
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700">
                </div>
                <input type="hidden" name="import_csv" value="1">
            </div>

            <!-- Footer -->
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
HTML;

$content = str_replace("<!-- Add/Edit Modal Overlay -->", $modal_import . "\n\n<!-- Add/Edit Modal Overlay -->", $content);

$js_funcs = <<<HTML
    function openImportModal() {
        document.getElementById('import-modal').classList.remove('hidden');
    }
    function closeImportModal() {
        document.getElementById('import-modal').classList.add('hidden');
    }

    function openAddModal() {
HTML;

$content = str_replace("function openAddModal() {", $js_funcs, $content);

file_put_contents('tpqkita-php/santri.php', $content);
echo "Patched.";
?>
