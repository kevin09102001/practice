import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/actions";
import { cn } from "@/lib/utils";
import { CreateScenarioForm } from "./create-scenario-form";

export const metadata = { title: "The Stage" };

// Indicador visual de dificultad (5 puntos, llenos hasta el level)
function Difficulty({ level }: { level: number }) {
  return (
    <div className="flex gap-[3px]" aria-label={`Difficulty ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            n <= level
              ? "bg-[var(--color-accent)]"
              : "bg-[var(--color-border-strong)] opacity-30"
          )}
        />
      ))}
    </div>
  );
}

// Tipo local que solo declara los fields que usamos en la card
type ScenarioCard = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: number;
  duration_minutes: number;
  interviewer_name: string;
  description: string;
};

// Item individual de la lista (reusado para templates y custom)
function ScenarioListItem({
  scenario,
  idx,
}: {
  scenario: ScenarioCard;
  idx: number;
}) {
  return (
    <li>
      <Link
        href={`/scenarios/${scenario.slug}`}
        className="group block py-8 transition-colors hover:bg-[var(--color-paper)]/60"
      >
        <div className="grid grid-cols-[44px_1fr] gap-6 lg:grid-cols-[60px_1fr_180px] lg:gap-8">
          <div className="font-display text-3xl leading-none text-[var(--color-ink-faded)] pt-1">
            {String(idx + 1).padStart(2, "0")}
          </div>
          <div>
            <p className="label-act mb-2">{scenario.category}</p>
            <h3 className="font-display text-[1.85rem] lg:text-[2.4rem] leading-tight mb-2 group-hover:text-[var(--color-accent)] transition-colors">
              {scenario.title}
            </h3>
            <p className="text-sm italic text-[var(--color-ink-soft)] mb-3">
              with {scenario.interviewer_name}
            </p>
            <p className="max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
              {scenario.description}
            </p>
          </div>
          <div className="hidden lg:flex flex-col items-end justify-start gap-3 pt-2">
            <Difficulty level={scenario.difficulty} />
            <p className="label-act">{scenario.duration_minutes} min</p>
            <p className="label-speaker text-[var(--color-ink-soft)] group-hover:text-[var(--color-accent)] transition-colors">
              Begin →
            </p>
          </div>
          <div className="col-start-2 mt-4 flex items-center gap-4 lg:hidden">
            <Difficulty level={scenario.difficulty} />
            <span className="text-xs text-[var(--color-ink-faded)]">·</span>
            <p className="label-act">{scenario.duration_minutes} min</p>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default async function ScenariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Templates (los 5 fijos compartidos por todos los usuarios)
  const { data: templates } = await supabase
    .from("scenarios")
    .select("*")
    .eq("is_active", true)
    .eq("is_template", true)
    .order("difficulty", { ascending: true });

  // Scenarios custom del usuario (RLS filtra por user_id automaticamente)
  const { data: customScenarios } = await supabase
    .from("scenarios")
    .select("*")
    .eq("is_active", true)
    .eq("is_template", false)
    .order("created_at", { ascending: false });

  const hasCustom = customScenarios && customScenarios.length > 0;
  const templatesDelay = hasCustom ? "1.1s" : "0.9s";

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

      <section className="mx-auto max-w-4xl px-6 pt-12 pb-24 lg:px-12 lg:pt-20">
        {/* Hero */}
        <div className="script-in" style={{ animationDelay: "0s" }}>
          <div className="mb-6 flex items-center gap-5">
            <span className="h-px max-w-[60px] flex-1 bg-[var(--color-border-strong)]" />
            <p className="label-act">Act III · The Stage</p>
            <span className="h-px flex-1 bg-[var(--color-border-strong)]" />
          </div>
        </div>

        <h1
          className="script-in font-display text-[clamp(3rem,8vw,6rem)] mb-4"
          style={{ animationDelay: "0.3s" }}
        >
          Set the <em>scene</em>
          <span className="text-[var(--color-accent)]">.</span>
        </h1>

        <p
          className="script-in stage-direction mb-12 max-w-xl text-[15px]"
          style={{ animationDelay: "0.5s" }}
        >
          Describe any conversation worth rehearsing. We design your partner — name, persona, pushback patterns. Or step into a familiar role from our cast.
        </p>

        {/* THE FORM (dynamic scenario creator) */}
        <div className="script-in mb-20" style={{ animationDelay: "0.7s" }}>
          <CreateScenarioForm />
        </div>

        {/* CUSTOM SCENARIOS (solo si el user tiene) */}
        {hasCustom && (
          <div
            className="script-in mb-20"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="mb-6 flex items-center gap-5">
              <p className="label-act">Your Sketches</p>
              <span className="h-px flex-1 bg-[var(--color-border)]" />
            </div>
            <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {customScenarios.map((scenario, idx) => (
                <ScenarioListItem
                  key={scenario.id}
                  scenario={scenario}
                  idx={idx}
                />
              ))}
            </ul>
          </div>
        )}

        {/* TEMPLATES */}
        <div className="script-in" style={{ animationDelay: templatesDelay }}>
          <div className="mb-6 flex items-center gap-5">
            <p className="label-act">The Cast</p>
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
          {templates && templates.length > 0 ? (
            <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {templates.map((scenario, idx) => (
                <ScenarioListItem
                  key={scenario.id}
                  scenario={scenario}
                  idx={idx}
                />
              ))}
            </ul>
          ) : (
            <p className="stage-direction">
              [ No templates available. ]
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
