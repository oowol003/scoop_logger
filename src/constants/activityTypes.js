// src/constants/activityTypes.js

// Existing Types
export const ACTIVITY_TYPES = {
  TASK: 'task',
  HABIT: 'habit',
  GOAL: 'goal'
};

export const ACTIVITY_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped'
};

export const ACTIVITY_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

// New Metric Types
export const METRIC_TYPES = {
  NUMBER: 'number',
  SCALE: 'scale',
  MOOD: 'mood',
  TIME: 'time',
  DISTANCE: 'distance',
  BOOLEAN: 'boolean'
};

// Color Palettes
export const COLOR_PALETTES = [
  // Earthy & Warm
  ['#17421A', '#B67B13', '#F0BE6D', '#AA2704'],
  // Soft & Calm
  ['#C3B0C4', '#EDD5D8', '#FCF4F0', '#C6CEBE'],
  // Vintage & Rich
  ['#144D4D', '#F6E5C6', '#D89488', '#5C2627'],
  // Modern & Bold
  ['#E718F', '#F3E8E0', '#B56508', '#0F445C'],
  // Forest & Natural
  ['#2C4F3E', '#8B6D43', '#D9B88F', '#733D2B'],
  // Ocean & Serene
  ['#1B4965', '#CAE9FF', '#5FA8D3', '#62B6CB'],
  // Pastel & Sweet
  ['#FFB5A7', '#FCD5CE', '#F8EDEB', '#F9DCC4'],
  // Bold & Energetic
  ['#FF595E', '#FFCA3A', '#8AC926', '#1982C4']
];

// Templates for different activity types
export const ACTIVITY_TEMPLATES = {
  // Task-based templates
  'work-task': {
    name: 'Work Task',
    type: ACTIVITY_TYPES.TASK,
    category: 'Work',
    metrics: [
      {
        name: 'progress',
        type: METRIC_TYPES.SCALE,
        range: [0, 100],
        defaultValue: 0,
        unit: '%'
      },
      {
        name: 'time_spent',
        type: METRIC_TYPES.TIME,
        unit: 'minutes',
        defaultValue: 0
      }
    ]
  },
  
  // Habit-based templates
  'exercise-habit': {
    name: 'Exercise',
    type: ACTIVITY_TYPES.HABIT,
    category: 'Health',
    frequency: ACTIVITY_FREQUENCIES.DAILY,
    metrics: [
      {
        name: 'duration',
        type: METRIC_TYPES.TIME,
        unit: 'minutes',
        defaultValue: 30
      },
      {
        name: 'intensity',
        type: METRIC_TYPES.SCALE,
        range: [1, 5],
        defaultValue: 3
      }
    ]
  },

  // Goal-based templates
  'weight-goal': {
    name: 'Weight Goal',
    type: ACTIVITY_TYPES.GOAL,
    category: 'Health',
    frequency: ACTIVITY_FREQUENCIES.WEEKLY,
    metrics: [
      {
        name: 'current_weight',
        type: METRIC_TYPES.NUMBER,
        unit: 'kg',
        defaultValue: 0
      },
      {
        name: 'target_weight',
        type: METRIC_TYPES.NUMBER,
        unit: 'kg',
        defaultValue: 0
      }
    ]
  },

  'quit-habit': {
    name: 'Break Bad Habit',
    type: ACTIVITY_TYPES.HABIT,
    category: 'Health',
    frequency: ACTIVITY_FREQUENCIES.DAILY,
    metrics: [
      {
        name: 'mood',
        type: METRIC_TYPES.MOOD,
        scale: ['😫', '😕', '😐', '🙂', '😊'],
        defaultValue: 2
      },
      {
        name: 'cravings',
        type: METRIC_TYPES.SCALE,
        range: [1, 10],
        defaultValue: 5
      },
      {
        name: 'stayed_clean',
        type: METRIC_TYPES.BOOLEAN,
        defaultValue: true
      }
    ]
  }
};

// Categories with icons (for UI organization)
export const CATEGORIES = [
  { id: 'health', label: 'Health', icon: 'Heart' },
  { id: 'fitness', label: 'Fitness', icon: 'Dumbbell' },
  { id: 'work', label: 'Work', icon: 'Briefcase' },
  { id: 'learning', label: 'Learning', icon: 'BookOpen' },
  { id: 'hobby', label: 'Hobby', icon: 'Palette' },
  { id: 'social', label: 'Social', icon: 'Users' },
  { id: 'other', label: 'Other', icon: 'MoreHorizontal' }
];