import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import RiskMapViewer from '../components/RiskMapViewer';
import ImageCapture from '../components/ImageCapture';
import { analyzeWorkplaceImage } from '../services/riskMap';
import { RiskMap as RiskMapType, ImageCapture as ImageCaptureType, RiskPoint } from '../types/riskMap';

export default function RiskMap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskMap, setRiskMap] = useState<RiskMapType | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<RiskPoint | null>(null);

  useEffect(() => {
    // Limpiar la URL del PDF cuando el componente se desmonte
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleImageCapture = async (capture: ImageCaptureType) => {
    setLoading(true);
    setError(null);

    try {
      let imageFile: File;
      if (capture.type === 'camera') {
        // La imagen de la cámara ya viene como data URL
        const dataUrl = capture.data as string;
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        imageFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      } else {
        imageFile = capture.data as File;
      }

      const result = await analyzeWorkplaceImage(imageFile, {
        workplaceType: 'retail',
        activities: ['ventas', 'atención_al_cliente']
      });

      if (result.error) {
        setError(result.error);
      } else {
        setRiskMap(result);
      }

      // Crear URL para el PDF si existe
      if (result.reportPdfBlob) {
        const url = URL.createObjectURL(result.reportPdfBlob);
        setPdfUrl(url);
      }
    } catch (err) {
      console.error('Error al analizar la imagen:', err);
      setError(err instanceof Error ? err.message : 'Error al analizar la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskClick = (point: RiskPoint, e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir comportamiento por defecto
    setSelectedRisk(point);
  };

  const handleDownloadPdf = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir comportamiento por defecto
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'reporte-riesgos.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-800">Mapa de Riesgos</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">
          {/* Image Upload Area */}
          <div className="w-full md:w-2/3 h-[40vh] md:h-full p-4">
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <ImageCapture
                  onCapture={handleImageCapture}
                  disabled={loading}
                />
              </div>
              <div className="flex-1 relative overflow-hidden">
                {riskMap && (
                  <RiskMapViewer
                    riskMap={riskMap}
                    selectedRisk={selectedRisk}
                    onPointClick={(point) => handleRiskClick(point, point)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="w-full md:w-1/3 h-[60vh] md:h-full p-4 overflow-auto">
            <div className="bg-white rounded-lg shadow-sm h-full">
              <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Riesgos Identificados ({riskMap?.points?.length || 0})
                  </h2>
                  {pdfUrl && !loading && (
                    <button
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-safeia-black bg-safeia-yellow hover:bg-safeia-yellow-dark transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar PDF
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4">
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-safeia-yellow"></div>
                    <span className="ml-3 text-gray-600">Analizando imagen...</span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">Error en el análisis</h3>
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results */}
                {riskMap?.points?.length > 0 && (
                  <div className="space-y-4">
                    {riskMap.points.map((point) => (
                      <button
                        key={point.id}
                        onClick={(e) => handleRiskClick(point, e)}
                        className={`w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-safeia-yellow transition-colors ${
                          selectedRisk?.id === point.id ? 'border-safeia-yellow ring-2 ring-safeia-yellow/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                            point.severity === 'alto' ? 'bg-red-500' :
                            point.severity === 'medio' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">{point.name}</h3>
                            <p className="mt-1 text-sm text-gray-600">{point.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                point.severity === 'alto' ? 'bg-red-100 text-red-800' :
                                point.severity === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {point.severity}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {point.category}
                              </span>
                            </div>
                            {selectedRisk?.id === point.id && (
                              <div className="mt-3">
                                <h4 className="text-xs font-medium text-gray-900">Recomendaciones:</h4>
                                <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                                  {point.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                                {point.idealScenario && (
                                  <div className="mt-4">
                                    <h4 className="text-xs font-medium text-gray-900">Escenario Ideal:</h4>
                                    <div className="mt-2 rounded-lg overflow-hidden">
                                      <img
                                        src={point.idealScenario.imageUrl}
                                        alt="Escenario ideal"
                                        className="w-full h-48 object-cover"
                                      />
                                      <p className="mt-2 text-xs text-gray-600">
                                        {point.idealScenario.description}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
