import React, { useEffect, useRef, useState } from 'react';
import { generateRiskHeatmap } from '../services/riskMap';
import { AlertTriangle, MinusCircle, PlusCircle, RotateCcw, Eye, EyeOff, X } from 'lucide-react';

import type { RiskMap, RiskPoint, RiskZone } from '../types/riskMap';

interface RiskMapViewerProps {
  riskMap: RiskMap;
}

const RiskMapViewer: React.FC<RiskMapViewerProps> = ({ riskMap }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedRisk, setSelectedRisk] = useState<RiskPoint | RiskZone | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !riskMap) return;

    const updateVisualization = () => {
      const container = containerRef.current;
      if (!container) return;

      const parentWidth = container.parentElement?.clientWidth || 800;
      const parentHeight = container.parentElement?.clientHeight || 600;
      
      const aspectRatio = 16 / 9;
      let width = parentWidth;
      let height = width / aspectRatio;

      if (height > parentHeight) {
        height = parentHeight;
        width = height * aspectRatio;
      }

      container.style.width = `${width}px`;
      container.style.height = `${height}px`;

      riskMap.width = width;
      riskMap.height = height;

      const image = imageRef.current;
      const canvas = canvasRef.current;
      const overlay = overlayRef.current;

      if (!image || !canvas || !overlay || !riskMap.imageUrl) return;

      setImageLoaded(false);
      setImageError(null);

      const handleImageLoad = () => {
        const containerRatio = container.clientWidth / container.clientHeight;
        const imageRatio = image.naturalWidth / image.naturalHeight;

        let targetWidth, targetHeight;

        if (containerRatio > imageRatio) {
          targetHeight = container.clientHeight;
          targetWidth = targetHeight * imageRatio;
        } else {
          targetWidth = container.clientWidth;
          targetHeight = targetWidth / imageRatio;
        }

        image.style.width = `${targetWidth}px`;
        image.style.height = `${targetHeight}px`;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        overlay.width = targetWidth;
        overlay.height = targetHeight;

        setImageLoaded(true);
        updateCanvas();
      };

      const handleImageError = () => {
        console.error('Error al cargar la imagen:', riskMap.imageUrl);
        setImageError('Error al cargar la imagen');
        setImageLoaded(false);
      };

      image.src = riskMap.imageUrl;
      image.onload = handleImageLoad;
      image.onerror = handleImageError;

      return () => {
        image.onload = null;
        image.onerror = null;
      };
    };

    const handleResize = () => {
      updateVisualization();
    };

    window.addEventListener('resize', handleResize);
    updateVisualization();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [riskMap]);

  const updateCanvas = () => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const image = imageRef.current;

    if (!canvas || !overlay || !image || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');

    if (!ctx || !overlayCtx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    if (showHeatmap) {
      const heatmapCanvas = generateRiskHeatmap(riskMap);
      ctx.globalAlpha = 0.6;
      ctx.drawImage(heatmapCanvas, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    const scaleFactor = canvas.width / image.naturalWidth;
    drawRiskPoints(overlayCtx, riskMap.points, scaleFactor);
    drawRiskZones(overlayCtx, riskMap.zones, scaleFactor);
  };

  useEffect(() => {
    updateCanvas();
  }, [scale, position, showHeatmap, imageLoaded]);

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(4, scale + delta));
    setScale(newScale);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex h-full">
      {/* Panel izquierdo - Lista de riesgos */}
      <div className="w-1/4 bg-white border-r border-gray-200 overflow-auto">
        <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            Riesgos Identificados ({riskMap.points.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {riskMap.points.map((point) => (
            <div
              key={point.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedRisk?.id === point.id ? 'bg-safeia-yellow/10' : ''
              }`}
              onClick={() => setSelectedRisk(point)}
            >
              <div className="flex items-start space-x-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  point.severity === 'alto' ? 'bg-red-500' :
                  point.severity === 'medio' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {point.name}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      point.severity === 'alto' ? 'bg-red-100 text-red-800' :
                      point.severity === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {point.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {point.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel central - Visualización */}
      <div className="flex-1 flex flex-col">
        {/* Barra de herramientas */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MinusCircle className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <PlusCircle className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={resetView}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-2 rounded-lg transition-colors ${
                showHeatmap ? 'bg-safeia-yellow text-white' : 'hover:bg-gray-100'
              }`}
            >
              {showHeatmap ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Área de visualización */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          <div
            ref={containerRef}
            className="absolute inset-0"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
          >
            {imageError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-600">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>{imageError}</p>
                </div>
              </div>
            ) : (
              <>
                <img
                  ref={imageRef}
                  src={riskMap.imageUrl}
                  alt="Área de trabajo"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `translate(-50%, -50%) scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: 'center',
                    maxWidth: 'none',
                    display: imageLoaded ? 'block' : 'none'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ opacity: showHeatmap ? 0.6 : 0 }}
                />
                <canvas
                  ref={overlayRef}
                  className="absolute top-0 left-0 pointer-events-none"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Panel derecho - Detalles */}
      {selectedRisk && (
        <div className="w-1/4 bg-white border-l border-gray-200 overflow-auto">
          <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Detalles</h2>
              <button
                onClick={() => setSelectedRisk(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Descripción</h3>
              <p className="mt-1 text-sm text-gray-600">{selectedRisk.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Severidad</h3>
              <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                selectedRisk.severity === 'alto' ? 'bg-red-100 text-red-800' :
                selectedRisk.severity === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedRisk.severity}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Categoría</h3>
              <p className="mt-1 text-sm text-gray-600">{selectedRisk.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Recomendaciones</h3>
              <ul className="mt-1 space-y-2">
                {selectedRisk.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Ubicación</h3>
              <p className="mt-1 text-sm text-gray-600">
                {isRiskPoint(selectedRisk) ? (
                  `X: ${selectedRisk.coordinates.x}, Y: ${selectedRisk.coordinates.y}`
                ) : (
                  'Zona delimitada'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function isPointCoordinates(coords: unknown): coords is { x: number; y: number } {
  return typeof coords === 'object' && coords !== null && 
         'x' in coords && 'y' in coords &&
         typeof (coords as {x: unknown}).x === 'number' && 
         typeof (coords as {y: unknown}).y === 'number';
}

function drawRiskPoints(ctx: CanvasRenderingContext2D, points: RiskPoint[], scale: number) {
  points.forEach(point => {
    if (!point?.coordinates) return;

    let x = 0;
    let y = 0;
    
    if (isPointCoordinates(point.coordinates)) {
      x = point.coordinates.x * scale;
      y = point.coordinates.y * scale;
    }

    if (x === 0 && y === 0) return;

    const radius = 8;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = getRiskColor(point.severity, 0.6);
    ctx.fill();
    ctx.strokeStyle = getRiskColor(point.severity, 1);
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function drawRiskZones(ctx: CanvasRenderingContext2D, zones: RiskZone[], scale: number) {
  zones.forEach(zone => {
    if (!zone || !Array.isArray(zone.coordinates) || zone.coordinates.length < 3) return;

    const validCoordinates = zone.coordinates.every(coord => 
      Array.isArray(coord) && coord.length === 2 && 
      typeof coord[0] === 'number' && typeof coord[1] === 'number'
    );

    if (!validCoordinates) return;

    ctx.beginPath();
    const firstPoint = zone.coordinates[0];
    ctx.moveTo(firstPoint[0] * scale, firstPoint[1] * scale);

    zone.coordinates.slice(1).forEach(point => {
      ctx.lineTo(point[0] * scale, point[1] * scale);
    });

    ctx.closePath();
    ctx.fillStyle = getRiskColor(zone.severity, 0.2);
    ctx.fill();
    ctx.strokeStyle = getRiskColor(zone.severity, 0.8);
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function getRiskColor(severity: 'bajo' | 'medio' | 'alto' | 'critico', alpha: number = 1): string {
  const colors = {
    bajo: `rgba(76, 175, 80, ${alpha})`,     // Green
    medio: `rgba(255, 152, 0, ${alpha})`,    // Orange
    alto: `rgba(244, 67, 54, ${alpha})`,     // Red
    critico: `rgba(156, 39, 176, ${alpha})`  // Purple
  };
  return colors[severity] || colors.medio;
}

function isRiskPoint(risk: RiskPoint | RiskZone): risk is RiskPoint {
  return 'coordinates' in risk && 
         typeof risk.coordinates === 'object' && 
         'x' in risk.coordinates && 
         'y' in risk.coordinates;
}

export default RiskMapViewer;
