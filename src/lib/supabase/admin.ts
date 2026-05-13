import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE_ROLE — bypasea RLS.
 * 
 * Solo usar desde server actions o route handlers.
 * NUNCA importar desde un componente cliente — el import de "server-only"
 * causa que falle el build si alguien lo intenta.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL no configurada");
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurada");

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
