import React, { useState, useRef, useEffect } from 'react';
import { AgentResponse } from '../types/agents';
import { safetyAgentService } from '../services/safetyAgentService';
import { Send, Bot, Loader2, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
}

export default function SafetyAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    try {
      const newConversationId = await safetyAgentService.createConversation();
      setConversationId(newConversationId);
      
      setMessages([{
        id: `welcome-${Date.now()}`,
        content: 'Hola, soy el Agente de Seguridad de SAFEIA. Estoy especializado en normativas de seguridad y prevención de riesgos laborales. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toISOString(),
        isUser: false,
      }]);
    } catch (error) {
      setError('Error al iniciar la conversación. Por favor, intenta de nuevo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      timestamp: new Date().toISOString(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await safetyAgentService.sendMessage({
        prompt: input,
        metadata: { conversationId },
      });

      const agentMessage: Message = {
        id: response.messageId || `agent-${Date.now()}`,
        content: response.content,
        timestamp: response.timestamp,
        isUser: false,
      };

      setMessages(prev => [...prev, agentMessage]);
      
      if (response.metadata?.conversationId) {
        setConversationId(response.metadata.conversationId);
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setError('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    setMessages([]);
    setConversationId(null);
    setError(null);
    await initializeConversation();
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-safeia-yellow/10 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-safeia-yellow" />
          </div>
          <div>
            <h3 className="font-bold text-safeia-black">Agente de Seguridad</h3>
            <p className="text-sm text-gray-500">Especialista en normativas y prevención de riesgos</p>
          </div>
        </div>
        <button
          onClick={handleNewConversation}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Nueva conversación"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? 'bg-safeia-yellow text-safeia-black'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <ReactMarkdown 
                className="text-sm whitespace-pre-wrap break-words"
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({node, ...props}) => (
                    <a 
                      {...props} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    />
                  ),
                  img: ({node, ...props}) => (
                    <img 
                      {...props} 
                      className="max-w-full h-auto rounded-lg my-2"
                      alt={props.alt || 'Imagen en el chat'}
                    />
                  ),
                  p: ({node, ...props}) => (
                    <p {...props} className="mb-2" />
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
              <span className="text-xs text-gray-500 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta sobre seguridad y prevención..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-safeia-yellow hover:bg-safeia-yellow-dark text-safeia-black px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
