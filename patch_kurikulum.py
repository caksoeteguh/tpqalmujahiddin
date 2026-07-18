import sys

with open('tpqkita-php/kurikulum.php', 'r') as f:
    content = f.read()

db_init_and_action = '''// --- AUTO INIT DB ---
$db->exec("CREATE TABLE IF NOT EXISTS mapel_lain (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// 3. Save Mapel Lain
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_mapel'])) {
    $id = trim($_POST['id']);
    $name = trim($_POST['name']);
    $description = trim($_POST['description']);
    $is_edit = $_POST['is_edit'] === '1';

    try {
        if ($is_edit) {
            $stmt = $db->prepare("UPDATE mapel_lain SET name = ?, description = ? WHERE id = ?");
            $stmt->execute([$name, $description, $id]);
        } else {
            $check = $db->prepare("SELECT id FROM mapel_lain WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                throw new Exception("ID Mapel '$id' sudah ada!");
            }
            $stmt = $db->prepare("INSERT INTO mapel_lain (id, name, description) VALUES (?, ?, ?)");
            $stmt->execute([$id, $name, $description]);
        }
        $alert = "Data Mata Pelajaran Lain berhasil disimpan!";
        $alert_type = 'success';
    } catch (Exception $e) {
        $alert = "Gagal menyimpan Mata Pelajaran: " . $e->getMessage();
        $alert_type = 'error';
    }
}
'''

content = content.replace('// Fetch lists', db_init_and_action + '\n// Fetch lists')

fetch_lists = '''// Fetch lists
$jilid_list = $db->query("SELECT * FROM jilid ORDER BY name ASC")->fetchAll();
$surat_list = $db->query("SELECT * FROM surat ORDER BY CAST(SUBSTRING(id, 3) AS UNSIGNED) ASC, id ASC")->fetchAll();
$mapel_list = $db->query("SELECT * FROM mapel_lain ORDER BY name ASC")->fetchAll();'''
content = content.replace('// Fetch lists\n$jilid_list = $db->query("SELECT * FROM jilid ORDER BY name ASC")->fetchAll();\n$surat_list = $db->query("SELECT * FROM surat ORDER BY CAST(SUBSTRING(id, 3) AS UNSIGNED) ASC, id ASC")->fetchAll();', fetch_lists)

tabs_old = '''    <div class="flex border-b border-slate-200">
        <a href="kurikulum.php?tab=jilid" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'jilid' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Tingkatan Jilid (Iqra' / Al-Qur'an)
        </a>
        <a href="kurikulum.php?tab=surat" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'surat' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Daftar Surat Pendek (Tahfidz)
        </a>
    </div>'''

tabs_new = '''    <div class="flex flex-wrap border-b border-slate-200">
        <a href="kurikulum.php?tab=jilid" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'jilid' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Tingkatan Jilid
        </a>
        <a href="kurikulum.php?tab=surat" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'surat' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Daftar Surat (Tahfidz)
        </a>
        <a href="kurikulum.php?tab=mapel" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'mapel' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Mata Pelajaran Lain
        </a>
    </div>'''
content = content.replace(tabs_old, tabs_new)

mapel_tab = '''
    <!-- Tab 3: Mapel Lain -->
    <?php elseif ($active_tab === 'mapel'): ?>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <!-- Mapel table -->
            <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100">
                    <h3 class="font-bold text-slate-800 text-sm">Daftar Mata Pelajaran Lain</h3>
                </div>
                <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                            <th class="py-3 px-6">ID</th>
                            <th class="py-3 px-6">Nama Pelajaran</th>
                            <th class="py-3 px-6">Keterangan</th>
                            <th class="py-3 px-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                        <?php foreach ($mapel_list as $m): ?>
                            <tr>
                                <td class="py-3.5 px-6 font-mono text-xs"><?php echo htmlspecialchars($m['id']); ?></td>
                                <td class="py-3.5 px-6 text-slate-800 font-bold"><?php echo htmlspecialchars($m['name']); ?></td>
                                <td class="py-3.5 px-6 text-slate-500 text-xs"><?php echo htmlspecialchars($m['description']); ?></td>
                                <td class="py-3.5 px-6 text-right">
                                    <button onclick='editMapel(<?php echo json_encode($m); ?>)' class="text-xs text-indigo-600 font-bold hover:underline">Edit</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                        <?php if (empty($mapel_list)): ?>
                            <tr>
                                <td colspan="4" class="py-4 text-center text-slate-400 text-xs">Belum ada mata pelajaran lain.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

            <!-- Form Save Mapel -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h3 id="mapel-form-title" class="font-bold text-slate-800 text-sm mb-4">Tambah Mapel Baru</h3>
                <form action="kurikulum.php?tab=mapel" method="POST" class="space-y-4">
                    <input type="hidden" name="is_edit" id="m-is-edit" value="0">
                    <input type="hidden" name="save_mapel" value="1">
                    
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">ID Mapel *</label>
                        <input type="text" name="id" id="m-id" required placeholder="MP01" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Nama Pelajaran *</label>
                        <input type="text" name="name" id="m-name" required placeholder="Misal: Fiqih Ibadah" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Keterangan</label>
                        <input type="text" name="description" id="m-desc" placeholder="Opsional" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700">
                    </div>

                    <div class="pt-2 flex gap-2">
                        <button type="button" onclick="resetMapelForm()" class="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs">Reset</button>
                        <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
'''

content = content.replace('    <?php endif; ?>\n</div>', '    <?php endif; ?>\n' + mapel_tab + '\n</div>')

js_mapel = '''
    function editMapel(m) {
        document.getElementById('mapel-form-title').innerText = "Edit Mapel: " + m.name;
        document.getElementById('m-is-edit').value = "1";
        const idInp = document.getElementById('m-id');
        idInp.value = m.id;
        idInp.readOnly = true;
        idInp.classList.add('bg-slate-100');
        document.getElementById('m-name').value = m.name;
        document.getElementById('m-desc').value = m.description;
    }

    function resetMapelForm() {
        document.getElementById('mapel-form-title').innerText = "Tambah Mapel Baru";
        document.getElementById('m-is-edit').value = "0";
        const idInp = document.getElementById('m-id');
        idInp.value = "";
        idInp.readOnly = false;
        idInp.classList.remove('bg-slate-100');
        document.getElementById('m-name').value = "";
        document.getElementById('m-desc').value = "";
    }
</script>'''

content = content.replace('</script>', js_mapel)

with open('tpqkita-php/kurikulum.php', 'w') as f:
    f.write(content)

print("File tpqkita-php/kurikulum.php patched successfully.")
