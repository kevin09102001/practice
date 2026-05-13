import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Singleton — el SDK maneja su propio HTTP pool internamente
let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY no configurada en .env.local");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

// Modelo fijo para feedback generation.
// Claude Haiku 4.5 es el sweet spot precio/calidad/velocidad para este caso de uso.
export const FEEDBACK_MODEL = "claude-haiku-4-5-20251001";
