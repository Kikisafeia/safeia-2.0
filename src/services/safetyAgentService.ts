import { AgentResponse } from '../types/agents';

interface MessageRequest {
  prompt: string;
  metadata?: {
    conversationId: string | null;
  };
}

const DIFY_API_URL = import.meta.env.VITE_DIFY_API_URL || 'http://localhost:3000';
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY;

export const safetyAgentService = {
  async createConversation(): Promise<string> {
    try {
      const response = await fetch(`${DIFY_API_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DIFY_API_KEY}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la conversación');
      }

      const data = await response.json();
      return data.conversation_id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async sendMessage(request: MessageRequest): Promise<AgentResponse> {
    try {
      const response = await fetch(`${DIFY_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DIFY_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: {},
          query: request.prompt,
          conversation_id: request.metadata?.conversationId,
          response_mode: 'blocking',
          user: 'default-user'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(error.message || 'Error al enviar el mensaje');
      }

      const data = await response.json();
      
      return {
        messageId: data.message_id || Date.now().toString(),
        content: data.answer,
        timestamp: new Date().toISOString(),
        metadata: {
          conversationId: data.conversation_id,
        },
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
};
