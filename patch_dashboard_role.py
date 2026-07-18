import sys

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

search_kepala = "currentUser.role === 'KepalaTPQ' ?"
replace_kepala = "(currentUser.role === 'KepalaTPQ' || currentUser.role === 'Admin') ?"

content = content.replace(search_kepala, replace_kepala)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

print("Dashboard role patched")
