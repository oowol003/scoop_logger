# Activity Logger

A modern, responsive activity tracking application built with React and Tailwind CSS.

## Features

- Track daily activities with customizable goals
- Multiple view options (Day, Week, Month, Year)
- Activity streaks and progress tracking
- Dark mode support
- Responsive design
- Data import/export
- Customizable settings
- Beautiful animations with Framer Motion

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Tech Stack

- React
- Tailwind CSS
- Framer Motion
- date-fns
- Lucide React Icons

## Project Structure

```
src/
  ├── components/
  │   ├── activities/
  │   │   ├── ActivityEditor.jsx
  │   │   └── ActivityStats.jsx
  │   ├── controls/
  │   │   └── DataControls.jsx
  │   ├── layout/
  │   │   └── Layout.jsx
  │   ├── settings/
  │   │   └── SettingsModal.jsx
  │   └── views/
  │       ├── DayView.jsx
  │       ├── WeekView.jsx
  │       ├── MonthView.jsx
  │       └── ViewContainer.jsx
  ├── context/
  │   ├── ActivityContext.jsx
  │   └── ViewOptionsContext.jsx
  ├── App.jsx
  ├── index.jsx
  └── index.css
```

## License

MIT
