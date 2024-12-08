import React, { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { generateFODAAnalysis } from '../services/openai';
import { Loader2 } from 'lucide-react';

interface FODAItem {
  descripcion: string;
  impacto: 'Alto' | 'Medio' | 'Bajo';
  acciones: string[];
}

interface FODAAnalysis {
  fortalezas: FODAItem[];
  oportunidades: FODAItem[];
  debilidades: FODAItem[];
  amenazas: FODAItem[];
}

export default function FODA() {
  const [companyInfo, setCompanyInfo] = useState({
    nombre: '',
    sector: '',
    tamaño: '',
    ubicacion: '',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FODAAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await generateFODAAnalysis(companyInfo);
      setAnalysis(result);
    } catch (err) {
      setError('Error al generar el análisis FODA. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impacto: string) => {
    switch (impacto.toLowerCase()) {
      case 'alto':
        return 'bg-red-100 text-red-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'bajo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-safeia-black mb-8">Análisis FODA en Seguridad y Salud Ocupacional</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                name="nombre"
                value={companyInfo.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sector Industrial
              </label>
              <input
                type="text"
                name="sector"
                value={companyInfo.sector}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño de la Empresa
              </label>
              <input
                type="text"
                name="tamaño"
                value={companyInfo.tamaño}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="Ej: 50 empleados"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={companyInfo.ubicacion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de Actividades Principales
            </label>
            <textarea
              name="descripcion"
              value={companyInfo.descripcion}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-safeia-yellow text-safeia-black py-2 px-4 rounded-md hover:bg-safeia-yellow-dark disabled:bg-blue-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Generando análisis...
              </>
            ) : (
              'Generar Análisis FODA'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-green-600 mb-4">Fortalezas</h2>
              {analysis.fortalezas.map((item, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">{item.descripcion}</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getImpactColor(item.impacto)} mb-2`}>
                    Impacto: {item.impacto}
                  </span>
                  <ul className="list-disc list-inside">
                    {item.acciones.map((accion, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{accion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-blue-600 mb-4">Oportunidades</h2>
              {analysis.oportunidades.map((item, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">{item.descripcion}</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getImpactColor(item.impacto)} mb-2`}>
                    Impacto: {item.impacto}
                  </span>
                  <ul className="list-disc list-inside">
                    {item.acciones.map((accion, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{accion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-orange-600 mb-4">Debilidades</h2>
              {analysis.debilidades.map((item, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">{item.descripcion}</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getImpactColor(item.impacto)} mb-2`}>
                    Impacto: {item.impacto}
                  </span>
                  <ul className="list-disc list-inside">
                    {item.acciones.map((accion, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{accion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-red-600 mb-4">Amenazas</h2>
              {analysis.amenazas.map((item, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">{item.descripcion}</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${getImpactColor(item.impacto)} mb-2`}>
                    Impacto: {item.impacto}
                  </span>
                  <ul className="list-disc list-inside">
                    {item.acciones.map((accion, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{accion}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
