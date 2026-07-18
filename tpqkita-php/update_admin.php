<?php
require_once 'config.php';
try {
    $db = getDB();
    $stmt = $db->prepare("UPDATE users SET username = 'admin', password_hash = ? WHERE id = 'US02'");
    $stmt->execute(['$2y$10$Bru.cqynn7xFQL3Ev7E2h.T/BTcaz6exr4WA0RQV9uG945sHrk6/i']);
    echo "Admin updated successfully.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
