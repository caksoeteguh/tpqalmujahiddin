import sys

with open('src/components/BarcodeScanner.tsx', 'r') as f:
    content = f.read()

search_input = """          {/* Manual Input Form as Fallback */}
          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={14} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-9 p-3 shadow-xs dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              placeholder="Atau ketik Barcode / ID Santri lalu Enter..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualSearch();
              }}
            />
          </div>"""

replace_input = """          {/* Manual Input Form as Fallback */}
          <div className="relative mt-2 flex flex-col gap-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={14} className="text-slate-400" />
                </div>
                <input
                type="text"
                className="bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-9 p-3 shadow-xs dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                placeholder="Ketik Barcode / ID Santri lalu Enter..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleManualSearch();
                }}
                />
            </div>
            <div className="relative">
                <select 
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3 font-semibold dark:bg-slate-900 dark:border-slate-800 dark:text-white cursor-pointer"
                    onChange={(e) => {
                        if (e.target.value) {
                            const found = santriList.find(s => s.id === e.target.value);
                            if (found) {
                                setSelectedSantri(found);
                                setScanMessage(null);
                            }
                        }
                    }}
                    value={selectedSantri ? selectedSantri.id : ""}
                >
                    <option value="">-- Atau Pilih Nama Santri --</option>
                    {santriList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.barcode})</option>
                    ))}
                </select>
            </div>
          </div>"""

content = content.replace(search_input, replace_input)

with open('src/components/BarcodeScanner.tsx', 'w') as f:
    f.write(content)

print("BarcodeScanner dropdown patched")
