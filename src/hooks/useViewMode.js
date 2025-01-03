// useViewMode.js
import { useState } from 'react';

export const useViewMode = (initialMode = 'day') => {
  const [viewMode, setViewMode] = useState(initialMode);

  const switchView = (mode) => {
    if (['day', 'week', 'month', 'year'].includes(mode)) {
      setViewMode(mode);
    }
  };

  return [viewMode, switchView];
};
