/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a custom client for the Deepseek API. You may update this service, but you should not need to.

Valid model names: 
deepseek-chat
deepseek-coder
deepseek-reasoner
*/
import OpenAI from "openai";

export const getDeepseekClient = () => {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn("Deepseek API key not found in environment variables");
  }
  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.deepseek.com/v1",
    dangerouslyAllowBrowser: true,
  });
};
