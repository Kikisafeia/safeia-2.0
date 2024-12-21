import { VITE_DIFY_API_KEY, VITE_DIFY_API_URL } from '../config';

export interface MessageFile {
  id: string;
  type: string;
  url: string;
  belongs_to: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  inputs: Record<string, any>;
  query: string;
  answer: string;
  message_files: MessageFile[];
  feedback: {
    rating?: 'like' | 'dislike';
  } | null;
  created_at: number;
}

export interface ConversationHistoryResponse {
  limit: number;
  has_more: boolean;
  data: ConversationMessage[];
}

const DIFY_API_URL = import.meta.env.VITE_DIFY_API_URL;
const DIFY_API_KEY = import.meta.env.VITE_DIFY_API_KEY;

export async function getConversationHistory(
  conversationId: string,
  userId: string = 'default-user',
  firstId?: string,
  limit: number = 20
): Promise<ConversationHistoryResponse> {
  try {
    const params = new URLSearchParams({
      conversation_id: conversationId,
      user: userId,
      limit: limit.toString(),
    });

    if (firstId) {
      params.append('first_id', firstId);
    }

    console.log('Fetching conversation history:', {
      url: `${DIFY_API_URL}/messages?${params}`,
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
      }
    });

    const response = await fetch(`${DIFY_API_URL}/messages?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Dify API error response:', errorData);
      try {
        const error = JSON.parse(errorData);
        throw new Error(error.message || 'Error fetching conversation history');
      } catch (e) {
        throw new Error(`Error fetching conversation history: ${errorData}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    throw error;
  }
}
