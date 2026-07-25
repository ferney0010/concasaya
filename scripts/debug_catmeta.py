from pathlib import Path
content = Path('modelos.html').read_text(encoding='utf-8')
old = "'plaqueta':   { name: 'Casas en Plaqueta de Concreto',   eyebrow: 'Plaqueta',       variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
print('Looking for:')
print(repr(old))
print('Found:', old in content)
idx = content.find('plaqueta:')
if idx > 0:
    snippet = content[idx:idx+150]
    print('Actual line:')
    print(repr(snippet))
