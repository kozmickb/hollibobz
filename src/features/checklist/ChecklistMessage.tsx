import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import Checklist from "./Checklist";
import { extractJsonBlock } from "./itineraryParser";
import { validateChecklistDoc } from "./validate";
import { useThemeStore } from "../../store/useThemeStore";
import { useFonts } from "../../hooks/useFonts";

type Props = { 
  messageContent: string; 
  onRegenerateRequest?: () => void;
};

export default function ChecklistMessage({ messageContent, onRegenerateRequest }: Props) {
  const { isDark } = useThemeStore();
  const { fontsLoaded } = useFonts();
  
  const doc = useMemo(() => {
    const block = extractJsonBlock(messageContent);
    if (!block) return null;
    try { 
      return validateChecklistDoc(JSON.parse(block)); 
    } catch { 
      return null; 
    }
  }, [messageContent]);

  if (!doc) {
    return (
      <View style={{
        marginTop: 12,
        padding: 16,
        backgroundColor: isDark ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.15)',
      }}>
        <Text style={{
          fontSize: 14,
          fontFamily: fontsLoaded ? 'Questrial-Regular' : 'System',
          fontWeight: '600',
          color: isDark ? '#FED7AA' : '#EA580C',
          marginBottom: 8,
        }}>
          ✨ Interactive Checklist Available
        </Text>
        <Text style={{
          fontSize: 14,
          fontFamily: fontsLoaded ? 'Questrial-Regular' : 'System',
          color: isDark ? '#FED7AA' : '#9A3412',
          lineHeight: 20,
          marginBottom: 12,
        }}>
          I can create a tickable checklist from this itinerary. Would you like me to format it properly?
        </Text>
        {onRegenerateRequest && (
          <Pressable
            onPress={onRegenerateRequest}
            style={{
              backgroundColor: isDark ? '#EA580C' : '#F97316',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontFamily: fontsLoaded ? 'Questrial-Regular' : 'System',
              fontWeight: '600',
            }}>
              Generate Checklist
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  // Don't render inline checklist anymore - we have a dedicated page
  // Just return null since the "Open Checklist" button is handled in the chat screen
  return null;
}
