// dateUtils.js
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const formatDate = (date) => format(date, 'yyyy-MM-dd');

export const getWeekDays = (date) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return eachDayOfInterval({ start, end });
};

export const isToday = (date) => {
  return formatDate(date) === formatDate(new Date());
};
