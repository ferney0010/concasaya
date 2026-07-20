"""
Regenerate the gallery section organized by categories, excluding logos and broken images.
Based on the PDF structure:
- CABAÑAS (PDF pages 4-10)
- CASAS EN PLAQUETA DE CONCRETO (PDF pages 11-44)
- CASAS DE DOS PISOS (PDF pages 45-80)
- CASAS TIPO CUBO / MEDITERRÁNEAS (PDF pages 85-100)
- CASAS EN SISTEMA EPS (PDF pages 101-116)
- ACABADOS (PDF pages 117-126)
"""

# Logos to exclude (KAPRECOL/CONCASAYA brand images on white)
EXCLUDED_LOGOS = {
    'img180', 'img262', 'img1108',           # CONCASAYA logos
    'img247', 'img920', 'img962', 'img1175', # KAPRECOL logos
    'img901'                                  # tiny/possible logo
}

# Broken/empty images to exclude (<8KB)
EXCLUDED_BROKEN = {
    'img1006',  # 1x1
    'img397',   # small white
    'img675',   # very small
    'img698',   # very small
    'img913',   # empty
    'img335'    # empty
}

EXCLUDED = EXCLUDED_LOGOS | EXCLUDED_BROKEN

# ============================================================
# CATEGORIZACIÓN basada en análisis visual del grid completo
# ============================================================

# CABAÑAS: cabañas prefabricadas (vidrio, con altillo, tiny houses)
CABANAS = [
    'img253',  # CABAÑA DE VIDRIO (2 aguas + ventana vidrio) - hero
    'img273',  # cabaña 28m² con jardín
    'img294',  # tiny house 2 niveles con deck
    'img297',  # tiny house 2 niveles techo negro
    'img305',  # cabaña nocturna iluminada
    'img309',  # interior cabaña con altillo
    'img316',  # CABAÑA DE VIDRIO techo transparente
    'img325',  # CABAÑA DE VIDRIO estructura negra
    'img271',  # interior cabaña con altillo
    'img1323', # interior cabaña con altillo
    'img1333', # interior cabaña sofás rojos
]

# CASAS EN PLAQUETA DE CONCRETO 1 PISO (en proceso + terminadas)
# 1-story houses with teja de barro, single story construction
PLAQUETA_1P = [
    # In process / obra gris
    'img376',  # plaqueta gris, teja barro, campanario
    'img454',  # plaqueta gris KAPRECOL
    'img503',  # casa en L en proceso
    'img562',  # en proceso techo fibrocemento
    'img587',  # blanca ventanas teja (en obra gris)
    'img611',  # en proceso con bloques
    'img686',  # en proceso con porch madera
    'img692',  # en proceso forma L
    'img1264', 'img1269', 'img1280', 'img1286', 'img1301',  # en proceso
    # Terminadas (1-piso campestre con teja de barro)
    'img214',  # 2 pisos colonial blanca teja barro (en realidad 2 pisos, mover después)
    'img404',  # campestre con teja KAPRECOL
    'img407',  # campestre colonial jardín piedra
    'img413',  # conjunto casas campestres teja
    'img423',  # campestre teja con ventanales
    'img426',  # cabaña campestre teja
    'img434',  # campestre jardín flores
    'img439',  # campestre 1 piso
    'img457',  # campestre 1 piso
    'img465',  # campestre 1 piso
    'img471',  # campestre jardín deck
    'img478',  # casa grande techo fibrocemento
    'img484',  # casa en L jardín
    'img489',  # campestre 1 piso
    'img492',  # campestre 1 piso
    'img508',  # campestre con porch
    'img516',  # campestre con balcón
    'img523',  # campestre con balcón teja
    'img529',  # campestre con porch
    'img569',  # campestre teja jardín
    'img575',  # campestre teja
    'img581',  # campestre amarilla rejas
    'img599',  # blanca ventanas negras teja
    'img605',  # campestre 1 piso
    'img617',  # campestre 1 piso
    'img623',  # colonial con jardín mariposas
    'img630',  # campestre 1 piso
    'img636',  # campestre 1 piso
    'img642',  # campestre grande
    'img662',  # campestre 1 piso
    'img669',  # campestre 1 piso
    'img680',  # campestre 1 piso
    'img703',  # en proceso
    'img709',  # campestre 1 piso
    'img718',  # campestre 1 piso
    'img724',  # campestre 1 piso
    'img731',  # campestre 1 piso
    'img734',  # campestre 1 piso
    'img741',  # campestre 1 piso
    'img744',  # campestre 1 piso
    'img748',  # campestre 1 piso
    'img751',  # campestre 1 piso
    'img756',  # campestre 1 piso
    'img761',  # campestre 1 piso
    'img768',  # campestre 1 piso
    'img774',  # campestre 1 piso
    'img791',  # campestre 1 piso
    'img799',  # 2 pisos campestre
    'img804',  # campestre 1 piso
    'img814',  # campestre 1 piso
    'img821',  # campestre 1 piso
    'img827',  # campestre 1 piso
    'img831',  # campestre 1 piso
    'img834',  # campestre 1 piso
    'img845',  # campestre 1 piso
    'img852',  # campestre 1 piso
    'img855',  # campestre 1 piso
    'img862',  # campestre 1 piso
    'img867',  # campestre 1 piso
    'img874',  # campestre 1 piso
    'img880',  # campestre 1 piso
    'img884',  # campestre 1 piso
    'img890',  # campestre 1 piso
    'img593',  # campestre amarilla con rejas
    'img896',  # amarilla rejas
    'img908',  # campestre 1 piso
    'img927',  # campestre 1 piso
    'img945',  # en proceso
    'img980',  # campestre 1 piso (NOTA: img980 no existe, lo removemos)
    'img988',  # campestre 1 piso
    'img1011', 'img1018', 'img1026', 'img1032', 'img1037', 'img1043', 'img1049',  # campestres
    'img1258', 'img1275', 'img1291', 'img1297',  # campestres
]

# Filtrar img980 (no existe)
PLAQUETA_1P = [x for x in PLAQUETA_1P if x != 'img980']

# CASAS DE DOS PISOS
DOS_PISOS = [
    'img211',  # 2 pisos con teja de barro, en proceso
    'img535',  # 2 pisos en proceso
    'img545',  # 2 pisos en proceso con balcón
    'img550',  # 2 pisos en proceso
    'img557',  # 2 pisos NOCTURNA HERMOSA con balcón
    'img650',  # 2 pisos campestre
    'img1192', # 2 pisos KAPRECOL en proceso
    'img1195', # 2 pisos en proceso
    'img1199', # 2 pisos campestre terminada
    'img1205', # 2 pisos campestre terminada
    'img1225', # 2 pisos
    'img1228', # 2 pisos
    'img1236', # 2 pisos campestre terminada
    'img1250', # 2 pisos
    'img839',  # 2 pisos campestre
    'img785',  # 2 pisos campestre
    'img779',  # campestre con balcón
    'img1318', # 2 pisos en proceso con balcón y deck
]

# CASAS TIPO CUBO / MEDITERRÁNEAS (renders arquitectónicos)
CUBO_MEDITERRANEAS = [
    'img1055', # cubo moderno 1 piso voladizo
    'img1061', # cubo nocturna con piscina
    'img1067', # cubo blanco 2 pisos
    'img1072', # mediterránea 2 pisos piscina
    'img1081', # cubo en ladera con deck
    'img1087', # cubo concreto visto 2 pisos
    'img1093', # cubo horizontal extendida
    'img1099', # cubo modular en pradera
]

# CASAS EN SISTEMA EPS
SISTEMA_EPS = [
    'img1116', # diagrama panel EPS
]

# MATERIALES Y ACABADOS (interiores + tejas)
ACABADOS = [
    # Interiores con muebles y detalles
    'img147',  # cocina gabinetes madera + mármol
    'img190',  # sala con vigas + cocina
    'img350',  # interior cabaña vidrio + cama + baño mármol
    'img353',  # comedor cabaña vidrio + mesa
    'img1141', # interior con vigas
    'img1172', # baño mármol negro
    'img1240', # interior puerta doble madera
    'img1243', # interior puerta doble madera
    'img1246', # interior campestre con puerta doble madera
    'img1339', # comedor campestre con pared piedra
    'img1345', # sala moderna con sofás grises
    'img1352', # habitación con balcón
    'img1355', # baño + sala vacía
    'img1386', # sala con techo madera
    # Interiores vacíos
    'img362',  # interior habitación vacía
    'img367',  # interior habitación vacía
    'img379',  # interior habitación vacía
    'img442',  # interior habitación vacía
    'img968',  # interior habitación vacía
    'img972',  # interior con techo de madera
    'img1137', # interior habitación con ventana
    'img1371', # interior habitación vacía
    'img1382', # interior sala vacía con vigas
    # Close-up de tejas (Materiales)
    'img929',  # techo/teja close-up
    'img965',  # techo/teja close-up
    'img1369', # exterior con carpintería metálica negra
]

# PROCESO CONSTRUCTIVO
PROCESO = [
    'img135',  # placa cimentación CONCASAYA
    'img218',  # proceso construcción con personas
    'img233',  # sistema séptico
    'img1304', # placa cimentación
    'img1360', # puntos de luz (instalación eléctrica)
]

# Combine all categorized
ALL_CATEGORIZED = (
    CABANAS + PLAQUETA_1P + DOS_PISOS + CUBO_MEDITERRANEAS +
    SISTEMA_EPS + ACABADOS + PROCESO
)

# ============================================================
# Output
# ============================================================
print(f"// Total imágenes en categorías: {len(ALL_CATEGORIZED)}")
print(f"// Cabañas: {len(CABANAS)}")
print(f"// Plaqueta 1P (incluye en proceso): {len(PLAQUETA_1P)}")
print(f"// 2 Pisos: {len(DOS_PISOS)}")
print(f"// Cubo/Mediterráneas: {len(CUBO_MEDITERRANEAS)}")
print(f"// Sistema EPS: {len(SISTEMA_EPS)}")
print(f"// Acabados: {len(ACABADOS)}")
print(f"// Proceso: {len(PROCESO)}")
print(f"// Excluidos (logos+rotos): {len(EXCLUDED)}")

# Find unaccounted images
import os, glob
all_files = sorted(glob.glob(r'C:\Workspace\concasaya\catalogo concasaya\*.webp'),
                    key=lambda f: int(os.path.basename(f).replace('img','').replace('.webp','')))
all_names = [os.path.basename(f).replace('.webp','') for f in all_files if os.path.getsize(f) >= 8000]
unaccounted = [n for n in all_names if n not in ALL_CATEGORIZED and n not in EXCLUDED]
print(f"// Sin categoría (potenciales faltantes): {len(unaccounted)}")
if unaccounted:
    print(' '.join(unaccounted))
