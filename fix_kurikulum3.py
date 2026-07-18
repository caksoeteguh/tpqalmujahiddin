import re

with open('tpqkita-php/kurikulum.php', 'r') as f:
    content = f.read()

content = re.sub(r'(\s*</div>\s*</div>\s*</div>\s*<script>)', r'\n            </div>\n        </div>\n    <?php endif; ?>\n</div>\n<script>', content)

with open('tpqkita-php/kurikulum.php', 'w') as f:
    f.write(content)
