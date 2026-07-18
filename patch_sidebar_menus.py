import sys

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Replace everything from {/* Main Group */} to {/* Footer info & Logout */}
start_marker = "{/* Main Group */}"
end_marker = "{/* Footer info & Logout */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_menus = """{/* Main Group */}
          <div>
            <nav className="space-y-1">
              <button
                onClick={() => handleNav('dashboard')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  currentTab === 'dashboard' ? activeClass : inactiveClass
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </nav>
          </div>

          {/* Master Data */}
          {['KepalaTPQ', 'Walikelas', 'Admin'].includes(role) && (
            <div>
              <p className="px-3 pt-4 pb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Master Data</p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('master-santri')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-santri' ? activeClass : inactiveClass
                  }`}
                >
                  <Users size={18} />
                  <span>Data Santri</span>
                </button>
                <button
                  onClick={() => handleNav('master-ustadz')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-ustadz' ? activeClass : inactiveClass
                  }`}
                >
                  <UserCheck size={18} />
                  <span>Data Ustadz</span>
                </button>
                <button
                  onClick={() => handleNav('master-kelas')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'master-kelas' ? activeClass : inactiveClass
                  }`}
                >
                  <GraduationCap size={18} />
                  <span>Data Kelas</span>
                </button>
                <button
                  onClick={() => handleNav('penempatan-santri')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'penempatan-santri' ? activeClass : inactiveClass
                  }`}
                >
                  <CheckSquare size={18} />
                  <span>Penempatan Kelas</span>
                </button>
                <button
                  onClick={() => handleNav('kurikulum')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'kurikulum' ? activeClass : inactiveClass
                  }`}
                >
                  <BookOpen size={18} />
                  <span>Data Kurikulum</span>
                </button>
              </nav>
            </div>
          )}

          {/* Evaluasi & Cetak */}
          {role !== 'OrangTua' && (
            <div>
              <p className="px-3 pt-4 pb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Evaluasi & Cetak</p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('scanner')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'scanner' ? activeClass : inactiveClass
                  }`}
                >
                  <QrCode size={18} />
                  <span>Scanner Kamera (Webcam)</span>
                </button>
                <button
                  onClick={() => handleNav('evaluasi')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'evaluasi' ? activeClass : inactiveClass
                  }`}
                >
                  <CheckSquare size={18} />
                  <span>Input Evaluasi Manual</span>
                </button>
                <button
                  onClick={() => handleNav('cetak-kartu')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'cetak-kartu' ? activeClass : inactiveClass
                  }`}
                >
                  <Award size={18} />
                  <span>Cetak Kartu Santri</span>
                </button>
                <button
                  onClick={() => handleNav('rekapitulasi')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'rekapitulasi' ? activeClass : inactiveClass
                  }`}
                >
                  <FileSpreadsheet size={18} />
                  <span>Rekapitulasi Evaluasi</span>
                </button>
              </nav>
            </div>
          )}

          {/* Pengaturan */}
          {['KepalaTPQ', 'Admin'].includes(role) && (
            <div>
              <p className="px-3 pt-4 pb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">Pengaturan</p>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('identitas')}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    currentTab === 'identitas' ? activeClass : inactiveClass
                  }`}
                >
                  <Settings size={18} />
                  <span>Identitas & Aplikasi</span>
                </button>
              </nav>
            </div>
          )}

        </div>
        """
    content = content[:start_idx] + new_menus + content[end_idx:]
    with open('src/components/Sidebar.tsx', 'w') as f:
        f.write(content)
    print("Sidebar menus patched")
else:
    print("Markers not found!")
