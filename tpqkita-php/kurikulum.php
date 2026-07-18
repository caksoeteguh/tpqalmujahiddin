<?php
// ==========================================
// TPQKITA - CURRICULUM MANAGER (kurikulum.php)
// Configurations for Jilid and Tahfidz Suras
// ==========================================

require_once 'header.php';
requireRoles(['Walikelas', 'KepalaTPQ']);

$db = getDB();
$active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'jilid';
$alert = '';
$alert_type = '';

// --- ACTIONS HANDLER ---

// 1. Save Jilid
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_jilid'])) {
    $id = trim($_POST['id']);
    $name = trim($_POST['name']);
    $total_pages = (int)$_POST['total_pages'];
    $is_edit = $_POST['is_edit'] === '1';

    try {
        if ($is_edit) {
            $stmt = $db->prepare("UPDATE jilid SET name = ?, total_pages = ? WHERE id = ?");
            $stmt->execute([$name, $total_pages, $id]);
        } else {
            $check = $db->prepare("SELECT id FROM jilid WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                throw new Exception("ID Jilid '$id' sudah ada!");
            }
            $stmt = $db->prepare("INSERT INTO jilid (id, name, total_pages) VALUES (?, ?, ?)");
            $stmt->execute([$id, $name, $total_pages]);
        }
        $alert = "Data Jilid berhasil disimpan!";
        $alert_type = 'success';
    } catch (Exception $e) {
        $alert = "Gagal menyimpan Jilid: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// 2. Save Surat
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_surat'])) {
    $id = trim($_POST['id']);
    $name = trim($_POST['name']);
    $total_ayat = (int)$_POST['total_ayat'];
    $is_edit = $_POST['is_edit'] === '1';

    try {
        if ($is_edit) {
            $stmt = $db->prepare("UPDATE surat SET name = ?, total_ayat = ? WHERE id = ?");
            $stmt->execute([$name, $total_ayat, $id]);
        } else {
            $check = $db->prepare("SELECT id FROM surat WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                throw new Exception("ID Surat '$id' sudah ada!");
            }
            $stmt = $db->prepare("INSERT INTO surat (id, name, total_ayat) VALUES (?, ?, ?)");
            $stmt->execute([$id, $name, $total_ayat]);
        }
        $alert = "Data Surat berhasil disimpan!";
        $alert_type = 'success';
    } catch (Exception $e) {
        $alert = "Gagal menyimpan Surat: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// --- AUTO INIT DB ---
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

// Fetch lists
$jilid_list = $db->query("SELECT * FROM jilid ORDER BY name ASC")->fetchAll();
$surat_list = $db->query("SELECT * FROM surat ORDER BY CAST(SUBSTRING(id, 3) AS UNSIGNED) ASC, id ASC")->fetchAll();
$mapel_list = $db->query("SELECT * FROM mapel_lain ORDER BY name ASC")->fetchAll();
?>

<div class="space-y-8 animate-fade-in">
    <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Manajemen Kurikulum TPQ</h1>
        <p class="text-sm text-slate-500">Definisikan tingkat jilid buku Iqra' serta daftar surat-surat hafalan Al-Qur'an.</p>
    </div>

    <!-- Alert banner -->
    <?php if (!empty($alert)): ?>
        <div class="rounded-2xl border p-4 flex items-start gap-3 <?php echo $alert_type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'; ?>">
            <p class="text-sm"><?php echo $alert; ?></p>
        </div>
    <?php endif; ?>

    <!-- Navigation Tabs -->
    <div class="flex flex-wrap border-b border-slate-200">
        <a href="kurikulum.php?tab=jilid" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'jilid' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Tingkatan Jilid
        </a>
        <a href="kurikulum.php?tab=surat" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'surat' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Daftar Surat (Tahfidz)
        </a>
        <a href="kurikulum.php?tab=mapel" class="px-6 py-3.5 text-sm font-bold border-b-2 transition duration-150 <?php echo $active_tab === 'mapel' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'; ?>">
            Mata Pelajaran Lain
        </a>
    </div>

    <!-- Tab 1: Jilid -->
    <?php if ($active_tab === 'jilid'): ?>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <!-- Jilid list table -->
            <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100">
                    <h3 class="font-bold text-slate-800 text-sm">Daftar Buku Panduan Belajar</h3>
                </div>
                <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                            <th class="py-3 px-6">ID</th>
                            <th class="py-3 px-6">Tingkat / Nama</th>
                            <th class="py-3 px-6">Total Halaman</th>
                            <th class="py-3 px-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                        <?php foreach ($jilid_list as $j): ?>
                            <tr>
                                <td class="py-3.5 px-6 font-mono text-xs"><?php echo htmlspecialchars($j['id']); ?></td>
                                <td class="py-3.5 px-6 text-slate-800 font-bold"><?php echo htmlspecialchars($j['name']); ?></td>
                                <td class="py-3.5 px-6 text-slate-500 font-mono text-xs"><?php echo $j['total_pages']; ?> Halaman</td>
                                <td class="py-3.5 px-6 text-right">
                                    <button onclick='editJilid(<?php echo json_encode($j); ?>)' class="text-xs text-indigo-600 font-bold hover:underline">Edit</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Form Save Jilid -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h3 id="jilid-form-title" class="font-bold text-slate-800 text-sm mb-4">Tambah Jilid Baru</h3>
                <form action="kurikulum.php?tab=jilid" method="POST" class="space-y-4">
                    <input type="hidden" name="is_edit" id="j-is-edit" value="0">
                    <input type="hidden" name="save_jilid" value="1">

                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">ID Jilid *</label>
                        <input type="text" name="id" id="j-id" required placeholder="J08" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Nama Jilid *</label>
                        <input type="text" name="name" id="j-name" required placeholder="Misal: Jilid 7" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Total Halaman *</label>
                        <input type="number" name="total_pages" id="j-pages" required placeholder="40" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700 font-mono">
                    </div>

                    <div class="pt-2 flex gap-2">
                        <button type="button" onclick="resetJilidForm()" class="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs">Reset</button>
                        <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs">Simpan</button>
                    </div>
                </form>
            </div>
        </div>

    <!-- Tab 2: Surat (Tahfidz) -->
    <?php else: ?>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <!-- Surat table -->
            <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div class="px-6 py-5 border-b border-slate-100">
                    <h3 class="font-bold text-slate-800 text-sm">Target Surat Hafalan Al-Qur'an (Juz Amma)</h3>
                </div>
                <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                            <th class="py-3 px-6">ID</th>
                            <th class="py-3 px-6">Nama Surat</th>
                            <th class="py-3 px-6">Jumlah Ayat</th>
                            <th class="py-3 px-6 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                        <?php foreach ($surat_list as $s): ?>
                            <tr>
                                <td class="py-3.5 px-6 font-mono text-xs"><?php echo htmlspecialchars($s['id']); ?></td>
                                <td class="py-3.5 px-6 text-slate-800 font-bold">QS. <?php echo htmlspecialchars($s['name']); ?></td>
                                <td class="py-3.5 px-6 text-slate-500 font-mono text-xs"><?php echo $s['total_ayat']; ?> Ayat</td>
                                <td class="py-3.5 px-6 text-right">
                                    <button onclick='editSurat(<?php echo json_encode($s); ?>)' class="text-xs text-indigo-600 font-bold hover:underline">Edit</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <!-- Form Save Surat -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h3 id="surat-form-title" class="font-bold text-slate-800 text-sm mb-4">Tambah Surat Baru</h3>
                <form action="kurikulum.php?tab=surat" method="POST" class="space-y-4">
                    <input type="hidden" name="is_edit" id="s-is-edit" value="0">
                    <input type="hidden" name="save_surat" value="1">

                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">ID Surat *</label>
                        <input type="text" name="id" id="s-id" required placeholder="SR07" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Nama Surat * (Tanpa QS.)</label>
                        <input type="text" name="name" id="s-name" required placeholder="Misal: Al-Humazah" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1.5">Jumlah Ayat *</label>
                        <input type="number" name="total_ayat" id="s-ayat" required placeholder="9" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none text-slate-700 font-mono">
                    </div>

                    <div class="pt-2 flex gap-2">
                        <button type="button" onclick="resetSuratForm()" class="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs">Reset</button>
                        <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    <?php endif; ?>

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

</div>

<script>
    function editJilid(j) {
        document.getElementById('jilid-form-title').innerText = "Edit Jilid: " + j.name;
        document.getElementById('j-is-edit').value = "1";
        const idInp = document.getElementById('j-id');
        idInp.value = j.id;
        idInp.readOnly = true;
        idInp.classList.add('bg-slate-100');

        document.getElementById('j-name').value = j.name;
        document.getElementById('j-pages').value = j.total_pages;
    }

    function resetJilidForm() {
        document.getElementById('jilid-form-title').innerText = "Tambah Jilid Baru";
        document.getElementById('j-is-edit').value = "0";
        const idInp = document.getElementById('j-id');
        idInp.value = "";
        idInp.readOnly = false;
        idInp.classList.remove('bg-slate-100');

        document.getElementById('j-name').value = "";
        document.getElementById('j-pages').value = "";
    }

    function editSurat(s) {
        document.getElementById('surat-form-title').innerText = "Edit Surat QS. " + s.name;
        document.getElementById('s-is-edit').value = "1";
        const idInp = document.getElementById('s-id');
        idInp.value = s.id;
        idInp.readOnly = true;
        idInp.classList.add('bg-slate-100');

        document.getElementById('s-name').value = s.name;
        document.getElementById('s-ayat').value = s.total_ayat;
    }

    function resetSuratForm() {
        document.getElementById('surat-form-title').innerText = "Tambah Surat Baru";
        document.getElementById('s-is-edit').value = "0";
        const idInp = document.getElementById('s-id');
        idInp.value = "";
        idInp.readOnly = false;
        idInp.classList.remove('bg-slate-100');

        document.getElementById('s-name').value = "";
        document.getElementById('s-ayat').value = "";
    }

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
</script>

<?php
require_once 'footer.php';
?>
