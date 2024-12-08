import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import { Briefcase, Shield, Building2, FileCheck, BarChart2, Users, CheckSquare, Search, AlertTriangle, Info, FileText, Sun, ClipboardCheck, HardHat } from 'lucide-react';

// Categorías de herramientas
const categorias = [
  {
    id: 'gestion',
    titulo: 'Gestión de SST',
    descripcion: 'Herramientas para la gestión y administración de la seguridad',
    icon: Briefcase,
    color: 'bg-safeia-yellow',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    imageSrc: '/gestion.jpg',
    imageAlt: 'Gestión de SST',
    href: '/herramientas-sst/gestion',
    herramientas: ['sgsst-pymes', 'politicas', 'checklist', 'inspecciones']
  },
  {
    id: 'prevencion',
    titulo: 'Prevención de Riesgos',
    descripcion: 'Herramientas para identificar y prevenir riesgos laborales',
    icon: Shield,
    color: 'bg-safeia-yellow',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    imageSrc: '/prevencion.jpg',
    imageAlt: 'Prevención de Riesgos',
    href: '/herramientas-sst/prevencion',
    herramientas: ['pts', 'ats', 'obligacion-informar', 'recomendaciones', 'matriz-riesgos']
  },
  {
    id: 'analisis',
    titulo: 'Análisis y Mejora',
    descripcion: 'Herramientas para analizar y mejorar la seguridad',
    icon: BarChart2,
    color: 'bg-safeia-yellow',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    imageSrc: '/analisis.jpg',
    imageAlt: 'Análisis y Mejora',
    href: '/herramientas-sst/analisis',
    herramientas: ['foda', 'investigacion']
  },
  {
    id: 'capacitacion',
    titulo: 'Capacitación y Comunicación',
    descripcion: 'Herramientas para formar y comunicar sobre seguridad',
    icon: Users,
    color: 'bg-safeia-yellow',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    imageSrc: '/capacitacion.jpg',
    imageAlt: 'Capacitación y Comunicación',
    href: '/herramientas-sst/capacitacion',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-safeia-black">Herramientas de Seguridad y Salud en el Trabajo</h1>
        
        {categorias.map((categoria) => (
          <div key={categoria.id} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-safeia-black flex items-center">
              {React.createElement(categoria.icon)}
              <span className="ml-2">{categoria.titulo}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.herramientas.map((herramientaId) => {
                const herramienta = herramientas.find(h => h.id === herramientaId);
                if (!herramienta) return null;
                
                return (
                  <Link
                    key={herramienta.id}
                    to={herramienta.path}
                    className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-safeia-yellow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <span className="p-2 bg-safeia-yellow rounded-lg inline-block">
                          {React.createElement(herramienta.icon)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 text-safeia-black">
                          {herramienta.title}
                        </h3>
                        <p className="text-sm text-safeia-black">
                          {herramienta.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HerramientasSST;
