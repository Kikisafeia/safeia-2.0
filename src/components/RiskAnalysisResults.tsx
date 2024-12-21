import React from 'react';
import { RiskMap, RiskPoint, RiskZone } from '../types/riskMap';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface RiskAnalysisResultsProps {
  riskMap: RiskMap;
  onPointClick?: (point: RiskPoint) => void;
  onZoneClick?: (zone: RiskZone) => void;
}

export default function RiskAnalysisResults({
  riskMap,
  onPointClick,
  onZoneClick
}: RiskAnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'alto':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'accion_insegura':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'condicion_insegura':
        return <AlertCircle className="text-yellow-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'accion_insegura':
        return 'Acción Insegura';
      case 'condicion_insegura':
        return 'Condición Insegura';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Análisis de Riesgos
      </h2>

      {/* Puntos de Riesgo */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Riesgos Identificados ({riskMap.points.length})
        </h3>
        <div className="space-y-4">
          {riskMap.points.map((point) => (
            <div
              key={point.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onPointClick?.(point)}
            >
              <div className="flex items-start gap-3">
                {getTypeIcon(point.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900">
                      {point.name || getTypeLabel(point.type)}
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
                        point.severity
                      )}`}
                    >
                      {point.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {point.description}
                  </p>
                  {point.recommendations && point.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-900">
                        Recomendaciones:
                      </h5>
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                        {point.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Coordenadas: ({point.x}, {point.y})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zonas de Riesgo */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Zonas de Riesgo ({riskMap.zones.length})
        </h3>
        <div className="space-y-4">
          {riskMap.zones.map((zone) => (
            <div
              key={zone.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onZoneClick?.(zone)}
            >
              <div className="flex items-start gap-3">
                {getTypeIcon(zone.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900">
                      {zone.name || getTypeLabel(zone.type)}
                    </h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
                        zone.severity
                      )}`}
                    >
                      {zone.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{zone.description}</p>
                  {zone.recommendations && zone.recommendations.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-900">
                        Recomendaciones:
                      </h5>
                      <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                        {zone.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
