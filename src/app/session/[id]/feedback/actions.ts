"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnthropicClient, FEEDBACK_MODEL } from "@/lib/anthropic";
import { FeedbackSchema, type Feedback } from "@/lib/feedback/schema";
import { buildSystemPrompt, submitFeedbackTool } from "@/lib/feedback/prompt";
import type { Database } from "@/types/database";

// Shape compuesto: session con scenario embebido (del nested select).
// El type inferencer de Supabase no maneja bien nested selects,
// así que declaramos el tipo explícito.
type SessionWithScenario =
  Database["public"]["Tables"]["sessions"]["Row"] & {
    scenario: Database["public"]["Tables"]["scenarios"]["Row"];
  };

type ActionResult =
  | { success: true; feedbackId: string }
  | { error: string };

/**
 * Generate feedback estructurado para una sesión completada.
 *
 * Flujo:
 * 1. Auth + cargar session (RLS protege)
 * 2. Idempotencia: si ya hay feedback, devolver ese
 * 3. Llamar a Claude Haiku con tool forzado
 * 4. Validar respuesta con Zod
 * 5. INSERT con service_role (RLS no permite que el cliente inserte)
 */
export async function generateFeedbackAction(sessionId: string): Promise<ActionResult> {
  // 1. Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // 2. Cargar sesión + scenario via RLS
  const { data: rawSession, error: sessionError } = await supabase
    .from("sessions")
    .select(`*, scenario:scenarios(*)`)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !rawSession) return { error: "Session not found" };

  // Cast al shape compuesto conocido
  const session = rawSession as unknown as SessionWithScenario;
  if (!session.scenario) return { error: "Scenario data missing" };
  if (session.status !== "completed") {
    return { error: "Session not yet completed — cannot generate feedback" };
  }

  // 3. Idempotencia: ¿ya hay feedback?
  const { data: existing } = await supabase
    .from("feedback")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return { success: true, feedbackId: existing.id };
  }

  // 4. Verificar transcript
  const transcript = session.transcript as Array<{ role: string; content: string }>;
  if (!Array.isArray(transcript) || transcript.length < 2) {
    return { error: "Transcript is empty or too short to evaluate" };
  }

  // 5. Mergear utterances consecutivas del mismo role.
  // AssemblyAI fragmenta speech en muchos mensajes cortos ("Hi.", "Thanks.", "So...");
  // sin merge, Claude ve fragmentos sueltos en vez de turnos de conversación.
  const merged: Array<{ role: string; content: string }> = [];
  for (const msg of transcript) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role) {
      last.content += " " + msg.content;
    } else {
      merged.push({ role: msg.role, content: msg.content });
    }
  }

  // Formatear como script: SPEAKER: contenido
  const interviewerLabel = session.scenario.interviewer_name.toUpperCase();
  const transcriptText = merged
    .map((msg) => {
      const speaker = msg.role === "user" ? "USER" : interviewerLabel;
      return `${speaker}: ${msg.content}`;
    })
    .join("\n\n");

  // 6. Call Claude con tool forzado
  const startTime = Date.now();

  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: FEEDBACK_MODEL,
      max_tokens: 2048,
      system: buildSystemPrompt(session.scenario),
      tools: [submitFeedbackTool],
      tool_choice: { type: "tool", name: "submit_feedback" },
      messages: [
        {
          role: "user",
          content: `Here is the transcript of the rehearsal. Please evaluate the USER's performance.

---

${transcriptText}

---

Submit your feedback via the submit_feedback tool.`,
        },
      ],
    });

    // 7. Extraer tool_use block
    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      console.error("No tool_use in response:", response.content);
      return { error: "Claude did not invoke the feedback tool" };
    }

    // 8. Validar shape con Zod
    const parsed = FeedbackSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      const issues = parsed.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`
      ).join(" | ");
      console.error("Zod validation failed:", issues);
      console.error("Raw Claude response:", JSON.stringify(toolUse.input, null, 2));
      return { error: `Schema mismatch: ${issues}` };
    }
    const feedback: Feedback = parsed.data;

    const generationMs = Date.now() - startTime;

    // 9. INSERT con service_role (bypasea RLS)
    const admin = createAdminClient();
    const { data: inserted, error: insertError } = await admin
      .from("feedback")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        scores: feedback.scores,
        overall_score: feedback.overall_score,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        summary: feedback.summary,
        model_used: FEEDBACK_MODEL,
        generation_ms: generationMs,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("Feedback insert failed:", insertError);
      return { error: "Could not save feedback to database" };
    }

    // 10. Invalidar cache de la página
    revalidatePath(`/session/${sessionId}/feedback`);

    return { success: true, feedbackId: inserted.id };
  } catch (e) {
    console.error("Feedback generation error:", e);
    const message =
      e instanceof Error ? e.message : "Unknown error generating feedback";
    return { error: message };
  }
}
