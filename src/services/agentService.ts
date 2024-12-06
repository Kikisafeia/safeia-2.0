import { Agent, AgentRequest, AgentResponse } from '../types/agents';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const agentService = {
  async listAgents(): Promise<Agent[]> {
    const response = await fetch(`${API_BASE_URL}/api/agents`);
    if (!response.ok) throw new Error('Failed to fetch agents');
    return response.json();
  },

  async getAgent(agentId: string): Promise<Agent> {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}`);
    if (!response.ok) throw new Error('Failed to fetch agent');
    return response.json();
  },

  async sendPrompt(agentId: string, request: AgentRequest): Promise<AgentResponse> {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to send prompt to agent');
    return response.json();
  },

  async getAgentStatus(agentId: string): Promise<{ status: Agent['status'] }> {
    const response = await fetch(`${API_BASE_URL}/api/agents/${agentId}/status`);
    if (!response.ok) throw new Error('Failed to fetch agent status');
    return response.json();
  },
};
