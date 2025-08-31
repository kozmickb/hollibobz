import { Platform } from 'react-native';
import { storage } from '../lib/storage';
import { ChecklistDoc } from '../entities/trip';

export async function calculateChecklistProgress(tripId: string, checklist: ChecklistDoc): Promise<number> {
  try {
    const storageKey = `checklist:${tripId}`;
    let checklistData: string | null = null;
    
    // Get data from appropriate storage
    if (Platform.OS === 'web') {
      checklistData = localStorage.getItem(storageKey);
    } else {
      checklistData = await storage.getItem(storageKey);
    }
    
    if (!checklistData) {
      return 0; // No progress yet
    }
    
    const parsed = JSON.parse(checklistData);
    const totalItems = checklist.sections.reduce((sum, section) => sum + section.items.length, 0);
    const checkedItems = Object.values(parsed.ticks || {}).filter(Boolean).length;
    
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  } catch (error) {
    console.warn('Failed to calculate checklist progress:', error);
    return 0;
  }
}

export async function getChecklistStats(tripId: string, checklist: ChecklistDoc): Promise<{
  completed: number;
  total: number;
  percentage: number;
}> {
  try {
    const storageKey = `checklist:${tripId}`;
    let checklistData: string | null = null;
    
    if (Platform.OS === 'web') {
      checklistData = localStorage.getItem(storageKey);
    } else {
      checklistData = await storage.getItem(storageKey);
    }
    
    const totalItems = checklist.sections.reduce((sum, section) => sum + section.items.length, 0);
    
    if (!checklistData) {
      return { completed: 0, total: totalItems, percentage: 0 };
    }
    
    const parsed = JSON.parse(checklistData);
    const completedItems = Object.values(parsed.ticks || {}).filter(Boolean).length;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return { completed: completedItems, total: totalItems, percentage };
  } catch (error) {
    console.warn('Failed to get checklist stats:', error);
    const totalItems = checklist.sections.reduce((sum, section) => sum + section.items.length, 0);
    return { completed: 0, total: totalItems, percentage: 0 };
  }
}
