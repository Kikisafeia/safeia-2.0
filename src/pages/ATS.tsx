import { useState, useCallback } from 'react';
import { PlusCircle, MinusCircle, FileText, Download, Upload } from 'lucide-react';
import { generateATSAnalysis } from '../services/ats';
import { AnalisisTrabajoSeguro } from '../types/ats';
import DashboardNavbar from '../components/DashboardNavbar';
import RiskMapViewer from '../components/RiskMapViewer';
import { analyzeWorkplaceImage } from '../services/riskMap';
import { RiskMap as RiskMapType } from '../types/riskMap';
import { useDropzone } from 'react-dropzone';

export default function ATS() {
  const [loading, setLoading] = useState(false);
  const [actividad, setActividad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [area, setArea] = useState('');
  const [pasos, setPasos] = useState(['']);
  const [analisis, setAnalisis] = useState<AnalisisTrabajoSeguro | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [riskMap, setRiskMap] = useState<RiskMapType | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

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

  const renderAnalisis = () => {
    if (!analisis) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Análisis de Trabajo Seguro</h3>
        
        {/* Información general */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Actividad:</strong> {analisis.actividad}</p>
            <p><strong>Área:</strong> {analisis.area}</p>
          </div>
          <div>
            <p><strong>Fecha:</strong> {analisis.fecha}</p>
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
            <h4 className="font-semibold mb-2">Equipos de Protección Personal Requeridos:</h4>
            <ul className="list-disc list-inside">
              {analisis.equiposProteccion.map((epp, index) => (
                <li key={index}>{epp}</li>
              ))}
            </ul>
          </div>
        )}

        {analisis.condicionesAmbientales && analisis.condicionesAmbientales.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Condiciones Ambientales a Considerar:</h4>
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
      <DashboardNavbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Análisis de Trabajo Seguro (ATS)
            </h3>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-md leading-6 font-medium text-gray-900 mb-4">
                Información de la Actividad
              </h4>
              <div className="space-y-6">
                <div>
                  <label htmlFor="actividad" className="block text-sm font-medium text-gray-700">
                    Nombre de la Actividad
                  </label>
                  <input
                    type="text"
                    id="actividad"
                    value={actividad}
                    onChange={(e) => setActividad(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Ej: Trabajo en Altura"
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                    Descripción de la Actividad
                  </label>
                  <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describa la actividad a realizar..."
                  />
                </div>

                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del Área de Trabajo
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <input {...getInputProps()} />
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Sube una imagen</span>
                        </label>
                        <p className="pl-1">o arrastra y suelta aquí</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                    </div>
                  </div>
                </div>

                {isAnalyzingImage && (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-sm text-gray-600">Analizando imagen...</p>
                  </div>
                )}

                {riskMap && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Mapa de Riesgos
                    </h5>
                    <div className="border rounded-lg overflow-hidden">
                      <RiskMapViewer riskMap={riskMap} />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-900">Pasos de la Actividad</h5>
                    <button
                      type="button"
                      onClick={agregarPaso}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Agregar Paso
                    </button>
                  </div>

                  {pasos.map((paso, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={paso}
                        onChange={(e) => actualizarPaso(index, e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
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
        </div>
      </div>
    </div>
  );
}
