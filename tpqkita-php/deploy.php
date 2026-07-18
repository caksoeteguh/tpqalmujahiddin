<?php
// Simple deployment script for cPanel
// Ensure this file is accessible from the web (e.g. in public_html)

$secret = 'tpqkita-2026'; // Match this in GitHub Webhook Secret

$headers = getallheaders();
$signature = isset($headers['X-Hub-Signature-256']) ? $headers['X-Hub-Signature-256'] : '';
$payload = file_get_contents('php://input');

if (!empty($signature)) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($hash, $signature)) {
        http_response_code(403);
        die("Invalid signature.");
    }
}

// 1. Pull latest changes from GitHub
$repo_dir = '/home/tpqalmuj/repositories/tpqalmujahiddin';
$pull = shell_exec("cd {$repo_dir} && /usr/local/cpanel/3rdparty/bin/git pull origin main 2>&1");

// 2. Trigger cPanel deployment (.cpanel.yml)
$deploy = shell_exec("uapi VersionControl start_deployment repository_root={$repo_dir} 2>&1");

echo "<pre>Pull Output:\n$pull\n\nDeploy Output:\n$deploy</pre>";
?>
