import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuración de Dify
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY; // Usar Service Secret Key aquí

app.use(cors());
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
    console.error('Error in /api/azure/chat/completions proxy:', error);
    res.status(500).json({ error: 'Internal server error in AI chat proxy' });
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


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
