import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { useActivities } from '../../context/ActivityContext';
import { useViewOptions } from '../../context/ViewOptionsContext';
import {
  ActivityDetails,
  DeleteConfirmModal
} from '../activities/ActivityModals';
import LogActivityModal from '../activities/LogActivityModal';
import AddActivityModal from '../activities/AddActivityModal';
import ActivityDetailsModal from '../activities/ActivityDetailsModal';
import {
  Check,
  Flame,
  Plus,
  Target,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityCard = ({ activity, completed, onToggle, onDetails }) => {
  const streakInfo = {
    current: activity.streak || 0
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-gray-900">{activity.name}</span>
          {streakInfo.current > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1 px-2 py-1 bg-orange-50 rounded-full"
            >
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">
                {streakInfo.current}
              </span>
            </motion.div>
          )}
        </div>
        <button
          onClick={() => onDetails(activity)}
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          Details
        </button>
      </div>

      <div className="space-y-4">
        {activity.description && (
          <p className="text-sm text-gray-600">{activity.description}</p>
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
            style={{ backgroundColor: completed ? activity.color : 'transparent' }}
            className={`
              relative w-6 h-6 rounded-md transition-all duration-200
              ${completed ? '' : 'border-2 border-gray-300 hover:border-orange-500'}
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

const DayView = ({ currentDate }) => {
  const { activities, updateActivity, deleteActivity } = useActivities();
  const { viewOptions } = useViewOptions();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState(null);
  const [loggingDate, setLoggingDate] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
      setLoggingActivity(activity);
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
      await updateActivity(loggingActivity.id, {
        ...loggingActivity,
        entries: {
          ...loggingActivity.entries,
          [dateKey]: {
            completed: true,
            timestamp: new Date().toISOString(),
            metrics: metricValues
          }
        }
      });
    } catch (error) {
      console.error('Error updating activity:', error);
    }
    setLoggingActivity(null);
    setLoggingDate(null);
  };

  // Add empty state check
  if (!activities || Object.keys(activities).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500 mb-4">No activities yet</p>
        <button
          onClick={() => setShowAddActivity(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
        >
          Add Your First Activity
        </button>
        {showAddActivity && (
          <AddActivityModal onClose={() => setShowAddActivity(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Removed the header displaying the day and date */}
        </div>
        <button
          onClick={() => setIsDetailsModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center space-x-2"
        >
          <List className="w-4 h-4" />
          <span>Details</span>
        </button>
      </div>

      {/* Activities List */}
      <div className="space-y-6">
        {Object.entries(activities).map(([id, activity]) => (
          <ActivityCard
            key={id}
            activity={{ ...activity, id }}
            completed={getActivityStatus(id, currentDate)}
            onToggle={() => toggleCompletion(id, currentDate)}
            onDetails={setSelectedActivity}
          />
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedActivity && (
          <ActivityDetails
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onDelete={() => {
              setDeleteConfirm(selectedActivity);
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
        {showAddActivity && (
          <AddActivityModal onClose={() => setShowAddActivity(false)} />
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
        {isDetailsModalOpen && (
          <ActivityDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            date={currentDate}
            activities={Object.entries(activities || {}).map(([id, activity]) => {
              // Get the entries for the current date
              const dateKey = format(currentDate, 'yyyy-MM-dd');
              const dayEntry = activity.entries?.[dateKey];
              
              // If there's no entry for this day, skip it
              if (!dayEntry) return null;

              // Get the activity template metrics for type and other metadata
              const metricTemplates = activity.metrics || [];

              // Convert the logged values to full metric objects
              const metrics = Object.entries(dayEntry.metrics || {}).map(([name, value]) => {
                const template = metricTemplates.find(m => m.name === name) || {};
                return {
                  name,
                  type: template.type || 'number',
                  unit: template.unit,
                  value: value,
                  ...(template.type === 'mood' && { moodType: template.moodType || 'emotion' })
                };
              });

              // Return the entry with activity details
              return {
                id: id,
                name: activity.name,
                timestamp: dayEntry.timestamp,
                metrics
              };
            }).filter(Boolean)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DayView;