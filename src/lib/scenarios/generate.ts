import "server-only";
import { getAnthropicClient } from "@/lib/anthropic";
import { GeneratedScenarioSchema, type GeneratedScenario } from "./schema";

const SCENARIO_MODEL = "claude-haiku-4-5-20251001";

// Tool definition para que Claude estructure el output como objeto validable
export const createScenarioTool = {
  name: "create_scenario",
  description: "Design a realistic conversation partner for the user to rehearse with.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: {
        type: "string",
        description: "Concise, evocative title (5-7 words). Avoid generic phrases.",
      },
      category: {
        type: "string",
        enum: [
          "interview",
          "negotiation",
          "difficult-conversation",
          "pitch",
          "social",
          "presentation",
          "other",
        ],
      },
      level: {
        type: "string",
        enum: ["beginner", "intermediate", "advanced"],
      },
      description: {
        type: "string",
        description: "2-3 sentence summary of what the user will rehearse.",
      },
      duration_minutes: {
        type: "integer",
        minimum: 3,
        maximum: 15,
      },
      difficulty: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "1 = cooperative partner. 5 = hostile, every objection.",
      },
      interviewer_name: {
        type: "string",
        description: "Realistic first and last name fitting the role and cultural context.",
      },
      interviewer_persona: {
        type: "string",
        description: "Detailed system prompt (200-400 words) for the voice AI roleplaying this character. Write in second-person. Include role, age, stance, speaking style, values, pushback patterns. Always in English.",
      },
      voice_gender: {
        type: "string",
        enum: ["male", "female"],
      },
    },
    required: [
      "title",
      "category",
      "level",
      "description",
      "duration_minutes",
      "difficulty",
      "interviewer_name",
      "interviewer_persona",
      "voice_gender",
    ],
  },
};

const SYSTEM_PROMPT = [
  'You are a scenario designer for "Practice" — a voice-first AI app where users rehearse high-stakes conversations.',
  "",
  "Given the user's description, design a realistic AI partner: a character with name, personality, motivations, and speaking style. The interviewer_persona field becomes the system prompt for a voice AI roleplaying this character live.",
  "",
  "CRITICAL RULES:",
  "1. Characters must be REALISTIC, not caricatures. They have legitimate reasons for their position. The user should learn from the exchange.",
  "2. interviewer_persona MUST be in English (voice AI works best in English). User input may be Spanish or other languages — translate context into clean English persona.",
  "3. The character responds as a HUMAN, never breaks role to give coaching feedback.",
  "4. Difficulty matches what the user requested. Easy = 1-2. Tough/high-stakes = 4-5.",
  "5. Voice gender fits the name culturally.",
  "6. Always call create_scenario. Never respond with plain text.",
].join("\n");

export async function generateScenario(
  userDescription: string
): Promise<GeneratedScenario> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: SCENARIO_MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    tools: [createScenarioTool],
    tool_choice: { type: "tool", name: "create_scenario" },
    messages: [
      {
        role: "user",
        content: `Design a rehearsal scenario for this request:\n\n"${userDescription}"`,
      },
    ],
  });

  // Extraer el tool_use block
  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use block");
  }

  // Validar con Zod
  return GeneratedScenarioSchema.parse(toolUse.input);
}
