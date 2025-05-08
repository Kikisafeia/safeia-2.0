import React from 'react';
import ToolGenerator from '../../components/tools/ToolGenerator';
import { generateRiskMatrix } from '../../services/azureOpenAI';

const MatrizRiesgos: React.FC = () => {
  const formFields = [
    {
      name: 'company',
      label: 'Nombre de la Empresa',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Constructora XYZ'
    },
    {
      name: 'sector',
      label: 'Sector Industrial',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Construcción, Minería, etc.'
    },
    {
      name: 'processes',
      label: 'Procesos/Actividades',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Lista los principales procesos o actividades de la empresa...'
    },
    {
      name: 'workers',
      label: 'Número de Trabajadores',
      type: 'number' as const,
      required: true,
      placeholder: 'Ej: 50'
    },
    {
      name: 'history',
      label: 'Historial de Incidentes',
      type: 'textarea' as const,
      required: false,
      placeholder: 'Describe incidentes/accidentes previos si los hay...'
    }
  ];

  const resultTemplate = (result: any) => (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Matriz de Riesgos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peligro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Riesgo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probabilidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consecuencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel de Riesgo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medidas de Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.riesgos.map((riesgo: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{riesgo.peligro}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{riesgo.riesgo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{riesgo.probabilidad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{riesgo.consecuencia}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    riesgo.nivel === 'Alto' ? 'text-red-600' : 
                    riesgo.nivel === 'Medio' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {riesgo.nivel}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <ul className="list-disc pl-5">
                      {riesgo.medidas.map((medida: string, i: number) => (
                        <li key={i}>{medida}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Resumen de Riesgos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-800">Riesgos Altos</h4>
            <p className="text-red-600">{result.resumen.alto}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800">Riesgos Medios</h4>
            <p className="text-yellow-600">{result.resumen.medio}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Riesgos Bajos</h4>
            <p className="text-green-600">{result.resumen.bajo}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <ToolGenerator
      title="Matriz de Riesgos"
      description="Esta herramienta genera una matriz de riesgos completa identificando peligros, evaluando riesgos y proponiendo medidas de control."
      formFields={formFields}
      generateFunction={generateRiskMatrix}
      resultTemplate={resultTemplate}
    />
  );
};

export default MatrizRiesgos;
