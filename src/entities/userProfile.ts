export type UserPreferences = {
  // Checklist preferences
  defaultChecklistView: 'expanded' | 'collapsed';
  showProgressIndicators: boolean;
  enableNotifications: boolean;
  
  // Export preferences
  defaultExportFormat: 'text' | 'csv';
  includeCompletedItems: boolean;
  
  // Future cloud sync preferences
  syncEnabled: boolean;
  backupEnabled: boolean;
  autoSync: boolean;
};

export type UserProfile = {
  // Basic profile info (for future cloud sync)
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  
  // Local preferences
  preferences: UserPreferences;
  
  // Statistics
  stats: {
    tripsCreated: number;
    checklistsCompleted: number;
    itemsChecked: number;
    lastActivity: string;
    joinedDate: string;
  };
  
  // Data organization
  data: {
    trips: string[]; // Array of trip IDs
    checklists: string[]; // Array of checklist IDs
    lastSync?: string; // For future cloud sync
    version: string; // Data structure version
  };
};

export type UserData = {
  profile: UserProfile;
  trips: Record<string, any>; // Will use existing Trip type
  checklists: Record<string, any>; // Checklist progress data
};

// Default user profile for new users
export const createDefaultUserProfile = (): UserProfile => ({
  preferences: {
    defaultChecklistView: 'expanded',
    showProgressIndicators: true,
    enableNotifications: true,
    defaultExportFormat: 'text',
    includeCompletedItems: true,
    syncEnabled: false, // Disabled for MVP
    backupEnabled: false, // Disabled for MVP
    autoSync: false, // Disabled for MVP
  },
  stats: {
    tripsCreated: 0,
    checklistsCompleted: 0,
    itemsChecked: 0,
    lastActivity: new Date().toISOString(),
    joinedDate: new Date().toISOString(),
  },
  data: {
    trips: [],
    checklists: [],
    version: '2.0.0',
  },
});
