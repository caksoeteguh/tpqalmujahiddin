import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

search_scanner = """            {currentTab === 'scanner' && (
              <BarcodeScanner
                santriList={santriList}
                kelasList={kelasList}
                ustadzList={ustadzList}
                jilidList={jilidList}
                suratList={suratList}
                capaianJilid={capaianJilid}
                capaianTahfidz={capaianTahfidz}
                capaianIbadah={capaianIbadah}
                ibadahMaterials={ibadahMaterials}
                subjectsList={subjectsList}
                onAddJilidEvaluation={handleAddCapaianJilid}
                onAddTahfidzEvaluation={handleAddCapaianTahfidz}
                onAddIbadahEvaluation={handleAddCapaianIbadah}
                initialScannedBarcode={selectedBarcodeForEvaluation}
                clearInitialBarcode={() => setSelectedBarcodeForEvaluation('')}
              />
            )}"""

replace_scanner = search_scanner.replace(
    "<BarcodeScanner",
    "<BarcodeScanner\n                autoStartCamera={true}"
)

# And add the 'evaluasi' tab block right after
evaluasi_block = replace_scanner.replace("'scanner'", "'evaluasi'").replace("autoStartCamera={true}", "autoStartCamera={false}")
content = content.replace(search_scanner, replace_scanner + "\n" + evaluasi_block)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App patched successfully")
