import React from 'react';
import { useActivities } from '../../context/ActivityContext';

const ColorKey = () => {
  const { activities } = useActivities();

  if (!activities || Object.keys(activities).length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 p-2">
      <div className="flex flex-row flex-wrap gap-3">
        {Object.entries(activities).map(([id, activity]) => (
          <div key={id} className="flex items-center gap-2 text-xs text-gray-500">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: activity.color }}
            />
            <span>{activity.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorKey;
