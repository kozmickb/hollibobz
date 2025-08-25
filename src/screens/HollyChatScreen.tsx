import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList, HollyChatParams } from "../navigation/AppNavigator";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

const BASE_PERSONA = `You are Holly Bobz, a travel expert with unparalleled knowledge of global destinations, from iconic landmarks to hidden gems. With confidence, directness, and empathy, you craft personalised itineraries tailored to diverse ages and interests, ensuring unforgettable experiences. Always be concise and practical. Include specific dates, opening times, and prices when known. Default to UK English and British spelling. Avoid emojis.`;

const HISTORY_KEY = "holly_chat_history";

type BudgetMode = "Saver" | "Balanced" | "Premium";

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function buildSystemPrompt(mode: BudgetMode, budget?: number, ctx?: HollyChatParams["context"]) {
  const lines: string[] = [BASE_PERSONA];
  lines.push(`Budget focus: ${mode}.`);
  if (budget) lines.push(`Approximate budget: £${Math.round(budget)} per person.`);
  if (ctx?.destination) lines.push(`Destination of interest: ${ctx.destination}.`);
  if (ctx?.dateISO) lines.push(`Target date: ${ctx.dateISO}.`);
  if (ctx?.days) lines.push(`Trip length: ${ctx.days} days.`);
  if (ctx?.travellers) lines.push(`Travellers: ${ctx.travellers}.`);
  lines.push(`Always give realistic time blocks, transit between sights, and bookable suggestions where possible.`);
  return lines.join("\n");
}

export function HollyChatScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "HollyChat">>();
  const params = route.params;
  const [mode, setMode] = useState<BudgetMode>("Balanced");
  const [perPerson, setPerPerson] = useState<string>("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const [seedUsed, setSeedUsed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (params?.reset) await AsyncStorage.removeItem(HISTORY_KEY);
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) {
          setMessages(JSON.parse(raw));
        } else {
          const sys: Msg = { id: makeId(), role: "system", content: buildSystemPrompt(mode, Number(perPerson) || undefined, params?.context) };
          const hello: Msg = { id: makeId(), role: "assistant", content: "Hi, I am Holly Bobz. Tell me where you are heading, dates, group, and budget per person." };
          setMessages([sys, hello]);
        }
      } catch {
        const sys: Msg = { id: makeId(), role: "system", content: buildSystemPrompt(mode, Number(perPerson) || undefined, params?.context) };
        const hello: Msg = { id: makeId(), role: "assistant", content: "Hi, I am Holly Bobz. Tell me where you are heading, dates, group, and budget per person." };
        setMessages([sys, hello]);
      }
    })();
  }, []);

  useEffect(() => {
    setMessages((m) => {
      if (m.length === 0) return m;
      const new0 = { ...m[0], content: buildSystemPrompt(mode, Number(perPerson) || undefined, params?.context) };
      const copy = [...m]; copy[0] = new0; return copy;
    });
  }, [mode, perPerson, params?.context?.destination, params?.context?.dateISO, params?.context?.days, params?.context?.travellers]);

  useEffect(() => { const toSave = messages.slice(-21); AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(toSave)).catch(() => {}); }, [messages]);

  useEffect(() => {
    if (params?.seedQuery && !seedUsed && messages.length > 0) {
      setSeedUsed(true);
      const msg: Msg = { id: makeId(), role: "user", content: params.seedQuery };
      setMessages((m) => [...m, msg]);
      void sendInternal(msg);
    }
  }, [params?.seedQuery, messages.length, seedUsed]);

  async function sendInternal(userMsg: Msg) {
    setLoading(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY as string | undefined;
      if (!apiKey) throw new Error("Missing OpenAI API key in EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY");
      const body = {
        model: "gpt-4o-mini",
        messages: messages.concat(userMsg).map(({ role, content }) => ({ role, content })),
        temperature: 0.4,
      };
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content ?? "Sorry, I could not produce a reply.";
      setMessages((m) => [...m, { id: makeId(), role: "assistant", content }]);
      listRef.current?.scrollToEnd({ animated: true });
    } catch (e: any) {
      setMessages((m) => [...m, { id: makeId(), role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const text = input.trim(); if (!text) return;
    setInput("");
    const userMsg: Msg = { id: makeId(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    await sendInternal(userMsg);
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.select({ ios: "padding", android: undefined })}>
      <View className="px-3 pt-3 pb-1 border-b border-slate-200">
        <Text className="mb-2 font-semibold">Budget mode</Text>
        <View className="flex-row gap-x-2">
          {(["Saver","Balanced","Premium"] as BudgetMode[]).map((m) => (
            <Pressable key={m} onPress={() => setMode(m)} className={m===mode ? "bg-slate-900 px-3 py-2 rounded" : "bg-slate-200 px-3 py-2 rounded"}>
              <Text className={m===mode ? "text-white" : "text-slate-900"}>{m}</Text>
            </Pressable>
          ))}
          <View className="flex-1" />
          <View className="flex-row items-center">
            <Text className="mr-2">£/person</Text>
            <TextInput keyboardType="numeric" value={perPerson} onChangeText={setPerPerson} placeholder="eg 150" className="w-24 border border-slate-300 rounded px-2 py-1" />
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages.filter(m => m.role !== "system")}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className={item.role === "assistant" ? "mb-3 self-start max-w-[85%] bg-slate-100 rounded-xl px-3 py-2" : "mb-3 self-end max-w-[85%] bg-indigo-600 rounded-xl px-3 py-2"}>
            <Text className={item.role === "assistant" ? "text-slate-900" : "text-white"}>{item.content}</Text>
          </View>
        )}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 12 }} /> : null}
      />
      <View className="flex-row items-center p-3 border-t border-slate-200 gap-x-2">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about itineraries, kid friendly options, or best months"
          className="flex-1 border border-slate-300 rounded-md px-3 py-3"
          autoCapitalize="sentences"
          returnKeyType="send"
          onSubmitEditing={send}
        />
        <Pressable onPress={send} className="bg-indigo-600 px-4 py-3 rounded-md">
          <Text className="text-white font-semibold">Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}