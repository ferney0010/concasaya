// Cotizador Encuesta - JavaScript Independiente
// Evita conflictos con otros scripts del sitio

(function() {
  'use strict';

  // Inicializar AOS
  if (typeof AOS !== 'undefined') {
    AOS.init();
  }

  function getUbicacionLabel(val) {
    if (!val) return val;
    if (val === 'bogota') return 'Bogotá';
    if (typeof window.MUNICIPIOS !== 'undefined') {
      var m = window.MUNICIPIOS.find(function(x) { return x.slug === val; });
      if (m) return m.nombre;
    }
    return val;
  }

  // Estado de la aplicación
  const appState = {
    currentQuestion: 0,
    answers: {},
    totalQuestions: 12,
    termsAccepted: false,
    visualContentMap: {
      // Tipo de vivienda
      'cabaña': 'assets/images/cabaña.webp',
      'casa-campestre': 'assets/images/campe1.webp',
      'casa-urbana': 'assets/images/casal1.webp',
      'bodega': 'assets/images/bodega1.webp',
      'oficina': 'assets/images/oficina.jpg',
      // Número de pisos
      '1-piso': 'assets/images/casal1.webp',
      '2-pisos': 'assets/images/casa2.webp',
      // Sistema constructivo
      'eps': 'assets/images/paneleps.webp',
      'plaqueta': 'assets/images/casal1.webp',
      // Nivel de acabados (usar imágenes genéricas)
      'obra-negra': 'assets/images/casal1.webp',
      'gris': 'assets/images/casa2.webp',
      'blanca': 'assets/images/campe1.webp',
    }
  };

  // Definición de preguntas
  const questions = [
    {
      id: 'tipo-vivienda',
      title: '¿Qué tipo de construcción necesitas?',
      subtitle: 'Selecciona el tipo de vivienda o espacio que deseas construir',
      type: 'radio',
      options: [
        { value: 'cabaña', label: 'Cabaña', icon: 'fas fa-home', description: 'Ideal para descanso y turismo' },
        { value: 'casa-campestre', label: 'Casa Campestre', icon: 'fas fa-tree', description: 'Vivienda en zona rural' },
        { value: 'casa-urbana', label: 'Casa Urbana', icon: 'fas fa-city', description: 'Vivienda en zona urbana' },
        { value: 'bodega', label: 'Bodega/Almacén', icon: 'fas fa-warehouse', description: 'Espacio de almacenamiento' },
        { value: 'oficina', label: 'Oficina/Comercial', icon: 'fas fa-briefcase', description: 'Espacio comercial u oficina' }
      ],
      hasVisual: true
    },
    {
      id: 'pisos',
      title: '¿Cuántos pisos necesitas?',
      subtitle: 'Elige la cantidad de niveles para tu construcción',
      type: 'radio',
      options: [
        { value: '1-piso', label: '1 Piso', icon: 'fas fa-layer-group', description: 'Construcción de un solo nivel' },
        { value: '2-pisos', label: '2 Pisos', icon: 'fas fa-layer-group', description: 'Construcción de dos niveles' }
      ],
      hasVisual: false
    },
    {
      id: 'area',
      title: '¿Cuál es el área construida que necesitas?',
      subtitle: 'Indica los metros cuadrados (m²) de construcción',
      type: 'range',
      min: 10,
      max: 500,
      step: 5,
      unit: 'm²',
      hasVisual: false,
      placeholder: 'Ej: 60 m²',
      defaultValue: 30
    },
    {
      id: 'sistema',
      title: '¿Qué sistema constructivo prefieres?',
      subtitle: 'Elige el tipo de construcción que mejor se adapte a tus necesidades',
      type: 'radio',
      options: [
        { 
          value: 'eps', 
          label: 'Paneles EPS', 
          icon: 'fas fa-cube', 
          description: 'Sistema estándar con paneles de EPS. Rápido y eficiente.' 
        },
        { 
          value: 'plaqueta', 
          label: 'Plaqueta de Concreto', 
          icon: 'fas fa-building', 
          description: 'Mayor resistencia y durabilidad.' 
        }
      ],
      hasVisual: false
    },
    {
      id: 'acabados',
      title: '¿Qué nivel de acabados deseas?',
      subtitle: 'Selecciona el nivel de acabados para tu construcción',
      type: 'radio',
      options: [
        { 
          value: 'obra-negra', 
          label: 'Obra Negra', 
          icon: 'fas fa-hammer', 
          description: 'Estructura sin acabados. Solo construcción básica.',
          availableFor: ['plaqueta'] // Solo disponible para plaqueta
        },
        { 
          value: 'gris', 
          label: 'Gris', 
          icon: 'fas fa-trowel', 
          description: 'Instalación de luz y pañete. Incluye redes eléctricas e hidráulicas.',
          availableFor: ['eps'] // Solo disponible para EPS
        }
      ],
      hasVisual: false
    },
    {
      id: 'ubicacion',
      title: '¿En qué municipio o ciudad será tu proyecto?',
      subtitle: 'La ubicación afecta los costos de transporte e instalación',
      type: 'datalist',
      options: (function() {
        var opts = [{ value: 'bogota', label: 'Bogotá' }];
        if (typeof window.MUNICIPIOS === 'undefined') {
          opts = opts.concat([
            { value: 'chia', label: 'Chía' }, { value: 'cajica', label: 'Cajicá' }, { value: 'cota', label: 'Cota' },
            { value: 'mosquera', label: 'Mosquera' }, { value: 'zipaquira', label: 'Zipaquirá' }, { value: 'sopo', label: 'Sopó' },
            { value: 'suba', label: 'Suba' }, { value: 'funza', label: 'Funza' }, { value: 'villadeleyva', label: 'Villa de Leyva' },
            { value: 'la-vega', label: 'La Vega' }, { value: 'madrid', label: 'Madrid' }, { value: 'tocancipa', label: 'Tocancipá' },
            { value: 'tunja', label: 'Tunja' }, { value: 'santa-marta', label: 'Santa Marta' }, { value: 'boyaca', label: 'Boyacá' },
            { value: 'barbosa', label: 'Barbosa' }, { value: 'choconta', label: 'Chocontá' }, { value: 'san-francisco', label: 'San Francisco' },
            { value: 'supata', label: 'Supatá' }, { value: 'pacho', label: 'Pacho' }, { value: 'puente-nacional', label: 'Puente Nacional' },
            { value: 'la-mesa', label: 'La Mesa' }, { value: 'mesitas-del-colegio', label: 'Mesitas del Colegio' }, { value: 'facatativa', label: 'Facatativá' },
            { value: 'sogamoso', label: 'Sogamoso' }, { value: 'firavitoba', label: 'Firavitoba' }, { value: 'valle-de-tenza', label: 'Valle de Tenza' },
            { value: 'velez', label: 'Vélez' }, { value: 'subachoque', label: 'Subachoque' }, { value: 'soacha', label: 'Soacha' },
            { value: 'guasca', label: 'Guasca' }, { value: 'sesquile', label: 'Sesquilé' }, { value: 'la-calera', label: 'La Calera' },
            { value: 'villeta', label: 'Villeta' }, { value: 'raquira', label: 'Ráquira' }, { value: 'chiquinquira', label: 'Chiquinquirá' }
          ]);
        } else {
          window.MUNICIPIOS.forEach(function(m) {
            opts.push({ value: m.slug, label: m.nombre });
          });
        }
        return opts;
      })(),
      hasVisual: false,
      placeholder: 'Escribe o selecciona el municipio'
    },
    {
      id: 'tipo-suelo',
      title: '¿Condición del terreno?',
      subtitle: 'La condición del terreno determina los requerimientos de construcción',
      type: 'radio',
      options: [
        { value: 'plan', label: 'Terreno Plano', icon: 'fas fa-layer-group', description: 'Terreno nivelado y plano' },
        { value: 'pendiente', label: 'Terreno en Pendiente', icon: 'fas fa-mountain', description: 'Terreno con inclinación' }
      ],
      hasVisual: false
    },
    {
      id: 'tiempo-entrega',
      title: '¿Cuándo te gustaría iniciar el proyecto?',
      subtitle: 'Esto nos ayuda a planificar la ejecución',
      type: 'radio',
      options: [
        { value: 'inmediato', label: 'Lo antes posible', icon: 'fas fa-clock', description: 'Inicio inmediato' },
        { value: '1-3-meses', label: '1 a 3 meses', icon: 'fas fa-calendar', description: 'En los próximos 3 meses' },
        { value: '3-6-meses', label: '3 a 6 meses', icon: 'fas fa-calendar-alt', description: 'Plazo medio' },
        { value: 'mas-6-meses', label: 'Más de 6 meses', icon: 'fas fa-calendar-check', description: 'Proyecto a futuro' }
      ],
      hasVisual: false
    },
    {
      id: 'presupuesto',
      title: '¿En que rango de inversión busca su proyecto?',
      subtitle: 'Selecciona el rango de inversión para tu proyecto',
      type: 'radio',
      options: [
        { value: '18-50', label: 'Entre 18 a 50 millones', icon: 'fas fa-dollar-sign', description: 'Rango de inversión inicial' },
        { value: '51-100', label: 'Entre 51 a 100', icon: 'fas fa-dollar-sign', description: 'Rango de inversión medio' },
        { value: 'otros', label: 'Otros precios', icon: 'fas fa-dollar-sign', description: 'Otro rango de inversión' }
      ],
      hasVisual: false
    },
    {
      id: 'terreno-propio',
      title: '¿Ya tienes el terreno?',
      subtitle: 'Necesitamos saber si el terreno está disponible',
      type: 'radio',
      options: [
        { value: 'si', label: 'Sí, ya tengo el terreno', icon: 'fas fa-check-circle', description: 'Terreno disponible y listo' },
        { value: 'buscando', label: 'Estoy buscando terreno', icon: 'fas fa-search', description: 'Aún no tengo terreno' },
        { value: 'evaluando', label: 'Estoy evaluando opciones', icon: 'fas fa-question-circle', description: 'En proceso de decisión' }
      ],
      hasVisual: false
    },
    {
      id: 'separar-proyecto',
      title: '¿Estarías interesado en separar tu proyecto con un anticipo?',
      subtitle: 'El valor del anticipo será abonado al precio final del proyecto',
      type: 'radio',
      options: [
        { value: 'si-separar', label: 'Sí, me interesa separar', icon: 'fas fa-hand-holding-usd', description: 'Quiero reservar mi proyecto' },
        { value: 'informacion', label: 'Quiero más información', icon: 'fas fa-info-circle', description: 'Necesito conocer los detalles' },
        { value: 'no-separar', label: 'No, prefiero esperar', icon: 'fas fa-pause-circle', description: 'No por el momento' }
      ],
      hasVisual: false
    },
    {
          id: 'contacto',
          title: 'Datos de contacto',
          subtitle: 'Completa tus datos para ver tu cotización personalizada',
          type: 'form',
          fields: [
            { id: 'nombre', label: 'Nombre Completo', type: 'text', required: true, placeholder: 'Ej: Juan Pérez' },
            { id: 'telefono', label: 'Teléfono', type: 'tel', required: true, placeholder: 'Ej: 3001234567' },
            { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Ej: juan@email.com' }
          ],
          hasVisual: false
        }
  ];

  // Mostrar modal de términos y condiciones
  function showTermsModal() {
    // Crear overlay y modal
    const overlay = document.createElement('div');
    overlay.id = 'terms-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative';
    modal.innerHTML = `
      <div class="text-center mb-4">
        <i class="fas fa-info-circle text-primary text-4xl mb-3"></i>
        <h3 class="text-xl font-bold text-dark mb-2">Cotizador Estimado</h3>
      </div>
      <p class="text-sm text-gray-600 mb-5 text-center leading-relaxed">
        Este cotizador te brinda un <strong>precio estimado aproximado</strong>. Los valores finales pueden variar según condiciones específicas de tu terreno y proyecto.
      </p>
      <label class="flex items-start cursor-pointer mb-4">
        <input 
          type="checkbox" 
          id="terms-checkbox"
          class="mt-1 mr-3 w-4 h-4 text-primary focus:ring-primary rounded cursor-pointer"
        />
        <span class="text-sm text-gray-700">Entiendo que este es un cálculo estimado y que los precios finales pueden variar</span>
      </label>
      <label class="flex items-start cursor-pointer mb-5">
        <input 
          type="checkbox" 
          id="dont-show-checkbox"
          class="mt-1 mr-3 w-4 h-4 text-primary focus:ring-primary rounded cursor-pointer"
        />
        <span class="text-sm text-gray-600">No volver a mostrar este mensaje</span>
      </label>
      <button
        id="accept-terms-btn"
        disabled
        class="w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed transition duration-300"
      >
        Continuar
      </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listeners
    const checkbox = document.getElementById('terms-checkbox');
    const dontShowCheckbox = document.getElementById('dont-show-checkbox');
    const acceptBtn = document.getElementById('accept-terms-btn');
    
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        acceptBtn.disabled = false;
        acceptBtn.className = 'w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition duration-300 transform hover:scale-105';
      } else {
        acceptBtn.disabled = true;
        acceptBtn.className = 'w-full px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed transition duration-300';
      }
    });
    
    acceptBtn.addEventListener('click', () => {
      if (checkbox.checked) {
        appState.termsAccepted = true;
        
        // Guardar preferencia de no mostrar de nuevo
        if (dontShowCheckbox.checked) {
          localStorage.setItem('cotizador-terms-dont-show', 'true');
        }
        
        overlay.remove();
        renderQuestion();
        updateProgress();
        setupEventListeners();
      }
    });
    
    // Prevenir cerrar haciendo clic fuera
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        // No cerrar al hacer clic fuera
      }
    });
  }

  // Reproducir sonido de éxito (tipo Duolingo)
  function playSuccessSound() {
    try {
      // Usar Web Audio API para generar un sonido agradable
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Crear oscilador para el sonido principal (tono agradable)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Conectar nodos
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configurar el sonido (tono tipo "ding" agradable)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Tono inicial
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1); // Bajar un poco
      
      // Configurar volumen (envelope)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volumen moderado
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15); // Fade out
      
      // Configurar tipo de onda (sine es más suave)
      oscillator.type = 'sine';
      
      // Reproducir
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
      // Limpiar recursos después de un tiempo
      setTimeout(() => {
        audioContext.close().catch(() => {});
      }, 200);
    } catch (error) {
      // Si hay algún error con el audio, simplemente no reproducir
      // No queremos que los errores de audio afecten la funcionalidad
      console.log('Audio no disponible');
    }
  }

  // Inicializar aplicación
  function initApp() {
    // Verificar si el usuario prefirió no ver el modal de nuevo
    const dontShowAgain = localStorage.getItem('cotizador-terms-dont-show') === 'true';
    
    if (dontShowAgain) {
      // Si el usuario marcó "no volver a mostrar", aceptar automáticamente
      appState.termsAccepted = true;
      renderQuestion();
      updateProgress();
      setupEventListeners();
    } else if (!appState.termsAccepted) {
      showTermsModal();
      return;
    } else {
      renderQuestion();
      updateProgress();
      setupEventListeners();
    }
  }

  // Renderizar pregunta actual
  function renderQuestion() {
    const question = questions[appState.currentQuestion];
    const container = document.getElementById('questions-container');
    
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';

    // Crear estructura de pregunta
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-container active';
    questionDiv.id = `question-${appState.currentQuestion}`;

    // Verificar si hay una respuesta seleccionada para mostrar la imagen visual
    const hasSelectedAnswer = question.hasVisual && appState.answers[question.id];
    const selectedValue = hasSelectedAnswer ? appState.answers[question.id] : null;
    const imageSrc = selectedValue ? (appState.visualContentMap[selectedValue] || 'assets/images/casal1.webp') : null;
    
    let questionHTML = `
      <div>
        <h2 class="text-4xl md:text-5xl font-bold text-dark mb-3 mt-4">${question.title}</h2>
        <p class="text-base text-gray-600 mb-6">${question.subtitle}</p>
    `;

    // Renderizar según tipo de pregunta
    if (question.type === 'radio') {
      questionHTML += '<div class="space-y-3">';
      
      // Filtrar opciones según el sistema constructivo si es la pregunta de acabados
      let availableOptions = question.options;
      if (question.id === 'acabados') {
        const sistemaSeleccionado = appState.answers.sistema;
        if (sistemaSeleccionado === 'eps') {
          // Si se seleccionó EPS, solo mostrar obra gris
          availableOptions = question.options.filter(opt => 
            opt.availableFor && opt.availableFor.includes('eps')
          );
          // Si ya había seleccionado obra-negra, limpiar esa selección
          if (appState.answers.acabados === 'obra-negra') {
            appState.answers.acabados = '';
          }
        } else if (sistemaSeleccionado === 'plaqueta') {
          // Para plaqueta, solo mostrar obra negra
          availableOptions = question.options.filter(opt => 
            opt.availableFor && opt.availableFor.includes('plaqueta')
          );
          // Si ya había seleccionado gris o blanca, limpiar esa selección
          if (appState.answers.acabados === 'gris' || appState.answers.acabados === 'blanca') {
            appState.answers.acabados = '';
          }
        }
      }
      
      availableOptions.forEach((option, index) => {
        const isSelected = appState.answers[question.id] === option.value;
        questionHTML += `
          <div 
            class="option-card p-4 bg-white rounded-xl border-2 ${isSelected ? 'selected border-primary' : 'border-gray-200'} shadow-md transition-all duration-200"
            data-value="${option.value}"
            onclick="CotizadorEncuesta.selectOption('${question.id}', '${option.value}')"
          >
            <div class="flex items-start">
              <div class="flex-shrink-0 mr-3">
                <i class="${option.icon} text-lg text-primary"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-dark mb-1">${option.label}</h3>
                <p class="text-gray-600 text-xs">${option.description}</p>
              </div>
              ${isSelected ? '<i class="fas fa-check-circle text-primary text-lg ml-2"></i>' : ''}
            </div>
          </div>
        `;
        
        // Mostrar imagen justo debajo de la opción seleccionada
        if (isSelected && question.hasVisual && imageSrc) {
          questionHTML += `
            <div class="visual-content mt-4 mb-4 animate-fadeIn">
              <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <img 
                  src="${imageSrc}" 
                  alt="${option.label}"
                  class="w-full h-auto object-cover max-h-64 md:max-h-80"
                  id="visual-image-${appState.currentQuestion}"
                  onerror="this.src='assets/images/casal1.webp'"
                />
              </div>
            </div>
          `;
        }
      });
      
      // Mostrar mensaje informativo según el sistema seleccionado
      if (question.id === 'acabados') {
        const sistemaSeleccionado = appState.answers.sistema;
        if (sistemaSeleccionado === 'eps') {
          questionHTML += `
            <div class="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mt-4">
              <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-600 text-lg mr-3 mt-1"></i>
                <div>
                  <p class="text-sm text-blue-800 font-semibold mb-1">Importante sobre EPS</p>
                  <p class="text-xs text-blue-700">El sistema EPS se cotiza únicamente en obra gris, incluyendo pañete, redes eléctricas e hidráulicas.</p>
                  <p class="text-xs text-blue-700 mt-2"><strong>¿Deseas cotizar acabados?</strong> Si necesitas cotizar acabados adicionales, por favor escríbenos por WhatsApp o agenda una videollamada.</p>
                </div>
              </div>
            </div>
          `;
        } else if (sistemaSeleccionado === 'plaqueta') {
          questionHTML += `
            <div class="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mt-4">
              <div class="flex items-start">
                <i class="fas fa-info-circle text-blue-600 text-lg mr-3 mt-1"></i>
                <div>
                  <p class="text-sm text-blue-800 font-semibold mb-1">Importante sobre Plaqueta</p>
                  <p class="text-xs text-blue-700">El sistema de Plaqueta se cotiza únicamente en obra negra (estructura sin acabados).</p>
                  <p class="text-xs text-blue-700 mt-2"><strong>¿Deseas cotizar acabados?</strong> Si necesitas cotizar acabados adicionales, por favor escríbenos por WhatsApp o agenda una videollamada.</p>
                </div>
              </div>
            </div>
          `;
        }
      }
      
      questionHTML += '</div>';
    } else if (question.type === 'select') {
      questionHTML += `
        <select 
          id="select-${question.id}"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base"
          onchange="CotizadorEncuesta.selectOption('${question.id}', this.value)"
        >
          <option value="">Selecciona una opción</option>
          ${question.options.map(opt => `
            <option value="${opt.value}" ${appState.answers[question.id] === opt.value ? 'selected' : ''}>${opt.label}</option>
          `).join('')}
        </select>
      `;
    } else if (question.type === 'datalist') {
      const currentValue = appState.answers[question.id] || '';
      const currentLabel = question.options.find(opt => opt.value === currentValue)?.label || currentValue;
      // Ordenar opciones alfabéticamente por label
      const sortedOptions = [...question.options].sort((a, b) => {
        return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
      });
      questionHTML += `
        <div class="space-y-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <i class="fas fa-map-marker-alt text-primary text-lg"></i>
            </div>
            <input
              type="text"
              id="input-${question.id}"
              list="datalist-${question.id}"
              value="${currentLabel}"
              placeholder="${question.placeholder || 'Escribe o selecciona el municipio'}"
              class="w-full pl-12 pr-12 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base bg-white shadow-sm hover:border-gray-400 transition-colors duration-200"
              oninput="CotizadorEncuesta.updateDatalistInput('${question.id}', this.value)"
              onchange="CotizadorEncuesta.updateDatalistInput('${question.id}', this.value)"
              onfocus="CotizadorEncuesta.showDatalistDropdown('${question.id}')"
              autocomplete="off"
            />
            <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
              <i class="fas fa-chevron-down text-gray-400 text-sm"></i>
            </div>
            <div id="dropdown-${question.id}" class="hidden absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto" style="top: calc(100% + 0.5rem);">
              ${sortedOptions.map(opt => `
                <button
                  type="button"
                  class="w-full text-left px-4 py-3 hover:bg-primary hover:text-white transition-colors duration-150 flex items-center"
                  onclick="CotizadorEncuesta.selectDatalistOption('${question.id}', '${opt.value}', '${opt.label.replace(/'/g, "\\'")}')"
                >
                  <i class="fas fa-map-marker-alt mr-3 text-gray-400"></i>
                  <span>${opt.label}</span>
                </button>
              `).join('')}
            </div>
          </div>
          <datalist id="datalist-${question.id}">
            ${sortedOptions.map(opt => `
              <option value="${opt.label}" data-value="${opt.value}">${opt.label}</option>
            `).join('')}
          </datalist>
          <p class="text-xs text-gray-500 mt-2">
            <i class="fas fa-info-circle mr-1"></i>
            Puedes escribir el nombre del municipio o seleccionarlo de la lista (${sortedOptions.length} municipios disponibles)
          </p>
        </div>
      `;
    } else if (question.type === 'range') {
      // Inicializar el valor si no existe
      if (appState.answers[question.id] === undefined) {
        // Usar defaultValue si existe, sino usar el mínimo
        appState.answers[question.id] = question.defaultValue !== undefined ? question.defaultValue : question.min;
      }
      const defaultValue = question.defaultValue !== undefined ? question.defaultValue : question.min;
      const currentValue = appState.answers[question.id] || defaultValue;
      questionHTML += `
        <div class="space-y-4">
          <div class="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-md">
            <div class="relative py-4">
              <div class="flex justify-between text-sm text-gray-600 mb-6">
                <span>${question.min} ${question.unit}</span>
                <span>${question.max} ${question.unit}</span>
              </div>
              <div class="relative">
                <input 
                  type="range" 
                  id="range-${question.id}"
                  min="${question.min}" 
                  max="${question.max}" 
                  step="${question.step}"
                  value="${currentValue}"
                  class="range-slider w-full"
                  oninput="CotizadorEncuesta.updateRange('${question.id}', this.value)"
                  style="position: relative; z-index: 2;"
                />
                <div id="range-tooltip-${question.id}" class="absolute pointer-events-none" style="bottom: 100%; transform: translateX(-50%); left: ${((currentValue - question.min) / (question.max - question.min)) * 100}%; margin-bottom: 8px;">
                  <div class="bg-primary text-white px-3 py-1 rounded-lg shadow-lg whitespace-nowrap">
                    <span class="text-lg font-bold" id="range-value-${question.id}">${currentValue}</span>
                    <span class="text-xs ml-1">${question.unit}</span>
                  </div>
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (question.type === 'checkbox') {
      questionHTML += '<div class="space-y-3">';
      question.options.forEach(option => {
        const isChecked = (appState.answers[question.id] || []).includes(option.value);
        questionHTML += `
          <label class="option-card flex items-center p-6 bg-white rounded-xl border-2 ${isChecked ? 'selected border-primary' : 'border-gray-200'} shadow-md cursor-pointer">
            <input 
              type="checkbox" 
              value="${option.value}"
              class="w-5 h-5 text-primary focus:ring-primary rounded"
              ${isChecked ? 'checked' : ''}
              onchange="CotizadorEncuesta.toggleCheckbox('${question.id}', '${option.value}')"
            />
            <i class="${option.icon} text-xl text-primary ml-4 mr-4"></i>
            <span class="text-lg font-semibold text-dark flex-1">${option.label}</span>
          </label>
        `;
      });
      questionHTML += '</div>';
    } else if (question.type === 'form') {
      // Mensaje motivador antes del formulario de contacto
      questionHTML += `
        <div class="bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary rounded-lg p-6 mb-6">
          <div class="flex items-start">
            <i class="fas fa-lock text-primary text-2xl mr-4 mt-1"></i>
            <div>
              <h3 class="text-lg font-bold text-dark mb-2">¡Estás a un paso de ver tu cotización!</h3>
              <p class="text-gray-700 text-sm mb-2">Completa tus datos de contacto para <strong>desbloquear tu cotización personalizada</strong> con el precio estimado de tu proyecto.</p>
              <p class="text-gray-600 text-xs"><i class="fas fa-shield-alt mr-1"></i> Tus datos están seguros. Los usaremos únicamente para contactarte sobre tu proyecto y enviarte información relevante.</p>
            </div>
          </div>
        </div>
      `;
      
      questionHTML += '<div class="space-y-3">';
      question.fields.forEach(field => {
        let validationAttr = '';
        if (field.type === 'tel') {
          validationAttr = 'pattern="[0-9]{10,15}" title="Ingresa un número de teléfono válido (10-15 dígitos)"';
        } else if (field.type === 'email') {
          validationAttr = 'pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" title="Ingresa un email válido"';
        }
        
        questionHTML += `
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">${field.label}${field.required ? ' *' : ''}</label>
            <input 
              type="${field.type}"
              id="field-${field.id}"
              ${field.required ? 'required' : ''}
              ${validationAttr}
              placeholder="${field.placeholder}"
              value="${appState.answers[field.id] || ''}"
              onchange="CotizadorEncuesta.updateFormField('${field.id}', this.value)"
              onblur="CotizadorEncuesta.validateField('${field.id}', this)"
              class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-lg transition-colors"
            />
            <span class="error-message" id="error-${field.id}">Por favor completa este campo correctamente</span>
          </div>
        `;
      });
      questionHTML += '</div>';
    }

    questionHTML += '</div>';
    questionDiv.innerHTML = questionHTML;
    container.appendChild(questionDiv);
    
    // Actualizar botones después de renderizar
    updateBackButton();
    updateNextButton();
  }

  // Avanzar a la siguiente pregunta
  function nextQuestion() {
    const question = questions[appState.currentQuestion];
    if (!question) return;
    
    // No avanzar si es una pregunta de tipo form (contacto)
    if (question.type === 'form') {
      return;
    }
    
    // Verificar que hay una respuesta válida
    let isValid = false;
    if (question.type === 'checkbox') {
      isValid = appState.answers[question.id] && appState.answers[question.id].length > 0;
    } else if (question.type === 'range') {
      isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== null && appState.answers[question.id] !== '';
    } else {
      isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== '';
    }
    
    if (!isValid) return;
    
    // Animación de salida
    const currentContainer = document.querySelector('.question-container.active');
    if (currentContainer) {
      currentContainer.classList.add('fade-out');
    }
    
    setTimeout(() => {
      if (appState.currentQuestion < appState.totalQuestions - 1) {
        appState.currentQuestion++;
        renderQuestion();
        updateProgress();
        updateBackButton();
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Es la última pregunta - enviar por WhatsApp primero
        sendToWhatsApp();
        setTimeout(() => {
          showResults();
        }, 500);
      }
    }, 200);
  }

  // Seleccionar opción
  function selectOption(questionId, value) {
    // Verificar que estamos en la pregunta correcta
    if (questionId !== questions[appState.currentQuestion].id) return;
    
    // No avanzar si el valor está vacío (para selects)
    if (!value || value.trim() === '') return;
    
    appState.answers[questionId] = value;
    
    // Si se cambia el sistema constructivo, limpiar acabados si no son compatibles
    if (questionId === 'sistema') {
      if (value === 'eps' && (appState.answers.acabados === 'obra-negra' || appState.answers.acabados === 'blanca')) {
        appState.answers.acabados = '';
      } else if (value === 'plaqueta' && (appState.answers.acabados === 'gris' || appState.answers.acabados === 'blanca')) {
        appState.answers.acabados = '';
      }
    }
    
    // Agregar animación sutil de "procesando" a la opción seleccionada
    const selectedCard = document.querySelector(`[data-value="${value}"]`);
    if (selectedCard) {
      selectedCard.style.transform = 'scale(0.97)';
      selectedCard.style.transition = 'all 0.2s ease';
    }
    
    // Re-renderizar para mostrar la imagen debajo de la opción seleccionada
    // Si cambió el sistema, también re-renderizar la pregunta de acabados si ya se había respondido
    renderQuestion();
    
    // Si cambió el sistema y ya se había respondido acabados, re-renderizar también esa pregunta
    if (questionId === 'sistema' && appState.answers.acabados) {
      // La pregunta de acabados se re-renderizará cuando se llegue a ella
    }
    
    updateNextButton();
    
    // Scroll automático al botón "Siguiente" después de seleccionar
    setTimeout(() => {
      const btnNext = document.getElementById('btn-next');
      if (btnNext) {
        btnNext.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 300);
  }

  // Actualizar rango
  function updateRange(questionId, value) {
    appState.answers[questionId] = parseInt(value);
    const question = questions.find(q => q.id === questionId);
    const displayElement = document.getElementById(`range-value-${questionId}`);
    const tooltipElement = document.getElementById(`range-tooltip-${questionId}`);
    const rangeInput = document.getElementById(`range-${questionId}`);
    
    if (displayElement) {
      displayElement.textContent = value;
    }
    
    // Actualizar posición del tooltip
    if (tooltipElement && rangeInput && question) {
      const percentage = ((parseInt(value) - question.min) / (question.max - question.min)) * 100;
      tooltipElement.style.left = percentage + '%';
    }
    
    // Actualizar el botón siguiente después de cambiar el rango
    updateNextButton();
  }

  // Mostrar dropdown personalizado
  function showDatalistDropdown(questionId) {
    const dropdown = document.getElementById(`dropdown-${questionId}`);
    const input = document.getElementById(`input-${questionId}`);
    if (dropdown && input) {
      dropdown.classList.remove('hidden');
      // Filtrar opciones según el texto ingresado
      filterDatalistOptions(questionId, input.value);
    }
  }

  // Filtrar opciones del dropdown
  function filterDatalistOptions(questionId, searchText) {
    const dropdown = document.getElementById(`dropdown-${questionId}`);
    if (!dropdown) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const sortedOptions = [...question.options].sort((a, b) => {
      return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
    });

    const filteredOptions = sortedOptions.filter(opt => 
      opt.label.toLowerCase().includes(searchText.toLowerCase())
    );

    dropdown.innerHTML = filteredOptions.map(opt => `
      <button
        type="button"
        class="w-full text-left px-4 py-3 hover:bg-primary hover:text-white transition-colors duration-150 flex items-center"
        onclick="CotizadorEncuesta.selectDatalistOption('${questionId}', '${opt.value}', '${opt.label.replace(/'/g, "\\'")}')"
      >
        <i class="fas fa-map-marker-alt mr-3 text-gray-400"></i>
        <span>${opt.label}</span>
      </button>
    `).join('');

    if (filteredOptions.length === 0) {
      dropdown.innerHTML = `
        <div class="px-4 py-3 text-gray-500 text-sm">
          No se encontraron municipios. Puedes escribir el nombre manualmente.
        </div>
      `;
    }
  }

  // Seleccionar opción del datalist
  function selectDatalistOption(questionId, value, label) {
    appState.answers[questionId] = value;
    const input = document.getElementById(`input-${questionId}`);
    const dropdown = document.getElementById(`dropdown-${questionId}`);
    
    if (input) {
      input.value = label;
    }
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
    
    updateNextButton();
    
    // Ocultar dropdown al hacer clic fuera
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest(`#input-${questionId}`) && !e.target.closest(`#dropdown-${questionId}`)) {
          if (dropdown) dropdown.classList.add('hidden');
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 100);
  }

  // Actualizar input con datalist
  function updateDatalistInput(questionId, inputValue) {
    const dropdown = document.getElementById(`dropdown-${questionId}`);
    if (dropdown) {
      dropdown.classList.remove('hidden');
      filterDatalistOptions(questionId, inputValue);
    }

    if (!inputValue || inputValue.trim() === '') {
      appState.answers[questionId] = '';
      updateNextButton();
      return;
    }

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Buscar si el valor ingresado coincide con alguna opción
    const matchingOption = question.options.find(opt => 
      opt.label.toLowerCase() === inputValue.toLowerCase().trim()
    );

    if (matchingOption) {
      // Si coincide con una opción, usar el value de la opción
      appState.answers[questionId] = matchingOption.value;
    } else {
      // Si no coincide, guardar el valor manual ingresado
      appState.answers[questionId] = inputValue.trim();
    }

    updateNextButton();
  }

  // Toggle checkbox
  function toggleCheckbox(questionId, value) {
    if (!appState.answers[questionId]) {
      appState.answers[questionId] = [];
    }
    const index = appState.answers[questionId].indexOf(value);
    if (index > -1) {
      appState.answers[questionId].splice(index, 1);
    } else {
      appState.answers[questionId].push(value);
    }
    renderQuestion();
  }

  // Actualizar campo de formulario
  function updateFormField(fieldId, value) {
    appState.answers[fieldId] = value;
    
    // Remover mensaje de error si existe cuando se completan todos los campos
    const errorMsg = document.querySelector('.error-contact-message');
    const nombre = appState.answers.nombre && appState.answers.nombre.trim();
    const telefono = appState.answers.telefono && appState.answers.telefono.trim();
    const email = appState.answers.email && appState.answers.email.trim();
    
    if (errorMsg && nombre && telefono && email) {
      errorMsg.style.display = 'none';
    }
    
    // Remover borde rojo cuando se completa el campo
    const field = document.getElementById(`field-${fieldId}`);
    if (field && value.trim()) {
      field.classList.remove('border-red-500');
      const errorElement = document.getElementById(`error-${fieldId}`);
      if (errorElement) {
        errorElement.classList.remove('show');
      }
    }
    
    updateNextButton();
  }

  // Validar campo
  function validateField(fieldId, element) {
    const errorElement = document.getElementById(`error-${fieldId}`);
    if (!errorElement) return true;
    
    if (element.required && !element.value.trim()) {
      errorElement.classList.add('show');
      element.classList.add('border-red-500');
      element.classList.remove('border-green-500');
      return false;
    } else if (element.validity && !element.validity.valid) {
      errorElement.classList.add('show');
      element.classList.add('border-red-500');
      element.classList.remove('border-green-500');
      return false;
    } else {
      errorElement.classList.remove('show');
      element.classList.remove('border-red-500');
      if (element.value.trim()) {
        element.classList.add('border-green-500');
      }
      return true;
    }
  }

  // Actualizar barra de progreso
  function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    
    if (progressBar && progressPercent) {
      const progress = ((appState.currentQuestion + 1) / appState.totalQuestions) * 100;
      progressBar.style.width = progress + '%';
      progressPercent.textContent = Math.round(progress) + '%';
    }
  }

  // Actualizar botón siguiente
  function updateNextButton() {
    const btnNext = document.getElementById('btn-next');
    if (!btnNext) return;
    
    const question = questions[appState.currentQuestion];
    let isValid = false;

    if (question.type === 'form') {
      isValid = question.fields.every(field => {
        if (field.required) {
          return appState.answers[field.id] && appState.answers[field.id].trim() !== '';
        }
        return true;
      });
    } else if (question.type === 'checkbox') {
      isValid = appState.answers[question.id] && appState.answers[question.id].length > 0;
    } else if (question.type === 'range') {
      // Para range, el valor siempre está inicializado (valor mínimo por defecto)
      isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== null && appState.answers[question.id] !== '';
    } else if (question.type === 'datalist') {
      isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== null && appState.answers[question.id] !== '' && appState.answers[question.id].trim() !== '';
    } else {
      isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== '' && appState.answers[question.id] !== null;
    }

    // Cambiar texto del botón si es la última pregunta
    const isLastQuestion = appState.currentQuestion === appState.totalQuestions - 1;
    if (isLastQuestion && question.type === 'form') {
      const span = btnNext.querySelector('span');
      const icon = btnNext.querySelector('i');
      if (span) {
        span.textContent = isValid ? 'Ver mi Cotización' : 'Completa tus datos';
        if (icon) {
          icon.className = isValid ? 'fas fa-unlock ml-2' : 'fas fa-arrow-right ml-2';
        }
      } else {
        // Si no tiene span, crear uno
        btnNext.innerHTML = isValid 
          ? '<span>Ver mi Cotización</span><i class="fas fa-unlock ml-2"></i>' 
          : '<span>Completa tus datos</span><i class="fas fa-arrow-right ml-2"></i>';
      }
    } else {
      // Restaurar texto normal si no es la última pregunta
      const span = btnNext.querySelector('span');
      if (!span || span.textContent !== 'Siguiente') {
        btnNext.innerHTML = '<span>Siguiente</span><i class="fas fa-arrow-right ml-2"></i>';
      }
    }

    if (isValid) {
      btnNext.disabled = false;
      btnNext.classList.remove('opacity-50', 'cursor-not-allowed');
      btnNext.classList.add('btn-next-animate');
    } else {
      btnNext.disabled = true;
      btnNext.classList.add('opacity-50', 'cursor-not-allowed');
      btnNext.classList.remove('btn-next-animate');
    }
  }

  // Configurar event listeners (solo una vez)
  let listenersSetup = false;
  function setupEventListeners() {
    if (listenersSetup) return;
    
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');
    
    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const question = questions[appState.currentQuestion];
        if (!question) return;
        
        let isValid = false;

        if (question.type === 'form') {
          isValid = question.fields.every(field => {
            if (field.required) {
              return appState.answers[field.id] && appState.answers[field.id].trim() !== '';
            }
            return true;
          });
        } else if (question.type === 'checkbox') {
          isValid = appState.answers[question.id] && appState.answers[question.id].length > 0;
        } else if (question.type === 'range') {
          // Para range, el valor siempre está inicializado (valor mínimo por defecto)
          isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== null && appState.answers[question.id] !== '';
        } else if (question.type === 'datalist') {
          isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== null && appState.answers[question.id] !== '' && appState.answers[question.id].trim() !== '';
        } else {
          isValid = appState.answers[question.id] !== undefined && appState.answers[question.id] !== '' && appState.answers[question.id] !== null;
        }

        if (isValid) {
          // Validar campos de formulario si es la última pregunta
          if (question.type === 'form') {
            let formValid = true;
            question.fields.forEach(field => {
              if (field.required) {
                const fieldElement = document.getElementById(`field-${field.id}`);
                if (fieldElement && !validateField(field.id, fieldElement)) {
                  formValid = false;
                }
              }
            });
            if (!formValid) {
              return;
            }
          }

          // Reproducir sonido de éxito
          playSuccessSound();

          // Avanzar a la siguiente pregunta o mostrar resultados
          if (appState.currentQuestion < appState.totalQuestions - 1) {
            // Animación de salida
            const currentContainer = document.querySelector('.question-container.active');
            if (currentContainer) {
              currentContainer.classList.add('fade-out');
            }
            
            setTimeout(() => {
              appState.currentQuestion++;
              renderQuestion();
              updateProgress();
              updateNextButton();
              updateBackButton();
              
              // Scroll suave al inicio de la pregunta
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 200);
          } else {
            // Es la última pregunta (contacto) - enviar por WhatsApp primero
            sendToWhatsApp();
            // Luego mostrar resultados
            setTimeout(() => {
              showResults();
            }, 500);
          }
        } else {
          // Mostrar mensaje de validación
          const questionContainer = document.querySelector('.question-container.active');
          if (questionContainer) {
            questionContainer.style.animation = 'shake 0.5s';
            setTimeout(() => {
              questionContainer.style.animation = '';
            }, 500);
          }
        }
      });
    }

    if (btnBack) {
      btnBack.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (appState.currentQuestion > 0) {
          appState.currentQuestion--;
          renderQuestion();
          updateProgress();
          updateNextButton();
          updateBackButton();
        }
      });
    }
    
    listenersSetup = true;
  }

  // Actualizar botón atrás
  function updateBackButton() {
    const btnBack = document.getElementById('btn-back');
    if (!btnBack) return;
    
    if (appState.currentQuestion > 0) {
      btnBack.classList.remove('hidden');
    } else {
      btnBack.classList.add('hidden');
    }
  }

  // Calcular precio estimado
  function calculatePrice() {
    // Nueva tabla de precios por m² según sistema constructivo, pisos y acabados
    const preciosPorM2 = {
      'plaqueta': {
        '1-piso': {
          'obra-negra': 600000,
          'gris': 1150000,
          'blanca': 1850000
        },
        '2-pisos': {
          'obra-negra': 700000,
          'gris': 1400000,
          'blanca': 2350000
        }
      },
      'eps': {
        '1-piso': {
          'gris': 1450000,
          'blanca': 1950000
        },
        '2-pisos': {
          'gris': 2950000,
          'blanca': 3450000
        }
      }
    };

    const multiplicadoresTipo = {
      cabaña: 0.9,
      'casa-campestre': 1.0,
      'casa-urbana': 1.1,
      bodega: 0.85,
      oficina: 1.05,
    };

    const costosInstalaciones = {
      electrica: 500000,
      hidraulica: 400000,
      sanitaria: 600000,
      gas: 300000,
    };

    // Costos de preparación de terreno eliminados - ya no se incluyen en la cotización

    const multiplicadoresUbicacion = {
      bogota: 1.0,
      boyaca: 1.2,
      cajica: 1.05,
      chia: 1.05,
      choconta: 1.12,
      cota: 1.08,
      facatativa: 1.08,
      funza: 1.05,
      'la-mesa': 1.1,
      'la-vega': 1.12,
      madrid: 1.1,
      'mesitas-del-colegio': 1.1,
      mosquera: 1.05,
      pacho: 1.15,
      'san-francisco': 1.15,
      'santa-marta': 1.2,
      sogamoso: 1.25,
      sopo: 1.08,
      suba: 1.0,
      supata: 1.15,
      tocancipa: 1.1,
      'villa-de-leyva': 1.15,
      villadeleyva: 1.15,
      zipaquira: 1.08,
      barbosa: 1.2,
      firavitoba: 1.25,
      'valle-de-tenza': 1.2,
      velez: 1.25,
      subachoque: 1.08,
      soacha: 1.02,
      guasca: 1.1,
      sesquile: 1.1,
      'la-calera': 1.1,
      villeta: 1.15,
      raquira: 1.2,
      chiquinquira: 1.2,
      tunja: 1.25,
      'puente-nacional': 1.25,
    };

    const sistema = appState.answers.sistema || 'eps';
    const area = parseInt(appState.answers.area) || 60;
    const tipoVivienda = appState.answers['tipo-vivienda'] || 'casa-campestre';
    const acabados = appState.answers.acabados || (sistema === 'eps' ? 'gris' : 'obra-negra');
    const pisos = appState.answers.pisos || '1-piso';
    const ubicacion = appState.answers.ubicacion || 'bogota';
    const instalaciones = appState.answers.instalaciones || [];

    // Obtener precio por m² según sistema, pisos y acabados
    // Si es EPS y se seleccionó obra-negra (no debería pasar, pero por seguridad), usar gris
    let acabadosParaCalcular = acabados;
    if (sistema === 'eps' && acabados === 'obra-negra') {
      acabadosParaCalcular = 'gris';
    }
    const precioM2 = preciosPorM2[sistema]?.[pisos]?.[acabadosParaCalcular] || preciosPorM2['eps']['1-piso']['gris'];
    
    // Calcular precio base multiplicando precio por m² por el área
    let precioBase = precioM2 * area;
    
    // Aplicar multiplicadores de tipo de vivienda y ubicación
    precioBase *= multiplicadoresTipo[tipoVivienda] || 1.0;
    precioBase *= multiplicadoresUbicacion[ubicacion] || 1.2;

    let costoInstalaciones = 0;
    instalaciones.forEach(inst => {
      costoInstalaciones += costosInstalaciones[inst] || 0;
    });

    // Costos de preparación de terreno ya no se incluyen en la cotización
    const precioTotal = precioBase + costoInstalaciones;

    return {
      total: precioTotal,
      base: precioBase,
      instalaciones: costoInstalaciones,
      terreno: 0 // Ya no se incluyen costos de preparación de terreno
    };
  }

  // Mostrar resultados
  function showResults() {
    // Validar que todos los datos de contacto estén completos
    const nombre = appState.answers.nombre;
    const telefono = appState.answers.telefono;
    const email = appState.answers.email;
    
    if (!nombre || !nombre.trim() || !telefono || !telefono.trim() || !email || !email.trim()) {
      // Si faltan datos de contacto, mostrar mensaje de error
      const questionContainer = document.querySelector('.question-container.active');
      if (questionContainer) {
        questionContainer.style.animation = 'shake 0.5s';
        setTimeout(() => {
          questionContainer.style.animation = '';
        }, 500);
      }
      
      // Mostrar mensaje de error
      let errorMsg = document.querySelector('.error-contact-message');
      const questionDiv = document.querySelector('#question-' + appState.currentQuestion);
      const formContainer = questionDiv ? questionDiv.querySelector('.space-y-4') : null;
      
      if (!errorMsg && formContainer) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-contact-message bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded';
        formContainer.parentElement.insertBefore(errorMsg, formContainer);
      }
      
      if (errorMsg) {
        errorMsg.innerHTML = '<p class="font-semibold"><i class="fas fa-exclamation-circle mr-2"></i>Por favor completa todos los campos requeridos (Nombre, Teléfono y Email) para desbloquear tu cotización personalizada.</p>';
        errorMsg.style.display = 'block';
      }
      
      // Resaltar campos faltantes
      if (!nombre || !nombre.trim()) {
        const nombreField = document.getElementById('field-nombre');
        if (nombreField) {
          nombreField.classList.add('border-red-500');
          setTimeout(() => nombreField.focus(), 300);
        }
      }
      if (!telefono || !telefono.trim()) {
        const telefonoField = document.getElementById('field-telefono');
        if (telefonoField) {
          telefonoField.classList.add('border-red-500');
        }
      }
      if (!email || !email.trim()) {
        const emailField = document.getElementById('field-email');
        if (emailField) {
          emailField.classList.add('border-red-500');
        }
      }
      
      return;
    }
    
    const priceData = calculatePrice();
    const container = document.getElementById('questions-container');
    const resultsContainer = document.getElementById('results-container');
    const navButtons = document.getElementById('navigation-buttons');

    if (!container || !resultsContainer || !navButtons) return;

    container.classList.add('hidden');
    navButtons.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    const questionLabels = {
      'tipo-vivienda': 'Tipo de Vivienda',
      'pisos': 'Número de Pisos',
      'area': 'Área Construida',
      'sistema': 'Sistema Constructivo',
      'acabados': 'Nivel de Acabados',
      'ubicacion': 'Ubicación',
      'tipo-suelo': 'Condición del Terreno',
      'tiempo-entrega': 'Tiempo de Inicio',
      'presupuesto': 'Rango de Inversión',
      'terreno-propio': 'Terreno Propio',
      'separar-proyecto': 'Separar Proyecto',
      'instalaciones': 'Instalaciones'
    };

    const optionLabels = {
      'cabaña': 'Cabaña',
      'casa-campestre': 'Casa Campestre',
      'casa-urbana': 'Casa Urbana',
      'bodega': 'Bodega/Almacén',
      'oficina': 'Oficina/Comercial',
      '1-piso': '1 Piso',
      '2-pisos': '2 Pisos',
      'eps': 'Paneles EPS',
      'plaqueta': 'Plaqueta de Concreto',
      'obra-negra': 'Obra Negra',
      'gris': 'Gris',
      'blanca': 'Blanca',
      'plan': 'Terreno Plano',
      'pendiente': 'Terreno en Pendiente',
      'inmediato': 'Lo antes posible',
      '1-3-meses': '1 a 3 meses',
      '3-6-meses': '3 a 6 meses',
      'mas-6-meses': 'Más de 6 meses',
      '18-50': 'Entre 18 a 50 millones',
      '51-100': 'Entre 51 a 100',
      'otros': 'Otros precios',
      'si': 'Sí, ya tengo el terreno',
      'buscando': 'Estoy buscando terreno',
      'evaluando': 'Estoy evaluando opciones',
      'si-separar': 'Sí, me interesa separar',
      'informacion': 'Quiero más información',
      'no-separar': 'No, prefiero esperar',
      'electrica': 'Instalación Eléctrica',
      'hidraulica': 'Instalación Hidráulica',
      'sanitaria': 'Instalación Sanitaria',
      'gas': 'Instalación de Gas'
    };

    let summaryHTML = `
      <div class="result-card text-white rounded-2xl p-4 sm:p-6 md:p-12 mb-6 md:mb-8">
            <div class="text-center mb-6 md:mb-8">
              <i class="fas fa-check-circle text-4xl sm:text-5xl md:text-6xl mb-3 md:mb-4 opacity-90"></i>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">¡Tu Simulación de Cotización Está Lista!</h2>
              <p class="text-base sm:text-lg md:text-xl opacity-90 mb-2">Hemos calculado un precio estimado basado en tus respuestas</p>
            </div>

        <!-- Advertencia importante sobre simulación -->
        <div class="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 sm:p-5 md:p-6 mb-4 md:mb-6">
          <div class="flex items-start">
            <i class="fas fa-exclamation-triangle text-yellow-600 text-xl sm:text-2xl mr-3 sm:mr-4 mt-1 flex-shrink-0"></i>
            <div class="min-w-0 flex-1">
              <h3 class="text-base sm:text-lg font-bold text-yellow-800 mb-2">⚠️ IMPORTANTE: Esta es una SIMULACIÓN</h3>
              <p class="text-xs sm:text-sm text-yellow-900 mb-2">Este valor es <strong>solo una estimación aproximada</strong> basada en la información proporcionada.</p>
              <p class="text-xs sm:text-sm text-yellow-900 mb-2">Los precios finales están sujetos a múltiples factores y variantes como:</p>
              <ul class="text-xs sm:text-sm text-yellow-900 list-disc list-inside mb-2 space-y-1">
                <li>Condiciones específicas del terreno (topografía, acceso, servicios)</li>
                <li>Variaciones en precios de materiales</li>
                <li>Permisos y licencias de construcción</li>
                <li>Condiciones climáticas y estacionales</li>
                <li>Complejidad real del proyecto</li>
                <li>Costos de transporte y logística</li>
              </ul>
              <p class="text-xs sm:text-sm font-semibold text-yellow-900">Para una cotización precisa, te ofrecemos atención personalizada por WhatsApp, videollamada, o visita si se requiere.</p>
            </div>
          </div>
        </div>

        <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-5 md:p-6 mb-4 md:mb-6">
          <div class="text-center">
            <p class="text-xs sm:text-sm opacity-80 mb-2">Precio Estimado Total (SIMULACIÓN)</p>
            <p class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 break-words">$${priceData.total.toLocaleString('es-CO')}</p>
            <p class="text-xs opacity-75 italic px-2">*Valor aproximado. No constituye una cotización oficial.</p>
          </div>
        </div>

            <div class="text-center px-2">
              <p class="text-xs sm:text-sm opacity-80 mb-2">Nuestro equipo de expertos revisará tu simulación y te contactará en breve</p>
              <p class="text-xs opacity-70 mb-3 md:mb-4">Te ofrecemos cotización precisa por WhatsApp, videollamada, o visita si se requiere</p>
              <p class="text-xs sm:text-sm font-semibold opacity-90 mt-3 md:mt-4 mb-2">📞 ¡Visítanos en nuestra oficina física!</p>
              <p class="text-xs sm:text-sm opacity-75">Centro Comercial Fiesta - Te brindamos atención personalizada para tu proyecto</p>
            </div>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h3 class="text-2xl font-bold text-dark mb-6">Resumen de tu Proyecto</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    `;

    Object.keys(appState.answers).forEach(key => {
      if (key !== 'nombre' && key !== 'telefono' && key !== 'email') {
        const label = questionLabels[key] || key;
        let value = appState.answers[key];
        
        if (Array.isArray(value)) {
          value = value.map(v => optionLabels[v] || v).join(', ');
        } else {
          value = (key === 'ubicacion') ? getUbicacionLabel(value) : (optionLabels[value] || value);
          if (key === 'area') {
            value = value + ' m²';
          }
        }

        summaryHTML += `
          <div class="border-b border-gray-200 pb-3">
            <p class="text-sm text-gray-600 mb-1">${label}</p>
            <p class="text-lg font-semibold text-dark">${value}</p>
          </div>
        `;
      }
    });

    summaryHTML += `
        </div>
      </div>
    `;

    resultsContainer.innerHTML = summaryHTML;
  }

  // Enviar por WhatsApp
  function sendToWhatsApp() {
    const priceData = calculatePrice();
    const nombre = appState.answers.nombre || 'Cliente';
    const telefono = appState.answers.telefono || '';
    const email = appState.answers.email || 'No proporcionado';

    const questionLabels = {
      'tipo-vivienda': 'Tipo de Vivienda',
      'pisos': 'Número de Pisos',
      'area': 'Área Construida',
      'sistema': 'Sistema Constructivo',
      'acabados': 'Nivel de Acabados',
      'ubicacion': 'Ubicación',
      'tipo-suelo': 'Condición del Terreno',
      'tiempo-entrega': 'Tiempo de Inicio',
      'presupuesto': 'Rango de Inversión',
      'terreno-propio': 'Terreno Propio',
      'separar-proyecto': 'Separar Proyecto',
      'instalaciones': 'Instalaciones'
    };

    const optionLabels = {
      'cabaña': 'Cabaña',
      'casa-campestre': 'Casa Campestre',
      'casa-urbana': 'Casa Urbana',
      'bodega': 'Bodega/Almacén',
      'oficina': 'Oficina/Comercial',
      '1-piso': '1 Piso',
      '2-pisos': '2 Pisos',
      'eps': 'Paneles EPS',
      'plaqueta': 'Plaqueta de Concreto',
      'obra-negra': 'Obra Negra',
      'gris': 'Gris',
      'blanca': 'Blanca',
      'plan': 'Terreno Plano',
      'pendiente': 'Terreno en Pendiente',
      'inmediato': 'Lo antes posible',
      '1-3-meses': '1 a 3 meses',
      '3-6-meses': '3 a 6 meses',
      'mas-6-meses': 'Más de 6 meses',
      '18-50': 'Entre 18 a 50 millones',
      '51-100': 'Entre 51 a 100',
      'otros': 'Otros precios',
      'si': 'Sí, ya tengo el terreno',
      'buscando': 'Estoy buscando terreno',
      'evaluando': 'Estoy evaluando opciones',
      'si-separar': 'Sí, me interesa separar',
      'informacion': 'Quiero más información',
      'no-separar': 'No, prefiero esperar',
      'electrica': 'Instalación Eléctrica',
      'hidraulica': 'Instalación Hidráulica',
      'sanitaria': 'Instalación Sanitaria',
      'gas': 'Instalación de Gas'
    };

    let message = `🏠 *SIMULACIÓN DE COTIZACIÓN - CONCASAYA*\n\n`;
    message += `⚠️ *IMPORTANTE: Esta es una SIMULACIÓN*\n`;
    message += `Este valor es solo una estimación aproximada. Los precios finales están sujetos a múltiples factores (terreno, materiales, permisos, condiciones climáticas, etc.). Para una cotización precisa, te ofrecemos atención personalizada por WhatsApp, videollamada, o visita si se requiere.\n\n`;
    message += `*DATOS DE CONTACTO*\n`;
    message += `👤 Nombre: ${nombre}\n`;
    message += `📱 Teléfono: ${telefono}\n`;
    message += `📧 Email: ${email}\n\n`;
    message += `*RESUMEN DEL PROYECTO*\n\n`;

    Object.keys(appState.answers).forEach(key => {
      if (key !== 'nombre' && key !== 'telefono' && key !== 'email') {
        const label = questionLabels[key] || key;
        let value = appState.answers[key];
        
        if (Array.isArray(value)) {
          value = value.map(v => optionLabels[v] || v).join(', ');
        } else {
          value = (key === 'ubicacion') ? getUbicacionLabel(value) : (optionLabels[value] || value);
          if (key === 'area') {
            value = value + ' m²';
          }
        }

        message += `• *${label}:* ${value}\n`;
      }
    });

    message += `\n*SIMULACIÓN DE PRECIO ESTIMADO*\n`;
    message += `💰 Precio Total Estimado: $${priceData.total.toLocaleString('es-CO')}\n`;
    message += `📐 Construcción Base: $${Math.round(priceData.base).toLocaleString('es-CO')}\n`;
    if (priceData.instalaciones > 0) {
      message += `⚡ Instalaciones: $${priceData.instalaciones.toLocaleString('es-CO')}\n`;
    }
    // Costos de preparación de terreno ya no se incluyen en la cotización

    message += `\n*⚠️ IMPORTANTE:* Este es un valor estimado aproximado. Los precios finales están sujetos a múltiples factores y variantes. Para una cotización precisa, te ofrecemos atención personalizada por WhatsApp, videollamada, o visita si se requiere.\n\n`;
    message += `📍 *¡Visítanos en nuestra oficina física!*\n`;
    message += `Dirección: Cl. 147 #101-56 Local 64, Bogotá\n`;
    message += `Centro Comercial Fiesta\n`;
    message += `📍 Ver ubicación en Google Maps:\n`;
    message += `https://maps.app.goo.gl/qGv5S1qG6Gy5KZ4A7\n\n`;
    message += `Te brindamos atención personalizada para tu proyecto.\n\n`;
    message += `¡Gracias por confiar en CONCASAYA! 🏡`;

    const whatsappNumber = '573142891018';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  }

  // Exponer funciones globalmente usando namespace para evitar conflictos
  window.CotizadorEncuesta = {
    selectOption: selectOption,
    updateRange: updateRange,
    updateDatalistInput: updateDatalistInput,
    showDatalistDropdown: showDatalistDropdown,
    selectDatalistOption: selectDatalistOption,
    filterDatalistOptions: filterDatalistOptions,
    toggleCheckbox: toggleCheckbox,
    updateFormField: updateFormField,
    validateField: validateField,
    sendToWhatsApp: sendToWhatsApp
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initApp();
      updateBackButton();
      updateNextButton();
    });
  } else {
    // DOM ya está listo
    initApp();
    updateBackButton();
    updateNextButton();
  }

})();
