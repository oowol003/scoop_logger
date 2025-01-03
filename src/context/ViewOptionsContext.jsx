import React, { createContext, useContext, useState } from 'react';

const ViewOptionsContext = createContext();

const defaultViewOptions = {
  showWeekends: true,
  firstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
  showStreak: true,
  gridDensity: 'normal', // 'compact' | 'normal' | 'spacious'
  theme: 'light',
  darkMode: false,
};

export const ViewOptionsProvider = ({ children }) => {
  const [viewOptions, setViewOptions] = useState(defaultViewOptions);

  const updateViewOptions = (newOptions) => {
    setViewOptions((prev) => ({
      ...prev,
      ...newOptions,
    }));
  };

  return (
    <ViewOptionsContext.Provider value={{ viewOptions, updateViewOptions }}>
      {children}
    </ViewOptionsContext.Provider>
  );
};

export const useViewOptions = () => {
  const context = useContext(ViewOptionsContext);
  if (!context) {
    throw new Error('useViewOptions must be used within a ViewOptionsProvider');
  }
  return context;
};