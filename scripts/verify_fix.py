with open('modelos.html', 'r', encoding='utf-8') as f:
    text = f.read()
# Find campestre article
import re
m = re.search(r'<article id="campestre"', text)
idx = m.start()
print('campestre article at byte', idx)
# Show next 100 lines
lines = text[idx:idx+5500].split('\n')
for i, line in enumerate(lines[:80], start=1):
    print(f'{i:3d}|{line[:100]}')
