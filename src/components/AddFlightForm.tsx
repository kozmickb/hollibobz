import React, { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from './ui/Text';

interface AddFlightFormProps {
  onSubmit: (data: {
    airlineIATA: string;
    flightNumber: string;
    departDateLocal: string;
  }) => void;
  isDark: boolean;
  isLoading: boolean;
}

export function AddFlightForm({ onSubmit, isDark, isLoading }: AddFlightFormProps) {
  const [airlineIATA, setAirlineIATA] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [departDateLocal, setDepartDateLocal] = useState('');

  const handleSubmit = () => {
    if (!airlineIATA.trim() || !flightNumber.trim() || !departDateLocal.trim()) {
      return;
    }

    onSubmit({
      airlineIATA: airlineIATA.trim().toUpperCase(),
      flightNumber: flightNumber.trim(),
      departDateLocal: departDateLocal.trim(),
    });
  };

  const isValid = airlineIATA.trim().length === 2 && flightNumber.trim().length > 0 && departDateLocal.trim().length === 10;

  return (
    <View style={{ gap: 16 }}>
      {/* Airline IATA Code */}
      <View>
        <RestyleText variant="sm" color="text" fontWeight="medium" style={{ marginBottom: 8 }}>
          Airline Code (2 letters)
        </RestyleText>
        <TextInput
          value={airlineIATA}
          onChangeText={setAirlineIATA}
          placeholder="e.g., EY, BA, LH"
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          maxLength={2}
          autoCapitalize="characters"
          style={{
            backgroundColor: isDark ? '#2d3748' : '#f7fafc',
            borderRadius: 8,
            padding: 12,
            color: isDark ? '#ffffff' : '#000000',
            fontSize: 16,
            borderWidth: 1,
            borderColor: isDark ? '#4a5568' : '#e2e8f0',
          }}
        />
      </View>

      {/* Flight Number */}
      <View>
        <RestyleText variant="sm" color="text" fontWeight="medium" style={{ marginBottom: 8 }}>
          Flight Number
        </RestyleText>
        <TextInput
          value={flightNumber}
          onChangeText={setFlightNumber}
          placeholder="e.g., 011, 1234"
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          style={{
            backgroundColor: isDark ? '#2d3748' : '#f7fafc',
            borderRadius: 8,
            padding: 12,
            color: isDark ? '#ffffff' : '#000000',
            fontSize: 16,
            borderWidth: 1,
            borderColor: isDark ? '#4a5568' : '#e2e8f0',
          }}
        />
      </View>

      {/* Departure Date */}
      <View>
        <RestyleText variant="sm" color="text" fontWeight="medium" style={{ marginBottom: 8 }}>
          Departure Date (YYYY-MM-DD)
        </RestyleText>
        <TextInput
          value={departDateLocal}
          onChangeText={setDepartDateLocal}
          placeholder="2025-01-15"
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          maxLength={10}
          style={{
            backgroundColor: isDark ? '#2d3748' : '#f7fafc',
            borderRadius: 8,
            padding: 12,
            color: isDark ? '#ffffff' : '#000000',
            fontSize: 16,
            borderWidth: 1,
            borderColor: isDark ? '#4a5568' : '#e2e8f0',
          }}
        />
      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={!isValid || isLoading}
        style={{
          backgroundColor: isValid && !isLoading ? (isDark ? '#0d9488' : '#10b981') : (isDark ? '#4b5563' : '#e5e7eb'),
          borderRadius: 8,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {isLoading ? (
          <Ionicons name="hourglass" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
        ) : (
          <Ionicons name="airplane" size={20} color={isValid ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280')} />
        )}
        <RestyleText 
          variant="md" 
          color="text" 
          style={{ 
            color: isValid && !isLoading ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280'),
            fontWeight: '600'
          }}
        >
          {isLoading ? 'Adding Flight...' : 'Add Flight'}
        </RestyleText>
      </Pressable>
    </View>
  );
}
