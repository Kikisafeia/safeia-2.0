import React, { useState } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';
import RiskMapViewer from '../components/RiskMapViewer';
import { analyzeWorkplaceImage } from '../services/riskMap';
import { RiskMap as RiskMapType } from '../types/riskMap';

export default function RiskMap() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskMap, setRiskMap] = useState<RiskMapType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar el tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen válida.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Analizar la imagen
      const result = await analyzeWorkplaceImage(file, {
        workplaceType: 'Área industrial',
        activities: ['Operación de maquinaria', 'Manipulación de materiales', 'Tránsito de personal']
      });

      setRiskMap(result);
    } catch (err) {
      setError('Error al analizar la imagen. Por favor, intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Encabezado */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Mapa de Riesgos
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Sube una imagen o plano de tu lugar de trabajo para identificar y visualizar riesgos potenciales.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-4">
        {!riskMap ? (
          // Zona de carga de archivos
          <div className="max-w-3xl mx-auto">
            <div className="mt-4">
              <label
                htmlFor="file-upload"
                className={`
                  relative cursor-pointer rounded-lg border-2 border-dashed p-12
                  flex flex-col items-center justify-center
                  ${isAnalyzing ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50'}
                  transition-colors duration-200 ease-in-out
                `}
              >
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileUpload}
                  accept="image/*"
                  disabled={isAnalyzing}
                />
                <div className="space-y-2 text-center">
                  <Upload
                    className={`mx-auto h-12 w-12 ${
                      isAnalyzing ? 'text-gray-400' : 'text-blue-500'
                    }`}
                  />
                  <div className="text-center">
                    {isAnalyzing ? (
                      <p className="text-sm text-gray-500">
                        Analizando imagen...
                      </p>
                    ) : (
                      <>
                        <p className="text-lg font-medium text-gray-900">
                          Arrastra y suelta una imagen aquí
                        </p>
                        <p className="text-sm text-gray-500">
                          o haz clic para seleccionar un archivo
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 10MB
                  </p>
                </div>
              </label>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mt-4 p-4 rounded-md bg-red-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error al procesar la imagen
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Visualizador del mapa de riesgos
          <div className="h-full">
            <RiskMapViewer riskMap={riskMap} />
          </div>
        )}
      </div>
    </div>
  );
}
