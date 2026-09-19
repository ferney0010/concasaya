// Parte 1C: inserta 5 secciones nuevas (sistemas, precios, tiempos, licencias, garantía)
// entre la sección #seccion-cobertura (Parte 1B) y la siguiente sección existente.
// Cada sección: H2 + intro + contenido (tabla/lista) + CTA. Schema-friendly.
import { readFileSync, writeFileSync } from 'fs';

const file = 'pages/casas-prefabricadas-colombia.html';
let html = readFileSync(file, 'utf8');

// Encontrar dónde termina la sección cobertura (la que metimos en 1B)
// Las nuevas secciones se insertan justo después.
const coberturaEnd = html.indexOf('</section>', html.indexOf('id="seccion-cobertura"'));
if (coberturaEnd < 0) { console.error('No encontré cierre de cobertura'); process.exit(1); }
const insertPoint = coberturaEnd + '</section>'.length;
console.log(`Cobertura cierra en ${insertPoint}`);

// --- CSS para las nuevas secciones ---
const newCss = `
<style>
  /* === Tablas comparativas === */
  .compare-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  }
  .compare-table th, .compare-table td {
    padding: 0.85rem 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.92rem;
  }
  .compare-table th {
    background: linear-gradient(135deg, #0077b6 0%, #00a8e8 100%);
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .compare-table tr:last-child td { border-bottom: 0; }
  .compare-table tr:hover td { background: #f0f9ff; }
  .compare-table .check { color: #10b981; font-weight: 700; }
  .compare-table .cross { color: #ef4444; font-weight: 700; }
  .compare-table .partial { color: #f59e0b; font-weight: 700; }
  @media (max-width: 640px) {
    .compare-table th, .compare-table td { padding: 0.6rem 0.5rem; font-size: 0.82rem; }
  }
  /* === Stats === */
  .stat-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.25rem 1rem;
    text-align: center;
  }
  .stat-card__num {
    font-size: 1.85rem;
    font-weight: 800;
    color: #0077b6;
    line-height: 1.1;
  }
  .stat-card__label {
    font-size: 0.82rem;
    color: #64748b;
    margin-top: 0.3rem;
  }
  /* === Pricing tier === */
  .price-tier {
    background: #fff;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    transition: border-color 0.18s ease, transform 0.18s ease;
  }
  .price-tier:hover {
    border-color: #0077b6;
    transform: translateY(-2px);
  }
  .price-tier--featured {
    border-color: #0077b6;
    background: linear-gradient(180deg, #f0f9ff 0%, #fff 100%);
  }
  .price-tier__name {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #0077b6;
  }
  .price-tier__price {
    font-size: 1.6rem;
    font-weight: 800;
    color: #0a2540;
    margin: 0.4rem 0;
  }
  .price-tier__price small {
    font-size: 0.78rem;
    font-weight: 500;
    color: #64748b;
  }
  .price-tier__list {
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }
  .price-tier__list li {
    padding: 0.35rem 0;
    font-size: 0.85rem;
    color: #475569;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }
  .price-tier__list li::before {
    content: "✓";
    color: #10b981;
    font-weight: 700;
    flex-shrink: 0;
  }
  /* === Timeline === */
  .timeline {
    position: relative;
    padding: 1rem 0;
  }
  .timeline::before {
    content: "";
    position: absolute;
    left: 1.25rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }
  .timeline-item {
    position: relative;
    padding-left: 3.5rem;
    padding-bottom: 1.75rem;
  }
  .timeline-item:last-child { padding-bottom: 0; }
  .timeline-item::before {
    content: "";
    position: absolute;
    left: 0.5rem;
    top: 0.3rem;
    width: 1.5rem;
    height: 1.5rem;
    background: #0077b6;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 2px #0077b6;
  }
  .timeline-item__week {
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #0077b6;
  }
  .timeline-item__title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0a2540;
    margin: 0.2rem 0 0.4rem;
  }
  .timeline-item__desc {
    font-size: 0.92rem;
    color: #475569;
    line-height: 1.5;
  }
  /* === Quick answer (AEO) === */
  .quick-answer-box {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-left: 4px solid #0077b6;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin: 1.5rem 0;
  }
  .quick-answer-box h3 {
    font-size: 1rem;
    font-weight: 800;
    color: #0a2540;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.5rem;
  }
  .quick-answer-box p {
    margin: 0;
    color: #1e293b;
    line-height: 1.6;
  }
  .quick-answer-box strong { color: #0077b6; }
</style>
`;

// --- HTML de las 5 secciones nuevas ---
const newSections = `
    <!-- 2. Sistemas constructivos (AEO: ¿qué sistemas usa CONCASAYA?) -->
    <section id="seccion-sistemas" class="py-12 sm:py-16 bg-white">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mx-auto text-center mb-10">
          <p class="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">Sistemas constructivos</p>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            ¿Qué sistemas de construcción usa CONCASAYA?
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            Trabajamos con <strong>dos tecnologías probadas</strong> en el mercado colombiano de casas prefabricadas, cada una con ventajas según tu proyecto, clima y presupuesto.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div class="bg-white border-2 border-primary/30 rounded-2xl p-6 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
                <i class="fas fa-cube text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-dark">Paneles EPS</h3>
                <p class="text-xs text-gray-500">Poliestireno Expandido</p>
              </div>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              Paneles estructurales de poliestireno expandido (EPS) con malla de acero y mortero proyectado. Excelente aislamiento térmico y acústico. Construcción en seco, muy rápida y limpia.
            </p>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Aislamiento térmico superior</strong> (reduce consumo de energía)</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Liviano</strong> — ideal para terrenos con限制 de carga</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Rápido</strong> — 4-5 semanas para una casa de 80m²</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Acústico</strong> — reduce ruido exterior hasta 40 dB</span></li>
            </ul>
          </div>

          <div class="bg-white border-2 border-emerald-300 rounded-2xl p-6 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <i class="fas fa-th-large text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-dark">Plaqueta de concreto</h3>
                <p class="text-xs text-gray-500">Sistema tradicional industrializado</p>
              </div>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed mb-4">
              Placas de concreto reforzado prefabricadas en planta, ensambladas en obra. Mayor robustez estructural y mayor inercia térmica. Ideal para climas fríos y proyectos de mayor tamaño.
            </p>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Estructura sólida</strong> — similar a construcción tradicional</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Inercia térmica</strong> — mantiene temperatura interior estable</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Resistente al fuego</strong> — muros cortafuegos RF 120 min</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check-circle text-emerald-500 mt-0.5 flex-shrink-0"></i> <span><strong>Durabilidad</strong> — garantía estructural de largo plazo</span></li>
            </ul>
          </div>
        </div>

        <div class="mt-8 max-w-4xl mx-auto overflow-x-auto">
          <table class="compare-table">
            <thead>
              <tr>
                <th>Característica</th>
                <th>Paneles EPS</th>
                <th>Plaqueta de concreto</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Tiempo de construcción (80m²)</td><td>4-5 semanas</td><td>6-8 semanas</td></tr>
              <tr><td>Aislamiento térmico</td><td><span class="check">Excelente</span></td><td><span class="check">Bueno</span></td></tr>
              <tr><td>Aislamiento acústico</td><td><span class="check">Excelente (40 dB)</span></td><td><span class="check">Bueno (30 dB)</span></td></tr>
              <tr><td>Resistencia al fuego</td><td><span class="partial">Media</span></td><td><span class="check">Alta (RF 120 min)</span></td></tr>
              <tr><td>Peso por m²</td><td><span class="check">Liviano (~80 kg/m²)</span></td><td><span class="partial">Pesado (~250 kg/m²)</span></td></tr>
              <tr><td>Adaptabilidad a diseño</td><td><span class="check">Alta</span></td><td><span class="check">Alta</span></td></tr>
              <tr><td>Mejor para climas</td><td>Cálido y templado</td><td>Frío y muy variable</td></tr>
            </tbody>
          </table>
        </div>

        <div class="mt-8 text-center">
          <a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20%C2%BFqu%C3%A9%20sistema%20me%20recomienda%20para%20mi%20proyecto%3F" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition">
            <i class="fab fa-whatsapp"></i> Asesoría gratuita por WhatsApp
          </a>
        </div>
      </div>
    </section>

    <!-- 3. Precios por m² (AEO: ¿cuánto cuesta?) -->
    <section id="seccion-precios" class="py-12 sm:py-16 bg-gradient-to-b from-slate-50 to-white">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mx-auto text-center mb-10">
          <p class="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">Precios actualizados 2026</p>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            ¿Cuánto cuesta el m² de casa prefabricada en Colombia?
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            Rangos reales de CONCASAYA por sistema y nivel de terminados. Los precios finales dependen de ubicación, acabados, instalaciones, placa, transporte y licencia.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-8">
          <!-- Plaqueta obra negra -->
          <div class="price-tier">
            <p class="price-tier__name">Plaqueta · obra negra</p>
            <p class="price-tier__price">$600K<small>/m²</small></p>
            <p class="text-xs text-gray-500 mb-3">Rango: $510K – $930K</p>
            <ul class="price-tier__list">
              <li>Estructura + muros + cubierta</li>
              <li>Sin acabados interiores</li>
              <li>Para autoconstrucción</li>
              <li>Más económico del mercado</li>
            </ul>
          </div>
          <!-- Plaqueta obra gris (featured) -->
          <div class="price-tier price-tier--featured">
            <p class="price-tier__name">Plaqueta · obra gris ⭐</p>
            <p class="price-tier__price">$1.15M<small>/m²</small></p>
            <p class="text-xs text-gray-500 mb-3">Rango: $980K – $1.78M</p>
            <ul class="price-tier__list">
              <li>Estructura + muros + cubierta</li>
              <li>Pañete + instalaciones básicas</li>
              <li>Listo para acabados finales</li>
              <li>Equilibrio precio/tiempo</li>
            </ul>
          </div>
          <!-- Plaquet a obra blanca -->
          <div class="price-tier">
            <p class="price-tier__name">Plaqueta · obra blanca</p>
            <p class="price-tier__price">$1.85M<small>/m²</small></p>
            <p class="text-xs text-gray-500 mb-3">Rango: $1.57M – $2.87M</p>
            <ul class="price-tier__list">
              <li>Llave en mano completa</li>
              <li>Acabados + baños + cocina</li>
              <li>Pintura + pisos + detalles</li>
              <li>Lista para habitar</li>
            </ul>
          </div>
          <!-- Paneles EPS obra gris -->
          <div class="price-tier">
            <p class="price-tier__name">EPS · obra gris</p>
            <p class="price-tier__price">$1.45M<small>/m²</small></p>
            <p class="text-xs text-gray-500 mb-3">Rango: $1.23M – $2.25M</p>
            <ul class="price-tier__list">
              <li>Paneles EPS + estructura</li>
              <li>Excelente aislamiento</li>
              <li>Listo para acabados</li>
            </ul>
          </div>
          <!-- Paneles EPS obra blanca (featured) -->
          <div class="price-tier price-tier--featured">
            <p class="price-tier__name">EPS · obra blanca ⭐</p>
            <p class="price-tier__price">$1.95M<small>/m²</small></p>
            <p class="text-xs text-gray-500 mb-3">Rango: $1.66M – $3.02M</p>
            <ul class="price-tier__list">
              <li>Llave en mano + aislamiento premium</li>
              <li>Acabados + baños + cocina</li>
              <li>La más eficiente energéticamente</li>
              <li>Mayor confort acústico</li>
            </ul>
          </div>
          <!-- Llamado a la acción -->
          <div class="price-tier" style="background: linear-gradient(180deg, #fffbeb 0%, #fff 100%); border-color: #fcd34d;">
            <p class="price-tier__name" style="color: #b45309;">Tu caso particular</p>
            <p class="text-2xl font-extrabold text-dark my-2">Precio exacto</p>
            <p class="text-xs text-gray-600 mb-4">Cotización real con tu municipio, m² y sistema</p>
            <a href="/cotizador-precios-casas-prefabricadas.html" class="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-amber-600 transition w-full">
              <i class="fas fa-calculator"></i> Cotizar ahora
            </a>
          </div>
        </div>

        <!-- Ejemplo para 80m² -->
        <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-xl p-6 sm:p-8">
          <h3 class="text-xl font-bold text-dark mb-4 text-center">Ejemplo real: casa de 80m² en Cundinamarca (obra gris)</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="stat-card">
              <p class="stat-card__num">80m²</p>
              <p class="stat-card__label">Área construida</p>
            </div>
            <div class="stat-card">
              <p class="stat-card__num">$92M</p>
              <p class="stat-card__label">Costo base (plaqueta gris)</p>
            </div>
            <div class="stat-card">
              <p class="stat-card__num">$108M</p>
              <p class="stat-card__label">Con acabados + instalación</p>
            </div>
            <div class="stat-card">
              <p class="stat-card__num">6 sem</p>
              <p class="stat-card__label">Tiempo de obra</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-4 text-center">
            *Referencia preliminar. No incluye transporte, licencia, ni movimientos de tierra específicos de tu lote.
          </p>
        </div>

        <div class="quick-answer-box max-w-4xl mx-auto mt-8">
          <h3>¿Cuánto cuesta una casa prefabricada completa en Colombia?</h3>
          <p>
            Para una casa de <strong>60-80m²</strong> con sistema de plaqueta o EPS en nivel <strong>obra gris</strong> (estructura + instalaciones, sin acabados finales), el rango real en 2026 es de <strong>$69M a $138M COP</strong>. Si la quieres llave en mano con acabados, baños y cocina instalados, el rango sube a <strong>$111M a $240M COP</strong> según tamaño y ubicación. <strong>CONCASAYA te da el número exacto en menos de 24h</strong> con tu municipio, m² y sistema.
          </p>
        </div>
      </div>
    </section>

    <!-- 4. Tiempos de construcción (AEO: ¿cuánto tarda?) -->
    <section id="seccion-tiempos" class="py-12 sm:py-16 bg-white">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mx-auto text-center mb-10">
          <p class="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">Tiempos reales</p>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            ¿Cuánto se demora construir una casa prefabricada?
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            Frente a la construcción tradicional (6-12 meses), las casas prefabricadas de CONCASAYA se entregan en <strong>4 a 8 semanas</strong> dependiendo del sistema y nivel de terminados.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-10">
          <div class="stat-card">
            <p class="stat-card__num">4 sem</p>
            <p class="stat-card__label">EPS llave en mano</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__num">5-6 sem</p>
            <p class="stat-card__label">Plaqueta obra gris</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__num">6-8 sem</p>
            <p class="stat-card__label">Plaqueta llave en mano</p>
          </div>
        </div>

        <div class="max-w-3xl mx-auto">
          <h3 class="text-2xl font-bold text-dark mb-6 text-center">Línea de tiempo típica (casa 80m²)</h3>
          <div class="timeline">
            <div class="timeline-item">
              <p class="timeline-item__week">Semana 1-2</p>
              <p class="timeline-item__title">Cimentación y placa</p>
              <p class="timeline-item__desc">Preparación del terreno, vaciado de placa de concreto, espera de fraguado (mínimo 7 días). Puedes usar este tiempo para avanzar temas de licencia.</p>
            </div>
            <div class="timeline-item">
              <p class="timeline-item__week">Semana 3-4</p>
              <p class="timeline-item__title">Estructura y muros</p>
              <p class="timeline-item__desc">Ensamblaje de paneles o plaquetas, instalaciones eléctricas e hidráulicas empotradas. Cierre de cubierta.</p>
            </div>
            <div class="timeline-item">
              <p class="timeline-item__week">Semana 5-6</p>
              <p class="timeline-item__title">Acabados</p>
              <p class="timeline-item__desc">Pañetes, pintura, pisos, instalación de baños y cocina. En obra gris te entregamos hasta aquí; en obra blanca seguimos.</p>
            </div>
            <div class="timeline-item">
              <p class="timeline-item__week">Semana 7-8</p>
              <p class="timeline-item__title">Entrega llave en mano</p>
              <p class="timeline-item__desc">Limpieza final, detalles, recorrido contigo, entrega de llaves y manuales. Listo para habitar.</p>
            </div>
          </div>
        </div>

        <div class="mt-8 max-w-4xl mx-auto bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <p class="text-sm text-amber-900">
            <i class="fas fa-info-circle mr-1"></i>
            <strong>Importante:</strong> estos tiempos no incluyen la licencia de construcción (que toma entre 2-8 semanas adicionales dependiendo del municipio). CONCASAYA te acompaña en todo el proceso.
          </p>
        </div>
      </div>
    </section>

    <!-- 5. Licencias y permisos (AEO: ¿necesito licencia?) -->
    <section id="seccion-licencias" class="py-12 sm:py-16 bg-gradient-to-b from-slate-50 to-white">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mx-auto text-center mb-10">
          <p class="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">Licencias y permisos</p>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            ¿Necesito licencia de construcción para mi casa prefabricada?
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            Sí, en la mayoría de los casos. La <strong>licencia de construcción</strong> es obligatoria para cualquier obra nueva, incluidas las casas prefabricadas. Te acompañamos en todo el trámite.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
          <!-- Cuándo SÍ requiere -->
          <div class="bg-white border-2 border-emerald-200 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-file-signature text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">Cuándo SÍ requiere licencia</h3>
            </div>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> Obra nueva en zona urbana</li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> Obra en suelo de expansión urbana</li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> Construcción mayor a 50m² en zona rural</li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> Cualquier intervención en suelo de protección</li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> Municipios con POT vigente que la exigen</li>
            </ul>
          </div>

          <!-- Cuándo NO requiere -->
          <div class="bg-white border-2 border-amber-200 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-info-circle text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">Cuándo puede no requerir</h3>
            </div>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2"><i class="fas fa-exclamation-triangle text-amber-600 mt-1 flex-shrink-0"></i> <span>Vivienda rural dispersa según Res. 1138/2024 (vivienda del propietario en suelo rural, hasta ciertos límites)</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-exclamation-triangle text-amber-600 mt-1 flex-shrink-0"></i> <span>Reparaciones menores y reforzamientos</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-exclamation-triangle text-amber-600 mt-1 flex-shrink-0"></i> <span>Algunos municipios en zonas sin POT vigente (verificar con la alcaldía)</span></li>
            </ul>
            <p class="text-xs text-amber-800 mt-3 bg-amber-50 p-2 rounded">
              <strong>Importante:</strong> estas excepciones son específicas. La recomendación general es SIEMPRE sacar licencia para evitar multas ($8.7M-$43.7M por m² según estrato) o problemas al vender.
            </p>
          </div>
        </div>

        <!-- Proceso CONCASAYA -->
        <div class="max-w-3xl mx-auto">
          <h3 class="text-2xl font-bold text-dark mb-4 text-center">Cómo CONCASAYA te acompaña</h3>
          <ol class="space-y-3 text-sm text-gray-700">
            <li class="flex items-start gap-3"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">1</span> <span><strong>Diagnóstico inicial gratuito:</strong> revisamos tu municipio, tipo de suelo y viabilidad.</span></li>
            <li class="flex items-start gap-3"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">2</span> <span><strong>Diseño arquitectónico:</strong> con un arquitecto matriculado que firma la solicitud.</span></li>
            <li class="flex items-start gap-3"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">3</span> <span><strong>Radicación ante la curaduría o alcaldía:</strong> CONCASAYA te acompaña en el proceso.</span></li>
            <li class="flex items-start gap-3"><span class="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">4</span> <span><strong>Seguimiento hasta la aprobación:</strong> tiempo típico 2-8 semanas según municipio.</span></li>
          </ol>
        </div>

        <div class="mt-8 text-center">
          <a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20necesito%20informaci%C3%B3n%20sobre%20la%20licencia%20de%20construcci%C3%B3n%20para%20mi%20proyecto%20en%20el%20municipio%20de..." target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-700 transition">
            <i class="fab fa-whatsapp"></i> Consulta sobre tu municipio
          </a>
        </div>
      </div>
    </section>

    <!-- 6. Garantía y respaldo legal -->
    <section id="seccion-garantia" class="py-12 sm:py-16 bg-white">
      <div class="container mx-auto px-4 sm:px-6">
        <div class="max-w-3xl mx-auto text-center mb-10">
          <p class="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest mb-2">Respaldo y garantía</p>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-dark mb-4">
            15 años construyendo casas prefabricadas con respaldo legal
          </h2>
          <p class="text-base sm:text-lg text-gray-600">
            CONCASAYA es una empresa colombiana formal, constituida en 2018, con cubrimiento nacional y todos los respaldos legales para tu tranquilidad.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
          <div class="stat-card">
            <p class="stat-card__num">10</p>
            <p class="stat-card__label">Años de experiencia</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__num">+12.000</p>
            <p class="stat-card__label">Proyectos entregados</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__num">825</p>
            <p class="stat-card__label">Municipios con cobertura</p>
          </div>
          <div class="stat-card">
            <p class="stat-card__num">98%</p>
            <p class="stat-card__label">Clientes satisfechos</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-shield-halved text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">Garantía estructural</h3>
            </div>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span><strong>10 años</strong> en estructura (cimentación, muros, cubierta)</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span><strong>5 años</strong> en instalaciones hidráulicas y eléctricas</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span><strong>1 año</strong> en acabados (pintura, pisos, grifería)</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span>Cubierta por <strong>póliza de cumplimiento</strong> con aseguradora</span></li>
            </ul>
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-file-contract text-xl"></i>
              </div>
              <h3 class="text-xl font-bold text-dark">Respaldo legal</h3>
            </div>
            <ul class="space-y-2 text-sm text-gray-700">
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span><strong>Persona jurídica</strong> — SAS constituida en 2018</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span><strong>RUT</strong> y cámara de comercio al día</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span><strong>Contrato formal</strong> con cronograma, alcance y garantías por escrito</span></li>
              <li class="flex items-start gap-2"><i class="fas fa-check text-emerald-600 mt-1 flex-shrink-0"></i> <span><strong>Factura electrónica</strong> y todos los respaldos tributarios</span></li>
            </ul>
          </div>
        </div>

        <div class="mt-10 max-w-3xl mx-auto bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center">
          <h3 class="text-xl sm:text-2xl font-bold text-dark mb-3">¿Quieres validar nuestra existencia legal?</h3>
          <p class="text-sm sm:text-base text-gray-700 mb-5">
            Somos una empresa formal con NIT activo. Puedes verificar nuestra razón social, representantes y estados financieros en los registros públicos.
          </p>
          <a href="https://wa.me/573142891018?text=Hola%20CONCASAYA%2C%20quiero%20validar%20su%20informaci%C3%B3n%20legal%20antes%20de%20contratar." target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition">
            <i class="fab fa-whatsapp"></i> Solicitar RUT y datos legales
          </a>
        </div>
      </div>
    </section>
`;

// Insertar el bloque de secciones justo antes de la sección de "ventajas"
const before = html.substring(0, insertPoint);
const after = html.substring(insertPoint);
// CSS se inyecta antes del </body> (no antes de la primera sección)
html = before + newSections + after;
console.log('✓ 5 secciones nuevas insertadas');

// Inyectar el CSS
const bodyClose = '</body>';
const bodyCloseIdx = html.lastIndexOf(bodyClose);
if (bodyCloseIdx < 0) { console.error('No encontré </body>'); process.exit(1); }
if (html.indexOf('=== Tablas comparativas ===') < 0) {
  html = html.substring(0, bodyCloseIdx) + newCss + '\n' + html.substring(bodyCloseIdx);
  console.log('✓ CSS inyectado');
}

writeFileSync(file, html, 'utf8');
console.log('\n✓ Parte 1C lista. 5 secciones nuevas: sistemas, precios, tiempos, licencias, garantía.');
