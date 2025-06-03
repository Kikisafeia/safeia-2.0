import React, { useEffect, useState, useCallback } from 'react';
import { getConversationHistory, ConversationMessage } from '../services/conversationHistoryService';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface ConversationHistoryProps {
  conversationId: string;
}

export default function ConversationHistory({ conversationId }: ConversationHistoryProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [firstId, setFirstId] = useState<string | undefined>();

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading history for conversation:', conversationId);
      const response = await getConversationHistory(conversationId, undefined, firstId);
      console.log('History response:', response);
      setMessages(prev => [...prev, ...response.data]);
      setHasMore(response.has_more);
      if (response.data.length > 0) {
        setFirstId(response.data[response.data.length - 1].id);
      }
    } catch (err) {
      console.error('Error loading conversation history:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  }, [conversationId, firstId]); // Added dependencies for useCallback

  useEffect(() => {
    if (conversationId) {
      setMessages([]); // Reset messages when conversationId changes
      setFirstId(undefined); // Reset pagination cursor
      // Initial load or load when conversationId changes.
      // loadHistory will be called here, and also directly by the "Load More" button.
      // The useCallback ensures loadHistory has a stable identity if its own dependencies don't change.
      loadHistory();
    }
  }, [conversationId, loadHistory]); // Added loadHistory as a dependency

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-safeia-yellow" />
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="font-medium text-gray-900">
              {message.query}
            </div>
            <div className="text-sm text-gray-500">
              {format(message.created_at * 1000, 'dd/MM/yyyy HH:mm')}
            </div>
          </div>
          <div className="text-gray-900 mt-2">{message.answer}</div>
          {message.message_files?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.message_files.map((file) => (
                file.type === 'image' && (
                  <img
                    key={file.id}
                    src={file.url}
                    alt="Message attachment"
                    className="w-32 h-32 object-cover rounded"
                  />
                )
              ))}
            </div>
          )}
        </div>
      ))}
      {hasMore && (
        <button
          onClick={loadHistory}
          className="mt-4 px-4 py-2 bg-safeia-yellow text-white rounded hover:bg-safeia-yellow-dark disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Cargando...
            </span>
          ) : (
            'Cargar más'
          )}
        </button>
      )}
    </div>
  );
}
