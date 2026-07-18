import sys

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Find the block where `(currentUser.role === 'KepalaTPQ' || currentUser.role === 'Admin') ? renderKepalaTPQDashboard() : (`
# and replace it to just use the default dashboard.

search_block = """      {currentUser.role === 'OrangTua' ? (
        renderParentDashboard()
      ) : (currentUser.role === 'KepalaTPQ' || currentUser.role === 'Admin') ? (
        renderKepalaTPQDashboard()
      ) : ("""

replace_block = """      {currentUser.role === 'OrangTua' ? (
        renderParentDashboard()
      ) : ("""

content = content.replace(search_block, replace_block)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)

print("Dashboard patched to remove separate admin dashboard")
