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
    // GOOGLE_APPLICATION_CREDENTIALS is set, attempt to use it.
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`CRITICAL: GOOGLE_APPLICATION_CREDENTIALS is set to "${serviceAccountPath}", but the file does not exist.`);
      console.error('Firebase Admin SDK initialization failed. Application will not start.');
      process.exit(1); // Exit if service account file is missing
    }
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
      });
      console.log('Firebase Admin SDK initialized with service account credentials.');
    } catch (error) {
      console.error(`CRITICAL: Error initializing Firebase Admin SDK with service account file "${serviceAccountPath}":`, error);
      console.error('Firebase Admin SDK initialization failed. Application will not start.');
      process.exit(1); // Exit if service account file is invalid
    }
  } else {
    // GOOGLE_APPLICATION_CREDENTIALS is NOT set. Fallback to default initialization.
    // This is suitable for environments like Google Cloud Run/Functions or local development
    // where default credentials might be available or no credentials are required for certain emulated services.
    console.log('GOOGLE_APPLICATION_CREDENTIALS not set. Initializing Firebase Admin SDK with default credentials (suitable for emulators or cloud environments with auto-discovery).');
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
    console.error('Error in /api/agents:', error.message, error.stack);
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
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ error: 'Unauthorized: Token expired. Please log in again.' });
      }
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' }); // Generic message for other token errors
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
    // Firebase auth/id-token-expired is handled by the specific try-catch for verifyIdToken.
    // If it somehow reaches here and is an auth error, it would be a generic 500.
    // The most common errors here would be Azure SDK errors or other unexpected issues.

    // Check if it's an Azure SDK error (these often have a statusCode property)
    if (error.statusCode) { 
        // Log the specific Azure error message for server-side debugging
        console.error(`Azure API error details: Status ${error.statusCode}, Message: ${error.message}`);
        // Send a generic message to the client, but preserve original status code if it's a client-side issue (4xx)
        const clientStatusCode = error.statusCode >= 500 ? 500 : error.statusCode;
        return res.status(clientStatusCode).json({ error: 'Error communicating with AI service.' });
    }
    // For other types of errors in this block, log message and stack for better debugging without logging entire object
    console.error('Unhandled error in /api/ai/suggestions:', error.message, error.stack);
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
    console.error('Error in /api/agents/:id:', error.message, error.stack);
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
      return res.status(403).json({ error: 'Forbidden: Invalid or expired token.' }); // Generic message for other token errors
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
      let clientErrorMessage = 'An error occurred while communicating with the chat service.'; // Default generic message

      if (difyResponse.status >= 400 && difyResponse.status < 500) {
        // Dify 4xx error (e.g., bad request to Dify, invalid inputs based on Dify's expectations)
        // Log detailed Dify error server-side (already done above)
        // Send a generic client-facing error message. Avoid reflecting Dify's specific error structure.
        clientStatusCode = difyResponse.status; // Or use a generic 400 if preferred: 400;
        clientErrorMessage = 'Failed to process your request with the chat service. Please check your input.';
      } else if (difyResponse.status >= 500 && difyResponse.status <= 599) {
        // Dify 5xx error (e.g., Dify server error)
        // Log detailed Dify error server-side (already done above)
        // Send a generic server-side error message to the client.
        clientStatusCode = 502; // Bad Gateway, indicating an issue with the upstream Dify service
        clientErrorMessage = 'The chat service is temporarily unavailable. Please try again later.';
      }
      // For other non-ok statuses that might not fit 4xx/5xx (less common for HTTP APIs but to be safe)
      // The default clientStatusCode and clientErrorMessage will be used.

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

    // Firebase auth errors (including 'auth/id-token-expired') are handled by the specific try-catch for verifyIdToken.
    // If an auth error somehow reaches here, it would be a generic 500.
    // Dify API errors are handled above by checking difyResponse.ok.
    // This catch block is for other unexpected errors not caught by the more specific handlers.
    console.error('Unhandled error in /api/agents/:id/chat:', error.message, error.stack);
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
    console.error('Error in /api/agents/:id/status:', error.message, error.stack);
    res.status(500).json({ error: 'An unexpected error occurred while fetching agent status.' }); // Send generic message
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
