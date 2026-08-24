// Genera proteccion-contra-estafas.html usando como plantilla el head/header/footer de index.html
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const indexPath = path.join(ROOT, 'index.html');
const outPath = path.join(ROOT, 'proteccion-contra-estafas.html');

const html = fs.readFileSync(indexPath, 'utf8');

// Helpers
function sliceBetween(text, startMarker, endMarker, startOffset = 0) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) throw new Error('No encontrado: ' + startMarker);
  const endIdx = text.indexOf(endMarker, startIdx + startOffset);
  if (endIdx === -1) throw new Error('No encontrado: ' + endMarker);
  return {
    start: startIdx,
    end: endIdx + endMarker.length,
    content: text.substring(startIdx, endIdx + endMarker.length)
  };
}

// 1) Head: desde <!DOCTYPE ...> hasta antes de <body
const doctypeIdx = html.indexOf('<!DOCTYPE');
const bodyStart = html.indexOf('<body');
const headSection = html.substring(doctypeIdx, bodyStart);

// 2) Header: desde <header hasta </header>
const headerStart = html.indexOf('<header');
const headerEndMarker = '</header>';
const headerEnd = html.indexOf(headerEndMarker, headerStart) + headerEndMarker.length;
const headerSection = html.substring(headerStart, headerEnd);

// 3) Footer: desde <footer hasta </footer>
const footerStart = html.indexOf('<footer');
const footerEndMarker = '</footer>';
const footerEnd = html.indexOf(footerEndMarker, footerStart) + footerEndMarker.length;
const footerSection = html.substring(footerStart, footerEnd);

// 4) Scripts del final: desde <script src="/assets/js/municipios.js"> hasta </body></html>
const scriptsStart = html.indexOf('<script src="/assets/js/municipios.js">');
const bodyCloseStart = html.lastIndexOf('</body>');
const scriptsSection = html.substring(scriptsStart, bodyCloseStart);

// Override title/description
const customHead = `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Política de Protección contra Estafas | CONCASAYA - Canales Oficiales</title>
    <meta
      name="description"
      content="Política oficial de CONCASAYA para la prevención de estafas. Conoce nuestros canales verificados, qué hacer si fuiste víctima de una suplantación y cómo proteger tu inversión en casas prefabricadas."
    />
    <meta
      name="keywords"
      content="estafas CONCASAYA, canales oficiales, suplantación, fraude casas prefabricadas, política de seguridad, protección al cliente, Colombia"
    />
    <link rel="canonical" href="https://www.concasaya.com/proteccion-contra-estafas.html" />

    <!-- Open Graph -->
    <meta property="og:title" content="Política de Protección contra Estafas | CONCASAYA" />
    <meta property="og:description" content="Canales oficiales verificados de CONCASAYA. Conoce cómo identificar y reportar intentos de estafa y suplantación de nuestra marca." />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://www.concasaya.com/proteccion-contra-estafas.html" />
    <meta property="og:image" content="https://www.concasaya.com/assets/images/logoconcasaya.webp" />

    <!-- Favicon -->
    <link rel="icon" href="https://www.concasaya.com/assets/images/logo.ico" type="image/x-icon" />
    <link rel="icon" href="https://www.concasaya.com/assets/images/logoconcasaya.webp" sizes="any" />
    <link rel="apple-touch-icon" href="https://www.concasaya.com/assets/images/logoconcasaya.webp" />

    <meta name="theme-color" content="#0077b6" />
    <meta name="robots" content="index, follow" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/assets/css/tailwind.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />

    <!-- Schema.org JSON-LD: WebPage + Organization -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Política de Protección contra Estafas | CONCASAYA",
      "description": "Página oficial de CONCASAYA con los canales verificados, recomendaciones para evitar estafas y pasos a seguir si fuiste víctima de suplantación.",
      "publisher": {
        "@type": "Organization",
        "name": "CONCASAYA",
        "telephone": "+57-314-289-1018",
        "email": "contacto@codifytech.click",
        "url": "https://www.concasaya.com"
      }
    }
    </script>

    <link rel="stylesheet" href="/assets/css/nav-shared.css" />
    <link rel="stylesheet" href="/assets/css/security-alert.css" />
    <link rel="stylesheet" href="/assets/css/social-bottom-bar.css" />
  </head>`;

// Contenido principal de la política
const policyContent = `
    <main class="pt-24 sm:pt-28 md:pt-32 pb-20">
      <!-- Hero -->
      <section class="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 text-white">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 right-10 w-60 h-60 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>
        <div class="container mx-auto px-6 py-16 sm:py-20 relative z-10">
          <div class="max-w-4xl mx-auto text-center" data-aos="fade-up">
            <div class="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest mb-5">
              <i class="fa-solid fa-shield-halved"></i>
              Documento oficial · CONCASAYA
            </div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Política de protección contra estafas y suplantación
            </h1>
            <p class="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Esta página es la única fuente oficial de CONCASAYA para identificar
              nuestros canales de comunicación y conocer los pasos a seguir si fuiste
              contactado por personas inescrupulosas que se hacen pasar por nuestra empresa.
            </p>
            <div class="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span class="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <i class="fa-solid fa-circle-check text-green-300"></i> Última actualización: 24 de agosto de 2026
              </span>
              <span class="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
                <i class="fa-solid fa-file-shield"></i> Aplica a todo el territorio colombiano
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Alerta destacada -->
      <section class="container mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border-l-8 border-red-600 p-6 sm:p-8" data-aos="fade-up">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center">
              <i class="fa-solid fa-triangle-exclamation text-red-600 text-2xl sm:text-3xl"></i>
            </div>
            <div class="flex-1">
              <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                CONCASAYA nunca exige dinero por proyectos sin contrato firmado
              </h2>
              <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                Si alguien te pidió anticipos, consignaciones o transferencias a cuentas
                personales para "apartar", "reservar" o "comprar" una casa prefabricada
                <strong class="text-red-700">sin haberte entregado un contrato firmado por CONCASAYA</strong>,
                probablemente fuiste víctima de una estafa. Esta página te explica cómo
                identificarlo, cómo verificar que estás hablando con nosotros y qué hacer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Canales oficiales -->
      <section class="container mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-10" data-aos="fade-up">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              <i class="fa-solid fa-shield-check text-green-600 mr-2"></i>
              Canales oficiales verificados
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Estos son los <strong>únicos</strong> canales mediante los cuales CONCASAYA
              se comunica con clientes, recibe pagos y firma contratos. Cualquier otro
              número, cuenta, perfil o correo que no aparezca aquí <strong>no nos representa</strong>.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <!-- WhatsApp principal -->
            <div class="bg-white rounded-xl shadow-md border-2 border-green-500 p-5 sm:p-6 relative overflow-hidden" data-aos="fade-up">
              <span class="absolute top-3 right-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Principal</span>
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  <i class="fa-brands fa-whatsapp"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">WhatsApp oficial principal</h3>
                  <p class="text-xs text-gray-500">Asesores comerciales y seguimiento</p>
                </div>
              </div>
              <a href="https://wa.me/573142891018" class="text-xl sm:text-2xl font-bold text-gray-900 hover:text-green-600 transition" target="_blank" rel="noopener">
                +57 314 289 1018
              </a>
              <p class="text-xs text-gray-500 mt-2">Verificable en este mismo sitio web y en Google Maps.</p>
            </div>

            <!-- WhatsApp secundario -->
            <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6" data-aos="fade-up" data-aos-delay="50">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  <i class="fa-brands fa-whatsapp"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">WhatsApp secundario</h3>
                  <p class="text-xs text-gray-500">Plan de referidos y aliados</p>
                </div>
              </div>
              <a href="https://wa.me/573165771582" class="text-xl sm:text-2xl font-bold text-gray-900 hover:text-green-600 transition" target="_blank" rel="noopener">
                +57 316 577 1582
              </a>
              <p class="text-xs text-gray-500 mt-2">Atiende únicamente temas de referidos. No recibe pagos.</p>
            </div>

            <!-- Email -->
            <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6" data-aos="fade-up" data-aos-delay="100">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  <i class="fa-solid fa-envelope"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">Correo electrónico oficial</h3>
                  <p class="text-xs text-gray-500">Seguridad cibernetica y verificacion de canales oficiales</p>
                </div>
              </div>
              <a href="mailto:contacto@codifytech.click" class="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition break-all">
                contacto@codifytech.click
              </a>
              <p class="text-xs text-gray-500 mt-2">Dominio verificado: codifytech.click (empresa de seguridad cibernetica)</p>
            </div>

            <!-- Oficina -->
            <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6" data-aos="fade-up" data-aos-delay="150">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  <i class="fa-solid fa-location-dot"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">Oficina física</h3>
                  <p class="text-xs text-gray-500">Atención presencial con cita previa</p>
                </div>
              </div>
              <p class="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                Cl. 147 #101-56 Local 64,<br/>Centro Comercial Fiesta · Bogotá
              </p>
              <p class="text-xs text-gray-500 mt-2">Atendemos de lunes a sábado. Confirma tu cita por WhatsApp antes de venir.</p>
            </div>

            <!-- Sitio web -->
            <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6" data-aos="fade-up" data-aos-delay="200">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
                  <i class="fa-solid fa-globe"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">Sitio web oficial</h3>
                  <p class="text-xs text-gray-500">Información, modelos y cotizador</p>
                </div>
              </div>
              <a href="https://www.concasaya.com/" class="text-lg sm:text-xl font-bold text-gray-900 hover:text-indigo-600 transition" target="_blank" rel="noopener">
                www.concasaya.com
              </a>
              <p class="text-xs text-gray-500 mt-2">El único dominio legítimo de la empresa.</p>
            </div>

            <!-- TikTok -->
            <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5 sm:p-6" data-aos="fade-up" data-aos-delay="250">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl">
                  <i class="fa-brands fa-tiktok"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">TikTok oficial</h3>
                  <p class="text-xs text-gray-500">Contenido educativo y proyectos</p>
                </div>
              </div>
              <a href="https://www.tiktok.com/@concasayaprefabricados" class="text-lg sm:text-xl font-bold text-gray-900 hover:text-pink-600 transition" target="_blank" rel="noopener">
                @concasayaprefabricados
              </a>
              <p class="text-xs text-gray-500 mt-2">Verifica la insignia azul de cuenta verificada.</p>
            </div>
          </div>

          <div class="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-xl" data-aos="fade-up">
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-circle-exclamation text-amber-600 text-xl mt-0.5 flex-shrink-0"></i>
              <div class="text-sm sm:text-base text-amber-900">
                <strong class="block mb-1">Importante</strong>
                Ningún asesor de CONCASAYA te pedirá pagos a cuentas personales,
                Nequi, Daviplata, Bancolombia a nombre de terceros, ni por medio de
                links de pago enviados desde números o correos distintos a los
                listados arriba.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Qué nunca hacemos -->
      <section class="bg-gray-50 py-14 sm:py-20">
        <div class="container mx-auto px-4 sm:px-6">
          <div class="max-w-5xl mx-auto">
            <div class="text-center mb-10" data-aos="fade-up">
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                <i class="fa-solid fa-ban text-red-600 mr-2"></i>
                ¿Qué nunca te vamos a pedir?
              </h2>
              <p class="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Si te encuentras en alguna de estas situaciones, no estás hablando
                con CONCASAYA. Cierra la conversación y reporta.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div class="bg-white rounded-xl p-5 sm:p-6 shadow-sm border-l-4 border-red-500" data-aos="fade-up">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-circle-xmark text-red-600 text-2xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">Anticipos sin contrato</h3>
                    <p class="text-sm text-gray-600">No pedimos dinero para "apartar", "reservar" o "agilizar" un proyecto sin que hayas firmado antes un contrato con todas las condiciones por escrito.</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl p-5 sm:p-6 shadow-sm border-l-4 border-red-500" data-aos="fade-up" data-aos-delay="50">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-circle-xmark text-red-600 text-2xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">Pagos a cuentas personales</h3>
                    <p class="text-sm text-gray-600">Nunca recibirás una solicitud de transferencia a nombre de un asesor, amigo o familiar. Todo pago se hace a nombre de CONCASAYA con factura electrónica.</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl p-5 sm:p-6 shadow-sm border-l-4 border-red-500" data-aos="fade-up" data-aos-delay="100">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-circle-xmark text-red-600 text-2xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">Negocios por Marketplace</h3>
                    <p class="text-sm text-gray-600">No vendemos casas por Facebook Marketplace, Marketplace de Instagram, OLX, MercadoLibre ni por grupos abiertos de WhatsApp o Telegram.</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl p-5 sm:p-6 shadow-sm border-l-4 border-red-500" data-aos="fade-up" data-aos-delay="150">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-circle-xmark text-red-600 text-2xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">Descuentos "por tiempo limitado"</h3>
                    <p class="text-sm text-gray-600">No aplicamos rebajas agresivas de último momento presionándote a pagar "hoy o mañana". Nuestras cotizaciones son estables y por escrito.</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl p-5 sm:p-6 shadow-sm border-l-4 border-red-500" data-aos="fade-up" data-aos-delay="200">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-circle-xmark text-red-600 text-2xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">Pedir códigos o claves</h3>
                    <p class="text-sm text-gray-600">Jamás te vamos a solicitar códigos de verificación, claves de tu banca, fotos de tu cédula por WhatsApp, ni instalar apps tipo AnyDesk o TeamViewer.</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-xl p-5 sm:p-6 shadow-sm border-l-4 border-red-500" data-aos="fade-up" data-aos-delay="250">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-circle-xmark text-red-600 text-2xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <h3 class="font-bold text-gray-900 mb-1">Suplantación de redes</h3>
                    <p class="text-sm text-gray-600">Si te contactan desde perfiles con nuestro nombre pero pocos seguidores, sin insignia de verificación, o que escriben con errores, no somos nosotros.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Qué sí hacemos -->
      <section class="container mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div class="max-w-5xl mx-auto">
          <div class="text-center mb-10" data-aos="fade-up">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              <i class="fa-solid fa-circle-check text-green-600 mr-2"></i>
              ¿Cómo sí trabajamos en CONCASAYA?
            </h2>
            <p class="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Para que tengas total claridad sobre nuestro proceso real.
            </p>
          </div>

          <ol class="space-y-5">
            <li class="flex gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 shadow-md" data-aos="fade-up">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg mb-1">Cotización formal por escrito</h3>
                <p class="text-gray-600 text-sm sm:text-base">Te enviamos una propuesta con modelos, áreas, materiales, tiempos y precios desglosados. Siempre por WhatsApp oficial o correo @concasaya.com.</p>
              </div>
            </li>
            <li class="flex gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="50">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg mb-1">Contrato firmado por ambas partes</h3>
                <p class="text-gray-600 text-sm sm:text-base">Antes de cualquier pago firmamos un contrato que describe alcance, cronograma, garantías, forma de pago y cláusulas de protección al cliente.</p>
              </div>
            </li>
            <li class="flex gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="100">
              <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg mb-1">Pagos a nombre de CONCASAYA con factura</h3>
                <p class="text-gray-600 text-sm sm:text-base">Todos los pagos se realizan a cuentas empresariales a nombre de CONCASAYA y se emite factura electrónica. No aceptamos pagos en efectivo, a cuentas personales ni a terceros.</p>
              </div>
            </li>
            <li class="flex gap-4 sm:gap-5 bg-white rounded-xl p-5 sm:p-6 shadow-md" data-aos="fade-up" data-aos-delay="150">
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
          </ol>
        </div>
      </section>

      <!-- Qué hacer si ya caíste -->
      <section class="bg-gradient-to-br from-red-50 to-amber-50 py-14 sm:py-20">
        <div class="container mx-auto px-4 sm:px-6">
          <div class="max-w-4xl mx-auto">
            <div class="text-center mb-10" data-aos="fade-up">
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                <i class="fa-solid fa-life-ring text-red-600 mr-2"></i>
                ¿Ya caíste en una estafa? Actúa así
              </h2>
              <p class="text-gray-700 max-w-2xl mx-auto text-sm sm:text-base">
                Si enviaste dinero a una persona o cuenta no oficial, sigue estos pasos
                lo antes posible. Entre más rápido actúes, más opciones tienes de recuperar tu dinero.
              </p>
            </div>

            <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-5" data-aos="fade-up">
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 class="font-bold text-gray-900 mb-1">No sigas enviando dinero</h3>
                  <p class="text-gray-600 text-sm">Por más presión que recibas ("es el último pago", "si no envías pierdes todo"), <strong>detente</strong>. Las estafas suelen pedir varios pagos pequeños antes de desaparecer.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 class="font-bold text-gray-900 mb-1">Conserva todas las pruebas</h3>
                  <p class="text-gray-600 text-sm">Capturas de pantalla, conversaciones, comprobantes de transferencia, números de cuenta, nombres de contacto. <strong>No borres nada</strong>, es la base de la denuncia.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 class="font-bold text-gray-900 mb-1">Reporta a tu banco o entidad financiera</h3>
                  <p class="text-gray-600 text-sm">Llama inmediatamente a la línea de atención al cliente de tu banco, Nequi o Daviplata. Pide el <strong>reverso de la transferencia</strong> y una investigación interna por fraude.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 class="font-bold text-gray-900 mb-1">Denuncia ante la Fiscalía y la Policía</h3>
                  <p class="text-gray-600 text-sm">Presenta denuncia por <strong>estafa y suplantación de identidad</strong> en la Fiscalía General de la Nación (Caivas) o a través de la línea <strong>165</strong> del Gaula. Puedes hacerlo también virtual en <a href="https://adenunciar.policia.gov.co" target="_blank" rel="noopener" class="text-primary font-semibold underline">adenunciar.policia.gov.co</a>.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">5</div>
                <div>
                  <h3 class="font-bold text-gray-900 mb-1">Reporta el número a las plataformas</h3>
                  <p class="text-gray-600 text-sm">Reporta el perfil falso en WhatsApp, Facebook, Instagram o TikTok. Entre más reportes reciba, más rápido lo eliminan.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">6</div>
                <div>
                  <h3 class="font-bold text-gray-900 mb-1">Contáctanos para que te asesoremos</h3>
                  <p class="text-gray-600 text-sm">Te ayudamos a verificar la legitimidad del contacto y, si efectivamente es una estafa, podemos orientarte con el proceso. Escríbenos al WhatsApp oficial.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Posición de CONCASAYA -->
      <section class="container mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border-t-8 border-primary" data-aos="fade-up">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                <i class="fa-solid fa-scale-balanced"></i>
              </div>
              <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Posición oficial de CONCASAYA
              </h2>
            </div>
            <div class="prose prose-gray max-w-none text-gray-700 leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                <strong>CONCASAYA no se hace responsable</strong> por pagos, anticipos,
                consignaciones o transferencias realizadas a personas naturales, cuentas
                bancarias personales, perfiles falsos en redes sociales o cualquier canal
                que no aparezca listado en esta página como canal oficial.
              </p>
              <p>
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
              </p>
              <p>
                Si realizaste un pago fuera de nuestros canales oficiales, te invitamos
                a seguir los pasos de la sección anterior. <strong>Nuestra voluntad es
                ayudarte a identificar la estafa y a iniciar el proceso de denuncia</strong>,
                pero la recuperación de los recursos depende de las autoridades
                competentes y de tu banco.
              </p>
              <p>
                Esta política es de cumplimiento obligatorio para cualquier
                comunicación, cotización o acuerdo comercial con CONCASAYA y aplica
                para todo el territorio colombiano.
              </p>
            </div>

            <div class="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20necesito%20verificar%20la%20autenticidad%20de%20un%20contacto%20antes%20de%20realizar%20un%20pago." class="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-5 py-3 rounded-full hover:opacity-90 transition" target="_blank" rel="noopener">
                <i class="fa-brands fa-whatsapp"></i> Verificar por WhatsApp oficial
              </a>
              <a href="mailto:contacto@codifytech.click?subject=Verificaci%C3%B3n%20de%20canal%20oficial" class="flex-1 inline-flex items-center justify-center gap-2 bg-white text-primary border-2 border-primary font-bold px-5 py-3 rounded-full hover:bg-primary/5 transition">
                <i class="fa-solid fa-envelope"></i> Escribir a contacto@codifytech.click
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA final -->
      <section class="bg-gradient-to-br from-primary to-primary/80 text-white py-12 sm:py-16">
        <div class="container mx-auto px-4 sm:px-6 text-center">
          <div class="max-w-3xl mx-auto" data-aos="fade-up">
            <i class="fa-solid fa-shield-halved text-5xl sm:text-6xl mb-4 opacity-90"></i>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              ¿Dudas si estás hablando con nosotros?
            </h2>
            <p class="text-base sm:text-lg text-white/90 mb-7">
              Cierra cualquier conversación sospechosa y contáctanos únicamente
              por los canales oficiales listados arriba. Estamos para ayudarte,
              sin ningún costo.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/573142891018" class="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition" target="_blank" rel="noopener">
                <i class="fa-brands fa-whatsapp text-xl"></i> Hablar con un asesor oficial
              </a>
              <a href="/" class="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur text-white border-2 border-white font-bold px-6 py-3 rounded-full hover:bg-white/20 transition">
                <i class="fa-solid fa-house"></i> Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
`;

// Construir la página final
const finalHtml =
  '<!DOCTYPE html>\n' +
  '<html lang="es">\n' +
  customHead + '\n' +
  '  <body class="bg-white text-dark">\n' +
  '    ' + headerSection + '\n' +
  policyContent + '\n' +
  '    ' + footerSection + '\n' +
  '\n' +
  '    <div id="social-bottom-bar-spacer" aria-hidden="true"></div>\n' +
  '    <!-- Barra inferior con chatbot, WhatsApp y redes sociales -->\n' +
  '    <div class="fixed inset-x-0 bottom-0 z-40 flex justify-center">\n' +
  '      <div id="social-bottom-bar" class="flex items-center gap-3 px-4 py-3 w-full justify-center bg-white/10 backdrop-blur-md border-t border-white/15 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">\n' +
  '        <a href="https://wa.me/573142891018" target="_blank" rel="noopener" class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-semibold transition shadow-lg" aria-label="WhatsApp">\n' +
  '          <i class="fa-brands fa-whatsapp text-xl"></i>\n' +
  '          <span class="hidden sm:inline">WhatsApp</span>\n' +
  '        </a>\n' +
  '        <a href="https://www.tiktok.com/@concasayaprefabricados" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-gray-800 hover:bg-black flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 hover:shadow-lg" aria-label="TikTok">\n' +
  '          <i class="fab fa-tiktok"></i>\n' +
  '        </a>\n' +
  '      </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>\n' +
  '    <script>\n' +
  '      AOS.init({ duration: 800, once: true });\n' +
  '    </script>\n' +
  '    ' + scriptsSection + '\n' +
  '    <script src="/assets/js/security-alert.js"></script>\n' +
  '  </body>\n' +
  '</html>\n';

fs.writeFileSync(outPath, finalHtml, 'utf8');
console.log('OK: Pagina de politica generada en', outPath);
console.log('Tamano:', (finalHtml.length / 1024).toFixed(1), 'KB');
