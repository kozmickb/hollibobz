import React, { useState } from 'react';
import { View, Modal, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../store/useThemeStore';
import { useHolidayStore } from '../store/useHolidayStore';
import { Text as RestyleText } from './ui/Text';
import { ThemeButton } from './ThemeButton';
import { useNavigation } from '@react-navigation/native';

interface EditTimerModalProps {
  visible: boolean;
  onClose: () => void;
  timerId: string;
  currentDestination: string;
  currentDate: string;
}

export const EditTimerModal: React.FC<EditTimerModalProps> = ({
  visible,
  onClose,
  timerId,
  currentDestination,
  currentDate,
}) => {
      // console.log('EditTimerModal props:', { visible, timerId, currentDestination, currentDate });
  const { isDark } = useThemeStore();
  const { removeTimer, archiveTimer, updateTimer } = useHolidayStore();
  const navigation = useNavigation();
  
  const [selectedDate, setSelectedDate] = useState(new Date(currentDate));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const timer = useHolidayStore((s) => s.timers.find(t => t.id === timerId));
  const [tripType, setTripType] = useState<'business' | 'leisure'>(timer?.tripType || 'leisure');

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleUpdateDate = async () => {
    setIsUpdating(true);
    try {
      await updateTimer(timerId, { date: selectedDate.toISOString(), ...(tripType ? { tripType } as any : {}) });
      onClose();
    } catch (error) {
      console.error('Error updating timer date:', error);
      Alert.alert('Error', 'Failed to update timer date. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = () => {
    if (isProcessing) return; // Prevent multiple presses
    console.log('Archive button pressed for timer:', timerId);
    setIsProcessing(true);
    
    // Execute archive directly without confirmation for now
    try {
      console.log('Executing archive for timer:', timerId);
      archiveTimer(timerId);
      console.log('Archive function called');
      onClose();
      // Navigate back to home screen after archiving
      navigation.goBack();
    } catch (error) {
      console.error('Error during archive:', error);
      Alert.alert('Error', 'Failed to archive timer. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleDelete = () => {
    if (isProcessing) return; // Prevent multiple presses
    console.log('Delete button pressed for timer:', timerId);
    setIsProcessing(true);
    
    // Execute delete directly without confirmation for now
    const executeDelete = async () => {
      try {
        console.log('Executing delete for timer:', timerId);
        await removeTimer(timerId);
        console.log('Delete function completed');
        onClose();
        // Navigate back to home screen after deleting
        navigation.goBack();
      } catch (error) {
        console.error('Error during delete:', error);
        Alert.alert('Error', 'Failed to delete timer. Please try again.');
        setIsProcessing(false);
      }
    };
    
    executeDelete();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#e5e7eb',
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <RestyleText variant="lg" color="text" fontWeight="bold">
              Edit Timer
            </RestyleText>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? '#9ca3af' : '#6b7280'} 
              />
            </Pressable>
          </View>

          {/* Destination Display */}
          <View style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons 
                name="location" 
                size={20} 
                color="#60a5fa" 
                style={{ marginRight: 8 }}
              />
              <RestyleText variant="md" color="text" fontWeight="semibold">
                {currentDestination}
              </RestyleText>
            </View>
          </View>

          {/* Date Selection */}
          <View style={{ marginBottom: 24 }}>
            <RestyleText variant="sm" color="text" fontWeight="semibold" marginBottom={8}>
              Trip Date
            </RestyleText>
            
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={isDark ? '#60a5fa' : '#3b82f6'} 
                  style={{ marginRight: 8 }}
                />
                <RestyleText variant="md" color="text">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </RestyleText>
              </View>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={isDark ? '#9ca3af' : '#6b7280'} 
              />
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Trip Purpose */}
          <View style={{ marginBottom: 24 }}>
            <RestyleText variant="sm" color="text" fontWeight="semibold" marginBottom={8}>
              Trip Purpose
            </RestyleText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => setTripType('leisure')}
                style={{
                  flex: 1,
                  backgroundColor: tripType === 'leisure' ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : 'transparent',
                  borderWidth: 1,
                  borderColor: tripType === 'leisure' ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <RestyleText variant="sm" color="text" fontWeight="semibold">Leisure</RestyleText>
              </Pressable>
              <Pressable
                onPress={() => setTripType('business')}
                style={{
                  flex: 1,
                  backgroundColor: tripType === 'business' ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)') : 'transparent',
                  borderWidth: 1,
                  borderColor: tripType === 'business' ? '#10b981' : (isDark ? '#374151' : '#e5e7eb'),
                  borderRadius: 8,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <RestyleText variant="sm" color="text" fontWeight="semibold">Business</RestyleText>
              </Pressable>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={handleUpdateDate}
              disabled={isUpdating}
              style={{
                backgroundColor: '#10b981',
                borderWidth: 1,
                borderColor: '#10b981',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isUpdating ? 0.7 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {isUpdating ? (
                  <Ionicons name="hourglass" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="checkmark" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                )}
                <RestyleText variant="sm" color="text" fontWeight="semibold" style={{ color: '#ffffff' }}>
                  {isUpdating ? 'Updating...' : 'Update Date'}
                </RestyleText>
              </View>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 8 }}>
                             <Pressable
                 onPress={handleArchive}
                 disabled={isProcessing}
                 style={{
                   flex: 1,
                   backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                   borderWidth: 1,
                   borderColor: '#f59e0b',
                   borderRadius: 8,
                   paddingVertical: 12,
                   paddingHorizontal: 16,
                   alignItems: 'center',
                   justifyContent: 'center',
                   opacity: isProcessing ? 0.5 : 1,
                 }}
               >
                 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                   {isProcessing ? (
                     <Ionicons name="hourglass" size={16} color="#f59e0b" style={{ marginRight: 8 }} />
                   ) : (
                     <Ionicons name="archive" size={16} color="#f59e0b" style={{ marginRight: 8 }} />
                   )}
                   <RestyleText variant="sm" color="text" fontWeight="semibold" style={{ color: '#f59e0b' }}>
                     {isProcessing ? 'Processing...' : 'Archive'}
                   </RestyleText>
                 </View>
               </Pressable>

                             <Pressable
                 onPress={handleDelete}
                 disabled={isProcessing}
                 style={{
                   flex: 1,
                   backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                   borderWidth: 1,
                   borderColor: '#ef4444',
                   borderRadius: 8,
                   paddingVertical: 12,
                   paddingHorizontal: 16,
                   alignItems: 'center',
                   justifyContent: 'center',
                   opacity: isProcessing ? 0.5 : 1,
                 }}
               >
                 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                   {isProcessing ? (
                     <Ionicons name="hourglass" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                   ) : (
                     <Ionicons name="trash" size={16} color="#ef4444" style={{ marginRight: 8 }} />
                   )}
                   <RestyleText variant="sm" color="text" fontWeight="semibold" style={{ color: '#ef4444' }}>
                     {isProcessing ? 'Processing...' : 'Delete'}
                   </RestyleText>
                 </View>
               </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
