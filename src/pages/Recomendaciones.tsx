import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { Plus, X } from 'lucide-react';
import { generateSafetyRecommendations } from '../services/aiService'; // Updated import path

interface Recomendacion {
  categoria: string;
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  acciones: string[];
  normativa?: string;
  legislacionLocal?: string;
  fuentesLegales?: string[];
}

// Lista de países latinoamericanos
const PAISES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela'
];

export default function Recomendaciones() {
  const [workplaceType, setWorkplaceType] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [currentActivity, setCurrentActivity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');

  const addActivity = () => {
    if (currentActivity.trim() && !activities.includes(currentActivity.trim())) {
      setActivities([...activities, currentActivity.trim()]);
      setCurrentActivity('');
    }
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addActivity();
    }
  };

  const generateRecommendations = async () => {
    if (!workplaceType.trim()) {
      setError('Por favor, ingrese el tipo de lugar de trabajo');
      return;
    }

    if (activities.length === 0) {
      setError('Por favor, ingrese al menos una actividad principal');
      return;
    }

    if (!selectedCountry) {
      setError('Por favor, seleccione un país');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateSafetyRecommendations(workplaceType, activities, selectedCountry);
      setRecomendaciones(result.recomendaciones);
    } catch (err) {
      setError('Error al generar recomendaciones. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Recomendaciones de Seguridad
          </h1>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="space-y-6">
              {/* País */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  País
                </label>
                <select
                  id="country"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Seleccione un país</option>
                  {PAISES.map((pais) => (
                    <option key={pais} value={pais}>
                      {pais}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de lugar de trabajo */}
              <div>
                <label htmlFor="workplace" className="block text-sm font-medium text-gray-700">
                  Tipo de lugar de trabajo
                </label>
                <input
                  type="text"
                  id="workplace"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value)}
                  placeholder="Ej: Oficina, Fábrica, Construcción..."
                />
              </div>

              {/* Actividades principales */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Actividades principales
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={currentActivity}
                    onChange={(e) => setCurrentActivity(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Agregar actividad..."
                  />
                  <button
                    type="button"
                    onClick={addActivity}
                    className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {/* Lista de actividades */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {activities.map((activity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800"
                    >
                      {activity}
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-900 focus:bg-blue-500 focus:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón generar */}
              <div className="pt-5">
                <button
                  onClick={generateRecommendations}
                  disabled={loading}
                  className="w-full rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                >
                  {loading ? 'Generando...' : 'Generar Recomendaciones'}
                </button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          {recomendaciones.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recomendaciones de Seguridad para {workplaceType} en {selectedCountry}
              </h2>
              <div className="space-y-6">
                {recomendaciones.map((rec, index) => (
                  <div key={index} className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {rec.categoria}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.prioridad)}`}>
                        {rec.prioridad}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{rec.descripcion}</p>
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Acciones recomendadas:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {rec.acciones.map((accion, idx) => (
                          <li key={idx}>{accion}</li>
                        ))}
                      </ul>
                      {rec.normativa && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900">Normativa aplicable:</h4>
                          <p className="text-gray-600">{rec.normativa}</p>
                        </div>
                      )}
                      {rec.legislacionLocal && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900">Legislación local:</h4>
                          <p className="text-gray-600">{rec.legislacionLocal}</p>
                        </div>
                      )}
                      {rec.fuentesLegales && rec.fuentesLegales.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900">Fuentes legales:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {rec.fuentesLegales.map((fuente, idx) => (
                              <li key={idx}>{fuente}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
