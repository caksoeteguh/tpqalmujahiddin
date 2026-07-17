<?php
/**
 * submit_evaluation.php
 * Submits structured evaluations for Jilid, Tahfidz, or Ibadah Praktis
 */

require_once 'config.php';

$db = getDatabaseConnection();

$inputData = json_decode(file_get_contents("php://input"), true);

if (!isset($inputData['type']) || !isset($inputData['santri_id']) || !isset($inputData['ustadz_id'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Atribut evaluasi (type, santri_id, ustadz_id) tidak lengkap."
    ]);
    exit();
}

$type = trim($inputData['type']); // 'jilid', 'tahfidz', 'ibadah'
$santriId = trim($inputData['santri_id']);
$ustadzId = trim($inputData['ustadz_id']);
$notes = isset($inputData['notes']) ? trim($inputData['notes']) : '';

try {
    if ($type === 'jilid') {
        if (!isset($inputData['jilid_id']) || !isset($inputData['page']) || !isset($inputData['status'])) {
            throw new Exception("Kolom evaluasi jilid (jilid_id, page, status) wajib diisi.");
        }
        
        $sql = "INSERT INTO capaian_jilid (santri_id, jilid_id, page, status, notes, ustadz_id) 
                VALUES (:santri_id, :jilid_id, :page, :status, :notes, :ustadz_id)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':santri_id' => $santriId,
            ':jilid_id'  => $inputData['jilid_id'],
            ':page'      => intval($inputData['page']),
            ':status'    => $inputData['status'],
            ':notes'     => $notes,
            ':ustadz_id' => $ustadzId
        ]);
        
    } elseif ($type === 'tahfidz') {
        if (!isset($inputData['surat_id']) || !isset($inputData['ayat_range']) || !isset($inputData['status'])) {
            throw new Exception("Kolom evaluasi tahfidz (surat_id, ayat_range, status) wajib diisi.");
        }
        
        $sql = "INSERT INTO capaian_tahfidz (santri_id, surat_id, ayat_range, status, notes, ustadz_id) 
                VALUES (:santri_id, :surat_id, :ayat_range, :status, :notes, :ustadz_id)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':santri_id'  => $santriId,
            ':surat_id'   => $inputData['surat_id'],
            ':ayat_range' => $inputData['ayat_range'],
            ':status'     => $inputData['status'],
            ':notes'      => $notes,
            ':ustadz_id'  => $ustadzId
        ]);
        
    } elseif ($type === 'ibadah') {
        if (!isset($inputData['category']) || !isset($inputData['item']) || !isset($inputData['status'])) {
            throw new Exception("Kolom evaluasi ibadah praktis (category, item, status) wajib diisi.");
        }
        
        $sql = "INSERT INTO capaian_ibadah_praktis (santri_id, category, item, status, notes, ustadz_id) 
                VALUES (:santri_id, :category, :item, :status, :notes, :ustadz_id)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':santri_id' => $santriId,
            ':category'  => $inputData['category'],
            ':item'      => $inputData['item'],
            ':status'    => $inputData['status'],
            ':notes'     => $notes,
            ':ustadz_id' => $ustadzId
        ]);
        
    } else {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Tipe evaluasi tidak dikenal."
        ]);
        exit();
    }

    http_response_code(201);
    echo json_encode([
        "status" => "success",
        "message" => "Data penilaian evaluasi berhasil disimpan ke database."
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal menyimpan evaluasi: " . $e->getMessage()
    ]);
}
?>
