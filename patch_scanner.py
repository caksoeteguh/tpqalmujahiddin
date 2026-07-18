import sys

with open('tpqkita-php/scanner.php', 'r') as f:
    content = f.read()

# 1. Update Profile UI
profile_header_end = '''                        <p class="text-xs text-slate-400 font-mono mt-0.5" id="stu-barcode">SANTRI-001</p>
                    </div>
                </div>'''

tracking_history_block = '''
                <!-- Tracking History Block -->
                <div class="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <h4 class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Capaian Terakhir (Jilid)</h4>
                        <div id="stu-last-jilid" class="text-sm font-bold text-slate-800">Memuat...</div>
                    </div>
                    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                        <h4 class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tagihan Hari Ini</h4>
                        <div id="stu-target" class="text-sm font-bold text-slate-800">Memuat...</div>
                    </div>
                    <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:col-span-2">
                        <h4 class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Pelajaran Sebelumnya</h4>
                        <div id="stu-history" class="text-sm text-slate-600 leading-relaxed">Memuat...</div>
                    </div>
                </div>
'''

content = content.replace(profile_header_end, profile_header_end + tracking_history_block)

# 2. Update Javascript AJAX Success handling
js_populate_end = '''                    document.getElementById('stu-class').innerText = data.santri.nama_kelas || 'Siswa Baru';
                    document.getElementById('stu-avatar').innerText = data.santri.name.substring(0,1);'''

js_history_populate = '''
                    document.getElementById('stu-last-jilid').innerText = data.santri.last_jilid || 'Belum ada data';
                    document.getElementById('stu-target').innerText = data.santri.target || 'Belum ada data';
                    document.getElementById('stu-history').innerHTML = data.santri.history || 'Belum ada histori';
'''

content = content.replace(js_populate_end, js_populate_end + js_history_populate)

# 3. Update PHP AJAX Endpoint
ajax_endpoint_start = '''        if ($santri) {
            echo json_encode(['success' => true, 'santri' => $santri]);
        } else {'''

ajax_endpoint_new = '''        if ($santri) {
            $sid = $santri['id'];

            // 1. Capaian Terakhir Jilid
            $stmtLastJilid = $db->prepare("
                SELECT c.page, j.name AS jilid_name, c.status
                FROM capaian_jilid c
                JOIN jilid j ON c.jilid_id = j.id
                WHERE c.santri_id = ?
                ORDER BY c.id DESC LIMIT 1
            ");
            $stmtLastJilid->execute([$sid]);
            $last_jilid = $stmtLastJilid->fetch();

            $last_jilid_str = "Belum ada data";
            $target_str = "Jilid 1 Hal. 1";
            if ($last_jilid) {
                $status_txt = $last_jilid['status'] == 'Lulus' ? 'Lulus' : 'Mengulang';
                $last_jilid_str = $last_jilid['jilid_name'] . " - Hal. " . $last_jilid['page'] . " (" . $status_txt . ")";
                
                if ($last_jilid['status'] == 'Lulus') {
                    $target_str = $last_jilid['jilid_name'] . " Hal. " . ($last_jilid['page'] + 1);
                } else {
                    $target_str = $last_jilid['jilid_name'] . " Hal. " . $last_jilid['page'];
                }
            }

            // 2. History (Pelajaran Sebelumnya) - Union of 3 tables
            // Note: To use UNION ALL, all queries must have same number of columns.
            // capaian_* tables do not have created_at in the schema file provided previously (wait, let's check. They do? No, they don't have created_at based on schema unless they were added. Let's use id for ordering just in case).
            // I will use id as a proxy for time if created_at is missing, but let's assume it has created_at if it's standard, or I'll just check if it fails.
            
            // Wait, let's just query each table and sort in PHP to be safe, because the schema doesn't have created_at on capaian tables in the grep output.
            $stmtJ = $db->prepare("SELECT j.name, c.page, c.status, c.id FROM capaian_jilid c JOIN jilid j ON c.jilid_id = j.id WHERE c.santri_id = ? ORDER BY c.id DESC LIMIT 5");
            $stmtJ->execute([$sid]);
            $hist_j = $stmtJ->fetchAll();
            
            $stmtT = $db->prepare("SELECT s.name, c.ayat_range, c.status, c.id FROM capaian_tahfidz c JOIN surat s ON c.surat_id = s.id WHERE c.santri_id = ? ORDER BY c.id DESC LIMIT 5");
            $stmtT->execute([$sid]);
            $hist_t = $stmtT->fetchAll();
            
            $stmtI = $db->prepare("SELECT c.category, c.item, c.status, c.id FROM capaian_ibadah_praktis c WHERE c.santri_id = ? ORDER BY c.id DESC LIMIT 5");
            $stmtI->execute([$sid]);
            $hist_i = $stmtI->fetchAll();
            
            $all_hist = [];
            foreach($hist_j as $hj) { $all_hist[] = ['type' => 'Jilid', 'desc' => $hj['name'] . ' Hal. ' . $hj['page'], 'status' => $hj['status'], 'id' => $hj['id']]; }
            foreach($hist_t as $ht) { $all_hist[] = ['type' => 'Tahfidz', 'desc' => 'QS. ' . $ht['name'] . ' (' . $ht['ayat_range'] . ')', 'status' => $ht['status'], 'id' => $ht['id']]; }
            foreach($hist_i as $hi) { $all_hist[] = ['type' => 'Ibadah', 'desc' => $hi['category'] . ' - ' . $hi['item'], 'status' => $hi['status'], 'id' => $hi['id']]; }
            
            usort($all_hist, function($a, $b) {
                return $b['id'] - $a['id']; // descending
            });
            
            $all_hist = array_slice($all_hist, 0, 5);
            $hist_strings = [];
            foreach($all_hist as $h) {
                $badge = $h['status'] == 'Lulus' ? '<span class="text-emerald-600 font-bold">[Lulus]</span>' : '<span class="text-red-500 font-bold">[Ulang]</span>';
                $hist_strings[] = "• " . $h['type'] . ": " . $h['desc'] . " " . $badge;
            }
            
            $santri['last_jilid'] = $last_jilid_str;
            $santri['target'] = $target_str;
            $santri['history'] = empty($hist_strings) ? "Belum ada histori pelajaran." : implode("<br>", $hist_strings);

            echo json_encode(['success' => true, 'santri' => $santri]);
        } else {'''

content = content.replace(ajax_endpoint_start, ajax_endpoint_new)

with open('tpqkita-php/scanner.php', 'w') as f:
    f.write(content)

print("scanner.php patched.")
