<?php
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
?>
