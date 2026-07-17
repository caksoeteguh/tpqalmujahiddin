<?php
/**
 * manage_ustadz.php
 * Handles CRUD operations for Ustadz (Teachers)
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
            $stmt = $db->prepare("SELECT * FROM ustadz WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $_GET['id']]);
            $data = $stmt->fetch();
        } else {
            $stmt = $db->query("SELECT * FROM ustadz ORDER BY name ASC");
            $data = $stmt->fetchAll();
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $data]);
        exit();
    }

    if ($method === 'POST') {
        // Check for DELETE Action
        if ($action === 'delete' || (isset($input['action']) && $input['action'] === 'delete')) {
            $id = isset($input['id']) ? $input['id'] : (isset($_GET['id']) ? $_GET['id'] : '');
            if (empty($id)) {
                throw new Exception("ID Ustadz diperlukan untuk penghapus.");
            }

            // Remove reference from kelas
            $stmtKelas = $db->prepare("UPDATE kelas SET ustadz_id = NULL WHERE ustadz_id = :id");
            $stmtKelas->execute([':id' => $id]);

            // Delete Ustadz
            $stmt = $db->prepare("DELETE FROM ustadz WHERE id = :id");
            $stmt->execute([':id' => $id]);

            // Delete related users account
            $stmtUser = $db->prepare("DELETE FROM users WHERE linked_id = :id AND role = 'Ustadz'");
            $stmtUser->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Ustadz berhasil dihapus."]);
            exit();
        }

        // Validate CREATE / UPDATE parameters
        if (!isset($input['name']) || !isset($input['username'])) {
            throw new Exception("Nama dan Username Ustadz wajib diisi.");
        }

        $id = isset($input['id']) ? trim($input['id']) : '';
        $name = trim($input['name']);
        $username = trim($input['username']);
        $phone = isset($input['phone']) ? trim($input['phone']) : '';
        $subjects = isset($input['subjects']) ? trim($input['subjects']) : 'Jilid,Tahfidz,Ibadah Praktis';
        $password = isset($input['password']) && !empty($input['password']) ? trim($input['password']) : 'password';

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Check if ustadz exists
        $checkStmt = $db->prepare("SELECT COUNT(*) FROM ustadz WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $exists = $checkStmt->fetchColumn() > 0;

        if ($exists && !empty($id)) {
            // UPDATE
            $sql = "UPDATE ustadz SET name = :name, username = :username, phone = :phone, subjects = :subjects WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':name' => $name,
                ':username' => $username,
                ':phone' => $phone,
                ':subjects' => $subjects,
                ':id' => $id
            ]);

            if (isset($input['password']) && !empty($input['password'])) {
                $pwdStmt = $db->prepare("UPDATE ustadz SET password_hash = :hash WHERE id = :id");
                $pwdStmt->execute([':hash' => $passwordHash, ':id' => $id]);
            }

            // Sync with users general table
            $syncStmt = $db->prepare("UPDATE users SET username = :username, name = :name WHERE linked_id = :id AND role = 'Ustadz'");
            $syncStmt->execute([':username' => $username, ':name' => $name, ':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Data ustadz berhasil diperbarui."]);
            exit();
        } else {
            // CREATE NEW
            $newId = !empty($id) ? $id : 'U_' . uniqid();

            $sql = "INSERT INTO ustadz (id, name, username, password_hash, phone, subjects) 
                    VALUES (:id, :name, :username, :password_hash, :phone, :subjects)";
            $stmt = $db->prepare($sql);
            $stmt->execute([
                ':id' => $newId,
                ':name' => $name,
                ':username' => $username,
                ':password_hash' => $passwordHash,
                ':phone' => $phone,
                ':subjects' => $subjects
            ]);

            // Sync with users general table
            $stmtUser = $db->prepare("INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES (:id, :username, :password_hash, :name, 'Ustadz', :linked_id)");
            $stmtUser->execute([
                ':id' => 'USR_' . uniqid(),
                ':username' => $username,
                ':password_hash' => $passwordHash,
                ':name' => $name,
                ':linked_id' => $newId
            ]);

            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Ustadz baru berhasil terdaftar.", "id" => $newId]);
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
