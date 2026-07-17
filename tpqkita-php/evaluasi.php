<?php
// ==========================================
// TPQKITA - MANUAL EVALUATION (evaluasi.php)
// Rich grading interface for teachers without webcams
// ==========================================

require_once 'header.php';
requireRoles(['Walikelas', 'KepalaTPQ', 'Ustadz']);

$db = getDB();
$alert = '';
$alert_type = '';

// Handle grading submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_grade'])) {
    $santri_id = trim($_POST['santri_id']);
    $eval_type = trim($_POST['eval_type']); // 'jilid', 'tahfidz', 'ibadah'
    $status = trim($_POST['status']); // 'Lulus', 'Mengulang'
    $notes = trim($_POST['notes']);
    $ustadz_id = $_SESSION['linked_id'] ?? 'U01';

    try {
        if (empty($santri_id)) {
            throw new Exception("Santri harus dipilih!");
        }

        if ($eval_type === 'jilid') {
            $jilid_id = trim($_POST['jilid_id']);
            $page = (int)$_POST['page'];
            
            $stmt = $db->prepare("
                INSERT INTO capaian_jilid (santri_id, jilid_id, page, status, notes, ustadz_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$santri_id, $jilid_id, $page, $status, $notes, $ustadz_id]);
        } elseif ($eval_type === 'tahfidz') {
            $surat_id = trim($_POST['surat_id']);
            $ayat_range = trim($_POST['ayat_range']);
            
            $stmt = $db->prepare("
                INSERT INTO capaian_tahfidz (santri_id, surat_id, ayat_range, status, notes, ustadz_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$santri_id, $surat_id, $ayat_range, $status, $notes, $ustadz_id]);
        } elseif ($eval_type === 'ibadah') {
            $category = trim($_POST['ibadah_category']);
            $item = trim($_POST['ibadah_item']);
            
            $stmt = $db->prepare("
                INSERT INTO capaian_ibadah_praktis (santri_id, category, item, status, notes, ustadz_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$santri_id, $category, $item, $status, $notes, $ustadz_id]);
        }

        $alert = "Evaluasi capaian berhasil dicatat!";
        $alert_type = 'success';
    } catch (Exception $e) {
        $alert = "Gagal mencatat evaluasi: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// Fetch lists
$santri_list = $db->query("
    SELECT s.id, s.name, s.barcode, k.name AS nama_kelas 
    FROM santri s 
    LEFT JOIN kelas k ON s.kelas_id = k.id 
    ORDER BY s.name ASC
")->fetchAll();

$jilid_opt = $db->query("SELECT * FROM jilid ORDER BY name ASC")->fetchAll();
$surat_opt = $db->query("SELECT * FROM surat ORDER BY CAST(SUBSTRING(id, 3) AS UNSIGNED) ASC, id ASC")->fetchAll();
?>

<div class="space-y-8 animate-fade-in max-w-4xl mx-auto">
    <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Input Evaluasi Capaian Manual</h1>
        <p class="text-sm text-slate-500">Pilih nama santri dari daftar untuk mencatat atau memperbarui progress mengaji, setoran hafalan surah, atau praktik ibadah harian mereka.</p>
    </div>

    <!-- Feedback banner -->
    <?php if (!empty($alert)): ?>
        <div class="rounded-2xl border p-4 flex items-start gap-3 <?php echo $alert_type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'; ?>">
            <p class="text-sm"><?php echo $alert; ?></p>
        </div>
    <?php endif; ?>

    <div class="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl">
        <form action="evaluasi.php" method="POST" class="space-y-6">
            <input type="hidden" name="submit_grade" value="1">
            <input type="hidden" name="eval_type" id="form-eval-type" value="jilid">

            <!-- Step 1: Select Student -->
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Pilih Santri *</label>
                <select name="santri_id" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                    <option value="">-- Cari &amp; Pilih Santri --</option>
                    <?php foreach ($santri_list as $s): ?>
                        <option value="<?php echo $s['id']; ?>">
                            <?php echo htmlspecialchars($s['name']); ?> (<?php echo htmlspecialchars($s['nama_kelas'] ?? 'Siswa Baru'); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>

            <!-- Step 2: Select Evaluation Category tabs -->
            <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Kategori Capaian</label>
                <div class="grid grid-cols-3 gap-2">
                    <button type="button" onclick="selectEvalTab('jilid')" id="tab-jilid" class="eval-tab-btn py-3 rounded-xl text-xs font-bold border transition duration-150 border-emerald-500 bg-emerald-50 text-emerald-700">Jilid / Iqra'</button>
                    <button type="button" onclick="selectEvalTab('tahfidz')" id="tab-tahfidz" class="eval-tab-btn py-3 rounded-xl text-xs font-bold border transition duration-150 border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Tahfidz Qur'an</button>
                    <button type="button" onclick="selectEvalTab('ibadah')" id="tab-ibadah" class="eval-tab-btn py-3 rounded-xl text-xs font-bold border transition duration-150 border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Ibadah Praktis</button>
                </div>
            </div>

            <!-- JILID DATA PANEL -->
            <div id="pane-jilid" class="eval-sub-pane bg-slate-50/50 p-5 border border-slate-150 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Buku Jilid Iqra' *</label>
                    <select name="jilid_id" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none">
                        <?php foreach ($jilid_opt as $j): ?>
                            <option value="<?php echo $j['id']; ?>"><?php echo htmlspecialchars($j['name']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Halaman Belajar Terakhir *</label>
                    <input type="number" name="page" placeholder="Misal: 15" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none font-mono">
                </div>
            </div>

            <!-- TAHFIDZ DATA PANEL -->
            <div id="pane-tahfidz" class="eval-sub-pane hidden bg-slate-50/50 p-5 border border-slate-150 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Pilih Surat *</label>
                    <select name="surat_id" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none">
                        <?php foreach ($surat_opt as $s): ?>
                            <option value="<?php echo $s['id']; ?>">QS. <?php echo htmlspecialchars($s['name']); ?> (<?php echo $s['total_ayat']; ?> Ayat)</option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Rentang Ayat Setor *</label>
                    <input type="text" name="ayat_range" placeholder="Misal: 1-10" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none font-mono">
                </div>
            </div>

            <!-- IBADAH DATA PANEL -->
            <div id="pane-ibadah" class="eval-sub-pane hidden bg-slate-50/50 p-5 border border-slate-150 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Kategori Ibadah *</label>
                    <select name="ibadah_category" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none">
                        <option value="Wudhu">Gerakan Wudhu</option>
                        <option value="Sholat">Gerakan Sholat</option>
                        <option value="Doa">Doa-doa Pendek</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Nama Hafalan/Praktik *</label>
                    <input type="text" name="ibadah_item" placeholder="Misal: Doa Sebelum Makan" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 font-bold focus:outline-none">
                </div>
            </div>

            <!-- Outcomes / notes -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Status Kelulusan *</label>
                    <select name="status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none text-slate-700">
                        <option value="Lulus">LULUS / LANJUT</option>
                        <option value="Mengulang">MENGULANG</option>
                    </select>
                </div>
                <div class="sm:col-span-2">
                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Catatan Evaluasi Guru</label>
                    <input type="text" name="notes" placeholder="Berikan saran atau catatan perkembangan mengaji..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-700">
                </div>
            </div>

            <!-- Form Actions -->
            <div class="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="reset" class="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-6 rounded-xl text-xs transition duration-150">Clear Form</button>
                <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-8 rounded-xl text-xs transition duration-150 shadow-md">Simpan Hasil Penilaian</button>
            </div>
        </form>
    </div>
</div>

<script>
    function selectEvalTab(tabName) {
        // Un-highlight previous active button
        document.querySelectorAll('.eval-tab-btn').forEach(btn => {
            btn.classList.remove('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
            btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
        });

        // Highlight selected tab
        document.getElementById('tab-' + tabName).classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        document.getElementById('tab-' + tabName).classList.remove('border-slate-200', 'bg-white', 'text-slate-600');

        // Toggle form panels visibility
        document.querySelectorAll('.eval-sub-pane').forEach(pane => {
            pane.classList.add('hidden');
        });
        document.getElementById('pane-' + tabName).classList.remove('hidden');
        document.getElementById('form-eval-type').value = tabName;
    }
</script>

<?php
require_once 'footer.php';
?>
