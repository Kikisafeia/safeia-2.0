import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaCircle, 
  FaDownload, 
  FaLock, 
  FaLightbulb, 
  FaSpinner,
  FaStar,
  FaTrophy,
  FaMedal,
  FaGem,
  FaBuilding,
  FaFilePdf
} from 'react-icons/fa';
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
// import { getSuggestionsByEtapa, AISuggestion } from '../services/ai'; // Commented out due to missing file

interface CompanyProfile {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  numEmpleados: number;
  sectorEconomico: string;
  nivelRiesgo: string;
  actividadPrincipal: string;
  representanteLegal: string;
  responsableSGSST: string;
}

interface GameStats {
  points: number;
  level: number;
  achievements: string[];
  suggestionsUsed: number;
  documentsDownloaded: number;
  stagesCompleted: number;
}

const SGSSTPymes: React.FC = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [etapaActual, setEtapaActual] = useState<string>('evaluacion-inicial');
  const [progreso, setProgreso] = useState<ProgresoSGSST>(cargarProgreso());
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any[]>>({}); // Changed AISuggestion[] to any[]
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({});
  const [gameStats, setGameStats] = useState<GameStats>({
    points: 0,
    level: 1,
    achievements: [],
    suggestionsUsed: 0,
    documentsDownloaded: 0,
    stagesCompleted: 0
  });
  const [showAchievement, setShowAchievement] = useState<string>('');
  const [riskMapPdfUrl, setRiskMapPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Cargar el perfil de la empresa
    const loadCompanyProfile = async () => {
      try {
        // TODO: Implementar llamada a API para obtener el perfil
        // const response = await fetch('/api/company-profile');
        // const data = await response.json();
        // setCompanyProfile(data);
      } catch (error) {
        console.error('Error al cargar el perfil de la empresa:', error);
      }
    };

    loadCompanyProfile();
  }, []);

  const addPoints = (points: number, reason: string) => {
    setGameStats(prev => {
      const newPoints = prev.points + points;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      if (newLevel > prev.level) {
        setShowAchievement(`¡Nivel ${newLevel} Alcanzado! 🎉`);
        setTimeout(() => setShowAchievement(''), 3000);
      }
      
      return {
        ...prev,
        points: newPoints,
        level: newLevel
      };
    });
  };

  const checkAchievements = () => {
    const newAchievements: string[] = [];
    
    if (gameStats.documentsDownloaded === 5 && !gameStats.achievements.includes('Documentador Novato')) {
      newAchievements.push('Documentador Novato');
    }
    if (gameStats.suggestionsUsed === 10 && !gameStats.achievements.includes('Aprendiz de IA')) {
      newAchievements.push('Aprendiz de IA');
    }
    if (gameStats.stagesCompleted === 3 && !gameStats.achievements.includes('Gestor en Progreso')) {
      newAchievements.push('Gestor en Progreso');
    }

    if (newAchievements.length > 0) {
      setGameStats(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }));
      setShowAchievement(`¡Nuevo Logro Desbloqueado: ${newAchievements[0]}! 🏆`);
      setTimeout(() => setShowAchievement(''), 3000);
    }
  };

  const handleGetSuggestions = async (categoria: string) => {
    setLoadingSuggestions(prev => ({ ...prev, [categoria]: true }));
    console.warn(`Attempted to get suggestions for ${categoria}, but getSuggestionsByEtapa is currently disabled.`);
    // try {
    //   // Incluir información de la empresa en la solicitud de sugerencias
    //   // const suggestions = await getSuggestionsByEtapa(etapaActual, categoria, companyProfile); // Original call
    //   // setAiSuggestions(prev => ({
    //   //   ...prev,
    //   //   [categoria]: suggestions
    //   // }));
    //   setError('');
    //   setGameStats(prev => ({
    //     ...prev,
    //     suggestionsUsed: prev.suggestionsUsed + 1
    //   }));
    //   addPoints(5, 'Solicitar ayuda de IA');
    //   checkAchievements();
    // } catch (err) {
    //   console.error('Error al obtener sugerencias:', err);
    //   setError('Error al obtener sugerencias de IA');
    // } finally {
    //   setLoadingSuggestions(prev => ({ ...prev, [categoria]: false }));
    // }
    // Simulate finishing loading
    setTimeout(() => {
      setLoadingSuggestions(prev => ({ ...prev, [categoria]: false }));
      setError('La función de obtener sugerencias para esta sección está temporalmente deshabilitada.');
    }, 500);
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
      setGameStats(prev => ({
        ...prev,
        documentsDownloaded: prev.documentsDownloaded + 1
      }));
      addPoints(10, 'Descargar documento');
      checkAchievements();
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
      setGameStats(prev => ({
        ...prev,
        stagesCompleted: prev.stagesCompleted + 1
      }));
      addPoints(50, 'Completar etapa');
      checkAchievements();
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

  const handleRiskAnalysisComplete = (riskMap: any) => {
    if (riskMap.reportPdfBlob) {
      const url = URL.createObjectURL(riskMap.reportPdfBlob);
      setRiskMapPdfUrl(url);
    }
  };

  useEffect(() => {
    // Limpiar URL del PDF cuando el componente se desmonte
    return () => {
      if (riskMapPdfUrl) {
        URL.revokeObjectURL(riskMapPdfUrl);
      }
    };
  }, [riskMapPdfUrl]);

  const handleDownloadPdf = () => {
    if (riskMapPdfUrl) {
      const link = document.createElement('a');
      link.href = riskMapPdfUrl;
      link.download = 'analisis-riesgos.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
    <div className="min-h-screen bg-safeia-bg">
      
      {/* Información de la Empresa */}
      {companyProfile && (
        <div className="bg-safeia-white p-4 m-3 md:m-5 rounded-lg shadow-md">
          <div className="flex items-center gap-2.5">
            <FaBuilding className="text-safeia-yellow text-xl" />
            <h2 className="text-lg font-semibold text-safeia-black">
              {companyProfile.nombre}
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm text-safeia-gray">
            <div>
              <span className="font-medium">NIT:</span> {companyProfile.nit}
            </div>
            <div>
              <span className="font-medium">Sector:</span> {companyProfile.sectorEconomico}
            </div>
            <div>
              <span className="font-medium">Nivel de Riesgo:</span> {companyProfile.nivelRiesgo}
            </div>
          </div>
        </div>
      )}

      {/* Barra de Progreso del Jugador */}
      <div className="bg-safeia-white p-4 m-3 md:m-5 rounded-lg shadow-md flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="bg-safeia-yellow text-safeia-black px-4 py-2 rounded-full flex items-center gap-1">
            <FaStar /> Nivel {gameStats.level}
          </div>
          <div className="bg-safeia-bg text-safeia-black px-4 py-2 rounded-full flex items-center gap-1">
            <FaGem /> {gameStats.points} puntos
          </div>
        </div>
        <div className="flex gap-2.5">
          {gameStats.achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-safeia-bg text-safeia-black px-4 py-2 rounded-full flex items-center gap-1"
            >
              <FaMedal className="text-safeia-yellow" />
              {achievement}
            </div>
          ))}
        </div>
      </div>

      {/* Notificación de Logros */}
      {showAchievement && (
        <div className="fixed top-5 right-5 bg-safeia-yellow text-safeia-black px-6 py-4 rounded-lg shadow-lg animate-slideIn z-50 flex items-center gap-2.5">
          {/* Consider replacing slideIn animation with Tailwind's animation utilities if defined */}
          <FaTrophy />
          {showAchievement}
        </div>
      )}

      <div className="flex p-6 gap-6"> {/* Added gap for spacing */}
        {/* Barra lateral */}
        <div className="w-[400px] bg-safeia-white shadow-lg rounded-lg overflow-hidden flex flex-col"> {/* Added flex flex-col */}
          <div className="p-5 bg-safeia-yellow text-safeia-black">
            <h2 className="text-lg font-bold"> {/* Removed font family */}
              Sistema de Gestión SST
            </h2>
            <div className="mt-2.5 text-sm"> {/* Removed font family */}
              Progreso: {Math.round(progreso.progreso)}%
            </div>
          </div>
          <div className="divide-y">
            {Object.values(progreso.etapas).map(renderEtapa)}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1"> {/* Removed margin */}
          <div className="bg-safeia-white rounded-lg shadow-lg p-5"> {/* Increased shadow */}
            <h1 className="text-2xl font-bold mb-5 text-safeia-black"> {/* Removed font family */}
              {progreso.etapas[etapaActual].nombre}
            </h1>

            {error && (
              <div className="bg-safeia-error-light border border-safeia-error-border text-safeia-error-dark p-2.5 rounded mb-5"> {/* Adjusted padding */}
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Documentos Requeridos */}
              <div className="bg-safeia-bg p-5 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-safeia-black">
                    Documentos Requeridos
                  </h3>
                  <button
                    onClick={() => handleGetSuggestions('documentos')}
                    className={`px-5 py-2.5 rounded text-safeia-black border-none cursor-pointer transition-colors duration-300 flex items-center ${
                      loadingSuggestions['documentos']
                        ? 'bg-safeia-yellow-dark'
                        : 'bg-safeia-yellow hover:bg-safeia-yellow-dark'
                    }`}
                    disabled={loadingSuggestions['documentos']}
                  >
                    {loadingSuggestions['documentos'] ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaLightbulb className="mr-2" />
                    )}
                    Obtener Ayuda
                  </button>
                </div>
                
                {aiSuggestions['documentos'] && (
                  <div className="bg-safeia-white p-5 rounded-lg border border-safeia-yellow mb-5">
                    <h4 className="text-base font-bold mb-2.5 text-safeia-black">
                      Recomendaciones:
                    </h4>
                    <ul className="list-none p-0">
                      {aiSuggestions['documentos'].map((suggestion) => (
                        <li 
                          key={suggestion.id} 
                          className="bg-safeia-bg border border-safeia-yellow-dark p-2.5 rounded mb-2.5 flex items-center"
                        >
                          <FaLightbulb className="text-safeia-yellow mr-2 inline-block" />
                          <span className="text-safeia-black">{suggestion.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  {documentos.map((documento) => (
                    <div
                      key={documento.id}
                      className="bg-safeia-white border border-safeia-yellow-dark p-5 rounded-lg mb-5"
                    >
                      <div>
                        <div className="text-base font-bold text-safeia-black">
                          {documento.nombre}
                        </div>
                        <div className="text-safeia-gray text-sm">
                          {documento.descripcion}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDescargarDocumento(documento)}
                        disabled={loading}
                        className={`px-5 py-2.5 rounded text-safeia-black border-none transition-all duration-300 flex items-center mt-3 ${
                          loading
                            ? 'bg-safeia-gray cursor-not-allowed opacity-70'
                            : 'bg-safeia-yellow hover:bg-safeia-yellow-dark cursor-pointer opacity-100'
                        }`}
                      >
                        <FaDownload className="mr-2 inline-block" />
                        {loading ? 'Descargando...' : 'Descargar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Implementación */}
              <div className="bg-safeia-bg p-5 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-safeia-black">
                    Implementación
                  </h3>
                  <button
                    onClick={() => handleGetSuggestions('implementacion')}
                    className={`px-5 py-2.5 rounded text-safeia-black border-none cursor-pointer transition-colors duration-300 flex items-center ${
                      loadingSuggestions['implementacion']
                        ? 'bg-safeia-yellow-dark'
                        : 'bg-safeia-yellow hover:bg-safeia-yellow-dark'
                    }`}
                    disabled={loadingSuggestions['implementacion']}
                  >
                    {loadingSuggestions['implementacion'] ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaLightbulb className="mr-2" />
                    )}
                    Obtener Ayuda
                  </button>
                </div>

                {aiSuggestions['implementacion'] && (
                  <div className="bg-safeia-white p-5 rounded-lg border border-safeia-yellow mb-5">
                    <h4 className="text-base font-bold mb-2.5 text-safeia-black">
                      Recomendaciones:
                    </h4>
                    <ul className="list-none p-0">
                      {aiSuggestions['implementacion'].map((suggestion) => (
                        <li 
                          key={suggestion.id} 
                          className="bg-safeia-bg border border-safeia-yellow-dark p-2.5 rounded mb-2.5 flex items-center"
                        >
                          <FaLightbulb className="text-safeia-yellow mr-2 inline-block" />
                          <span className="text-safeia-black">{suggestion.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Mejora Continua */}
              <div className="bg-safeia-bg p-5 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-safeia-black">
                    Mejora Continua
                  </h3>
                  <button
                    onClick={() => handleGetSuggestions('mejora')}
                    className={`px-5 py-2.5 rounded text-safeia-black border-none cursor-pointer transition-colors duration-300 flex items-center ${
                      loadingSuggestions['mejora']
                        ? 'bg-safeia-yellow-dark'
                        : 'bg-safeia-yellow hover:bg-safeia-yellow-dark'
                    }`}
                    disabled={loadingSuggestions['mejora']}
                  >
                    {loadingSuggestions['mejora'] ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaLightbulb className="mr-2" />
                    )}
                    Obtener Ayuda
                  </button>
                </div>

                {aiSuggestions['mejora'] && (
                  <div className="bg-safeia-white p-5 rounded-lg border border-safeia-yellow mb-5">
                    <h4 className="text-base font-bold mb-2.5 text-safeia-black">
                      Recomendaciones:
                    </h4>
                    <ul className="list-none p-0">
                      {aiSuggestions['mejora'].map((suggestion) => (
                        <li 
                          key={suggestion.id} 
                          className="bg-safeia-bg border border-safeia-yellow-dark p-2.5 rounded mb-2.5 flex items-center"
                        >
                          <FaLightbulb className="text-safeia-yellow mr-2 inline-block" />
                          <span className="text-safeia-black">{suggestion.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {riskMapPdfUrl && (
                <div className="mt-4 flex items-center">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center px-4 py-2 bg-safeia-yellow text-safeia-black rounded hover:bg-safeia-yellow-dark transition-colors" /* Changed colors */
                  >
                    <FaFilePdf className="mr-2" />
                    Descargar Reporte PDF
                  </button>
                </div>
              )}

              <button
                onClick={handleCompletarEtapa}
                disabled={!verificarEtapaPrevia(progreso, etapaActual)}
                className={`w-full p-4 rounded border-none text-safeia-black transition-all duration-300 ${
                  verificarEtapaPrevia(progreso, etapaActual)
                    ? 'bg-safeia-yellow hover:bg-safeia-yellow-dark cursor-pointer opacity-100'
                    : 'bg-safeia-gray cursor-not-allowed opacity-70'
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
