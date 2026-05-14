"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TranscriptMessage } from "@/lib/vapi";

// Crear sesión nueva — llamada desde scenario detail page
export async function startSessionAction(scenarioId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ─────────────────────────────────────────────────────────
  // CAP: 2 sesiones gratis por cuenta (no contamos abandonadas).
  // Si user ya las uso, va al waitlist en vez de crear sesion.
  // ─────────────────────────────────────────────────────────
  const { count: sessionsUsed } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .neq("status", "abandoned");

  const FREE_SESSIONS = 2;
  if (sessionsUsed !== null && sessionsUsed >= FREE_SESSIONS) {
    redirect("/waitlist?source=cap");
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      scenario_id: scenarioId,
      status: "active",
    })
    .select()
    .single();

  if (error || !session) {
    throw new Error(error?.message ?? "Failed to create session");
  }

  redirect(`/session/${session.id}`);
}

// Cerrar sesión completada con transcript y duración
export async function endSessionAction(
  sessionId: string,
  transcript: TranscriptMessage[],
  durationSeconds: number
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("sessions")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      transcript: transcript,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/session/${sessionId}`);
  return { success: true };
}

// Abandonar sesión (cierre prematuro, sin transcript completo)
export async function abandonSessionAction(sessionId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("sessions")
    .update({
      status: "abandoned",
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);
}
