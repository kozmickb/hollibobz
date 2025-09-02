import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { Text as RestyleText } from '../components/ui/Text';
import { createShadowStyle } from '../utils/shadowUtils';

export function TermsOfServiceScreen() {
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
            name="document-text"
            size={28}
            color={isDark ? '#60a5fa' : '#2563eb'}
            style={styles.headerIcon}
          />
          <RestyleText variant="xl" style={[styles.headerTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
            Terms of Service
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
              Agreement to Terms
            </RestyleText>
            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              By downloading, installing, or using Odysync, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the application.
            </RestyleText>
          </View>

          {/* Description of Service */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Description of Service
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Odysync is a travel planning application that provides:
            </RestyleText>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Trip countdown timers and planning tools
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Customizable checklists and reminders
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  AI-powered travel assistant (Holly Bobz)
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={16} color={isDark ? '#10b981' : '#059669'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Destination information and travel tips
                </RestyleText>
              </View>
            </View>
          </View>

          {/* User Accounts and Data */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              User Accounts and Data
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              • All data is stored locally on your device{'\n'}
              • You are responsible for maintaining your device's security{'\n'}
              • We do not access or store your personal data on external servers{'\n'}
              • Data backup is your responsibility
            </RestyleText>
          </View>

          {/* Acceptable Use */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Acceptable Use
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              You agree to use Odysync only for lawful purposes and in accordance with these terms:
            </RestyleText>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="close-circle" size={16} color={isDark ? '#ef4444' : '#dc2626'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Do not use the app for any illegal activities
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="close-circle" size={16} color={isDark ? '#ef4444' : '#dc2626'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Do not attempt to reverse engineer or modify the app
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="close-circle" size={16} color={isDark ? '#ef4444' : '#dc2626'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Do not use the app to harass or harm others
                </RestyleText>
              </View>

              <View style={styles.bulletItem}>
                <Ionicons name="close-circle" size={16} color={isDark ? '#ef4444' : '#dc2626'} />
                <RestyleText variant="sm" style={[styles.bulletText, { color: isDark ? '#d1d5db' : '#374151' }]}>
                  Do not share inappropriate content
                </RestyleText>
              </View>
            </View>
          </View>

          {/* AI Assistant Usage */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              AI Assistant (Holly Bobz)
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              The AI travel assistant is provided for informational purposes:
            </RestyleText>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                AI Responses
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                • AI suggestions are not guaranteed to be accurate or complete{'\n'}
                • Always verify important travel information from official sources{'\n'}
                • Odysync is not responsible for decisions made based on AI recommendations
              </RestyleText>
            </View>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Data Usage
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                • Trip details are processed temporarily for AI responses{'\n'}
                • No personal data is stored or shared with AI providers{'\n'}
                • Conversations are not saved or analyzed
              </RestyleText>
            </View>
          </View>

          {/* Third-Party Services */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Third-Party Services
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              Odysync may integrate with third-party services:
            </RestyleText>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Calendar Integration
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                Optional calendar access requires your explicit permission. Odysync only adds events you create.
              </RestyleText>
            </View>

            <View style={styles.subsection}>
              <RestyleText variant="md" style={[styles.subsectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
                Photo Services
              </RestyleText>
              <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                Profile photos are stored locally on your device. No images are uploaded or shared.
              </RestyleText>
            </View>
          </View>

          {/* Intellectual Property */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Intellectual Property
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
                              • Odysync and its content are protected by copyright and trademark laws{'\n'}
              • You may not copy, modify, or distribute app content without permission{'\n'}
              • User-generated content remains your property{'\n'}
              • We respect the intellectual property rights of others
            </RestyleText>
          </View>

          {/* Disclaimers */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Disclaimers
            </RestyleText>

            <View style={styles.highlightBox}>
              <Ionicons name="warning" size={20} color={isDark ? '#f59e0b' : '#d97706'} />
              <RestyleText variant="sm" style={[styles.highlightText, { color: isDark ? '#f59e0b' : '#d97706' }]}>
                Odysync is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service.
              </RestyleText>
            </View>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              • Travel information is for general guidance only{'\n'}
              • Always check official sources for current requirements{'\n'}
              • Odysync is not liable for travel disruptions or changes{'\n'}
              • Users assume all risks associated with travel planning
            </RestyleText>
          </View>

          {/* Limitation of Liability */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Limitation of Liability
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              To the maximum extent permitted by law, Odysync shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of the application. Our total liability
              shall not exceed the amount paid for the app (if any).
            </RestyleText>
          </View>

          {/* Termination */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Termination
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              • You may stop using Odysync at any time{'\n'}
              • We reserve the right to terminate service for violations{'\n'}
              • Data deletion upon account termination is your responsibility{'\n'}
              • Some provisions survive termination
            </RestyleText>
          </View>

          {/* Governing Law */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Governing Law
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              These Terms of Service are governed by the laws of the jurisdiction in which you reside.
              Any disputes shall be resolved through binding arbitration or in the appropriate courts.
            </RestyleText>
          </View>

          {/* Changes to Terms */}
          <View style={[styles.section, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Changes to Terms
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              We may update these terms from time to time. Continued use of Odysync after changes
              become effective constitutes acceptance of the updated terms. Major changes will be
              communicated through the app.
            </RestyleText>
          </View>

          {/* Contact Information */}
          <View style={[styles.section, styles.lastSection, { backgroundColor: isDark ? '#111827' : '#ffffff' }, shadowStyle]}>
            <RestyleText variant="lg" style={[styles.sectionTitle, { color: isDark ? '#f9fafb' : '#111827' }]}>
              Contact Information
            </RestyleText>

            <RestyleText variant="sm" style={[styles.paragraph, { color: isDark ? '#d1d5db' : '#374151' }]}>
              If you have questions about these Terms of Service, please contact us:
            </RestyleText>

            <View style={styles.contactInfo}>
              <Ionicons name="mail" size={18} color={isDark ? '#60a5fa' : '#2563eb'} />
              <RestyleText variant="sm" style={[styles.contactText, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
                legal@odeysync.app
              </RestyleText>
            </View>

            <RestyleText variant="xs" style={[styles.disclaimer, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              By using Odysync, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
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
