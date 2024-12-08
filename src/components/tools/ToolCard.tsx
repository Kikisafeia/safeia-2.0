import React from 'react';
import { Link } from 'react-router-dom';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon, href, disabled = false }) => {
  const cardContent = (
    <div className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 text-blue-500">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return cardContent;
  }

  return (
    <Link to={href}>
      {cardContent}
    </Link>
  );
};

export default ToolCard;
