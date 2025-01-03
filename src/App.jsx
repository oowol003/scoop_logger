// App.jsx
import React, { useState } from 'react';
import { addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { ActivityProvider } from './context/ActivityContext';
import { ViewOptionsProvider } from './context/ViewOptionsContext';
import ViewContainer from './components/views/ViewContainer';
import Layout from './components/layout/Layout';
import AddActivityModal from './components/activities/AddActivityModal'; // Updated import path
import SettingsModal from './components/settings/SettingsModal';

function App() {
  const [currentView, setCurrentView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleNavigate = (direction) => {
    setCurrentDate(current => {
      switch (currentView) {
        case 'day':
          return direction === 'next' ? addDays(current, 1) : subDays(current, 1);
        case 'week':
          return direction === 'next' ? addWeeks(current, 1) : subWeeks(current, 1);
        case 'month':
          return direction === 'next' ? addMonths(current, 1) : subMonths(current, 1);
        case 'year':
          return direction === 'next' ? addYears(current, 1) : subYears(current, 1);
        default:
          return current;
      }
    });
  };

  return (
    <ViewOptionsProvider>
      <ActivityProvider>
        <Layout
          currentView={currentView}
          onViewChange={setCurrentView}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onAddActivity={() => setShowAddActivity(true)}
          onOpenSettings={() => setShowSettings(true)}
        >
          <ViewContainer 
            currentView={currentView} 
            currentDate={currentDate}
          />
        </Layout>

        {/* Modals */}
        {showAddActivity && (
          <AddActivityModal onClose={() => setShowAddActivity(false)} />
        )}
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </ActivityProvider>
    </ViewOptionsProvider>
  );
}

export default App;