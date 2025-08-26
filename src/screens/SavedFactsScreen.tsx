import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useHolidayStore } from '../state/holidayStore';
import { SavedFact } from '../state/holidayStore';

export function SavedFactsScreen() {
  const navigation = useNavigation();
  const { savedFacts, removeSavedFact } = useHolidayStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Group facts by destination
  const groupedFacts = useMemo(() => {
    const filtered = savedFacts.filter(fact => 
      fact.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fact.fact.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped = filtered.reduce((acc, fact) => {
      if (!acc[fact.destination]) {
        acc[fact.destination] = [];
      }
      acc[fact.destination].push(fact);
      return acc;
    }, {} as Record<string, SavedFact[]>);

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [savedFacts, searchQuery]);

  const handleRemoveFact = (savedAt: string) => {
    removeSavedFact(savedAt);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F7F7' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#FFFFFF', 
        paddingTop: 12, 
        paddingBottom: 20, 
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </Pressable>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333333' }}>
            Saved Facts
          </Text>
        </View>

        {/* Search bar */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: '#F5F5F5', 
          borderRadius: 12, 
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search facts or destinations..."
            style={{ 
              flex: 1, 
              marginLeft: 12, 
              fontSize: 16,
              color: '#333333',
            }}
            placeholderTextColor="#666666"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {groupedFacts.length === 0 ? (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: 12,
          }}>
            <Ionicons name="bookmark-outline" size={64} color="#CCCCCC" />
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#666666', 
              marginTop: 16,
              textAlign: 'center',
            }}>
              {searchQuery ? 'No facts found' : 'No saved facts yet'}
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: '#999999', 
              marginTop: 8,
              textAlign: 'center',
            }}>
              {searchQuery ? 'Try adjusting your search' : 'Save interesting facts from your daily cards'}
            </Text>
          </View>
        ) : (
          groupedFacts.map(([destination, facts]) => (
            <View key={destination} style={{ marginBottom: 24 }}>
              {/* Destination header */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333' }}>
                  {destination}
                </Text>
                <View style={{ 
                  backgroundColor: '#E5E7EB', 
                  borderRadius: 12, 
                  paddingHorizontal: 8, 
                  paddingVertical: 4,
                  marginLeft: 8,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280' }}>
                    {facts.length} {facts.length === 1 ? 'fact' : 'facts'}
                  </Text>
                </View>
              </View>

              {/* Facts list */}
              {facts.map((fact, index) => (
                <View key={fact.savedAt} style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: 12, 
                  padding: 16, 
                  marginBottom: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ 
                      backgroundColor: '#3B82F6', 
                      borderRadius: 20, 
                      padding: 8, 
                      marginRight: 12,
                    }}>
                      <Ionicons name="bulb" size={16} color="white" />
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{ 
                        fontSize: 14, 
                        lineHeight: 20, 
                        color: '#333333',
                        marginBottom: 8,
                      }}>
                        {fact.fact}
                      </Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ 
                          fontSize: 12, 
                          color: '#666666',
                        }}>
                          Saved {formatDate(fact.savedAt)}
                        </Text>
                        
                        <Pressable
                          onPress={() => handleRemoveFact(fact.savedAt)}
                          style={{ 
                            backgroundColor: '#FEE2E2', 
                            borderRadius: 16, 
                            padding: 6,
                          }}
                        >
                          <Ionicons name="trash-outline" size={14} color="#DC2626" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
