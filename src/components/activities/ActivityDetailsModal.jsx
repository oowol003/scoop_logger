import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';

const MOOD_SETS = {
  emotion: [
    { emoji: '😭', value: 1, label: 'Terrible' },
    { emoji: '😢', value: 2, label: 'Sad' },
    { emoji: '😐', value: 3, label: 'Okay' },
    { emoji: '😊', value: 4, label: 'Good' },
    { emoji: '🥰', value: 5, label: 'Great' }
  ]
};

const ActivityDetailsModal = ({ isOpen, onClose, date, activities = [] }) => {
  console.log('ActivityDetailsModal received:', {
    activities,
    firstActivity: activities?.[0],
    firstMetrics: activities?.[0]?.metrics
  });

  const formatMetricValue = (metric) => {
    console.log('Formatting metric:', metric);
    if (!metric?.value && metric?.value !== 0) return '-';
    
    switch (metric.type) {
      case 'mood': {
        const moodValue = parseInt(metric.value);
        const moodSet = MOOD_SETS[metric.moodType || 'emotion'];
        const moodEmoji = moodSet?.find(m => m.value === moodValue)?.emoji || '';
        return `${moodEmoji} (${moodValue}/5)`;
      }
      case 'duration':
      case 'time': {
        const durationValue = parseInt(metric.value);
        const hours = Math.floor(durationValue / 60);
        const minutes = durationValue % 60;
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      }
      case 'number':
      case 'scale':
        return `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`;
      default:
        return String(metric.value);
    }
  };

  const formatMetricName = (name) => {
    if (!name) return 'Mood'; // Default name for empty metric names
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-white w-full rounded-t-xl sm:rounded-xl shadow-xl sm:max-w-md max-h-[85vh] sm:max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h2 className="text-base font-semibold truncate">
                  {format(date, 'MMM d, yyyy')}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-3 max-h-[calc(85vh-3rem)] sm:max-h-[calc(90vh-3rem)]">
              {!activities?.length ? (
                <div className="text-center py-6">
                  <Info className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No activities logged for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity, index) => {
                    console.log('Rendering activity:', activity);
                    const metrics = Array.isArray(activity.metrics) ? activity.metrics : [];
                    
                    return (
                      <div
                        key={activity.id || index}
                        className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        {/* Activity Header */}
                        <div className="flex items-center justify-between mb-2.5">
                          <h3 className="text-sm font-medium truncate mr-2">
                            {activity.name}
                          </h3>
                          <div className="flex items-center space-x-1.5 text-xs text-gray-500 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>
                              {activity.timestamp 
                                ? format(new Date(activity.timestamp), 'h:mm a')
                                : format(date, 'h:mm a')
                              }
                            </span>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        {metrics.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {metrics.map((metric, metricIndex) => {
                              console.log('Rendering metric:', metric);
                              if (!metric) return null;
                              return (
                                <div 
                                  key={metric.name || metricIndex}
                                  className="bg-white rounded-lg p-2 shadow-sm"
                                >
                                  <div className="text-xs text-gray-500 mb-0.5">
                                    {formatMetricName(metric.name)}
                                  </div>
                                  <div className="font-medium text-sm">
                                    {formatMetricValue(metric)}
                                  </div>
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No metrics recorded</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Pull Indicator */}
            <div className="sm:hidden absolute top-1.5 inset-x-0 flex justify-center">
              <div className="w-8 h-1 rounded-full bg-gray-300"></div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActivityDetailsModal;
