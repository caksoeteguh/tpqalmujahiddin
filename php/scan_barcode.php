<?php
/**
 * scan_barcode.php
 * Scans a student barcode card and retrieves complete profile details, 
 * including current class name and teaching ustadz.
 */

require_once 'config.php';

$db = getDatabaseConnection();

$barcode = isset($_GET['barcode']) ? trim($_GET['barcode']) : '';

if (empty($barcode)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Barcode santri wajib dilampirkan."
    ]);
    exit();
}

try {
    // Perform relational query to fetch student along with class & ustadz name
    $sql = "SELECT s.id, s.name, s.barcode, s.birth_place, s.birth_date, 
                   s.parent_name, s.parent_phone,
                   k.name AS kelas_name, u.name AS ustadz_name
            FROM santri s
            LEFT JOIN kelas k ON s.kelas_id = k.id
            LEFT JOIN ustadz u ON k.ustadz_id = u.id
            WHERE s.barcode = :barcode LIMIT 1";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([':barcode' => $barcode]);
    $santri = $stmt->fetch();

    if ($santri) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Santri ditemukan.",
            "data" => $santri
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Barcode tidak terdaftar. Pastikan kartu santri sesuai."
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Terjadi gangguan server pada pencarian santri.",
        "detail" => $e->getMessage()
    ]);
}
?>
