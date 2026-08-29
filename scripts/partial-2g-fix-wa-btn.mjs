// Fix del bug del waBtn: el href="#" + target="_blank" causaba que se abriera
// otra pestaña en lugar del modal. Solución: convertir el <a> en <button>,
// subir z-index del modal, y mejorar responsive.
import { readFileSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const changes = [];

  // 1) Convertir el <a id="hero-wa-btn" ...> a <button>
  // Patrón: <a href="#" id="hero-wa-btn" target="_blank" rel="noopener" class="...">...</a>
  const oldAnchor = /<a\s+href="#"\s+id="hero-wa-btn"[^>]*>([\s\S]*?)<\/a>/;
  if (oldAnchor.test(html)) {
    const newButton = html.replace(oldAnchor, (match, content) => {
      return `<button type="button" id="hero-wa-btn" class="${match.match(/class="([^"]+)"/)?.[1] || ''}">${content}</button>`;
    });
    html = newButton;
    changes.push('convertido <a href="#"> → <button>');
  } else {
    // Buscar si ya es button o si el patrón es diferente
    if (html.indexOf('id="hero-wa-btn"') < 0) {
      changes.push('⚠ hero-wa-btn no encontrado');
    } else if (html.indexOf('<button type="button" id="hero-wa-btn"') >= 0) {
      changes.push('(ya es button)');
    } else {
      changes.push('(patrón diferente, revisar)');
    }
  }

  // 2) Subir el z-index del modal de 70 a 200 (para estar sobre TODO)
  if (html.indexOf('.hero-wa-modal {') >= 0 && html.indexOf('z-index: 70;') >= 0) {
    html = html.replace(
      /(\.hero-wa-modal \{\s*position: fixed;[\s\S]*?z-index: )70;/,
      '$1200;'
    );
    changes.push('z-index del modal: 70 → 200');
  }

  // 3) En el JS, usar closest('button') o si el waBtn es ahora un <button>
  // asegurarnos que el listener de click funcione con cualquier elemento
  // (esto ya está OK en mi IIFE limpio)

  // 4) Verificar que el modal responsive tenga max-width correcto y scroll
  if (html.indexOf('.hero-wa-modal__card') >= 0) {
    // Asegurar que en mobile se vea bien
    if (html.indexOf('@media (max-width: 420px)') < 0 || html.indexOf('.hero-wa-modal__opt') < 0) {
      changes.push('(mobile styles OK)');
    } else {
      // Mejorar el padding del modal en mobile
      html = html.replace(
        /\@media \(max-width: 420px\) \{\s*\.hero-wa-modal__card \{ max-width: 100%; \}/,
        '@media (max-width: 420px) {\n        .hero-wa-modal__card { max-width: 100%; border-radius: 12px; }\n        .hero-wa-modal__body { padding: 0.85rem 0.85rem 0.5rem; }\n        .hero-wa-modal__header { padding: 0.7rem 0.85rem; }\n        .hero-wa-modal__opt { font-size: 0.8rem; padding: 0.7rem 0.8rem; gap: 0.55rem; }\n        .hero-wa-modal__greeting { font-size: 0.88rem; }\n        .hero-wa-modal__sub { font-size: 0.72rem; }'
      );
      changes.push('mobile styles del modal mejorados');
    }
  }

  if (html !== '' || changes.length > 0) {
    writeFileSync(file, html, 'utf8');
    console.log(`✓ [${file}]: ${changes.join(' | ')}`);
  } else {
    console.log(`- [${file}]: sin cambios`);
  }
}
console.log('\n✓ Tarea 2g lista.');
