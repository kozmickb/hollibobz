import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ChatStackParamList } from '../navigation/AppNavigator';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeButton } from '../components/ThemeButton';
import { useEntitlements } from '../hooks/useEntitlements';
import { checkAndIncrementAI } from '../hooks/useAIQuota';
import { PaywallModal } from '../components/PaywallModal';
import { Analytics } from '../lib/monitoring';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { sendAIThroughProxy } from '../api/chat-service';
import { AIMessage } from '../types/ai';
import ChecklistMessage from '../features/checklist/ChecklistMessage';
import { enhancePromptForChecklist } from '../features/checklist/promptEnhancer';
import { tripStore } from '../lib/tripStore';
import { generateTripId, createTripFromChecklist, extractTripTitleFromPrompt } from '../utils/tripHelpers';
import { extractJsonBlock } from '../features/checklist/itineraryParser';
import { validateChecklistDoc } from '../features/checklist/validate';

type HollyChatNav = NativeStackNavigationProp<ChatStackParamList, "HollyChat">;
type HollyChatRoute = RouteProp<ChatStackParamList, "HollyChat">;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tripId?: string;
  hasChecklist?: boolean;
}

export function HollyChatScreen() {
  const navigation = useNavigation<HollyChatNav>();
  const route = useRoute<HollyChatRoute>();
  const { isDark } = useThemeStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Entitlement hooks
  const { hasPro, loading: entitlementsLoading } = useEntitlements();
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;
  const initializedRef = useRef(false); // Prevent duplicate initialization

    // Initialize with seed query if provided
  useEffect(() => {
    console.log('HollyChatScreen initialized with route params:', route.params);
    console.log('Context:', route.params?.context);
    console.log('Timer ID from context:', route.params?.context?.timerId);

    // Prevent duplicate initialization (fixes issue where welcome message appears twice)
    if (initializedRef.current) {
      console.log('HollyChatScreen already initialized, skipping...');
      return;
    }
    initializedRef.current = true;

    // Check API status on component mount
    checkAPIStatus();

    // Pre-load destination context if available
    if (route.params?.context?.destination && messages.length === 0) {
      const destination = route.params.context.destination;
      const date = route.params.context.dateISO;
      const adults = route.params.context.adults || 1;
      const children = route.params.context.children || 0;
      const duration = route.params.context.duration || 7;
      
      let welcomeContent = `🌟 Welcome to Holly Bobz! I'm here to help you plan your amazing trip to **${destination}**.\n\n`;
      welcomeContent += `**Trip Details:**\n`;
      welcomeContent += `• **Destination:** ${destination}\n`;
      welcomeContent += `• **Date:** ${date ? new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified'}\n`;
      welcomeContent += `• **Group:** ${adults} adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}\n`;
      welcomeContent += `• **Duration:** ${duration} day${duration !== 1 ? 's' : ''}\n\n`;
      welcomeContent += `I have insider knowledge about ${destination} and can provide personalized recommendations, hidden gems, and travel tips tailored to your group size and trip duration. What would you like to know about ${destination}?`;
      
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } else if (messages.length === 0) {
      // Generic welcome message for main dashboard chat
      const welcomeContent = `🌟 **Welcome to Holly Bobz!**\n\nI'm your personal travel planning assistant, here to help you with:\n\n` +
        `• **Destination Research** - Find the perfect places to visit\n` +
        `• **Travel Planning** - Get tips on flights, accommodation, and activities\n` +
        `• **Budget Advice** - Plan your trip within your budget\n` +
        `• **Local Insights** - Discover hidden gems and local recommendations\n` +
        `• **Travel Tips** - Everything from packing to cultural etiquette\n\n` +
        `What would you like to know about travel planning today?`;
      
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
    
    if (route.params?.seedQuery) {
      const initialMessage: Message = {
        id: '1',
        role: 'user',
        content: route.params.seedQuery,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
      handleSendMessage(route.params.seedQuery);
    }
    
    // Initialize trip ID if provided
    if (route.params?.tripId) {
      setCurrentTripId(route.params.tripId);
    }

    // Cleanup function to reset initialization flag when component unmounts
    return () => {
      initializedRef.current = false;
    };
  }, [route.params?.seedQuery, route.params?.context?.destination, route.params?.tripId]);

  // Reset initialization when route params change significantly (for navigation between different chat contexts)
  useEffect(() => {
    const hasContextChanged = route.params?.context?.destination || route.params?.seedQuery || route.params?.tripId;
    if (hasContextChanged && initializedRef.current) {
      console.log('Route context changed, resetting initialization');
      initializedRef.current = false;
    }
  }, [route.params?.context?.destination, route.params?.seedQuery, route.params?.tripId]);

  // Animation functions
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startDotAnimation = () => {
    const createDotAnimation = (dotAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 400,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createDotAnimation(dotAnim1, 0).start();
    createDotAnimation(dotAnim2, 200).start();
    createDotAnimation(dotAnim3, 400).start();
  };

  const stopAnimations = () => {
    pulseAnim.stopAnimation();
    dotAnim1.stopAnimation();
    dotAnim2.stopAnimation();
    dotAnim3.stopAnimation();
    pulseAnim.setValue(1);
    dotAnim1.setValue(0);
    dotAnim2.setValue(0);
    dotAnim3.setValue(0);
  };

  const handleSendMessage = async (content: string, displayContent?: string) => {
    if (!content.trim()) return;

    // Enhance the content with checklist instructions if it appears to be an itinerary request
    const enhancedContent = enhancePromptForChecklist(content.trim());

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent?.trim() || content.trim(), // Use display content if provided
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Start animations and set initial status
    startPulseAnimation();
    startDotAnimation();
    setAiStatus('Holly is thinking...');

    try {
      // Build conversation context
      const conversationHistory: AIMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message (enhanced with checklist instructions if needed)
      conversationHistory.push({
        role: 'user',
        content: enhancedContent,
      });

      // Add context about the trip if available
      let systemPrompt = "You are Holly Bobz, a friendly and knowledgeable AI travel assistant. You help users plan amazing trips with personalized advice, insider tips, and detailed recommendations. Be enthusiastic, helpful, and provide practical travel advice.";
      
      if (route.params?.context?.destination) {
        const context = route.params.context;
        systemPrompt += `\n\nCurrent trip context: The user is planning a trip to ${context.destination}.`;
        systemPrompt += `\nTrip date: ${context.dateISO}.`;
        systemPrompt += `\nTravel group: ${context.adults || 1} adult${(context.adults || 1) !== 1 ? 's' : ''}${(context.children || 0) > 0 ? `, ${context.children} child${(context.children || 0) !== 1 ? 'ren' : ''}` : ''}.`;
        systemPrompt += `\nTrip duration: ${context.duration || 7} day${(context.duration || 7) !== 1 ? 's' : ''}.`;
        systemPrompt += `\n\nProvide recommendations and advice tailored to this specific trip, group size, and duration.`;
      } else {
        systemPrompt += `\n\nThis is a general travel planning conversation. Provide helpful advice for travel planning in general.`;
      }

      // Add system message at the beginning
      const messagesWithSystem: AIMessage[] = [
        { role: 'user', content: systemPrompt },
        ...conversationHistory
      ];

      // Check AI quota and entitlements
      const quotaCheck = await checkAndIncrementAI({
        hasPro,
        userId: 'anonymous', // TODO: Replace with actual user ID when auth is implemented
      });

      if (!quotaCheck.ok) {
        Analytics.track('paywall_shown', { reason: 'ai_limit_reached' });
        setShowPaywall(true);
        setIsLoading(false);
        return;
      }

      // Use AI proxy (cheapest first selection handled server-side)
      setAiStatus('Holly is thinking...');
      const response = await sendAIThroughProxy(messagesWithSystem, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      // Track successful AI usage
      Analytics.aiMessageSent(
        response.provider || 'unknown',
        response.model || 'unknown',
        response.usage.totalTokens
      );

      // Process checklist if present in response
      let tripId = currentTripId || route.params?.tripId;
      let hasChecklist = false;
      
      try {
        const jsonBlock = extractJsonBlock(response.content);
        console.log('JSON Block extracted:', jsonBlock ? 'Found' : 'Not found');
        if (jsonBlock) {
          // Parse the JSON string first
          const parsedJson = JSON.parse(jsonBlock);
          console.log('Parsed JSON:', parsedJson);
          const checklistDoc = validateChecklistDoc(parsedJson);
          console.log('Checklist validation:', checklistDoc ? 'Valid' : 'Invalid');
          if (checklistDoc) {
            // Create or get trip, linking to existing timer if available
            if (!tripId) {
              // Check if we have timer context from route params
              const timerContext = route.params?.context;
              console.log('Route params context:', timerContext);
              console.log('Timer ID from context:', timerContext?.timerId);
              if (timerContext?.timerId) {
                // Use timer ID as trip ID to link them
                tripId = timerContext.timerId;
                console.log('Linking checklist to existing timer:', tripId);
              } else {
                // Generate new trip ID
                tripId = generateTripId();
                console.log('Creating new trip for checklist:', tripId);
              }
              setCurrentTripId(tripId);
              
              // Create new trip with context from timer if available
              let tripTitle = checklistDoc.tripTitle;
              if (timerContext?.destination) {
                tripTitle = `${timerContext.destination} Trip`;
              } else {
                tripTitle = tripTitle || extractTripTitleFromPrompt(content);
              }
              
              const newTrip = createTripFromChecklist(checklistDoc, tripId);
              newTrip.title = tripTitle;
              
              // Add timer context to trip if available
              if (timerContext) {
                newTrip.timerContext = {
                  destination: timerContext.destination,
                  date: timerContext.dateISO,
                  duration: timerContext.duration,
                  adults: timerContext.adults,
                  children: timerContext.children,
                };
              }
              
              await tripStore.upsert(newTrip);
            } else {
              // Update existing trip with checklist
              await tripStore.setChecklist(tripId, checklistDoc);
            }
            hasChecklist = true;
          }
        }
      } catch (error) {
        console.warn('Failed to process checklist:', error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        tripId: tripId || undefined,
        hasChecklist,
      };
      
      console.log('AI Message created:', {
        hasChecklist,
        tripId,
        messageId: aiMessage.id
      });

      setMessages(prev => [...prev, aiMessage]);
      setAiStatus('');
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Generate intelligent fallback response based on user's question and message count
      const userQuestion = content.toLowerCase();
      const messageCount = messages.length;
      const destination = route.params?.context?.destination || 'your destination';
      
      // Create varied responses based on question type and conversation length
      let fallbackContent = '';
      
      if (userQuestion.includes('hidden') || userQuestion.includes('secret') || userQuestion.includes('local')) {
        const hiddenGemsResponses = [
          `🌟 **Hidden Gems Alert!** For ${destination}, here are some insider secrets:

🏘️ **Local Neighborhoods**: Venture beyond tourist areas to discover authentic local life
🍽️ **Family-Owned Eateries**: Skip chains, find small restaurants where locals dine
🌅 **Sunrise Spots**: Early morning is when you'll see the real city waking up
🎭 **Cultural Hubs**: Look for community centers and local event spaces
📚 **Bookstores & Cafes**: These often have the best local recommendations

Pro tip: Ask locals "Where do you go on weekends?" - that's where the magic happens!`,
          
          `🔍 **Off-the-Beaten-Path Guide** for ${destination}:

🌿 **Secret Gardens**: Many cities have hidden green spaces known only to locals
🏪 **Local Markets**: Visit early morning markets for the freshest local produce
🎨 **Street Art Districts**: Often overlooked but full of local culture
🍷 **Wine Bars**: Small, family-run places with authentic local wines
🏛️ **Historical Sites**: Lesser-known historical spots with amazing stories

Remember: The best discoveries happen when you wander without a strict plan!`,
          
          `💎 **Local Secrets** for ${destination}:

🚶‍♂️ **Walking Tours**: Take self-guided walks through residential areas
🍜 **Street Food**: Follow the locals to the best street food spots
🌙 **Night Markets**: Many cities have amazing night markets tourists miss
🏡 **Guest Houses**: Stay in family-run guest houses for authentic experiences
🎪 **Local Festivals**: Check local calendars for festivals and events

The real magic is in the details most tourists never see!`
        ];
        fallbackContent = hiddenGemsResponses[messageCount % hiddenGemsResponses.length];
        
      } else if (userQuestion.includes('food') || userQuestion.includes('restaurant') || userQuestion.includes('cuisine')) {
        const foodResponses = [
          `🍽️ **Culinary Adventure** in ${destination}:

🍜 **Local Specialties**: Every region has unique dishes - ask what's traditional
🏪 **Food Markets**: Visit local markets for fresh, authentic ingredients
👨‍🍳 **Cooking Classes**: Learn to make local dishes from local chefs
🍷 **Wine & Dine**: Research local wine regions and dining customs
📱 **Food Apps**: Use local food apps to find authentic restaurants

Food is the heart of culture - don't miss the local flavors!`,
          
          `🥘 **Foodie's Guide** to ${destination}:

🌶️ **Street Food**: The best local cuisine is often found on the street
🏪 **Local Markets**: Early morning markets have the freshest ingredients
🍷 **Regional Wines**: Each area has unique wine traditions
👨‍🍳 **Chef's Tables**: Look for restaurants with chef's table experiences
📚 **Food Tours**: Guided food tours reveal hidden culinary gems

Pro tip: Ask "What's your grandmother's favorite recipe?" - that's authentic local food!`,
          
          `🍴 **Dining Secrets** of ${destination}:

🍜 **Family Recipes**: Small family restaurants often have the best traditional dishes
🌅 **Breakfast Spots**: Local breakfast places reveal daily life
🍷 **Wine Bars**: Small wine bars have the best local selections
👨‍🍳 **Market Tours**: Many chefs offer market tours and cooking classes
📱 **Local Recommendations**: Ask locals where they eat on special occasions

The best meals are the ones you discover, not the ones you plan!`
        ];
        fallbackContent = foodResponses[messageCount % foodResponses.length];
        
      } else if (userQuestion.includes('budget') || userQuestion.includes('money') || userQuestion.includes('cost')) {
        const budgetResponses = [
          `💰 **Smart Travel Budget** for ${destination}:

🏠 **Accommodation**: Consider hostels, guesthouses, or vacation rentals
🚌 **Public Transport**: Use local buses and trains instead of taxis
🍽️ **Local Eateries**: Eat where locals eat for better prices and authenticity
🎫 **City Passes**: Many cities offer passes for multiple attractions
📅 **Off-Season**: Travel during shoulder seasons for better prices
🎒 **Free Activities**: Many museums and parks offer free entry days

Travel smart, not expensive!`,
          
          `💡 **Budget Travel Tips** for ${destination}:

🏨 **Alternative Stays**: Look into house-sitting, couchsurfing, or work exchanges
🚲 **Bike Rentals**: Often cheaper and more fun than public transport
🍜 **Street Food**: Delicious and budget-friendly local cuisine
🎭 **Free Events**: Check local calendars for free festivals and events
📱 **Local Apps**: Use local apps to find deals and discounts
🏪 **Local Markets**: Buy souvenirs and gifts from local markets

Adventure doesn't have to cost a fortune!`,
          
          `🎯 **Cost-Saving Secrets** for ${destination}:

🏠 **Local Rentals**: Vacation rentals are often cheaper than hotels
🚶‍♂️ **Walking Tours**: Free walking tours are available in most cities
🍽️ **Lunch Specials**: Many restaurants offer great lunch deals
🎫 **Student Discounts**: Always ask about student, senior, or group discounts
📅 **Timing**: Book flights and accommodation during off-peak times
🎒 **Pack Smart**: Bring essentials to avoid expensive purchases

The best experiences are often the cheapest ones!`
        ];
        fallbackContent = budgetResponses[messageCount % budgetResponses.length];
        
      } else if (userQuestion.includes('weather') || userQuestion.includes('season') || userQuestion.includes('climate')) {
        const weatherResponses = [
          `🌤️ **Weather Wisdom** for ${destination}:

🌡️ **Temperature Check**: Research average temperatures for your travel dates
🌧️ **Rainy Season**: Plan indoor activities as backup for rainy days
❄️ **Winter Travel**: Pack appropriate clothing and check heating availability
☀️ **Summer Heat**: Plan activities during cooler morning/evening hours
🌪️ **Seasonal Events**: Many destinations have unique seasonal activities

Good weather planning makes for better experiences!`,
          
          `🌍 **Seasonal Guide** to ${destination}:

🌸 **Spring**: Often the best time for outdoor activities and festivals
☀️ **Summer**: Peak season but also peak crowds and prices
🍂 **Autumn**: Beautiful colors and comfortable temperatures
❄️ **Winter**: Off-season prices but check for seasonal closures
🌦️ **Shoulder Seasons**: Spring and fall often offer the best balance

Timing is everything in travel!`,
          
          `🌡️ **Climate Smart** Travel to ${destination}:

🌤️ **Best Seasons**: Research peak and off-peak weather patterns
🌧️ **Rainy Days**: Always have indoor backup plans
❄️ **Cold Weather**: Pack layers and check heating in accommodations
☀️ **Hot Weather**: Plan activities during cooler parts of the day
🌪️ **Extreme Weather**: Check for seasonal weather warnings

Mother Nature is part of the adventure!`
        ];
        fallbackContent = weatherResponses[messageCount % weatherResponses.length];
        
      } else {
        // General travel advice with variety
        const generalResponses = [
          `🌟 **Welcome to ${destination}!** Here's your travel starter pack:

🌍 **Best Time to Visit**: Research peak and off-peak seasons
✈️ **Getting There**: Compare flights, trains, and other transport options
🏨 **Where to Stay**: Consider location, budget, and local experiences
🍽️ **Local Cuisine**: Don't miss regional specialties and street food
🎯 **Must-See Sights**: Plan around major attractions but leave room for discovery
💰 **Budget Planning**: Set aside money for experiences and souvenirs

Ready for an amazing adventure? Ask me about specific aspects of your trip!`,
          
          `🎒 **Travel Planning Guide** for ${destination}:

📅 **Timing**: Consider weather, crowds, and local events
🚗 **Transportation**: Research local transport options and costs
🏠 **Accommodation**: Look for places that match your travel style
🍜 **Food Culture**: Learn about local dining customs and specialties
🎭 **Cultural Experiences**: Find authentic local activities and events
📱 **Local Apps**: Download useful apps for navigation and recommendations

Every destination has its own rhythm - let's find yours!`,
          
          `🗺️ **Destination Discovery** for ${destination}:

🌍 **Geography**: Understand the landscape and climate
🏛️ **History**: Learn about the local history and culture
🍽️ **Cuisine**: Explore local food traditions and specialties
🎭 **Arts & Culture**: Discover local arts, music, and traditions
🚶‍♂️ **Local Life**: Experience daily life beyond tourist areas
📸 **Photography**: Find the best spots for memorable photos

The best trips are the ones that teach you something new!`
        ];
        fallbackContent = generalResponses[messageCount % generalResponses.length];
      }
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
      stopAnimations();
      setAiStatus('');
    }
  };

  const handleSubmit = () => {
    if (inputText.trim() && !isLoading) {
      handleSendMessage(inputText);
    }
  };

  // Debug function to check API status
  const checkAPIStatus = () => {
    const deepseekKey = process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY;
    const openaiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
    const grokKey = process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY;
    
    console.log('Deepseek API Key Status:', deepseekKey ? 'Configured' : 'Not configured');
    console.log('OpenAI API Key Status:', openaiKey ? 'Configured' : 'Not configured');
    console.log('Grok API Key Status:', grokKey ? 'Configured' : 'Not configured');
    
    return deepseekKey || openaiKey || grokKey;
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0F172A' : '#FEF7ED'}
      />
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: isDark ? '#0F172A' : '#FEF7ED',
      }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
      
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isDark 
                ? 'rgba(139, 92, 246, 0.2)' 
                : 'rgba(139, 92, 246, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
            }}>
              <Ionicons 
                name="sparkles" 
                size={16} 
                color={isDark ? '#A78BFA' : '#8B5CF6'} 
              />
            </View>
            <Text style={{
              fontSize: 18,
              fontFamily: 'Poppins-Bold',
              color: isDark ? '#F3F4F6' : '#1F2937',
            }}>
              Holly
            </Text>
          </View>
        </View>
        
        <ThemeButton />
      </View>

      {/* Chat Messages */}
      <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            padding: 20, 
            paddingBottom: Platform.OS === 'web' ? 160 : 130 // Reduced padding to clear input and nav bar
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && !route.params?.seedQuery && (
            <View style={{
              alignItems: 'center',
              paddingVertical: 60,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: isDark 
                  ? 'rgba(139, 92, 246, 0.2)' 
                  : 'rgba(139, 92, 246, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Ionicons 
                  name="chatbubble-ellipses" 
                  size={32} 
                  color={isDark ? '#A78BFA' : '#8B5CF6'} 
                />
              </View>
              <Text style={{
                fontSize: 20,
                fontFamily: 'Poppins-Bold',
                color: isDark ? '#F3F4F6' : '#1F2937',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Chat with Holly Bobz
              </Text>
              <Text style={{
                fontSize: 16,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#9CA3AF' : '#6B7280',
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Your AI travel assistant is here to help you plan the perfect trip!
              </Text>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={{
                marginBottom: 16,
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <View style={{
                maxWidth: '80%',
                backgroundColor: message.role === 'user'
                  ? (isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)')
                  : (isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: message.role === 'user'
                  ? (isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)')
                  : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.1)'),
                shadowColor: isDark ? '#000' : '#F97316',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: message.role === 'user' ? 0.1 : 0.05,
                shadowRadius: 4,
                elevation: message.role === 'user' ? 2 : 1,
              }}>
                {message.role === 'user' ? (
                  <Text style={{
                    fontSize: 16,
                    fontFamily: 'Poppins-Regular',
                    color: isDark ? '#A78BFA' : '#8B5CF6',
                    lineHeight: 24,
                  }}>
                    {message.content}
                  </Text>
                ) : (
                  <>
                    <Markdown style={{
                      body: {
                        fontSize: 16,
                        fontFamily: 'Poppins-Regular',
                        color: isDark ? '#F3F4F6' : '#1F2937',
                        lineHeight: 24,
                      },
                      heading1: {
                        fontSize: 20,
                        fontFamily: 'Poppins-Bold',
                        color: isDark ? '#F3F4F6' : '#1F2937',
                        marginTop: 8,
                        marginBottom: 4,
                      },
                      heading2: {
                        fontSize: 18,
                        fontFamily: 'Poppins-Bold',
                        color: isDark ? '#F3F4F6' : '#1F2937',
                        marginTop: 8,
                        marginBottom: 4,
                      },
                      heading3: {
                        fontSize: 16,
                        fontFamily: 'Poppins-Bold',
                        color: isDark ? '#F3F4F6' : '#1F2937',
                        marginTop: 8,
                        marginBottom: 4,
                      },
                      strong: {
                        fontFamily: 'Poppins-Bold',
                        color: isDark ? '#F3F4F6' : '#1F2937',
                      },
                      em: {
                        fontFamily: 'Poppins-Italic',
                        color: isDark ? '#F3F4F6' : '#1F2937',
                      },
                      bullet_list: {
                        marginTop: 4,
                        marginBottom: 4,
                      },
                      ordered_list: {
                        marginTop: 4,
                        marginBottom: 4,
                      },
                      list_item: {
                        marginTop: 2,
                        marginBottom: 2,
                      },
                      paragraph: {
                        marginTop: 4,
                        marginBottom: 4,
                      },
                    }}>
                      {/* Remove JSON blocks from display content */}
                      {message.content.replace(/```json\s*[\s\S]*?```/g, '').trim()}
                    </Markdown>
                    <ChecklistMessage 
                      messageContent={message.content} 
                      onRegenerateRequest={() => {
                        // Add itinerary regeneration with JSON format instruction
                        const itineraryPrompt = `Please regenerate the previous itinerary with this specific format:

Return two parts:
1) A short readable trip overview for humans.
2) A strict JSON object named itinerary_json that matches:
{
  "tripTitle": "string",
  "sections": [
    { "title": "string", "items": ["string", "..."] }
  ]
}
Rules:
- Put ONLY the JSON object in a single fenced code block marked json.
- No comments or trailing text inside the code block.
- Use null only if absolutely needed, otherwise omit fields.`;
                        
                        // Show user-friendly message but send technical prompt to AI
                        const userFriendlyMessage = "Please regenerate the itinerary in a format I can turn into a checklist.";
                        handleSendMessage(itineraryPrompt, userFriendlyMessage);
                      }}
                    />
                    
                    {/* Open Checklist Button */}
                    {(() => {
                      console.log('Checking Open Checklist button for message:', {
                        messageId: message.id,
                        hasChecklist: message.hasChecklist,
                        tripId: message.tripId,
                        shouldShow: message.hasChecklist && message.tripId
                      });
                      return message.hasChecklist && message.tripId;
                    })() && (
                      <View style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.1)',
                      }}>
                        <Pressable
                          onPress={() => {
                            navigation.getParent()?.navigate('TripsTab', {
                              screen: 'Checklist',
                              params: { tripId: message.tripId! }
                            });
                          }}
                          style={({ pressed }) => ({
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDark ? '#14B8A6' : '#F97316',
                            paddingHorizontal: 20,
                            paddingVertical: 12,
                            borderRadius: 24,
                            opacity: pressed ? 0.8 : 1,
                            shadowColor: isDark ? '#14B8A6' : '#F97316',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 3,
                          })}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                          />
                          <Text style={{
                            fontSize: 16,
                            fontFamily: 'Poppins-SemiBold',
                            color: '#FFFFFF',
                          }}>
                            Open Checklist
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </>
                )}
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'Poppins-Regular',
                  color: message.role === 'user'
                    ? (isDark ? '#C4B5FD' : '#A78BFA')
                    : (isDark ? '#9CA3AF' : '#6B7280'),
                  marginTop: 8,
                  opacity: 0.7,
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={{
              marginBottom: 16,
              alignItems: 'flex-start',
            }}>
              <Animated.View 
                style={{
                  backgroundColor: isDark 
                    ? 'rgba(30, 41, 59, 0.8)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 20,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(251, 146, 60, 0.1)',
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Animated.View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark 
                      ? 'rgba(139, 92, 246, 0.2)' 
                      : 'rgba(139, 92, 246, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    transform: [{ scale: pulseAnim }],
                  }}>
                    <Ionicons 
                      name="sparkles" 
                      size={16} 
                      color={isDark ? '#A78BFA' : '#8B5CF6'} 
                    />
                  </Animated.View>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    color: isDark ? '#A78BFA' : '#8B5CF6',
                    flex: 1,
                  }}>
                    {aiStatus}
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Animated.View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isDark ? '#A78BFA' : '#8B5CF6',
                    marginRight: 4,
                    opacity: dotAnim1,
                  }} />
                  <Animated.View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isDark ? '#A78BFA' : '#8B5CF6',
                    marginRight: 4,
                    opacity: dotAnim2,
                  }} />
                  <Animated.View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isDark ? '#A78BFA' : '#8B5CF6',
                    opacity: dotAnim3,
                  }} />
                </View>
              </Animated.View>
            </View>
          )}
        </ScrollView>

        {/* Input Section */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: Platform.OS === 'ios' ? 85 : 75, // Reduced padding to clear navigation bar
          marginBottom: Platform.OS === 'web' ? 50 : 0, // Reduced margin for web to clear tab bar
          borderTopWidth: 1,
          borderTopColor: isDark
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(251, 146, 60, 0.1)',
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
            <View style={{
              flex: 1,
              marginRight: 12,
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(251, 146, 60, 0.05)',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(251, 146, 60, 0.2)',
              minHeight: 48,
              maxHeight: 100,
            }}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Holly Bobz about your trip..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  paddingTop: 12,
                  fontSize: 16,
                  fontFamily: 'Poppins-Regular',
                  color: isDark ? '#F3F4F6' : '#1F2937',
                  minHeight: 24,
                  maxHeight: 76,
                  textAlignVertical: 'top',
                }}
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (inputText.trim() && !isLoading) {
                    handleSubmit();
                  }
                }}
                blurOnSubmit={false}
              />
            </View>
            
            <Pressable
              onPress={handleSubmit}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: inputText.trim() && !isLoading
                  ? (isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)')
                  : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 146, 60, 0.05)'),
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: inputText.trim() && !isLoading
                  ? (isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)')
                  : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(251, 146, 60, 0.1)'),
                opacity: inputText.trim() && !isLoading ? 1 : 0.5,
              }}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() && !isLoading
                  ? (isDark ? '#A78BFA' : '#8B5CF6')
                  : (isDark ? '#6B7280' : '#9CA3AF')} 
              />
            </Pressable>
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchased={() => {
          setShowPaywall(false);
          // Refresh entitlements
          window.location.reload(); // Simple refresh for now
        }}
      />
    </>
  );
}