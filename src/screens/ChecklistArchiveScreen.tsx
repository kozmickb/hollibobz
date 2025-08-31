import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text as RestyleText } from '../components/ui/Text';
import { useThemeStore } from '../store/useThemeStore';
import { tripStore } from '../lib/tripStore';
import { Trip } from '../entities/trip';

export function ChecklistArchiveScreen() {
  const { isDark } = useThemeStore();
  const [archived, setArchived] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const all = await tripStore.getAll();
      setArchived((all || []).filter(t => t.checklist && t.archived));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (id: string) => {
    try {
      await tripStore.restore(id);
      await load();
    } catch (e) {
      console.warn('Failed to restore checklist:', e);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Checklist', 'Permanently delete this archived checklist?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await tripStore.delete(id); await load(); } }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0a0a0a' : '#f8fafc' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {loading ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <RestyleText variant="md" color="textMuted">Loading…</RestyleText>
          </View>
        ) : archived.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Ionicons name="archive-outline" size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
            <RestyleText variant="lg" color="text" fontWeight="semibold" marginTop={8}>No Archived Checklists</RestyleText>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {archived.map(t => (
              <View key={t.id} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <RestyleText variant="md" color="text" fontWeight="bold">{t.title}</RestyleText>
                    {t.timerContext?.destination && (
                      <RestyleText variant="xs" color="textMuted" marginTop={4}>{t.timerContext.destination}</RestyleText>
                    )}
                    {t.archivedAt && (
                      <RestyleText variant="xs" color="textMuted" marginTop={4}>Archived {new Date(t.archivedAt).toLocaleDateString()}</RestyleText>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable onPress={() => handleRestore(t.id)} style={{ backgroundColor: isDark ? '#065F46' : '#D1FAE5', borderRadius: 10, padding: 8 }}>
                      <Ionicons name="refresh" size={18} color={isDark ? '#34D399' : '#065F46'} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(t.id)} style={{ backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2', borderRadius: 10, padding: 8 }}>
                      <Ionicons name="trash" size={18} color={isDark ? '#FCA5A5' : '#DC2626'} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}


