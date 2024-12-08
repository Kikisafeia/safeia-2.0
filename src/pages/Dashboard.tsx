import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TokenDisplay from '../components/TokenDisplay';
import TokenHistory from '../components/TokenHistory';
import ToolCard from '../components/tools/ToolCard';
import { TokenManagementService } from '../services/tokenManagementService';
import { Clipboard, Users, Bot, FileCheck, AlertTriangle, BarChart } from 'lucide-react';

interface UserData {
  plan: string;
  tokens: number;
  lastTokenReset: string;
  displayName: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        // Verificar y renovar tokens si es necesario
        await TokenManagementService.checkAndRenewTokens(currentUser.uid);
        
        // Obtener datos actualizados
        const tokens = await TokenManagementService.getTokenBalance(currentUser.uid);
        const userDoc = await TokenManagementService.getUserData(currentUser.uid);
        
        if (userDoc) {
          setUserData({
            ...userDoc,
            tokens
          });
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return <div>Error al cargar datos</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <TokenDisplay 
              tokens={userData.tokens} 
              planId={userData.plan || 'gratuito'}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ToolCard
                title="Evaluación de Riesgos"
                description="Identifica y evalúa riesgos laborales"
                icon={<AlertTriangle size={24} />}
                href="/risk-matrix"
              />
              <ToolCard
                title="Agentes Especializados"
                description="Consulta con nuestros agentes expertos en SST"
                icon={<Bot size={24} />}
                href="/agentes"
              />
              <ToolCard
                title="Documentación SST"
                description="Genera y gestiona documentos del sistema SST"
                icon={<FileCheck size={24} />}
                href="/documentos"
              />
              <ToolCard
                title="Indicadores SST"
                description="Monitorea y analiza indicadores clave"
                icon={<BarChart size={24} />}
                href="/indicadores"
              />
              <ToolCard
                title="Capacitaciones"
                description="Gestiona el programa de capacitaciones"
                icon={<Users size={24} />}
                href="/capacitaciones"
              />
              <ToolCard
                title="Inspecciones"
                description="Realiza y registra inspecciones de seguridad"
                icon={<Clipboard size={24} />}
                href="/inspecciones"
              />
            </div>
          </div>

          {/* Barra Lateral */}
          <div className="space-y-6">
            <TokenHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
