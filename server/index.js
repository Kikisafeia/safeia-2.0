import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') }); // Load .env from the server directory

const app = express();
const port = process.env.PORT || 3001;

// Configuración de Dify
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY; // Usar Service Secret Key aquí

app.use(cors({
  origin: ['http://localhost:3000', 'https://safeia-2.firebaseapp.com', 'https://safeia-2.web.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Lista predefinida de agentes
const agents = [
  {
    id: 'safety-agent',
    name: 'Agente de Seguridad',
    description: 'Especializado en seguridad y prevención de riesgos laborales',
    status: 'active',
    capabilities: ['Análisis de riesgos', 'Recomendaciones de seguridad', 'Protocolos de emergencia']
  },
  {
    id: 'legal-agent',
    name: 'Agente Legal',
    description: 'Experto en legislación laboral y normativas',
    status: 'active',
    capabilities: ['Asesoría legal', 'Normativas laborales', 'Derechos y obligaciones']
  }
];

// Endpoint para listar agentes
app.get('/api/agents', (req, res) => {
  try {
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener un agente específico
app.get('/api/agents/:id', (req, res) => {
  try {
    const agent = agents.find(a => a.id === req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para el chat con un agente usando Dify
app.post('/api/agents/:id/chat', async (req, res) => {
  try {
    const { query, conversation_id, files } = req.body;

    console.log('Received request body:', req.body);

    // Preparar el mensaje para Dify
    const messageData = {
      inputs: {},
      query,
      response_mode: 'streaming',
      conversation_id: conversation_id || undefined,
      user: req.body.user || 'default-user'
    };

    if (files && files.length > 0) {
      messageData.files = files;
    }

    console.log('Sending to Dify:', {
      url: `${DIFY_API_URL}/chat-messages`,
      headers: {
        'Authorization': 'Bearer ' + DIFY_API_KEY.substring(0, 10) + '...',
        'Content-Type': 'application/json'
      },
      messageData
    });

    // Configurar headers para Dify
    const headers = {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json'
    };

    if (messageData.response_mode === 'streaming') {
      headers['Accept'] = 'text/event-stream';
    }

    // Llamar a la API de Dify
    const difyResponse = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(messageData)
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Error from Dify:', {
        status: difyResponse.status,
        headers: Object.fromEntries(difyResponse.headers.entries()),
        body: errorText
      });
      throw new Error(`Dify API error: ${difyResponse.status} - ${errorText}`);
    }

    // Si es streaming, configurar SSE
    if (messageData.response_mode === 'streaming') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Pipe la respuesta de Dify al cliente
      difyResponse.body.pipe(res);

      // Manejar desconexión del cliente
      req.on('close', () => {
        difyResponse.body.destroy();
      });
    } else {
      // Para respuestas no streaming
      const data = await difyResponse.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener el estado de un agente
app.get('/api/agents/:id/status', (req, res) => {
  try {
    const agent = agents.find(a => a.id === req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json({ status: agent.status });
  } catch (error) {
    console.error('Error fetching agent status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Azure OpenAI Chat Completions Proxy Endpoint
app.post('/api/azure/chat/completions', async (req, res) => {
  try {
    const { messages, temperature, max_tokens, deploymentId, response_format } = req.body; // Added stream

    if (!messages) {
      return res.status(400).json({ error: 'Missing "messages" in request body' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = deploymentId || process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI Chat configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI chat service.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const requestBody = {
      messages,
      temperature: temperature !== undefined ? temperature : 0.7, // Default temperature
      max_tokens: max_tokens !== undefined ? max_tokens : 2000,  // Default max_tokens
      // stream: stream || false, // Default to non-streaming if not specified
    };

    if (response_format) {
      requestBody.response_format = response_format;
    }

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI Chat service:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to get response from Azure OpenAI Chat service', 
        details: responseData 
      });
    }

    res.json(responseData);

  } catch (error) {
    console.error('RAW ERROR in /api/azure/chat/completions proxy:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error in AI chat proxy', details: error.message });
  }
});

// Azure DALL-E Image Generation Proxy Endpoint
app.post('/api/azure/images/generations', async (req, res) => {
  try {
    const { prompt, n, size, quality, style, deploymentId } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing "prompt" in request body' });
    }

    const dalleEndpoint = process.env.AZURE_DALLE_ENDPOINT;
    const apiKey = process.env.AZURE_DALLE_API_KEY; // Assuming same key, or use AZURE_DALLE_API_KEY if different
    const dalleDeployment = deploymentId || process.env.AZURE_DALLE_DEPLOYMENT;
    const apiVersion = process.env.AZURE_DALLE_API_VERSION;

    if (!dalleEndpoint || !apiKey || !dalleDeployment || !apiVersion) {
      console.error('Azure DALL-E configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI image generation service.' });
    }
    
    // Construct the full API URL correctly
    // Example: https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/images/generations?api-version=2023-12-01-preview
    const apiUrl = `${dalleEndpoint.replace(/\/$/, '')}/openai/deployments/${dalleDeployment}/images/generations?api-version=${apiVersion}`;

    const requestBody = {
      prompt,
      n: n !== undefined ? n : 1,
      size: size !== undefined ? size : "1024x1024",
      quality: quality !== undefined ? quality : "standard",
      style: style !== undefined ? style : "vivid", // DALL-E 3 default is vivid or natural
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure DALL-E service:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to get response from Azure DALL-E service', 
        details: responseData 
      });
    }

    res.json(responseData);

  } catch (error) {
    console.error('Error in /api/azure/images/generations proxy:', error);
    res.status(500).json({ error: 'Internal server error in AI image generation proxy' });
  }
});

// New endpoint for searching legislation
app.post('/api/legislation/search-ats', async (req, res) => {
  const { pais, sector } = req.body;

  if (!pais || !sector) {
    return res.status(400).json({ error: 'Faltan los parámetros "pais" o "sector".' });
  }

  try {
    // Step 1: Call Brave Search (via MCP Router, assumed to be on localhost:8000)
    const mcpRouterUrl = process.env.MCP_ROUTER_URL || 'http://localhost:8000/invoke'; // Allow override via .env
    const searchQuery = `legislación seguridad laboral ${sector} ${pais}`;
    
    let braveSearchResults = [];
    try {
      const braveSearchPayload = {
        server_name: 'github.com/modelcontextprotocol/servers/tree/main/src/brave-search', // Target Brave server
        tool_name: 'brave_web_search',
        arguments: {
          query: searchQuery,
          count: 3, // Get top 3 results for summarization
        },
      };

      const mcpResponse = await fetch(mcpRouterUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(braveSearchPayload),
      });

      if (!mcpResponse.ok) {
        const errorText = await mcpResponse.text();
        console.error(`Error from MCP Router calling Brave Search: ${mcpResponse.status} - ${errorText}`);
        // Don't fail entirely, proceed without legislation or with a placeholder
        braveSearchResults = [{ title: "Error al buscar legislación", description: "No se pudo contactar el servicio de búsqueda." }];
      } else {
        const mcpResult = await mcpResponse.json();
        // Assuming mcpResult.result is the actual array of search results from Brave
        if (mcpResult && mcpResult.result && Array.isArray(mcpResult.result)) {
          braveSearchResults = mcpResult.result;
        } else {
           console.warn('Brave Search results format unexpected via MCP:', mcpResult);
           braveSearchResults = [{ title: "Formato de búsqueda inesperado", description: "La respuesta del servicio de búsqueda no fue la esperada." }];
        }
      }
    } catch (searchError) {
      console.error('Failed to call Brave Search via MCP Router:', searchError);
      braveSearchResults = [{ title: "Error de conexión en búsqueda", description: "No se pudo conectar con el servicio de búsqueda." }];
    }

    // Step 2: Process and Summarize search results using Azure OpenAI
    let legislacionAplicable = "No se pudo determinar la legislación aplicable automáticamente.";
    if (braveSearchResults.length > 0 && !braveSearchResults[0].title.startsWith("Error")) {
      const snippetsToSummarize = braveSearchResults
        .map(r => `${r.title || ''}: ${r.description || ''}`)
        .join('\n\n---\n\n');

      if (snippetsToSummarize.trim()) {
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

        if (azureEndpoint && apiKey && chatDeployment && apiVersion) {
          const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;
          const summarizationPrompt = `Dada la siguiente información de resultados de búsqueda sobre legislación laboral en ${pais} para el sector ${sector}:\n\n${snippetsToSummarize}\n\nExtrae y resume concisamente las 2-3 leyes, decretos o normativas más importantes y pertinentes en un solo párrafo. Si hay URLs oficiales, menciónalas brevemente.`;
          
          const summaryPayload = {
            messages: [
              { role: 'system', content: 'Eres un asistente experto en resumir textos legales de forma concisa y precisa.' },
              { role: 'user', content: summarizationPrompt },
            ],
            temperature: 0.3,
            max_tokens: 250,
          };

          try {
            const summaryAzureResponse = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
              },
              body: JSON.stringify(summaryPayload),
            });

            const summaryResponseData = await summaryAzureResponse.json();

            if (summaryAzureResponse.ok && summaryResponseData.choices && summaryResponseData.choices[0]?.message?.content) {
              legislacionAplicable = summaryResponseData.choices[0].message.content.trim();
            } else {
              console.error('Error from Azure OpenAI summarization service:', summaryResponseData);
            }
          } catch (summaryError) {
            console.error('Error calling Azure OpenAI for summarization:', summaryError);
          }
        } else {
          console.error('Azure OpenAI configuration for summarization missing in server .env.');
        }
      }
    }
    
    res.json({ legislacionAplicable });

  } catch (error) {
    console.error('Error en /api/legislation/search-ats:', error.message, error.stack);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ 
        error: 'Error interno del servidor al buscar legislación.', 
        details: error instanceof Error ? error.message : String(error) 
      });
    } else {
      console.error("Headers already sent, couldn't send JSON error response for /api/legislation/search-ats");
    }
  }
});


// Endpoint for risk matrix generation
app.post('/api/ai/risk-matrix', async (req, res) => {
  try {
    const { company, sector, processes, workers, history } = req.body;

    // Validate required fields
    if (!company || !sector || !processes || workers === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare prompt for AI analysis
    const prompt = `Genera una matriz de riesgos laborales para:
- Empresa: ${company}
- Sector: ${sector}
- Procesos: ${processes}
- Trabajadores: ${workers}
${history ? `- Historial: ${history}\n` : ''}

Identifica peligros, evalúa probabilidad/consecuencia y propone medidas de control.`;

    // Call Azure OpenAI
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      throw new Error('Azure OpenAI configuration missing');
    }

    const apiUrl = `${azureEndpoint}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en seguridad laboral que genera matrices de riesgo detalladas con: peligro, riesgo, probabilidad, consecuencia, nivel y medidas de control.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate risk matrix');
    }

    // Parse AI response into structured format
    const result = {
      riesgos: parseRisks(data.choices[0]?.message?.content),
      resumen: {
        alto: 0,
        medio: 0,
        bajo: 0
      }
    };

    // Calculate summary counts
    result.riesgos.forEach(riesgo => {
      if (riesgo.nivel === 'Alto') result.resumen.alto++;
      else if (riesgo.nivel === 'Medio') result.resumen.medio++;
      else result.resumen.bajo++;
    });

    res.json(result);

  } catch (error) {
    console.error('Error generating risk matrix:', error);
    res.status(500).json({ 
      error: 'Error generating risk matrix',
      details: error.message
    });
  }
});

// Helper function to parse AI response
function parseRisks(content) {
  if (!content) return [];
  
  // This is a simplified parser - would need to be enhanced based on actual AI response format
  const lines = content.split('\n').filter(line => line.trim());
  const risks = [];
  let currentRisk = {};

  for (const line of lines) {
    if (line.includes('Peligro:')) {
      if (Object.keys(currentRisk).length) risks.push(currentRisk);
      currentRisk = {
        peligro: line.replace('Peligro:', '').trim(),
        medidas: []
      };
    } else if (line.includes('Riesgo:')) {
      currentRisk.riesgo = line.replace('Riesgo:', '').trim();
    } else if (line.includes('Probabilidad:')) {
      currentRisk.probabilidad = line.replace('Probabilidad:', '').trim();
    } else if (line.includes('Consecuencia:')) {
      currentRisk.consecuencia = line.replace('Consecuencia:', '').trim();
    } else if (line.includes('Nivel:')) {
      currentRisk.nivel = line.replace('Nivel:', '').trim();
    } else if (line.includes('Medida:')) {
      currentRisk.medidas.push(line.replace('Medida:', '').trim());
    }
  }

  if (Object.keys(currentRisk).length) risks.push(currentRisk);
  return risks;
}

// Image Analysis Endpoint
app.post('/api/ai/image-analysis', async (req, res) => {
  try {
    // This would normally handle file uploads, but we'll mock the response
    // since the actual implementation would require proper file handling
    
    const { features, workplaceType } = req.body;

    if (!features || !workplaceType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock response - in a real implementation this would call Azure Computer Vision
    // or another image analysis service
    const mockResponse = {
      detections: features.map(feature => ({
        type: feature,
        confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5-1.0
        position: {
          x: Math.floor(Math.random() * 800),
          y: Math.floor(Math.random() * 600)
        },
        dimensions: {
          width: Math.floor(Math.random() * 100) + 50,
          height: Math.floor(Math.random() * 100) + 50
        }
      })),
      imageWidth: 800,
      imageHeight: 600
    };

    res.json(mockResponse);

  } catch (error) {
    console.error('Error in image analysis:', error);
    res.status(500).json({ 
      error: 'Error processing image',
      details: error.message 
    });
  }
});

// PTS Suggestions Endpoint
app.post('/api/ai/pts-suggestions', async (req, res) => {
  try {
    const { sector, processType } = req.body;

    if (!sector || !processType) {
      return res.status(400).json({ error: 'Missing "sector" or "processType" in request body' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI PTS suggestions.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const prompt = `Genera 5 sugerencias concisas de actividades para procedimientos de trabajo seguro (PTS) en el sector ${sector} para procesos de tipo ${processType}. 
Cada sugerencia debe ser una frase corta y práctica.`;

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad laboral que genera sugerencias prácticas de actividades para PTS en diferentes sectores industriales.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to get response from Azure OpenAI', 
        details: responseData 
      });
    }

    // Parse the AI response into an array of suggestions
    const content = responseData.choices[0]?.message?.content;
    const suggestions = content 
      ? content.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, '').trim())
      : [];

    res.json({ suggestions });

  } catch (error) {
    console.error('Error in /api/ai/pts-suggestions:', error);
    res.status(500).json({ 
      error: 'Internal server error generating PTS suggestions',
      details: error.message 
    });
  }
});

// ATS Activity Suggestions Endpoint
app.post('/api/ai/suggest-actividades', async (req, res) => {
  try {
    const { cargo, sector, empresa } = req.body;

    if (!cargo || !sector || !empresa) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: cargo, sector, empresa' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI suggestions.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const prompt = `Genera 5 sugerencias concisas de actividades laborales para el cargo de ${cargo} en el sector ${sector} de la empresa ${empresa}.
Cada sugerencia debe ser una frase corta y práctica.`;

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad laboral que genera sugerencias prácticas de actividades para diferentes cargos y sectores.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to get response from Azure OpenAI', 
        details: responseData 
      });
    }

    // Parse the AI response into an array of suggestions
    const content = responseData.choices[0]?.message?.content;
    const suggestions = content 
      ? content.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, '').trim())
      : [];

    res.json({ suggestions });

  } catch (error) {
    console.error('Error in /api/ai/suggest-actividades:', error);
    res.status(500).json({ 
      error: 'Internal server error generating activity suggestions',
      details: error.message 
    });
  }
});

// Material Suggestions Endpoint
app.post('/api/ai/suggest-materiales', async (req, res) => {
  try {
    const { actividades, sector } = req.body;

    if (!actividades || !sector) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: actividades, sector' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI material suggestions.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const prompt = `Genera 5 sugerencias concisas de materiales peligrosos o relevantes para las siguientes actividades en el sector ${sector}:
    
Actividades: ${actividades}

Cada sugerencia debe ser una frase corta y práctica.`;

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad laboral que genera sugerencias prácticas de materiales relevantes para diferentes actividades y sectores.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to get response from Azure OpenAI', 
        details: responseData 
      });
    }

    // Parse the AI response into an array of suggestions
    const content = responseData.choices[0]?.message?.content;
    const suggestions = content 
      ? content.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, '').trim())
      : [];

    res.json({ suggestions });

  } catch (error) {
    console.error('Error in /api/ai/suggest-materiales:', error);
    res.status(500).json({ 
      error: 'Internal server error generating material suggestions',
      details: error.message 
    });
  }
});

// DAS Generation Endpoint
app.post('/api/ai/das', async (req, res) => {
  try {
    const { empresa, cargo, area, pais, sector, actividades, equipos, materiales, legislacionAplicable } = req.body;

    if (!empresa || !cargo || !area || !pais || !sector || !actividades || !equipos || !materiales) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI DAS generation.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const prompt = `Genera un Documento de Análisis de Seguridad (DAS) para:
- Empresa: ${empresa}
- Cargo: ${cargo} 
- Área: ${area}
- País: ${pais}
- Sector: ${sector}
- Actividades: ${actividades}
- Equipos: ${equipos}
- Materiales: ${materiales}
${legislacionAplicable ? `- Legislación aplicable: ${legislacionAplicable}\n` : ''}

El DAS debe incluir:
1. Etapas del proceso
2. Riesgos, aspectos e incidentes potenciales para cada etapa
3. Medidas preventivas para cada riesgo
4. Legislación aplicable (si se proporcionó)`;

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad laboral que genera Documentos de Análisis de Seguridad (DAS) detallados y profesionales.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to generate DAS', 
        details: responseData 
      });
    }

    // Parse the AI response
    const content = responseData.choices[0]?.message?.content;
    let dasResponse;
    try {
      dasResponse = content ? JSON.parse(content) : { etapas: [] };
    } catch (e) {
      console.error('Error parsing DAS response:', e);
      dasResponse = { etapas: [] };
    }

    // Add original legislation if provided
    if (legislacionAplicable) {
      dasResponse.legislacionAplicableOriginal = legislacionAplicable;
    }

    res.json(dasResponse);

  } catch (error) {
    console.error('Error in /api/ai/das:', error);
    res.status(500).json({ 
      error: 'Internal server error generating DAS',
      details: error.message 
    });
  }
});

// Equipment Suggestions Endpoint
app.post('/api/ai/suggest-equipos', async (req, res) => {
  try {
    const { actividades, sector } = req.body;

    if (!actividades || !sector) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos: actividades, sector' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI equipment suggestions.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const prompt = `Genera 5 sugerencias concisas de equipos de protección personal (EPP) y herramientas necesarias para las siguientes actividades en el sector ${sector}:
    
Actividades: ${actividades}

Cada sugerencia debe ser una frase corta y práctica.`;

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad laboral que genera sugerencias prácticas de equipos y EPP para diferentes actividades y sectores.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to get response from Azure OpenAI', 
        details: responseData 
      });
    }

    // Parse the AI response into an array of suggestions
    const content = responseData.choices[0]?.message?.content;
    const suggestions = content 
      ? content.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, '').trim())
      : [];

    res.json({ suggestions });

  } catch (error) {
    console.error('Error in /api/ai/suggest-equipos:', error);
    res.status(500).json({ 
      error: 'Internal server error generating equipment suggestions',
      details: error.message 
    });
  }
});

// Policy Generation Endpoint
app.post('/api/ai/generate-policy', async (req, res) => {
  try {
    const { company, sector } = req.body;

    if (!company || !sector) {
      return res.status(400).json({ error: 'Missing "company" or "sector" in request body' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI policy generation.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const prompt = `Genera una política de seguridad y salud en el trabajo para la empresa ${company} del sector ${sector}.
La política debe ser profesional, clara y cubrir los aspectos principales requeridos por la normativa.`;

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad laboral que genera políticas de seguridad profesionalmente redactadas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to generate policy', 
        details: responseData 
      });
    }

    const content = responseData.choices[0]?.message?.content || '';
    res.json({ content });

  } catch (error) {
    console.error('Error in /api/ai/generate-policy:', error);
    res.status(500).json({ 
      error: 'Internal server error generating policy',
      details: error.message 
    });
  }
});

// Policy Suggestions Endpoint
app.post('/api/ai/policy-suggestions', async (req, res) => {
  try {
    const { sector } = req.body;

    if (!sector) {
      return res.status(400).json({ error: 'Missing "sector" in request body' });
    }

    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const chatDeployment = process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    if (!azureEndpoint || !apiKey || !chatDeployment || !apiVersion) {
      console.error('Azure OpenAI configuration missing in server environment variables.');
      return res.status(500).json({ error: 'Server configuration error for AI policy suggestions.' });
    }

    const apiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${chatDeployment}/chat/completions?api-version=${apiVersion}`;

    const prompt = `Genera 5 sugerencias concisas de políticas de seguridad para el sector ${sector}. 
Cada sugerencia debe ser una frase corta y práctica.`;

    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad laboral que genera sugerencias prácticas de políticas para diferentes sectores industriales.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 300
    };

    const azureResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error('Error from Azure OpenAI:', responseData);
      return res.status(azureResponse.status).json({ 
        error: 'Failed to get response from Azure OpenAI', 
        details: responseData 
      });
    }

    // Parse the AI response into an array of suggestions
    const content = responseData.choices[0]?.message?.content;
    const suggestions = content 
      ? content.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, '').trim())
      : [];

    res.json({ suggestions });

  } catch (error) {
    console.error('Error in /api/ai/policy-suggestions:', error);
    res.status(500).json({ 
      error: 'Internal server error generating policy suggestions',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
