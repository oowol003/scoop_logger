import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useActivities } from '../../context/ActivityContext';
import {
  METRIC_TYPES,
  ACTIVITY_TEMPLATES,
  CATEGORIES,
  COLOR_PALETTES
} from '../../constants/activityTypes';

const STEPS = [
  { id: 1, title: 'Template', icon: Sparkles },
  { id: 2, title: 'Details', icon: Plus },
  { id: 3, title: 'Metrics', icon: Check },
  { id: 4, title: 'Goals', icon: ArrowRight }
];

const AddActivityModal = ({ onClose }) => {
  const { addActivity } = useActivities();
  const [currentStep, setCurrentStep] = useState(1);
  const [colorOptions, setColorOptions] = useState([]);
  const [formData, setFormData] = useState({
    template: '',
    name: '',
    description: '',
    category: '',
    color: '',
    metrics: [],
    goal: {
      frequency: 'weekly',
      target: 1,
      timePerSession: 30
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Get random color palette
  const getRandomPalette = () => {
    const randomIndex = Math.floor(Math.random() * COLOR_PALETTES.length);
    return COLOR_PALETTES[randomIndex];
  };

  // Update color options when template changes
  useEffect(() => {
    const newColors = getRandomPalette();
    setColorOptions(newColors);
    setFormData(prev => ({
      ...prev,
      color: newColors[0]
    }));
  }, [formData.template]);

  const handleTemplateSelect = (templateId) => {
    const template = ACTIVITY_TEMPLATES[templateId];
    setFormData({
      ...formData,
      template: templateId,
      name: template.name,
      category: template.category,
      metrics: [...template.metrics],
      goal: {
        ...formData.goal,
        frequency: template.frequency || 'weekly'
      }
    });
    setCurrentStep(2);
  };

  const addCustomMetric = () => {
    setFormData(prev => ({
      ...prev,
      metrics: [
        ...prev.metrics,
        {
          name: '',
          type: METRIC_TYPES.NUMBER,
          unit: '',
          defaultValue: 0
        }
      ]
    }));
  };

  const updateMetric = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.map((metric, i) =>
        i === index ? { ...metric, [field]: value } : metric
      )
    }));
  };

  const removeMetric = (index) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newActivity = {
        template: formData.template,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        metrics: formData.metrics,
        goal: formData.goal,
        entries: {}
      };

      const firebaseId = await addActivity(newActivity);
      console.log('Activity created with Firebase ID:', firebaseId);
      onClose();
    } catch (error) {
      console.error('Error creating activity:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep >= step.id;
          return (
            <div
              key={step.id}
              className={`flex flex-col items-center space-y-1.5 ${
                isActive ? 'text-orange-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </div>
          );
        })}
      </div>
      <div className="flex space-x-1">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              currentStep >= step.id ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(ACTIVITY_TEMPLATES).map(([id, template]) => (
          <button
            key={id}
            onClick={() => handleTemplateSelect(id)}
            className="group relative flex items-center p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
          >
            <div className="flex-1">
              <h4 className="text-base font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                {template.name}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">{template.category}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {template.metrics.map((metric, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {metric.name}
                  </span>
                ))}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
        ))}
        <button
          onClick={() => {
            setFormData({
              ...formData,
              template: 'custom'
            });
            setCurrentStep(2);
          }}
          className="group relative flex items-center p-3 border border-dashed rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
        >
          <div className="flex-1">
            <h4 className="text-base font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
              Custom Activity
            </h4>
          </div>
          <Plus className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </button>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-400"
          placeholder="What would you like to track?"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-400"
          placeholder="Add some details about this activity..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
        >
          <option value="" className="text-gray-400">Choose a category</option>
          {CATEGORIES.map(category => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`h-10 rounded-lg border transition-all ${
                formData.color === color 
                  ? 'border-2 border-orange-500 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={addCustomMetric}
          className="inline-flex items-center px-3 py-1.5 text-sm border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Metric
        </button>
      </div>

      <div className="space-y-3">
        {formData.metrics.map((metric, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3 hover:border-orange-200 transition-all"
          >
            <div className="flex justify-between items-center gap-2">
              <input
                type="text"
                value={metric.name}
                onChange={(e) => updateMetric(index, 'name', e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
                placeholder="What do you want to measure?"
              />
              <button
                type="button"
                onClick={() => removeMetric(index)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <select
              value={metric.type}
              onChange={(e) => updateMetric(index, 'type', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
            >
              {Object.entries(METRIC_TYPES).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>

            {metric.type === METRIC_TYPES.NUMBER && (
              <input
                type="text"
                value={metric.unit}
                onChange={(e) => updateMetric(index, 'unit', e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-gray-400"
                placeholder="Unit (e.g., minutes, pages)"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How often?
        </label>
        <select
          value={formData.goal.frequency}
          onChange={(e) => setFormData({
            ...formData,
            goal: { ...formData.goal, frequency: e.target.value }
          })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target ({formData.goal.frequency})
        </label>
        <input
          type="number"
          min="1"
          value={formData.goal.target}
          onChange={(e) => setFormData({
            ...formData,
            goal: { ...formData.goal, target: parseInt(e.target.value) }
          })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          placeholder="How many times?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duration
        </label>
        <div className="relative">
          <input
            type="number"
            min="5"
            step="5"
            value={formData.goal.timePerSession}
            onChange={(e) => setFormData({
              ...formData,
              goal: { ...formData.goal, timePerSession: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-16"
            placeholder="Time per session"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            minutes
          </span>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderTemplateSelection();
      case 2:
        return renderBasicInfo();
      case 3:
        return renderMetrics();
      case 4:
        return renderGoals();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[85vh] overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {renderProgressBar()}
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(85vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderStepContent()}

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                className={`px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ${
                  currentStep === 1 ? 'invisible' : ''
                }`}
              >
                Previous
              </button>
              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Activity'}
                </button>
              )}
            </div>
          </form>
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddActivityModal;