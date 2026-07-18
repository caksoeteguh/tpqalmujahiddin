<?php
require_once 'config.php';
requireLogin();
requireRoles(['Walikelas', 'KepalaTPQ']);

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="template_santri.csv"');

$output = fopen('php://output', 'w');
// Headers
fputcsv($output, ['ID Santri', 'Nama Santri', 'Barcode', 'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'ID Kelas', 'Nama Wali', 'No HP Wali', 'Username Wali', 'Password (kosongkan utk default)']);

// Sample data
fputcsv($output, ['S001', 'Ahmad Budi', 'BARCODE-001', 'Jakarta', '2015-05-12', '1', 'Bapak Budi', '081234567890', 'wali_ahmad', '']);
fputcsv($output, ['S002', 'Siti Aminah', 'BARCODE-002', 'Bandung', '2016-08-20', '1', 'Ibu Siti', '081298765432', 'wali_siti', 'password123']);
fclose($output);
exit;
?>
