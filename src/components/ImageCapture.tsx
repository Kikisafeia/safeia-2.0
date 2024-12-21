import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, Info } from 'lucide-react';
import { ImageCapture as ImageCaptureType } from '../types/riskMap';

interface ImageCaptureProps {
  onCapture: (capture: ImageCaptureType) => void;
  disabled?: boolean;
}

export default function ImageCapture({ onCapture, disabled = false }: ImageCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
        setShowInstructions(false);
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      console.error('Error al acceder a la cámara:', err);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setPreviewUrl(imageData);
      
      onCapture({
        type: 'camera',
        data: imageData
      });
      
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen válida (JPG, PNG).');
      return;
    }

    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    onCapture({
      type: 'upload',
      data: file
    });
    setShowInstructions(false);
  };

  const resetCapture = () => {
    setPreviewUrl(null);
    setError(null);
    setShowInstructions(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 right-0 p-4"
            aria-label="Cerrar mensaje de error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showInstructions && (
        <div className="bg-safeia-yellow/10 border border-safeia-yellow rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-safeia-yellow mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-safeia-black">Instrucciones para capturar la imagen:</h3>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                <li>Asegúrate de tener buena iluminación</li>
                <li>Mantén la cámara estable</li>
                <li>Incluye toda el área de trabajo en la imagen</li>
                <li>Evita reflejos o sombras fuertes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {!isCameraActive && !previewUrl && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={startCamera}
                  disabled={disabled}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-safeia-black bg-safeia-yellow hover:bg-safeia-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="Capturar imagen con la cámara"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Usar Cámara
                </button>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    ref={fileInputRef}
                    disabled={disabled}
                    aria-label="Subir imagen desde el dispositivo"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-flex items-center justify-center px-4 py-2 border border-safeia-yellow text-sm font-medium rounded-md text-safeia-black bg-white hover:bg-safeia-yellow/10 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-safeia-yellow cursor-pointer ${
                      disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Subir Imagen
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCameraActive && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-white text-safeia-black rounded-md shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow"
                aria-label="Cancelar captura"
              >
                Cancelar
              </button>
              <button
                onClick={captureImage}
                className="px-4 py-2 bg-safeia-yellow text-safeia-black rounded-md shadow hover:bg-safeia-yellow-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow"
                aria-label="Tomar foto"
              >
                Capturar
              </button>
            </div>
          </div>
        )}

        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Vista previa de la imagen capturada"
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
            />
            <button
              onClick={resetCapture}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-safeia-yellow"
              aria-label="Cancelar y volver a capturar"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
