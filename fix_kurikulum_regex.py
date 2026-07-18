import re

with open('tpqkita-php/kurikulum.php', 'r') as f:
    content = f.read()

# Fix the endif before elseif mapel
content = re.sub(r'<\?php\s+endif;\s*\?>\s*<!-- Tab 3: Mapel Lain -->\s*<\?php\s+elseif\s*\(\$active_tab\s*===\s*\'mapel\'\):\s*\?>', r'<!-- Tab 3: Mapel Lain -->\n    <?php elseif ($active_tab === \'mapel\'): ?>', content)

with open('tpqkita-php/kurikulum.php', 'w') as f:
    f.write(content)
