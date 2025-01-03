import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, subDays, addWeeks, subWeeks, isToday, endOfWeek, eachDayOfInterval } from 'date-fns';
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

  const handleActivityClick = (activity, date) => {
    toggleCompletion(activity.id, date);
  };

  if (!activities || Object.keys(activities).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 mb-4">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <button
          onClick={() => navigateWeek('prev')}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium">
          {format(startOfWeek(currentDate), 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
        </span>
        <button
          onClick={() => navigateWeek('next')}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors touch-manipulation"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 text-sm">
        {/* Day Headers */}
        {eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        }).map((date) => (
          <div
            key={date.toISOString()}
            className="p-2 text-center border-b font-medium bg-gray-50"
          >
            <span className="hidden sm:inline">{format(date, 'EEE')}</span>
            <span className="sm:hidden">{format(date, 'EEEEE')}</span>
          </div>
        ))}

        {/* Activity Grid */}
        {eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        }).map((date) => (
          <div
            key={date.toISOString()}
            className="min-h-[100px] p-2 border-b border-r last:border-r-0"
          >
            <div className="text-xs text-gray-500 mb-2">
              {format(date, 'd')}
            </div>
            <div className="space-y-1">
              {Object.values(activities).map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityClick(activity, date)}
                  className={`
                    aspect-square rounded-lg font-mono text-sm
                    flex items-center justify-center transition-all
                    hover:opacity-80
                  `}
                  style={{ backgroundColor: getActivityStatus(activity.id, date) ? activity.color || '#E5E7EB' : '#E5E7EB' }}
                >
                  {getActivityStatus(activity.id, date) && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Log Modal */}
      {loggingActivity && loggingDate && (
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
    </div>
  );
};

export default WeekView;