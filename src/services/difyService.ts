import { StreamCallbacks, MessageData } from '../types/stream';

// The Dify API URL and Key are now handled by the backend proxy.
// No longer need to expose them to the client.


export const difyService = {
  async createConversation(): Promise<string> {
    try {
      // All calls now go through the local backend proxy
      const response = await fetch(`/api/dify/chat-messages`, {
        method: 'POST',
        headers: {
          // Authorization is handled by the backend, no longer needed here.
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          user: 'default-user',
          inputs: {},
          query: 'Start conversation',
          response_mode: 'blocking'
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Dify API error response:', errorData);
        throw new Error(`Failed to create conversation: ${errorData}`);
      }

      const data = await response.json();
      return data.conversation_id || '';
    } catch (error) {
      console.error('Error creating conversation:', error);
      return '';
    }
  },

  async sendMessage(conversationId: string | null, message: string, callbacks: StreamCallbacks): Promise<boolean> {
    try {
      const requestBody = {
        query: message,
        user: 'default-user',
        inputs: {},
        response_mode: 'streaming',
        conversation_id: conversationId || undefined
      };

      // All calls now go through the local backend proxy
      const response = await fetch(`/api/dify/chat-messages`, {
        method: 'POST',
        headers: {
          // Authorization is handled by the backend, no longer needed here.
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Dify API error response:', errorData);
        try {
          const error = JSON.parse(errorData);
          throw new Error(error.message || 'Error sending message');
        } catch (e) {
          throw new Error(`Error sending message: ${errorData}`);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let receivedContent = false;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            try {
              const eventData = line.slice(6);
              if (eventData.trim() === '[DONE]') {
                continue;
              }
              const jsonData = JSON.parse(eventData);
              if (jsonData.answer) {
                callbacks.onMessage({
                  type: 'message',
                  data: jsonData.answer
                } as MessageData);
                receivedContent = true;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      if (!receivedContent) {
        throw new Error('No content received from the stream');
      }

      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      callbacks.onError(error as Error);
      return false;
    }
  },
};
