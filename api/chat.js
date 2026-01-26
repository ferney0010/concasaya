// ============================================
// API DE PERPLEXITY - CONCASAYA CHATBOT
// ============================================
// Vercel usa Node.js 18+ que tiene fetch nativo
// API de Perplexity - formato compatible con OpenAI
// Modelo: sonar-pro
// ============================================
 
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // API Key de Perplexity (hardcoded para uso público temporal)
    const PERPLEXITY_API_KEY = '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';

    console.log('Usando API de Perplexity con modelo sonar-pro');
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
        console.error('Error inesperado en la función serverless:', error);
        return res.status(500).json({ 
            error: `Error interno del servidor: ${error.message}` 
        });
    }
};
