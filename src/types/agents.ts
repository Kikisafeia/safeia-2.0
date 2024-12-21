export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive';
  avatar?: string;
  type: 'assistant' | 'specialist';
  specialties: string[];
  lastActive: string;
}

export interface AgentRequest {
  prompt: string;
  metadata?: {
    conversationId: string | null;
  };
}

export interface AgentResponse {
  id: string;
  content: string;
  conversation_id?: string;
  files?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

export interface MessageFile {
  file: File;
  preview: string;
  id?: string;
  url?: string;
  name?: string;
  type?: string;
  mime_type?: string;
}

export interface FileUploadResponse {
  id: string;           // UUID del archivo
  name: string;         // Nombre del archivo
  size: number;         // Tamaño en bytes
  extension: string;    // Extensión del archivo
  mime_type: string;    // Tipo MIME
  created_by: string;   // ID del usuario final
  created_at: number;   // Timestamp de creación
}
