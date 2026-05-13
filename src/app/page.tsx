import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

// Landing page como una escena de obra de teatro impresa en papel.
// El formato ES el mensaje: rehearsal = ensayo de un script.
export default function LandingPage() {
  return (
    <main className="paper-grain relative min-h-dvh">
      {/* Header — minimal, como portada de libro */}
      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-8 lg:px-12 lg:py-10">
        <Logo />
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="label-speaker text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
          >
            Sign in
          </Link>
          <Link href="/signup">
            <Button>Begin</Button>
          </Link>
        </nav>
      </header>

      {/* La escena */}
      <article className="mx-auto max-w-3xl px-6 pb-32 pt-12 lg:px-12 lg:pt-20">
        {/* Etiqueta de Acto */}
        <div
          className="script-in mb-14 flex items-center gap-5"
          style={{ animationDelay: "0s" }}
        >
          <span className="h-px flex-1 bg-[var(--color-border-strong)]" />
          <p className="label-act">Act I · The Room</p>
          <span className="h-px flex-1 bg-[var(--color-border-strong)]" />
        </div>

        {/* Stage direction inicial */}
        <p
          className="script-in stage-direction text-[15px] mb-12 pl-6 border-l-2 border-[var(--color-border-strong)]"
          style={{ animationDelay: "0.5s" }}
        >
          The lights come up on an empty room.
          <br />A single chair. A microphone. You step in.
        </p>

        {/* Diálogo 1 */}
        <div
          className="script-in mb-7 grid grid-cols-[100px_1fr] gap-x-6 lg:grid-cols-[120px_1fr]"
          style={{ animationDelay: "1.2s" }}
        >
          <p className="label-speaker pt-[7px]">Voice 1.</p>
          <p className="text-[19px] leading-[1.55]">
            Tomorrow you walk into the meeting that decides everything.
          </p>
        </div>

        {/* Diálogo 2 */}
        <div
          className="script-in mb-14 grid grid-cols-[100px_1fr] gap-x-6 lg:grid-cols-[120px_1fr]"
          style={{ animationDelay: "1.9s" }}
        >
          <p className="label-speaker pt-[7px]">Voice 2.</p>
          <p className="text-[19px] leading-[1.55] text-[var(--color-ink-soft)] italic">
            I haven't said it out loud. Not once.
          </p>
        </div>

        {/* Beat */}
        <p
          className="script-in stage-direction text-center text-sm mb-16"
          style={{ animationDelay: "2.5s" }}
        >
          [ a beat ]
        </p>

        {/* El producto como resolución */}
        <h1
          className="script-in font-display text-[clamp(4.5rem,14vw,10rem)] mb-2"
          style={{ animationDelay: "3.0s" }}
        >
          Practice<span className="text-[var(--color-accent)]">.</span>
        </h1>

        <p
          className="script-in font-display italic text-[clamp(2.25rem,6vw,4rem)] text-[var(--color-ink-soft)] mb-14 cursor-blink"
          style={{ animationDelay: "3.4s" }}
        >
          Until it feels easy
        </p>

        {/* Subtexto */}
        <p
          className="script-in max-w-xl text-[17px] leading-[1.65] text-[var(--color-ink-soft)] mb-12"
          style={{ animationDelay: "3.9s" }}
        >
          A studio for the high-stakes conversations that decide your trajectory.
          Job interviews. Salary negotiations. Hard talks. Voice-first.{" "}
          <span className="text-[var(--color-ink)]">Real feedback. Real progress.</span>
        </p>

        {/* CTA */}
        <div
          className="script-in flex flex-wrap items-center gap-7"
          style={{ animationDelay: "4.3s" }}
        >
          <Link href="/signup">
            <Button size="lg">Begin rehearsal →</Button>
          </Link>
          <Link
            href="#method"
            className="label-speaker text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] underline-offset-[6px] hover:underline transition-colors"
          >
            See the method
          </Link>
        </div>

        {/* Notas al pie como en un programa de teatro */}
        <div
          className="script-in mt-32 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-8 border-t border-[var(--color-border)] pt-8"
          style={{ animationDelay: "4.7s" }}
        >
          <div>
            <p className="label-act mb-2">Cast</p>
            <p className="text-[15px] text-[var(--color-ink-soft)]">
              20+ AI interviewers. Senior PMs, recruiters, hiring managers across
              tech, sales, design.
            </p>
          </div>
          <div>
            <p className="label-act mb-2">Method</p>
            <p className="text-[15px] text-[var(--color-ink-soft)]">
              Voice in. Voice out. Latency under 800ms. Indistinguishable from a
              real person.
            </p>
          </div>
          <div>
            <p className="label-act mb-2">Notes</p>
            <p className="text-[15px] text-[var(--color-ink-soft)]">
              Every line scored. Every beat noted. Personalized feedback within
              seconds.
            </p>
          </div>
        </div>
      </article>

      {/* Footer como nota final de programa */}
      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-5xl px-6 py-8 lg:px-12 flex flex-wrap items-center justify-between gap-4">
          <p className="label-act">© Practice — A studio for rehearsal</p>
          <div className="flex items-center gap-5 label-act">
            <span>End scene</span>
            <span>·</span>
            <span>Encrypted end-to-end</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
