import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { useActivities } from '../../context/ActivityContext';
import { useViewOptions } from '../../context/ViewOptionsContext';
import { ActivityDetails, DeleteConfirmModal } from '../activities/ActivityModals';
import LogActivityModal from '../activities/LogActivityModal';
import AddActivityModal from '../activities/AddActivityModal';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DayCell = ({ day, currentDate, activities, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const getActivityStatus = (activityId, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return activities[activityId]?.entries?.[dateKey]?.completed || false;
  };

  const completedActivities = Object.entries(activities)
    .filter(([id, _]) => getActivityStatus(id, day));

  const isCurrentMonth = isSameMonth(day, currentDate);
  const today = isToday(day);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative bg-white p-2 min-h-[100px] border-b border-r border-gray-100
        ${!isCurrentMonth ? 'bg-gray-50' : ''}
        ${today ? 'bg-orange-50/30' : ''}
        transition-colors duration-200
        hover:bg-gray-50
      `}
    >
      <div className="flex justify-between items-start">
        <span className={`
          text-sm font-medium
          ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
          ${today ? 'text-orange-600' : ''}
        `}>
          {format(day, 'd')}
        </span>
      </div>
      
      <div className="mt-2 grid grid-cols-3 gap-0.5">
        {Object.entries(activities).slice(0, 6).map(([id, activity]) => {
          const isCompleted = getActivityStatus(id, day);
          return (
            <button
              key={id}
              onClick={() => onToggle(id, day)}
              className={`
                h-1.5 rounded-sm transition-all duration-200
                ${isCompleted ? '' : 'bg-gray-200'}
                ${isHovered ? 'opacity-100' : 'opacity-80'}
              `}
              style={{
                backgroundColor: isCompleted ? activity.color : undefined
              }}
              title={activity.name}
            />
          );
        })}
      </div>

      {completedActivities.length > 6 && (
        <div className="mt-1 text-xs text-gray-500">
          +{completedActivities.length - 6} more
        </div>
      )}
    </div>
  );
};

const MonthView = ({ currentDate }) => {
  const { activities, updateActivity, deleteActivity } = useActivities();
  const { viewOptions } = useViewOptions();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loggingActivity, setLoggingActivity] = useState(null);
  const [loggingDate, setLoggingDate] = useState(null);

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const firstDayOfMonth = startOfMonth(currentDate).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const toggleCompletion = async (activityId, date) => {
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

  return (
    <div className="space-y-4 mb-16">
      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center">
              <span className="text-xs font-medium text-gray-500">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {emptyDays.map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-gray-50 border-b border-r border-gray-100 min-h-[100px]"
            />
          ))}
          
          {monthDays.map((day) => (
            <DayCell
              key={day.toString()}
              day={day}
              currentDate={currentDate}
              activities={activities}
              onToggle={toggleCompletion}
            />
          ))}
        </div>
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

export default MonthView;