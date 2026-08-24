// Reemplaza contacto@concasaya.com por contacto@codifytech.click
// en los archivos del proyecto y actualiza el label del canal en el modal.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  'index.html',
  'proteccion-contra-estafas.html',
  'assets/js/security-alert.js',
  'scripts/build-policy-page.cjs'
];

let totalReplacements = 0;

for (const file of FILES) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) { console.log('[SKIP]', file); continue; }
  let content = fs.readFileSync(fullPath, 'utf8');
  const before = content;

  // 1) Reemplazo simple del correo
  content = content.replace(/contacto@concasaya\.com/g, 'contacto@codifytech.click');

  // 2) Actualizar el label del modal de seguridad
  // Antes: "Correo oficial" -> "Correo de seguridad CONCASAYA"
  // Antes: "Dominio verificado: concasaya.com" -> "Dominio verificado: codifytech.click"
  if (file === 'assets/js/security-alert.js') {
    content = content.replace(
      /label: 'Correo oficial',\s*\n\s*value: 'contacto@codifytech\.click',\s*\n\s*href: 'mailto:contacto@codifytech\.click'/,
      "label: 'Correo de seguridad CONCASAYA (Codify Tech)',\n        value: 'contacto@codifytech.click',\n        href: 'mailto:contacto@codifytech.click'"
    );
  }

  // 3) Actualizar la nota en la pagina de politica: "Dominio verificado"
  if (file === 'scripts/build-policy-page.cjs' || file === 'proteccion-contra-estafas.html') {
    content = content.replace(
      /Dominio verificado: concasaya\.com/g,
      'Dominio verificado: codifytech.click (empresa de seguridad cibernetica)'
    );
    // Cambiar el subtitulo del card de correo
    content = content.replace(
      /Cotizaciones, contratos, soporte/g,
      'Seguridad cibernetica y verificacion de canales oficiales'
    );
  }

  if (content !== before) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalReplacements++;
    console.log('[OK]', file);
  } else {
    console.log('[=] ', file, '(sin cambios)');
  }
}

console.log('\nArchivos modificados:', totalReplacements, '/', FILES.length);
