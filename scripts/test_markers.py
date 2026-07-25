from pathlib import Path
content = Path('modelos.html').read_text(encoding='utf-8')
start_marker = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Prefabricadas de Dos Pisos</h3>'
end_marker   = '<h3 class="text-xl md:text-2xl font-bold text-secondary">Casas Tipo Cubo y Mediterráneas</h3>'
s = content.find(start_marker)
e = content.find(end_marker)
print(f"start: {s}, end: {e}")
print(f"start found? {s != -1}, end found? {e != -1}")
if s != -1:
    print(f"start snippet: {content[s:s+80]!r}")
if e != -1:
    print(f"end snippet: {content[e:e+80]!r}")
