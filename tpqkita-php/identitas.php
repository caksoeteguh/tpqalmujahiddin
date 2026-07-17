<?php
// ==========================================
// TPQKITA - PROFILE CONFIGS (identitas.php)
// Customizes workspace branding throughout modules
// ==========================================

require_once 'header.php';
requireRoles(['Walikelas', 'KepalaTPQ']);

$db = getDB();
$alert = '';
$alert_type = '';

// Handle updating configuration details
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_identity'])) {
    $name = trim($_POST['name']);
    $phone = trim($_POST['phone']);
    $footer_text = trim($_POST['footer_text']);
    $address = trim($_POST['address']);
    
    try {
        if (empty($name)) {
            throw new Exception("Nama Lembaga tidak boleh kosong!");
        }

        // Try to update ID 1
        $stmt = $db->prepare("
            UPDATE tpq_identity SET 
                name = ?, phone = ?, footer_text = ?, address = ?
            WHERE id = 1
        ");
        $stmt->execute([$name, $phone, $footer_text, $address]);

        $alert = "Identitas lembaga TPQ berhasil diperbarui!";
        $alert_type = 'success';
        
        // Refresh page to load new session variables immediately
        echo "<script>setTimeout(() => { window.location.reload(); }, 1200);</script>";
    } catch (Exception $e) {
        $alert = "Gagal memperbarui profil: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// Fetch current values
$info = [];
try {
    $info = $db->query("SELECT * FROM tpq_identity WHERE id = 1 LIMIT 1")->fetch();
} catch (Exception $e) {}

// Fallbacks if not set
if (!$info) {
    $info = [
        'name' => 'TPQ Al-Falah',
        'phone' => '081234567890',
        'footer_text' => 'TPQKita Digital Workspace',
        'address' => 'Jl. Masjid No. 12, Jakarta'
    ];
}
?>

<div class="space-y-8 animate-fade-in max-w-2xl mx-auto">
    <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Konfigurasi Identitas Lembaga TPQ</h1>
        <p class="text-sm text-slate-500">Sesuaikan nama madrasah/TPQ Anda, nomor telepon, alamat fisik, serta catatan kaki cetak lanyard.</p>
    </div>

    <!-- Alert notice -->
    <?php if (!empty($alert)): ?>
        <div class="rounded-2xl border p-4 flex items-start gap-3 <?php echo $alert_type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'; ?>">
            <p class="text-sm"><?php echo $alert; ?></p>
        </div>
    <?php endif; ?>

    <!-- Form Container card -->
    <div class="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl">
        <form action="identitas.php" method="POST" class="space-y-6">
            <input type="hidden" name="update_identity" value="1">

            <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Nama Lembaga TPQ *</label>
                <input type="text" name="name" required value="<?php echo htmlspecialchars($info['name']); ?>" placeholder="Misal: TPQ Al-Falah..." 
                       class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-2">Nomor Telepon Kontak</label>
                    <input type="text" name="phone" value="<?php echo htmlspecialchars($info['phone'] ?? ''); ?>" placeholder="021-xxxxxxxx atau 08xxxxxxxxx" 
                           class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none font-mono">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-2">Catatan Kaki Lanyard (Copyright)</label>
                    <input type="text" name="footer_text" value="<?php echo htmlspecialchars($info['footer_text'] ?? ''); ?>" placeholder="TPQKita Digital Workspace" 
                           class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none">
                </div>
            </div>

            <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Alamat Lengkap Lembaga</label>
                <textarea name="address" placeholder="Tulis alamat fisik masjid atau sekretariat TPQ..." rows="4" 
                          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none"><?php echo htmlspecialchars($info['address'] ?? ''); ?></textarea>
            </div>

            <!-- Submit footer -->
            <div class="pt-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <button type="submit" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl text-xs transition duration-150 shadow-md">
                    Simpan Perubahan Identitas
                </button>
            </div>
        </form>
    </div>
</div>

<?php
require_once 'footer.php';
?>
