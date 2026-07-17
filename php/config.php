<?php
/**
 * config.php
 * Database Configuration File
 * Compatible with PHP 7.3+ and MySQL / MariaDB (via PDO)
 */

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_tpqkita');

// Cross-Origin Resource Sharing (CORS) headers to allow React Frontend integration
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Returns a active PDO database connection instance.
 * Includes error logging and structured JSON failure response on connection failure.
 */
function getDatabaseConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // Return a clean error instead of blowing up
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Gagal terhubung ke database MySQL server.",
            "error_detail" => $e->getMessage()
        ]);
        exit();
    }
}
?>
