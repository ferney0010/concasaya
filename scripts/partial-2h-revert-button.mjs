// Revertir el cambio del <button> al <a> original.
// El modal y el JS siguen intactos. Solo revierto el HTML del botón.
import { readFileSync, writeFileSync } from 'fs';

const files = ['index.html', 'blog/precio-casa-prefabricada-colombia-2026.html'];

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  const changes = [];

  // Revertir <button type="button" id="hero-wa-btn"...> a <a href="javascript:void(0)" id="hero-wa-btn"...>
  // (sin target="_blank" para evitar que se abra nueva pestaña)
  const buttonRe = /<button\s+type="button"\s+id="hero-wa-btn"\s+class="([^"]+)">([\s\S]*?)<\/button>/;
  if (buttonRe.test(html)) {
    html = html.replace(buttonRe, (match, cls, content) => {
      return `<a href="javascript:void(0)" id="hero-wa-btn" class="${cls}">${content}</a>`;
    });
    changes.push('revertido <button> → <a href="javascript:void(0)">');
  } else {
    changes.push('(no se encontró button)');
  }

  if (html !== before) {
    writeFileSync(file, html, 'utf8');
    console.log(`✓ [${file}]: ${changes.join(' | ')}`);
  }
}
console.log('\n✓ Revert listo.');
