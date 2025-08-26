import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useHolidayStore } from '../store/useHolidayStore';
import { BurgerMenuButton } from '../components/BurgerMenuButton';
import { DestinationContext } from '../components/DestinationContext';
import { TripTickLogo } from '../components/TripTickLogo';
import { CustomAlert } from "../components/CustomAlert";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, HollyChatParams } from "../navigation/AppNavigator";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

type TravellerType = "Solo" | "Couple" | "Family" | "Friends";

const BASE_PERSONA = `You are Holly Bobz, a travel expert with unparalleled knowledge of global destinations, from iconic landmarks to hidden gems. With confidence, directness, and empathy, you craft personalised itineraries tailored to diverse ages and interests, ensuring unforgettable experiences. Always be concise and practical. Include specific dates, opening times, and prices when known. Default to UK English and British spelling. Avoid emojis and any markdown formatting like asterisks, hashtags, or underscores. Write in plain text only. Never use ### or ## for headers - use plain text headings instead.`;

const DESTINATION_FOCUSED_PERSONA = `You are Holly Bobz, a travel expert specialising in detailed destination knowledge. You are currently focused on helping plan a specific trip. Stay focused on this destination unless explicitly asked about somewhere else. Provide specific, actionable advice with realistic timings, costs, and logistics. Always be concise and practical. Include specific dates, opening times, and prices when known. Default to UK English and British spelling. Avoid emojis and any markdown formatting like asterisks, hashtags, or underscores. Write in plain text only. Never use ### or ## for headers - use plain text headings instead.`;

// Function to get timer-specific history key
function getHistoryKey(timerId?: string): string {
  return timerId ? `holly_chat_history_${timerId}` : "holly_chat_history";
}

type BudgetMode = "Saver" | "Balanced" | "Premium";

const TRAVELLER_PRESETS: Array<{ type: TravellerType; icon: string; description: string }> = [
  { type: "Solo", icon: "🎒", description: "Solo adventure" },
  { type: "Couple", icon: "💕", description: "Romantic getaway" },
  { type: "Family", icon: "👨‍👩‍👧‍👦", description: "Family fun" },
  { type: "Friends", icon: "👥", description: "Group trip" },
];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Clean AI response text by removing hashtags, asterisks, and other formatting artifacts
 * @param text - The raw AI response text
 * @returns Cleaned text without formatting artifacts
 */
function cleanAIResponse(text: string): string {
  if (!text) return text;
  
  return text
    // Remove markdown headers (###, ##, #)
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers at start of lines
    .replace(/\n#{1,6}\s+/g, '\n') // Remove markdown headers after line breaks
    // Remove hashtags (words starting with #)
    .replace(/#\w+/g, '')
    // Remove asterisks used for emphasis/bold (both single and double)
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove underscores used for emphasis/italic
    .replace(/_/g, '')
    // Remove markdown-style formatting
    .replace(/`([^`]*)`/g, '$1') // Remove backticks but keep content
    .replace(/~~([^~]*)~~/g, '$1') // Remove strikethrough but keep content
    // Remove other common formatting patterns
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
    .replace(/_([^_]+)_/g, '$1') // Remove underscore formatting
    // Clean up numbered lists - remove extra spacing between items
    .replace(/(\d+\.\s+[^\n]+)\n\s*\n(\d+\.)/g, '$1\n$2') // Remove extra line breaks between numbered list items
    // Clean up bullet points - remove extra spacing between items
    .replace(/([-*]\s+[^\n]+)\n\s*\n([-*])/g, '$1\n$2') // Remove extra line breaks between bullet points
    // Clean up sub-bullets and descriptions
    .replace(/(\s*[-*]\s+[^\n]+)\n\s*\n(\s*[-*])/g, '$1\n$2') // Remove extra line breaks between sub-bullets
    .replace(/(\s*[-*]\s+[^\n]+)\n\s*\n(\s*Description:)/g, '$1\n$2') // Remove extra line breaks before descriptions
    .replace(/(Description:[^\n]+)\n\s*\n(\s*[-*])/g, '$1\n$2') // Remove extra line breaks after descriptions
    // Clean up spacing around line breaks
    .replace(/\n\s+/g, '\n') // Remove leading spaces after line breaks
    .replace(/\s+\n/g, '\n') // Remove trailing spaces before line breaks
    // Remove extra line breaks and normalize spacing
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace 3+ line breaks with 2
    .replace(/\n\s*\n/g, '\n\n') // Replace 2+ line breaks with 2
    // Remove multiple spaces within lines (but preserve line breaks)
    .replace(/[^\S\n]+/g, ' ') // Replace multiple spaces with single space, but preserve line breaks
    // Remove leading/trailing whitespace
    .trim();
}

function buildSystemPrompt(
  mode: BudgetMode, 
  travellerType: TravellerType,
  budget?: number, 
  ctx?: HollyChatParams["context"]
) {
  // Use destination-focused persona if we have destination context
  const baseLinesIntro = ctx?.destination ? [DESTINATION_FOCUSED_PERSONA] : [BASE_PERSONA];
  const lines: string[] = [...baseLinesIntro];
  
  lines.push(`Budget focus: ${mode}.`);
  lines.push(`Traveller type: ${travellerType} traveller(s).`);
  
  if (budget) lines.push(`Approximate budget: £${Math.round(budget)} per person.`);
  
  if (ctx?.destination) {
    lines.push(`DESTINATION FOCUS: You are helping plan a trip to ${ctx.destination}. Keep all advice specific to this destination unless explicitly asked about other places. Focus on ${ctx.destination}-specific recommendations, locations, opening hours, transport options, and realistic walking/travel times within ${ctx.destination}.`);
    
    if (ctx?.dateISO) {
      const season = getSeasonFromDate(ctx.dateISO);
      const dateStr = new Date(ctx.dateISO).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      lines.push(`Target travel date: ${dateStr} (${season} season in ${ctx.destination}).`);
    }
    
    if (ctx?.days) lines.push(`Trip length: ${ctx.days} days in ${ctx.destination}.`);
  } else {
    if (ctx?.dateISO) {
      const season = getSeasonFromDate(ctx.dateISO);
      lines.push(`Target date: ${ctx.dateISO} (${season} season).`);
    }
  if (ctx?.days) lines.push(`Trip length: ${ctx.days} days.`);
  }
  
  if (ctx?.travellers) lines.push(`Travellers: ${ctx.travellers}.`);
  
  // Add traveller-specific guidance
  const travellerGuidance = getTravellerGuidance(travellerType);
  lines.push(travellerGuidance);
  
  lines.push(`Always give realistic time blocks, transit between sights, and bookable suggestions where possible.`);
  lines.push(`IMPORTANT: Write all responses in plain text only. Do not use any formatting like asterisks (*), hashtags (#), underscores (_), or other markdown symbols.`);
  lines.push(`Keep responses concise and focused to provide the most value efficiently.`);
  lines.push(`CRITICAL: Do not use markdown headers like ### or ##. Instead, use plain text headings like "Outdoor Activities:" or "Day 1:".`);
  return lines.join("\n");
}

function getSeasonFromDate(dateISO: string): string {
  const date = new Date(dateISO);
  const month = date.getMonth(); // 0-11
  
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

function getTravellerGuidance(type: TravellerType): string {
  const guidance = {
    Solo: "Focus on solo-friendly activities, safety tips, and opportunities to meet others. Suggest hostels, walking tours, and solo dining options.",
    Couple: "Emphasise romantic experiences, intimate dining, sunset spots, and couple activities. Balance together time with optional separate interests.",
    Family: "Prioritise family-friendly activities, child safety, educational experiences, and manageable travel times. Include parks, museums, and kid-friendly restaurants.",
    Friends: "Suggest group activities, nightlife, shared experiences, and places suitable for socialising. Consider group discounts and activities that work for different interests.",
  };
  
  return guidance[type];
}

export function HollyChatScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "HollyChat">>();
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  const params = route.params;
  
  // Debug logging for parameters
  useEffect(() => {
    console.log('HollyChat received params:', params);
  }, [params]);
  const [mode, setMode] = useState<BudgetMode>("Balanced");
  const [perPerson, setPerPerson] = useState<string>("");

  const [travellerType, setTravellerType] = useState<TravellerType>("Couple");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const [seedUsed, setSeedUsed] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);

  // Removed handleSend - using existing send function

  useEffect(() => {
    (async () => {
      try {
        console.log('HollyChat: Initializing with params:', params);
        
        const historyKey = getHistoryKey(params?.context?.timerId);
        
        if (params?.reset) {
          console.log('HollyChat: Resetting chat history for timer:', params?.context?.timerId);
          await AsyncStorage.removeItem(historyKey);
        }
        
        const raw = await AsyncStorage.getItem(historyKey);
        if (raw) {
          console.log('HollyChat: Loading existing chat history');
          setMessages(JSON.parse(raw));
        } else {
          console.log('HollyChat: Creating new chat session');
          const sys: Msg = { id: makeId(), role: "system", content: buildSystemPrompt(mode, travellerType, Number(perPerson) || undefined, params?.context) };
          
          // Check if API keys are configured
          const openaiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
          const grokKey = process.env.EXPO_PUBLIC_VIBECODE_XAI_API_KEY;
          
          if (!openaiKey && !grokKey && !process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY && !process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY) {
            const greeting = "🔑 Hi! I'm Holly Bobz, but I need API keys to help you plan your adventure.\n\nPlease add your API keys to the .env file:\n\nEXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY=your_deepseek_key_here\nEXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=your_openai_key_here\nEXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=your_claude_key_here\nEXPO_PUBLIC_VIBECODE_XAI_API_KEY=your_grok_key_here\n\nI'll automatically use the most cost-effective available provider. Then restart the app and I'll be ready to help!";
            const hello: Msg = { id: makeId(), role: "assistant", content: greeting };
            setMessages([sys, hello]);
            return;
          }
          
          // Customize greeting based on whether we have destination context
          const greeting = params?.context?.destination 
            ? `Hi! I'm Holly Bobz, your travel expert, and I'm here to help you plan your trip to ${params.context.destination}. I've got all the local knowledge you need for an amazing adventure. What would you like to know about ${params.context.destination}?`
            : "Hi, I'm Holly Bobz, your travel expert! I can help craft the perfect itinerary for your adventure. Use the controls above to set your traveller type, budget mode, and preferences. What destination are you dreaming of?";
            
          const hello: Msg = { id: makeId(), role: "assistant", content: cleanAIResponse(greeting) };
          setMessages([sys, hello]);
        }
      } catch (error) {
        console.error('HollyChat: Error initializing chat:', error);
        const sys: Msg = { id: makeId(), role: "system", content: buildSystemPrompt(mode, travellerType, Number(perPerson) || undefined, params?.context) };
        
        // Customize greeting based on whether we have destination context
        const greeting = params?.context?.destination 
          ? `Hi! I'm Holly Bobz, your travel expert, and I'm here to help you plan your trip to ${params.context.destination}. I've got all the local knowledge you need for an amazing adventure. What would you like to know about ${params.context.destination}?`
          : "Hi, I'm Holly Bobz, your travel expert! I can help craft the perfect itinerary for your adventure. Use the controls above to set your traveller type, budget mode, and preferences. What destination are you dreaming of?";
          
        const hello: Msg = { id: makeId(), role: "assistant", content: cleanAIResponse(greeting) };
        setMessages([sys, hello]);
      }
    })();
  }, []);

  useEffect(() => {
    setMessages((m) => {
      if (m.length === 0) return m;
      const new0 = { ...m[0], content: buildSystemPrompt(mode, travellerType, Number(perPerson) || undefined, params?.context) };
      const copy = [...m]; copy[0] = new0; return copy;
    });
  }, [mode, travellerType, perPerson, params?.context?.destination, params?.context?.dateISO, params?.context?.days, params?.context?.travellers]);

  useEffect(() => { 
    const historyKey = getHistoryKey(params?.context?.timerId);
    const toSave = messages.slice(-21); 
    AsyncStorage.setItem(historyKey, JSON.stringify(toSave)).catch(() => {}); 
  }, [messages, params?.context?.timerId]);

  useEffect(() => {
    console.log('Checking seed processing:', { 
      seedQuery: params?.seedQuery, 
      seedUsed, 
      messagesLength: messages.length 
    });
    
    if (params?.seedQuery && !seedUsed && messages.length > 0) {
      console.log('Processing seed query:', params.seedQuery);
      setSeedUsed(true);
      const msg: Msg = { id: makeId(), role: "user", content: params.seedQuery };
      setMessages((m) => [...m, msg]);
      void sendInternal(msg);
    }
  }, [params?.seedQuery, messages.length, seedUsed]);

  async function callOpenAI(msgs: Msg[]) {
      const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY as string | undefined;
      console.log('HollyChat: OpenAI API key available:', !!apiKey);
      if (!apiKey) throw new Error("Missing OpenAI API key in EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY");
    
      const body = {
        model: "gpt-3.5-turbo", // More cost-effective than gpt-4o-mini
        messages: msgs.map(({ role, content }) => ({ role, content })),
        temperature: 0.4,
        max_tokens: 1000, // Limit tokens to reduce costs
      };
    
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
    
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("OpenAI rate limit exceeded. Try switching to Grok or wait a moment.");
      } else if (res.status === 401) {
        throw new Error("Invalid OpenAI API key. Please check your key is correct.");
      } else {
        const errorText = await res.text();
        throw new Error(`OpenAI error: ${res.status} ${errorText}`);
      }
    }
    
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "Sorry, I could not produce a reply.";
  }

  async function callDeepSeek(msgs: Msg[]) {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY as string | undefined;
    console.log('HollyChat: DeepSeek API key available:', !!apiKey);
    if (!apiKey) throw new Error("Missing DeepSeek API key in EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY");
    
    const body = {
      model: "deepseek-chat",
      messages: msgs.map(({ role, content }) => ({ role, content })),
      temperature: 0.4,
      max_tokens: 1000, // Limit tokens to reduce costs
    };
    
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("DeepSeek rate limit exceeded. Trying next provider.");
      } else if (res.status === 401) {
        throw new Error("Invalid DeepSeek API key. Please check your key is correct.");
      } else {
        const errorText = await res.text();
        throw new Error(`DeepSeek error: ${res.status} ${errorText}`);
      }
    }
    
    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "Sorry, I could not produce a reply.";
  }

  async function callClaude(msgs: Msg[]) {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY as string | undefined;
    console.log('HollyChat: Claude API key available:', !!apiKey);
    if (!apiKey) throw new Error("Missing Claude API key in EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY");
    
    const body = {
      model: "claude-3-5-sonnet-20241022",
      messages: msgs.map(({ role, content }) => ({ role, content })),
      temperature: 0.4,
      max_tokens: 1000, // Limit tokens to reduce costs
    };
    
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${apiKey}`,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Claude rate limit exceeded. Trying next provider.");
      } else if (res.status === 401) {
        throw new Error("Invalid Claude API key. Please check your key is correct.");
      } else {
        const errorText = await res.text();
        throw new Error(`Claude error: ${res.status} ${errorText}`);
      }
    }
    
    const json = await res.json();
    return json.content?.[0]?.text ?? "Sorry, I could not produce a reply.";
  }

  async function callGrok(msgs: Msg[]) {
    const apiKey = process.env.EXPO_PUBLIC_VIBECODE_XAI_API_KEY as string | undefined;
    console.log('HollyChat: Grok API key available:', !!apiKey);
    if (!apiKey) throw new Error("Missing Grok API key in EXPO_PUBLIC_VIBECODE_XAI_API_KEY");
    
    const body = {
      model: "grok-beta", // More cost-effective than grok-4
      messages: msgs.map(({ role, content }) => ({ role, content })),
      temperature: 0.4,
      max_tokens: 1000, // Limit tokens to reduce costs
      stream: false,
    };
    
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Grok rate limit exceeded. Trying next provider.");
      } else if (res.status === 401) {
        throw new Error("Invalid Grok API key. Please check your key is correct.");
      } else {
        const errorText = await res.text();
        throw new Error(`Grok error: ${res.status} ${errorText}`);
      }
    }
    
      const json = await res.json();
    return json.choices?.[0]?.message?.content ?? "Sorry, I could not produce a reply.";
  }

  async function sendInternal(userMsg: Msg) {
    console.log('HollyChat: Sending message:', userMsg.content);
    setLoading(true);
    try {
      // Truncate message history to reduce token usage and costs
      const maxMessages = 10; // Keep only last 10 messages for context
      const recentMessages = messages.slice(-maxMessages);
      const allMessages = recentMessages.concat(userMsg);
      console.log('HollyChat: Total messages to send:', allMessages.length);
      
      let content: string;
      let usedProvider = '';
      
      // Try providers in cost-effective order: DeepSeek → OpenAI → Claude → Grok
      const providers = [
        { name: 'DeepSeek', call: callDeepSeek },
        { name: 'OpenAI', call: callOpenAI },
        { name: 'Claude', call: callClaude },
        { name: 'Grok', call: callGrok }
      ];

      let lastError: any = null;
      
      for (const provider of providers) {
        try {
          console.log(`HollyChat: Trying ${provider.name} provider`);
          content = await provider.call(allMessages);
          usedProvider = provider.name;
          break;
        } catch (error: any) {
          console.log(`HollyChat: ${provider.name} failed:`, error.message);
          lastError = error;
          
          // Continue to next provider unless it's a non-API issue
          if (!error.message.includes('rate limit') && 
              !error.message.includes('Invalid API key') &&
              !error.message.includes('Missing') &&
              !error.message.includes('401') &&
              !error.message.includes('429')) {
            throw error; // Non-API error, don't retry
          }
        }
      }
      
      if (!content) {
        throw lastError || new Error('All AI providers failed');
      }
      
      console.log(`HollyChat: Successfully used ${usedProvider} provider`);
      
      console.log('HollyChat: Received response:', content.substring(0, 100) + '...');
      console.log('HollyChat: Original content length:', content.length);
      console.log('HollyChat: Original content contains formatting:', {
        hasHashtags: /#\w+/.test(content),
        hasAsterisks: /\*/.test(content),
        hasUnderscores: /_/.test(content),
        hasBackticks: /`/.test(content)
      });
      
      const cleanedContent = cleanAIResponse(content);
      console.log('HollyChat: Cleaned content length:', cleanedContent.length);
      console.log('HollyChat: Cleaning removed characters:', content.length - cleanedContent.length);
      
      // Check if this is a quest completion
      if (params?.context?.questId && params?.context?.questReward) {
        const { questId, questReward } = params.context;
        console.log(`Quest completion detected: ${questId} for ${questReward} XP`);
        
        // Get the timer ID from the context or find it by destination
        const timerId = params?.context?.timerId;
        if (timerId) {
          // Complete the quest and award XP
          const { completeQuest, awardXP } = useHolidayStore.getState();
          completeQuest(timerId, questId);
          awardXP(timerId, questReward);
          
          // Add a quest completion message
          const questCompletionMsg = `🎉 Quest completed! You earned ${questReward} XP!`;
          setMessages((m) => [...m, { 
            id: makeId(), 
            role: "assistant", 
            content: cleanedContent 
          }, { 
            id: makeId(), 
            role: "assistant", 
            content: questCompletionMsg 
          }]);
        } else {
          setMessages((m) => [...m, { id: makeId(), role: "assistant", content: cleanedContent }]);
        }
      } else {
        setMessages((m) => [...m, { id: makeId(), role: "assistant", content: cleanedContent }]);
      }
      
      listRef.current?.scrollToEnd({ animated: true });
    } catch (e: any) {
      console.error('HollyChat: Error sending message:', e);
      // Improved error handling with empathetic messaging
      const errorMsg = e.message.includes('Missing') && e.message.includes('API key')
        ? "🔑 API key not configured. Please add your API keys to the .env file:\n\nEXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY=your_deepseek_key_here\nEXPO_PUBLIC_VIBECODE_OPENAI_API_KEY=your_openai_key_here\nEXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY=your_claude_key_here\nEXPO_PUBLIC_VIBECODE_XAI_API_KEY=your_grok_key_here\n\nI'll automatically use the most cost-effective available provider. Then restart the app and I'll be ready to help!"
        : e.message.includes('rate limit') 
        ? "Holly's taking a quick break due to high demand—try again in a moment! ☕"
        : e.message.includes('Invalid API key')
        ? "🔑 Invalid API key. Please check your API key is correct in the .env file."
        : "Holly's having a brief technical hiccup—please try again soon! 🔧";
        
      setMessages((m) => [...m, { 
        id: makeId(), 
        role: "assistant", 
        content: errorMsg 
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function copyMessage(content: string) {
    try {
      await Clipboard.setStringAsync(content);
      // Show a brief success message using a toast-like approach
      const successMsg = "✅ Copied to clipboard!";
      setMessages((m) => [...m, { 
        id: makeId(), 
        role: "assistant", 
        content: successMsg 
      }]);
      // Remove the success message after 1.5 seconds
      setTimeout(() => {
        setMessages((m) => m.filter(msg => msg.content !== successMsg));
      }, 1500);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Show error message
      const errorMsg = "❌ Failed to copy message";
      setMessages((m) => [...m, { 
        id: makeId(), 
        role: "assistant", 
        content: errorMsg 
      }]);
      setTimeout(() => {
        setMessages((m) => m.filter(msg => msg.content !== errorMsg));
      }, 1500);
    }
  }

  async function shareItinerary() {
    try {
      const assistantMessages = messages
        .filter(m => m.role === "assistant")
        .map(m => m.content)
        .join('\n\n---\n\n');
      
      const shareContent = `My Travel Itinerary - Crafted by Holly Bobz\n\n${assistantMessages}\n\n✈️ Generated by TripTick App`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync({
          message: shareContent,
          title: "My Travel Itinerary",
        });
      } else {
        Alert.alert("Sharing not available", "Sharing is not available on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not share itinerary. Please try again.");
    }
  }

  function clearChat() {
    if (Platform.OS === 'web') {
      setShowClearAlert(true);
    } else {
      Alert.alert(
        "Clear Chat History?",
        "This will remove all messages with Holly Bobz. Your travel plans will be lost!",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Clear", 
            style: "destructive", 
            onPress: () => {
              setMessages([{
                id: makeId(),
                role: "assistant",
                content: cleanAIResponse("Hi, I'm Holly Bobz! Ready to plan your next adventure? 🌍")
              }]);
              const historyKey = getHistoryKey(params?.context?.timerId);
              AsyncStorage.removeItem(historyKey).catch(() => {});
            }
          },
        ]
      );
    }
  }

  async function send() {
    const text = input.trim(); 
    if (!text) return;
    console.log('Manual send:', text);
    setInput("");
    const userMsg: Msg = { id: makeId(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    await sendInternal(userMsg);
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#F7F7F7' }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Static Header Banner */}
      <View style={{
        backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 60 : 16,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#444444' : '#E5E5E5',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TripTickLogo size="lg" />
            <Text
              style={{
                color: isDark ? '#FFFFFF' : '#333333',
                fontSize: 20,
                fontFamily: 'Poppins-SemiBold',
              }}
            >
              TripTick
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: isDark ? '#444444' : '#F0F0F0',
              borderRadius: 12,
              padding: 8,
            }}
          >
            <Ionicons name="close" size={20} color={isDark ? '#FFFFFF' : '#333333'} />
          </Pressable>
        </View>
      </View>

      {/* Chat Controls */}
      <View style={{ 
        padding: 16, 
        backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF', 
        borderBottomWidth: 1, 
        borderBottomColor: isDark ? '#374151' : '#E5E5E5',
      }}>
        
        <Text style={{ 
          fontSize: 14, 
          fontFamily: 'Poppins-SemiBold', 
          color: isDark ? '#FFFFFF' : '#333333',
          marginBottom: 12,
        }}>
          Traveller Type
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
        >
          {TRAVELLER_PRESETS.map((preset) => (
            <Pressable 
              key={preset.type}
              onPress={() => setTravellerType(preset.type)}
              style={{
                backgroundColor: preset.type === travellerType ? '#FFD93D' : (isDark ? '#374151' : '#F7F7F7'),
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
                minWidth: 90,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: preset.type === travellerType ? 0.1 : 0,
                shadowRadius: 4,
                elevation: preset.type === travellerType ? 2 : 0,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 6 }}>
                {preset.icon}
              </Text>
              <Text style={{
                color: preset.type === travellerType ? '#333333' : (isDark ? '#CCCCCC' : '#666666'),
                fontSize: 12,
                fontFamily: 'Poppins-SemiBold',
                textAlign: 'center',
              }}>
                {preset.type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        
        <Text style={{ 
          fontSize: 14, 
          fontFamily: 'Poppins-SemiBold', 
          color: isDark ? '#FFFFFF' : '#333333',
          marginBottom: 12,
        }}>
          Budget Mode
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {(["Saver","Balanced","Premium"] as BudgetMode[]).map((m) => (
            <Pressable 
              key={m} 
              onPress={() => setMode(m)} 
              style={{
                backgroundColor: m === mode ? '#4ECDC4' : (isDark ? '#374151' : '#F7F7F7'),
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: m === mode ? 0.1 : 0,
                shadowRadius: 2,
                elevation: m === mode ? 1 : 0,
              }}
            >
              <Text style={{
                color: m === mode ? '#FFFFFF' : (isDark ? '#CCCCCC' : '#333333'),
                fontSize: 14,
                fontFamily: 'Poppins-SemiBold',
              }}>
                {m}
              </Text>
            </Pressable>
          ))}
          
          <View style={{ flex: 1 }} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 14, 
              fontFamily: 'Poppins-Medium', 
              color: isDark ? '#CCCCCC' : '#666666',
              marginRight: 10,
            }}>
              £/person
            </Text>
            <TextInput 
              keyboardType="numeric" 
              value={perPerson} 
              onChangeText={setPerPerson} 
              placeholder="150" 
              placeholderTextColor={isDark ? '#888888' : '#999999'}
              style={{
                width: 90,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E5E5',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 14,
                fontFamily: 'Poppins-Regular',
                color: isDark ? '#FFFFFF' : '#333333',
                backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
              }}
            />
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={messages.filter(m => m.role !== "system")}
        keyExtractor={(item) => item.id}
          style={{ flex: 1, backgroundColor: isDark ? '#1a1a1a' : '#F7F7F7' }}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={{
            marginBottom: 16,
            alignSelf: item.role === "assistant" ? "flex-start" : "flex-end",
            maxWidth: item.role === "assistant" ? '88%' : '85%',
            backgroundColor: item.role === "assistant" ? (isDark ? '#2a2a2a' : '#FFFFFF') : '#FF6B6B',
            borderRadius: item.role === "assistant" ? 20 : 16,
            paddingHorizontal: item.role === "assistant" ? 20 : 16,
            paddingVertical: item.role === "assistant" ? 16 : 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: item.role === "assistant" ? 3 : 1 },
            shadowOpacity: isDark ? 0.4 : (item.role === "assistant" ? 0.1 : 0.05),
            shadowRadius: item.role === "assistant" ? 6 : 2,
            elevation: item.role === "assistant" ? 4 : 2,
            borderWidth: isDark && item.role === "assistant" ? 1 : 0,
            borderColor: isDark ? '#4a5568' : 'transparent',
          }}>
            {item.role === "assistant" && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{
                  fontSize: 13,
                  fontFamily: 'Poppins-SemiBold',
                  color: '#4ECDC4',
                  letterSpacing: 0.3,
                }}>
                  Holly Bobz ✨
                </Text>
                <Pressable
                  onPress={() => copyMessage(item.content)}
                  style={{
                    backgroundColor: isDark ? '#374151' : '#F3F4F6',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Ionicons name="copy-outline" size={14} color={isDark ? '#CCCCCC' : '#666666'} />
                </Pressable>
              </View>
            )}
            <Text style={{
              color: item.role === "assistant" 
                ? (isDark ? '#FFFFFF' : '#333333')
                : '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Poppins-Regular',
              lineHeight: 22,
              letterSpacing: 0,
            }}>
              {item.content}
            </Text>
          </View>
        )}
        ListFooterComponent={loading ? (
          <View style={{ alignItems: 'center', margin: 16 }}>
            <ActivityIndicator size="small" color="#FF6B6B" />
            <Text style={{
              fontSize: 14,
              fontFamily: 'Poppins-Medium',
              color: isDark ? '#B0B0B0' : '#666666',
              marginTop: 8,
              letterSpacing: 0.3,
            }}>
              Holly is crafting your perfect itinerary...
            </Text>
          </View>
        ) : null}
          onContentSizeChange={() => {
            setTimeout(() => {
              listRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          onLayout={() => {
            setTimeout(() => {
              listRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
        />
      </View>
      
      <View style={{ 
        padding: 16, 
        backgroundColor: isDark ? '#2a2a2a' : '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: isDark ? '#374151' : '#E5E5E5',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 12,
              fontFamily: 'Poppins-Medium',
              color: isDark ? '#CCCCCC' : '#666666',
            }}>
                              {travellerType} • {mode}
          {params?.context?.destination && ` • ${params.context.destination} focused`}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {messages.length > 2 && (
              <>
                <Pressable
                  onPress={shareItinerary}
                  style={{
                    backgroundColor: '#FFD93D',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-SemiBold',
                    color: '#333333',
                  }}>
                    Share ↗
                  </Text>
                </Pressable>
                
                <Pressable
                  onPress={clearChat}
                  style={{
                    backgroundColor: isDark ? '#374151' : '#F7F7F7',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Medium',
                    color: isDark ? '#CCCCCC' : '#666666',
                  }}>
                    Clear
                  </Text>
                </Pressable>
              </>
            )}
            
            {loading && (
              <Text style={{
                fontSize: 13,
                fontFamily: 'Poppins-Medium',
                color: '#4ECDC4',
                letterSpacing: 0.3,
              }}>
                Holly is typing...
              </Text>
            )}
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about itineraries, kid friendly options, or best months"
            placeholderTextColor={isDark ? '#888888' : '#999999'}
            style={{
              flex: 1,
              borderWidth: 2,
              borderColor: loading ? (isDark ? '#374151' : '#E5E5E5') : '#FF6B6B',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              fontFamily: 'Poppins-Regular',
              color: isDark ? '#FFFFFF' : '#333333',
              backgroundColor: loading ? (isDark ? '#1a1a1a' : '#F7F7F7') : (isDark ? '#1a1a1a' : '#FFFFFF'),
            }}
          autoCapitalize="sentences"
          returnKeyType="send"
          onSubmitEditing={send}
            editable={!loading}
          />
          
          <Pressable 
                          onPress={send} 
            disabled={loading}
            style={{
              backgroundColor: loading ? (isDark ? '#374151' : '#E5E5E5') : '#FF6B6B',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 16,
              minWidth: 80,
              alignItems: 'center',
            }}
          >
            <Text style={{
              color: loading ? (isDark ? '#888888' : '#999999') : '#FFFFFF',
              fontSize: 16,
              fontFamily: 'Poppins-SemiBold',
            }}>
              Send
            </Text>
        </Pressable>
        </View>
      </View>

      {/* Custom Alert for Web */}
      <CustomAlert
        visible={showClearAlert}
        title="Clear Chat History?"
        message="This will remove all messages with Holly Bobz. Your travel plans will be lost!"
        buttons={[
          { text: "Cancel", style: "cancel" },
          { 
            text: "Clear", 
            style: "destructive", 
            onPress: () => {
              setMessages([{
                id: makeId(),
                role: "assistant",
                content: cleanAIResponse("Hi, I'm Holly Bobz! Ready to plan your next adventure? 🌍")
              }]);
              const historyKey = getHistoryKey(params?.context?.timerId);
              AsyncStorage.removeItem(historyKey).catch(() => {});
            }
          },
        ]}
        onClose={() => setShowClearAlert(false)}
      />
    </KeyboardAvoidingView>
  );
}