import { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { FileText, Shield, HardHat, AlertTriangle, ClipboardCheck, BookOpen, FileSearch, FileSpreadsheet, FileCheck2, FileBarChart2, ClipboardList, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  {
    id: 'ats',
    name: 'Análisis de Trabajo Seguro',
    description: 'Genera análisis detallados de riesgos y medidas preventivas para tareas específicas.',
    icon: ClipboardList,
    color: 'bg-orange-500',
    link: '/ats'
  },
  {
    id: 'pts',
    name: 'Procedimientos de Trabajo Seguro',
    description: 'Genera procedimientos detallados para actividades laborales específicas.',
    icon: FileText,
    color: 'bg-blue-500',
    link: '/pts'
  },
  {
    id: 'risk-map',
    name: 'Mapa de Riesgos',
    description: 'Analiza imágenes del lugar de trabajo para identificar y visualizar zonas de riesgo.',
    icon: Map,
    color: 'bg-indigo-500',
    link: '/herramientas-sst/mapa-riesgos'
  },
  {
    id: 'investigation',
    name: 'Investigación de Accidentes',
    description: 'Asistente para investigación y análisis de accidentes laborales.',
    icon: FileSearch,
    color: 'bg-red-500',
    link: '/investigation'
  },
  {
    id: 'audit',
    name: 'Auditorías de SST',
    description: 'Genera listas de verificación y reportes de auditoría.',
    icon: FileSpreadsheet,
    color: 'bg-green-500',
    link: '/audit'
  },
  {
    id: 'legal',
    name: 'Requisitos Legales',
    description: 'Identifica y analiza requisitos legales aplicables en SST.',
    icon: FileCheck2,
    color: 'bg-purple-500',
    link: '/legal'
  },
  {
    id: 'indicators',
    name: 'Indicadores de SST',
    description: 'Análisis y recomendaciones sobre indicadores de seguridad.',
    icon: FileBarChart2,
    color: 'bg-yellow-500',
    link: '/indicators'
  },
  {
    id: 'improvement',
    name: 'Oportunidades de Mejora',
    description: 'Identifica y sugiere mejoras en el sistema de gestión SST.',
    icon: ClipboardCheck,
    color: 'bg-teal-500',
    link: '/improvement'
  }
];

export default function Tools() {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Herramientas de Seguridad y Salud en el Trabajo</h1>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                to={tool.link}
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${tool.color}`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{tool.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">{tool.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
