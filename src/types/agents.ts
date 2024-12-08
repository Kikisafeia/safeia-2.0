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
  text: string;
  conversationId?: string;
  messageId?: string;
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
