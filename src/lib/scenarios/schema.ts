/**
 * Schema del scenario generado dinámicamente por Claude.
 * Validamos con Zod después del tool_use para garantizar shape correcto.
 */
import { z } from "zod";

export const GeneratedScenarioSchema = z.object({
  title: z.string().min(5).max(80),
  category: z.enum([
    "interview",
    "negotiation",
    "difficult-conversation",
    "pitch",
    "social",
    "presentation",
    "other",
  ]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  description: z.string().min(40).max(400),
  duration_minutes: z.number().int().min(3).max(15),
  difficulty: z.number().int().min(1).max(5),
  interviewer_name: z.string().min(3).max(50),
  interviewer_persona: z.string().min(200).max(3000),
  voice_gender: z.enum(["male", "female"]),
});

export type GeneratedScenario = z.infer<typeof GeneratedScenarioSchema>;
