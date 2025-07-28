import { useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { generateSGSSTSuggestion } from '../../services/aiService';

const sgsstComponents = [
  {
    title: 'Política de SST',
    description: 'Define y descarga la política de Seguridad y Salud en el Trabajo para tu empresa.',
    templateUrl: '/templates/sgsst/politica_sst.docx',
    fileName: 'politica_sst.docx'
  },
  {
    title: 'Manual del SGSST',
    description: 'Estructura y contenido del manual principal del Sistema de Gestión.',
    templateUrl: '/templates/sgsst/manual_sgsst.docx',
    fileName: 'manual_sgsst.docx'
  },
  {
    title: 'Evaluación Inicial',
    description: 'Diagnóstico inicial para conocer el estado actual de la gestión de SST.',
    templateUrl: '/templates/sgsst/evaluacion_inicial.docx',
    fileName: 'evaluacion_inicial.docx'
  },
  {
    title: 'Matriz IPERC',
    description: 'Identificación de Peligros, Evaluación de Riesgos y Controles.',
    templateUrl: '/templates/sgsst/matriz_iperc.xlsx',
    fileName: 'matriz_iperc.xlsx'
  },
  {
    title: 'Plan Anual de SST',
    description: 'Planifica las actividades de seguridad y salud para todo el año.',
    templateUrl: '/templates/sgsst/plan_anual.xlsx',
    fileName: 'plan_anual.xlsx'
  },
  {
    title: 'Procedimientos Básicos',
    description: 'Documentos con los procedimientos de seguridad estándar.',
    templateUrl: '/templates/sgsst/procedimientos_basicos.docx',
    fileName: 'procedimientos_basicos.docx'
  },
  {
    title: 'Checklist de Requisitos Legales',
    description: 'Verifica el cumplimiento de la normativa legal vigente.',
    templateUrl: '/templates/sgsst/checklist_requisitos.xlsx',
    fileName: 'checklist_requisitos.xlsx'
  },
  {
    title: 'Indicadores de Gestión',
    description: 'Mide y evalúa el desempeño de tu Sistema de Gestión de SST.',
    templateUrl: '/templates/sgsst/indicadores_gestion.xlsx',
    fileName: 'indicadores_gestion.xlsx'
  }
];

const SGSSTPymes = () => {
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuggestion = async (title: string) => {
    setLoadingSuggestion(title);
    try {
      // Mock company info, replace with actual data later
      const companyInfo = { sector: 'Construcción', size: 50 };
      const result = await generateSGSSTSuggestion(title, companyInfo);
      alert(`Sugerencia para ${title}:\n\n${result.suggestion}`);
    } catch (error) {
      alert('Error al generar la sugerencia. Por favor, intente de nuevo.');
    } finally {
      setLoadingSuggestion(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          Crea tu Sistema de Gestión de SST
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Una guía paso a paso para implementar y mantener un Sistema de Gestión de Seguridad y Salud en el Trabajo adaptado a PyMES.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sgsstComponents.map((component) => (
          <div key={component.title} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">{component.title}</h3>
              <p className="mt-2 text-base text-gray-600">{component.description}</p>
              <div className="mt-6">
                <button
                  onClick={() => handleDownload(component.templateUrl, component.fileName)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar Plantilla
                </button>
                <button
                  onClick={() => handleSuggestion(component.title)}
                  disabled={loadingSuggestion === component.title}
                  className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {loadingSuggestion === component.title ? (
                    'Generando...'
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Asistente IA
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SGSSTPymes;
