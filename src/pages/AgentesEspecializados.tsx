import React, { useEffect, useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import AgentCard from '../components/AgentCard';
import SafetyAgentChat from '../components/SafetyAgentChat';
import { Agent } from '../types/agents';
import { agentService } from '../services/agentService';
import { Bot, AlertCircle, X, Coins } from 'lucide-react';
import { TOKEN_COSTS } from '../hooks/useTokens';
import { useTokens } from '../hooks/useTokens';
import { Plan } from '../types/plans';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function AgentesEspecializados() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { getTokenBalance } = useTokens();
  const [availableTokens, setAvailableTokens] = useState<number>(0);
  const { currentUser } = useAuth();
  const [userPlan, setUserPlan] = useState<{
    id: string;
    lastTokenReset: string;
    tokens: number;
  } | null>(null);

  useEffect(() => {
    loadAgents();
    updateTokenBalance();
    if (currentUser) {
      loadUserPlan();
    }
  }, [currentUser]);

  const loadUserPlan = async () => {
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserPlan({
          id: userData.plan || 'gratuito',
          lastTokenReset: userData.lastTokenReset || new Date().toISOString(),
          tokens: userData.tokens || 0
        });
      }
    } catch (err) {
      console.error('Error loading user plan:', err);
    }
  };

  const updateTokenBalance = async () => {
    const balance = await getTokenBalance();
    setAvailableTokens(balance);
  };

  const loadAgents = async () => {
    try {
      setLoading(true);
      const agentList = await agentService.listAgents();
      setAgents(agentList);
      setError(null);
    } catch (err) {
      setError('Error al cargar los agentes. Por favor, intenta de nuevo más tarde.');
      setAgents([
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowChat(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-safeia-yellow/10">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safeia-yellow"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-safeia-yellow/10">
      <DashboardNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-safeia-black mb-4">
            Agentes Especializados SAFEIA
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestros agentes de IA están diseñados específicamente para diferentes aspectos
            de la seguridad y salud ocupacional, trabajando en conjunto para brindarte
            soluciones integrales.
          </p>
        </div>

        {/* Token Information */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Coins className="w-6 h-6 text-safeia-yellow" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Tokens Disponibles
                </h3>
                <p className="text-sm text-gray-500">
                  {availableTokens.toLocaleString()} tokens
                </p>
                {userPlan && (
                  <p className="text-xs text-gray-400">
                    Último reset: {new Date(userPlan.lastTokenReset).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <p>Costo por consulta:</p>
              <ul className="list-disc list-inside">
                <li>Consulta simple: {TOKEN_COSTS.AGENT_CHAT.SHORT_QUERY} tokens</li>
                <li>Consulta con análisis: {TOKEN_COSTS.AGENT_CHAT.MEDIUM_QUERY} tokens</li>
                <li>Análisis de documentos: {TOKEN_COSTS.AGENT_CHAT.DOCUMENT_REVIEW} tokens</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={handleAgentSelect}
            />
          ))}
        </div>

        {agents.length === 0 && !error && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay agentes disponibles en este momento.</p>
          </div>
        )}

        {showChat && selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col relative">
              <button
                onClick={() => setShowChat(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <Bot className="w-8 h-8 text-safeia-yellow" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedAgent.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedAgent.specialties.join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <SafetyAgentChat />
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-safeia-yellow/10 to-safeia-yellow/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-safeia-black mb-4">
            Trabajo Colaborativo Inteligente
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nuestros agentes trabajan de manera coordinada, compartiendo información
            y conocimientos para proporcionar soluciones completas y precisas a tus
            necesidades en seguridad y salud ocupacional.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
