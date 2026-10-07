import fs from 'node:fs';
const html = fs.readFileSync('C:/Workspace/concasaya/materiales.html', 'utf8');
const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
let ok = 0, errs = 0;
blocks.forEach((b, i) => {
  try { JSON.parse(b[1]); ok++; }
  catch (e) { errs++; console.log('BLOQUE ' + i + ' INVALIDO: ' + e.message); }
});
console.log('JSON-LD: ' + ok + ' valido(s), ' + errs + ' con error');
console.log('img en .mc-media: ' + (html.match(/class="mc-media"/g) || []).length);
console.log('src de imagenes: ' + (html.match(/\/assets\/images\/materiales\/mat-/g) || []).length);
const alt = [...html.matchAll(/<img src="\/assets\/images\/materiales\/[^"]*"[\s\S]{0,120}?alt="([^"]*)"/g)].map((m) => m[1]);
console.log('alt presentes: ' + alt.length + ' / 9');
const vacios = alt.filter((a) => !a || a.length < 25);
console.log('alt vacios o cortos: ' + vacios.length);
const apex = (html.match(/https:\/\/concasaya\.com/g) || []).length;
console.log('referencias apex sin www: ' + apex);