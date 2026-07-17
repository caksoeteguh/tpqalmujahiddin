# TPQKita Digital Workspace (Native PHP + MySQL)

Selamat! Paket aplikasi **TPQKita** versi **Native PHP & MySQL** telah siap dipasang. Aplikasi ini dirancang agar ringan, responsif, dan mudah dipasang di laptop/komputer lokal menggunakan **XAMPP** atau **Laragon** tanpa perlu konfigurasi yang rumit.

Aplikasi ini menggunakan teknologi modern seperti **Tailwind CSS**, **ChartJS** untuk grafik, **html5-qrcode** untuk scan webcam barcode, **qrcode.js** untuk cetak kode QR kartu, dan **html2canvas** untuk export PNG beresolusi tinggi (semua diload via CDN, sehingga aplikasi 100% siap dijalankan tanpa perlu menginstal package manager Node/npm atau composer).

---

## 🛠️ Persyaratan Sistem (Prerequisites)
1. **XAMPP** (versi PHP 5.6 hingga PHP 8.3+ didukung penuh).
2. Browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox) yang memiliki izin akses kamera/webcam.

---

## 🚀 Langkah-Langkah Pemasangan di XAMPP

### Langkah 1: Pindahkan Folder Aplikasi
1. Unduh atau salin seluruh folder `tpqkita-php` ini.
2. Tempel (Paste) folder tersebut ke dalam direktori root XAMPP Anda:
   - Di Windows: `C:\xampp\htdocs\`
   - Di Linux / Mac: `/opt/lampp/htdocs/` atau `/Applications/XAMPP/htdocs/`
3. Pastikan struktur direktorinya adalah `C:\xampp\htdocs\tpqkita-php\`.

### Langkah 2: Jalankan Apache & MySQL
1. Buka **XAMPP Control Panel**.
2. Klik tombol **Start** pada modul **Apache** dan **MySQL** hingga indikatornya berubah menjadi hijau.

### Langkah 3: Impor Database MySQL
1. Buka browser Anda dan masuk ke alamat: `http://localhost/phpmyadmin`
2. Klik tab **Databases** (Basis Data) di menu atas.
3. Buat database baru bernama **`db_tpqkita`**, lalu klik **Create**.
4. Pilih database **`db_tpqkita`** yang baru dibuat di menu sebelah kiri.
5. Klik tab **Import** (Impor) di bagian atas.
6. Klik tombol **Choose File** (Pilih File) dan pilih file **`database.sql`** yang berada di dalam folder `tpqkita-php` Anda.
7. Gulir ke bawah dan klik tombol **Import** / **Go** (Kirim).
8. Tunggu hingga muncul pesan hijau pertanda seluruh tabel (`users`, `santri`, `ustadz`, `kelas`, dll.) beserta data uji coba berhasil dimasukkan.

### Langkah 4: Buka Aplikasi!
Buka tab baru di browser Anda dan ketikkan alamat berikut:
```text
http://localhost/tpqkita-php/
```
Anda akan diarahkan langsung ke halaman login TPQKita yang mewah!

---

## 🔑 Data Akun Demo Default untuk Uji Coba

Gunakan akun berikut untuk menguji berbagai fitur menarik berdasarkan tingkat peran pengguna (Roles):

| Peran (Role) | Username | Kata Sandi | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- |
| **Kepala TPQ** | `kepala` | `password` | **Akses Penuh**: Mengelola data Santri, Ustadz, Kelas, Penempatan Rombel, Kurikulum, Cetak Lanyard, Scanner Kamera, Laporan Rekap, dan Identitas Lembaga. |
| **Wali Kelas** | `walikelas` | `password` | **Akses Staff**: Akses setara Kepala TPQ untuk operasional dan manajemen data harian. |
| **Ustadz Pengajar** | `ahmad` | `password` | **Akses Guru**: Input evaluasi manual, Scanner Kamera (webcam) santri, dan melihat Rekapitulasi Capaian. |
| **Wali Santri (Orang Tua)** | `budi` | `password` | **Akses Wali**: Hanya melihat grafik, riwayat perkembangan mengaji, dan mencetak lanyard khusus untuk anaknya saja (`Muhammad Rizky Pratama`). |

---

## ✨ Fitur Unggulan Versi PHP Native ini:
1. **Webcam Scanner (`scanner.php`)**: Men-scan kartu lanyard santri secara langsung lewat webcam laptop Anda. Menggunakan library `html5-qrcode` yang cepat dan akurat.
2. **Audio Synthesizer Beep**: Mengeluarkan suara bip "berhasil scan" menggunakan Web Audio API murni dari browser, bekerja mulus tanpa butuh file audio eksternal.
3. **AJAX Rapid Evaluasi**: Setelah kartu santri di-scan, data profil santri langsung diload di sebelah scanner tanpa reload halaman, dan guru bisa menginput penilaian Jilid/Tahfidz secara instan.
4. **Cetak Kartu & Lanyard (`cetak_kartu.php`)**: Desain lanyard dua sisi yang cantik dengan QR Code dinamis dan layout optimal. Klik "Cetak Langsung" untuk print rapi (menyembunyikan sidebar otomatis).
5. **Download PNG Resolusi Tinggi**: Tombol "Unduh Kartu (PNG)" menggunakan library client-side `html2canvas` untuk mengunduh desain kartu beresolusi tajam tanpa masalah rendering font atau warna.
6. **Laporan Rekapitulasi Lengkap (`rekapitulasi.php`)**: Pencarian, filter per kelas, filter status lulus/mengulang, dipisahkan per tab agar asatidzah dan pengurus TPQ mudah melakukan pelaporan.

---
*Dibuat dengan dedikasi penuh untuk memudahkan asatidzah mendidik generasi Qur'ani yang cerdas di era digital.*
*Copyright &copy; TPQKita - Digital Workspace Workspace.*
