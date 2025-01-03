import React from 'react';
import { useActivities } from '../../context/ActivityContext';
import { useViewOptions } from '../../context/ViewOptionsContext';
import { Download, Upload, Settings } from 'lucide-react';

export const DataControls = () => {
  const { state, importData } = useActivities();
  const { viewOptions, updateViewOptions } = useViewOptions();

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logger-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          importData(importedData);
        } catch (error) {
          console.error('Error importing data:', error);
          // You might want to add error handling UI here
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 p-2 bg-white rounded-lg shadow-sm">
      <div className="flex space-x-2">
        <button
          onClick={handleExport}
          className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 rounded-md touch-manipulation"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
        <label className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer touch-manipulation">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <select
          value={viewOptions.cardSize}
          onChange={(e) => updateViewOptions({ cardSize: e.target.value })}
          className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 touch-manipulation"
        >
          <option value="compact">Compact</option>
          <option value="default">Default</option>
          <option value="large">Large</option>
        </select>
        <button
          onClick={() => {/* Add settings modal */}}
          className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-md touch-manipulation"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
