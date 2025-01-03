import React, { useState } from 'react';
import { format, isToday } from 'date-fns';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarCheck2,
  Menu,
  Plus,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from '../settings/SettingsModal';
import {
  ActivityDetails,
  DeleteConfirmModal
} from '../activities/ActivityModals';
import AddActivityModal from '../activities/AddActivityModal';
import { useViewOptions } from '../../context/ViewOptionsContext';

export const Layout = ({
  children,
  currentView,
  onViewChange,
  currentDate = new Date(),
  onNavigate,
  onAddActivity,
  onOpenSettings
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);

  const getDateDisplay = () => {
    switch (currentView) {
      case 'day':
        if (isToday(currentDate)) {
          return (
            <div className="text-center">
              <span className="text-lg font-medium">Today</span>
              <div className="text-xs text-gray-600">{format(currentDate, 'EEEE')}</div>
            </div>
          );
        }
        return (
          <div className="text-center">
            <span className="text-lg font-medium">{format(currentDate, 'MMM d')}</span>
            <div className="text-xs text-gray-600">{format(currentDate, 'EEEE')}</div>
          </div>
        );
      case 'week':
        return (
          <div className="text-center">
            <div className="text-xs text-gray-600">{format(currentDate, 'MMMM')}</div>
            <span className="text-lg font-medium">Week {format(currentDate, 'w')}</span>
          </div>
        );
      case 'month':
        return format(currentDate, 'MMM yyyy');
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return format(currentDate, 'MMM yyyy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vanilla Scoop</h1>
            
            <div className="flex items-center space-x-4">
              {/* Date Navigation */}
              <div className="flex items-center bg-gray-50 rounded-md border border-gray-200">
                <button
                  onClick={() => onNavigate('prev')}
                  className="px-3 py-1.5 text-gray-400 hover:text-gray-600 border-r border-gray-200 touch-manipulation"
                >
                  ←
                </button>
                <span className="px-3 text-sm text-gray-600 min-w-[100px] text-center">
                  {getDateDisplay()}
                </span>
                <button
                  onClick={() => onNavigate('next')}
                  className="px-3 py-1.5 text-gray-400 hover:text-gray-600 border-l border-gray-200 touch-manipulation"
                >
                  →
                </button>
              </div>

              {/* Collapsible Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(prev => !prev)}
                  className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
                    >
                      <button
                        onClick={() => {
                          onAddActivity();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Plus className="w-5 h-5 mr-2 text-orange-600" />
                        Add New
                      </button>
                      <button
                        onClick={() => {
                          onOpenSettings();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="w-5 h-5 mr-2 text-gray-600" />
                        Settings
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-safe">
        {/* View Options */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
            {Object.entries(useViewOptions()).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onViewChange(key)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  transition-all duration-200 flex-shrink-0
                  ${currentView === key
                    ? 'bg-orange-100 text-orange-700 shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {children}
        </div>
      </main>

      {/* Add Activity Button - Fixed to bottom */}
      <div className="fixed bottom-0 right-0 p-4 pb-safe">
        <button
          onClick={() => setShowAddActivity(true)}
          className="bg-orange-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      {showAddActivity && (
        <AddActivityModal onClose={() => setShowAddActivity(false)} />
      )}
    </div>
  );
};

export default Layout;
