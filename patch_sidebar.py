import sys

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Replace activeClass
search_active = """  const activeClass = "active-nav text-emerald-400 font-semibold";"""
replace_active = """  const activeClass = "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20";"""
content = content.replace(search_active, replace_active)

# Replace the logo logic back to emerald
search_logo = """            {tpqIdentity.logo && tpqIdentity.logo.startsWith('data:image') ? (
              <img src={tpqIdentity.logo} alt="Logo" className="h-10 w-10 object-cover rounded-xl shadow-md" />
            ) : (
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                tpqIdentity.logo === 'PRESET_BLUE' ? 'bg-indigo-600' :
                tpqIdentity.logo === 'PRESET_GOLD' ? 'bg-amber-500 text-slate-900' :
                tpqIdentity.logo === 'PRESET_TEAL' ? 'bg-teal-500' :
                'bg-emerald-500'
              }`}>
                <BookOpenCheck size={22} className="animate-pulse" />
              </div>
            )}"""

replace_logo = """            {tpqIdentity.logo && tpqIdentity.logo.startsWith('data:image') ? (
              <img src={tpqIdentity.logo} alt="Logo" className="h-12 w-12 object-cover rounded-xl shadow-md" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            )}"""
content = content.replace(search_logo, replace_logo)


# Revert header.php to the emerald logo too
with open('tpqkita-php/header.php', 'r') as f:
    header_content = f.read()

s_header_mob = """<div class="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  <path d="m16 10 2 2 4-4"/>
                </svg>
            </div>"""

r_header_mob = """<div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-xl flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            </div>"""

s_header_desk = """<div class="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  <path d="m16 10 2 2 4-4"/>
                </svg>
            </div>"""
r_header_desk = """<div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
            </div>"""
header_content = header_content.replace(s_header_mob, r_header_mob)
header_content = header_content.replace(s_header_desk, r_header_desk)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

with open('tpqkita-php/header.php', 'w') as f:
    f.write(header_content)

# And let's also fix login.php in PHP to have the emerald logo again
with open('tpqkita-php/login.php', 'r') as f:
    login_content = f.read()

s_login = """          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-100 mb-4 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              <path d="m16 10 2 2 4-4"/>
            </svg>
          </div>"""
r_login = """          <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 rotate-3 transform hover:rotate-12 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
          </div>"""
login_content = login_content.replace(s_login, r_login)
with open('tpqkita-php/login.php', 'w') as f:
    f.write(login_content)

print("Sidebar, header, and login patched successfully")
