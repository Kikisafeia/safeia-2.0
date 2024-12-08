import { AgentResponse, MessageFile } from '../types/agents';

interface MessageRequest {
  prompt: string;
  files?: MessageFile[];
  metadata?: {
    conversationId: string | null;
  };
}

interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
}

const DIFY_API_URL = import.meta.env.VITE_DIFY_API_URL;
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY;

if (!DIFY_API_KEY) {
  console.error('VITE_DIFY_API_KEY no está definida en las variables de entorno');
}

console.log('API URL:', DIFY_API_URL);
console.log('API Key (primeros 10 caracteres):', DIFY_API_KEY?.substring(0, 10) + '...');

export const safetyAgentService = {
  async createConversation(): Promise<string> {
    try {
      // Las conversaciones se crean automáticamente al enviar el primer mensaje
      return '';
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', 'default-user');

    const token = DIFY_API_KEY.trim();
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    console.log('Uploading file:', file.name);
    const response = await fetch(`${DIFY_API_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error uploading file:', errorText);
      throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('File upload response:', data);
    return data;
  },

  async sendMessage(request: MessageRequest): Promise<AgentResponse> {
    try {
      // First, upload all files if they exist
      const uploadedFileIds: string[] = [];
      const uploadedFiles: MessageFile[] = [];
      
      if (request.files && request.files.length > 0) {
        for (const fileData of request.files) {
          try {
            const uploadResponse = await this.uploadFile(fileData.file);
            uploadedFileIds.push(uploadResponse.id);
            
            // Update the file data with the response information
            uploadedFiles.push({
              ...fileData,
              id: uploadResponse.id,
              name: uploadResponse.name,
              type: uploadResponse.mime_type,
              mime_type: uploadResponse.mime_type,
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            // Continue with other files if one fails
          }
        }
      }

      // Prepare the message data
      const messageData = {
        inputs: {},
        query: request.prompt,
        user: 'default-user',
        files: uploadedFileIds,
        conversation_id: request.metadata?.conversationId || undefined,
        response_mode: 'streaming',
      };

      console.log('Sending message with data:', messageData);

      const token = DIFY_API_KEY.trim();
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const headers = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      };

      const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response status:', response.status);
        console.error('Error response text:', errorText);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle specific error cases
        if (response.status === 520) {
          throw new Error('Unable to connect to the chat service. This might be a temporary issue. Please try again in a few minutes.');
        }
        
        // For other errors, provide a more user-friendly message while still logging the details
        throw new Error(`Chat service error (${response.status}): Please try again or contact support if the problem persists.`);
      }

      const reader = response.body?.getReader();
      let answer = '';
      let conversationId = '';
      let messageId = '';
      let buffer = '';

      if (!reader) {
        throw new Error('No se pudo obtener el reader de la respuesta');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            console.log('Received line:', line); // Log para depuración

            if (line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              console.log('Parsed data:', data); // Log para depuración

              if (data.conversation_id) {
                conversationId = data.conversation_id;
              }
              if (data.message_id) {
                messageId = data.message_id;
              }

              // Capturar el contenido del mensaje según el tipo de evento
              if (data.event === 'agent_thought' && data.thought) {
                answer = data.thought;
              } else if (data.event === 'agent_message' && data.answer && data.answer.trim()) {
                answer = data.answer;
              }
            } catch (e) {
              console.warn('Error parsing SSE data:', e);
              console.warn('Problematic JSON string:', jsonStr);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log('Final answer:', answer);
      console.log('Conversation ID:', conversationId);

      return {
        text: answer,
        conversationId: conversationId,
        messageId: messageId,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};
