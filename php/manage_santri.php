<?php
/**
 * manage_santri.php
 * Handles CRUD operations for Santri (Students)
 * Compatible with XAMPP / traditional hosting
 */

require_once 'config.php';

$db = getDatabaseConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// Extract action parameter if available (for query-based routing, e.g. ?action=delete)
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

try {
    if ($method === 'GET') {
        // Retrieve Santri list or single Santri
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT s.*, k.name AS kelas_name FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id WHERE s.id = :id LIMIT 1");
            $stmt->execute([':id' => $_GET['id']]);
            $data = $stmt->fetch();
        } else {
            $sql = "SELECT s.*, k.name AS kelas_name FROM santri s LEFT JOIN kelas k ON s.kelas_id = k.id ORDER BY s.name ASC";
            $stmt = $db->query($sql);
            $data = $stmt->fetchAll();
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $data]);
        exit();
    }

    if ($method === 'POST') {
        // If action is delete
        if ($action === 'delete' || isset($input['action']) && $input['action'] === 'delete') {
            $id = isset($input['id']) ? $input['id'] : (isset($_GET['id']) ? $_GET['id'] : '');
            if (empty($id)) {
                throw new Exception("ID Santri diperlukan untuk menghapus.");
            }
            
            $stmt = $db->prepare("DELETE FROM santri WHERE id = :id");
            $stmt->execute([':id' => $id]);
            
            // Delete related user login account if exists
            $stmtUser = $db->prepare("DELETE FROM users WHERE linked_id = :id AND role = 'OrangTua'");
            $stmtUser->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Santri berhasil dihapus."]);
            exit();
        }

        // Validate required fields for CREATE or UPDATE
        if (!isset($input['name']) || !isset($input['barcode']) || !isset($input['parent_name'])) {
            throw new Exception("Nama, Barcode, dan Nama Wali wajib diisi.");
        }

        $id = isset($input['id']) ? trim($input['id']) : '';
        $name = trim($input['name']);
        $barcode = trim($input['barcode']);
        $birthPlace = isset($input['birth_place']) ? trim($input['birth_place']) : '';
        $birthDate = isset($input['birth_date']) ? trim($input['birth_date']) : null;
        $kelasId = isset($input['kelas_id']) && !empty($input['kelas_id']) ? trim($input['kelas_id']) : null;
        $parentName = trim($input['parent_name']);
        $parentPhone = isset($input['parent_phone']) ? trim($input['parent_phone']) : '';
        $parentUsername = isset($input['parent_username']) ? trim($input['parent_username']) : '';
        $parentPassword = isset($input['parent_password']) && !empty($input['parent_password']) ? trim($input['parent_password']) : 'password';

        $passwordHash = password_hash($parentPassword, PASSWORD_DEFAULT);

        // If ID exists and is already in DB, do UPDATE
        $checkStmt = $db->prepare("SELECT COUNT(*) FROM santri WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $exists = $checkStmt->fetchColumn() > 0;

        if ($exists && !empty($id)) {
            // Update Santri
            $sql = "UPDATE santri SET 
                        name = :name, 
                        barcode = :barcode, 
                        birth_place = :birth_place, 
                        birth_date = :birth_date, 
                        kelas_id = :kelas_id, 
                        parent_name = :parent_name, 
                        parent_phone = :parent_phone, 
                        parent_username = :parent_username
                    WHERE id = :id";
            $params = [
                ':name' => $name,
                ':barcode' => $barcode,
                ':birth_place' => $birthPlace,
                ':birth_date' => $birthDate,
                ':kelas_id' => $kelasId,
                ':parent_name' => $parentName,
                ':parent_phone' => $parentPhone,
                ':parent_username' => $parentUsername,
                ':id' => $id
            ];
            
            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            // If custom password is set, update it
            if (isset($input['parent_password']) && !empty($input['parent_password'])) {
                $pwdStmt = $db->prepare("UPDATE santri SET parent_password_hash = :hash WHERE id = :id");
                $pwdStmt->execute([':hash' => $passwordHash, ':id' => $id]);
            }

            // Sync users login credential table
            $syncStmt = $db->prepare("UPDATE users SET username = :username, name = :name WHERE linked_id = :id AND role = 'OrangTua'");
            $syncStmt->execute([':username' => $parentUsername, ':name' => $parentName, ':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Profil santri berhasil diperbarui."]);
            exit();
        } else {
            // Create New Santri
            $newId = !empty($id) ? $id : 'SANTRI_' . uniqid();
            
            $sql = "INSERT INTO santri (id, name, barcode, birth_place, birth_date, kelas_id, parent_name, parent_phone, parent_username, parent_password_hash) 
                    VALUES (:id, :name, :barcode, :birth_place, :birth_date, :kelas_id, :parent_name, :parent_phone, :parent_username, :parent_password_hash)";
            
            $params = [
                ':id' => $newId,
                ':name' => $name,
                ':barcode' => $barcode,
                ':birth_place' => $birthPlace,
                ':birth_date' => $birthDate,
                ':kelas_id' => $kelasId,
                ':parent_name' => $parentName,
                ':parent_phone' => $parentPhone,
                ':parent_username' => $parentUsername,
                ':parent_password_hash' => $passwordHash
            ];

            $stmt = $db->prepare($sql);
            $stmt->execute($params);

            // Register into General system users account table
            $stmtUser = $db->prepare("INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES (:id, :username, :password_hash, :name, 'OrangTua', :linked_id)");
            $stmtUser->execute([
                ':id' => 'USR_' . uniqid(),
                ':username' => $parentUsername,
                ':password_hash' => $passwordHash,
                ':name' => $parentName,
                ':linked_id' => $newId
            ]);

            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Santri baru berhasil didaftarkan.", "id" => $newId]);
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
