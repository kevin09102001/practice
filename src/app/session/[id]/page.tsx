import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SessionRoom } from "./session-room";
import type { Database } from "@/types/database";

// Shape compuesto retornado por el nested select (sessions + scenarios joined)
type SessionWithScenario =
  Database["public"]["Tables"]["sessions"]["Row"] & {
    scenario: Database["public"]["Tables"]["scenarios"]["Row"];
  };

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Rehearsal in progress",
};

export default async function SessionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Sesión + scenario en un solo query.
  // El nested select retorna shape compuesto que el type inferencer de
  // Supabase no maneja — casteamos al tipo conocido.
  const { data } = await supabase
    .from("sessions")
    .select(`*, scenario:scenarios(*)`)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const session = data as SessionWithScenario | null;
  if (!session || !session.scenario) notFound();

  // Si la sesión ya terminó, mandar de vuelta (Phase 6 será a /feedback)
  if (session.status !== "active") {
    redirect("/scenarios");
  }

  return (
    <SessionRoom
      session={{ id: session.id }}
      scenario={session.scenario}
    />
  );
}
