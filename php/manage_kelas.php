<?php
/**
 * manage_kelas.php
 * Handles CRUD operations for Kelas (Classrooms)
 * Compatible with XAMPP / traditional hosting
 */

require_once 'config.php';

$db = getDatabaseConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

try {
    if ($method === 'GET') {
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT k.*, u.name AS ustadz_name FROM kelas k LEFT JOIN ustadz u ON k.ustadz_id = u.id WHERE k.id = :id LIMIT 1");
            $stmt->execute([':id' => $_GET['id']]);
            $data = $stmt->fetch();
        } else {
            $sql = "SELECT k.*, u.name AS ustadz_name, 
                           (SELECT COUNT(*) FROM santri s WHERE s.kelas_id = k.id) AS total_santri
                    FROM kelas k 
                    LEFT JOIN ustadz u ON k.ustadz_id = u.id 
                    ORDER BY k.name ASC";
            $stmt = $db->query($sql);
            $data = $stmt->fetchAll();
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $data]);
        exit();
    }

    if ($method === 'POST') {
        // DELETE
        if ($action === 'delete' || (isset($input['action']) && $input['action'] === 'delete')) {
            $id = isset($input['id']) ? $input['id'] : (isset($_GET['id']) ? $_GET['id'] : '');
            if (empty($id)) {
                throw new Exception("ID Kelas diperlukan untuk menghapus.");
            }

            // Set kelas_id to null for orphaned students
            $stmtSantri = $db->prepare("UPDATE santri SET kelas_id = NULL WHERE kelas_id = :id");
            $stmtSantri->execute([':id' => $id]);

            // Delete Kelas
            $stmt = $db->prepare("DELETE FROM kelas WHERE id = :id");
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Kelas berhasil dihapus."]);
            exit();
        }

        // Validate CREATE / UPDATE parameters
        if (!isset($input['name'])) {
            throw new Exception("Nama Kelas wajib diisi.");
        }

        $id = isset($input['id']) ? trim($input['id']) : '';
        $name = trim($input['name']);
        $ustadzId = isset($input['ustadz_id']) && !empty($input['ustadz_id']) ? trim($input['ustadz_id']) : null;

        // Check if exists
        $checkStmt = $db->prepare("SELECT COUNT(*) FROM kelas WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $exists = $checkStmt->fetchColumn() > 0;

        if ($exists && !empty($id)) {
            // UPDATE
            $sql = "UPDATE kelas SET name = :name, ustadz_id = :ustadz_id WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':name' => $name,
                ':ustadz_id' => $ustadzId,
                ':id' => $id
            ]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Informasi kelas berhasil diperbarui."]);
            exit();
        } else {
            // CREATE NEW
            $newId = !empty($id) ? $id : 'K_' . uniqid();

            $sql = "INSERT INTO kelas (id, name, ustadz_id) VALUES (:id, :name, :ustadz_id)";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':id' => $newId,
                ':name' => $name,
                ':ustadz_id' => $ustadzId
            ]);

            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Kelas baru berhasil didaftarkan.", "id" => $newId]);
            exit();
        }
    }

    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode HTTP tidak didukung."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
