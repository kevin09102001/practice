import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/actions";
import { WaitlistForm } from "./waitlist-form";

export const metadata = { title: "The Stage Door" };

type SearchParams = Promise<{ source?: string }>;

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { source } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si ya esta en waitlist, mostramos el estado "you're in"
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id, email, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const isFromCap = source === "cap";

  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 lg:px-12">
        <Logo />
        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="label-speaker text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
          >
            Studio
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </nav>
      </header>

      <section className="mx-auto max-w-2xl px-6 pt-12 pb-24 lg:px-12 lg:pt-20">
        <div className="script-in" style={{ animationDelay: "0s" }}>
          <div className="mb-6 flex items-center gap-5">
            <span className="h-px max-w-[60px] flex-1 bg-[var(--color-border-strong)]" />
            <p className="label-act">Act IV · The Stage Door</p>
            <span className="h-px flex-1 bg-[var(--color-border-strong)]" />
          </div>
        </div>

        {existing ? (
          /* USER YA ESTA EN WAITLIST */
          <>
            <h1
              className="script-in font-display text-[clamp(2.5rem,7vw,5rem)] mb-4 leading-[1.05]"
              style={{ animationDelay: "0.3s" }}
            >
              You&rsquo;re on the <em>list</em>
              <span className="text-[var(--color-accent)]">.</span>
            </h1>

            <p
              className="script-in stage-direction mb-10 text-[16px] leading-relaxed"
              style={{ animationDelay: "0.5s" }}
            >
              We&rsquo;ll email{" "}
              <span className="text-[var(--color-ink)]">{existing.email}</span>{" "}
              the moment unlimited access opens. No spam, no marketing — just
              the green light to come back.
            </p>

            <div className="script-in" style={{ animationDelay: "0.7s" }}>
              <p className="label-act mb-3">Until then</p>
              <ul className="space-y-2 text-[15px] text-[var(--color-ink-soft)] mb-10 leading-relaxed">
                <li>· Review your past feedback in the Studio</li>
                <li>· Re-read your generated scenarios</li>
              </ul>
              <Link
                href="/dashboard"
                className="inline-block px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] tracking-wider text-sm uppercase hover:bg-[var(--color-accent)] transition-colors"
              >
                Back to the Studio →
              </Link>
            </div>
          </>
        ) : (
          /* USER NO ESTA EN WAITLIST — mostrar form */
          <>
            <h1
              className="script-in font-display text-[clamp(2.5rem,7vw,5rem)] mb-4 leading-[1.05]"
              style={{ animationDelay: "0.3s" }}
            >
              {isFromCap ? (
                <>
                  Two scenes <em>done</em>
                  <span className="text-[var(--color-accent)]">.</span>
                </>
              ) : (
                <>
                  Save your <em>seat</em>
                  <span className="text-[var(--color-accent)]">.</span>
                </>
              )}
            </h1>

            <p
              className="script-in stage-direction mb-3 text-[16px] leading-relaxed"
              style={{ animationDelay: "0.5s" }}
            >
              {isFromCap
                ? "You've used your two free rehearsals."
                : "Practice is in private beta."}
            </p>

            <p
              className="script-in stage-direction mb-10 text-[16px] leading-relaxed"
              style={{ animationDelay: "0.55s" }}
            >
              Unlimited sessions for{" "}
              <span className="text-[var(--color-ink)]">$9/month</span> when we
              launch. Drop your email to be first in line.
            </p>

            <div className="script-in" style={{ animationDelay: "0.7s" }}>
              <WaitlistForm
                defaultEmail={user.email ?? ""}
                source={source ?? "manual"}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
