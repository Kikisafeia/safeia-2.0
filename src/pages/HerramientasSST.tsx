import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Shield, 
  Building2, 
  FileCheck, 
  BarChart2, 
  Users, 
  Search, 
  AlertTriangle,
  Clipboard,
  Sun,
  MessageSquare,
  FileText,
  Book,
  CheckSquare
} from 'lucide-react';

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
    herramientas: [
      { id: 'sgsst-pymes', nombre: 'SGSST para PyMES', ruta: '/herramientas-sst/sgsst-pymes' },
      { id: 'audit', nombre: 'Auditorías', ruta: '/herramientas-sst/audit' },
      { id: 'politicas', nombre: 'Políticas de SST', ruta: '/herramientas-sst/politicas' },
      { id: 'legal', nombre: 'Requisitos Legales', ruta: '/herramientas-sst/legal' }
    ]
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
    herramientas: [
      { id: 'matriz-riesgos', nombre: 'Matriz de Riesgos', ruta: '/herramientas-sst/risk-matrix' },
      { id: 'mapa-riesgos', nombre: 'Mapa de Riesgos', ruta: '/herramientas-sst/risk-map' },
      { id: 'pts', nombre: 'Procedimientos de Trabajo Seguro', ruta: '/herramientas-sst/pts' },
      { id: 'ats', nombre: 'Análisis de Trabajo Seguro', ruta: '/herramientas-sst/ats' }
    ]
  },
  {
    id: 'inspecciones',
    titulo: 'Inspecciones y Controles',
    descripcion: 'Herramientas para realizar inspecciones y controles de seguridad',
    icon: CheckSquare,
    color: 'bg-safeia-yellow',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    imageSrc: '/inspecciones.jpg',
    imageAlt: 'Inspecciones',
    href: '/herramientas-sst/inspecciones',
    herramientas: [
      { id: 'checklist', nombre: 'Listas de Verificación', ruta: '/herramientas-sst/checklist' },
      { id: 'inspecciones', nombre: 'Generador de Inspecciones', ruta: '/herramientas-sst/inspecciones-generator' },
      { id: 'investigation', nombre: 'Investigación de Accidentes', ruta: '/herramientas-sst/investigation' }
    ]
  },
  {
    id: 'capacitacion',
    titulo: 'Capacitación y Comunicación',
    descripcion: 'Herramientas para la capacitación y comunicación en SST',
    icon: MessageSquare,
    color: 'bg-safeia-yellow',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    imageSrc: '/capacitacion.jpg',
    imageAlt: 'Capacitación',
    href: '/herramientas-sst/capacitacion',
    herramientas: [
      { id: 'charlas', nombre: 'Generador de Charlas', ruta: '/herramientas-sst/charlas-generator' },
      { id: 'obl-informar', nombre: 'Obligación de Informar', ruta: '/herramientas-sst/obligacion-informar' },
      { id: 'agentes', nombre: 'Agentes Especializados', ruta: '/herramientas-sst/agentes-especializados' }
    ]
  },
  {
    id: 'monitoreo',
    titulo: 'Monitoreo y Análisis',
    descripcion: 'Herramientas para el monitoreo y análisis de condiciones',
    icon: BarChart2,
    color: 'bg-safeia-yellow',
    textColor: 'text-safeia-black',
    borderColor: 'border-safeia-yellow',
    imageSrc: '/monitoreo.jpg',
    imageAlt: 'Monitoreo',
    href: '/herramientas-sst/monitoreo',
    herramientas: [
      { id: 'indice-uv', nombre: 'Índice UV', ruta: '/herramientas-sst/indice-uv' },
      { id: 'foda', nombre: 'Análisis FODA', ruta: '/herramientas-sst/foda' },
      { id: 'recomendaciones', nombre: 'Recomendaciones', ruta: '/herramientas-sst/recomendaciones' }
    ]
  }
];

const HerramientasSST = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Herramientas SST
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Selecciona una categoría para acceder a las herramientas especializadas
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-md ${categoria.color}`}>
                    <categoria.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900">
                    {categoria.titulo}
                  </h3>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  {categoria.descripcion}
                </p>
                <div className="mt-6 space-y-2">
                  {categoria.herramientas.map((herramienta) => (
                    <Link
                      key={herramienta.id}
                      to={herramienta.ruta}
                      className="block text-sm text-gray-600 hover:text-safeia-yellow transition-colors duration-200"
                    >
                      • {herramienta.nombre}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HerramientasSST;
