import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FeedbackDisplay } from "./feedback-display";
import type { Database } from "@/types/database";
import type { FeedbackRow } from "@/lib/feedback/schema";

// Shape compuesto del nested select sessions+scenarios
type SessionWithScenario =
  Database["public"]["Tables"]["sessions"]["Row"] & {
    scenario: Database["public"]["Tables"]["scenarios"]["Row"];
  };

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Notes from the rehearsal",
};

export default async function FeedbackPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Cargar sesión + scenario (RLS protege).
  // Cast al shape compuesto porque Supabase no infiere nested selects.
  const { data: sessionRaw } = await supabase
    .from("sessions")
    .select(`*, scenario:scenarios(*)`)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const session = sessionRaw as SessionWithScenario | null;
  if (!session || !session.scenario) notFound();

  // Si la sesión sigue activa, volver al room
  if (session.status === "active") redirect(`/session/${id}`);

  // Si fue abandonada, no hay nada que evaluar
  if (session.status !== "completed") redirect("/scenarios");

  // Buscar feedback existente (puede ser null si todavía no se generó).
  // Los campos JSONB en la DB son unknown — casteamos al shape validado por Zod.
  const { data: feedbackRaw } = await supabase
    .from("feedback")
    .select("*")
    .eq("session_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const feedback = feedbackRaw as FeedbackRow | null;

  return (
    <FeedbackDisplay
      sessionId={id}
      scenario={session.scenario}
      feedback={feedback}
    />
  );
}
