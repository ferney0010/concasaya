from pathlib import Path
content = Path('modelos.html').read_text(encoding='utf-8')
marker = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>'
idx = content.find(marker)
print(f'Index: {idx}')
if idx < 0:
  pos = content.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">')
  while pos != -1:
    snippet = content[pos:pos+200]
    if 'Dos Pisos' in snippet:
      print(f'Match at {pos}: {snippet!r}')
    pos = content.find('<h3 class="text-xl md:text-2xl font-bold text-secondary">', pos + 1)
