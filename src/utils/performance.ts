// Performance utilities for large lists and optimization

import { useMemo } from 'react';

// Threshold for switching to VirtualizedList
export const VIRTUALIZATION_THRESHOLD = 10;

// Memoization helpers for timer calculations
export function useTimerCalculations(timers: Array<{ id: string; date: string }>) {
  return useMemo(() => {
    const now = new Date().getTime();
    
    return timers.map(timer => ({
      ...timer,
      daysLeft: Math.ceil((new Date(timer.date).getTime() - now) / (1000 * 60 * 60 * 24)),
      urgencyLevel: getUrgencyLevel(timer.date),
    }));
  }, [timers]);
}

export function getUrgencyLevel(dateString: string): 'urgent' | 'soon' | 'distant' | 'past' {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days <= 0) return 'past';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'distant';
}

// Debounce for search/filter inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Image optimization helpers
export function optimizeImageUri(uri: string, width: number = 300): string {
  // For future implementation with image CDN
  if (uri.includes('unsplash.com')) {
    return `${uri}&w=${width}&q=80&fm=webp`;
  }
  return uri;
}

// Memory management for chat messages
export function pruneChatMessages<T extends { id: string }>(
  messages: T[], 
  maxMessages: number = 20
): T[] {
  if (messages.length <= maxMessages) return messages;
  
  // Keep system message (first) + last (maxMessages - 1) messages
  const systemMessage = messages[0];
  const recentMessages = messages.slice(-maxMessages + 1);
  
  return systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
}
