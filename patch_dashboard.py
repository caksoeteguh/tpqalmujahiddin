import sys

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Replace the white welcome banner with the dark one similar to PHP
search_banner = """      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-xs border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white md:text-2xl font-sans tracking-tight">
            Assalamualaikum, <span className="text-emerald-600 dark:text-emerald-400">{currentUser.name}</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Selamat datang di Aplikasi <span className="font-bold text-slate-600 dark:text-slate-300">TPQKita</span> - TPQ Digital terintegrasi dan real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50/50 px-4 py-2 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/30">
          <Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Sistem Sinkron: <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Online</span>
          </span>
        </div>
      </div>"""

replace_banner = """      {/* Welcome Banner (Matched with PHP Version) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10 space-y-2">
              <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Dasbor Utama</span>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Assalamu'alaikum, {currentUser.name}</h2>
              <p className="text-slate-300 text-sm max-w-xl">Selamat datang di sistem manajemen pembelajaran TPQ Digital. Kelola santri, pantau kurikulum, dan rekam hasil evaluasi dengan presisi.</p>
          </div>
          
          <div className="flex items-center gap-3 relative z-10 flex-wrap">
              <button onClick={() => setCurrentTab('scanner')} className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-5 rounded-2xl transition duration-150 shadow-lg shadow-emerald-500/10 active:scale-95">
                  <QrCode size={20} />
                  Buka Webcam Scanner
              </button>
              <button onClick={() => setCurrentTab('evaluasi')} className="flex items-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-5 rounded-2xl border border-slate-700 transition duration-150 active:scale-95">
                  Evaluasi Manual
              </button>
          </div>
      </div>"""

if search_banner in content:
    content = content.replace(search_banner, replace_banner)
    with open('src/components/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("Dashboard patched successfully")
else:
    print("Could not find banner string to replace in Dashboard")
