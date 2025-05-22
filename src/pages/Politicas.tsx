import React from 'react';
import ToolGenerator from '../components/tools/ToolGenerator';
import { generatePolitica, generatePoliticaSuggestions } from '../services/aiService'; // Updated import path

const tipoPoliticas = [
  { id: 'sst', nombre: 'Seguridad y Salud en el Trabajo' },
  { id: 'medioambiente', nombre: 'Medio Ambiente' },
  { id: 'calidad', nombre: 'Calidad' },
  { id: 'security', nombre: 'Seguridad de la Información' },
  { id: 'integrado', nombre: 'Sistema Integrado de Gestión' }
];

const paises = [
  'Chile', 'Argentina', 'Perú', 'Colombia', 'México',
  'España', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia',
  'Venezuela', 'Costa Rica', 'Panamá', 'República Dominicana'
];

const Politicas: React.FC = () => {
  const formFields = [
    {
      name: 'tipoPolitica',
      label: 'Tipo de Política',
      type: 'select' as const,
      required: true,
      options: tipoPoliticas.map(t => ({ value: t.id, label: t.nombre }))
    },
    {
      name: 'empresa',
      label: 'Nombre de la Empresa',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Constructora XYZ'
    },
    {
      name: 'pais',
      label: 'País',
      type: 'select' as const,
      required: true,
      options: paises.map(p => ({ value: p, label: p }))
    },
    {
      name: 'sector',
      label: 'Sector Industrial',
      type: 'text' as const,
      required: true,
      placeholder: 'Ej: Construcción'
    },
    {
      name: 'trabajadores',
      label: 'Número de Trabajadores',
      type: 'number' as const,
      required: true,
      placeholder: 'Ej: 100'
    },
    {
      name: 'actividades',
      label: 'Actividades Principales',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Describe las principales actividades de la empresa...'
    },
    {
      name: 'alcance',
      label: 'Alcance de la Política',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Define el alcance deseado de la política...'
    },
    {
      name: 'objetivos',
      label: 'Objetivos Específicos',
      type: 'textarea' as const,
      required: true,
      placeholder: 'Define los objetivos específicos de la política...'
    }
  ];

  const suggestionFunctions = {
    actividades: async (data: any) => {
      const { suggestions } = await generatePoliticaSuggestions(data.sector);
      return suggestions.join('\n');
    },
    alcance: async (data: any) => {
      const { suggestions } = await generatePoliticaSuggestions(data.sector);
      return suggestions.join('\n');
    },
    objetivos: async (data: any) => {
      const { suggestions } = await generatePoliticaSuggestions(data.sector);
      return suggestions.join('\n');
    }
  };

  const resultTemplate = (result: any) => (
    <div className="prose max-w-none">
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Política Generada</h3>
        <div className="text-gray-700 whitespace-pre-line">
          {result.content || 'No se pudo generar la política'}
        </div>
      </div>
    </div>
  );

  return (
    <ToolGenerator
      title="Generador de Políticas Empresariales"
      description="Esta herramienta te ayuda a crear diferentes tipos de políticas empresariales que cumplen con los estándares internacionales y la legislación local."
      formFields={formFields}
      generateFunction={generatePolitica as any} // Type assertion to resolve mismatch
      suggestionFunctions={suggestionFunctions}
      resultTemplate={resultTemplate}
    />
  );
};

export default Politicas;
