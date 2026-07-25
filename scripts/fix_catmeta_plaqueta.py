from pathlib import Path
FILE = Path(r"C:\Workspace\concasaya\modelos.html")
content = FILE.read_text(encoding="utf-8")

# CAT_META plaqueta line (no quotes around key in this JS object)
old_line = "plaqueta:   { name: 'Casas en Plaqueta de Concreto',   eyebrow: 'Plaqueta',       variantOrder: ['default'],          variantLabel: { default: 'Todas' } },"
new_line = ("plaqueta:   { name: 'Plaqueta de 1 Piso',              eyebrow: 'Plaqueta',       variantOrder: ['default'],          variantLabel: { default: 'Todas' } },\n"
            "          plaqueta1p: { name: 'Plaqueta de 1 Piso',              eyebrow: 'Plaqueta 1P',    variantOrder: ['default'],          variantLabel: { default: 'Todas' } },")
if old_line in content:
    content = content.replace(old_line, new_line, 1)
    print("OK: CAT_META 'plaqueta' renamed + 'plaqueta1p' added")
else:
    print("!! CAT_META plaqueta line not found")

FILE.write_text(content, encoding="utf-8")
