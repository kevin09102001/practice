"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const signUpSchema = z.object({
  fullName: z.string().min(1, "Required").max(80, "Too long").trim(),
  email: z.string().email("Not a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Not a valid email"),
  password: z.string().min(1, "Required"),
});

export type AuthState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  success?: string;
};

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    fullName: formData.get("fullName")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path[0]?.toString();
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    });
    return { fieldErrors };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { error: error.message };
  if (!data.session) return { success: "Check your email to confirm your account." };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  };
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const path = issue.path[0]?.toString();
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    });
    return { fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
