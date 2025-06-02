import express from 'express';
import helmet from 'helmet';
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
app.use(helmet()); // Add helmet middleware for security headers

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
    console.error('Detailed error fetching agents:', error); // Log detailed error
    res.status(500).json({ error: 'An unexpected error occurred while fetching agents.' }); // Send generic message
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
      const detailErrorMessage = `Internal server error: The following Azure OpenAI environment variables are not set: ${missingAzureVars.join(', ')}`;
      console.error(detailErrorMessage); // Log detailed error
      return res.status(500).json({ error: 'AI service configuration error' }); // Send generic message
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
    console.error('Detailed error in /api/ai/suggestions:', error); // Log detailed error
    if (error.code === 'auth/id-token-expired') {
        // Specific, user-friendly message for expired token
        return res.status(401).json({ error: 'Unauthorized: Token expired. Please log in again.' });
    }
    // Check if it's an Azure SDK error (these often have a statusCode property)
    if (error.statusCode) { 
        // Log the specific Azure error message for server-side debugging
        console.error(`Azure API error details: Status ${error.statusCode}, Message: ${error.message}`);
        // Send a generic message to the client, but preserve original status code if it's a client-side issue (4xx)
        const clientStatusCode = error.statusCode >= 500 ? 500 : error.statusCode;
        return res.status(clientStatusCode).json({ error: 'Error communicating with AI service.' });
    }
    // For other types of errors in this block
    res.status(500).json({ error: 'An unexpected error occurred while processing your request.' });
  }
});

// Endpoint para obtener un agente específico
app.get('/api/agents/:id', (req, res) => {
  try {
    const agent = agents.find(a => a.id === req.params.id);
    if (!agent) {
      // This is a client error, so a specific message is appropriate
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Detailed error fetching agent by ID:', error); // Log detailed error
    res.status(500).json({ error: 'An unexpected error occurred while fetching agent details.' }); // Send generic message
  }
});

// Endpoint para el chat con un agente usando Dify
app.post('/api/agents/:id/chat', async (req, res) => {
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
      console.error('Error verifying Firebase ID token for chat:', error);
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Unauthorized: Token expired. Please log in again.' });
      }
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    // Token is valid, proceed with existing logic, using decodedToken.uid for user
    const { query, conversation_id, files } = req.body;

    // console.log('Received request body (UID will be from token):', req.body); // req.body.user will be ignored

    // Preparar el mensaje para Dify
    const messageData = {
      inputs: {},
      query,
      response_mode: 'streaming',
      conversation_id: conversation_id || undefined,
      user: decodedToken.uid // Use Firebase UID as the user identifier for Dify
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
      // Log detailed Dify error server-side
      console.error('Error from Dify API:', {
        status: difyResponse.status,
        headers: Object.fromEntries(difyResponse.headers.entries()), // Log Dify headers
        body: errorText // Log Dify error body
      });

      // Determine appropriate status code for the client
      let clientStatusCode = 500; // Default to 500 Internal Server Error
      let clientErrorMessage = 'Error communicating with chat agent.';
      
      if (difyResponse.status >= 400 && difyResponse.status < 500) {
        // If Dify returns a 4xx error, it might be a client-side issue (e.g., bad input to Dify)
        // We can choose to reflect a 400 or a generic 500 to our client.
        // For now, let's send a generic 500 to avoid revealing too much about Dify's specific validation.
        // clientStatusCode = difyResponse.status; // Option: reflect Dify's 4xx status
        clientErrorMessage = 'Failed to process chat request with agent.'; // More specific if we assume it's a bad request to Dify
      } else if (difyResponse.status >= 500 && difyResponse.status <= 599) {
        clientStatusCode = 502; // Bad Gateway for 5xx errors from Dify, indicating an issue with the upstream service
        clientErrorMessage = 'Chat agent service is temporarily unavailable.';
      }
      
      // Send generic error message to client
      return res.status(clientStatusCode).json({ error: clientErrorMessage });
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
    // Log detailed error for any other unexpected issues in this endpoint
    console.error('Detailed error in /api/agents/:id/chat:', error);

    // Check if it's a Firebase auth error that slipped through (should be caught above)
    if (error.code && error.code.startsWith('auth/')) {
        return res.status(403).json({ error: 'Forbidden: Authentication error.' });
    }
    // Dify API errors are handled above by checking difyResponse.ok
    // This catch block is for other unexpected errors
    res.status(500).json({ error: 'An unexpected error occurred while processing your chat request.' });
  }
});

// Endpoint para obtener el estado de un agente
app.get('/api/agents/:id/status', (req, res) => {
  try {
    const agent = agents.find(a => a.id === req.params.id);
    if (!agent) {
      // This is a client error, so a specific message is appropriate
      return res.status(404).json({ error: 'Agente no encontrado' });
    }
    res.json({ status: agent.status });
  } catch (error) {
    console.error('Detailed error fetching agent status:', error); // Log detailed error
    res.status(500).json({ error: 'An unexpected error occurred while fetching agent status.' }); // Send generic message
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
