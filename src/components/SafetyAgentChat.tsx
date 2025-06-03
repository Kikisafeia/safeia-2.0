import React, { useState, useRef, useEffect } from 'react';
import { AgentResponse, MessageFile } from '../types/agents';
import { safetyAgentService } from '../services/safetyAgentService';
import { Send, Bot, Loader2, RefreshCw, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTokens } from '../hooks/useTokens';
import { estimateTokenUsage, countTokens } from '../utils/tokenCounter';
import TokenAlert from './TokenAlert';
import TokenUsageDisplay from './TokenUsageDisplay';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import ConversationHistory from './ConversationHistory';
import MessageImages from './MessageImages';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  files?: {
    id: string;
    type: string;
    url: string;
    belongs_to: string;
  }[];
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString();
};

marked.setOptions({
  breaks: true,
  gfm: true,
  renderer: new marked.Renderer()
});

const renderer = {
  link(href: string, title: string, text: string) {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${text}</a>`;
  }
};

marked.use({ renderer });

export default function SafetyAgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<MessageFile[]>([]);
  // const [showHistory, setShowHistory] = useState(false); // Unused
  const [isTyping, setIsTyping] = useState(false);
  // const [textareaHeight, setTextareaHeight] = useState('auto'); // Unused state variable and setter
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { checkTokens, consumeTokens, /*getTokenBalance,*/ refreshTokens } = useTokens(); // getTokenBalance was unused
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

    // Cleanup for selectedFiles object URLs on unmount
    return () => {
      selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Deliberately empty to run only on mount and unmount for this cleanup logic.
          // initializeConversation and updateTokenBalance are stable or should be if they cause issues.

  const updateTokenBalance = async () => {
    await refreshTokens();
  };

  const initializeConversation = async () => {
    try {
      const newConversationId = await safetyAgentService.createConversation();
      setConversationId(newConversationId);
      
      setMessages([{
        id: 'welcome',
        content: '¡Hola! Soy tu asistente de seguridad y salud ocupacional. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
        isUser: false
      }]);
    } catch (err) {
      setError('Error al iniciar la conversación');
    }
  };

  const handleSendMessage = async () => {
    if (isLoading || (!input.trim() && selectedFiles.length === 0)) return;

    try {
      setIsLoading(true);
      setError(null);

      // Verificar tokens disponibles
      const estimatedTokens = estimateTokenUsage(input, selectedFiles);
      const hasEnoughTokens = await checkTokens(estimatedTokens);
      
      if (!hasEnoughTokens) {
        setError('No tienes suficientes tokens disponibles para enviar este mensaje.');
        return;
      }

      // Crear mensaje del usuario
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: input,
        timestamp: new Date(),
        isUser: true,
        files: selectedFiles,
      };

      // Crear mensaje temporal del agente
      const tempAgentMessage: Message = {
        id: `agent-temp-${Date.now()}`,
        content: '',
        timestamp: new Date(),
        isUser: false,
      };

      // Actualizar mensajes
      setMessages(prev => [...prev, userMessage, tempAgentMessage]);
      
      // Limpiar input y archivos
      setInput('');
      setSelectedFiles([]);

      // Enviar mensaje
      const response = await safetyAgentService.sendMessage(
        conversationId,
        input,
        selectedFiles,
        (content: string) => {
          // Actualizamos el contenido del mensaje temporal mientras se recibe la respuesta
          setMessages(prev => prev.map(msg => 
            msg.id === tempAgentMessage.id
              ? { ...msg, content }
              : msg
          ));
        }
      );

      // Calculamos los tokens realmente usados
      const inputTokens = countTokens(input);
      const outputTokens = countTokens(response.content || '');
      const totalTokens = inputTokens + outputTokens;

      // Consumir tokens
      await consumeTokens(totalTokens);
      
      // Actualizar balance de tokens
      refreshTokens();
      
      // Actualizamos el mensaje temporal con la información final
      setMessages(prev => prev.map(msg => 
        msg.id === tempAgentMessage.id
          ? {
              ...msg,
              id: `agent-${response.id || Date.now()}`,
              content: response.content,
              inputTokens,
              outputTokens,
              totalTokens
            }
          : msg
      ));

      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar el mensaje');
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

  // handleNewConversation was unused
  // const handleNewConversation = async () => {
  //   // Limpiar previews de archivos
  //   selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  //   setSelectedFiles([]);
  //   setMessages([]);
  //   setConversationId(null);
  //   setError(null);
  //   await initializeConversation();
  // };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (input.length > 0) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [input]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // handleDifyMessage was unused and referenced undefined currentMessageId
  // const handleDifyMessage = (event: { type: string; data: string }) => {
  //   try {
  //     const data = JSON.parse(event.data);
      
  //     if (data.event === 'message' || data.event === 'agent_message') {
  //       const content = typeof data.data?.answer === 'string' ? data.data.answer : '';
  //       setMessages(prev => prev.map(msg =>
  //         msg.id === currentMessageId
  //           ? { ...msg, content }
  //           : msg
  //       ));
  //     }
  //   } catch (error) {
  //     console.error('Error processing message:', error);
  //   }
  // };

  const renderMarkdown = (content: any): string => {
    if (typeof content !== 'string') {
      return '';
    }
    try {
      return marked.parse(content);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return String(content);
    }
  };

  return (
    <div 
      className="flex flex-col h-[600px] md:h-[700px] bg-white rounded-lg shadow-sm"
      role="main"
      aria-label="Chat con agente de seguridad"
    >
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Chat con Agente de Seguridad</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={messagesEndRef}>
        <div
          className="space-y-4"
          role="log"
          aria-label="Mensajes del chat"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
              role="article"
              aria-label={`Mensaje de ${message.isUser ? 'usuario' : 'agente'}`}
            >
              <div
                className={`p-4 rounded-lg shadow ${
                  message.isUser 
                    ? 'bg-safeia-yellow text-white ml-auto md:max-w-[80%]' 
                    : 'bg-gray-100 text-gray-900 mr-auto md:max-w-[80%]'
                }`}
              >
                <div
                  className="prose max-w-none"
                  // Ensure that the content passed to dangerouslySetInnerHTML is sanitized.
                  // Currently, this is correctly handled by using DOMPurify.sanitize
                  // in conjunction with the output of renderMarkdown.
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(renderMarkdown(message.content))
                  }}
                />
                {message.files && message.files.length > 0 && (
                  <MessageImages files={message.files} />
                )}
                <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                  <span role="time">{formatTimestamp(message.timestamp)}</span>
                  {message.totalTokens && (
                    <span className="text-xs text-gray-400 ml-2" aria-label="Tokens utilizados">
                      {message.totalTokens} tokens
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {error && (
            <div 
              className="p-4 bg-red-50 rounded-lg mb-4"
              role="alert"
            >
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={file.preview}
                    alt={`Archivo adjunto ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Eliminar archivo ${index + 1}`}
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() || selectedFiles.length > 0) {
              handleSendMessage();
            }
          }} 
          className="flex flex-col md:flex-row gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // adjustTextareaHeight(); // Called in useEffect based on input change
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() || selectedFiles.length > 0) {
                    handleSendMessage();
                  }
                }
              }}
              placeholder="Escribe tu consulta sobre seguridad y prevención..."
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-safeia-yellow resize-none min-h-[40px] max-h-[120px]"
              // style={{ height: textareaHeight }} // textareaHeight state was removed
              disabled={isLoading}
              aria-label="Mensaje"
            />
            {isTyping && (
              <div className="absolute right-2 bottom-2 text-xs text-gray-400">
                Escribiendo...
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
              aria-label="Adjuntar imágenes"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
              aria-label="Adjuntar imágenes"
            >
              <ImageIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />
            </button>
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
              className="bg-safeia-yellow hover:bg-safeia-yellow-dark text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow"
              aria-label={isLoading ? "Enviando mensaje..." : "Enviar mensaje"}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </form>
        <TokenAlert availableTokens={availableTokens} />
      </div>
    </div>
  );
}
