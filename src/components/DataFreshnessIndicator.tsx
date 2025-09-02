import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from './ui/Text';
import { useThemeStore } from '../store/useThemeStore';

interface DataFreshnessIndicatorProps {
  lastUpdated?: Date | string;
  isLive?: boolean;
  dataType?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function DataFreshnessIndicator({
  lastUpdated,
  isLive = false,
  dataType = 'data',
  size = 'sm',
  showIcon = true
}: DataFreshnessIndicatorProps) {
  const { isDark } = useThemeStore();

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    if (isLive) return isDark ? '#10b981' : '#059669'; // Green for live
    if (!lastUpdated) return isDark ? '#6b7280' : '#9ca3af'; // Gray for unknown

    const now = new Date();
    const updateTime = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
    const diffMs = now.getTime() - updateTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins <= 5) return isDark ? '#10b981' : '#059669'; // Fresh (green)
    if (diffMins <= 30) return isDark ? '#fbbf24' : '#d97706'; // Stale (yellow)
    return isDark ? '#ef4444' : '#dc2626'; // Very stale (red)
  };

  const getStatusIcon = () => {
    if (isLive) return 'radio';
    if (!lastUpdated) return 'help-circle';

    const now = new Date();
    const updateTime = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
    const diffMs = now.getTime() - updateTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins <= 5) return 'checkmark-circle';
    if (diffMins <= 30) return 'time';
    return 'alert-circle';
  };

  const getStatusText = () => {
    if (isLive) return 'Live';
    if (!lastUpdated) return 'Unknown';

    const updateTime = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
    const timeAgo = formatTimeAgo(updateTime);
    return `Updated ${timeAgo}`;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
          icon: 12,
          text: 'xs' as const
        };
      case 'md':
        return {
          container: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 },
          icon: 14,
          text: 'sm' as const
        };
      case 'lg':
        return {
          container: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
          icon: 16,
          text: 'md' as const
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <View style={styles.container}>
      {showIcon && (
        <Ionicons
          name={getStatusIcon() as any}
          size={styles.icon}
          color={getStatusColor()}
        />
      )}
      <RestyleText variant={styles.text} color="textMuted" style={{ color: getStatusColor() }}>
        {getStatusText()}
      </RestyleText>
      {isLive && (
        <View style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: getStatusColor(),
          marginLeft: -2
        }} />
      )}
    </View>
  );
}
