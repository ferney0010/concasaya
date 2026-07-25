from pathlib import Path
p = Path(r"C:\Workspace\concasaya\modelos.html")
text = p.read_text(encoding="utf-8")
needle = 'class="w-full h-full object-cover" />\n\n          </a>\n\n          </div>\n\n        </div>\n\n        </div>\n\n      </section>'
n = text.count(needle)
print(f'Pattern: {n}')
if n == 1:
    text = text.replace(needle, 'class="w-full h-full object-cover" />\n\n          </a>\n\n          </div>\n\n        </div>\n\n      </section>')
    p.write_text(text, encoding="utf-8")
    print('Removed extra </div>')
