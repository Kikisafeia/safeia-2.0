import React, { useState } from 'react';
import { generateAccidentReport, AccidentFormData, AccidentReportResult } from '../services/azureOpenAI';

const investigationMethods = [
  { id: 'arbol_causas', name: 'Árbol de Causas' },
  { id: 'cinco_porques', name: '5 Porqués' },
  { id: 'ishikawa', name: 'Diagrama de Ishikawa' },
  { id: 'tasc', name: 'Método TASC' }
];

const AccidentInvestigation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AccidentFormData>({
    metodo: '',
    empresa: '',
    pais: '',
    sector: '',
    fecha: '',
    lugar: '',
    descripcion: '',
    personas: '',
    lesiones: '',
    danos: ''
  });
  const [resultado, setResultado] = useState<AccidentReportResult | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMethodSelect = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      metodo: methodId
    }));
    setResultado(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const report = await generateAccidentReport(formData);
      setResultado(report);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Generador de Informe de Investigación de Accidentes
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Investigación
                </label>
                <select
                  name="metodo"
                  value={formData.metodo}
                  onChange={e => {
                    handleInputChange(e);
                    handleMethodSelect(e.target.value);
                  }}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Seleccionar método</option>
                  {investigationMethods.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Constructora XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Chile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sector
                </label>
                <input
                  type="text"
                  name="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Construcción"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar
                </label>
                <input
                  type="text"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Planta principal"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Accidente
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Describe el accidente ocurrido..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personas Involucradas
                </label>
                <input
                  type="text"
                  name="personas"
                  value={formData.personas}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Juan Pérez, María López"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesiones
                </label>
                <input
                  type="text"
                  name="lesiones"
                  value={formData.lesiones}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Fractura de pierna"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daños Materiales
                </label>
                <input
                  type="text"
                  name="danos"
                  value={formData.danos}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej: Computador dañado"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 text-white rounded-md ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Generando...' : 'Generar Informe'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {resultado && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {resultado.titulo}
              </h2>
            </div>

            <div className="prose max-w-none">
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Introducción</h3>
                <p className="text-gray-700 whitespace-pre-line">{resultado.introduccion}</p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Descripción</h3>
                <p className="text-gray-700 whitespace-pre-line">{resultado.descripcion}</p>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Causas</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {resultado.causas.map((causa, index) => (
                    <li key={index} className="text-gray-700">{causa}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Recomendaciones</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {resultado.recomendaciones.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Medidas Preventivas</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {resultado.medidas_preventivas.map((medida, index) => (
                    <li key={index} className="text-gray-700">{medida}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Responsables</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {resultado.responsables.map((resp, index) => (
                    <li key={index} className="text-gray-700">{resp}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Conclusiones</h3>
                <p className="text-gray-700 whitespace-pre-line">{resultado.conclusiones}</p>
              </div>
              <div className="mt-8 pt-8 border-t">
                <div className="text-right">
                  <p className="font-semibold">{resultado.firma.cargo}</p>
                  <p className="text-gray-600">{resultado.firma.fecha}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccidentInvestigation;
