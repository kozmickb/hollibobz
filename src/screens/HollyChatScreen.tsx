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
import { RootStackParamList } from '../navigation/AppNavigator';
import { useThemeStore } from '../store/useThemeStore';
import { ThemeButton } from '../components/ThemeButton';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { getDeepseekTextResponse, getOpenAITextResponse, getGrokTextResponse } from '../api/chat-service';
import { AIMessage } from '../types/ai';

type HollyChatNav = NativeStackNavigationProp<RootStackParamList, "HollyChat">;
type HollyChatRoute = RouteProp<RootStackParamList, "HollyChat">;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function HollyChatScreen() {
  const navigation = useNavigation<HollyChatNav>();
  const route = useRoute<HollyChatRoute>();
  const { isDark } = useThemeStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  // Initialize with seed query if provided
  useEffect(() => {
    // Check API status on component mount
    checkAPIStatus();
    
    // Pre-load destination context if available
    if (route.params?.context?.destination && messages.length === 0) {
      const destination = route.params.context.destination;
      const date = route.params.context.dateISO;
      const adults = route.params.context.adults || 1;
      const children = route.params.context.children || 0;
      const duration = route.params.context.duration || 7;
      
      let welcomeContent = `🌟 Welcome to HollyBobz AI! I'm here to help you plan your amazing trip to **${destination}**.\n\n`;
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
      const welcomeContent = `🌟 **Welcome to HollyBobz AI!**\n\nI'm your personal travel planning assistant, here to help you with:\n\n` +
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
  }, [route.params?.seedQuery, route.params?.context?.destination]);

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

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
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

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: content.trim(),
      });

      // Add context about the trip if available
      let systemPrompt = "You are HollyBobz AI, a friendly and knowledgeable AI travel assistant. You help users plan amazing trips with personalized advice, insider tips, and detailed recommendations. Be enthusiastic, helpful, and provide practical travel advice.";
      
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

      // Try Deepseek first, then GPT, then Grok
      let response;
      let apiUsed = '';

      try {
        // Try Deepseek first
        setAiStatus('Holly is thinking...');
        const deepseekKey = process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY;
        if (deepseekKey) {
          response = await getDeepseekTextResponse(messagesWithSystem, {
            temperature: 0.7,
            maxTokens: 1000,
          });
          apiUsed = 'Deepseek';
        } else {
          throw new Error('Deepseek API key not configured');
        }
      } catch (deepseekError) {
        console.log('Deepseek failed, trying OpenAI...');
        setAiStatus('Holly is thinking...');
        try {
          // Try OpenAI second
          const openaiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
          if (openaiKey) {
            response = await getOpenAITextResponse(messagesWithSystem, {
              temperature: 0.7,
              maxTokens: 1000,
            });
            apiUsed = 'OpenAI';
          } else {
            throw new Error('OpenAI API key not configured');
          }
        } catch (openaiError) {
          console.log('OpenAI failed, trying Grok...');
          setAiStatus('Holly is thinking...');
          try {
            // Try Grok third
            const grokKey = process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY;
            if (grokKey) {
              response = await getGrokTextResponse(messagesWithSystem, {
                temperature: 0.7,
                maxTokens: 1000,
              });
              apiUsed = 'Grok';
            } else {
              throw new Error('Grok API key not configured');
            }
          } catch (grokError) {
            console.log('All APIs failed, using fallback');
            setAiStatus('Holly is thinking...');
            throw new Error('All API keys not configured');
          }
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };

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
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
                Chat with Holly
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
                    {message.content}
                  </Markdown>
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
            gap: 12,
          }}>
            <View style={{
              flex: 1,
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(251, 146, 60, 0.05)',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: isDark 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(251, 146, 60, 0.2)',
            }}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Holly about your trip..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  fontFamily: 'Poppins-Regular',
                  color: isDark ? '#F3F4F6' : '#1F2937',
                  maxHeight: 100,
                }}
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
  );
}