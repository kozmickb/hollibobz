import React, { useState } from 'react';
import { View, Text, Pressable, Platform, Modal, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addDays, subDays } from 'date-fns';

interface DateTimeSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minimumDate?: Date;
  label?: string;
  showTime?: boolean;
}

// Custom Desktop Date Picker Component
function DesktopDatePicker({ 
  visible, 
  onClose, 
  selectedDate, 
  onDateChange, 
  minimumDate = new Date(),
  isDark 
}: {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minimumDate?: Date;
  isDark: boolean;
}) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days to fill the calendar grid
  const startPadding = monthStart.getDay();
  const endPadding = 6 - monthEnd.getDay();
  
  const paddedDays = [
    ...Array.from({ length: startPadding }, (_, i) => subDays(monthStart, startPadding - i)),
    ...daysInMonth,
    ...Array.from({ length: endPadding }, (_, i) => addDays(monthEnd, i + 1))
  ];

  const handleDayPress = (day: Date) => {
    if (day >= minimumDate) {
      // Preserve the time from selectedDate
      const newDateTime = new Date(day);
      newDateTime.setHours(selectedDate.getHours());
      newDateTime.setMinutes(selectedDate.getMinutes());
      onDateChange(newDateTime);
      onClose();
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <Modal
      visible={visible}
      transparent={true}
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
          backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          minWidth: 320,
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Pressable onPress={prevMonth} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
            </Pressable>
            
            <Text style={{
              fontSize: 18,
              fontFamily: 'Questrial-Regular-SemiBold',
              color: isDark ? '#FFFFFF' : '#333333',
            }}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            
            <Pressable onPress={nextMonth} style={{ padding: 8 }}>
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#FFFFFF' : '#333333'} />
            </Pressable>
          </View>

          {/* Day Headers */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 10,
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Questrial-Regular-Medium',
                  color: isDark ? '#CCCCCC' : '#666666',
                }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
            {paddedDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDisabled = day < minimumDate;
              const isToday = isSameDay(day, new Date());

              return (
                <Pressable
                  key={index}
                  onPress={() => handleDayPress(day)}
                  disabled={isDisabled}
                  style={{
                    width: '14.28%',
                    aspectRatio: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 1,
                    borderRadius: 8,
                    backgroundColor: isSelected 
                      ? '#FF6B6B' 
                      : isToday 
                        ? (isDark ? '#374151' : '#F3F4F6')
                        : 'transparent',
                    opacity: isDisabled ? 0.3 : 1,
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'Questrial-Regular-Regular',
                    color: isSelected 
                      ? '#FFFFFF'
                      : isCurrentMonth 
                        ? (isDark ? '#FFFFFF' : '#333333')
                        : (isDark ? '#666666' : '#CCCCCC'),
                    fontWeight: isToday ? 'bold' : 'normal',
                  }}>
                    {format(day, 'd')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Footer */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 20,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#444444' : '#E5E5E5',
          }}>
            <Pressable
              onPress={onClose}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: 'Questrial-Regular-Medium',
                color: isDark ? '#FFFFFF' : '#333333',
              }}>
                Cancel
              </Text>
            </Pressable>
            
            <Pressable
              onPress={onClose}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: '#FF6B6B',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: 'Questrial-Regular-Medium',
                color: '#FFFFFF',
              }}>
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Custom Desktop Time Picker Component
function DesktopTimePicker({ 
  visible, 
  onClose, 
  selectedDate, 
  onDateChange, 
  isDark 
}: {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isDark: boolean;
}) {
  const [hours, setHours] = useState(selectedDate.getHours());
  const [minutes, setMinutes] = useState(selectedDate.getMinutes());

  const handleSave = () => {
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours);
    newDateTime.setMinutes(minutes);
    onDateChange(newDateTime);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
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
          backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          minWidth: 280,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}>
          <Text style={{
            fontSize: 18,
            fontFamily: 'Questrial-Regular-SemiBold',
            color: isDark ? '#FFFFFF' : '#333333',
            textAlign: 'center',
            marginBottom: 20,
          }}>
            Select Time
          </Text>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            {/* Hours */}
            <ScrollView style={{ height: 120, width: 80 }}>
              {Array.from({ length: 24 }, (_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setHours(i)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: hours === i ? '#FF6B6B' : 'transparent',
                    marginVertical: 2,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Questrial-Regular-Regular',
                    color: hours === i ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#333333'),
                    textAlign: 'center',
                  }}>
                    {i.toString().padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={{
              fontSize: 24,
              fontFamily: 'Questrial-Regular-Bold',
              color: isDark ? '#FFFFFF' : '#333333',
              marginHorizontal: 16,
            }}>
              :
            </Text>

            {/* Minutes */}
            <ScrollView style={{ height: 120, width: 80 }}>
              {Array.from({ length: 60 }, (_, i) => (
                <Pressable
                  key={i}
                  onPress={() => setMinutes(i)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: minutes === i ? '#FF6B6B' : 'transparent',
                    marginVertical: 2,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Questrial-Regular-Regular',
                    color: minutes === i ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#333333'),
                    textAlign: 'center',
                  }}>
                    {i.toString().padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#444444' : '#E5E5E5',
          }}>
            <Pressable
              onPress={onClose}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: 'Questrial-Regular-Medium',
                color: isDark ? '#FFFFFF' : '#333333',
              }}>
                Cancel
              </Text>
            </Pressable>
            
            <Pressable
              onPress={handleSave}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: '#FF6B6B',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: 'Questrial-Regular-Medium',
                color: '#FFFFFF',
              }}>
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function DateTimeSelector({ 
  selectedDate, 
  onDateChange, 
  minimumDate, 
  label = "Date & Time",
  showTime = true 
}: DateTimeSelectorProps) {
  const { isDark } = useThemeStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      onDateChange(date);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      // Combine the selected date with the new time
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(date.getHours());
      newDateTime.setMinutes(date.getMinutes());
      onDateChange(newDateTime);
    }
  };

  return (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontFamily: 'Questrial-Regular-SemiBold',
          color: isDark ? '#FFFFFF' : '#333333',
          marginBottom: 8,
        }}
      >
        📅 {label}
      </Text>
      
      {/* Date Selector */}
      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={{
          borderWidth: 2,
          borderColor: isDark ? '#555555' : '#E5E5E5',
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7',
          shadowColor: isDark ? '#000000' : '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
          marginBottom: showTime ? 12 : 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'Questrial-Regular-Regular',
            color: isDark ? '#FFFFFF' : '#333333',
          }}
        >
          {formatDisplayDate(selectedDate)}
        </Text>
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={isDark ? '#FFFFFF' : '#333333'} 
        />
      </Pressable>

      {/* Time Selector - only show if showTime is true */}
      {showTime && (
        <Pressable
          onPress={() => setShowTimePicker(true)}
          style={{
            borderWidth: 2,
            borderColor: isDark ? '#555555' : '#E5E5E5',
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: isDark ? '#2a2a2a' : '#F7F7F7',
            shadowColor: isDark ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: 3,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Questrial-Regular-Regular',
              color: isDark ? '#FFFFFF' : '#333333',
            }}
          >
            {formatDisplayTime(selectedDate)}
          </Text>
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={isDark ? '#FFFFFF' : '#333333'} 
          />
        </Pressable>
      )}
      
      <Text
        style={{
          fontSize: 14,
          fontFamily: 'Questrial-Regular-Regular',
          color: isDark ? '#B0B0B0' : '#666666',
          marginTop: 8,
        }}
      >
        {showTime ? 'Select when your trip begins' : 'Select your trip date'}
      </Text>

      {/* Platform-specific Date Pickers */}
      {Platform.OS === 'web' ? (
        <>
          <DesktopDatePicker
            visible={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            minimumDate={minimumDate || new Date()}
            isDark={isDark}
          />
          {showTime && (
            <DesktopTimePicker
              visible={showTimePicker}
              onClose={() => setShowTimePicker(false)}
              selectedDate={selectedDate}
              onDateChange={onDateChange}
              isDark={isDark}
            />
          )}
        </>
      ) : (
        <>
          {/* Mobile Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={minimumDate || new Date()}
              textColor={Platform.OS === 'ios' ? (isDark ? '#FFFFFF' : '#000000') : undefined}
            />
          )}

          {/* Mobile Time Picker Modal - only render if showTime is true */}
          {showTime && showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              textColor={Platform.OS === 'ios' ? (isDark ? '#FFFFFF' : '#000000') : undefined}
            />
          )}
        </>
      )}
    </View>
  );
}
