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