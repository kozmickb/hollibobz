import React from 'react';
import { View, Text, Pressable, Modal, Platform } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  onClose: () => void;
}

export function CustomAlert({ visible, title, message, buttons, onClose }: CustomAlertProps) {
  const { isDark } = useThemeStore();

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return {
          backgroundColor: '#FF4757',
          color: '#FFFFFF',
        };
      case 'cancel':
        return {
          backgroundColor: isDark ? '#374151' : '#F3F4F6',
          color: isDark ? '#FFFFFF' : '#333333',
        };
      default:
        return {
          backgroundColor: '#FF6B6B',
          color: '#FFFFFF',
        };
    }
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
          padding: 24,
          minWidth: 300,
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Title */}
          <Text style={{
            fontSize: 18,
            fontFamily: 'Questrial',
        fontWeight: '600',
            color: isDark ? '#FFFFFF' : '#333333',
            marginBottom: 12,
            textAlign: 'center',
          }}>
            {title}
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: 16,
            fontFamily: 'Questrial',
            color: isDark ? '#CCCCCC' : '#666666',
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12,
          }}>
            {buttons.map((button, index) => {
              const buttonStyle = getButtonStyle(button.style);
              return (
                <Pressable
                  key={index}
                  onPress={() => handleButtonPress(button)}
                  style={{
                    backgroundColor: buttonStyle.backgroundColor,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 12,
                    minWidth: 80,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: buttonStyle.color,
                    fontSize: 16,
                    fontFamily: 'Questrial',
        fontWeight: '500',
                  }}>
                    {button.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Custom alert function that works on both web and mobile
export function showAlert(
  title: string,
  message: string,
  buttons: AlertButton[],
  onClose?: () => void
): void {
  if (Platform.OS === 'web') {
    // For web, we'll use a custom alert implementation
    // This will be handled by the component that calls this function
    console.log('Web alert:', { title, message, buttons });
  } else {
    // For mobile, use the native Alert
    const { Alert } = require('react-native');
    Alert.alert(title, message, buttons, onClose);
  }
}
