import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import admin from 'firebase-admin';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import fs from 'fs'; // Import fs for file system checks

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (serviceAccountPath) {
    try {
      // Check if the service account file exists
      if (fs.existsSync(serviceAccountPath)) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath)
        });
        console.log('Firebase Admin SDK initialized with service account credentials.');
      } else {
        console.warn(`GOOGLE_APPLICATION_CREDENTIALS is set but file not found at: ${serviceAccountPath}. Falling back to default initialization.`);
        admin.initializeApp();
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK with service account:', error);
      console.log('Falling back to default Firebase Admin SDK initialization.');
      admin.initializeApp(); // Fallback to default initialization
    }
  } else {
    // For environments like Google Cloud Run/Functions, or local development without explicit credentials,
    // this will use default credentials or attempt to discover them.
    console.log('GOOGLE_APPLICATION_CREDENTIALS not set. Initializing Firebase Admin SDK with default credentials.');
    admin.initializeApp();
  }
} else {
  console.log('Firebase Admin SDK already initialized.');
}


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

// New Endpoint for AI Suggestions
app.post('/api/ai/suggestions', async (req, res) => {
  try {
    // 1. Get and verify Firebase ID token from Authorization header
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    // const userId = decodedToken.uid; // userId can be used for logging or further checks

    // 2. Extract data from request body
    const { etapa, categoria, companyProfile, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Bad Request: Missing prompt' });
    }
    if (!etapa || !categoria) {
      return res.status(400).json({ error: 'Bad Request: Missing etapa or categoria' });
    }

    // 3. Initialize Azure OpenAI client with server-side env vars
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY;
    const azureDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;

    const missingAzureVars = [];
    if (!azureEndpoint) missingAzureVars.push('AZURE_OPENAI_ENDPOINT');
    if (!azureApiKey) missingAzureVars.push('AZURE_OPENAI_API_KEY');
    if (!azureDeploymentName) missingAzureVars.push('AZURE_OPENAI_DEPLOYMENT');

    if (missingAzureVars.length > 0) {
      const errorMessage = `Internal server error: The following Azure OpenAI environment variables are not set: ${missingAzureVars.join(', ')}`;
      console.error(errorMessage);
      return res.status(500).json({ error: errorMessage });
    }

    const azureClient = new OpenAIClient(azureEndpoint, new AzureKeyCredential(azureApiKey));

    // 4. Make call to Azure OpenAI
    // The prompt is already constructed by the client, including companyProfile details
    const messages = [
      { role: "system", content: "Eres un asistente experto en SG-SST (Sistema de Gestión de Seguridad y Salud en el Trabajo)." },
      { role: "user", content: prompt }
    ];

    const result = await azureClient.getChatCompletions(azureDeploymentName, messages, {
      maxTokens: 800, // Adjust as needed
      // temperature: 0.7, // Adjust as needed
    });

    let suggestionsContent = "";
    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      suggestionsContent = result.choices[0].message.content || "";
    }

    // Attempt to parse the suggestionsContent if it's a JSON string representing an array,
    // or wrap it if it's plain text.
    // For now, we'll assume the frontend expects an array of AISuggestion objects.
    // And that Azure returns a text that we can parse or use directly.
    // This part might need refinement based on actual Azure OpenAI output format.
    let suggestionsList = [];
    try {
      // If Azure returns a JSON string of suggestions:
      // suggestionsList = JSON.parse(suggestionsContent);
      // For now, let's assume Azure returns plain text and we create one suggestion object.
      // The client expects: { content: string, confidence: number, category: string }
      // We are only getting content from Azure directly. Confidence and category are not part of this basic setup.
      // Let's return the raw content as a single suggestion for now.
      // The frontend currently expects AISuggestion[], so we'll wrap it.
      if (suggestionsContent) {
        suggestionsList.push({
          content: suggestionsContent,
          confidence: 0.9, // Placeholder confidence
          category: categoria // Use the input category
        });
      }
    } catch (parseError) {
      console.error("Error parsing suggestions from AI, returning raw content:", parseError);
      // Fallback if parsing fails, though not strictly needed with the current single-push approach
      if (suggestionsContent) {
         suggestionsList.push({ content: suggestionsContent, confidence: 0.8, category: categoria });
      }
    }

    // 5. Send response
    res.json(suggestionsList); // Client expects AISuggestion[]

  } catch (error) {
    console.error('Error in /api/ai/suggestions:', error);
    if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }
    // Check if it's an Azure error
    if (error.statusCode && error.message) { // Azure SDK errors often have statusCode
        return res.status(error.statusCode).json({ error: `Azure API error: ${error.message}` });
    }
    res.status(500).json({ error: 'Internal server error' });
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
        'Authorization': '[REDACTED]', // Redact Dify API Key from logs
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
