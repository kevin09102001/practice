import { z } from "zod";

// Validador de score individual (1-10 enteros)
const scoreField = z.number().int().min(1).max(10);

/**
 * Schema del feedback completo.
 * 
 * Debe matchear EXACTAMENTE el input_schema del tool que le pasamos a Claude.
 * Las constraints de min/max sirven para cachar respuestas raras del modelo.
 */
export const FeedbackSchema = z.object({
  scores: z.object({
    clarity: scoreField,
    structure: scoreField,
    content: scoreField,
    confidence: scoreField,
  }),
  // Promedio de los 4 — Claude lo calcula, nosotros lo validamos
  overall_score: z.number().min(1).max(10),

  strengths: z
    .array(
      z.object({
        title: z.string().min(3).max(80),
        // Cita textual del transcript del usuario
        quote: z.string().min(1).max(300),
        explanation: z.string().min(20).max(400),
      })
    )
    .length(3),

  improvements: z
    .array(
      z.object({
        title: z.string().min(3).max(80),
        // Acción concreta a tomar
        suggestion: z.string().min(20).max(400),
        // Ejemplo de cómo decirlo mejor
        example: z.string().min(10).max(400),
      })
    )
    .length(3),

  // Bottom line en 2-3 oraciones
  summary: z.string().min(40).max(600),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

// Tipo de las filas de la tabla feedback en la DB
export type FeedbackRow = {
  id: string;
  session_id: string;
  user_id: string;
  scores: Feedback["scores"];
  overall_score: number;
  strengths: Feedback["strengths"];
  improvements: Feedback["improvements"];
  summary: string;
  model_used: string;
  generation_ms: number | null;
  created_at: string;
};
