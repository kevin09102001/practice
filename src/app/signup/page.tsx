import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Begin",
  description: "Begin your rehearsal.",
};

export default function SignUpPage() {
  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 lg:px-12">
        <Logo />
        <Link
          href="/login"
          className="label-speaker text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-md px-6 pt-12 pb-32 lg:pt-20">
        <div className="script-in" style={{ animationDelay: "0s" }}>
          <p className="label-act mb-6">Act II · Casting</p>
        </div>

        <h1
          className="script-in font-display text-[clamp(3rem,8vw,5.5rem)] mb-3"
          style={{ animationDelay: "0.3s" }}
        >
          Begin<span className="text-[var(--color-accent)]">.</span>
        </h1>

        <p
          className="script-in stage-direction text-[15px] mb-12 max-w-sm"
          style={{ animationDelay: "0.5s" }}
        >
          Take a seat. Two minutes and you will be rehearsing.
        </p>

        <div className="script-in" style={{ animationDelay: "0.7s" }}>
          <SignUpForm />
        </div>
      </section>
    </main>
  );
}
