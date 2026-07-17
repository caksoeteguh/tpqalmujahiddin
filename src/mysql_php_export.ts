/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MYSQL_SCHEMA = `-- ==========================================
-- TPQKITA - DATABASE SCHEMA (MySQL/MariaDB)
-- Compatible with MySQL 5.7+, MariaDB 10.1+
-- ==========================================

CREATE DATABASE IF NOT EXISTS db_tpqkita;
USE db_tpqkita;

-- 0. Table TPQ Identity
CREATE TABLE IF NOT EXISTS tpq_identity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  logo LONGTEXT, -- Stores Base64-encoded logo or relative paths
  footer_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1. Table Ustadz
CREATE TABLE IF NOT EXISTS ustadz (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subjects VARCHAR(255) NOT NULL, -- Comma-separated or JSON format (e.g., 'Jilid,Tahfidz,Ibadah Praktis')
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table Kelas (Classroom)
CREATE TABLE IF NOT EXISTS kelas (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ustadz_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ustadz_id) REFERENCES ustadz(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table Santri (Students)
CREATE TABLE IF NOT EXISTS santri (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  barcode VARCHAR(100) UNIQUE NOT NULL,
  birth_place VARCHAR(100),
  birth_date DATE,
  kelas_id VARCHAR(50),
  parent_name VARCHAR(150) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_username VARCHAR(50) UNIQUE NOT NULL,
  parent_password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table Jilid (Lesson Volumes)
CREATE TABLE IF NOT EXISTS jilid (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  total_pages INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table Surat (Quran Chapters for Tahfidz)
CREATE TABLE IF NOT EXISTS surat (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_ayat INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table Users (General System Accounts: Walikelas / Kepala TPQ / Admin)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  role ENUM('Walikelas', 'KepalaTPQ', 'Ustadz', 'OrangTua') NOT NULL,
  linked_id VARCHAR(50) NULL, -- Can refer to ustadz.id or santri.id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table Capaian Jilid (Volume Progress logs)
CREATE TABLE IF NOT EXISTS capaian_jilid (
  id INT AUTO_INCREMENT PRIMARY KEY,
  santri_id VARCHAR(50) NOT NULL,
  jilid_id VARCHAR(50) NOT NULL,
  page INT NOT NULL,
  status ENUM('Lulus', 'Mengulang') NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ustadz_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
  FOREIGN KEY (jilid_id) REFERENCES jilid(id),
  FOREIGN KEY (ustadz_id) REFERENCES ustadz(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Table Capaian Tahfidz (Quran Memorization Progress logs)
CREATE TABLE IF NOT EXISTS capaian_tahfidz (
  id INT AUTO_INCREMENT PRIMARY KEY,
  santri_id VARCHAR(50) NOT NULL,
  surat_id VARCHAR(50) NOT NULL,
  ayat_range VARCHAR(50) NOT NULL, -- e.g., '1-5'
  status ENUM('Lulus', 'Mengulang') NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ustadz_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
  FOREIGN KEY (surat_id) REFERENCES surat(id),
  FOREIGN KEY (ustadz_id) REFERENCES ustadz(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Table Capaian Ibadah Praktis (Practical Worship logs)
CREATE TABLE IF NOT EXISTS capaian_ibadah_praktis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  santri_id VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL, -- e.g., 'Wudhu', 'Sholat', 'Doa'
  item VARCHAR(150) NOT NULL, -- e.g., 'Praktik Wudhu', 'Doa Tidur'
  status ENUM('Lulus', 'Mengulang') NOT NULL,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ustadz_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (santri_id) REFERENCES santri(id) ON DELETE CASCADE,
  FOREIGN KEY (ustadz_id) REFERENCES ustadz(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===================================================
-- SEED INITIAL DATA FOR TESTING
-- ===================================================

INSERT INTO tpq_identity (id, name, address, phone, logo, footer_text) VALUES
(1, 'TPQ Al-Falah', 'Jl. Masjid No. 12, Jakarta', '081234567890', '', 'TPQKita Digital Workspace');

-- Passwords are hashed using password_hash('password', PASSWORD_DEFAULT)
-- 'password' hash is '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S' (or similar)

INSERT INTO ustadz (id, name, username, password_hash, phone, subjects) VALUES
('U01', 'Ustadz Ahmad Fauzi, S.Pd.I', 'ahmad', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', '081234567890', 'Jilid,Tahfidz,Ibadah Praktis'),
('U02', 'Ustadzah Siti Aminah, S.Ag', 'aminah', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', '082345678901', 'Jilid,Tahfidz');

INSERT INTO kelas (id, name, ustadz_id) VALUES
('K01', 'Kelas Al-Fatih (Dasar)', 'U01'),
('K02', 'Kelas Al-Ikhlas (Menengah)', 'U01'),
('K03', 'Kelas An-Nas (Lanjutan)', 'U02');

INSERT INTO santri (id, name, barcode, birth_place, birth_date, kelas_id, parent_name, parent_phone, parent_username, parent_password_hash) VALUES
('S01', 'Muhammad Rizky Pratama', 'SANTRI-001', 'Jakarta', '2016-04-12', 'K01', 'Budi Santoso', '081299998888', 'budi', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S'),
('S02', 'Aisya Zahra Salsabila', 'SANTRI-002', 'Surabaya', '2017-08-20', 'K01', 'Rina Herawati', '081277776666', 'rina', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S');

INSERT INTO jilid (id, name, total_pages) VALUES
('J01', 'Jilid 1', 40),
('J02', 'Jilid 2', 40),
('J03', 'Jilid 3', 40),
('J04', 'Jilid 4', 40),
('J05', 'Jilid 5', 40),
('J06', 'Jilid 6', 40),
('J07', 'Al-Qur\\'an', 604);

INSERT INTO surat (id, name, total_ayat) VALUES
('SR01', 'An-Nas', 6),
('SR02', 'Al-Falaq', 5),
('SR03', 'Al-Ikhlas', 4),
('SR04', 'Al-Lahab', 5),
('SR05', 'An-Nashr', 3),
('SR06', 'Al-Kafirun', 6);

INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES
('US01', 'walikelas', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'Ibu Hajjah Khadijah, M.Pd', 'Walikelas', NULL),
('US02', 'kepala', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'KH. Maimun Zubair, Lc', 'KepalaTPQ', NULL),
('US03', 'ahmad', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'Ustadz Ahmad Fauzi, S.Pd.I', 'Ustadz', 'U01'),
('US04', 'budi', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'Budi Santoso', 'OrangTua', 'S01');
`;

export const PHP_CONFIG = `<?php
// config.php
// Database Configuration - Compatible with PHP 7.3+ and MySQL/MariaDB

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'db_tpqkita');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Gagal terhubung ke database MySQL server.",
            "error_detail" => $e->getMessage()
        ]);
        exit();
    }
}
`;

export const PHP_LOGIN = `<?php
// login.php
// Handles authentication for Ustadz, Walikelas, Orang Tua, and Kepala TPQ
require_once 'config.php';

$db = getDatabaseConnection();

session_start();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $username = trim($data->username);
    $password = $data->password;
    
    // 1. Check in users table (covers Walikelas, KepalaTPQ, and some Ustadz/Parents)
    $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        // Active Session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['linked_id'] = $user['linked_id'];
        
        echo json_encode([
            "status" => "success",
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
    
    // 2. Check directly in ustadz table as fallback
    $stmt = $db->prepare("SELECT * FROM ustadz WHERE username = ?");
    $stmt->execute([$username]);
    $ustadz = $stmt->fetch();
    
    if ($ustadz && password_verify($password, $ustadz['password_hash'])) {
        $_SESSION['user_id'] = $ustadz['id'];
        $_SESSION['role'] = 'Ustadz';
        $_SESSION['name'] = $ustadz['name'];
        $_SESSION['linked_id'] = $ustadz['id'];
        
        echo json_encode([
            "status" => "success",
            "user" => [
                "id" => $ustadz['id'],
                "username" => $ustadz['username'],
                "name" => $ustadz['name'],
                "role" => 'Ustadz',
                "linkedId" => $ustadz['id']
            ]
        ]);
        exit();
    }

    // 3. Check directly in santri (parents) table as fallback
    $stmt = $db->prepare("SELECT * FROM santri WHERE parent_username = ?");
    $stmt->execute([$username]);
    $parent = $stmt->fetch();
    
    if ($parent && password_verify($password, $parent['parent_password_hash'])) {
        $_SESSION['user_id'] = $parent['id'];
        $_SESSION['role'] = 'OrangTua';
        $_SESSION['name'] = $parent['parent_name'];
        $_SESSION['linked_id'] = $parent['id'];
        
        echo json_encode([
            "status" => "success",
            "user" => [
                "id" => $parent['id'],
                "username" => $parent['parent_username'],
                "name" => $parent['parent_name'],
                "role" => 'OrangTua',
                "linkedId" => $parent['id']
            ]
        ]);
        exit();
    }

    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Username atau password salah."]);
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
}
`;

export const PHP_SCAN_BARCODE = `<?php
// scan_barcode.php
// Scans santri barcode and retrieves complete real-time profile:
// Identitas, Capaian Jilid terakhir, Capaian Tahfidz terakhir, Capaian Ibadah Praktis terakhir.
require_once 'config.php';

$db = getDatabaseConnection();

if (!isset($_GET['barcode'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Parameter barcode diperlukan."]);
    exit();
}

$barcode = trim($_GET['barcode']);

// 1. Get student profile & class details
$stmt = $db->prepare("
    SELECT s.*, k.name AS nama_kelas, u.name AS nama_ustadz
    FROM santri s
    LEFT JOIN kelas k ON s.kelas_id = k.id
    LEFT JOIN ustadz u ON k.ustadz_id = u.id
    WHERE s.barcode = ?
");
$stmt->execute([$barcode]);
$santri = $stmt->fetch();

if (!$santri) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Santri dengan barcode tersebut tidak ditemukan."]);
    exit();
}

$santri_id = $santri['id'];

// 2. Get latest Jilid progress
$stmtJilid = $db->prepare("
    SELECT cj.*, j.name AS nama_jilid
    FROM capaian_jilid cj
    JOIN jilid j ON cj.jilid_id = j.id
    WHERE cj.santri_id = ?
    ORDER BY cj.updated_at DESC, cj.id DESC LIMIT 1
");
$stmtJilid->execute([$santri_id]);
$capaian_jilid = $stmtJilid->fetch();

// 3. Get latest Tahfidz progress
$stmtTahfidz = $db->prepare("
    SELECT ct.*, s.name AS nama_surat
    FROM capaian_tahfidz ct
    JOIN surat s ON ct.surat_id = s.id
    WHERE ct.santri_id = ?
    ORDER BY ct.updated_at DESC, ct.id DESC LIMIT 1
");
$stmtTahfidz->execute([$santri_id]);
$capaian_tahfidz = $stmtTahfidz->fetch();

// 4. Get latest Ibadah Praktis progress for each category (Wudhu, Sholat, Doa)
$stmtIbadah = $db->prepare("
    SELECT cip.*
    FROM capaian_ibadah_praktis cip
    WHERE cip.santri_id = ?
    ORDER BY cip.updated_at DESC, cip.id DESC
");
$stmtIbadah->execute([$santri_id]);
$all_ibadah = $stmtIbadah->fetchAll();

$capaian_ibadah = [
    "Wudhu" => null,
    "Sholat" => null,
    "Doa" => null
];
foreach ($all_ibadah as $ibadah) {
    if ($capaian_ibadah[$ibadah['category']] === null) {
        $capaian_ibadah[$ibadah['category']] = $ibadah;
    }
}

// 5. Package results
echo json_encode([
    "status" => "success",
    "data" => [
        "santri" => [
            "id" => $santri['id'],
            "name" => $santri['name'],
            "barcode" => $santri['barcode'],
            "birth_place" => $santri['birth_place'],
            "birth_date" => $santri['birth_date'],
            "kelas_name" => $santri['nama_kelas'],
            "ustadz_name" => $santri['nama_ustadz']
        ],
        "progress" => [
            "jilid" => $capaian_jilid ? [
                "jilid_id" => $capaian_jilid['jilid_id'],
                "name" => $capaian_jilid['nama_jilid'],
                "page" => $capaian_jilid['page'],
                "status" => $capaian_jilid['status'],
                "notes" => $capaian_jilid['notes'],
                "updated_at" => $capaian_jilid['updated_at']
            ] : null,
            "tahfidz" => $capaian_tahfidz ? [
                "surat_id" => $capaian_tahfidz['surat_id'],
                "name" => $capaian_tahfidz['nama_surat'],
                "ayat_range" => $capaian_tahfidz['ayat_range'],
                "status" => $capaian_tahfidz['status'],
                "notes" => $capaian_tahfidz['notes'],
                "updated_at" => $capaian_tahfidz['updated_at']
            ] : null,
            "ibadah_praktis" => $capaian_ibadah
        ]
    ]
]);
`;

export const PHP_SUBMIT_EVALUATION = `<?php
// submit_evaluation.php
// Registers student progress for Jilid, Tahfidz, or Ibadah Praktis
require_once 'config.php';

$db = getDatabaseConnection();

session_start();

// Ensure only authenticated Ustadz can post evaluations
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Ustadz') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Akses dibatasi hanya untuk Ustadz."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->santri_id) || empty($data->type)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
    exit();
}

$santri_id = $data->santri_id;
$ustadz_id = $_SESSION['linked_id'];
$type = $data->type; // 'jilid', 'tahfidz', 'ibadah'

try {
    $db->beginTransaction();

    if ($type === 'jilid') {
        if (empty($data->jilid_id) || !isset($data->page) || empty($data->status)) {
            throw new Exception("Parameter evaluasi Jilid tidak lengkap.");
        }
        $stmt = $db->prepare("
            INSERT INTO capaian_jilid (santri_id, jilid_id, page, status, notes, ustadz_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $santri_id,
            $data->jilid_id,
            $data->page,
            $data->status, // 'Lulus' / 'Mengulang'
            isset($data->notes) ? $data->notes : '',
            $ustadz_id
        ]);
        
    } else if ($type === 'tahfidz') {
        if (empty($data->surat_id) || empty($data->ayat_range) || empty($data->status)) {
            throw new Exception("Parameter evaluasi Tahfidz tidak lengkap.");
        }
        $stmt = $db->prepare("
            INSERT INTO capaian_tahfidz (santri_id, surat_id, ayat_range, status, notes, ustadz_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $santri_id,
            $data->surat_id,
            $data->ayat_range,
            $data->status,
            isset($data->notes) ? $data->notes : '',
            $ustadz_id
        ]);
        
    } else if ($type === 'ibadah') {
        if (empty($data->category) || empty($data->item) || empty($data->status)) {
            throw new Exception("Parameter evaluasi Ibadah Praktis tidak lengkap.");
        }
        $stmt = $db->prepare("
            INSERT INTO capaian_ibadah_praktis (santri_id, category, item, status, notes, ustadz_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $santri_id,
            $data->category, // 'Wudhu', 'Sholat', 'Doa'
            $data->item,
            $data->status,
            isset($data->notes) ? $data->notes : '',
            $ustadz_id
        ]);
    } else {
        throw new Exception("Jenis evaluasi tidak dikenal.");
    }

    $db->commit();
    echo json_encode(["status" => "success", "message" => "Evaluasi berhasil disimpan."]);
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
`;

export const PHP_GET_DASHBOARD_DATA = `<?php
/**
 * get_dashboard_data.php
 * Fetch executive overview, class stats, and general metrics for the TPQ Dashboard.
 * Designed for traditional PHP servers (XAMPP / cPanel).
 */

require_once 'config.php';

$db = getDatabaseConnection();

try {
    // 1. General counts
    $stmt = $db->query("SELECT COUNT(*) AS total FROM santri");
    $totalSantri = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) AS total FROM ustadz");
    $totalUstadz = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) AS total FROM kelas");
    $totalKelas = $stmt->fetch()['total'];

    // 2. Evaluation counts
    $stmt = $db->query("SELECT COUNT(*) AS total FROM capaian_jilid");
    $jilidLogs = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) AS total FROM capaian_tahfidz");
    $tahfidzLogs = $stmt->fetch()['total'];

    $stmt = $db->query("SELECT COUNT(*) AS total FROM capaian_ibadah_praktis");
    $ibadahLogs = $stmt->fetch()['total'];

    $totalLogs = $jilidLogs + $tahfidzLogs + $ibadahLogs;

    // 3. Jilid pass rate
    $stmt = $db->query("SELECT COUNT(*) AS total FROM capaian_jilid WHERE status = 'Lulus'");
    $jilidLulus = $stmt->fetch()['total'];
    $jilidPassRate = $jilidLogs > 0 ? round(($jilidLulus / $jilidLogs) * 100) : 0;

    // 4. Tahfidz pass rate
    $stmt = $db->query("SELECT COUNT(*) AS total FROM capaian_tahfidz WHERE status = 'Lulus'");
    $tahfidzLulus = $stmt->fetch()['total'];

    // 5. Active classes detailed overview
    $sqlClasses = "
        SELECT k.id, k.name, u.name AS ustadz_name,
               (SELECT COUNT(*) FROM santri s WHERE s.kelas_id = k.id) AS total_santri,
               (SELECT COUNT(*) FROM capaian_jilid cj JOIN santri s ON cj.santri_id = s.id WHERE s.kelas_id = k.id) AS jilid_count,
               (SELECT COUNT(*) FROM capaian_tahfidz ct JOIN santri s ON ct.santri_id = s.id WHERE s.kelas_id = k.id) AS tahfidz_count,
               (SELECT COUNT(*) FROM capaian_ibadah_praktis cip JOIN santri s ON cip.santri_id = s.id WHERE s.kelas_id = k.id) AS ibadah_count
        FROM kelas k
        LEFT JOIN ustadz u ON k.ustadz_id = u.id
    ";
    $stmtClasses = $db->query($sqlClasses);
    $classesData = $stmtClasses->fetchAll();

    // 6. Recent activities feed (union of Jilid, Tahfidz, Ibadah logs)
    $sqlRecent = "
        (SELECT 'jilid' AS type, s.name AS santri_name, j.name AS item_name, CAST(cj.page AS CHAR) AS detail, cj.status, cj.updated_at, u.name AS ustadz_name
         FROM capaian_jilid cj
         JOIN santri s ON cj.santri_id = s.id
         JOIN jilid j ON cj.jilid_id = j.id
         JOIN ustadz u ON cj.ustadz_id = u.id)
        UNION ALL
        (SELECT 'tahfidz' AS type, s.name AS santri_name, sr.name AS item_name, ct.ayat_range AS detail, ct.status, ct.updated_at, u.name AS ustadz_name
         FROM capaian_tahfidz ct
         JOIN santri s ON ct.santri_id = s.id
         JOIN surat sr ON ct.surat_id = sr.id
         JOIN ustadz u ON ct.ustadz_id = u.id)
        UNION ALL
        (SELECT 'ibadah' AS type, s.name AS santri_name, cip.item AS item_name, cip.category AS detail, cip.status, cip.updated_at, u.name AS ustadz_name
         FROM capaian_ibadah_praktis cip
         JOIN santri s ON cip.santri_id = s.id
         JOIN ustadz u ON cip.ustadz_id = u.id)
        ORDER BY updated_at DESC LIMIT 10
    ";
    $stmtRecent = $db->query($sqlRecent);
    $recentLogs = $stmtRecent->fetchAll();

    // Send successful payload
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => [
            "stats" => [
                "total_santri" => $totalSantri,
                "total_ustadz" => $totalUstadz,
                "total_kelas" => $totalKelas,
                "total_logs" => $totalLogs,
                "jilid_logs" => $jilidLogs,
                "jilid_pass_rate" => $jilidPassRate,
                "tahfidz_lulus" => $tahfidzLulus,
                "ibadah_logs" => $ibadahLogs
            ],
            "classes" => $classesData,
            "recent_logs" => $recentLogs
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal memuat ringkasan dashboard.",
        "detail" => $e->getMessage()
    ]);
}
?>`;

export const PHP_MANAGE_SANTRI = `<?php
/**
 * manage_santri.php
 * Handles CRUD operations for Santri (Students)
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
        if ($action === 'delete' || isset($input['action']) && $input['action'] === 'delete') {
            $id = isset($input['id']) ? $input['id'] : (isset($_GET['id']) ? $_GET['id'] : '');
            if (empty($id)) {
                throw new Exception("ID Santri diperlukan untuk menghapus.");
            }
            
            $stmt = $db->prepare("DELETE FROM santri WHERE id = :id");
            $stmt->execute([':id' => $id]);
            
            $stmtUser = $db->prepare("DELETE FROM users WHERE linked_id = :id AND role = 'OrangTua'");
            $stmtUser->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Santri berhasil dihapus."]);
            exit();
        }

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

        $checkStmt = $db->prepare("SELECT COUNT(*) FROM santri WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $exists = $checkStmt->fetchColumn() > 0;

        if ($exists && !empty($id)) {
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

            if (isset($input['parent_password']) && !empty($input['parent_password'])) {
                $pwdStmt = $db->prepare("UPDATE santri SET parent_password_hash = :hash WHERE id = :id");
                $pwdStmt->execute([':hash' => $passwordHash, ':id' => $id]);
            }

            $syncStmt = $db->prepare("UPDATE users SET username = :username, name = :name WHERE linked_id = :id AND role = 'OrangTua'");
            $syncStmt->execute([':username' => $parentUsername, ':name' => $parentName, ':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Profil santri berhasil diperbarui."]);
            exit();
        } else {
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
?>`;

export const PHP_MANAGE_USTADZ = `<?php
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
        if ($action === 'delete' || (isset($input['action']) && $input['action'] === 'delete')) {
            $id = isset($input['id']) ? $input['id'] : (isset($_GET['id']) ? $_GET['id'] : '');
            if (empty($id)) {
                throw new Exception("ID Ustadz diperlukan untuk penghapus.");
            }

            $stmtKelas = $db->prepare("UPDATE kelas SET ustadz_id = NULL WHERE ustadz_id = :id");
            $stmtKelas->execute([':id' => $id]);

            $stmt = $db->prepare("DELETE FROM ustadz WHERE id = :id");
            $stmt->execute([':id' => $id]);

            $stmtUser = $db->prepare("DELETE FROM users WHERE linked_id = :id AND role = 'Ustadz'");
            $stmtUser->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Ustadz berhasil dihapus."]);
            exit();
        }

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

        $checkStmt = $db->prepare("SELECT COUNT(*) FROM ustadz WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $exists = $checkStmt->fetchColumn() > 0;

        if ($exists && !empty($id)) {
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

            $syncStmt = $db->prepare("UPDATE users SET username = :username, name = :name WHERE linked_id = :id AND role = 'Ustadz'");
            $syncStmt->execute([':username' => $username, ':name' => $name, ':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Data ustadz berhasil diperbarui."]);
            exit();
        } else {
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
?>`;

export const PHP_MANAGE_KELAS = `<?php
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
        if ($action === 'delete' || (isset($input['action']) && $input['action'] === 'delete')) {
            $id = isset($input['id']) ? $input['id'] : (isset($_GET['id']) ? $_GET['id'] : '');
            if (empty($id)) {
                throw new Exception("ID Kelas diperlukan untuk menghapus.");
            }

            $stmtSantri = $db->prepare("UPDATE santri SET kelas_id = NULL WHERE kelas_id = :id");
            $stmtSantri->execute([':id' => $id]);

            $stmt = $db->prepare("DELETE FROM kelas WHERE id = :id");
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Kelas berhasil dihapus."]);
            exit();
        }

        if (!isset($input['name'])) {
            throw new Exception("Nama Kelas wajib diisi.");
        }

        $id = isset($input['id']) ? trim($input['id']) : '';
        $name = trim($input['name']);
        $ustadzId = isset($input['ustadz_id']) && !empty($input['ustadz_id']) ? trim($input['ustadz_id']) : null;

        $checkStmt = $db->prepare("SELECT COUNT(*) FROM kelas WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $exists = $checkStmt->fetchColumn() > 0;

        if ($exists && !empty($id)) {
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
?>`;

export const PHP_MANAGE_IDENTITY = `<?php
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
        $stmt = $db->query("SELECT * FROM tpq_identity ORDER BY id ASC LIMIT 1");
        $data = $stmt->fetch();

        if (!$data) {
            $data = [
                "id" => 1,
                "name" => "TPQ Al-Falah",
                "address" => "Gedung Kajian Islam Al-Falah No. 5",
                "phone" => "0812-9999-8888",
                "logo" => "",
                "footer_text" => "Ngajiku Digital Workspace"
            ];
            
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
        $footerText = isset($input['footer_text']) ? trim($input['footer_text']) : 'Ngajiku Digital Workspace';

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
?>`;

export const PHP_MANAGE_CURRICULUM = `<?php
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
        $type = isset($_GET['type']) ? trim($_GET['type']) : 'all';

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
?>`;


