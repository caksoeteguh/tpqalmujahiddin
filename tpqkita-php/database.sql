-- ==========================================
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
  subjects VARCHAR(255) NOT NULL, -- Comma-separated (e.g., 'Jilid,Tahfidz,Ibadah Praktis')
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
(1, 'TPQ Al-Falah', 'Jl. Masjid No. 12, Jakarta', '081234567890', '', 'TPQKita Digital Workspace')
ON DUPLICATE KEY UPDATE name=name;

-- Passwords are hashed using password_hash('password', PASSWORD_DEFAULT)
-- 'password' hash is '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S'

INSERT INTO ustadz (id, name, username, password_hash, phone, subjects) VALUES
('U01', 'Ustadz Ahmad Fauzi, S.Pd.I', 'ahmad', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', '081234567890', 'Jilid,Tahfidz,Ibadah Praktis'),
('U02', 'Ustadzah Siti Aminah, S.Ag', 'aminah', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', '082345678901', 'Jilid,Tahfidz')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO kelas (id, name, ustadz_id) VALUES
('K01', 'Kelas Al-Fatih (Dasar)', 'U01'),
('K02', 'Kelas Al-Ikhlas (Menengah)', 'U01'),
('K03', 'Kelas An-Nas (Lanjutan)', 'U02')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO santri (id, name, barcode, birth_place, birth_date, kelas_id, parent_name, parent_phone, parent_username, parent_password_hash) VALUES
('S01', 'Muhammad Rizky Pratama', 'SANTRI-001', 'Jakarta', '2016-04-12', 'K01', 'Budi Santoso', '081299998888', 'budi', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S'),
('S02', 'Aisya Zahra Salsabila', 'SANTRI-002', 'Surabaya', '2017-08-20', 'K01', 'Rina Herawati', '081277776666', 'rina', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO jilid (id, name, total_pages) VALUES
('J01', 'Jilid 1', 40),
('J02', 'Jilid 2', 40),
('J03', 'Jilid 3', 40),
('J04', 'Jilid 4', 40),
('J05', 'Jilid 5', 40),
('J06', 'Jilid 6', 40),
('J07', 'Al-Qur\'an', 604)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO surat (id, name, total_ayat) VALUES
('SR01', 'An-Nas', 6),
('SR02', 'Al-Falaq', 5),
('SR03', 'Al-Ikhlas', 4),
('SR04', 'Al-Lahab', 5),
('SR05', 'An-Nashr', 3),
('SR06', 'Al-Kafirun', 6)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO users (id, username, password_hash, name, role, linked_id) VALUES
('US01', 'walikelas', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'Ibu Hajjah Khadijah, M.Pd', 'Walikelas', NULL),
('US02', 'kepala', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'KH. Maimun Zubair, Lc', 'KepalaTPQ', NULL),
('US03', 'ahmad', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'Ustadz Ahmad Fauzi, S.Pd.I', 'Ustadz', 'U01'),
('US04', 'budi', '$2y$10$R9h/cIPz9fN8vG2GepW2eO0O0u79uQpZit7X3kQsh57RbeN.X283S', 'Budi Santoso', 'OrangTua', 'S01')
ON DUPLICATE KEY UPDATE username=username;
