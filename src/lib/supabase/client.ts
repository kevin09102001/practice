import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Cliente para Client Components ('use client')
// Se usa en formularios, botones, hooks, etc.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
