import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:/Users/ferne/.minimax/v2/assets/2026/10/07';
const OUT = 'C:/Workspace/concasaya/assets/images/materiales';
fs.mkdirSync(OUT, { recursive: true });

const items = [
  ['00-29-56-027-asset_20261007-002956-027_edaa83f299c2_ca6a0ba1-Paneles prefabricados de concreto al aire libre.webp', 'mat-plaqueta-concreto.webp'],
  ['00-29-56-036-asset_20261007-002956-036_3465d6f6809f_76628013-Tejas de barro frente a casa montañosa.webp', 'mat-tejas-cubierta.webp'],
  ['00-29-56-043-asset_20261007-002956-043_48f0e1b1c175_a7b84712-Cerchas de acero junto a casa prefabricada.webp', 'mat-cerchas-metalicas.webp'],
  ['00-29-56-046-asset_20261007-002956-046_dd267a499aaa_8a6f0e99-Estructura de acero con vista montañosa.webp', 'mat-entremiso-metalico.webp'],
  ['00-29-56-049-asset_20261007-002956-049_045652e7334d_4d3e254a-Acero galvanizado entre montañas.webp', 'mat-estructura-acero.webp'],
  ['00-29-56-040-asset_20261007-002956-040_0aa70bb342db_85f80a8f-Casa de Acero en Construcción Andina.webp', 'mat-perfileria-tubo.webp'],
  ['00-29-56-051-asset_20261007-002956-051_717eb6a7ec81_624bba2c-Interior moderno en construcción con vista panorámica.webp', 'mat-muros-secos.webp'],
  ['00-29-56-054-asset_20261007-002956-054_45c8084f0e57_3fee5106-Construcción de casa prefabricada en las montañas.webp', 'mat-proyecto-completo.webp'],
  ['00-29-56-057-asset_20261007-002956-057_d8ee0242b8cd_ea01ab9d-Desarrollo residencial entre montañas.webp', 'mat-lote.webp'],
];

for (const [src, dest] of items) {
  const input = path.join(SRC, src);
  if (!fs.existsSync(input)) { console.log('FALTA: ' + src); continue; }
  const meta = await sharp(input).metadata();
  const tmp = path.join(OUT, dest + '.opt');
  await sharp(input)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(tmp);
  const kb = Math.round(fs.statSync(tmp).size / 1024);
  console.log(dest + '  ' + meta.width + 'x' + meta.height + ' -> 800px  ' + kb + ' KB');
}