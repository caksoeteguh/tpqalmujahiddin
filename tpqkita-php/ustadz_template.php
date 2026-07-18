<?php
require_once 'config.php';
requireLogin();
requireRoles(['Walikelas', 'KepalaTPQ']);

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="template_ustadz.csv"');

$output = fopen('php://output', 'w');
// Headers
fputcsv($output, ['ID Ustadz', 'Nama Lengkap', 'Username Login', 'No HP/WA', 'Mata Pelajaran (pisahkan koma)', 'Password (kosongkan utk default)']);

// Sample data
fputcsv($output, ['U001', 'Ustadz Ahmad', 'ustadz_ahmad', '081234567890', 'Bina Jilid,Tahfidz', '']);
fputcsv($output, ['U002', 'Ustadzah Siti', 'ustadzah_siti', '081298765432', 'Bina Jilid,Ibadah Praktis', 'password123']);
fclose($output);
exit;
?>
