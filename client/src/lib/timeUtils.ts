import { formatDistanceToNow as formatDistanceFn } from 'date-fns';

/**
 * Format a date to a human-readable string like "2 minutes ago"
 */
export function formatDistanceToNow(date: Date): string {
  if (Date.now() - date.getTime() < 60000) {
    return 'Just now';
  }
  
  return formatDistanceFn(date, { addSuffix: true });
}

/**
 * Format a timestamp for chart labels based on the time range
 */
export function formatTimestamp(timestamp: string, timeRange: 'hour' | 'day' | 'all'): string {
  const date = new Date(timestamp);
  
  if (timeRange === 'hour') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (timeRange === 'day') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}
