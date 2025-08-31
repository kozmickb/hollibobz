import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChecklistDoc, ChecklistState } from "./types";
import { storageSync as storage } from "../../lib/storage";
import { useThemeStore } from "../../store/useThemeStore";
import { UserStorageManager } from "../../lib/userStorage";

type Props = { doc: ChecklistDoc; storageKey?: string };

export default function Checklist({ doc, storageKey = `checklist:${doc.tripTitle}` }: Props) {
  const { isDark } = useThemeStore();
  const safeStorage = {
    get<T>(key: string, fallback: T): T {
      try {
        return storage && typeof (storage as any).get === 'function'
          ? (storage as any).get<T>(key, fallback)
          : fallback;
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T) {
      try {
        if (storage && typeof (storage as any).set === 'function') {
          (storage as any).set(key, value);
        }
      } catch {}
    }
  };
  const [state, setState] = useState<ChecklistState>(() =>
    safeStorage.get<ChecklistState>(storageKey, { ticks: {} })
  );
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [userPreferences, setUserPreferences] = useState<any>(null);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const userManager = UserStorageManager.getInstance();
        const profile = await userManager.getProfile();
        setUserPreferences(profile.preferences);
        
        // Set initial expanded state based on user preference
        const expanded: Record<number, boolean> = {};
        const shouldExpand = profile.preferences.defaultChecklistView === 'expanded';
        doc.sections.forEach((_, index) => {
          expanded[index] = shouldExpand;
        });
        setExpandedSections(expanded);
      } catch (error) {
        console.error('Failed to load user preferences:', error);
        // Fallback to all expanded
        const expanded: Record<number, boolean> = {};
        doc.sections.forEach((_, index) => {
          expanded[index] = true;
        });
        setExpandedSections(expanded);
      }
    };
    
    loadPreferences();
  }, [doc.sections]);

  useEffect(() => { safeStorage.set(storageKey, state); }, [state, storageKey]);

  const totals = useMemo(() => {
    let done = 0, total = 0;
    doc.sections.forEach((s, si) => s.items.forEach((_, ii) => {
      total++;
      const id = `${si}:${ii}`;
      if (state.ticks[id]) done++;
    }));
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [doc, state]);

  function toggle(si: number, ii: number) {
    const id = `${si}:${ii}`;
    const wasChecked = state.ticks[id];
    const isNowChecked = !wasChecked;
    
    setState(prev => ({ ticks: { ...prev.ticks, [id]: isNowChecked } }));
    
    // Update user stats when checking items
    if (isNowChecked) {
      const updateStats = async () => {
        try {
          const userManager = UserStorageManager.getInstance();
          const profile = await userManager.getProfile();
          await userManager.updateStats({
            itemsChecked: profile.stats.itemsChecked + 1,
          });
        } catch (error) {
          console.warn('Failed to update user stats:', error);
        }
      };
      updateStats();
    }
  }

  function exportText() {
    const lines: string[] = [`${doc.tripTitle}`, ``];
    doc.sections.forEach((s, si) => {
      lines.push(s.title);
      s.items.forEach((label, ii) => {
        const id = `${si}:${ii}`;
        lines.push(`${state.ticks[id] ? "☑" : "☐"} ${label}`);
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${doc.tripTitle}-checklist.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = [["Section","Item","Done"]];
    doc.sections.forEach((s, si) =>
      s.items.forEach((label, ii) => {
        const id = `${si}:${ii}`;
        rows.push([s.title, label, state.ticks[id] ? "Yes" : "No"]);
      })
    );
    const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${doc.tripTitle}-checklist.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const styles = getStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} accessibilityLiveRegion="polite">
          {doc.tripTitle}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer} accessibilityRole="progressbar" accessibilityLabel="Completion progress">
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${totals.percent}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {totals.done}/{totals.total} complete
          </Text>
        </View>
        
        {/* Export Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.exportButton} onPress={exportText}>
            <Text style={styles.exportButtonText}>Export text</Text>
          </Pressable>
          <Pressable style={styles.exportButton} onPress={exportCsv}>
            <Text style={styles.exportButtonText}>Export CSV</Text>
          </Pressable>
        </View>
      </View>

      {/* Sections */}
      {doc.sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {/* Section Header */}
          <Pressable
            style={styles.sectionHeader}
            onPress={() => {
              setExpandedSections(prev => ({
                ...prev,
                [sectionIndex]: !prev[sectionIndex]
              }));
            }}
            accessibilityRole="button"
            accessibilityLabel={`${section.title}, ${expandedSections[sectionIndex] ? 'expanded' : 'collapsed'}`}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Ionicons 
              name={expandedSections[sectionIndex] ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color={isDark ? "#9CA3AF" : "#6B7280"} 
            />
          </Pressable>
          
          {/* Section Items */}
          {expandedSections[sectionIndex] && (
            <View style={styles.itemsContainer}>
              {section.items.map((item, itemIndex) => {
                const id = `${sectionIndex}:${itemIndex}`;
                const checked = !!state.ticks[id];
                return (
                  <Pressable
                    key={id}
                    style={styles.item}
                    onPress={() => toggle(sectionIndex, itemIndex)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    accessibilityLabel={item}
                  >
                    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                      {checked && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text style={[styles.itemText, checked && styles.itemTextChecked]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#1a1a1a' : '#fefefe',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: isDark ? '#F3F4F6' : '#1F2937',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 10,
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: isDark ? '#2DD4BF' : '#14B8A6',
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: isDark ? '#D1D5DB' : '#6B7280',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  exportButton: {
    backgroundColor: isDark ? '#2DD4BF' : '#14B8A6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  section: {
    marginBottom: 16,
    backgroundColor: isDark ? '#374151' : '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#4B5563' : '#e5e7eb',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: isDark ? '#4B5563' : '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#6B7280' : '#e5e7eb',
    minHeight: 44,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: isDark ? '#F3F4F6' : '#1F2937',
    flex: 1,
  },
  itemsContainer: {
    backgroundColor: isDark ? '#374151' : '#ffffff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#4B5563' : '#f3f4f6',
    minHeight: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: isDark ? '#6B7280' : '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: isDark ? '#2DD4BF' : '#14B8A6',
    borderColor: isDark ? '#2DD4BF' : '#14B8A6',
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: isDark ? '#F3F4F6' : '#1F2937',
    flex: 1,
    lineHeight: 22,
  },
  itemTextChecked: {
    opacity: 0.7,
    textDecorationLine: 'line-through',
  },
});
