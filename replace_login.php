<?php
// We will replace the HTML part of tpqkita-php/login.php
$login_content = file_get_contents('tpqkita-php/login.php');
$html_pos = strpos($login_content, '<!DOCTYPE html>');
$php_part = substr($login_content, 0, $html_pos);

$new_html = <<<'HTML'
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login TPQKita - Sistem Evaluasi Pembelajaran TPQ</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body>
    <div class="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div class="w-full max-w-md space-y-8">
        
        <!-- Branding header -->
        <div class="text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-100 mb-4 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              <path d="m16 10 2 2 4-4"/>
            </svg>
          </div>
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-950">
            TPQKita
          </h2>
          <p class="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sistem Informasi Evaluasi Mengaji TPQ Terintegrasi
          </p>
        </div>

        <!-- Card wrapper -->
        <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
          
          <form action="login.php" method="POST" class="space-y-6">
            
            <?php if (!empty($error_message)): ?>
            <div class="rounded-lg bg-rose-50 p-3 text-xs font-bold text-rose-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
              </svg>
              <span><?php echo $error_message; ?></span>
            </div>
            <?php endif; ?>

            <!-- Username -->
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Username Akun</label>
              <div class="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Masukkan username Anda..."
                  class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-3 text-slate-400">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kata Sandi</label>
                <button
                  type="button"
                  class="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div class="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Masukkan kata sandi..."
                  class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-3 text-slate-400">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
            </div>

            <!-- Remember Me checkbox -->
            <div class="flex items-center justify-between text-xs">
              <label class="flex items-center gap-2 font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Ingat Saya di Browser Ini
              </label>
              <span class="text-slate-400">Session Aktif</span>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 shadow-md shadow-indigo-100"
            >
              Masuk Dashboard Aplikasi &raquo;
            </button>
          </form>
        </div>
        
        <!-- Footer legalities -->
        <p class="text-center text-[11px] text-slate-400">
          TPQKita &copy; 2026 | Created by Cak Soeteguh Al Mujahidin
        </p>

        <!-- Help instructions -->
        <div class="mt-6 text-center text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
            <p>Akun Demo Default:</p>
            <p class="font-mono mt-1 text-slate-400">
                Kepala TPQ / Admin: <strong class="text-indigo-500">admin</strong> | Sandi: <strong class="text-indigo-500">admin123</strong><br>
                Ustadz: <strong class="text-indigo-500">ahmad</strong> | Sandi: <strong class="text-indigo-500">password</strong><br>
                Wali Santri: <strong class="text-indigo-500">budi</strong> | Sandi: <strong class="text-indigo-500">password</strong>
            </p>
        </div>

      </div>
    </div>
</body>
</html>
HTML;

file_put_contents('tpqkita-php/login.php', $php_part . $new_html);
echo "HTML part of login.php has been replaced.\n";
?>
