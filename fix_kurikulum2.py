import sys

with open('tpqkita-php/kurikulum.php', 'r') as f:
    content = f.read()

content = content.replace('            </div>\n        </div>\n</div>\n<script>', '            </div>\n        </div>\n    <?php endif; ?>\n</div>\n<script>')

with open('tpqkita-php/kurikulum.php', 'w') as f:
    f.write(content)
