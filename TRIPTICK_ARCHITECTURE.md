# Odeysync - Travel Planning Application Architecture & Context Document

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Data Architecture](#data-architecture)
6. [Key Features](#key-features)
7. [User Flows](#user-flows)
8. [Components Architecture](#components-architecture)
9. [State Management](#state-management)
10. [External Integrations](#external-integrations)
11. [Development Guidelines](#development-guidelines)
12. [Deployment & Build Process](#deployment--build-process)
13. [Security Considerations](#security-considerations)
14. [Code Examples & Implementation Details](#code-examples--implementation-details)
15. [API Specifications](#api-specifications)
16. [Testing Strategy](#testing-strategy)
17. [Performance Optimizations](#performance-optimizations)
18. [Future Roadmap](#future-roadmap)

---

## 🔄 Recent Updates (Jan 2025)

- **Production Security & Telemetry**: Implemented comprehensive production safety with runtime guards that block HTTP connections in production builds. Added environment-driven telemetry initialization for Sentry and PostHog that only activates in production when proper keys are provided. Created centralized API client with automatic authentication and error handling.
- **Client API Helpers & UI Integration**: Added comprehensive client-side API helpers for flight resolution, airport schedules, and itinerary ingestion. Implemented anonymous user ID system with persistent storage. Added Trip Actions card to TimerDrilldownScreen with premium-gated buttons for Add Flight, Upload Itinerary, and Airport Schedule features.
- **Build Environment Documentation**: Added comprehensive README section with Railway server deployment and EAS mobile build setup instructions. Includes environment variable checklists, CLI commands, and quick deployment workflows for both server and mobile app builds.
- **Anonymous User Support**: Implemented persistent anonymous ID generation and storage using AsyncStorage. All API calls now include `x-subject-id` header for server-side usage tracking without requiring user authentication.
- **Premium Feature Gating**: Enhanced UI components with entitlement-based feature gating. Premium features show lock icons and upgrade prompts for free users, while premium users get full access to flight resolution, itinerary upload, and airport schedule features.
- **Typography System Overhaul**: Complete font system simplification to Questrial-only with weight variations for visual hierarchy. Updated all components, navigation, and global CSS to use single font family for consistency and performance.
- **Font Loading Optimization**: Refactored `useFonts.ts` to use platform-specific loading strategies - CSS `@font-face` for web, `expo-font` for native platforms.
- **Navigation Font Consistency**: Fixed bottom tab navigation labels to use Questrial font family with proper weight styling.
- **Component Typography Audit**: Systematically updated all UI components to use Questrial with appropriate `fontWeight` values (400, 500, 600, 700) for visual hierarchy.
- **AI Response Formatting Overhaul**: Completely redesigned AI prompt system with `ENHANCED_RESPONSE_INSTRUCTION` to eliminate placeholders and provide specific, actionable responses. Updated `features/checklist/promptEnhancer.ts` and `HollyChatScreen.tsx`.
- **Server Dependencies Update**: Upgraded Express (v4.18.2→v4.21.2), @types/express (v4.17.21→v4.17.23), @types/node (v20.10.5→v24.3.0), Zod (v3.22.4→v4.1.5), and TypeScript (v5.3.3→v5.9.2).
- **Asset Path Resolution**: Fixed logo asset paths to match actual filenames (`odysync _logo.png` with space) across all components and configuration files.
- **Express Compatibility**: Resolved path-to-regexp compatibility issues by downgrading from Express v5 to stable v4.21.2.
- **Package.json Scripts**: Added `dev` script alias for `expo start` to improve developer experience.
- **Storage Key Migration**: Updated AsyncStorage keys from `triptick:` to `odeysync:` prefix for consistency.
- **Destination Data Integration**: Enhanced AI prompts with real-time destination information including currency, languages, transportation, and weather data.

## 🔄 Previous Updates (Aug 2025)

- Checklist contextualization: prompts now include trip purpose (`tripType` business/leisure), group size, dates, and destination facts. Implemented in `features/checklist/promptEnhancer.ts` and used by `HollyChatScreen`.
- Destination image resolver hardened: strict normalization, alias map (e.g., Abu Dhabi variants), and Levenshtein-based fuzzy matching; removed partial substring matches. Implemented in `utils/destinationImages.ts`.
- Archived Checklists: new `ChecklistArchiveScreen` with restore/delete; `tripStore` gains `archive(id)` and `restore(id)`; archived checklists hidden from active views.
- Destination typeahead and validation: `AddTimerScreen` suggests destinations while typing and uses `getDestinationInfo` for “Did you mean X?” corrections.
- UI/Theming: improved contrast for date/time picker (`DateTimeSelector`) and fixed duplicate seed send in chat.
- Data model: `Timer` supports `tripType?: 'business' | 'leisure'` persisted via `useHolidayStore` and editable in `EditTimerModal`.

## 📖 Overview

### What is Odeysync?

Odeysync is a comprehensive travel planning application designed to help users organize and manage their trips efficiently. The app combines trip planning tools, checklists, countdown timers, and AI-powered assistance to create a seamless travel planning experience.

### Core Mission

**"Make travel planning effortless and enjoyable by providing intelligent tools that adapt to each traveler's needs."**

### Target Audience

- **Primary:** Frequent travelers, families planning vacations, business travelers
- **Secondary:** First-time travelers, group organizers, travel enthusiasts

### Key Value Propositions

1. **Intelligent Planning:** AI-powered travel assistant (Holly Bobz) provides personalized recommendations
2. **Comprehensive Organization:** All-in-one solution for trips, checklists, and reminders
3. **Local-First Design:** Privacy-focused with local data storage
4. **Cross-Platform:** Native mobile experience on iOS and Android
5. **Gamification:** Achievement system and progress tracking

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Expo Framework│    │   Native iOS/   │
│   Application   │◄──►│   (Managed)     │◄──►│   Android       │
│                 │    │                 │    │   Modules       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   State Mgmt    │    │   Navigation    │    │   Hybrid        │
│   (Zustand)     │    │   (React Nav)   │    │   Storage       │
│                 │    │                 │    │   (MMKV+Secure) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Paywall &     │    │   AI Proxy      │    │   Analytics &   │
│   Entitlements  │    │   Server        │    │   Monitoring    │
│   (RevenueCat)  │    │   (Express)     │    │   (Sentry+PH)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Profile  │    │   Trip Data     │    │   Usage Quota   │
│   Management    │    │   Storage       │    │   & Limits      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Application Layers

1. **Presentation Layer**
   - React Native components
   - UI/UX components
   - Navigation screens
   - Paywall components
   - Error boundaries

2. **Business Logic Layer**
   - State management (Zustand)
   - Entitlement management
   - AI quota tracking
   - Business rules and validation

3. **Data Access Layer**
   - Hybrid storage system (MMKV + SecureStore)
   - User profile management
   - Trip data persistence
   - Migration system

4. **Integration Layer**
   - AI proxy server
   - RevenueCat subscriptions
   - Third-party services (Calendar, Camera)
   - Analytics and monitoring

5. **Server Layer** (New)
   - Express.js API server
   - AI provider management
   - Usage quota enforcement
   - Secure API key management

---

## 🛠️ Technology Stack

### Core Framework
- **React Native 0.79.5** - Cross-platform mobile development
- **React 19.0.0** - Latest React with concurrent features
- **Expo SDK 53.0.22** - Managed React Native workflow
- **TypeScript 5.9.2** - Type-safe development (updated from 5.8+)

### Navigation & Routing
- **@react-navigation/native 7.1.6** - Navigation framework
- **@react-navigation/native-stack 7.3.2** - Stack navigation
- **@react-navigation/bottom-tabs 7.3.10** - Bottom tab navigation

### State Management
- **Zustand 5.0.4** - Lightweight state management
- **AsyncStorage** - Local data persistence with odeysync: key prefix
- **React Context** - Theme and configuration
- **MMKV** - High-performance encrypted storage

### UI & Styling
- **@shopify/restyle 2.4.5** - Type-safe styling system
- **@expo/vector-icons 14.1.0** - Icon library
- **React Native Reanimated 3.17.4** - Advanced animations
- **NativeWind 4.1.23** - Tailwind CSS for React Native
- **Custom Theme System** - Consistent dark/light theme support
- **Typography System** - Questrial font family with weight variations (400, 500, 600, 700) for visual hierarchy

### Typography System Architecture

#### Font Family Strategy
Odeysync uses a **single font family approach** with Questrial for optimal performance and consistency:

```typescript
// Font Family Hierarchy
const typography = {
  // Primary Font: Questrial
  fontFamily: 'Questrial',
  
  // Weight Variations for Visual Hierarchy
  weights: {
    regular: '400',    // Body text, labels
    medium: '500',     // Secondary headings, buttons
    semiBold: '600',   // Primary headings, important text
    bold: '700',       // Strong emphasis, titles
  }
};
```

#### Platform-Specific Font Loading
```typescript
// src/hooks/useFonts.ts - Platform-optimized font loading
export function useFonts() {
  if (Platform.OS === 'web') {
    // Web: CSS @font-face declarations
    return { fontsLoaded: true, fontError: null };
  } else {
    // Native: expo-font loading
    const [fontsLoaded, fontError] = useExpoFonts({
      'Questrial': require('../../assets/fonts/Questrial/Questrial-Regular.ttf'),
    });
    return { fontsLoaded, fontError };
  }
}
```

#### Global CSS Font Declarations
```css
/* global.css - Web font declarations */
@font-face {
  font-family: 'Questrial';
  src: url('/assets/fonts/Questrial/Questrial-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Questrial';
  src: url('/assets/fonts/Questrial/Questrial-Regular.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
```

#### Component Typography Implementation
```typescript
// Consistent typography across all components
const TextComponent = ({ variant = 'body', children }) => {
  const typographyStyles = {
    body: { fontFamily: 'Questrial', fontWeight: '400' },
    medium: { fontFamily: 'Questrial', fontWeight: '500' },
    heading: { fontFamily: 'Questrial', fontWeight: '600' },
    title: { fontFamily: 'Questrial', fontWeight: '700' },
  };

  return (
    <Text style={typographyStyles[variant]}>
      {children}
    </Text>
  );
};
```

#### Benefits of Single Font Family Approach
1. **Performance**: Reduced font loading overhead
2. **Consistency**: Uniform appearance across all platforms
3. **Maintainability**: Single source of truth for typography
4. **Bundle Size**: Smaller asset footprint
5. **User Experience**: Consistent visual hierarchy

### Development Tools
- **Expo CLI** - Development and build tools
- **ESLint 9.25.0** - Code linting
- **Prettier** - Code formatting
- **TypeScript 5.9.2** - Advanced type checking
- **Babel 7.25.2** - JavaScript transpilation

### Backend & Server
- **Node.js 24.3.0** - Latest server runtime (updated from 18+)
- **Express.js 4.21.2** - Stable web framework (v4, not v5)
- **TypeScript 5.9.2** - Server-side type safety
- **CORS 2.8.5** - Cross-origin resource sharing
- **Zod 4.1.5** - Runtime type validation (updated from v3)

### Monetization & Analytics
- **RevenueCat** - Subscription management
- **Sentry** - Error tracking and monitoring
- **PostHog** - Product analytics
- **SecureStore** - Encrypted sensitive data storage

### Storage & Performance
- **MMKV** - High-performance local storage
- **SecureStore** - Encrypted sensitive data (when available)
- **AsyncStorage Adapter** - Safe wrapper with method guards
- **Storage Guards** - Fallback mechanisms for missing methods

### External Integrations

#### Server-Side Integrations
- **AI Proxy Server** - Secure AI API management with cost optimization
- **AI Provider APIs**:
  - OpenAI (GPT-4, GPT-3.5-turbo)
  - DeepSeek (deepseek-chat)
  - Grok (grok-1)
  - Anthropic (Claude)
- **Cost Optimization** - Cheapest-first provider selection
- **Usage Tracking** - Monthly quota enforcement

#### Client-Side Integrations
- **RevenueCat** - Subscription management and payments
- **Expo Calendar** - Calendar integration with permissions
- **Expo Image Picker** - Photo management with SecureStore
- **Expo Notifications** - Push notifications with scheduling
- **Expo SecureStore** - Encrypted sensitive data storage
- **MMKV** - High-performance local storage
- **Expo Camera** - Camera integration for profile photos
- **Expo Location** - Location services for trip planning

#### Analytics & Monitoring
- **PostHog** - Product analytics and user tracking
- **Sentry** - Error tracking and crash reporting
- **Custom Analytics** - App usage, conversion funnel tracking

#### Third-Party Services
- **Calendar Permissions** - iOS/Android permission handling
- **Device Storage** - Secure encrypted local storage
- **Push Notifications** - Scheduled trip reminders
- **Image Processing** - Profile photo management

---

## 📁 Project Structure

```
src/
├── api/                 # API integrations and services
│   ├── purchases.ts     # RevenueCat subscription management
│   ├── chat-service.ts  # AI service with proxy integration
│   ├── deepseek.ts      # Deepseek AI client
│   ├── openai.ts        # OpenAI client
│   ├── grok.ts          # Grok AI client
│   ├── airports.ts      # Airport schedule and flight search APIs
│   ├── flights.ts       # Flight resolution and status lookup APIs
│   ├── ingest.ts        # Itinerary ingestion and processing APIs
│   └── ...
├── components/          # Reusable UI components
│   ├── ui/              # Basic UI elements (Text, Button, etc.)
│   ├── PaywallModal.tsx # Subscription paywall modal
│   ├── ErrorBoundary.tsx # Error handling component
│   ├── BurgerMenu.tsx   # Navigation menu
│   └── ...
├── screens/             # Application screens
│   ├── HomeScreen.tsx   # Main dashboard
│   ├── TripsScreen.tsx  # Trip management
│   ├── ProfileScreen.tsx # User profile
│   ├── PaywallScreen.tsx # Subscription marketing screen
│   ├── HollyChatScreen.tsx # AI assistant with quota gates
│   └── ...
├── navigation/          # Navigation configuration
│   ├── AppNavigator.tsx # Main navigation setup with paywall routes
│   └── types.ts         # Navigation type definitions
├── store/               # State management
│   ├── useHolidayStore.ts # Trip data store
│   ├── useThemeStore.ts # Theme management
│   └── ...
├── config/             # Environment and configuration
│   └── env.ts          # API_BASE_URL configuration with LAN fallback
├── lib/                 # Business logic and utilities
│   ├── userStorage.ts   # User data management
│   ├── tripStore.ts     # Trip operations
│   ├── storage.ts       # Safe AsyncStorage adapter with guards
│   ├── calendarGuard.ts # Calendar permissions and integration
│   ├── monitoring.ts    # Analytics and error tracking
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useEntitlements.ts # Subscription entitlement management
│   ├── useAIQuota.ts    # AI usage quota tracking
│   ├── useFonts.ts      # Font loading
│   ├── useTheme.ts      # Theme utilities
│   └── ...
├── utils/               # Utility functions
│   ├── destinationImages.ts # Image management
│   ├── fonts.ts         # Font utilities
│   ├── notifications.ts # Notification helpers
│   ├── anonymousId.ts   # Anonymous user ID generation and storage
│   └── ...
├── entities/            # Data models and types
│   ├── userProfile.ts   # User data structure
│   ├── trip.ts          # Trip data structure
│   └── ...
├── features/            # Feature-specific modules
│   ├── checklist/       # Checklist functionality
│   ├── countdown/       # Timer features
│   └── ...
└── constants/           # Application constants
    ├── colors.ts        # Color palette
    ├── themes.ts        # Theme definitions
    └── ...

server/                  # Backend AI proxy server
├── index.ts            # Express server entry point
├── package.json        # Server dependencies
├── tsconfig.json       # TypeScript configuration
├── router/
│   ├── aiProxy.ts      # AI proxy endpoint with provider selection
│   └── usage.ts        # Usage tracking and quota management
└── ai/
    ├── providerRouter.ts # Cheapest-first AI provider selection
    └── adapters/
        ├── openai.ts   # OpenAI API adapter
        ├── deepseek.ts # Deepseek API adapter
        └── grok.ts     # Grok API adapter
```

---

## 💾 Data Architecture

### Data Storage Strategy

Odeysync uses a **safe AsyncStorage adapter** with guards and fallbacks for reliable local persistence:

#### Client-Side Storage (Safe Adapter System)
```
Data Storage Hierarchy:
├── Safe AsyncStorage Adapter (src/lib/storage.ts)
│   ├── Method Guards: getItem, setItem, removeItem, getAllKeys
│   ├── Fallback Mechanisms: Graceful degradation when methods unavailable
│   ├── Migration Support: Optional migration from legacy AsyncStorage
│   └── Error Recovery: Comprehensive error handling and logging
├── User Profile Storage
│   ├── Basic Info (name, email, avatar)
│   ├── Preferences (checklist view, notifications)
│   ├── Statistics (trips created, checklists completed)
│   └── Data References (trip IDs, checklist IDs)
├── Trip Data Storage
│   ├── Trip Details (destination, dates, group size)
│   ├── Itinerary (activities, locations)
│   └── Status (active, completed, archived)
├── Checklists Storage
│   ├── Trip Checklists (pre-trip, during-trip, post-trip)
│   ├── Custom Checklists (user-created)
│   └── Progress Tracking (completion status)
└── App Settings Storage
    ├── Theme (light/dark mode)
    ├── Notifications (enabled/disabled)
    ├── Entitlements (subscription status)
    └── Feature Flags (experimental features)
```

#### Server-Side Storage (In-Memory with Persistence)
```
Server Data Hierarchy:
├── Usage Quota (In-Memory Map)
│   ├── User Monthly Limits (userId:month → count)
│   ├── Free Tier (15 messages/month)
│   ├── Pro Tier (200 messages/month)
│   └── Trial Period (7 days free)
├── AI Provider Metrics
│   ├── Cost Tracking (per provider, per request)
│   ├── Usage Statistics (success/failure rates)
│   └── Performance Metrics (response times)
└── Security & Audit
    ├── API Key Validation
    ├── Request Logging (anonymized)
    └── Rate Limiting Data
```

### Data Models

#### UserProfile Entity (Updated with Subscriptions)
```typescript
interface UserProfile {
  // Basic profile info
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;

  // Local preferences
  preferences: UserPreferences;

  // Statistics (enhanced)
  stats: {
    tripsCreated: number;
    checklistsCompleted: number;
    itemsChecked: number;
    lastActivity: string;
    joinedDate: string;
    aiMessagesSent: number; // New: AI usage tracking
    subscriptionTier: 'free' | 'pro' | 'trial'; // New: Subscription status
  };

  // Subscription data (new)
  subscription?: {
    revenueCatId?: string;
    isActive: boolean;
    tier: 'free' | 'pro' | 'trial';
    trialEndsAt?: string;
    lastPaymentAt?: string;
    cancelAtPeriodEnd?: boolean;
  };

  // Data organization
  data: {
    trips: string[]; // Array of trip IDs
    checklists: string[]; // Array of checklist IDs
    lastSync?: string;
    version: string;
    monthlyUsage: { // New: Usage tracking
      aiMessages: number;
      lastReset: string;
    };
  };
}
```

#### Subscription & Entitlement Entities (New)
```typescript
interface SubscriptionInfo {
  id: string;
  userId: string;
  tier: 'free' | 'pro' | 'trial';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  revenueCatId?: string;
}

interface EntitlementState {
  hasPro: boolean;
  isTrialing: boolean;
  trialDaysLeft?: number;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'none';
  limits: {
    aiMessages: number; // Monthly limit
    trips: number; // Trip creation limit
  };
}
```

#### AI Usage & Quota Entities (New)
```typescript
interface AIUsageRecord {
  userId: string;
  monthKey: string; // YYYY-MM format
  messageCount: number;
  lastMessageAt: string;
  providerUsage: {
    openai: number;
    deepseek: number;
    grok: number;
  };
}

interface QuotaLimits {
  free: {
    aiMessages: number; // 15
    trips: number; // 1
  };
  pro: {
    aiMessages: number; // 200
    trips: number; // unlimited
  };
  trial: {
    aiMessages: number; // 200 (during trial)
    trips: number; // 3 (during trial)
    durationDays: number; // 7
  };
}
```

### Data Flow (Updated)

#### Client-Side Data Flow
```
User Action → Component → State Store → Hybrid Storage (MMKV/SecureStore)
                      ↓                    ↓
               UI Updates ← Data Retrieval ← Migration System
```

#### AI Request Flow (New)
```
User Message → Entitlement Check → Quota Validation → AI Proxy Server
    ↓                ↓                    ↓                ↓
Paywall Modal ← Usage Tracking ← Provider Selection ← Response Processing
    ↓                ↓                    ↓                ↓
Analytics ← Error Handling ← Cost Optimization ← UI Update
```

#### Subscription Flow (New)
```
Purchase Request → RevenueCat → Entitlement Update → Client Sync
    ↓                ↓                ↓                ↓
Payment Processing ← Trial Activation ← Feature Unlock ← UI Refresh
    ↓                ↓                ↓                ↓
Analytics ← Error Handling ← State Persistence ← User Notification
```

---

## 🎯 Key Features

### 1. Trip Management
- **Create & Edit Trips:** Full CRUD operations for trip planning
- **Countdown Timers:** Visual countdown to trip departure
- **Trip Archive:** Historical trip data and analytics
- **Subscription Gating:** Free tier limited to 1 trip

### 2. Intelligent Planning
- **Holly Bobz AI Assistant:** Conversational travel planning with enhanced response formatting
- **Specific Recommendations:** Real venue names, addresses, and transportation options (no placeholders)
- **Enhanced Prompt System:** `ENHANCED_RESPONSE_INSTRUCTION` provides structured, actionable responses
- **Destination Integration:** Real-time destination data (currency, languages, transport, weather)
- **Dynamic Checklists:** Context-aware task management with JSON parsing
- **Usage Tracking:** Monthly limits with upgrade prompts
- **Multi-Provider AI:** Cost-optimized routing between Deepseek, OpenAI, and Grok

### 3. Organization Tools
- **Custom Checklists:** User-created and template-based
- **Progress Tracking:** Visual completion indicators
- **Category Management:** Organized by trip phase
- **Premium Features:** Advanced organization tools

### 4. User Experience
- **Dark/Light Themes:** Adaptive UI design
- **Offline-First:** Works without internet connection
- **Cross-Platform:** Consistent experience on iOS/Android
- **Paywall Integration:** Seamless upgrade experience

### 5. Privacy & Security
- **Hybrid Storage:** Secure encryption for sensitive data
- **Server-Side AI:** API keys never stored on device
- **Permission Management:** Granular control over device access
- **Data Export:** User-controlled data portability

### 6. Monetization & Analytics (New)
- **RevenueCat Integration:** Subscription management
- **Trial System:** 7-day free trial period
- **Usage Quotas:** Tier-based feature limits
- **Analytics Tracking:** PostHog event tracking
- **Error Monitoring:** Sentry crash reporting

---

## 👥 User Flows

### Primary User Journey

#### Free Tier User Flow
```
New User Onboarding
    ↓
Profile Setup → Theme Selection → Feature Introduction
    ↓
First Trip Creation (Free) → Destination Selection → Date Planning
    ↓
Checklist Generation → Limited AI Chat (15/month) → Customization
    ↓
Usage Limit Reached → Paywall Prompt → Trial Activation
    ↓
Full Feature Access → Pre-Trip Preparation → Travel Execution
    ↓
Post-Trip Review → Archive → Upgrade Consideration
```

#### Premium User Flow
```
Subscription Activation (Trial/Pro)
    ↓
Unlimited Trip Creation → Advanced AI Chat (200/month)
    ↓
Premium Features → Calendar Integration → Analytics
    ↓
Full App Access → Enhanced Planning → Seamless Travel
    ↓
Subscription Management → Usage Tracking → Continued Access
```

### Detailed Flows

#### Trip Planning Flow
1. **Access Home Screen** → View existing trips or create new
2. **Create New Trip** → Check subscription status
3. **Free User Check** → If first trip: proceed | If second trip: show paywall
4. **AI Consultation** → Chat with Holly Bobz (quota validation)
5. **Quota Exceeded** → Show paywall modal with upgrade option
6. **Generate Checklist** → Automated or custom checklist creation
7. **Set Reminders** → Calendar integration (premium feature)
8. **Monitor Progress** → Track completion and countdown

#### AI Chat Flow (Updated)
1. **Open Chat** → Check entitlement status and usage quota
2. **Free User** → Limited to 15 messages/month
3. **Quota Check** → If exceeded: show paywall | If available: proceed
4. **Send Message** → Route through AI proxy server
5. **Usage Tracking** → Increment monthly counter
6. **Response Processing** → Display AI response with cost tracking
7. **Limit Warning** → Show upgrade prompt near limit

#### Subscription Flow (New)
1. **Usage Limit Reached** → Display paywall modal
2. **Trial Activation** → Start 7-day free trial
3. **Purchase Flow** → RevenueCat subscription purchase
4. **Entitlement Sync** → Update client-side permissions
5. **Feature Unlock** → Enable premium features immediately
6. **Usage Reset** → Clear monthly counters for pro users

#### Profile Management Flow (Updated)
1. **Access Profile** → View current profile and subscription status
2. **Update Preferences** → Modify checklist view, notifications
3. **Manage Avatar** → Upload or change profile photo (premium feature)
4. **View Statistics** → Review trip history, AI usage, achievements
5. **Subscription Management** → View current plan, usage, billing
6. **Upgrade/Downgrade** → Manage subscription through RevenueCat

---

## 🧩 Components Architecture

### UI Component Hierarchy

```
App (Root)
├── NavigationContainer
│   ├── TabNavigator
│   │   ├── HomeTab → HomeStack
│   │   ├── TripsTab → TripsStack
│   │   ├── ChatTab → ChatStack
│   │   └── ProfileTab → ProfileStack
│   └── ErrorBoundary (Global Error Handling)
```

### Core Components

#### Layout Components
- **ScreenContainer:** Standard screen wrapper with padding
- **SectionContainer:** Content sections with consistent styling
- **CardContainer:** Elevated content containers

#### Interactive Components
- **TripCard:** Trip display with countdown and actions
- **ChecklistItem:** Interactive checklist entries
- **ActionButton:** Primary and secondary action buttons

#### Form Components
- **TextInput:** Styled input fields
- **DatePicker:** Trip date selection
- **ImagePicker:** Profile photo management

#### Feedback Components
- **LoadingSpinner:** Async operation indicators
- **Toast:** Temporary status messages
- **Modal:** Overlay dialogs and confirmations

### Component Patterns

#### Container/Presentational Pattern
```typescript
// Container Component (Logic)
function TripCardContainer({ tripId }) {
  const trip = useTripStore(state => state.getTrip(tripId));
  const actions = useTripActions();

  return <TripCard trip={trip} onEdit={actions.editTrip} />;
}

// Presentational Component (UI)
function TripCard({ trip, onEdit }) {
  return (
    <Card onPress={onEdit}>
      <Text>{trip.destination}</Text>
      <CountdownTimer date={trip.startDate} />
    </Card>
  );
}
```

#### Paywall Integration Pattern (New)
```typescript
// Paywall-Aware Component
function PremiumFeature({ children, fallback }) {
  const { hasPro, loading } = useEntitlements();

  if (loading) return <LoadingSpinner />;

  if (!hasPro) {
    return (
      <PaywallModal
        visible={true}
        onClose={() => setShowPaywall(false)}
        onPurchased={() => setHasPro(true)}
      >
        {fallback || <Text>Upgrade to access this feature</Text>}
      </PaywallModal>
    );
  }

  return children;
}

// Usage
<PremiumFeature fallback={<Text>Premium feature preview</Text>}>
  <AdvancedAnalytics />
</PremiumFeature>
```

#### Trip Actions UI Pattern (New)
```typescript
// Trip Actions Card Component
function TripActionsCard({ tripId, hasFlight }) {
  const { hasPro } = useEntitlements();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleFlightAction = () => {
    if (hasPro) {
      setShowFlightLookup(true);
    } else {
      setShowPaywall(true);
    }
  };

  const handleItineraryAction = () => {
    if (hasPro) {
      // Open itinerary upload modal
      Alert.alert('Coming Soon', 'Itinerary upload feature will be available soon!');
    } else {
      setShowPaywall(true);
    }
  };

  const handleScheduleAction = () => {
    if (hasPro) {
      // Open airport schedule modal
      Alert.alert('Coming Soon', 'Airport schedule feature will be available soon!');
    } else {
      setShowPaywall(true);
    }
  };

  return (
    <View style={styles.actionsCard}>
      <View style={styles.header}>
        <Ionicons name="add-circle" size={22} color={theme.colors.primary} />
        <Text variant="md" fontWeight="semibold">Trip Actions</Text>
      </View>

      <View style={styles.actions}>
        {/* Add Flight Button */}
        <Pressable onPress={handleFlightAction} style={styles.actionButton}>
          <Ionicons 
            name="airplane" 
            size={20} 
            color={hasPro ? theme.colors.primary : theme.colors.textMuted} 
          />
          <View style={styles.actionContent}>
            <Text variant="sm" fontWeight="medium">Add Flight</Text>
            <Text variant="xs" color="textMuted">
              {hasPro ? 'Resolve flight details by number and date' : 'Premium feature - upgrade to add flights'}
            </Text>
          </View>
          {!hasPro && <Ionicons name="lock-closed" size={16} color={theme.colors.textMuted} />}
        </Pressable>

        {/* Upload Itinerary Button */}
        <Pressable onPress={handleItineraryAction} style={styles.actionButton}>
          <Ionicons 
            name="document-text" 
            size={20} 
            color={hasPro ? theme.colors.primary : theme.colors.textMuted} 
          />
          <View style={styles.actionContent}>
            <Text variant="sm" fontWeight="medium">Upload Itinerary</Text>
            <Text variant="xs" color="textMuted">
              {hasPro ? 'Extract flights and hotels from documents' : 'Premium feature - upgrade to upload itineraries'}
            </Text>
          </View>
          {!hasPro && <Ionicons name="lock-closed" size={16} color={theme.colors.textMuted} />}
        </Pressable>

        {/* Airport Schedule Button - Only show if there's a flight */}
        {hasFlight && (
          <Pressable onPress={handleScheduleAction} style={styles.actionButton}>
            <Ionicons 
              name="time" 
              size={20} 
              color={hasPro ? theme.colors.primary : theme.colors.textMuted} 
            />
            <View style={styles.actionContent}>
              <Text variant="sm" fontWeight="medium">Airport Schedule</Text>
              <Text variant="xs" color="textMuted">
                {hasPro ? 'View arrivals and departures for departure airport' : 'Premium feature - upgrade to view schedules'}
              </Text>
            </View>
            {!hasPro && <Ionicons name="lock-closed" size={16} color={theme.colors.textMuted} />}
          </Pressable>
        )}
      </View>
    </View>
  );
}
```

#### Quota-Aware Component Pattern (New)
```typescript
// AI Chat with Quota Management
function AIChat() {
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSendMessage = async (message: string) => {
    const quotaCheck = await checkAndIncrementAI({
      hasPro: false,
      userId: 'user123'
    });

    if (!quotaCheck.ok) {
      Analytics.track('paywall_shown', { reason: 'ai_limit_reached' });
      setShowPaywall(true);
      return;
    }

    // Proceed with AI request
    const response = await sendAIThroughProxy([{
      role: 'user',
      content: message
    }]);

    // Handle response...
  };

  return (
    <>
      <ChatInterface onSend={handleSendMessage} />
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchased={() => setShowPaywall(false)}
      />
    </>
  );
}
```

---

## 🔄 State Management

### Zustand Store Architecture

#### Holiday Store (Main Trip Data)
```typescript
// Holiday Store (Main Trip Data)
interface HolidayState {
  // State
  timers: Trip[];
  archivedTimers: Trip[];
  settings: {
    reduceMotion: boolean;
  };
  isHydrated: boolean;

  // Actions
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  archiveTrip: (id: string) => void;
  restoreTrip: (id: string) => void;
  deleteTrip: (id: string) => Promise<void>;
  purgeArchive: () => Promise<void>;
  // Gamification actions
  checkIn: (tripId: string) => void;
  awardXP: (tripId: string, amount: number) => void;
  grantBadge: (tripId: string, badgeId: string) => void;
  completeQuest: (tripId: string, questId: string) => void;
  hydrate: () => Promise<void>;
}

// Theme Store (UI State)
interface ThemeState {
  isDark: boolean;
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'light' | 'dark') => void;
}
```

#### Entitlement Store (New)
```typescript
// Entitlement Store - Subscription Management
interface EntitlementState {
  // State
  hasPro: boolean;
  isTrialing: boolean;
  trialDaysLeft: number;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'none';
  lastChecked: string;

  // Actions
  checkEntitlements: () => Promise<void>;
  refreshEntitlements: () => Promise<void>;
  updateTrialStatus: (daysLeft: number) => void;
  setProStatus: (hasPro: boolean) => void;
}
```

#### AI Quota Store (New)
```typescript
// AI Quota Store - Usage Tracking
interface AIQuotaState {
  // State
  monthlyUsage: {
    messages: number;
    limit: number;
    resetDate: string;
  };
  lastChecked: string;

  // Actions
  checkQuota: (userId: string) => Promise<{ allowed: boolean; used: number; limit: number }>;
  incrementUsage: (userId: string) => Promise<boolean>;
  resetMonthlyUsage: () => void;
  refreshQuota: (userId: string) => Promise<void>;
}
```

### State Flow

```
User Interaction → Component → Action Dispatch → Store Update → UI Re-render
                      ↓
               Persistence Layer → AsyncStorage
```

### Data Persistence Strategy

1. **Immediate Persistence:** Critical data saved immediately
2. **Batch Updates:** Non-critical updates batched for performance
3. **Migration Support:** Version-based data migration
4. **Error Recovery:** Graceful handling of storage failures

---

## 🔗 External Integrations

### AI Services Integration

```typescript
interface AIService {
  generateResponse(prompt: string, context: TripContext): Promise<string>;
  getRecommendations(destination: string, preferences: UserPreferences): Promise<Recommendation[]>;
}

// Supported AI Providers
const aiProviders = {
  openai: OpenAIService,
  grok: GrokService,
  deepseek: DeepSeekService,
};
```

### Calendar Integration

```typescript
interface CalendarService {
  requestPermissions(): Promise<PermissionStatus>;
  createEvent(event: CalendarEvent): Promise<string>;
  getEvents(dateRange: DateRange): Promise<CalendarEvent[]>;
}
```

### Image Management

```typescript
interface ImageService {
  pickFromGallery(): Promise<ImageAsset>;
  takePhoto(): Promise<ImageAsset>;
  processImage(uri: string): Promise<ProcessedImage>;
}
```

### Notification System

```typescript
interface NotificationService {
  scheduleTripReminder(trip: Trip): Promise<string>;
  cancelReminder(id: string): Promise<void>;
  getPendingReminders(): Promise<Reminder[]>;
}
```

---

## 📋 Development Guidelines

### Code Organization

#### File Naming Convention
- **Components:** `ComponentName.tsx`
- **Screens:** `ScreenName.tsx`
- **Utils:** `utilityName.ts`
- **Types:** `entityName.ts`
- **Stores:** `useStoreName.ts`
- **API:** `serviceName.ts`
- **Hooks:** `useHookName.ts`
- **Server:** `endpointName.ts`

#### Component Structure (Enhanced)
```typescript
// 1. Imports (React, external libraries, internal modules)
// 2. Type definitions and interfaces
// 3. Custom hooks for state management
// 4. Component definition with error boundaries
// 5. Export statement

import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useEntitlements } from '../hooks/useEntitlements';
import { Analytics } from '../lib/monitoring';

type Props = {
  title: string;
  onPress: () => void;
  premium?: boolean;
};

export function CustomButton({ title, onPress, premium = false }: Props) {
  const { hasPro } = useEntitlements();
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    try {
      setLoading(true);

      // Check entitlements for premium features
      if (premium && !hasPro) {
        Analytics.track('paywall_shown', { feature: 'custom_button' });
        // Show paywall
        return;
      }

      await onPress();
      Analytics.track('button_pressed', { button: title });
    } catch (error) {
      Analytics.error(error as Error, 'button_press');
    } finally {
      setLoading(false);
    }
  }, [onPress, hasPro, title]);

  return (
    <TouchableOpacity onPress={handlePress} disabled={loading}>
      <Text>{title}</Text>
      {premium && !hasPro && <PremiumBadge />}
    </TouchableOpacity>
  );
}
```

#### Server File Structure
```typescript
// server/router/aiProxy.ts
import { Router } from "express";
import { z } from "zod";
import { dispatchWithCheapestFirst } from "../ai/providerRouter";

const aiProxySchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string()
  })),
  model: z.string().optional(),
  // ... validation schema
});

export const aiProxy = Router().post("/ai-proxy", async (req, res) => {
  try {
    const parsed = aiProxySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const result = await dispatchWithCheapestFirst(parsed.data);
    res.json(result);
  } catch (error) {
    console.error('AI Proxy Error:', error);
    res.status(502).json({ error: "AI service failed" });
  }
});
```

### State Management Guidelines

1. **Single Source of Truth:** Each data entity has one store
2. **Immutable Updates:** Always create new state objects
3. **Action-Based Updates:** Use actions for complex state changes
4. **Error Boundaries:** Wrap state updates in try-catch blocks
5. **Entitlement Checks:** Always verify user permissions before premium features
6. **Quota Management:** Check usage limits before API calls
7. **Optimistic Updates:** Update UI immediately, rollback on errors
8. **Analytics Integration:** Track all user interactions and state changes

#### Entitlement Pattern
```typescript
// Always check entitlements before premium features
const { hasPro, loading } = useEntitlements();

const handlePremiumAction = async () => {
  if (!hasPro) {
    Analytics.track('paywall_shown', { feature: 'premium_action' });
    setShowPaywall(true);
    return;
  }

  // Proceed with premium action
  await performPremiumAction();
};
```

#### Quota Management Pattern
```typescript
// Always check quotas before API calls
const quotaCheck = await checkAndIncrementAI({
  hasPro,
  userId: user.id
});

if (!quotaCheck.ok) {
  Analytics.track('paywall_shown', { reason: 'ai_limit_reached' });
  setShowPaywall(true);
  return;
}

// Proceed with AI request
const response = await sendAIThroughProxy(messages);
```

#### Error Handling Pattern
```typescript
// Consistent error handling with analytics
const handleAsyncAction = async () => {
  try {
    setLoading(true);
    const result = await asyncOperation();

    Analytics.track('action_success', { action: 'async_operation' });
    return result;
  } catch (error) {
    Analytics.error(error as Error, 'async_operation');
    showErrorToast(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Performance Best Practices

1. **Memoization:** Use `React.memo` for expensive components
2. **Callback Optimization:** Use `useCallback` for event handlers
3. **List Optimization:** Use `keyExtractor` and `memoization` for lists
4. **Image Optimization:** Compress and cache images appropriately

---

## 🚀 Deployment & Build Process

### Development Environment

#### Client Development
```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run ios
npm run android

# Run with specific configuration
npm start -- --clear
npm start -- --tunnel
```

#### Server Development
```bash
# Navigate to server directory
cd server

# Install server dependencies
npm install

# Start server in development mode
npm run dev

# Start server in production mode
npm run start

# Build server for production
npm run build
```

#### Environment Setup
```bash
# Copy environment files
cp .env.example .env

# Client environment variables
EXPO_PUBLIC_REVENUECAT_KEY=your_revenuecat_key
EXPO_PUBLIC_AI_PROXY_URL=http://localhost:3000
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
SENTRY_DSN=your_sentry_dsn

# Server environment variables
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
XAI_API_KEY=your_grok_key
PORT=3000
```

### Build Process

#### Development Builds
```bash
# iOS Development
eas build --platform ios --profile development

# Android Development
eas build --platform android --profile development
```

#### Production Builds
```bash
# iOS Production
eas build --platform ios --profile production

# Android Production
eas build --platform android --profile production
```

### Build Configuration (app.config.ts)

```typescript
export default {
  name: 'Odeysync',
  slug: 'odeysync',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/app-icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FF6B6B'
  },
  ios: {
    bundleIdentifier: 'com.appeningnow.odeysync',
    buildNumber: '1.0.0',
    infoPlist: {
      NSCalendarsUsageDescription: 'We use your calendar to show and add trip events.',
      NSRemindersUsageDescription: 'We use reminders so you can set trip checklists with alerts.',
      NSCameraUsageDescription: 'We need camera access to take profile photos.',
      NSPhotoLibraryUsageDescription: 'We need photo library access to select profile photos.'
    }
  },
  android: {
    package: 'com.appeningnow.odeysync',
    versionCode: 1,
    permissions: [
      'READ_CALENDAR',
      'WRITE_CALENDAR',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE'
    ]
  }
};
```

### Build Environment Setup (New)

#### Railway Server Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your Railway project
cd server
railway link

# Set environment variables
railway variables set DATABASE_URL="postgresql://username:password@host:port/database"
railway variables set AERODATABOX_RAPIDAPI_HOST="aerodatabox.p.rapidapi.com"
railway variables set AERODATABOX_RAPIDAPI_KEY="your-rapidapi-key-here"
railway variables set OPENAI_API_KEY="your-openai-key-here"
railway variables set DEEPSEEK_API_KEY="your-deepseek-key-here"
railway variables set XAI_API_KEY="your-xai-key-here"
railway variables set PORT="8787"
railway variables set NODE_ENV="production"

# Deploy to Railway
railway up

# Get your Railway service URL
railway status
```

#### EAS Mobile Build Setup
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Set EAS environment variables
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value "https://your-app.railway.app"
eas secret:create --scope project --name EXPO_PUBLIC_POSTHOG_KEY --value "your-posthog-key-here"
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_KEY --value "your-revenuecat-key-here"

# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production
eas build --platform all --profile production
```

#### Environment Variable Checklist
```bash
# Server (Railway)
- [ ] DATABASE_URL - PostgreSQL connection string
- [ ] AERODATABOX_RAPIDAPI_HOST - AeroDataBox API host
- [ ] AERODATABOX_RAPIDAPI_KEY - AeroDataBox API key
- [ ] PORT - Server port (default: 8787)
- [ ] NODE_ENV - Environment (production/development)

# Mobile App (EAS)
- [ ] EXPO_PUBLIC_API_BASE_URL - Your Railway service URL
- [ ] EXPO_PUBLIC_POSTHOG_KEY - PostHog analytics key (optional)
- [ ] EXPO_PUBLIC_REVENUECAT_KEY - RevenueCat key (optional)
```

#### Quick Deployment Commands
```bash
# Server deployment
cd server
railway up

# Mobile build
eas build --platform all --profile production

# Check build status
eas build:list
```

---

## 🔒 Security Considerations

### Enhanced Data Privacy & Security

#### Production Security Architecture
1. **Runtime Guards:** Automatic security checks prevent insecure HTTP connections in production builds
2. **Environment Validation:** Validates API endpoints and configuration at app startup
3. **Network Security:** Development mode allows HTTP, production mode enforces HTTPS only
4. **Telemetry Security:** Monitoring services only initialize in production with proper authentication
5. **Anonymous Tracking:** Secure anonymous ID generation for usage tracking without user authentication

#### Multi-Layer Privacy Protection
1. **Server-Side AI Processing:** AI keys never stored on device
2. **Hybrid Storage Security:** Sensitive data encrypted with SecureStore
3. **No Unnecessary Data Transmission:** Trip data remains local
4. **User Consent:** Explicit permission requests for all features
5. **Data Minimization:** Collect only essential data
6. **Right to Delete:** Users can delete all data instantly
7. **Anonymized Analytics:** User tracking without personal data

#### API Key Security Architecture
```typescript
// Server-side only - keys never exposed to client
const AI_KEYS = {
  openai: process.env.OPENAI_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
  grok: process.env.XAI_API_KEY,
};

// Client-side - proxy URL only (no keys)
const AI_PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL;

// Telemetry & Monitoring Security
export function initTelemetry({ dsn, posthogKey, appEnv, debug }: TelemetryOptions) {
  const isProd = appEnv === "production";

  if (dsn && isProd) {
    Sentry.init({
      dsn,
      enableInExpoDevelopment: false,
      debug: !!debug,
      tracesSampleRate: 1.0,
    });
  }

  if (posthogKey && isProd) {
    ph = new PostHog(posthogKey, {
      captureAppLifecycleEvents: true,
      captureDeepLinks: true,
      enable: true,
    });
  }
}

// Secure key validation
function validateApiKey(provider: string, key: string): boolean {
  if (!key || key.length < 20) return false;

  // Provider-specific validation
  switch (provider) {
    case 'openai': return key.startsWith('sk-');
    case 'deepseek': return key.startsWith('sk-');
    case 'grok': return key.startsWith('xai-');
    default: return false;
  }
}
```

#### Enhanced Permission Management
```typescript
// Secure permission handling with comprehensive fallbacks
async function requestCalendarPermission(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await Calendar.getCalendarPermissionsAsync();

    if (status === 'granted') {
      Analytics.track('permission_granted', { type: 'calendar' });
      return true;
    }

    if (status === 'denied' && !canAskAgain) {
      showSettingsRedirect();
      Analytics.track('permission_blocked', { type: 'calendar' });
      return false;
    }

    if (canAskAgain) {
      const { status: newStatus } = await Calendar.requestCalendarPermissionsAsync();
      const granted = newStatus === 'granted';
      Analytics.track(granted ? 'permission_granted' : 'permission_denied', {
        type: 'calendar'
      });
      return granted;
    }

    return false;
  } catch (error) {
    Analytics.error(error as Error, 'calendar_permission');
    return false;
  }
}

function showSettingsRedirect() {
  Alert.alert(
    'Permission Required',
    'Calendar access is needed for trip reminders. Please enable in device settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Settings',
        onPress: () => {
          Linking.openSettings();
          Analytics.track('settings_redirect', { type: 'calendar' });
        }
      }
    ]
  );
}
```

#### Safe AsyncStorage Adapter Security
```typescript
const storageAdapter = {
  // Safe AsyncStorage wrapper with method guards
  getItem: (key: string) => {
    const asyncStorage = require('@react-native-async-storage/async-storage');
    if (typeof asyncStorage?.getItem === 'function') {
      return asyncStorage.getItem(key);
    }
    console.warn('AsyncStorage.getItem not available, using fallback');
    return Promise.resolve(null);
  },

  setItem: (key: string, value: string) => {
    const asyncStorage = require('@react-native-async-storage/async-storage');
    if (typeof asyncStorage?.setItem === 'function') {
      return asyncStorage.setItem(key, value);
    }
    console.warn('AsyncStorage.setItem not available, using fallback');
    return Promise.resolve();
  },

  removeItem: (key: string) => {
    const asyncStorage = require('@react-native-async-storage/async-storage');
    if (typeof asyncStorage?.removeItem === 'function') {
      return asyncStorage.removeItem(key);
    }
    console.warn('AsyncStorage.removeItem not available, using fallback');
    return Promise.resolve();
  },

  getAllKeys: () => {
    const asyncStorage = require('@react-native-async-storage/async-storage');
    if (typeof asyncStorage?.getAllKeys === 'function') {
      return asyncStorage.getAllKeys();
    }
    console.warn('AsyncStorage.getAllKeys not available, using fallback');
    return Promise.resolve([]);
  },
};

// Optional migration from legacy storage
export const migrateFromAsyncStorage = async (legacy?: any) => {
  try {
    const legacyGet = legacy?.getItem;
    const legacyKeys = legacy?.getAllKeys;

    if (!legacyGet || !legacyKeys ||
        typeof legacyGet !== 'function' ||
        typeof legacyKeys !== 'function') {
      return false;
    }

    const keys = await legacyKeys();
    for (const key of keys) {
      const value = await legacyGet(key);
      if (value != null) {
        await storageAdapter.setItem(key, value);
      }
    }
    return true;
  } catch (error) {
    console.warn('Migration skipped:', error);
    return false;
  }
};
```

#### Server-Side Security Measures
```typescript
// Input validation with comprehensive Zod schemas
const aiProxySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(10000).refine((content) => {
      // Prevent injection attacks
      return !content.includes('<script') && !content.includes('javascript:');
    }),
  })).max(50), // Limit conversation length
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().max(4000).optional(),
  userId: z.string().uuid(),
});

// Rate limiting implementation
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // per window
  users: new Map<string, { count: number; resetTime: number }>(),

  check: (userId: string): boolean => {
    const now = Date.now();
    const user = rateLimiter.users.get(userId);

    if (!user || now > user.resetTime) {
      rateLimiter.users.set(userId, { count: 1, resetTime: now + rateLimiter.windowMs });
      return true;
    }

    if (user.count >= rateLimiter.maxRequests) {
      return false;
    }

    user.count++;
    return true;
  }
};

// Request sanitization
function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
}
```

### Comprehensive Security Best Practices

1. **Input Validation:** All inputs validated server-side with Zod schemas
2. **Rate Limiting:** API requests limited per user per time window
3. **Request Sanitization:** All user inputs sanitized to prevent injection
4. **Error Handling:** Errors logged without exposing sensitive information
5. **Secure Storage:** Multi-layer encryption for different data types
6. **API Key Rotation:** Secure key management with environment variables
7. **Audit Logging:** Server-side request logging for security monitoring
8. **HTTPS Only:** All external communications use secure protocols
9. **Dependency Scanning:** Regular security audits of all packages
10. **Data Encryption:** All sensitive data encrypted at rest and in transit

---

## 🗺️ Future Roadmap

### Phase 1: Core Enhancement (Current)
- [x] Basic trip planning functionality
- [x] AI assistant integration
- [x] Cross-platform compatibility
- [x] Local data storage
- [ ] Cloud backup (optional)
- [ ] Advanced trip analytics

### Phase 2: Advanced Features (Next 3-6 months)
- [ ] Travel itinerary import/export
- [ ] Group trip collaboration
- [ ] Offline map integration
- [ ] Travel expense tracking
- [ ] Flight and hotel booking integration

### Phase 3: Ecosystem Expansion (6-12 months)
- [ ] Travel community features
- [ ] Third-party integrations
- [ ] Advanced AI personalization
- [ ] Multi-language support
- [ ] Travel insurance integration

### Technical Improvements
- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Real-time synchronization
- [ ] Enhanced error handling
- [ ] Comprehensive testing suite

---

## 📞 Support & Documentation

### Developer Resources

- **Code Documentation:** Inline JSDoc comments
- **API Documentation:** TypeScript interfaces
- **Component Library:** Reusable component documentation
- **Architecture Decisions:** This document and inline comments

### Getting Started

1. **Clone Repository:** `git clone <repository-url>`
2. **Install Dependencies:** `npm install`
3. **Configure Environment:** Update `app.config.ts`
4. **Start Development:** `npm start`
5. **Run Tests:** `npm test`

### Key Contacts

- **Technical Lead:** [Contact Information]
- **Design Lead:** [Contact Information]
- **Product Owner:** [Contact Information]

---

## 📝 Change Log

### Version 1.0.0 (Current)
- Initial release with core trip planning features
- AI assistant integration (Holly Bobz)
- Cross-platform mobile application
- Local-first data architecture
- Comprehensive privacy and security features
- iOS build pipeline optimization
- TypeScript and dependency updates

### Version 0.9.0 (Pre-Release)
- Beta testing and user feedback integration
- Performance optimizations
- Bug fixes and stability improvements

---

## 🔧 Code Examples & Implementation Details

### Transform Style Fixes

#### Invalid Transform Pattern (Before)
```typescript
// ❌ WRONG: Single object with multiple properties
transform: [{
  translateY: slideAnim,
  scale: fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  })
}]
```

#### Fixed Transform Pattern (After)
```typescript
// ✅ CORRECT: Separate objects for each transform
transform: [
  { translateY: slideAnim },
  {
    scale: fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1]
    })
  }
]
```

#### Transform Fix Implementation
```typescript
// scripts/fixTransforms.ts - Automated codemod
function fixTransformInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  const transformMatches = content.match(/transform:\s*\[\s*\{([^}]+)\}\s*\]/g);

  for (const match of transformMatches) {
    const innerContent = match.match(/\{([^}]+)\}/)?.[1]?.trim();
    if (!innerContent) continue;

    const properties = innerContent.split(',').map(p => p.trim());
    if (properties.length <= 1) continue;

    // Split multi-property transforms into separate objects
    const splitProps = properties.map(prop => {
      const [key, ...valueParts] = prop.split(':');
      const value = valueParts.join(':').trim();
      return `{ ${key.trim()}: ${value} }`;
    });

    const newTransform = `transform: [${splitProps.join(', ')}]`;
    // Note: In actual implementation, this would use content.replace()
  }
}
```

### Typography System Implementation

#### Font Loading Hook (`src/hooks/useFonts.ts`)
```typescript
import React from 'react';
import { useFonts as useExpoFonts } from 'expo-font';
import { Platform } from 'react-native';

export function useFonts() {
  // Simplified: Use only Questrial variants for consistency
  const [fontsLoaded, fontError] = useExpoFonts(
    Platform.OS === 'web' ? {} : {
      'Questrial': require('../../assets/fonts/Questrial/Questrial-Regular.ttf'),
      'Questrial-Regular': require('../../assets/fonts/Questrial/Questrial-Regular.ttf'),
    }
  );

  // Handle font loading differently for web vs native
  if (Platform.OS === 'web') {
    // For web, we assume fonts are loaded via CSS @font-face
    React.useEffect(() => {
      const timer = setTimeout(() => {
        console.log('🌐 Web environment: Assuming fonts loaded via CSS');
      }, 100);
      return () => clearTimeout(timer);
    }, []);
    
    return { fontsLoaded: true, fontError: null };
  } else {
    // For native, use expo-font loading status
    if (fontError) {
      console.warn('❌ Font loading error:', fontError);
    }
    
    console.log('📱 Native font loading status:', { fontsLoaded, fontError });
    
    if (fontsLoaded) {
      console.log('✅ Native fonts loaded successfully');
    }
    
    return { fontsLoaded, fontError };
  }
}
```

#### Navigation Typography (`src/navigation/AppNavigator.tsx`)
```typescript
// Bottom tab navigation with consistent typography
<Tab.Navigator
  screenOptions={({ route }) => ({
    // ... other options
    tabBarLabelStyle: {
      fontSize: 12,
      fontFamily: 'Questrial',
      fontWeight: '400',
      fontStyle: 'normal',
    },
    tabBarStyle: {
      // ... other styles
      fontFamily: 'Questrial',
    },
    headerShown: false,
  })}
>
  {/* Tab screens */}
</Tab.Navigator>
```

#### Component Typography Examples
```typescript
// DateTimeSelector.tsx - Consistent font usage
<Text style={{
  fontSize: 18,
  fontFamily: 'Questrial',
  color: isDark ? '#FFFFFF' : '#333333',
  fontWeight: '600', // Semi-bold for headings
}}>
  {format(currentMonth, 'MMMM yyyy')}
</Text>

// ThemedButton.tsx - Button typography
<Text style={{
  fontSize: 16,
  fontFamily: 'Questrial',
  fontWeight: '600', // Semi-bold for buttons
  color: buttonTextColor,
}}>
  {title}
</Text>

// QuestCard.tsx - Card typography
<Text style={{
  fontSize: 14,
  fontFamily: 'Questrial',
  fontWeight: '500', // Medium for secondary text
  color: theme.colors.text,
}}>
  {description}
</Text>
```

#### Global CSS Typography (`global.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom font declarations - Simplified to Questrial only */
@font-face {
  font-family: 'Questrial';
  src: url('/assets/fonts/Questrial/Questrial-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* Questrial with different weights using CSS font-weight */
@font-face {
  font-family: 'Questrial';
  src: url('/assets/fonts/Questrial/Questrial-Regular.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
```

### Core State Management Implementation

#### Zustand Store Structure (`src/store/useHolidayStore.ts`)

```typescript
// Timer Entity Definition
export type Timer = {
  id: string;
  destination: string;
  date: string;      // ISO string
  createdAt: string; // ISO
  // Travel details
  adults: number;
  children: number;
  duration: number;  // Number of days
  // Gamification fields
  streak: number;
  xp: number;
  badges: string[];
  completedQuests: string[];
  lastCheckIn: string; // ISO string
};

// Store State Interface
type State = {
  timers: Timer[];
  archivedTimers: Timer[];
  settings: {
    reduceMotion: boolean;
  };
  isHydrated: boolean;
  // Actions
  addTimer: (input: AddInput) => void;
  updateTimer: (id: string, updates: Partial<Pick<Timer, 'destination' | 'date'>>) => Promise<void>;
  archiveTimer: (id: string) => void;
  removeTimer: (id: string) => Promise<void>;
  purgeArchive: () => Promise<void>;
  // Gamification actions
  checkIn: (timerId: string) => void;
  awardXP: (timerId: string, amount: number) => void;
  grantBadge: (timerId: string, badgeId: string) => void;
  completeQuest: (timerId: string, questId: string) => void;
  updateSettings: (settings: Partial<State['settings']>) => void;
  _hydrate: () => Promise<void>;
};

// Store Implementation with Persistence
export const useHolidayStore = create<State>((set, get) => ({
  timers: [],
  archivedTimers: [],
  settings: { reduceMotion: false },
  isHydrated: false,

  addTimer: (input) => {
    const newTimer = {
      id: makeId(),
      destination: input.destination.trim(),
      date: input.date,
      adults: input.adults,
      children: input.children,
      duration: input.duration,
      createdAt: new Date().toISOString(),
      // Initialize gamification fields
      streak: 0,
      xp: 0,
      badges: [],
      completedQuests: [],
      lastCheckIn: new Date().toISOString(),
    };

    set((s) => ({ timers: [...s.timers, newTimer] }));

    // Schedule notifications for the new timer
    scheduleHolidayNotifications(newTimer.id, newTimer.destination, newTimer.date)
      .catch((error) => console.error('Failed to schedule notifications:', error));
  },

  updateTimer: async (id, updates) => {
    // Cancel existing notifications
    await cancelHolidayNotifications(id);

    set((s) => {
      const timerIndex = s.timers.findIndex(t => t.id === id);
      if (timerIndex === -1) return s;

      const updatedTimer = { ...s.timers[timerIndex], ...updates };
      const newTimers = [...s.timers];
      newTimers[timerIndex] = updatedTimer;

      return { timers: newTimers };
    });

    // Reschedule notifications with updated data
    const updatedTimer = get().timers.find(t => t.id === id);
    if (updatedTimer) {
      await scheduleHolidayNotifications(updatedTimer.id, updatedTimer.destination, updatedTimer.date);
    }
  },

  // Persistence Layer
  _hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ isHydrated: true });
        return;
      }

      const parsed = JSON.parse(raw);
      const { timers, archivedTimers, settings } = parsed;

      // Data Migration Logic
      const migratedTimers = (timers ?? []).map((timer: any) => ({
        ...timer,
        adults: timer.adults ?? 1,
        children: timer.children ?? 0,
        duration: timer.duration ?? 7,
        streak: timer.streak ?? 0,
        xp: timer.xp ?? 0,
        badges: timer.badges ?? [],
        completedQuests: timer.completedQuests ?? [],
        lastCheckIn: timer.lastCheckIn ?? timer.createdAt ?? new Date().toISOString(),
      }));

      set({
        timers: migratedTimers,
        archivedTimers: migratedArchivedTimers,
        settings: settings ?? { reduceMotion: false },
        isHydrated: true
      });
    } catch (error) {
      console.error('Error during store hydration:', error);
      set({ isHydrated: true });
    }
  },
}));
```

### User Storage Manager Implementation

#### Singleton Pattern with AsyncStorage (`src/lib/userStorage.ts`)

```typescript
// Platform-specific storage helpers
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },

  async getAllKeys(): Promise<string[]> {
    if (Platform.OS === 'web') {
      return Object.keys(localStorage);
    }
    return AsyncStorage.getAllKeys();
  }
};

// Singleton UserStorageManager
export class UserStorageManager {
  private static instance: UserStorageManager;
  private userProfile: UserProfile | null = null;

  static getInstance(): UserStorageManager {
    if (!UserStorageManager.instance) {
      UserStorageManager.instance = new UserStorageManager();
    }
    return UserStorageManager.instance;
  }

  async initializeProfile(): Promise<UserProfile> {
    try {
      const profileData = await storage.getItem(STORAGE_KEYS.userProfile);

      if (profileData) {
        this.userProfile = JSON.parse(profileData);
        await this.migrateProfileIfNeeded();
      } else {
        this.userProfile = createDefaultUserProfile();
        await this.saveProfile();
        await this.migrateLegacyData();
      }

      return this.userProfile;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      this.userProfile = createDefaultUserProfile();
      await this.saveProfile();
      return this.userProfile;
    }
  }

  async getProfile(): Promise<UserProfile> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }
    return this.userProfile!;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.userProfile) {
      await this.initializeProfile();
    }

    this.userProfile = {
      ...this.userProfile!,
      ...updates,
      stats: {
        ...this.userProfile!.stats,
        ...updates.stats,
        lastActivity: new Date().toISOString(),
      }
    };

    await this.saveProfile();
  }

  private async saveProfile(): Promise<void> {
    try {
      const profileJson = JSON.stringify(this.userProfile);
      await storage.setItem(STORAGE_KEYS.userProfile, profileJson);
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }
}
```

### Navigation Implementation

#### Type-Safe Navigation Setup (`src/navigation/AppNavigator.tsx`)

```typescript
// Tab Navigator Types
export type TabParamList = {
  HomeTab: undefined;
  TripsTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
};

// Stack Navigator Types
export type HomeStackParamList = {
  Home: undefined;
  AddTimer: undefined;
  TimerDetail: { timerId: string };
  DestinationDetail: { destination: string };
};

export type TripsStackParamList = {
  Trips: undefined;
  TimerDrilldown: { timerId: string };
  Archive: undefined;
  SavedFacts: undefined;
  Checklist: { tripId: string };
};

export type ChatStackParamList = {
  HollyChat: HollyChatParams | undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  PrivacySecurity: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
};

export type HollyChatParams = {
  seedQuery?: string;
  tripId?: string;
  context?: {
    destination: string;
    tripId?: string;
    seedQuery?: string;
  };
};

// Main Tab Navigator
function TabNavigator() {
  const { isDark } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TripsTab') {
            iconName = focused ? 'airplane' : 'airplane-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? '#60a5fa' : '#2563eb',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="TripsTab"
        component={TripsStackNavigator}
        options={{ title: 'My Trips' }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{ title: 'Holly Bobz' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
```

### Component Implementation Examples

#### Themed Text Component (`src/components/ui/Text.tsx`)

```typescript
import { createText } from '@shopify/restyle';
import { Theme } from '../../theme/theme';

// Create the text component with proper theme typing
export const Text = createText<Theme>();

// Add error boundary for theme issues
export const SafeText = ({ color, ...props }: any) => {
  // If color is secondary and theme might not be loaded, use fallback
  if (color === 'secondary') {
    return (
      <Text
        {...props}
        color="text"
        style={[{ color: '#14B8A6' }, props.style]}
      />
    );
  }

  return <Text color={color} {...props} />;
};

export type TextProps = React.ComponentProps<typeof Text>;
```

### AI Service Integration

#### Chat Service Implementation (`src/api/chat-service.ts`)

```typescript
import { AIMessage, AIRequestOptions, AIResponse } from "../types/ai";
import { getDeepseekClient } from "./deepseek";
import { getOpenAIClient } from "./openai";
import { getGrokClient } from "./grok";

/**
 * Get a text response from Deepseek
 */
export const getDeepseekTextResponse = async (
  messages: AIMessage[],
  options?: AIRequestOptions,
): Promise<AIResponse> => {
  try {
    const client = getDeepseekClient();
    const defaultModel = "deepseek-chat";

    const response = await client.chat.completions.create({
      model: options?.model || defaultModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Deepseek API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from Deepseek
 */
export const getDeepseekChatResponse = async (
  prompt: string,
  options?: AIRequestOptions,
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: "user", content: prompt }
  ];

  const response = await getDeepseekTextResponse(messages, options);
  return response.content;
};
```

### Data Flow Diagrams

#### State Management Flow
```
User Action → Component → Action Dispatch → Store Update → Persistence
                      ↓                    ↓
               UI Re-render ←─────── AsyncStorage Sync
                      ↓                    ↓
               Optimistic Updates ← Debounced Persistence (100ms)
```

#### Navigation Flow
```
Tab Press → TabNavigator → StackNavigator → Screen Component
    ↓                ↓              ↓
Route Matching → Param Validation → Screen Rendering
    ↓                ↓              ↓
Deep Linking → Type Safety → Error Boundaries
```

#### AI Integration Flow
```
User Query → Chat Service → AI Provider (Deepseek/OpenAI/Grok)
    ↓                ↓                      ↓
Message Formatting → API Call → Response Processing
    ↓                ↓                      ↓
UI Update → Error Handling → Token Usage Tracking
```

---

## 🔌 API Specifications

### AI Service APIs

#### Deepseek API Integration
```typescript
interface DeepseekConfig {
  apiKey: string;
  baseURL: string;
  models: {
    chat: string;
    completion: string;
  };
}

interface DeepseekResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

#### OpenAI API Integration
```typescript
interface OpenAIConfig {
  apiKey: string;
  organization?: string;
  models: {
    gpt4: string;
    gpt35: string;
  };
}

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: OpenAIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

#### Grok API Integration
```typescript
interface GrokConfig {
  apiKey: string;
  baseURL: string;
  models: {
    standard: string;
    large: string;
  };
}
```

### Client API Helpers (New)

#### Anonymous User ID System
```typescript
// src/utils/anonymousId.ts
interface AnonymousIdService {
  getAnonymousId(): Promise<string>;
  clearAnonymousId(): Promise<void>;
}

// Usage in API calls
const subjectId = await getAnonymousId();
const response = await fetch(url, {
  headers: {
    'x-subject-id': subjectId,
    'Content-Type': 'application/json',
  },
});
```

#### Flight Resolution API
```typescript
// src/api/flights.ts
interface FlightResolvePayload {
  airlineIATA: string;
  flightNumber: string;
  departDateLocal: string;
  tripId?: string;
}

interface FlightResolveResponse {
  success: boolean;
  flight: FlightSegment;
  tripId?: string;
  usage: {
    subjectId: string;
    monthKey: string;
    flightResolves: number;
  };
}

// API Functions
export async function resolveFlight(payload: FlightResolvePayload): Promise<FlightResolveResponse>;
export async function getFlightStatus(query: FlightStatusQuery): Promise<FlightStatusResponse>;
export async function getTripFlights(tripId: string): Promise<TripFlightsResponse>;
```

#### Airport Schedule API
```typescript
// src/api/airports.ts
interface AirportScheduleParams {
  offsetMinutes?: number;
  durationMinutes?: number;
  direction?: "Arrival" | "Departure" | "Both";
}

interface AirportScheduleResponse {
  success: boolean;
  airport: string;
  schedule: FlightSchedule[];
  usage: {
    subjectId: string;
    monthKey: string;
    airportQueries: number;
  };
}

// API Functions
export async function fetchAirportSchedule(iata: string, params?: AirportScheduleParams): Promise<AirportScheduleResponse>;
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult>;
```

#### Itinerary Ingestion API
```typescript
// src/api/ingest.ts
interface IngestTextPayload {
  source: "text";
  text: string;
}

interface IngestFilePayload {
  source: "file";
  file: File | Blob;
}

interface IngestResponse {
  success: boolean;
  source: IngestSource;
  flights: ExtractedFlight[];
  hotels: ExtractedHotel[];
  aiProvider: string;
  aiModel: string;
  usage: {
    subjectId: string;
    monthKey: string;
    aiGenerations: number;
    totalTokens: number;
    costEstimate?: number;
  };
}

// API Functions
export async function ingestItinerary(source: IngestSource, payload: IngestPayload): Promise<IngestResponse>;
export async function ingestTextItinerary(text: string): Promise<IngestResponse>;
export async function ingestFileItinerary(file: File | Blob): Promise<IngestResponse>;
```

### Server API Endpoints (New)

#### Ingest API Endpoint
```typescript
// POST /api/ingest/itinerary
interface IngestRequest {
  source: "text" | "file";
  text?: string;
  // For files send multipart with field name "file"
}

interface IngestResponse {
  flights: Array<{
    airlineIATA: string;
    flightNumber: string;
    departIATA: string;
    arriveIATA: string;
    departDateLocal: string;
    departTimeLocal: string;
    arriveDateLocal: string;
    arriveTimeLocal: string;
    bookingRef?: string;
    passengerNames?: string[];
  }>;
  hotels: Array<{
    name: string;
    address?: string;
    city: string;
    country: string;
    checkInDate: string;
    checkOutDate: string;
    bookingRef?: string;
  }>;
}

// Notes: Uses our AI proxy. Increments UsageMeter.aiGenerations and writes ProviderUsage with provider "ai" endpoint "/api/ingest/itinerary"
```

#### Flight Resolution API Endpoint
```typescript
// POST /api/flights/resolve
interface FlightResolveRequest {
  airlineIATA: string;
  flightNumber: string;
  departDateLocal: string;
  tripId?: string;
}

interface FlightResolveResponse {
  segment: {
    carrier: string;
    number: string;
    depart: {
      iata: string;
      timeScheduled: string | null;
      terminal: string | null;
      gate: string | null;
    };
    arrive: {
      iata: string;
      timeScheduled: string | null;
      terminal: string | null;
      gate: string | null;
    };
    status: string;
  };
  savedId?: string;
}

// Notes: Resolves via AeroDataBox by default. If tripId is provided, upserts FlightSegment. Increments UsageMeter.flightResolves. Free users limited to one flight per trip.
```

#### Flight Status API Endpoint
```typescript
// GET /api/flights/status
// Query: ?carrier=BA&number=132&date=2025-11-02

interface FlightStatusResponse {
  status: "scheduled" | "active" | "landed" | "cancelled";
  depart: {
    terminal: string | null;
    gate: string | null;
  };
  arrive: {
    terminal: string | null;
    gate: string | null;
  };
}
```

#### Airport Schedule API Endpoint
```typescript
// GET /api/airports/:iata/schedule
// Query: offsetMinutes default -120, durationMinutes default 720, direction "Arrival" | "Departure" | "Both" default "Both"

interface AirportScheduleResponse {
  arrivals: Array<{
    flight: string;
    airline: string;
    from: string;
    scheduled: string;
    status: string;
    terminal?: string;
    gate?: string;
  }>;
  departures: Array<{
    flight: string;
    airline: string;
    to: string;
    scheduled: string;
    status: string;
    terminal?: string;
    gate?: string;
  }>;
}

// Notes: Free users limited to 240 minute window. Paid users up to 720. Increments UsageMeter.airportQueries.
```

#### AI Proxy Endpoint
```typescript
// POST /ai-proxy
interface AIProxyRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}

interface AIProxyResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costEstimate?: number;
}

// Error Response
interface APIError {
  error: string;
  detail?: string;
}
```

#### Usage Tracking Endpoint
```typescript
// POST /usage
interface UsageRequest {
  userId: string;
  hasPro: boolean;
  freeLimit?: number; // defaults to EXPO_PUBLIC_AI_LIMIT_FREE
  proLimit?: number;  // defaults to EXPO_PUBLIC_AI_LIMIT_PRO
}

interface UsageResponse {
  allowed: boolean;
  used: number;
  limit: number;
  message?: string; // when limit exceeded
}

// Error Response
interface UsageError {
  error: string;
  detail?: string;
}
```

#### Health Check Endpoint
```typescript
// GET /health
interface HealthResponse {
  ok: boolean;
  timestamp: string;
  version: string;
}
```

### Calendar Integration API

#### Enhanced Calendar API with Permissions
```typescript
interface CalendarPermission {
  status: 'granted' | 'denied' | 'limited' | 'unavailable' | 'blocked';
  canAskAgain: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  timeZone: string;
}

interface EnhancedCalendarAPI {
  // Permission management
  checkPermissions(): Promise<CalendarPermission>;
  requestPermissions(): Promise<CalendarPermission>;
  showPermissionSettings(): void;

  // Calendar operations
  getCalendars(): Promise<Calendar[]>;
  createEvent(calendarId: string, details: CalendarEventDetails): Promise<string>;
  getEvents(calendarIds: string[], startDate: Date, endDate: Date): Promise<CalendarEvent[]>;

  // Guard wrapper for safe operations
  withCalendarPermission<T>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined>;
}
```

### Image Picker API

#### Expo Image Picker Integration
```typescript
interface ImagePickerOptions {
  mediaTypes: 'Images' | 'Videos' | 'All';
  allowsEditing: boolean;
  aspect: [number, number];
  quality: number;
  base64: boolean;
  exif: boolean;
}

interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
  exif?: Record<string, any>;
  base64?: string;
}

interface ImagePickerAPI {
  requestMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
  requestCameraPermissionsAsync(): Promise<PermissionResponse>;
  launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
}
```

---

## 🧪 Testing Strategy

### Unit Testing

#### Component Testing (`__tests__/Component.test.tsx`)
```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimerCard } from '../components/TimerCard';

const mockTimer = {
  id: '1',
  destination: 'Paris',
  date: '2024-06-15T00:00:00.000Z',
  adults: 2,
  children: 0,
  duration: 7,
  createdAt: '2024-01-01T00:00:00.000Z',
  streak: 0,
  xp: 0,
  badges: [],
  completedQuests: [],
  lastCheckIn: '2024-01-01T00:00:00.000Z',
};

describe('TimerCard', () => {
  it('renders timer information correctly', () => {
    const { getByText } = render(<TimerCard timer={mockTimer} />);

    expect(getByText('Paris')).toBeTruthy();
    expect(getByText('2 travelers')).toBeTruthy();
    expect(getByText('7 days')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <TimerCard timer={mockTimer} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('timer-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockTimer);
  });
});
```

#### Store Testing (`__tests__/store.test.ts`)
```typescript
import { act, renderHook } from '@testing-library/react';
import { useHolidayStore } from '../store/useHolidayStore';

describe('useHolidayStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useHolidayStore());
    act(() => {
      result.current.timers = [];
      result.current.archivedTimers = [];
    });
  });

  it('adds a timer correctly', () => {
    const { result } = renderHook(() => useHolidayStore());

    act(() => {
      result.current.addTimer({
        destination: 'Tokyo',
        date: '2024-08-15T00:00:00.000Z',
        adults: 2,
        children: 1,
        duration: 10,
      });
    });

    expect(result.current.timers).toHaveLength(1);
    expect(result.current.timers[0].destination).toBe('Tokyo');
    expect(result.current.timers[0].adults).toBe(2);
    expect(result.current.timers[0].children).toBe(1);
    expect(result.current.timers[0].duration).toBe(10);
  });

  it('archives a timer correctly', () => {
    const { result } = renderHook(() => useHolidayStore());

    act(() => {
      result.current.addTimer({
        destination: 'London',
        date: '2024-07-01T00:00:00.000Z',
        adults: 1,
        children: 0,
        duration: 5,
      });
    });

    const timerId = result.current.timers[0].id;

    act(() => {
      result.current.archiveTimer(timerId);
    });

    expect(result.current.timers).toHaveLength(0);
    expect(result.current.archivedTimers).toHaveLength(1);
    expect(result.current.archivedTimers[0].id).toBe(timerId);
  });
});
```

### Integration Testing

#### API Integration Tests
```typescript
import { getDeepseekTextResponse } from '../api/chat-service';

describe('AI Service Integration', () => {
  it('gets response from Deepseek API', async () => {
    const messages = [
      { role: 'user', content: 'Hello, can you help me plan a trip?' }
    ];

    const response = await getDeepseekTextResponse(messages);

    expect(response.content).toBeTruthy();
    expect(typeof response.content).toBe('string');
    expect(response.usage.totalTokens).toBeGreaterThan(0);
  });

  it('handles API errors gracefully', async () => {
    const messages = [{ role: 'user', content: 'Test message' }];

    // Mock a failed API call
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

    await expect(getDeepseekTextResponse(messages)).rejects.toThrow('API Error');
  });
});
```

### E2E Testing

#### Detox Configuration (`e2e/jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/e2e/init.js'],
  globalSetup: '<rootDir>/e2e/global-setup.js',
  globalTeardown: '<rootDir>/e2e/global-teardown.js',
};
```

#### E2E Test Example (`e2e/TripCreation.test.js`)
```javascript
describe('Trip Creation Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should create a new trip successfully', async () => {
    // Navigate to home screen
    await expect(element(by.id('home-screen'))).toBeVisible();

    // Tap add trip button
    await element(by.id('add-trip-button')).tap();

    // Fill trip details
    await element(by.id('destination-input')).typeText('Barcelona');
    await element(by.id('date-input')).tap();
    await element(by.text('15')).tap();
    await element(by.id('adults-input')).typeText('2');
    await element(by.id('children-input')).typeText('1');
    await element(by.id('duration-input')).typeText('7');

    // Submit trip
    await element(by.id('create-trip-button')).tap();

    // Verify trip was created
    await expect(element(by.text('Barcelona'))).toBeVisible();
    await expect(element(by.text('3 travelers'))).toBeVisible();
    await expect(element(by.text('7 days'))).toBeVisible();
  });
});
```

---

## ⚡ Performance Optimizations

### Component Optimization

#### Memoization Strategy
```typescript
import React, { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const TimerCard = memo(({ timer, onPress }) => {
  const formattedDate = useMemo(() => {
    return formatDistanceToNow(new Date(timer.date), { addSuffix: true });
  }, [timer.date]);

  const handlePress = useCallback(() => {
    onPress(timer);
  }, [onPress, timer]);

  return (
    <Pressable onPress={handlePress}>
      <Text>{timer.destination}</Text>
      <Text>{formattedDate}</Text>
    </Pressable>
  );
});

// Optimize list rendering
const TimerList = memo(({ timers, onTimerPress }) => {
  const renderItem = useCallback(({ item }) => (
    <TimerCard
      key={item.id}
      timer={item}
      onPress={onTimerPress}
    />
  ), [onTimerPress]);

  return (
    <FlatList
      data={timers}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
});
```

### State Management Optimization

#### Debounced Persistence
```typescript
// Debounce state persistence to reduce AsyncStorage writes
let persistenceTimeout: ReturnType<typeof setTimeout> | null = null;

useHolidayStore.subscribe((state) => {
  if (persistenceTimeout) {
    clearTimeout(persistenceTimeout);
  }

  persistenceTimeout = setTimeout(async () => {
    await persistState(state);
    persistenceTimeout = null;
  }, 100); // 100ms debounce
});
```

### Image Optimization

#### Progressive Image Loading
```typescript
import { Image } from 'react-native';

const OptimizedImage = ({ source, style, placeholder }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={style}>
      {!loaded && placeholder}
      <Image
        source={source}
        style={[style, { opacity: loaded ? 1 : 0 }]}
        onLoad={() => setLoaded(true)}
        resizeMode="cover"
        progressiveRenderingEnabled={true}
      />
    </View>
  );
};
```

### Bundle Optimization

#### Code Splitting Strategy
```typescript
// Dynamic imports for heavy screens
const PrivacyPolicyScreen = lazy(() =>
  import('../screens/PrivacyPolicyScreen')
);
const TermsOfServiceScreen = lazy(() =>
  import('../screens/TermsOfServiceScreen')
);

// AI service lazy loading
const getAIService = async (provider: string) => {
  switch (provider) {
    case 'deepseek':
      return (await import('./deepseek')).getDeepseekClient();
    case 'openai':
      return (await import('./openai')).getOpenAIClient();
    case 'grok':
      return (await import('./grok')).getGrokClient();
  }
};
```

### Memory Management

#### Component Cleanup
```typescript
const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup subscriptions
      messageSubscription?.unsubscribe();
      // Clear large data structures
      setMessages([]);
      // Cancel pending API calls
      abortController?.abort();
    };
  }, []);

  // Limit message history to prevent memory leaks
  const addMessage = useCallback((message) => {
    setMessages(prev => {
      const newMessages = [...prev, message];
      // Keep only last 50 messages
      return newMessages.slice(-50);
    });
  }, []);

  return (
    <ScrollView ref={scrollViewRef}>
      {messages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
    </ScrollView>
  );
};
```

---

## 🚀 Future Roadmap

### Phase 1: Core Enhancement (Current)
- [x] Basic trip planning functionality
- [x] AI assistant integration
- [x] Cross-platform compatibility
- [x] Local data storage
- [ ] Cloud backup (optional)
- [ ] Advanced trip analytics

### Phase 2: Advanced Features (Next 3-6 months)
- [ ] Travel itinerary import/export
- [ ] Group trip collaboration
- [ ] Offline map integration
- [ ] Travel expense tracking
- [ ] Flight and hotel booking integration

### Phase 3: Ecosystem Expansion (6-12 months)
- [ ] Travel community features
- [ ] Third-party integrations
- [ ] Advanced AI personalization
- [ ] Multi-language support
- [ ] Travel insurance integration

### Technical Improvements
- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Real-time synchronization
- [ ] Enhanced error handling
- [ ] Comprehensive testing suite

---

## 📊 Implementation Status

### ✅ Completed Features

#### Client API Helpers & UI Integration
- [x] Anonymous user ID system with persistent AsyncStorage
- [x] Flight resolution API helpers (resolveFlight, getFlightStatus, getTripFlights)
- [x] Airport schedule API helpers (fetchAirportSchedule, searchFlights)
- [x] Itinerary ingestion API helpers (ingestItinerary, ingestTextItinerary, ingestFileItinerary)
- [x] Trip Actions card in TimerDrilldownScreen with premium-gated buttons
- [x] Add Flight button integration with existing flight lookup modal
- [x] Upload Itinerary button with placeholder for future modal
- [x] Airport Schedule button with conditional display based on flight existence
- [x] Premium feature gating with lock icons and upgrade prompts
- [x] Comprehensive error handling and user-friendly messages

#### Typography System
- [x] Complete font system simplification to Questrial-only
- [x] Platform-specific font loading (CSS for web, expo-font for native)
- [x] Global CSS font declarations with weight variations
- [x] Navigation typography consistency (bottom tab labels)
- [x] Component typography audit and updates across all UI elements
- [x] Font weight hierarchy (400, 500, 600, 700) for visual consistency

#### Server Infrastructure
- [x] Express.js AI proxy server
- [x] Cheapest-first AI provider selection
- [x] Provider adapters (OpenAI, DeepSeek, Grok)
- [x] Usage tracking and quota management
- [x] Health check endpoints

#### Client Paywall System
- [x] RevenueCat subscription integration
- [x] Entitlement hooks and state management
- [x] PaywallModal and PaywallScreen components
- [x] AI quota checking and limits
- [x] Trial system (7-day free period)

#### Security & Storage
- [x] Safe AsyncStorage adapter with method guards
- [x] Fallback mechanisms for missing storage methods
- [x] Migration support from legacy AsyncStorage
- [x] Server-side API key management
- [x] Enhanced permission handling
- [x] Input validation and sanitization

#### Network Configuration & Device Testing
- [x] API_BASE_URL configuration with LAN fallback
- [x] iOS ATS development exception
- [x] Environment variable management
- [x] Device testing support with localhost replacement
- [x] EAS build configuration with cache optimization
- [x] Image processing bypass for build stability

#### React Native Fixes
- [x] Transform style fixes (multi-property objects split)
- [x] Automated codemod for transform corrections
- [x] Component render error prevention
- [x] iOS build permission error resolution
- [x] Babel configuration optimization
- [x] TypeScript module resolution fixes

#### Monitoring & Analytics
- [x] Sentry error tracking (mock implementation)
- [x] PostHog analytics (mock implementation)
- [x] Custom analytics events
- [x] Error boundary components

### 🔧 Ready for Production

#### Environment Variables Required
```bash
# Client-side
EXPO_PUBLIC_REVENUECAT_KEY=your_revenuecat_key
EXPO_PUBLIC_AI_PROXY_URL=https://your-server.com
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_AI_LIMIT_FREE=15
EXPO_PUBLIC_AI_LIMIT_PRO=200
EXPO_PUBLIC_TRIAL_DAYS=7

# Server-side
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
XAI_API_KEY=your_grok_key
PORT=3000
```

### Network Configuration & Device Testing

#### API_BASE_URL Configuration
```typescript
// src/config/env.ts - Environment configuration with LAN fallback
import Constants from "expo-constants";
import { Platform } from "react-native";

const LAN_FALLBACK = Constants.expoConfig?.extra?.LAN_IP ?? "192.168.32.20";
const RAW_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ||
                Constants.expoConfig?.extra?.API_BASE_URL || "";

function normaliseBaseUrl(url: string) {
  if (!url) return "";
  // Replace localhost with LAN IP for device testing
  return url.replace("http://localhost", `http://${LAN_FALLBACK}`)
           .replace("http://127.0.0.1", `http://${LAN_FALLBACK}`);
}

export const API_BASE_URL = normaliseBaseUrl(RAW_BASE);
export const IS_DEV = __DEV__;

// Logs final API_BASE_URL in development for debugging
if (IS_DEV) console.log("API_BASE_URL:", API_BASE_URL);
```

#### iOS ATS Development Exception
```json
// app.config.ts - iOS App Transport Security for development
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        }
      }
    },
    "extra": {
      "LAN_IP": "192.168.32.20"
    }
  }
}
```

#### Environment Variables Setup
```bash
# .env or app.config.ts
EXPO_PUBLIC_API_BASE_URL=http://192.168.32.20:8787

# Additional variables
EXPO_PUBLIC_AI_PROXY_URL=http://192.168.32.20:8787
EXPO_PUBLIC_AI_LIMIT_FREE=15
EXPO_PUBLIC_AI_LIMIT_PRO=200
```

#### Dependencies to Install
```bash
# Client
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-purchases
npx expo install expo-secure-store
npx expo install @sentry/react-native sentry-expo
npm i posthog-react-native
npm i react-native-permissions
npm i zod

# Server
cd server && npm install
```

---

*This document is maintained by the Odeysync development team and should be updated with any significant architectural changes or new features.*

**Last Updated:** January 2025
**Document Version:** 2.7.0 (Production Security & Telemetry)

---

### Version History
- **v2.7.0 (Jan 2025)**: Production Security & Telemetry, Runtime Guards, Environment-Driven Monitoring, Centralized API Client, Enhanced Security
- **v2.6.0 (Jan 2025)**: Client API Helpers & UI Integration, Anonymous User Support, Trip Actions Card, Build Environment Documentation, Premium Feature Gating
- **v2.5.0 (Jan 2025)**: Typography System Overhaul, Font Consistency, Questrial-Only Font Family, Navigation Typography Updates
- **v2.4.0 (Jan 2025)**: AI Response Formatting Overhaul, Server Dependencies Update, Express v4 Compatibility, Asset Path Resolution
- **v2.3.0 (Aug 2025)**: iOS Build Fixes & Dependencies Update
- **v2.2.0 (Jul 2025)**: Destination Integration & AI Provider Optimization
- **v2.1.0 (Jun 2025)**: RevenueCat Integration & Subscription Management
- **v2.0.0 (May 2025)**: React Native 0.79.5 Upgrade & Performance Optimization
- **v1.0.0 (Apr 2025)**: Initial Release with Core Features
