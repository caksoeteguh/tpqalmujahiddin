import sys

with open('src/components/Login.tsx', 'r') as f:
    content = f.read()

s_login = """          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-100 dark:shadow-none mb-4 overflow-hidden">
            {tpqIdentity.logo && tpqIdentity.logo.startsWith('data:image') ? (
              <img src={tpqIdentity.logo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${
                tpqIdentity.logo === 'PRESET_BLUE' ? 'bg-indigo-600' :
                tpqIdentity.logo === 'PRESET_GOLD' ? 'bg-amber-500 text-slate-900' :
                tpqIdentity.logo === 'PRESET_TEAL' ? 'bg-teal-500' :
                'bg-emerald-500'
              }`}>
                <BookOpenCheck size={32} />
              </div>
            )}
          </div>"""

r_login = """          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-xl shadow-emerald-500/20 mb-4 overflow-hidden rotate-3 hover:rotate-12 transition-transform duration-300">
            {tpqIdentity.logo && tpqIdentity.logo.startsWith('data:image') ? (
              <img src={tpqIdentity.logo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            )}
          </div>"""
content = content.replace(s_login, r_login)

# Also update the primary button in Login.tsx
s_btn = """bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700 shadow-md shadow-indigo-100"""
r_btn = """bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.98]"""
content = content.replace(s_btn, r_btn)

# Reset button
s_btn_reset = """bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"""
r_btn_reset = """bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"""
content = content.replace(s_btn_reset, r_btn_reset)

with open('src/components/Login.tsx', 'w') as f:
    f.write(content)

print("React Login.tsx patched successfully")
