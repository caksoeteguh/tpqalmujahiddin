import sys

with open('tpqkita-php/kurikulum.php', 'r') as f:
    content = f.read()

# 1. Change the first 'else:' for the second tab to 'elseif'
content = content.replace('<?php else: ?>', "<?php elseif ($active_tab === 'surat'): ?>")

# 2. Fix the misplaced endif before elseif mapel
wrong_ending = '''    <?php endif; ?>
    <!-- Tab 3: Mapel Lain -->
    <?php elseif ($active_tab === 'mapel'): ?>'''

correct_ending = '''    <!-- Tab 3: Mapel Lain -->
    <?php elseif ($active_tab === 'mapel'): ?>'''

content = content.replace(wrong_ending, correct_ending)

# 3. Add endif before the closing div of the page content
content = content.replace('            </div>\n        </div>\n</div>\n<script>', '            </div>\n        </div>\n    <?php endif; ?>\n</div>\n<script>')

with open('tpqkita-php/kurikulum.php', 'w') as f:
    f.write(content)
