import React from 'react';
import { useActivities } from '../../context/ActivityContext';
import { Target, Zap, TrendingUp } from 'lucide-react';

export const ActivityStats = ({ activityId }) => {
  const { getActivityStats, state } = useActivities();
  const activity = state.activities[activityId];
  const stats = getActivityStats(activityId);

  if (!stats) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Goal Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Goal Progress</span>
          </div>
          <span className="text-sm text-gray-600">
            {stats.weeklyCompletions}/{activity.goal.target} times this week
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-orange-600"
            style={{ width: `${stats.goalProgress}%` }}
          />
        </div>
      </div>

      {/* Current Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">Current Streak</span>
        </div>
        <span className="text-sm text-gray-600">
          {stats.streak} days
        </span>
      </div>

      {/* Progress Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">Status</span>
        </div>
        <span className={`text-sm ${
          stats.isOnTrack ? 'text-green-600' : 'text-orange-600'
        }`}>
          {stats.isOnTrack ? 'On Track' : 'Behind Goal'}
        </span>
      </div>
    </div>
  );
};
