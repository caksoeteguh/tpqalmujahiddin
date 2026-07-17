<?php
// ==========================================
// TPQKITA - CARD GENERATOR (cetak_kartu.php)
// High-fidelity student lanyards, printing, & downloads
// ==========================================

require_once 'header.php';

$db = getDB();

// Handle OrangTua role limitation: they can only view and print their own children
$santri_list = [];
try {
    if ($role === 'OrangTua') {
        $stmt = $db->prepare("
            SELECT s.*, k.name AS nama_kelas 
            FROM santri s 
            LEFT JOIN kelas k ON s.kelas_id = k.id 
            WHERE s.id = ?
        ");
        $stmt->execute([$_SESSION['linked_id']]);
        $santri_list = $stmt->fetchAll();
    } else {
        // Admin / Ustadz can see all
        $filter_kelas = isset($_GET['filter_kelas']) ? trim($_GET['filter_kelas']) : '';
        $queryStr = "
            SELECT s.*, k.name AS nama_kelas 
            FROM santri s 
            LEFT JOIN kelas k ON s.kelas_id = k.id
        ";
        $params = [];
        if (!empty($filter_kelas)) {
            $queryStr .= " WHERE s.kelas_id = ?";
            $params[] = $filter_kelas;
        }
        $queryStr .= " ORDER BY s.name ASC";
        $stmt = $db->prepare($queryStr);
        $stmt->execute($params);
        $santri_list = $stmt->fetchAll();
    }
} catch (Exception $e) {
    // Silent catch
}

$classes = $db->query("SELECT * FROM kelas ORDER BY name ASC")->fetchAll();
?>

<!-- Print-Only CSS Styles -->
<style>
    @media print {
        body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        .no-print {
            display: none !important;
        }
        .print-area {
            display: block !important;
            width: 100% !important;
        }
        .print-card-wrapper {
            page-break-inside: avoid !important;
            margin-bottom: 20px !important;
            display: inline-flex !important;
            gap: 15px !important;
        }
    }
</style>

<div class="space-y-8 animate-fade-in no-print">
    <!-- Header title -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tight">Cetak Kartu &amp; Lanyard Santri</h1>
            <p class="text-sm text-slate-500">Cetak langsung kartu identitas santri untuk printer kartu, atau unduh sebagai format PNG beresolusi tinggi.</p>
        </div>
        
        <button onclick="window.print()" class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl transition duration-150 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.821V7.5a3.75 3.75 0 1 1 7.5 0v6.321m0 0a4.5 4.5 0 0 1-7.5 0M10.5 18v3" />
            </svg>
            Cetak Langsung (Printer)
        </button>
    </div>

    <!-- Filter options (only visible for staff) -->
    <?php if ($role !== 'OrangTua'): ?>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <form action="cetak_kartu.php" method="GET" class="flex flex-col sm:flex-row gap-3 items-end">
                <div class="flex-1">
                    <label class="block text-xs font-bold uppercase text-slate-400 mb-2">Filter Berdasarkan Kelas</label>
                    <select name="filter_kelas" onchange="this.form.submit()" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-slate-700">
                        <option value="">-- Semua Santri --</option>
                        <?php foreach ($classes as $cls): ?>
                            <option value="<?php echo $cls['id']; ?>" <?php echo isset($_GET['filter_kelas']) && $_GET['filter_kelas'] === $cls['id'] ? 'selected' : ''; ?>><?php echo htmlspecialchars($cls['name']); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <a href="cetak_kartu.php" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-sm transition duration-150">Reset</a>
            </form>
        </div>
    <?php endif; ?>
</div>

<!-- Cards Area: visible on screen and print -->
<div class="print-area mt-8">
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <?php foreach ($santri_list as $s): ?>
            <!-- Card Container -->
            <div class="print-card-wrapper bg-slate-50 border border-slate-200/50 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all duration-200 max-w-4xl">
                
                <!-- CARD FRONT SIDE -->
                <div id="card-front-<?php echo $s['id']; ?>" class="w-[280px] h-[440px] bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl relative overflow-hidden flex flex-col justify-between p-6 shadow-xl border border-slate-800 shrink-0 select-none">
                    <!-- Ambient glows -->
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                    
                    <!-- Header -->
                    <div class="flex items-center gap-2.5 relative z-10 pb-4 border-b border-white/10">
                        <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-lg flex items-center justify-center font-black">
                            T
                        </div>
                        <div>
                            <span class="block text-xs font-black tracking-widest text-emerald-400">KARTU SANTRI</span>
                            <span class="block text-[10px] text-slate-400 font-extrabold tracking-tight"><?php echo htmlspecialchars($tpq_name); ?></span>
                        </div>
                    </div>

                    <!-- Profile Photo / Avatar -->
                    <div class="my-auto text-center relative z-10 space-y-3.5">
                        <div class="w-20 h-20 rounded-full bg-white/5 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-white text-3xl font-black shadow-lg">
                            <?php echo substr($s['name'], 0, 1); ?>
                        </div>
                        <div class="space-y-1">
                            <h3 class="text-sm font-black tracking-tight text-slate-100 uppercase truncate px-2"><?php echo htmlspecialchars($s['name']); ?></h3>
                            <span class="inline-block text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/10"><?php echo htmlspecialchars($s['nama_kelas'] ?? 'SANTRI BARU'); ?></span>
                        </div>
                    </div>

                    <!-- Footer & QR -->
                    <div class="flex items-end justify-between pt-4 border-t border-white/10 mt-auto relative z-10">
                        <div class="space-y-1">
                            <span class="block text-[8px] font-bold text-slate-500 uppercase">ID NOMOR</span>
                            <span class="block text-xs font-black font-mono text-emerald-400"><?php echo htmlspecialchars($s['id']); ?></span>
                        </div>
                        <!-- Container to draw QR JS -->
                        <div class="bg-white p-1 rounded-lg">
                            <div class="qrcode-canvas" data-code="<?php echo htmlspecialchars($s['barcode']); ?>" style="width:56px; height:56px;"></div>
                        </div>
                    </div>
                </div>

                <!-- CARD BACK SIDE -->
                <div id="card-back-<?php echo $s['id']; ?>" class="w-[280px] h-[440px] bg-slate-900 text-white rounded-2xl relative overflow-hidden flex flex-col justify-between p-6 shadow-xl border border-slate-800 shrink-0 select-none">
                    <!-- Header -->
                    <div class="text-center border-b border-white/10 pb-4">
                        <span class="text-xs font-black tracking-widest text-emerald-400 uppercase">TATA TERTIB TPQ</span>
                    </div>

                    <!-- Rules List -->
                    <div class="my-auto space-y-3 text-[9px] font-semibold text-slate-300 leading-relaxed list-decimal">
                        <p class="flex gap-2"><span>1.</span><span>Wajib membawa kartu ini setiap kegiatan belajar mengajar berlangsung.</span></p>
                        <p class="flex gap-2"><span>2.</span><span>Hadir 10 menit sebelum jam beladjar dimulai.</span></p>
                        <p class="flex gap-2"><span>3.</span><span>Menjaga kesopanan, adab, dan kebersihan di lingkungan masjid/TPQ.</span></p>
                        <p class="flex gap-2"><span>4.</span><span>Kartu ini digunakan untuk scan evaluasi capaian oleh Ustadz.</span></p>
                    </div>

                    <!-- Footer Authority signature -->
                    <div class="pt-4 border-t border-white/10 text-center space-y-1.5">
                        <span class="text-[8px] text-slate-500 block">Mengetahui, Kepala TPQ</span>
                        <div class="h-10"></div> <!-- Mock Signature spacing -->
                        <span class="text-[10px] font-extrabold text-slate-200 block border-t border-white/5 pt-1">Sistem Administrasi TPQKita</span>
                    </div>
                </div>

                <!-- Control buttons per student (hidden on print) -->
                <div class="flex flex-col gap-2 w-full md:w-auto shrink-0 no-print">
                    <button onclick="downloadCardAsPNG('<?php echo $s['id']; ?>')" class="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition duration-150 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Unduh Kartu (PNG)
                    </button>
                </div>

            </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- Include QR code rendering library and html2canvas library via CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" integrity="sha512-CNgIRecGo7nOMdBqcc8mScGN4G85EXmNX65aY8fGrWfQ5ditWXkey79Y46CA0yBIu4aDMzX5+94W24mFFkqhIA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" integrity="sha512-BNaRQnYgYiEsAlJDTXFMPh6gRXTmY3Ovm14hbFAvDvDbgvF89fXpC9Z98H" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        // Render QR Code inside each student container
        const qrContainers = document.querySelectorAll('.qrcode-canvas');
        qrContainers.forEach(container => {
            const barcodeData = container.getAttribute('data-code');
            if (barcodeData) {
                new QRCode(container, {
                    text: barcodeData,
                    width: 56,
                    height: 56,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
            }
        });
    });

    /**
     * Downloads front card container as PNG image
     */
    function downloadCardAsPNG(studentId) {
        const cardNode = document.getElementById('card-front-' + studentId);
        if (!cardNode) return;

        // Show a temporary loading alert or visual indicator
        const originalBg = cardNode.style.background;
        
        // Execute html2canvas rendering
        html2canvas(cardNode, {
            scale: 2.5, // High resolution scale factor
            useCORS: true,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'KARTU_SANTRI_' + studentId + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            alert('Gagal mengekspor kartu ke PNG: ' + err.message);
        });
    }
</script>

<?php
require_once 'footer.php';
?>
