export interface ProximityTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export function proximityTheme(daysLeft: number): ProximityTheme {
  if (daysLeft <= 0) {
    // Trip day - celebration colors
    return {
      primary: '#FF4757', // Rose
      secondary: '#FF6B6B',
      accent: '#FFD93D',
      background: '#FFFFFF', // White
      text: '#D63031'
    };
  } else if (daysLeft <= 29) {
    // 1-29 days - amber theme
    return {
      primary: '#F59E0B', // Amber
      secondary: '#FBBF24',
      accent: '#FF6B6B',
      background: '#FFFBEB', // Amber-50
      text: '#D97706'
    };
  } else if (daysLeft <= 99) {
    // 30-99 days - sky theme
    return {
      primary: '#0EA5E9', // Sky
      secondary: '#38BDF8',
      accent: '#4ECDC4',
      background: '#F0F9FF', // Sky-50
      text: '#0284C7'
    };
  } else {
    // 100+ days - slate theme
    return {
      primary: '#10B981', // Emerald
      secondary: '#34D399',
      accent: '#0EA5E9',
      background: '#F8FAFC', // Slate-50
      text: '#059669'
    };
  }
}

export function getRingColor(daysLeft: number): string {
  if (daysLeft <= 0) return '#FF4757'; // Rose on trip day
  if (daysLeft <= 29) return '#F59E0B'; // Amber
  if (daysLeft <= 99) return '#0EA5E9'; // Sky
  return '#10B981'; // Emerald
}

export function getGradientColors(daysLeft: number): string[] {
  if (daysLeft <= 0) return ['#FF4757', '#FF6B6B']; // Red gradient
  if (daysLeft <= 1) return ['#FF6B6B', '#FF8A8A']; // Coral gradient
  if (daysLeft <= 3) return ['#FF8A8A', '#FFD93D']; // Coral to yellow
  if (daysLeft <= 7) return ['#FFD93D', '#FF6B6B']; // Yellow to coral
  if (daysLeft <= 14) return ['#4ECDC4', '#42A5F5']; // Teal to blue
  if (daysLeft <= 30) return ['#42A5F5', '#4ECDC4']; // Blue to teal
  if (daysLeft <= 100) return ['#45B69C', '#42A5F5']; // Green to blue
  return ['#8B5CF6', '#45B69C']; // Purple to green
}
