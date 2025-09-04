import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TripsStackParamList } from '../navigation/AppNavigator';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeButton } from '../components/ThemeButton';

type SavedFactsNav = NativeStackNavigationProp<TripsStackParamList, "SavedFacts">;

export function SavedFactsScreen() {
  const navigation = useNavigation<SavedFactsNav>();
  const { isDark } = useThemeStore();

  // Mock saved facts data
  const savedFacts = [
    {
      id: '1',
      destination: 'Paris, France',
      fact: 'The Eiffel Tower was originally intended to be a temporary structure for the 1889 World\'s Fair.',
      category: 'Architecture',
      savedAt: '2024-01-15',
    },
    {
      id: '2',
      destination: 'Tokyo, Japan',
      fact: 'Tokyo has the world\'s busiest pedestrian crossing, Shibuya Crossing, with over 2.4 million people crossing daily.',
      category: 'Culture',
      savedAt: '2024-01-14',
    },
    {
      id: '3',
      destination: 'New York, USA',
      fact: 'Central Park is larger than the country of Monaco and contains over 25,000 trees.',
      category: 'Nature',
      savedAt: '2024-01-13',
    },
  ];

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#FEF7ED',
    }}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F172A' : '#FEF7ED'}
      />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(251, 146, 60, 0.1)',
        backgroundColor: isDark 
          ? 'rgba(30, 41, 59, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(251, 146, 60, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons 
              name="arrow-back" 
              size={20} 
              color={isDark ? '#F3F4F6' : '#F97316'} 
            />
          </Pressable>
          <Text style={{
            fontSize: 20,
            fontFamily: 'Questrial',
            fontWeight: '700',
            color: isDark ? '#F3F4F6' : '#1F2937',
          }}>
            Saved Facts
          </Text>
        </View>
        
        <ThemeButton />
      </View>

      {/* Main Content */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isDark 
              ? 'rgba(45, 212, 191, 0.2)' 
              : 'rgba(45, 212, 191, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            alignSelf: 'center',
          }}>
            <Ionicons 
              name="bookmark" 
              size={32} 
              color={isDark ? '#2DD4BF' : '#0D9488'} 
            />
          </View>
          <Text style={{
            fontSize: 28,
            fontFamily: 'Questrial',
            fontWeight: '700',
            color: isDark ? '#F3F4F6' : '#1F2937',
            textAlign: 'center',
            marginBottom: 8,
          }}>
            Your Travel Knowledge
          </Text>
          <Text style={{
            fontSize: 16,
            fontFamily: 'Questrial',
            color: isDark ? '#9CA3AF' : '#6B7280',
            textAlign: 'center',
          }}>
            Discover interesting facts about your destinations
          </Text>
        </View>

        {/* Stats Card */}
        <View style={{
          backgroundColor: isDark 
            ? 'rgba(30, 41, 59, 0.8)' 
            : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(251, 146, 60, 0.1)',
          shadowColor: isDark ? '#000' : '#F97316',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.1 : 0.05,
          shadowRadius: 8,
          elevation: isDark ? 2 : 1,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{
                fontSize: 24,
                fontFamily: 'Questrial',
                fontWeight: '700',
                color: isDark ? '#F3F4F6' : '#1F2937',
                marginBottom: 4,
              }}>
                {savedFacts.length}
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Questrial',
                color: isDark ? '#9CA3AF' : '#6B7280',
              }}>
                Facts Saved
              </Text>
            </View>
            
            <View style={{ width: 1, height: 40, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.1)' }} />
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{
                fontSize: 24,
                fontFamily: 'Questrial',
                fontWeight: '700',
                color: isDark ? '#F3F4F6' : '#1F2937',
                marginBottom: 4,
              }}>
                {new Set(savedFacts.map(fact => fact.destination)).size}
              </Text>
              <Text style={{
                fontSize: 14,
                fontFamily: 'Questrial',
                color: isDark ? '#9CA3AF' : '#6B7280',
              }}>
                Destinations
              </Text>
            </View>
          </View>
        </View>

        {/* Facts List */}
        <View>
          <Text style={{
            fontSize: 20,
            fontFamily: 'Questrial',
            fontWeight: '700',
            color: isDark ? '#F3F4F6' : '#1F2937',
            marginBottom: 16,
          }}>
            Recent Facts
          </Text>
          
          {savedFacts.map((fact, index) => (
            <View
              key={fact.id}
              style={{
                backgroundColor: isDark 
                  ? 'rgba(30, 41, 59, 0.8)' 
                  : 'rgba(255, 255, 255, 0.9)',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(251, 146, 60, 0.1)',
                shadowColor: isDark ? '#000' : '#F97316',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.1 : 0.05,
                shadowRadius: 4,
                elevation: isDark ? 1 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isDark 
                    ? 'rgba(45, 212, 191, 0.2)' 
                    : 'rgba(45, 212, 191, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={isDark ? '#2DD4BF' : '#0D9488'} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Questrial',
                    fontWeight: '700',
                    color: isDark ? '#F3F4F6' : '#1F2937',
                    marginBottom: 4,
                  }}>
                    {fact.destination}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: isDark 
                        ? 'rgba(139, 92, 246, 0.2)' 
                        : 'rgba(139, 92, 246, 0.1)',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      marginRight: 8,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        fontFamily: 'Questrial',
                        fontWeight: '500',
                        color: isDark ? '#A78BFA' : '#8B5CF6',
                      }}>
                        {fact.category}
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 12,
                      fontFamily: 'Questrial',
                      color: isDark ? '#9CA3AF' : '#6B7280',
                    }}>
                      {fact.savedAt}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text style={{
                fontSize: 14,
                fontFamily: 'Questrial',
                color: isDark ? '#D1D5DB' : '#374151',
                lineHeight: 20,
              }}>
                {fact.fact}
              </Text>
              
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <Pressable
                  style={{
                    backgroundColor: isDark 
                      ? 'rgba(251, 146, 60, 0.2)' 
                      : 'rgba(251, 146, 60, 0.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark 
                      ? 'rgba(251, 146, 60, 0.3)' 
                      : 'rgba(251, 146, 60, 0.2)',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Questrial',
                    fontWeight: '500',
                    color: isDark ? '#FB923C' : '#F97316',
                  }}>
                    Share
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State */}
        {savedFacts.length === 0 && (
          <View style={{
            alignItems: 'center',
            paddingVertical: 60,
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark 
                ? 'rgba(45, 212, 191, 0.2)' 
                : 'rgba(45, 212, 191, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons 
                name="bookmark-outline" 
                size={32} 
                color={isDark ? '#2DD4BF' : '#0D9488'} 
              />
            </View>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Questrial',
              fontWeight: '600',
              color: isDark ? '#F3F4F6' : '#1F2937',
              marginBottom: 8,
              textAlign: 'center',
            }}>
              No saved facts yet
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: 'Questrial',
              color: isDark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
            }}>
              Start chatting with Holly Bobz to discover interesting facts about your destinations!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
