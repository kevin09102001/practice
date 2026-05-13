"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInAction, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-7">
      {state.error && (
        <p className="text-sm italic text-[var(--color-error)] border-l-2 border-[var(--color-error)] pl-4">— {state.error}</p>
      )}
      <Input name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" required error={state.fieldErrors?.email} />
      <Input name="password" type="password" label="Password" placeholder="••••••••" autoComplete="current-password" required error={state.fieldErrors?.password} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Returning…" : "Continue →"}
      </Button>
      <p className="label-act text-center pt-2 text-[var(--color-ink-soft)]">
        New here?{" "}
        <Link href="/signup" className="text-[var(--color-ink)] underline underline-offset-[4px] hover:text-[var(--color-accent)]">Begin</Link>
      </p>
    </form>
  );
}
