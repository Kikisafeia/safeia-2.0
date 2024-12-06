import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaCircle, FaDownload, FaLock } from 'react-icons/fa';
import DashboardNavbar from '../components/DashboardNavbar';
import { 
  getDocumentosPorEtapa, 
  descargarDocumento, 
  Documento 
} from '../services/documentos';
import {
  cargarProgreso,
  actualizarEtapa,
  verificarEtapaPrevia,
  marcarDocumentoCompletado,
  obtenerSiguienteEtapa,
  ProgresoSGSST,
  EtapaProgreso
} from '../services/progreso';

const SGSSTPymes: React.FC = () => {
  const [etapaActual, setEtapaActual] = useState<string>('evaluacion-inicial');
  const [progreso, setProgreso] = useState<ProgresoSGSST>(cargarProgreso());
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const docs = getDocumentosPorEtapa(etapaActual);
      setDocumentos(docs);
      setError('');
    } catch (err) {
      console.error('Error al cargar documentos:', err);
      setError('Error al cargar los documentos de la etapa');
    }
  }, [etapaActual]);

  const handleEtapaClick = (etapaId: string) => {
    if (!verificarEtapaPrevia(progreso, etapaId)) {
      setError('Debes completar la etapa anterior primero');
      return;
    }
    setError('');
    setEtapaActual(etapaId);
  };

  const handleDescargarDocumento = async (documento: Documento) => {
    setLoading(true);
    try {
      await descargarDocumento(documento);
      const nuevoProgreso = marcarDocumentoCompletado(
        progreso,
        etapaActual,
        documento.id
      );
      setProgreso(nuevoProgreso);
      setError('');
    } catch (err) {
      console.error('Error al descargar documento:', err);
      setError('Error al descargar el documento. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarEtapa = () => {
    if (!verificarEtapaPrevia(progreso, etapaActual)) {
      setError('Debes completar la etapa anterior primero');
      return;
    }

    try {
      const nuevoProgreso = actualizarEtapa(progreso, etapaActual, {
        completada: true,
        fechaCompletado: new Date().toISOString(),
      });
      setProgreso(nuevoProgreso);
      setError('');

      const siguienteEtapa = obtenerSiguienteEtapa(nuevoProgreso, etapaActual);
      if (siguienteEtapa) {
        setEtapaActual(siguienteEtapa);
      }
    } catch (err) {
      console.error('Error al completar etapa:', err);
      setError('Error al marcar la etapa como completada');
    }
  };

  const renderEtapa = (etapa: EtapaProgreso) => {
    const estaCompletada = etapa.completada;
    const estaActiva = etapa.id === etapaActual;
    const estaBloqueada = !verificarEtapaPrevia(progreso, etapa.id);

    return (
      <div
        key={etapa.id}
        className={`flex items-center p-4 cursor-pointer ${
          estaActiva ? 'bg-blue-100' : ''
        } ${estaBloqueada ? 'opacity-50' : ''} ${
          estaCompletada ? 'text-green-600' : ''
        }`}
        onClick={() => handleEtapaClick(etapa.id)}
      >
        {estaCompletada ? (
          <FaCheckCircle className="text-green-500 mr-2" />
        ) : estaBloqueada ? (
          <FaLock className="text-gray-500 mr-2" />
        ) : (
          <FaCircle className="text-gray-300 mr-2" />
        )}
        <span>{etapa.nombre}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavbar />
      <div className="flex p-6">
        {/* Barra lateral */}
        <div className="w-64 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 bg-blue-600 text-white">
            <h2 className="text-lg font-semibold">Sistema de Gestión SST</h2>
            <div className="mt-2 text-sm">
              Progreso: {Math.round(progreso.progreso)}%
            </div>
          </div>
          <div className="divide-y">
            {Object.values(progreso.etapas).map(renderEtapa)}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 ml-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4">
              {progreso.etapas[etapaActual].nombre}
            </h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Documentos Requeridos</h3>
                <div className="space-y-2">
                  {documentos.map((documento) => (
                    <div
                      key={documento.id}
                      className="flex items-center justify-between bg-white p-3 rounded border"
                    >
                      <div>
                        <div className="font-medium">{documento.nombre}</div>
                        <div className="text-sm text-gray-500">
                          {documento.descripcion}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDescargarDocumento(documento)}
                        disabled={loading}
                        className={`flex items-center px-3 py-1 rounded ${
                          loading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <FaDownload className="mr-2" />
                        {loading ? 'Descargando...' : 'Descargar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCompletarEtapa}
                disabled={!verificarEtapaPrevia(progreso, etapaActual)}
                className={`w-full py-2 px-4 rounded ${
                  verificarEtapaPrevia(progreso, etapaActual)
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {progreso.etapas[etapaActual].completada
                  ? 'Etapa Completada'
                  : 'Marcar como completada'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SGSSTPymes;
