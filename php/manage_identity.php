<?php
/**
 * manage_identity.php
 * Handles custom TPQ identity profiles (name, logo, contact, footer)
 * Compatible with XAMPP / traditional hosting
 */

require_once 'config.php';

$db = getDatabaseConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

try {
    if ($method === 'GET') {
        // Fetch identity details (always assume single profile with ID = 1)
        $stmt = $db->query("SELECT * FROM tpq_identity ORDER BY id ASC LIMIT 1");
        $data = $stmt->fetch();

        // Fallback seed structure if empty
        if (!$data) {
            $data = [
                "id" => 1,
                "name" => "TPQ Al-Falah",
                "address" => "Gedung Kajian Islam Al-Falah No. 5",
                "phone" => "0812-9999-8888",
                "logo" => "",
                "footer_text" => "TPQKita Digital Workspace"
            ];
            
            // Auto seed
            $seedStmt = $db->prepare("INSERT INTO tpq_identity (id, name, address, phone, logo, footer_text) VALUES (1, :name, :address, :phone, :logo, :footer_text)");
            $seedStmt->execute([
                ':name' => $data['name'],
                ':address' => $data['address'],
                ':phone' => $data['phone'],
                ':logo' => $data['logo'],
                ':footer_text' => $data['footer_text']
            ]);
        }

        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $data]);
        exit();
    }

    if ($method === 'POST') {
        if (!isset($input['name'])) {
            throw new Exception("Nama TPQ wajib diisi.");
        }

        $name = trim($input['name']);
        $address = isset($input['address']) ? trim($input['address']) : '';
        $phone = isset($input['phone']) ? trim($input['phone']) : '';
        $logo = isset($input['logo']) ? trim($input['logo']) : '';
        $footerText = isset($input['footer_text']) ? trim($input['footer_text']) : 'TPQKita Digital Workspace';

        // Update ID = 1
        $sql = "UPDATE tpq_identity SET 
                    name = :name, 
                    address = :address, 
                    phone = :phone, 
                    logo = :logo, 
                    footer_text = :footer_text 
                WHERE id = 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':name' => $name,
            ':address' => $address,
            ':phone' => $phone,
            ':logo' => $logo,
            ':footer_text' => $footerText
        ]);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Identitas lembaga TPQ berhasil diperbarui."]);
        exit();
    }

    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode HTTP tidak didukung."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
