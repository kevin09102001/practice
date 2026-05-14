"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateScenario } from "@/lib/scenarios/generate";

// Convertir texto a slug URL-friendly (sin acentos, lowercase, dashes)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Genera un scenario dinámico con Claude y lo inserta en la DB.
 * El user lo describe en lenguaje natural; Claude diseña el partner.
 */
export async function createDynamicScenarioAction(description: string) {
  // Validar input
  if (!description || description.trim().length < 10) {
    return { error: "Please describe what you want to practice (at least 10 characters)." };
  }
  if (description.length > 800) {
    return { error: "Description too long — keep it under 800 characters." };
  }

  const supabase = await createClient();

  // Auth check
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { error: "Not authenticated" };

  // Generar scenario con Claude
  let generated;
  try {
    generated = await generateScenario(description.trim());
  } catch (e) {
    console.error("[createDynamicScenarioAction] Generation failed:", e);
    return { error: "Failed to design your scenario. Please try again." };
  }

  // Slug único (base + random suffix para evitar colisiones)
  const baseSlug = slugify(generated.title);
  const slug = `${baseSlug}-${randomSuffix()}`;

  // Insert en DB (RLS valida user_id = auth.uid() y is_template = false)
  const { data: inserted, error: insertError } = await supabase
    .from("scenarios")
    .insert({
      slug,
      title: generated.title,
      category: generated.category,
      level: generated.level,
      language: "en",
      description: generated.description,
      duration_minutes: generated.duration_minutes,
      difficulty: generated.difficulty,
      interviewer_name: generated.interviewer_name,
      interviewer_persona: generated.interviewer_persona,
      voice_gender: generated.voice_gender,
      is_active: true,
      is_template: false,
      user_id: user.id,
    })
    .select("slug")
    .single();

  if (insertError || !inserted) {
    console.error("[createDynamicScenarioAction] Insert failed:", insertError);
    return { error: "Failed to save scenario" };
  }

  revalidatePath("/scenarios");
  redirect(`/scenarios/${inserted.slug}`);
}
