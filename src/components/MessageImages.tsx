import React from 'react';
import GeneratedImage from './GeneratedImage';

interface MessageFile {
  id: string;
  type: string;
  url: string;
  belongs_to: string;
}

interface MessageImagesProps {
  files: MessageFile[];
}

const MessageImages: React.FC<MessageImagesProps> = ({ files }) => {
  if (!files || files.length === 0) return null;

  const imageFiles = files.filter(file => file.type === 'image');
  if (imageFiles.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium text-gray-700">Imágenes generadas:</p>
      <div className="flex flex-wrap gap-2">
        {imageFiles.map((file, index) => (
          <GeneratedImage
            key={file.id}
            url={file.url}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageImages;
