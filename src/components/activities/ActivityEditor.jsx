import React, { useState } from 'react';
import {
  Film,
  BookOpen,
  Dumbbell,
  Music,
  Code,
  Users,
  Briefcase,
  Pencil,
  Book
} from 'lucide-react';

const ICONS = {
  film: Film,
  book: BookOpen,
  dumbbell: Dumbbell,
  music: Music,
  code: Code,
  users: Users,
  briefcase: Briefcase,
  pencil: Pencil
};

export const ActivityEditor = ({
  activity = {
    name: '',
    color: '#4CAF50',
    icon: 'film',
    category: 'entertainment',
    goal: { frequency: 'weekly', target: 1 }
  },
  onSave,
  onDelete,
  onClose
}) => {
  const [name, setName] = useState(activity.name);
  const [color, setColor] = useState(activity.color);
  const [icon, setIcon] = useState(activity.icon);
  const [category, setCategory] = useState(activity.category);
  const [goalFrequency, setGoalFrequency] = useState(activity.goal?.frequency || 'weekly');
  const [goalTarget, setGoalTarget] = useState(activity.goal?.target || 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...activity,
      name,
      color,
      icon,
      category,
      goal: {
        frequency: goalFrequency,
        target: parseInt(goalTarget)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="text-lg font-medium mb-4">
          {activity.name ? 'Edit Activity' : 'New Activity'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter activity name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="entertainment">Entertainment</option>
              <option value="work">Work</option>
              <option value="social">Social</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={`p-2 rounded-lg border ${
                    icon === key
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 p-1 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Goal
            </label>
            <div className="flex space-x-2">
              <select
                value={goalFrequency}
                onChange={(e) => setGoalFrequency(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="number"
                min="1"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-6">
            <div>
              {activity.name && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
