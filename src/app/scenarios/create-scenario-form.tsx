"use client";

import { useState, useTransition } from "react";
import { createDynamicScenarioAction } from "./actions";

const EXAMPLES = [
  "Ask my boss for a remote work arrangement. He values face time and seniority.",
  "Tell my parents I'm leaving the family business to start my own venture.",
  "Pitch my SaaS to a VC who passed on us last year. They want traction proof.",
];

const MIN_CHARS = 10;
const MAX_CHARS = 800;

export function CreateScenarioForm() {
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < MIN_CHARS) {
      setError(`Add a bit more detail (at least ${MIN_CHARS} characters).`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createDynamicScenarioAction(description.trim());
      // Si exito, el server action redirige a /scenarios/[slug]
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  const isDisabled = isPending || description.trim().length < MIN_CHARS;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
          disabled={isPending}
          placeholder="Describe the conversation you need to rehearse..."
          rows={4}
          className="w-full p-5 bg-[var(--color-paper)] border border-[var(--color-border-strong)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faded)] placeholder:italic focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none font-sans text-[15px] leading-relaxed disabled:opacity-50"
        />
        <div className="absolute bottom-3 right-4 text-xs text-[var(--color-ink-faded)] pointer-events-none">
          {description.length} / {MAX_CHARS}
        </div>
      </div>

      {error && (
        <p className="text-sm italic text-[var(--color-accent)]">{error}</p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="label-speaker text-[var(--color-ink-faded)]">
          {isPending ? "Designing your partner..." : ""}
        </p>
        <button
          type="submit"
          disabled={isDisabled}
          className="px-8 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] tracking-wider text-sm uppercase hover:bg-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Designing..." : "Design my partner →"}
        </button>
      </div>

      <div className="pt-6 border-t border-[var(--color-border)]">
        <p className="label-act mb-3">Or try one</p>
        <div className="space-y-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              disabled={isPending}
              onClick={() => setDescription(example)}
              className="block text-left text-[14px] italic text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50"
            >
              &ldquo;{example}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
