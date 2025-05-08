import React from 'react';
import ToolGenerator from '../../components/tools/ToolGenerator';
import { generatePTS as originalGeneratePTS } from '../../services/azureOpenAI';

// Adaptador para la función generatePTS
const generatePTS = async (formData: any) => {
  return originalGeneratePTS(
    formData.activity,
    formData.riskLevel,
    formData.equipment,
    formData.location
  );
};

const nivelesRiesgo = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
  { value: 'critico', label: 'Crítico' }
];

const PTS: React.FC = () => {
  const formFields = [
    {
      name: 'activity',
      label: 'Actividad',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Trabajos en altura'
    },
    {
      name: 'riskLevel',
      label: 'Nivel de Riesgo',
      type: 'select' as const,
      required: true,
      options: nivelesRiesgo
    },
    {
      name: 'equipment',
      label: 'Equipos/Materiales',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Lista de equipos y materiales necesarios...'
    },
    {
      name: 'location',
      label: 'Ubicación/Área',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Planta de producción, piso 3'
    },
    {
      name: 'responsable',
      label: 'Responsable',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre del responsable'
    }
  ];

  const resultTemplate = (result: any) => (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Procedimiento</h3>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: result.content }} />
        </div>
      </div>

      {result.images && result.images.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Imágenes de Referencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.images.map((img: any, index: number) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                {img.url ? (
                  <img 
                    src={img.url} 
                    alt={img.section} 
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="bg-gray-100 p-8 text-center text-gray-500">
                    Imagen no disponible
                  </div>
                )}
                <div className="p-3 bg-gray-50 border-t">
                  <p className="text-sm font-medium">{img.section}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <ToolGenerator
      title="Procedimiento de Trabajo Seguro (PTS)"
      description="Esta herramienta genera procedimientos de trabajo seguro detallados para actividades de riesgo."
      formFields={formFields}
      generateFunction={generatePTS}
      resultTemplate={resultTemplate}
    />
  );
};

export default PTS;
