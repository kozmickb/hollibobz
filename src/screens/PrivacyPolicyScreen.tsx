import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { Text as RestyleText } from '../components/ui/Text';
import { createShadowStyle } from '../utils/shadowUtils';

export function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  
  const shadowStyle = createShadowStyle({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1f2937' : '#f9fafb' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#111827' : '#ffffff' }]}>
        <View style={styles.headerContent}>
          <Ionicons
            name="shield-checkmark"
            size={28}
            color={isDark ? '#60a5fa' : '#2563eb'}
            style={styles.headerIcon}
          />
          <RestyleText variant="xl" style={[styles.headerTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Privacy Policy
          </RestyleText>
          <RestyleText variant="xs" style={[styles.lastUpdated, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
            Last updated: {currentDate}
          </RestyleText>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Introduction */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Introduction
            </RestyleText>
            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              At Odysync, we are committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, and safeguard your data when you use our travel planning application.
            </RestyleText>
          </View>

          {/* Information We Collect */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Information We Collect
            </RestyleText>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Trip Information
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                • Destination and travel dates{'\n'}
                • Group size and traveler details{'\n'}
                • Trip duration and preferences{'\n'}
                • Custom checklists and reminders
              </RestyleText>
            </View>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Device Information
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                • Device type and operating system{'\n'}
                • App version and usage statistics{'\n'}
                • Performance metrics for app improvement
              </RestyleText>
            </View>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Optional Information
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                • Profile photos (stored locally){'\n'}
                • User preferences and settings{'\n'}
                • Travel statistics and achievements
              </RestyleText>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              How We Use Your Information
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Your information is used exclusively to provide and improve the Odysync experience:
            </RestyleText>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Create and manage your travel plans and checklists
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Provide personalized travel recommendations through Holly Bobz
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Send reminders and notifications for your trips
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Improve app performance and user experience
                </RestyleText>
              </View>
            </View>
          </View>

          {/* Data Storage and Security */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Data Storage and Security
            </RestyleText>

            <View style={styles.highlightBox}>
              <Ionicons name="lock-closed" size={20} color={isDark ? '#fbbf24' : '#d97706'} />
              <RestyleText variant="sm" style={[styles.highlightText, { color: isDark ? '#fbbf24' : '#d97706' }]}>
                All your data is stored locally on your device. We do not store or transmit your personal information to external servers.
              </RestyleText>
            </View>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Your trip data, checklists, and preferences are stored securely on your device using industry-standard encryption.
              We implement appropriate technical and organizational measures to protect your information.
            </RestyleText>
          </View>

          {/* Third-Party Services */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Third-Party Services
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Odysync integrates with the following third-party services for enhanced functionality:
            </RestyleText>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                AI Travel Assistant (Holly Bobz)
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                Uses secure AI APIs to provide personalized travel recommendations. Trip details are processed temporarily and not stored.
              </RestyleText>
            </View>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Calendar Integration
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                Optional calendar access to add trip events and reminders. Data remains on your device.
              </RestyleText>
            </View>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Photo Storage
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                Profile photos are stored locally on your device. We do not upload or share images.
              </RestyleText>
            </View>
          </View>

          {/* Your Rights */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Your Rights
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              You have the following rights regarding your data:
            </RestyleText>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="eye" size={16} color={isDark ? '#60a5fa' : '#2563eb'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Access your stored data anytime through the app
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="trash" size={16} color={isDark ? '#60a5fa' : '#2563eb'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Delete all data by clearing app data or reinstalling
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="settings" size={16} color={isDark ? '#60a5fa' : '#2563eb'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Control permissions and data collection preferences
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="mail" size={16} color={isDark ? '#60a5fa' : '#2563eb'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Contact us with privacy concerns or questions
                </RestyleText>
              </View>
            </View>
          </View>

          {/* Data Retention */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Data Retention
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              • Trip data is retained until you delete it or the trip passes{'\n'}
              • App settings and preferences are stored indefinitely{'\n'}
              • Usage statistics are kept for app improvement purposes{'\n'}
              • All data can be permanently deleted by clearing app data
            </RestyleText>
          </View>

          {/* Children's Privacy */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Children's Privacy
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Odysync is designed for users of all ages. We do not knowingly collect personal information from children under 13.
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </RestyleText>
          </View>

          {/* Changes to This Policy */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Changes to This Policy
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy
              within the app. Your continued use of Odysync after changes become effective constitutes acceptance of the updated policy.
            </RestyleText>
          </View>

          {/* Contact Us */}
          <View style={[styles.section, styles.lastSection, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Contact Us
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </RestyleText>

            <View style={styles.contactInfo}>
              <Ionicons name="mail" size={18} color={isDark ? '#60a5fa' : '#2563eb'} />
              <RestyleText variant="sm" style={[styles.contactText, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
                privacy@odeysync.app
              </RestyleText>
            </View>

            <RestyleText variant="xs" style={[styles.disclaimer, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Thank you for trusting Odysync with your travel planning needs. We are committed to protecting your privacy and providing you with the best travel planning experience possible.
            </RestyleText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lastUpdated: {
    marginTop: 4,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 8,
  },
  bulletText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 20,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  highlightText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
    lineHeight: 20,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  contactText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  disclaimer: {
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
