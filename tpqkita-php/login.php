<?php
// ==========================================
// TPQKITA - LOGIN SCREEN (login.php)
// Beautiful, secure portal for all TPQ roles
// ==========================================

require_once 'config.php';

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}

$error_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    if (!empty($username) && !empty($password)) {
        $db = getDB();
        
        try {
            // 1. Check in 'users' table (handles Walikelas, KepalaTPQ, and pre-seeded accounts)
            $stmt = $db->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password_hash'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['role'] = $user['role']; // 'Walikelas', 'KepalaTPQ', 'Ustadz', 'OrangTua'
                $_SESSION['name'] = $user['name'];
                $_SESSION['linked_id'] = $user['linked_id'];
                
                header("Location: index.php");
                exit();
            }
            
            // 2. Fallback check: directly in 'ustadz' table
            $stmt = $db->prepare("SELECT * FROM ustadz WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $ustadz = $stmt->fetch();
            
            if ($ustadz && password_verify($password, $ustadz['password_hash'])) {
                $_SESSION['user_id'] = $ustadz['id'];
                $_SESSION['role'] = 'Ustadz';
                $_SESSION['name'] = $ustadz['name'];
                $_SESSION['linked_id'] = $ustadz['id'];
                
                header("Location: index.php");
                exit();
            }
            
            // 3. Fallback check: directly in 'santri' (parents) table
            $stmt = $db->prepare("SELECT * FROM santri WHERE parent_username = ? LIMIT 1");
            $stmt->execute([$username]);
            $parent = $stmt->fetch();
            
            if ($parent && password_verify($password, $parent['parent_password_hash'])) {
                $_SESSION['user_id'] = $parent['id'];
                $_SESSION['role'] = 'OrangTua';
                $_SESSION['name'] = $parent['parent_name'];
                $_SESSION['linked_id'] = $parent['id'];
                
                header("Location: index.php");
                exit();
            }
            
            // Credential invalid
            $error_message = 'Username atau password yang dimasukkan salah.';
        } catch (PDOException $e) {
            $error_message = 'Gagal melakukan otentikasi: ' . $e->getMessage();
        }
    } else {
        $error_message = 'Harap isi semua kolom username dan password.';
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login TPQKita - Sistem Evaluasi Pembelajaran TPQ</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-slate-100 flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
    
    <!-- Decorative Ambient Glows -->
    <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
    <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

    <div class="max-w-md w-full">
        <!-- Brand identity -->
        <div class="text-center mb-8">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 rotate-3 transform hover:rotate-12 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">TPQKita</h1>
            <p class="text-slate-400 text-sm mt-1">Sistem Informasi &amp; Evaluasi Pembelajaran TPQ</p>
        </div>

        <!-- Form container -->
        <div class="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl p-8 relative">
            <h2 class="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Masuk Sistem
            </h2>

            <!-- Success/Error Message -->
            <?php if (!empty($error_message)): ?>
                <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-red-400 shrink-0 mt-0.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <p class="text-red-300 text-sm leading-relaxed"><?php echo $error_message; ?></p>
                </div>
            <?php endif; ?>

            <form action="login.php" method="POST" class="space-y-5">
                <div>
                    <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                        <input type="text" name="username" id="username" required autocomplete="username" placeholder="Masukkan username Anda..."
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-100 placeholder-slate-600 transition duration-200">
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Kata Sandi</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        <input type="password" name="password" id="password" required autocomplete="current-password" placeholder="••••••••"
                               class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-100 placeholder-slate-600 transition duration-200">
                    </div>
                </div>

                <button type="submit"
                        class="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition duration-200 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]">
                    Masuk Sekarang
                </button>
            </form>
        </div>

        <!-- Help instructions -->
        <div class="mt-6 text-center text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
            <p>Akun Demo Default:</p>
            <p class="font-mono mt-1 text-slate-400">
                Kepala TPQ / Admin: <strong class="text-emerald-400">admin</strong> | Sandi: <strong class="text-emerald-400">admin123</strong><br>
                Ustadz: <strong class="text-emerald-400">ahmad</strong> | Sandi: <strong class="text-emerald-400">password</strong><br>
                Wali Santri: <strong class="text-emerald-400">budi</strong> | Sandi: <strong class="text-emerald-400">password</strong>
            </p>
        </div>
    </div>
</body>
</html>
