import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertCircle, Plus, Flame, Target } from 'lucide-react';
import { useActivities } from '../../context/ActivityContext';
import { format, subDays, startOfWeek, startOfMonth, startOfYear, isSameDay, isWithinInterval } from 'date-fns';

export const ActivityDetails = ({ activity, onClose, onDelete }) => {
  // Function to calculate streaks for different periods
  const calculateStreak = (period) => {
    if (!activity.entries || Object.keys(activity.entries).length === 0) {
      return 0;
    }

    // Convert entries to sorted array of dates
    const completedDates = Object.entries(activity.entries)
      .filter(([_, entry]) => entry.completed)
      .map(([dateStr]) => new Date(dateStr))
      .sort((a, b) => b - a); // Sort in descending order

    if (completedDates.length === 0) {
      return 0;
    }

    // Get period boundaries
    const today = new Date();
    let periodStart;
    switch (period) {
      case 'week':
        periodStart = startOfWeek(today);
        break;
      case 'month':
        periodStart = startOfMonth(today);
        break;
      case 'year':
        periodStart = startOfYear(today);
        break;
      default:
        periodStart = startOfWeek(today);
    }

    // Calculate streak within the period
    let streak = 0;
    let currentDate = today;

    while (currentDate >= periodStart) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (activity.entries[dateStr]?.completed) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break; // Break on first non-completed day
      }
    }

    return streak;
  };

  // Calculate longest streak
  const calculateLongestStreak = () => {
    if (!activity.entries || Object.keys(activity.entries).length === 0) {
      return 0;
    }

    const completedDates = Object.entries(activity.entries)
      .filter(([_, entry]) => entry.completed)
      .map(([dateStr]) => new Date(dateStr))
      .sort((a, b) => a - b); // Sort ascending

    if (completedDates.length === 0) {
      return 0;
    }

    let currentStreak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < completedDates.length; i++) {
      const prevDate = completedDates[i - 1];
      const currentDate = completedDates[i];
      const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Goal</span>
              </div>
              <span className="text-gray-600">
                {activity.goal?.target || 0} times {activity.goal?.frequency || 'weekly'}
              </span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">Streaks</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-t border-orange-100 pt-2 mt-2">
                <span className="text-sm text-gray-600">Longest Streak:</span>
                <span className="text-sm font-medium text-gray-900">
                  {calculateLongestStreak()} days
                </span>
              </div>
            </div>
          </div>

          {/* Debug section - can be removed in production */}
          <div className="text-xs text-gray-500">
            <div>Total Entries: {Object.keys(activity.entries || {}).length}</div>
            <div>Completed Entries: {
              Object.values(activity.entries || {})
                .filter(entry => entry.completed)
                .length
            }</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const DeleteConfirmModal = ({ activity, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-[400px] shadow-xl"
      >
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900">Delete Activity</h3>
          </div>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete "{activity.name}"? This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};