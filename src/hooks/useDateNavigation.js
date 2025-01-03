// useDateNavigation.js
import { useState } from 'react';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

export const useDateNavigation = (initialDate = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const navigate = {
    nextDay: () => setCurrentDate(date => addDays(date, 1)),
    prevDay: () => setCurrentDate(date => addDays(date, -1)),
    nextWeek: () => setCurrentDate(date => addWeeks(date, 1)),
    prevWeek: () => setCurrentDate(date => addWeeks(date, -1)),
    nextMonth: () => setCurrentDate(date => addMonths(date, 1)),
    prevMonth: () => setCurrentDate(date => addMonths(date, -1)),
    nextYear: () => setCurrentDate(date => addYears(date, 1)),
    prevYear: () => setCurrentDate(date => addYears(date, -1)),
  };

  return [currentDate, navigate];
};
