import { useState, useCallback } from 'react';
import { PlusCircle, MinusCircle, FileText, Download, Upload, Wand2, Search, Loader2 } from 'lucide-react';
import { generateATSAnalysis } from '../services/ats';
import { AnalisisTrabajoSeguro } from '../types/ats';
import RiskMapViewer from '../components/RiskMapViewer';
import { analyzeWorkplaceImage } from '../services/riskMap';
import { RiskMap as RiskMapType } from '../types/riskMap';
import { useDropzone } from 'react-dropzone';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { ATSInitializer } from '../components/ATSInitializer';

export default function ATS() {
  const [loading, setLoading] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingPasos, setLoadingPasos] = useState(false);
  const [actividad, setActividad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [area, setArea] = useState('');
  const [fecha, setFecha] = useState('');
  const [pais, setPais] = useState('');
  const [pasos, setPasos] = useState(['']);
  const [analisis, setAnalisis] = useState<AnalisisTrabajoSeguro | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskMap, setRiskMap] = useState<RiskMapType | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [legislacion, setLegislacion] = useState<string[]>([]);
  const [loadingLegislacion, setLoadingLegislacion] = useState(false);
  const [inicializado, setInicializado] = useState(false);

  const handleInitialize = async (descripcionInicial: string, imageUrl?: string) => {
    setDescripcion(descripcionInicial);
    if (imageUrl) {
      setIsAnalyzingImage(true);
      try {
        const result = await analyzeWorkplaceImage(imageUrl, {
          workplaceType: 'Área industrial',
          activities: [descripcionInicial],
          existingHazards: []
        });
        setRiskMap(result);
      } catch (err) {
        setError('Error al analizar la imagen. Por favor, intente nuevamente.');
        console.error(err);
      } finally {
        setIsAnalyzingImage(false);
      }
    }
    setInicializado(true);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    try {
      const result = await analyzeWorkplaceImage(file, {
        workplaceType: area || 'Área industrial',
        activities: pasos.filter(paso => paso.trim()),
        existingHazards: []
      });
      setRiskMap(result);
    } catch (err) {
      setError('Error al analizar la imagen. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setIsAnalyzingImage(false);
    }
  }, [area, pasos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  });

  const agregarPaso = () => {
    setPasos([...pasos, '']);
  };

  const eliminarPaso = (index: number) => {
    const nuevosPasos = pasos.filter((_, i) => i !== index);
    setPasos(nuevosPasos);
  };

  const actualizarPaso = (index: number, valor: string) => {
    const nuevosPasos = [...pasos];
    nuevosPasos[index] = valor;
    setPasos(nuevosPasos);
  };

  const generarAnalisis = async () => {
    if (!actividad.trim()) {
      setError('Por favor, ingrese el nombre de la actividad');
      return;
    }

    if (!descripcion.trim()) {
      setError('Por favor, ingrese la descripción de la actividad');
      return;
    }

    if (!area.trim()) {
      setError('Por favor, ingrese el área de trabajo');
      return;
    }

    if (!fecha) {
      setError('Por favor, ingrese la fecha');
      return;
    }

    if (!pais.trim()) {
      setError('Por favor, ingrese el país');
      return;
    }

    if (pasos.some(paso => !paso.trim())) {
      setError('Por favor, complete todos los pasos de la actividad');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const resultado = await generateATSAnalysis({
        actividad,
        descripcion,
        area,
        fecha,
        pais,
        pasos: pasos.filter(paso => paso.trim())
      }, riskMap);
      setAnalisis(resultado);
    } catch (err) {
      setError('Error al generar el análisis. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generarDescripcion = async () => {
    if (!actividad.trim()) {
      setError('Por favor, ingrese primero el nombre de la actividad');
      return;
    }

    setLoadingDescription(true);
    setError(null);

    try {
      const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
      const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
      const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;

      const client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(apiKey)
      );

      const messages = [
        {
          role: "system",
          content: "Eres un experto en seguridad y salud ocupacional. Tu tarea es generar descripciones detalladas y técnicas de actividades laborales, enfocándote en aspectos relevantes para el análisis de riesgos."
        },
        {
          role: "user",
          content: `Genera una descripción técnica y detallada para la siguiente actividad: "${actividad}".
          La descripción debe:
          1. Ser concisa pero completa
          2. Mencionar el propósito principal
          3. Incluir el contexto general de la actividad
          4. Considerar aspectos relevantes para la seguridad
          
          Formato: texto plano, máximo 3 líneas.`
        }
      ];

      const result = await client.getChatCompletions(deployment, messages, {
        temperature: 0.7,
        maxTokens: 200,
      });

      const content = result.choices[0].message?.content;
      if (!content) {
        throw new Error('No se recibió respuesta del servicio de IA');
      }

      setDescripcion(content.trim());
    } catch (err) {
      console.error('Error al generar descripción:', err);
      setError('Error al generar la descripción. Por favor, intente nuevamente.');
    } finally {
      setLoadingDescription(false);
    }
  };

  const generarPasos = async () => {
    if (!actividad.trim() || !descripcion.trim() || !fecha || !pais.trim()) {
      setError('Por favor, complete todos los campos requeridos');
      return;
    }

    setLoadingPasos(true);
    setError(null);

    try {
      const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
      const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
      const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;

      const client = new OpenAIClient(
        endpoint,
        new AzureKeyCredential(apiKey)
      );

      const messages = [
        {
          role: "system",
          content: "Eres un experto en seguridad ocupacional. Genera pasos secuenciales y seguros para actividades laborales."
        },
        {
          role: "user",
          content: `Genera 5-7 pasos secuenciales para realizar esta actividad de manera segura:

Actividad: ${actividad}
Descripción: ${descripcion}
${area ? `Área: ${area}` : ''}
Fecha: ${fecha}
País: ${pais}

Responde SOLO con los pasos numerados, sin texto adicional. Ejemplo:
1. Verificar equipo de protección personal requerido
2. Inspeccionar área de trabajo y herramientas
3. Señalizar y delimitar zona de trabajo
4. Ejecutar la tarea principal
5. Verificar resultado y limpiar área`
        }
      ];

      const result = await client.getChatCompletions(deployment, messages, {
        temperature: 0.7,
        maxTokens: 500,
      });

      const content = result.choices[0].message?.content;
      if (!content) {
        throw new Error('No se recibió respuesta del servicio de IA');
      }

      console.log('Respuesta de IA:', content);

      // Procesar la respuesta línea por línea
      const pasosList = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\./)) // Solo líneas que empiecen con números
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remover números y espacios
        .filter(line => line.length > 0); // Remover líneas vacías

      if (pasosList.length === 0) {
        throw new Error('No se pudieron generar pasos válidos');
      }

      setPasos(pasosList);
    } catch (err) {
      console.error('Error al generar pasos:', err);
      setError(err instanceof Error ? err.message : 'Error al generar los pasos. Por favor, intente nuevamente.');
    } finally {
      setLoadingPasos(false);
    }
  };

  const buscarLegislacion = async () => {
    if (!actividad.trim() || !pais.trim()) {
      setError('Se requiere la actividad y el país para buscar la legislación aplicable');
      return;
    }

    setLoadingLegislacion(true);
    setError(null);

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: 'system',
              content: 'Eres un experto legal en seguridad y salud ocupacional con amplio conocimiento de la normativa en Latinoamérica. Responde siempre en español y sé preciso y conciso. Es CRÍTICO que solo proporciones legislación específica del país solicitado.'
            },
            {
              role: 'user',
              content: `Identifica SOLO las principales leyes y decretos de ${pais.toUpperCase()} (y únicamente de ${pais.toUpperCase()}) que aplican a la siguiente actividad, incluyendo los artículos específicos cuando sea posible.

IMPORTANTE: SOLO debes proporcionar legislación vigente de ${pais.toUpperCase()}. NO incluyas legislación de otros países ni normas internacionales.

Actividad: ${actividad}
${area ? `Área: ${area}` : ''}
Fecha: ${fecha}
País: ${pais}

Proporciona ÚNICAMENTE los cuerpos legales aplicables (leyes, decretos, etc.) con sus artículos relevantes. NO incluyas recomendaciones ni explicaciones adicionales.

Por favor, proporciona la información en formato JSON con la siguiente estructura:
{
  "legalFramework": [
    {
      "name": "Nombre de la ley o decreto de ${pais.toUpperCase()} (ejemplo: si es Chile 'Ley 16.744', si es Colombia 'Ley 1562 de 2012')",
      "description": "Artículos específicos que aplican (ejemplo: 'Art. 184: Obligación del empleador de proteger la vida y salud de los trabajadores')",
      "url": "URL oficial del gobierno de ${pais.toUpperCase()} donde se puede consultar el texto legal completo"
    }
  ]
}

RECUERDA: Solo legislación de ${pais.toUpperCase()}, no de otros países.`
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          frequency_penalty: 1,
          presence_penalty: 0,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error de Perplexity:', errorData);
        throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Error al conectar con el servicio de Perplexity'}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No se recibió respuesta del servicio');
      }

      let result;
      try {
        // Intenta parsear directamente
        result = JSON.parse(content.trim());
      } catch (parseError) {
        console.error('Error al parsear JSON inicial:', parseError);
        
        // Intenta limpiar el contenido de markdown y volver a parsear
        const cleanContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        try {
          result = JSON.parse(cleanContent);
        } catch (secondParseError) {
          console.error('Error al parsear JSON limpio:', secondParseError);
          console.error('Contenido recibido:', content);
          throw new Error('Error al procesar la respuesta del servicio');
        }
      }

      if (!result?.legalFramework || !Array.isArray(result.legalFramework)) {
        throw new Error('Formato de respuesta inválido');
      }

      setLegislacion(result.legalFramework.map(item => 
        `${item.name} - ${item.description}${item.url ? ` (${item.url})` : ''}`
      ));

    } catch (err) {
      console.error('Error al buscar legislación:', err);
      setError(err instanceof Error ? err.message : 'Error al buscar la legislación aplicable');
    } finally {
      setLoadingLegislacion(false);
    }
  };

  const renderAnalisis = () => {
    if (!analisis) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-safeia-black">Análisis de Trabajo Seguro</h3>
        
        {/* Información general */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Actividad:</strong> {analisis.actividad}</p>
            <p><strong>Área:</strong> {analisis.area}</p>
          </div>
          <div>
            <p><strong>Fecha:</strong> {analisis.fecha}</p>
            <p><strong>País:</strong> {analisis.pais}</p>
            {analisis.responsable && (
              <p><strong>Responsable:</strong> {analisis.responsable}</p>
            )}
          </div>
        </div>

        {/* Tabla de análisis */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etapas del Trabajo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Riesgos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medidas Preventivas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Legislación Aplicable
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analisis.etapas.map((etapa, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-normal">
                    {etapa.etapa}
                  </td>
                  <td className="px-6 py-4 whitespace-normal">
                    <ul className="list-disc list-inside">
                      {etapa.riesgos.map((riesgo, idx) => (
                        <li key={idx}>{riesgo}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-normal">
                    <ul className="list-disc list-inside">
                      {etapa.medidasPreventivas.map((medida, idx) => (
                        <li key={idx}>{medida}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-normal">
                    <ul className="list-disc list-inside">
                      {etapa.legislacionAplicable.map((ley, idx) => (
                        <li key={idx}>{ley}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Información adicional */}
        {analisis.equiposProteccion && analisis.equiposProteccion.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2 text-safeia-black">Equipos de Protección Personal Requeridos:</h4>
            <ul className="list-disc list-inside">
              {analisis.equiposProteccion.map((epp, index) => (
                <li key={index}>{epp}</li>
              ))}
            </ul>
          </div>
        )}

        {analisis.condicionesAmbientales && analisis.condicionesAmbientales.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-safeia-black">Condiciones Ambientales a Considerar:</h4>
            <ul className="list-disc list-inside">
              {analisis.condicionesAmbientales.map((condicion, index) => (
                <li key={index}>{condicion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            {inicializado ? (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-safeia-black">
                  Análisis de Trabajo Seguro (ATS)
                </h3>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-md leading-6 font-medium text-gray-900 mb-4 text-safeia-black">
                    Información de la Actividad
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="actividad" className="block text-sm font-medium text-gray-700 text-safeia-black">
                        Nombre de la Actividad
                      </label>
                      <input
                        type="text"
                        id="actividad"
                        value={actividad}
                        onChange={(e) => setActividad(e.target.value)}
                        className="mt-1 block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                        placeholder="Ej: Trabajo en Altura"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        País
                      </label>
                      <input
                        type="text"
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        placeholder="Ingrese el país"
                        className="w-full p-2 border rounded-md focus:ring-safeia-yellow focus:border-safeia-yellow"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 text-safeia-black">
                        Descripción de la Actividad
                      </label>
                      <div className="mt-1 flex gap-2">
                        <textarea
                          id="descripcion"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          rows={3}
                          className="block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                          placeholder="Describa la actividad a realizar..."
                        />
                        <button
                          onClick={generarDescripcion}
                          disabled={loadingDescription || !actividad.trim()}
                          className="px-3 py-2 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Generar descripción con IA"
                        >
                          <Wand2 className={`w-5 h-5 ${loadingDescription ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="area" className="block text-sm font-medium text-gray-700 text-safeia-black">
                        Área de Trabajo
                      </label>
                      <input
                        type="text"
                        id="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Ej: Taller de Mantenimiento"
                      />
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={buscarLegislacion}
                        disabled={loadingLegislacion || !actividad.trim() || !pais.trim()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-safeia-black bg-safeia-yellow hover:bg-safeia-yellow-dark transition-colors ${
                          loadingLegislacion ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {loadingLegislacion ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Buscando legislación...
                          </>
                        ) : (
                          <>
                            <Search className="-ml-1 mr-2 h-4 w-4" />
                            Buscar Legislación Aplicable
                          </>
                        )}
                      </button>
                    </div>

                    {legislacion.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Legislación Aplicable</h3>
                        <ul className="list-disc pl-5 space-y-2">
                          {legislacion.map((ley, index) => (
                            <li key={index} className="text-sm text-gray-700">{ley}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-900 text-safeia-black">Pasos de la Actividad</h5>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={generarPasos}
                            disabled={loadingPasos || !actividad.trim() || !descripcion.trim() || !fecha || !pais.trim()}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-safeia-black bg-safeia-yellow hover:bg-safeia-yellow-dark transition-colors ${
                              loadingPasos ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Generar pasos con IA"
                          >
                            <Wand2 className={`h-4 w-4 mr-1 ${loadingPasos ? 'animate-spin' : ''}`} />
                            {loadingPasos ? 'Generando...' : 'Sugerir Pasos'}
                          </button>
                          <button
                            type="button"
                            onClick={agregarPaso}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-safeia-black bg-safeia-yellow hover:bg-safeia-yellow-dark transition-colors"
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Agregar Paso
                          </button>
                        </div>
                      </div>

                      {pasos.map((paso, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={paso}
                            onChange={(e) => actualizarPaso(index, e.target.value)}
                            className="block w-full rounded-md border-safeia-yellow shadow-sm focus:border-safeia-yellow focus:ring-safeia-yellow"
                            placeholder={`Paso ${index + 1}`}
                          />
                          {pasos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarPaso(index)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={generarAnalisis}
                      disabled={loading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-safeia-yellow hover:bg-safeia-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-1" />
                          Generar Análisis
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {renderAnalisis()}
              </div>
            ) : (
              <ATSInitializer onInitialize={handleInitialize} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
