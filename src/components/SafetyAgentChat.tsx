import React, { useState, useRef, useEffect } from 'react';
import { AgentResponse, MessageFile } from '../types/agents';
import { safetyAgentService } from '../services/safetyAgentService';
import { Send, Bot, Loader2, RefreshCw, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTokens } from '../hooks/useTokens';
import { TOKEN_COSTS } from '../hooks/useTokens';
import TokenAlert from './TokenAlert';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  files?: MessageFile[];
  tokenCost?: number;
}

const formatTimestamp = (timestamp: string | number | Date): string => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return new Date().toLocaleTimeString();
  }
  return date.toLocaleTimeString();
};

const estimateTokenCost = (message: string, files: MessageFile[]): number => {
  const wordCount = message.split(/\s+/).length;
  let cost = TOKEN_COSTS.AGENT_CHAT.SHORT_QUERY;
  
  if (wordCount > 50) {
    cost = TOKEN_COSTS.AGENT_CHAT.MEDIUM_QUERY;
  }
  if (wordCount > 100) {
    cost = TOKEN_COSTS.AGENT_CHAT.LONG_QUERY;
  }
  
  if (files.length > 0) {
    cost += TOKEN_COSTS.AGENT_CHAT.DOCUMENT_REVIEW * files.length;
  }
  
  return cost;
};

export default function SafetyAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<MessageFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { checkTokens, consumeTokens, getTokenBalance } = useTokens();
  const [availableTokens, setAvailableTokens] = useState<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeConversation();
    updateTokenBalance();
  }, []);

  const updateTokenBalance = async () => {
    const balance = await getTokenBalance();
    setAvailableTokens(balance);
  };

  const initializeConversation = async () => {
    try {
      const newConversationId = await safetyAgentService.createConversation();
      setConversationId(newConversationId);
      
      setMessages([{
        id: 'welcome',
        content: '¡Hola! Soy tu asistente de seguridad y salud ocupacional. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toISOString(),
        isUser: false
      }]);
    } catch (err) {
      setError('Error al iniciar la conversación');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;
    
    const tokenCost = estimateTokenCost(input, selectedFiles);
    const hasEnoughTokens = await checkTokens(tokenCost);
    
    if (!hasEnoughTokens) {
      setError(`No tienes suficientes tokens para esta operación (${tokenCost} tokens requeridos)`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date().toISOString(),
      isUser: true,
      files: selectedFiles,
      tokenCost
    };

    try {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setSelectedFiles([]);

      const response = await safetyAgentService.sendMessage(
        conversationId!,
        input,
        selectedFiles
      );

      await consumeTokens(tokenCost);
      await updateTokenBalance();

      const agentMessage: Message = {
        id: response.id,
        content: response.content,
        timestamp: new Date().toISOString(),
        isUser: false
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      setError('Error al enviar el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: MessageFile[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleNewConversation = async () => {
    // Limpiar previews de archivos
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
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
              {message.files && message.files.length > 0 && (
                <div className="mb-3 space-y-2">
                  {message.files.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={file.preview}
                        alt={`Uploaded image ${index + 1}`}
                        className="max-w-full h-auto rounded-lg"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
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
                      style={{ maxHeight: '200px' }}
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
                {formatTimestamp(message.timestamp)}
              </span>
              {message.tokenCost && (
                <span className="text-xs text-gray-500 mt-1 block">
                  Costo de tokens: {message.tokenCost}
                </span>
              )}
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

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={file.preview}
                  alt={file.name || `Selected image ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={(e) => e.preventDefault()} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta sobre seguridad y prevención..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-safeia-yellow"
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <ImageIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
            className="bg-safeia-yellow hover:bg-safeia-yellow-dark text-safeia-black px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <TokenAlert availableTokens={availableTokens} />
      </form>
    </div>
  );
}
