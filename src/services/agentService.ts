import { Agent, AgentRequest, AgentResponse } from '../types/agents';

const predefinedAgents: Agent[] = [
  {
    id: 'safeia-bot-1',
    name: 'SAFEIA-Bot',
    description: 'Asistente principal de SAFEIA, especializado en seguridad y salud ocupacional. Capaz de responder consultas generales y dirigir a agentes específicos según las necesidades.',
    capabilities: [
      'Respuestas en tiempo real',
      'Análisis de documentos',
      'Coordinación con otros agentes',
      'Asistencia multilingüe',
    ],
    status: 'active',
    avatar: '/bot-avatar.png',
    type: 'assistant',
    specialties: ['Consultas generales', 'Documentación', 'Coordinación'],
    lastActive: new Date().toISOString(),
  },
  {
    id: 'safeia-bot-2',
    name: 'Experto en Prevención',
    description: 'Especialista en identificación y evaluación de riesgos laborales, desarrollo de medidas preventivas y gestión de la seguridad.',
    capabilities: [
      'Evaluación de riesgos',
      'Desarrollo de protocolos',
      'Asesoramiento preventivo',
      'Análisis de incidentes',
    ],
    status: 'active',
    avatar: '/prevention-bot.png',
    type: 'specialist',
    specialties: ['Prevención de riesgos', 'Protocolos de seguridad', 'Análisis de incidentes'],
    lastActive: new Date().toISOString(),
  },
  {
    id: 'safeia-bot-3',
    name: 'Asesor Legal SST',
    description: 'Experto en normativas y regulaciones de seguridad y salud en el trabajo, brinda asesoramiento sobre cumplimiento legal y actualizaciones normativas.',
    capabilities: [
      'Asesoría legal',
      'Interpretación normativa',
      'Actualizaciones regulatorias',
      'Cumplimiento legal',
    ],
    status: 'active',
    avatar: '/legal-bot.png',
    type: 'specialist',
    specialties: ['Normativa SST', 'Cumplimiento legal', 'Asesoría regulatoria'],
    lastActive: new Date().toISOString(),
  }
];

export const agentService = {
  async listAgents(): Promise<Agent[]> {
    return Promise.resolve(predefinedAgents);
  },

  async getAgent(agentId: string): Promise<Agent> {
    const agent = predefinedAgents.find(a => a.id === agentId);
    if (!agent) throw new Error('Agent not found');
    return Promise.resolve(agent);
  },

  async sendPrompt(agentId: string, request: AgentRequest): Promise<AgentResponse> {
    // Aquí deberías integrar con el servicio de chat real (por ejemplo, Azure OpenAI)
    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ ...request, agentId }),
    });
    if (!response.ok) throw new Error('Failed to send prompt to agent');
    return response.json();
  },

  async getAgentStatus(agentId: string): Promise<{ status: Agent['status'] }> {
    const agent = await this.getAgent(agentId);
    return Promise.resolve({ status: agent.status });
  },
};
