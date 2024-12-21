import React from 'react';
import { Download } from 'lucide-react';

interface GeneratedImageProps {
  url: string;
  index: number;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ url, index }) => {
  return (
    <div className="relative group">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={url}
          alt={`Imagen generada ${index + 1}`}
          className="h-48 w-48 object-cover rounded-lg border border-gray-200 hover:border-safeia-yellow transition-colors"
          onError={(e) => {
            console.error('Error loading image:', e);
            e.currentTarget.alt = 'Error al cargar la imagen';
          }}
        />
      </a>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-lg">
        <a
          href={url}
          download
          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          title="Descargar imagen"
          onClick={(e) => {
            e.stopPropagation();
            // Intentar descargar la imagen
            fetch(url)
              .then(response => response.blob())
              .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `imagen-generada-${index + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
              })
              .catch(error => {
                console.error('Error downloading image:', error);
              });
          }}
        >
          <Download className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
};

export default GeneratedImage;
