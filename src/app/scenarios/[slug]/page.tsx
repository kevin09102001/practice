import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/actions";
import { startSessionAction } from "@/app/session/actions";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: scenario } = await supabase
    .from("scenarios")
    .select("title")
    .eq("slug", slug)
    .single();
  return { title: scenario?.title ?? "Scene" };
}

export default async function ScenarioDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!scenario) notFound();

  // Bind del scenario ID — esto convierte la acción en un form action válido
  const startSession = startSessionAction.bind(null, scenario.id);

  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 lg:px-12">
        <Logo />
        <div className="flex items-center gap-6">
          <Link
            href="/scenarios"
            className="label-act transition-colors hover:text-[var(--color-accent)]"
          >
            ← All scenes
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="label-act transition-colors hover:text-[var(--color-accent)]"
            >
              Exit
            </button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-12 pb-24 lg:px-12 lg:pt-20">
        <p className="script-in label-act mb-6" style={{ animationDelay: "0s" }}>
          Act III · Scene
        </p>

        <h1
          className="script-in font-display mb-6 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0]"
          style={{ animationDelay: "0.3s" }}
        >
          {scenario.title}<span className="text-[var(--color-accent)]">.</span>
        </h1>

        <p
          className="script-in stage-direction mb-12 text-base"
          style={{ animationDelay: "0.5s" }}
        >
          with <em className="not-italic font-medium text-[var(--color-ink)]">{scenario.interviewer_name}</em>
        </p>

        <blockquote
          className="script-in mb-12 border-l-2 border-[var(--color-ink)]/30 pl-6"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="font-display text-[1.35rem] italic leading-[1.5] text-[var(--color-ink)]/80">
            {scenario.description}
          </p>
        </blockquote>

        <div
          className="script-in mb-12 grid grid-cols-3 gap-6 border-y border-[var(--color-ink)]/15 py-6"
          style={{ animationDelay: "0.9s" }}
        >
          <div>
            <p className="label-act mb-2">Duration</p>
            <p className="font-mono text-sm">~{scenario.duration_minutes} min</p>
          </div>
          <div>
            <p className="label-act mb-2">Difficulty</p>
            <Dots level={scenario.difficulty} />
          </div>
          <div>
            <p className="label-act mb-2">Language</p>
            <p className="font-mono text-sm uppercase">{scenario.language}</p>
          </div>
        </div>

        <div className="script-in" style={{ animationDelay: "1.1s" }}>
          <form action={startSession}>
            <Button type="submit" size="lg">
              Begin scene →
            </Button>
          </form>
          <p className="stage-direction mt-5 text-sm">
            [ The lights are on. Your microphone is your only line. ]
          </p>
        </div>
      </section>
    </main>
  );
}

function Dots({ level }: { level: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= level
              ? "h-2 w-2 rounded-full bg-[var(--color-ink)]"
              : "h-2 w-2 rounded-full bg-[var(--color-ink)]/20"
          }
        />
      ))}
    </div>
  );
}
