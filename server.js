const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Cloudflare Pages sirve URLs "pretty" (/materiales -> materiales.html).
// Express no lo hace, asi que replicamos esa resolucion para que el preview
// local navegue igual que produccion.
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.includes('.')) return next();
    const base = path.join(__dirname, req.path);
    const fs = require('fs');
    for (const candidate of [base + '.html', path.join(base, 'index.html')]) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return res.sendFile(candidate);
        }
    }
    next();
});

// Redirect permanente: URL antigua del cotizador
app.get('/cotizador-encuesta.html', (req, res) => {
    res.redirect(301, '/cotizador-precios-casas-prefabricadas.html');
});

// Ruta para el API del chatbot
app.post('/api/chat', async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // API Key de Perplexity: debe estar configurada como variable de entorno.
    // Chatbot desactivado temporalmente (2026-07); si se reactiva,
    // configurar PERPLEXITY_API_KEY en Vercel → Settings → Environment Variables.
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

    const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

    try {
        const { conversationHistory } = req.body;

        if (!conversationHistory || !Array.isArray(conversationHistory)) {
            return res.status(400).json({ error: 'Formato de historial de conversación inválido.' });
        }

        // Convertir el formato del frontend a formato de Perplexity (OpenAI-compatible)
        const messages = conversationHistory.map(msg => {
            if (msg.role === 'user') {
                return { role: 'user', content: msg.parts?.[0]?.text || msg.text || '' };
            } else if (msg.role === 'model') {
                return { role: 'assistant', content: msg.parts?.[0]?.text || msg.text || '' };
            }
            return { role: msg.role || 'user', content: msg.parts?.[0]?.text || msg.text || '' };
        }).filter(msg => msg.content); // Filtrar mensajes vacíos

        const requestBody = {
            model: 'sonar-pro',
            messages: messages,
            temperature: 0.5,
            max_tokens: 300
        };

        console.log('Enviando solicitud a Perplexity API...');
        const perplexityResponse = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await perplexityResponse.json();

        if (!perplexityResponse.ok) {
            console.error('Error de API Perplexity:', responseData);
            return res.status(perplexityResponse.status).json({
                error: `Error de API Perplexity: ${responseData.error?.message || perplexityResponse.statusText}`
            });
        }

        // Convertir respuesta de Perplexity al formato esperado por el frontend
        const formattedResponse = {
            candidates: [{
                content: {
                    parts: [{
                        text: responseData.choices?.[0]?.message?.content || ''
                    }]
                }
            }]
        };

        return res.status(200).json(formattedResponse);

    } catch (error) {
        console.error('Error inesperado en el servidor:', error);
        return res.status(500).json({ 
            error: `Error interno del servidor: ${error.message}` 
        });
    }
});

// Ruta para servir archivos estáticos
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path === '/' ? 'index.html' : req.path));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`💡 Para probar el chatbot, visita: http://localhost:${PORT}/chatbot.html`);
});
