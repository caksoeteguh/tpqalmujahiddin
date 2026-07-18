import sys

with open('tpqkita-php/scanner.php', 'r') as f:
    content = f.read()

# Add php loop to load santri for dropdown
dropdown_php = """
<?php
// Get all santri for dropdown
$santri_all = $db->query("SELECT id, name, barcode FROM santri ORDER BY name ASC")->fetchAll();
?>
"""

if dropdown_php not in content:
    # insert after $alert initialization
    content = content.replace("    <?php endif; ?>", dropdown_php + "\n    <?php endif; ?>")

manual_input_html = """            <!-- Manual input helper -->
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
            </div>"""

search_pattern = """            <!-- Manual input helper -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Barcode Tidak Terbaca?</h4>
                <div class="flex gap-2">
                    <input type="text" id="manual-barcode" placeholder="Ketik nomor barcode (SANTRI-001)..." class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none">
                    <button onclick="fetchStudentByBarcode(document.getElementById('manual-barcode').value)" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs">Cari</button>
                </div>
            </div>"""

content = content.replace(search_pattern, manual_input_html)

with open('tpqkita-php/scanner.php', 'w') as f:
    f.write(content)

print("PHP Scanner dropdown patched")
