import OpenAI from "openai";

// Use AI - prioritize Replit AI Integrations (included in Replit), fallback to user's OpenAI key
export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
});

// Use the best available model
export const DEFAULT_MODEL = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ? "gpt-5" : "gpt-4o";
