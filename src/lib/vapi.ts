"use client";

import Vapi from "@vapi-ai/web";

// Singleton — Vapi solo vive en el navegador
let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
  if (typeof window === "undefined") {
    throw new Error("Vapi solo se inicializa en el navegador");
  }
  if (!vapiInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY no está configurada en .env.local");
    }
    vapiInstance = new Vapi(publicKey);
  }
  return vapiInstance;
}

/**
 * Mapeo de interviewer → ElevenLabs voice ID.
 *
 * Estos son IDs de la librería pública oficial de ElevenLabs, estables.
 * Cada voz fue elegida para matchear el personaje:
 *
 *   Sarah Chen      → Bella    (profesional, articulada — PM en Google)
 *   David Park      → Antoni   (cálido pero persuasivo — sales)
 *   Jamie Reeves    → Rachel   (compuesta, firme — recruiter senior)
 *   Marcus Williams → Josh     (calmo, mentor — career coach)
 *   Diana Kim       → Domi     (autoritativa — jefa)
 */
const TEMPLATE_VOICES: Record<string, string> = {
  "Sarah Chen": "EXAVITQu4vr4xnSDxMaL",       // Bella
  "David Park": "ErXwobaYiN019PkySvjV",        // Antoni
  "Jamie Reeves": "21m00Tcm4TlvDq8ikWAM",      // Rachel
  "Marcus Williams": "TxGEqnHWrfWFTfGW9XjX",   // Josh
  "Diana Kim": "AZnzlk1XvdvUeBnXmlld",         // Domi
};

// Pools de voces por genero para scenarios generados dinamicamente
const FEMALE_VOICES = [
  "EXAVITQu4vr4xnSDxMaL", // Bella
  "21m00Tcm4TlvDq8ikWAM", // Rachel
  "AZnzlk1XvdvUeBnXmlld", // Domi
];

const MALE_VOICES = [
  "ErXwobaYiN019PkySvjV", // Antoni
  "TxGEqnHWrfWFTfGW9XjX", // Josh
];

function getVoiceForScenario(scenario: {
  id: string;
  interviewer_name: string;
  voice_gender?: "male" | "female" | null;
}): string {
  // Template match: voz hardcodeada para los 5 originales
  const templateVoice = TEMPLATE_VOICES[scenario.interviewer_name];
  if (templateVoice) return templateVoice;

  // Dynamic: pool por genero, pick deterministico por hash del id
  const pool = scenario.voice_gender === "male" ? MALE_VOICES : FEMALE_VOICES;
  const hash = scenario.id
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

/**
 * Build de la config Vapi para una scene específica.
 *
 * Stack premium:
 *   - Transcriber: Deepgram nova-3 (state-of-the-art, mejor con acentos)
 *   - LLM: OpenAI gpt-4o-mini (suficiente con un persona prompt fuerte)
 *   - TTS: ElevenLabs eleven_turbo_v2_5 (calidad premium + baja latencia)
 */
export function buildAssistantConfig(scenario: {
  id: string;
  interviewer_name: string;
  interviewer_persona: string;
  language: string;
  duration_minutes: number;
  voice_gender?: "male" | "female" | null;
}) {
  return {
    name: scenario.interviewer_name,
    firstMessageMode: "assistant-speaks-first-with-model-generated-message" as const,

    model: {
      provider: "openai" as const,
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system" as const,
          content: scenario.interviewer_persona,
        },
      ],
    },

    voice: {
      provider: "11labs" as const,
      voiceId: getVoiceForScenario(scenario),
      // Turbo v2.5: la mejor combinación de calidad y latencia para conversación
      model: "eleven_turbo_v2_5",
    },

    transcriber: {
      // AssemblyAI Universal-Streaming: top tier para inglés acentuado.
      // Vapi gestiona el modelo Universal-Streaming internamente — no se pasa "model".
      // Solo inglés por ahora (Universal-Streaming no soporta otros idiomas todavía).
      provider: "assembly-ai" as const,
      language: "en" as const,
    },

    // Barge-in: cuándo el AI se calla si lo interrumpís
    stopSpeakingPlan: {
      numWords: 2,
      voiceSeconds: 0.3,
      backoffSeconds: 1,
    },

    // AssemblyAI u3-rt-pro tiene end-of-turn detection neural integrada.
    // No seteamos smartEndpointingPlan a propósito — lo pisaría.
    startSpeakingPlan: {
      waitSeconds: 0.4,
    },

    silenceTimeoutSeconds: 30,
    maxDurationSeconds: Math.min(scenario.duration_minutes * 60 + 300, 1800),
  };
}

export type TranscriptMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};
