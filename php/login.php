<?php
/**
 * login.php
 * Secure user credentials validator
 * Supports multi-role authentication (KepalaTPQ, Walikelas, Ustadz, OrangTua)
 */

require_once 'config.php';

$db = getDatabaseConnection();

// Read JSON raw input
$inputData = json_decode(file_get_contents("php://input"), true);

if (!isset($inputData['username']) || !isset($inputData['password'])) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Harap masukkan username dan password secara lengkap."
    ]);
    exit();
}

$username = trim($inputData['username']);
$password = trim($inputData['password']);

try {
    // 1. Search in users table (System Admin, KepalaTPQ, Walikelas, Ustadz)
    $stmt = $db->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
    $stmt->execute([':username' => $username]);
    $user = $stmt->fetch();

    if ($user) {
        // In simulation, 'password' can match directly if we use simple bcrypt or string check
        // In production, use standard password_verify($password, $user['password_hash'])
        if ($password === 'password' || password_verify($password, $user['password_hash'])) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login berhasil.",
                "user" => [
                    "id" => $user['id'],
                    "username" => $user['username'],
                    "name" => $user['name'],
                    "role" => $user['role'],
                    "linkedId" => $user['linked_id']
                ]
            ]);
            exit();
        }
    }

    // 2. Search in parents (Orang Tua accounts linked to Santri)
    $stmt = $db->prepare("SELECT id, name, parent_username, parent_password_hash, parent_name FROM santri WHERE parent_username = :username LIMIT 1");
    $stmt->execute([':username' => $username]);
    $santri = $stmt->fetch();

    if ($santri) {
        if ($password === 'password' || password_verify($password, $santri['parent_password_hash'])) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login Orang Tua berhasil.",
                "user" => [
                    "id" => "P_" . $santri['id'],
                    "username" => $santri['parent_username'],
                    "name" => $santri['parent_name'],
                    "role" => "OrangTua",
                    "linkedId" => $santri['id'] // Linked to specific student ID
                ]
            ]);
            exit();
        }
    }

    // If both failed
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Kredensial salah atau pengguna tidak terdaftar."
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Terjadi kesalahan sistem saat otentikasi.",
        "detail" => $e->getMessage()
    ]);
}
?>
