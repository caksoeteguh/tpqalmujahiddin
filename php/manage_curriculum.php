<?php
/**
 * manage_curriculum.php
 * Fetch structured learning metrics (Jilid books, Quran Chapters / Surat)
 * Compatible with XAMPP / traditional hosting
 */

require_once 'config.php';

$db = getDatabaseConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $type = isset($_GET['type']) ? trim($_GET['type']) : 'all'; // 'jilid', 'surat', or 'all'

        $response = [];

        if ($type === 'jilid' || $type === 'all') {
            $stmt = $db->query("SELECT * FROM jilid ORDER BY id ASC");
            $response['jilid'] = $stmt->fetchAll();
        }

        if ($type === 'surat' || $type === 'all') {
            $stmt = $db->query("SELECT * FROM surat ORDER BY CAST(SUBSTRING(id, 3) AS UNSIGNED) ASC, id ASC");
            $response['surat'] = $stmt->fetchAll();
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $response
        ]);
        exit();
    }

    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode HTTP tidak didukung."]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal mengambil data kurikulum pembelajaran.",
        "detail" => $e->getMessage()
    ]);
}
?>
