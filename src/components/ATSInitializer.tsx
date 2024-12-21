import React, { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface ATSInitializerProps {
  onInitialize: (descripcion: string, imageUrl?: string) => void;
}

export const ATSInitializer: React.FC<ATSInitializerProps> = ({ onInitialize }) => {
  const [descripcion, setDescripcion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImageFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return;

    setIsLoading(true);
    try {
      let imageUrl: string | undefined;
      
      if (imageFile) {
        // Generar un nombre único para el archivo
        const fileName = `${uuidv4()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `ats-images/${fileName}`;
        
        // Crear la referencia al storage
        const storageRef = ref(storage, filePath);
        
        // Subir el archivo
        await uploadBytes(storageRef, imageFile);
        
        // Obtener la URL de descarga
        imageUrl = await getDownloadURL(storageRef);
      }

      onInitialize(descripcion, imageUrl);
    } catch (error) {
      console.error('Error al inicializar:', error);
      alert('Error al procesar la imagen. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-safeia-black">Iniciar Análisis de Trabajo Seguro</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-safeia-black mb-2">
            Descripción Inicial
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-safeia-yellow focus:border-safeia-yellow"
            rows={4}
            placeholder="Describa el trabajo o actividad a realizar..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-safeia-black mb-2">
            Imagen del Área de Trabajo (Opcional)
          </label>
          <div
            {...getRootProps()}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-safeia-yellow transition-colors ${
              isDragActive ? 'border-safeia-yellow bg-safeia-yellow bg-opacity-10' : ''
            }`}
          >
            <div className="space-y-1 text-center">
              <input {...getInputProps()} />
              {imageFile ? (
                <div>
                  <p className="text-sm text-safeia-black">Imagen seleccionada: {imageFile.name}</p>
                  <p className="text-xs text-gray-500">Haz clic o arrastra otra imagen para cambiar</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-safeia-black">
                    <label className="relative cursor-pointer rounded-md font-medium text-safeia-yellow hover:text-safeia-yellow-dark">
                      <span>Sube una imagen</span>
                    </label>
                    <p className="pl-1">o arrastra y suelta aquí</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !descripcion.trim()}
          className="w-full py-2 px-4 bg-safeia-yellow text-safeia-black rounded-md hover:bg-safeia-yellow-dark disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <span>Comenzar Análisis</span>
          )}
        </button>
      </form>
    </div>
  );
};
