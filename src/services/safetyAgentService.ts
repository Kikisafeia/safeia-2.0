import { AgentResponse, MessageFile } from '../types/agents';
import { difyService } from './difyService';

export interface SendMessageResponse {
  content: string;
  conversation_id?: string;
  error?: string;
}

export const safetyAgentService = {
  async createConversation(): Promise<string> {
    try {
      return await difyService.createConversation();
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async uploadFile(file: File): Promise<any> {
    // This function is not used in the new implementation
    throw new Error('Not implemented');
  },

  async sendMessage(
    conversationId: string | null,
    query: string,
    files?: MessageFile[],
    onUpdate?: (content: string) => void
  ): Promise<AgentResponse> {
    try {
      let currentContent = '';
      let hasError = false;

      console.log('SafetyAgentService: Starting message send', {
        conversationId,
        query
      });

      const response = await difyService.sendMessage(
        conversationId,
        query,
        {
          onMessage: (content: string) => {
            console.log('SafetyAgentService: Received content update:', { content });
            currentContent = content;
            if (onUpdate) {
              onUpdate(content);
            }
          },
          onError: (error: Error) => {
            console.error('SafetyAgentService: Error from Dify:', error);
            hasError = true;
            throw error;
          },
          onFinish: (id: string, convId: string) => {
            console.log('SafetyAgentService: Message completed', {
              id,
              convId,
              content: currentContent
            });
          },
        }
      );

      console.log('SafetyAgentService: Message response received', {
        response,
        currentContent,
        hasError
      });

      // Si hubo un error, no continuamos
      if (hasError) {
        throw new Error('Error en la comunicación con Dify');
      }

      // Si no recibimos contenido, lanzar error
      if (!currentContent) {
        console.error('SafetyAgentService: No content received in response');
        throw new Error('No se recibió respuesta del asistente');
      }

      return {
        id: response.id,
        content: currentContent,
        conversation_id: response.conversation_id
      };
    } catch (error) {
      console.error('SafetyAgentService: Error in sendMessage:', error);
      throw error;
    }
  },

  async sendMessageImproved(
    conversationId: string | null,
    message: string,
    callbacks: {
      onMessage: (message: string) => void;
      onError: (error: Error) => void;
    }
  ): Promise<SendMessageResponse> {
    try {
      if (!message.trim()) {
        throw new Error('El mensaje no puede estar vacío');
      }

      const success = await difyService.sendMessage(conversationId, message, {
        onMessage: (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received message data:', data);

            if (data.event === 'message' || data.event === 'agent_message') {
              const content = data.data?.answer || '';
              callbacks.onMessage(content);
            }
          } catch (error) {
            console.error('Error processing message:', error);
            callbacks.onError(error instanceof Error ? error : new Error('Error processing message'));
          }
        },
        onError: (error) => {
          console.error('Dify service error:', error);
          callbacks.onError(error);
        }
      });

      if (!success) {
        throw new Error('No se pudo enviar el mensaje');
      }

      return {
        content: message,
        conversation_id: conversationId || undefined
      };
    } catch (error) {
      console.error('Safety agent service error:', error);
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
};
