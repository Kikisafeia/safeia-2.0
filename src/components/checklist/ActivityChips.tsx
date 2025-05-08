import React, { memo } from 'react';
import { X } from 'lucide-react';

interface ActivityChipsProps {
  activities: string[];
  onRemoveActivity: (index: number) => void;
}

const ActivityChips: React.FC<ActivityChipsProps> = ({ activities, onRemoveActivity }) => {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
        >
          <span className="text-sm">{activity}</span>
          <button
            type="button"
            onClick={() => onRemoveActivity(index)}
            className="text-gray-500 hover:text-red-500"
            aria-label={`Eliminar actividad ${activity}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default memo(ActivityChips);
