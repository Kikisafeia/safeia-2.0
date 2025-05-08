import React from 'react';
import ToolGenerator from '../components/tools/ToolGenerator';
import { generatePolitica, generatePoliticaSuggestions } from '../services/azureOpenAI';

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
      const suggestions = await generatePoliticaSuggestions(
        data.tipoPolitica,
        data.sector,
        data.pais
      );
      return suggestions.actividades;
    },
    alcance: async (data: any) => {
      const suggestions = await generatePoliticaSuggestions(
        data.tipoPolitica,
        data.sector,
        data.pais
      );
      return suggestions.alcance;
    },
    objetivos: async (data: any) => {
      const suggestions = await generatePoliticaSuggestions(
        data.tipoPolitica,
        data.sector,
        data.pais
      );
      return suggestions.objetivos;
    }
  };

  const resultTemplate = (result: any) => (
    <>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Introducción</h3>
        <p className="text-gray-700 whitespace-pre-line">{result.introduccion}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Propósito</h3>
        <p className="text-gray-700 whitespace-pre-line">{result.proposito}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Alcance</h3>
        <p className="text-gray-700 whitespace-pre-line">{result.alcance}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Objetivos</h3>
        <ul className="list-disc pl-5 space-y-2">
          {result.objetivos.map((objetivo: string, index: number) => (
            <li key={index} className="text-gray-700">{objetivo}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Compromisos</h3>
        <ul className="list-disc pl-5 space-y-2">
          {result.compromisos.map((compromiso: string, index: number) => (
            <li key={index} className="text-gray-700">{compromiso}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Responsabilidades</h3>
        
        <div className="mb-4">
          <h4 className="font-semibold text-lg mb-2">Gerencia</h4>
          <ul className="list-disc pl-5 space-y-1">
            {result.responsabilidades.gerencia.map((resp: string, index: number) => (
              <li key={index} className="text-gray-700">{resp}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg mb-2">Supervisores</h4>
          <ul className="list-disc pl-5 space-y-1">
            {result.responsabilidades.supervisores.map((resp: string, index: number) => (
              <li key={index} className="text-gray-700">{resp}</li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-lg mb-2">Trabajadores</h4>
          <ul className="list-disc pl-5 space-y-1">
            {result.responsabilidades.trabajadores.map((resp: string, index: number) => (
              <li key={index} className="text-gray-700">{resp}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Marco Legal</h3>
        <ul className="list-disc pl-5 space-y-2">
          {result.marco_legal.map((ley: string, index: number) => (
            <li key={index} className="text-gray-700">{ley}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Revisión y Actualización</h3>
        <p className="text-gray-700 whitespace-pre-line">{result.revision_actualizacion}</p>
      </div>

      <div className="mt-8 pt-8 border-t">
        <div className="text-right">
          <p className="font-semibold">{result.firma.cargo}</p>
          <p className="text-gray-600">{result.firma.fecha}</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolGenerator
      title="Generador de Políticas Empresariales"
      description="Esta herramienta te ayuda a crear diferentes tipos de políticas empresariales que cumplen con los estándares internacionales y la legislación local."
      formFields={formFields}
      generateFunction={generatePolitica}
      suggestionFunctions={suggestionFunctions}
      resultTemplate={resultTemplate}
    />
  );
};

export default Politicas;
