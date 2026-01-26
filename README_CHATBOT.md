# Chatbot CONCASAYA - Guía de Configuración

## Configuración para Desarrollo Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
PERPLEXITY_API_KEY=tu_clave_aqui
PORT=3000
```

**Nota:** Obtén tu clave de API de Perplexity en: https://www.perplexity.ai/

### 3. Iniciar el servidor de desarrollo

```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### 4. Acceder al chatbot

- Chatbot: http://localhost:3000/chatbot.html
- Panel de administración: http://localhost:3000/admin/chatbot-admin.html

## Configuración para Producción (Vercel)

### Variables de entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega: `PERPLEXITY_API_KEY` con tu clave de API

### Estructura de archivos

- `api/chat.js` - Función serverless para Vercel
- `chatbot.html` - Interfaz del chatbot
- `assets/js/chatbot.js` - Lógica del frontend
- `knowledge_base.json` - Base de conocimiento
- `admin/chatbot-admin.html` - Panel de administración

## Solución de Problemas

### Error 500: PERPLEXITY_API_KEY no está definida

**En desarrollo local:**
- Verifica que el archivo `.env` existe y contiene `PERPLEXITY_API_KEY`
- Reinicia el servidor después de crear/modificar `.env`

**En producción:**
- Verifica que la variable de entorno está configurada en Vercel
- Asegúrate de que el nombre de la variable sea exactamente `PERPLEXITY_API_KEY`

### Error de conexión / Failed to fetch

- En desarrollo local: Asegúrate de que el servidor está ejecutándose (`npm start`)
- Verifica que estás accediendo a `http://localhost:3000/chatbot.html` y no abriendo el archivo directamente

### El chatbot no responde

- Verifica la consola del navegador para ver errores específicos
- Verifica que `knowledge_base.json` está cargado correctamente
- Verifica que la API de Perplexity está respondiendo (revisa los logs del servidor)
