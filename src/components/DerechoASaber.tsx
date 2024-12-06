import React, { useState } from 'react';
import { generateDAS, generateJobSuggestions } from '../services/azureOpenAI';
import { Wand2 } from 'lucide-react';

interface RiesgoLaboral {
  nombre: string;
  descripcion: string;
  consecuencias: string;
  medidasPreventivas: string[];
}

interface DASResponse {
  introduccion: string;
  riesgos: RiesgoLaboral[];
  conclusiones: string;
}

const DerechoASaber: React.FC = () => {
  const [formData, setFormData] = useState({
    empresa: '',
    cargo: '',
    area: '',
    pais: '',
    actividades: '',
    equipos: '',
    materiales: '',
  });

  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState<{
    all: boolean;
    actividades: boolean;
    equipos: boolean;
    materiales: boolean;
  }>({
    all: false,
    actividades: false,
    equipos: false,
    materiales: false
  });
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DASResponse | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await generateDAS(formData);
      setResultado(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar el DAS');
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async (field?: 'actividades' | 'equipos' | 'materiales') => {
    if (!formData.cargo) {
      setError('Por favor, ingrese primero el cargo para obtener sugerencias');
      return;
    }

    const loadingKey = field || 'all';
    setSuggestionsLoading(prev => ({ ...prev, [loadingKey]: true }));
    setError(null);

    try {
      const suggestions = await generateJobSuggestions(formData.cargo);
      setFormData(prev => ({
        ...prev,
        ...(field ? { [field]: suggestions[field] } : {
          actividades: suggestions.actividades,
          equipos: suggestions.equipos,
          materiales: suggestions.materiales
        })
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar sugerencias');
    } finally {
      setSuggestionsLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const SuggestionButton = ({ field, label }: { field?: 'actividades' | 'equipos' | 'materiales', label: string }) => (
    <button
      type="button"
      onClick={() => handleGetSuggestions(field)}
      disabled={suggestionsLoading[field || 'all'] || !formData.cargo}
      className={`inline-flex items-center px-3 py-1 text-sm rounded-md ${
        suggestionsLoading[field || 'all'] || !formData.cargo
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      }`}
    >
      <Wand2 className="w-4 h-4 mr-1" />
      {suggestionsLoading[field || 'all'] ? 'Generando...' : label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Derecho a Saber (DAS) - Obligación de Informar
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              id="empresa"
              name="empresa"
              value={formData.empresa}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
              Área de Trabajo
            </label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="pais" className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <select
              id="pais"
              name="pais"
              value={formData.pais}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar país</option>
              <option value="Chile">Chile</option>
              <option value="Argentina">Argentina</option>
              <option value="Perú">Perú</option>
              <option value="Colombia">Colombia</option>
              <option value="México">México</option>
              <option value="España">España</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Costa Rica">Costa Rica</option>
              <option value="Panamá">Panamá</option>
              <option value="República Dominicana">República Dominicana</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <div className="space-x-2">
                <label htmlFor="actividades" className="text-sm font-medium text-gray-700">
                  Actividades Principales
                </label>
                <SuggestionButton field="actividades" label="Sugerir Actividades" />
              </div>
              <SuggestionButton label="Sugerir Todo" />
            </div>
            <textarea
              id="actividades"
              name="actividades"
              value={formData.actividades}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="equipos" className="text-sm font-medium text-gray-700">
                Equipos y Herramientas
              </label>
              <SuggestionButton field="equipos" label="Sugerir Equipos" />
            </div>
            <textarea
              id="equipos"
              name="equipos"
              value={formData.equipos}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="materiales" className="text-sm font-medium text-gray-700">
                Materiales y Sustancias
              </label>
              <SuggestionButton field="materiales" label="Sugerir Materiales" />
            </div>
            <textarea
              id="materiales"
              name="materiales"
              value={formData.materiales}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 text-white rounded-md ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generando...' : 'Generar DAS'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {resultado && (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Introducción</h3>
            <p className="text-gray-700 whitespace-pre-line">{resultado.introduccion}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Riesgos Identificados</h3>
            <div className="space-y-4">
              {resultado.riesgos.map((riesgo, index) => (
                <div key={index} className="border rounded-md p-4">
                  <h4 className="font-semibold text-lg mb-2">{riesgo.nombre}</h4>
                  <p className="mb-2"><strong>Descripción:</strong> {riesgo.descripcion}</p>
                  <p className="mb-2"><strong>Consecuencias:</strong> {riesgo.consecuencias}</p>
                  <div>
                    <strong>Medidas Preventivas:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {riesgo.medidasPreventivas.map((medida, idx) => (
                        <li key={idx}>{medida}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Conclusiones</h3>
            <p className="text-gray-700 whitespace-pre-line">{resultado.conclusiones}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DerechoASaber;
