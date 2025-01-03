import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewOptionsContext = createContext();

const defaultOptions = {
  showWeekends: true,
  firstDayOfWeek: 'monday',
  showStreak: true,
  gridDensity: 'normal',
  theme: 'light',
  darkMode: false
};

export function ViewOptionsProvider({ children }) {
  const [viewOptions, setViewOptions] = useState(() => {
    const saved = localStorage.getItem('viewOptions');
    return saved ? JSON.parse(saved) : defaultOptions;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (viewOptions.darkMode) {
      document.body.style.backgroundColor = '#F1EFE8';
    } else {
      document.body.style.backgroundColor = '';
    }
  }, [viewOptions.darkMode]);

  const updateViewOptions = (newOptions) => {
    setViewOptions(prev => {
      const updated = { ...prev, ...newOptions };
      localStorage.setItem('viewOptions', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    viewOptions,
    updateViewOptions
  };

  return (
    <ViewOptionsContext.Provider value={value}>
      {children}
    </ViewOptionsContext.Provider>
  );
}

export function useViewOptions() {
  const context = useContext(ViewOptionsContext);
  if (!context) {
    throw new Error('useViewOptions must be used within a ViewOptionsProvider');
  }
  return context;
}