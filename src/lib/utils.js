import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDateForStorage = (date) => date.toISOString();
export const formatDateForDisplay = (date) => new Date(date).toLocaleDateString('en-US', { 
  weekday: 'short', 
  month: 'short', 
  day: 'numeric' 
});
export const formatTimeForDisplay = (date) => new Date(date).toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit'
});

export const getMealType = (date) => {
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const time = hour + minutes/60;

  if (time < 10.5) return 'Breakfast';
  if (time >= 11.75 && time <= 14) return 'Lunch';
  if (time >= 18 && time <= 22) return 'Dinner';
  return 'Snack';
};