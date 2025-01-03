import React from 'react';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import YearView from './YearView';
import { useActivities } from '../../context/ActivityContext';
import { useViewOptions } from '../../context/ViewOptionsContext';
import { colors } from '../../utils/colors';
import ColorKey from '../common/ColorKey';

const ViewContainer = ({ currentView, currentDate }) => {
  const { activities, loading, error } = useActivities();
  const { viewOptions } = useViewOptions();
  const colorScheme = viewOptions.darkMode ? colors.darkMode : colors.lightMode;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-gray-500 ${viewOptions.darkMode ? 'text-gray-600' : ''}`}>
          Loading activities...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error loading activities: {error}</div>
      </div>
    );
  }

  const views = {
    day: DayView,
    week: WeekView,
    month: MonthView,
    year: YearView
  };
  
  const ViewComponent = views[currentView];
  
  if (!ViewComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={`text-gray-500 ${viewOptions.darkMode ? 'text-gray-600' : ''}`}>
          Invalid view selected
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full pb-16"
      style={{ backgroundColor: colorScheme.background }}
    >
      {currentView !== 'day' && currentView !== 'week' && (
        <div className="flex justify-end px-4 py-2">
          <ColorKey />
        </div>
      )}
      <ViewComponent 
        currentDate={currentDate}
        activities={activities}
        viewOptions={viewOptions}
      />
    </div>
  );
};

export default ViewContainer;