import React, { useState } from 'react';
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isToday
} from 'date-fns';
import { useActivities } from '../../context/ActivityContext';
import { useViewOptions } from '../../context/ViewOptionsContext';
import { ActivityDetails, DeleteConfirmModal } from '../activities/ActivityModals';
import LogActivityModal from '../activities/LogActivityModal';
import AddActivityModal from '../activities/AddActivityModal';
import { Menu, Plus, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MonthGrid = ({ month, activities, onActivityToggle }) => {
  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month)
  });

  const firstDayOfMonth = startOfMonth(month).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const getActivityStatus = (activityId, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return activities[activityId]?.entries?.[dateKey]?.completed || false;
  };

  const ActivityIndicator = ({ activity, isCompleted }) => (
    <div className="relative group/indicator">
      <div
        className={`
          w-[4px] h-[4px] rounded-full transition-all duration-150
          ${isCompleted ? 'opacity-90' : 'opacity-30 bg-gray-200'}
          hover:opacity-100
        `}
        style={{ backgroundColor: isCompleted ? activity.color : undefined }}
      />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <div className="border-b border-gray-100 p-3">
        <div className="text-sm font-medium text-gray-600">
          {format(month, 'MMMM')}
        </div>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-7 gap-[1px]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div 
              key={`${format(month, 'MMM')}-${day}-${index}`} 
              className="text-[10px] text-gray-400 text-center p-0.5"
            >
              {day}
            </div>
          ))}
          
          {emptyDays.map((_, index) => (
            <div 
              key={`empty-${index}-${format(month, 'MMM')}`} 
              className="aspect-square" 
            />
          ))}
          
          {days.map((day) => (
            <div
              key={day.toString()}
              className={`
                aspect-square p-0.5 text-[10px] relative group
                ${isToday(day) ? 'bg-orange-50/50' : ''}
              `}
            >
              <div className="absolute inset-0 flex flex-col">
                <div className="text-center text-gray-600">
                  {format(day, 'd')}
                </div>
                <div className="flex flex-row gap-0.5 px-0.5 mt-1">
                  {Object.entries(activities).map(([id, activity]) => (
                    <ActivityIndicator
                      key={id}
                      activity={{ ...activity, id }}
                      isCompleted={getActivityStatus(id, day)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const YearView = ({ currentDate }) => {
  const { activities, updateActivity, deleteActivity } = useActivities();
  const { viewOptions } = useViewOptions();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState(null);
  const [loggingDate, setLoggingDate] = useState(null);

  const months = eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfYear(currentDate)
  });

  const toggleActivity = async (activityId, date) => {
    const activity = activities[activityId];
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentStatus = activity?.entries?.[dateKey]?.completed;

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

  // Empty state
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
    <div className="space-y-6 px-1">
      {/* Year Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month) => (
          <MonthGrid
            key={format(month, 'MMM-yyyy')}
            month={month}
            activities={activities}
            onActivityToggle={toggleActivity}
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
        {showAddActivity && (
          <AddActivityModal onClose={() => setShowAddActivity(false)} />
        )}
        {loggingActivity && (
          <LogActivityModal
            activity={loggingActivity}
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

export default YearView;