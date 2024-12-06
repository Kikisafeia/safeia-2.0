import React, { useEffect, useRef, useState } from 'react';
import { RiskMap, RiskPoint, RiskZone } from '../types/riskMap';
import { generateRiskHeatmap } from '../services/riskMap';
import { AlertTriangle, ZoomIn, ZoomOut, Move, Maximize2 } from 'lucide-react';

interface RiskMapViewerProps {
  riskMap: RiskMap;
  onPointClick?: (point: RiskPoint) => void;
  onZoneClick?: (zone: RiskZone) => void;
}

export default function RiskMapViewer({
  riskMap,
  onPointClick,
  onZoneClick
}: RiskMapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRisk, setSelectedRisk] = useState<RiskPoint | RiskZone | null>(null);

  useEffect(() => {
    if (imageRef.current && containerRef.current) {
      const image = imageRef.current;
      const container = containerRef.current;

      // Ajustar el tamaño inicial
      const containerRatio = container.clientWidth / container.clientHeight;
      const imageRatio = image.naturalWidth / image.naturalHeight;

      if (containerRatio > imageRatio) {
        // Container más ancho que la imagen
        image.style.height = '100%';
        image.style.width = 'auto';
      } else {
        // Container más alto que la imagen
        image.style.width = '100%';
        image.style.height = 'auto';
      }

      // Actualizar dimensiones del mapa
      riskMap.width = image.width;
      riskMap.height = image.height;

      // Generar y dibujar el mapa de calor
      const heatmap = generateRiskHeatmap(riskMap);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(heatmap, 0, 0);
        }
      }
    }
  }, [riskMap]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(scale + delta, 0.5), 4);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.2, 4));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const checkRiskClick = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // Verificar puntos de riesgo
    for (const point of riskMap.points) {
      const distance = Math.sqrt(
        Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
      );
      if (distance <= point.radius) {
        setSelectedRisk(point);
        onPointClick?.(point);
        return;
      }
    }

    // Verificar zonas de riesgo
    for (const zone of riskMap.zones) {
      if (isPointInPolygon(x, y, zone.points)) {
        setSelectedRisk(zone);
        onZoneClick?.(zone);
        return;
      }
    }

    setSelectedRisk(null);
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {/* Controles */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow p-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded"
          title="Acercar"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded"
          title="Alejar"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded"
          title="Restablecer vista"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Contenedor del mapa */}
      <div
        className="relative w-full h-full overflow-hidden cursor-move"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="absolute"
        >
          {/* Imagen base */}
          <img
            ref={imageRef}
            src={riskMap.imageUrl}
            alt="Plano del lugar de trabajo"
            className="absolute top-0 left-0"
            style={{ userSelect: 'none' }}
          />

          {/* Capa de mapa de calor */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none opacity-60"
          />

          {/* Capa interactiva */}
          <canvas
            ref={overlayRef}
            className="absolute top-0 left-0"
            onClick={checkRiskClick}
          />
        </div>
      </div>

      {/* Panel de información del riesgo seleccionado */}
      {selectedRisk && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-500 mr-3 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedRisk.type}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {selectedRisk.description}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedRisk.severity === 'Crítico' ? 'bg-red-100 text-red-800' :
                  selectedRisk.severity === 'Alto' ? 'bg-orange-100 text-orange-800' :
                  selectedRisk.severity === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedRisk.severity}
                </span>
              </div>
              {selectedRisk.controls && selectedRisk.controls.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Controles recomendados:
                  </h4>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {selectedRisk.controls.map((control, index) => (
                      <li key={index}>{control}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Función auxiliar para detectar si un punto está dentro de un polígono
function isPointInPolygon(x: number, y: number, points: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
