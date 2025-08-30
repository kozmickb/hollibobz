import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { Text as RestyleText } from './ui/Text';
import { getDestinationInfo, DestinationInfo } from '../api/destination-data';

interface InfoItem {
  id: string;
  title: string;
  value: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
}

interface InfoDashboardSectionProps {
  destination?: string;
  currency?: string;
  languages?: string[];
  bestMonths?: string[];
  transportation?: string[];
  temperature?: string;
  timezone?: string;
}

export const InfoDashboardSection: React.FC<InfoDashboardSectionProps> = ({
  destination,
  currency = "Local Currency",
  languages = ["English", "Local Language"],
  bestMonths = ["Year-round"],
  transportation = ["Various"],
  temperature = "15-25°C",
  timezone = "Local Timezone"
}) => {
  console.log('InfoDashboardSection received destination:', destination);
  const { isDark } = useThemeStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));
  const [destinationInfo, setDestinationInfo] = useState<DestinationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  // Fetch destination info when destination changes
  useEffect(() => {
    const fetchDestinationInfo = async () => {
      if (!destination) {
        console.log('No destination provided to InfoDashboardSection');
        return;
      }
      
      console.log('Fetching destination info for:', destination);
      setIsLoading(true);
      try {
        const info = await getDestinationInfo(destination);
        console.log('Destination info loaded:', info);
        setDestinationInfo(info);
      } catch (error) {
        console.error('Error fetching destination info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDestinationInfo();
  }, [destination]);

  // Use destination info if available, otherwise use props
  const displayInfo = destinationInfo || {
    currency,
    languages,
    bestMonths,
    transportation,
    temperature,
    timezone,
  };

  const infoItems: InfoItem[] = [
    {
      id: 'currency',
      title: 'Currency',
      value: displayInfo.currency,
      icon: 'card',
      bgColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
              iconColor: isDark ? '#4ade80' : '#16a34a',
        textColor: isDark ? '#4ade80' : '#16a34a'
    },
    {
      id: 'language',
      title: 'Languages',
      value: displayInfo.languages.join(', '),
      icon: 'language',
      bgColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      iconColor: isDark ? '#60a5fa' : '#3b82f6',
      textColor: isDark ? '#60a5fa' : '#3b82f6'
    },
    {
      id: 'months',
      title: 'Best Months',
      value: displayInfo.bestMonths.join(' - '),
      icon: 'calendar',
      bgColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.1)',
      iconColor: isDark ? '#fbbf24' : '#d97706',
      textColor: isDark ? '#fbbf24' : '#d97706'
    },
    {
      id: 'transport',
      title: 'Transport',
      value: displayInfo.transportation.join(', '),
      icon: 'train',
      bgColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
      iconColor: isDark ? '#a5b4fc' : '#6366f1',
      textColor: isDark ? '#a5b4fc' : '#6366f1'
    },
    {
      id: 'temperature',
      title: 'Temperature',
      value: displayInfo.temperature,
      icon: 'thermometer',
      bgColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      iconColor: isDark ? '#f87171' : '#dc2626',
      textColor: isDark ? '#f87171' : '#dc2626'
    },
    {
      id: 'timezone',
      title: 'Timezone',
      value: displayInfo.timezone,
      icon: 'location',
      bgColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
      iconColor: isDark ? '#a78bfa' : '#7c3aed',
      textColor: isDark ? '#a78bfa' : '#7c3aed'
    }
  ];

  return (
    <Animated.View
      style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#e5e7eb',
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }}
      >
        <RestyleText variant="xl" color="text" fontWeight="bold" marginBottom={4}>
          Holly Bobz Travel Info
        </RestyleText>
      </Animated.View>
      
             <View style={{ flexDirection: 'column', gap: 8, marginTop: 16 }}>
         {isLoading ? (
           <View style={{
             padding: 20,
             alignItems: 'center',
             justifyContent: 'center',
           }}>
             <RestyleText variant="md" color="textMuted">
               Loading destination information...
             </RestyleText>
           </View>
         ) : (
           infoItems.map((item, index) => (
          <Animated.View
            key={item.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              backgroundColor: item.bgColor,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              opacity: fadeAnim,
              transform: [{ 
                translateY: slideAnim,
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })
              }]
            }}
          >
            <Animated.View
              style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                borderRadius: 16,
                padding: 8,
                marginRight: 12,
                transform: [{
                  rotate: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }}
            >
              <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
            </Animated.View>
            
            <View style={{ flex: 1 }}>
              <RestyleText variant="sm" color="text" fontWeight="semibold" marginBottom={2}>
                {item.title}
              </RestyleText>
              
              <RestyleText 
                variant="xs" 
                color="text" 
                fontWeight="medium"
                style={{ color: item.textColor }}
              >
                {item.value}
              </RestyleText>
                         </View>
           </Animated.View>
         ))
         )}
       </View>
      
      <Animated.View
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderRadius: 6,
              padding: 6,
            }}
          >
                         <Ionicons name="location" size={16} color={isDark ? '#60a5fa' : '#3b82f6'} />
          </View>
          <View style={{ flex: 1 }}>
            <RestyleText variant="sm" color="text" fontWeight="semibold" marginBottom={2}>
              Pro Tip
            </RestyleText>
            <RestyleText variant="xs" color="textMuted">
              Download offline maps and learn basic phrases before your trip for the best experience!
            </RestyleText>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};
