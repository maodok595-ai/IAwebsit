import Anthropic from "@anthropic-ai/sdk";

// Use Claude (Replit Agent's own model) for maximum intelligence and capability
export const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY!,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

// Claude Sonnet 4.5 - the SAME model as Replit Agent itself
export const DEFAULT_MODEL = "claude-sonnet-4-5";
