import React, { useState } from 'react'; // Added useState
import ToolGenerator from '../../components/tools/ToolGenerator';
import { generateDAS, suggestActividadesATS, suggestEquiposATS, suggestMaterialesATS } from '../../services/aiService'; // Added suggestion services
import { Wand2 } from 'lucide-react'; // For a potential icon, though ToolGenerator uses its own

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

  const resultTemplate = (result: import('../../services/aiService').DASResponse | null) => {
    if (!result || !result.etapas || result.etapas.length === 0) {
      return <p className="text-gray-700">No se generaron etapas para el análisis o el formato es incorrecto.</p>;
    }

    // The overall structure from the image has a title "ANÁLISIS DE TRABAJO SEGURO"
    // and a section "DESARROLLO DE LA ACTIVIDAD" above the table.
    // For simplicity, this template will focus on rendering the table itself.
    // Additional static titles/text can be added around the ToolGenerator or by enhancing it.

    return (
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold text-center mb-4">ANÁLISIS DE TRABAJO SEGURO</h2>
        <h3 className="text-xl font-semibold mb-2">DESARROLLO DE LA ACTIVIDAD</h3>
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Etapas del trabajo</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Riesgos / Aspecto ambientales / incidentes</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Medidas Preventivas</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Legislación Aplicable al tipo de trabajo</th>
            </tr>
          </thead>
          <tbody>
            {result.etapas.map((etapa, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2 align-top text-sm text-gray-700">{etapa.nombreEtapa}</td>
                <td className="border border-gray-300 px-4 py-2 align-top text-sm text-gray-700">
                  {etapa.riesgosAspectosIncidentes && etapa.riesgosAspectosIncidentes.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {etapa.riesgosAspectosIncidentes.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    'No especificado'
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 align-top text-sm text-gray-700">
                  {etapa.medidasPreventivas && etapa.medidasPreventivas.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {etapa.medidasPreventivas.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    'No especificado'
                  )}
                </td>
                {index === 0 && ( // Render legislation only in the first row, spanning all rows
                  <td 
                    className="border border-gray-300 px-4 py-2 align-top text-sm text-gray-700" 
                    rowSpan={result.etapas.length}
                  >
                    {result.legislacionAplicableOriginal || 'No especificada o no proporcionada.'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // State for loading individual suggestions (optional, if we want per-button loading state different from ToolGenerator's internal one)
  // ToolGenerator already has a 'loadingSuggestions' state, so we might not need these if we rely on its UI.
  // For now, we'll assume ToolGenerator's loading state is sufficient for field suggestions.
  // Add a new loading state for the automated legislation search.
  const [loadingAutomatedLegislation, setLoadingAutomatedLegislation] = useState(false);
  const [automatedLegislationError, setAutomatedLegislationError] = useState<string | null>(null);


  const handleSuggestActividades = async (currentFormData: Record<string, any>): Promise<string> => {
    if (!currentFormData.cargo || !currentFormData.sector) {
      // Or handle error appropriately, maybe return current value or empty string
      alert("Por favor, complete los campos 'Cargo/Puesto' y 'Sector Industrial' primero.");
      return String(currentFormData.actividades || '');
    }
    try {
      const result = await suggestActividadesATS(String(currentFormData.cargo), String(currentFormData.sector), String(currentFormData.empresa));
      return result.suggestions.join('\n');
    } catch (error) {
      console.error("Error sugiriendo actividades:", error);
      alert("Error al obtener sugerencias para actividades.");
      return String(currentFormData.actividades || ''); // Return current value on error
    }
  };

  const handleSuggestEquipos = async (currentFormData: Record<string, any>): Promise<string> => {
    if (!currentFormData.actividades || !currentFormData.sector) {
      alert("Por favor, complete los campos 'Actividades Principales' y 'Sector Industrial' primero.");
      return String(currentFormData.equipos || '');
    }
    try {
      const result = await suggestEquiposATS(String(currentFormData.actividades), String(currentFormData.sector));
      return result.suggestions.join('\n');
    } catch (error) {
      console.error("Error sugiriendo equipos:", error);
      alert("Error al obtener sugerencias para equipos.");
      return String(currentFormData.equipos || '');
    }
  };

  const handleSuggestMateriales = async (currentFormData: Record<string, any>): Promise<string> => {
    if (!currentFormData.actividades || !currentFormData.sector) {
      alert("Por favor, complete los campos 'Actividades Principales' y 'Sector Industrial' primero.");
      return String(currentFormData.materiales || '');
    }
    try {
      const result = await suggestMaterialesATS(String(currentFormData.actividades), String(currentFormData.sector));
      return result.suggestions.join('\n');
    } catch (error) {
      console.error("Error sugiriendo materiales:", error);
      alert("Error al obtener sugerencias para materiales.");
      return String(currentFormData.materiales || '');
    }
  };

  const suggestionFunctionsProp = {
    actividades: handleSuggestActividades,
    equipos: handleSuggestEquipos,
    materiales: handleSuggestMateriales,
  };

  const handleGenerateDAS = async (formData: Record<string, any>): Promise<any> => {
    setLoadingAutomatedLegislation(true);
    setAutomatedLegislationError(null);
    let legislacionParaIA = formData.legislacionAplicable; // Use if manually provided by assistant

    if (!legislacionParaIA) { // If not manually provided, try to fetch automatically
      try {
        const legislationResponse = await fetch('/api/legislation/search-ats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pais: formData.pais, sector: formData.sector }),
        });

        if (!legislationResponse.ok) {
          const errorData = await legislationResponse.json().catch(() => ({ error: "Error al buscar legislación automáticamente."}));
          throw new Error(errorData.error || `Error del servidor: ${legislationResponse.status}`);
        }
        const legislationData = await legislationResponse.json();
        legislacionParaIA = legislationData.legislacionAplicable;
      } catch (error) {
        console.error("Error fetching automated legislation:", error);
        setAutomatedLegislationError(error instanceof Error ? error.message : String(error));
        // Proceed without automated legislation, or with a default/error message
        // legislacionParaIA will remain undefined or use a default from below if needed
        // For now, if auto-search fails, it will be undefined, and aiService will handle it.
      } finally {
        setLoadingAutomatedLegislation(false);
      }
    }

    const input: import('../../services/aiService').DASInput = {
      empresa: String(formData.empresa),
      cargo: String(formData.cargo),
      area: String(formData.area),
      pais: String(formData.pais),
      sector: String(formData.sector),
      actividades: String(formData.actividades),
      equipos: String(formData.equipos),
      materiales: String(formData.materiales),
      legislacionAplicable: legislacionParaIA, // Use fetched or manually provided legislation
    };
    
    // The main generation function in ToolGenerator will set its own loading state.
    // We might want to display automatedLegislationError if it occurred.
    // For now, the error is just logged and state set. The result template will show
    // "No especificada o no proporcionada" if legislacionAplicableOriginal is empty.
    return generateDAS(input);
  };

  return (
    <ToolGenerator
      title="Análisis de Trabajo Seguro (ATS)"
      description="Esta herramienta genera un Análisis de Trabajo Seguro completo identificando riesgos y medidas preventivas para un puesto de trabajo."
      formFields={formFields}
      generateFunction={handleGenerateDAS}
      resultTemplate={resultTemplate}
      suggestionFunctions={suggestionFunctionsProp} // Pass the suggestion functions
    />
  );
};

export default ATS;
