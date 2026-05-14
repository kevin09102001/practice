"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Guarda al user en la waitlist.
 * Upsert por user_id: si ya existe, actualiza email/reason/source.
 */
export async function joinWaitlistAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const email = formData.get("email")?.toString().trim() ?? "";
  const reason = formData.get("reason")?.toString().trim() || null;
  const source = formData.get("source")?.toString().trim() || "manual";

  // Validacion basica de email
  if (!email || !email.includes("@") || email.length > 200) {
    return { error: "Valid email required" };
  }
  if (reason && reason.length > 500) {
    return { error: "Reason too long" };
  }

  // Upsert por user_id (constraint UNIQUE en la tabla)
  const { error } = await supabase.from("waitlist").upsert(
    {
      user_id: user.id,
      email,
      reason,
      source,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[joinWaitlistAction]", error);
    return { error: "Could not save your spot. Try again." };
  }

  revalidatePath("/waitlist");
  return { success: true as const };
}
