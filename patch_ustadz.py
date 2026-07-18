import sys

content = open('tpqkita-php/ustadz.php', 'r').read()

import_logic = '''// 3. IMPORT CSV
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
                
                if (count($data) < 4) continue; // Skip incomplete

                $id = trim($data[0]);
                $name = trim($data[1]);
                $username = trim($data[2]);
                $phone = trim($data[3]);
                $subjects = isset($data[4]) ? trim($data[4]) : 'Bina Jilid';
                $password = isset($data[5]) ? trim($data[5]) : '';

                if (empty($id) || empty($name) || empty($username)) continue;

                try {
                    $db->beginTransaction();
                    
                    $check = $db->prepare("SELECT id FROM ustadz WHERE id = ?");
                    $check->execute([$id]);
                    $exists = $check->fetch();

                    $checkU = $db->prepare("SELECT id FROM users WHERE username = ? AND linked_id != ?");
                    $checkU->execute([$username, $id]);
                    if ($checkU->fetch()) {
                        $db->rollBack();
                        $error_count++;
                        continue;
                    }
                    
                    if ($exists) {
                        if (!empty($password)) {
                            $hash = password_hash($password, PASSWORD_DEFAULT);
                            $stmt = $db->prepare("UPDATE ustadz SET name = ?, username = ?, phone = ?, subjects = ?, password_hash = ? WHERE id = ?");
                            $stmt->execute([$name, $username, $phone, $subjects, $hash, $id]);
                            
                            $stmtUser = $db->prepare("UPDATE users SET name = ?, username = ?, password_hash = ? WHERE linked_id = ? AND role = 'Ustadz'");
                            $stmtUser->execute([$name, $username, $hash, $id]);
                        } else {
                            $stmt = $db->prepare("UPDATE ustadz SET name = ?, username = ?, phone = ?, subjects = ? WHERE id = ?");
                            $stmt->execute([$name, $username, $phone, $subjects, $id]);

                            $stmtUser = $db->prepare("UPDATE users SET name = ?, username = ? WHERE linked_id = ? AND role = 'Ustadz'");
                            $stmtUser->execute([$name, $username, $id]);
                        }
                    } else {
                        $hash = password_hash(!empty($password) ? $password : 'password', PASSWORD_DEFAULT);
                        $stmt = $db->prepare("INSERT INTO ustadz (id, name, username, phone, subjects, password_hash) VALUES (?, ?, ?, ?, ?, ?)");
                        $stmt->execute([$id, $name, $username, $phone, $subjects, $hash]);

                        $stmtUser = $db->prepare("INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES (?, ?, ?, ?, 'Ustadz', ?)");
                        $stmtUser->execute(['U_USTADZ_' . $id, $username, $hash, $name, $id]);
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
            $alert = "Berhasil mengimpor $success_count data ustadz. " . ($error_count > 0 ? "$error_count baris gagal (username duplikat atau format salah)." : "");
            $alert_type = 'success';
        } else {
            $alert = "Gagal membuka file.";
            $alert_type = 'error';
        }
    } else {
        $alert = "Gagal mengunggah file. Pastikan Anda memilih file yang valid.";
        $alert_type = 'error';
    }
}'''

content = content.replace('// 2. DELETE Ustadz', import_logic + '\n\n// 2. DELETE Ustadz')

old_button = '''        <button onclick="openAddModal()" class="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Ustadz Baru
        </button>'''

new_button = '''        <div class="flex flex-wrap items-center gap-2">
            <a href="ustadz_template.php" class="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-sm border border-slate-200 text-sm">
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
                Tambah Ustadz
            </button>
        </div>'''

content = content.replace(old_button, new_button)

import_modal = '''<!-- Import CSV Modal -->
<div id="import-modal" class="hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 class="text-base font-extrabold text-slate-800">Impor Data Ustadz (Excel/CSV)</h3>
            <button onclick="closeImportModal()" class="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <form method="POST" action="" enctype="multipart/form-data" class="flex flex-col">
            <div class="p-6 overflow-y-auto">
                <p class="text-sm text-slate-500 mb-4">
                    Gunakan file template Excel yang diunduh untuk mengisi data ustadz. Fitur ini memungkinkan Anda <b>menambah ustadz baru</b> secara massal sekaligus.
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
</div>'''

content = content.replace('<!-- Modal Dialog -->', import_modal + '\n\n<!-- Modal Dialog -->')

js_funcs = '''    function openImportModal() {
        document.getElementById('import-modal').classList.remove('hidden');
    }
    function closeImportModal() {
        document.getElementById('import-modal').classList.add('hidden');
    }

    function openAddModal() {'''

content = content.replace('    function openAddModal() {', js_funcs)

with open('tpqkita-php/ustadz.php', 'w') as f:
    f.write(content)

print("File tpqkita-php/ustadz.php patched successfully.")
