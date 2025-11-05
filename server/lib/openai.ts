import OpenAI from "openai";

// Use direct OpenAI API with user's API key for more powerful AI capabilities
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_KEY ? undefined : process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Use GPT-4 for better code generation and conversation
export const DEFAULT_MODEL = process.env.OPENAI_API_KEY ? "gpt-4-turbo-preview" : "gpt-5";
