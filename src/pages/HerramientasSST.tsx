import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import { Briefcase, Shield, Building2, FileCheck, BarChart2, Users, CheckSquare, Search, AlertTriangle, Info, FileText, Sun, ClipboardCheck, HardHat } from 'lucide-react';

// Categorías de herramientas
const categorias = [
  {
    id: 'gestion',
    titulo: 'Gestión de SST',
    descripcion: 'Herramientas para la gestión y administración de la seguridad',
    color: 'bg-safeia-yellow/10',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    herramientas: ['sgsst-pymes', 'politicas', 'checklist', 'inspecciones']
  },
  {
    id: 'prevencion',
    titulo: 'Prevención de Riesgos',
    descripcion: 'Herramientas para identificar y prevenir riesgos laborales',
    color: 'bg-safeia-yellow/5',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow/50',
    herramientas: ['pts', 'ats', 'obligacion-informar', 'recomendaciones', 'matriz-riesgos']
  },
  {
    id: 'analisis',
    titulo: 'Análisis y Mejora',
    descripcion: 'Herramientas para analizar y mejorar la seguridad',
    color: 'bg-safeia-yellow/10',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    herramientas: ['foda', 'investigacion']
  },
  {
    id: 'capacitacion',
    titulo: 'Capacitación y Comunicación',
    descripcion: 'Herramientas para formar y comunicar sobre seguridad',
    color: 'bg-safeia-yellow/5',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow/50',
    herramientas: ['charla', 'indice-uv']
  }
];

const herramientas = [
  {
    id: 'pts',
    title: 'Procedimientos de Trabajo Seguro',
    description: 'Crea procedimientos detallados para realizar trabajos de manera segura',
    icon: FileCheck,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/pts'
  },
  {
    id: 'recomendaciones',
    title: 'Recomendaciones de Seguridad',
    description: 'Obtén recomendaciones personalizadas para mejorar la seguridad',
    icon: Shield,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/recomendaciones'
  },
  {
    id: 'sgsst-pymes',
    title: 'Sistema de Gestión SST para Pymes',
    description: 'Implementa un sistema de gestión adaptado a pequeñas y medianas empresas',
    icon: Building2,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/sgsst-pymes'
  },
  {
    id: 'ats',
    title: 'Análisis de Trabajo Seguro',
    description: 'Analiza los riesgos asociados a cada tarea',
    icon: Search,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/ats'
  },
  {
    id: 'foda',
    title: 'Análisis FODA',
    description: 'Evalúa fortalezas, oportunidades, debilidades y amenazas',
    icon: BarChart2,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/foda'
  },
  {
    id: 'charla',
    title: 'Charla de Seguridad',
    description: 'Genera contenido para charlas de seguridad efectivas',
    icon: Users,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/charla'
  },
  {
    id: 'checklist',
    title: 'Check List',
    description: 'Crea listas de verificación personalizadas',
    icon: CheckSquare,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/checklist'
  },
  {
    id: 'inspecciones',
    title: 'Inspecciones de seguridad',
    description: 'Realiza y documenta inspecciones de seguridad',
    icon: Search,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/inspecciones'
  },
  {
    id: 'investigacion',
    title: 'Investigación de Accidentes',
    description: 'Analiza y documenta accidentes laborales',
    icon: AlertTriangle,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/investigacion'
  },
  {
    id: 'obligacion-informar',
    title: 'Obligación de informar los riesgos laborales',
    description: 'Genera documentos informativos sobre riesgos laborales',
    icon: Info,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/obligacion-informar'
  },
  {
    id: 'politicas',
    title: 'Políticas',
    description: 'Crea políticas de seguridad y salud ocupacional',
    icon: FileText,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/politicas'
  },
  {
    id: 'indice-uv',
    title: 'Índice UV',
    description: 'Consulta y analiza el índice de radiación UV',
    icon: Sun,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/indice-uv'
  },
  {
    id: 'planes-sst',
    title: 'Asistente para crear planes de SST',
    description: 'Crea planes completos de seguridad y salud en el trabajo',
    icon: ClipboardCheck,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/planes-sst'
  },
  {
    id: 'asistente-pts',
    title: 'Asistente de Creación de PTS',
    description: 'Crea procedimientos de trabajo seguro paso a paso',
    icon: HardHat,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/asistente-pts'
  },
  {
    id: 'matriz-riesgos',
    title: 'Matriz de Riesgos',
    description: 'Evalúa los riesgos de tus actividades laborales',
    icon: AlertTriangle,
    color: 'bg-safeia-yellow',
    path: '/herramientas-sst/matriz-riesgos'
  },
];

const HerramientasSST = () => {
  const navigate = useNavigate();

  const getHerramienta = (id: string) => {
    return herramientas.find(h => h.id === id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-safeia-yellow/10">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-safeia-black mb-4">
              Herramientas de Seguridad y Salud en el Trabajo
            </h1>
            <p className="text-xl text-gray-600">
              Soluciones inteligentes para gestionar la seguridad y salud laboral
            </p>
          </div>

          <div className="space-y-12">
            {categorias.map((categoria) => (
              <div 
                key={categoria.id} 
                className={`p-6 rounded-lg border ${categoria.color} ${categoria.borderColor}`}
              >
                <h2 className={`text-2xl font-bold ${categoria.textColor} mb-2`}>
                  {categoria.titulo}
                </h2>
                <p className="text-gray-600 mb-6">{categoria.descripcion}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoria.herramientas.map((herramientaId) => {
                    const herramienta = getHerramienta(herramientaId);
                    if (!herramienta) return null;
                    
                    const Icon = herramienta.icon;
                    
                    return (
                      <div
                        key={herramienta.id}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-100 hover:border-safeia-yellow"
                        onClick={() => navigate(herramienta.path)}
                      >
                        <div className="p-6">
                          <div className={`${herramienta.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                            <Icon className="w-6 h-6 text-safeia-black" />
                          </div>
                          <h3 className="text-lg font-semibold text-safeia-black mb-2">
                            {herramienta.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {herramienta.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerramientasSST;
