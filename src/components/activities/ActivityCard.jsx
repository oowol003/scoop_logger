import React from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Target } from 'lucide-react';
import { useViewOptions } from '../../context/ViewOptionsContext';
import { colors } from '../../utils/colors';
import { Button } from '../ui/Button';

export const ActivityCard = ({ activity, completed, onToggle, onDetails }) => {
  const { viewOptions } = useViewOptions();
  const colorScheme = viewOptions.darkMode ? colors.darkMode : colors.lightMode;
  
  const streakInfo = {
    current: activity.streak || 0
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        rounded-lg p-4 shadow-sm hover:shadow-md transition-all
        border border-gray-200
        ${viewOptions.darkMode ? 'bg-[#FBFAF8]' : 'bg-white'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`
            font-medium
            ${viewOptions.darkMode ? 'text-gray-800' : 'text-gray-900'}
          `}>
            {activity.name}
          </span>
          {streakInfo.current > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-full
                ${viewOptions.darkMode ? 'bg-orange-50/50' : 'bg-orange-50'}
              `}
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">
                {streakInfo.current}
              </span>
            </motion.div>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => onDetails(activity)}
          className="text-sm"
        >
          Details
        </Button>
      </div>

      <div className="space-y-4">
        {activity.description && (
          <p className={`
            text-sm
            ${viewOptions.darkMode ? 'text-gray-600' : 'text-gray-600'}
          `}>
            {activity.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {activity.goal?.target || 0} times {activity.goal?.frequency || 'weekly'}
            </span>
          </div>
          
          <button
            onClick={onToggle}
            className={`
              relative w-6 h-6 rounded-md transition-all duration-200
              ${completed 
                ? `bg-[${colorScheme.button.primary}] hover:bg-[${colorScheme.button.primaryHover}]`
                : 'border-2 border-gray-300 hover:border-orange-500'}
            `}
          >
            {completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};