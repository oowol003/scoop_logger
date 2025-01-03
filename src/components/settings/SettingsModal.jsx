import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Upload, Moon, Sun } from 'lucide-react';
import { useViewOptions } from '../../context/ViewOptionsContext';
import { useActivities } from '../../context/ActivityContext';

const SettingsModal = ({ onClose }) => {
  const { viewOptions, updateViewOptions } = useViewOptions();
  const { activities } = useActivities();
  const fileInputRef = useRef();

  const handleSelectChange = (key, value) => {
    updateViewOptions({ [key]: value });
  };

  const handleExportData = () => {
    const data = {
      activities,
      viewOptions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scoop-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.viewOptions) {
            updateViewOptions(data.viewOptions);
          }
          if (data.activities) {
            // You'll need to implement this in your ActivityContext
            // updateActivities(data.activities);
          }
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto shadow-xl
          ${viewOptions.darkMode ? 'bg-[#F1EFE8] text-gray-800' : 'bg-white text-gray-900'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {viewOptions.darkMode ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700" />
              )}
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={viewOptions.darkMode}
                onChange={(e) => handleSelectChange('darkMode', e.target.checked)}
              />
              <div className={`
                w-11 h-6 bg-gray-200 rounded-full peer 
                peer-checked:after:translate-x-full peer-checked:bg-orange-600
                after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all
              `}></div>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium mb-4">View Options</h3>
            
            {/* Show Weekends */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Weekends</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={viewOptions.showWeekends}
                    onChange={(e) => handleSelectChange('showWeekends', e.target.checked)}
                  />
                  <div className={`
                    w-11 h-6 bg-gray-200 rounded-full peer 
                    peer-checked:after:translate-x-full peer-checked:bg-orange-600
                    after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                    after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all
                  `}></div>
                </label>
              </div>

              {/* First Day of Week */}
              <div className="space-y-2">
                <label className="block text-sm">
                  First Day of Week
                </label>
                <select
                  value={viewOptions.firstDayOfWeek}
                  onChange={(e) => handleSelectChange('firstDayOfWeek', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              {/* Show Streak */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Streak</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={viewOptions.showStreak}
                    onChange={(e) => handleSelectChange('showStreak', e.target.checked)}
                  />
                  <div className={`
                    w-11 h-6 bg-gray-200 rounded-full peer 
                    peer-checked:after:translate-x-full peer-checked:bg-orange-600
                    after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                    after:bg-white after:rounded-full after:h-5 after:w-5 
                    after:transition-all
                  `}></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium mb-4">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;