import sys

with open('tpqkita-php/header.php', 'r') as f:
    content = f.read()

# Make the labels match React
replacements = {
    "Cetak Kartu &amp; Lanyard": "Cetak Kartu Santri",
    "Rekapitulasi Capaian": "Rekapitulasi Evaluasi",
    "Profil Lembaga TPQ": "Identitas & Aplikasi",
    "Lembaga": "Pengaturan"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('tpqkita-php/header.php', 'w') as f:
    f.write(content)

print("PHP Header labels patched")
