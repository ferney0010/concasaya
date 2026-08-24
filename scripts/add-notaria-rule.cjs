// Agrega la regla de "firma autenticada ante notaria" en:
// 1) El modal de seguridad (assets/js/security-alert.js)
// 2) La pagina de politica (proteccion-contra-estafas.html)
// 3) El script generador (scripts/build-policy-page.cjs)
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ============================================================
// 1) MODAL: agregar regla con icono de martillo/gavel
// ============================================================
const modalPath = path.join(ROOT, 'assets/js/security-alert.js');
let modal = fs.readFileSync(modalPath, 'utf8');

const oldRule = `      <div class="sa-rule sa-rule--ok">
        <i class="fa-solid fa-circle-check"></i>
        <div>Todo pago se realiza unicamente despues de firmar contrato, en cuentas a nombre de <strong>CONCASAYA</strong> y con factura electronica.</div>
      </div>`;

const newRules = `      <div class="sa-rule sa-rule--ok">
        <i class="fa-solid fa-circle-check"></i>
        <div>Todo pago se realiza unicamente despues de firmar contrato, en cuentas a nombre de <strong>CONCASAYA</strong> y con factura electronica.</div>
      </div>
      <div class="sa-rule sa-rule--alert">
        <i class="fa-solid fa-gavel"></i>
        <div><strong>Todo contrato donde CONCASAYA reciba dinero debe ir firmado por las partes y autenticado ante notaria.</strong> Si no cumple ambas condiciones, no representa compromiso alguno para la empresa y podria tratarse de una suplantacion.</div>
      </div>`;

if (modal.includes(oldRule)) {
  modal = modal.replace(oldRule, newRules);
  fs.writeFileSync(modalPath, modal, 'utf8');
  console.log('[OK] assets/js/security-alert.js - regla de notaria agregada en el modal');
} else {
  console.log('[!!] assets/js/security-alert.js - patron de regla OK no encontrado');
}

// ============================================================
// 2) PAGINA DE POLITICA: agregar paso 5 en "Como si trabajamos"
//    y reforzar posicion oficial
// ============================================================
const policyPath = path.join(ROOT, 'proteccion-contra-estafas.html');
let policy = fs.readFileSync(policyPath, 'utf8');

// 2a) Agregar paso 5 en "Como si trabajamos" (despues del paso 4)
const oldStep4 = `<li class="flex gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="150">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">4</div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg mb-1">Seguimiento y garantía escrita</h3>
                <p class="text-gray-600 text-sm sm:text-base">Durante y después de la obra, mantienes un canal directo de seguimiento y recibes una garantía formal sobre la construcción.</p>
              </div>
            </li>
          </ol>`;

const newSteps = `<li class="flex gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="150">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">4</div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg mb-1">Seguimiento y garantía escrita</h3>
                <p class="text-gray-600 text-sm sm:text-base">Durante y después de la obra, mantienes un canal directo de seguimiento y recibes una garantía formal sobre la construcción.</p>
              </div>
            </li>
            <li class="flex gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 shadow-md ring-2 ring-amber-300" data-aos="fade-up" data-aos-delay="200">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">5</div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
                  <i class="fa-solid fa-gavel text-amber-600"></i>
                  Firma autenticada ante notaría
                </h3>
                <p class="text-gray-600 text-sm sm:text-base"><strong>Todo contrato donde CONCASAYA reciba dinero debe ir firmado por las partes y autenticado ante notaría.</strong> Ambas condiciones son obligatorias: la firma de los representantes legales de CONCASAYA y la autenticación notarial que avale la voluntad de las partes. Sin este doble requisito, el documento <strong>no representa compromiso alguno</strong> para la empresa y podría tratarse de una suplantación.</p>
              </div>
            </li>
          </ol>`;

if (policy.includes(oldStep4)) {
  policy = policy.replace(oldStep4, newSteps);
  console.log('[OK] proteccion-contra-estafas.html - paso 5 de notaria agregado');
} else {
  console.log('[!!] proteccion-contra-estafas.html - patron de paso 4 no encontrado');
}

// 2b) Reforzar la posicion oficial agregando parrafo sobre notaria
const oldPosition = `              <p>
                Tampoco reconocemos contratos, acuerdos verbales o promesas hechas por
                terceros que se presenten como empleados, aliados o representantes de
                la empresa sin poder acreditar su identidad con un correo
                <strong>@concasaya.com</strong> o un número verificado en este sitio.
              </p>`;

const newPosition = `              <p>
                Tampoco reconocemos contratos, acuerdos verbales o promesas hechas por
                terceros que se presenten como empleados, aliados o representantes de
                la empresa sin poder acreditar su identidad con un correo
                <strong>@codifytech.click</strong> o un número verificado en este sitio.
              </p>
              <p>
                <strong>Importante:</strong> todo contrato donde CONCASAYA reciba dinero
                debe estar firmado por las partes y <strong>autenticado ante notaría</strong>.
                La ausencia de la autenticación notarial, de la firma de los
                representantes legales de CONCASAYA o de cualquiera de las condiciones
                aquí descritas, libera a la empresa de cualquier obligación o
                responsabilidad sobre el documento.
              </p>`;

if (policy.includes(oldPosition)) {
  policy = policy.replace(oldPosition, newPosition);
  console.log('[OK] proteccion-contra-estafas.html - posicion oficial reforzada con notaria');
} else {
  console.log('[!!] proteccion-contra-estafas.html - patron de posicion no encontrado');
}

if (policy !== fs.readFileSync(policyPath, 'utf8')) {
  fs.writeFileSync(policyPath, policy, 'utf8');
}

// ============================================================
// 3) SCRIPT GENERADOR: aplicar los mismos cambios para futuras generaciones
// ============================================================
const builderPath = path.join(ROOT, 'scripts/build-policy-page.cjs');
let builder = fs.readFileSync(builderPath, 'utf8');

if (builder.includes(oldStep4)) {
  builder = builder.replace(oldStep4, newSteps);
  console.log('[OK] scripts/build-policy-page.cjs - paso 5 sincronizado');
} else {
  console.log('[!!] scripts/build-policy-page.cjs - patron de paso 4 no encontrado');
}

if (builder.includes(oldPosition)) {
  builder = builder.replace(oldPosition, newPosition);
  console.log('[OK] scripts/build-policy-page.cjs - posicion oficial sincronizada');
} else {
  console.log('[!!] scripts/build-policy-page.cjs - patron de posicion no encontrado');
}

if (builder !== fs.readFileSync(builderPath, 'utf8')) {
  fs.writeFileSync(builderPath, builder, 'utf8');
}
