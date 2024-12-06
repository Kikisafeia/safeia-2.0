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
  messageId: string;
  content: string;
  timestamp: string;
  agentId: string;
  metadata?: {
    conversationId?: string;
  };
}
