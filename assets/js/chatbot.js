// Sistema basado en JSON - Chatbot CONCASAYA

// Variables globales - se inicializarán cuando el DOM esté listo
let chatbox;
let userInput;
let sendButton;
let themeToggle;
let themeIconLight;
let themeIconDark;
let suggestionsContainer;
let clearChatButton;
let scrollToBottomBtn;

// Funciones para el modal de bienvenida
function showWelcomeModal() {
  const modal = document.getElementById("welcomeModal");
  const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
  
  if (!hasSeenWelcome && modal) {
    setTimeout(() => {
      modal.classList.remove("hide");
      modal.classList.add("show");
    }, 300);
  }
}

function hideWelcomeModal() {
  const modal = document.getElementById("welcomeModal");
  const dontShowAgainCheckbox = document.getElementById("dontShowAgain");
  
  if (!modal) return;
  
  const dontShowAgain = dontShowAgainCheckbox ? dontShowAgainCheckbox.checked : false;
  
  modal.classList.remove("show");
  modal.classList.add("hide");
  
  if (dontShowAgain) {
    localStorage.setItem("hasSeenWelcome", "true");
  }
  
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

// Endpoint del API - funcionará automáticamente en Vercel
const API_ENDPOINT = "/api/chat";

const CONTACT_INFO = "314 289 1018 o 316 577 1582";
const WHATSAPP_NUMBER = "573142891018";
const CONTACT_MAIN_INFO_SOURCE = "314 289 1018, 316 577 1582 o WhatsApp";

// Configuración: Usar JSON en lugar de Supabase
const KNOWLEDGE_BASE_URL = "/knowledge_base.json";
var knowledgeLoaded = false;

const TYPING_DELAY_MS = 1000;
const CHAR_TYPING_SPEED = 20;

const suggestedQuestions = [
  "¿Cuánto cuesta una casa prefabricada?",
  "¿Qué es el sistema de paneles EPS?",
  "¿En qué municipios construyen?",
  "¿Cuánto tiempo tarda la construcción?",
  "¿Ofrecen financiación?",
  "¿Qué garantías tienen?",
  "¿Necesito permisos de construcción?",
  "¿Puedo personalizar mi casa?",
  "¿Qué diferencia hay entre EPS y Plaqueta?",
  "¿Cómo funciona el proceso de construcción?",
  "¿Qué incluye obra gris?",
  "¿Cuánto cuesta por metro cuadrado?",
  "¿Construyen en Bogotá?",
  "¿Qué tipos de casas tienen?",
  "¿Cómo los contacto?",
  "¿Tienen catálogo de modelos?",
  "¿Qué es obra negra?",
  "¿Cuánto tiempo tarda una casa de 60m²?",
  "¿Ofrecen cotizaciones?",
  "¿Construyen en Chía?"
];

let loadedKnowledge = "";
let initialContext = "";
let conversationHistory = [];
let conversationData = {}; // Para almacenar datos extraídos de la conversación (área, sistema, etc.)

// Tabla de precios por m² (igual que el cotizador)
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
};

// Función para calcular precio aproximado
function calculateApproximatePrice(area, sistema, acabados, pisos, ubicacion, tipoVivienda) {
  // Valores por defecto
  area = area || 60;
  sistema = sistema || 'eps';
  acabados = acabados || (sistema === 'eps' ? 'gris' : 'obra-negra');
  pisos = pisos || '1-piso';
  ubicacion = ubicacion || 'bogota';
  tipoVivienda = tipoVivienda || 'casa-campestre';

  // Si es EPS y se seleccionó obra-negra, usar gris
  let acabadosParaCalcular = acabados;
  if (sistema === 'eps' && acabados === 'obra-negra') {
    acabadosParaCalcular = 'gris';
  }

  const precioM2 = preciosPorM2[sistema]?.[pisos]?.[acabadosParaCalcular] || preciosPorM2['eps']['1-piso']['gris'];
  
  let precioBase = precioM2 * area;
  precioBase *= multiplicadoresTipo[tipoVivienda] || 1.0;
  precioBase *= multiplicadoresUbicacion[ubicacion] || 1.2;

  return {
    total: precioBase,
    precioM2: precioM2,
    area: area,
    sistema: sistema,
    acabados: acabadosParaCalcular,
    pisos: pisos
  };
}

// Función para detectar intenciones del usuario
function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  // Detección de cotización
  if (lowerMessage.match(/\b(cotizar|cotizaci[oó]n|precio|cu[aá]nto cuesta|cu[aá]nto vale|precio de|costar|valor|presupuesto)\b/)) {
    return 'cotizar';
  }
  
  // Detección de navegación a modelos
  if (lowerMessage.match(/\b(modelos|cat[aá]logo|tipos de casas|dise[ñn]os|planos)\b/)) {
    return 'modelos';
  }
  
  // Detección de contacto
  if (lowerMessage.match(/\b(contacto|tel[eé]fono|whatsapp|direcci[oó]n|llamar|escribir|hablar)\b/)) {
    return 'contacto';
  }
  
  // Detección de información técnica
  if (lowerMessage.match(/\b(eps|plaqueta|sistema constructivo|paneles|poliestireno)\b/)) {
    return 'tecnico';
  }
  
  // Detección de ubicaciones
  if (lowerMessage.match(/\b(bogot[aá]|ch[ií]a|cajic[aá]|mosquera|sop[oó]|zipaquir[aá]|funza|la vega|madrid|tocancip[aá]|boyac[aá]|santa marta|municipio|ciudad|zona)\b/)) {
    return 'ubicacion';
  }
  
  // Detección de cotizador completo
  if (lowerMessage.match(/\b(cotizador completo|cotizador detallado|cotizador paso a paso|cotizador interactivo)\b/)) {
    return 'cotizador_completo';
  }
  
  return null;
}

// Función para extraer datos de la conversación
function extractConversationData(message) {
  const lowerMessage = message.toLowerCase();
  
  // Extraer área (metros cuadrados)
  const areaMatch = lowerMessage.match(/(\d+)\s*(m2|m²|metros?|metros cuadrados?)/);
  if (areaMatch) {
    conversationData.area = parseInt(areaMatch[1]);
  }
  
  // Extraer sistema constructivo
  if (lowerMessage.match(/\beps\b/)) {
    conversationData.sistema = 'eps';
  } else if (lowerMessage.match(/\bplaqueta\b/)) {
    conversationData.sistema = 'plaqueta';
  }
  
  // Extraer acabados
  if (lowerMessage.match(/\bobra negra\b/)) {
    conversationData.acabados = 'obra-negra';
  } else if (lowerMessage.match(/\bobra gris\b/)) {
    conversationData.acabados = 'gris';
  } else if (lowerMessage.match(/\bobra blanca\b/)) {
    conversationData.acabados = 'blanca';
  }
  
  // Extraer número de pisos
  if (lowerMessage.match(/\b(un|1)\s*piso\b/)) {
    conversationData.pisos = '1-piso';
  } else if (lowerMessage.match(/\b(dos|2)\s*pisos?\b/)) {
    conversationData.pisos = '2-pisos';
  }
  
  // Extraer ubicación
  const ubicaciones = Object.keys(multiplicadoresUbicacion);
  for (const ubicacion of ubicaciones) {
    if (lowerMessage.includes(ubicacion.replace('-', ' '))) {
      conversationData.ubicacion = ubicacion;
      break;
    }
  }
  
  // Extraer tipo de vivienda
  if (lowerMessage.match(/\bcaba[ñn]a\b/)) {
    conversationData.tipoVivienda = 'cabaña';
  } else if (lowerMessage.match(/\bcasa campestre\b/)) {
    conversationData.tipoVivienda = 'casa-campestre';
  } else if (lowerMessage.match(/\bcasa urbana\b/)) {
    conversationData.tipoVivienda = 'casa-urbana';
  } else if (lowerMessage.match(/\bbodega\b/)) {
    conversationData.tipoVivienda = 'bodega';
  } else if (lowerMessage.match(/\boficina\b/)) {
    conversationData.tipoVivienda = 'oficina';
  }
}

// Función para navegar a páginas específicas
function navigateToPage(page) {
  const pages = {
    'modelos': '/modelos.html',
    'ventajas': '/ventajas.html',
    'nosotros': '/nosotros.html',
    'faq': '/faq.html',
    'contacto': '/contacto.html',
    'cotizador': '/cotizador-encuesta.html',
    'chia': '/pages/chia.html',
    'cajica': '/pages/cajica.html',
    'mosquera': '/pages/mosquera.html',
    'sopo': '/pages/sopo.html',
    'zipaquira': '/pages/zipaquira.html',
    'funza': '/pages/funza.html',
    'la-vega': '/pages/la-vega.html',
    'madrid': '/pages/madrid.html',
    'tocancipa': '/pages/tocancipa.html',
    'boyaca': '/pages/boyaca.html',
    'villadeleyva': '/pages/villadeleyva.html',
    'santa-marta': '/pages/santa-marta.html'
  };
  
  if (pages[page]) {
    window.location.href = pages[page];
  }
}

// Función para buscar en la base de conocimiento local
function searchInKnowledgeBase(query) {
  if (!loadedKnowledge) return null;
  
  const lowerQuery = query.toLowerCase();
  
  // Palabras clave importantes (filtrar palabras muy comunes)
  const stopWords = ['que', 'cual', 'como', 'donde', 'cuando', 'porque', 'para', 'con', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'es', 'son', 'está', 'están'];
  const keywords = lowerQuery.split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 5); // Limitar a 5 palabras clave más importantes
  
  if (keywords.length === 0) return null;
  
  // Buscar coincidencias relevantes
  let score = 0;
  let matchedKeywords = [];
  
  // Buscar por palabras clave y calcular score
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches_found = loadedKnowledge.match(regex);
    if (matches_found) {
      score += matches_found.length;
      matchedKeywords.push(keyword);
    }
  });
  
  // Si hay suficiente coincidencia (al menos 2 palabras clave o score > 3)
  if (score > 0 && (matchedKeywords.length >= 2 || score > 3)) {
    // Buscar párrafos relevantes
    const paragraphs = loadedKnowledge.split(/\n\n/);
    const relevantParagraphs = [];
    const seenParagraphs = new Set();
    
    // Priorizar párrafos que contengan múltiples palabras clave
    keywords.forEach(keyword => {
      paragraphs.forEach((para, index) => {
        const paraLower = para.toLowerCase();
        if (paraLower.includes(keyword) && para.length > 50 && !seenParagraphs.has(index)) {
          // Calcular relevancia del párrafo
          let paraScore = 0;
          keywords.forEach(kw => {
            const kwMatches = paraLower.match(new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'));
            if (kwMatches) paraScore += kwMatches.length;
          });
          
          if (paraScore > 0) {
            relevantParagraphs.push({
              text: para.trim(),
              score: paraScore,
              index: index
            });
            seenParagraphs.add(index);
          }
        }
      });
    });
    
    // Ordenar por relevancia y tomar los mejores
    relevantParagraphs.sort((a, b) => b.score - a.score);
    const topParagraphs = relevantParagraphs.slice(0, 3);
    
    if (topParagraphs.length > 0) {
      // Combinar párrafos relevantes
      const combined = topParagraphs.map(p => p.text).join('\n\n');
      
      // Asegurar que la respuesta tenga suficiente contenido
      if (combined.length > 100) {
        return {
          found: true,
          answer: combined.substring(0, 800), // Limitar longitud pero permitir más contenido
          score: score
        };
      }
    }
  }
  
  return null;
}

// Función para analizar respuesta del bot y detectar menciones de contacto
function extractContactButtonsFromResponse(botResponse) {
  const buttons = [];
  const lowerResponse = botResponse.toLowerCase();
  
  // Detectar menciones de WhatsApp (más patrones)
  const whatsappPatterns = [
    /\bwhatsapp\b/,
    /\bwhats\b/,
    /\b573142891018\b/,
    /\b314\s*289\s*1018\b/,
    /\bescr[ií]benos por whatsapp\b/,
    /\bcont[aá]ctanos por whatsapp\b/,
    /\bcomun[ií]cate por whatsapp\b/,
    /\bchatea por whatsapp\b/,
    /\bmensaje por whatsapp\b/
  ];
  
  const hasWhatsApp = whatsappPatterns.some(pattern => pattern.test(lowerResponse));
  
  if (hasWhatsApp) {
    buttons.push({
      text: 'Abrir WhatsApp',
      icon: 'fa-whatsapp',
      action: 'whatsapp',
      class: 'bg-green-500 hover:bg-green-600',
      external: true
    });
  }
  
  // Detectar menciones de dirección física/oficina
  const officePatterns = [
    /\bdirecci[oó]n\b/,
    /\boficina\b/,
    /\bsitio f[ií]sico\b/,
    /\blocal\b/,
    /\bcentro comercial\b/,
    /\bcl\.\s*147\b/,
    /\bcalle\s*147\b/,
    /\bfiesta\b/,
    /\bvis[ií]tanos\b/,
    /\bven a nuestra\b/,
    /\bven a visitarnos\b/,
    /\bvisita nuestra oficina\b/,
    /\boficina f[ií]sica\b/
  ];
  
  const hasOffice = officePatterns.some(pattern => pattern.test(lowerResponse));
  
  if (hasOffice) {
    buttons.push({
      text: 'Ver Ubicación en Google Maps',
      icon: 'fa-map-marker-alt',
      action: 'maps',
      class: 'bg-red-600 hover:bg-red-700',
      external: true
    });
  }
  
  // Detectar teléfonos (si no hay botón de WhatsApp ya)
  if (!hasWhatsApp && (lowerResponse.match(/\b(314|316)\s*\d{3}\s*\d{4}\b/) || lowerResponse.match(/\btel[eé]fono\b/))) {
    buttons.push({
      text: 'Llamar',
      icon: 'fa-phone',
      action: 'phone',
      class: 'bg-blue-600 hover:bg-blue-700',
      external: true
    });
  }
  
  return buttons;
}

// Función para determinar qué botones mostrar según el contexto
function getActionButtons(message, intent, botResponse = '') {
  const buttons = [];
  const lowerMessage = message.toLowerCase();
  const lowerResponse = botResponse.toLowerCase();
  
  // Combinar mensaje del usuario y respuesta del bot para análisis completo
  const combinedText = lowerMessage + ' ' + lowerResponse;
  
  // Botón de cotizador si menciona precio, cotización, etc.
  if (intent === 'cotizar' || combinedText.match(/\b(cotizar|precio|cu[aá]nto|presupuesto)\b/)) {
    buttons.push({
      text: 'Ver Cotizador Completo',
      icon: 'fa-calculator',
      action: 'cotizador',
      class: 'bg-primary-600 hover:bg-primary-700'
    });
  }
  
  // Botón de modelos si menciona modelos, catálogo, etc.
  if (intent === 'modelos' || combinedText.match(/\b(modelos|cat[aá]logo|dise[ñn]os|tipos)\b/)) {
    buttons.push({
      text: 'Ver Modelos',
      icon: 'fa-building',
      action: 'modelos',
      class: 'bg-primary-600 hover:bg-primary-700'
    });
  }
  
  // Botones de municipios específicos
  const municipios = {
    'chia': { text: 'Ver Chía', page: 'chia' },
    'cajica': { text: 'Ver Cajicá', page: 'cajica' },
    'mosquera': { text: 'Ver Mosquera', page: 'mosquera' },
    'sopo': { text: 'Ver Sopó', page: 'sopo' },
    'zipaquira': { text: 'Ver Zipaquirá', page: 'zipaquira' },
    'funza': { text: 'Ver Funza', page: 'funza' },
    'la vega': { text: 'Ver La Vega', page: 'la-vega' },
    'madrid': { text: 'Ver Madrid', page: 'madrid' },
    'tocancipa': { text: 'Ver Tocancipá', page: 'tocancipa' },
    'boyaca': { text: 'Ver Boyacá', page: 'boyaca' },
    'villa de leyva': { text: 'Ver Villa de Leyva', page: 'villadeleyva' },
    'santa marta': { text: 'Ver Santa Marta', page: 'santa-marta' }
  };
  
  for (const [municipio, info] of Object.entries(municipios)) {
    if (combinedText.includes(municipio)) {
      buttons.push({
        text: info.text,
        icon: 'fa-map-marker-alt',
        action: info.page,
        class: 'bg-green-600 hover:bg-green-700'
      });
      break; // Solo un botón de municipio a la vez
    }
  }
  
  // Botón de contacto si menciona contacto, teléfono, etc.
  if (intent === 'contacto' || combinedText.match(/\b(contacto|tel[eé]fono|llamar|escribir)\b/)) {
    buttons.push({
      text: 'Ir a Contacto',
      icon: 'fa-phone',
      action: 'contacto',
      class: 'bg-blue-600 hover:bg-blue-700'
    });
  }
  
  // Extraer botones de contacto de la respuesta del bot
  const contactButtons = extractContactButtonsFromResponse(botResponse);
  
  // Agregar botones de contacto si no están duplicados
  contactButtons.forEach(contactBtn => {
    const isDuplicate = buttons.some(btn => btn.action === contactBtn.action);
    if (!isDuplicate) {
      buttons.push(contactBtn);
    }
  });
  
  return buttons;
}

function buildInitialContext() {
  initialContext = `
Eres un asistente virtual amigable y servicial para clientes potenciales y clientes de "CONCASAYA", empresa especializada en casas prefabricadas.

IMPORTANTE: Esta API solo debe ser utilizada cuando el usuario solicite información muy específica que NO esté disponible en la base de conocimiento local, o cuando necesites realizar búsquedas en internet para información actualizada o muy técnica que requiera fuentes externas.

Tu propósito principal es:
1. Responder preguntas frecuentes (PQR) sobre casas prefabricadas, sistemas constructivos, precios, modelos y servicios de CONCASAYA.
2. Proporcionar información sobre sistemas constructivos (Paneles EPS y Plaqueta de concreto), tipos de vivienda, niveles de acabados y ubicaciones de servicio.
3. Ofrecer cotizaciones aproximadas cuando el usuario lo solicite, usando la información de precios proporcionada.
4. Dirigir a los usuarios a páginas específicas del sitio web cuando sea relevante (modelos, ventajas, contacto, cotizador completo, páginas de municipios).
5. Indicar los canales adecuados para contactar a CONCASAYA (teléfono, WhatsApp, dirección física).
6. Usar tu capacidad de búsqueda en internet SOLO cuando la pregunta requiera información muy específica, actualizada o técnica que no esté en la base de conocimiento.

Información de contacto de CONCASAYA:
- Teléfono Principal: 314 289 1018
- Teléfono Alternativo: 316 577 1582
- WhatsApp: 573142891018
- Dirección: Cl. 147 #101-56 Local 64, Bogotá (Centro Comercial Fiesta)
- Horario: Lunes a viernes 8:00 a.m. a 6:00 p.m. / Sábados 8:00 a.m. a 12:00 m.

Utiliza la siguiente información específica sobre CONCASAYA para formular tus respuestas. Este es el compendio general de información:
${loadedKnowledge}

Instrucciones Adicionales para Respuestas:
- Basa tus respuestas PRIMERO en la información proporcionada en el compendio anterior.
- Si la información está disponible en el compendio, úsala directamente sin buscar en internet.
- Solo usa búsqueda en internet para información muy específica, actualizada o técnica que claramente no esté en el compendio.
- IMPORTANTE: Tus respuestas deben ser BREVES y CONCISAS (máximo 3-4 oraciones).
- IMPORTANTE: SIEMPRE termina tu respuesta con una pregunta relevante para mantener la conversación activa. Ejemplos: "¿Hay algo más en lo que pueda ayudarte?", "¿Necesitas más información sobre este tema?", "¿Te gustaría ver nuestros modelos?", "¿Quieres una cotización aproximada?"
- Si el usuario pregunta sobre precios o cotizaciones:
  * Si menciona datos específicos (área, sistema, acabados), puedes dar una estimación aproximada usando los precios por m² proporcionados.
  * Siempre menciona que es una estimación aproximada y que para una cotización precisa puede usar el cotizador completo en /cotizador-encuesta.html o contactar directamente.
  * Si no tiene suficientes datos, pregunta los parámetros básicos (área, sistema, acabados) antes de calcular.
- Si el usuario pregunta sobre modelos, catálogo o tipos de casas, sugiere visitar /modelos.html
- Si el usuario pregunta sobre ventajas de construcción prefabricada, sugiere visitar /ventajas.html
- Si el usuario pregunta sobre información de la empresa, sugiere visitar /nosotros.html
- Si el usuario pregunta sobre preguntas frecuentes, sugiere visitar /faq.html
- Si el usuario quiere contacto directo, proporciona los teléfonos (314 289 1018, 316 577 1582) y WhatsApp (573142891018)
- Si el usuario pregunta sobre un municipio específico donde construyen, puedes mencionar que tienen página dedicada en /pages/[municipio].html
- Si el usuario quiere una cotización más precisa o detallada, siempre sugiere usar el cotizador completo en /cotizador-encuesta.html
- NO inventes información, precios, tiempos o procedimientos que no estén en la base de conocimiento.
- Sé conciso, claro y utiliza un tono amable y profesional.
- Cuando menciones enlaces a páginas, usa formato claro: "puedes visitar nuestra página de modelos en /modelos.html"
`.trim();
}

function initializeConversationHistory() {
  initialContext = initialContext || "Error: Contexto inicial no cargado.";
  conversationHistory = [
    {
      role: "user",
      parts: [
        {
          text:
            initialContext +
            "\n\nOkay, estoy listo para recibir preguntas sobre CONCASAYA y casas prefabricadas.",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "¡Hola! Soy el asistente virtual de CONCASAYA. Estoy aquí para ayudarte con información sobre casas prefabricadas, sistemas constructivos, precios, modelos y más. ¿En qué puedo ayudarte hoy?",
        },
      ],
    },
  ];
}

// Función simple para convertir markdown básico a HTML
function markdownToHtml(text) {
  if (!text) return '';
  
  // Primero procesar código inline para evitar conflictos
  const codeBlocks = [];
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    const id = `CODE_${codeBlocks.length}`;
    codeBlocks.push(`<code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono">${code}</code>`);
    return id;
  });

  // URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  text = text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline font-medium inline-flex items-center gap-1">${url}<i class="fas fa-external-link-alt text-xs opacity-70"></i></a>`;
  });

  // Enlaces a páginas del sitio (formato /pagina.html)
  const pageLinkRegex = /(\/[a-z0-9-]+\.html)/g;
  text = text.replace(pageLinkRegex, (link, path) => {
    const pageName = path.replace(/\.html$/, '').replace(/\//g, '').replace(/-/g, ' ');
    return `<a href="${path}" class="text-primary-600 dark:text-primary-400 hover:underline font-medium inline-flex items-center gap-1">${pageName}<i class="fas fa-external-link-alt text-xs opacity-70"></i></a>`;
  });

  // Negritas **texto**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
  // Cursiva *texto*
  text = text.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em class="italic">$1</em>');
  
  // Restaurar bloques de código
  codeBlocks.forEach((code, index) => {
    text = text.replace(`CODE_${index}`, code);
  });
  
  // Saltos de línea
  text = text.replace(/\n\n+/g, '</p><p class="my-2">');
  if (!text.startsWith('<p')) {
    text = '<p class="my-2">' + text;
  }
  if (!text.endsWith('</p>')) {
    text = text + '</p>';
  }
  text = text.replace(/\n/g, "<br>");
  
  return text;
}

function addMessage(message, sender, animateTyping = false, actionButtons = []) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(
    "flex", "mb-4", "max-w-[85%]", "md:max-w-lg", "mx-2", "text-sm", "w-full"
  );
  messageElement.style.opacity = '0';
  messageElement.style.maxWidth = '85%';
  messageElement.style.wordWrap = 'break-word';
  messageElement.style.overflowWrap = 'break-word';
  
  if (sender === "user") {
    messageElement.classList.add("justify-end", "animate-user-message");
  } else {
    messageElement.classList.add("justify-start", "animate-bot-message");
  }
  
  const bubble = document.createElement("div");
  bubble.classList.add(
    "p-4", "rounded-2xl", "shadow-lg", "relative", "message-bubble",
    "transition-all", "duration-200"
  );

  if (sender === "user") {
    bubble.classList.add(
      "bg-gradient-to-br", "from-primary-600", "to-primary-700",
      "text-white", "ml-auto", "rounded-tr-sm"
    );
    bubble.innerHTML = markdownToHtml(message);
  } else {
    bubble.classList.add(
      "bg-white", "dark:bg-gray-800", 
      "text-gray-800", "dark:text-gray-100",
      "border", "border-gray-100", "dark:border-gray-700",
      "mr-auto", "rounded-tl-sm"
    );

    if (animateTyping) {
      bubble.innerHTML = '<span class="typing-content"></span>';
      typeMessage(message, bubble.querySelector('.typing-content'), actionButtons);
    } else {
      bubble.innerHTML = markdownToHtml(message);
      
      // Agregar botones de acción si existen
      if (actionButtons && actionButtons.length > 0) {
        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "mt-3 flex flex-wrap gap-2";
        
        actionButtons.forEach(btn => {
          const button = document.createElement("button");
          button.className = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${btn.class || 'bg-primary-600 hover:bg-primary-700'}`;
          button.innerHTML = `<i class="fas ${btn.icon}"></i><span>${btn.text}</span>`;
          
          button.onclick = (e) => {
            e.stopPropagation();
            if (btn.action === 'whatsapp') {
              window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
            } else if (btn.action === 'maps') {
              // Abrir Google Maps con la dirección de la oficina
              const address = encodeURIComponent('Cl. 147 #101-56 Local 64, Bogotá, Colombia');
              window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
            } else if (btn.action === 'phone') {
              // Abrir teléfono (tel: link)
              window.location.href = 'tel:+573142891018';
            } else if (btn.external) {
              // Para otras acciones externas
            } else {
              navigateToPage(btn.action);
            }
          };
          
          buttonsContainer.appendChild(button);
        });
        
        bubble.appendChild(buttonsContainer);
      }
    }

    const copyBtn = document.createElement("button");
    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    copyBtn.title = "Copiar texto";
    copyBtn.setAttribute("aria-label", "Copiar mensaje");
    copyBtn.classList.add("copy-btn");
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard
        .writeText(message)
        .then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check text-green-500"></i>';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
          }, 2000);
        })
        .catch((err) => console.error("Error al copiar:", err));
    };
    bubble.appendChild(copyBtn);
  }
  
  messageElement.appendChild(bubble);
  chatbox.appendChild(messageElement);
  
  // Trigger animation
  requestAnimationFrame(() => {
    messageElement.style.opacity = '1';
    smoothScrollToBottom();
  });
  
  return messageElement;
}

function typeMessage(text, element, actionButtons = []) {
  const formattedText = markdownToHtml(text);
  const words = text.split(/(\s+)/);
  let currentText = '';
  let wordIndex = 0;
  
  const typeInterval = setInterval(() => {
    if (wordIndex < words.length) {
      currentText += words[wordIndex];
      if (wordIndex % 3 === 0 || wordIndex === words.length - 1) {
        element.innerHTML = markdownToHtml(currentText);
        smoothScrollToBottom();
      }
      wordIndex++;
    } else {
      clearInterval(typeInterval);
      element.innerHTML = formattedText;
      
      // Agregar botones después de terminar de escribir
      if (actionButtons && actionButtons.length > 0) {
        const buttonsContainer = document.createElement("div");
        buttonsContainer.className = "mt-3 flex flex-wrap gap-2";
        
        actionButtons.forEach(btn => {
          const button = document.createElement("button");
          button.className = `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 ${btn.class || 'bg-primary-600 hover:bg-primary-700'}`;
          button.innerHTML = `<i class="fas ${btn.icon}"></i><span>${btn.text}</span>`;
          
          button.onclick = (e) => {
            e.stopPropagation();
            if (btn.action === 'whatsapp') {
              window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
            } else if (btn.action === 'maps') {
              // Abrir Google Maps con la dirección de la oficina
              const address = encodeURIComponent('Cl. 147 #101-56 Local 64, Bogotá, Colombia');
              window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
            } else if (btn.action === 'phone') {
              // Abrir teléfono (tel: link)
              window.location.href = 'tel:+573142891018';
            } else if (btn.external) {
              // Para otras acciones externas
            } else {
              navigateToPage(btn.action);
            }
          };
          
          buttonsContainer.appendChild(button);
        });
        
        element.parentElement.appendChild(buttonsContainer);
      }
      
      smoothScrollToBottom();
    }
  }, CHAR_TYPING_SPEED * 1.5);
}

function smoothScrollToBottom() {
  requestAnimationFrame(() => {
    chatbox.scrollTo({
      top: chatbox.scrollHeight,
      behavior: 'smooth'
    });
    updateScrollButton();
  });
}

function updateScrollButton() {
  const isNearBottom = chatbox.scrollHeight - chatbox.scrollTop - chatbox.clientHeight < 100;
  if (scrollToBottomBtn) {
    scrollToBottomBtn.classList.toggle('visible', !isNearBottom);
  }
}

function showThinkingIndicator() {
  const thinkingElement = document.createElement("div");
  thinkingElement.id = "thinkingIndicator";
  thinkingElement.classList.add(
    "flex", "justify-start", "mb-4", "max-w-[85%]", "md:max-w-lg", "mx-2", "text-sm", "animate-bot-message"
  );
  thinkingElement.innerHTML = `
    <div class="p-4 rounded-2xl rounded-tl-sm shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mr-auto">
      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="text-sm">Pensando...</span>
      </div>
    </div>
  `;
  chatbox.appendChild(thinkingElement);
  smoothScrollToBottom();
  return thinkingElement;
}

function showWritingIndicator() {
  const writingElement = document.createElement("div");
  writingElement.id = "writingIndicator";
  writingElement.classList.add(
    "flex", "justify-start", "mb-4", "max-w-[85%]", "md:max-w-lg", "mx-2", "text-sm", "animate-bot-message"
  );
  writingElement.innerHTML = `
    <div class="p-4 rounded-2xl rounded-tl-sm shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mr-auto">
      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="text-sm">Escribiendo respuesta...</span>
      </div>
    </div>
  `;
  chatbox.appendChild(writingElement);
  smoothScrollToBottom();
  return writingElement;
}

function removeIndicator(indicator) {
  if (indicator && chatbox.contains(indicator)) {
    chatbox.removeChild(indicator);
  }
}

async function getApiResponse(intent = null, originalMessage = '') {
  let thinkingIndicator = showThinkingIndicator();
  let writingIndicator = null;
  suggestionsContainer.innerHTML = "";

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationHistory: conversationHistory }),
    });

    removeIndicator(thinkingIndicator);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error ${response.status}: ${response.statusText}` };
      }
      console.error("Error desde la API:", errorData);
      
      let errorMessage = errorData.error || `Error ${response.status}: No se pudo obtener respuesta del servidor.`;
      
      // Mensajes más específicos según el tipo de error
      if (response.status === 500) {
        if (errorMessage.includes('PERPLEXITY_API_KEY')) {
          errorMessage = "⚠️ El chatbot necesita configuración del servidor. Si estás probando localmente, asegúrate de ejecutar 'npm install' y 'npm start', y crear un archivo .env con PERPLEXITY_API_KEY. Para producción, configura la variable de entorno en Vercel.";
        } else {
          errorMessage = "⚠️ Error del servidor. Si estás probando localmente, asegúrate de tener el servidor ejecutándose (npm start). Si el problema persiste, contacta a CONCASAYA directamente.";
        }
      } else if (response.status === 404) {
        errorMessage = "⚠️ La API no está disponible. Si estás probando localmente, ejecuta 'npm start' para iniciar el servidor de desarrollo.";
      }
      
      addMessage(errorMessage, "bot", false);
      if (conversationHistory.length > 2) conversationHistory.pop();
      displaySuggestions();
      sendButton.disabled = !userInput.value.trim() || !loadedKnowledge || !knowledgeLoaded;
      return;
    }

    const data = await response.json();
    let botResponse = "";
    const blockReason =
      data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason;

    if (blockReason && blockReason !== "STOP") {
      console.warn("Respuesta bloqueada:", data);
      botResponse = `Mi respuesta fue bloqueada (${blockReason}). Por favor, intenta reformular tu pregunta o contacta a ${CONTACT_INFO}.`;
      const buttons = getActionButtons(originalMessage, intent, botResponse);
      addMessage(botResponse, "bot", false, buttons);
      displaySuggestions();
      sendButton.disabled = !userInput.value.trim() || !loadedKnowledge || !knowledgeLoaded;
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      botResponse = data.candidates[0].content.parts[0].text.trim();
      writingIndicator = showWritingIndicator();
      
      // Obtener botones de acción según el contexto (incluyendo análisis de la respuesta)
      const buttons = getActionButtons(originalMessage, intent, botResponse);

      setTimeout(() => {
        removeIndicator(writingIndicator);
        addMessage(botResponse, "bot", true, buttons);
        conversationHistory.push({
          role: "model",
          parts: [{ text: botResponse }],
        });
        displaySuggestions();
        sendButton.disabled = !userInput.value.trim() || !loadedKnowledge || !knowledgeLoaded;
      }, TYPING_DELAY_MS);
    } else {
      console.warn("Respuesta inesperada desde la API:", data);
      botResponse =
        "No he podido generar una respuesta válida en este momento. Inténtalo de nuevo o contacta a CONCASAYA directamente.";
      const buttons = getActionButtons(originalMessage, intent, botResponse);
      addMessage(botResponse, "bot", false, buttons);
      displaySuggestions();
      sendButton.disabled = !userInput.value.trim() || !loadedKnowledge || !knowledgeLoaded;
    }
  } catch (error) {
    console.error("Error al llamar a la API:", error);
    removeIndicator(thinkingIndicator);
    removeIndicator(writingIndicator);
    
    let errorMessage = `Hubo un problema de comunicación. `;
    
    // Mensaje más específico según el tipo de error
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage += "No se pudo conectar con el servidor. Si estás probando localmente, asegúrate de ejecutar 'npm start' para iniciar el servidor de desarrollo. ";
    }
    
    errorMessage += `Por favor, intenta de nuevo más tarde o contacta directamente a ${CONTACT_INFO}.`;
    
    const buttons = getActionButtons(originalMessage, intent, errorMessage);
    addMessage(errorMessage, "bot", false, buttons);
    if (conversationHistory.length > 2) conversationHistory.pop();
    displaySuggestions();
    sendButton.disabled = !userInput.value.trim() || !loadedKnowledge || !knowledgeLoaded;
  } finally {
    const maxHistoryTurns = 10;
    if (conversationHistory.length > maxHistoryTurns * 2 + 2) {
      conversationHistory = [
        conversationHistory[0],
        conversationHistory[1],
        ...conversationHistory.slice(-(maxHistoryTurns * 2)),
      ];
    }
  }
}

async function handleUserInput() {
  const message = userInput.value.trim();
  if (!message) return;
  
  if (!userInput || !sendButton || !chatbox) {
    console.error("Elementos del DOM no disponibles");
    return;
  }
  
  if (message && loadedKnowledge && knowledgeLoaded) {
    // Detectar intención
    const intent = detectIntent(message);
    
    // Extraer datos de la conversación
    extractConversationData(message);
    
    // Manejar intenciones específicas antes de enviar a la API
    if (intent === 'cotizador_completo') {
      addMessage(message, "user");
      const botMessage = "Te voy a dirigir a nuestro cotizador completo donde podrás obtener una cotización detallada paso a paso. ¡Es muy fácil de usar!";
      const buttons = getActionButtons(message, intent, botMessage);
      addMessage(botMessage, "bot", false, buttons);
      setTimeout(() => {
        navigateToPage('cotizador');
      }, 1500);
      userInput.value = "";
      return;
    }
    
    // Si detecta cotización y tiene datos suficientes, calcular precio aproximado
    if (intent === 'cotizar' && conversationData.area) {
      const priceData = calculateApproximatePrice(
        conversationData.area,
        conversationData.sistema,
        conversationData.acabados,
        conversationData.pisos,
        conversationData.ubicacion,
        conversationData.tipoVivienda
      );
      
      addMessage(message, "user");
      
      let priceMessage = `Basándome en los datos que mencionaste, aquí tienes una **estimación aproximada**:\n\n`;
      priceMessage += `💰 **Precio estimado total**: $${priceData.total.toLocaleString('es-CO')}\n`;
      priceMessage += `📐 **Área**: ${priceData.area} m²\n`;
      priceMessage += `🏗️ **Sistema**: ${priceData.sistema === 'eps' ? 'Paneles EPS' : 'Plaqueta de Concreto'}\n`;
      priceMessage += `✨ **Acabados**: ${priceData.acabados === 'obra-negra' ? 'Obra Negra' : priceData.acabados === 'gris' ? 'Obra Gris' : 'Obra Blanca'}\n`;
      priceMessage += `📊 **Precio por m²**: $${priceData.precioM2.toLocaleString('es-CO')}\n\n`;
      priceMessage += `⚠️ **Importante**: Esta es solo una estimación aproximada. Los precios finales pueden variar según condiciones específicas del terreno, permisos, y otros factores.\n\n`;
      priceMessage += `Para una cotización más precisa y detallada, te recomiendo usar nuestro **cotizador completo** o contactarnos directamente.`;
      
      const buttons = getActionButtons(message, intent, priceMessage);
      addMessage(priceMessage, "bot", false, buttons);
      conversationHistory.push({ role: "user", parts: [{ text: message }] });
      conversationHistory.push({ role: "model", parts: [{ text: priceMessage }] });
      userInput.value = "";
      displaySuggestions();
      return;
    }
    
    // Manejar navegación a páginas
    if (intent === 'modelos') {
      addMessage(message, "user");
      const botMessage = "Te voy a dirigir a nuestra página de modelos donde podrás ver todos nuestros diseños disponibles. ¡Espero que encuentres el modelo perfecto para ti!";
      const buttons = getActionButtons(message, intent, botMessage);
      addMessage(botMessage, "bot", false, buttons);
      setTimeout(() => {
        navigateToPage('modelos');
      }, 1500);
      userInput.value = "";
      return;
    }
    
    // PRIMERO: Buscar en la base de conocimiento local
    const localSearchResult = searchInKnowledgeBase(message);
    
    // Si encontramos información relevante en la base local, usarla
    if (localSearchResult && localSearchResult.found && localSearchResult.score > 2) {
      addMessage(message, "user");
      conversationHistory.push({ role: "user", parts: [{ text: message }] });
      
      // Construir respuesta basada en la información local
      let botResponse = localSearchResult.answer;
      
      // Agregar contexto adicional si es necesario
      if (botResponse.length < 200) {
        // Si la respuesta es muy corta, complementar con información adicional
        botResponse += "\n\nSi necesitas más información específica o tienes preguntas adicionales, no dudes en preguntarme.";
      }
      
      // Obtener botones de acción según el contexto (incluyendo análisis de la respuesta)
      const buttons = getActionButtons(message, intent, botResponse);
      
      // Agregar mensaje con botones
      addMessage(botResponse, "bot", true, buttons);
      conversationHistory.push({ role: "model", parts: [{ text: botResponse }] });
      userInput.value = "";
      displaySuggestions();
      return;
    }
    
    // Si no encontramos suficiente información local, usar la API de IA
    // Solo para información muy específica o que requiera búsqueda en internet
    addMessage(message, "user");
    conversationHistory.push({ role: "user", parts: [{ text: message }] });
    userInput.value = "";
    
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      userInput.blur();
    } else {
      userInput.focus();
    }
    sendButton.disabled = true;
    if (suggestionsContainer) suggestionsContainer.innerHTML = "";
    getApiResponse(intent, message);
  } else if (!loadedKnowledge || !knowledgeLoaded) {
    console.warn("La información base aún no está lista.");
    addMessage(
      "El asistente aún se está cargando. Por favor, espera un momento e intenta de nuevo.",
      "bot",
      false
    );
    setTimeout(() => {
      if (sendButton && userInput) {
        sendButton.disabled = !userInput.value.trim();
      }
    }, 2000);
  }
}

function displaySuggestions() {
  suggestionsContainer.innerHTML = "";
  const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
  const questionsToShow = shuffled.slice(0, 2);

  questionsToShow.forEach((question, index) => {
    const button = document.createElement("button");
    button.textContent = question;
    button.setAttribute("aria-label", `Pregunta sugerida: ${question}`);
    button.classList.add(
      "suggestion-chip",
      "bg-white", "dark:bg-gray-800",
      "text-gray-700", "dark:text-gray-200",
      "text-xs", "py-2.5", "px-4", "rounded-full",
      "hover:bg-gray-100", "dark:hover:bg-gray-700",
      "border", "border-gray-200", "dark:border-gray-700",
      "shadow-sm", "font-medium"
    );
    button.style.animationDelay = `${index * 0.15}s`;
    button.style.opacity = "0";
    button.classList.add("animate-new-message");
    
    setTimeout(() => {
      button.style.opacity = "1";
    }, index * 50);
    button.onclick = () => {
      if (!loadedKnowledge || !knowledgeLoaded) return;
      userInput.value = question;
      handleUserInput();
    };
    suggestionsContainer.appendChild(button);
  });
}

function clearChat() {
  chatbox.innerHTML = "";
  conversationData = {}; // Limpiar datos de conversación
  if (!initialContext) {
     addMessage("No se puede reiniciar el chat, hubo un error al cargar la configuración inicial.", "bot", false);
     return;
  }
  initializeConversationHistory();
  if (conversationHistory.length > 1 && conversationHistory[1].parts[0].text) {
    const initialBotMessageText = conversationHistory[1].parts[0].text;
    addMessage(initialBotMessageText, "bot", false);
  } else {
     addMessage("¡Hola! ¿En qué puedo ayudarte sobre CONCASAYA y casas prefabricadas?", "bot", false);
  }
  updateScrollButton();
  displaySuggestions();
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
  if (!themeIconLight || !themeIconDark) return;
  
  if (isDark) {
    themeIconLight.classList.remove("hidden");
    themeIconLight.classList.add("inline");
    themeIconDark.classList.add("hidden");
    themeIconDark.classList.remove("inline");
  } else {
    themeIconLight.classList.add("hidden");
    themeIconLight.classList.remove("inline");
    themeIconDark.classList.remove("hidden");
    themeIconDark.classList.add("inline");
  }
}

// Función para cargar la base de conocimiento desde JSON
async function loadKnowledgeFromJSON() {
  try {
    console.log("Cargando base de conocimiento desde JSON...");
    const response = await fetch(KNOWLEDGE_BASE_URL);
    
    if (!response.ok) {
      throw new Error(`Error al cargar JSON: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.knowledge_content) {
      loadedKnowledge = data.knowledge_content;
      knowledgeLoaded = true;
      console.log("✓ Base de conocimiento cargada desde JSON (" + loadedKnowledge.length + " caracteres)");
      return true;
    } else {
      throw new Error("El archivo JSON no contiene knowledge_content válido");
    }
  } catch (error) {
    console.error("Error al cargar conocimiento desde JSON:", error);
    const savedKnowledge = localStorage.getItem('concasaya_knowledge_backup');
    if (savedKnowledge) {
      console.log("✓ Cargando conocimiento desde localStorage (backup)");
      loadedKnowledge = savedKnowledge;
      knowledgeLoaded = true;
      return true;
    }
    throw error;
  }
}

// Función para inicializar la aplicación
async function initializeApp() {
  // Inicializar referencias a elementos del DOM
  chatbox = document.getElementById("chatbox");
  userInput = document.getElementById("userInput");
  sendButton = document.getElementById("sendButton");
  themeToggle = document.getElementById("theme-toggle");
  themeIconLight = document.getElementById("theme-icon-light");
  themeIconDark = document.getElementById("theme-icon-dark");
  suggestionsContainer = document.getElementById("suggestions");
  clearChatButton = document.getElementById("clearChatButton");
  scrollToBottomBtn = document.getElementById("scrollToBottomBtn");

  // Verificar que los elementos críticos existan
  if (!chatbox || !userInput || !sendButton) {
    console.error("Error: No se pudieron encontrar elementos críticos del DOM");
    return;
  }

  // Aplicar tema guardado
  const savedTheme = localStorage.getItem("theme");
  const initialTheme = savedTheme ?? "dark";
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  if (themeIconLight && themeIconDark) {
    updateThemeIcons(initialTheme === "dark");
  }

  // Agregar event listeners
  sendButton.addEventListener("click", handleUserInput);
  userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleUserInput();
    }
  });
  userInput.addEventListener("input", () => {
    const hasText = userInput.value.trim().length > 0;
    sendButton.disabled = !hasText || (!loadedKnowledge || !knowledgeLoaded);
  });
  
  sendButton.disabled = !userInput.value.trim();
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
  if (clearChatButton) clearChatButton.addEventListener("click", clearChat);

  if (scrollToBottomBtn) {
    scrollToBottomBtn.addEventListener("click", () => {
      smoothScrollToBottom();
    });
  }

  chatbox.addEventListener("scroll", updateScrollButton);
  
  // Event listeners para el modal de bienvenida
  const startChatButton = document.getElementById("startChatButton");
  const closeWelcomeModal = document.getElementById("closeWelcomeModal");
  
  if (startChatButton) {
    startChatButton.addEventListener("click", hideWelcomeModal);
  }
  
  if (closeWelcomeModal) {
    closeWelcomeModal.addEventListener("click", hideWelcomeModal);
  }
  
  const welcomeModal = document.getElementById("welcomeModal");
  if (welcomeModal) {
    welcomeModal.addEventListener("click", (e) => {
      if (e.target === welcomeModal) {
        hideWelcomeModal();
      }
    });
  }
  
  showWelcomeModal();

  // Cargar la base de conocimiento desde JSON
  try {
    addMessage("Cargando asistente...", "bot", false);
    userInput.disabled = true;
    sendButton.disabled = true;
    suggestionsContainer.innerHTML = "";

    await loadKnowledgeFromJSON();
    
    buildInitialContext();
    initializeConversationHistory();

    chatbox.innerHTML = "";
    if (conversationHistory.length > 1 && conversationHistory[1].parts[0].text) {
      const initialBotMessageText = conversationHistory[1].parts[0].text;
      addMessage(initialBotMessageText, "bot", false);
    } else {
      addMessage("¡Hola! Soy el asistente virtual de CONCASAYA. ¿En qué puedo ayudarte hoy?", "bot", false);
    }
    displaySuggestions();
    if (userInput) userInput.disabled = false;
    if (sendButton) sendButton.disabled = !userInput.value.trim();
    if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      if (userInput) userInput.focus();
    }
    if (scrollToBottomBtn) updateScrollButton();
  } catch (error) {
    console.error("Error al cargar conocimiento desde JSON:", error);
    chatbox.innerHTML = "";
    addMessage(
      `Error: No se pudo cargar la información inicial del asistente (${
        error.message || "Error desconocido"
      }). Verifica la conexión o contacta a CONCASAYA directamente.`,
      "bot",
      false
    );
    userInput.disabled = true;
    sendButton.disabled = true;
    if (suggestionsContainer) {
      suggestionsContainer.innerHTML =
        '<p class="text-red-500 text-xs">Error al cargar configuración.</p>';
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
