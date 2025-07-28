import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../contexts/FirestoreContext';
import { useSubscription } from '../hooks/useSubscription';
import ToolGenerator from '../components/tools/ToolGenerator';
import { generatePolitica, generatePoliticaSuggestions } from '../services/aiService';

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
  const { currentUser } = useAuth();
  const { db } = useFirestore();
  const { features } = useSubscription();
  const [policyCount, setPolicyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    const fetchPolicyCount = async () => {
      if (!currentUser || !db) return;
      try {
        const policiesRef = collection(db, 'users', currentUser.uid, 'policies');
        const q = query(policiesRef);
        const querySnapshot = await getDocs(q);
        setPolicyCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching policy count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyCount();
  }, [currentUser, db]);

  const handleCreateNewPolicy = () => {
    setShowGenerator(true);
  };

  const handleReset = () => {
    setShowGenerator(false);
    // Optionally, you can refetch the policy count here if a policy was just created
  };

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
      if (!data.sector || !data.empresa || !data.pais) {
        alert('Por favor, completa los campos "Sector Industrial", "Nombre de la Empresa" y "País" para obtener sugerencias.');
        return data.actividades || '';
      }
      try {
        const result = await generatePoliticaSuggestions({
          sector: data.sector,
          fieldToSuggest: 'actividades'
        });
        if (result.error) throw new Error(result.error);
        return result.suggestions?.join('\n') || '';
      } catch (error: any) {
        console.error('Error fetching suggestions for actividades:', error);
        alert(`No se pudieron generar sugerencias: ${error.message}`);
        return data.actividades || '';
      }
    },
    alcance: async (data: any) => {
      if (!data.sector || !data.empresa || !data.pais || !data.actividades) {
        alert('Por favor, completa los campos "Sector Industrial", "Nombre de la Empresa", "País" y "Actividades Principales" para obtener sugerencias.');
        return data.alcance || '';
      }
      try {
        const result = await generatePoliticaSuggestions({
          sector: data.sector,
          actividad: data.actividades,
          fieldToSuggest: 'alcance'
        });
        if (result.error) throw new Error(result.error);
        return result.suggestions?.join('\n') || '';
      } catch (error: any) {
        console.error('Error fetching suggestions for alcance:', error);
        alert(`No se pudieron generar sugerencias: ${error.message}`);
        return data.alcance || '';
      }
    },
    objetivos: async (data: any) => {
      if (!data.sector || !data.empresa || !data.pais || !data.actividades || !data.alcance) {
        alert('Por favor, completa los campos "Sector Industrial", "Nombre de la Empresa", "País", "Actividades Principales" y "Alcance" para obtener sugerencias.');
        return data.objetivos || '';
      }
      try {
        const result = await generatePoliticaSuggestions({
          sector: data.sector,
          actividad: data.actividades,
          descripcion: data.alcance,
          fieldToSuggest: 'objetivos'
        });
        if (result.error) throw new Error(result.error);
        return result.suggestions?.join('\n') || '';
      } catch (error: any) {
        console.error('Error fetching suggestions for objetivos:', error);
        alert(`No se pudieron generar sugerencias: ${error.message}`);
        return data.objetivos || '';
      }
    }
  };

  const resultTemplate = (result: any) => {
    try {
      // Check if result and result.content are valid before parsing
      if (!result || !result.content) {
        throw new Error("No se recibió contenido válido para generar la política.");
      }

      const policyData = JSON.parse(result.content);
      
      // Check if the parsed data has the expected structure
      if (!policyData || !policyData.meta || !policyData.politica) {
        throw new Error("El formato de la política recibida es incorrecto.");
      }

      const meta = policyData.meta;
      const policy = policyData.politica;
      
      return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto overflow-y-auto h-full border border-gray-300"> {/* Added overflow-y-auto and h-full for debugging */}
          {/* Encabezado */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              POLÍTICA DE {policy.titulo.toUpperCase()}
            </h1>
            <h2 className="text-xl text-blue-700">{meta.empresa}</h2>
          </div>

          {/* Información General */}
          <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
              INFORMACIÓN GENERAL
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p><span className="font-semibold">Empresa:</span> {meta.empresa}</p>
                <p><span className="font-semibold">País:</span> {meta.pais}</p>
              </div>
              <div className="space-y-2">
                <p><span className="font-semibold">Sector:</span> {meta.sector}</p>
                <p><span className="font-semibold">N° Trabajadores:</span> {meta.numeroDeTrabajadores}</p>
              </div>
            </div>
          </div>

          {/* Declaración */}
          {policy.declaracion && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                DECLARACIÓN
              </h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="italic whitespace-pre-line">{policy.declaracion}</p>
              </div>
            </div>
          )}

          {/* Alcance */}
          {policy.alcance && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                ALCANCE
              </h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="whitespace-pre-line">{policy.alcance}</p>
              </div>
            </div>
          )}

          {/* Objetivos */}
          {policy.objetivos && policy.objetivos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                OBJETIVOS
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                {policy.objetivos.map((obj: string, i: number) => (
                  <li key={i} className="text-gray-900">{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Compromisos */}
          {policy.compromisos && policy.compromisos.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                COMPROMISOS
              </h3>
              <ul className="space-y-3">
                {policy.compromisos.map((comp: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="inline-block bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      ✓
                    </span>
                    <p className="text-gray-900">{comp}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Responsabilidades */}
          {policy.responsabilidades && (
            <div className="mb-8 bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                ROLES Y RESPONSABILIDADES
              </h3>
              {policy.responsabilidades.direccion && policy.responsabilidades.direccion.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold text-gray-900">Dirección:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-800">
                    {policy.responsabilidades.direccion.map((res: string, i: number) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              )}
              {policy.responsabilidades.trabajadores && policy.responsabilidades.trabajadores.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold text-gray-900">Trabajadores:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-800">
                    {policy.responsabilidades.trabajadores.map((res: string, i: number) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              )}
              {policy.responsabilidades.prevencion && policy.responsabilidades.prevencion.length > 0 && (
                <div>
                  <p className="font-bold text-gray-900">Prevención de Riesgos:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-800">
                    {policy.responsabilidades.prevencion.map((res: string, i: number) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Implementación */}
          {policy.implementacion && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                IMPLEMENTACIÓN
              </h3>
              {policy.implementacion.procedimientos && policy.implementacion.procedimientos.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold text-gray-900">Procedimientos:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-800">
                    {policy.implementacion.procedimientos.map((proc: string, i: number) => (
                      <li key={i}>{proc}</li>
                    ))}
                  </ul>
                </div>
              )}
              {policy.implementacion.formacion && policy.implementacion.formacion.length > 0 && (
                <div className="mb-4">
                  <p className="font-bold text-gray-900">Formación:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-800">
                    {policy.implementacion.formacion.map((form: string, i: number) => (
                      <li key={i}>{form}</li>
                    ))}
                  </ul>
                </div>
              )}
              {policy.implementacion.evaluacion && policy.implementacion.evaluacion.length > 0 && (
                <div>
                  <p className="font-bold text-gray-900">Evaluación:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-800">
                    {policy.implementacion.evaluacion.map((evalItem: string, i: number) => (
                      <li key={i}>{evalItem}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Marco Legal Aplicable */}
          {policy.marcoLegalAplicable && (
            <div className="mb-8 bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-yellow-800 border-b pb-2">
                MARCO LEGAL APLICABLE
              </h3>
              <p className="text-gray-900 whitespace-pre-line">{policy.marcoLegalAplicable}</p>
            </div>
          )}

          {/* Sanciones o Consecuencias */}
          {policy.sancionesOConsecuencias && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                SANCIONES O CONSECUENCIAS
              </h3>
              <div className="bg-red-50 p-4 rounded">
                <p className="text-gray-900 whitespace-pre-line">{policy.sancionesOConsecuencias}</p>
              </div>
            </div>
          )}

          {/* Revisión */}
          {policy.revision && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-800 border-b pb-2">
                REVISIÓN Y ACTUALIZACIÓN
              </h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Periodicidad:</span> {policy.revision.periodicidad}</p>
                <p><span className="font-semibold">Responsable:</span> {policy.revision.responsable}</p>
              </div>
            </div>
          )}

          {/* Firma */}
          <div className="mt-12 pt-6 border-t text-center">
            <p className="font-bold text-black">{meta.empresa}</p>
            <p className="text-gray-700 font-medium">Fecha: {meta.fechaGeneracion}</p>
            <p className="text-gray-700 font-medium">Versión: {meta.version}</p>
          </div>
        </div>
      );
    } catch (e) {
      console.error("Error parsing policy JSON or rendering template:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      return (
        <div className="prose max-w-none">
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Política Generada (Error de Formato)</h3>
            <div className="text-red-600 whitespace-pre-line">
              Error al procesar la política. Asegúrate de que el formato JSON sea correcto.
              <br/>Detalles del error: {errorMessage}
              <br/>Contenido recibido: {result.content || 'Vacío'}
            </div>
          </div>
        </div>
      );
    }
  };

  const canCreatePolicy = features.hasAccess || policyCount < 3;

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      {!showGenerator ? (
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Generador de Políticas</h1>
          <p className="mb-4">Políticas creadas: {policyCount}</p>
          {canCreatePolicy ? (
            <button
              onClick={handleCreateNewPolicy}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Crear Nueva Política
            </button>
          ) : (
            <p className="text-red-500">Has alcanzado el límite de 3 políticas para el plan gratuito.</p>
          )}
        </div>
      ) : (
        <ToolGenerator
          title="Generador de Políticas Empresariales"
          description="Esta herramienta te ayuda a crear diferentes tipos de políticas empresariales que cumplen con los estándares internacionales y la legislación local."
          formFields={formFields}
          generateFunction={async (data: any) => {
            if (!canCreatePolicy) {
              alert("No puedes crear más políticas con el plan actual.");
              return;
            }
            return generatePolitica(
              data.tipoPolitica,
              data.empresa,
              data.pais,
              data.sector,
              data.trabajadores,
              data.actividades,
              data.alcance,
              data.objetivos
            );
          }}
          suggestionFunctions={suggestionFunctions}
          resultTemplate={resultTemplate}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default Politicas;
