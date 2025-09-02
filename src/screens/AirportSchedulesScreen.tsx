import React, { useState } from 'react';
import { View, ScrollView, Pressable, Platform, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from '../components/ui/Text';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/useThemeStore';
import { ProfileStackParamList } from '../navigation/AppNavigator';
import { DataFreshnessIndicator } from '../components/DataFreshnessIndicator';

type Nav = NativeStackNavigationProp<ProfileStackParamList, "AirportSchedules">;

interface FlightData {
  flight: {
    number: string;
    iata: string;
    icao: string;
  };
  departure?: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    delay: number;
    scheduled: string;
    estimated: string;
    actual: string;
    estimated_runway: string;
    actual_runway: string;
  };
  arrival?: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    baggage: string;
    delay: number;
    scheduled: string;
    estimated: string;
    actual: string;
    estimated_runway: string;
    actual_runway: string;
  };
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  aircraft: {
    registration: string;
    iata: string;
    icao: string;
    icao24: string;
  };
  live: {
    updated: string;
    latitude: number;
    longitude: number;
    altitude: number;
    direction: number;
    speed_horizontal: number;
    speed_vertical: number;
    is_ground: boolean;
  } | null;
}

export function AirportSchedulesScreen() {
  const navigation = useNavigation<Nav>();
  const { isDark } = useThemeStore();
  const [airportCode, setAirportCode] = useState('');
  const [flightData, setFlightData] = useState<{
    arrivals: FlightData[];
    departures: FlightData[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'arrivals' | 'departures' | 'both'>('both');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAirportSchedule = async (iataCode: string) => {
    try {
      setLoading(true);

      // Use mock data directly to avoid import issues
      const mockData = await getMockAirportData(iataCode.toUpperCase());

      if (mockData.arrivals || mockData.departures) {
        setFlightData({
          arrivals: mockData.arrivals || [],
          departures: mockData.departures || []
        });
        setLastUpdated(new Date());
      } else {
        Alert.alert('No Data', `No flight data available for ${iataCode.toUpperCase()}`);
      }
    } catch (error: any) {
      console.error('Airport data error:', error);
      Alert.alert('Error', `Failed to load airport data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for testing - replace with real API call later
  const getMockAirportData = async (iataCode: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const airlines = ['British Airways', 'American Airlines', 'Delta', 'United', 'Lufthansa', 'Air France', 'KLM', 'Emirates'];
    const flightNumbers = ['101', '202', '303', '404', '505', '606', '707', '808'];

    const generateFlight = (type: 'arrival' | 'departure', index: number) => {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const flightNumber = flightNumbers[Math.floor(Math.random() * flightNumbers.length)];
      const isDelayed = Math.random() > 0.7;
      const delayMinutes = isDelayed ? Math.floor(Math.random() * 60) + 15 : 0;

      const baseTime = new Date();
      const timeOffset = type === 'arrival'
        ? -(Math.floor(Math.random() * 240) + 30) // Past 30min to 4 hours ago
        : (Math.floor(Math.random() * 480) + 30); // Next 30min to 8 hours

      const scheduledTime = new Date(baseTime.getTime() + timeOffset * 60000);
      const estimatedTime = isDelayed ? new Date(scheduledTime.getTime() + delayMinutes * 60000) : scheduledTime;

      return {
        flight: {
          number: flightNumber,
          iata: `${airline.split(' ')[0].substring(0, 2).toUpperCase()}${flightNumber}`,
          icao: `${airline.split(' ')[0].substring(0, 3).toUpperCase()}${flightNumber}`
        },
        [type === 'arrival' ? 'arrival' : 'departure']: {
          airport: type === 'arrival' ? iataCode : getRandomAirport(iataCode),
          timezone: 'Europe/London',
          iata: type === 'arrival' ? iataCode : getRandomAirport(iataCode),
          icao: `${type === 'arrival' ? iataCode : getRandomAirport(iataCode)}`,
          terminal: `T${Math.floor(Math.random() * 5) + 1}`,
          gate: `G${Math.floor(Math.random() * 50) + 1}`,
          delay: delayMinutes,
          scheduled: scheduledTime.toISOString(),
          estimated: estimatedTime.toISOString(),
          actual: null,
          estimated_runway: null,
          actual_runway: null
        },
        airline: {
          name: airline,
          iata: airline.split(' ')[0].substring(0, 2).toUpperCase(),
          icao: airline.split(' ')[0].substring(0, 3).toUpperCase()
        },
        aircraft: {
          registration: `N${Math.floor(Math.random() * 90000) + 10000}`,
          iata: 'B738',
          icao: 'B738',
          icao24: 'ABC123'
        },
        live: null
      };
    };

    const numArrivals = filter !== 'departures' ? Math.floor(Math.random() * 8) + 3 : 0;
    const numDepartures = filter !== 'arrivals' ? Math.floor(Math.random() * 8) + 3 : 0;

    const arrivals = Array.from({ length: numArrivals }, (_, i) => generateFlight('arrival', i));
    const departures = Array.from({ length: numDepartures }, (_, i) => generateFlight('departure', i));

    return {
      arrivals,
      departures
    };
  };

  const getRandomAirport = (exclude: string) => {
    const airports = ['LHR', 'JFK', 'CDG', 'FRA', 'AMS', 'MAD', 'FCO', 'MUC', 'ZRH', 'VIE', 'CPH', 'ARN', 'OSL', 'HEL'];
    let airport = airports[Math.floor(Math.random() * airports.length)];
    while (airport === exclude) {
      airport = airports[Math.floor(Math.random() * airports.length)];
    }
    return airport;
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (flight: FlightData, type: 'arrival' | 'departure') => {
    const data = type === 'arrival' ? flight.arrival : flight.departure;
    if (!data) return isDark ? '#6b7280' : '#9ca3af';

    const now = new Date();
    const scheduled = new Date(data.scheduled);
    const estimated = data.estimated ? new Date(data.estimated) : null;
    const actual = data.actual ? new Date(data.actual) : null;

    if (actual) return isDark ? '#10b981' : '#059669'; // Landed/Departed
    if (estimated && Math.abs(now.getTime() - estimated.getTime()) < 15 * 60 * 1000) return isDark ? '#fbbf24' : '#d97706'; // On time/boarding
    if (data.delay && data.delay > 15) return isDark ? '#ef4444' : '#dc2626'; // Delayed

    return isDark ? '#6b7280' : '#9ca3af'; // Scheduled
  };

  const getStatusText = (flight: FlightData, type: 'arrival' | 'departure') => {
    const data = type === 'arrival' ? flight.arrival : flight.departure;
    if (!data) return 'Unknown';

    const now = new Date();
    const scheduled = new Date(data.scheduled);
    const estimated = data.estimated ? new Date(data.estimated) : null;
    const actual = data.actual ? new Date(data.actual) : null;

    if (actual) return type === 'arrival' ? 'Landed' : 'Departed';
    if (estimated && Math.abs(now.getTime() - estimated.getTime()) < 15 * 60 * 1000) return type === 'arrival' ? 'Landing' : 'Boarding';
    if (data.delay && data.delay > 15) return `Delayed ${data.delay}min`;

    return 'On Time';
  };

  const renderFlight = (flight: FlightData, type: 'arrival' | 'departure') => {
    const data = type === 'arrival' ? flight.arrival : flight.departure;
    if (!data) return null;

    return (
      <View key={flight.flight.iata} style={{
        backgroundColor: isDark ? "#374151" : "#ffffff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isDark ? "#4b5563" : "#fbbf24",
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <RestyleText variant="md" color="text" fontWeight="semibold">
                {flight.airline.iata} {flight.flight.number}
              </RestyleText>
              <View style={{
                backgroundColor: getStatusColor(flight, type),
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}>
                <RestyleText variant="xs" color="text" style={{ color: '#ffffff' }}>
                  {getStatusText(flight, type)}
                </RestyleText>
              </View>
            </View>
            <RestyleText variant="sm" color="textMuted" marginBottom={8}>
              {flight.airline.name}
            </RestyleText>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <RestyleText variant="sm" color="textMuted">
              {type === 'arrival' ? 'From' : 'To'}
            </RestyleText>
            <RestyleText variant="md" color="text" fontWeight="medium">
              {data.iata}
            </RestyleText>
          </View>

          <View style={{ alignItems: 'center' }}>
            <RestyleText variant="lg" color="text" fontWeight="bold">
              {formatTime(data.scheduled)}
            </RestyleText>
            {data.delay && data.delay > 0 && (
              <RestyleText variant="xs" color="textMuted" style={{ color: isDark ? '#ef4444' : '#dc2626' }}>
                +{data.delay}min
              </RestyleText>
            )}
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            {data.terminal && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="business" size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
                <RestyleText variant="sm" color="textMuted">
                  T{data.terminal}
                </RestyleText>
              </View>
            )}
            {data.gate && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="exit" size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
                <RestyleText variant="sm" color="textMuted">
                  Gate {data.gate}
                </RestyleText>
              </View>
            )}
          </View>
        </View>

        {data.estimated && data.estimated !== data.scheduled && (
          <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDark ? "#4b5563" : "#e5e7eb" }}>
            <RestyleText variant="xs" color="textMuted">
              Estimated: {formatTime(data.estimated)}
            </RestyleText>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1a1a1a" : "#fefefe" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: isDark ? "rgba(31, 41, 55, 0.8)" : "rgba(255, 255, 255, 0.8)",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#374151" : "#fbbf24",
          paddingHorizontal: 16,
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: isDark ? "#374151" : "#fef3c7",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#fbbf24" : "#d97706"} />
          </Pressable>
          <RestyleText variant="xl" color="text" fontWeight="bold">
            Airport Schedules
          </RestyleText>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === 'ios' ? 100 : 80
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Section */}
        <View style={{
          backgroundColor: isDark ? "#374151" : "#ffffff",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: isDark ? "#4b5563" : "#fbbf24",
        }}>
          <RestyleText variant="md" color="text" fontWeight="semibold" marginBottom={12}>
            Search Airport
          </RestyleText>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={{
                  backgroundColor: isDark ? "#4b5563" : "#f3f4f6",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: isDark ? "#ffffff" : "#000000",
                }}
                placeholder="Enter airport code (e.g., LHR, JFK, CDG)"
                placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                value={airportCode}
                onChangeText={setAirportCode}
                autoCapitalize="characters"
                maxLength={3}
              />
            </View>
            <Pressable
              onPress={() => airportCode.trim() && fetchAirportSchedule(airportCode.trim())}
              disabled={loading || !airportCode.trim()}
              style={{
                backgroundColor: loading || !airportCode.trim()
                  ? (isDark ? "#4b5563" : "#d1d5db")
                  : (isDark ? "#5eead4" : "#0d9488"),
                borderRadius: 8,
                padding: 12,
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 80,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons name="search" size={20} color="#ffffff" />
              )}
            </Pressable>
          </View>

          {/* Filter Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'both', label: 'All Flights', icon: 'airplane' },
              { key: 'arrivals', label: 'Arrivals', icon: 'airplane' },
              { key: 'departures', label: 'Departures', icon: 'airplane' },
            ].map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setFilter(option.key as any)}
                style={{
                  flex: 1,
                  backgroundColor: filter === option.key
                    ? (isDark ? "#5eead4" : "#0d9488")
                    : (isDark ? "#4b5563" : "#f3f4f6"),
                  borderRadius: 8,
                  padding: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Ionicons
                  name={option.icon as any}
                  size={14}
                  color={filter === option.key ? "#ffffff" : (isDark ? "#9ca3af" : "#6b7280")}
                />
                <RestyleText
                  variant="sm"
                  color="text"
                  fontWeight="medium"
                  style={{ color: filter === option.key ? "#ffffff" : undefined }}
                >
                  {option.label}
                </RestyleText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Results */}
        {flightData && (
          <>
            {/* Summary */}
            <View style={{
              backgroundColor: isDark ? "#374151" : "#ffffff",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: isDark ? "#4b5563" : "#fbbf24",
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <RestyleText variant="md" color="text" fontWeight="semibold">
                  Flight Summary for {airportCode.toUpperCase()}
                </RestyleText>
                {lastUpdated && (
                  <DataFreshnessIndicator
                    lastUpdated={lastUpdated}
                    dataType="flight data"
                    size="sm"
                  />
                )}
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {filter !== 'departures' && (
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <RestyleText variant="xl" color="text" fontWeight="bold">
                      {flightData.arrivals.length}
                    </RestyleText>
                    <RestyleText variant="sm" color="textMuted">
                      Arrivals
                    </RestyleText>
                  </View>
                )}
                {filter !== 'arrivals' && (
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <RestyleText variant="xl" color="text" fontWeight="bold">
                      {flightData.departures.length}
                    </RestyleText>
                    <RestyleText variant="sm" color="textMuted">
                      Departures
                    </RestyleText>
                  </View>
                )}
              </View>
            </View>

            {/* Flights List */}
            {filter !== 'departures' && flightData.arrivals.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={16}>
                  Arrivals
                </RestyleText>
                {flightData.arrivals.map(flight => renderFlight(flight, 'arrival'))}
              </View>
            )}

            {filter !== 'arrivals' && flightData.departures.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <RestyleText variant="lg" color="text" fontWeight="semibold" marginBottom={16}>
                  Departures
                </RestyleText>
                {flightData.departures.map(flight => renderFlight(flight, 'departure'))}
              </View>
            )}

            {((filter === 'both' && flightData.arrivals.length === 0 && flightData.departures.length === 0) ||
              (filter === 'arrivals' && flightData.arrivals.length === 0) ||
              (filter === 'departures' && flightData.departures.length === 0)) && (
              <View style={{
                backgroundColor: isDark ? "#374151" : "#ffffff",
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark ? "#4b5563" : "#fbbf24",
              }}>
                <Ionicons name="airplane-outline" size={48} color={isDark ? "#6b7280" : "#9ca3af"} style={{ marginBottom: 12 }} />
                <RestyleText variant="lg" color="text" fontWeight="medium" marginBottom={8}>
                  No Flights Found
                </RestyleText>
                <RestyleText variant="sm" color="textMuted" style={{ textAlign: 'center' }}>
                  No {filter === 'both' ? 'arrivals or departures' : filter} scheduled for {airportCode.toUpperCase()} in the selected time range.
                </RestyleText>
              </View>
            )}
          </>
        )}

        {!flightData && !loading && (
          <View style={{
            backgroundColor: isDark ? "#374151" : "#ffffff",
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDark ? "#4b5563" : "#fbbf24",
          }}>
            <Ionicons name="search" size={48} color={isDark ? "#6b7280" : "#9ca3af"} style={{ marginBottom: 12 }} />
            <RestyleText variant="lg" color="text" fontWeight="medium" marginBottom={8}>
              Search for Airport Schedules
            </RestyleText>
            <RestyleText variant="sm" color="textMuted" style={{ textAlign: 'center' }}>
              Enter an airport IATA code (e.g., LHR, JFK, CDG) to view live flight schedules including arrivals and departures.
            </RestyleText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
