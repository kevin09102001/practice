import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "The Studio",
};

// Tipo normalizado de las sesiones que renderiza el dashboard
type DashboardSession = {
  id: string;
  created_at: string;
  duration_seconds: number | null;
  scenario: {
    id: string;
    slug: string;
    title: string;
    interviewer_name: string;
  };
  feedback: { id: string; overall_score: number } | null;
};

// Helper: tiempo relativo (5m ago, 2h ago, etc)
function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Profile para el nombre
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle();
  const firstName = profile?.first_name || user.email?.split("@")[0] || "friend";

  // Sesiones completadas con feedback (LEFT JOIN)
  const { data: rawSessions } = await supabase
    .from("sessions")
    .select(`
      id,
      created_at,
      duration_seconds,
      scenario:scenarios(id, slug, title, interviewer_name),
      feedback(id, overall_score)
    `)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(20);

  // Normalizar: Supabase devuelve feedback como array, lo aplanamos
  // (la tabla tiene UNIQUE(session_id) así que solo hay 0 o 1)
  const sessions: DashboardSession[] = (rawSessions ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => ({
      id: s.id,
      created_at: s.created_at,
      duration_seconds: s.duration_seconds,
      scenario: s.scenario,
      feedback: s.feedback?.[0] ?? null,
    })
  );

  // Solo sesiones que ya tienen feedback generado
  const sessionsWithFeedback = sessions.filter((s) => s.feedback !== null);

  // Stats agregados
  const totalSessions = sessionsWithFeedback.length;
  const scores = sessionsWithFeedback.map((s) => s.feedback!.overall_score);
  const avgScore = totalSessions > 0
    ? scores.reduce((a, b) => a + b, 0) / totalSessions
    : 0;
  const latestScore = scores[0] ?? 0;
  const bestScore = totalSessions > 0 ? Math.max(...scores) : 0;

  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 lg:px-12">
        <Logo />
        <div className="flex items-center gap-6">
          <Link
            href="/scenarios"
            className="label-act transition-colors hover:text-[var(--color-accent)]"
          >
            All scenes
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

      <section className="mx-auto max-w-3xl px-6 pt-12 pb-32 lg:px-12 lg:pt-20">
        <p className="script-in label-act mb-6" style={{ animationDelay: "0s" }}>
          Act II · The Studio
        </p>
        <h1
          className="script-in font-display mb-12 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.0]"
          style={{ animationDelay: "0.2s" }}
        >
          Welcome back, {firstName}
          <span className="text-[var(--color-accent)]">.</span>
        </h1>

        {totalSessions === 0 && (
          <div className="script-in" style={{ animationDelay: "0.4s" }}>
            <div className="mb-12 space-y-3 border-l-2 border-[var(--color-ink)]/25 pl-6">
              <p className="stage-direction text-sm">
                [ The studio is yours, but the stage is still empty. ]
              </p>
              <p className="stage-direction text-sm">
                [ Begin with Tell Me About Yourself — Marcus is warm and the scene is gentle. ]
              </p>
            </div>
            <Link
              href="/scenarios"
              className="inline-block bg-[var(--color-ink)] px-6 py-3 text-sm uppercase tracking-wider text-[var(--color-bg)] transition-colors hover:bg-[var(--color-accent)]"
            >
              Choose your first scene →
            </Link>
          </div>
        )}

        {totalSessions > 0 && (
          <>
            {/* Latest score como héroe — el número que más le importa al usuario */}
            <div
              className="script-in mb-12 text-center"
              style={{ animationDelay: "0.4s" }}
            >
              <p className="label-act mb-3">Latest score</p>
              <p className="font-display text-[clamp(4rem,12vw,7rem)] leading-[1] tabular-nums">
                {latestScore.toFixed(1)}
                <span className="text-[var(--color-ink)]/40">/10</span>
              </p>
            </div>

            {/* 3 stats secundarios bajo la línea */}
            <div
              className="script-in mb-16 grid grid-cols-3 gap-4 border-y border-[var(--color-ink)]/15 py-6"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="text-center">
                <p className="label-act mb-2 text-[0.65rem]">Sessions</p>
                <p className="font-display text-3xl tabular-nums">
                  {totalSessions}
                </p>
              </div>
              <div className="text-center">
                <p className="label-act mb-2 text-[0.65rem]">Average</p>
                <p className="font-display text-3xl tabular-nums">
                  {avgScore.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="label-act mb-2 text-[0.65rem]">Best</p>
                <p className="font-display text-3xl tabular-nums">
                  {bestScore.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Chart de trayectoria — solo aparece con 2+ sesiones */}
            {totalSessions >= 2 && (
              <div className="script-in mb-20" style={{ animationDelay: "0.8s" }}>
                <p className="label-act mb-6 text-center">— Your trajectory —</p>
                <ScoreChart scores={scores.slice().reverse()} />
                <p className="stage-direction mt-4 text-center text-xs">
                  [ Older sessions on the left, newest on the right. Dashed lines at 5 and 7. ]
                </p>
              </div>
            )}

            {/* Lista de sesiones pasadas en formato script numerado */}
            <div className="script-in mb-16" style={{ animationDelay: "1.0s" }}>
              <p className="label-act mb-8 text-center">— Recent rehearsals —</p>
              <ol className="space-y-8">
                {sessionsWithFeedback.map((session, i) => (
                  <li key={session.id}>
                    <Link
                      href={`/session/${session.id}/feedback`}
                      className="group grid grid-cols-[2.5rem_1fr_3.5rem] items-baseline gap-x-4 sm:grid-cols-[3rem_1fr_4rem_5rem] sm:gap-x-6"
                    >
                      <span className="label-act tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-display text-xl leading-[1.2] transition-colors group-hover:text-[var(--color-accent)]">
                          {session.scenario.title}
                        </p>
                        <p className="stage-direction mt-1 text-xs">
                          with {session.scenario.interviewer_name}
                        </p>
                      </div>
                      <p className="font-display text-2xl tabular-nums text-right sm:text-left">
                        {session.feedback!.overall_score.toFixed(1)}
                      </p>
                      <p className="stage-direction hidden text-right text-xs sm:block">
                        {timeAgo(session.created_at)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            {/* CTA final */}
            <div
              className="script-in border-t border-[var(--color-ink)]/15 pt-10 text-center"
              style={{ animationDelay: "1.2s" }}
            >
              <Link
                href="/scenarios"
                className="inline-block bg-[var(--color-ink)] px-6 py-3 text-sm uppercase tracking-wider text-[var(--color-bg)] transition-colors hover:bg-[var(--color-accent)]"
              >
                Begin another rehearsal →
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

/**
 * Chart SVG minimalista de scores en el tiempo.
 *
 * Editorial: thin lines, oxblood accent, líneas de referencia punteadas
 * a 5 (midpoint) y 7 (target competente). Sin axes, sin labels — la
 * historia la cuenta la curva.
 */
function ScoreChart({ scores }: { scores: number[] }) {
  const width = 800;
  const height = 200;
  const padding = 24;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Mapeo score (1-10) → y (invertido: 10=arriba, 1=abajo)
  const yScale = (score: number) =>
    padding + innerHeight - ((score - 1) / 9) * innerHeight;
  const xStep = scores.length > 1 ? innerWidth / (scores.length - 1) : 0;

  const points = scores.map((score, i) => ({
    x: padding + i * xStep,
    y: yScale(score),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Referencias horizontales en 5 y 7 */}
      <line
        x1={padding}
        y1={yScale(5)}
        x2={width - padding}
        y2={yScale(5)}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="3 5"
        opacity="0.25"
      />
      <line
        x1={padding}
        y1={yScale(7)}
        x2={width - padding}
        y2={yScale(7)}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="3 5"
        opacity="0.25"
      />

      {/* La curva */}
      <path
        d={pathD}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
      />

      {/* Puntos de cada sesión */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="var(--color-accent)"
        />
      ))}
    </svg>
  );
}
