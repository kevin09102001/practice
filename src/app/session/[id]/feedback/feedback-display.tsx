"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { generateFeedbackAction } from "./actions";
import type { FeedbackRow } from "@/lib/feedback/schema";

type Scenario = {
  id: string;
  slug: string;
  title: string;
  interviewer_name: string;
};

export function FeedbackDisplay({
  sessionId,
  scenario,
  feedback,
}: {
  sessionId: string;
  scenario: Scenario;
  feedback: FeedbackRow | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const triggered = useRef(false);

  // Si no hay feedback, disparar generación una sola vez
  useEffect(() => {
    if (feedback) return;
    if (triggered.current) return;
    triggered.current = true;

    generateFeedbackAction(sessionId).then((result) => {
      if ("error" in result) {
        setError(result.error);
      } else {
        // Re-fetch del Server Component → feedback prop pasa de null a row
        router.refresh();
      }
    });
  }, [feedback, sessionId, router]);

  if (error) return <ErrorState error={error} scenario={scenario} />;
  if (!feedback) return <GeneratingState />;
  return <ReadyState feedback={feedback} scenario={scenario} />;
}

// ──────────────────────────────────────────────────────────
// Generating state — mientras Claude lee el transcript
// ──────────────────────────────────────────────────────────

function GeneratingState() {
  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center px-6 py-8 lg:px-12">
        <Logo />
      </header>
      <section className="mx-auto max-w-2xl px-6 pt-32 text-center lg:px-12">
        <p className="label-act mb-4">Curtain</p>
        <h1 className="font-display mb-6 text-[clamp(2rem,5vw,3.5rem)] leading-[1.0]">
          Reading your performance<span className="text-[var(--color-accent)]">.</span>
        </h1>
        <p className="stage-direction mb-12 text-sm">
          [ The director is reviewing the transcript. This takes a few seconds. ]
        </p>
        <div className="flex justify-center gap-1.5">
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </section>
    </main>
  );
}

// ──────────────────────────────────────────────────────────
// Error state — algo falló (Claude API, validación, etc)
// ──────────────────────────────────────────────────────────

function ErrorState({
  error,
  scenario,
}: {
  error: string;
  scenario: Scenario;
}) {
  const router = useRouter();
  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center px-6 py-8 lg:px-12">
        <Logo />
      </header>
      <section className="mx-auto max-w-2xl px-6 pt-32 lg:px-12">
        <p className="label-act mb-4 text-[var(--color-accent)]">Notes unavailable</p>
        <h1 className="font-display mb-6 text-4xl">
          The director&apos;s notes did not arrive
          <span className="text-[var(--color-accent)]">.</span>
        </h1>
        <p className="stage-direction mb-8 border-l-2 border-[var(--color-accent)] pl-4 text-sm">
          {error}
        </p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => router.push(`/scenarios/${scenario.slug}`)}>
            Try again
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/scenarios")}
          >
            All scenes
          </Button>
        </div>
      </section>
    </main>
  );
}

// ──────────────────────────────────────────────────────────
// Ready state — el feedback completo renderizado
// ──────────────────────────────────────────────────────────

function ReadyState({
  feedback,
  scenario,
}: {
  feedback: FeedbackRow;
  scenario: Scenario;
}) {
  const router = useRouter();

  return (
    <main className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8 lg:px-12">
        <Logo />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/scenarios/${scenario.slug}`)}
        >
          Practice again →
        </Button>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-12 pb-32 lg:px-12 lg:pt-20">
        {/* Header */}
        <p className="script-in label-act mb-6" style={{ animationDelay: "0s" }}>
          Act V · The Notes
        </p>
        <h1
          className="script-in font-display mb-4 text-[clamp(2rem,5vw,4rem)] leading-[1.0]"
          style={{ animationDelay: "0.2s" }}
        >
          Notes on {scenario.title}
          <span className="text-[var(--color-accent)]">.</span>
        </h1>
        <p
          className="script-in stage-direction mb-16 text-base"
          style={{ animationDelay: "0.4s" }}
        >
          from{" "}
          <em className="not-italic font-medium text-[var(--color-ink)]">
            {scenario.interviewer_name}
          </em>
        </p>

        {/* Summary - pull quote del director */}
        <blockquote
          className="script-in mb-20 border-l-2 border-[var(--color-ink)]/30 pl-6"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="font-display text-[clamp(1.25rem,2.5vw,1.5rem)] italic leading-[1.45] text-[var(--color-ink)]/85">
            {feedback.summary}
          </p>
        </blockquote>

        {/* Overall score - huge */}
        <div
          className="script-in mb-12 text-center"
          style={{ animationDelay: "0.8s" }}
        >
          <p className="label-act mb-3">Overall</p>
          <p className="font-display text-[clamp(4rem,12vw,8rem)] leading-[1] tabular-nums">
            {feedback.overall_score.toFixed(1)}
            <span className="text-[var(--color-ink)]/40">/10</span>
          </p>
        </div>

        {/* 4 sub-scores grid */}
        <div
          className="script-in mb-24 grid grid-cols-2 gap-y-8 border-y border-[var(--color-ink)]/15 py-8 sm:grid-cols-4 sm:gap-0"
          style={{ animationDelay: "1.0s" }}
        >
          <ScoreCell label="Clarity" score={feedback.scores.clarity} />
          <ScoreCell label="Structure" score={feedback.scores.structure} />
          <ScoreCell label="Content" score={feedback.scores.content} />
          <ScoreCell label="Confidence" score={feedback.scores.confidence} />
        </div>

        {/* Strengths */}
        <div className="script-in mb-24" style={{ animationDelay: "1.2s" }}>
          <p className="label-act mb-10 text-center">— Strengths —</p>
          <div className="space-y-14">
            {feedback.strengths.map((s, i) => (
              <StrengthItem key={i} index={i + 1} item={s} />
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="script-in mb-20" style={{ animationDelay: "1.4s" }}>
          <p className="label-act mb-10 text-center">— Improvements —</p>
          <div className="space-y-14">
            {feedback.improvements.map((imp, i) => (
              <ImprovementItem key={i} index={i + 1} item={imp} />
            ))}
          </div>
        </div>

        {/* Bottom CTAs */}
        <div
          className="script-in flex flex-wrap gap-4 border-t border-[var(--color-ink)]/15 pt-10"
          style={{ animationDelay: "1.6s" }}
        >
          <Button
            onClick={() => router.push(`/scenarios/${scenario.slug}`)}
          >
            Practice this scene again →
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/scenarios")}
          >
            All scenes
          </Button>
        </div>
      </section>
    </main>
  );
}

// ──────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────

function ScoreCell({ label, score }: { label: string; score: number }) {
  return (
    <div className="text-center">
      <p className="label-act mb-3 text-[0.65rem]">{label}</p>
      <p className="font-display text-4xl tabular-nums">{score}</p>
    </div>
  );
}

function StrengthItem({
  index,
  item,
}: {
  index: number;
  item: { title: string; quote: string; explanation: string };
}) {
  return (
    <article className="grid grid-cols-[2.5rem_1fr] gap-x-6 sm:grid-cols-[3rem_1fr]">
      <p className="label-act tabular-nums pt-2">
        {String(index).padStart(2, "0")}
      </p>
      <div>
        <h3 className="font-display mb-3 text-[1.5rem] leading-[1.2]">
          {item.title}
        </h3>
        <blockquote className="mb-4 border-l-2 border-[var(--color-accent)] pl-4">
          <p className="text-[15px] italic leading-[1.55] text-[var(--color-ink)]/80">
            &ldquo;{item.quote}&rdquo;
          </p>
        </blockquote>
        <p className="text-[17px] leading-[1.6]">{item.explanation}</p>
      </div>
    </article>
  );
}

function ImprovementItem({
  index,
  item,
}: {
  index: number;
  item: { title: string; suggestion: string; example: string };
}) {
  return (
    <article className="grid grid-cols-[2.5rem_1fr] gap-x-6 sm:grid-cols-[3rem_1fr]">
      <p className="label-act tabular-nums pt-2">
        {String(index).padStart(2, "0")}
      </p>
      <div>
        <h3 className="font-display mb-3 text-[1.5rem] leading-[1.2]">
          {item.title}
        </h3>
        <p className="mb-4 text-[17px] leading-[1.6]">{item.suggestion}</p>
        <div className="border-l-2 border-[var(--color-ink)]/30 pl-4">
          <p className="label-act mb-1.5">Try:</p>
          <p className="text-[15px] italic leading-[1.55] text-[var(--color-ink)]/80">
            &ldquo;{item.example}&rdquo;
          </p>
        </div>
      </div>
    </article>
  );
}
