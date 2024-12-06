import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getCurrentSeason, getCountryFromLatitude, getUVStatistics } from '../../data/uvStatistics';

interface UVInfo {
  index: number;
  risk: string;
  color: string;
  protection: string[];
}

const IndiceUV: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [uvIndex, setUvIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEffect, setShowEffect] = useState(false);
  const [countryInfo, setCountryInfo] = useState<{
    country: string;
    season: string;
  } | null>(null);

  // Efecto de protección solar
  const triggerSunProtectionEffect = () => {
    setShowEffect(true);
    
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['circle'],
      colors: ['#FFD700', '#FFA500', '#FF6347']
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 30,
        scalar: 1.2,
        shapes: ['circle']
      });

      confetti({
        ...defaults,
        particleCount: 20,
        scalar: 2,
        shapes: ['circle']
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
    
    setTimeout(() => setShowEffect(false), 3000);
  };

  const uvLevels: UVInfo[] = [
    {
      index: 2,
      risk: "Bajo",
      color: "bg-green-500",
      protection: [
        "Puede permanecer en el exterior sin riesgo",
        "Use lentes de sol en días brillantes",
      ]
    },
    {
      index: 5,
      risk: "Moderado",
      color: "bg-yellow-500",
      protection: [
        "Permanezca a la sombra durante el mediodía",
        "Use protector solar FPS 30+",
        "Use sombrero y ropa protectora",
      ]
    },
    {
      index: 7,
      risk: "Alto",
      color: "bg-orange-500",
      protection: [
        "Reduzca la exposición entre 10:00 y 16:00",
        "Use protector solar FPS 30+ cada 2 horas",
        "Use ropa protectora y sombrero",
        "Busque sombra",
      ]
    },
    {
      index: 10,
      risk: "Muy Alto",
      color: "bg-red-500",
      protection: [
        "Minimice la exposición entre 10:00 y 16:00",
        "Use protector solar FPS 50+",
        "Use ropa protectora y sombrero obligatorio",
        "Permanezca en interiores si es posible",
      ]
    },
    {
      index: 11,
      risk: "Extremo",
      color: "bg-purple-500",
      protection: [
        "Evite la exposición entre 10:00 y 16:00",
        "Use protector solar FPS 50+ cada hora",
        "Use ropa protectora y sombrero obligatorio",
        "Permanezca en interiores",
      ]
    }
  ];

  const getUVInfo = (index: number): UVInfo => {
    return uvLevels.find(level => index <= level.index) || uvLevels[uvLevels.length - 1];
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    triggerSunProtectionEffect();

    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada por su navegador');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });
        
        const country = getCountryFromLatitude(lat);
        const season = getCurrentSeason();
        
        if (country) {
          setCountryInfo({ country, season });
        } else {
          setError('No se encontraron datos para su ubicación');
        }
        
        setLoading(false);
      },
      (error) => {
        setError('Error al obtener la ubicación: ' + error.message);
        setLoading(false);
      }
    );
  };

  const fetchUVIndex = async () => {
    if (!location || !countryInfo) return;

    try {
      const { country, season } = countryInfo;
      const stats = getUVStatistics(country, season);
      
      if (!stats) {
        throw new Error('No se encontraron estadísticas para esta ubicación y temporada');
      }

      const hour = new Date().getHours();
      let simulatedUV;

      if (hour >= stats.peakHours.start && hour <= stats.peakHours.end) {
        // Horas pico
        simulatedUV = Math.floor(Math.random() * (stats.maxUV - stats.minUV + 1)) + stats.minUV;
      } else if (hour >= (stats.peakHours.start - 2) && hour < stats.peakHours.start) {
        // Horas de la mañana (antes del pico)
        simulatedUV = Math.floor(stats.minUV * 0.7);
      } else if (hour > stats.peakHours.end && hour <= (stats.peakHours.end + 2)) {
        // Horas de la tarde (después del pico)
        simulatedUV = Math.floor(stats.minUV * 0.8);
      } else {
        // Resto del día
        simulatedUV = Math.floor(stats.minUV * 0.3);
      }

      setUvIndex(simulatedUV);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener el índice UV');
    }
  };

  useEffect(() => {
    if (location && countryInfo) {
      fetchUVIndex();
    }
  }, [location, countryInfo]);

  const currentUVInfo = uvIndex !== null ? getUVInfo(uvIndex) : null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Índice UV en Tiempo Real</h2>
            <p className="text-gray-600">
              Obtenga información sobre el índice UV actual y recomendaciones de protección
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={getCurrentLocation}
              disabled={loading}
              className={`
                px-6 py-3 text-white font-semibold rounded-lg shadow-md
                ${loading ? 'bg-gray-400' : 'bg-safeia-yellow hover:bg-safeia-yellow-dark'}
                transition-colors duration-200
                relative overflow-hidden
              `}
            >
              {loading ? 'Obteniendo ubicación...' : 'Obtener Índice UV'}
              {showEffect && (
                <div className="absolute inset-0 bg-yellow-400/20 animate-pulse" />
              )}
            </button>
          </div>

          {error && (
            <div className="text-center mb-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {currentUVInfo && countryInfo && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-lg text-gray-700">
                  {countryInfo.country} - {countryInfo.season}
                </p>
              </div>
              
              <div className="flex justify-center items-center space-x-4">
                <div className={`w-24 h-24 rounded-full ${currentUVInfo.color} flex items-center justify-center`}>
                  <span className="text-4xl font-bold text-white">{uvIndex}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Nivel de Riesgo: {currentUVInfo.risk}
                  </h3>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Medidas de Protección Recomendadas:
                </h4>
                <ul className="space-y-2">
                  {currentUVInfo.protection.map((measure, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 text-green-500">
                        ✓
                      </span>
                      <span className="ml-3 text-gray-700">{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndiceUV;
