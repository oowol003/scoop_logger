import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, subDays, addWeeks, subWeeks, isToday } from 'date-fns';
import { useActivities } from '../../context/ActivityContext';
import { useViewOptions } from '../../context/ViewOptionsContext';
import {
  ActivityDetails,
  DeleteConfirmModal
} from '../activities/ActivityModals';
import LogActivityModal from '../activities/LogActivityModal';
import AddActivityModal from '../activities/AddActivityModal';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Main WeekView Component
const WeekView = ({ currentDate }) => {
  const { activities, updateActivity, deleteActivity } = useActivities();
  const { viewOptions } = useViewOptions();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState(null);
  const [loggingDate, setLoggingDate] = useState(null);

  // Get week start based on currentDate
  const weekStart = startOfWeek(currentDate, {
    weekStartsOn: viewOptions.firstDayOfWeek === 'monday' ? 1 : 0
  });

  // Get week days based on settings
  const getWeekDays = () => {
    const days = [...Array(7)].map((_, i) => addDays(weekStart, i));
    return viewOptions.showWeekends ? days : days.slice(0, 5);
  };

  const weekDays = getWeekDays();
  const dayLabels = viewOptions.firstDayOfWeek === 'monday'
    ? ['M', 'T', 'W', 'Th', 'F', 'S', 'Su']
    : ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];

  const getActivityStatus = (activityId, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return activities[activityId]?.entries?.[dateKey]?.completed || false;
  };

  const toggleCompletion = async (activityId, date) => {
    const activity = activities[activityId];
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentStatus = getActivityStatus(activityId, date);

    // If toggling from incomplete to complete, show the logging modal
    if (!currentStatus) {
      setLoggingActivity({ ...activity, id: activityId });
      setLoggingDate(date);
    } else {
      // If toggling from complete to incomplete, just update the status
      try {
        await updateActivity(activityId, {
          ...activity,
          entries: {
            ...activity.entries,
            [dateKey]: {
              completed: false,
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (error) {
        console.error('Error updating activity:', error);
      }
    }
  };

  const handleLogActivity = async (metricValues) => {
    if (!loggingActivity || !loggingDate) return;

    const dateKey = format(loggingDate, 'yyyy-MM-dd');
    try {
      // Create a clean entry object
      const entry = {
        completed: true,
        timestamp: new Date().toISOString()
      };

      // Only add metrics if there are valid values and they're not empty
      if (metricValues && Object.keys(metricValues).length > 0) {
        // Clean up metric values to remove any empty values
        const cleanMetrics = Object.entries(metricValues).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value;
          }
          return acc;
        }, {});

        // Only add metrics if we have clean values
        if (Object.keys(cleanMetrics).length > 0) {
          entry.metrics = cleanMetrics;
        }
      }

      // Create updated activity with new entry
      const updatedActivity = {
        ...loggingActivity,
        entries: {
          ...(loggingActivity.entries || {}),
          [dateKey]: entry
        }
      };

      // Close the modal immediately for better UX
      setLoggingActivity(null);
      setLoggingDate(null);

      // Update in Firebase
      await updateActivity(loggingActivity.id, updatedActivity);
    } catch (error) {
      console.error('Error updating activity:', error);
      // Show error toast or notification here
    }
  };

  const navigateWeek = (direction) => {
    // Removed the implementation of navigateWeek as it was not provided in the updated code
  };

  // Calculate completion percentage for the current week
  const getWeekCompletion = (activityId) => {
    const completedDays = weekDays.filter(day => getActivityStatus(activityId, day));
    return Math.round((completedDays.length / weekDays.length) * 100);
  };

  // Calculate current streak for an activity
  const getActivityStreak = (activityId) => {
    const activity = activities[activityId];
    if (!activity) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      if (!activity.entries?.[dateKey]?.completed) break;
      streak++;
      currentDate = subDays(currentDate, 1);
    }

    return streak;
  };

  if (!activities || Object.keys(activities).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 mb-4">No activities yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 mb-16 ${viewOptions.gridDensity === 'compact' ? 'space-y-2' : 'space-y-4'}`}>
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-500">
              {dayLabels[index]}
            </div>
            <div className={`
              text-sm
              ${isToday(day)
                ? 'text-orange-600 font-medium'
                : 'text-gray-700'}
            `}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="space-y-4">
        {Object.entries(activities).map(([activityId, activity]) => {
          const weekCompletion = getWeekCompletion(activityId);
          const streak = getActivityStreak(activityId);
          
          return (
            <div key={activityId} className="flex flex-col">
              {/* Enhanced Activity Header */}
              <div className="flex justify-between items-center mb-2 group">
                <div 
                  className="flex items-center space-x-4 cursor-pointer"
                  onClick={() => setSelectedActivity({...activity, id: activityId})}
                >
                  <span className="font-mono">{activity.name}</span>
                  
                  {/* Week Progress */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="h-1.5 w-16 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{ width: `${weekCompletion}%`, backgroundColor: activity.color }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 font-mono">
                        {weekCompletion}%
                      </span>
                    </div>
                  </div>

                  {/* Streak Indicator */}
                  {streak > 0 && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-orange-50 rounded-full">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-orange-600 font-medium">
                        {streak}
                      </span>
                    </div>
                  )}
                </div>

                {/* Optional: Add hover effect for more details */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-gray-500">
                  Click for details
                </div>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const isCompleted = getActivityStatus(activityId, day);
                  const activityColor = activity.color || '#E5E7EB'; // Default to gray if no color is set
                  
                  return (
                    <button
                      key={`${activityId}-${day}`}
                      onClick={() => toggleCompletion(activityId, day)}
                      className={`
                        aspect-square rounded-lg font-mono text-sm
                        flex items-center justify-center transition-all
                        hover:opacity-80
                      `}
                      style={{ backgroundColor: isCompleted ? activityColor : '#E5E7EB' }}
                    >
                      {isCompleted && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetails 
            activity={selectedActivity} 
            onClose={() => setSelectedActivity(null)}
            onDelete={() => {
              setDeleteConfirm(selectedActivity);
              setSelectedActivity(null);
            }}
          />
        )}
        {deleteConfirm && (
          <DeleteConfirmModal
            activity={deleteConfirm}
            onConfirm={async () => {
              try {
                await deleteActivity(deleteConfirm.id);
                setDeleteConfirm(null);
              } catch (error) {
                console.error('Error deleting activity:', error);
              }
            }}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
        {showAddModal && (
          <AddActivityModal onClose={() => setShowAddModal(false)} />
        )}
        {loggingActivity && (
          <LogActivityModal
            activity={loggingActivity}
            date={loggingDate}
            onClose={() => {
              setLoggingActivity(null);
              setLoggingDate(null);
            }}
            onSubmit={handleLogActivity}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeekView;