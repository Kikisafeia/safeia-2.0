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
import { getSuggestionsByEtapa, AISuggestion } from '../services/ai';

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
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, AISuggestion[]>>({});
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
    try {
      // Incluir información de la empresa en la solicitud de sugerencias
      const suggestions = await getSuggestionsByEtapa(etapaActual, categoria, companyProfile);
      setAiSuggestions(prev => ({
        ...prev,
        [categoria]: suggestions
      }));
      setError('');
      setGameStats(prev => ({
        ...prev,
        suggestionsUsed: prev.suggestionsUsed + 1
      }));
      addPoints(5, 'Solicitar ayuda de IA');
      checkAchievements();
    } catch (err) {
      console.error('Error al obtener sugerencias:', err);
      setError('Error al obtener sugerencias de IA');
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [categoria]: false }));
    }
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      
      {/* Información de la Empresa */}
      {companyProfile && (
        <div style={{ 
          backgroundColor: '#FFFFFF',
          padding: '15px',
          margin: '10px 20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
      <div style={{ 
        backgroundColor: '#FFFFFF',
        padding: '15px',
        margin: '10px 20px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            backgroundColor: '#FFB800',
            color: '#1A1A1A',
            padding: '8px 15px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaStar /> Nivel {gameStats.level}
          </div>
          <div style={{ 
            backgroundColor: '#F9FAFB',
            padding: '8px 15px',
            borderRadius: '20px',
            color: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaGem /> {gameStats.points} puntos
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {gameStats.achievements.map((achievement, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#F9FAFB',
                padding: '8px 15px',
                borderRadius: '20px',
                color: '#1A1A1A',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FaMedal style={{ color: '#FFB800' }} />
              {achievement}
            </div>
          ))}
        </div>
      </div>

      {/* Notificación de Logros */}
      {showAchievement && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#FFB800',
          color: '#1A1A1A',
          padding: '15px 25px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          animation: 'slideIn 0.5s ease-out',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FaTrophy />
          {showAchievement}
        </div>
      )}

      <div className="flex p-6">
        {/* Barra lateral */}
        <div style={{ width: '400px', backgroundColor: '#FFFFFF', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '20px', backgroundColor: '#FFB800', color: '#1A1A1A' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
              Sistema de Gestión SST
            </h2>
            <div style={{ marginTop: '10px', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
              Progreso: {Math.round(progreso.progreso)}%
            </div>
          </div>
          <div className="divide-y">
            {Object.values(progreso.etapas).map(renderEtapa)}
          </div>
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1, marginLeft: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '20px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Arial, sans-serif', color: '#1A1A1A' }}>
              {progreso.etapas[etapaActual].nombre}
            </h1>

            {error && (
              <div style={{ backgroundColor: '#FEE2E2', borderColor: '#F87171', color: '#991B1B', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Documentos Requeridos */}
              <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '10px' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#1A1A1A' }}>
                    Documentos Requeridos
                  </h3>
                  <button
                    onClick={() => handleGetSuggestions('documentos')}
                    style={{
                      backgroundColor: loadingSuggestions['documentos'] ? '#E6A600' : '#FFB800',
                      color: '#1A1A1A',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Arial, sans-serif',
                      transition: 'background-color 0.3s'
                    }}
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
                  <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #FFB800', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Arial, sans-serif', color: '#1A1A1A' }}>
                      Recomendaciones:
                    </h4>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {aiSuggestions['documentos'].map((suggestion) => (
                        <li 
                          key={suggestion.id} 
                          style={{ 
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E6A600',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            fontFamily: 'Arial, sans-serif'
                          }}
                        >
                          <FaLightbulb style={{ color: '#FFB800', marginRight: '8px', display: 'inline-block' }} />
                          <span style={{ color: '#1A1A1A' }}>{suggestion.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  {documentos.map((documento) => (
                    <div
                      key={documento.id}
                      style={{ 
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E6A600',
                        padding: '20px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        fontFamily: 'Arial, sans-serif'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A1A1A' }}>
                          {documento.nombre}
                        </div>
                        <div style={{ color: '#6B7280', fontSize: '14px' }}>
                          {documento.descripcion}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDescargarDocumento(documento)}
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? '#6B7280' : '#FFB800',
                          color: '#1A1A1A',
                          padding: '10px 20px',
                          borderRadius: '5px',
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontFamily: 'Arial, sans-serif',
                          transition: 'all 0.3s',
                          opacity: loading ? 0.7 : 1
                        }}
                      >
                        <FaDownload style={{ marginRight: '8px', display: 'inline-block' }} />
                        {loading ? 'Descargando...' : 'Descargar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Implementación */}
              <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '10px' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#1A1A1A' }}>
                    Implementación
                  </h3>
                  <button
                    onClick={() => handleGetSuggestions('implementacion')}
                    style={{
                      backgroundColor: loadingSuggestions['implementacion'] ? '#E6A600' : '#FFB800',
                      color: '#1A1A1A',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Arial, sans-serif',
                      transition: 'background-color 0.3s'
                    }}
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
                  <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #FFB800', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Arial, sans-serif', color: '#1A1A1A' }}>
                      Recomendaciones:
                    </h4>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {aiSuggestions['implementacion'].map((suggestion) => (
                        <li 
                          key={suggestion.id} 
                          style={{ 
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E6A600',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            fontFamily: 'Arial, sans-serif'
                          }}
                        >
                          <FaLightbulb style={{ color: '#FFB800', marginRight: '8px', display: 'inline-block' }} />
                          <span style={{ color: '#1A1A1A' }}>{suggestion.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Mejora Continua */}
              <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '10px' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', color: '#1A1A1A' }}>
                    Mejora Continua
                  </h3>
                  <button
                    onClick={() => handleGetSuggestions('mejora')}
                    style={{
                      backgroundColor: loadingSuggestions['mejora'] ? '#E6A600' : '#FFB800',
                      color: '#1A1A1A',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Arial, sans-serif',
                      transition: 'background-color 0.3s'
                    }}
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
                  <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid #FFB800', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', fontFamily: 'Arial, sans-serif', color: '#1A1A1A' }}>
                      Recomendaciones:
                    </h4>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {aiSuggestions['mejora'].map((suggestion) => (
                        <li 
                          key={suggestion.id} 
                          style={{ 
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E6A600',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '10px',
                            fontFamily: 'Arial, sans-serif'
                          }}
                        >
                          <FaLightbulb style={{ color: '#FFB800', marginRight: '8px', display: 'inline-block' }} />
                          <span style={{ color: '#1A1A1A' }}>{suggestion.text}</span>
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
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <FaFilePdf className="mr-2" />
                    Descargar Reporte PDF
                  </button>
                </div>
              )}

              <button
                onClick={handleCompletarEtapa}
                disabled={!verificarEtapaPrevia(progreso, etapaActual)}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: verificarEtapaPrevia(progreso, etapaActual) ? '#FFB800' : '#6B7280',
                  color: '#1A1A1A',
                  cursor: verificarEtapaPrevia(progreso, etapaActual) ? 'pointer' : 'not-allowed',
                  fontFamily: 'Arial, sans-serif',
                  transition: 'all 0.3s',
                  opacity: verificarEtapaPrevia(progreso, etapaActual) ? 1 : 0.7
                }}
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
