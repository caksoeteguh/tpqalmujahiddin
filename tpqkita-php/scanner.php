<?php
// ==========================================
// TPQKITA - WEBCAM SCANNER & GRADING (scanner.php)
// Real-time student scanner with synthesised beep & AJAX grading
// ==========================================

require_once 'header.php';
requireRoles(['Walikelas', 'KepalaTPQ', 'Ustadz']);

$db = getDB();
$alert = '';
$alert_type = '';

// Handle direct form submission for grading (if not using AJAX)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_grade'])) {
    $santri_id = trim($_POST['santri_id']);
    $eval_type = trim($_POST['eval_type']); // 'jilid', 'tahfidz', 'ibadah'
    $status = trim($_POST['status']); // 'Lulus', 'Mengulang'
    $notes = trim($_POST['notes']);
    $ustadz_id = $_SESSION['linked_id'] ?? 'U01'; // Fallback to first ustadz if admin

    try {
        if ($eval_type === 'jilid') {
            $jilid_id = trim($_POST['jilid_id']);
            $page = (int)$_POST['page'];
            
            $stmt = $db->prepare("
                INSERT INTO capaian_jilid (santri_id, jilid_id, page, status, notes, ustadz_id)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([$santri_id, $jilid_id, $page, $status, $notes, $ustadz_id]);
            
            // Also update student's default level (optional helper logic)
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

        $alert = "Berhasil mencatat evaluasi capaian santri!";
        $alert_type = 'success';
    } catch (Exception $e) {
        $alert = "Gagal mencatat evaluasi: " . $e->getMessage();
        $alert_type = 'error';
    }
}

// Fetch curriculum items for forms selection
$jilid_opt = $db->query("SELECT * FROM jilid ORDER BY name ASC")->fetchAll();
$surat_opt = $db->query("SELECT * FROM surat ORDER BY CAST(SUBSTRING(id, 3) AS UNSIGNED) ASC, id ASC")->fetchAll();
?>

<!-- Custom visual effects for laser scanners -->
<style>
    #scanner-viewfinder {
        position: relative;
    }
    #scanner-viewfinder::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 2px;
        background: rgb(239, 68, 68); /* Red laser */
        box-shadow: 0 0 8px rgb(239, 68, 68);
        animation: laser-pulse 2s infinite linear;
        z-index: 10;
        pointer-events: none;
    }
    @keyframes laser-pulse {
        0% { top: 0%; }
        50% { top: 100%; }
        100% { top: 0%; }
    }
</style>

<div class="space-y-8 animate-fade-in">
    <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight">Scanner Kartu Barcode (Webcam)</h1>
        <p class="text-sm text-slate-500">Gunakan webcam komputer/laptop untuk men-scan barcode pada kartu lanyard santri. Sistem akan memunculkan profil secara real-time.</p>
    </div>

    <!-- Alert Box -->
    <?php if (!empty($alert)): ?>
        <div class="rounded-2xl border p-4 flex items-start gap-3 <?php echo $alert_type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'; ?>">
            <p class="text-sm"><?php echo $alert; ?></p>
        </div>

<?php
// Get all santri for dropdown
$santri_all = $db->query("SELECT id, name, barcode FROM santri ORDER BY name ASC")->fetchAll();
?>

    <?php endif; ?>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Webcam Scanner Viewfinder Panel (Cols 5) -->
        <div class="lg:col-span-5 space-y-4">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-center relative">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <h3 class="font-bold text-white text-sm flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        Kamera Feed Live
                    </h3>
                    <select id="camera-select" class="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-300 focus:outline-none">
                        <option value="">Memuat Kamera...</option>
                    </select>
                </div>

                <!-- Live scanner canvas display -->
                <div id="scanner-viewfinder" class="w-full aspect-video bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center relative">
                    <div id="reader" class="w-full h-full"></div>
                    
                    <!-- Scan indicator target overlay -->
                    <div class="absolute inset-8 border border-white/20 rounded-xl flex items-center justify-center pointer-events-none z-10">
                        <span class="w-12 h-12 border-t-2 border-l-2 border-emerald-500 absolute top-0 left-0 rounded-tl-lg"></span>
                        <span class="w-12 h-12 border-t-2 border-r-2 border-emerald-500 absolute top-0 right-0 rounded-tr-lg"></span>
                        <span class="w-12 h-12 border-b-2 border-l-2 border-emerald-500 absolute bottom-0 left-0 rounded-bl-lg"></span>
                        <span class="w-12 h-12 border-b-2 border-r-2 border-emerald-500 absolute bottom-0 right-0 rounded-br-lg"></span>
                        <span class="text-[10px] font-black tracking-widest text-emerald-400 uppercase bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-1 rounded-full">TEMPATKAN BARCODE</span>
                    </div>
                </div>

                <!-- Action controllers -->
                <div class="mt-6 flex gap-3">
                    <button id="btn-start" class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition duration-150 shadow-lg shadow-emerald-500/10">
                        Nyalakan Kamera
                    </button>
                    <button id="btn-stop" disabled class="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold py-3 px-4 rounded-xl text-sm transition duration-150">
                        Matikan
                    </button>
                </div>
            </div>

            <!-- Manual input helper -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Pencarian Santri Manual</h4>
                <div class="flex flex-col gap-3">
                    <div class="flex gap-2">
                        <input type="text" id="manual-barcode" placeholder="Ketik Barcode / ID Santri lalu klik Cari..." class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500">
                        <button onclick="fetchStudentByBarcode(document.getElementById('manual-barcode').value)" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition duration-150">Cari</button>
                    </div>
                    <div class="relative">
                        <select 
                            id="manual-select"
                            class="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:outline-none focus:border-emerald-500 block w-full px-4 py-2.5 font-bold cursor-pointer"
                            onchange="if(this.value) fetchStudentByBarcode(this.value);"
                        >
                            <option value="">-- Atau Pilih Nama Santri --</option>
                            <?php foreach ($santri_all as $s): ?>
                                <option value="<?php echo htmlspecialchars($s['barcode']); ?>"><?php echo htmlspecialchars($s['name']); ?> (<?php echo htmlspecialchars($s['barcode']); ?>)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- Student details & grading panel (Cols 7) -->
        <div class="lg:col-span-7">
            <div id="result-placeholder" class="bg-white border border-slate-200/80 border-dashed rounded-3xl p-12 text-center text-slate-400 space-y-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-14 h-14 text-slate-300 mx-auto">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <div class="space-y-1">
                    <h4 class="font-extrabold text-sm text-slate-600">Siap Menerima Scan</h4>
                    <p class="text-xs text-slate-400 max-w-sm mx-auto">Silakan posisikan kartu santri di depan lensa kamera. Profil santri serta formulir penilaian akan terbuka di sini secara otomatis.</p>
                </div>
            </div>

            <!-- Profile & Grading Form View -->
            <div id="profile-pane" class="hidden bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl space-y-8 animate-fade-in">
                <!-- Profile Header -->
                <div class="flex items-center gap-4.5 pb-6 border-b border-slate-100">
                    <div id="stu-avatar" class="w-16 h-16 bg-emerald-50 text-emerald-600 font-black text-2xl rounded-2xl flex items-center justify-center border border-emerald-100">
                        S
                    </div>
                    <div class="min-w-0 flex-1">
                        <span class="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider" id="stu-class">Kelas</span>
                        <h3 class="text-xl font-black text-slate-800 tracking-tight truncate mt-1.5" id="stu-name">Nama Santri</h3>
                        <p class="text-xs text-slate-400 font-mono mt-0.5" id="stu-barcode">SANTRI-001</p>
                    </div>
                </div>
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


                <!-- Interactive Evaluation Grading Form -->
                <div>
                    <h4 class="text-sm font-extrabold text-slate-800 mb-5 flex items-center gap-2">
                        <span class="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                        Formulir Evaluasi Capaian
                    </h4>

                    <form action="scanner.php" method="POST" class="space-y-5">
                        <input type="hidden" name="santri_id" id="form-stu-id">
                        <input type="hidden" name="submit_grade" value="1">

                        <!-- Tab select evaluation category -->
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Kategori Evaluasi</label>
                            <div class="grid grid-cols-3 gap-2">
                                <button type="button" onclick="selectEvalTab('jilid')" id="tab-jilid" class="eval-tab-btn py-2.5 rounded-xl text-xs font-bold border transition duration-150 border-emerald-500 bg-emerald-50 text-emerald-700">Jilid / Iqra'</button>
                                <button type="button" onclick="selectEvalTab('tahfidz')" id="tab-tahfidz" class="eval-tab-btn py-2.5 rounded-xl text-xs font-bold border transition duration-150 border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Tahfidz Sura</button>
                                <button type="button" onclick="selectEvalTab('ibadah')" id="tab-ibadah" class="eval-tab-btn py-2.5 rounded-xl text-xs font-bold border transition duration-150 border-slate-200 bg-white text-slate-600 hover:bg-slate-50">Ibadah Praktis</button>
                            </div>
                            <input type="hidden" name="eval_type" id="form-eval-type" value="jilid">
                        </div>

                        <!-- SECTION JILID INPUTS -->
                        <div id="pane-jilid" class="space-y-4 eval-sub-pane">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Pilih Jilid Buku *</label>
                                    <select name="jilid_id" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                        <?php foreach ($jilid_opt as $j): ?>
                                            <option value="<?php echo $j['id']; ?>"><?php echo htmlspecialchars($j['name']); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Halaman Capaian *</label>
                                    <input type="number" name="page" placeholder="Misal: 12" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono">
                                </div>
                            </div>
                        </div>

                        <!-- SECTION TAHFIDZ INPUTS -->
                        <div id="pane-tahfidz" class="space-y-4 eval-sub-pane hidden">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Pilih Surat Pendek *</label>
                                    <select name="surat_id" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                                        <?php foreach ($surat_opt as $s): ?>
                                            <option value="<?php echo $s['id']; ?>">QS. <?php echo htmlspecialchars($s['name']); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Rentang Ayat *</label>
                                    <input type="text" name="ayat_range" placeholder="Misal: 1-5" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono">
                                </div>
                            </div>
                        </div>

                        <!-- SECTION IBADAH INPUTS -->
                        <div id="pane-ibadah" class="space-y-4 eval-sub-pane hidden">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Kategori Praktik *</label>
                                    <select name="ibadah_category" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none">
                                        <option value="Wudhu">Gerakan Wudhu</option>
                                        <option value="Sholat">Gerakan Sholat</option>
                                        <option value="Doa">Doa-doa Harian</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 mb-1.5">Nama Hafalan / Praktik *</label>
                                    <input type="text" name="ibadah_item" placeholder="Misal: Doa Sebelum Tidur" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none">
                                </div>
                            </div>
                        </div>

                        <!-- Status & Notes -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="sm:col-span-1">
                                <label class="block text-xs font-bold text-slate-500 mb-1.5">Hasil Penilaian *</label>
                                <select name="status" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none">
                                    <option value="Lulus">LULUS / LANJUT</option>
                                    <option value="Mengulang">MENGULANG</option>
                                </select>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-xs font-bold text-slate-500 mb-1.5">Catatan Tambahan (Ustadz)</label>
                                <input type="text" name="notes" placeholder="Tulis catatan perkembangan..." class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none">
                            </div>
                        </div>

                        <!-- Submit actions -->
                        <div class="pt-4 border-t border-slate-100 flex gap-2">
                            <button type="button" onclick="cancelGrading()" class="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition duration-150">Reset</button>
                            <button type="submit" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition duration-150 shadow-md">Simpan Evaluasi</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    </div>
</div>

<!-- Camera and Scanning Library CDN integrations -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js" integrity="sha512-r6rDA7W6ZeQXYkm8sVUMRjw87mscjYSvvyqyvI0B9E1TThpIn84B5N66/r897pX7T5/8A447b52W1/198UqY7w==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
    let html5QrCode = null;
    let cameraDevices = [];

    document.addEventListener('DOMContentLoaded', () => {
        setupCameraDevices();
    });

    /**
     * Synthesises a clear sound pitch beep on success
     */
    function playBeepSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.value = 1320; // High-pitch clear sound
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            // Exponential decay envelope
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.16);
        } catch (err) {
            console.error('Audio synthesizer error: ', err);
        }
    }

    /**
     * Lists all available cameras in select tag dropdown
     */
    function setupCameraDevices() {
        Html5Qrcode.getCameras().then(devices => {
            const select = document.getElementById('camera-select');
            select.innerHTML = '';
            
            if (devices && devices.length > 0) {
                cameraDevices = devices;
                devices.forEach((device, index) => {
                    const opt = document.createElement('option');
                    opt.value = device.id;
                    opt.text = device.label || 'Kamera ' + (index + 1);
                    select.appendChild(opt);
                });

                document.getElementById('btn-start').addEventListener('click', startScanning);
                document.getElementById('btn-stop').addEventListener('click', stopScanning);
            } else {
                select.innerHTML = '<option value="">Tidak ada kamera ditemukan</option>';
            }
        }).catch(err => {
            console.error('Kamera permission error: ', err);
            document.getElementById('camera-select').innerHTML = '<option value="">Izin kamera diblokir</option>';
        });
    }

    /**
     * Launches the scan loop
     */
    function startScanning() {
        const select = document.getElementById('camera-select');
        let cameraId = select.value;
        
        // Setup configuration properly for mobile
        const config = {
            fps: 15,
            qrbox: function(viewfinderWidth, viewfinderHeight) {
                let minEdgePercentage = 0.7; // 70%
                let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
                return {
                    width: qrboxSize,
                    height: qrboxSize
                };
            }
        };

        let cameraConfig = cameraId ? cameraId : { facingMode: "environment" };

        html5QrCode = new Html5Qrcode("reader");
        
        document.getElementById('btn-start').disabled = true;
        document.getElementById('btn-stop').disabled = false;

        html5QrCode.start(
            cameraConfig, 
            config,
            (decodedText, decodedResult) => {
                // SUCCESS SCAN CALLBACK
                playBeepSound();
                stopScanning();
                
                // Fetch student profile using barcode string
                fetchStudentByBarcode(decodedText);
            },
            (errorMessage) => {
                // silent scanning logic
            }
        ).catch(err => {
            console.error('Camera Error: ', err);
            alert('Gagal menyalakan kamera. Pastikan izin kamera diberikan.');
            document.getElementById('btn-start').disabled = false;
            document.getElementById('btn-stop').disabled = true;
            html5QrCode = null;
        });
    }

    /**
     * Halts camera feeds
     */
    function stopScanning() {
        return new Promise((resolve) => {
            if (html5QrCode) {
                html5QrCode.stop().then(() => {
                    document.getElementById('btn-start').disabled = false;
                    document.getElementById('btn-stop').disabled = true;
                    html5QrCode.clear();
                    html5QrCode = null;
                    resolve();
                }).catch(err => {
                    console.error('Error stopping camera: ', err);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Retrieves student profile via AJAX fetch (calling itself with GET api option)
     */
    function fetchStudentByBarcode(barcodeStr) {
        if (!barcodeStr) return;
        
        // Show loading state
        const placeholder = document.getElementById('result-placeholder');
        placeholder.innerHTML = '<h4>Mengambil data profil santri...</h4>';
        placeholder.classList.remove('hidden');
        document.getElementById('profile-pane').classList.add('hidden');

        // Since it is an standalone file, we will do a simple AJAX request back to a PHP endpoint 
        // Let's create a small helper logic or query.
        // For standard local ease, we can fetch via fetch API with query params.
        fetch('scanner.php?ajax_fetch=1&barcode=' + encodeURIComponent(barcodeStr))
            .then(res => res.json())
            .then(data => {
                if (data && data.success) {
                    // Populate Profile View
                    document.getElementById('form-stu-id').value = data.santri.id;
                    document.getElementById('stu-name').innerText = data.santri.name;
                    document.getElementById('stu-barcode').innerText = data.santri.barcode;
                    document.getElementById('stu-class').innerText = data.santri.nama_kelas || 'Siswa Baru';
                    document.getElementById('stu-avatar').innerText = data.santri.name.substring(0,1);
                    document.getElementById('stu-last-jilid').innerText = data.santri.last_jilid || 'Belum ada data';
                    document.getElementById('stu-target').innerText = data.santri.target || 'Belum ada data';
                    document.getElementById('stu-history').innerHTML = data.santri.history || 'Belum ada histori';


                    // Reveal profile view
                    placeholder.classList.add('hidden');
                    document.getElementById('profile-pane').classList.remove('hidden');
                } else {
                    placeholder.innerHTML = `<h4 class="text-red-500 font-bold">Santri Tidak Ditemukan</h4><p class="text-xs">Barcode "${barcodeStr}" tidak terdaftar di sistem.</p>`;
                }
            })
            .catch(err => {
                placeholder.innerHTML = '<h4 class="text-red-500">Error</h4><p class="text-xs">' + err.message + '</p>';
            });
    }

    /**
     * Selects current active subform tab
     */
    function selectEvalTab(tabName) {
        document.querySelectorAll('.eval-tab-btn').forEach(btn => {
            btn.classList.remove('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
            btn.classList.add('border-slate-200', 'bg-white', 'text-slate-600');
        });

        document.getElementById('tab-' + tabName).classList.add('border-emerald-500', 'bg-emerald-50', 'text-emerald-700');
        document.getElementById('tab-' + tabName).classList.remove('border-slate-200', 'bg-white', 'text-slate-600');

        document.querySelectorAll('.eval-sub-pane').forEach(pane => {
            pane.classList.add('hidden');
        });
        document.getElementById('pane-' + tabName).classList.remove('hidden');
        document.getElementById('form-eval-type').value = tabName;
    }

    function cancelGrading() {
        document.getElementById('profile-pane').classList.add('hidden');
        document.getElementById('result-placeholder').classList.remove('hidden');
        document.getElementById('result-placeholder').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-14 h-14 text-slate-300 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <div class="space-y-1">
                <h4 class="font-extrabold text-sm text-slate-600">Siap Menerima Scan</h4>
                <p class="text-xs text-slate-400 max-w-sm mx-auto">Silakan posisikan kartu santri di depan lensa kamera. Profil santri serta formulir penilaian akan terbuka di sini secara otomatis.</p>
            </div>
        `;
    }
</script>

<?php
// PHP AJAX endpoint helper
if (isset($_GET['ajax_fetch'])) {
    header('Content-Type: application/json');
    $barcode = trim($_GET['barcode']);
    
    try {
        $stmtS = $db->prepare("
            SELECT s.id, s.name, s.barcode, k.name AS nama_kelas 
            FROM santri s 
            LEFT JOIN kelas k ON s.kelas_id = k.id 
            WHERE s.barcode = ? OR s.id = ? 
            LIMIT 1
        ");
        $stmtS->execute([$barcode, $barcode]);
        $santri = $stmtS->fetch();

        if ($santri) {
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
        } else {
            echo json_encode(['success' => false, 'error' => 'Santri not found']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit(); // Prevent printing normal html
}
?>

<?php
require_once 'footer.php';
?>
