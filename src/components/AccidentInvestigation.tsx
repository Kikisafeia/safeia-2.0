import React, { useState } from 'react';
import { generateInvestigation } from '../services/azureOpenAI';

interface AccidentInvestigationProps {
  onMethodSelect: (method: string) => void;
}

interface InvestigationResult {
  analysis: string;
  causes: string[];
  recommendations: string[];
  preventiveMeasures: string[];
}

const AccidentInvestigation: React.FC<AccidentInvestigationProps> = ({ onMethodSelect }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accidentDescription: '',
    date: '',
    location: '',
    involvedPersons: '',
    injuries: '',
    damages: '',
  });

  const investigationMethods = [
    {
      id: 'arbol_causas',
      name: 'Árbol de Causas',
      description: 'Método que analiza las relaciones entre los hechos que han contribuido a la producción del accidente.',
      steps: [
        'Recopilación de información inmediata post-accidente',
        'Identificación de hechos relevantes',
        'Organización cronológica de eventos',
        'Construcción del árbol de causas',
        'Identificación de medidas preventivas'
      ]
    },
    {
      id: 'cinco_porques',
      name: '5 Porqués',
      description: 'Técnica sistemática de preguntas para buscar la causa raíz de un problema.',
      steps: [
        'Definir claramente el problema',
        'Preguntar "¿Por qué?" la primera vez',
        'Preguntar "¿Por qué?" a la respuesta anterior',
        'Continuar hasta identificar la causa raíz',
        'Validar la cadena lógica de causas'
      ]
    },
    {
      id: 'ishikawa',
      name: 'Diagrama de Ishikawa',
      description: 'También conocido como diagrama de espina de pescado, analiza las causas desde diferentes categorías.',
      steps: [
        'Identificar el problema principal',
        'Identificar las categorías principales (6M: Mano de obra, Método, Máquina, Material, Medio ambiente, Medición)',
        'Analizar causas potenciales en cada categoría',
        'Profundizar en las causas más significativas',
        'Establecer acciones correctivas'
      ]
    },
    {
      id: 'tasc',
      name: 'Método TASC',
      description: 'Técnica de Análisis Sistemático de Causas, que evalúa factores técnicos y humanos.',
      steps: [
        'Análisis preliminar del accidente',
        'Recolección de evidencias físicas',
        'Entrevistas a testigos',
        'Análisis de factores técnicos y humanos',
        'Determinación de causas inmediatas y básicas',
        'Desarrollo del plan de acción'
      ]
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setResult(null);
    setError(null);
    onMethodSelect(methodId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;

    setLoading(true);
    setError(null);
    
    try {
      const investigation = await generateInvestigation(selectedMethod, formData);
      setResult(investigation);
    } catch (error) {
      console.error('Error al generar la investigación:', error);
      setError(error instanceof Error ? error.message : 'Error al generar la investigación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Metodologías de Investigación de Accidentes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {investigationMethods.map((method) => (
          <div 
            key={method.id}
            className={`p-6 border rounded-lg shadow-sm transition-all cursor-pointer ${
              selectedMethod === method.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow'
            }`}
            onClick={() => handleMethodSelect(method.id)}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.name}</h3>
            <p className="text-gray-600 mb-4">{method.description}</p>
            
            {selectedMethod === method.id && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Pasos a seguir:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  {method.steps.map((step, index) => (
                    <li key={index} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedMethod && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Detalles del Accidente</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Accidente
              </label>
              <textarea
                name="accidentDescription"
                value={formData.accidentDescription}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personas Involucradas
              </label>
              <input
                type="text"
                name="involvedPersons"
                value={formData.involvedPersons}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lesiones
              </label>
              <input
                type="text"
                name="injuries"
                value={formData.injuries}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daños Materiales
              </label>
              <input
                type="text"
                name="damages"
                value={formData.damages}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Generando...' : 'Generar Investigación'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </form>
      )}

      {result && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Resultado de la Investigación</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Análisis</h4>
              <p className="text-gray-700 whitespace-pre-line">{result.analysis}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Causas Identificadas</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.causes.map((cause, index) => (
                  <li key={index} className="text-gray-700">{cause}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recomendaciones</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Medidas Preventivas</h4>
              <ul className="list-disc pl-5 space-y-1">
                {result.preventiveMeasures.map((measure, index) => (
                  <li key={index} className="text-gray-700">{measure}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccidentInvestigation;
