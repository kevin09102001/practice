"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpAction, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  if (state.success) {
    return (
      <div className="space-y-6 py-2 border-l-2 border-[var(--color-success)] pl-5">
        <p className="stage-direction text-[15px] text-[var(--color-ink)]">— {state.success}</p>
        <Link href="/login" className="label-speaker text-[var(--color-ink)] underline underline-offset-4 hover:text-[var(--color-accent)]">
          Continue to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-7">
      {state.error && (
        <p className="text-sm italic text-[var(--color-error)] border-l-2 border-[var(--color-error)] pl-4">— {state.error}</p>
      )}
      <Input name="fullName" label="Name" placeholder="As it appears on the program" autoComplete="name" required error={state.fieldErrors?.fullName} />
      <Input name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" required error={state.fieldErrors?.email} />
      <Input name="password" type="password" label="Password" placeholder="At least 8 characters" autoComplete="new-password" required error={state.fieldErrors?.password} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Curtain rising…" : "Begin rehearsal →"}
      </Button>
      <p className="label-act text-center pt-2 text-[var(--color-ink-soft)]">
        Already in the cast?{" "}
        <Link href="/login" className="text-[var(--color-ink)] underline underline-offset-[4px] hover:text-[var(--color-accent)]">Sign in</Link>
      </p>
    </form>
  );
}
