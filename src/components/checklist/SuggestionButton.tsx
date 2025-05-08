import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface SuggestionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  title: string;
  buttonText: string;
  icon: React.ReactNode;
  className?: string;
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({
  onClick,
  isLoading,
  disabled = false,
  title,
  buttonText,
  icon,
  className = '',
}) => {
  const isDisabled = disabled || isLoading;

  // console.log(`Rendering SuggestionButton: ${buttonText || title}`); // For debugging re-renders

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 flex items-center text-sm ${className}`}
      title={title}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1" />
      ) : (
        <span className="mr-1">{icon}</span>
      )}
      {buttonText}
    </button>
  );
};

export default memo(SuggestionButton);
