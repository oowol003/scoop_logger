import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Check, AlertCircle, Clock } from 'lucide-react';

const MOOD_SETS = {
  emotion: [
    { emoji: '😭', value: 1, label: 'Terrible' },
    { emoji: '😢', value: 2, label: 'Sad' },
    { emoji: '😐', value: 3, label: 'Okay' },
    { emoji: '😊', value: 4, label: 'Good' },
    { emoji: '🥰', value: 5, label: 'Great' }
  ],
  energy: [
    { emoji: '🔋', value: 1, label: 'Drained' },
    { emoji: '😴', value: 2, label: 'Tired' },
    { emoji: '🌤', value: 3, label: 'Moderate' },
    { emoji: '⚡️', value: 4, label: 'Energetic' },
    { emoji: '🚀', value: 5, label: 'Supercharged' }
  ],
  stress: [
    { emoji: '😌', value: 1, label: 'Calm' },
    { emoji: '🙂', value: 2, label: 'Mild' },
    { emoji: '😰', value: 3, label: 'Moderate' },
    { emoji: '😫', value: 4, label: 'High' },
    { emoji: '🤯', value: 5, label: 'Extreme' }
  ],
  productivity: [
    { emoji: '🐌', value: 1, label: 'Unproductive' },
    { emoji: '🚶', value: 2, label: 'Slow' },
    { emoji: '🏃', value: 3, label: 'Steady' },
    { emoji: '🏃‍♂️', value: 4, label: 'Productive' },
    { emoji: '⚡️', value: 5, label: 'Super Productive' }
  ],
  focus: [
    { emoji: '🌫', value: 1, label: 'Scattered' },
    { emoji: '😵‍💫', value: 2, label: 'Distracted' },
    { emoji: '🤔', value: 3, label: 'Average' },
    { emoji: '🎯', value: 4, label: 'Focused' },
    { emoji: '🧠', value: 5, label: 'Deep Focus' }
  ]
};

const formatMetricName = (name) => {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const emojiButtonVariants = {
  unselected: {
    scale: 1,
    opacity: 0.7,
    y: 0
  },
  selected: {
    scale: 1.1,
    opacity: 1,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  },
  hover: {
    scale: 1.05,
    opacity: 0.9,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const MoodInput = ({ metric, value, onChange }) => {
  const [activeMoodType, setActiveMoodType] = useState(metric.moodType || 'emotion');
  const moodSet = MOOD_SETS[activeMoodType];

  return (
    <div className="flex flex-col space-y-6">
      {/* Mood Type Selector */}
      <div className="flex overflow-x-auto pb-2 -mx-2 px-2 space-x-2">
        {Object.entries(MOOD_SETS).map(([type, moods]) => (
          <button
            key={type}
            onClick={() => setActiveMoodType(type)}
            className={`
              px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium
              transition-all duration-200
              ${activeMoodType === type
                ? 'bg-orange-100 text-orange-700 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {moods[2].emoji} {/* Show middle emoji as icon */}
            <span className="ml-2 capitalize">{type}</span>
          </button>
        ))}
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-5 gap-3">
        <AnimatePresence mode="wait">
          {moodSet.map((moodOption) => (
            <motion.button
              key={`${activeMoodType}-${moodOption.value}`}
              variants={emojiButtonVariants}
              initial="unselected"
              animate={value === moodOption.value ? "selected" : "unselected"}
              whileHover="hover"
              onClick={() => onChange(moodOption.value)}
              className={`
                relative group p-4 rounded-xl transition-all duration-200
                ${value === moodOption.value
                  ? 'bg-orange-100 shadow-lg ring-2 ring-orange-200'
                  : 'hover:bg-gray-50 hover:shadow-md'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-3">
                <span className="text-4xl transform transition-transform duration-200 group-hover:scale-110">
                  {moodOption.emoji}
                </span>
                <span className={`
                  text-sm font-medium transition-colors duration-200
                  ${value === moodOption.value ? 'text-orange-700' : 'text-gray-600'}
                `}>
                  {moodOption.label}
                </span>
              </div>
              
              {/* Value indicator */}
              <div className={`
                absolute -top-1 -right-1 w-5 h-5 rounded-full
                flex items-center justify-center text-xs font-medium
                ${value === moodOption.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {moodOption.value}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Selected Mood Display */}
      {value && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span>Selected:</span>
          <span className="text-2xl">{moodSet.find(m => m.value === value)?.emoji}</span>
          <span className="font-medium text-gray-700">
            {moodSet.find(m => m.value === value)?.label}
          </span>
          <span className="text-gray-400">({value}/5)</span>
        </div>
      )}
    </div>
  );
};

const MetricInput = ({ metric, value, onChange, onEnter }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onEnter();
    }
  };

  switch (metric.type) {
    case 'mood':
      return <MoodInput metric={metric} value={value} onChange={onChange} />;

    case 'time':
      return (
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="time"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <Clock className="absolute left-3 w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            Enter time in 24-hour format
          </p>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={value || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  onChange(null);
                } else {
                  const num = parseFloat(val);
                  if (!isNaN(num)) {
                    if (metric.min !== undefined && num < metric.min) {
                      onChange(metric.min);
                    } else if (metric.max !== undefined && num > metric.max) {
                      onChange(metric.max);
                    } else {
                      onChange(num);
                    }
                  }
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              min={metric.min}
              max={metric.max}
              step="any"
              placeholder={`Enter ${formatMetricName(metric.name).toLowerCase()}`}
            />
            {metric.unit && (
              <span className="text-gray-500">{metric.unit}</span>
            )}
          </div>
          {(metric.min !== undefined || metric.max !== undefined) && (
            <p className="text-sm text-gray-500">
              {metric.min !== undefined && metric.max !== undefined
                ? `Range: ${metric.min} - ${metric.max}`
                : metric.min !== undefined
                ? `Minimum: ${metric.min}`
                : `Maximum: ${metric.max}`}
            </p>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex space-x-4">
          <button
            onClick={() => onChange(true)}
            className={`px-4 py-2 rounded-lg ${
              value === true
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onChange(false)}
            className={`px-4 py-2 rounded-lg ${
              value === false
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
      );

    case 'text':
      return (
        <div className="space-y-2">
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onEnter();
              }
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows={3}
            maxLength={metric.maxLength}
            placeholder={`Enter ${formatMetricName(metric.name).toLowerCase()}`}
          />
          {metric.maxLength && (
            <p className="text-sm text-gray-500">
              {value ? value.length : 0}/{metric.maxLength} characters
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

const LogActivityModal = ({ activity, date, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const metrics = (activity.metrics || []).filter(m => m.type !== 'scale');
  const hasMetrics = metrics.length > 0;

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (Object.keys(values).length > 0) {
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to cancel? Your entries will be lost.')) {
          onClose();
        }
      } else {
        onClose();
      }
    }
  }, [values, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const validateCurrentMetric = () => {
    if (!hasMetrics || currentStep >= metrics.length) return true;
    
    const metric = metrics[currentStep];
    const value = values[metric.name];
    
    if (metric.required && (value === undefined || value === null || value === '')) {
      setErrors(prev => ({
        ...prev,
        [metric.name]: 'This field is required'
      }));
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateCurrentMetric()) {
      if (currentStep < metrics.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Validate all required fields
    const newErrors = {};
    metrics.forEach(metric => {
      if (metric.required && !values[metric.name]) {
        newErrors[metric.name] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clean up the values object to remove any empty or undefined values
    const cleanValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    onSubmit(cleanValues);
  };

  const handleSkip = () => {
    const metric = metrics[currentStep];
    if (!metric.required) {
      if (currentStep < metrics.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const canQuickComplete = useCallback(() => {
    if (currentStep >= metrics.length - 1) return false;
    return metrics.slice(currentStep).every(m => !m.required);
  }, [metrics, currentStep]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white rounded-xl shadow-lg p-6 m-4"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Log Activity: {activity.name}
          </h2>
          <p className="text-sm text-gray-500">
            {format(date, 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Progress bar */}
        {hasMetrics && (
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / metrics.length) * 100}%`
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Step {currentStep + 1} of {metrics.length}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          {!hasMetrics ? (
            <div className="text-center py-4">
              <p className="text-gray-600">
                No metrics to log. Click complete to mark this activity as done.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  {formatMetricName(metrics[currentStep].name)}
                  {metrics[currentStep].required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {metrics[currentStep].description && (
                  <p className="text-sm text-gray-500">
                    {metrics[currentStep].description}
                  </p>
                )}
                <MetricInput
                  metric={metrics[currentStep]}
                  value={values[metrics[currentStep].name]}
                  onChange={value => {
                    setValues(prev => ({
                      ...prev,
                      [metrics[currentStep].name]: value
                    }));
                    setErrors(prev => ({
                      ...prev,
                      [metrics[currentStep].name]: undefined
                    }));
                  }}
                  onEnter={handleNext}
                />
                {errors[metrics[currentStep].name] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[metrics[currentStep].name]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            {!metrics[currentStep]?.required && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Skip
              </button>
            )}
            {canQuickComplete() && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-orange-600 hover:text-orange-700"
              >
                Complete All
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center space-x-1"
            >
              <span>{currentStep === metrics.length - 1 ? 'Complete' : 'Next'}</span>
              {currentStep < metrics.length - 1 && (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts help */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Keyboard shortcuts: Enter → Next, Tab → Navigate, Esc → Close
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LogActivityModal;
