import React from 'react';
import ToolGenerator from '../../components/tools/ToolGenerator';
import { generateDAS } from '../../services/azureOpenAI';

const sectores = [
  'Construcción',
  'Manufactura',
  'Minería',
  'Transporte',
  'Salud',
  'Educación',
  'Comercio',
  'Agricultura'
];

const ATS: React.FC = () => {
  const formFields = [
    {
      name: 'empresa',
      label: 'Nombre de la Empresa',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Constructora XYZ'
    },
    {
      name: 'cargo',
      label: 'Cargo/Puesto',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Operador de maquinaria'
    },
    {
      name: 'area',
      label: 'Área/Departamento',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Producción'
    },
    {
      name: 'pais',
      label: 'País',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Chile'
    },
    {
      name: 'sector',
      label: 'Sector Industrial',
      type: 'select' as const,
      required: true,
      options: sectores.map(s => ({ value: s, label: s }))
    },
    {
      name: 'actividades',
      label: 'Actividades Principales',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Describe las principales actividades del puesto...'
    },
    {
      name: 'equipos',
      label: 'Equipos/Maquinaria Utilizada',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Lista los equipos y maquinaria utilizados...'
    },
    {
      name: 'materiales',
      label: 'Materiales/Substancias',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Lista los materiales y substancias utilizadas...'
    }
  ];

  const resultTemplate = (result: any) => (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Introducción</h3>
        <p className="text-gray-700 whitespace-pre-line">{result.introduccion}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Riesgos Identificados</h3>
        <ul className="list-disc pl-5 space-y-4">
          {result.riesgos.map((riesgo: any, index: number) => (
            <li key={index} className="text-gray-700">
              <h4 className="font-semibold">{riesgo.nombre}</h4>
              <p>{riesgo.descripcion}</p>
              {riesgo.consecuencias && (
                <p className="mt-1"><span className="font-medium">Consecuencias:</span> {riesgo.consecuencias}</p>
              )}
              {riesgo.medidasPreventivas && riesgo.medidasPreventivas.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Medidas Preventivas:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {riesgo.medidasPreventivas.map((medida: string, i: number) => (
                      <li key={i}>{medida}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Conclusiones</h3>
        <p className="text-gray-700 whitespace-pre-line">{result.conclusiones}</p>
      </div>
    </>
  );

  return (
    <ToolGenerator
      title="Análisis de Trabajo Seguro (ATS)"
      description="Esta herramienta genera un Análisis de Trabajo Seguro completo identificando riesgos y medidas preventivas para un puesto de trabajo."
      formFields={formFields}
      generateFunction={generateDAS}
      resultTemplate={resultTemplate}
    />
  );
};

export default ATS;
